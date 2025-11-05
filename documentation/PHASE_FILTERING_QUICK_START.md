# Per-Phase Filtering - Quick Start Guide

## 🎯 What is Per-Phase Filtering?

Per-phase filtering allows you to analyze your Artillery load test results by **individual test phases** (ramp-up, steady state, ramp-down, etc.) instead of viewing the entire test at once.

---

## 🖼️ Visual Guide

### Before (Without Filtering):
```
Dashboard shows ALL test data from start to finish
├── Ramp-up phase (60s)
├── Steady state phase (120s)  
└── Ramp-down phase (40s)
Total: 220 seconds of data
```

### After (With Phase Filtering):
```
User clicks "Steady State" chip
Dashboard shows ONLY steady state data
└── Steady state phase (120s)
Total: 120 seconds of filtered data
```

---

## 📊 The Phase Filter UI

Located at the top of the dashboard, just below the header:

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Filter by Phase:                                         │
│                                                              │
│ ┌──────────┐ ┌────────────┐ ┌─────────────┐ ┌───────────┐ │
│ │ All      │ │ Ramp-up    │ │ Steady State│ │ Ramp-down │ │
│ │ Phases   │ │ (60s)      │ │ (120s)      │ │ (40s)     │ │
│ └──────────┘ └────────────┘ └─────────────┘ └───────────┘ │
│   Active       Blue          Green           Orange        │
└─────────────────────────────────────────────────────────────┘
```

**Chip States:**
- **Active** (filled): This phase is selected
- **Inactive** (outline): This phase is not selected
- **Hover**: Chip lifts up with glow effect

---

## 🎮 How to Use

### 1. View All Data (Default)
- By default, "All Phases" is selected
- Dashboard shows complete test results

### 2. Filter by Single Phase
- Click any phase chip (e.g., "Steady State")
- "All Phases" deselects automatically
- Dashboard updates to show only that phase

### 3. Compare Multiple Phases
- Click first phase chip (e.g., "Ramp-up")
- Click second phase chip (e.g., "Ramp-down")
- Dashboard shows combined data from both phases
- Useful for comparing behavior

### 4. Return to All Data
- Click "All Phases" chip
- All other phases deselect
- Dashboard returns to full view

---

## 📈 What Updates When You Filter

### ✅ Metrics Cards:
- Total VUsers
- Completed VUsers
- Failed VUsers
- HTTP Requests
- Session Length
- Success Rate

### ✅ Charts:
- Throughput (RPS)
- HTTP Requests
- VUsers Activity
- Concurrent Users
- FCP Trends
- Combined Metrics
- All time-series charts

### ✅ Visual Indicators:
- Phase boundary markers (vertical lines)
- Phase labels on charts
- Color-coded phase transitions

### ❌ Static Charts (Not Filtered):
- Percentiles Chart (uses aggregate data)
- Status Codes (overall distribution)
- Success/Failure Rate (overall)
- Error Breakdown
- Step Breakdown

---

## 💡 Use Cases

### Use Case 1: Isolate Steady-State Performance
**Scenario:** You want to see how your system performs under constant load, excluding ramp-up/down periods.

**Steps:**
1. Click "Steady State" chip
2. View metrics without ramp effects
3. Get accurate baseline performance

**Benefits:**
- True sustained load metrics
- No skew from ramp periods
- Better SLA validation

---

### Use Case 2: Compare Ramp Behavior
**Scenario:** You want to see if your system recovers the same way it ramps up.

**Steps:**
1. Click "Ramp-up" chip
2. Note the metrics (e.g., p95 latency)
3. Click "Ramp-down" chip
4. Compare the metrics

**Benefits:**
- Identify recovery issues
- Spot resource leaks
- Validate scale-down behavior

---

### Use Case 3: Find Breaking Point
**Scenario:** Your test has progressive load increases, and you want to find where performance degrades.

**Steps:**
1. Filter by "Level 1" → Note metrics
2. Filter by "Level 2" → Note metrics
3. Filter by "Level 3" → Note metrics
4. Identify where latency spikes

**Benefits:**
- Pinpoint capacity limits
- Identify bottlenecks
- Set realistic SLAs

---

### Use Case 4: Spike Recovery Analysis
**Scenario:** You ran a spike test and want to analyze recovery time.

**Steps:**
1. Filter by "Baseline" → Note stable metrics
2. Filter by "Spike 1" → See impact
3. Filter by "Recovery 1" → Check if back to baseline
4. Repeat for additional spikes

**Benefits:**
- Measure recovery time
- Identify lingering effects
- Validate autoscaling

---

## 🎨 Phase Colors

The system automatically assigns colors to phases:

| Phase Index | Color  | Hex Code | Use Case |
|------------|--------|----------|----------|
| 0 | Blue | #3b82f6 | Typically ramp-up |
| 1 | Green | #10b981 | Typically steady state |
| 2 | Orange | #f59e0b | Typically ramp-down |
| 3 | Purple | #8b5cf6 | Additional phases |
| 4 | Pink | #ec4899 | Additional phases |
| 5 | Teal | #14b8a6 | Additional phases |
| 6 | Red | #f43f5e | Additional phases |
| 7 | Cyan | #06b6d4 | Additional phases |
| 8+ | (cycles) | Repeats | Unlimited phases |

---

## 🔍 Phase Boundary Markers

On time-series charts, you'll see:

```
Chart with phase markers:

