# 🐛 Bug Fix Request for Claude Sonnet 4.5

## 📋 Overview
This document provides a structured bug report for the Artillery Performance Dashboard phase filtering feature. Six critical bugs were discovered during Session 1 testing that need to be fixed before proceeding with comprehensive testing.

---

## 🎯 Quick Summary

**Feature:** Per-Phase Filtering for Artillery Performance Dashboard  
**Status:** 🔴 BROKEN - Multiple critical bugs  
**Bugs Found:** 10 total (3 Critical, 4 High Priority, 3 Medium Priority)  
**Testing Progress:** Session 1 & 2 complete (~30%)

**Files Affected:**
- `docs/js/plugins/phase-markers.js`
- `docs/js/ui/phase-selector.js`
- `docs/js/utils/dashboard-utils.js`
- `docs/js/dashboard-data-loader.js`
- Chart files in `docs/js/charts/`

---

## 🚨 Critical Bugs (Fix First)

### Bug #4: Success Rate Calculation Shows >100% ⚠️ CRITICAL
**Current Behavior:** When "Ramp-up" and "Ramp-down" phases are selected together, Success Rate shows **147.9%**

**Data:**
- Total VUsers: 543
- Completed: 803
- Success Rate: 147.9% ← IMPOSSIBLE

**Root Cause:** VUser counting logic is broken. "Completed" count (803) exceeds "Total VUsers" (543), suggesting VUsers are being double-counted across phases or phase attribution logic is incorrect.

**Fix Required:**
1. Fix VUser counting when filtering by phases
2. Ensure VUsers are attributed to ONE phase only
3. Add validation: `successRate = Math.min(100, (completed / total) * 100)`

**Evidence:** `docs/logs/session1-success-rate-bug.png`

**Session 2 Additional Evidence:**
- Session 2 confirmed this bug with single-phase filtering
- Steady State phase: 78.1% success rate (927/1187) - where are the 260 missing VUsers?
- Ramp-up + Steady State: 82.6% success rate (1322/1600) - where are the 278 missing VUsers?
- When "All Phases" selected: 100.0% (1730/1730) - all VUsers complete
- **This proves VUser attribution is broken** - VUsers completing in one phase are not being properly attributed
- See: `SESSION2_TESTING_REPORT.md` - Bugs #10, #12

---

## 🔴 High Priority Bugs

### Bug #1: First Phase Label Missing from All Charts
**Current Behavior:** The label for "Ramp-up for local test" (Phase 0) never appears on any time-series charts, even though:
- The vertical marker line IS visible
- Console shows: "✅ Phases detected: 3"
- Phase filter chip exists

**Expected:** All 3 phase labels visible ("Ramp-up for local test", "Steady state local test", "Ramp-down")  
**Actual:** Only 2 labels visible (phases 1 and 2)

**Likely Cause:** Loop in `phase-markers.js` starting at index 1 instead of 0, or off-by-one error in label rendering

**Fix Required:**
- Check phase marker rendering loop - ensure it includes phase 0
- Verify label positioning for first phase

**Evidence:** 
- `session1-throughput-chart.png`
- `session1-vusers-chart.png`
- `session1-http-requests-chart.png`

---

### Bug #2: Phase Labels Persist When Single Phase Selected
**Current Behavior:** When a single phase is filtered, the chart STILL shows phase boundary markers and labels from the full test

**Example:**
- Select "Steady state local test" (only phase 1)
- Chart shows data ONLY from phase 1 ✅ (correct)
- Chart STILL shows labels "Steady state local test" and "Ramp-down" ❌ (incorrect)

**Expected:** When viewing a single phase, NO phase markers/labels should appear (there are no boundaries in a single-phase view)

**Fix Required:**
1. Detect when only 1 phase is selected
2. Hide/remove all phase markers and labels
3. Regenerate markers when switching back to multi-phase view

**Suggested Code Fix:**
```javascript
function updateCharts(selectedPhases) {
  const charts = getAllCharts();
  
  charts.forEach(chart => {
    // Clear existing phase markers
    clearPhaseMarkers(chart);
    
    // Only draw markers for multi-phase views
    if (selectedPhases.length > 1 || selectedPhases.includes('all')) {
      drawPhaseMarkers(chart, selectedPhases);
    }
    
    // Update chart data
    chart.update(filteredData);
  });
}
```

