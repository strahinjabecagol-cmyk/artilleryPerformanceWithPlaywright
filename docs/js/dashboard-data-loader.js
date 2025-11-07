// Handles dashboard data loading and rendering logic for the Artillery Performance Dashboard
import { createThroughputChart } from './charts/throughput-chart.js';
import { createFCPChart } from './charts/fcp-chart.js';
import { createVUsersActivityChart } from './charts/vusers-activity-chart.js';
import { createConcurrentUsersChart } from './charts/concurrent-users-chart.js';
import { createHTTPRequestsChart } from './charts/http-requests-chart.js';
import { createCombinedMetricsChart } from './charts/combined-metrics-chart.js';
import { createPercentilesChart } from './charts/percentiles-chart.js';
import { createSuccessFailureChart } from './charts/success-failure-chart.js';
import { createStatusCodesChart } from './charts/status-codes-chart.js';
import { createLatencyHistogramChart } from './charts/latency-histogram.js';
import { createErrorBreakdownChart } from './charts/error-breakdown.js';
import { createStepBreakdownChart } from './charts/step-breakdown.js';
import { createApdexCard } from './utils/apdex-calculator.js';
import { detectPhases, validatePhases } from './utils/phase-detector.js';
import { filterDataByPhases, recalculateAggregates, enrichDataWithPhases, getFilteredPeriodLabels } from './utils/phase-filter.js';
import { renderPhaseFilter, updatePhaseFilterVisibility } from './ui/phase-selector.js';
import { initStickyPhaseFilter } from './ui/sticky-phase-filter.js';
import { initChartMaximize, refreshMaximizeButtons } from './ui/chart-maximize.js';
import { registerPhaseMarkersPlugin } from './plugins/phase-markers.js';
import { showNoDataMessage } from './utils/event-handlers.js';

// Expose showNoDataMessage globally for compatibility
window.showNoDataMessage = showNoDataMessage;

// Global state
let fullData = null;
let detectedPhases = null;
let currentSelectedPhases = ['all'];
let originalStartTime = null;
let originalTestName = null;
let availableReports = [];
let currentReportFile = null;

// Chart instances storage
let chartInstances = {};

// Register phase markers plugin
registerPhaseMarkersPlugin();

export async function loadData(reportPath = null) {
    try {
        // Load the list of available reports from resultsMap.json (only on first load)
        if (availableReports.length === 0) {
            await loadAvailableReports();
        }
        
        // Determine which report to load
        const reportToLoad = reportPath || availableReports[0]?.filename || 'results.json';
        currentReportFile = reportToLoad;
        
        // Update dropdown selection to match the loaded report
        const dropdown = document.getElementById('reportDropdown');
        if (dropdown) {
            dropdown.value = currentReportFile;
        }
        
        // Load the selected report data
        const data = await loadDashboardData(reportToLoad);
        if (!data) {
            window.showNoDataMessage();
            return;
        }

        // Store full data globally
        fullData = data;

        // Store original metadata before any filtering
        originalStartTime = data.aggregate?.firstMetricAt || null;
        
        // Extract original test name
        const counters = data.aggregate?.counters || {};
        const counterKeys = Object.keys(counters);
        const testNameKey = counterKeys.find(k => k.startsWith('TEST_NAME.'));
        if (testNameKey) {
            const rawName = testNameKey.replace('TEST_NAME.', '');
            originalTestName = rawName.replace(/_/g, ' ');
        } else {
            originalTestName = 'Artillery Load Test';
        }

        // Detect phases dynamically
        detectedPhases = await detectPhases(data, currentReportFile);
        validatePhases(detectedPhases);

        // Enrich data with phase information
        fullData = enrichDataWithPhases(fullData, detectedPhases);

        // Render phase filter UI
        renderPhaseFilter(detectedPhases, onPhaseFilterChange);
        updatePhaseFilterVisibility(detectedPhases.length);

        // Initialize sticky phase filter behavior
        initStickyPhaseFilter();

        // Initial render with all phases
        renderDashboard(fullData, ['all']);

        // Initialize chart maximize feature
        setTimeout(() => {
            initChartMaximize();
        }, 200);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        window.showNoDataMessage();
    }
}

