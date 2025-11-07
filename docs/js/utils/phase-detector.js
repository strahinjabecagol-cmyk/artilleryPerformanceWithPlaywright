// Phase Detection Utility - Dynamically detects test phases from various sources
import { BASE_PATH } from './path-config.js';

/**
 * Detects phases from available data sources with fallback strategy
 * Priority: 1) execution.log, 2) heuristic analysis from data, 3) single-phase fallback
 * @param {Object} data - The loaded Artillery results data
 * @param {string} resultFile - The result file being loaded (e.g., 'results_2025-11-07_14-00-35.json')
 * @returns {Promise<Array>} Array of detected phases with metadata
 */
export async function detectPhases(data, resultFile = null) {
    // console.log(`[PHASE-DETECTOR] ==========================================`);
    // console.log(`[PHASE-DETECTOR] detectPhases() called with resultFile: "${resultFile}"`);
    // console.log(`[PHASE-DETECTOR] ==========================================`);
    
    try {
        // Strategy 1: Try parsing from execution.log (most accurate)
        const logPhases = await parsePhaseFromLog(resultFile);
        if (logPhases && logPhases.length > 0) {
            console.log(`✅ Phases detected from execution.log: ${logPhases.length}`);
            // console.log(`[PHASE-DETECTOR] Phase names:`, logPhases.map(p => p.name));
            return enrichPhasesWithTimestamps(logPhases, data.aggregate.firstMetricAt);
        }
    } catch (error) {
        console.warn('⚠️ Could not parse phases from log file:', error.message);
    }

    try {
        // Strategy 2: Heuristic detection from data patterns
        const detectedPhases = detectPhasesFromIntermediate(data);
        if (detectedPhases && detectedPhases.length > 0) {
            console.log('✅ Phases detected from data patterns:', detectedPhases.length);
            return detectedPhases;
        }
    } catch (error) {
        console.warn('⚠️ Could not detect phases from data:', error.message);
    }

    // Strategy 3: Fallback - treat entire test as one phase
    console.log('ℹ️ Using fallback: treating entire test as single phase');
    return [{
        name: 'Entire Test',
        index: 0,
        startTime: data.aggregate.firstMetricAt,
        endTime: data.aggregate.lastMetricAt,
        durationMs: data.aggregate.lastMetricAt - data.aggregate.firstMetricAt,
        durationSec: Math.round((data.aggregate.lastMetricAt - data.aggregate.firstMetricAt) / 1000)
    }];
}

/**
 * Parse phase information from execution.log file
 * Example line: "Phase started: Ramp-up for local test (index: 0, duration: 60s) 14:21:20(+0000)"
 * @param {string} resultFile - The result file to find the corresponding log for
 * @returns {Promise<Array>} Array of phases parsed from log
 */
async function parsePhaseFromLog(resultFile = null) {
    try {
        const timestamp = new Date().getTime();
        let logFileName = 'execution.log'; // Default fallback
        
        // console.log(`[PHASE-DETECTOR] parsePhaseFromLog called with resultFile: "${resultFile}"`);
        
        // If a specific result file is provided, look up its corresponding log file
        if (resultFile && resultFile !== 'results.json') {
            try {
                // console.log(`[PHASE-DETECTOR] 🔍 Looking up log file for result: ${resultFile}`);
                const logsMapResponse = await fetch(`${BASE_PATH}/logs/logsMap.json?v=${timestamp}`);
                // console.log(`[PHASE-DETECTOR] 📡 logsMap.json fetch status: ${logsMapResponse.status}`);
                
                if (logsMapResponse.ok) {
                    const logsMap = await logsMapResponse.json();
                    // console.log(`[PHASE-DETECTOR] 📋 logsMap loaded, files:`, logsMap.files);
                    const logEntry = logsMap.files.find(entry => entry.resultFile === resultFile);
                    
                    if (logEntry) {
                        logFileName = logEntry.filename;
                        // console.log(`[PHASE-DETECTOR] ✅ Using log file: ${logFileName} for result: ${resultFile}`);
                    } else {
                        console.warn(`⚠️ No log entry found for ${resultFile} in logsMap`);
                    }
                } else {
                    console.warn(`⚠️ logsMap.json fetch failed with status ${logsMapResponse.status}`);
                }
            } catch (error) {
                console.warn('⚠️ Could not load logsMap.json, using default execution.log', error);
            }
        }
        
        // console.log(`[PHASE-DETECTOR] 📂 Fetching log file: ${logFileName}`);
        const logResponse = await fetch(`${BASE_PATH}/logs/${logFileName}?v=${timestamp}`);
        
        if (!logResponse.ok) {
            throw new Error(`Log file not found: ${logResponse.status}`);
        }

        const logText = await logResponse.text();
        
        // Parse phase start lines
        // Pattern: "Phase started: <NAME> (index: <INDEX>, duration: <DURATION>s) <TIME>"
        const phaseRegex = /Phase started: (.+?) \(index: (\d+), duration: (\d+)s\)/g;
        const phases = [];
        let match;

        while ((match = phaseRegex.exec(logText)) !== null) {
            phases.push({
                name: match[1].trim(),                // "Ramp-up for local test"
                index: parseInt(match[2]),            // 0, 1, 2...
                durationSec: parseInt(match[3]),      // 60
                durationMs: parseInt(match[3]) * 1000
            });
        }

        return phases.length > 0 ? phases : null;
    } catch (error) {
        console.warn('Failed to parse execution.log:', error.message);
        return null;
    }
}

