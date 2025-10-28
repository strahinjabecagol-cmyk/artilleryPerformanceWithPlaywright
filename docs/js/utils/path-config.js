// Path Configuration Module

function getBasePath() {
    const pathname = window.location.pathname;
    // If running from GitHub Pages project repo, pathname will include /artilleryPerformanceWithPlaywright/
    if (pathname.includes('/artilleryPerformanceWithPlaywright/')) {
        return '/artilleryPerformanceWithPlaywright';
    }
    // Local development: docs folder is served at /docs/
    if (pathname.includes('/docs/')) {
        return '/docs';
    }
    // User pages or root
    return '';
}

export const BASE_PATH = getBasePath();