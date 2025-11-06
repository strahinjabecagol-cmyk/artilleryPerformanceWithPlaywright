// Sticky Phase Filter Controller - Handles sticky scrolling and detachable mode

let isSticky = false;
let isDetached = false;
let filterElement = null;
let placeholderElement = null;
let toggleButton = null;
let originalOffsetTop = 0;

/**
 * Initialize sticky phase filter behavior
 */
export function initStickyPhaseFilter() {
    filterElement = document.getElementById('phaseFilter');
    placeholderElement = document.getElementById('phaseFilterPlaceholder');
    toggleButton = document.getElementById('phaseFilterToggle');

    if (!filterElement || !placeholderElement || !toggleButton) {
        console.warn('⚠️ Phase filter elements not found');
        return;
    }

    // Store original position
    originalOffsetTop = filterElement.offsetTop;

    // Set placeholder height to match filter
    updatePlaceholderHeight();

    // Add scroll listener for sticky behavior
    window.addEventListener('scroll', handleScroll);

    // Add toggle button click listener
    toggleButton.addEventListener('click', toggleDetachedMode);

    // Add window resize listener to recalculate positions
    window.addEventListener('resize', () => {
        if (!isSticky && !isDetached) {
            originalOffsetTop = filterElement.offsetTop;
            updatePlaceholderHeight();
        }
    });

    // Add keyboard shortcut: Alt+D to toggle detached mode
    window.addEventListener('keydown', handleKeyboardShortcut);

    console.log('✅ Sticky phase filter initialized (Alt+D to toggle detach)');
}

/**
 * Handle scroll events to make filter sticky
 */
function handleScroll() {
    // Don't apply sticky behavior if in detached mode
    if (isDetached) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const threshold = originalOffsetTop - 16; // 16px = 1rem top margin

    if (scrollTop > threshold && !isSticky) {
        // Make filter sticky
        makeSticky();
    } else if (scrollTop <= threshold && isSticky) {
        // Return filter to normal position
        makeNormal();
    }
}

/**
 * Make the filter sticky at the top
 */
function makeSticky() {
    if (!filterElement || !placeholderElement) return;

    isSticky = true;
    filterElement.classList.add('sticky');
    placeholderElement.classList.add('active');
    placeholderElement.style.height = filterElement.offsetHeight + 'px';
    
    console.log('📌 Phase filter is now sticky');
}

/**
 * Return filter to normal position
 */
function makeNormal() {
    if (!filterElement || !placeholderElement) return;

    isSticky = false;
    filterElement.classList.remove('sticky');
    placeholderElement.classList.remove('active');
    placeholderElement.style.height = '0';
    
    console.log('📍 Phase filter returned to normal position');
}

/**
 * Toggle detached (floating) mode
 */
function toggleDetachedMode() {
    if (!filterElement || !toggleButton) return;

    isDetached = !isDetached;

    if (isDetached) {
        // Enter detached mode
        makeNormal(); // First remove sticky if active
        filterElement.classList.add('detached');
        filterElement.classList.remove('sticky');
        toggleButton.querySelector('.label').textContent = 'Undock';
        toggleButton.querySelector('.icon').textContent = '🔓';
        toggleButton.title = 'Return to normal position';
        console.log('🔓 Phase filter detached (floating mode)');
    } else {
        // Exit detached mode
        filterElement.classList.remove('detached');
        toggleButton.querySelector('.label').textContent = 'Dock';
        toggleButton.querySelector('.icon').textContent = '📌';
        toggleButton.title = 'Toggle detachable mode';
        
        // Recalculate original position
        setTimeout(() => {
            originalOffsetTop = filterElement.offsetTop;
            updatePlaceholderHeight();
            handleScroll(); // Recheck if should be sticky
        }, 100);
        
        console.log('📌 Phase filter docked (normal mode)');
    }
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcut(e) {
    // Alt+D to toggle detached mode
    if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleDetachedMode();
    }
}

/**
 * Update placeholder height to match filter
 */
function updatePlaceholderHeight() {
    if (!filterElement || !placeholderElement) return;
    placeholderElement.style.height = filterElement.offsetHeight + 'px';
}

/**
 * Cleanup event listeners
 */
export function destroyStickyPhaseFilter() {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('keydown', handleKeyboardShortcut);
    if (toggleButton) {
        toggleButton.removeEventListener('click', toggleDetachedMode);
    }
    console.log('🗑️ Sticky phase filter destroyed');
}
