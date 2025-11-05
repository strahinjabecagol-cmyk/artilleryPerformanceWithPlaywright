// Dashboard Event Handlers Module
import {
    openJSONPreview,
    closeJSONPreview,
    searchJSON,
    copyJSON,
    downloadJSON
} from '../modals/json-modal.js';
import {
    openLogPreview,
    closeLogPreview,
    searchLog,
    copyLog,
    downloadLog
} from '../modals/log-modal.js';
import { exportToPNG } from './png-export.js';

export function initializeEventListeners() {
    // Button click handlers
    document.getElementById('previewJsonBtn').addEventListener('click', openJSONPreview);
    document.getElementById('previewLogBtn').addEventListener('click', openLogPreview);
    document.getElementById('exportPngBtn').addEventListener('click', exportToPNG);
    document.getElementById('downloadJsonBtn').addEventListener('click', downloadJSON);

    // Modal close handlers
    document.querySelectorAll('.json-modal .close').forEach(button => {
        button.addEventListener('click', () => {
            closeJSONPreview();
            closeLogPreview();
        });
    });

    // Search handlers
    document.getElementById('jsonSearch')?.addEventListener('keyup', searchJSON);
    document.getElementById('logSearch')?.addEventListener('keyup', searchLog);

    // Copy/Download handlers
    document.querySelector('.json-modal .copy')?.addEventListener('click', copyJSON);
    document.querySelector('.log-modal .copy')?.addEventListener('click', copyLog);

    // ESC key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeJSONPreview();
            closeLogPreview();
        }
    });
}

/**
 * Show no data message (placeholder for future implementation)
 */
export function showNoDataMessage() {
    console.error('❌ No data available or failed to load');
    // Could add UI notification here in the future
    const container = document.querySelector('.container');
    if (container) {
        const message = document.createElement('div');
        message.className = 'no-data-message';
        message.style.cssText = 'padding: 2rem; text-align: center; color: #f87171; background: #1e293b; border-radius: 8px; margin: 2rem 0;';
        message.innerHTML = '<h2>⚠️ Unable to Load Dashboard Data</h2><p>Please check that results.json exists and contains valid data.</p>';
        container.prepend(message);
    }
}