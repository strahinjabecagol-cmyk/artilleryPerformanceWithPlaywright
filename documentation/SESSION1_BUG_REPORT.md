# Session 1: Bug Report - Critical Issues Found

**Date:** November 5, 2025  
**Tester:** GitHub Copilot (Automated Testing)  
**Dashboard URL:** http://localhost:8080/docs/  
**Test Data:** results.json (3 phases: Ramp-up 60s, Steady State 120s, Ramp-down 40s)

---

## 🚨 Executive Summary

**Total Bugs Found:** 6 Critical Issues  
**Test Status:** ❌ FAILED - Multiple critical bugs blocking proper phase filtering functionality  
**Severity:** HIGH - Core feature broken

---

## 🐛 Critical Bugs Discovered

### **BUG #1: First Phase Label Missing on All Charts** 
**Severity:** 🔴 HIGH  
**Status:** CONFIRMED  

**Description:**  
The first phase label ("Ramp-up for local test") does not appear on any time-series charts, even though:
- The phase marker line (vertical dashed line) IS visible
- The phase chip exists in the filter UI
- The console shows correct phase detection: "✅ Phases detected from execution.log: 3"

**Evidence:**
- Screenshot: `session1-throughput-chart.png`
- Screenshot: `session1-vusers-chart.png`
- Screenshot: `session1-http-requests-chart.png`

**Expected Behavior:**  
All three phase labels should appear: "Ramp-up for local test", "Steady state local test", and "Ramp-down"

**Actual Behavior:**  
Only "Steady state local test" and "Ramp-down" labels are visible. The first phase label is completely missing.

**Impact:**  
Users cannot identify which phase is which on the left side of charts, making phase analysis confusing.

**Affected Charts:**
- ✅ Throughput (RPS)
- ✅ Virtual Users Activity
- ✅ HTTP Requests
- ✅ Concurrent Users Over Time
- ✅ Combined Performance Metrics
- (Likely all time-series charts)

---

### **BUG #2: Phase Labels Persist When Single Phase Selected**
**Severity:** 🔴 HIGH  
**Status:** CONFIRMED

**Description:**  
When a single phase is selected for filtering, the OLD phase boundary markers and labels from the full test still appear on charts. This is incorrect behavior.

**Evidence:**
- Screenshot: `session1-throughput-chart-filtered.png` (Steady State selected, but shows "Steady state" and "Ramp-down" labels)
- Screenshot: `session1-throughput-rampup-selected.png` (Ramp-up selected, but shows "Steady state" and "Ramp-down" labels)

**Expected Behavior:**  
When a single phase is selected, NO phase marker lines or labels should appear because the view only shows data from ONE phase (no boundaries exist).

**Actual Behavior:**  
Phase markers and labels from the original full test remain visible even when viewing a single phase in isolation.

**Impact:**  
- Misleading visualization - users think they're seeing multiple phases
- Labels don't match the filtered data
- Confuses interpretation of filtered results

**Steps to Reproduce:**
1. Load dashboard with "All Phases" selected
2. Click any single phase button (e.g., "Steady state local test")
3. Observe charts still show multiple phase labels

---

### **BUG #3: Test Duration Calculation Incorrect**
**Severity:** 🟡 MEDIUM  
**Status:** CONFIRMED

**Description:**  
The "Test Duration" field shows **218.1s** but should show **220.0s** based on phase configurations.

**Evidence:**
- Screenshot: `session1-initial-dashboard.png`
- Phase durations from artillery.yml:
  - Ramp-up: 60s
  - Steady state: 120s
  - Ramp-down: 40s
  - **Total: 220s**

**Expected Behavior:**  
Test Duration = 60s + 120s + 40s = **220.0s**

**Actual Behavior:**  
Test Duration = **218.1s** (off by 1.9 seconds)

**Impact:**  
Minor inaccuracy in metadata display. May indicate timing calculation issues in data processing.

**Additional Notes:**
- When filtering by single phase, duration also seems incorrect:
  - Ramp-up selected: Shows 50.0s (should be 60s)
  - Steady state selected: Shows 110.0s (should be 120s)
  - Ramp-down selected: Shows 210.0s when combined with Ramp-up (should be 100s)

---

### **BUG #4: Success Rate Shows Impossible Value (>100%)**
**Severity:** 🔴 CRITICAL  
**Status:** CONFIRMED

