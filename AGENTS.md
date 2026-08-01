# Talentry Repository Instructions

## Project

- Internal technical codename: InterviewAI.
- Commercial product name: not finalized.
- Product direction: AI-powered career preparation platform.
- Approved product and design decisions must not be changed implicitly.
- The detailed governance source is `docs/00_Project_Constitution/Talentry_Engineering_Standard_v1.md`.

## Mandatory workflow

Every development task must:

1. Inspect the current repository and Git state.
2. Confirm the requested sprint scope.
3. Implement only the approved scope.
4. Run the required validation.
5. Produce both required reports.
6. Stop and request approval.
7. Never begin the next sprint automatically.
8. Commit only after explicit user approval.

## Single-path rule

- Select and follow one optimal implementation path before coding.
- Do not change the plan during implementation.
- Change the plan only when a genuinely new critical technical finding appears.
- When that happens, stop, explain the finding and risk, and request approval.
- Do not introduce unsolicited alternatives.

## Scope control

- Never exceed the requested sprint or modify approved modules unless explicitly requested.
- Never perform unrelated refactoring.
- Never delete, rename, move, restore, reset, or replace files outside scope.
- Never install packages unless explicitly requested.
- Never add business logic to presentational UI components.
- Never silently introduce fake business data.

## Git rules

- Never stage, commit, push, merge, rebase, reset, restore, stash, switch branches, or create branches unless explicitly requested.
- Never expose secrets or display environment-variable values.
- Preserve the current working tree.
- Stop on unexpected Git or permission errors.

## Code quality

- Use TypeScript for new React code and avoid `any`.
- Keep one responsibility per component; keep React component files under 150 lines whenever reasonably possible.
- Use Talentry design tokens for shared design values.
- Do not embed very large CSS blocks inside React components.
- Do not use styled-jsx or Tailwind unless explicitly approved.
- Maintain accessibility and keyboard focus, respect `prefers-reduced-motion`, and do not use color alone for critical meaning.

## Approved product rules

- Application language and interview language are separate.
- Supported application languages are `tr`, `en`, and `de`.
- Email OTP length is 6 digits.
- Password minimum length is 8 characters and requires at least one uppercase letter, one lowercase letter, and one number. Special characters are recommended but not mandatory.
- Career Level, XP, and gamification are deferred and must not be added to the MVP.
- LinkedIn must not be scraped.
- Job integrations must use approved APIs, permitted sources, or user-provided imports.

## Design system

- `styles/talentry-tokens.css` is the single source of truth for approved design values.
- Use softened navy, purple-indigo accents, white, and pale-lavender surfaces.
- Maintain calm, professional, spacious, and readable SaaS styling.
- Never infer or invent a second design palette.
- Existing approved Welcome, Sign In, and Dashboard Blueprints are design references.

## Required validation

Unless a task explicitly states otherwise, run:

```text
npx tsc --noEmit --incremental false
npm run build
```

If a command cannot run, report the exact reason. Never conceal warnings or errors.

## Mandatory dual reporting

Every implementation sprint must create:

- `docs/01_Engineering/Sprint_<SPRINT_ID>_Summary.md`
- `docs/01_Engineering/Sprint_<SPRINT_ID>_Engineering_Report.md`

The Summary must include sprint ID and title, branch, status, goal, created files, modified files, validation results, risks or problems, and approval status.

The Engineering Report must include report identity; sprint objective and boundaries; repository state before implementation; architecture and implementation decisions; created and modified files; each file's responsibility; public interfaces, props, or types; accessibility decisions; styling and token usage; validation commands and exact results; Git status; complete sprint-file diffs; risks, limitations, and technical debt; untouched-module confirmation; and approval required.

Reports must describe only completed work, never claim approval before review, and never rewrite previous sprint reports. Each sprint creates new immutable report files. The chat response must include a short sprint summary; full diffs belong in the Engineering Report unless explicitly requested in chat.

## Stop rule

After completing the requested task and reports, stop, request approval, and do not continue to another sprint or task automatically.
