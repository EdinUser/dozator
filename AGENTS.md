# Agent Guide

This file is for future coding-agent sessions. Treat `Дозатор` as a safety-sensitive calculator, not as a general medical assistant.

## Product Boundary

- The app is a transparent medication arithmetic helper for trained healthcare professionals.
- It must not recommend medicines, doses, diluents, compatibility, stability, expiry, routes, protocols, or patient-specific decisions.
- All UI copy is Bulgarian, except SI/unit strings such as `mg`, `mL`, `µg`, `L`, `min`, `h`.
- All calculation data stays in the browser. Do not add a backend or server-side storage without an explicit product decision.
- Shared links and QR codes may contain only whitelisted calculation fields. Do not include patient names, EGN, diagnosis, hospital number, or free medical notes.
- Do not commit production hostnames, IP addresses, SSH ports, server users, filesystem paths, ownership values, domains, or DNS/control-panel details.

## Tech Stack

- Vite
- Vanilla JavaScript modules
- Bootstrap 5
- Vitest
- Playwright plus axe for E2E/accessibility
- Static PWA files in `public/`

Do not introduce React, Vue, a backend, a drug database, or a templating framework unless the user explicitly approves the architecture change. If templating is introduced later, template files must live outside Vite JS modules.

## Where Things Live

- `src/calculators/`: pure calculator functions. These return result objects and must not touch the DOM or storage.
- `src/units/units.js`: decimal parsing, unit conversion, number formatting, and conversion traces.
- `src/safety/warnings.js`: generic safety validations and warnings.
- `src/i18n/bg.js`: Bulgarian UI text and instruction strings.
- `src/ui/views.js`: HTML render helpers.
- `src/main.js`: app orchestration, events, Bootstrap modals, restore flow, QR generation, history/templates.
- `src/storage/`: localStorage history/templates and summaries.
- `src/share/share-link.js`: QR/URL hash encode/decode and share-field allowlist.
- `src/pwa/` and `public/service-worker.js`: service worker registration and offline app shell caching.
- `docs/clinical-validation.md`: formulas, assumptions, limitations, and medical review status.
- `docs/testing.md`: required test strategy and commands.

## Result Contract

Calculator functions should return one of these shapes:

```js
{ ok: false, errors: string[], fieldErrors: [{ name: string, message: string }] }
```

```js
{
  ok: true,
  primary: string,
  instructions: string[],
  finalLines: string[],
  notices: string[],
  traces: string[],
  warnings: string[],
  label: {
    totalAmount: string,
    finalVolume: string,
    concentration: string,
    recipe: string
  }
}
```

UI code depends on this contract. If it changes, update unit, golden, E2E, and docs together.

## Change Rules

- Keep formulas in calculator modules and add/adjust tests in the same branch.
- Parse form numbers through `parseDecimal`; do not use direct `Number()` on user input.
- Keep leading zero formatting: `0.5 mL`, not `.5 mL`; avoid unnecessary trailing zeros.
- Show explicit conversion notices when units differ.
- Keep field-level validation errors tied to the relevant inputs with `aria-invalid` and `aria-describedby`.
- Restore from QR/history/templates must recalculate locally and show the previous-calculation warning.
- History is last 10 successful calculations per calculator type.
- Templates are user-saved calculations with an optional name.
- High-alert behavior is a user checkbox only; the app must not claim to detect high-alert medications.
- When changing PWA assets or versioning, keep `package.json`, `src/app-version.js`, `public/service-worker.js`, `public/manifest.webmanifest`, and `CHANGELOG.md` in sync as needed.

## Required Checks

Before a PR, run:

```bash
npm run test:all
git diff --check
```

For quick iteration:

```bash
npm test
npm run build
npm run test:e2e
```

The CI workflow runs tests and build on PRs to `main`; deploy runs only after push to `main`.

## Documentation To Update

- Formula, units, or safety behavior: update `docs/clinical-validation.md`.
- Test strategy or commands: update `docs/testing.md`.
- Architecture or module boundaries: update `docs/architecture.md`.
- Local workflow or branch/PR process: update `docs/development.md`.
- CI/CD or deployment behavior: update `docs/deployment.md`.
- Privacy, QR payload, or secret-handling behavior: update `docs/privacy-security.md`.