**Description:**  
When "Ramp-up" and "Ramp-down" phases are selected together, the Success Rate displays **147.9%**, which is mathematically impossible.

**Evidence:**
- Screenshot: `session1-success-rate-bug.png`
- Metrics shown:
  - Total VUsers: 543
  - Completed: 803
  - Success Rate: 147.9%

**Expected Behavior:**  
Success Rate should ALWAYS be between 0-100%, calculated as:
```
Success Rate = (Completed VUsers / Total VUsers) * 100
```

**Actual Behavior:**  
Shows 147.9% (803/543 * 100 = 147.88%)

**Root Cause (Suspected):**  
The calculation appears correct algebraically, but the underlying issue is that "Completed" (803) is HIGHER than "Total VUsers" (543). This suggests:
1. VUser counting is incorrect when filtering phases
2. "Completed" may be counting VUsers that span multiple phases multiple times
3. Phase boundary logic is broken for VUser attribution

**Impact:**  
🔴 **CRITICAL** - Data integrity issue. Metrics cannot be trusted when filtering phases. This breaks the entire purpose of phase filtering.

**Steps to Reproduce:**
1. Select "Ramp-up for local test (60s)" phase
2. Also select "Ramp-down (40s)" phase
3. Observe Success Rate shows 147.9%

---

### **BUG #5: "Invalid Date" in Start Time Field**
**Severity:** 🟡 MEDIUM  
**Status:** CONFIRMED

**Description:**  
When certain phase combinations are selected, the "Start Time" field shows "Invalid Date" instead of a proper timestamp.

**Evidence:**
- Screenshot: `session1-success-rate-bug.png` (visible in metadata section)
- Occurs when: Ramp-up + Ramp-down phases selected
- Does NOT occur when: "All Phases" selected (shows "11/3/2025, 3:21:21 PM")

**Expected Behavior:**  
Start Time should show the timestamp of the FIRST period in the filtered dataset.

**Actual Behavior:**  
Shows "Invalid Date" text

**Impact:**  
Users cannot determine when the filtered phase data begins. Affects test tracking and reproducibility.

---

### **BUG #6: Test Duration Incorrect for Multi-Phase Selection**
**Severity:** 🟡 MEDIUM  
**Status:** CONFIRMED

**Description:**  
When "Ramp-up" (60s) and "Ramp-down" (40s) are selected together, Test Duration shows **210.0s** instead of **100.0s**.

**Evidence:**
- Screenshot: `session1-success-rate-bug.png`
- Expected: 60s + 40s = 100s
- Actual: 210.0s

**Expected Behavior:**  
Test Duration = Sum of selected phase durations

**Actual Behavior:**  
Shows cumulative duration from start to end, INCLUDING the unselected middle phase

**Root Cause (Suspected):**  
Duration is calculated from first timestamp to last timestamp of filtered data, rather than summing the durations of ONLY the selected phases.

**Impact:**  
Misleading duration metric when non-contiguous phases are selected.

---

## 📊 Summary Table

| Bug # | Description | Severity | Affected Component | Status |
|-------|-------------|----------|-------------------|--------|
| 1 | First phase label missing | 🔴 HIGH | Charts - Phase Markers | Confirmed |
| 2 | Phase labels persist incorrectly | 🔴 HIGH | Charts - Phase Markers | Confirmed |
| 3 | Test duration inaccurate | 🟡 MEDIUM | Metadata Display | Confirmed |
| 4 | Success rate >100% (impossible) | 🔴 CRITICAL | Metrics Calculation | Confirmed |
| 5 | Invalid Date displayed | 🟡 MEDIUM | Metadata Display | Confirmed |
| 6 | Multi-phase duration wrong | 🟡 MEDIUM | Metadata Display | Confirmed |

---

## 🎯 Priority Fix Order

### Priority 1 - CRITICAL (Fix Immediately)
1. **Bug #4:** Success Rate calculation - Data integrity issue

### Priority 2 - HIGH (Fix Before Release)
2. **Bug #1:** Missing first phase label - Core UX issue
3. **Bug #2:** Phase labels persistence - Misleading visualizations

### Priority 3 - MEDIUM (Fix Before GA)
4. **Bug #3:** Test duration accuracy
5. **Bug #6:** Multi-phase duration calculation
6. **Bug #5:** Invalid Date display

