
// Import dependencies for the original test
const { selectPhillyFrom } = require('../../js-tests/commands/findSomething.js');
const { selectBerlinTo } = require('../../js-tests/commands/findSomething.js');
const { clickFindFlights } = require('../../js-tests/commands/findSomething.js');
const { emitTestNameOnce } = require('../../Util/emitTestNameOnce');

// ============================================================================
// SCENARIO 1: Original Test (artilleryScript)
// ============================================================================
async function artilleryScript(page, vuContext, events, test, context) {

    events.emit('counter', `user.${vuContext.scenario.name}.Find flight`, 1);
    emitTestNameOnce(events, vuContext);
    await test.step("Go to page", async () => {
        // ===================================================================
        // CUSTOM METRICS: HTTP Latency + Page Load Time
        // ===================================================================

        // Capture HTTP navigation latency (for Latency Distribution chart)
        const httpStartTime = Date.now();

        await page.goto('https://blazedemo.com/index.php');

        // Emit HTTP latency metric - measures pure navigation time
        // This will populate the "Latency Distribution" histogram in the dashboard
        const httpLatency = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.http_latency', httpLatency);

        // Also emit page load time (includes any additional processing)
        const pageLoadTime = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.page_load_time', pageLoadTime);

        // ===================================================================
        // OPTIONAL: Capture browser performance metrics manually
        // ===================================================================
        try {
            const perfMetrics = await page.evaluate(() => {
                const perf = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                const fcp = paint.find(p => p.name === 'first-contentful-paint');

                return {
                    fcp: fcp?.startTime || 0,
                    ttfb: perf?.responseStart - perf?.requestStart || 0,
                    domContentLoaded: perf?.domContentLoadedEventEnd - perf?.domContentLoadedEventStart || 0,
                    loadComplete: perf?.loadEventEnd - perf?.loadEventStart || 0
                };
            });

            // Emit browser metrics for per-period tracking
            if (perfMetrics.fcp > 0) {
                events.emit('histogram', 'custom.fcp', perfMetrics.fcp);
            }
            if (perfMetrics.ttfb > 0) {
                events.emit('histogram', 'custom.ttfb', perfMetrics.ttfb);
            }

        } catch (error) {
            // Silently fail if performance metrics aren't available
            console.warn('Could not capture performance metrics:', error.message);
        }
    });

    await test.step("Select Philadelphia as departure", async () => {
        await selectPhillyFrom(page);
    });

    await test.step("Select Berlin as destination", async () => {
        await selectBerlinTo(page);
    });

    await test.step("Click Find Flights", async () => {
        await clickFindFlights(page);
    });
}

// ============================================================================
// SCENARIO 2: Comprehensive Flight Search Performance Test
// ============================================================================
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
        // CAPTURE CORE WEB VITALS & BROWSER PERFORMANCE METRICS
        // ====================================================================
        try {
            const perfMetrics = await page.evaluate(() => {
                const perf = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                const fcp = paint.find(p => p.name === 'first-contentful-paint');
                const lcp = performance.getEntriesByType('largest-contentful-paint').slice(-1)[0];

                return {
                    // Core Web Vitals
                    fcp: fcp?.startTime || 0,
                    lcp: lcp?.renderTime || lcp?.loadTime || 0,

                    // Navigation Timing
                    ttfb: perf ? perf.responseStart - perf.requestStart : 0,
                    domContentLoaded: perf ? perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart : 0,
                    loadComplete: perf ? perf.loadEventEnd - perf.loadEventStart : 0,

                    // DNS & Connection
                    dnsTime: perf ? perf.domainLookupEnd - perf.domainLookupStart : 0,
                    tcpTime: perf ? perf.connectEnd - perf.connectStart : 0,

                    // Response
                    responseTime: perf ? perf.responseEnd - perf.responseStart : 0,
                    domParseTime: perf ? perf.domComplete - perf.domInteractive : 0
                };
            });

            // Emit Core Web Vitals (generic metrics for dashboard)
            if (perfMetrics.fcp > 0) {
                events.emit('histogram', 'custom.fcp', perfMetrics.fcp);
            }
            if (perfMetrics.lcp > 0) {
                events.emit('histogram', 'custom.lcp', perfMetrics.lcp);
            }
            if (perfMetrics.ttfb > 0) {
                events.emit('histogram', 'custom.ttfb', perfMetrics.ttfb);
            }

            // Emit additional performance metrics
            if (perfMetrics.dnsTime > 0) {
                events.emit('histogram', 'custom.dns_time', perfMetrics.dnsTime);
            }
            if (perfMetrics.tcpTime > 0) {
                events.emit('histogram', 'custom.tcp_time', perfMetrics.tcpTime);
            }
            if (perfMetrics.responseTime > 0) {
                events.emit('histogram', 'custom.response_time', perfMetrics.responseTime);
            }
            if (perfMetrics.domContentLoaded > 0) {
                events.emit('histogram', 'custom.dom_content_loaded', perfMetrics.domContentLoaded);
            }

        } catch (error) {
            console.warn('[Performance] Could not capture browser metrics:', error.message);
        }
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
        // MEASURE RESULTS PAGE PERFORMANCE
        // ====================================================================
        try {
            const resultsPageMetrics = await page.evaluate(() => {
                const perf = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                const fcp = paint.find(p => p.name === 'first-contentful-paint');

                return {
                    fcp: fcp?.startTime || 0,
                    ttfb: perf ? perf.responseStart - perf.requestStart : 0,
                    domReady: perf ? perf.domContentLoadedEventEnd - perf.fetchStart : 0,
                    fullLoad: perf ? perf.loadEventEnd - perf.fetchStart : 0
                };
            });

            // Emit results page metrics
            if (resultsPageMetrics.fcp > 0) {
                events.emit('histogram', 'custom.results_page_fcp', resultsPageMetrics.fcp);
            }
            if (resultsPageMetrics.ttfb > 0) {
                events.emit('histogram', 'custom.results_page_ttfb', resultsPageMetrics.ttfb);
            }
            if (resultsPageMetrics.domReady > 0) {
                events.emit('histogram', 'custom.results_page_dom_ready', resultsPageMetrics.domReady);
            }

        } catch (error) {
            console.warn('[Performance] Could not capture results page metrics:', error.message);
        }

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