/**
 * Get the currently loaded report filename
 */
export function getCurrentReportFile() {
    return currentReportFile || 'results.json';
}

/**
 * Destroy all existing chart instances
 */
function destroyAllCharts() {
    Object.keys(chartInstances).forEach(key => {
        if (chartInstances[key]) {
            try {
                chartInstances[key].destroy();
            } catch (e) {
                console.warn(`Failed to destroy chart ${key}:`, e);
            }
        }
    });
    chartInstances = {};
}

/**
 * Get filtered phases based on selected phase IDs
 * @param {Array} selectedPhaseIds - Array of selected phase IDs
 * @param {Array} allPhases - Array of all detected phases
 * @returns {Array} Filtered array of phases (always show labels for selected phases)
 */
function getFilteredPhases(selectedPhaseIds, allPhases) {
    // If "all" is selected, return all phases
    if (selectedPhaseIds.includes('all')) {
        return allPhases;
    }
    
    // For any selected phases, return those phases (labels will always show)
    // The plugin will handle whether to show boundary lines based on phase count
    return allPhases.filter(phase => {
        const phaseId = `phase-${phase.index}`;
        return selectedPhaseIds.includes(phaseId);
    });
}

/**
 * Calculate test duration from phase configurations (not timestamps)
 * @param {Array} selectedPhaseIds - Array of selected phase IDs
 * @param {Array} allPhases - Array of all detected phases
 * @returns {number} Duration in seconds
 */
function calculateTestDuration(selectedPhaseIds, allPhases) {
    // If "all" is selected, sum all phase durations
    if (selectedPhaseIds.includes('all')) {
        return allPhases.reduce((sum, phase) => sum + phase.durationSec, 0);
    }
    
    // Sum only selected phase durations
    return selectedPhaseIds
        .map(phaseId => {
            const index = parseInt(phaseId.replace('phase-', ''));
            return allPhases.find(p => p.index === index);
        })
        .filter(phase => phase !== undefined)
        .reduce((sum, phase) => sum + phase.durationSec, 0);
}

/**
 * Callback when phase filter changes
 * @param {Array} selectedPhaseIds - Array of selected phase IDs
 */
function onPhaseFilterChange(selectedPhaseIds) {
    currentSelectedPhases = selectedPhaseIds;
    
    if (!fullData || !detectedPhases) {
        console.warn('⚠️ Data not loaded yet');
        return;
    }

    // Re-render dashboard with filtered data
    renderDashboard(fullData, selectedPhaseIds);
}

/**
 * Render dashboard with filtered data
 * @param {Object} data - Full data object
 * @param {Array} selectedPhaseIds - Selected phase IDs
 */
