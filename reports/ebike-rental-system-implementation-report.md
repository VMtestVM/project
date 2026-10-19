# E-bike Rental Implementation Report

**Assessment status:** Incomplete — locally verified; public deployment and
native Safari verification remain outstanding.  
**Assessment date:** 2026-10-19  
**Sources:** UML files in `C:\Users\akomp\Downloads\`, the binding
specification in [`../specs/ebike-rental-system-specification.md`](../specs/ebike-rental-system-specification.md),
and the phase record in
[`../plans/ebike-rental-system-implementation-plan.md`](../plans/ebike-rental-system-implementation-plan.md).

## 1. Summary and verdict

The static React/Vite implementation runs the modeled successful rent and
return flows against fresh in-memory seed data. The four UML classes and their
public members, three relationships, Bike states and transitions, and both
sequence diagrams are mapped below as **aligned**. No diagram-defined element
was intentionally added, removed, renamed, or changed. Code-generated class,
state, and sequence diagrams are reproducible and their element lists match
the respective input diagrams. The additional use-case and activity diagrams
are labeled as derived from code, with no UML ground truth.

All local format, lint, type, unit/integration, browser, diagram-generation,
and production-build checks pass. Coverage exceeds the proposed 80% domain
and application thresholds. The local mobile-emulation LCP and compressed
JavaScript budgets pass.

**Overall conformance verdict: PARTIAL / NOT YET FULLY CONFORMANT.** This is
not a completion claim. Phase 8 remains open because native Safari could not
be tested on this Windows host. Phase 9 remains blocked because no GitHub
Actions run, public Pages deployment, or deployed-site smoke test was
performed. No remote was contacted or updated. The local LCP result is not a
substitute for deployed performance evidence.

## 2. Code quality assessment

| Criterion                | Assessment and concrete evidence                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Readability and naming   | Domain behavior, application orchestration, mock adapters, UI, and tests are in separate folders. Flow functions and test names describe the modeled action. TypeScript is strict; `npm run typecheck` passes.                                                                                                                                                                                    |
| Model documentation      | Public domain classes and operations identify their source diagram cells in [`../src/domain/model.ts`](../src/domain/model.ts). State and sequence data are traceable by IDs in [`../src/domain/stateMachine.ts`](../src/domain/stateMachine.ts), [`../src/application/rentBike.ts`](../src/application/rentBike.ts), and [`../src/application/returnBike.ts`](../src/application/returnBike.ts). |
| Structure and separation | `src/domain/` owns model behavior, `src/application/` owns flow ordering, `src/infrastructure/mock/` owns seed/payment adapters, and [`../src/App.tsx`](../src/App.tsx) owns presentation. Inventory and lock bookkeeping use external WeakMaps to avoid adding public UML members.                                                                                                               |
| Error handling           | Invalid internal bike, station, trigger, pricing, and payment invocations throw explicit errors. The application intentionally models only successful rent/return sequences; no unmodeled payment or network failure UI is included.                                                                                                                                                              |
| Maintainability          | Dependencies are pinned in `package.json`/`package-lock.json`; formatting, ESLint, type checking, unit/integration tests, E2E, diagram generation, and build are scripted. Architecture, testing, and deployment conventions are documented in `docs/`.                                                                                                                                           |
| Accessibility            | Playwright verifies keyboard operation, a 3px visible focus outline, and axe-core on landing and receipt screens across four browser projects. No automated axe violations remain. This evidence is not a substitute for manual assistive-technology review or a native Safari run.                                                                                                               |
| Performance              | Production bundle: 196.34 kB JavaScript / 61.95 kB gzip, under the 200 kB budget. Lighthouse mobile emulation on the local production preview measured LCP at 1,355 ms, under the 2.5 s target. The public deployment has not been measured.                                                                                                                                                      |

## 3. Verification results

### Final local verification

Executed after a clean `npm ci` using portable Node.js 24.20.0:

| Check                    | Result                                                                 |
| ------------------------ | ---------------------------------------------------------------------- |
| `npm run format:check`   | Passed                                                                 |
| `npm run lint`           | Passed                                                                 |
| `npm run typecheck`      | Passed                                                                 |
| `npm test`               | **54 passed**, 9 test files, 0 skipped                                 |
| `npm run test:e2e`       | **16 passed** across Chromium, Microsoft Edge, Firefox, and WebKit     |
| axe-core                 | 0 violations on landing and receipt views in the four browser projects |
| Responsive check         | Passed at 375 × 812; rent action visible and no horizontal overflow    |
| `npm run diagrams:check` | Passed; generated diagrams match implementation sources                |
| `npm run build`          | Passed                                                                 |

### Coverage

| Area                  | Statements | Branches | Functions |  Lines |
| --------------------- | ---------: | -------: | --------: | -----: |
| All configured source |     98.15% |   94.56% |    96.77% | 98.15% |
| Domain                |     97.21% |   92.85% |    95.83% | 97.21% |
| Application flows     |       100% |     100% |      100% |   100% |

The proposal target of at least 80% statements, branches, and functions for
domain/application code is met. Every diagrammed state transition and every
rent/return message has an explicit test. Remaining uncovered lines are
defensive/exhaustiveness paths, an impossible missing-seed guard, and a
station-inventory branch; they are not diagrammed flows. No test was skipped
in the final run and no test is known to be flaky.

### Browser and LCP profile

The tested browser versions were Chromium 156.0.8078.4, Microsoft Edge
155.0.4283.62, Firefox 157.0, and Playwright WebKit 27.2. Safari itself was
not available on Windows; WebKit is reported as the tested engine, not as a
native Safari run.

Lighthouse 13.5.0 measured the local production preview at
`http://127.0.0.1:4173/`: mobile simulation, 412 × 823 viewport, 1.75 device
scale factor, 150 ms RTT, 1,638.4 Kbps simulated throughput, and 4× CPU
slowdown. LCP was 1,355 ms; performance category score was 1. The profile is
an explicit local proxy because the specification did not fix a device/network
profile. No LCP measurement was made on GitHub Pages.

