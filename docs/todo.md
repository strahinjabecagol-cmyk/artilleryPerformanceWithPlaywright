# Dashboard Reporting Gaps - TODO

This document outlines identified gaps in the current Artillery Performance Dashboard (`docs/index.html`, `docs/dashboard.js`) that limit its effectiveness for comprehensive performance analysis.

## Identified Gaps:

### 1. Lack of Historical Comparison [DONE]
- **Description:** The dashboard currently displays data for only a single `results.json` file. Each new test run overwrites previous data, preventing historical trend analysis.
- **Impact:** Impossible to track performance changes (improvements or regressions) over time, across different deployments, or between test runs.
- **Proposed Solution:** Implement a mechanism to store and load multiple `results.json` files, allowing users to select and compare different test runs. This could involve:
    - A UI element (e.g., dropdown) to select past reports.
    - A backend service or local storage solution to manage report files.

### 2. No Filtering by Test Phase
- **Description:** The charts and metrics aggregate data across the entire test duration. There is no functionality to filter or view performance metrics specific to individual Artillery load phases (e.g., "Warm-up", "Ramp-up", "Peak Load").
- **Impact:** Difficult to analyze system behavior under specific load conditions, especially during critical peak load phases, as less relevant data from other phases can obscure insights.
- **Proposed Solution:** Add UI controls (e.g., checkboxes, dropdown) to filter chart data and summary metrics by specific test phases defined in `artillery.yml`.

### 3. Aggregated Scenario Metrics
- **Description:** When multiple scenarios are defined in `artillery.yml`, the dashboard currently presents aggregated metrics (e.g., "Session Length", "Step Breakdown") across all scenarios.
- **Impact:** Prevents detailed analysis of individual user journeys. Performance bottlenecks or errors specific to a single critical scenario may be masked by the overall averages.
- **Proposed Solution:** Introduce the ability to view metrics per scenario. This could involve:
    - A dropdown to select a specific scenario for detailed view.
    - Separate charts or tables for each scenario.

### 4. Limited Error Details
- **Description:** The dashboard shows counts of HTTP status codes and a breakdown of 4xx vs. 5xx errors. However, it lacks detailed information such as specific error messages or the URLs that failed.
- **Impact:** Debugging performance issues requires manual inspection of raw `results.json` or `execution.log` files to pinpoint the exact cause and location of errors.
- **Proposed Solution:** Enhance error reporting to include:
    - A table or expandable section listing specific error messages.
    - The URLs associated with failed requests.
    - Potentially, links to relevant sections in the `execution.log` for deeper investigation.
