// Artillery Performance Dashboard - JavaScript
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
import { initializeEventListeners } from './utils/event-handlers.js';
import { BASE_PATH } from './utils/path-config.js';
import { createApdexCard } from './utils/apdex-calculator.js';
import { fetchAvailableReports, loadReport, loadDashboardData } from '../dashboard-data-loader.js';
import { downloadLog } from './modals/log-modal.js';

// Expose downloadLog globally for inline onclick usage
window.downloadLog = downloadLog;

/**
 * Fetch list of available JSON reports from the results folder
 * @returns {Promise<Array>} Array of report filenames
 */
async function getAvailableReports() {
  // Only return results.json for now
  return ['results.json'];
}

/**
 * Populate the report dropdown with available JSON files
 */
async function populateReportDropdown() {
  const dropdown = document.getElementById('reportDropdown');
  if (!dropdown) return;

  dropdown.innerHTML = '<option value="results.json">results.json</option>';
  dropdown.disabled = false;

  const reports = await getAvailableReports();
  dropdown.innerHTML = reports.map(r => `<option value="${r}">${r}</option>`).join('');
  dropdown.disabled = false;
  dropdown.value = reports[0] || '';
}

/**
 * Load a specific report and refresh the dashboard
 * @param {string} reportPath - Path to the JSON report file
 */
async function reloadReport(reportPath) {
  if (!reportPath) return;

  try {
    console.log(`Loading report: ${reportPath}`);
    localStorage.setItem('selectedReport', reportPath);
    location.reload();
  } catch (error) {
    console.error('Error loading report:', error);
  }
}

/**
 * Load and render dashboard data
 */
async function loadData(reportPath = null) {
  try {
    console.log('Fetching results.json...');
    const data = await loadDashboardData();
    if (!data) {
      showNoDataMessage();
      return;
    }

    const lastUpdated = new Date();
    document.getElementById('lastUpdated').textContent = `Data loaded: ${lastUpdated.toLocaleTimeString()}`;

    const counters = data.aggregate?.counters || {};
    const summaries = data.aggregate?.summaries || {};

    console.log('Counters:', counters);
    console.log('Summaries:', summaries);

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
      <div class="metric-stack">
        <div class="card compact">
          <h3>Total VUsers <span class="tooltip" data-tooltip="Virtual Users simulated during the test.">?</span></h3>
          <p>${counters['vusers.created'] || 0}</p>
        </div>
        <div class="card compact">
          <h3>Completed <span class="tooltip" data-tooltip="VUsers that completed successfully.">?</span></h3>
          <p>${counters['vusers.completed'] || 0}</p>
        </div>
      </div>
      <div class="metric-stack">
        <div class="card compact">
          <h3>Failed <span class="tooltip" data-tooltip="VUsers that failed during the test.">?</span></h3>
          <p>${counters['vusers.failed'] || 0}</p>
        </div>
        <div class="card compact">
          <h3>HTTP Requests <span class="tooltip" data-tooltip="Total HTTP requests made.">?</span></h3>
          <p>${counters['browser.http_requests'] || 0}</p>
        </div>
      </div>
      <div class="metric-stack">
        <div class="card compact">
          <h3>Session Length (mean ms)</h3>
          <p>${sessionLength.mean?.toFixed(2) || 'N/A'}</p>
        </div>
        <div class="card compact">
          <h3>Success Rate</h3>
          <p>${((counters['vusers.completed'] / counters['vusers.created']) * 100).toFixed(1)}%</p>
        </div>
      </div>
    `;

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
      <div class="vital-card ${getRating('FCP', fcp.p75)}">
        <h3>First Contentful Paint (FCP)</h3>
        <div class="value">${fcp.p75?.toFixed(0) || 'N/A'} ms</div>
        <div class="rating">${getRating('FCP', fcp.p75).replace('-', ' ')}</div>
      </div>
      <div class="vital-card ${getRating('LCP', lcp.p75)}">
        <h3>Largest Contentful Paint (LCP)</h3>
        <div class="value">${lcp.p75?.toFixed(0) || 'N/A'} ms</div>
        <div class="rating">${getRating('LCP', lcp.p75).replace('-', ' ')}</div>
      </div>
      <div class="vital-card ${getRating('FID', fid.p75)}">
        <h3>First Input Delay (FID)</h3>
        <div class="value">${fid.p75?.toFixed(1) || 'N/A'} ms</div>
        <div class="rating">${getRating('FID', fid.p75).replace('-', ' ')}</div>
      </div>
      <div class="vital-card ${getRating('CLS', cls.p75)}">
        <h3>Cumulative Layout Shift (CLS)</h3>
        <div class="value">${cls.p75?.toFixed(3) || 'N/A'}</div>
        <div class="rating">${getRating('CLS', cls.p75).replace('-', ' ')}</div>
      </div>
    `;

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
    showNoDataMessage();
  }
}

// ===================================================================
// SHOW "NO DATA AVAILABLE" MESSAGE
// ===================================================================
function showNoDataMessage() {
  console.log('No data available - showing message');

  const testMetadata = document.getElementById('testMetadata');
  const summary = document.getElementById('summary');
  const vitals = document.getElementById('vitals');

  if (testMetadata) testMetadata.style.display = 'none';
  if (summary) summary.style.display = 'none';
  if (vitals) vitals.style.display = 'none';

  document.querySelectorAll('.section-title').forEach(el => (el.style.display = 'none'));
  document.querySelectorAll('.charts-container').forEach(el => (el.style.display = 'none'));
  document.querySelectorAll('.vitals-grid').forEach(el => (el.style.display = 'none'));

  document.querySelectorAll('.export-btn').forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
    btn.title = 'No data available to export';
  });

  document.getElementById('lastUpdated').innerHTML =
    '<span style="color: #ef4444;">No data found</span>';
  const statusEl = document.querySelector('.data-info .status');
  if (statusEl) statusEl.style.background = '#ef4444';

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
    <p style="color: #94a3b8;">No <code>results.json</code> file found.</p>
    <p style="color: #94a3b8;">Run:</p>
    <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 1rem; margin: 1.5rem auto; max-width: 400px;">
      <code style="color: #22c55e;">artillery run your-test.yml -o results.json</code>
    </div>
    <p style="color: #64748b;">Refresh this page after generating results.</p>
  `;
  const header = document.querySelector('header');
  header.after(noDataDiv);
}

/**
 * Initialize report selector dropdown event listeners
 */
async function initializeReportSelector() {
  const dropdown = document.getElementById('reportDropdown');
  if (!dropdown) return;

  await populateReportDropdown();

  dropdown.addEventListener('change', event => {
    if (event.target.value) {
      reloadReport(event.target.value);
    }
  });
}

// Initialize event listeners and load data when the page loads
initializeEventListeners();
initializeReportSelector();
loadData();
