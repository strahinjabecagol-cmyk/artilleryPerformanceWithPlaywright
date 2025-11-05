// Throughput Chart Module
import { getPhaseMarkersOptions } from '../plugins/phase-markers.js';

export function createThroughputChart(data, periods, phases = null) {
    // Calculate RPS data
    const rpsData = calculateRPSData(data);
    
    // Find peak RPS for highlighting dips
    const peakRPS = Math.max(...rpsData);
    const rpsColors = rpsData.map(rps => {
        return rps < (peakRPS * 0.5) ? '#f59e0b' : '#3b82f6'; // Orange for dips, blue for normal
    });

    // Create and return the chart
    return new Chart(document.getElementById('throughputChart'), {
        type: 'line',
        data: {
            labels: periods,
            datasets: [
                {
                    label: 'Requests/Second',
                    data: rpsData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: rpsColors,
                    pointBorderColor: rpsColors
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
                phaseMarkers: phases ? getPhaseMarkersOptions(phases, periods) : { phases: [] },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} req/s`;
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
                            return value.toFixed(0) + ' rps';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Requests/Second',
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

function calculateRPSData(data) {
    return data.intermediate.map((item, idx, arr) => {
        const requests = item.counters?.['browser.http_requests'] || 0;
        // Calculate duration of this period in seconds
        const currentPeriod = parseInt(item.period) || 0;
        const prevPeriod = idx > 0 ? parseInt(arr[idx - 1].period) || 0 : currentPeriod - 10000;
        const durationMs = currentPeriod - prevPeriod;
        const durationSeconds = durationMs / 1000 || 10;
        return requests / durationSeconds;
    });
}