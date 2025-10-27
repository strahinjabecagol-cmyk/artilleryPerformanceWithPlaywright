# 🐛 BUG FIX: Incorrect Timestamp Labels

## Issue Description

**Reported:** Timestamp labels on charts showing incorrect times like "04:40 PM", "07:26 PM", "10:13 AM" instead of actual test execution times (around 10:05 AM).

**Affected Charts:**
- Throughput (RPS)
- First Contentful Paint
- Virtual Users Activity
- HTTP Requests
- All time-series charts

---

## Root Cause Analysis

### The Problem:
The `item.period` field in `results.json` intermediate data is a **STRING** containing a milliseconds timestamp, but the code was treating it as a **NUMBER** in seconds.

### Investigation:
```javascript
// Actual data structure:
{
  "period": "1761033930000",  // STRING with milliseconds
  "firstMetricAt": 1761033935434  // NUMBER with milliseconds
}
```

### Original (Broken) Code:
```javascript
const periods = data.intermediate.map((item) => {
  const timestamp = item.period ? new Date(item.period * 1000) : null;
  //                                          ^^^^^^^^^^^^^^^^^^^
  //                                          WRONG! Multiplying string by 1000
  //                                          JavaScript converts string to number,
  //                                          then multiplies: 1761033930000 * 1000
  //                                          = 1761033930000000 (way too large!)
  return timestamp.toLocaleTimeString(...);
});
```

### Result:
- `new Date(1761033930000 * 1000)` = `new Date(1761033930000000)`
- This created dates far in the future, leading to random-looking times

---

## The Fix

### Updated Code - Timestamp Conversion:
```javascript
const periods = data.intermediate.map((item) => {
  // item.period is a STRING containing milliseconds timestamp
  const timestamp = item.period ? new Date(parseInt(item.period)) : null;
  //                                          ^^^^^^^^^^^^^^^^^^^
  //                                          FIXED! Parse string to number, no multiplication
  if (timestamp) {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }
  return 'N/A';
});
```

### Updated Code - RPS Calculation:
```javascript
const rpsData = data.intermediate.map((item, idx, arr) => {
  const requests = item.counters?.['browser.http_requests'] || 0;
  // item.period is a STRING containing milliseconds
  const currentPeriod = parseInt(item.period) || 0;
  const prevPeriod = idx > 0 ? parseInt(arr[idx - 1].period) || 0 : currentPeriod - 10000;
  const durationMs = currentPeriod - prevPeriod;
  const durationSeconds = durationMs / 1000 || 10;
  return requests / durationSeconds;
});
```

---

## Before vs After

### Before (Broken):
```
Throughput Chart X-axis:
04:40:00 AM, 07:28:40 AM, 10:13:20 AM, 01:00:00 PM, 03:46:40 PM, 08:33:20 PM
```
❌ Times make no sense and don't match test execution time (10:05:35 AM)

### After (Fixed):
```
Throughput Chart X-axis:
10:05:30 AM, 10:05:40 AM, 10:05:50 AM, 10:06:00 AM, 10:06:10 AM, 10:06:20 AM
```
✅ Times correctly show test execution in 10-second intervals starting at 10:05:30 AM

---

## Verification

### Test Execution Time:
- **Start Time:** 10/21/2025, 10:05:35 AM (from metadata)
- **Duration:** 51.0 seconds
- **Expected Chart Range:** ~10:05:30 AM to ~10:06:26 AM

### Fixed Chart Labels:
- ✅ 10:05:30 AM - First period
- ✅ 10:05:40 AM - Second period (+10s)
- ✅ 10:05:50 AM - Third period (+10s)
- ✅ 10:06:00 AM - Fourth period (+10s)
- ✅ 10:06:10 AM - Fifth period (+10s)
- ✅ 10:06:20 AM - Sixth period (+10s)

**Total span:** 50 seconds ✅ (matches 51s duration)

---

## Files Modified

### dashboard1.html
**Line ~763-774:** Fixed timestamp conversion
**Line ~784-795:** Fixed RPS calculation

---

## Impact

### Charts Affected (All Fixed):
1. ✅ Throughput (RPS) - X-axis now shows correct times
2. ✅ First Contentful Paint - X-axis now shows correct times
3. ✅ Virtual Users Activity - X-axis now shows correct times
4. ✅ HTTP Requests - X-axis now shows correct times
5. ✅ Response Time Percentiles - X-axis now shows correct times

### Side Effects:
- ✅ RPS calculation now accurate (was using wrong time deltas)
- ✅ Zoom functionality still works correctly
- ✅ All other features unaffected

---

## Testing

### Verification Steps:
1. ✅ Loaded dashboard in browser
2. ✅ Checked Throughput chart timestamps
3. ✅ Checked FCP chart timestamps
4. ✅ Verified timestamps match test execution time (10:05 AM)
5. ✅ Verified 10-second intervals between periods
6. ✅ Verified total timespan matches test duration
7. ✅ Verified RPS values look reasonable (~60-140 req/s)

### Screenshots:
- ✅ `fixed-timestamps.png` - Shows correct labels

---

## Lessons Learned

### Data Type Assumptions:
- ⚠️ Always check if fields are strings or numbers
- ⚠️ Artillery's `period` field is a STRING, not a number
- ⚠️ Use `parseInt()` or `parseFloat()` for string numbers
- ⚠️ Validate timestamp units (seconds vs milliseconds)

### Debugging Process:
1. ✅ Visual inspection caught the issue
2. ✅ Used Playwright to investigate actual data
3. ✅ Checked data structure with `console.log`
4. ✅ Identified type mismatch (string vs number)
5. ✅ Fixed conversion logic
6. ✅ Verified with real test data

---

## Status: FIXED ✅

**All timestamp labels now display correctly across all charts.**

The dashboard now accurately represents when each measurement was taken during the Artillery test execution.

---

**Bug Report Closed:** October 21, 2025, 10:51 AM
