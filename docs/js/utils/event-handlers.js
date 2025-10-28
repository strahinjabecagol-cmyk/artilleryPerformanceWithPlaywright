// Dashboard Event Handlers Module
import {
    openJSONPreview,
    closeJSONPreview,
    openLogPreview,
    closeLogPreview,
    searchJSON,
    searchLog,
    copyJSON,
    copyLog,
    downloadJSON,
    downloadLog,
    exportToPNG
} from './dashboard-utils.js';

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