# E-bike Rental System — Implementation Plan

## 1. Purpose and control rules

This plan breaks the implementation into separately approved phases. After completing a phase, work stops at its eye gate. No later phase starts until the user explicitly approves it.
The plan itself must be explicitly approved before Phase 0 begins; Phase 0 then has a separate approval gate for creating `AGENTS.md`.

### Source of truth and precedence

1. UML diagrams: `C:\Users\akomp\Downloads\class.drawio`, `C:\Users\akomp\Downloads\state.drawio`, `C:\Users\akomp\Downloads\sequence_rent.drawio`, `C:\Users\akomp\Downloads\sequence_return.drawio`.
2. Binding specification: [`../specs/ebike-rental-system-specification.md`](../specs/ebike-rental-system-specification.md).
3. Design exploration and decision log: [`../research/ebike-rental-system-exploration.md`](../research/ebike-rental-system-exploration.md).
4. Current task instructions.
5. Proposals in this plan.

The specification Q&A has explicitly clarified rental end time and pricing duration: `Rental.end()` records the return time before `charge(cost)`; positive elapsed rental time is rounded up to whole minutes; a zero-duration rental costs the EUR 1.00 unlock fee only. This resolves specification issue `O-04` for implementation. The exploration’s earlier reservation/operator UI request remains superseded by the specification’s strict rent/return-only UI scope. Other open issues remain open as listed in the specification.

### Model alignment rule

Implementation must preserve every class, attribute, method, state, transition, message, participant, and modeled flow in the diagrams. It must not silently add, remove, rename, or change them. Each phase maintains traceability from diagram element to code and test, marking status **aligned**, **deviated**, or **missing**.

An explicit deviation request is not minor steering: stop, report the affected elements and consequences, and propose an ADR. Per the user's specification-phase answer, an ADR explicitly approved by the user may authorize an implementation deviation while the original diagrams remain unchanged. Such acceptance is a specification update; the affected element is permanently reported as **deviated**, never described as aligned. No ADR is self-approved. Without explicit ADR acceptance, do not implement the deviation.

### Steering, ADRs, and phase gates

- **Minor steering:** spelling, wording, local refactoring, or other changes that do not alter scope, architecture, technology, structure, requirements, model interpretation, or assumptions. Apply within the active phase and record in the progress log.
- **Major steering:** anything that changes architecture, technology, structure, scope, model interpretation, or a specification assumption. Stop and propose an ADR; wait for the user's explicit accept/reject decision before acting.
- **ADR location:** `docs/adr/NNNN-title.md`.
- **ADR template:** `Status (Proposed/Accepted/Rejected/Superseded)`, `Context`, `Decision`, `Consequences`, `Alternatives`, `Affected requirements and diagram elements`, `Verification/reporting impact`, `User approval and date`.
- **Model-deviation ADR:** state the exact affected diagram IDs and intended implementation difference. On acceptance, record it as an explicit specification update and mark it **deviated** in the traceability matrix and final report. Do not edit source diagrams unless separately requested.
- At each eye gate, present the phase changes, review targets, verification evidence, alignment matrix update, and every assumption actually used, deviation, failure, skipped/flaky test, and unmet requirement. Offer **Approve**, **Change**, or **Reject**:
  - **Approve:** mark phase complete and proceed only after the explicit approval.
  - **Change:** apply minor changes immediately; for major changes, propose an ADR and wait; then rerun affected checks and return to the same gate.
  - **Reject:** stop. Do not start the next phase or automatically discard/revert the phase; await instructions.
- Never work ahead while waiting at a gate.

### Persistent alignment instruction

The user selected a root `AGENTS.md` as the proposed durable project instruction, with its own explicit approval gate. It is not created in this planning phase. The following exact text is proposed for that future file:

