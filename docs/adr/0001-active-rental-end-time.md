# ADR 0001: Active rental end-time value

- **Status:** Accepted under the user's autonomous-completion instruction dated 2026-10-19.
- **Date:** 2026-10-19
- **Scope:** Specification issue `O-04`; `Rental.endTime`; `Rental.start()` and `Rental.end()`.

## Context

The class diagram declares `Rental.endTime: DateTime` as a non-nullable value. The rent sequence calls `Rental.start()`, while the return sequence later calls `Rental.end()`. The specification left the value of `endTime` between those calls open and prohibited silently choosing nullability or a sentinel. This prevents a rental from being instantiated at the rent step while preserving the declared class shape.

## Decision

When a rental starts, record the current ISO 8601 UTC instant in both `startTime` and `endTime`. Treat equal timestamps as the initial zero-elapsed-time boundary, not as a null or sentinel. When the rental ends, replace `endTime` with the actual return instant. Pricing is calculated only after `end()`, from the resulting `endTime - startTime`.

This preserves the UML `DateTime` type and member inventory. It adds no state, member, or sequence message. The equality of start/end while active is an implementation interpretation and remains visible in the final assumptions and conformance report.

## Consequences

- A `Rental` can be created at the rent flow and retains valid, non-null ISO timestamps throughout its lifecycle.
- Before the return interaction, the two timestamps are equal; callers must not treat the active boundary as a completed rental.
- If start and end occur within the same instant, the approved unlock fee still applies and no started-minute fee is added.
- Tests must verify both the initialized boundary and replacement at end time.

## Alternatives considered

- Make `endTime` nullable: rejected because this changes the declared `DateTime` type.
- Use an epoch or other sentinel: rejected because it does not represent the rental lifecycle and was explicitly disallowed by the open issue.
- Defer constructing `Rental` until return: rejected because the rent sequence calls `Rental.start()` and reports `rental started`.

## Approval basis

The user instructed the implementation to continue autonomously, make decisions rather than stop at open questions, and complete the work. This ADR records the narrowest type-preserving implementation decision for `O-04`; it is not presented as a change to the UML diagrams.
