# Dashboard Report Analysis - Issues Summary (2025-10-31)

This document lists all identified issues in the Artillery Performance Dashboard, based on the uploaded files `results.json`, `execution.log`, and dashboard screenshot.

---

## 🧾 Summary-Level Issues

1. **Duration always shows `0.0s`**
   - Root cause: `duration` is not calculated from `firstMetricAt` and `lastMetricAt`.
   - Fix: Compute manually: `duration = (lastMetricAt - firstMetricAt) / 1000`.

2. **“Apex (HTTP Latency)” shows `1.000 (Excellent)`**
   - Root cause: Code reads wrong field or divides latency by 1000 twice.
   - Real mean latency ≈ **306.9 ms**, not 1.000 ms.
   - Fix: Use `custom.http_latency.mean` directly, without normalization.

3. **Uppercase metric variants (`custom.FCP`, `custom.TTFB`, etc.) show all zeros or NaN**
   - Root cause: Case sensitivity — dashboard doesn’t merge metrics with same meaning but different casing.
   - Fix: Normalize keys to lowercase before processing (e.g. `toLowerCase()` on metric names).

4. **`duration`, `apex`, and some averages use missing or null data**
   - Root cause: JSON has `null` for some fields, but code doesn’t check before math operations.
   - Fix: Add validation before numeric conversions.

---

## 📊 Chart-Level Issues

5. **Combined Metrics chart misalignment**
   - “Response Time” line likely uses `vusers.session_length` mean in one place and `custom.http_latency` in another.
   - Fix: Use a consistent data source for latency (prefer `custom.http_latency.mean`).

6. **FCP chart scale inconsistency**
   - The average is stable (≈290 ms) but graph scale fluctuates too widely (up to 600+ ms).
   - Likely caused by mixed lowercase/uppercase aggregation or inconsistent percentile parsing.
   - Fix: Unify `fcp` source and correct percentile mapping.

7. **Scenario step performance chart missing last step**
   - Missing “Search for Flights” or “Results Page” step data.
   - Root cause: `browser.step.Search for Flights` not included in chart dataset array.
   - Fix: Ensure all `browser.step.*` metrics are pushed to chart.

8. **Latency distribution chart appears flat or empty**
   - Data exists (100–400 ms range), but histogram binning too coarse.
   - Fix: Use smaller bucket size (e.g., 50 ms or dynamic based on min/max).

9. **RPS and throughput metrics slightly out of sync**
   - RPS line likely derived from incomplete time window normalization.
   - Fix: Use `period` timestamps from intermediate metrics consistently.

---

## 💻 Data Parsing & Normalization Issues

10. **NaN / Infinity values appear in execution log**
    - The JSON and log contain many entries like:
      ```
      custom.FCP: Infinity / -Infinity / NaN
      ```
    - Fix: Filter out invalid numeric values before averaging.

11. **Metric names duplicated with inconsistent casing**
    - `custom.FCP` and `custom.fcp` both appear, causing double entries and empty charts.
    - Fix: Force lowercase normalization on all metric keys.

12. **Missing validation for empty arrays**
    - Some summaries have `count: 0` but dashboard still divides totals.
    - Fix: Skip empty datasets gracefully.

---

## 🔍 Visual / UI Issues

13. **Charts with 0 lines or flatlines**
    - Likely due to `NaN` or null values post-parsing.
    - Fix: Check for numeric values before plotting and set default 0 only if metric truly absent.

14. **Percentile charts render p95/p99 wrong for null-based metrics**
    - E.g. `custom.FCP` p95 = 0 though p95 = 347 ms in lowercase dataset.
    - Fix: Ensure percentile extraction uses valid dataset.

---

## ✅ All-In-One Summary

| Category | Issue | Status |
|-----------|--------|--------|
| Summary panel | Duration = 0 | ❌ |
| Summary panel | Apex value incorrect | ❌ |
| Data parser | Upper/lowercase mix causes zeros | ❌ |
| Charts | Combined metrics mismatch | ⚠️ |
| Charts | FCP scale inconsistent | ⚠️ |
| Charts | Missing scenario step(s) | ⚠️ |
| Charts | Flat latency histogram | ⚠️ |
| Data parser | NaN / Infinity values | ❌ |
| Data parser | Empty dataset handling | ⚠️ |
| Visuals | Flat/empty lines | ⚠️ |

---

**Generated:** 2025-10-31  
**Source files:** `artillery-results-2025-10-31.json`, `artillery-execution-2025-10-31.log`