**Evidence:**
- `session1-throughput-chart-filtered.png`
- `session1-throughput-rampup-selected.png`

---

## 🟡 Medium Priority Bugs

### Bug #3: Test Duration Calculation Inaccurate
**Current Behavior:** 
- All Phases: Shows 218.1s (should be 220.0s)
- Single Phases: Shows incorrect durations (e.g., Ramp-up shows 50s instead of 60s)

**Expected:** Accurate duration based on phase configuration from `artillery.yml`

**Fix Required:** Review duration calculation logic in metadata display

**Session 2 Confirmation:**
- ✅ Confirmed: Steady State phase shows 110.0s instead of 120.0s (10s discrepancy)
- ✅ Confirmed: All Phases shows 218.1s instead of 220.0s (1.9s discrepancy)
- Pattern: All duration calculations are consistently short
- See: `SESSION2_TESTING_REPORT.md` - Bug #9

---

### Bug #7: Test Name Changes When Filtering (NEW - Session 2) 🆕
**Current Behavior:** When filtering by any single phase, the test name changes from "Webstore and Flight Search Performance Test" to "Artillery Load Test"

**Expected:** Test name should remain constant regardless of phase filtering

**Root Cause:** Test name extraction logic likely searches filtered data instead of using original metadata

**Fix Required:** 
1. Store original test name from full dataset
2. Always display original test name regardless of phase filter
3. Don't re-extract test name from filtered counters

**Evidence:** `docs/logs/session2-steady-state-selected.png`

**Severity:** MEDIUM - Confusing for users but doesn't break functionality

---

### Bug #5: "Invalid Date" Displayed for Start Time
**Current Behavior:** When certain phase combinations are selected (e.g., Ramp-up + Ramp-down), Start Time shows "Invalid Date"

**Expected:** Show timestamp of first period in filtered dataset

**Fix Required:** Fix date parsing/formatting for filtered phase data

**Session 2 Confirmation:**
- ✅ Confirmed: "Invalid Date" appears when filtering single phases
- Happens consistently with any single-phase selection
- Returns to valid date when "All Phases" selected
- See: `SESSION2_TESTING_REPORT.md` - Bug #8

**Additional Context:**
- All Phases: Shows "11/3/2025, 3:21:21 PM" ✅
- Steady State only: Shows "Invalid Date" ❌
- Issue: `firstMetricAt` timestamp is not being found in filtered dataset

---

### Bug #6: Multi-Phase Duration Calculation Wrong
**Current Behavior:** Selecting Ramp-up (60s) + Ramp-down (40s) shows duration as 210.0s instead of 100.0s

**Expected:** Duration = sum of ONLY selected phases (60 + 40 = 100s)

**Actual:** Calculates timestamp range INCLUDING unselected middle phase

**Fix Required:** Change from timestamp-based duration to sum of selected phase durations

**Session 2 Confirmation:**
- ✅ Confirmed: Ramp-up (60s) + Steady State (120s) = 170.0s (should be 180s)
- 10s discrepancy exactly matches single-phase duration error
- See: `SESSION2_TESTING_REPORT.md` - Bug #11

**Pattern:** All durations are calculated from timestamps (lastMetricAt - firstMetricAt), which doesn't account for:
1. Data collection intervals (10s statsInterval)
2. Phase boundaries being mid-interval
3. Missing the true configured duration from artillery.yml

**Recommendation:** Use phase configuration durations directly:
```javascript
// Instead of: duration = lastMetricAt - firstMetricAt
// Use: duration = sum of selected phase.durationSec values
```

---

## 📂 Context Files

### Session 1 Bug Report
See: `SESSION1_BUG_REPORT.md` (comprehensive details, screenshots, root cause analysis)

### Session 2 Testing Report (NEW) 🆕
See: `SESSION2_TESTING_REPORT.md` (Sections 1-3 testing results, 4 additional bugs found/confirmed)

### Testing Plan
See: `TESTING_EXECUTION_PLAN.md` (5-session structured plan)

### Testing Checklist
See: `PHASE_FILTERING_TESTING_CHECKLIST.md` (comprehensive test cases)

### Screenshots Location
- Session 1 evidence: `docs/logs/session1-*.png`
- Session 2 evidence: `docs/logs/session2-*.png`

---

## 🔧 Recommended Fix Approach

