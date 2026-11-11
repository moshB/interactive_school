# Modular Architecture Specification

## Purpose

Define stable boundaries for the mathematics platform so math logic, student experiences, teacher workflows, and infrastructure can evolve independently.

## Module Boundaries

- `src/modules/math`: expression parsing, evaluation, graphing, reusable mathematical tools, and domain contracts. This module must not depend on student or teacher UI.
- `src/modules/student`: student-facing pages and learning flows. It may consume public APIs from `math` and application services, but must not implement math algorithms.
- `src/modules/teacher`: teacher-facing pages and workflows. It may consume shared domain contracts and application services, but must not import student page components.
- `src/app`: application composition, role navigation, global layout, and dependency wiring.
- `src/shared`: cross-cutting UI primitives and infrastructure only when genuinely shared.

## Dependency Direction

Application composition depends on feature modules. Student and teacher modules depend on public domain/service contracts. Math domain code remains framework-independent wherever possible. Avoid circular imports and cross-role component imports.

## Language and UI

Use English for identifiers, types, code comments, and developer documentation. Keep student/teacher UI copy in Hebrew and set RTL at the relevant page boundary. Keep numeric expressions and function inputs in LTR contexts.

## Integration Contracts

- Export module APIs through each module's `index.ts`.
- Prefer explicit TypeScript types for inputs/outputs and typed result/error states over throwing user-facing parsing errors.
- Keep rendering components separate from numerical analysis utilities.
- Treat persistence and network calls as services behind interfaces; do not couple UI modules to a specific storage provider.

## Quality Gates

- TypeScript strict mode must remain enabled.
- Validate mathematical edge cases and malformed input.
- Provide accessible names, keyboard focus states, responsive layouts, and Hebrew RTL behavior.
- Update this specification, the module specification, and `docs/ROADMAP.md` when boundaries change.
