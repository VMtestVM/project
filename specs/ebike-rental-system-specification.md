# E-bike Rental System — Specification

## 1. Purpose, scope, and out-of-scope

### Purpose

Specify a static, client-side E-bike rental mock-up hosted on GitHub Pages. The UML diagrams define the domain model, bike state machine, and the exact modeled rent and return interactions. This document makes those elements testable without silently extending or changing them.

### Scope

- The site presents only the diagrammed rent and return customer flows.
- It uses seeded mock data and in-memory client-side state. Reloading the page restores the seed data.
- It represents every class, attribute, method, relationship, state, transition, sequence participant, and message identified in the input diagrams.
- It models successful payment and receipt delivery only, as shown in the return sequence.
- All requirements are tagged **From model**, **From decision log**, or **Proposal**, and cite a source.

### Out of scope

- Real backend, real payment processing, storage of payment credentials, and authentication.
- User-facing reservation screens and operator/admin screens. A reservation flow and operator controls were proposed in the exploration, but the user subsequently selected strict diagram-only UI scope. This excludes those screens; it does not remove the `Reserved` state or any diagrammed transition.
- Simulated network latency and injected failures.
- Any class, attribute, method, state, transition, message, or replacement flow that is not in the UML diagrams. Implementation-only UI components and test utilities must not be presented as additional UML domain elements.

