# Architecture

## Scope and constraints

The site is a static GitHub Pages application. All state is held in memory;
reload creates a fresh seeded `User`, `Station`, and available `Bike`. There
are no accounts, operator screens, reservation screens, network services,
browser persistence, or real payment credentials.

The UML diagrams remain the domain and interaction ground truth. The
implementation preserves exactly the four domain classes (`User`, `Rental`,
`Station`, `Bike`), their modeled public members and `e1`–`e3` relationships,
the four Bike states and transitions `t0`–`t8`, and the sequence messages
`m0`–`m7` and `m0`–`m8`. See the generated class, state, and sequence
comparisons under [`diagrams/generated`](diagrams/generated/).

## Layers

| Layer                                           | Responsibility                                                              |
| ----------------------------------------------- | --------------------------------------------------------------------------- |
| `src/domain/model.ts`                           | UML class definitions, modeled operations, and relationship metadata.       |
| `src/domain/stateMachine.ts`                    | Bike state transitions, reservation timeout, and low-battery guard.         |
| `src/domain/pricing.ts`                         | EUR unlock fee and started-minute cost calculation.                         |
| `src/domain/stationInventory.ts`, `bikeLock.ts` | Runtime inventory and lock bookkeeping without adding UML class attributes. |
| `src/infrastructure/mock/`                      | Fresh in-memory seed state and successful-only `charge(cost)` boundary.     |
| `src/application/rentBike.ts`, `returnBike.ts`  | Ordered successful-flow orchestration and typed message records.            |
| `src/App.tsx`                                   | Accessible customer UI, flow status, and minimal receipt display.           |

The inventory and lock adapters use `WeakMap`s keyed by the modeled instances.
This keeps support data outside the public UML class shape and allows garbage
collection with the object. The UI calls the application flows rather than
implementing domain transitions itself.

## Model interpretations and open issues

- ADR 0001 initializes `Rental.endTime` to `startTime` in `Rental.start()` and
  updates it in `Rental.end()`. This preserves the non-null UML type but is an
  interpretation with a documented active-rental timestamp risk.
- The state diagram's `t1` XML omits its `source`; `Available → Reserved` uses
  the agreed connector geometry.
- Return applies `t5` after the `docked` sequence message because the return
  sequence contains no explicit `returnToStation()` message (`O-15`).
- Unsupported internal Bike triggers throw an error without changing state.
  This is the documented `O-14` assumption, not a new user-facing flow.
- Station capacity is stored but not enforced; no capacity policy was supplied.

See the specification and implementation plan for the full assumptions,
deviation, and traceability records.
