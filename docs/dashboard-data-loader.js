// dashboard-data-loader.js
// Handles all data loading logic for the Artillery Performance Dashboard
import { BASE_PATH } from './js/utils/path-config.js';

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
        console.log(`Loading report: ${reportPath}`);
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
        console.log('Fetching results.json...');
        const timestamp = new Date().getTime();
        const resolvedReportPath = 'results.json';
        const fetchUrl = `${BASE_PATH}/results/${resolvedReportPath}?v=${timestamp}`;
        console.log(`Loading report from: ${fetchUrl}`);
        const res = await fetch(fetchUrl);
        console.log('Fetch response:', res.status, res.statusText);
        if (!res.ok) return null;
        const data = await res.json();
        console.log('Data loaded successfully:', data);
        if (!data || !data.aggregate || !data.intermediate || data.intermediate.length === 0) return null;
        return data;
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        return null;
    }
}