### Resolved failures and warnings

Every observed failed check is listed here, including failures corrected
before the final run:

1. An early lint run reported undefined Node globals and an unused
   `reply` variable in the diagram generator. ESLint Node globals were
   configured for tooling and the unused variable was removed; final lint
   passes.
2. An early Vitest run discovered Playwright specs and failed with
   “Playwright Test did not expect test() to be called here.” Vitest now
   excludes `tests/e2e/**`; unit and browser suites pass separately.
3. The first Playwright run had two failures: a brittle assertion expected a
   fixed €1.15 despite browser elapsed-time variation, and axe-core found
   muted text at 4.46:1 against a 4.5:1 requirement. The assertion now checks
   locale-formatted EUR output while pricing is independently tested at
   fixed timestamps; the muted color was darkened. Subsequent axe runs pass.
4. The first four-browser keyboard run failed only in WebKit because its first
   Tab did not enter the page from the browser's initial focus state. The test
   now begins from the home link, tabs to the rent control, and asserts the
   visible focus style. The final 16-test browser run passes.
5. An earlier `npm ci` attempt ran without the portable Node executable on
   `PATH` and failed in esbuild's install script. It was rerun with the
   verified Node.js 24.20.0 runtime on `PATH` and succeeded.
6. The first local commit attempt had no configured Git author identity. The
   implementation commits were then created with an explicit per-command
   Copilot author; no global Git configuration was changed.

The final clean install emitted transitive deprecation warnings for
`whatwg-encoding@3.1.1` and `glob@10.5.0`; installation and all checks passed.
These warnings remain visible and were not suppressed.

## 4. Model alignment traceability

Status refers to diagram shape and behavior, not to unresolved source defects.
No row is marked deviated or missing. The `t1` XML source omission and the
return sequence's omitted `t5` remain documented gaps, not implementation
changes.

### Class diagram

| Diagram element                                                                                                             | Implementation                                                                          | Test evidence                                          | Status  |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------- |
| `User`, `User_f0`–`User_f2` (`userId`, `name`, `paymentMethod`)                                                             | `User` in `src/domain/model.ts`                                                         | `UT-MODEL-01`, `src/domain/model.test.ts`              | aligned |
| `Rental`, `Rental_f0`–`Rental_f3` (`rentalId`, `startTime`, `endTime`, `cost`), `Rental_m0` `start()`, `Rental_m1` `end()`  | `Rental` in `src/domain/model.ts`; ADR 0001 defines the active `endTime` boundary       | `UT-MODEL-01`, rent/return integration tests           | aligned |
| `Station`, `Station_f0`–`Station_f1` (`stationId`, `capacity`), `Station_m0` `dockBike(bike)`, `Station_m1` `releaseBike()` | `Station` in `src/domain/model.ts`; inventory is external                               | `UT-MODEL-01`, station inventory and rent/return tests | aligned |
| `Bike`, `Bike_f0`–`Bike_f2` (`bikeId`, `batteryLevel`, `state`), `Bike_m0` `lock()`, `Bike_m1` `unlock()`                   | `Bike` in `src/domain/model.ts`; locking is external; unlock delegates to state machine | `UT-MODEL-01`, `UT-STATE-01`                           | aligned |
| `e1`: User `1` —makes— Rental `0..*`                                                                                        | `domainRelationships` in `src/domain/model.ts`                                          | `UT-MODEL-01` relation metadata assertions             | aligned |
| `e2`: Rental `*` —uses— Bike `1`                                                                                            | `domainRelationships` in `src/domain/model.ts`                                          | `UT-MODEL-01` relation metadata assertions             | aligned |
| `e3`: Station `1` ◇—holds— Bike `0..*`                                                                                      | `domainRelationships` plus external station inventory                                   | `UT-MODEL-01`, inventory tests                         | aligned |