### Phase 1: Data Layer (Critical)
1. **Fix VUser counting logic** (Bug #4)
   - Review how VUsers are attributed to phases
   - Fix double-counting issue
   - Add validation/clamping for success rate

### Phase 2: Visualization Layer (High Priority)
2. **Fix phase marker rendering** (Bugs #1 & #2)
   - Ensure phase 0 label renders
   - Make markers dynamic (clear/redraw on filter change)
   - Hide markers for single-phase views

### Phase 3: Metadata Layer (Medium Priority)
3. **Fix metadata calculations** (Bugs #3, #5, #6, #7)
   - Duration calculations (use config durations, not timestamps)
   - Date parsing for filtered data (ensure firstMetricAt exists)
   - Test name preservation (store from original dataset)
   - Validate all metadata fields

---

## 📊 Complete Bug List (Session 1 + 2)

| Bug # | Severity | Title | Status | Session |
|-------|----------|-------|--------|---------|
| #1 | HIGH | First Phase Label Missing | Open | 1 |
| #2 | HIGH | Phase Labels Persist in Single-Phase View | Open | 1 |
| #3 | HIGH | Duration Calculation Inaccurate | Confirmed in S2 (#9) | 1, 2 |
| #4 | CRITICAL | Success Rate >100% / VUser Attribution | Confirmed in S2 (#10, #12) | 1, 2 |
| #5 | HIGH | "Invalid Date" for Start Time | Confirmed in S2 (#8) | 1, 2 |
| #6 | HIGH | Multi-Phase Duration Wrong | Confirmed in S2 (#11) | 1, 2 |
| #7 | MEDIUM | Test Name Changes When Filtering | NEW | 2 |
| #10 | CRITICAL | Success Rate Data Integrity (78.1%) | NEW | 2 |
| #12 | CRITICAL | Success Rate Multi-Phase (82.6%) | NEW | 2 |

**Total Unique Issues:** 7 root causes (some bugs are manifestations of same issue)

**Critical Root Causes:**
1. **VUser Attribution** - Affects Bugs #4, #10, #12
2. **Duration Calculation** - Affects Bugs #3, #6
3. **Phase Marker Rendering** - Affects Bugs #1, #2

---

## ✅ Verification Steps After Fixes

1. **Test All Phases View**
   - [ ] All 3 phase labels visible (including first)
   - [ ] Duration shows 220.0s
   - [ ] Success rate shows 100.0%
   - [ ] Start time shows valid date

2. **Test Single Phase Selection**
   - [ ] NO phase markers/labels appear on charts
   - [ ] Metrics show filtered values only
   - [ ] Duration matches selected phase
   - [ ] Success rate ≤ 100%

3. **Test Multi-Phase Selection**
   - [ ] Only relevant phase markers appear
   - [ ] Duration = sum of selected phases
   - [ ] Success rate ≤ 100%
   - [ ] VUser counts are logical

---

## 🎯 Success Criteria

### Before Session 3 Can Begin:
- ✅ All 10 bugs fixed (7 root causes)
- ✅ Manual verification passed
- ✅ No console errors
- ✅ Phase filtering works as designed

### Expected Outcome:
- Phase labels render correctly (all 3 visible)
- Labels disappear for single-phase views
- Success rate ALWAYS ≤ 100% (and logically consistent)
- All metadata displays accurately (test name, start time, duration)
- Duration calculations use config values (not timestamps)
- VUser attribution is accurate (no double-counting)

---

## 🤝 Next Steps

1. **Claude Sonnet 4.5:** Review this document + SESSION1_BUG_REPORT.md + SESSION2_TESTING_REPORT.md
2. **Claude Sonnet 4.5:** Implement fixes for all 10 bugs (7 root causes)
3. **Testing:** Re-run Session 1 & 2 verification tests
4. **If Passing:** Proceed to Session 3 (Sections 4-5 of checklist: Data Filtering & Chart Tests)
5. **If Failing:** Iterate on fixes until Sessions 1 & 2 pass

---

## 📞 Questions for Claude?

- Need clarification on any bug?
- Want to see specific code sections?
- Need additional test scenarios?
- Have questions about expected behavior?

**Contact:** Refer back to this conversation thread

---

**Document Created:** November 5, 2025  
**Last Updated:** November 5, 2025 (after Session 2)  
**Testing Sessions Complete:** 2 of 5  
**Status:** ⏳ Awaiting fixes before Session 3
