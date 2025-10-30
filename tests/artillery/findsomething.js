// Import dependencies for the original test
const { selectPhillyFrom } = require('../../js-tests/tests/commands/findSomething.js');
const { selectBerlinTo } = require('../../js-tests/tests/commands/findSomething.js');
const { clickFindFlights } = require('../../js-tests/tests/commands/findSomething.js');
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
        // OPTIONAL: Capture browser performance metrics manually (reusable)
        // ===================================================================
        const { capturePerformanceMetrics } = require('../../Util/capturePerformanceMetrics');
        await capturePerformanceMetrics(page, events, 'custom');
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