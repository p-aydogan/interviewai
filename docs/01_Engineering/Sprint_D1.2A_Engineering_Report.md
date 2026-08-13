# Sprint D1.2A Engineering Report

## 1. Report Identity

- **Project:** InterviewAI / Talentry
- **Sprint:** D1.2A — Server Auth Ownership Primitive
- **Branch:** `feature/auth-foundation`
- **Starting HEAD:** `0f6ebce feat(dashboard): add navigation shell foundation`
- **Status:** IMPLEMENTATION COMPLETE — SOURCE SECURITY REVIEW PASSED — STATIC VALIDATION PASSED — RUNTIME CONSUMER ACCEPTANCE DEFERRED TO FIRST AUTHENTICATED ROUTE HANDLER — AWAITING USER APPROVAL AND LOCAL COMMIT

## 2. Repository Baseline

Implementation began with a clean working tree and empty staged area on the expected branch and HEAD. Existing architecture provided only a browser Supabase factory in `lib/supabase.ts`; no request-scoped server client or reusable server `getUser()` ownership helper existed.

Before documentation, the production scope was exactly:

```text
?? lib/auth/get-authenticated-user.ts
?? lib/supabase/server.ts
```

## 3. Auth Ownership Problem

Future interview persistence requires a canonical owner that cannot be spoofed through request JSON, URL parameters, React state, localStorage, or browser-readable session metadata. The repository lacked a server-side primitive that could derive a verified Supabase Auth user from request cookies.

D1.2A addresses only that prerequisite. It does not create persistence or a persistence consumer.

## 4. Architecture Decision

```text
Canonical owner:
Supabase auth.users.id

Verification boundary:
Request-scoped server Supabase client calling getUser()

Future persistence mutation boundary:
Authenticated Next.js Route Handler

Client-authoritative user_id:
FORBIDDEN
```

The selected design is additive. The existing browser factory remains in place, while a separate server-only factory and helper provide the future ownership boundary.

## 5. Created and Modified Files

### Production files created

- `lib/supabase/server.ts`
- `lib/auth/get-authenticated-user.ts`

### Documentation files created

- `docs/01_Engineering/Sprint_D1.2A_Summary.md`
- `docs/01_Engineering/Sprint_D1.2A_Engineering_Report.md`

No existing production file was modified.

## 6. Server Supabase Client Implementation

`lib/supabase/server.ts`:

- imports `server-only`;
- imports `createServerClient` from installed `@supabase/ssr`;
- imports `cookies()` from `next/headers`;
- obtains the current request cookie store inside the factory;
- creates a new Supabase client on every call;
- has no module-level singleton;
- uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`;
- contains no service-role key, secret key, hard-coded credential, browser API, or localStorage access.

The factory is intentionally suitable for future Server Components and Route Handlers without changing existing browser auth behavior.

## 7. Cookie Adapter

The installed `@supabase/ssr@0.12.3` supports the `getAll`/`setAll` server cookie contract used here.

### Read behavior

`getAll()` returns `cookieStore.getAll()`, making request cookies available to Supabase Auth.

### Write behavior

`setAll()` attempts every Supabase cookie update using:

```ts
cookieStore.set(name, value, options)
```

Next.js Server Components cannot mutate cookies. The adapter therefore suppresses only an `Error` whose message begins:

```text
Cookies can only be modified in a Server Action or Route Handler.
```

Every unrelated thrown value or error is rethrown.

## 8. Broad-Catch Finding and Bounded Micro-Fix

The initial implementation wrapped `setAll()` in a broad catch. Source review correctly identified that this could also suppress genuine Route Handler cookie-write failures.

The bounded micro-fix:

- changed the caught value to `unknown`;
- checks `error instanceof Error`;
- checks the exact known Next.js immutable-cookie error prefix;
- returns only for that restriction;
- rethrows every other thrown value or error.

No logging, cookie-value exposure, helper abstraction, middleware, endpoint, or unrelated behavior was added. `getAll()`, environment access, `createServerClient`, and the authenticated-user helper remained otherwise unchanged.

## 9. Authenticated-User Helper

`lib/auth/get-authenticated-user.ts` imports `server-only`, creates the request-scoped server client, and calls:

```ts
supabase.auth.getUser()
```

It accepts no parameters. It does not accept a user ID, session object, access token, request body, or URL value.

`getSession()` is not used as authorization authority.

## 10. Return Contract

The helper exports this discriminated union:

```ts
export type AuthenticatedUserResult =
  | { error: null; status: 'authenticated'; user: User }
  | { error: AuthError | null; status: 'unauthorized'; user: null }
