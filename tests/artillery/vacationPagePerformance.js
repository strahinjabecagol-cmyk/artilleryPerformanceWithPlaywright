/**
 * ============================================================================
 * VACATION PAGE LOAD PERFORMANCE TEST
 * ============================================================================
 * Tests the performance of loading the vacation destination page.
 * 
 * User Journey:
 * 1. Navigate to homepage (https://blazedemo.com/index.php)
 * 2. Click "destination of the week! The Beach!" link
 * 3. Measure vacation.html page load performance
 * 
 * Metrics Captured:
 * - Homepage load time
 * - Vacation page navigation time
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 * - DOM Complete time
 * - Full page load time
 * - DNS lookup time
 * - Response time
 * - Image load verification
 * 
 * Expected Performance (based on manual testing):
 * - Total Load Time: ~759ms
 * - TTFB: ~234ms
 * - FCP: ~288ms
 * - DOM Complete: ~759ms
 * ============================================================================
 */

async function vacationPagePerformance(page, vuContext, events, test) {
    
    // Counter for scenario execution tracking
    events.emit('counter', `user.${vuContext.scenario.name}.vacation_page_visit`, 1);
    
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

module.exports = { vacationPagePerformance };
