# Talentry Engineering Standard v1.0

## 1. Document Identity

- Document: Talentry Engineering Standard
- Version: 1.0
- Status: Approved governance baseline
- Repository codename: InterviewAI
- Authority: This document is the detailed governance source for engineering work in this repository.

## 2. Purpose

This handbook defines the permanent workflow, quality gates, safety rules, reporting requirements, and approval boundaries for Talentry engineering. It exists to keep product development deliberate, reviewable, reversible, and aligned with approved product and design decisions.

## 3. Product Context

InterviewAI is the internal technical codename. The commercial product name is not finalized. The product direction is an AI-powered career preparation platform spanning authentication, dashboard, jobs, interviews, reports, AI coaching, settings, premium experiences, web, iOS, and Android.

Approved product and design decisions are constraints. They must not be changed, reinterpreted, or replaced implicitly during implementation.

## 4. Golden Engineering Rule

Every interaction should make the next career step feel easier.

Engineering must optimize for clear user value, trustworthy behavior, accessibility, security, and maintainability. User value before complexity. Security before cosmetic cleanup. Design tokens before duplicated visual values.

## 5. Development Session Workflow

Every development session follows this order:

1. Inspect repository structure, relevant files, current branch, and Git status.
2. Confirm the requested sprint, primary goal, allowed files, forbidden files, and risk level.
3. Choose one optimal implementation path.
4. Implement only the approved scope.
5. Run the required quality gates.
6. Create both required sprint reports unless the task explicitly exempts itself.
7. Provide a concise chat summary.
8. Stop and request acceptance approval.
9. Perform Git mutations only when separately and explicitly authorized.

Blueprint before implementation. One task at a time. No automatic continuation.

## 6. Sprint Lifecycle

Each sprint has one primary goal: One sprint, one primary goal.

The lifecycle is:

1. Scope definition
2. Repository inspection
3. Implementation
4. Type and build validation
5. Dual reporting
6. Acceptance review before commit
7. Explicit approval
8. Separately authorized checkpoint or commit, when requested

A completed sprint does not authorize the next sprint.

## 7. Single Optimal Path Policy

Before coding, select the single implementation path that best satisfies the approved scope with the least unnecessary complexity and risk. Do not introduce unsolicited alternatives after implementation begins.

No mid-plan changes without a critical new finding. A plan may change only when a genuinely new critical technical fact makes the approved path unsafe, invalid, or impossible. Stop immediately, explain the finding and its risk, and request approval before changing direction.

## 8. Scope and Change Control

- Never exceed the active sprint.
- Modify only explicitly permitted files and modules.
- Do not refactor unrelated code.
- Do not delete, rename, move, restore, reset, or replace out-of-scope files.
- Do not install packages unless explicitly requested.
- Do not populate presentational shells with fake business data.
- Do not add future-sprint abstractions without approval.
- Preserve existing behavior unless the sprint explicitly authorizes a behavior change.

If scope is ambiguous and different interpretations materially change the implementation, stop and request clarification.

## 9. Architecture Principles

- Keep presentation, business rules, data access, and external integrations separated.
- Give each module and component one clear responsibility.
- Prefer small, explicit interfaces over hidden coupling.
- Keep reusable primitives business-agnostic.
- Centralize shared product contracts and design values.
- Avoid speculative layers and premature frameworks.
- Keep third-party service access behind controlled server boundaries.
- Make changes reversible and independently reviewable.

## 10. UI and Design-System Rules

`styles/talentry-tokens.css` is the single source of truth for approved design values. Product UI must use the approved softened navy, purple-indigo accents, white, and pale-lavender surfaces. Styling should remain calm, professional, spacious, and readable.

- Never infer or invent a second palette.
- Use tokens rather than duplicated color, spacing, radius, shadow, typography, or motion values.
- Existing approved Welcome, Sign In, and Dashboard Blueprints are visual references.
- Do not use styled-jsx or Tailwind unless explicitly approved.
- Do not embed large CSS blocks in React components.
- Base UI components must not contain business logic.

## 11. TypeScript and React Standards

- Use TypeScript for all new React code.
- Avoid `any`; use precise types, discriminated unions, generics, or `unknown` with narrowing.
- Preserve appropriate native HTML attributes in reusable controls.
- Prefer semantic HTML.
- Keep React components under 150 lines whenever reasonably possible.
- Separate data configuration from rendering when it improves clarity.
- Do not introduce state or effects into presentational components without a demonstrated need.
- Keep public props minimal, typed, and business-agnostic.

## 12. Accessibility Standards

- Maintain WCAG AA contrast for text and interactive controls.
- Keep normal interactive controls at least 44px high.
- Ensure keyboard focus is always visible.
- Use semantic elements and accessible names.
- Do not communicate critical status through color alone.
- Hover must never be the only feedback.
- Support disabled, focus-visible, busy, and loading states where relevant.
- Respect `prefers-reduced-motion`.
- Test keyboard and screen-reader behavior in proportion to the sprint risk.

## 13. Security and Privacy Standards

- Never expose secrets or environment-variable values.
- Do not place sensitive user content in URLs, logs, or unprotected client storage.
- Validate and constrain input at trust boundaries.
- Authenticate and authorize protected or cost-bearing server operations.
- Use approved APIs and permitted data sources.
- LinkedIn must not be scraped.
- Minimize retained personal data and document why it is needed.
- Never hide security warnings or provider failures.
- Resolve security risks before cosmetic cleanup.

