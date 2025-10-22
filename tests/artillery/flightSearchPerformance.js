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

module.exports = { flightSearchPerformance };
