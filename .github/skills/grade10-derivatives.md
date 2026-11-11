# Grade 10 Derivatives Lesson Specification

## Domain Overview and Architecture

This feature introduces the derivative to Grade 10 students through one short conceptual lesson followed by progressively harder, game-like practice. Keep the lesson UI in `src/modules/student/derivatives`; answer equivalence and mathematical validation belong in the pure math domain. The student module may consume the math module's public API but must not implement symbolic/numerical comparison itself.
The Grade 10, 5-unit curriculum is navigated as a hierarchy of subjects, chapters, and subchapters. The differential calculus subject includes a polynomial-functions chapter with separate subchapters for derivative rules, evaluating a derivative at a graph point, and calculating tangent slopes/finding graph coordinates. The catalog may include planned subjects and lessons, but must label unavailable material clearly and only activate implemented lessons.

## Learning Sequence

1. Explain derivative as instantaneous rate of change and tangent slope, connecting average rate of change over smaller intervals to the derivative.
2. Introduce the starter rules: derivative of a constant is zero; power rule `d(x^n)/dx = n*x^(n-1)`; constant multiple and sum/difference rules.
3. Practice in ascending difficulty: derivative of a constant; a simple power; a coefficient times a power; sums of terms; a polynomial; a mixed polynomial challenge.
4. Award points and maintain a streak; show immediate supportive feedback. Unlock the next item only after a correct response. Allow correction without losing accumulated points.
5. In the derivative-at-a-point subchapter, explain that the derivative function gives tangent slope at each x-value. For every exercise, students first derive the polynomial, then substitute that derivative at multiple stated x-values. Reveal evaluation inputs only after the derivative is correct; complete the exercise only when all point values are correct.
6. In the tangent-slope subchapter, explicitly connect the derivative value at x to the tangent slope there. Practice evaluating slopes, finding graph coordinates for a given tangent slope, and finding intersections. Coordinate answers use separate x and y fields visibly presented as `(x, y)`; validate both coordinates as a pair against the expected point.
7. In subchapter 1.4, make each exercise a two-stage activity: students first enter and verify the derivative, then use that derivative to find tangent slope and point coordinates. Display the student's verified derivative during the second stage. Construct the tangent using point-slope form `y - y1 = m(x - x1)`, and reveal the substituted equation after its slope and point are correct. Practice known points, tangents parallel to a given line, horizontal tangents, and intersections of two tangents. Include visual graph illustrations for selected exercises, showing the function and each relevant line (including secants when they define the points of tangency).

## UI/UX Standards

- Student-facing text and math instruction are in Hebrew and RTL. Expression input and formulas are LTR.
- Show a progress indicator, difficulty labels, score/streak, a dedicated algebra keyboard, and an explicit next-exercise action.
- Keep an editable plain-text source field paired with a typeset formula preview. Keyboard insertion preserves selection/caret.
- Explain approximate or supported validation limits honestly. Do not mark invalid/empty input as incorrect mathematical reasoning.
- The lesson and the exercise flow must work with keyboard, touch, and narrow layouts.
- Keep exercise graph illustrations compact beside the prompt on wider screens, stack them responsively on narrow screens, and provide an explicit enlarge/close control.

## Data Contracts and APIs

- `DerivativeExercise`: stable id, function expression, expected derivative, level, hint, and explanation.
- `DerivativePointExercise`: stable id, function expression, expected derivative, and two or more evaluation x-values.
- `DerivativeAnswerResult`: `correct`, `incorrect`, `empty`, or `invalid` state.
- `validateDerivativeAnswer(answer, expected)`: pure utility that accepts algebraically equivalent expressions and rejects malformed/non-finite expressions.
- `validateFunctionValue(expression, x, answer)`: pure math-domain utility for validating a finite numeric value of an expression at a specified point.
- Progress state is local to the current session until authentication and persistence are specified.

## Edge Cases and Constraints

- Accept equivalent ordering, whitespace, explicit/implicit multiplication, and equivalent simple polynomial forms.
- Reject empty or malformed input without throwing or losing the current answer.
- Numerical equivalence checks are approximate and must be paired with symbolic simplification when possible; avoid division by zero/sample-domain failures.
- No timer or punitive loss mechanic. Repeated attempts remain possible; award full points only on the first successful attempt.
- Do not claim completion means formal symbolic proof. State that current checking is intended for the polynomial patterns taught in this lesson.
- Point-value validation must distinguish empty and malformed input from a mathematically incorrect value, and must handle non-finite evaluations safely.
- Coordinate-entry fields must label x and y separately, preserve negative values, and validate the point as a pair rather than accepting a correct y-coordinate with an unrelated x-coordinate.
- Tangent equation exercises should verify the derivative before enabling point/slope fields. Check x₁, y₁, and m independently; accept exact simple fractions, decimals, and x-independent numeric radical expressions. Graph illustrations are explanatory, not answer validators, and must visually distinguish the function from secants and tangent lines.
- Check supplied exercise keys against the derivative definition before publishing; correct any inconsistent tangent equations or intersection coordinates rather than preserving an incorrect answer key.
