// APDEX Score Calculation Module

/**
 * Calculate and create the APDEX score card
 * APDEX is an industry standard for measuring user satisfaction
 * Score ranges from 0-1: Excellent (0.94-1), Good (0.85-0.94), Fair (0.7-0.85), Poor (<0.7)
 */
export function createApdexCard(summaries, fcp) {
    const apdexThreshold = 1500; // Satisfactory threshold in ms
    const toleratingThreshold = apdexThreshold * 4; // 6000ms

    // Dynamically select the best available latency metric for Apdex calculation
    // Priority: custom.http_latency > custom.page_load_time > browser.page.FCP.*
    let apdexSource = null;
    let apdexMetricName = '';

    if (summaries['custom.http_latency'] && summaries['custom.http_latency'].count > 0) {
        apdexSource = summaries['custom.http_latency'];
        apdexMetricName = 'http_latency';
    } else if (summaries['custom.page_load_time'] && summaries['custom.page_load_time'].count > 0) {
        apdexSource = summaries['custom.page_load_time'];
        apdexMetricName = 'page_load_time';
    } else {
        apdexSource = fcp;
        apdexMetricName = 'FCP';
    }

    // Count samples in each category
    let satisfiedCount = 0;
    let toleratingCount = 0;
    let frustratedCount = 0;
    let totalSamples = 0;

    // Calculate from p50, p75, p95 distribution
    if (apdexSource && apdexSource.count) {
        const metricMean = apdexSource.mean || 0;
        const metricMedian = apdexSource.p50 || 0;
        const metricP75 = apdexSource.p75 || 0;
        const metricP95 = apdexSource.p95 || 0;

        // Approximate distribution (this is a simplified model)
        if (metricMedian <= apdexThreshold) satisfiedCount += 50;
        else if (metricMedian <= toleratingThreshold) toleratingCount += 50;
        else frustratedCount += 50;

        if (metricP75 <= apdexThreshold) satisfiedCount += 25;
        else if (metricP75 <= toleratingThreshold) toleratingCount += 25;
        else frustratedCount += 25;

        if (metricP95 <= apdexThreshold) satisfiedCount += 25;
        else if (metricP95 <= toleratingThreshold) toleratingCount += 25;
        else frustratedCount += 25;

        totalSamples = 100;
    }

    // Calculate Apdex score: (Satisfied + (Tolerating / 2)) / Total
    const apdexScore = totalSamples > 0
        ? ((satisfiedCount + (toleratingCount / 2)) / totalSamples).toFixed(3)
        : 'N/A';

    // Determine rating
    let apdexRating = 'poor';
    if (apdexScore !== 'N/A') {
        const score = parseFloat(apdexScore);
        if (score >= 0.94) apdexRating = 'excellent';
        else if (score >= 0.85) apdexRating = 'good';
        else if (score >= 0.7) apdexRating = 'fair';
    }

    // Create Apdex card element
    const apdexCard = document.createElement('div');
    apdexCard.className = `apdex-card ${apdexRating}`;
    apdexCard.innerHTML = `
        <div class="apdex-label">Apdex (${apdexMetricName}) <span class="tooltip" data-tooltip="Application Performance Index (0-1 scale). Measures user satisfaction based on response times. Excellent: >0.94, Good: 0.85-0.94, Fair: 0.7-0.85, Poor: <0.7. Threshold: ${apdexThreshold}ms. Using: ${apdexMetricName}">?</span></div>
        <div class="apdex-score">${apdexScore}</div>
        <div class="apdex-rating">${apdexRating}</div>
    `;

    return apdexCard;
}