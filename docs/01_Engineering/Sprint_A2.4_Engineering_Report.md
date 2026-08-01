# Sprint A2.4 Engineering Report

## 1. Report Identity

- Sprint ID: A2.4
- Title: Talentry UI Kit – Supporting Components
- Branch: `feature/auth-foundation`
- Mode: Implementation
- Status: Awaiting approval
- Report scope: Work performed only for Sprint A2.4

## 2. Sprint Objective and Boundaries

The objective was to add three reusable, presentational Talentry UI Kit components: `SectionHeader`, `TalentryBadge`, and `EmptyState`.

Permitted changes were limited to creating those components, updating the UI Kit barrel export and stylesheet, and creating the two mandatory sprint reports. Dashboard, Authentication, application layouts, global CSS, routes, business logic, data, hooks, state, and packages were explicitly out of scope.

## 3. Repository State Before Implementation

- Current branch: `feature/auth-foundation`
- Initial `git status --short --branch`: `## feature/auth-foundation`
- Working tree was clean.
- None of the three component targets or two report targets existed.
- Existing `TalentryCard`, `TalentryButton`, token stylesheet, UI stylesheet, and barrel exports were inspected before implementation.

## 4. Architecture and Implementation Decisions

- Components remain server-compatible and stateless; no `'use client'`, hook, or state was introduced.
- `SectionHeader` uses semantic `<header>` markup and allows an `h1`, `h2`, `h3`, or `h4` title without embedding application behavior.
- `TalentryBadge` uses a semantic `<span>` and exactly ten approved tones: neutral, primary, success, warning, danger, info, premium, ai, new, and beta.
- `EmptyState` composes the existing `TalentryCard`, supports standard and compact variants, and defaults to standard without duplicating card structure or styling.
- Actions are accepted as `ReactNode`, allowing consumers to compose the existing `TalentryButton` without adding click, navigation, or business behavior to these primitives.
- Native HTML attributes are preserved with precise types. Native `title` was intentionally omitted where it conflicts with the required `ReactNode` content title.
- Responsive behavior for `SectionHeader` uses wrapping rather than a new hard-coded breakpoint.

## 5. Created and Modified Files

Created:

- `components/ui/SectionHeader.tsx`
- `components/ui/TalentryBadge.tsx`
- `components/ui/EmptyState.tsx`
- `docs/01_Engineering/Sprint_A2.4_Summary.md`
- `docs/01_Engineering/Sprint_A2.4_Engineering_Report.md`

Modified:

- `components/ui/index.ts`
- `styles/talentry-ui.css`

## 6. Responsibility of Each File

- `SectionHeader.tsx`: Presents section hierarchy through eyebrow, title, description, and optional action slots.
- `TalentryBadge.tsx`: Presents compact textual labels with typed tone and size variants.
- `EmptyState.tsx`: Presents an empty-content message, optional decorative icon, and optional composed action inside `TalentryCard`.
- `components/ui/index.ts`: Exposes the three components and all new public types.
- `styles/talentry-ui.css`: Owns all visual rules for the three supporting components using Talentry tokens.
- `Sprint_A2.4_Summary.md`: Concise acceptance record.
- `Sprint_A2.4_Engineering_Report.md`: Detailed immutable technical record.

## 7. Public Interfaces, Props, or Types

`SectionHeader` exports:

- `SectionHeaderHeading = 'h1' | 'h2' | 'h3' | 'h4'`
- `SectionHeaderProps`
- Props: `title`, `description`, `eyebrow`, `action`, `headingAs`, `className`, and compatible native header attributes except native `title`.

`TalentryBadge` exports:

- `TalentryBadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'premium' | 'ai' | 'new' | 'beta'`
- `TalentryBadgeSize = 'small' | 'medium'`
- `TalentryBadgeProps`
- Compatible native span attributes.

`EmptyState` exports:

- `EmptyStateHeading = 'h2' | 'h3'`
- `EmptyStateVariant = 'standard' | 'compact'`
- `EmptyStateProps`
- Props: `title`, `description`, `icon`, `action`, `headingAs`, `variant`, and compatible `TalentryCard` props except the card content/header/footer/native-title fields it owns.

