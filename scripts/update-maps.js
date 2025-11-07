const fs = require('fs');
const path = require('path');

// Get filenames from command line args
const [resultsFile, logsFile] = process.argv.slice(2);

if (!resultsFile || !logsFile) {
  console.error('❌ Usage: node update-maps.js <resultsFile> <logsFile>');
  process.exit(1);
}

const timestamp = new Date().toISOString();

// Parse results file to get metadata
const resultsPath = path.join('results', resultsFile);

if (!fs.existsSync(resultsPath)) {
  console.error(`❌ Results file not found: ${resultsPath}`);
  process.exit(1);
}

const resultsData = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

// Extract metadata from results
const testName = resultsData.aggregate?.counters?.['TEST_NAME.Webstore_and_Flight_Search_Performance_Test'] 
  ? 'Webstore and Flight Search Performance Test'
  : resultsData.aggregate?.counters?.['TEST_NAME.Masive_Load_Test']
  ? 'Massive Load Test'
  : 'Unknown Test';

const duration = resultsData.aggregate?.lastMetricAt && resultsData.aggregate?.firstMetricAt
  ? ((resultsData.aggregate.lastMetricAt - resultsData.aggregate.firstMetricAt) / 1000).toFixed(1) + 's'
  : 'N/A';

const phases = resultsData.intermediate?.length || 0;
const vusersCreated = resultsData.aggregate?.counters?.['vusers.created'] || 0;
const httpRequests = resultsData.aggregate?.counters?.['browser.http_requests'] || 0;

// Update resultsMap.json
const resultsMapPath = 'results/resultsMap.json';
let resultsMap = { files: [], latest: '' };

if (fs.existsSync(resultsMapPath)) {
  try {
    resultsMap = JSON.parse(fs.readFileSync(resultsMapPath, 'utf8'));
  } catch (error) {
    console.warn('⚠️  Could not parse existing resultsMap.json, creating new one');
    resultsMap = { files: [], latest: '' };
  }
}

// Add new entry at the beginning (most recent first)
resultsMap.files.unshift({
  filename: resultsFile,
  timestamp: timestamp,
  testName: testName,
  duration: duration,
  phases: phases,
  vusers: vusersCreated,
  requests: httpRequests
});

resultsMap.latest = resultsFile;

// Limit to last 50 test runs to avoid bloat
if (resultsMap.files.length > 50) {
  resultsMap.files = resultsMap.files.slice(0, 50);
}

fs.writeFileSync(resultsMapPath, JSON.stringify(resultsMap, null, 2));
console.log(`✅ Updated resultsMap.json - Added ${resultsFile}`);

// Update logsMap.json
const logsMapPath = 'logs/logsMap.json';
let logsMap = { files: [], latest: '' };

if (fs.existsSync(logsMapPath)) {
  try {
    logsMap = JSON.parse(fs.readFileSync(logsMapPath, 'utf8'));
  } catch (error) {
    console.warn('⚠️  Could not parse existing logsMap.json, creating new one');
    logsMap = { files: [], latest: '' };
  }
}

// Add new entry at the beginning
logsMap.files.unshift({
  filename: logsFile,
  timestamp: timestamp,
  resultFile: resultsFile
});

logsMap.latest = logsFile;

// Limit to last 50 logs
if (logsMap.files.length > 50) {
  logsMap.files = logsMap.files.slice(0, 50);
}

fs.writeFileSync(logsMapPath, JSON.stringify(logsMap, null, 2));
console.log(`✅ Updated logsMap.json - Added ${logsFile}`);

console.log(`\n📊 Test Run Summary:`);
console.log(`   Test: ${testName}`);
console.log(`   Duration: ${duration}`);
console.log(`   VUsers: ${vusersCreated}`);
console.log(`   HTTP Requests: ${httpRequests}`);
console.log(`   Phases: ${phases}`);
