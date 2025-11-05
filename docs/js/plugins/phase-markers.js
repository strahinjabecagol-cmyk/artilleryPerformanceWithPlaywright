// Phase Markers Chart.js Plugin - Draws vertical lines at phase boundaries

import { getPhaseColor } from '../ui/phase-selector.js';

/**
 * Chart.js plugin to draw phase boundary markers on time-series charts
 */
export const phaseMarkersPlugin = {
    id: 'phaseMarkers',
    
    afterDatasetsDraw(chart, args, options) {
        if (!options.phases || options.phases.length === 0) {
            return; // No phases to display
        }

        const { ctx, chartArea, scales } = chart;
        
        if (!chartArea || !scales.x) {
            return;
        }

        const phases = options.phases;
        const periodLabels = options.periodLabels || [];

        ctx.save();

        // Draw vertical lines at phase boundaries and labels for all phases
        phases.forEach((phase, index) => {
            // Use the phase's original index for consistent color matching with chips
            const phaseIndex = phase.index;
            const phaseColor = getPhaseColor(phaseIndex);
            
            // Find the period label index closest to this phase start time
            const phaseStartLabel = new Date(phase.startTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            // Find closest matching label
            let labelIndex = periodLabels.findIndex(label => label === phaseStartLabel);
            
            // If exact match not found, find closest by time
            if (labelIndex === -1 && periodLabels.length > 0) {
                // Estimate position based on timestamp
                const totalDuration = phases[phases.length - 1].endTime - phases[0].startTime;
                const phaseOffset = phase.startTime - phases[0].startTime;
                const estimatedIndex = Math.floor((phaseOffset / totalDuration) * periodLabels.length);
                labelIndex = Math.max(0, Math.min(estimatedIndex, periodLabels.length - 1));
            }

            if (labelIndex >= 0 && labelIndex < periodLabels.length) {
                const label = periodLabels[labelIndex];
                const x = scales.x.getPixelForValue(label);

                // Draw dashed vertical line at boundary (skip for first phase, single phase, or non-contiguous)
                // Only draw lines between consecutive phases
                if (index > 0 && phases.length > 1) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.strokeStyle = phaseColor;
                    ctx.lineWidth = 3;
                    ctx.setLineDash([8, 4]);
                    ctx.globalAlpha = 0.8;
                    ctx.moveTo(x, chartArea.top);
                    ctx.lineTo(x, chartArea.bottom);
                    ctx.stroke();
                    ctx.restore();
                }

                // Draw phase label for ALL phases (always show labels)
                ctx.fillStyle = phaseColor;
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'left';
                
                // Position label slightly to the right of the line
                const labelText = phase.name;
                const labelX = x + 5;
                const labelY = chartArea.top + 15;

                // Draw background for better readability
                const textMetrics = ctx.measureText(labelText);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(labelX - 2, labelY - 10, textMetrics.width + 4, 14);

                // Draw text
                ctx.fillStyle = phaseColor;
                ctx.fillText(labelText, labelX, labelY);
            }
        });

        ctx.restore();
    }
};

/**
 * Register the plugin globally with Chart.js
 */
export function registerPhaseMarkersPlugin() {
    if (typeof Chart !== 'undefined') {
        Chart.register(phaseMarkersPlugin);
        console.log('✅ Phase markers plugin registered');
    } else {
        console.warn('⚠️ Chart.js not found, phase markers plugin not registered');
    }
}

/**
 * Get plugin options for a chart
 * @param {Array} phases - Detected phases
 * @param {Array} periodLabels - Array of period label strings
 * @returns {Object} Plugin options
 */
export function getPhaseMarkersOptions(phases, periodLabels) {
    return {
        phases: phases,
        periodLabels: periodLabels
    };
}