---

## 🔍 Root Cause Analysis (Preliminary)

### Likely Problem Areas:

1. **Phase Marker Plugin (`phase-markers.js`)**
   - Not rendering first phase label
   - Not clearing/regenerating markers when phase filter changes
   - Issue: Markers are drawn once and not updated dynamically

2. **Data Filtering Logic (`dashboard-data-loader.js` or phase filtering module)**
   - VUser counting across phase boundaries
   - Timestamp range calculations
   - Phase duration calculations for non-contiguous selections

3. **Metrics Calculation (`dashboard-utils.js` or `apdex-calculator.js`)**
   - Success rate formula using incorrect VUser counts
   - Date parsing for filtered data

---

## 🛠️ Recommended Fixes

### For Bug #1 (Missing First Phase Label):
```javascript
// In phase-markers.js
// Ensure labels are rendered for ALL phases, including phase-0
// Check if there's a loop that starts at index 1 instead of 0
// Fix: Change loop to start from index 0
```

### For Bug #2 (Phase Label Persistence):
```javascript
// In chart update logic
// Before redrawing charts with filtered data:
if (selectedPhases.length === 1) {
  // Single phase - don't draw any markers
  disablePhaseMarkers();
} else if (selectedPhases.includes('all')) {
  // All phases - draw all markers
  drawPhaseMarkers(allPhases);
} else {
  // Multiple phases - draw only relevant markers
  drawPhaseMarkers(selectedPhases);
}
```

### For Bug #4 (Success Rate >100%):
```javascript
// In metrics calculation
// Fix VUser counting logic to avoid double-counting
// Ensure VUsers are attributed to only ONE phase
// Formula validation:
const successRate = Math.min(100, (completed / total) * 100);
// Add clamp to prevent >100%
```

---

## 📸 Evidence Files

All screenshots saved to: `docs/logs/`

1. `session1-initial-dashboard.png` - Full dashboard view (All Phases)
2. `session1-throughput-chart.png` - Shows missing first phase label
3. `session1-vusers-chart.png` - Confirms issue on different chart
4. `session1-http-requests-chart.png` - Confirms issue on third chart
5. `session1-throughput-chart-filtered.png` - Shows label persistence (Steady State)
6. `session1-throughput-rampup-selected.png` - Shows label persistence (Ramp-up)
7. `session1-throughput-multiphase.png` - Multi-phase selection view
8. `session1-success-rate-bug.png` - Critical 147.9% bug and Invalid Date

---

## ✅ Console Messages (No Errors)

```
✅ Phase markers plugin registered
✅ Phases detected from execution.log: 3
✅ Phases validated: 3 phases detected
✅ Rendered 3 phase filter chips
🔄 Phase filter changed: [phase-0]
🔄 Phase filter changed: [phase-1]
🔄 Phase filter changed: [phase-0, phase-2]
```

**Note:** No JavaScript errors in console, which means bugs are logic errors, not crashes.

---

## 🧪 Testing Incomplete

**Checklist Progress:** ~10% complete  
**Next Session:** Will complete Sections 1-3 of the testing checklist

**Items NOT Yet Tested:**
- Phase count verification
- Multi-phase selection UI behavior
- Chart data accuracy verification
- Chart scale adjustments
- Response time tests
- Edge cases
- Browser compatibility

---

## 📋 Handoff to Claude Sonnet 4.5

**Task:** Fix the 6 bugs identified above

**Files Likely Needing Changes:**
1. `docs/js/plugins/phase-markers.js` - Fix label rendering and dynamic updates
2. `docs/js/ui/phase-selector.js` - Review phase selection logic
3. `docs/js/utils/dashboard-utils.js` - Fix metrics calculations
4. `docs/js/dashboard-data-loader.js` - Fix data filtering and VUser counting
5. `docs/js/charts/*.js` - Ensure charts clear and redraw markers correctly

**Priority:**
1. Fix Bug #4 (Success Rate) - Critical data integrity issue
2. Fix Bug #1 & #2 (Phase labels) - High UX impact
3. Fix remaining duration/date bugs

**Testing After Fixes:**
Re-run Session 1 tests to verify all bugs are resolved before proceeding to Session 2.

---

**Report Generated:** November 5, 2025  
**Next Steps:** Begin Session 2 after fixes are implemented
