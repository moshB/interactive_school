# Mathematics Module Specification

## Domain Overview and Architecture

The mathematics module owns expression input, parsing/evaluation, graph visualization, and future function analysis. Split pure domain logic from React presentation:

- `domain`: validated function expressions, numerical sampling, intercepts, derivatives, extrema, domains, and asymptotes.
- `graphing`: viewport transforms, curve sampling, axes, and graph interaction presentation.
- `input`: math keyboard and cursor-aware expression editing.

The domain layer must not import React or student/teacher modules. Use `mathjs` behind a narrow adapter; do not expose mathjs parser internals through student/teacher contracts.

## UI/UX Standards

- Use Hebrew labels and RTL page layout; keep mathematical expressions LTR.
- Keyboard insertions preserve the active caret/selection and return focus to the expression field.
- Graphing must support pan, zoom, hover tracing, and clear invalid-expression feedback.
- Distinguish invalid values and discontinuities; never connect graph segments across a known invalid sample.
- Support multiple independently editable and toggleable expressions with stable colors and row controls.
- Provide a readable typeset preview for common notation such as stacked fractions, powers, and square roots while retaining an accessible, keyboard-editable source field.
- Provide an optional numerical local-extrema overlay with clear indication that results are approximate.
- Organize math controls into compact, discoverable keyboard groups and ensure insertion targets the currently active expression.

## Data Contracts and APIs

- `FunctionExpression`: original source plus a compiled evaluator abstraction.
- `EvaluationResult`: finite numeric value or a typed evaluation failure.
- `validateFunctionValue(expression, x, answer)`: validates a numeric answer against a compiled expression evaluated at a specified point, with typed empty/invalid/incorrect/correct results.
- `GraphViewport`: finite ordered x/y bounds.
- `GraphSample`: x/y data with validity state.
- `GraphExpression`: stable expression id, source, visibility, and graph color.
- `ExtremumPoint`: x/y coordinate, minimum/maximum kind, and numerical-approximation state.
- Module consumers use exported APIs from `src/modules/math/index.ts`; presentation components are not imported directly across features.

## Edge Cases and Constraints

- Reject empty or malformed expressions and non-finite results without crashing the UI.
- Numeric answer validation must reject non-finite x-values/results and distinguish empty answers from malformed or incorrect answers.
- Handle division by zero, square-root domain violations, discontinuities, large values, and viewport bounds.
- Numerical intercept detection is approximate and must be labeled as such; tangential roots may not be detected by sign changes alone.
- Numerical extrema can be missed for flat, rapidly oscillating, discontinuous, or out-of-range functions; mark the display as approximate and do not imply symbolic proof.
- Keep expression rendering and input synchronized, support empty/incomplete input during editing, and preserve caret/selection for keyboard insertions.
- Multiple function sampling and analysis must be bounded to avoid blocking the UI.
- Bound sampling work and expression complexity; do not execute arbitrary user-supplied JavaScript.