```markdown
# E-bike Rental Project Instructions

## Sources and precedence
- Treat the supplied UML diagrams as the source of truth for diagram-defined classes, attributes, methods, relationships, states, transitions, participants, messages, and flows:
  - `C:\Users\akomp\Downloads\class.drawio`
  - `C:\Users\akomp\Downloads\state.drawio`
  - `C:\Users\akomp\Downloads\sequence_rent.drawio`
  - `C:\Users\akomp\Downloads\sequence_return.drawio`
- Follow `/specs/ebike-rental-system-specification.md`, then `/research/ebike-rental-system-exploration.md`, for requirements and decisions not fixed by the diagrams.
- Report all conflicts; do not resolve them silently.

## Model alignment
- Do not silently add, remove, rename, reorder, or change any diagram-defined model element or flow.
- Map each diagram element to implementation code and tests. Mark each aligned, deviated, or missing.
- If a requested change conflicts with a diagram, stop and report the affected elements. Propose an ADR; do not implement before the user's explicit approval.
- An accepted model-deviation ADR is an explicit specification update. Keep the source diagrams unchanged unless separately authorized; mark affected elements deviated and report them.

## Human gates and decisions
- Work only on the currently approved implementation phase. After every phase, stop at the eye gate and wait for explicit user approval before beginning another.
- Distinguish minor local steering from major changes to architecture, technology, structure, scope, model interpretation, or assumptions. Major changes require a user-approved ADR in `/docs/adr/NNNN-title.md`.
- Never self-approve an ADR or pass a gate on the user's behalf.
- Keep the implementation plan's progress log current with phase status, decisions, ADRs, deviations, and verification evidence.

## Verification and reporting
- Before declaring a phase complete, run its checks and update its model-alignment matrix.
- Report every assumption actually used, deviation, failure, skipped or flaky test, and unmet requirement, including small ones.
- Produce the required final implementation report with code-quality evidence, complete verification/coverage results, full model traceability, deviations/failures, and a conformance verdict.
```

This same text is the proposed project-persistent “memory”; no separate cross-session AI-memory write is planned. **Proposal** — place the instruction in `AGENTS.md` at the repository root and approve or reject it at Phase 0's gate.

## 2. Phase sequence and rationale

The order reduces risk by locking workflow rules and build tooling first, proving the model and state machine before use cases, then implementing the exact successful rent/return sequences before composing the UI. Cross-cutting quality, deployment, and the required independent final report follow. Each phase has its own gate; phases are not merged.

All requirement IDs refer to the binding specification. **Proposal** labels denote recommended tooling/process not fixed by the diagrams or specification.

### Code-generated diagram deliverables

Per the implementation-session instruction (**From current prompt**, supplementing the specification):

- Store GitHub-renderable Mermaid diagrams under `docs/diagrams/generated/`, with a README explaining how each diagram is derived from implementation code.
- Generate the class diagram after Phase 2, state diagram after Phase 3, rent sequence after Phase 5, and return sequence after Phase 6. Regenerate and verify all at project end.
- Generate use-case and activity diagrams after UI behavior is implemented. Label both “derived from code, no ground truth” and list behavior they depict that is not covered by UML.
- Compare every generated class/state/sequence diagram with its source diagram and report all aligned, deviated, or missing elements.
- Generated artifacts must not add runtime/domain model elements or alter the original flows.

## 3. Phases

### Phase 0 — Durable project instructions

- **Goal:** Establish the persistent alignment and human-gate rules before implementation.
- **Scope/tasks:**
  1. Present the exact proposed text in Section 1 for review (**Proposal**; alignment policy supports `FR-001`–`FR-013` and specification Section 17).
  2. Only after explicit approval, create root `AGENTS.md` with that text (**Proposal**).
  3. Confirm the instruction path and add it to the progress log (**Proposal**).
- **Inputs:** This plan; diagrams; specification; exploration.
- **Deliverables:** Approved `AGENTS.md`, or a recorded rejection and stop.
- **Requirements covered:** **Proposal** — persistent workflow requested by this implementation-planning prompt; indirectly protects all `FR-*` and the specification's report requirement.
- **Exit criteria:** User explicitly approves the proposed content and file creation; the file matches the approved text; no implementation phase has started.
- **Eye gate — review:** Proposed text in this plan, then the `AGENTS.md` diff; confirm it does not create a conflicting instruction.
- **Evidence:** Exact diff and instruction-rule checklist; no build/test expected.
- **Decision:** Approve to begin Phase 1; change to revise text and return to this gate; reject to stop before implementation.

### Phase 1 — Project foundation and tooling

