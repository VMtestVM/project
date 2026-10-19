# E-bike Rental

A small static client-side app foundation for the e-bike rental demonstration. This Phase 1 shell intentionally contains no rental domain model, state machine, or customer flow; those belong to later, separately gated phases.

## Requirements

- Node.js 24 (npm is included)

## Get started

```sh
npm ci
npm run dev
```

Vite prints a local development URL. To make a production build and preview it locally:

```sh
npm run build
npm run preview
```

## Project checks

```sh
npm run format       # Format tracked project source and configuration
npm run format:check # Verify formatting without writing files
npm run lint         # Run ESLint
npm run typecheck    # Check application and Vite configuration types
npm test             # Run the full configured unit suite and report coverage
npm run build        # Type-check the app and create the static production build
```

The initial GitHub Actions workflow runs `npm ci`, formatting verification, lint, type-check, the full unit suite with coverage, and a production build on pushes and pull requests. GitHub Pages deployment is not configured in this phase.

## Structure

- `src/App.tsx` and `src/main.tsx`: minimal React presentation shell and browser entry point.
- `src/styles.css`: shell styling.
- `src/App.test.tsx`: initial render smoke test.
- `vite.config.ts`: Vite, Vitest, and relative static-asset base configuration.

The production build is static and suitable for hosting below a repository path. Vite reports the generated JavaScript's estimated gzip size during `npm run build`; the Phase 1 recorded result is maintained in the implementation plan's progress log and compared with the 200 KB compressed-JavaScript target (`NFR-005`).
