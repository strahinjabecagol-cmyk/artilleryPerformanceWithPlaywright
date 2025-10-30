const { emitTestNameOnce } = require('../../Util/emitTestNameOnce');
/**
 * ============================================================================
 * FLIGHT SEARCH PERFORMANCE TEST
 * ============================================================================
 * Comprehensive performance test for BlazeDemo flight search workflow.
 * 
 * Measures:
 * - Page load time (navigation + DOM ready)
 * - Core Web Vitals (FCP, LCP, TTFB, CLS, FID)
 * - HTTP latency for navigation
 * - Results page load time
 * - End-to-end search completion time
 * 
 * All metrics are emitted as histograms and work with any Artillery dashboard.
 * ============================================================================
 */

async function flightSearchPerformance(page, vuContext, events, test) {
    emitTestNameOnce(events, vuContext);
    // Counter for scenario execution tracking
    events.emit('counter', `user.${vuContext.scenario.name}.flight_search`, 1);

    // ========================================================================
    // STEP 1: Load Homepage & Capture Initial Performance Metrics
    // ========================================================================
    await test.step("Load Homepage", async () => {
        const navigationStart = Date.now();

        // Navigate to homepage
        await page.goto('https://blazedemo.com/index.php', {
            waitUntil: 'domcontentloaded'
        });

        // Measure HTTP navigation latency
        const httpLatency = Date.now() - navigationStart;
        events.emit('histogram', 'custom.http_latency', httpLatency);
        events.emit('histogram', 'custom.page_load_time', httpLatency);

        // ====================================================================
        // CAPTURE CORE WEB VITALS & BROWSER PERFORMANCE METRICS (reusable)
        // ====================================================================
        const { capturePerformanceMetrics } = require('../../Util/capturePerformanceMetrics');
        await capturePerformanceMetrics(page, events, 'custom');
    });

    // ========================================================================
    // STEP 2: Select Departure City
    // ========================================================================
    await test.step("Select Departure City", async () => {
        // Select departure city (e.g., Philadelphia)
        await page.selectOption('select[name="fromPort"]', 'Philadelphia');
    });

    // ========================================================================
    // STEP 3: Select Destination City
    // ========================================================================
    await test.step("Select Destination City", async () => {
        // Select destination city (e.g., Berlin)
        await page.selectOption('select[name="toPort"]', 'Berlin');
    });

    // ========================================================================
    // STEP 4: Click "Find Flights" & Measure Results Load Time
    // ========================================================================
    await test.step("Search for Flights", async () => {
        const searchStart = Date.now();

        // Click the "Find Flights" button
        // Using Promise.all to capture navigation timing
        const [response] = await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
            page.click('input[type="submit"]')
        ]);

        // Measure time to get results
        const searchLatency = Date.now() - searchStart;
        events.emit('histogram', 'custom.search_results_latency', searchLatency);

        // Capture HTTP status code
        const statusCode = response.status();
        events.emit('counter', `custom.search_status_${statusCode}`, 1);

        // ====================================================================
        // MEASURE RESULTS PAGE PERFORMANCE (reusable)
        // ====================================================================
        await capturePerformanceMetrics(page, events, 'custom.results_page');

        // ====================================================================
        // VERIFY RESULTS LOADED
        // ====================================================================
        // Wait for flight results to appear (increased timeout to 15s to avoid false failures)
        await page.waitForSelector('table tbody tr', { timeout: 15000 });

        // Count number of flights displayed
        const flightCount = await page.locator('table tbody tr').count();
        events.emit('histogram', 'custom.flights_displayed', flightCount);

        if (flightCount === 0) {
            console.warn('[Warning] No flights found in results');
            events.emit('counter', 'custom.no_flights_found', 1);
        } else {
            events.emit('counter', 'custom.flights_found', 1);
        }
    });

    // ========================================================================
    // STEP 5: Measure End-to-End Completion
    // ========================================================================
    // Artillery automatically tracks this via vusers.session_length
    events.emit('counter', `user.${vuContext.scenario.name}.completed`, 1);
}

module.exports = { flightSearchPerformance };