All public symbols are exported through `components/ui/index.ts`. No `any` is used.

## 8. Accessibility Decisions

- Section headings use actual heading elements with a controlled semantic level.
- `SectionHeader` uses a semantic `<header>` wrapper.
- Badges retain textual content; their meaning is not represented by color alone.
- Empty-state titles use semantic headings.
- Empty-state icons are treated as decorative with `aria-hidden="true"`; title and description carry the meaning.
- Actions are supplied by consumers as accessible React elements, allowing use of the existing accessible `TalentryButton`.
- No interaction requiring keyboard behavior was introduced.
- No new animation was added.

## 9. Styling and Token Usage

All new visual design values reference approved `--talentry-*` tokens from `styles/talentry-tokens.css`, including typography, colors, spacing, and radii. No inline styles, styled-jsx, Tailwind, alternate palette, or new hard-coded design value was introduced.

Structural CSS values such as flex/grid display, wrapping, alignment, `margin: 0`, and text transformation are layout mechanics rather than alternate design tokens.

## 10. Validation Commands and Exact Results

First run:

```text
npx tsc --noEmit --incremental false
```

Result: exit code 2. Errors:

```text
components/ui/EmptyState.tsx(8,18): error TS2430: Interface 'EmptyStateProps' incorrectly extends interface 'Omit<TalentryCardProps, "children" | "footer" | "header">'.
  Types of property 'title' are incompatible.
    Type 'ReactNode' is not assignable to type 'string'.

components/ui/SectionHeader.tsx(7,18): error TS2430: Interface 'SectionHeaderProps' incorrectly extends interface 'HTMLAttributes<HTMLElement>'.
  Types of property 'title' are incompatible.
    Type 'ReactNode' is not assignable to type 'string'.
```

First build:

```text
npm run build
```

Result: exit code 1 on the same `EmptyStateProps` type conflict.

Correction: native HTML `title` was omitted from `SectionHeaderProps` and `EmptyStateProps`, preserving the component content-title contract while retaining all other appropriate native attributes.

Final TypeScript run:

```text
npx tsc --noEmit --incremental false
```

Result: exit code 0; no TypeScript errors.

Final build:

```text
npm run build
```

Result: exit code 0. Next.js compiled successfully, validated types, generated 11 static pages, and retained the existing route set. Two non-fatal webpack cache warnings were emitted:

```text
[webpack.cache.PackFileCacheStrategy] Caching failed for pack: Error: Unable to snapshot resolve dependencies
```

### Acceptance-review correction pass

The pending A2.4 implementation received a scoped acceptance-review correction pass before approval:

1. `TalentryBadgeTone` retained all six original values and added `premium`, `ai`, `new`, and `beta`, producing exactly ten approved tones.
2. Premium uses primary-soft with primary-pressed text; AI uses purple-soft with indigo text; New uses success-soft with general text color for contrast; Beta uses lavender with secondary text. Labels remain required content, so color is not the only semantic signal.
3. `SectionHeaderHeading` added `h4` without changing the `h2` default or any other API behavior.
4. `EmptyStateVariant = 'standard' | 'compact'` was added and exported. The default is `standard`.
5. Both EmptyState classes are applied through the variant prop. Standard retains the original spacing; compact uses token-based smaller gaps, icon dimensions, description typography, and action spacing.
6. Correction-pass `npx tsc --noEmit --incremental false` completed with exit code 0.
7. Correction-pass `npm run build` completed with exit code 0 and the same non-fatal webpack cache warnings.

No new sprint report or ADR was created for this pass; these existing pending reports were updated as authorized.

## 11. Git Status

Status before report creation:

```text
 M components/ui/index.ts
 M styles/talentry-ui.css
?? components/ui/EmptyState.tsx
?? components/ui/SectionHeader.tsx
?? components/ui/TalentryBadge.tsx
```

The final status also includes the two new A2.4 report files under `docs/01_Engineering/`. No file was staged, committed, or pushed.

