// Concurrent Users Over Time Chart Module

export function createConcurrentUsersChart(periods, data) {
    // Calculate concurrent users: Created - (Completed + Failed)
    const concurrencyData = [];
    let totalCreated = 0, totalCompleted = 0, totalFailed = 0;

    data.intermediate.forEach(snap => {
        totalCreated += snap.counters['vusers.created'] || 0;
        totalCompleted += snap.counters['vusers.completed'] || 0;
        totalFailed += snap.counters['vusers.failed'] || 0;

        concurrencyData.push(totalCreated - (totalCompleted + totalFailed));
    });

    // Find peak concurrency for highlighting
    const peakConcurrency = Math.max(...concurrencyData);

    return new Chart(document.getElementById('concurrentUsersChart'), {
        type: 'line',
        data: {
            labels: periods,
            datasets: [
                {
                    label: 'Concurrent Users',
                    data: concurrencyData,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0)',
                    fill: false,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#06b6d4',
                    pointBorderColor: '#06b6d4'
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
                legend: {
                    display: true,
                    labels: { color: '#94a3b8', font: { size: 11 } }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.parsed.y} users`;
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
                    beginAtZero: true,
                    grid: { color: '#334155' },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 10 },
                        padding: 5,
                        callback: function (value) {
                            return Math.round(value) + ' users';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Active Users',
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
                        maxRotation: 0,
                        autoSkip: true
                    }
                }
            }
        }
    });
}