const { selectPhillyFrom } = require('../../js-tests/commands/selectPhillyFrom');
const { selectBerlinTo } = require('../../js-tests/commands/selectBerlinTo');
const { clickFindFlights } = require('../../js-tests/commands/clickFindFlights');
const { emitTestNameOnce } = require('../../Util/emitTestNameOnce');
async function artilleryScript(page, vuContext, events, test) {
    emitTestNameOnce(events, vuContext);
    events.emit('counter', `user.${vuContext.scenario.name}.Find flight`, 1);

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

    // });
}
module.exports = { artilleryScript };