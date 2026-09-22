# LabAST Pro

## PROBLEM IDENTIFICATION
During our microbiology (drug succipteblity test)(AST) we faced at least the issues mentioned here.
- 1. Scrolling throigh pages to just look MOs succipteblity
- 2. Obtianing results for a patient takes time & is errorful
- 3. for reasearch and other purposes it was difficult (adds other tasks) on data processing

Offline-first dashboard for logging and interpreting Antimicrobial Susceptibility
Testing (AST) results — disk-diffusion entry, auto S/I/R interpretation, an
antibiogram view, and basic QC tracking. Data is stored locally in the browser
via IndexedDB (Dexie), so it works without an internet connection.

> ⚠️ **Educational / reference project only.** Breakpoints are a small hardcoded
> subset referenced from CLSI M100 (33rd Ed., 2023) and have not been
> independently re-verified. This is **not** validated clinical decision-support
> software — do not use it to guide real patient care. See
> `src/utils/breakpoints.js` for details and sources.

## Features

- Enter AST results and get an automatic S/I/R interpretation
- Flags combinations (e.g. Vancomycin vs. *S. aureus*) that require MIC testing
  rather than disk diffusion
- Searchable/filterable result history, CSV export
- Antibiogram view with % susceptibility and a low-sample-size (n < 30) warning
- QC module against ATCC reference ranges
- Installable PWA, works offline

## Getting started

```bash
npm install
npm run dev       # start local dev server
npm run build      # production build to dist/
npm run preview   # preview the production build
```

## Tech stack

React, Zustand, Dexie (IndexedDB), Chart.js, jsPDF, Tailwind CSS, Vite + vite-plugin-pwa.

## Data & privacy

All data stays in your browser's IndexedDB — nothing is sent to a server.
Patient ID is optional; use an anonymized code rather than a real name.
There is no authentication or encryption at rest, so don't use this with real
identifiable patient data. "Clear All Data" on the History tab permanently
deletes everything stored locally.

## License

MIT

## DEMO

(link)[https://ast-utilsboard.vercel.com]

## CONTACT ME

++251936711812 (telegram  or phone)
(portfolio)[enideg.pythonanywhere.com]
