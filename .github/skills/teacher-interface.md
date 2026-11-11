# Teacher Interface Specification

## Domain Overview and Architecture

The teacher module owns teacher-facing course/group management, exercise configuration, submissions review, and analytics presentation. It must remain isolated from student page components and consume shared services through typed contracts.

## UI/UX Standards

- All teacher-facing copy is Hebrew with RTL layout; identifiers, codes, and mathematical expressions use LTR presentation where appropriate.
- Prioritize group context, assignment status, and actionable review queues.
- Provide confirmation for destructive actions and visible save/error status for configuration changes.
- Design dashboards to work on desktop and tablet, with usable compact layouts.

## Data Contracts and APIs

- `TeacherGroup`: stable identifier, Hebrew display name, join code, and membership count.
- `AssignmentConfig`: exercise identifier, enabled state, and feature flags.
- `SubmissionSummary`: student-safe display reference, submission state, timestamp, and review state.
- Keep storage/network behavior behind service interfaces; do not hardcode a backend provider into components.

## Edge Cases and Constraints

- Join codes must be unique, validated, and never treated as authentication secrets.
- Handle empty groups, no submissions, stale data, partial failures, and permission errors.
- Avoid exposing student personal data in analytics beyond the defined authorization contract.
