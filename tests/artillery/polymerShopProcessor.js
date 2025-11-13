const { emitTestNameOnce } = require('../../Util/emitTestNameOnce');
const { capturePerformanceMetrics } = require('../../Util/capturePerformanceMetrics');
const { test: base } = require('../../js-tests/base.test');
const { HomePage } = require('../../js-tests/pom/polymer/homePage.pom');
const { MensOutwarePage } = require('../../js-tests/pom/polymer/mensOutwarePage.pom');
const { VastrimHoodiePage } = require('../../js-tests/pom/polymer/vastrimHoodie.pom');
const { CartPage } = require('../../js-tests/pom/polymer/cartPage.pom');

const
    {
        goToPolymerHomePage,
        addVastrimHoodieToCart,
        addLadiesPuloverToCart,
        addOmiTechTeeToCart,
        addLadiesChromeTeeToCart

    } = require('../../js-tests/tests/commands/polymerTests');


const polymerHomePage = new HomePage(page, expect);
const mensOutwarePage = new MensOutwarePage(page, expect);
const vastrimHoodiePage = new VastrimHoodiePage(page, expect);
const polymerCartPage = new CartPage(page, expect);
// // SCENARIO 1: polymer shop e2e test

// async function polymerE2eTest(page, vuContext, events, test, context) {

//     events.emit('counter', `user.${vuContext.scenario.name}.Find flight`, 1);
//     emitTestNameOnce(events, vuContext);
//     await test.step("Go to page", async () => {
//         // CUSTOM METRICS: HTTP Latency + Page Load Time
//         // Capture HTTP navigation latency (for Latency Distribution chart)
//         const httpStartTime = Date.now();
//         await goToPolymerHomePage(test, page);
//         // Emit HTTP latency metric - measures pure navigation time
//         // This will populate the "Latency Distribution" histogram in the dashboard
//         const httpLatency = Date.now() - httpStartTime;
//         events.emit('histogram', 'custom.http_latency', httpLatency);
//         // Also emit page load time (includes any additional processing)
//         const pageLoadTime = Date.now() - httpStartTime;
//         events.emit('histogram', 'custom.page_load_time', pageLoadTime);
//         //Capture browser performance metrics manually (reusable)
//         await capturePerformanceMetrics(await page, await events, 'custom');
//     });

//     await test.step("Add Vastrim Hoodie to Cart", async () => {
//         // CUSTOM METRICS: HTTP Latency + Page Load Time
//         // Capture HTTP navigation latency (for Latency Distribution chart)
//         const httpStartTime = Date.now();
//         await addVastrimHoodieToCart(test, page);
//         // Emit HTTP latency metric - measures pure navigation time
//         // This will populate the "Latency Distribution" histogram in the dashboard
//         const httpLatency = Date.now() - httpStartTime;
//         events.emit('histogram', 'custom.http_latency', httpLatency);
//         // Also emit page load time (includes any additional processing)
//         const pageLoadTime = Date.now() - httpStartTime;
//         events.emit('histogram', 'custom.page_load_time', pageLoadTime);
//         //Capture browser performance metrics manually (reusable)
//         await capturePerformanceMetrics(await page, await events, 'custom');
//     });

//     await test.step("Add Ladies Pulover to Cart", async () => {
//         // CUSTOM METRICS: HTTP Latency + Page Load Time
//         // Capture HTTP navigation latency (for Latency Distribution chart)
//         const httpStartTime = Date.now();
//         await addLadiesPuloverToCart(test, page);
//         // Emit HTTP latency metric - measures pure navigation time
//         // This will populate the "Latency Distribution" histogram in the dashboard
//         const httpLatency = Date.now() - httpStartTime;
//         events.emit('histogram', 'custom.http_latency', httpLatency);
//         // Also emit page load time (includes any additional processing)
//         const pageLoadTime = Date.now() - httpStartTime;
//         events.emit('histogram', 'custom.page_load_time', pageLoadTime);
//         //Capture browser performance metrics manually (reusable)
//         await capturePerformanceMetrics(await page, await events, 'custom');
//     });

//     await test.step("Add OmiTech Tee to Cart", async () => {
//         // CUSTOM METRICS: HTTP Latency + Page Load Time
//         // Capture HTTP navigation latency (for Latency Distribution chart)
//         const httpStartTime = Date.now();
//         await addOmiTechTeeToCart(test, page);
//         // Emit HTTP latency metric - measures pure navigation time
//         // This will populate the "Latency Distribution" histogram in the dashboard
//         const httpLatency = Date.now() - httpStartTime;
//         events.emit('histogram', 'custom.http_latency', httpLatency);
//         // Also emit page load time (includes any additional processing)
//         const pageLoadTime = Date.now() - httpStartTime;
//         events.emit('histogram', 'custom.page_load_time', pageLoadTime);
//         //Capture browser performance metrics manually (reusable)
//         await capturePerformanceMetrics(await page, await events, 'custom');
//     });

//     await test.step("Add Ladies Chrome Tee to Cart", async () => {
//         // CUSTOM METRICS: HTTP Latency + Page Load Time
//         // Capture HTTP navigation latency (for Latency Distribution chart)
//         const httpStartTime = Date.now();
//         await addLadiesChromeTeeToCart(test, page);
//         // Emit HTTP latency metric - measures pure navigation time
//         // This will populate the "Latency Distribution" histogram in the dashboard
//         const httpLatency = Date.now() - httpStartTime;
//         events.emit('histogram', 'custom.http_latency', httpLatency);
//         // Also emit page load time (includes any additional processing)
//         const pageLoadTime = Date.now() - httpStartTime;
//         events.emit('histogram', 'custom.page_load_time', pageLoadTime);
//         //Capture browser performance metrics manually (reusable)
//         await capturePerformanceMetrics(await page, await events, 'custom');
//     });

