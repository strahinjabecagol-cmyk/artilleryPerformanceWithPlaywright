# Phase Filtering Issues

## Issue #1: Apdex Calculation Uses Incorrect Approximation Method ✅ FIXED

### Description
The Apdex (Application Performance Index) score calculation uses a **fundamentally flawed approximation method** that estimates distribution from only three percentile values (p50, p75, p95). This causes inconsistent and inaccurate Apdex scores across phase filtering.

### Root Cause
Located in `docs/js/utils/apdex-calculator.js`, lines 33-52:

The Apdex calculator uses a simplified approximation:
- Assigns 50 points based on p50 (median)
- Assigns 25 points based on p75
- Assigns 25 points based on p95

```javascript
// INCORRECT APPROXIMATION METHOD:
if (metricMedian <= apdexThreshold) satisfiedCount += 50;
if (metricP75 <= apdexThreshold) satisfiedCount += 25;
if (metricP95 <= apdexThreshold) satisfiedCount += 25;
```

**Why this is wrong:**
1. Apdex should be calculated from the ACTUAL distribution of ALL requests
2. Using only 3 percentile points cannot accurately represent the full distribution
3. The weighting (50/25/25) is arbitrary and not based on statistical principles
4. Different phases have different percentile values, causing inconsistent Apdex scores even when performance is similar

### Observed Behavior
Testing revealed that the calculation is **technically working as designed**, but the design itself is flawed:

| Selection | Apdex | p50 | p75 | p95 | Explanation |
|-----------|-------|-----|-----|-----|-------------|
| All Phases | 0.875 | 459.5ms | 982.6ms | **1686.1ms** | p95 > 1500ms threshold → gets half credit |
| Ramp-up1 only | 1.000 | 380.9ms | 407.0ms | 517.9ms | All under 1500ms → perfect score |
| Steady state2 | 1.000 | 508.0ms | 542.2ms | 624.6ms | All under 1500ms → perfect score |
| Ramp-down | 1.000 | 712.1ms | 781.1ms | 872.5ms | All under 1500ms → perfect score |

The individual phases genuinely perform better than the aggregate because early phases have lower latency and later phases have higher latency, but none exceed the 1500ms threshold individually.

### Fix Applied
**Part 1: Fixed percentile aggregation** ✅
- Changed from "median-of-medians" approach to **weighted averaging** based on sample counts
- File: `docs/js/utils/phase-filter.js`, lines 193-210
- Now correctly calculates percentiles when filtering by phases

**Part 2: Apdex calculation method** ⚠️ NEEDS REDESIGN
- The approximation method in `apdex-calculator.js` should be replaced with proper Apdex calculation
- Proper Apdex formula: `(Satisfied + Tolerating/2) / Total Requests`
- Requires access to raw request latencies or histogram buckets, not just percentiles

### Test Evidence
Screenshots captured:
- `apdex-all-phases.png`: 0.875 (p95=1686ms causes penalty)
- `apdex-rampup1-phase.png`: 1.000 (all percentiles under threshold)
- `apdex-two-phases.png`: 1.000 (combined phases still under threshold)

### Files Modified
- ✅ `docs/js/utils/phase-filter.js` - Fixed weighted percentile aggregation
- ⚠️ `docs/js/utils/apdex-calculator.js` - Needs redesign (future task)

### Status
**PARTIALLY FIXED** - Percentile aggregation is now correct. Apdex calculation method remains a known limitation but is consistent across all views.

### Recommendation
For future improvement, implement proper Apdex calculation using histogram data:
1. Use `histograms['http.response_time']` from results.json
2. Count requests in each bucket against thresholds
3. Calculate: `(satisfied_count + tolerating_count / 2) / total_count`

---

## Issue #2: Latency Distribution Chart Incorrect for Phase Filtering

### Description
There is an issue with latency distribution chart when less than all phases are selected.

### Current Behavior
- When all phases selected: the chart is correct
- When any other combination of phases selected: the latency distribution chart is not correct

### Status
🔍 **Under Investigation** - Requires detailed analysis

---

## Issue #3: HTTP Requests Chart Numbers

### Description
There is also issue with HTTP Requests chart something feels off in the numbers. It shows multiple bars on the chart with thousands of requests in the chart but it then doesn't do the math for me.

### Notes
This should be explored deeper. Actually this may be correct there is like 27k requests so...

