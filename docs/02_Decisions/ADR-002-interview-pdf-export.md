# ADR-002: Interview PDF export

- Date: 2026-10-01
- Status: Architecture approved by the REPORT_EXPORT_01 bounded implementation request. Implementation is partial and STOPPED after failed PDF validation; acceptance pending.
- Related sprint: REPORT_EXPORT_01

## Context

Completed interview data is persisted and read through an authenticated owner-filtered detail API. Result and historical History entries share the same Result page. Export must use those saved fields without new evaluation or weakened ownership.

## Decision

Use server-side Buffer generation with exactly @react-pdf/renderer@4.4.1 in an explicit Node.js, force-dynamic route at GET /api/interviews/[id]/pdf. Reuse an extracted server-only owner reader, preserving the existing JSON detail API's statuses, shape, answer validation and cache/header behavior. Derive owner identity only through getAuthenticatedUser().

Use a dedicated document template containing persisted score, summary, metadata and complete ordered Q&A. Only labels follow validated tr/en/de application language; saved content and metadata are not translated. No candidate-name enrichment, owner UUID or internal interviewer key appears in the document.

Register unmodified static Inter 4.1 Regular (400) and SemiBold (600) from the official rsms/inter release, with its LICENSE.txt. Read approved values from styles/talentry-tokens.css through a small adapter. Include fonts/token CSS through PDF-route-scoped output tracing.

Generate no stored PDF, public sharing URL or database mutation. Do not capture DOM, call AI, or change schema/auth/recovery. Provide one Result Evaluation-panel action; historical access remains History -> Result.

## Alternatives considered

Client-side generation would add a renderer to browser workloads; print dialogs do not provide the approved direct-download contract. Headless HTML rendering introduces a browser runtime and unnecessary packaging. Streaming complicates error delivery after headers. The approved path uses a complete Buffer response.

## Consequences

The server bears rendering/memory cost. Local fonts and token CSS must be available in deployed output. Document layout is independent of mobile Result panels. npm added 63 new lockfile package entries and changed no pre-existing package entries; direct framework/React versions remain unchanged.

## Risks and current validation

Owner-reader suite: 8/8 PASS. Real-renderer PDF suite: 9/11 PASS, 2 FAIL. Failures: expected Turkish/German text was not found in extracted output; long-report content/order assertion failed at LONG_QUESTION. Font glyph-presence checks passed, but do not establish correct PDF text/rendering. Root cause is unconfirmed; extraction, subsetting and layout require authorized diagnosis. No workaround or dependency change was attempted.

Recovery regression, TypeScript, git diff --check and production build were NOT RUN after the required stop. Browser, visual PDF and deployed packaging/resource acceptance remain pending. Node 24 rendering produced PDFs but full compatibility/acceptance is not established by partial passes.

## Rollback approach

Only under separate authorization, reverse this sprint's scoped edits and remove its added assets/dependency. Preserve auth/recovery, database and historical reports. No migration or stored-PDF cleanup is required. No rollback was executed.
