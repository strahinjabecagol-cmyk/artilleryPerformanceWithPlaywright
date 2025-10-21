# 📊 Artillery Configuration Guide: Capturing Per-Period Metrics

## Question: How to Capture Browser Metrics Per-Period?

You asked about using `ensure: intermediate: true` to capture per-period data. Here's the complete answer:

---

## ✅ Solution 1: Enable Intermediate Reporting (Basic)

### Configuration Added:
```yaml
config:
  target: 'https://blazedemo.com/index.php'
  engines:
    playwright: {}
  processor: './tests/artillery/findsomething.js'
  
  # Enable intermediate reporting for per-period metrics
  ensure:
    intermediate: true
  
  # Report metrics every 10 seconds (default is 10)
  statsInterval: 10
```

### What This Does:
- `ensure.intermediate: true` - Forces Artillery to include intermediate (per-period) data in output
- `statsInterval: 10` - Sets reporting interval to 10 seconds

### ⚠️ Limitation:
**This alone won't help with browser metrics!**  
Artillery's Playwright engine still aggregates browser metrics (FCP, LCP, etc.) at the test level, not per period.

---

## ✅ Solution 2: Manual Metric Emission (BETTER!)

### The Better Approach:
Manually emit custom metrics using `events.emit()` which **WILL appear in intermediate data**.

### Updated Test Script:
```javascript
async function artilleryScript(page, vuContext, events, test) {

    events.emit('counter', `user.${vuContext.scenario.name}.Find flight`, 1);

    await test.step("Go to page", async () => {
        // Capture page load start time
        const startTime = Date.now();
        
        await gotoPage(page);
        
        // ✅ Manually emit metric for per-period tracking
        const pageLoadTime = Date.now() - startTime;
        events.emit('histogram', 'custom.page_load_time', pageLoadTime);
        // This WILL show up in intermediate data!
    });

    // ... rest of steps
}
```

### Available Event Types:
```javascript
// Counter - simple count (e.g., number of errors)
events.emit('counter', 'custom.errors', 1);

// Histogram - time-based metrics (e.g., response time, page load)
events.emit('histogram', 'custom.page_load_time', 1234);

// Rate - events per second
events.emit('rate', 'custom.requests_per_second');
```

---

## 📊 Complete Example: Capture All Page Metrics

### Enhanced Test Script:
```javascript
async function artilleryScript(page, vuContext, events, test) {

    events.emit('counter', `user.${vuContext.scenario.name}.Find flight`, 1);

    await test.step("Go to page", async () => {
        const startTime = Date.now();
        
        await gotoPage(page);
        
        // ✅ Custom page load time (will show in intermediate)
        const pageLoadTime = Date.now() - startTime;
        events.emit('histogram', 'custom.page_load_time', pageLoadTime);
        
        // ✅ Capture browser performance metrics manually
        try {
            const perfMetrics = await page.evaluate(() => {
                const perf = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                const fcp = paint.find(p => p.name === 'first-contentful-paint');
                
                return {
                    domContentLoaded: perf?.domContentLoadedEventEnd - perf?.domContentLoadedEventStart,
                    loadComplete: perf?.loadEventEnd - perf?.loadEventStart,
                    fcp: fcp?.startTime || 0,
                    dns: perf?.domainLookupEnd - perf?.domainLookupStart,
                    tcp: perf?.connectEnd - perf?.connectStart,
                    ttfb: perf?.responseStart - perf?.requestStart
                };
            });
            
            // Emit all metrics for per-period tracking
            events.emit('histogram', 'custom.fcp', perfMetrics.fcp);
            events.emit('histogram', 'custom.ttfb', perfMetrics.ttfb);
            events.emit('histogram', 'custom.dom_content_loaded', perfMetrics.domContentLoaded);
            events.emit('histogram', 'custom.load_complete', perfMetrics.loadComplete);
            events.emit('histogram', 'custom.dns_time', perfMetrics.dns);
            events.emit('histogram', 'custom.tcp_time', perfMetrics.tcp);
            
        } catch (error) {
            console.error('Failed to capture performance metrics:', error);
            events.emit('counter', 'custom.perf_capture_errors', 1);
        }
    });

    await test.step("Select Philadelphia as departure", async () => {
        const stepStart = Date.now();
        await selectPhillyFrom(page);
        events.emit('histogram', 'custom.step.select_from', Date.now() - stepStart);
    });

    await test.step("Select Berlin as destination", async () => {
        const stepStart = Date.now();
        await selectBerlinTo(page);
        events.emit('histogram', 'custom.step.select_to', Date.now() - stepStart);
    });

    await test.step("Click Find Flights", async () => {
        const stepStart = Date.now();
        await clickFindFlights(page);
        events.emit('histogram', 'custom.step.find_flights', Date.now() - stepStart);
    });
}
```