### State diagram

| Diagram element | Required transition / implementation                                      | Test evidence                                                      | Status                               |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------ |
| `init`, `t0`    | Initial pseudostate → `Available`; Bike constructor initializes the state | `UT-STATE-01`                                                      | aligned                              |
| `Available`     | Named Bike state                                                          | `UT-STATE-01` transitions                                          | aligned                              |
| `Reserved`      | Named Bike state                                                          | `UT-STATE-01` transitions                                          | aligned                              |
| `InUse`         | Named Bike state                                                          | `UT-STATE-01` transitions                                          | aligned                              |
| `Maintenance`   | Named Bike state                                                          | `UT-STATE-01` transitions                                          | aligned                              |
| `t1`            | `Available → Reserved` on `reserve()` using connector geometry            | `UT-STATE-01`                                                      | aligned; source omitted in input XML |
| `t2`            | `Reserved → Available` on `timeout` after 10 minutes or on `cancel()`     | `UT-STATE-01` timer/cancel tests                                   | aligned                              |
| `t3`            | `Reserved → InUse` on `unlock()`                                          | `UT-STATE-01`                                                      | aligned                              |
| `t4`            | `Available → InUse` on `unlock()`                                         | `UT-STATE-01`                                                      | aligned                              |
| `t5`            | `InUse → Available` on `returnToStation()`                                | `UT-STATE-01`; also applied by return orchestration after `docked` | aligned                              |
| `t6`            | `InUse → Maintenance` on `reportFault()`                                  | `UT-STATE-01`                                                      | aligned                              |
| `t7`            | `Available → Maintenance` on `batteryLow()` when `batteryLevel <= 20`     | `UT-STATE-01` threshold tests                                      | aligned                              |
| `t8`            | `Maintenance → Available` on `repaired()` without battery reset           | `UT-STATE-01`                                                      | aligned                              |

### Rent sequence (`sequence_rent.drawio`)

| Diagram element | Exact message                        | Implementation and test                                 | Status  |
| --------------- | ------------------------------------ | ------------------------------------------------------- | ------- |
| Actor/lifelines | User; App, Station, Bike, Rental     | `RENT_PARTICIPANTS`; `IT-RENT-01`                       | aligned |
| `m0`            | User → App: `selectBike(bikeId)`     | `RENT_MESSAGE_SEQUENCE[0]`; independent expected record | aligned |
| `m1`            | App → Bike: `checkAvailable()`       | `[1]`; independent expected record                      | aligned |
| `m2`            | Bike → App: `Available`              | `[2]`; independent expected record                      | aligned |
| `m3`            | App → Station: `releaseBike()`       | `[3]`; independent expected record                      | aligned |
| `m4`            | Station → Bike: `unlock()`           | `[4]`; independent expected record                      | aligned |
| `m5`            | App → Rental: `start()`              | `[5]`; independent expected record                      | aligned |
| `m6`            | Rental → App: `rental started`       | `[6]`; independent expected record                      | aligned |
| `m7`            | App → User: `unlocked, ride started` | `[7]`; independent expected record                      | aligned |

### Return sequence (`sequence_return.drawio`)

| Diagram element | Exact message                                    | Implementation and test                                   | Status  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | ------- |
| Actor/lifelines | User; App, Station, Bike, Rental, PaymentService | `RETURN_PARTICIPANTS`; `IT-RETURN-01`                     | aligned |
| `m0`            | User → App: `returnBike()`                       | `RETURN_MESSAGE_SEQUENCE[0]`; independent expected record | aligned |
| `m1`            | App → Station: `dockBike(bike)`                  | `[1]`; independent expected record                        | aligned |
| `m2`            | Station → Bike: `lock()`                         | `[2]`; independent expected record                        | aligned |
| `m3`            | Station → App: `docked`                          | `[3]`; independent expected record                        | aligned |
| `m4`            | App → Rental: `end()`                            | `[4]`; independent expected record                        | aligned |
| `m5`            | Rental → PaymentService: `charge(cost)`          | `[5]`; independent expected record                        | aligned |
| `m6`            | PaymentService → Rental: `paid`                  | `[6]`; independent expected record                        | aligned |
| `m7`            | Rental → App: `cost + receipt`                   | `[7]`; independent expected record                        | aligned |
| `m8`            | App → User: `show receipt`                       | `[8]`; independent expected record                        | aligned |

