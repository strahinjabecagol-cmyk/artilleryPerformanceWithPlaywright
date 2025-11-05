// Phase Selector UI Component - Dynamic phase filter chip generator

// Color palette for phases (cycles for 8+ phases)
const COLOR_PALETTE = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Orange
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f43f5e', // Red
    '#06b6d4'  // Cyan
];

// Store current selection state
let selectedPhaseIds = ['all'];
let onFilterChangeCallback = null;

/**
 * Get color for a phase based on its index
 * @param {number} phaseIndex - Index of the phase
 * @returns {string} Hex color code
 */
export function getPhaseColor(phaseIndex) {
    return COLOR_PALETTE[phaseIndex % COLOR_PALETTE.length];
}

/**
 * Render phase filter UI with dynamic chips
 * @param {Array} phases - Array of detected phases
 * @param {Function} onFilterChange - Callback when filter changes
 */
export function renderPhaseFilter(phases, onFilterChange) {
    const container = document.getElementById('phaseChipsContainer');
    
    if (!container) {
        console.error('❌ Phase chips container not found');
        return;
    }

    // Store callback for later use
    onFilterChangeCallback = onFilterChange;

    // Clear existing chips
    container.innerHTML = '';

    // Reset selection to "all" by default
    selectedPhaseIds = ['all'];

    // Add "All Phases" chip (always present)
    const allChip = createPhaseChip('all', 'All Phases', true, '#475569', 'Show all test phases');
    container.appendChild(allChip);

    // Dynamically generate chip for each detected phase
    phases.forEach((phase, index) => {
        const label = `${phase.name} (${phase.durationSec}s)`;
        const tooltip = `Duration: ${phase.durationSec}s | Start: ${new Date(phase.startTime).toLocaleTimeString()}`;
        const chip = createPhaseChip(
            `phase-${index}`,
            label,
            false,
            getPhaseColor(index),
            tooltip
        );
        chip.dataset.phaseIndex = index;
        container.appendChild(chip);
    });

    console.log(`✅ Rendered ${phases.length} phase filter chips`);
}

/**
 * Create a single phase chip button
 * @param {string} id - Unique ID for the chip
 * @param {string} label - Display label
 * @param {boolean} active - Whether chip is active
 * @param {string} color - Color for the chip
 * @param {string} tooltip - Tooltip text
 * @returns {HTMLElement} The chip element
 */
function createPhaseChip(id, label, active, color, tooltip) {
    const chip = document.createElement('button');
    chip.className = 'phase-chip' + (active ? ' active' : '');
    chip.dataset.phaseId = id;
    chip.textContent = label;
    chip.title = tooltip || label;
    
    // Set CSS custom property for dynamic color
    chip.style.setProperty('--phase-color', color);
    
    // Add click handler
    chip.addEventListener('click', (e) => {
        e.preventDefault();
        togglePhase(id);
    });
    
    return chip;
}

/**
 * Toggle phase selection
 * @param {string} phaseId - ID of the phase to toggle
 */
function togglePhase(phaseId) {
    const chip = document.querySelector(`[data-phase-id="${phaseId}"]`);
    
    if (!chip) return;

    if (phaseId === 'all') {
        // If "All" is clicked, deselect everything else and select "All"
        selectedPhaseIds = ['all'];
        document.querySelectorAll('.phase-chip').forEach(c => {
            c.classList.remove('active');
        });
        chip.classList.add('active');
    } else {
        // If a specific phase is clicked
        const allChip = document.querySelector('[data-phase-id="all"]');
        
        if (selectedPhaseIds.includes('all')) {
            // Deselect "All" and select this phase
            selectedPhaseIds = [phaseId];
            allChip.classList.remove('active');
            chip.classList.add('active');
        } else if (selectedPhaseIds.includes(phaseId)) {
            // Deselect this phase
            selectedPhaseIds = selectedPhaseIds.filter(id => id !== phaseId);
            chip.classList.remove('active');
            
            // If no phases selected, revert to "All"
            if (selectedPhaseIds.length === 0) {
                selectedPhaseIds = ['all'];
                allChip.classList.add('active');
            }
        } else {
            // Add this phase to selection
            selectedPhaseIds.push(phaseId);
            chip.classList.add('active');
        }
    }

    // Trigger filter change callback
    if (onFilterChangeCallback) {
        onFilterChangeCallback(selectedPhaseIds);
    }

    console.log('🔄 Phase filter changed:', selectedPhaseIds);
}

/**
 * Get current selected phase IDs
 * @returns {Array} Array of selected phase IDs
 */
export function getSelectedPhaseIds() {
    return [...selectedPhaseIds];
}

/**
 * Set selected phases programmatically
 * @param {Array} phaseIds - Array of phase IDs to select
 */
export function setSelectedPhases(phaseIds) {
    selectedPhaseIds = [...phaseIds];
    
    // Update UI
    document.querySelectorAll('.phase-chip').forEach(chip => {
        const chipId = chip.dataset.phaseId;
        if (selectedPhaseIds.includes(chipId)) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });

    // Trigger callback
    if (onFilterChangeCallback) {
        onFilterChangeCallback(selectedPhaseIds);
    }
}

/**
 * Show/hide phase filter based on number of phases
 * @param {number} phaseCount - Number of detected phases
 */
export function updatePhaseFilterVisibility(phaseCount) {
    const filterContainer = document.querySelector('.phase-filter');
    
    if (!filterContainer) return;

    // Always show filter (even with 1 phase for consistency)
    filterContainer.style.display = 'flex';
    
    // Adjust layout for many phases
    const chipsContainer = document.getElementById('phaseChipsContainer');
    if (chipsContainer) {
        if (phaseCount > 8) {
            chipsContainer.classList.add('many-phases');
        } else {
            chipsContainer.classList.remove('many-phases');
        }
    }
}
