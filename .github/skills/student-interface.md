# Student Interface Specification

## Domain Overview and Architecture

The student module owns student-facing navigation, practice workspaces, exercise presentation, progress feedback, and submission entry points. It composes tools from the mathematics module and must not contain parsing, graph sampling, grading, or persistence algorithms.
Present the curriculum as Grade → subject → chapter → subchapter. Keep this catalog data-driven and local to the student module. Show planned/unavailable content distinctly from selectable lessons, and render the selected lesson within its chapter context.

The Grade 10 derivative lesson is specified in `.github/skills/grade10-derivatives.md`; its exercise flow may own ephemeral score and progress state, while mathematical answer validation must remain in the math module.

## UI/UX Standards

- All student-facing copy is Hebrew with RTL layout; formulas and numeric values remain LTR.
- Keep the current activity and next action visually clear, with responsive layouts and accessible controls.
- Every implemented subchapter with exercises provides a top-level exercise map named for that subchapter. Show one clickable tile per question, visibly distinguish solved and unsolved questions, and allow direct navigation to any question without removing the session's completion state.
- Feedback should be formative, specific, and non-punitive. Do not reveal solution steps before the exercise flow requests them.

## Data Contracts and APIs

- `StudentWorkspace`: student context plus active learning activity.
- `ExerciseSummary`: stable exercise identifier, Hebrew title, grade level, and availability state.
- `ProgressSummary`: completed/total counts and optional feedback status.
- Access shared math capabilities only through the math module's public exports.

## Edge Cases and Constraints

- Support empty, loading, unavailable, and error states.
- Do not assume a student identity or persist personal data until authentication/storage contracts are defined.
- Make the current grade, subject, chapter, and subchapter visible in the learning flow; keep navigation usable on small screens.
- Keep interaction usable on narrow screens, touch devices, and keyboard-only navigation.
