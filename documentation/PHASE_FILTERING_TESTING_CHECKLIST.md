# Per-Phase Filtering - Testing Checklist

## 🧪 Manual Testing Guide

Use this checklist to verify the per-phase filtering feature works correctly.

---

## ✅ Pre-Testing Setup

- [ ] Artillery test has been run with `artillery.yml`
- [ ] `docs/results/results.json` exists and has data
- [ ] `docs/logs/execution.log` exists (optional but recommended)
- [ ] Dashboard opens in browser without errors

---

## 1️⃣ Phase Detection Tests

### Test 1.1: Phase Detection from Log
**Expected:** Phases detected from `execution.log` with correct names

- [ ] Open browser console (F12)
- [ ] Refresh dashboard
- [ ] Look for: `✅ Phases detected from execution.log: 3`
- [ ] Verify phase names match your `artillery.yml`

**Pass Criteria:** Console shows phase detection success with correct count.

---

### Test 1.2: Phase Names Display
**Expected:** Phase chips show actual phase names from config

- [ ] Look at phase filter section
- [ ] Verify phase names match `artillery.yml` (e.g., "Ramp-up for local test")
- [ ] Verify durations shown in parentheses (e.g., "(60s)")

**Pass Criteria:** All phase names and durations are correct.

---

### Test 1.3: Phase Count
**Expected:** Correct number of chips (phases + 1 for "All Phases")

- [ ] Count phase chips in UI
- [ ] Should be: (number of phases in config) + 1
- [ ] Example: 3 phases = 4 chips total

**Pass Criteria:** Chip count matches phase count + 1.

---

## 2️⃣ UI Interaction Tests

### Test 2.1: Default State
**Expected:** "All Phases" is active by default

- [ ] Dashboard loads
- [ ] "All Phases" chip is filled (active state)
- [ ] All other chips are outlined (inactive state)
- [ ] All metrics visible

**Pass Criteria:** Only "All Phases" is active on load.

---

### Test 2.2: Single Phase Selection
**Expected:** Clicking a phase selects it exclusively

1. [ ] Click "Steady State" chip
2. [ ] "Steady State" becomes active (filled)
3. [ ] "All Phases" becomes inactive (outline)
4. [ ] Dashboard updates with filtered data
5. [ ] Period count decreases in test metadata

**Pass Criteria:** Only clicked phase is active, data filters correctly.

---

### Test 2.3: Multi-Phase Selection
**Expected:** Clicking multiple phases selects them all

1. [ ] Click "Ramp-up" chip
2. [ ] Click "Ramp-down" chip (while Ramp-up still selected)
3. [ ] Both chips are active
4. [ ] "All Phases" is inactive
5. [ ] Dashboard shows combined data

**Pass Criteria:** Multiple phases can be selected simultaneously.

---

### Test 2.4: Return to All Phases
**Expected:** Clicking "All Phases" deselects everything else

1. [ ] Have multiple phases selected
2. [ ] Click "All Phases" chip
3. [ ] Only "All Phases" is active
4. [ ] All other chips become inactive
5. [ ] Dashboard shows full data again

**Pass Criteria:** "All Phases" deselects all others.

---

### Test 2.5: Deselection
**Expected:** Clicking active phase deselects it

1. [ ] Select "Steady State"
2. [ ] Click "Steady State" again
3. [ ] "Steady State" deselects
4. [ ] Reverts to "All Phases" automatically

**Pass Criteria:** Deselecting all phases reverts to "All Phases".

---

## 3️⃣ Visual Tests

### Test 3.1: Chip Colors
**Expected:** Each phase has unique color

- [ ] Phase 0 (first): Blue
- [ ] Phase 1 (second): Green
- [ ] Phase 2 (third): Orange
- [ ] Phase 3 (fourth): Purple (if exists)

**Pass Criteria:** Colors match documented palette.

---

### Test 3.2: Hover Effects
**Expected:** Chips react to hover

1. [ ] Hover over any chip
2. [ ] Chip lifts up (translateY)
3. [ ] Glow effect appears
4. [ ] Cursor becomes pointer

**Pass Criteria:** Smooth hover animation.

---

### Test 3.3: Active State Styling
**Expected:** Active chips are visually distinct

