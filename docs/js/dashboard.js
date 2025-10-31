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
import { fetchAvailableReports, loadReport, loadDashboardData, loadData } from './dashboard-data-loader.js';
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

  // ...loadData is now imported from dashboard-data-loader.js
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
