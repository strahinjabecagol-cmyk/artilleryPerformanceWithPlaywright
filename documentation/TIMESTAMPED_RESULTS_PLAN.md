# Timestamped Results & Dynamic Dashboard Loading Plan

## Overview
Instead of overwriting `results.json` and `execution.log` with each test run, we'll create timestamped files and maintain index maps that the dashboard can use to load any historical test run.

---

## File Structure

### Current (Before)
```
docs/
  results/
    results.json          ← Always overwritten
  logs/
    execution.log         ← Always overwritten
```

### New (After)
```
docs/
  results/
    resultsMap.json       ← NEW: Index of all result files
    results_2025-11-07_14-30-15.json
    results_2025-11-07_15-45-22.json
    results_2025-11-07_16-12-08.json
    ...
  logs/
    logsMap.json          ← NEW: Index of all log files
    execution_2025-11-07_14-30-15.log
    execution_2025-11-07_15-45-22.log
    execution_2025-11-07_16-12-08.log
    ...
```

---

## Map File Format

### `resultsMap.json`
```json
{
  "files": [
    {
      "filename": "results_2025-11-07_16-12-08.json",
      "timestamp": "2025-11-07T16:12:08Z",
      "testName": "Webstore and Flight Search Performance Test",
      "duration": "220s",
      "phases": 6
    },
    {
      "filename": "results_2025-11-07_15-45-22.json",
      "timestamp": "2025-11-07T15:45:22Z",
      "testName": "Massive Load Test",
      "duration": "330s",
      "phases": 5
    }
  ],
  "latest": "results_2025-11-07_16-12-08.json"
}
```

### `logsMap.json`
```json
{
  "files": [
    {
      "filename": "execution_2025-11-07_16-12-08.log",
      "timestamp": "2025-11-07T16:12:08Z",
      "resultFile": "results_2025-11-07_16-12-08.json"
    },
    {
      "filename": "execution_2025-11-07_15-45-22.log",
      "timestamp": "2025-11-07T15-45-22Z",
      "resultFile": "results_2025-11-07_15-45-22.json"
    }
  ],
  "latest": "execution_2025-11-07_16-12-08.log"
}
```

---

## Implementation Steps

### Step 1: GitHub Actions Workflow Updates

#### File: `.github/workflows/perf.yml` & `.github/workflows/perf-load.yml`

**Changes needed:**
1. Generate timestamp at start of workflow
2. Use timestamp in all file operations
3. Create/update map files after test completes

**New steps:**
```yaml
- name: Generate timestamp
  id: timestamp
  run: echo "TIMESTAMP=$(date -u +%Y-%m-%d_%H-%M-%S)" >> $GITHUB_OUTPUT

- name: Run Artillery
  run: |
    mkdir -p results logs
    TIMESTAMP="${{ steps.timestamp.outputs.TIMESTAMP }}"
    npx artillery run artillery.yml \
      --output results/results_${TIMESTAMP}.json \
      2>&1 | tee logs/execution_${TIMESTAMP}.log

- name: Update results map
  run: |
    TIMESTAMP="${{ steps.timestamp.outputs.TIMESTAMP }}"
    node scripts/update-maps.js results_${TIMESTAMP}.json execution_${TIMESTAMP}.log

- name: Copy artifacts into docs
  run: |
    TIMESTAMP="${{ steps.timestamp.outputs.TIMESTAMP }}"
    mkdir -p docs/results docs/logs
    cp results/results_${TIMESTAMP}.json docs/results/
    cp logs/execution_${TIMESTAMP}.log docs/logs/
    cp results/resultsMap.json docs/results/ || echo "Map file not created yet"
    cp logs/logsMap.json docs/logs/ || echo "Map file not created yet"
```

---

### Step 2: Local BAT Script Updates

#### File: `scripts/artillery.bat`

**Current:**
```batch
npx artillery run artillery.yml --output results/results.json 2>&1 | tee logs/execution.log
```