- [ ] Active chip has filled background
- [ ] Active chip uses phase color
- [ ] Active chip text is white
- [ ] Inactive chip has outline only

**Pass Criteria:** Clear visual distinction between states.

---

## 4️⃣ Data Filtering Tests

### Test 4.1: Metrics Update
**Expected:** Summary metrics recalculate on filter

1. [ ] Note "Total VUsers" with "All Phases" selected
2. [ ] Select single phase
3. [ ] "Total VUsers" decreases
4. [ ] "HTTP Requests" decreases
5. [ ] "Period Count" decreases

**Pass Criteria:** All metrics show filtered values.

---

### Test 4.2: Success Rate Accuracy
**Expected:** Success rate recalculates correctly

1. [ ] Note success rate with "All Phases"
2. [ ] Select a phase
3. [ ] Success rate may change
4. [ ] Formula: (completed / created) * 100

**Pass Criteria:** Success rate calculation is accurate.

---

### Test 4.3: Duration Calculation
**Expected:** Test duration updates based on filtered phases

1. [ ] "All Phases" shows total duration (e.g., 220s)
2. [ ] Select "Steady State"
3. [ ] Duration shows only that phase (e.g., 120s)

**Pass Criteria:** Duration matches selected phase(s).

---

## 5️⃣ Chart Update Tests

### Test 5.1: Chart Data Updates
**Expected:** All charts regenerate with filtered data

1. [ ] Select a single phase
2. [ ] Check "Throughput (RPS)" chart
3. [ ] Data points decrease
4. [ ] X-axis labels change (fewer periods)
5. [ ] Repeat for all time-series charts

**Pass Criteria:** All charts update with correct filtered data.

---

### Test 5.2: Chart Scales Adjust
**Expected:** Y-axis scales adapt to filtered data

1. [ ] Note max Y-axis value with "All Phases"
2. [ ] Select phase with lower values
3. [ ] Y-axis max decreases automatically
4. [ ] Data is easier to read

**Pass Criteria:** Scales optimize for visible data range.

---

### Test 5.3: Static Charts Unchanged
**Expected:** Non-time-series charts show aggregate data

- [ ] "Success vs Failure Rate" doesn't change
- [ ] "HTTP Status Codes" doesn't change
- [ ] "Error Breakdown" doesn't change

**Pass Criteria:** Pie/donut charts remain stable.

---

## 6️⃣ Phase Marker Tests

### Test 6.1: Markers Appear
**Expected:** Vertical lines show phase boundaries

1. [ ] Select "All Phases"
2. [ ] Look at "Throughput (RPS)" chart
3. [ ] See vertical dashed lines
4. [ ] Lines match phase boundaries

**Pass Criteria:** Phase markers visible on time-series charts.

---

### Test 6.2: Marker Colors
**Expected:** Marker lines use phase colors

- [ ] First boundary line is green (Phase 1 color)
- [ ] Second boundary line is orange (Phase 2 color)
- [ ] Colors match phase chip colors

**Pass Criteria:** Marker colors match phase palette.

---

### Test 6.3: Phase Labels
**Expected:** Phase names appear on markers

- [ ] Look at top of chart
- [ ] Phase names visible near markers
- [ ] Names are readable (dark background)

**Pass Criteria:** Phase labels are clear and positioned correctly.

---

### Test 6.4: Markers Hide When Filtered
**Expected:** Markers don't show on single-phase view

1. [ ] Select single phase
2. [ ] Check charts
3. [ ] No vertical lines (only 1 phase visible)

**Pass Criteria:** Markers only show for multi-phase views.

---

## 7️⃣ Responsive Design Tests

### Test 7.1: Desktop View
**Expected:** Chips display in single row

- [ ] Browser width > 1024px
- [ ] All chips in one row
- [ ] No wrapping
- [ ] Proper spacing

**Pass Criteria:** Clean horizontal layout.

---

### Test 7.2: Tablet View
**Expected:** Chips wrap to multiple rows

- [ ] Browser width 768-1024px
- [ ] Chips wrap naturally
- [ ] Maintains spacing
- [ ] Filter label on separate line

**Pass Criteria:** Responsive wrapping.

---

### Test 7.3: Mobile View
**Expected:** Chips stack vertically or scroll

