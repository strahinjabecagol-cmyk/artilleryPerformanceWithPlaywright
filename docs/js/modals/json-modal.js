// JSON Modal Module

let globalJSONData = null;
let matchIndices = [];
let currentMatchIndex = 0;
let isFilteredView = false; // Track if currently filtered

// Open JSON Preview Modal
export async function openJSONPreview() {
    const modal = document.getElementById('jsonModal');
    const content = document.getElementById('jsonContent');
    const fileSize = document.getElementById('jsonFileSize');
    const searchInput = document.getElementById('jsonSearch');
    const matchCount = document.getElementById('jsonMatchCount');
    const prevBtn = document.getElementById('jsonPrevMatch');
    const nextBtn = document.getElementById('jsonNextMatch');

    modal.classList.add('active');
    content.innerHTML = '<div style="text-align:center;color:#94a3b8;">⏳ Loading JSON data...</div>';
    searchInput.value = '';
    if (matchCount) matchCount.textContent = '';
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;

    try {
        const { BASE_PATH } = await import('../utils/path-config.js');
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

window.closeJSONPreview = closeJSONPreview;

// Render JSON with Syntax Highlighting
function renderJSON(data, searchTerm = '', highlightIndex = -1) {
    const content = document.getElementById('jsonContent');
    let jsonString = JSON.stringify(data, null, 2);

    // Apply syntax highlighting
    jsonString = syntaxHighlight(jsonString);

    // Apply search highlighting if search term exists
    if (searchTerm) {
        // Find all matches
        const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
        let matchIdx = 0;
        matchIndices = [];
        jsonString = jsonString.replace(regex, function(match) {
            matchIndices.push(matchIdx++);
            return `<span class="highlight-match">${match}</span>`;
        });
        // Highlight current match
        if (highlightIndex >= 0 && matchIndices.length > 0) {
            let count = 0;
            jsonString = jsonString.replace(/<span class="highlight-match">(.*?)<\/span>/g, function(m, g1) {
                if (count === highlightIndex) {
                    count++;
                    return `<span class="highlight-match current-match">${g1}</span>`;
                }
                count++;
                return m;
            });
        }
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
export function searchJSON(direction = null) {
    const searchInput = document.getElementById('jsonSearch');
    const searchTerm = searchInput.value.trim();
    const matchCount = document.getElementById('jsonMatchCount');
    const prevBtn = document.getElementById('jsonPrevMatch');
    const nextBtn = document.getElementById('jsonNextMatch');


    if (!globalJSONData) return;

    if (searchTerm.length < 3) {
        if (isFilteredView) {
            renderJSON(globalJSONData);
            isFilteredView = false;
        }
        if (matchCount) matchCount.textContent = '';
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        console.log('Search term too short, reset view.');
        return;
    }

    // Filter JSON based on search term
    const filtered = filterJSON(globalJSONData, searchTerm);
    renderJSON(filtered, searchTerm, currentMatchIndex);
    isFilteredView = true;
    // Count matches
    const totalMatches = matchIndices.length;
    if (matchCount) {
        matchCount.textContent = totalMatches > 0 ? `${currentMatchIndex + 1} of ${totalMatches} matches` : 'No matches';
    }
    if (prevBtn) prevBtn.disabled = totalMatches <= 1;
    if (nextBtn) nextBtn.disabled = totalMatches <= 1;
}

// Debounce for search input
let jsonSearchTimeout = null;
window.searchJSON = function() {
    clearTimeout(jsonSearchTimeout);
    const searchInput = document.getElementById('jsonSearch');
    const searchTerm = searchInput.value.trim();
    if (searchTerm.length < 3) {
        searchJSON();
        return;
    }
    jsonSearchTimeout = setTimeout(() => {
        searchJSON();
    }, 250);
};

export function nextJSONMatch() {
    if (matchIndices.length === 0) return;
    currentMatchIndex = (currentMatchIndex + 1) % matchIndices.length;
    searchJSON();
}

window.nextJSONMatch = nextJSONMatch;

export function prevJSONMatch() {
    if (matchIndices.length === 0) return;
    currentMatchIndex = (currentMatchIndex - 1 + matchIndices.length) % matchIndices.length;
    searchJSON();
}

window.prevJSONMatch = prevJSONMatch;

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

    // Modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(jsonText).then(() => {
            showCopySuccess(event);
        }).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopyJSON(jsonText);
        });
    } else {
        fallbackCopyJSON(jsonText);
    }
}

// Download JSON
export async function downloadJSON() {
    const { BASE_PATH } = await import('../utils/path-config.js');
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

// Helper Functions
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function fallbackCopyJSON(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        alert('JSON copied to clipboard!');
    } catch (err) {
        alert('Failed to copy JSON. Please try manually.');
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