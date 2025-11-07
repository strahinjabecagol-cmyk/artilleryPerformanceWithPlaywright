// Log Modal Module

let globalLogData = null;
let logMatchIndices = [];
let logCurrentMatchIndex = 0;

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
        
        // Get the current report file from dashboard loader
        const { getCurrentReportFile } = await import('../dashboard-data-loader.js');
        const currentReport = getCurrentReportFile();
        
        // Find matching log file from logsMap.json
        let logFile = 'execution.log'; // default fallback
        
        try {
            const logsMapRes = await fetch(`${BASE_PATH}/logs/logsMap.json?v=${timestamp}`);
            if (logsMapRes.ok) {
                const logsMap = await logsMapRes.json();
                const logEntry = logsMap.files.find(f => f.resultFile === currentReport);
                if (logEntry) {
                    logFile = logEntry.filename;
                }
            }
        } catch (e) {
            console.warn('Could not load logsMap.json, using default execution.log');
        }
        
        const res = await fetch(`${BASE_PATH}/logs/${logFile}?v=${timestamp}`);

        if (!res.ok) {
            content.textContent = `❌ Log file not found: ${logFile}`;
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
    // Clear match count and disable nav buttons
    const matchCount = document.getElementById('logMatchCount');
    const prevBtn = document.getElementById('logPrevMatch');
    const nextBtn = document.getElementById('logNextMatch');
    if (matchCount) matchCount.textContent = '';
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
}

window.closeLogPreview = closeLogPreview;

// Render Log with optional search highlighting
function renderLog(logText, searchTerm = '', highlightIndex = -1) {
    const content = document.getElementById('logContent');
    let displayText = logText;

    // Escape HTML
    displayText = displayText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Apply search highlighting if search term exists
    if (searchTerm) {
        // Find all matches
        const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
        let matchIdx = 0;
        logMatchIndices = [];
        displayText = displayText.replace(regex, function(match) {
            logMatchIndices.push(matchIdx++);
            return `<span class="highlight-match">${match}</span>`;
        });
        // Highlight current match
        if (highlightIndex >= 0 && logMatchIndices.length > 0) {
            let count = 0;
            displayText = displayText.replace(/<span class="highlight-match">(.*?)<\/span>/g, function(m, g1) {
                if (count === highlightIndex) {
                    count++;
                    return `<span class="highlight-match current-match">${g1}</span>`;
                }
                count++;
                return m;
            });
        }
    }

    content.innerHTML = displayText;

    // Scroll current match into view
    setTimeout(() => {
        const current = content.querySelector('.current-match');
        if (current) {
            current.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
    }, 0);
}

// Search Log
export function searchLog(direction = null) {
    const searchInput = document.getElementById('logSearch');
    const searchTerm = searchInput.value.trim();
    const matchCount = document.getElementById('logMatchCount');
    const prevBtn = document.getElementById('logPrevMatch');
    const nextBtn = document.getElementById('logNextMatch');

    if (!globalLogData) return;

    // Reset current match index if search term changed
    if (window._lastLogSearchTerm !== searchTerm) {
        logCurrentMatchIndex = 0;
        window._lastLogSearchTerm = searchTerm;
    }

    if (searchTerm.length < 3) {
        renderLog(globalLogData);
        if (matchCount) matchCount.textContent = '';
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        return;
    }

    renderLog(globalLogData, searchTerm, logCurrentMatchIndex);
    // Count matches
    const totalMatches = logMatchIndices.length;
    if (matchCount) {
        matchCount.textContent = totalMatches > 0 ? `${logCurrentMatchIndex + 1} of ${totalMatches} matches` : 'No matches';
    }
    if (prevBtn) prevBtn.disabled = totalMatches <= 1;
    if (nextBtn) nextBtn.disabled = totalMatches <= 1;
}

window.searchLog = searchLog;

export function nextLogMatch() {
    if (logMatchIndices.length === 0) return;
    logCurrentMatchIndex = (logCurrentMatchIndex + 1) % logMatchIndices.length;
    searchLog();
}

window.nextLogMatch = nextLogMatch;

export function prevLogMatch() {
    if (logMatchIndices.length === 0) return;
    logCurrentMatchIndex = (logCurrentMatchIndex - 1 + logMatchIndices.length) % logMatchIndices.length;
    searchLog();
}

window.prevLogMatch = prevLogMatch;

// Copy Log to Clipboard
export function copyLog() {
    if (!globalLogData) {
        alert('No log data to copy');
        return;
    }

    // Find the copy button
    const btn = document.getElementById('logModal').querySelector('.json-action-btn.copy');

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(globalLogData).then(() => {
            showCopySuccess(btn);
        }).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopyLog(globalLogData);
        });
    } else {
        fallbackCopyLog(globalLogData);
    }
}

window.copyLog = copyLog;

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

function showCopySuccess(btn) {
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