const { emitTestNameOnce } = require('../../Util/emitTestNameOnce');
/**
 * ============================================================================
 * WEBSTORE PURCHASE PERFORMANCE TEST
 * ============================================================================
 * Comprehensive performance test for DemoBlaze webstore purchase workflow.
 * 
 * Measures:
 * - Page load time (navigation + DOM ready)
 * - Core Web Vitals (FCP, LCP, TTFB, CLS, FID)
 * - HTTP latency for navigation
 * - Product page load time
 * - Cart page load time
 * - End-to-end purchase completion time
 * 
 * All metrics are emitted as histograms and work with any Artillery dashboard.
 * ============================================================================
 */
;

async function webstorePurchasePerformance(page, vuContext, events, test) {
    emitTestNameOnce(events, vuContext);
    // Counter for scenario execution tracking
    events.emit('counter', `user.${vuContext.scenario.name}.webstore_purchase`, 1);

    // ========================================================================
    // STEP 1: Load Homepage & Capture Initial Performance Metrics
    // ========================================================================
    await test.step("Load Homepage", async () => {
        const navigationStart = Date.now();

        // Navigate to homepage
        await page.goto('https://www.demoblaze.com/index.html', {
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
    // STEP 2: Click on Nokia Lumia Product
    // ========================================================================
    await test.step("Select Nokia Lumia", async () => {
        const clickStart = Date.now();

        // Click on Nokia lumia product link
        await page.getByRole('link', { name: 'Nokia lumia' }).click();

        // Wait for product page to load
        await page.waitForLoadState('domcontentloaded');

        const productLoadTime = Date.now() - clickStart;
        events.emit('histogram', 'custom.product_page_load_time', productLoadTime);

        // Verify product page loaded
        await page.locator('h2').waitFor({ state: 'visible', timeout: 10000 });
        const productTitle = await page.locator('h2').textContent();

        if (productTitle.includes('Nokia lumia 1520')) {
            events.emit('counter', 'custom.product_page_loaded', 1);
        } else {
            console.warn('[Warning] Product page title mismatch');
            events.emit('counter', 'custom.product_page_error', 1);
        }

        // ====================================================================
        // MEASURE PRODUCT PAGE PERFORMANCE (reusable)
        // ====================================================================
        await capturePerformanceMetrics(page, events, 'custom.product_page');
    });

    // ========================================================================
    // STEP 3: Add Product to Cart
    // ========================================================================
    await test.step("Add to Cart", async () => {
        const addToCartStart = Date.now();

        // Click "Add to cart" button
        await page.getByRole('link', { name: 'Add to cart' }).click();

        // Wait for alert (confirmation dialog)
        await page.waitForEvent('dialog', { timeout: 10000 }).then(dialog => {
            events.emit('counter', 'custom.add_to_cart_confirmed', 1);
            dialog.accept();
        }).catch(() => {
            console.warn('[Warning] Add to cart dialog not detected');
            events.emit('counter', 'custom.add_to_cart_dialog_missing', 1);
        });

        const addToCartTime = Date.now() - addToCartStart;
        events.emit('histogram', 'custom.add_to_cart_time', addToCartTime);
    });

    // ========================================================================
    // STEP 4: Navigate to Cart & Measure Cart Load Time
    // ========================================================================
    await test.step("Navigate to Cart", async () => {
        const cartNavigationStart = Date.now();

        // Click on Cart link
        await page.getByRole('link', { name: 'Cart', exact: true }).click();

        // Wait for cart page to load
        await page.waitForLoadState('domcontentloaded');

        const cartLoadTime = Date.now() - cartNavigationStart;
        events.emit('histogram', 'custom.cart_page_load_time', cartLoadTime);

        // Verify cart item appears
        try {
            await page.getByRole('cell', { name: 'Nokia lumia' }).waitFor({
                state: 'visible',
                timeout: 15000
            });
            events.emit('counter', 'custom.cart_item_displayed', 1);
        } catch (error) {
            console.warn('[Warning] Cart item not displayed within timeout');
            events.emit('counter', 'custom.cart_item_not_displayed', 1);
        }

        // ====================================================================
        // MEASURE CART PAGE PERFORMANCE (reusable)
        // ====================================================================
        await capturePerformanceMetrics(page, events, 'custom.cart_page');
    });

    // ========================================================================
    // STEP 5: Click "Place Order" Button
    // ========================================================================
    await test.step("Click Place Order", async () => {
        const placeOrderStart = Date.now();

        // Click "Place Order" button
        await page.getByRole('button', { name: 'Place Order' }).click();

        // Wait for order form modal to appear
        await page.getByRole('textbox', { name: 'Total: 820 Name:' }).waitFor({
            state: 'visible',
            timeout: 10000
        });

        const placeOrderTime = Date.now() - placeOrderStart;
        events.emit('histogram', 'custom.place_order_modal_time', placeOrderTime);
        events.emit('counter', 'custom.place_order_modal_opened', 1);
    });

    // ========================================================================
    // STEP 6: Fill Order Form
    // ========================================================================
    await test.step("Fill Order Form", async () => {
        const formFillStart = Date.now();

        // Fill in the order form
        await page.getByRole('textbox', { name: 'Total: 820 Name:' }).fill('Test User');
        await page.getByRole('textbox', { name: 'Country:' }).fill('Test Country');
        await page.getByRole('textbox', { name: 'City:' }).fill('Test City');
        await page.getByRole('textbox', { name: 'Credit card:' }).fill('1234 5678 9012 3456');
        await page.getByRole('textbox', { name: 'Month:' }).fill('12');
        await page.getByRole('textbox', { name: 'Year:' }).fill('2025');

        const formFillTime = Date.now() - formFillStart;
        events.emit('histogram', 'custom.form_fill_time', formFillTime);
    });

    // ========================================================================
    // STEP 7: Submit Purchase & Measure Confirmation Time
    // ========================================================================
    await test.step("Submit Purchase", async () => {
        const purchaseStart = Date.now();

        // Click "Purchase" button
        await page.getByRole('button', { name: 'Purchase' }).click();

        // Wait for success confirmation
        await page.locator('.sweet-alert > h2').waitFor({
            state: 'visible',
            timeout: 15000
        });

        const purchaseTime = Date.now() - purchaseStart;
        events.emit('histogram', 'custom.purchase_confirmation_time', purchaseTime);

        // Verify success message
        const confirmationText = await page.locator('.sweet-alert > h2').textContent();
        if (confirmationText.includes('Thank you for your purchase!')) {
            events.emit('counter', 'custom.purchase_successful', 1);
        } else {
            console.warn('[Warning] Unexpected confirmation message');
            events.emit('counter', 'custom.purchase_confirmation_error', 1);
        }

        // Click OK to close confirmation
        await page.getByRole('button', { name: 'OK' }).click();
    });

    // ========================================================================
    // STEP 8: Measure End-to-End Completion
    // ========================================================================
    // Artillery automatically tracks this via vusers.session_length
    events.emit('counter', `user.${vuContext.scenario.name}.completed`, 1);
}

module.exports = { webstorePurchasePerformance };
