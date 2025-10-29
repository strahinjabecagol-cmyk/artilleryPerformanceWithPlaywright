// HTTP Status Codes Chart Module

export function createStatusCodesChart(counters) {
    return new Chart(document.getElementById('statusCodesChart'), {
        type: 'doughnut',
        data: {
            labels: ['200 OK', '204 No Content', '500 Error'],
            datasets: [{
                data: [
                    counters['browser.page.codes.200'] || 0,
                    counters['browser.page.codes.204'] || 0,
                    counters['browser.page.codes.500'] || 0
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: ['#22c55e', '#3b82f6', '#ef4444'],
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
                        font: { size: 11 },
                        padding: 10,
                        boxWidth: 12,
                        boxHeight: 12
                    }
                }
            }
        }
    });
}