- **Goal:** Establish a minimal static project and repeatable local checks.
- **Scope/tasks:**
  1. Initialize the proposed TypeScript/Vite/React baseline and repository structure (**Proposal**; `FR-012`, `NFR-007`).
  2. Add formatting, lint, type-check, unit-test, and build commands (**Proposal**; `NFR-007`; tooling choices remain non-binding per specification Q&A #13).
  3. Configure an initial CI check for install, lint/type-check, tests, and build (**Proposal**; specification Section 13).
  4. Record baseline dependencies and initial build size (**Proposal**; `NFR-005`).
- **Inputs:** Approved specification; Phase 0 `AGENTS.md`; repository `README.md`.
- **Deliverables:** Static app shell, package/tool configuration, lockfile, CI validation workflow, and setup instructions.
- **Requirements covered:** `FR-012`, `NFR-005`, `NFR-007` (the exact stack and automation are **Proposal**).
- **Exit criteria:** Clean install and production build; all configured checks pass; no diagram-defined element has yet been claimed as implemented.
- **Model alignment check:** Open matrix lists every class/member/relationship, state/transition, participant, and sequence message with its source ID. Items not yet implemented are marked **missing** with a note that their planned phase has not started; no implementation deviation introduced.
- **Eye gate — review:** `package.json`/lockfile, Vite config, app shell, CI workflow, README instructions, diff, and build/lint output.
- **Evidence:** Commands and results; baseline compressed JS size; alignment matrix.
- **Decision:** Approve, change (minor edits or approved ADR for major stack/structure change), or reject; wait at gate.

### Phase 2 — Domain model

- **Goal:** Implement the four diagram classes and only their declared members and relationships.
- **Scope/tasks:**
  1. Implement `User`, `Rental`, `Station`, and `Bike` with exact attributes/types/method signatures (**From model**; `FR-001`).
  2. Represent `e1`–`e3`, their multiplicities, and Station's hollow-diamond aggregation (**From model**; `FR-001`).
  3. Preserve `PaymentMethod` and `BikeState` as referenced types; do not invent UML classes or class methods (**From model**; `FR-001`).
  4. Implement the approved time boundary and money representation: ISO 8601 UTC, `Rental.end()` records return time immediately before payment, model boundary `cost: double`, internal minor-unit arithmetic if needed (**From decision log**; `FR-001`, `FR-009`; specification Q&A #1).
  5. Add model-conformance tests (**Proposal** test technique; `FR-001`).
  6. Generate a Mermaid class diagram from the implemented domain definitions and document the code-to-diagram method (**From current prompt**; `FR-001`).
- **Inputs:** Diagram class cells `User`/`Rental`/`Station`/`Bike`, fields/methods and `e1`–`e3`; specification Sections 4, 4.3, and 7.
- **Deliverables:** Domain definitions, conformance tests, model-to-code/test references, generated class diagram and generation notes.
- **Requirements covered:** `FR-001`; applicable data constraints in specification Section 4.3.
- **Exit criteria:** Exact four-class inventory and members match source; tests verify signatures/types and relation metadata; no extra domain member/class is introduced.
- **Model alignment check:** Update class, every attribute and method, each relationship, and multiplicity matrix entries with code/test references and aligned/deviated/missing status.
- **Eye gate — review:** Domain files and tests, class/member/relationship matrix, test output, and diff.
- **Evidence:** Model conformance tests, test command output, alignment matrix, assumptions/issues actually encountered (especially unresolved capacity semantics; do not invent behavior).
- **Decision:** Approve, change, or reject; wait at gate.

### Phase 3 — Bike state machine

- **Goal:** Implement all four states and all transitions without adding state/method definitions to the UML classes.
- **Scope/tasks:**
  1. Implement initial `init → Available` and `t1`–`t8` exactly as specified (**From model**; `FR-002`).
  2. Apply `Available → Reserved` for `t1` based on geometry, retain the missing XML `source` as a documented issue (**From model/decision log**; `FR-003`, `O-01`).
  3. Implement 10-minute timeout and no-fee cancellation for `t2` (**From decision log**; `FR-004`).
  4. Apply battery integer range 0–100 and inclusive 20% low threshold to `t7`, without adding a new state or transition (**From decision log**; `FR-005`).
  5. Preserve `repaired()` as `Maintenance → Available` without resetting battery or adding a charge control (**From model/decision log**; `FR-006`, `FR-013`).
  6. Test every transition and timeout behavior; cover triggers internally without reservation/operator screens (**Proposal** test approach; `FR-002`–`FR-006`, `FR-013`).
  7. Generate a Mermaid state diagram from the implemented transition definitions and compare it with `state.drawio` (**From current prompt**; `FR-002`–`FR-006`).
- **Inputs:** `state.drawio` cells `init`, states, `t0`–`t8`; class `Bike`; specification Section 5.
- **Deliverables:** Transition implementation, state-focused tests, updated alignment matrix, generated state diagram and comparison.
- **Requirements covered:** `FR-002`–`FR-006`, `FR-013`.
- **Exit criteria:** All transitions are tested; thresholds/timing match approved values; no new UML method/state/control or implicit battery reset appears.
- **Model alignment check:** Map each of `init`, four states, and `t0`–`t8` to code and tests. Keep `t1` endpoint omission and `O-14` unsupported-trigger behavior visible.
- **Eye gate — review:** State-transition code, complete transition table/matrix, tests including timer boundary, diff, and any coverage output.
- **Evidence:** Transition tests and results; list any untested/unsupported behavior and mark deviations.
- **Decision:** Approve, change, or reject; wait at gate.

### Phase 4 — Seeded mock backend and pricing/payment boundary

- **Goal:** Provide deterministic in-memory data and successful-only mock payment with reload reset.
- **Scope/tasks:**
  1. Create a minimal fixture for User, Station, Bike, and Rental sufficient for both sequences (**Proposal**; `FR-014`, `A-01`).
  2. Keep state in memory; prove full reload restores seed data (**From decision log**; `FR-010`).
  3. Implement EUR 1.00 unlock fee plus EUR 0.15 per started positive minute, rounding up; zero elapsed time costs the unlock fee only (**From decision log**; `FR-009`, specification Q&A #1).
  4. Add a local deterministic success-only payment boundary that handles `charge(cost)` and returns `paid`; no credentials, network latency, injected failures, or browser persistence (**From model/decision log**; `FR-011`, mock backend Section 9).
  5. Test seed restoration, pricing boundaries, and payment success (**Proposal** tests; `FR-009`–`FR-011`, `FR-014`).
- **Inputs:** Approved seed/pricing/persistence/payment requirements; domain and state phases.
- **Deliverables:** In-memory mock data, pricing function, payment adapter, tests.
- **Requirements covered:** `FR-009`–`FR-011`, `FR-014`.
- **Exit criteria:** Repeatable seeded initial state; reload reset verified; approved price math passes boundary tests; payment mock has only the specified success behavior.
- **Model alignment check:** Ensure fixtures map only to the four model classes; payment adapter maps to the `PaymentService` participant and does not add a UML class; record referenced code/tests.
- **Eye gate — review:** Seed data, pricing/payment modules and tests, state-reset behavior, requirement matrix, and diff.
- **Evidence:** Test and coverage output; sample calculations; confirmation no storage/network/failure simulation; assumptions actually used.
- **Decision:** Approve, change, or reject; wait at gate.

### Phase 5 — Rent interaction

- **Goal:** Implement the exact successful rent sequence as application orchestration.
- **Scope/tasks:**
  1. Implement messages `m0`–`m7` in source order with participants `User`, `App`, `Station`, `Bike`, `Rental` (**From model**; `FR-007`).
  2. Use `Station.releaseBike()` and `Bike.unlock()` as shown; do not insert a return message or reservation step (**From model**; `FR-007`, `O-08`).
  3. Verify the matching Bike state transition to `InUse` through existing `unlock()` semantics; do not add a state-update message (**From model**; `FR-002`, `FR-007`).
  4. Add integration coverage of every message and outcome (**Proposal** test technique; `FR-007`).
  5. Generate Mermaid rent sequence from the implemented interaction and compare lifelines and `m0`–`m7` (**From current prompt**; `FR-007`).
- **Inputs:** Rent lifelines and `m0`–`m7`; domain, state, and mock backend.
- **Deliverables:** Rent use-case orchestration, message-order tests, generated rent sequence and comparison.
- **Requirements covered:** `FR-002`, `FR-007`, `FR-014`.
- **Exit criteria:** Message names, participant directions, and order match sequence; successful rental can be initiated from seeded data; no failure/reservation branch added.
- **Model alignment check:** Map all rent lifelines, actor, messages `m0`–`m7`, and referenced class methods to code/tests. Track the absent `releaseBike()` return message as an omission, not a deviation.
- **Eye gate — review:** Use-case code, message-order test, seed scenario, output/diff, alignment matrix.
- **Evidence:** Integration-test results and relevant coverage; written comparison with sequence message list.
- **Decision:** Approve, change, or reject; wait at gate.

### Phase 6 — Return interaction

- **Goal:** Implement the exact successful return/payment/receipt sequence and resolved duration calculation.
- **Scope/tasks:**
  1. Implement `m0`–`m8` in order across `User`, `App`, `Station`, `Bike`, `Rental`, `PaymentService` (**From model**; `FR-008`).
  2. Call `Rental.end()` so `endTime` is recorded before pricing/`charge(cost)`; apply the approved duration and rounding rule (**From decision log**; `FR-009`, `FR-011`, specification Q&A #1).
  3. Preserve successful `paid`, `cost + receipt`, and `show receipt`; keep unspecified receipt fields minimal/opaque (**From model/decision log**; `FR-008`, `FR-011`).
  4. Preserve `t5` as `returnToStation()` and report the sequence/state-update gap; do not insert or rename messages (**From model**; `FR-002`, `FR-008`, `O-15`).
  5. Add integration tests covering each return message, computed cost, and success response (**Proposal** test technique; `FR-008`, `FR-009`, `FR-011`).
  6. Generate Mermaid return sequence from the implemented interaction and compare lifelines and `m0`–`m8` (**From current prompt**; `FR-008`).
- **Inputs:** Return `L_*` lifelines and `m0`–`m8`; `t5`; domain, state, pricing, payment.
- **Deliverables:** Return use-case orchestration, message-order/pricing tests, generated return sequence and comparison.
- **Requirements covered:** `FR-002`, `FR-008`, `FR-009`, `FR-011`.
- **Exit criteria:** Exact successful sequence order and labels; end timestamp precedes charge; totals pass zero/partial/exact/over-minute tests; no failure branch added.
- **Model alignment check:** Map every return lifeline, actor, `m0`–`m8`, class method, and state transition to code/tests; keep `O-15` open if no explicit model amendment is approved.
- **Eye gate — review:** Return code, timing/pricing tests, receipt display data, integration output, diff, and alignment matrix.
- **Evidence:** Test results and calculation examples; explicit report of open payment/receipt/capacity semantics.
- **Decision:** Approve, change, or reject; wait at gate.

### Phase 7 — Customer interface

- **Goal:** Present rent and return as accessible, responsive browser interactions, without adding reservation/operator screens.
- **Scope/tasks:**
  1. Build the UI around only the rent and return sequences (**From decision log**; `FR-007`, `FR-008`, `FR-013`).
  2. Connect accessible controls and status output to the tested use cases (**Proposal**; `NFR-001`, `NFR-002`).
  3. Ensure no authentication, reservation workflow, operator/admin UI, added domain model, or sequence branch (**From decision log/model**; `FR-007`, `FR-008`, `FR-013`).
  4. Add component and browser tests for the two happy paths (**Proposal**; `FR-007`, `FR-008`).
  5. Generate use-case and activity diagrams from implemented UI/application behavior; label “derived from code, no ground truth” and enumerate behavior not covered by UML (**From current prompt**; `FR-007`, `FR-008`).
- **Inputs:** Approved rent/return use cases; NFR targets; scope decision in specification.
- **Deliverables:** Customer-facing rent/return UI, component/E2E tests, generated use-case/activity diagrams with explicit no-ground-truth annotation.
- **Requirements covered:** `FR-007`, `FR-008`, `FR-013`, `NFR-001`–`NFR-004`.
- **Exit criteria:** Both flows operate from the browser, keyboard use is supported, responsive layouts work, and no excluded screens/flows are present.
- **Model alignment check:** Map visible interactions to the exact rent/return message IDs; confirm all hidden state transitions remain covered; record any deviations.
- **Eye gate — review:** Running demo, screen captures or browser walkthrough, UI diff, E2E/accessibility output, and updated matrix.
- **Evidence:** E2E results, keyboard/responsive/browser checks, accessibility findings, and coverage.
- **Decision:** Approve, change, or reject; wait at gate.

### Phase 8 — Quality, accessibility, performance, and documentation

- **Goal:** Close maintainability and quality requirements before deployment.
- **Scope/tasks:**
  1. Run and fix lint, formatting, type-check, unit/integration/E2E suites; retain full results (**From prompt/specification**; `NFR-007`, Sections 12 and 16).
  2. Verify WCAG 2.2 AA target, responsive behavior, and current stable Chrome/Edge/Firefox/Safari (**Proposal**; `NFR-001`–`NFR-004`).
  3. Measure compressed JS <= 200 KB and LCP <= 2.5 s under a reported representative mobile profile (**Proposal**; `NFR-005`, `NFR-006`).
  4. Produce README, architecture, test, and deployment docs (**From decision log**; specification Q&A #11, Section 16).
  5. Keep test/coverage target tooling non-binding unless changed by approved ADR (**Proposal**; Section 12; target is 80% statements/branches/functions for domain/application).
  6. Regenerate all five diagrams from implementation sources and verify reproducibility and model comparisons (**From current prompt**).
- **Inputs:** All implementation phases 1–7; NFRs and documentation requirements.
- **Deliverables:** Verified implementation, quality evidence, README and `docs/architecture.md`, `docs/testing.md`, `docs/deployment.md`, reproducible diagram generation and comparisons.
- **Requirements covered:** `NFR-001`–`NFR-007`; documentation items in specification Sections 11 and 16.
- **Exit criteria:** All checks run; failures, skips, flakes, unmet budgets and real coverage recorded; all required docs accurate; no silent assumptions.
- **Model alignment check:** Review the full matrix through classes/members/relationships, states/transitions, participants/messages and tests. Do not close any open item by inference.
- **Eye gate — review:** Complete diff, docs, lint/type-check/test/coverage logs, accessibility evidence, browser matrix, performance report, alignment matrix.
- **Evidence:** All raw command summaries, coverage numbers, LCP/bundle measurements, issue/deviation/assumption register.
- **Decision:** Approve, change, or reject; wait at gate.

### Phase 9 — CI/CD and GitHub Pages deployment

- **Goal:** Deploy the verified static build and check it at its actual public path.
- **Scope/tasks:**
  1. Configure the deployment workflow and GitHub Pages base path (**From prompt**; `FR-012`; **Proposal** — GitHub Actions implementation).
  2. Run the production build and deploy only the approved release (**Proposal**; specification Section 13).
  3. Smoke-test asset paths, page load, and rent/return happy paths on the deployed site (**Proposal**; `FR-012`, `NFR-003`).
- **Inputs:** Approved quality phase, repository Pages configuration, docs/deployment instructions.
- **Deliverables:** CI/CD workflow, deployed site, deployment evidence.
- **Requirements covered:** `FR-012`, `NFR-003`, `NFR-005`, `NFR-006`.
- **Exit criteria:** Public Pages URL loads without asset/base-path errors; deployed happy paths pass; CI results are recorded.
- **Model alignment check:** Compare deployed behavior against all diagrammed sequences and confirm deployment changes no model semantics.
- **Eye gate — review:** Workflow and deployment diffs, CI run, public URL/demo, smoke-test output, performance/browser evidence, matrix.
- **Evidence:** Workflow run ID/result, deployed URL, smoke test, bundle and LCP measurements; all deployment failures or skips.
- **Decision:** Approve, change, or reject; wait at gate. Do not start the final report phase until deployment is explicitly approved.

### Phase 10 — Final alignment audit and implementation report

- **Goal:** Deliver the specification-required independent conformance assessment as the final implementation phase.
- **Scope/tasks:**
  1. Build the complete source-to-code-to-test matrix for every class/member/relationship, state/transition, participant/message/flow (**From model**; all `FR-*`; specification Section 17).
  2. Assess code quality against readability, naming, documentation, modularity, separation of concerns, error handling, maintainability, accessibility, and performance with concrete evidence (**From prompt/specification**; `NFR-001`–`NFR-007`).
  3. Record full unit/integration/E2E results and coverage; list every failed, skipped, flaky, or unmet check and cause (**From prompt/specification**; Section 17).
  4. List every deviation, unmet requirement, and assumption actually used; preserve all unresolved issues; assign overall conformance verdict and follow-ups (**From prompt/specification**; Section 17).
  5. Write `reports/ebike-rental-system-implementation-report.md` (**From specification**; Section 17).
- **Inputs:** Approved deployed implementation; all test/CI/performance/accessibility evidence; progress log; accepted ADRs; current matrix.
- **Deliverables:** Required implementation report and final alignment matrix.
- **Requirements covered:** All `FR-*`, `NFR-*`; specification Sections 16–17.
- **Exit criteria:** Report includes all five mandated content areas; every diagram element has status and references; no failure/deviation is omitted; conformance verdict reflects the evidence.
- **Model alignment check:** Full final audit of every source element and associated test; mark only **aligned**, **deviated** (with accepted ADR reference), or **missing**. No element without evidence may be marked aligned.
- **Eye gate — final review:** Review report, full traceability matrix, test/coverage and CI evidence, ADR/progress logs, deployed demo, and all deviations/open items.
- **Evidence:** Report path, complete verification summary, final conformance verdict and risks.
- **Decision:** Approve the report/conformance result; request changes and remain at this gate; or reject and stop. No further implementation phase follows.

## 4. Traceability and verification protocol

### Matrix format

Maintain the matrix in the progress log during work, then include the complete form in the final report:

| Source diagram | Element ID/name | Required behavior | Code reference | Test reference | Status | Notes/ADR |
|---|---|---|---|---|---|---|
| `class.drawio` | Class, every attribute/method, `e1`–`e3` and multiplicity cells | Exact model representation | File/symbol | Test ID | aligned/deviated/missing | Issues/ADR |
| `state.drawio` | Initial `init`; states `Available`, `Reserved`, `InUse`, `Maintenance`; `t0` through `t8` | Exact transition | File/symbol | Test ID | aligned/deviated/missing | `t1` XML-source issue |
| `sequence_rent.drawio` | User, each lifeline, `m0` through `m7` | Exact participant/message/direction/order | File/symbol | Test ID | aligned/deviated/missing | No inserted return message |
| `sequence_return.drawio` | User, each lifeline, `m0` through `m8` | Exact participant/message/direction/order | File/symbol | Test ID | aligned/deviated/missing | `t5` relationship |

Before phase completion, update relevant rows and review all existing rows for regressions. `Missing` is the honest status for an unimplemented element; it is not a passing status. A deviation requires an accepted ADR and remains marked **deviated**.

### Per-phase verification and report

Before requesting each gate, run the smallest checks that cover the phase and any impacted earlier work. The gate summary must include:

- Files changed and purpose, with diff overview.
- Commands/checks run and exact results; coverage where available.
- Relevant matrix rows and the resulting status.
- Assumptions actually used and their specification IDs.
- Every deviation/ADR, failing or flaky test, skipped test/check, and unmet requirement.
- Remaining open issues and the decision needed, without unapproved assumptions.

Do not claim completion when checks cannot run; report why and leave the phase incomplete pending user direction.

## 5. Definition of Done

### Per phase

A phase is done only when its exit criteria pass, phase-relevant tests/checks have run, its alignment rows are updated, all failures/skips/assumptions/deviations are disclosed, deliverables are reviewable, and the user explicitly approves its eye gate. This instantiates the specification's Definition of Done, Section 16.

### Whole project

The project is done only when all specification Section 16 criteria pass: GitHub Pages deployment works; classes, members, relations, states, transitions, and sequence order conform or have explicitly accepted ADR deviations; approved pricing/battery/timeout/persistence/payment rules are verified; seeded rent/return work; full test and quality evidence is recorded; required docs are present; open issues and deviations are disclosed; and the final report in Section 17 is complete and approved at Phase 10's gate.

## 6. Progress log

Update this section after each approved phase. Do not create a separate tracker unless approved as a major structural change.

| Phase | Status | Decisions/ADRs | Verification and alignment | Deviations, assumptions, blockers |
|---|---|---|---|---|
| Planning | Complete — plan approved by request to begin Phase 1 | Plan Q&A: rental end time set by `Rental.end()` immediately before charge; positive durations round up; zero duration has unlock fee only. Approved ADR policy: accepted ADR can authorize implementation deviation with diagrams unchanged; record as a specification update and mark deviated. `AGENTS.md` content approved in planning. | Re-read diagrams, exploration, specification, plan, and README. No agent instruction file existed in worktree; created exact approved content. | Specification `O-04` still marks end-time semantics open, conflicting with plan's later Q&A clarification; higher-priority specification controls until formally updated. Defer as a Phase 6 blocker. |
| Phase 0 | Complete — user authorized start of Phase 1 and stated instruction approved | Exact plan `AGENTS.md` proposal applied at repository root. | Confirmed file contents match the plan proposal. | No implementation code in this phase. |
| Phase 1 | Checks passed; gate unanswered; autonomous continuation directed by user | Latest user instruction says continue autonomously after no gate response; this is recorded as a gate bypass, not an explicit phase approval. Proposed TypeScript/Vite/React baseline; no ADR or new architecture decision. | Clean install, format check, lint, type-check, full configured unit suite (1 test; 100% statements/branches/functions/lines for `App.tsx`), and production build passed. Compressed JavaScript baseline: 59.03 kB gzip (under the 200 KB `NFR-005` target). Every model element is listed below as missing/not yet implemented. | No diagram/model deviation or domain implementation. `O-04` remains an explicit specification/plan conflict. Initial lint-config and dependency-resolution attempts were corrected; npm reported two transitive deprecation warnings. |
| Phase 2 | In progress — domain model | Proceeding under user’s latest autonomous-continuation instruction; Phase 1’s eye-gate answer was unavailable. | Phase 1 full diagram inventory remains missing/not yet implemented; Phase 2 class/member/relationship matrix pending. | `O-04` is not to be silently resolved. |
| Phase 3 | Not started | — | — | — |
| Phase 4 | Not started | — | — | — |
| Phase 5 | Not started | — | — | — |
| Phase 6 | Not started | — | — | — |
| Phase 7 | Not started | — | — | — |
| Phase 8 | Not started | — | — | — |
| Phase 9 | Not started | — | — | — |
| Phase 10 | Not started | — | — | — |


#### Phase 1 closeout evidence — 2026-10-19

**Scope and environment.** The TypeScript/Vite/React stack is the task's selected foundation, with no architecture change or ADR. The app is only a static welcome shell; it contains no UML domain class, state machine, rent/return flow, or additional UI flow. The relative Vite asset base is used for static hosting below a repository path. Node.js 24.20.0 was downloaded as a temporary, checksum-verified official portable archive and used from the project workspace because `node`/`npm` were not on PATH; no machine-wide installation was made. The temporary runtime and build/install outputs are removed after checks.

**Verification.** Commands run with Node 24.20.0: `npm install --no-audit --no-fund` (lock generation), `npm ci --no-audit --no-fund`, `npm run format`, `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Final clean install and every configured check passed. The one configured test passed; coverage is 100% statements, branches, functions, and lines for the only covered source file, `src/App.tsx` (domain/application coverage is not applicable because those layers have not started). Vite built the JS at 187.60 kB uncompressed / **59.03 kB gzip**, below `NFR-005`'s 200 KB compressed-JavaScript target. The final clean install emitted deprecation warnings for transitive `whatwg-encoding@3.1.1` and `glob@10.5.0`; they did not fail installation. An initial ESLint flat-config mismatch and an initial npm dependency-resolution attempt were corrected before the final successful rerun. No tests were skipped; browser E2E and deployment smoke tests are not configured in Phase 1.

**Baseline direct dependencies.** Runtime: React/React DOM 19.1.1. Tooling: Vite 7.1.4, TypeScript 5.9.2, Vitest 3.2.4, ESLint 10.13.0, Prettier 3.6.2; exact remaining versions are pinned in `package.json` and `package-lock.json`. The npm install-script approval is limited to esbuild's required postinstall (`allowScripts` entry).

**Generated diagrams.** Code-generated diagrams are not applicable in Phase 1 because no model or flows are implemented. Schedule class-diagram generation/alignment after Phase 2, state-diagram generation/alignment after Phase 3, rent-sequence generation/alignment after Phase 5, return-sequence generation/alignment after Phase 6, and a consolidated final comparison in Phase 10. This does not modify any supplied specification or input diagram.

**Phase 1 alignment matrix.** Every element below is intentionally **missing / not yet implemented**, not a code deviation. Source IDs are retained for the later phase trace.

| Source | Diagram element(s) and source ID(s) | Phase 1 status | Note |
|---|---|---|---|
| `class.drawio` | `User`; `userId` (`User_f0`), `name` (`User_f1`), `paymentMethod` (`User_f2`) | Missing / not yet implemented | No domain classes have been implemented. |
| `class.drawio` | `Rental`; `rentalId` (`Rental_f0`), `startTime` (`Rental_f1`), `endTime` (`Rental_f2`), `cost` (`Rental_f3`), `start()` (`Rental_m0`), `end()` (`Rental_m1`) | Missing / not yet implemented | — |
| `class.drawio` | `Station`; `stationId` (`Station_f0`), `capacity` (`Station_f1`), `dockBike(bike: Bike)` (`Station_m0`), `releaseBike(): Bike` (`Station_m1`) | Missing / not yet implemented | — |
| `class.drawio` | `Bike`; `bikeId` (`Bike_f0`), `batteryLevel` (`Bike_f1`), `state` (`Bike_f2`), `lock()` (`Bike_m0`), `unlock()` (`Bike_m1`) | Missing / not yet implemented | — |
| `class.drawio` | User–Rental `e1` (ends `e1_a`, `e1_b`); Rental–Bike `e2` (`e2_a`, `e2_b`); Station–Bike aggregation `e3` (`e3_a`, `e3_b`) | Missing / not yet implemented | Multiplicities and hollow-diamond aggregation are not yet represented in code. |
| `state.drawio` | Initial `init`; states `Available`, `Reserved`, `InUse`, `Maintenance`; `t0` Initial -> Available; `t1` Available -> Reserved (`reserve()`); `t2` Reserved -> Available (`timeout` / `cancel()`); `t3` Reserved -> InUse (`unlock()`); `t4` Available -> InUse (`unlock()`); `t5` InUse -> Available (`returnToStation()`); `t6` InUse -> Maintenance (`reportFault()`); `t7` Available -> Maintenance (`batteryLow()`); `t8` Maintenance -> Available (`repaired()`) | Missing / not yet implemented | Includes the interpreted `t1` connector; no implementation deviation. |
| `sequence_rent.drawio` | Participants: User actor (`MveSr_KsUtKa4BIEBlV2-5`), App (`L_App`), Station (`L_Station`), Bike (`L_Bike`), Rental (`L_Rental`); `m0` `selectBike(bikeId)`, `m1` `checkAvailable()`, `m2` `Available`, `m3` `releaseBike()`, `m4` `unlock()`, `m5` `start()`, `m6` `rental started`, `m7` `unlocked, ride started` | Missing / not yet implemented | No rent flow is present. |
| `sequence_return.drawio` | Participants: User actor (`POrdqQGPlNZNEqtTAqEn-1`), App (`L_App`), Station (`L_Station`), Bike (`L_Bike`), Rental (`L_Rental`), PaymentService (`L_PaymentService`); `m0` `returnBike()`, `m1` `dockBike(bike)`, `m2` `lock()`, `m3` `docked`, `m4` `end()`, `m5` `charge(cost)`, `m6` `paid`, `m7` `cost + receipt`, `m8` `show receipt` | Missing / not yet implemented | No return/payment flow is present. |

**Open blocker carried forward.** The plan's planning Q&A says `Rental.end()` records end time before charge, but specification `O-04` still leaves active-rental `endTime` nullability/value semantics open and has precedence under the plan. Preserve that conflict; resolve it explicitly before Phase 6. No Phase 1 assumption resolves it.

### ADR index

| ADR | Status | Decision summary | Affected requirements/elements |
|---|---|---|---|
| None | — | No ADR has been proposed or accepted in this planning phase. | — |
