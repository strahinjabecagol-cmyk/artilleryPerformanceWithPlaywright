// Chart Maximize/Fullscreen Module

let currentChartInstance = null;
let originalCanvas = null;

/**
 * Initialize maximize buttons for all charts
 */
export function initChartMaximize() {
    const chartWrappers = document.querySelectorAll('.chart-wrapper');
    
    chartWrappers.forEach(wrapper => {
        // Add maximize button if it doesn't exist
        if (!wrapper.querySelector('.chart-maximize-btn')) {
            const maximizeBtn = document.createElement('button');
            maximizeBtn.className = 'chart-maximize-btn';
            maximizeBtn.innerHTML = '<span>⛶</span><span>Maximize</span>';
            maximizeBtn.title = 'View in fullscreen';
            
            const canvas = wrapper.querySelector('canvas');
            if (canvas) {
                maximizeBtn.addEventListener('click', () => {
                    maximizeChart(wrapper, canvas);
                });
                wrapper.appendChild(maximizeBtn);
            }
        }
    });

    // Setup close button
    const closeBtn = document.getElementById('chartFullscreenClose');
    const modal = document.getElementById('chartFullscreenModal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeFullscreen);
    }

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            closeFullscreen();
        }
    });

    // Close on backdrop click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeFullscreen();
            }
        });
    }

    console.log('✅ Chart maximize feature initialized');
}

/**
 * Maximize a chart to fullscreen
 * @param {HTMLElement} wrapper - The chart wrapper element
 * @param {HTMLCanvasElement} originalCanvasElement - The original canvas element
 */
function maximizeChart(wrapper, originalCanvasElement) {
    const modal = document.getElementById('chartFullscreenModal');
    const fullscreenCanvas = document.getElementById('chartFullscreenCanvas');
    const titleElement = document.getElementById('chartFullscreenTitle');
    
    if (!modal || !fullscreenCanvas) {
        console.error('❌ Fullscreen modal elements not found');
        return;
    }

    // Store reference to original canvas
    originalCanvas = originalCanvasElement;

    // Get the Chart.js instance from the original canvas
    const chartInstance = Chart.getChart(originalCanvasElement);
    
    if (!chartInstance) {
        console.error('❌ No Chart.js instance found on canvas');
        return;
    }

    // Get chart title from wrapper
    const chartTitle = wrapper.querySelector('h2')?.textContent || 'Chart View';
    titleElement.textContent = chartTitle;

    // Clone the chart configuration
    const chartConfig = {
        type: chartInstance.config.type,
        data: JSON.parse(JSON.stringify(chartInstance.config.data)),
        options: JSON.parse(JSON.stringify(chartInstance.config.options))
    };

    // Adjust options for fullscreen
    chartConfig.options.maintainAspectRatio = false;
    chartConfig.options.responsive = true;

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Small delay to ensure canvas is rendered
    setTimeout(() => {
        // Create new chart instance in fullscreen
        currentChartInstance = new Chart(fullscreenCanvas, chartConfig);
    }, 50);

    console.log('📊 Chart maximized:', chartTitle);
}

/**
 * Close fullscreen chart view
 */
function closeFullscreen() {
    const modal = document.getElementById('chartFullscreenModal');
    
    if (!modal) return;

    // Destroy fullscreen chart instance
    if (currentChartInstance) {
        currentChartInstance.destroy();
        currentChartInstance = null;
    }

    // Hide modal
    modal.classList.remove('active');
    document.body.style.overflow = '';

    console.log('✕ Fullscreen chart closed');
}

/**
 * Re-initialize maximize buttons after dashboard refresh
 */
export function refreshMaximizeButtons() {
    // Remove old buttons
    document.querySelectorAll('.chart-maximize-btn').forEach(btn => btn.remove());
    
    // Re-initialize
    initChartMaximize();
}