Latency
  │
  │     Phase 1        │    Phase 2         │  Phase 3
  │    (Ramp-up)       │  (Steady State)    │ (Ramp-down)
500│                    │                    │
  │      /‾‾‾‾‾‾‾‾‾‾‾‾‾│‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾│‾‾‾\
400│     /              │                    │     \
  │    /               │                    │      \
300│   /                │                    │       \
  │  /                 │                    │        \
  └──────────────────────────────────────────────────────> Time
     ^                 ^                    ^
     Blue dashed      Green dashed         Orange dashed
     line             line                  line
```

**What you see:**
- Vertical dashed lines at phase transitions
- Line color matches phase chip color
- Phase name label at top of line

---

## ⚙️ Configuration Examples

### Simple Load Test (1 Phase)
```yaml
phases:
  - duration: 300
    arrivalRate: 50
    name: "Constant Load"
```
**Result:** Only "All Phases" and "Constant Load" chips appear.

### Standard Test (3 Phases)
```yaml
phases:
  - { duration: 60, arrivalRate: 1, rampTo: 10, name: "Ramp-up" }
  - { duration: 120, arrivalRate: 10, name: "Steady state" }
  - { duration: 40, arrivalRate: 10, rampTo: 0, name: "Ramp-down" }
```
**Result:** 4 chips (All + 3 phases)

### Spike Test (5 Phases)
```yaml
phases:
  - { duration: 60, arrivalRate: 10, name: "Baseline" }
  - { duration: 30, arrivalRate: 100, name: "Spike 1" }
  - { duration: 60, arrivalRate: 10, name: "Recovery 1" }
  - { duration: 30, arrivalRate: 150, name: "Spike 2" }
  - { duration: 60, arrivalRate: 10, name: "Recovery 2" }
```
**Result:** 6 chips (All + 5 phases)

### Stress Test (10 Phases)
```yaml
phases:
  - { duration: 60, arrivalRate: 10, name: "Level 1" }
  - { duration: 60, arrivalRate: 20, name: "Level 2" }
  # ... 8 more levels ...
```
**Result:** 11 chips (All + 10 phases), container becomes scrollable

---

## 🚀 Pro Tips

### Tip 1: Focus on Business Hours
If your test simulates a full day, filter to only show business hours phases for relevant metrics.

### Tip 2: Exclude Warmup
First phase is often warmup with unstable metrics. Filter it out to see true performance.

### Tip 3: Compare Peak Periods
Select only high-load phases to understand maximum capacity.

### Tip 4: Isolate Issues
If you see errors in the full test, filter by phase to pinpoint when they started.

### Tip 5: Phase-Specific SLAs
Different phases may have different acceptable latencies. Filter to validate each.

---

## ❓ FAQ

**Q: Can I select all phases except one?**  
A: Currently no, but you can select multiple individual phases.

**Q: Does filtering affect exported data?**  
A: Not yet, but this is planned for future releases.

**Q: What if my test has no named phases?**  
A: System auto-generates "Phase 1", "Phase 2", etc.

**Q: Can I add phases after the test?**  
A: No, phases are detected from test execution data.

**Q: What's the maximum number of phases?**  
A: Unlimited! The UI scales with scrolling for 8+ phases.

**Q: Do phase boundaries align with 10s intervals?**  
A: Not exactly - the system finds the closest matching period.

---

## 🎓 Next Steps

1. **Run your test** with clearly named phases in `artillery.yml`
2. **Open the dashboard** and explore the phase filter
3. **Experiment** with different phase combinations
4. **Share insights** with your team using filtered views
5. **Iterate** on your test configuration based on findings

---

## 📚 Related Documentation

- `PER_PHASE_FILTERING_PLAN.md` - Detailed technical plan
- `PHASE_FILTERING_IMPLEMENTATION.md` - Implementation summary
- `artillery.yml` - Your test configuration
- `docs/logs/execution.log` - Runtime phase information

---

**Happy Testing! 🎉**
