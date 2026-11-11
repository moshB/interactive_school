# GitHub Copilot Instructions - Math 10-12 Interactive Platform

## Project Overview
A comprehensive web-based mathematics learning platform for high school students (specifically 10th-12th grade, 4-5 YH-L), featuring interactive exercises, step-by-step function analysis, a built-in graphing calculator (Desmos/GeoGebra style), teacher dashboards, and student progress tracking.

## Tech Stack & Architecture
- **Frontend:** React / Next.js with TypeScript and Tailwind CSS.
- **Math Rendering:** KaTeX or MathJax for mathematical expressions.
- **Graphing Engine:** Custom canvas/SVG or standard mathematical graphing libraries for real-time visualization.
- **State & Data:** Modular component structure with clear separation between UI, math logic, and storage.

## Language & Documentation Standard
- **Code & Comments (Developer-Facing):** ALL code, variable names, function signatures, interface definitions, commits, and code comments MUST be written exclusively in **English**.
- **User Interface (Student/Teacher-Facing):** ALL user-facing text, labels, UI components, instructions, math terminology, and feedback messages MUST be written in **Hebrew** with proper RTL (right-to-left) support.

## AI Skill Creation & Reusability Strategy
- **Create AI Skills First:** Before building a complex module (e.g., Graphing Calculator, Symbolic Derivative Engine, Step Validator, Teacher Dashboard), create or update a dedicated **Skill Specification Document** under `.github/skills/<skill-name>.md` or `docs/skills/`.
- **Skill Contents:** Each Skill document must define:
  1. **Domain Overview & Architecture:** High-level goals and technical approach.
  2. **UI/UX Standards:** Layout, interaction models, and styling patterns (e.g., Desmos-like behavior, keyboard mappings).
  3. **Data Contracts & APIs:** Core data structures, input/output types, and calculation rules.
  4. **Edge Cases & Constraints:** Mathematical edge cases (e.g., division by zero, asymptotes, scale adjustments).
- **Leverage Existing Skills:** When asked to implement or update a feature, inspect existing AI Skill documents first to maintain architectural continuity without needing to reverse-engineer existing code.

## Core Rules for Development
1. **Developer Language Standard:** Keep code completely in English. Do not write inline code comments, variable names, or function descriptions in Hebrew.
2. **UI & Internationalization:** Hardcoded UI strings or localization files must strictly use correct Hebrew mathematical terminology (e.g., תחום הגדרה, נגזרת, נקודות קיצון, אסימפטוטות).
3. **Modularity & Reusability:** Build reusable components backed by dedicated technical utilities and documented AI Skills.
4. **Mathematical Accuracy:** Ensure robust analytical parsing for function evaluation, derivatives, roots, and boundary conditions.
5. **Consistency:** Before implementing a feature, review `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`, and the relevant specifications under `.github/skills/`. Keep these documents aligned with the implementation.