function renderDashboard(data, selectedPhaseIds) {
    try {
        // Destroy existing charts before creating new ones
        destroyAllCharts();
        
        // Filter intermediate data
        const filteredIntermediate = filterDataByPhases(data, selectedPhaseIds, detectedPhases);
        
        if (filteredIntermediate.length === 0) {
            console.warn('⚠️ No data for selected phases');
            return;
        }

        // Check if all individual phases are selected (equivalent to "all")
        const allPhaseIds = detectedPhases.map((phase, index) => `phase-${index}`);
        const allPhasesSelected = selectedPhaseIds.includes('all') || 
            (selectedPhaseIds.length === allPhaseIds.length && 
             allPhaseIds.every(id => selectedPhaseIds.includes(id)));

        if (allPhasesSelected && !selectedPhaseIds.includes('all')) {
            console.log('✅ All individual phases selected - using original aggregate data for accuracy');
        }

        // Recalculate aggregates for filtered data
        // If all phases selected (either "all" chip or all individual phases), use original aggregate
        const filteredAggregate = allPhasesSelected
            ? data.aggregate 
            : recalculateAggregates(filteredIntermediate, data.aggregate);

        // Create a filtered data object
        const filteredData = {
            ...data,
            intermediate: filteredIntermediate,
            aggregate: filteredAggregate
        };

        const lastUpdated = new Date();
        const reportInfo = availableReports.find(r => r.filename === currentReportFile);
        const reportDate = reportInfo ? new Date(reportInfo.timestamp).toLocaleString() : lastUpdated.toLocaleTimeString();
        document.getElementById('lastUpdated').textContent = `Data loaded: ${reportDate}`;

        const counters = filteredAggregate?.counters || {};
        const summaries = filteredAggregate?.summaries || {};

        // console.log('Counters:', counters);
        // console.log('Summaries:', summaries);

        // Calculate duration from phase configurations (not timestamps)
        const durationSec = calculateTestDuration(selectedPhaseIds, detectedPhases);

        // Find target URL dynamically
        const summaryKeys = Object.keys(summaries);
        let targetUrl = 'N/A';
        for (const key of summaryKeys) {
            const match = key.match(/https?:\/\/[^/]+/);
            if (match) {
                targetUrl = match[0];
                break;
            }
        }

        // Use stored original metadata (don't recalculate from filtered data)
        document.getElementById('testName').textContent = originalTestName || 'Artillery Load Test';
        document.getElementById('targetUrl').textContent = targetUrl;
        document.getElementById('testDuration').textContent = `${durationSec.toFixed(1)}s`;
        document.getElementById('startTime').textContent = originalStartTime
            ? new Date(originalStartTime).toLocaleString()
            : 'N/A';
        document.getElementById('scenarioCount').textContent =
            Object.keys(counters).filter(k => k.includes('vusers.created_by_name')).length || 1;
        document.getElementById('periodCount').textContent = filteredIntermediate.length || 0;

        // ===================================================================
        // METRIC DETECTION
        // ===================================================================
        function findMetric(summaries, metricType) {
            const keys = Object.keys(summaries);
            const pattern = new RegExp(`browser\\.page\\.${metricType}\\.`, 'i');
            const matchingKey = keys.find(k => pattern.test(k));
            return summaries[matchingKey] || {};
        }

        const sessionLength = summaries['vusers.session_length'] || {};
        const fcp = findMetric(summaries, 'FCP');
        const lcp = findMetric(summaries, 'LCP');
        const ttfb = findMetric(summaries, 'TTFB');
        const fid = findMetric(summaries, 'FID');
        const cls = findMetric(summaries, 'CLS');

        const metricsDiv = document.getElementById('summary');
        metricsDiv.innerHTML = `
            <div class=\"metric-stack\">\n        <div class=\"card compact\">\n          <h3>Total VUsers <span class=\"tooltip\" data-tooltip=\"Virtual Users simulated during the test.\">?</span></h3>\n          <p>${counters['vusers.created'] || 0}</p>\n        </div>\n        <div class=\"card compact\">\n          <h3>Completed <span class=\"tooltip\" data-tooltip=\"VUsers that completed successfully.\">?</span></h3>\n          <p>${counters['vusers.completed'] || 0}</p>\n        </div>\n      </div>\n      <div class=\"metric-stack\">\n        <div class=\"card compact\">\n          <h3>Failed <span class=\"tooltip\" data-tooltip=\"VUsers that failed during the test.\">?</span></h3>\n          <p>${counters['vusers.failed'] || 0}</p>\n        </div>\n        <div class=\"card compact\">\n          <h3>HTTP Requests <span class=\"tooltip\" data-tooltip=\"Total HTTP requests made.\">?</span></h3>\n          <p>${counters['browser.http_requests'] || 0}</p>\n        </div>\n      </div>\n      <div class=\"metric-stack\">\n        <div class=\"card compact\">\n          <h3>Session Length (mean ms)</h3>\n          <p>${sessionLength.mean?.toFixed(2) || 'N/A'}</p>\n        </div>\n        <div class=\"card compact\">\n          <h3>Success Rate</h3>\n          <p>${((counters['vusers.completed'] / counters['vusers.created']) * 100).toFixed(1)}%</p>\n        </div>\n      </div>\n    `;

        // APDEX card
        const apdexCard = createApdexCard(summaries, fcp);
        metricsDiv.appendChild(apdexCard);

        // Core Web Vitals ratings
        function getRating(metric, value) {
            const thresholds = {
                FCP: { good: 1800, poor: 3000 },
                LCP: { good: 2500, poor: 4000 },
                FID: { good: 100, poor: 300 },
                CLS: { good: 0.1, poor: 0.25 },
                TTFB: { good: 800, poor: 1800 },
            };
            const t = thresholds[metric];
            if (!t) return 'good';
            if (value <= t.good) return 'good';
            if (value <= t.poor) return 'needs-improvement';
            return 'poor';
        }

        const vitalsDiv = document.getElementById('vitals');
        vitalsDiv.innerHTML = `
            <div class=\"vital-card ${getRating('FCP', fcp.p75)}\">\n        <h3>First Contentful Paint (FCP)</h3>\n        <div class=\"value\">${fcp.p75?.toFixed(0) || 'N/A'} ms</div>\n        <div class=\"rating\">${getRating('FCP', fcp.p75).replace('-', ' ')}</div>\n      </div>\n      <div class=\"vital-card ${getRating('LCP', lcp.p75)}\">\n        <h3>Largest Contentful Paint (LCP)</h3>\n        <div class=\"value\">${lcp.p75?.toFixed(0) || 'N/A'} ms</div>\n        <div class=\"rating\">${getRating('LCP', lcp.p75).replace('-', ' ')}</div>\n      </div>\n      <div class=\"vital-card ${getRating('FID', fid.p75)}\">\n        <h3>First Input Delay (FID)</h3>\n        <div class=\"value\">${fid.p75?.toFixed(1) || 'N/A'} ms</div>\n        <div class=\"rating\">${getRating('FID', fid.p75).replace('-', ' ')}</div>\n      </div>\n      <div class=\"vital-card ${getRating('CLS', cls.p75)}\">\n        <h3>Cumulative Layout Shift (CLS)</h3>\n        <div class=\"value\">${cls.p75?.toFixed(3) || 'N/A'}</div>\n        <div class=\"rating\">${getRating('CLS', cls.p75).replace('-', ' ')}</div>\n      </div>\n    `;

        // Convert intermediate periods to timestamps
        const periods = getFilteredPeriodLabels(filteredIntermediate);
        const periodTimestamps = filteredIntermediate.map(item => parseInt(item.period) || 0);

        const fcpKey = Object.keys(filteredIntermediate[0]?.summaries || {}).find(k =>
            /browser\.page\.FCP\./i.test(k)
        );

        // Get filtered phases for chart markers (only selected phases)
        const filteredPhases = getFilteredPhases(selectedPhaseIds, detectedPhases);

        // Create charts with filtered data and phase information
        chartInstances.throughput = createThroughputChart(filteredData, periods, filteredPhases, periodTimestamps);
        chartInstances.httpRequests = createHTTPRequestsChart(periods, filteredData, filteredPhases, periodTimestamps);
        chartInstances.combinedMetrics = createCombinedMetricsChart(filteredData, periods, fcpKey, filteredPhases, periodTimestamps);
        chartInstances.fcp = createFCPChart(periods, filteredData, fcpKey, filteredPhases, periodTimestamps);
        chartInstances.vusersActivity = createVUsersActivityChart(periods, filteredData, filteredPhases, periodTimestamps);
        chartInstances.concurrentUsers = createConcurrentUsersChart(periods, filteredData, filteredPhases, periodTimestamps);
        chartInstances.percentiles = createPercentilesChart(fcp);
        chartInstances.statusCodes = createStatusCodesChart(counters);
        chartInstances.successFailure = createSuccessFailureChart(counters);
        chartInstances.latencyHistogram = createLatencyHistogramChart(filteredData);
        chartInstances.errorBreakdown = createErrorBreakdownChart(counters);
        chartInstances.stepBreakdown = createStepBreakdownChart(summaries);

        // Initialize chart maximize buttons after all charts are rendered
        setTimeout(() => {
            refreshMaximizeButtons();
        }, 100);
    } catch (error) {
        console.error('Error rendering dashboard:', error);
    }
}
// dashboard-data-loader.js
// Handles all data loading logic for the Artillery Performance Dashboard
import { BASE_PATH } from './utils/path-config.js';