**New:**
```batch
@echo off
setlocal enabledelayedexpansion

REM Generate timestamp (Windows format)
for /f "tokens=1-6 delims=/: " %%a in ("%date% %time%") do (
    set TIMESTAMP=%%c-%%a-%%b_%%d-%%e-%%f
)
set TIMESTAMP=%TIMESTAMP: =0%

echo Running Artillery test with timestamp: %TIMESTAMP%

REM Create directories
if not exist results mkdir results
if not exist logs mkdir logs

REM Run Artillery with timestamped files
npx artillery run artillery.yml --output results/results_%TIMESTAMP%.json 2>&1 | tee logs/execution_%TIMESTAMP%.log

REM Update map files
node scripts/update-maps.js results_%TIMESTAMP%.json execution_%TIMESTAMP%.log

REM Copy to docs
if not exist docs\results mkdir docs\results
if not exist docs\logs mkdir docs\logs
copy results\results_%TIMESTAMP%.json docs\results\
copy logs\execution_%TIMESTAMP%.log docs\logs\
copy results\resultsMap.json docs\results\ 2>nul
copy logs\logsMap.json docs\logs\ 2>nul

echo ✅ Test completed! Files saved with timestamp: %TIMESTAMP%
```

---

### Step 3: Map Update Script

#### File: `scripts/update-maps.js` (NEW)

```javascript
const fs = require('fs');
const path = require('path');

// Get filenames from command line args
const [resultsFile, logsFile] = process.argv.slice(2);

if (!resultsFile || !logsFile) {
  console.error('Usage: node update-maps.js <resultsFile> <logsFile>');
  process.exit(1);
}

const timestamp = new Date().toISOString();

// Parse results file to get metadata
const resultsPath = path.join('results', resultsFile);
const resultsData = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

// Extract metadata
const testName = resultsData.aggregate?.counters?.['TEST_NAME.Webstore_and_Flight_Search_Performance_Test'] 
  ? 'Webstore and Flight Search Performance Test'
  : resultsData.aggregate?.counters?.['TEST_NAME.Masive_Load_Test']
  ? 'Massive Load Test'
  : 'Unknown Test';

const duration = resultsData.aggregate?.lastMetricAt && resultsData.aggregate?.firstMetricAt
  ? ((resultsData.aggregate.lastMetricAt - resultsData.aggregate.firstMetricAt) / 1000) + 's'
  : 'N/A';

const phases = resultsData.intermediate?.length || 0;

// Update resultsMap.json
const resultsMapPath = 'results/resultsMap.json';
let resultsMap = { files: [], latest: '' };

if (fs.existsSync(resultsMapPath)) {
  resultsMap = JSON.parse(fs.readFileSync(resultsMapPath, 'utf8'));
}

resultsMap.files.unshift({
  filename: resultsFile,
  timestamp: timestamp,
  testName: testName,
  duration: duration,
  phases: phases
});

resultsMap.latest = resultsFile;

fs.writeFileSync(resultsMapPath, JSON.stringify(resultsMap, null, 2));
console.log(`✅ Updated resultsMap.json - Added ${resultsFile}`);

// Update logsMap.json
const logsMapPath = 'logs/logsMap.json';
let logsMap = { files: [], latest: '' };

if (fs.existsSync(logsMapPath)) {
  logsMap = JSON.parse(fs.readFileSync(logsMapPath, 'utf8'));
}

logsMap.files.unshift({
  filename: logsFile,
  timestamp: timestamp,
  resultFile: resultsFile
});

logsMap.latest = logsFile;

fs.writeFileSync(logsMapPath, JSON.stringify(logsMap, null, 2));
console.log(`✅ Updated logsMap.json - Added ${logsFile}`);
```

---

### Step 4: Dashboard Updates

#### File: `docs/js/dashboard-data-loader.js`

**New features to add:**

1. **Load resultsMap.json on page load**
2. **Add dropdown/selector to choose which test run to view**
3. **Default to latest test**
4. **Load corresponding log file**

