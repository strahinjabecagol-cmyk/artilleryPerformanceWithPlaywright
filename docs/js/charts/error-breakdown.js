// HTTP Error Breakdown Chart Module

export function createErrorBreakdownChart(counters) {
    // Count 4xx and 5xx errors from counters
    let errors4xx = 0;
    let errors5xx = 0;

    Object.keys(counters).forEach(key => {
        if (key.includes('.codes.4') || key.match(/\.codes\.(400|401|403|404|429)/)) {
            errors4xx += counters[key] || 0;
        }
        if (key.includes('.codes.5') || key.match(/\.codes\.(500|502|503|504)/)) {
            errors5xx += counters[key] || 0;
        }
    });

    const totalErrors = errors4xx + errors5xx;

    return new Chart(document.getElementById('errorBreakdown'), {
        type: 'doughnut',
        data: {
            labels: ['4xx Client Errors', '5xx Server Errors', 'No Errors'],
            datasets: [{
                data: [
                    errors4xx,
                    errors5xx,
                    totalErrors === 0 ? 1 : 0 // Show "No Errors" if no errors
                ],
                backgroundColor: [
                    'rgba(245, 158, 11, 0.8)', // Orange for 4xx
                    'rgba(239, 68, 68, 0.8)',  // Red for 5xx
                    'rgba(34, 197, 94, 0.8)'   // Green for no errors
                ],
                borderColor: ['#f59e0b', '#ef4444', '#22c55e'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { top: 10, bottom: 35, left: 10, right: 10 }
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
                            const total = errors4xx + errors5xx || 1;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return [`${context.label}: ${value}`, `Percentage: ${percentage}%`];
                        }
                    }
                }
            }
        }
    });
}