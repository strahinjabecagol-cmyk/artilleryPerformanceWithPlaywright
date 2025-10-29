// Log Modal Module

let globalLogData = null;

// Open Log Preview Modal
export async function openLogPreview() {
    const modal = document.getElementById('logModal');
    const content = document.getElementById('logContent');
    const fileSize = document.getElementById('logFileSize');
    const searchInput = document.getElementById('logSearch');

    modal.classList.add('active');
    content.textContent = '⏳ Loading log data...';
    searchInput.value = '';

    try {
        const { BASE_PATH } = await import('../utils/path-config.js');
        const timestamp = new Date().getTime();
        const res = await fetch(`${BASE_PATH}/logs/execution.log?v=${timestamp}`);

        if (!res.ok) {
            content.textContent = '❌ Log file not found. Run a test to generate execution.log';
            fileSize.textContent = 'N/A';
            return;
        }

        const logText = await res.text();

        // Store globally for copy/search
        globalLogData = logText;

        // Calculate file size
        const sizeKB = (new Blob([logText]).size / 1024).toFixed(2);
        fileSize.textContent = `${sizeKB} KB`;

        // Render log
        renderLog(logText);

    } catch (error) {
        console.error('Error loading log:', error);
        content.textContent = '❌ Failed to load log data';
    }
}

// Close Log Preview Modal
export function closeLogPreview() {
    const modal = document.getElementById('logModal');
    modal.classList.remove('active');
}

// Render Log with optional search highlighting
function renderLog(logText, searchTerm = '') {
    const content = document.getElementById('logContent');
    let displayText = logText;

    // Escape HTML
    displayText = displayText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Apply search highlighting if search term exists
    if (searchTerm) {
        const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
        displayText = displayText.replace(regex, '<span class="highlight-match">$1</span>');
    }

    content.innerHTML = displayText;
}

// Search Log
export function searchLog() {
    const searchInput = document.getElementById('logSearch');
    const searchTerm = searchInput.value.trim();

    if (!globalLogData) return;

    if (searchTerm.length === 0) {
        renderLog(globalLogData);
        return;
    }

    renderLog(globalLogData, searchTerm);
}

// Copy Log to Clipboard
export function copyLog() {
    if (!globalLogData) {
        alert('No log data to copy');
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(globalLogData).then(() => {
            showCopySuccess(event);
        }).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopyLog(globalLogData);
        });
    } else {
        fallbackCopyLog(globalLogData);
    }
}

// Download execution.log file
export async function downloadLog() {
    const { BASE_PATH } = await import('../utils/path-config.js');
    fetch(`${BASE_PATH}/logs/execution.log`)
        .then(res => res.blob())
        .then(blob => {
            downloadFile(blob, `artillery-execution-${new Date().toISOString().slice(0, 10)}.log`);
        })
        .catch(err => {
            console.error('Failed to download log:', err);
            alert('Failed to download log file');
        });
}

// Helper Functions
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function fallbackCopyLog(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        alert('Log copied to clipboard!');
    } catch (err) {
        alert('Failed to copy log. Please try manually.');
    }
    document.body.removeChild(textarea);
}

function showCopySuccess(event) {
    const btn = event.target.closest('.json-action-btn');
    if (!btn) return;
    const originalText = btn.innerHTML;
    btn.innerHTML = '✓ Copied!';
    btn.style.background = '#059669';
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
    }, 2000);
}

function downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}