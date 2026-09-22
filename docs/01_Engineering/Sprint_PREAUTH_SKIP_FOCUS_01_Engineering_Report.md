# PREAUTH_SKIP_FOCUS_01 — Engineering report

Date: 2026-09-22. Stage: PREAUTH_ONBOARDING_01.
Branch: feature/auth-foundation. Status: ready for runtime review, not approved.

## Objective and diagnosis

Restore forward Tab access to Skip after onboarding entry and keyboard panel changes.
Skip is an enabled native button, without negative tabindex, aria-hidden or inert.
Its visible parents do not suppress focus. The existing shared focus-visible rule
provides a 2px text-color outline with token-based offset; the target remains 44px.
Both PreAuthFlow entry and OnboardingPager navigation focused the h1 after Skip.
Forward Tab therefore proceeded to the first dot. Skip was never absent from the
document Tab order; the programmatic starting point bypassed it.

## Implementation and interfaces

OnboardingPager now holds a ref to the existing Skip row. On Panels 1–2 this row
is a programmatic-only focus target (tabIndex -1), with role group and its name
provided by the existing localized heading. The button retains its own localized
text, native keyboard activation and unchanged onSkip callback. Panel 3 falls back
to heading focus. Swipe still requests no focus move.

PreAuthFlow selects the marked row before h1 in document order when entering
onboarding. Returning to Splash still focuses its heading. Public props/types are
unchanged. No CSS, token, layout, copy, routing, auth, storage or language changes.
No global listeners, positive tab indices, dependencies or new controls.

## Repository state and files

Before and after implementation, tracked modifications existed in app/page.tsx,
app/result/page.tsx, components/result/ResultContent.tsx and ResultShell.tsx.
components/pre-auth/, styles/talentry-pre-auth.css, the existing 24 sprint reports
and docs/02_Decisions/ADR-001-pre-auth-entry-flow.md were untracked. All preserved.
This sprint modifies only the two component files below and adds this report and
Sprint_PREAUTH_SKIP_FOCUS_01_Summary.md. Earlier reports were not rewritten.

## Complete incremental source diffs

```diff
--- components/pre-auth/OnboardingPager.tsx (before this task)
+++ components/pre-auth/OnboardingPager.tsx
@@
   const heading = useRef<HTMLHeadingElement>(null)
+  const skipRow = useRef<HTMLDivElement>(null)
@@
-    if (moveFocus.current) heading.current?.focus({ preventScroll: true })
+    if (moveFocus.current) (skipRow.current ?? heading.current)?.focus({ preventScroll: true })
@@
-    {page < 2 && <div className="talentry-pre-auth__skip-row">
+    {page < 2 && <div className="talentry-pre-auth__skip-row" ref={skipRow}
+      data-pre-auth-focus tabIndex={-1} role="group" aria-labelledby="pre-auth-title">
--- components/pre-auth/PreAuthFlow.tsx (before this task)
+++ components/pre-auth/PreAuthFlow.tsx
@@
-    if (focusHeading.current) content.current?.querySelector('h1')?.focus()
+    if (focusHeading.current) content.current?.querySelector<HTMLElement>('[data-pre-auth-focus], h1')?.focus()
```

The two newly added documentation files contain this task's record only.

## Validation and limitations

- npx.cmd tsc --noEmit --incremental false: PASS, exit 0; npm update notice only.
- git diff --check: PASS, exit 0; existing LF-to-CRLF warnings on four tracked files.
- git status --short: inspected; existing changes preserved, two reports added.
- Production build deliberately not run as instructed.

Untracked source files are not covered by ordinary git diff --check; source edits
were inspected directly. Keyboard/screen-reader runtime confirmation remains pending.
Screen-reader progress and all dot/button callbacks remain unchanged; the focused
element on Panels 1–2 is now a heading-labelled group rather than the heading itself.
No further implementation or Git mutation is authorized. Review approval pending.
