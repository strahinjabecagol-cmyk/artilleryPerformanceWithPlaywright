// Latency Histogram Chart Module

export function createLatencyHistogramChart(data) {
    // Create 100ms buckets for latency distribution
    const latencyBuckets = {};
    const bucketSize = 100; // 100ms buckets

    // Get aggregate latency metrics
    const aggregateMetrics = data.aggregate?.summaries?.['custom.http_latency'];
    
    if (!aggregateMetrics) {
        console.warn('No latency metrics found in aggregate data');
        return null;
    }

    const totalCount = aggregateMetrics.count || 0;
    
    if (totalCount === 0) {
        console.warn('No latency data available (count is 0)');
        return null;
    }
    
    // Get the actual min and max from the data
    const minLatency = aggregateMetrics.min || 0;
    const maxLatency = aggregateMetrics.max || 0;
    
    // Use percentile-based distribution to approximate histogram
    // This creates a more accurate representation based on actual percentile values
    const percentiles = {
        min: minLatency,
        p50: aggregateMetrics.p50 || aggregateMetrics.median || 0,
        p75: aggregateMetrics.p75 || 0,
        p90: aggregateMetrics.p90 || 0,
        p95: aggregateMetrics.p95 || 0,
        p99: aggregateMetrics.p99 || 0,
        max: maxLatency
    };

    // Define distribution segments based on percentiles
    // Each segment represents the requests between two percentile points
    const distributionSegments = [
        { minValue: percentiles.min, maxValue: percentiles.p50, count: Math.round(totalCount * 0.50) },      // 0-50th percentile = 50%
        { minValue: percentiles.p50, maxValue: percentiles.p75, count: Math.round(totalCount * 0.25) },      // 50-75th percentile = 25%
        { minValue: percentiles.p75, maxValue: percentiles.p90, count: Math.round(totalCount * 0.15) },      // 75-90th percentile = 15%
        { minValue: percentiles.p90, maxValue: percentiles.p95, count: Math.round(totalCount * 0.05) },      // 90-95th percentile = 5%
        { minValue: percentiles.p95, maxValue: percentiles.p99, count: Math.round(totalCount * 0.04) },      // 95-99th percentile = 4%
        { minValue: percentiles.p99, maxValue: percentiles.max, count: Math.round(totalCount * 0.01) },      // 99-100th percentile = 1%
    ];

    // Distribute counts into 100ms buckets
    let distributedCount = 0;
    distributionSegments.forEach(segment => {
        if (segment.count === 0) return;
        
        const startBucket = Math.floor(segment.minValue / bucketSize) * bucketSize;
        const endBucket = Math.floor(segment.maxValue / bucketSize) * bucketSize;
        
        if (startBucket === endBucket) {
            // All values in this segment fall into one bucket
            latencyBuckets[startBucket] = (latencyBuckets[startBucket] || 0) + segment.count;
            distributedCount += segment.count;
        } else {
            // Distribute evenly across buckets in this range
            const bucketsInRange = Math.ceil((endBucket - startBucket) / bucketSize) + 1;
            const countPerBucket = segment.count / bucketsInRange;
            
            for (let bucket = startBucket; bucket <= endBucket; bucket += bucketSize) {
                latencyBuckets[bucket] = (latencyBuckets[bucket] || 0) + countPerBucket;
                distributedCount += countPerBucket;
            }
        }
    });

    // Sort buckets and create labels first
    const sortedBuckets = Object.keys(latencyBuckets).map(Number).sort((a, b) => a - b);
    const bucketLabels = sortedBuckets.map(b => `${b}-${b + bucketSize}ms`);
    let bucketCounts = sortedBuckets.map(b => Math.round(latencyBuckets[b]));
    
    // Adjust for rounding errors to ensure total matches exactly
    let totalBucketSamples = bucketCounts.reduce((sum, count) => sum + count, 0);
    
    if (totalBucketSamples !== totalCount) {
        const difference = totalCount - totalBucketSamples;
        
        // Add/subtract the difference to/from the largest bucket (most likely to absorb rounding error)
        const maxIndex = bucketCounts.indexOf(Math.max(...bucketCounts));
        bucketCounts[maxIndex] += difference;
        
        // Recalculate total
        totalBucketSamples = bucketCounts.reduce((sum, count) => sum + count, 0);
    }

    // Color code based on performance (green → blue → orange → red)
    const bucketColors = sortedBuckets.map(bucket => {
        if (bucket < 500) return 'rgba(16, 185, 129, 0.8)';   // Emerald (super fast 0-500ms)
        if (bucket < 1000) return 'rgba(34, 197, 94, 0.8)';   // Green (fast 500-1000ms)
        if (bucket < 2000) return 'rgba(59, 130, 246, 0.8)';  // Blue (ok 1000-2000ms)
        if (bucket < 3000) return 'rgba(245, 158, 11, 0.8)';  // Orange (moderate 2000-3000ms)
        if (bucket < 5000) return 'rgba(239, 68, 68, 0.8)';   // Red (slow 3000-5000ms)
        return 'rgba(127, 29, 29, 0.8)';                      // Dark red (very slow 5000ms+)
    });

    console.log('Latency Distribution Chart Data:', {
        totalRequests: totalCount,
        actualTotal: totalBucketSamples,
        minLatency: minLatency,
        maxLatency: maxLatency,
        percentiles: percentiles,
        buckets: sortedBuckets.length,
        distribution: sortedBuckets.map((bucket, i) => ({ bucket: bucketLabels[i], count: bucketCounts[i] }))
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
                            const percentage = ((count / totalCount) * 100).toFixed(1);
                            return [
                                `Count: ${count}`,
                                `Percentage: ${percentage}%`,
                                `Total Requests: ${totalCount}`
                            ];
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