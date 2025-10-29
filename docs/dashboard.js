// Artillery Performance Dashboard - JavaScript
import { createThroughputChart } from './js/charts/throughput-chart.js';
import { createFCPChart } from './js/charts/fcp-chart.js';
import { createVUsersActivityChart } from './js/charts/vusers-activity-chart.js';
import { createConcurrentUsersChart } from './js/charts/concurrent-users-chart.js';
import { createHTTPRequestsChart } from './js/charts/http-requests-chart.js';
import { createCombinedMetricsChart } from './js/charts/combined-metrics-chart.js';
import { createPercentilesChart } from './js/charts/percentiles-chart.js';
import { createSuccessFailureChart } from './js/charts/success-failure-chart.js';
import { createStatusCodesChart } from './js/charts/status-codes-chart.js';
import { createLatencyHistogramChart } from './js/charts/latency-histogram.js';
import { createErrorBreakdownChart } from './js/charts/error-breakdown.js';
import { createStepBreakdownChart } from './js/charts/step-breakdown.js';
import { initializeEventListeners } from './js/utils/event-handlers.js';
import { BASE_PATH } from './js/utils/path-config.js';
import { createApdexCard } from './js/utils/apdex-calculator.js';

// ===================================================================
// REPORT SELECTOR FUNCTIONALITY
// ===================================================================

/**
 * Fetch list of available JSON reports from the results folder
 * Attempts to fetch common report names to see which ones exist
 * @returns {Promise<Array>} Array of report filenames
 */
async function fetchAvailableReports() {
    try {
        const timestamp = new Date().getTime();
        const commonReportNames = [
            'results.json',
            'results_baseline.json',
            'results_previous.json',
            'results_2025-10-28.json',
            'results_2025-10-27.json',
            'results_2025-10-26.json',
            'results_load.json',
            'results_stress.json',
            'results_spike.json'
        ];
        
        const availableReports = [];
        
        // Try to fetch each common report name
        for (const reportName of commonReportNames) {
            try {
                const response = await fetch(`${BASE_PATH}/results/${reportName}?v=${timestamp}`, { method: 'HEAD' });
                if (response.ok) {
                    availableReports.push(reportName);
                }
            } catch (err) {
                // Report doesn't exist, continue to next
                continue;
            }
        }
        
        // Also try to fetch from a reports manifest file if it exists
        try {
            const manifestResponse = await fetch(`${BASE_PATH}/results/manifest.json?v=${timestamp}`);
            if (manifestResponse.ok) {
                const manifest = await manifestResponse.json();
                if (manifest.reports && Array.isArray(manifest.reports)) {
                    // Add reports from manifest that aren't already in the list
                    manifest.reports.forEach(report => {
                        if (!availableReports.includes(report)) {
                            availableReports.push(report);
                        }
                    });
                }
            }
        } catch (err) {
            // Manifest doesn't exist, that's fine
        }
        
        return availableReports.sort().reverse(); // Most recent first
    } catch (error) {
        console.error('Error fetching available reports:', error);
        return [];
    }
}

/**
 * Populate the report dropdown with available JSON files
 */
async function populateReportDropdown() {
    const dropdown = document.getElementById('reportDropdown');
    if (!dropdown) return;

    try {
        const reports = await fetchAvailableReports();
        
        dropdown.innerHTML = '<option value="">-- Select a report --</option>';
        
        if (reports.length === 0) {
            dropdown.innerHTML += '<option disabled>No reports found</option>';
            dropdown.disabled = true;
            return;
        }

        reports.forEach(report => {
            const option = document.createElement('option');
            option.value = report;
            option.textContent = report;
            dropdown.appendChild(option);
        });

        dropdown.disabled = false;
        
        // Auto-select results.json if available
        const resultsJsonOption = dropdown.querySelector('option[value="results.json"]');
        if (resultsJsonOption) {
            dropdown.value = 'results.json';
        }
    } catch (error) {
        console.error('Error populating report dropdown:', error);
    }
}

/**
 * Load a specific report and refresh the dashboard
 * @param {string} reportPath - Path to the JSON report file
 */
async function loadReport(reportPath) {
    if (!reportPath) return;
    
    try {
        console.log(`Loading report: ${reportPath}`);
        
        // Store the selected report in localStorage for persistence
        localStorage.setItem('selectedReport', reportPath);
        
        // Reload the dashboard with the new report
        location.reload();
    } catch (error) {
        console.error('Error loading report:', error);
    }
}