/**
 * Detect phases from data patterns by analyzing vuser creation rate changes
 * @param {Object} data - Artillery results data
 * @returns {Array} Array of detected phases
 */
function detectPhasesFromIntermediate(data) {
    if (!data.intermediate || data.intermediate.length === 0) {
        return null;
    }

    const intermediate = data.intermediate;
    const firstMetricAt = data.aggregate.firstMetricAt;
    const lastMetricAt = data.aggregate.lastMetricAt;

    // Analyze vuser creation rate to detect phase changes
    const phaseChanges = [];
    let prevRate = 0;

    for (let i = 0; i < intermediate.length; i++) {
        const curr = intermediate[i];
        const currRate = curr.counters?.['vusers.created'] || 0;

        if (i > 0) {
            const rateDiff = Math.abs(currRate - prevRate);
            const threshold = Math.max(prevRate * 0.5, 2); // 50% change or at least 2 vusers

            // Detect significant rate change indicating phase transition
            if (rateDiff >= threshold) {
                phaseChanges.push({
                    timestamp: curr.period,
                    index: phaseChanges.length + 1,
                    prevRate,
                    currRate
                });
            }
        }

        prevRate = currRate;
    }

    // If we detected changes, create phases
    if (phaseChanges.length > 0) {
        const phases = [];
        let startTime = firstMetricAt;

        phaseChanges.forEach((change, idx) => {
            phases.push({
                name: `Phase ${idx + 1}`,
                index: idx,
                startTime: startTime,
                endTime: change.timestamp,
                durationMs: change.timestamp - startTime,
                durationSec: Math.round((change.timestamp - startTime) / 1000)
            });
            startTime = change.timestamp;
        });

        // Add final phase
        phases.push({
            name: `Phase ${phases.length + 1}`,
            index: phases.length,
            startTime: startTime,
            endTime: lastMetricAt,
            durationMs: lastMetricAt - startTime,
            durationSec: Math.round((lastMetricAt - startTime) / 1000)
        });

        return phases;
    }

    return null;
}

/**
 * Enrich log-parsed phases with calculated timestamps
 * @param {Array} logPhases - Phases parsed from log file
 * @param {number} firstMetricAt - Test start timestamp
 * @returns {Array} Phases with startTime and endTime added
 */
function enrichPhasesWithTimestamps(logPhases, firstMetricAt) {
    let currentTimestamp = firstMetricAt;

    return logPhases.map(phase => {
        const enriched = {
            ...phase,
            startTime: currentTimestamp,
            endTime: currentTimestamp + phase.durationMs
        };
        currentTimestamp = enriched.endTime;
        return enriched;
    });
}

/**
 * Map a specific period timestamp to its corresponding phase
 * @param {number} periodTimestamp - Timestamp of the period
 * @param {Array} phases - Array of phase objects
 * @returns {Object} The phase this period belongs to
 */
export function mapPeriodToPhase(periodTimestamp, phases) {
    for (const phase of phases) {
        if (periodTimestamp >= phase.startTime && periodTimestamp < phase.endTime) {
            return phase;
        }
    }
    // If not in any phase (edge case at end), return last phase
    return phases[phases.length - 1];
}

/**
 * Validate phases for consistency
 * @param {Array} phases - Phases to validate
 * @returns {boolean} True if phases are valid
 */
export function validatePhases(phases) {
    if (!phases || phases.length === 0) {
        console.warn('⚠️ No phases detected');
        return false;
    }

    // Check for overlapping phases
    for (let i = 0; i < phases.length - 1; i++) {
        if (phases[i].endTime > phases[i + 1].startTime) {
            console.error('❌ Overlapping phases detected!', phases[i], phases[i + 1]);
            return false;
        }
    }

    // Check for gaps (warn only, not error)
    for (let i = 0; i < phases.length - 1; i++) {
        const gap = phases[i + 1].startTime - phases[i].endTime;
        if (gap > 1000) { // More than 1 second gap
            console.warn(`⚠️ Gap detected between phases: ${gap}ms`);
        }
    }

    console.log(`✅ Phases validated: ${phases.length} phases detected`);
    return true;
}