// ============================================================================
// SCENARIO 3: Vacation Page Load Performance Test
// ============================================================================
async function vacationPagePerformance(page, vuContext, events, test) {

    // Counter for scenario execution tracking
    events.emit('counter', `user.${vuContext.scenario.name}.vacation_page_visit`, 1);
    emitTestNameOnce(events, vuContext);
    // ========================================================================
    // STEP 1: Load Homepage
    // ========================================================================
    await test.step("Load Homepage", async () => {
        const navigationStart = Date.now();

        await page.goto('https://blazedemo.com/index.php', {
            waitUntil: 'domcontentloaded'
        });

        const httpLatency = Date.now() - navigationStart;
        events.emit('histogram', 'custom.homepage_load_time', httpLatency);
    });

    // ========================================================================
    // STEP 2: Click "Destination of the Week" Link
    // ========================================================================
    await test.step("Click Vacation Link", async () => {
        const clickStart = Date.now();

        // Click the vacation destination link
        const [response] = await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
            page.click('a[href="vacation.html"]')
        ]);

        // Measure navigation time
        const navigationLatency = Date.now() - clickStart;
        events.emit('histogram', 'custom.vacation_page_load_time', navigationLatency);

        // Capture HTTP status code
        const statusCode = response.status();
        events.emit('counter', `custom.vacation_status_${statusCode}`, 1);

        // ====================================================================
        // MEASURE VACATION PAGE PERFORMANCE
        // ====================================================================
        try {
            const perfMetrics = await page.evaluate(() => {
                const perf = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                const fcp = paint.find(p => p.name === 'first-contentful-paint');

                return {
                    // Core Web Vitals
                    fcp: fcp?.startTime || 0,
                    ttfb: perf ? perf.responseStart - perf.requestStart : 0,

                    // Navigation Timing
                    domInteractive: perf ? perf.domInteractive - perf.fetchStart : 0,
                    domComplete: perf ? perf.domComplete - perf.fetchStart : 0,
                    loadComplete: perf ? perf.loadEventEnd - perf.fetchStart : 0,

                    // Network Timing
                    dnsTime: perf ? perf.domainLookupEnd - perf.domainLookupStart : 0,
                    tcpTime: perf ? perf.connectEnd - perf.connectStart : 0,
                    responseTime: perf ? perf.responseEnd - perf.responseStart : 0
                };
            });

            // Emit vacation page metrics
            if (perfMetrics.fcp > 0) {
                events.emit('histogram', 'custom.vacation_fcp', perfMetrics.fcp);
            }
            if (perfMetrics.ttfb > 0) {
                events.emit('histogram', 'custom.vacation_ttfb', perfMetrics.ttfb);
            }
            if (perfMetrics.domComplete > 0) {
                events.emit('histogram', 'custom.vacation_dom_complete', perfMetrics.domComplete);
            }
            if (perfMetrics.loadComplete > 0) {
                events.emit('histogram', 'custom.vacation_load_complete', perfMetrics.loadComplete);
            }

            // Emit network timing metrics
            if (perfMetrics.dnsTime > 0) {
                events.emit('histogram', 'custom.vacation_dns_time', perfMetrics.dnsTime);
            }
            if (perfMetrics.responseTime > 0) {
                events.emit('histogram', 'custom.vacation_response_time', perfMetrics.responseTime);
            }

        } catch (error) {
            console.warn('[Vacation Page] Could not capture performance metrics:', error.message);
        }

        // ====================================================================
        // VERIFY PAGE LOADED CORRECTLY
        // ====================================================================
        try {
            // Check if the vacation page image loaded
            const hasImage = await page.locator('img').count() > 0;
            if (hasImage) {
                events.emit('counter', 'custom.vacation_image_loaded', 1);
            } else {
                events.emit('counter', 'custom.vacation_image_missing', 1);
            }

            // Check page title
            const title = await page.title();
            if (title.includes('vacation')) {
                events.emit('counter', 'custom.vacation_page_verified', 1);
            }
        } catch (error) {
            console.warn('[Vacation Page] Verification error:', error.message);
        }
    });

    // ========================================================================
    // STEP 3: Mark Completion
    // ========================================================================
    events.emit('counter', `user.${vuContext.scenario.name}.completed`, 1);
}

// ============================================================================
// EXPORTS - Make all scenarios available to Artillery
// ============================================================================
module.exports = {
    artilleryScript,
    flightSearchPerformance,
    vacationPagePerformance
};
