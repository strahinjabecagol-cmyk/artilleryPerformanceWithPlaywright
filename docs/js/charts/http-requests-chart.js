// HTTP Requests Chart Module

export function createHTTPRequestsChart(periods, data) {
    const httpRequestsData = data.intermediate.map(i => i.counters?.['browser.http_requests'] || 0);

    return new Chart(document.getElementById('httpRequestsChart'), {
        type: 'bar',
        data: {
            labels: periods,
            datasets: [
                {
                    label: 'HTTP Requests',
                    data: httpRequestsData,
                    backgroundColor: 'rgba(139, 92, 246, 0.8)',
                    borderColor: '#8b5cf6',
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
                legend: {
                    display: true,
                    labels: { color: '#94a3b8', font: { size: 11 } }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#334155' },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 10 },
                        padding: 5
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