/**
 * Fetch list of available JSON reports from the results folder
 * @returns {Promise<Array>} Array of report filenames
 */
export async function fetchAvailableReports() {
    // Only return results.json
    return ['results.json'];
}

/**
 * Load a specific report and refresh the dashboard
 * @param {string} reportPath - Path to the JSON report file
 */
export async function loadReport(reportPath) {
    if (!reportPath) return;
    try {
        // console.log(`Loading report: ${reportPath}`);
        localStorage.setItem('selectedReport', reportPath);
        location.reload();
    } catch (error) {
        console.error('Error loading report:', error);
    }
}

/**
 * Loads dashboard data from results.json and returns the parsed data object
 * @returns {Promise<Object|null>} Parsed dashboard data or null if not found/invalid
 */
export async function loadDashboardData(reportFile = 'results.json') {
    try {
        const timestamp = new Date().getTime();
        const fetchUrl = `${BASE_PATH}/results/${reportFile}?v=${timestamp}`;
        const res = await fetch(fetchUrl);
        if (!res.ok) return null;
        const data = await res.json();
        if (!data || !data.aggregate || !data.intermediate || data.intermediate.length === 0) return null;
        return data;
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        return null;
    }
}

/**
 * Load available reports from resultsMap.json
 */
async function loadAvailableReports() {
    try {
        const timestamp = new Date().getTime();
        const res = await fetch(`${BASE_PATH}/results/resultsMap.json?v=${timestamp}`);
        if (!res.ok) {
            console.warn('resultsMap.json not found, falling back to results.json');
            availableReports = [{ filename: 'results.json', timestamp: new Date().toISOString(), testName: 'Latest Test' }];
            populateReportSelector();
            return;
        }
        const mapData = await res.json();
        availableReports = mapData.files || [];
        
        // Populate the report selector dropdown ONLY on first load
        populateReportSelector();
    } catch (error) {
        console.error('Error loading results map:', error);
        availableReports = [{ filename: 'results.json', timestamp: new Date().toISOString(), testName: 'Latest Test' }];
        populateReportSelector();
    }
}