## 12. Complete Diffs for Sprint Files

The implementation diffs follow. The two report files are newly created records; their complete contents are the reports themselves and cannot recursively contain their own final diffs.

### `components/ui/SectionHeader.tsx`

```diff
--- /dev/null
+++ b/components/ui/SectionHeader.tsx
@@ -0,0 +1,40 @@
+import type { HTMLAttributes, ReactNode } from 'react'
+
+import '@/styles/talentry-ui.css'
+
+export type SectionHeaderHeading = 'h1' | 'h2' | 'h3' | 'h4'
+
+export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
+  title: ReactNode
+  description?: ReactNode
+  eyebrow?: ReactNode
+  action?: ReactNode
+  headingAs?: SectionHeaderHeading
+}
+
+export default function SectionHeader({
+  action,
+  className,
+  description,
+  eyebrow,
+  headingAs: Heading = 'h2',
+  title,
+  ...nativeProps
+}: SectionHeaderProps) {
+  const classes = ['talentry-section-header', className].filter(Boolean).join(' ')
+
+  return (
+    <header className={classes} {...nativeProps}>
+      <div className="talentry-section-header__content">
+        {eyebrow !== undefined && (
+          <div className="talentry-section-header__eyebrow">{eyebrow}</div>
+        )}
+        <Heading className="talentry-section-header__title">{title}</Heading>
+        {description !== undefined && (
+          <div className="talentry-section-header__description">{description}</div>
+        )}
+      </div>
+      {action !== undefined && <div className="talentry-section-header__action">{action}</div>}
+    </header>
+  )
+}
```

### `components/ui/TalentryBadge.tsx`

```diff
--- /dev/null
+++ b/components/ui/TalentryBadge.tsx
@@ -0,0 +1,44 @@
+import type { HTMLAttributes } from 'react'
+
+import '@/styles/talentry-ui.css'
+
+export type TalentryBadgeTone =
+  | 'neutral'
+  | 'primary'
+  | 'success'
+  | 'warning'
+  | 'danger'
+  | 'info'
+  | 'premium'
+  | 'ai'
+  | 'new'
+  | 'beta'
+export type TalentryBadgeSize = 'small' | 'medium'
+
+export interface TalentryBadgeProps extends HTMLAttributes<HTMLSpanElement> {
+  tone?: TalentryBadgeTone
+  size?: TalentryBadgeSize
+}
+
+export default function TalentryBadge({
+  children,
+  className,
+  size = 'medium',
+  tone = 'neutral',
+  ...nativeProps
+}: TalentryBadgeProps) {
+  const classes = [
+    'talentry-badge',
+    `talentry-badge--${tone}`,
+    `talentry-badge--${size}`,
+    className,
+  ]
+    .filter(Boolean)
+    .join(' ')
+
+  return (
+    <span className={classes} {...nativeProps}>
+      {children}
+    </span>
+  )
+}
```

### `components/ui/EmptyState.tsx`

```diff
--- /dev/null
+++ b/components/ui/EmptyState.tsx
@@ -0,0 +1,52 @@
+import type { ReactNode } from 'react'
+
+import TalentryCard from './TalentryCard'
+import type { TalentryCardProps } from './TalentryCard'
+
+export type EmptyStateHeading = 'h2' | 'h3'
+export type EmptyStateVariant = 'standard' | 'compact'
+
+export interface EmptyStateProps
+  extends Omit<TalentryCardProps, 'children' | 'footer' | 'header' | 'title'> {
+  title: ReactNode
+  description?: ReactNode
+  icon?: ReactNode
+  action?: ReactNode
+  headingAs?: EmptyStateHeading
+  variant?: EmptyStateVariant
+}
+
+export default function EmptyState({
+  action,
+  className,
+  description,
+  headingAs: Heading = 'h2',
+  icon,
+  surface = 'lavender',
+  title,
+  variant = 'standard',
+  ...cardProps
+}: EmptyStateProps) {
+  const classes = [
+    'talentry-empty-state',
+    `talentry-empty-state--${variant}`,
+    className,
+  ]
+    .filter(Boolean)
+    .join(' ')
+
+  return (
+    <TalentryCard className={classes} surface={surface} {...cardProps}>
+      {icon !== undefined && (
+        <div className="talentry-empty-state__icon" aria-hidden="true">
+          {icon}
+        </div>
+      )}
+      <Heading className="talentry-empty-state__title">{title}</Heading>
+      {description !== undefined && (
+        <div className="talentry-empty-state__description">{description}</div>
+      )}
+      {action !== undefined && <div className="talentry-empty-state__action">{action}</div>}
+    </TalentryCard>
+  )
+}
```

