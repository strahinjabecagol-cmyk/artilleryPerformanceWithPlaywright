// Phase Filtering Utility - Filters data by selected phases and recalculates aggregates
import { mapPeriodToPhase } from './phase-detector.js';

/**
 * Calculate intelligent VUser metrics that respect overall test results
 * @param {Object} phaseCounters - Raw summed counters from filtered periods
 * @param {Object} overallCounters - Counters from original full test aggregate
 * @returns {Object} Adjusted counters with correct VUser attribution
 */
function calculateIntelligentVUserMetrics(phaseCounters, overallCounters) {
    const phaseCreated = phaseCounters['vusers.created'] || 0;
    const phaseCompleted = phaseCounters['vusers.completed'] || 0;
    const phaseFailed = phaseCounters['vusers.failed'] || 0;
    
    const overallCreated = overallCounters['vusers.created'] || 0;
    const overallCompleted = overallCounters['vusers.completed'] || 0;
    const overallFailed = overallCounters['vusers.failed'] || 0;
    
    // Calculate overall success rate
    const overallSuccessRate = overallCreated > 0 
        ? (overallCompleted / overallCreated) 
        : 1.0;
    
    // SCENARIO 1: Overall test is 100% success (no failures)
    if (overallFailed === 0 && overallSuccessRate >= 0.999) {
        console.log(`✅ Phase filtering: Overall test is 100% success. Applying to filtered phases.`);
        
        return {
            ...phaseCounters,
            'vusers.completed': phaseCreated,  // All created VUsers completed
            'vusers.failed': 0
        };
    }
    
    // SCENARIO 2: There are failures - use proportional distribution
    console.log(`⚠️ Phase filtering: Overall success rate is ${(overallSuccessRate * 100).toFixed(1)}%. Applying proportionally.`);
    
    const adjustedCompleted = Math.round(phaseCreated * overallSuccessRate);
    const adjustedFailed = phaseCreated - adjustedCompleted;
    
    return {
        ...phaseCounters,
        'vusers.completed': adjustedCompleted,
        'vusers.failed': adjustedFailed
    };
}

/**
 * Filter intermediate data by selected phase IDs
 * @param {Object} data - Full Artillery results data
 * @param {Array} selectedPhaseIds - Array of selected phase IDs (e.g., ['all'] or ['phase-0', 'phase-2'])
 * @param {Array} phases - Array of detected phases
 * @returns {Array} Filtered intermediate periods
 */
export function filterDataByPhases(data, selectedPhaseIds, phases) {
    // If "all" is selected, return everything
    if (selectedPhaseIds.includes('all')) {
        return data.intermediate;
    }

    // If no phases selected, return empty array
    if (!selectedPhaseIds || selectedPhaseIds.length === 0) {
        return [];
    }

    // Filter intermediate periods by selected phases
    return data.intermediate.filter(period => {
        const phase = mapPeriodToPhase(period.period, phases);
        return selectedPhaseIds.includes(`phase-${phase.index}`);
    });
}

/**
 * Recalculate aggregate metrics from filtered intermediate data
 * @param {Array} filteredIntermediate - Filtered intermediate periods
 * @param {Object} originalAggregate - Original full test aggregate for intelligent VUser calculation
 * @returns {Object} Recalculated aggregate metrics
 */
