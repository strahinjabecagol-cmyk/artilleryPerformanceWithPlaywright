// Dashboard Utilities Module
import { BASE_PATH } from './path-config.js';

// Store the original JSON data globally for preview
let globalJSONData = null;
let globalLogData = null;

// Open JSON Preview Modal
export async function openJSONPreview() {
    const modal = document.getElementById('jsonModal');
    const content = document.getElementById('jsonContent');
    const fileSize = document.getElementById('jsonFileSize');
    const searchInput = document.getElementById('jsonSearch');

    modal.classList.add('active');
    content.innerHTML = '<div style="text-align:center;color:#94a3b8;">⏳ Loading JSON data...</div>';
    searchInput.value = '';

    try {
        const timestamp = new Date().getTime();
        const res = await fetch(`${BASE_PATH}/results/results.json?v=${timestamp}`);
        const jsonText = await res.text();
        const jsonData = JSON.parse(jsonText);

        // Store globally for copy/search
        globalJSONData = jsonData;

        // Calculate file size
        const sizeKB = (new Blob([jsonText]).size / 1024).toFixed(2);
        fileSize.textContent = `${sizeKB} KB`;

        // Render with syntax highlighting
        renderJSON(jsonData);

    } catch (error) {
        console.error('Error loading JSON:', error);
        content.innerHTML = '<div style="color:#ef4444;">❌ Failed to load JSON data</div>';
    }
}

// Close JSON Preview Modal
export function closeJSONPreview() {
    const modal = document.getElementById('jsonModal');
    modal.classList.remove('active');
}

// Render JSON with Syntax Highlighting
function renderJSON(data, searchTerm = '') {
    const content = document.getElementById('jsonContent');
    let jsonString = JSON.stringify(data, null, 2);

    // Apply syntax highlighting
    jsonString = syntaxHighlight(jsonString);

    // Apply search highlighting if search term exists
    if (searchTerm) {
        const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
        jsonString = jsonString.replace(regex, '<span class="highlight-match">$1</span>');
    }

    content.innerHTML = jsonString;
}

// Syntax Highlight Function
function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'json-number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'json-key';
            } else {
                cls = 'json-string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
        } else if (/null/.test(match)) {
            cls = 'json-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// Search JSON
export function searchJSON() {
    const searchInput = document.getElementById('jsonSearch');
    const searchTerm = searchInput.value.trim();

    if (!globalJSONData) return;

    if (searchTerm.length === 0) {
        renderJSON(globalJSONData);
        return;
    }

    // Filter JSON based on search term
    const filtered = filterJSON(globalJSONData, searchTerm);
    renderJSON(filtered, searchTerm);
}

// Filter JSON recursively
function filterJSON(obj, searchTerm) {
    const term = searchTerm.toLowerCase();

    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        const filtered = obj.map(item => filterJSON(item, searchTerm)).filter(item => item !== null);
        return filtered.length > 0 ? filtered : null;
    }

    const result = {};
    let hasMatch = false;

    for (const [key, value] of Object.entries(obj)) {
        if (key.toLowerCase().includes(term)) {
            result[key] = value;
            hasMatch = true;
        }
        else if (typeof value === 'string' && value.toLowerCase().includes(term)) {
            result[key] = value;
            hasMatch = true;
        }
        else if (typeof value === 'number' && value.toString().includes(term)) {
            result[key] = value;
            hasMatch = true;
        }
        else if (typeof value === 'object') {
            const filteredValue = filterJSON(value, searchTerm);
            if (filteredValue !== null && Object.keys(filteredValue).length > 0) {
                result[key] = filteredValue;
                hasMatch = true;
            }
        }
    }

    return hasMatch ? result : null;
}

// Copy JSON to Clipboard
export function copyJSON() {
    if (!globalJSONData) {
        alert('No JSON data loaded');
        return;
    }

    const jsonText = JSON.stringify(globalJSONData, null, 2);
    copyToClipboard(jsonText, event);
}

// Download JSON
export function downloadJSON() {
    fetch(`${BASE_PATH}/results/results.json`)
        .then(res => res.blob())
        .then(blob => {
            downloadFile(blob, `artillery-results-${new Date().toISOString().slice(0, 10)}.json`);
        })
        .catch(err => {
            console.error('Error downloading JSON:', err);
            alert('Failed to download JSON file');
        });
}

// Log Preview Functions
export async function openLogPreview() {
    const modal = document.getElementById('logModal');
    const content = document.getElementById('logContent');
    const fileSize = document.getElementById('logFileSize');
    const searchInput = document.getElementById('logSearch');

    modal.classList.add('active');
    content.textContent = '⏳ Loading log data...';
    searchInput.value = '';

    try {
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

export function closeLogPreview() {
    const modal = document.getElementById('logModal');
    modal.classList.remove('active');
}

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

export function copyLog() {
    if (!globalLogData) {
        alert('No log data to copy');
        return;
    }

    copyToClipboard(globalLogData, event);
}

export function downloadLog() {
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

// Export dashboard as PNG
export function exportToPNG() {
    // Check if html2canvas is available
    if (typeof html2canvas === 'undefined') {
        // Load html2canvas dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
        script.onload = function () {
            captureAndDownload();
        };
        script.onerror = function () {
            alert('Failed to load screenshot library. Please check your internet connection.');
        };
        document.head.appendChild(script);
    } else {
        captureAndDownload();
    }
}

// Helper Functions
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function copyToClipboard(text, event) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess(event);
        }).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        alert('Copied to clipboard!');
    } catch (err) {
        alert('Failed to copy. Please try manually.');
    }
    document.body.removeChild(textarea);
}

function showCopySuccess(event) {
    const btn = event.target.closest('.json-action-btn');
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

function captureAndDownload() {
    const container = document.querySelector('.container');
    const originalBackground = document.body.style.background;

    // Show loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1e293b;padding:2rem;border-radius:8px;z-index:10000;color:#fff;font-size:1.2rem;';
    loadingDiv.textContent = '📸 Generating PNG...';
    document.body.appendChild(loadingDiv);

    setTimeout(() => {
        html2canvas(container, {
            backgroundColor: '#0f172a',
            scale: 2,
            logging: false,
            useCORS: true
        }).then(canvas => {
            canvas.toBlob(blob => {
                downloadFile(blob, `artillery-dashboard-${new Date().toISOString().slice(0, 10)}.png`);
                document.body.removeChild(loadingDiv);
            });
        }).catch(err => {
            console.error('Error generating PNG:', err);
            alert('Failed to generate PNG. Some charts may not be compatible.');
            document.body.removeChild(loadingDiv);
        });
    }, 100);
}