### `components/ui/index.ts`

```diff
@@ -12,3 +12,12 @@
   TalentryCardProps,
   TalentryCardSurface,
 } from './TalentryCard'
+
+export { default as SectionHeader } from './SectionHeader'
+export type { SectionHeaderHeading, SectionHeaderProps } from './SectionHeader'
+
+export { default as TalentryBadge } from './TalentryBadge'
+export type { TalentryBadgeProps, TalentryBadgeSize, TalentryBadgeTone } from './TalentryBadge'
+
+export { default as EmptyState } from './EmptyState'
+export type { EmptyStateHeading, EmptyStateProps, EmptyStateVariant } from './EmptyState'
```

### `styles/talentry-ui.css`

```diff
@@ -237,3 +237,176 @@
     padding: var(--talentry-space-10);
   }
 }
+
+.talentry-section-header {
+  display: flex;
+  align-items: flex-start;
+  justify-content: space-between;
+  flex-wrap: wrap;
+  gap: var(--talentry-space-5);
+  color: var(--talentry-color-text);
+  font-family: var(--talentry-font-family);
+}
+
+.talentry-section-header__content {
+  display: grid;
+  gap: var(--talentry-space-2);
+}
+
+.talentry-section-header__eyebrow {
+  color: var(--talentry-color-primary);
+  font-size: var(--talentry-font-helper-size);
+  font-weight: var(--talentry-font-weight-bold);
+  letter-spacing: var(--talentry-letter-spacing-wide);
+  line-height: var(--talentry-line-height-normal);
+  text-transform: uppercase;
+}
+
+.talentry-section-header__title {
+  margin: 0;
+  color: var(--talentry-color-text);
+  font-size: var(--talentry-font-section-title-size);
+  font-weight: var(--talentry-font-weight-bold);
+  letter-spacing: var(--talentry-letter-spacing-tight);
+  line-height: var(--talentry-line-height-tight);
+}
+
+.talentry-section-header__description {
+  color: var(--talentry-color-text-secondary);
+  font-size: var(--talentry-font-body-size);
+  line-height: var(--talentry-line-height-normal);
+}
+
+.talentry-section-header__action {
+  display: flex;
+  flex: none;
+  align-items: center;
+}
+
+.talentry-badge {
+  display: inline-flex;
+  align-items: center;
+  justify-content: center;
+  border-radius: var(--talentry-radius-pill);
+  font-family: var(--talentry-font-family);
+  font-weight: var(--talentry-font-weight-semibold);
+  line-height: var(--talentry-line-height-tight);
+  white-space: nowrap;
+}
+
+.talentry-badge--small {
+  padding: var(--talentry-space-1) var(--talentry-space-2);
+  font-size: var(--talentry-font-size-xs);
+}
+
+.talentry-badge--medium {
+  padding: var(--talentry-space-2) var(--talentry-space-3);
+  font-size: var(--talentry-font-size-sm);
+}
+
+.talentry-badge--neutral {
+  background: var(--talentry-color-surface-lavender);
+  color: var(--talentry-color-text-secondary);
+}
+
+.talentry-badge--primary {
+  background: var(--talentry-color-primary-soft);
+  color: var(--talentry-color-primary-pressed);
+}
+
+.talentry-badge--success {
+  background: var(--talentry-color-success-soft);
+  color: var(--talentry-color-success);
+}
+
+.talentry-badge--warning {
+  background: var(--talentry-color-warning-soft);
+  color: var(--talentry-color-warning);
+}
+
+.talentry-badge--danger {
+  background: var(--talentry-color-danger-soft);
+  color: var(--talentry-color-danger);
+}
+
+.talentry-badge--info {
+  background: var(--talentry-color-info-soft);
+  color: var(--talentry-color-info);
+}
+
+.talentry-badge--premium {
+  background: var(--talentry-color-primary-soft);
+  color: var(--talentry-color-primary-pressed);
+}
+
+.talentry-badge--ai {
+  background: var(--talentry-color-surface-purple-soft);
+  color: var(--talentry-color-indigo);
+}
+
+.talentry-badge--new {
+  background: var(--talentry-color-success-soft);
+  color: var(--talentry-color-text);
+}
+
+.talentry-badge--beta {
+  background: var(--talentry-color-surface-lavender);
+  color: var(--talentry-color-text-secondary);
+}
+
+.talentry-empty-state {
+  display: grid;
+  justify-items: center;
+  text-align: center;
+}
+
+.talentry-empty-state--standard {
+  gap: var(--talentry-space-3);
+}
+
+.talentry-empty-state--compact {
+  gap: var(--talentry-space-2);
+}
+
+.talentry-empty-state__icon {
+  display: grid;
+  width: var(--talentry-space-12);
+  height: var(--talentry-space-12);
+  place-items: center;
+  border-radius: var(--talentry-radius-pill);
+  background: var(--talentry-color-primary-soft);
+  color: var(--talentry-color-primary);
+  font-size: var(--talentry-font-size-2xl);
+}
+
+.talentry-empty-state__title {
+  margin: 0;
+  color: var(--talentry-color-text);
+  font-size: var(--talentry-font-card-title-size);
+  font-weight: var(--talentry-font-weight-bold);
+  letter-spacing: var(--talentry-letter-spacing-tight);
+  line-height: var(--talentry-line-height-snug);
+}
+
+.talentry-empty-state__description {
+  color: var(--talentry-color-text-secondary);
+  font-size: var(--talentry-font-body-size);
+  line-height: var(--talentry-line-height-relaxed);
+}
+
+.talentry-empty-state__action {
+  display: flex;
+  justify-content: center;
+  margin-block-start: var(--talentry-space-2);
+}
+
+.talentry-empty-state--compact .talentry-empty-state__icon {
+  width: var(--talentry-space-10);
+  height: var(--talentry-space-10);
+  font-size: var(--talentry-font-size-xl);
+}
+
+.talentry-empty-state--compact .talentry-empty-state__description {
+  font-size: var(--talentry-font-size-sm);
+}
+
+.talentry-empty-state--compact .talentry-empty-state__action {
+  margin-block-start: var(--talentry-space-1);
+}
```

