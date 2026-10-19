# Generated diagrams

These diagrams are generated from the implementation sources, not copied from
the input diagrams. Run `npm run diagrams:generate` to regenerate them and
`npm run diagrams:check` to confirm the checked-in diagrams match their source
definitions. The class generator reads the public model declarations and
relationship metadata from `src/domain/model.ts`; sequence generators read the
participant and message constants from the application flow modules. The state
generator reads the transition definitions from `src/domain/stateMachine.ts`.
The specification's UML is still the ground truth for the comparisons.

| Diagram               | Source of implementation details                                                 | Ground truth comparison                                                                |
| --------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `class.mmd`           | `src/domain/model.ts`                                                            | `class.drawio`; see the Phase 2 alignment matrix in the implementation plan.           |
| `state.mmd`           | `src/domain/stateMachine.ts` and the `Bike` constructor in `src/domain/model.ts` | `state.drawio`; see the Phase 3 alignment matrix in the implementation plan.           |
| `rent-sequence.mmd`   | `RENT_MESSAGE_SEQUENCE` and `rentBike` in `src/application/rentBike.ts`          | `sequence_rent.drawio`; see the Phase 5 alignment matrix in the implementation plan.   |
| `return-sequence.mmd` | `RETURN_MESSAGE_SEQUENCE` and `returnBike` in `src/application/returnBike.ts`    | `sequence_return.drawio`; see the Phase 6 alignment matrix in the implementation plan. |
| `use-case.mmd`        | Rent/return application use cases and their returned receipt                     | Derived from code; no UML ground truth.                                                |
| `activity.mmd`        | Ordered successful message definitions in both application sequence constants    | Derived from code; no UML ground truth.                                                |

The use-case/activity diagrams also include behavior not covered by the UML:
the browser starts from fresh seeded data on reload, and the successful return
exposes the minimal `rentalId`/`cost` receipt display. The UML diagrams remain
the comparison ground truth only for the class, state, rent-sequence, and
return-sequence diagrams.
