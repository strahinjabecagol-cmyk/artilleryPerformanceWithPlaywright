# Performance Testing with Playwright and Artillery: A Step-by-Step Guide

This guide provides a comprehensive, step-by-step walkthrough of how to set up and run performance tests using Playwright and Artillery. It covers best practices, key metrics to measure, and how to structure your performance testing reports.

## Introduction to Performance Testing with Playwright and Artillery

Combining Playwright's powerful browser automation capabilities with Artillery's robust load generation allows you to create realistic, end-to-end performance tests that simulate real user behavior. This approach enables you to measure and analyze your application's performance from the user's perspective, uncovering bottlenecks and ensuring a smooth user experience under load.

## Step 1: Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js and npm:** Artillery and Playwright are Node.js-based tools. You can download them from [nodejs.org](https://nodejs.org/).
*   **A code editor:** Such as Visual Studio Code, Sublime Text, or Atom.

## Step 2: Project Setup and Installation

1.  **Create a new project directory:**

    ```bash
    mkdir playwright-artillery-tests
    cd playwright-artillery-tests
    ```

2.  **Initialize a Node.js project:**

    ```bash
    npm init -y
    ```

3.  **Install Artillery and Playwright:**

    ```bash
    # Install Artillery
    npm install artillery

    # Install Playwright and its dependencies
    npm install playwright @playwright/test
    npx playwright install
    ```

## Step 3: Configuration

Create an Artillery configuration file named `artillery.yml`. This file defines your test scenario, including the target application, load phases, and the Playwright scripts to execute.

```yaml
config:
  # The target URL for your application
  target: "https://your-application.com"
  
  # Enable the Playwright engine
  engines:
    playwright: {}
    
  # Path to your Playwright test functions
  processor: "./processor.js"
  
  # Define the load phases for the test
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm-up"
    - duration: 120
      arrivalRate: 10
      name: "Load Test"

scenarios:
  - name: "User Login and Dashboard Interaction"
    flow:
      # Call the functions defined in processor.js
      - function: "userLogin"
      - function: "navigateToDashboard"
```

## Step 4: Create a Processor File

The `processor.js` file contains the Playwright scripts that Artillery will execute for each virtual user.

```javascript
const { expect } = require("@playwright/test");

module.exports = {
  userLogin,
  navigateToDashboard,
};

/**
 * Logs a user into the application.
 * @param {import('playwright').Page} page - The Playwright page object.
 */
async function userLogin(page) {
  await page.goto("/login");
  await page.fill('input[name="username"]', "testuser");
  await page.fill('input[name="password"]', "password");
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
}

/**
 * Navigates to the dashboard and verifies the heading.
 * @param {import('playwright').Page} page - The Playwright page object.
 */
async function navigateToDashboard(page) {
  await page.click('a[href="/dashboard"]');
  await expect(page.locator("h1")).toHaveText("Dashboard");
}
```

### Using TypeScript for Processor Files

If you prefer to write your Playwright Page Object Models (POMs) or processor functions in TypeScript, you'll need to compile them to JavaScript before Artillery can execute them. This approach also allows for the reuse of existing Playwright end-to-end test code, reducing duplication and ensuring consistency between functional and performance tests.

1.  **Install TypeScript:**

    ```bash
    npm install -D typescript
    ```

2.  **Create a `tsconfig.json` file:**

    Initialize a `tsconfig.json` in your project root:

    ```bash
    npx tsc --init
    ```

    Modify `tsconfig.json` to output JavaScript files to a `dist` directory. For example:

    ```json
    {
      "compilerOptions": {
        "target": "es2016",
        "module": "commonjs",
        "outDir": "./dist",
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "skipLibCheck": true
      },
      "include": ["./processor.ts"]
    }
    ```

3.  **Rename your processor file to `.ts`:**

    For example, `processor.js` becomes `processor.ts`.

4.  **Compile your TypeScript file:**

    ```bash
    npx tsc
    ```

    This will create `dist/processor.js`.

5.  **Update `artillery.yml`:**

    Change the `processor` path in your `artillery.yml` to point to the compiled JavaScript file:

    ```yaml
    config:
      # ... other configurations
      processor: "./dist/processor.js"
      # ... other configurations
    ```

## Step 5: Running the Test and Generating Reports

While `artillery run` gives you a live console output, for detailed analysis and historical tracking, you should generate a JSON report.

1.  **Run the test with the `--output` flag:**

    This command executes the test and saves the detailed results into a file named `test-run-report.json`.

    ```bash
    npx artillery run artillery.yml --output test-run-report.json
    ```



## Step 6: Analyzing the `results.json` Report

The generated JSON file is the raw data source for your analysis. It contains two main sections: `aggregate` and `intermediate`.

