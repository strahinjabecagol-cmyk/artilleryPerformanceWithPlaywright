// Util function to capture and emit browser performance metrics safely
async function capturePerformanceMetrics(page, events, metricPrefix = 'custom') {
    try {
        if (!page) {
            console.warn('capturePerformanceMetrics: No page object found.');
            return;
        }

        await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});

        const perfMetrics = await page.evaluate(() => {
            if (!window.performance || typeof performance.getEntriesByType !== 'function') {
                return {};
            }

            const perf = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint') || [];
            const fcpEntry = paint.find(p => p.name === 'first-contentful-paint');

            return {
                fcp: fcpEntry?.startTime || 0,
                ttfb: perf ? perf.responseStart - perf.requestStart : 0,
                domContentLoaded: perf ? perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart : 0,
                loadComplete: perf ? perf.loadEventEnd - perf.loadEventStart : 0
            };
        });

        if (!perfMetrics || Object.keys(perfMetrics).length === 0) {
            console.warn('No performance metrics found.');
            return;
        }

        // Emit metrics (histogram + summary)
        for (const [key, value] of Object.entries(perfMetrics)) {
            if (value > 0) {
                events.emit('histogram', `${metricPrefix}.${key.toLowerCase()}`, value);
                events.emit('summary', `${metricPrefix}.${key.toUpperCase()}`, { mean: value });
            }
        }

    } catch (error) {
        console.warn('Could not capture performance metrics:', error.message);
    }
}

module.exports = { capturePerformanceMetrics };
