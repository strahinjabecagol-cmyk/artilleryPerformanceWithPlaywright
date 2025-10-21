You are an expert frontend developer specializing in data visualization for performance testing dashboards (Artillery, k6, Playwright, Grafana).  
Your task is to take the existing Artillery HTML dashboard code (already styled dark, using Chart.js, and loading data from results.json)  
and upgrade it to a **fully-featured professional dashboard** similar to commercial tools like k6 Cloud or Grafana.

The goal: a self-contained HTML+JS+CSS file that visualizes Artillery results with completeness, flexibility, and professional polish.

---

### Key requirements

1. **Keep the dark theme and styling** consistent with the current file.  
   Use the same font, grid layout, gradients, and card styles.  
   No external frameworks like React or Vue — keep it plain HTML + JS + Chart.js.

2. **Add these new sections and charts:**

   #### 2.1 Throughput Chart
   - Show requests per second (RPS) trend over time.
   - Line chart with mean RPS per interval.
   - Highlight dips visually (e.g., orange markers when <50% of peak).

   #### 2.2 Latency Distribution Histogram
   - Show distribution of response times (grouped into 0–100ms, 100–200ms, etc.).
   - Bar chart with colored bins.

   #### 2.3 Scenario Step Breakdown
   - If the Artillery JSON includes multiple scenario steps (like “login”, “search”, etc.),
     create a horizontal bar chart showing average duration per step.

   #### 2.4 Error Breakdown
   - Add a stacked bar or doughnut chart showing counts of HTTP 4xx vs 5xx errors.

   #### 2.5 Apdex Score
   - Add an Apdex score card (scale 0–1) with color-coded background:
     green >0.9, yellow 0.8–0.9, red <0.8.
   - Compute Apdex dynamically using thresholds (tolerating threshold = 1500ms by default).

   #### 2.6 Test Metadata Section
   - Add a box above summary metrics showing:
     - Test name
     - Target URL
     - Duration
     - Artillery version
     - Timestamp
     - Scenario count
   - Parse this from results.json → `data.config` or `data.aggregate`.

   #### 2.7 Baseline Comparison (optional)
   - Allow user to upload a second JSON file (previous run).
   - When uploaded, overlay the baseline data on charts to compare performance regressions.

3. **Make charts interactive**
   - Integrate `chartjs-plugin-zoom` for zoom/pan on time-based charts.
   - Add hover tooltips with precise timestamps and values.
   - Add chart legends with consistent colors.
   - Smooth animations on load.

4. **Improve chart labeling**
   - Use real timestamps instead of “Period 1, 2, 3”.
   - Add units (ms, RPS, %).
   - Add clear axis titles for each chart.

5. **Add export options**
   - Add “Export as PNG” and “Download JSON” buttons for the entire dashboard.
   - Allow saving individual chart images via Chart.js `toBase64Image()`.

6. **Robust data parsing**
   - Detect metrics dynamically (do not hardcode “https://blazedemo.com” or specific keys).
   - Auto-detect all FCP/LCP/FID/CLS metrics and fall back gracefully if missing.
   - Handle missing intermediate stats or summaries safely.

7. **Performance grading**
   - Add small badges next to key metrics (Good / Warning / Poor) with color-coded labels.

8. **Summary section improvements**
   - Add trend arrows (↑↓) comparing against last run (stored in localStorage).
   - Compute and show “average latency improvement (%)” and “success rate delta (%)”.

9. **Responsive layout**
   - Keep 2-column grid on large screens and 1-column on mobile.
   - Ensure all legends fit within the card area (no cutoff).

10. **Polish**
    - Include subtle animations on card hover and chart rendering.
    - Keep comments explaining every major section.
    - No frameworks — pure JS.

---

### Input:
You will receive the current HTML file (the user already has it, containing a dark dashboard with metrics, charts, tooltips, and fetch logic for results.json).

### Output:
Produce a **complete, production-ready HTML file** that:
- Loads data from `results.json` dynamically.
- Generates all the new sections and charts above.
- Is visually clean, modern, and fully responsive.
- Works offline (no external build tools required).
- Includes detailed code comments for future maintenance.

### Style examples for reference:
- Grafana dashboards
- k6 Cloud summary view
- Datadog latency breakdowns
- Google Core Web Vitals panels

---

### Deliverable:
Return a single complete HTML file with embedded CSS and JS (no snippets or partials).  
Include a short “Features added” comment block at the top summarizing your improvements.
