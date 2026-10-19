# Testing

## Commands

Run the checks from the repository root:

```sh
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npx playwright install chromium firefox webkit msedge
npm run test:e2e
npm run diagrams:check
npm run build
```

`npm test` runs Vitest unit/integration tests and reports source coverage.
`npm run test:e2e` runs Playwright tests on Chromium, Microsoft Edge, Firefox,
and WebKit.
Playwright reports traces for failures; generated reports and traces are
ignored by Git.

## Requirement-to-test mapping

| Requirement         | Verification                                                                                                                                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FR-001`            | `src/domain/model.test.ts`: modeled class names, public attributes/methods, referenced types, relationship ends and multiplicities.                                                                            |
| `FR-002`–`FR-006`   | `src/domain/stateMachine.test.ts`: initial state, every `t0`–`t8` transition, reservation expiry/cancel, battery threshold, and repair behavior.                                                               |
| `FR-007`            | `src/application/rentBike.test.ts`: independent exact expected records for `m0`–`m7`, including ID, sender, recipient, label, and order; `src/App.test.tsx` and `tests/e2e/rental-flow.spec.ts`: UI rent path. |
| `FR-008`, `FR-011`  | `src/application/returnBike.test.ts`: independent exact expected records for `m0`–`m8`, successful payment, and receipt; component and browser tests verify receipt.                                           |
| `FR-009`            | `src/domain/pricing.test.ts`: zero, partial, exact, and over-minute durations and the configured fee.                                                                                                          |
| `FR-010`, `FR-014`  | `src/infrastructure/mock/seedData.test.ts` and browser reload test: fresh seed state after reload.                                                                                                             |
| `FR-012`            | Production build plus the GitHub Pages deployment and smoke test described in `deployment.md`.                                                                                                                 |
| `FR-013`            | UI exposes only rent and return; state unit tests cover reservation and maintenance transitions without UI.                                                                                                    |
| `NFR-001`           | Browser keyboard flow and axe-core checks on the initial and receipt screens; manual visible-focus review.                                                                                                     |
| `NFR-002`–`NFR-004` | Browser checks on Chromium, Firefox, WebKit; mobile-width layout and locale-aware EUR formatting.                                                                                                              |
| `NFR-005`–`NFR-006` | Production compressed-bundle measurement and separately recorded LCP measurement.                                                                                                                              |
| `NFR-007`           | Formatting, lint, typecheck, tests, build, and code-quality review.                                                                                                                                            |

## Recorded implementation checks

The latest local verification ran clean install, formatting, lint, typecheck,
unit/integration tests, browser tests, diagram reproducibility, and production
build. The 54 unit/integration tests passed across 9 files with no skips.
Coverage was 98.15% statements, 94.56% branches, 96.77% functions, and 98.15%
lines overall. Domain/application coverage exceeds the proposed 80% statement,
branch, and function thresholds. All 16 browser tests passed across four
browsers, including a 375px no-horizontal-overflow check.

The production JavaScript bundle was 196.34 kB uncompressed and 61.95 kB gzip,
below the 200 kB compressed target.

### Browser and performance evidence

Playwright runs used Chromium 156.0.8078.4, Microsoft Edge 155.0.4283.62,
Firefox 157.0, and WebKit 27.2. The Safari-compatible WebKit engine was tested;
Safari itself was not available on this Windows host.

Lighthouse 13.5.0 measured the local production preview at
`http://127.0.0.1:4173/` with mobile simulation (412 × 823 viewport, 1.75 device
scale factor, 150 ms RTT, 1,638.4 Kbps simulated throughput, and 4× CPU
slowdown). LCP was **1,355 ms**, below the 2.5-second target, and the
performance category score was 1. This is a local emulation result, not a
public Pages measurement; device/network representativeness remains a risk.
