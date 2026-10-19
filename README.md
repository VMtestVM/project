# Pedal E-bike Rental

A static, client-side mock-up of the diagrammed e-bike rental flows. It runs
without a backend, accounts, browser storage, or real payment credentials.
Reloading the page restores the seeded demo bike.

## Requirements

- Node.js 24 with npm

## Get started

```sh
npm.cmd ci
npm.cmd run dev
```

Vite prints a local URL. To verify the static production build:

```sh
npm.cmd run build
npm.cmd run preview
```

## Project checks

```sh
npm.cmd run format:check
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run test:e2e
npm.cmd run test:safari # native Safari; requires macOS and safaridriver
npm.cmd run diagrams:check
npm.cmd run build
```

The unit/integration suite runs with coverage. Playwright browser tests run the rent, return, reload, keyboard, responsive, and
accessibility checks on Chromium, Microsoft Edge, Firefox, and WebKit; install
their browsers with `npx playwright install chromium firefox webkit msedge` if
they are not already available. The CI workflow runs a separate native Safari
rent/return/reload smoke test on macOS.

## Architecture and model alignment

- `src/domain/`: the four UML classes, transition logic, pricing, and inventory
  helpers.
- `src/application/`: orchestration for the exact successful rent and return
  sequences.
- `src/infrastructure/mock/`: fresh seed data and successful-only payment mock.
- `src/App.tsx`: customer presentation for rent, return, and receipt.
- `docs/diagrams/generated/`: reproducible Mermaid diagrams derived from code.

The source diagrams are the model ground truth. Generated class, state, and
sequence diagrams are compared against them; use-case and activity diagrams
are explicitly derived from code and have no UML ground truth. See
[`docs/architecture.md`](docs/architecture.md),
[`docs/testing.md`](docs/testing.md), and
[`docs/deployment.md`](docs/deployment.md) for details.
