// Latency Histogram Chart Module

export function createLatencyHistogramChart(data) {
    // Create 100ms buckets for latency distribution
    const latencyBuckets = {};
    const bucketSize = 100; // 100ms buckets

    // Try to find custom.http_latency metric first (preferred for HTTP latency)
    // Fall back to custom.page_load_time or FCP if not available
    const latencyKey = Object.keys(data.intermediate[0]?.summaries || {}).find(k =>
        k.includes('custom.http_latency') || k.includes('custom.page_load_time') || k.includes('FCP')
    );

    // Get all latency values from intermediate data
    data.intermediate.forEach(item => {
        const latencyValue = item.summaries?.[latencyKey]?.mean;
        if (latencyValue) {
            const bucket = Math.floor(latencyValue / bucketSize) * bucketSize;
            latencyBuckets[bucket] = (latencyBuckets[bucket] || 0) + 1;
        }
    });

    // Sort buckets and create labels
    const sortedBuckets = Object.keys(latencyBuckets).map(Number).sort((a, b) => a - b);
    const bucketLabels = sortedBuckets.map(b => `${b}-${b + bucketSize}ms`);
    const bucketCounts = sortedBuckets.map(b => latencyBuckets[b]);
    const totalBucketSamples = bucketCounts.reduce((sum, count) => sum + count, 0);

    // Color code based on performance (green → orange → red)
    const bucketColors = sortedBuckets.map(bucket => {
        if (bucket < 1000) return 'rgba(34, 197, 94, 0.8)'; // Green (fast)
        if (bucket < 2000) return 'rgba(59, 130, 246, 0.8)'; // Blue (ok)
        if (bucket < 3000) return 'rgba(245, 158, 11, 0.8)'; // Orange (moderate)
        return 'rgba(239, 68, 68, 0.8)'; // Red (slow)
    });

    return new Chart(document.getElementById('latencyHistogram'), {
        type: 'bar',
        data: {
            labels: bucketLabels,
            datasets: [{
                label: 'Request Count',
                data: bucketCounts,
                backgroundColor: bucketColors,
                borderColor: bucketColors.map(c => c.replace('0.8', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { top: 10, bottom: 10, left: 5, right: 5 }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const count = context.parsed.y;
                            const percentage = ((count / totalBucketSamples) * 100).toFixed(1);
                            return [`Count: ${count}`, `Percentage: ${percentage}%`];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8', font: { size: 10 }, padding: 5 },
                    title: {
                        display: true,
                        text: 'Number of Requests',
                        color: '#94a3b8',
                        font: { size: 11 }
                    }
                },
                x: {
                    grid: { color: '#334155' },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 10 },
                        padding: 5,
                        maxRotation: 45,
                        minRotation: 45
                    },
                    title: {
                        display: true,
                        text: 'Response Time (ms)',
                        color: '#94a3b8',
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}