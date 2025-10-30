// Util function to capture and emit browser performance metrics
async function capturePerformanceMetrics(page, events, metricPrefix = 'custom') {
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
            events.emit('histogram', `${metricPrefix}.fcp`, perfMetrics.fcp);
        }
        if (perfMetrics.ttfb > 0) {
            events.emit('histogram', `${metricPrefix}.ttfb`, perfMetrics.ttfb);
        }
        if (perfMetrics.domContentLoaded > 0) {
            events.emit('histogram', `${metricPrefix}.dom_content_loaded`, perfMetrics.domContentLoaded);
        }
        if (perfMetrics.loadComplete > 0) {
            events.emit('histogram', `${metricPrefix}.load_complete`, perfMetrics.loadComplete);
        }
    } catch (error) {
        // Silently fail if performance metrics aren't available
        console.warn('Could not capture performance metrics:', error.message);
    }
}

module.exports = { capturePerformanceMetrics };