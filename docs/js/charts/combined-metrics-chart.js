// Combined Performance Metrics Chart Module

export function createCombinedMetricsChart(data, periods, fcpKey) {
    // Check if intermediate data has FCP metrics
    const hasFCPInIntermediate = data.intermediate.some(i => i.summaries?.[fcpKey]?.mean);

    // Calculate RPS from HTTP requests
    const combinedRpsData = data.intermediate.map((item, idx, arr) => {
        const requests = item.counters?.['browser.http_requests'] || 0;
        const currentPeriod = parseInt(item.period) || 0;
        const prevPeriod = idx > 0 ? parseInt(arr[idx - 1].period) || 0 : currentPeriod - 10000;
        const durationMs = currentPeriod - prevPeriod;
        const durationSeconds = durationMs / 1000 || 10;
        return requests / durationSeconds;
    });

    // Get Response Time data (try multiple keys)
    const responseTimeKey = Object.keys(data.intermediate[0]?.summaries || {}).find(k =>
        k.includes('http.response_time') || k.includes('response_time')
    );
    const responseTimeData = responseTimeKey
        ? data.intermediate.map(i => i.summaries?.[responseTimeKey]?.mean || 0)
        : data.intermediate.map(() => 0);

    // Get FCP data
    const combinedFcpData = hasFCPInIntermediate
        ? data.intermediate.map(i => i.summaries?.[fcpKey]?.mean || 0)
        : data.intermediate.map(() => data.aggregate?.summaries?.[fcpKey]?.mean || 0);

    // Create combined chart with dual Y-axes
    return new Chart(document.getElementById('combinedMetricsChart'), {
        type: 'line',
        data: {
            labels: periods,
            datasets: [
                {
                    label: 'RPS (Requests/Second)',
                    data: combinedRpsData,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: false,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    yAxisID: 'y'
                },
                {
                    label: 'Response Time (ms)',
                    data: responseTimeData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: false,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    yAxisID: 'y1'
                },
                {
                    label: 'FCP (ms)',
                    data: combinedFcpData,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    fill: false,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            layout: {
                padding: {
                    top: 10,
                    bottom: 10,
                    left: 5,
                    right: 5
                }
            },
            plugins: {
                title: { display: false },
                legend: {
                    display: true,
                    labels: { color: '#94a3b8', font: { size: 11 }, padding: 10 }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(2);
                            }
                            return label;
                        }
                    }
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',
                    },
                    pan: {
                        enabled: true,
                        mode: 'x',
                    },
                    limits: {
                        x: { min: 'original', max: 'original' },
                        y: { min: 'original', max: 'original' }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    grid: { color: '#334155' },
                    ticks: {
                        color: '#8b5cf6',
                        font: { size: 10 },
                        padding: 5,
                        callback: function (value) {
                            return value.toFixed(0) + ' rps';
                        }
                    },
                    title: {
                        display: true,
                        text: 'RPS',
                        color: '#8b5cf6',
                        font: { size: 11 }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        color: '#f59e0b',
                        font: { size: 10 },
                        padding: 5,
                        callback: function (value) {
                            return value.toFixed(0) + ' ms';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Latency (ms)',
                        color: '#f59e0b',
                        font: { size: 11 }
                    }
                },
                x: {
                    grid: { color: '#334155' },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 10 },
                        padding: 5,
                        maxRotation: 0,
                        autoSkip: true
                    }
                }
            }
        }
    });
}