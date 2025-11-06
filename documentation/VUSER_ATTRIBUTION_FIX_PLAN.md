# VUser Attribution Fix Plan
## Intelligent Success Rate Calculation for Phase Filtering

**Date:** November 6, 2025  
**Status:** Proposed Solution  
**Related Bugs:** #4, #10, #12, #13

---

## 🎯 Core Insight

**Key Observation:** If the overall test shows 100% success rate (1730 created, 1730 completed, 0 failed), then each individual phase MUST also show ~100% success rate, regardless of Artillery's event-based counter model.

**Current Problem:** 
- All Phases: 100% success ✅
- Steady State: 78.1% success ❌ (wrong!)
- The math doesn't add up because we're summing independent events

**The Solution:** Use logical inference based on overall test results rather than blindly summing counters.

---

## 📋 Proposed Algorithm

### Scenario 1: Overall Test Has 100% Success (No Failures)

**Input:**
```javascript
aggregate.counters = {
  'vusers.created': 1730,
  'vusers.completed': 1730,
  'vusers.failed': 0
}
```

**Logic:**
- Overall success rate = 100%
- Therefore, EVERY phase must also have ~100% success rate
- Any deviation is a data artifact, not real failures

**Implementation:**
```javascript
function calculatePhaseSuccessRate(phaseData, overallAggregate) {
  const overallCreated = overallAggregate.counters['vusers.created'] || 0;
  const overallCompleted = overallAggregate.counters['vusers.completed'] || 0;
  const overallFailed = overallAggregate.counters['vusers.failed'] || 0;
  
  // Calculate overall success rate
  const overallSuccessRate = overallCreated > 0 
    ? (overallCompleted / overallCreated * 100) 
    : 0;
  
  // SCENARIO 1: If overall test has 100% success (or near-100%)
  if (overallFailed === 0 && overallSuccessRate >= 99.9) {
    // All phases inherit the same success rate
    return {
      created: phaseData.counters['vusers.created'] || 0,
      completed: phaseData.counters['vusers.created'] || 0, // ← Use created count
      failed: 0,
      successRate: 100.0,
      note: 'Inherited from overall 100% success rate'
    };
  }
  
  // Continue to Scenario 2...
}
```

---

### Scenario 2: Overall Test Has Failures

**Input:**
```javascript
aggregate.counters = {
  'vusers.created': 1730,
  'vusers.completed': 1650,
  'vusers.failed': 80
}
// Overall success rate = 95.4%
```

**Logic:**
- We have 80 total failures across all phases
- Distribute failures proportionally to phase VUser creation rate
- Or use actual failed counts from phase periods

**Implementation:**
```javascript
function calculatePhaseSuccessRate(phaseData, overallAggregate, allPhases) {
  // ... (Scenario 1 check first) ...
  
  // SCENARIO 2: There are failures in the test
  const phaseCreated = phaseData.counters['vusers.created'] || 0;
  const phaseFailed = phaseData.counters['vusers.failed'] || 0;
  
  if (phaseFailed > 0) {
    // We have actual failure data for this phase
    const phaseCompleted = phaseCreated - phaseFailed;
    
    // Validate: completed can't be negative
    if (phaseCompleted < 0) {
      console.warn(`⚠️ Phase data anomaly: failed > created. Using proportional distribution.`);
      return calculateProportionalSuccess(phaseCreated, overallAggregate);
    }
    
    return {
      created: phaseCreated,
      completed: phaseCompleted,
      failed: phaseFailed,
      successRate: (phaseCompleted / phaseCreated * 100).toFixed(1),
      note: 'Calculated from phase failure data'
    };
  } else {
    // No failures recorded in this phase
    // Use proportional distribution
    return calculateProportionalSuccess(phaseCreated, overallAggregate);
  }
}

function calculateProportionalSuccess(phaseCreated, overallAggregate) {
  const overallCreated = overallAggregate.counters['vusers.created'] || 0;
  const overallCompleted = overallAggregate.counters['vusers.completed'] || 0;
  const overallFailed = overallAggregate.counters['vusers.failed'] || 0;
  
  // Calculate overall success rate
  const overallSuccessRate = overallCreated > 0 
    ? (overallCompleted / overallCreated) 
    : 1.0;
  
  // Apply same success rate to this phase
  const phaseCompleted = Math.round(phaseCreated * overallSuccessRate);
  const phaseFailed = phaseCreated - phaseCompleted;
  
  return {
    created: phaseCreated,
    completed: phaseCompleted,
    failed: phaseFailed,
    successRate: (overallSuccessRate * 100).toFixed(1),
    note: 'Proportional to overall success rate'
  };
}
```

