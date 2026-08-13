# Sprint D1.2A Summary

- **Title:** Server Auth Ownership Primitive
- **Branch:** `feature/auth-foundation`
- **Starting HEAD:** `0f6ebce feat(dashboard): add navigation shell foundation`
- **Status:** IMPLEMENTATION COMPLETE — SOURCE SECURITY REVIEW PASSED — STATIC VALIDATION PASSED — RUNTIME CONSUMER ACCEPTANCE DEFERRED TO FIRST AUTHENTICATED ROUTE HANDLER — AWAITING USER APPROVAL AND LOCAL COMMIT

## Objective

D1.2A introduced the minimum reusable server-side authenticated ownership primitive required before interview persistence. It did not implement persistence, a database schema, or an endpoint.

## Canonical Ownership Decision

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

## Files Created

### Production

- `lib/supabase/server.ts`
- `lib/auth/get-authenticated-user.ts`

### Documentation

- `docs/01_Engineering/Sprint_D1.2A_Summary.md`
- `docs/01_Engineering/Sprint_D1.2A_Engineering_Report.md`

No existing production file was modified.

## Server Client

`lib/supabase/server.ts` is marked `server-only`, uses `createServerClient` from `@supabase/ssr`, and reads Next.js request cookies through `cookies()` from `next/headers`. Every invocation creates a new request-scoped client; no singleton exists.

The factory uses only the existing public environment-variable names `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. It contains no service-role key, hard-coded credential, browser API, or localStorage access.

The cookie adapter reads with `getAll()` and attempts Supabase cookie updates with `setAll()`. It suppresses only errors whose message begins:

```text
Cookies can only be modified in a Server Action or Route Handler.
```

Every unrelated thrown value or error is rethrown.

## Auth Helper

`getAuthenticatedUser()` is server-only, accepts no parameters, creates the request-scoped client, and calls `supabase.auth.getUser()`.

It returns:

```ts
{ error: null; status: 'authenticated'; user: User }
```

or:

```ts
{ error: AuthError | null; status: 'unauthorized'; user: null }
```

Unexpected thrown errors propagate. The helper performs no redirect, logging, or database operation. `getSession()` is not used as authorization authority.

## Cookie Micro-Fix

The initial `setAll()` implementation used a broad catch. Source review found that it could conceal genuine Route Handler cookie-write failures. The bounded correction:

- types the caught value as `unknown`;
- requires `error instanceof Error`;
- suppresses only the known immutable Server Component cookie error;
- rethrows all other thrown values and errors.

No other production behavior changed.

## Ownership Security Invariant

```text
request cookies
→ request-scoped server Supabase client
→ supabase.auth.getUser()
→ verified Supabase User
→ verifiedUser.id
```

Future persistence ownership must come from `verifiedUser.id`, never from a URL, query parameter, request body, React state, localStorage, or browser-readable session metadata.

## Browser Auth Preservation

- Existing `lib/supabase.ts` browser client remained unchanged.
- Existing login behavior remained unchanged.
- A3.6 `PasswordRecoveryFlow` remained unchanged.
- No auth-provider configuration, package, or environment change occurred.

## Validation

- `npx.cmd tsc --noEmit --incremental false`: **PASS**, exit code 0, no errors.
- `npm.cmd run build`: **PASS**, exit code 0; compilation and lint/type checking succeeded; static pages generated `16/16`.
- `git diff --check`: **PASS**, exit code 0.

Webpack emitted `Caching failed for pack: Error: Unable to snapshot resolve dependencies`. This is classified as a **NON-BLOCKING LOCAL WEBPACK BUILD-CACHE WARNING**, not a source or build failure.

Process rule: `npm run dev` and `npm run build` must not run concurrently.

## Runtime-Acceptance Decision

No dedicated browser/runtime acceptance was added. The primitive has no runtime consumer, and creating a temporary Route Handler would expand scope unnecessarily. TypeScript, production build, source review, and security review passed.

The first real acceptance of request cookie → server client → `getUser()` → verified `auth.users.id` is intentionally deferred to the first authenticated persistence Route Handler consumer sprint.

## Deferred Cache/Response Consideration

Installed `@supabase/ssr` may provide response/cache metadata during cookie updates. D1.2A intentionally did not expand callback or response handling without a Route Handler consumer. The first authenticated Route Handler must review and preserve that metadata appropriately.

## Out of Scope

D1.2A did not implement interview tables, SQL, migrations, RLS, database writes, persistence Route Handlers, interview/result persistence, dashboard history, My Interviews, Recent Interviews data, middleware, route protection, sign-out, profiles, register/OTP provider integration, AI API hardening, rate limiting, CV changes, Interview/Result/Dashboard changes, packages, environment configuration, or mobile APIs.

Sprint A3.7 was not started.

## Next Gate

The next conceptual gate is the first authenticated persistence Route Handler consumer. It must validate request-scoped cookie propagation, server `getUser()`, verified ownership, unauthorized rejection, prohibition of client-authoritative `user_id`, response/cache behavior, and future RLS alignment. No database schema or SQL is authorized by this document.

## Approval Status

**IMPLEMENTATION COMPLETE**

**SOURCE SECURITY REVIEW PASSED**

**STATIC VALIDATION PASSED**

**RUNTIME CONSUMER ACCEPTANCE DEFERRED TO FIRST AUTHENTICATED ROUTE HANDLER**

**AWAITING USER APPROVAL AND LOCAL COMMIT**

D1.2A is not committed, pushed, or deployed.