**Scope conflict recorded:** the exploration decision log previously requested optional reservation and operator UI. In the specification Q&A, the user selected diagram-only UI and explicitly excluded both. The later answer controls the unmodeled UI scope; all diagram elements remain in scope and unchanged. See [Known deviations and open issues](#14-known-deviations-and-open-issues).

## 2. Source documents and precedence rules

### Source inventory

| Source | Contents |
|---|---|
| `C:\Users\akomp\Downloads\class.drawio` | Domain classes, members, relationships, and multiplicities. |
| `C:\Users\akomp\Downloads\state.drawio` | Bike states and transitions. |
| `C:\Users\akomp\Downloads\sequence_rent.drawio` | Rent lifelines and message order. |
| `C:\Users\akomp\Downloads\sequence_return.drawio` | Return lifelines and message order. |
| `../research/ebike-rental-system-exploration.md` | Prior extraction and decision record. |
| Specification Q&A answers | Clarifications and approvals recorded in this specification; identified as Q&A decisions below. |

The four diagrams are external input files supplied with the task and are outside the repository. Their source locations are recorded for traceability; they need not be copied into the implementation repository.

### Precedence

1. UML diagrams are ground truth for diagram-defined model elements and flows.
2. User answers recorded in the exploration report are the existing decision log.
3. This specification prompt supplies delivery constraints, including static GitHub Pages hosting and report contents.
4. Proposals in the exploration/specification may guide implementation but are not diagram facts.

The user's answers during this specification Q&A clarify or update earlier decisions only where the diagrams do not define the matter. They do not change the UML. Any conflict is listed explicitly rather than silently reconciled.

### Traceability labels

- **From model** — directly stated or visibly represented in a named UML diagram element.
- **From decision log** — a user decision in the exploration report or a subsequent explicit Q&A answer. Q&A references such as `Q&A #12` refer to the numbered clarifications in this phase.
- **Proposal** — a recommended value or design choice, not established by the model. Approval of a proposal is noted, but does not convert it into a diagram fact.

## 3. Glossary

| Term | Meaning |
|---|---|
| Bike | The model element with ID, battery level, and BikeState; its lifecycle is defined by the state diagram. |
| BikeState | Referenced type of `Bike.state`; the state diagram names its values but the class diagram does not declare the type. |
| Station | Model element with ID and capacity that holds bikes and docks/releases them. |
| Rental | Model element associated with one user and one bike, with start/end times and cost. |
| User | Domain class and external actor in the sequence diagrams. No sign-in behavior is modeled. |
| App | Sequence participant representing the application boundary; it is not a class in the class diagram. |
| PaymentService | Return-sequence participant; it is not a class in the class diagram. |
| Transition trigger | Label on a state-diagram transition. It is not necessarily a declared class operation. |
| Seed data | The initial in-memory records used by the static mock. |

## 4. Domain model specification

All members below are public (`+`) in `class.drawio`. No private or protected members, inheritance, or generalization are drawn. Names, types, signatures, and multiplicities are preserved as drawn.

### 4.1 Classes

| Class | Attributes | Methods | Traceability |
|---|---|---|---|
| `User` | `+userId: String`; `+name: String`; `+paymentMethod: PaymentMethod` | None shown | **From model** — `class.drawio`: `User`, `User_f0`–`User_f2`. |
| `Rental` | `+rentalId: String`; `+startTime: DateTime`; `+endTime: DateTime`; `+cost: double` | `+start()`; `+end()` | **From model** — `class.drawio`: `Rental`, `Rental_f0`–`Rental_f3`, `Rental_m0`–`Rental_m1`. |
| `Station` | `+stationId: String`; `+capacity: int` | `+dockBike(bike: Bike)`; `+releaseBike(): Bike` | **From model** — `class.drawio`: `Station`, `Station_f0`–`Station_f1`, `Station_m0`–`Station_m1`. |
| `Bike` | `+bikeId: String`; `+batteryLevel: int`; `+state: BikeState` | `+lock()`; `+unlock()` | **From model** — `class.drawio`: `Bike`, `Bike_f0`–`Bike_f2`, `Bike_m0`–`Bike_m1`. |

`PaymentMethod` and `BikeState` are referenced types, not declared classes in the class diagram. The state names for `BikeState` are the four states in `state.drawio`. Do not add domain members to make transition triggers look like class methods: `reserve()`, `cancel()`, `returnToStation()`, `reportFault()`, `batteryLow()`, and `repaired()` are state-transition labels, not `Bike` methods in the class diagram.

### 4.2 Relationships and multiplicities

| Relationship | Multiplicity as drawn | Notation | Traceability |
|---|---|---|---|
| `User` makes `Rental` (`e1`) | `1` at User; `0..*` at Rental | Association | **From model** — `class.drawio`: `e1`, `e1_a`, `e1_b`. |
| `Rental` uses `Bike` (`e2`) | `*` at Rental; `1` at Bike | Association | **From model** — `class.drawio`: `e2`, `e2_a`, `e2_b`. |
| `Station` holds `Bike` (`e3`) | `1` at Station; `0..*` at Bike | Hollow-diamond aggregation at Station | **From model** — `class.drawio`: `e3`, `e3_a`, `e3_b`. |

The relationship symbols are retained as shown; in particular, `Station`–`Bike` uses a hollow diamond, not a filled composition diamond.

### 4.3 Data constraints

- **From model** — preserve the declared types and names exactly as specified above (`class.drawio`, corresponding member IDs).
- **From decision log** — IDs remain strings; timestamps use ISO 8601 UTC; money may be calculated internally in integer minor units but must be represented at the model boundary as `Rental.cost: double` (exploration “Remaining assumptions and risks”; specification Q&A #6).
- **From decision log** — the demonstration price is EUR 1.00 unlock fee plus EUR 0.15 per started minute, rounded up to whole minutes; no deposit, discounts, tax, or maximum cap (specification Q&A #3 approving the exploration proposal).
- **Resolved by ADR 0001** — `Rental.endTime` remains a non-null ISO 8601 UTC `DateTime`. On `Rental.start()`, set it equal to `startTime` as a zero-elapsed-time boundary; on `Rental.end()`, replace it with the return instant. This implementation interpretation preserves the UML type/member shape and is not a null or sentinel value. See [`docs/adr/0001-active-rental-end-time.md`](../docs/adr/0001-active-rental-end-time.md); report the interpretation and its risk in the final report.
- **Known open issue** — `Station.capacity` is an `int`, but valid range, occupancy enforcement, and behavior at capacity are not defined. Do not infer a station-full rule.
- **Known open issue** — allowed `PaymentMethod` values are undefined. Keep the value opaque/minimal and do not introduce real payment details (specification Q&A #7).

## 5. State machine specification

The machine describes `Bike`. It has four named states and an initial pseudostate. No guards, effects/actions, entry actions, or exit actions are drawn. Therefore the specification assigns none, except for the explicitly approved timeout and battery-threshold interpretations below.

| ID | From → to | Trigger | Guard/action | Traceability |
|---|---|---|---|---|
| `t0` | Initial → `Available` | None shown | None shown | **From model** — `state.drawio`: `init`, `t0`. |
| `t1` | `Available` → `Reserved` | `reserve()` | None shown | **From model** — `state.drawio`: `t1`; source is taken from connector geometry. **From decision log** — Q&A #14 explicitly accepts this visual interpretation; missing XML endpoint remains an open issue. |
| `t2` | `Reserved` → `Available` | `timeout` or `cancel()` | **From decision log** — timeout after 10 minutes; cancellation has no fee. No cancellation fee is otherwise represented in the class model. | **From model** — `state.drawio`: `t2`. **From decision log** — specification Q&A #4. |
| `t3` | `Reserved` → `InUse` | `unlock()` | None shown | **From model** — `state.drawio`: `t3`. |
| `t4` | `Available` → `InUse` | `unlock()` | None shown | **From model** — `state.drawio`: `t4`. |
| `t5` | `InUse` → `Available` | `returnToStation()` | None shown | **From model** — `state.drawio`: `t5`. |
| `t6` | `InUse` → `Maintenance` | `reportFault()` | None shown | **From model** — `state.drawio`: `t6`. |
| `t7` | `Available` → `Maintenance` | `batteryLow()` | **From decision log** — battery is an integer percentage from 0 to 100; the low threshold is 20% inclusive. No rule is defined for other source states. | **From model** — `state.drawio`: `t7`. **From decision log** — exploration Q&A #13 / specification Q&A #5. |
| `t8` | `Maintenance` → `Available` | `repaired()` | Do not infer a battery-level reset or charging action. | **From model** — `state.drawio`: `t8`. **From decision log** — specification Q&A #12 explicitly rejects an inferred battery reset or charge control. |

The visual connector for `t1` starts at `Available`, but the raw XML omits a `source` attribute. The accepted specification interpretation is `Available → Reserved`; the XML omission is recorded as a known diagram issue.

All state transitions remain part of the model and must be implemented and tested. In strict diagram-only UI scope, reservation and maintenance transitions are not exposed through additional screens or controls. An internal domain transition mechanism or test harness may exercise them without adding methods to the UML classes or adding a user-facing flow.

## 6. Behavior specification for the modeled flows

The sequences are linear. No `alt`, `opt`, or `loop` fragments are present. Their sequence order, participants, and message names are preserved; no additional messages are inserted into either modeled flow.

### 6.1 Rent flow

Participants: `User` actor, `App`, `Station`, `Bike`, `Rental`.

| Order | Message | Direction | Traceability |
|---|---|---|---|
| 1 | `selectBike(bikeId)` | User → App | **From model** — `sequence_rent.drawio`: `m0`. |
| 2 | `checkAvailable()` | App → Bike | **From model** — `sequence_rent.drawio`: `m1`. |
| 3 | `Available` | Bike → App (dashed reply) | **From model** — `sequence_rent.drawio`: `m2`. |
| 4 | `releaseBike()` | App → Station | **From model** — `sequence_rent.drawio`: `m3`. |
| 5 | `unlock()` | Station → Bike | **From model** — `sequence_rent.drawio`: `m4`. |
| 6 | `start()` | App → Rental | **From model** — `sequence_rent.drawio`: `m5`. |
| 7 | `rental started` | Rental → App (dashed reply) | **From model** — `sequence_rent.drawio`: `m6`. |
| 8 | `unlocked, ride started` | App → User (dashed reply) | **From model** — `sequence_rent.drawio`: `m7`. |

**From model** — preserve the above ordering and messages. `releaseBike(): Bike` is declared in the class diagram, but no separate return message is drawn; do not insert one into this sequence (`class.drawio`: `Station_m1`; `sequence_rent.drawio`: `m3`). The state model associates `unlock()` with `Available → InUse` (`state.drawio`: `t4`); the exact sequence does not contain a separate state-update message.

### 6.2 Return flow

Participants: `User` actor, `App`, `Station`, `Bike`, `Rental`, `PaymentService`.

| Order | Message | Direction | Traceability |
|---|---|---|---|
| 1 | `returnBike()` | User → App | **From model** — `sequence_return.drawio`: `m0`. |
| 2 | `dockBike(bike)` | App → Station | **From model** — `sequence_return.drawio`: `m1`. |
| 3 | `lock()` | Station → Bike | **From model** — `sequence_return.drawio`: `m2`. |
| 4 | `docked` | Station → App (dashed reply) | **From model** — `sequence_return.drawio`: `m3`. |
| 5 | `end()` | App → Rental | **From model** — `sequence_return.drawio`: `m4`. |
| 6 | `charge(cost)` | Rental → PaymentService | **From model** — `sequence_return.drawio`: `m5`. |
| 7 | `paid` | PaymentService → Rental (dashed reply) | **From model** — `sequence_return.drawio`: `m6`. |
| 8 | `cost + receipt` | Rental → App (dashed reply) | **From model** — `sequence_return.drawio`: `m7`. |
| 9 | `show receipt` | App → User (dashed reply) | **From model** — `sequence_return.drawio`: `m8`. |

The modeled path is successful payment only. Payment/receipt contents beyond the message labels are unspecified and remain minimal/opaque. There is no payment error, invalid docking, locking failure, wrong-station, or full-station branch.

## 7. Functional requirements

Each requirement is testable and identifies its source. Requirements referencing omitted failure behavior must not be interpreted as a requirement to add a new flow.

| ID | Requirement | Source |
|---|---|---|
| `FR-001` | The domain representation shall preserve the four model classes, their exact public members, types, method signatures, relationships, and multiplicities listed in Section 4. | **From model** — `class.drawio`: class IDs and `e1`–`e3` with labels. |
| `FR-002` | The client-side domain shall represent exactly the four named Bike states and every transition `t0`–`t8` in Section 5. No guard or transition action shall be added unless explicitly stated in this specification. | **From model** — `state.drawio`: `init`, `Available`, `Reserved`, `InUse`, `Maintenance`, `t0`–`t8`. |
| `FR-003` | The state transition for `t1` shall be implemented as `Available → Reserved` on `reserve()`, based on its connector geometry. The missing XML `source` attribute shall remain documented. | **From model** — `state.drawio`: `t1` visual geometry. **From decision log** — specification Q&A #14. |
| `FR-004` | The `t2` timeout shall return `Reserved` to `Available` after 10 minutes. `cancel()` shall return `Reserved` to `Available` without a fee. | **From model** — `state.drawio`: `t2`. **From decision log** — specification Q&A #4. |
| `FR-005` | `batteryLevel` shall be represented as an integer percentage in range 0–100. At or below 20%, the low-battery event shall support the diagrammed `Available → Maintenance` transition. No automatic transition from another state is specified. | **From model** — `class.drawio`: `Bike_f1`; `state.drawio`: `t7`. **From decision log** — specification Q&A #5. |
| `FR-006` | `repaired()` shall support `Maintenance → Available` and shall not implicitly set the battery level to 100 or expose a user-facing charge control. | **From model** — `state.drawio`: `t8`. **From decision log** — specification Q&A #12. |
| `FR-007` | The customer UI shall execute the rent flow using the exact participants, message names, and order in Section 6.1. It shall not insert a reservation step or add messages to the diagrammed flow. | **From model** — `sequence_rent.drawio`: `L_App`, `L_Station`, `L_Bike`, `L_Rental`, User actor, `m0`–`m7`. **From decision log** — strict diagram-only scope, specification Q&A #12. |
| `FR-008` | The customer UI shall execute the return flow using the exact participants, message names, and order in Section 6.2. It shall show only the successful payment path represented in the diagram. | **From model** — `sequence_return.drawio`: `L_App`, `L_Station`, `L_Bike`, `L_Rental`, `L_PaymentService`, User actor, `m0`–`m8`. |
| `FR-009` | Rental pricing in the mock shall be EUR 1.00 plus EUR 0.15 for each started minute, with duration rounded up to whole minutes; no deposit, discount, tax, or maximum cap shall be applied. | **From decision log** — specification Q&A #3 approval of exploration proposal. |
| `FR-010` | The client shall keep runtime state in memory only and restore seeded initial data on full page reload. It shall not persist mock domain state in localStorage or IndexedDB. | **From decision log** — exploration “Questions asked and decisions,” static mock backend; specification Q&A #8. |
| `FR-011` | The payment mock shall represent the successful `charge(cost)` / `paid` interaction and shall not collect, transmit, or store real payment credentials. Payment-method and receipt details shall remain opaque/minimal. | **From model** — `sequence_return.drawio`: `m5`–`m8`; `class.drawio`: `User_f2`. **From decision log** — specification Q&A #7–#8 and no-real-payment scope. |
| `FR-012` | The deployed site shall be a static client-side GitHub Pages site with no real backend. | **From decision log** — exploration Summary and scope; **From prompt** — Output target. |
| `FR-013` | No reservation or operator/admin user interface shall be included. The underlying diagrammed state transitions, including reservation and maintenance transitions, remain present and testable internally. | **From decision log** — specification Q&A #12, strict diagram-only scope. |
| `FR-014` | At least one seeded scenario shall permit a successful rent and return demonstration without entering external services or credentials. | **Proposal** — minimal fixture needed to demonstrate the two supplied sequences; see `A-01`. |

## 8. Non-functional requirements

The following targets originated as proposals in the exploration and were accepted in specification Q&A #10. They are explicit targets, not facts from the UML.

| ID | Requirement | Source |
|---|---|---|
| `NFR-001` | The interface shall target WCAG 2.2 AA accessibility, including keyboard operation, visible focus, semantic controls, sufficient contrast, and appropriate status announcements. | **Proposal** — exploration “Remaining assumptions and risks”; approved specification Q&A #10. |
| `NFR-002` | The layout shall support mobile and desktop responsive presentation. | **Proposal** — exploration “Remaining assumptions and risks”; approved specification Q&A #10. |
| `NFR-003` | The supported browser baseline shall be current stable Chrome, Edge, Firefox, and Safari. | **Proposal** — exploration “Remaining assumptions and risks”; approved specification Q&A #10. |
| `NFR-004` | The interface shall be English-first and use locale-aware formatting so later localization is feasible. | **Proposal** — exploration “Remaining assumptions and risks”; approved specification Q&A #10. |
| `NFR-005` | Initial compressed JavaScript should not exceed 200 KB. | **Proposal** — exploration “Remaining assumptions and risks”; approved specification Q&A #10. |
| `NFR-006` | Largest Contentful Paint should be at most 2.5 seconds on a representative mobile connection. | **Proposal** — exploration “Remaining assumptions and risks”; approved specification Q&A #10. The measurement device/network profile remains unspecified. |
| `NFR-007` | The implementation shall remain maintainable, documented, modular, and performant, with concerns separated between presentation, application orchestration, model behavior, and mock data. | **From prompt** — stated quality goals. |

## 9. Mock backend specification

| Topic | Specification | Traceability |
|---|---|---|
| Hosting | Static client-side site; no server-side API or real backend. | **From decision log** — exploration Summary and scope; **From prompt** — Output target. |
| Persistence | In-memory state only. A full page reload resets the site to its seed data. No browser persistence. | **From decision log** — exploration decisions and specification Q&A #8. |
| Seed data | Include a minimal fixture that enables a successful rent and return walkthrough. Exact record count and display values are not specified. | **Proposal** — `A-01`. |
| Latency | Do not inject artificial latency. | **From decision log** — specification Q&A #8. |
| Failures | Do not inject payment, network, unlock, lock, or docking failures. The mock covers only the success paths shown by the sequences. | **From decision log** — specification Q&A #8; **From model** — both sequence diagrams show no failure fragments. |
| Payment | A local mock boundary shall reproduce the successful sequence interaction only; no real payment integration or credentials. | **From model** — return sequence `m5`–`m8`; **From decision log** — exploration scope and Q&A #7–#8. |
| Internal transitions | All state transitions, including those without UI controls, shall be testable without adding class methods or changing diagram messages. | **From model** — `state.drawio`: `t0`–`t8`; **From decision log** — specification Q&A #12. |

## 10. Architecture and project structure

The product, GitHub Pages hosting, and client-side mock are requirements. The specific framework and folder layout below remain a non-binding proposal because the user selected “no preference” and requested the stack/tooling be labeled as proposals (specification Q&A #13).

### Proposed architecture

- **Presentation:** React components for the rent/return interface only. Presentation components are not additional UML domain classes.
- **Application orchestration:** coordinate exact sequence message order without adding messages to the modeled flows.
- **Domain behavior:** model the four diagram classes and state transitions; keep transition triggers separate from class methods where the class diagram does not declare those methods.
- **Mock infrastructure:** seeded in-memory data and successful-only payment simulation.
- **Static build/deployment:** Vite output served from GitHub Pages; configure the project base path and ensure the chosen routing strategy works on refresh.

These are **Proposals** for implementation structure; the model fidelity constraints are **From model** (`class.drawio`, `state.drawio`, and both sequence diagrams).

### Proposed project structure

```text
.
├── .github/
│   └── workflows/                 # proposed CI and Pages deployment workflow
├── docs/
│   ├── architecture.md            # required documentation
│   ├── testing.md                 # required documentation
│   └── deployment.md              # required documentation
├── reports/
│   └── ebike-rental-system-implementation-report.md
├── src/
│   ├── app/                       # presentation composition and routing
│   ├── domain/                    # the specified model and transition behavior
│   ├── application/               # rent/return orchestration
│   ├── infrastructure/mock/       # seed data and successful payment simulation
│   └── shared/                    # formatting and accessible UI helpers
├── tests/
│   ├── integration/
│   └── e2e/
├── index.html
├── package.json
└── vite.config.ts
```

The source folder organization is a proposal. It must not be used to justify additions to the UML domain model or extra UI flows.

## 11. Coding standards

The implementation should conform to the following maintainability requirements:

- **From model** — preserve every UML class/member/state/transition/message spelling and type; map implementation identifiers to diagram names explicitly if language syntax requires it.
- **Proposal** — keep application orchestration, domain transition logic, presentation, and mock infrastructure separated.
- **Proposal** — use typed interfaces and avoid untyped escape hatches; do not model a state trigger as a new UML class method (**From model** — `class.drawio` member lists and `state.drawio` transition labels).
- **Proposal** — prefer pure and deterministic transition/pricing functions where practicable.
- **Proposal** — use consistent naming and formatting, meaningful error handling for invalid internal state, and comments only where behavior is not self-evident. Unsupported trigger behavior remains open issue `O-14`.
- **From decision log** — document mock limitations and distinguish model facts from implementation choices.
- **From decision log** — include README setup/commands, architecture, testing, and deployment documentation (specification Q&A #11).

**Proposal:** TypeScript, ESLint, and Prettier are the recommended language/lint/format choices; the user has not made them binding (specification Q&A #13).

## 12. Testing specification

### Test levels

1. **Unit tests:** all states and diagrammed transitions, timestamp/pricing calculation, and data conversion at the model boundary. Behavior for unsupported triggers is not defined by the diagrams and must not add state transitions.
2. **Integration tests:** rent and return orchestration against seeded in-memory data; verify message order, state outcomes, generated cost, and successful receipt path.
3. **End-to-end tests:** browser rent → return → receipt, reload-to-seed reset, keyboard operation, responsive layout, and accessibility checks.

Reservation/maintenance transition tests are domain-level tests, not additional user journeys. No reservation or operator E2E screen is to be added.

### Coverage target proposal

**Proposal (non-binding):** at least 80% statements, branches, and functions for domain/application code. Irrespective of aggregate percentage, tests must cover every diagrammed state transition and every message in both sequence diagrams. The user elected to keep tooling and the numeric target as proposals (specification Q&A #13).

**Proposed tooling:** Vitest for unit/integration, React Testing Library for UI behavior, Playwright for browser E2E, and coverage reporting through the selected test runner. These are not binding technology choices.

### Requirement-to-test mapping

Test identifiers below define required test coverage; exact filenames are implementation-time choices.

| Requirement IDs | Required test evidence |
|---|---|
| `FR-001` | `UT-MODEL-01`: class/member/type/signature and relationship/multiplicity conformance checks against the specification. |
| `FR-002`–`FR-006` | `UT-STATE-01`: initial state and each transition `t0`–`t8`; verify `t1` interpretation, 10-minute timeout, cancel, battery threshold, and no battery reset on `repaired()`. |
| `FR-007` | `IT-RENT-01`: verify rent messages `m0`–`m7` in order and the expected completion result; `E2E-RENT-01`: perform the customer rent flow. |
| `FR-008`, `FR-011` | `IT-RETURN-01`: verify return messages `m0`–`m8` in order, successful payment, and minimal receipt; `E2E-RETURN-01`: complete return and see receipt. |
| `FR-009` | `UT-PRICE-01`: unlock fee; zero/partial/exact/over-minute durations; rounding; no deposit, tax, discount, or cap. |
| `FR-010`, `FR-014` | `IT-SEED-01`: seeded records support both happy paths; `E2E-RESET-01`: reload restores seed baseline. |
| `FR-012` | `CI-BUILD-01`: clean static build suitable for GitHub Pages and smoke test of deployed URL. |
| `FR-013` | `E2E-SCOPE-01`: only rent/return customer flows are presented; `UT-STATE-01` still covers reservation/maintenance transitions. |
| `NFR-001`–`NFR-004` | `E2E-A11Y-01`: keyboard, focus, semantics, contrast/status review; browser matrix and responsive checks documented in CI or release evidence. |
| `NFR-005`–`NFR-006` | `PERF-01`: record compressed JavaScript size and deployed LCP with test environment/device/network noted. |
| `NFR-007` | `QUAL-01`: lint/type-check/build results and architecture/code quality review. |

## 13. CI/CD and GitHub Pages deployment

- The final artifact shall be a static build deployable on GitHub Pages. **From prompt** — Output target.
- CI shall install from the committed lockfile and run formatting/lint checks, type checking, all unit/integration tests, E2E tests where supported, coverage reporting, and a production build. **Proposal** — recommended quality pipeline; report every skipped check and why.
- The deployment pipeline should publish the production build to the repository’s GitHub Pages environment and use a correct repository base path. **Proposal** — implementation approach.
- A deployment smoke test shall verify the public site loads, client assets resolve, and the rent/return happy paths remain available. **Proposal** — quality verification.
- GitHub Actions is the recommended CI/CD mechanism, but remains a **Proposal** pending implementation choices.

## 14. Assumptions

This register distinguishes implementation necessities that are not fixed by the model or approved decisions. Each assumption includes why it is needed and the risk. Approved decisions and model facts are requirements elsewhere, not reclassified as assumptions.

| ID | Description | Reason needed | Risk |
|---|---|---|---|
| `A-01` | Seed the smallest useful fixture: at least one demo user, one station, and one rentable bike with a battery level above the approved low-battery threshold. | The specified rent and return flows need initial objects to demonstrate and test. Exact seed values/counts were not decided. | A minimal fixture may not represent varied station/bike cases; the model does not specify a catalog or selection data. |
| `A-02` | Exercise state triggers that have no UI through internal domain transition logic and automated tests only. | Strict UI scope excludes reservation/operator screens, while the state diagram still requires all transitions. | Internal trigger invocation has no user workflow; later adding controls would be a scope change. |
| `A-03` | Represent `PaymentService` as a deterministic local successful-response boundary, with no payment credentials or real processor. | The return sequence requires `charge(cost)` and `paid`, while the deliverable has no backend and failures are excluded. | A success-only mock cannot validate payment failure or settlement behavior. |
| `A-04` | Use implementation-level presentation components and test helpers without treating them as additional UML domain classes or public model operations. | A website and automated tests require code structures not shown in a domain class diagram. | Boundaries could be blurred; model alignment must be checked in the post-implementation report. |
| `A-05` | Treat numeric NFR measurements as evaluated using a representative but explicitly reported device/network profile selected at implementation time. | The accepted LCP target does not define a precise testing profile. | Results may not be comparable across machines or networks. |
| `A-06` | Use the proposed TypeScript/Vite/React and test/lint toolchain unless an implementation-phase decision selects another stack. | No stack preference was provided; architecture needs a concrete reference proposal. | The project may choose different tooling; all behavioral requirements and traceability still apply. |

No reservation duration, battery threshold, pricing rate, ID format, timestamp format, or payment policy remains an assumption: these were explicitly decided in the specification Q&A. `endTime` semantics and capacity behavior remain open issues rather than assumptions.

## 15. Known deviations and open issues

No change to a diagram-defined element is authorized. This section records gaps, source conflicts, and areas that cannot be inferred. Any implementation deviation must be reported rather than hidden.

| ID | Issue | Status / handling |
|---|---|---|
| `O-01` | `t1` (`reserve()`) has no XML `source` attribute. | **Known model defect.** Specify `Available → Reserved` from connector geometry per Q&A #14; retain the source omission in traceability and the final report. |
| `O-02` | The exploration requested reservation and operator UI; the user later selected strict diagram-only UI. | **Resolved scope conflict.** Exclude both screens. Preserve/test the state machine transitions internally. This does not alter the state diagram. |
| `O-03` | Exploration approved operator instant charging, but strict scope excludes operator controls and the user rejected an inferred battery reset. | **Resolved scope conflict.** No charge control and no implicit battery reset on `repaired()`. The state transition remains. |
| `O-04` | Active `Rental.endTime` value/nullability was unspecified despite `Rental.start()` preceding `Rental.end()`. | **Resolved by ADR 0001** under the user's autonomous-completion instruction: preserve the non-null UML type; initialize `endTime` equal to `startTime` until `end()` records the return instant. This is an implementation interpretation, not a diagram fact. |
| `O-05` | Station capacity limits, occupancy accounting, full-station return, wrong-station return, and whether a bike can be docked elsewhere are unspecified. | **Open.** Preserve `capacity: int` and the Station–Bike aggregation; do not invent a rejection or relocation flow. |
| `O-06` | `PaymentMethod` values, exact receipt fields, and payment data representation are not defined. | **Open/minimal.** Do not add real credentials or a detailed payment/receipt model. Preserve the successful sequence labels. |
| `O-07` | Bike unlock/lock failures, bike unavailability, duplicate rentals, payment failure, and other error paths are absent from the sequences. | **Out of scope for this mock.** No failure branches are to be added. |
| `O-08` | `Station.releaseBike(): Bike` has a declared return type but no separate return message in the rent sequence. | **Known omission.** Keep the method signature and the exact rent messages; do not insert a reply message. |
| `O-09` | State triggers including `reserve()`, `returnToStation()`, and `repaired()` are not declared as class methods. | **Known model distinction.** Implement them as state transition triggers, not added `Bike` operations. |
| `O-10` | Reservation ownership, association to a User, and a reservation data class are absent. | **Out of scope.** Do not add a reservation class, fields, or screen. |
| `O-11` | Station and Rental have no modeled origin/destination relationship. | **Open.** Do not infer station selection or rental location persistence beyond the sequence messages. |
| `O-12` | No Authentication, App, or PaymentService classes are defined in `class.drawio`, though App and PaymentService occur as sequence participants. | **Known modeling boundary.** Treat them only as interaction participants/adapters as needed; do not claim they are model classes. |
| `O-13` | The performance measurement device/network and exact current-stable browser versions are not pinned. | **Open verification detail.** Record environment/version in performance and browser test reports. |
| `O-14` | The model does not specify behavior for an event that is not a trigger from the bike's current state. | **Open.** Test the defined transitions; do not add new transitions or user-visible error flows to resolve unsupported events. |
| `O-15` | The state diagram labels `InUse → Available` as `returnToStation()` (`t5`), while the return sequence expresses docking through `dockBike(bike)`, `lock()`, and `docked` (`m1`–`m3`) without explicitly showing the Bike state update. | **Known cross-diagram gap.** Preserve the state transition and sequence messages as drawn; do not add a state-update message or rename the trigger. |

## 16. Definition of Done

The implementation is complete only when:

1. The static site deploys and loads from GitHub Pages with its configured base path (`FR-012`).
2. The four class definitions, all attributes/methods, three relationships and multiplicities, four states, and all transitions match this specification (`FR-001`, `FR-002`).
3. Both sequence diagrams are implemented in exact message order without added/removed/renamed messages or new branches (`FR-007`, `FR-008`).
4. The approved pricing, battery threshold, timeout, persistence, and success-only mock behavior are implemented and tested as stated (`FR-004`–`FR-011`).
5. The seeded rent and return demonstrations work; reload restores seed data (`FR-010`, `FR-014`).
6. Unit, integration, and E2E tests run; every class/state/transition/message is mapped to implementation and tests in the report. Any failures, skips, or flaky tests are individually explained (Section 12; Section 17).
7. Accessibility, responsive layout, supported-browser checks, bundle size, and LCP are measured and results documented against the targets (`NFR-001`–`NFR-006`). Any unmet target is reported explicitly.
8. README, architecture, testing, and deployment documentation are present and accurate (Section 11; specification Q&A #11).
9. All remaining open issues are either resolved by an explicit user decision or listed with their implementation impact; no silent assumption or deviation remains (Section 15).
10. The post-implementation report at [`../reports/ebike-rental-system-implementation-report.md`](../reports/ebike-rental-system-implementation-report.md) is complete (Section 17).

## 17. Required post-implementation report

Create `reports/ebike-rental-system-implementation-report.md`. The report shall contain:

1. **Code quality assessment** against readability, naming, documentation, structure/modularity, separation of concerns, error handling, maintainability, accessibility, and performance. Include concrete evidence: lint/type-check/build results, metrics, and links/file references.
2. **Verification results:** full unit, integration, and end-to-end test results; coverage compared to the proposed target; and every failing, skipped, or flaky test with its cause.
3. **Model alignment matrix:** every class, attribute, method, relationship, state, transition, sequence participant, and message from the diagrams marked **aligned**, **deviated**, or **missing**, with implementation and test references.
4. **Deviations and failures:** every model deviation, unmet requirement, failed check, and assumption actually used, including small deviations. Do not rationalize, conceal, or silently omit any.
5. **Conformance verdict:** overall alignment and quality verdict, remaining risks, and recommended follow-ups.

The report must distinguish diagram facts, user decisions, and proposals, and retain the `t1` source omission and the resolved UI-scope conflict in its findings.