- [ ] Browser width < 768px
- [ ] Chips are smaller
- [ ] Text remains readable
- [ ] Touch-friendly (easy to tap)

**Pass Criteria:** Usable on mobile devices.

---

### Test 7.4: Many Phases (8+)
**Expected:** Scrollable container for excessive chips

- [ ] Test with 10+ phase config (if available)
- [ ] Container becomes scrollable
- [ ] Scroll bar appears
- [ ] All chips accessible

**Pass Criteria:** Handles many phases gracefully.

---

## 8️⃣ Performance Tests

### Test 8.1: Initial Load Speed
**Expected:** Dashboard loads quickly

- [ ] Clear browser cache
- [ ] Refresh dashboard
- [ ] Measure load time
- [ ] Should be < 2 seconds

**Pass Criteria:** Fast initial load.

---

### Test 8.2: Filter Response Time
**Expected:** Filtering is instant

- [ ] Click phase chip
- [ ] Measure time to chart update
- [ ] Should be < 500ms
- [ ] No lag or freeze

**Pass Criteria:** Smooth, responsive filtering.

---

### Test 8.3: Multiple Filter Changes
**Expected:** Rapid clicking doesn't break UI

- [ ] Rapidly click different phases
- [ ] Click same phase twice
- [ ] Click many phases quickly
- [ ] UI remains stable

**Pass Criteria:** No errors or UI breakage.

---

## 9️⃣ Edge Case Tests

### Test 9.1: Single Phase Test
**Expected:** Works with 1-phase configuration

- [ ] Run test with only 1 phase
- [ ] Dashboard shows "All Phases" + 1 phase chip
- [ ] Both selections work
- [ ] No errors

**Pass Criteria:** Handles single phase gracefully.

---

### Test 9.2: Missing Phase Names
**Expected:** Auto-generates names

- [ ] Remove `name:` from artillery.yml phases
- [ ] Re-run test
- [ ] Dashboard shows "Phase 1", "Phase 2", etc.

**Pass Criteria:** Fallback naming works.

---

### Test 9.3: No execution.log
**Expected:** Falls back to heuristic detection

- [ ] Delete or rename `execution.log`
- [ ] Refresh dashboard
- [ ] Console shows: `⚠️ Could not parse phases from log file`
- [ ] Still detects phases from data patterns

**Pass Criteria:** Fallback detection works.

---

### Test 9.4: Empty Results
**Expected:** Graceful degradation

- [ ] Load dashboard with empty/invalid results.json
- [ ] Shows "No data available" message
- [ ] No JavaScript errors
- [ ] Phase filter hidden or disabled

**Pass Criteria:** Handles missing data gracefully.

---

## 🔟 Browser Compatibility Tests

### Test 10.1: Chrome/Edge
- [ ] All features work
- [ ] Styling correct
- [ ] Charts render
- [ ] No console errors

### Test 10.2: Firefox
- [ ] All features work
- [ ] Styling correct
- [ ] Charts render
- [ ] No console errors

### Test 10.3: Safari
- [ ] All features work
- [ ] Styling correct
- [ ] Charts render
- [ ] No console errors

**Pass Criteria:** Consistent behavior across browsers.

---

## 📊 Test Results Summary

### Expected Results:
✅ **Phase Detection:** 100% success rate  
✅ **UI Rendering:** All phases displayed correctly  
✅ **Data Filtering:** Accurate metric recalculation  
✅ **Chart Updates:** Smooth regeneration  
✅ **Phase Markers:** Visible on appropriate charts  
✅ **Performance:** < 500ms filter response time  
✅ **Browser Support:** Chrome, Firefox, Safari  

---

## 🐛 Bug Reporting Template

If you find issues, report using this template:

```markdown
**Bug Title:** [Short description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**


**Actual Behavior:**


**Environment:**
- Browser: 
- Artillery Version: 
- Test Config: 

**Console Errors:**
```
[paste any console errors]
```

**Screenshots:**
[attach if relevant]
```

---

## ✅ Sign-Off

**Tester Name:** ___________________  
**Date:** ___________________  
**Browser(s) Tested:** ___________________  
**Overall Status:** ⬜ Pass ⬜ Fail ⬜ Needs Review  

**Notes:**
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

---

**Testing Complete! 🎉**
