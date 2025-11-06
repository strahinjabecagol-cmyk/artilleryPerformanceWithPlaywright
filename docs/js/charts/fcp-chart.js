// First Contentful Paint Chart Module
import { getPhaseMarkersOptions } from '../plugins/phase-markers.js';

export function createFCPChart(periods, data, fcpKey, phases = null) {
    // Get FCP data based on intermediate data availability
    const hasFCPInIntermediate = data.intermediate.some(i => i.summaries?.[fcpKey]?.mean);
    const fcpData = hasFCPInIntermediate
        ? data.intermediate.map(i => i.summaries?.[fcpKey]?.mean || 0)
        : data.intermediate.map(() => data.aggregate?.summaries?.[fcpKey]?.mean || 0);

    return new Chart(document.getElementById('latencyChart'), {
        type: 'line',
        data: {
            labels: periods,
            datasets: [
                {
                    label: 'FCP Mean (ms)',
                    data: fcpData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 1.5,
                    pointRadius: 2.5,
                    pointHoverRadius: 5,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#3b82f6',
                    pointBorderWidth: 0
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