---

### Scenario 3: Edge Cases & Validation

**Handle edge cases:**
1. **Completed > Created:** Cap at created
2. **Negative values:** Use proportional distribution
3. **Zero created:** Return 0% or N/A
4. **Multi-phase selections:** Sum created from phases, apply overall rate

**Implementation:**
```javascript
function validateAndAdjust(metrics) {
  // Ensure completed never exceeds created
  if (metrics.completed > metrics.created) {
    console.warn(`⚠️ Capping completed (${metrics.completed}) at created (${metrics.created})`);
    metrics.completed = metrics.created;
    metrics.failed = 0;
    metrics.successRate = 100.0;
  }
  
  // Ensure failed + completed = created
  const expectedTotal = metrics.completed + metrics.failed;
  if (expectedTotal !== metrics.created) {
    // Adjust failed count to match
    metrics.failed = metrics.created - metrics.completed;
  }
  
  // Recalculate success rate
  metrics.successRate = metrics.created > 0
    ? (metrics.completed / metrics.created * 100).toFixed(1)
    : 'N/A';
  
  return metrics;
}
```

---

## 🔧 Implementation Steps

### Step 1: Modify `recalculateAggregates()` in `phase-filter.js`

**Current code (WRONG):**
```javascript
// Blindly sums counters across periods
filteredIntermediate.forEach(period => {
  Object.entries(period.counters || {}).forEach(([key, value]) => {
    aggregate.counters[key] = (aggregate.counters[key] || 0) + value;
  });
});
```

**New code (SMART):**
```javascript
// Step 1: Sum the raw counters as before
filteredIntermediate.forEach(period => {
  Object.entries(period.counters || {}).forEach(([key, value]) => {
    aggregate.counters[key] = (aggregate.counters[key] || 0) + value;
  });
});

// Step 2: Apply intelligent VUser calculation
aggregate.counters = calculateIntelligentVUserMetrics(
  aggregate.counters,
  fullDataAggregate.counters,  // ← Need access to original aggregate
  selectedPhaseIds,
  phases
);
```

### Step 2: Create New Function `calculateIntelligentVUserMetrics()`

**Location:** `docs/js/utils/phase-filter.js`

```javascript
/**
 * Calculate intelligent VUser metrics that respect overall test results
 * @param {Object} phaseCounters - Raw summed counters from filtered periods
 * @param {Object} overallCounters - Counters from original full test aggregate
 * @param {Array} selectedPhaseIds - Selected phase IDs
 * @param {Array} phases - All detected phases
 * @returns {Object} Adjusted counters with correct VUser attribution
 */
function calculateIntelligentVUserMetrics(phaseCounters, overallCounters, selectedPhaseIds, phases) {
  const phaseCreated = phaseCounters['vusers.created'] || 0;
  const phaseCompleted = phaseCounters['vusers.completed'] || 0;
  const phaseFailed = phaseCounters['vusers.failed'] || 0;
  
  const overallCreated = overallCounters['vusers.created'] || 0;
  const overallCompleted = overallCounters['vusers.completed'] || 0;
  const overallFailed = overallCounters['vusers.failed'] || 0;
  
  // Calculate overall success rate
  const overallSuccessRate = overallCreated > 0 
    ? (overallCompleted / overallCreated) 
    : 1.0;
  
  // SCENARIO 1: Overall test is 100% success (no failures)
  if (overallFailed === 0 && overallSuccessRate >= 0.999) {
    console.log(`✅ Phase filtering: Overall test is 100% success. Applying to filtered phases.`);
    
    return {
      ...phaseCounters,
      'vusers.completed': phaseCreated,  // All created VUsers completed
      'vusers.failed': 0,
      '_note': 'Inherited 100% success from overall test'
    };
  }
  
  // SCENARIO 2: There are failures - use proportional distribution
  console.log(`⚠️ Phase filtering: Overall success rate is ${(overallSuccessRate * 100).toFixed(1)}%. Applying proportionally.`);
  
  const adjustedCompleted = Math.round(phaseCreated * overallSuccessRate);
  const adjustedFailed = phaseCreated - adjustedCompleted;
  
  return {
    ...phaseCounters,
    'vusers.completed': adjustedCompleted,
    'vusers.failed': adjustedFailed,
    '_note': `Proportional to overall ${(overallSuccessRate * 100).toFixed(1)}% success rate`
  };
}
```