## 13. Risks, Limitations, and Technical Debt

- These components are not yet rendered by an application route, so no browser visual regression or assistive-technology integration test was performed.
- `action` accepts arbitrary `ReactNode`; accessibility remains the responsibility of the composed control. The existing `TalentryButton` is the intended control where appropriate.
- Badge tone names do not independently provide semantics. Consumer-provided text must communicate the meaning.
- The shared UI stylesheet continues to grow and may later warrant explicitly approved modularization; no unrelated refactor was performed here.

## 14. Untouched-Module Confirmation

No Dashboard, Authentication, `app/layout.tsx`, global CSS, route, Interview, Result, API, Supabase, package, legacy, or token file was modified. No package was installed. No hook, state, business logic, fake data, routing, stage, commit, or push was added or performed.

## 15. Approval Required

Sprint A2.4 implementation and reports are complete and awaiting acceptance review. No commit is authorized until explicit user approval is received.

## Final Sprint Metrics

- Files created: 5
- Files modified: 2
- Lines added: 956
- Lines removed: 0
- Initial TypeScript errors: 2
- Final TypeScript status: Passed, exit code 0
- Initial build status: Failed on the native `title` type conflict
- Final build status: Passed, exit code 0
- Acceptance correction status: Implemented and validated
- Review status: Awaiting acceptance review
- Approval status: Awaiting approval