## 14. Git and Branch Safety

- Inspect the branch and working tree before implementation.
- Preserve pre-existing user changes.
- Never stage, commit, push, merge, rebase, reset, restore, stash, switch branches, or create branches unless explicitly requested.
- Never discard work to obtain a clean tree.
- Do not expose credentials through remote inspection.
- Stop on unexpected Git, lock, filesystem, or permission errors.
- A commit or checkpoint must contain only the explicitly reviewed scope.

## 15. Validation and Quality Gates

Unless a task explicitly states otherwise, run:

```text
npx tsc --noEmit --incremental false
npm run build
```

Report exact exit status, errors, and warnings. If a command cannot run, report the exact reason. Never add packages or scripts merely to satisfy a validation instruction unless explicitly approved.

Before requesting approval, also verify:

- Only permitted files changed.
- Required public exports exist.
- No forbidden module changed.
- Git status matches the report.
- Secrets and generated directories remain excluded.

## 16. Mandatory Dual Reporting

Every implementation sprint creates two immutable files:

```text
docs/01_Engineering/Sprint_<SPRINT_ID>_Summary.md
docs/01_Engineering/Sprint_<SPRINT_ID>_Engineering_Report.md
```

The Summary is a concise acceptance overview. The Engineering Report is the complete technical record. Reports describe only work actually performed and must never claim approval before review.

Previous reports are immutable historical records. Corrective work receives a new sprint report or an explicitly approved addendum; it does not rewrite history.

## 17. Engineering Report Template

```markdown
# Sprint <SPRINT_ID> Engineering Report

## 1. Report Identity
## 2. Sprint Objective and Boundaries
## 3. Repository State Before Implementation
## 4. Architecture and Implementation Decisions
## 5. Created and Modified Files
## 6. Responsibility of Each File
## 7. Public Interfaces, Props, or Types
## 8. Accessibility Decisions
## 9. Styling and Token Usage
## 10. Validation Commands and Exact Results
## 11. Git Status
## 12. Complete Diffs for Sprint Files
## 13. Risks, Limitations, and Technical Debt
## 14. Untouched-Module Confirmation
## 15. Approval Required
```

Full sprint-file diffs belong in this report unless the task explicitly requests them in chat.

## 18. Sprint Summary Template

```markdown
# Sprint <SPRINT_ID> Summary

- Title:
- Branch:
- Status: Awaiting approval
- Goal:
- Created files:
- Modified files:
- Validation results:
- Risks or problems:
- Approval status: Not yet approved
```

## 19. Decision Log Policy

Material architecture, product, security, data, dependency, and governance decisions must be recorded as Architecture Decision Records under `docs/02_Decisions/`.

Use `ADR-###-short-title.md`. Each ADR records Status, Date, Context, Decision, Alternatives considered, Consequences, Risks, Rollback approach, and Related sprints.

An ADR records a decision; it does not independently authorize implementation.

## 20. Error and Stop Conditions

Stop immediately when:

- A critical new technical finding invalidates the approved plan.
- Required authority or product information is missing.
- Git state differs materially from the expected state.
- A Git or permission operation fails unexpectedly.
- Completing the work requires an out-of-scope file or package change.
- Validation reveals a failure that cannot be corrected inside the approved scope.
- A destructive or externally visible action lacks explicit approval.

Report the exact condition, completed work, unchanged state, and approval needed. Do not silently work around the boundary.

## 21. Approval and Commit Policy

Acceptance review before commit is mandatory. Completing implementation and validation does not grant commit authority.

- Stop and request approval after every sprint.
- Never claim approval before the user grants it.
- Commit only after explicit user approval.
- Stage only reviewed sprint files.
- Never push unless push is separately and explicitly approved.
- Never begin the next sprint automatically.

## 22. Deferred Features and Explicit Non-Goals

The MVP must not include these deferred career-progression systems unless separately approved:

- Career Level
- XP
- Gamification
- Achievement badges
- Skill trees
- Advanced premium career progression

Application language and interview language remain separate concepts. Supported application languages are `tr`, `en`, and `de`. Email OTP length is 6 digits. Passwords require at least 8 characters, one uppercase letter, one lowercase letter, and one number; special characters are recommended but not mandatory.

Job integrations must use approved APIs, permitted sources, or user-provided imports. LinkedIn scraping is prohibited.

## 23. Definition of Done

A sprint is ready for acceptance only when:

- Its one primary goal is implemented within scope.
- No forbidden files or modules changed.
- Public interfaces and accessibility behavior match the specification.
- Talentry design tokens are used where applicable.
- Required TypeScript and build validation has completed successfully, or exact blockers are reported.
- Git status is documented.
- Both immutable sprint reports are complete, unless the task explicitly exempts reporting.
- The chat summary is complete.
- Risks, limitations, and technical debt are disclosed.
- Approval remains explicitly pending.

## 24. Governance Changes

This standard may not be changed implicitly as part of another sprint. Every future governance amendment requires explicit user approval and must be recorded in the Decision Log through an ADR or another explicitly approved governance decision record.

Governance changes must state the previous rule, the approved replacement, the reason, consequences, risks, effective date, and related sprint. Until approved and recorded, version 1.0 remains authoritative.
