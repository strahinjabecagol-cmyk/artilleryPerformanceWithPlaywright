// PNG Export Module

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

function captureAndDownload() {
    const container = document.querySelector('.container');

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