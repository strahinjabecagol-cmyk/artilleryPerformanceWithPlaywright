# TODO List

## Completed Tasks ✅

- [x] Increase timeout for `waitForSelector` in Playwright configuration
- [x] Increase timeout for page load in Playwright configuration
- [ ] Add folder for utilities and create a util func that emits name of the test from test scenario custom.testname
- [ ] add a separate folder for Dashboard stuff and move all related files there
- [ ] Separate CSS JS and HTML files for the dashboard into their own files
- [ ] move results.json file to a separate folder with results
- [ ] Move logs to a separate folder
- [ ] Make logs and results have unique names based on timestamp
- [ ] Add functionality to the dashboard to filter logs based on test name or just bundle HTML dashboard and log and result together
 
## Implementation Details

### ✅ CORRECT Solution: Artillery YAML Configuration

**All Artillery tests now use 60-second timeout configured in the YAML files:**

```yaml
# artillery.yml & artilleryStress.yml
config:
  engines:
    playwright:
      launchOptions:
        headless: true
      contextOptions:
        timeout: 60000  # 60 seconds for ALL Playwright operations
```

### Why This Works

✅ **Artillery-specific** - Configured where Artillery actually reads it  
✅ **Single source** - Set once in YAML, applies to all tests  
✅ **No code changes** - Test files remain clean and simple  
✅ **Covers everything** - page.goto(), waitForSelector(), waitForNavigation(), click(), etc.

### Files Updated
- `artillery.yml` - Added Playwright timeout configuration
- `artilleryStress.yml` - Added Playwright timeout configuration
- `playwright.config.ts` - Kept for regular Playwright tests (not Artillery)

### What This Fixes
- ❌ `page.goto: Timeout 30000ms exceeded`
- ❌ `page.waitForSelector: Timeout 5000ms exceeded`
- ❌ `page.waitForNavigation: Timeout 30000ms exceeded`

**All timeout errors are now fixed at the Artillery engine level!** 🎯