The generated class, state, rent-sequence, and return-sequence diagrams are
reproducible with `npm run diagrams:check`. Their generated sources and
comparison notes are in [`../docs/diagrams/generated/README.md`](../docs/diagrams/generated/README.md).

`use-case.mmd` and `activity.mmd` are explicitly marked **derived from code,
no ground truth**. They include the customer-visible receipt and full reload
restoring seeded mock data; those UI/reset details are not defined by the UML
input set.

## 5. Deviations, assumptions, and open issues

### Model deviations

No diagram-defined class, member, relationship, state, transition, sequence
participant, message, or flow was intentionally changed. There is no accepted
model-deviation ADR. ADR 0001 resolves `O-04` as an implementation
interpretation while preserving the UML member/type shape; it is not reported
as an aligned diagram fact without qualification.

### Assumptions actually used

| ID / source                      | Assumption or implementation choice                                                                                                                      | Risk                                                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `A-01`                           | Seed one `User` (`user-001`, “Demo Rider”, opaque `mock-payment`), one `Station` (`station-001`, capacity 10), and one `Bike` (`bike-001`, 80% battery). | Sample IDs/display values/counts are not specified by the model and do not represent a production catalog.             |
| `A-02`                           | Reservation and maintenance triggers without UI are exercised through internal logic and tests only.                                                     | There is no user-operated path for those transitions.                                                                  |
| `A-03`, `FR-011`                 | `charge(cost)` is a local successful-only boundary returning `paid`; no credential or external payment integration exists.                               | Payment rejection, settlement, and rollback are not modeled or verified.                                               |
| `A-04`                           | React components, flow-result types, tests, and external runtime helpers support the site without becoming UML domain classes or members.                | Future work must continue to keep presentation/support code separate from the modeled domain API.                      |
| `A-05`                           | The selected Lighthouse mobile emulation profile is used as a representative local proxy.                                                                | Its modeled network/device does not guarantee actual user or public-site performance.                                  |
| `A-06`                           | TypeScript/Vite/React and the proposed Vitest/Playwright/ESLint/Prettier toolchain are retained.                                                         | Stack selection was a proposal; another implementation could choose differently.                                       |
| `O-04` / ADR 0001                | `Rental.start()` sets `endTime` equal to `startTime`; `Rental.end()` replaces it.                                                                        | An active rental temporarily appears to have zero elapsed time.                                                        |
| `O-14`                           | An unsupported internal state trigger throws without changing state.                                                                                     | User did not resolve this issue; no user-visible error behavior is defined.                                            |
| `O-05`                           | `Station.capacity` is stored, but no capacity enforcement or occupancy policy is added.                                                                  | Docking may exceed the declared capacity; no such business rule was specified.                                         |
| `FR-009` implementation boundary | Elapsed duration is passed internally as milliseconds and converted to started minutes using integer cents.                                              | The UML does not specify a duration input unit or money representation; pricing behavior is fixed by the decision log. |

### Known input gaps / open issues

- `O-01`: `state.drawio` omits the XML source endpoint for `t1`; the
  `Available → Reserved` direction follows connector geometry and the recorded
  decision.
- `O-04`: resolved by ADR 0001, but its zero-elapsed active-rental risk remains.
- `O-05`: station capacity and occupancy semantics remain unspecified and are
  not enforced.
- `O-14`: unsupported-trigger behavior remains an assumption.
- `O-15`: the return sequence omits `returnToStation()` / `t5`; the state
  transition is applied internally after `docked`, without adding a message.
- Native Safari, public Pages behavior, GitHub Actions run evidence, and
  deployed LCP remain unverified.

## 6. Required follow-ups and project status

1. Authorize a push/deployment or perform it manually, then record the Pages
   workflow run and public URL.
2. Run the public rent → return → receipt and reload-reset smoke tests; measure
   deployed LCP with a reported device/network profile.
3. Run the browser suite on native Safari or explicitly approve treating the
   tested WebKit engine as the Safari verification proxy.
4. Update this report and the implementation-plan log with the deployment,
   Safari decision, and any new failures/deviations. Only then reconsider
   overall conformance and close the remaining phase gates.

No remote repository was contacted or modified during this work. Local commits
and phase tags are recorded in Git; Phase 8 remains open, Phase 9 is blocked,
and overall project completion is not claimed.