// }
async function buyVastrimHoodie(page, vuContext, events, test, context) {

    events.emit('counter', `user.${vuContext.scenario.name}.Buy Vastrim Hoodie`, 1);
    emitTestNameOnce(events, vuContext);

    await test.step("Go to polyme home page", async () => {
        const httpStartTime = Date.now();
        await polymerHomePage.goto();
        const httpLatency = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.http_latency', httpLatency);
        // Also emit page load time (includes any additional processing)
        const pageLoadTime = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.page_load_time', pageLoadTime);
        //Capture browser performance metrics manually (reusable)
        await capturePerformanceMetrics(await page, await events, 'custom');
    });
    await test.step("go to Mens Outware", async () => {
        const httpStartTime = Date.now();
        await polymerHomePage.clickMensOutwareLink();
        const httpLatency = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.http_latency', httpLatency);
        // Also emit page load time (includes any additional processing)
        const pageLoadTime = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.page_load_time', pageLoadTime);
        //Capture browser performance metrics manually (reusable)
        await capturePerformanceMetrics(await page, await events, 'custom');
    });
    await test.step("click Vastrim Hoodie", async () => {
        const httpStartTime = Date.now();
        await mensOutwarePage.clickVastrmHoodie();
        const httpLatency = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.http_latency', httpLatency);
        // Also emit page load time (includes any additional processing)
        const pageLoadTime = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.page_load_time', pageLoadTime);
        //Capture browser performance metrics manually (reusable)
        await capturePerformanceMetrics(await page, await events, 'custom');
    });
    await test.step("change size to XL", async () => {
        const httpStartTime = Date.now();
        await vastrimHoodiePage.changeSizeToXL();
        const httpLatency = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.http_latency', httpLatency);
        // Also emit page load time (includes any additional processing)
        const pageLoadTime = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.page_load_time', pageLoadTime);
        //Capture browser performance metrics manually (reusable)
        await capturePerformanceMetrics(await page, await events, 'custom');
    });
    await test.step("change quantity to 2", async () => {
        const httpStartTime = Date.now();
        await vastrimHoodiePage.changeQuantityTo2();
        const httpLatency = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.http_latency', httpLatency);
        // Also emit page load time (includes any additional processing)
        const pageLoadTime = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.page_load_time', pageLoadTime);
        //Capture browser performance metrics manually (reusable)
        await capturePerformanceMetrics(await page, await events, 'custom');
    });
    await test.step("add to cart", async () => {
        const httpStartTime = Date.now();
        await vastrimHoodiePage.addToCart();
        const httpLatency = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.http_latency', httpLatency);
        // Also emit page load time (includes any additional processing)
        const pageLoadTime = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.page_load_time', pageLoadTime);
        //Capture browser performance metrics manually (reusable)
        await capturePerformanceMetrics(await page, await events, 'custom');
    });
    await test.step("dismiss added to cart popup", async () => {
        const httpStartTime = Date.now();
        await vastrimHoodiePage.dismissAddedToCartPopup();
        const httpLatency = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.http_latency', httpLatency);
        // Also emit page load time (includes any additional processing)
        const pageLoadTime = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.page_load_time', pageLoadTime);
        //Capture browser performance metrics manually (reusable)
        await capturePerformanceMetrics(await page, await events, 'custom');
    });
    await test.step("go to cart page", async () => {
        const httpStartTime = Date.now();
        await polymerCartPage.goto();
        const httpLatency = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.http_latency', httpLatency);
        // Also emit page load time (includes any additional processing)
        const pageLoadTime = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.page_load_time', pageLoadTime);
        //Capture browser performance metrics manually (reusable)
        await capturePerformanceMetrics(await page, await events, 'custom');
    });
    await test.step("click checkout button", async () => {
        const httpStartTime = Date.now();
        await polymerCartPage.clickCheckoutButton();
        const httpLatency = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.http_latency', httpLatency);
        // Also emit page load time (includes any additional processing)
        const pageLoadTime = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.page_load_time', pageLoadTime);
        //Capture browser performance metrics manually (reusable)
        await capturePerformanceMetrics(await page, await events, 'custom');
    });
    await test.step("fill in checkout form", async () => {  
        const httpStartTime = Date.now();
        await polymerCartPage.fillinCheckoutForm('John Doe', 'john.doe@example.com', '381123654789', '123 Main St', 'Anytown', '12345', 'USA');
        const httpLatency = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.http_latency', httpLatency);
        // Also emit page load time (includes any additional processing)
        const pageLoadTime = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.page_load_time', pageLoadTime);
        //Capture browser performance metrics manually (reusable)
        await capturePerformanceMetrics(await page, await events, 'custom');
    });
    await test.step("place the order", async () => {
        const httpStartTime = Date.now();
        await polymerCartPage.placeTheOrder();
        const httpLatency = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.http_latency', httpLatency);
        // Also emit page load time (includes any additional processing)
        const pageLoadTime = Date.now() - httpStartTime;
        events.emit('histogram', 'custom.page_load_time', pageLoadTime);
        //Capture browser performance metrics manually (reusable)
        await capturePerformanceMetrics(await page, await events, 'custom');
    });
};
module.exports = {
    buyVastrimHoodie,
};