async function loadData(reportPath = null) {
    try {
        console.log('Fetching results.json...');
        // ⚠️ CACHE BUSTING: Timestamp prevents browser from serving cached results.json
        // This ensures fresh data is always loaded after running new Artillery tests
        const timestamp = new Date().getTime();
        
        // Use provided reportPath or default to results.json
        const resolvedReportPath = reportPath || localStorage.getItem('selectedReport') || 'results.json';
        const fetchUrl = `${BASE_PATH}/results/${resolvedReportPath}?v=${timestamp}`;
        
        console.log(`Loading report from: ${fetchUrl}`);
        const res = await fetch(fetchUrl);
        console.log('Fetch response:', res.status, res.statusText);

        // Check if file exists
        if (!res.ok) {
            showNoDataMessage();
            return;
        }

        const data = await res.json();
        console.log('Data loaded successfully:', data);

        // Check if data is valid
        if (!data || !data.aggregate || !data.intermediate || data.intermediate.length === 0) {
            showNoDataMessage();
            return;
        }

        // Update last updated time
        const lastUpdated = new Date();
        document.getElementById('lastUpdated').textContent = `Data loaded: ${lastUpdated.toLocaleTimeString()}`;

        // Extract overall stats from aggregate FIRST
        const counters = data.aggregate?.counters || {};
        const summaries = data.aggregate?.summaries || {};
        console.log('Counters:', counters);
        console.log('Summaries:', summaries);

        // ===================================================================
        // POPULATE TEST METADATA
        // ===================================================================
        const firstMetricAt = data.aggregate?.firstMetricAt;
        const lastMetricAt = data.aggregate?.lastMetricAt;
        const durationMs = lastMetricAt && firstMetricAt ? lastMetricAt - firstMetricAt : 0;
        const durationSec = (durationMs / 1000).toFixed(1);

        // Find target URL dynamically from summaries keys
        const summaryKeys = Object.keys(summaries);
        let targetUrl = 'N/A';
        for (const key of summaryKeys) {
            const match = key.match(/https?:\/\/[^/]+/);
            if (match) {
                targetUrl = match[0];
                break;
            }
        }

        // Extract test name from TEST_NAME.* counter (emitted by processor before hook)
        const counterKeys = Object.keys(counters || {});
        const testNameKey = counterKeys.find(k => k.startsWith('TEST_NAME.'));

        let finalTestName = 'Artillery Load Test'; // Default fallback

        if (testNameKey) {
            // Extract the test name from the counter key
            // Format: TEST_NAME.Webstore_and_Flight_Search_Performance_Test -> Webstore and Flight Search Performance Test
            const rawName = testNameKey.replace('TEST_NAME.', '');
            finalTestName = rawName.replace(/_/g, ' '); // Replace underscores with spaces
        }

        document.getElementById('testName').textContent = finalTestName;
        document.getElementById('targetUrl').textContent = targetUrl;
        document.getElementById('testDuration').textContent = `${durationSec}s`;
        document.getElementById('startTime').textContent = firstMetricAt
            ? new Date(firstMetricAt).toLocaleString()
            : 'N/A';
        document.getElementById('scenarioCount').textContent = Object.keys(counters).filter(k => k.includes('vusers.created_by_name')).length || 1;
        document.getElementById('periodCount').textContent = data.intermediate?.length || 0;

        // ===================================================================
        // DYNAMIC METRIC DETECTION
        // ===================================================================
        // Helper function to find metrics dynamically (works with any target URL)
        function findMetric(summaries, metricType) {
            const keys = Object.keys(summaries);
            const pattern = new RegExp(`browser\\.page\\.${metricType}\\.`, 'i');
            const matchingKey = keys.find(k => pattern.test(k));
            return summaries[matchingKey] || {};
        }

        // Get key metrics dynamically
        const sessionLength = summaries['vusers.session_length'] || {};
        const findStuff = summaries['browser.step.Find some stuff'] || {};
        const fcp = findMetric(summaries, 'FCP');
        const lcp = findMetric(summaries, 'LCP');
        const ttfb = findMetric(summaries, 'TTFB');
        const fid = findMetric(summaries, 'FID');
        const cls = findMetric(summaries, 'CLS');

        const metricsDiv = document.getElementById('summary');
        metricsDiv.innerHTML = `
        <div class="metric-stack">
          <div class="card compact">
            <h3>Total VUsers <span class="tooltip" data-tooltip="Virtual Users: Simulated users that ran through your test scenarios. Each VUser represents one complete user journey through your application.">?</span></h3>
            <p>${counters['vusers.created'] || 0}</p>
          </div>
          <div class="card compact">
            <h3>Completed <span class="tooltip" data-tooltip="Number of VUsers that successfully completed all steps in the test scenario without errors.">?</span></h3>
            <p>${counters['vusers.completed'] || 0}</p>
          </div>
        </div>
        <div class="metric-stack">
          <div class="card compact">
            <h3>Failed <span class="tooltip" data-tooltip="Number of VUsers that encountered errors during the test. High failure rates may indicate performance or stability issues.">?</span></h3>
            <p>${counters['vusers.failed'] || 0}</p>
          </div>
          <div class="card compact">
            <h3>HTTP Requests <span class="tooltip" data-tooltip="Total number of HTTP requests made during the test, including page loads, API calls, and resource fetches.">?</span></h3>
            <p>${counters['browser.http_requests'] || 0}</p>
          </div>
        </div>
        <div class="metric-stack">
          <div class="card compact">
            <h3>Session Length (mean ms) <span class="tooltip" data-tooltip="Average time (in milliseconds) it took for a VUser to complete the entire test scenario from start to finish.">?</span></h3>
            <p>${sessionLength.mean?.toFixed(2) || 'N/A'}</p>
          </div>
          <div class="card compact">
            <h3>Success Rate <span class="tooltip" data-tooltip="Percentage of VUsers that completed successfully. Higher is better. Target: >95% for production systems.">?</span></h3>
            <p>${((counters['vusers.completed'] / counters['vusers.created']) * 100).toFixed(1)}%</p>
          </div>
        </div>
      `;

        // Create APDEX score card using the imported module
        const apdexCard = createApdexCard(summaries, fcp);
        metricsDiv.appendChild(apdexCard);

        // Core Web Vitals with ratings
        function getRating(metric, value) {
            const thresholds = {
                FCP: { good: 1800, poor: 3000 },
                LCP: { good: 2500, poor: 4000 },
                FID: { good: 100, poor: 300 },
                CLS: { good: 0.1, poor: 0.25 },
                TTFB: { good: 800, poor: 1800 }
            };
            const t = thresholds[metric];
            if (!t) return 'good';
            if (value <= t.good) return 'good';
            if (value <= t.poor) return 'needs-improvement';
            return 'poor';
        }

        const vitalsDiv = document.getElementById('vitals');
        vitalsDiv.innerHTML = `
        <div class="vital-card ${getRating('FCP', fcp.p75)}">
          <h3>First Contentful Paint (FCP) <span class="tooltip" data-tooltip="Time from navigation to when the first text or image is painted. Measures perceived load speed. Good: <1.8s, Poor: >3s. Based on 75th percentile.">?</span></h3>
          <div class="value">${fcp.p75?.toFixed(0) || 'N/A'} ms</div>
          <div class="rating">${getRating('FCP', fcp.p75).replace('-', ' ')}</div>
        </div>
        <div class="vital-card ${getRating('LCP', lcp.p75)}">
          <h3>Largest Contentful Paint (LCP) <span class="tooltip" data-tooltip="Time to render the largest content element visible in viewport. Measures loading performance. Good: <2.5s, Poor: >4s. Based on 75th percentile.">?</span></h3>
          <div class="value">${lcp.p75?.toFixed(0) || 'N/A'} ms</div>
          <div class="rating">${getRating('LCP', lcp.p75).replace('-', ' ')}</div>
        </div>
        <div class="vital-card ${getRating('FID', fid.p75)}">
          <h3>First Input Delay (FID) <span class="tooltip" data-tooltip="Time from user's first interaction to browser response. Measures interactivity. Good: <100ms, Poor: >300ms. Based on 75th percentile.">?</span></h3>
          <div class="value">${fid.p75?.toFixed(1) || 'N/A'} ms</div>
          <div class="rating">${getRating('FID', fid.p75).replace('-', ' ')}</div>
        </div>
        <div class="vital-card ${getRating('CLS', cls.p75)}">
          <h3>Cumulative Layout Shift (CLS) <span class="tooltip" data-tooltip="Measures visual stability. Sum of all unexpected layout shifts. Lower is better. Good: <0.1, Poor: >0.25. Based on 75th percentile.">?</span></h3>
          <div class="value">${cls.p75?.toFixed(3) || 'N/A'}</div>
          <div class="rating">${getRating('CLS', cls.p75).replace('-', ' ')}</div>
        </div>
      `;

        // Charts - using intermediate data
        // ===================================================================
        // CONVERT PERIODS TO REAL TIMESTAMPS
        // ===================================================================
        const periods = data.intermediate.map((item) => {
            // item.period is a STRING containing milliseconds timestamp
            const timestamp = item.period ? new Date(parseInt(item.period)) : null;
            if (timestamp) {
                return timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
            return 'N/A';
        });

        // Find FCP key dynamically for intermediate data
        const fcpKey = Object.keys(data.intermediate[0]?.summaries || {}).find(k => /browser\.page\.FCP\./i.test(k));


        createThroughputChart(data, periods);

        // Create HTTP Requests Chart using the imported module
        createHTTPRequestsChart(periods, data);

        // Create Combined Metrics Chart using the imported module
        createCombinedMetricsChart(data, periods, fcpKey);

        // Create FCP Chart using the imported module
        createFCPChart(periods, data, fcpKey);

        // Create VUsers Activity Chart using the imported module
        createVUsersActivityChart(periods, data);

        // Create Concurrent Users Chart using the imported module
        createConcurrentUsersChart(periods, data);

        // Create Response Time Percentiles Chart using the imported module
        createPercentilesChart(fcp);

        // HTTP Status Codes Chart using the imported module
        createStatusCodesChart(counters);

        // Create Success vs Failure Rate Chart using the imported module
        createSuccessFailureChart(counters);

        // Create Latency Histogram using the imported module
        createLatencyHistogramChart(data);

        // Create Error Breakdown Chart using the imported module
        createErrorBreakdownChart(counters);

        // Create Step Breakdown Chart using the imported module
        createStepBreakdownChart(summaries);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNoDataMessage();
    }
}

// ===================================================================
// SHOW "NO DATA AVAILABLE" MESSAGE
// ===================================================================
function showNoDataMessage() {
    console.log('No data available - showing message');

    // Hide all chart sections
    const testMetadata = document.getElementById('testMetadata');
    const summary = document.getElementById('summary');
    const vitals = document.getElementById('vitals');

    if (testMetadata) testMetadata.style.display = 'none';
    if (summary) summary.style.display = 'none';
    if (vitals) vitals.style.display = 'none';

    document.querySelectorAll('.section-title').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.charts-container').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.vitals-grid').forEach(el => el.style.display = 'none');

    // Disable export buttons
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
        btn.title = 'No data available to export';
    });

    // Update last updated status
    document.getElementById('lastUpdated').innerHTML = '<span style="color: #ef4444;">No data found</span>';
    document.querySelector('.data-info .status').style.background = '#ef4444';

    // Create and show "No data available" message
    const container = document.querySelector('.container');
    const noDataDiv = document.createElement('div');
    noDataDiv.id = 'noDataMessage';
    noDataDiv.style.cssText = `
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 2px dashed #475569;
        border-radius: 12px;
        padding: 4rem 2rem;
        text-align: center;
        margin: 2rem auto;
        max-width: 600px;
      `;
    noDataDiv.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 1rem;">📊</div>
        <h2 style="color: #ffffff; font-size: 1.5rem; margin-bottom: 1rem;">No Data Available</h2>
        <p style="color: #94a3b8; font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem;">
          No <code style="background: #0f172a; padding: 0.25rem 0.5rem; border-radius: 4px; color: #60a5fa;">results.json</code> file found.
        </p>
        <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">
          Please run an Artillery test to generate performance data:
        </p>
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 1rem; margin: 1.5rem auto; max-width: 400px; text-align: left;">
          <code style="color: #22c55e; font-size: 0.9rem;">artillery run your-test.yml -o results.json</code>
        </div>
        <p style="color: #64748b; font-size: 0.8rem; margin-top: 1.5rem;">
          After running the test, refresh this page to view the dashboard.
        </p>
      `;

    // Insert after header
    const header = document.querySelector('header');
    header.after(noDataDiv);
}

/**
 * Initialize report selector dropdown event listeners
 */
async function initializeReportSelector() {
    const dropdown = document.getElementById('reportDropdown');
    if (!dropdown) return;

    // Populate dropdown with available reports
    await populateReportDropdown();

    // Handle report selection change
    dropdown.addEventListener('change', (event) => {
        if (event.target.value) {
            loadReport(event.target.value);
        }
    });
}

// Initialize event listeners and load data when the page loads
initializeEventListeners();
initializeReportSelector();
loadData();