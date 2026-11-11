# Application Architecture

This document describes the module boundaries and the incremental migration plan. The project remains a React, TypeScript, and Tailwind CSS application with Hebrew RTL interfaces.

## Feature Modules

### Math

Owns reusable mathematical input and analysis capabilities: expression parsing, evaluation, graph sampling, graph interaction, and future domain, derivative, extrema, and asymptote analysis. Pure domain utilities must not depend on React.

### Student

Owns student navigation, curriculum hierarchy (grade, subject, chapter, and subchapter), exercises, learning flow, and progress presentation. It composes tools from the math module through its public API and does not implement mathematical algorithms. Grade 10 derivative lessons live under `src/modules/student/derivatives`; they own lesson and session-only score state, while mathematical answer equivalence and point-value validation remain in the math domain.

### Teacher

Owns group management, assignment configuration, submission review, and analytics presentation. It stays isolated from student components and uses typed services for data access.

### Application Shell

Owns role selection, shared page framing, and composition of the student and teacher modules. It does not own feature-specific business logic.

## Dependency Direction

`app` composes `student` and `teacher`; both may consume public contracts from `math` and shared infrastructure. `math` is independent of the two role modules. Avoid importing components directly between student and teacher modules.

## Source Layout

```text
src/
  app/                 Application shell and top-level composition
  modules/
    math/
      domain/          Framework-independent expression and analysis utilities
      graphing/        Graph viewport, graph interaction, and expression preview UI
      input/           Cursor-aware mathematical keyboard
    student/           Student workspace and learning flows
    teacher/           Teacher dashboard and management flows
  shared/              Future genuinely cross-cutting primitives and services
```

The `src/modules/math/index.ts` barrel is the public boundary for math capabilities. The graphing calculator, typeset expression preview, and virtual keyboard are now implemented within the math module. Keep graph presentation separate from numerical analysis utilities.

## Language and Accessibility

- Use English for code, identifiers, type names, comments, and developer documentation.
- Keep student and teacher interface copy in Hebrew and use RTL at the page boundary.
- Render expressions, coordinates, and codes in LTR contexts.
- Support keyboard focus, accessible labels, responsive layouts, and visible empty/error states.

## Data and Service Boundaries

Keep persistence and network calls behind typed interfaces. The initial teacher view is a UI scaffold only; it does not imply authentication, real groups, analytics, or stored student data. Define those service contracts before connecting a backend.

## Change Process

Before implementing a complex module, review `docs/ROADMAP.md` and the relevant `.github/skills/*.md` specification. Update the specification and roadmap when behavior or module boundaries change.