### The `aggregate` Section

This section provides a summary of the entire test run. Here are the key metrics to look for:

*   `scenariosCompleted`: The total number of virtual user scenarios that ran to completion.
*   `scenariosCreated`: The total number of virtual users that were initiated.
*   `requestsCompleted`: The total number of internal Playwright/HTTP requests made.
*   `latency`: An object containing response time statistics in milliseconds. This is one of the most critical metrics.
    *   `min`, `max`, `median`, `p95`, `p99`: These give you a full picture of your response times, from the best case to the worst outliers.
*   `rps`: Requests per second.
    *   `count`: The total number of requests during the measurement period.
    *   `mean`: The average requests per second across the test.
*   `scenarioDuration`: Similar to `latency`, but measures the duration of the entire user scenario.
*   `codes`: A count of each HTTP status code returned (e.g., `200`, `404`, `500`). Useful for spotting server-side errors.
*   `errors`: A count of any errors encountered by Artillery during the test.

### The `intermediate` Section

This section provides a snapshot of performance metrics at regular intervals throughout the test. It's an array of objects, where each object represents a reporting period. This is incredibly useful for:

*   **Identifying trends:** You can see if response times increase as the number of virtual users grows.
*   **Spotting anomalies:** A sudden spike in latency or errors during the test will be visible here.
*   **Correlating with load:** You can map the performance metrics directly to the load defined in your `phases`.

## Best Practices for Effective Performance Testing

-   **Realistic User Journeys:** Design your Playwright scripts to mimic real user flows, including think times and variations in behavior.
-   **Robust Locators:** Use user-facing attributes for locators (e.g., `getByRole`, `getByText`) to avoid brittle tests that break with minor UI changes.
-   **Isolate Tests:** Keep tests independent to ensure that the performance of one test doesn't affect another, leading to more accurate measurements.
-   **Clear Load Profiles:** Define distinct phases in your Artillery configuration (e.g., warm-up, ramp-up, peak load, cool-down) to simulate different load conditions and understand how your application behaves under stress.
-   **Monitor System Resources:** Use tools like `htop`, `vmstat`, or cloud provider monitoring dashboards to keep an eye on CPU, memory, and network usage on your application servers during tests.

## Metrics to Measure

### Key Performance Indicators (KPIs)

-   **Response Time:** The time it takes for the application to respond to a request.
    -   **Average Response Time:** The average time for all requests.
    -   **Peak Response Time:** The longest response time recorded.
    -   **Percentiles (95th, 99th):** The response time for 95% or 99% of requests, which helps to understand the experience of the majority of users.
-   **Throughput:** The number of requests your application can handle per second (RPS). This is a key indicator of your application's capacity.
-   **Error Rate:** The percentage of requests that result in an error. A high error rate can indicate that your application is unstable under load.
-   **Concurrent Users:** The number of virtual users active at a given time. This helps you understand how many users your application can support simultaneously.

### Frontend Metrics (Web Vitals)

-   **Largest Contentful Paint (LCP):** The time it takes for the largest content element (e.g., an image or a block of text) to become visible. A good LCP is 2.5 seconds or less.
-   **First Contentful Paint (FCP):** The time it takes for the first piece of content to be rendered on the screen. This is an important metric for user-perceived performance.
-   **Cumulative Layout Shift (CLS):** Measures the visual stability of the page. A low CLS score indicates that the page is stable and doesn't have elements that shift around unexpectedly.

## Structuring Your Performance Test Report

A good performance test report should be clear, concise, and actionable. Here's a recommended structure:

1.  **Executive Summary:** A high-level overview of the test objectives, key findings, and recommendations. This section is for stakeholders who may not need to know all the technical details.
2.  **Test Objectives:** Clearly state what the performance test aimed to achieve (e.g., "Determine the maximum number of concurrent users the application can support while maintaining an average response time of less than 2 seconds").
3.  **Test Environment:** Details of the hardware, software, and network configuration used for the test. This helps to ensure that the test results are reproducible.
4.  **Methodology:** The types of tests conducted (e.g., load, stress, soak) and the tools used.
5.  **Test Scenarios:** A detailed description of the user journeys that were simulated in the test.
6.  **Results and Analysis:**
    -   Graphs and tables showing the key metrics (response time, throughput, error rate).
    -   Analysis of the application's behavior under different load levels.
    -   Identification of any performance bottlenecks, with supporting data.
7.  **Key Findings and Observations:** A summary of the most important discoveries from the test (e.g., "The application's response time increased significantly when the number of concurrent users exceeded 500").
8.  **Recommendations:** Actionable suggestions for improving performance, such as code optimizations, database tuning, or infrastructure scaling.
9.  **Appendix:** Raw data, logs, and other detailed information that can be used for further analysis.

