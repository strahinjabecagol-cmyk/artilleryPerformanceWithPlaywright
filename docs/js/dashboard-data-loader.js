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

export async function loadData(reportPath = null) {
    try {
        // console.log('Fetching results.json...');
        const data = await loadDashboardData();
        if (!data) {
            window.showNoDataMessage();
            return;
        }

        const lastUpdated = new Date();
        document.getElementById('lastUpdated').textContent = `Data loaded: ${lastUpdated.toLocaleTimeString()}`;

        const counters = data.aggregate?.counters || {};
        const summaries = data.aggregate?.summaries || {};

        // console.log('Counters:', counters);
        // console.log('Summaries:', summaries);

        // Extract duration and start time safely
        const durationMs = data.aggregate?.duration || 0;
        const firstMetricAt = data.aggregate?.firstMetricAt || null;
        const durationSec = (durationMs / 1000).toFixed(1);

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

        // Extract test name
        const counterKeys = Object.keys(counters || {});
        const testNameKey = counterKeys.find(k => k.startsWith('TEST_NAME.'));
        let finalTestName = 'Artillery Load Test';
        if (testNameKey) {
            const rawName = testNameKey.replace('TEST_NAME.', '');
            finalTestName = rawName.replace(/_/g, ' ');
        }

        document.getElementById('testName').textContent = finalTestName;
        document.getElementById('targetUrl').textContent = targetUrl;
        document.getElementById('testDuration').textContent = `${durationSec}s`;
        document.getElementById('startTime').textContent = firstMetricAt
            ? new Date(firstMetricAt).toLocaleString()
            : 'N/A';
        document.getElementById('scenarioCount').textContent =
            Object.keys(counters).filter(k => k.includes('vusers.created_by_name')).length || 1;
        document.getElementById('periodCount').textContent = data.intermediate?.length || 0;

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
        const periods = data.intermediate.map(item => {
            const timestamp = item.period ? new Date(parseInt(item.period)) : null;
            return timestamp
                ? timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : 'N/A';
        });

        const fcpKey = Object.keys(data.intermediate[0]?.summaries || {}).find(k =>
            /browser\.page\.FCP\./i.test(k)
        );

        // Create charts
        createThroughputChart(data, periods);
        createHTTPRequestsChart(periods, data);
        createCombinedMetricsChart(data, periods, fcpKey);
        createFCPChart(periods, data, fcpKey);
        createVUsersActivityChart(periods, data);
        createConcurrentUsersChart(periods, data);
        createPercentilesChart(fcp);
        createStatusCodesChart(counters);
        createSuccessFailureChart(counters);
        createLatencyHistogramChart(data);
        createErrorBreakdownChart(counters);
        createStepBreakdownChart(summaries);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        window.showNoDataMessage();
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
export async function loadDashboardData() {
    try {
        // console.log('Fetching results.json...');
        const timestamp = new Date().getTime();
        const resolvedReportPath = 'results.json';
        const fetchUrl = `${BASE_PATH}/results/${resolvedReportPath}?v=${timestamp}`;
        // console.log(`Loading report from: ${fetchUrl}`);
        const res = await fetch(fetchUrl);
        // console.log('Fetch response:', res.status, res.statusText);
        if (!res.ok) return null;
        const data = await res.json();
        // console.log('Data loaded successfully:', data);
        if (!data || !data.aggregate || !data.intermediate || data.intermediate.length === 0) return null;
        return data;
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        return null;
    }
}
