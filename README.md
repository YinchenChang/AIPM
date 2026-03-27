# AIPM

Active AI Equity Portfolio Monitor is a static browser app for tracking a curated AI-focused equity portfolio, comparing it against a benchmark, and stress-testing forward assumptions with an interactive financial model.

## Features

- Portfolio dashboard with YTD, since-inception, alpha, attribution, and risk metrics
- Stock detail views with active weight, target price, rationale, valuation comps, and live market-cap drift
- Interactive FY26-FY30 financial model with editable revenue growth, margins, and share counts
- Dynamic DCF output that uses year-specific share assumptions
- Optional Google Finance sync with per-request timeout handling

## Project Structure

- `index.html`: main app entrypoint
- `styles.css`: shared styles and responsive layout rules
- `state.js`: global app config and runtime state
- `data.js`: portfolio dataset
- `finance.js`: return calculations, table engine, and DCF logic
- `sync.js`: live-price fetching logic
- `app.js`: UI wiring, navigation, and chart initialization
- `AIPM.html`: redirect to `index.html` for backward compatibility

## Run Locally

Open `index.html` in a browser.

If the browser blocks local script loading or remote fetch behavior, serve the folder with a simple local static server instead of opening the file directly.

## Notes

- The app is intentionally framework-free and build-free.
- Live price sync depends on third-party proxy endpoints and may fail if those services are blocked or rate-limited.
- The local `.claude/` folder is not part of the published app.