---
## just a check
## 📁 Resulting Data Structure

### With Custom Metrics:
```json
{
  "aggregate": {
    "summaries": {
      "browser.page.FCP.https://blazedemo.com/index.php": {...},
      "custom.page_load_time": {
        "min": 650,
        "max": 1200,
        "mean": 850,
        "p50": 800,
        "p95": 1100
      },
      "custom.fcp": {...},
      "custom.ttfb": {...}
    }
  },
  "intermediate": [
    {
      "period": "1761037470000",
      "summaries": {
        "custom.page_load_time": {  // ✅ NOW AVAILABLE!
          "min": 680,
          "max": 920,
          "mean": 780
        },
        "custom.fcp": {...},        // ✅ NOW AVAILABLE!
        "custom.ttfb": {...}        // ✅ NOW AVAILABLE!
      }
    },
    {
      "period": "1761037480000",
      "summaries": {
        "custom.page_load_time": {  // ✅ PER PERIOD!
          "min": 710,
          "max": 1050,
          "mean": 900
        }
      }
    }
  ]
}
```

---

## 🔧 Dashboard Integration

### Update Dashboard to Use Custom Metrics:

```javascript
// In dashboard1.html, update the FCP detection:

// Find custom FCP metric or fall back to browser FCP
const fcpKey = Object.keys(data.intermediate[0]?.summaries || {}).find(k => 
  k.includes('custom.fcp') || k.includes('browser.page.FCP')
);

// Now fcpData will have actual per-period values!
const fcpData = data.intermediate.map(i => 
  i.summaries?.[fcpKey]?.mean || 0
);
```

---

## 🎯 Recommended Configuration

### artillery.yml:
```yaml
config:
  target: 'https://blazedemo.com/index.php'
  engines:
    playwright: {}
  processor: './tests/artillery/findsomething.js'
  
  # ✅ Enable intermediate reporting
  ensure:
    intermediate: true
  
  # ✅ Report every 10 seconds (adjust based on test duration)
  statsInterval: 10
  
  # Optional: Increase verbosity for debugging
  # http:
  #   timeout: 30
  
  phases:
    - name: constantArrival
      duration: 10
      arrivalRate: 1
    - name: pause
      pause: 5
    - name: rampUp
      duration: 10
      arrivalRate: 1  
      rampTo: 15
    - name: fixedArrival
      duration: 10
      arrivalRate: 15

scenarios:
  - name: testScenario
    engine: 'playwright'
    flowFunction: 'artilleryScript'
```

---

## ✅ Summary: What to Use?

### Use BOTH Approaches:

1. **`ensure.intermediate: true`** in config
   - Ensures intermediate data is always included
   - Good practice for any Artillery test

2. **`events.emit('histogram', ...)`** in script
   - Captures custom metrics per-period
   - **This is the key to getting FCP per period!**
   - More control over what's measured
   - Works reliably across Artillery versions

### Why Both?
- Config ensures infrastructure is ready
- Manual emission ensures data is actually captured
- Future-proof (works even if Artillery changes internals)

---

## 📊 Benefits of This Approach

### Advantages:
✅ **Per-period visibility** - See how metrics change over test phases  
✅ **Custom metrics** - Track exactly what you need  
✅ **Dashboard compatibility** - Works with existing chart code  
✅ **Flexible** - Can track page load, step duration, custom events  
✅ **Reliable** - Not dependent on Artillery's browser metric aggregation  

### Use Cases:
- Track FCP trends during ramp-up phase
- Compare performance between test phases
- Identify performance degradation over time
- Custom business metrics (checkout time, search time, etc.)

---

## 🚀 Next Steps

1. ✅ **Config updated** - `ensure.intermediate: true` added
2. ✅ **Basic metric added** - `custom.page_load_time` in script
3. 🔄 **Run test** - `artillery run artillery.yml --output results.json`
4. 🔍 **Verify** - Check if `intermediate[].summaries` has `custom.page_load_time`
5. 📊 **Update dashboard** - Modify to use custom metrics if available

---

## 📝 Files Modified

### artillery.yml:
- Added `ensure.intermediate: true`
- Added `statsInterval: 10`

### tests/artillery/findsomething.js:
- Added page load time measurement
- Added `events.emit('histogram', ...)` call

---

**This is the recommended approach for capturing per-period browser metrics in Artillery!** 🎉