**Changes:**

```javascript
// NEW: Load available test runs
async function loadTestRunsList() {
  try {
    const response = await fetch('results/resultsMap.json');
    const resultsMap = await response.json();
    
    // Populate dropdown with available tests
    populateTestSelector(resultsMap.files);
    
    // Load latest by default
    return resultsMap.latest;
  } catch (error) {
    console.error('Failed to load results map, falling back to results.json');
    return 'results.json'; // Fallback for backward compatibility
  }
}

// NEW: Populate test selector dropdown
function populateTestSelector(files) {
  const selector = document.getElementById('test-run-selector');
  if (!selector) return;
  
  files.forEach(file => {
    const option = document.createElement('option');
    option.value = file.filename;
    option.textContent = `${file.testName} - ${new Date(file.timestamp).toLocaleString()}`;
    selector.appendChild(option);
  });
  
  selector.addEventListener('change', (e) => {
    loadTestRun(e.target.value);
  });
}

// MODIFIED: Load specific test run
async function loadTestRun(filename) {
  const response = await fetch(`results/${filename}`);
  const data = await response.json();
  
  // Find matching log file
  const logsMapResponse = await fetch('logs/logsMap.json');
  const logsMap = await logsMapResponse.json();
  const logEntry = logsMap.files.find(f => f.resultFile === filename);
  
  // Render dashboard with data
  renderDashboard(data, logEntry?.filename);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  const latestTest = await loadTestRunsList();
  loadTestRun(latestTest);
});
```

#### File: `docs/index.html`

**Add test selector UI:**

```html
<div class="test-selector">
  <label for="test-run-selector">📊 View Test Run:</label>
  <select id="test-run-selector">
    <option value="">Loading...</option>
  </select>
</div>
```

---

## Benefits

✅ **Historical Data**: Keep all test runs, never lose data  
✅ **Easy Comparison**: Load and compare different test runs  
✅ **Consistent Timestamps**: Results and logs always match  
✅ **Works Locally & CI**: Same logic for both environments  
✅ **Backward Compatible**: Falls back to `results.json` if maps don't exist  

---

## Migration Plan

### Phase 1: Create Infrastructure
1. Create `scripts/update-maps.js`
2. Update BAT scripts
3. Update GitHub Actions workflows

### Phase 2: Dashboard Updates
1. Add test selector UI to `index.html`
2. Update `dashboard-data-loader.js` to support map files
3. Test with existing `results.json` (backward compatibility)

### Phase 3: Testing
1. Run local test with updated BAT script
2. Verify map files are created
3. Run GitHub Actions workflow
4. Verify dashboard shows selector and loads timestamped files

### Phase 4: Deployment
1. Commit all changes
2. Push to main
3. Trigger test workflow
4. Verify everything works end-to-end

---

## File Summary

### New Files
- `scripts/update-maps.js` - Map file updater script
- `docs/results/resultsMap.json` - Results index (auto-generated)
- `docs/logs/logsMap.json` - Logs index (auto-generated)

### Modified Files
- `.github/workflows/perf.yml` - Add timestamp & map updates
- `.github/workflows/perf-load.yml` - Add timestamp & map updates
- `scripts/artillery.bat` - Add timestamp & map updates
- `scripts/artilleryLoad.bat` - Add timestamp & map updates
- `docs/index.html` - Add test selector UI
- `docs/js/dashboard-data-loader.js` - Add map loading & test selection

### Timestamped Files (examples)
- `docs/results/results_2025-11-07_16-12-08.json`
- `docs/logs/execution_2025-11-07_16-12-08.log`

---

## Ready to Implement?

This plan provides:
- ✅ Timestamped files for every test run
- ✅ Map files to track all tests
- ✅ Dashboard selector to load any test
- ✅ Same logic for local & CI
- ✅ Backward compatibility

Would you like me to proceed with implementation?