```

Behavior:

- Verified user and no error → `authenticated` result.
- Missing user or Supabase `AuthError` → explicit `unauthorized` result.
- Unexpected thrown error → exception propagates to the future consumer.

The helper does not redirect, log identity data, create database records, or swallow unexpected provider failures.

## 11. Ownership Security Invariant

```text
request cookies
→ request-scoped server Supabase client
→ supabase.auth.getUser()
→ verified Supabase User
→ verifiedUser.id
```

Future persistence ownership must be derived from `verifiedUser.id`. Authoritative ownership must never come from:

- URL values;
- query parameters;
- request bodies;
- React state;
- localStorage;
- browser-readable session metadata.

## 12. Existing Browser Auth Preservation

Source hash checks confirmed that existing `lib/supabase.ts` and A3.6 `PasswordRecoveryFlow` remained unchanged during implementation. Existing login behavior and provider configuration also remained unchanged.

No package or environment file was modified. No remote Supabase or authentication request was executed.

## 13. Static and Build Validation

### TypeScript

```text
npx.cmd tsc --noEmit --incremental false
```

Result: **PASS** — exit code 0, no output or TypeScript errors.

### Production build

Before build, no Node process and no common Next development-port listener were present. This preserved the project rule that dev and build must not run concurrently.

```text
npm.cmd run build
```

Result: **PASS** — exit code 0.

- Compilation successful.
- Linting and type checking passed.
- Static pages generated: `16/16`.
- Existing application routes remained present.

### Diff validation

```text
git diff --check
```

Result: **PASS** — exit code 0. A separate untracked-file scan found no trailing whitespace.

## 14. Webpack Warning Classification

The successful production build emitted:

```text
Caching failed for pack: Error: Unable to snapshot resolve dependencies
```

Classification: **NON-BLOCKING LOCAL WEBPACK BUILD-CACHE WARNING**.

It did not prevent compilation, type checking, or static-page generation and is not classified as a source/build failure.

Process rule:

> `npm run dev` and `npm run build` must not run concurrently.

## 15. Runtime-Acceptance Rationale

No dedicated browser/runtime acceptance was added in D1.2A because the primitive has no runtime consumer. Creating a temporary Route Handler solely for testing would unnecessarily expand the sprint.

TypeScript validation, production build, complete source review, package API compatibility review, and security review passed.

The first real acceptance of:

```text
request cookie
→ server client
→ getUser()
→ verified auth.users.id
```

is intentionally deferred to the first authenticated persistence Route Handler consumer sprint. This is an explicit consumer-boundary decision, not a concealed omission.

## 16. Deferred Route Handler Cache/Response Consideration

Installed `@supabase/ssr` may supply response/cache metadata while applying cookie updates. D1.2A did not expand the callback or response behavior because no Route Handler consumer exists.

The first authenticated Route Handler must review:

- request-scoped cookie propagation;
- cookie refresh writes;
- Supabase-provided private/no-store response metadata;
- unauthorized responses;
- caching behavior for authenticated content.

No response-header implementation is authorized in D1.2A.

## 17. Risk Register

| Risk or limitation | Status | Boundary |
|---|---|---|
| No runtime consumer acceptance yet | Deferred | First authenticated Route Handler |
| Response/cache metadata is not consumed yet | Deferred | First authenticated Route Handler |
| Server Component cookie writes are unavailable | Handled narrowly | Known immutable-cookie error only |
| Unexpected cookie write errors | Preserved | Rethrown to consumer |
| No route protection | Out of scope | Separate controlled sprint |
| No persistence/RLS implementation | Out of scope | Later persistence architecture |
| Public env values are assumed present with non-null assertions | Existing convention | Runtime configuration responsibility |
| No generated Supabase database types | Existing limitation | Future schema/type work |

## 18. Out-of-Scope Boundaries

D1.2A did not implement or modify:

- interview tables;
- SQL, migrations, or RLS;
- database reads or writes;
- persistence Route Handlers;
- interview or result persistence;
- dashboard history, My Interviews, or Recent Interviews data;
- middleware or route protection;
- sign-out;
- profile tables;
- register/OTP provider integration;
- AI API hardening or rate limiting;
- CV handling;
- Interview, Result, or Dashboard source;
- packages or environment configuration;
- mobile APIs.

Sprint A3.7 was not started.

## 19. Next Consumer Gate

The next planned boundary is the first authenticated persistence Route Handler consumer. It must validate:

- request cookie propagation into the request-scoped server client;
- `supabase.auth.getUser()` verification;
- canonical ownership through verified `auth.users.id`;
- rejection of unauthenticated requests;
- prohibition of client-authoritative `user_id`;
- response/cache behavior;
- alignment with future RLS.

This report does not design a database schema, table, policy, or SQL migration.

## 20. Complete Production-File Diffs

```diff
diff --git a/lib/supabase/server.ts b/lib/supabase/server.ts
new file mode 100644
--- /dev/null
+++ b/lib/supabase/server.ts
@@ -0,0 +1,38 @@
+import 'server-only'
+
+import { createServerClient } from '@supabase/ssr'
+import { cookies } from 'next/headers'
+
+export function createClient() {
+  const cookieStore = cookies()
+
+  return createServerClient(
+    process.env.NEXT_PUBLIC_SUPABASE_URL!,
+    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
+    {
+      cookies: {
+        getAll() {
+          return cookieStore.getAll()
+        },
+        setAll(cookiesToSet) {
+          try {
+            cookiesToSet.forEach(({ name, options, value }) => {
+              cookieStore.set(name, value, options)
+            })
+          } catch (error: unknown) {
+            if (
+              error instanceof Error &&
+              error.message.startsWith(
+                'Cookies can only be modified in a Server Action or Route Handler.',
+              )
+            ) {
+              return
+            }
+
+            throw error
+          }
+        },
+      },
+    },
+  )
+}
diff --git a/lib/auth/get-authenticated-user.ts b/lib/auth/get-authenticated-user.ts
new file mode 100644
--- /dev/null
+++ b/lib/auth/get-authenticated-user.ts
@@ -0,0 +1,23 @@
+import 'server-only'
+
+import type { AuthError, User } from '@supabase/supabase-js'
+
+import { createClient } from '@/lib/supabase/server'
+
+export type AuthenticatedUserResult =
+  | { error: null; status: 'authenticated'; user: User }
+  | { error: AuthError | null; status: 'unauthorized'; user: null }
+
+export async function getAuthenticatedUser(): Promise<AuthenticatedUserResult> {
+  const supabase = createClient()
+  const {
+    data: { user },
+    error,
+  } = await supabase.auth.getUser()
+
+  if (error || !user) {
+    return { error, status: 'unauthorized', user: null }
+  }
+
+  return { error: null, status: 'authenticated', user }
+}
```

## 21. Final Git Scope

Expected working tree after documentation:

```text
?? docs/01_Engineering/Sprint_D1.2A_Engineering_Report.md
?? docs/01_Engineering/Sprint_D1.2A_Summary.md
?? lib/auth/get-authenticated-user.ts
?? lib/supabase/server.ts
```

Nothing is staged. No commit or push is authorized by this report.

## 22. Approval Status

**IMPLEMENTATION COMPLETE**

**SOURCE SECURITY REVIEW PASSED**

**STATIC VALIDATION PASSED**

**RUNTIME CONSUMER ACCEPTANCE DEFERRED TO FIRST AUTHENTICATED ROUTE HANDLER**

**AWAITING USER APPROVAL AND LOCAL COMMIT**

D1.2A is not committed, pushed, or deployed. Explicit user approval is required before a local commit.
