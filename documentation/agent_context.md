# Agent Context: Performance Testing Guide

## Goal

The primary goal of this session is to create a comprehensive, step-by-step guide in a single Markdown file (`performance_testing_with_playwright_and_artillery.md`) for setting up and running performance/load tests using Playwright and Artillery.

## Current Status

We have collaboratively built the guide, covering the following key areas:

1.  **Project Setup:** Initializing a Node.js project and installing Artillery and Playwright.
2.  **Configuration:** Creating the `artillery.yml` file to define test scenarios and load phases.
3.  **Processor File:** Writing the Playwright test logic in a `processor.js` file.
4.  **TypeScript Integration:** Added instructions for using TypeScript for the processor file, including compilation steps and the benefit of reusing existing test code.
5.  **Test Execution:** Running the tests using `artillery run`.
6.  **Reporting:**
    *   Generating a `results.json` file using the `--output` flag.
    *   Removed the deprecated `artillery report` (HTML generation) section.
    *   Detailed breakdown of how to analyze the `aggregate` and `intermediate` sections of the JSON report.
7.  **Best Practices & Metrics:** Included sections on best practices for performance testing and key metrics (KPIs and Web Vitals) to monitor.

## Next Steps

The user is currently preparing a description of a screenshot. This description will be used to inform the next section of the guide, which will focus on creating a custom report based on the `results.json` data.
