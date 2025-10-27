// Response Time Percentiles Chart Module

export function createPercentilesChart(fcp) {
    return new Chart(document.getElementById('percentilesChart'), {
        type: 'bar',
        data: {
            labels: ['p50', 'p75', 'p90', 'p95', 'p99'],
            datasets: [
                {
                    label: 'FCP Percentiles (ms)',
                    data: [fcp.p50, fcp.p75, fcp.p90, fcp.p95, fcp.p99],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',  // p50 - Green
                        'rgba(59, 130, 246, 0.8)',  // p75 - Blue
                        'rgba(245, 158, 11, 0.8)',  // p90 - Yellow
                        'rgba(249, 115, 22, 0.8)',  // p95 - Orange
                        'rgba(239, 68, 68, 0.8)'    // p99 - Red
                    ],
                    borderColor: [
                        '#10b981',  // p50
                        '#3b82f6',  // p75
                        '#f59e0b',  // p90
                        '#f97316',  // p95
                        '#ef4444'   // p99
                    ],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                legend: { display: false }
            },
            scales: {
                y: {
                    grid: { color: '#334155' },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 10 },
                        padding: 5
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 10 },
                        padding: 5
                    }
                }
            }
        }
    });
}