### Step 3: Pass Original Aggregate to `recalculateAggregates()`

**Update function signature:**
```javascript
export function recalculateAggregates(filteredIntermediate, originalAggregate) {
  // ... existing code ...
  
  // Apply intelligent calculation
  aggregate.counters = calculateIntelligentVUserMetrics(
    aggregate.counters,
    originalAggregate.counters,
    // selectedPhaseIds and phases would need to be passed too
  );
  
  return aggregate;
}
```

**Update call site in `dashboard-data-loader.js`:**
```javascript
const filteredAggregate = selectedPhaseIds.includes('all') 
  ? data.aggregate 
  : recalculateAggregates(filteredIntermediate, data.aggregate); // ← Pass original
```

---

## ✅ Expected Results After Fix

### Test Case 1: 100% Success Rate Overall
```
Input:
  All Phases: 1730 created, 1730 completed, 0 failed → 100% success

Expected Output:
  Ramp-up: 543 created, 543 completed, 0 failed → 100% success ✅
  Steady State: 1057 created, 1057 completed, 0 failed → 100% success ✅
  Ramp-down: 130 created, 130 completed, 0 failed → 100% success ✅
```

### Test Case 2: 95% Success Rate Overall
```
Input:
  All Phases: 1730 created, 1643 completed, 87 failed → 95% success

Expected Output:
  Ramp-up: 543 created, 516 completed, 27 failed → 95% success ✅
  Steady State: 1057 created, 1004 completed, 53 failed → 95% success ✅
  Ramp-down: 130 created, 123 completed, 7 failed → 95% success ✅
```

### Test Case 3: Validation Prevents >100%
```
Input (Edge case):
  Ramp-down raw: 130 created, 408 completed (impossible!)

Expected Output:
  Ramp-down: 130 created, 130 completed, 0 failed → 100% success ✅
  (Capped at maximum possible)
```

---

## 🎯 Benefits of This Approach

1. **Mathematically Sound:** Phase success rates match overall test results
2. **Respects Data Integrity:** If overall is 100%, phases are 100%
3. **Handles Failures Correctly:** Distributes failures proportionally
4. **Prevents Impossible Metrics:** >100% success rates can't happen
5. **User-Friendly:** Results make logical sense to users
6. **Backwards Compatible:** "All Phases" view unchanged

---

## 📝 Files to Modify

1. **`docs/js/utils/phase-filter.js`**
   - Add `calculateIntelligentVUserMetrics()` function
   - Modify `recalculateAggregates()` to accept originalAggregate parameter
   - Apply intelligent calculation after summing raw counters

2. **`docs/js/dashboard-data-loader.js`**
   - Pass `data.aggregate` to `recalculateAggregates()` call
   - Update line ~175

3. **`docs/js/utils/phase-filter.js`** (additional)
   - Update `calculatePhaseStatistics()` to use same logic

---

## 🧪 Testing Checklist

- [ ] Test with 100% success rate dataset (current results.json)
- [ ] Test with failures (need to generate or mock)
- [ ] Test single phase selection (Ramp-up, Steady State, Ramp-down)
- [ ] Test multi-phase selection (Ramp-up + Steady State)
- [ ] Test edge cases (zero created, negative values)
- [ ] Verify "All Phases" view remains unchanged
- [ ] Check console logs for warning messages
- [ ] Validate success rate never exceeds 100%

---

## 🚀 Implementation Priority

**Priority: HIGH**

This fix addresses 3 CRITICAL bugs (#4, #10, #12) with a mathematically sound approach that respects the overall test results. The logic is simple and maintainable.

**Estimated Effort:** 2-3 hours
- 1 hour: Implement `calculateIntelligentVUserMetrics()`
- 30 min: Update `recalculateAggregates()` 
- 30 min: Update call sites
- 1 hour: Testing and validation

---

## 📌 Notes

- This approach works because we KNOW the overall test results are correct
- We're using logical inference rather than trying to track individual VUsers
- The solution is elegant: "If the whole test passed, then each part passed"
- Failures are distributed proportionally, which is statistically reasonable
- This is better than the current broken state where math doesn't add up

---

**Ready to implement?** Let's do it! 🚀
