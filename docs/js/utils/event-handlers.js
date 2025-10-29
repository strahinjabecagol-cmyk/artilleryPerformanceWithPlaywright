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