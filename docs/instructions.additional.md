### Goal
You are a frontend engineer specialized in Chart.js dashboards for performance testing.
Take the existing **Artillery HTML dashboard** (already dark-themed, styled, and using Chart.js with results.json)
and **add the remaining visualizations and features** listed below.
Keep everything in one self-contained HTML file (inline CSS + JS, no frameworks).

### Add the following

1. **Latency Distribution Histogram**
   - Show response-time distribution in 100 ms buckets (0–100, 100–200, …).
   - Bar chart, colored bins (green→orange→red).
   - Display count and percentage per bin.

2. **Scenario Step Breakdown**
   - Parse step summaries (e.g., “login”, “search”, “checkout”) from the JSON.
   - Horizontal bar chart of average duration per step (ms).
   - Highlight the slowest step in red.

3. **HTTP Error Breakdown**
   - Add separate doughnut or stacked-bar chart for **4xx vs 5xx** totals.
   - Tooltip: show exact counts and percentages.

4. **Chart Interactivity**
   - Integrate `chartjs-plugin-zoom` for zoom/pan on time-based charts.
   - Enable hover tooltips with precise timestamps and smooth animation.

5. **Export Options**
   - Buttons to export individual charts as PNG and download current `results.json`.

6. **Data Handling**
   - Detect metric keys dynamically (no hard-coded URLs).
   - Handle missing summaries safely with defaults (0 or “N/A”).

7. **Visual Polish**
   - Keep the same dark theme and grid.
   - Add subtle animations, axis titles with units (ms, %, RPS).
   - Responsive layout: two columns on desktop, one on mobile.

### Output
Return one complete, runnable HTML file (CSS + JS inline) implementing all features above.
Include short comments explaining each new section and how the data is parsed.
