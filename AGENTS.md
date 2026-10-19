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