/**
 * Populate the report selector dropdown with available reports
 */
function populateReportSelector() {
    const dropdown = document.getElementById('reportDropdown');
    if (!dropdown) return;
    
    // Clear existing options
    dropdown.innerHTML = '';
    
    // Remove any existing event listeners by cloning the element
    const newDropdown = dropdown.cloneNode(false);
    dropdown.parentNode.replaceChild(newDropdown, dropdown);
    
    if (availableReports.length === 0) {
        const option = document.createElement('option');
        option.value = 'results.json';
        option.textContent = 'Latest Test';
        newDropdown.appendChild(option);
        return;
    }
    
    // Add options for each available report
    availableReports.forEach((report, index) => {
        const option = document.createElement('option');
        option.value = report.filename;
        
        // Format the display text
        const date = new Date(report.timestamp);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        option.textContent = `${report.testName || 'Test'} - ${dateStr} ${timeStr} (${report.duration || 'N/A'}, ${report.vusers || 0} VU)`;
        
        // Select the currently loaded report
        if (report.filename === currentReportFile) {
            option.selected = true;
        }
        
        newDropdown.appendChild(option);
    });
    
    // Add ONE event listener for dropdown changes
    newDropdown.addEventListener('change', async (e) => {
        const selectedReport = e.target.value;
        await loadData(selectedReport);
    });
}
