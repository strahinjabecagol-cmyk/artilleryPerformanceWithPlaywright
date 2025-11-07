// Phase Markers Chart.js Plugin - Draws vertical lines at phase boundaries

import { getPhaseColor } from '../ui/phase-selector.js';

console.log('📦 Phase markers plugin module loaded');

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
        const periodTimestamps = options.periodTimestamps || [];

        if (periodLabels.length === 0) {
            return;
        }

        ctx.save();

        // Draw phase boundaries and labels
        phases.forEach((phase, index) => {
            const phaseColor = getPhaseColor(phase.index);
            
            // Find the period index closest to phase start
            let startIndex = 0;
            if (periodTimestamps.length > 0) {
                // Find period closest to phase start time
                startIndex = periodTimestamps.findIndex(ts => ts >= phase.startTime);
                if (startIndex === -1) startIndex = periodTimestamps.length - 1;
            } else {
                // Fallback to simple calculation
                const firstPhaseStart = phases[0].startTime;
                const lastPhaseEnd = phases[phases.length - 1].endTime;
                const totalDuration = lastPhaseEnd - firstPhaseStart;
                const phaseProgress = (phase.startTime - firstPhaseStart) / totalDuration;
                startIndex = Math.floor(phaseProgress * (periodLabels.length - 1));
            }
            
            startIndex = Math.max(0, Math.min(startIndex, periodLabels.length - 1));
            
            const label = periodLabels[startIndex];
            const x = scales.x.getPixelForValue(label);

            // Draw vertical line at phase boundary (skip first phase)
            if (index > 0) {
                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = phaseColor;
                ctx.lineWidth = 2;
                ctx.setLineDash([8, 4]);
                ctx.globalAlpha = 0.8;
                ctx.moveTo(x, chartArea.top);
                ctx.lineTo(x, chartArea.bottom);
                ctx.stroke();
                ctx.restore();
            }

            // Find phase end index
            let endIndex = startIndex;
            if (periodTimestamps.length > 0) {
                endIndex = periodTimestamps.findIndex(ts => ts >= phase.endTime);
                if (endIndex === -1) endIndex = periodTimestamps.length - 1;
            } else {
                const firstPhaseStart = phases[0].startTime;
                const lastPhaseEnd = phases[phases.length - 1].endTime;
                const totalDuration = lastPhaseEnd - firstPhaseStart;
                const phaseEndProgress = (phase.endTime - firstPhaseStart) / totalDuration;
                endIndex = Math.floor(phaseEndProgress * (periodLabels.length - 1));
            }
            
            endIndex = Math.max(0, Math.min(endIndex, periodLabels.length - 1));
            const endX = scales.x.getPixelForValue(periodLabels[endIndex]);
            
            const phaseWidth = endX - x;
            const labelX = x + Math.max(5, phaseWidth / 2 - 30); // Center label in phase region
            const labelY = chartArea.top + 15;

            // Draw phase label with background
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'left';
            
            const labelText = phase.name;
            const textMetrics = ctx.measureText(labelText);
            
            // Draw semi-transparent background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(labelX - 4, labelY - 10, textMetrics.width + 8, 15);
            
            // Draw border around label
            ctx.strokeStyle = phaseColor;
            ctx.lineWidth = 1;
            ctx.setLineDash([]);
            ctx.strokeRect(labelX - 4, labelY - 10, textMetrics.width + 8, 15);

            // Draw text
            ctx.fillStyle = phaseColor;
            ctx.fillText(labelText, labelX, labelY);
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
 * @param {Array} periodTimestamps - Array of period timestamps (optional)
 * @returns {Object} Plugin options
 */
export function getPhaseMarkersOptions(phases, periodLabels, periodTimestamps = []) {
    return {
        phases: phases,
        periodLabels: periodLabels,
        periodTimestamps: periodTimestamps
    };
}
