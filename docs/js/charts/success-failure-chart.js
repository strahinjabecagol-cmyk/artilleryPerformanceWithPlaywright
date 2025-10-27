// Success vs Failure Rate Chart Module

export function createSuccessFailureChart(counters) {
    const completedCount = counters['vusers.completed'] || 0;
    const failedCount = counters['vusers.failed'] || 0;
    const totalVUsers = completedCount + failedCount;

    return new Chart(document.getElementById('successChart'), {
        type: 'pie',
        data: {
            labels: ['Completed Successfully', 'Failed'],
            datasets: [{
                data: [completedCount, failedCount],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',  // Green for success
                    'rgba(239, 68, 68, 0.8)'   // Red for failure
                ],
                borderColor: ['#22c55e', '#ef4444'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 10,
                    bottom: 35, // ⛔ DON'T REDUCE - Needed for legend space!
                    left: 10,
                    right: 10
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: { size: 12 },
                        padding: 15,
                        boxWidth: 15,
                        boxHeight: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.parsed;
                            const percentage = totalVUsers > 0 ? ((value / totalVUsers) * 100).toFixed(1) : 0;
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}