export function recalculateAggregates(filteredIntermediate, originalAggregate = null) {
    if (!filteredIntermediate || filteredIntermediate.length === 0) {
        return {
            counters: {},
            summaries: {},
            histograms: {}
        };
    }

    const aggregate = {
        counters: {},
        summaries: {},
        histograms: {},
        firstMetricAt: filteredIntermediate[0]?.period,
        lastMetricAt: filteredIntermediate[filteredIntermediate.length - 1]?.period
    };

    // Sum all counters across filtered periods
    // NOTE: vusers.created and vusers.completed are incremental per period
    filteredIntermediate.forEach(period => {
        Object.entries(period.counters || {}).forEach(([key, value]) => {
            aggregate.counters[key] = (aggregate.counters[key] || 0) + value;
        });
    });

    // Apply intelligent VUser calculation if we have original aggregate
    if (originalAggregate && originalAggregate.counters) {
        aggregate.counters = calculateIntelligentVUserMetrics(
            aggregate.counters,
            originalAggregate.counters
        );
    } else {
        // Fallback: Old validation logic for backwards compatibility
        const vusersCreated = aggregate.counters['vusers.created'] || 0;
        const vusersCompleted = aggregate.counters['vusers.completed'] || 0;
        const vusersFailed = aggregate.counters['vusers.failed'] || 0;
        
        // If completed exceeds created, cap it
        if (vusersCompleted > vusersCreated) {
            console.warn(`⚠️  Phase filtering: ${vusersCompleted} VUsers completed but only ${vusersCreated} created in selected phases`);
            console.warn('   This happens when VUsers span multiple phases. Capping completed at created.');
            aggregate.counters['vusers.completed'] = vusersCreated - vusersFailed;
        }
    }

    // Collect summary values for percentile recalculation
    const summaryCollector = {};

    filteredIntermediate.forEach(period => {
        Object.entries(period.summaries || {}).forEach(([key, summary]) => {
            if (!summaryCollector[key]) {
                summaryCollector[key] = {
                    min: Infinity,
                    max: -Infinity,
                    values: [],
                    count: 0
                };
            }

            const collector = summaryCollector[key];
            
            if (summary.min !== undefined && summary.min !== null) {
                collector.min = Math.min(collector.min, summary.min);
            }
            if (summary.max !== undefined && summary.max !== null) {
                collector.max = Math.max(collector.max, summary.max);
            }
            if (summary.mean !== undefined && summary.mean !== null) {
                collector.values.push(summary.mean);
                collector.count++;
            }
        });
    });

    // Calculate final statistics for each summary metric
    Object.keys(summaryCollector).forEach(key => {
        const collector = summaryCollector[key];
        
        aggregate.summaries[key] = {
            min: collector.min === Infinity ? 0 : collector.min,
            max: collector.max === -Infinity ? 0 : collector.max,
            mean: collector.values.length > 0 
                ? collector.values.reduce((a, b) => a + b, 0) / collector.values.length 
                : 0,
            count: collector.count
        };

        // Calculate percentiles from collected values
        if (collector.values.length > 0) {
            const sorted = [...collector.values].sort((a, b) => a - b);
            aggregate.summaries[key].median = percentile(sorted, 0.5);
            aggregate.summaries[key].p50 = percentile(sorted, 0.5);
            aggregate.summaries[key].p75 = percentile(sorted, 0.75);
            aggregate.summaries[key].p95 = percentile(sorted, 0.95);
            aggregate.summaries[key].p99 = percentile(sorted, 0.99);
            aggregate.summaries[key].p999 = percentile(sorted, 0.999);
        }
    });

    // Merge histograms (if present)
    const histogramCollector = {};
    
    filteredIntermediate.forEach(period => {
        Object.entries(period.histograms || {}).forEach(([key, histogram]) => {
            if (!histogramCollector[key]) {
                histogramCollector[key] = {};
            }
            
            // Merge histogram buckets
            Object.entries(histogram).forEach(([bucket, count]) => {
                histogramCollector[key][bucket] = (histogramCollector[key][bucket] || 0) + count;
            });
        });
    });

    aggregate.histograms = histogramCollector;

    return aggregate;
}

/**
 * Calculate percentile from sorted array
 * @param {Array} sortedArray - Pre-sorted array of values
 * @param {number} p - Percentile (0-1, e.g., 0.95 for p95)
 * @returns {number} Percentile value
 */
function percentile(sortedArray, p) {
    if (sortedArray.length === 0) return 0;
    
    const index = Math.ceil(sortedArray.length * p) - 1;
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
}

/**
 * Enrich intermediate data with phase information
 * @param {Object} data - Artillery results data
 * @param {Array} phases - Detected phases
 * @returns {Object} Data with phase info added to each period
 */
export function enrichDataWithPhases(data, phases) {
    const enrichedIntermediate = data.intermediate.map(period => ({
        ...period,
        phase: mapPeriodToPhase(period.period, phases),
        phaseIndex: mapPeriodToPhase(period.period, phases).index,
        phaseName: mapPeriodToPhase(period.period, phases).name
    }));

    return {
        ...data,
        intermediate: enrichedIntermediate,
        phases
    };
}

/**
 * Get filtered periods with their labels
 * @param {Object} data - Full data
 * @param {Array} filteredIntermediate - Filtered periods
 * @returns {Array} Array of timestamp labels
 */
export function getFilteredPeriodLabels(filteredIntermediate) {
    return filteredIntermediate.map(item => {
        const timestamp = item.period ? new Date(parseInt(item.period)) : null;
        return timestamp
            ? timestamp.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            })
            : 'N/A';
    });
}

/**
 * Calculate phase summary statistics
 * @param {Array} phases - Detected phases
 * @param {Object} data - Full data
 * @returns {Object} Phase statistics
 */
export function calculatePhaseStatistics(phases, data) {
    const stats = {};

    phases.forEach(phase => {
        const phasePeriods = data.intermediate.filter(period => {
            return period.period >= phase.startTime && period.period < phase.endTime;
        });

        const phaseAggregate = recalculateAggregates(phasePeriods);

        stats[`phase-${phase.index}`] = {
            name: phase.name,
            duration: phase.durationSec,
            periods: phasePeriods.length,
            vusersCreated: phaseAggregate.counters['vusers.created'] || 0,
            vusersCompleted: phaseAggregate.counters['vusers.completed'] || 0,
            vusersAsFailed: phaseAggregate.counters['vusers.failed'] || 0,
            httpRequests: phaseAggregate.counters['browser.http_requests'] || 0,
            successRate: phaseAggregate.counters['vusers.created'] 
                ? ((phaseAggregate.counters['vusers.completed'] || 0) / phaseAggregate.counters['vusers.created'] * 100).toFixed(1)
                : 'N/A'
        };
    });

    return stats;
}
