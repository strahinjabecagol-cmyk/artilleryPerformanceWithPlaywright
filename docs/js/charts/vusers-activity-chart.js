// Virtual Users Activity Chart Module
import { getPhaseMarkersOptions, phaseMarkersPlugin } from '../plugins/phase-markers.js';

export function createVUsersActivityChart(periods, data, phases = null, periodTimestamps = []) {
    const vusersCompleted = data.intermediate.map(i => i.counters?.['vusers.completed'] || 0);

    return new Chart(document.getElementById('rpsChart'), {
        type: 'bar',
        data: {
            labels: periods,
            datasets: [
                {
                    label: 'VUsers Completed',
                    data: vusersCompleted,
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: '#22c55e',
                    borderWidth: 1
                }
            ]
        },
        plugins: [phaseMarkersPlugin], // Explicitly add the plugin
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
                phaseMarkers: phases ? getPhaseMarkersOptions(phases, periods, periodTimestamps) : { phases: [] }
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