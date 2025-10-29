// Scenario Step Breakdown Chart Module

export function createStepBreakdownChart(summaries) {
    // Find all step summaries (browser.step.*)
    const stepSummaries = {};
    Object.keys(summaries).forEach(key => {
        const match = key.match(/browser\.step\.(.+)$/);
        if (match) {
            const stepName = match[1];
            stepSummaries[stepName] = summaries[key];
        }
    });

    // Extract step names and average durations
    const stepNames = Object.keys(stepSummaries);
    const stepDurations = stepNames.map(name => stepSummaries[name].mean || 0);

    // Find slowest step for highlighting
    const maxDuration = Math.max(...stepDurations);
    const stepColors = stepDurations.map(duration =>
        duration === maxDuration && duration > 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)'
    );

    return new Chart(document.getElementById('stepBreakdown'), {
        type: 'bar',
        data: {
            labels: stepNames.length > 0 ? stepNames : ['No Steps Found'],
            datasets: [{
                label: 'Average Duration (ms)',
                data: stepDurations.length > 0 ? stepDurations : [0],
                backgroundColor: stepColors.length > 0 ? stepColors : ['rgba(100, 100, 100, 0.5)'],
                borderColor: stepColors.length > 0 ? stepColors.map(c => c.replace('0.8', '1')) : ['#646464'],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal bar chart
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { top: 10, bottom: 10, left: 5, right: 5 }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `Duration: ${context.parsed.x.toFixed(2)} ms`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8', font: { size: 10 }, padding: 5 },
                    title: {
                        display: true,
                        text: 'Average Duration (ms)',
                        color: '#94a3b8',
                        font: { size: 11 }
                    }
                },
                y: {
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8', font: { size: 10 }, padding: 5 }
                }
            }
        }
    });
}