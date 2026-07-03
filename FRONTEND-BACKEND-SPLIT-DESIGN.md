# Linking Overseas — Frontend/Backend Split: Design

## Context

The Linking Overseas app was originally built (and is currently fully working) as a single Next.js application at `c:\projects\linking-overseas`, using Server Actions for all data mutations and reads — this was the explicit, "strict, no deviations" architecture in the project's own founding docs.

This design replaces that with two independent projects, per explicit request: a separate Express/TypeScript backend API and a separate Next.js frontend that calls it over HTTP. This is a full rebuild of the data-access layer, not an incremental change — the underlying business logic (Prisma models, the deployment milestone validation rules, form structures, page layouts) is preserved and ported, not redesigned.

**Why:** the user wants the two halves of the app organized as genuinely separate projects/connections under `c:\projects\linking_overseasV1`, rather than one unified Next.js app.

## Architecture

```
linking_overseasV1/
├── Backend/          # Express + TypeScript API, owns the database
└── Frontend/         # Next.js app, no direct DB access — calls Backend over HTTP
```

- **Backend** owns `prisma/schema.prisma` (same models already in production use: `Candidate`, `Job`, `Employer`, `Application`, `Deployment`, `DeploymentMilestone`, `EmployerRequirement`, `ContactMessage`, plus Better Auth's `User`/`Session`/`Account`/`Verification` tables). It is the only project with a database connection.
- **Backend** mounts Better Auth's handler as Express middleware, sharing the same Prisma client as the rest of the API. This preserves the existing login flow, Google OAuth wiring, and session/account schema exactly as they work today — no auth rework.
- **Frontend** keeps its existing pages, components, and forms. Every current `import { getX } from '@/server/actions/...'` is replaced with a call into a `services/` layer that does a `fetch()` to the Backend instead. No Server Actions, no direct Prisma import, no direct DB access anywhere in this project.
- The two run as independent local dev servers (Backend on `:5000`, Frontend on `:3000`).

## Backend Module Structure

One folder per domain under `src/app/modules/`, following the same conventions as the PH Healthcare reference project (catchAsync / AppError / sendResponse / checkAuth):

```
Backend/
└── src/
    ├── app/
    │   ├── modules/
    │   │   ├── candidate/
    │   │   │   ├── candidate.interface.ts
    │   │   │   ├── candidate.validation.ts   # Zod schemas
    │   │   │   ├── candidate.service.ts      # Prisma queries, ported from candidates.actions.ts
    │   │   │   ├── candidate.controller.ts   # catchAsync + sendResponse
    │   │   │   └── candidate.route.ts
    │   │   ├── job/
    │   │   ├── employer/
    │   │   ├── application/
    │   │   ├── deployment/                   # ports deployments.actions.ts — the milestone
    │   │   │                                 # ordering/validation logic is the most
    │   │   │                                 # important thing to get right in this port
    │   │   ├── employerRequirement/
    │   │   ├── contactMessage/
    │   │   ├── dashboard/
    │   │   └── auth/                         # mounts Better Auth's handler
    │   ├── middlewares/                      # checkAuth, globalErrorHandler
    │   ├── errorHelpers/                     # AppError
    │   └── shared/                           # catchAsync, sendResponse
    ├── routes/index.ts                       # router.use('/candidates', CandidateRoutes), etc.
    ├── server.ts
    └── prisma/schema.prisma                  # moved here from the old single-app repo
```

Business logic is **ported, not redesigned**: the Prisma queries, the `MILESTONE_PREREQUISITES` map, the ordered/insert-only validation in `logMilestone` — all of it moves into `*.service.ts` files essentially as-is, called from Express controllers instead of directly from React Server Components.

## Frontend Structure

```
Frontend/
├── services/
    │   ├── api-client.ts          # shared fetch wrapper: base URL, credentials, error handling
│   ├── candidate.services.ts  # getCandidates(), getCandidateById(id), updateCandidateStatus(...), ...
│   ├── job.services.ts
│   ├── employer.services.ts
│   ├── application.services.ts
│   ├── deployment.services.ts
│   ├── employerRequirement.services.ts
│   ├── contactMessage.services.ts
│   └── dashboard.services.ts
└── app/  (unchanged page/component shapes: admin/, (public)/, login/)
```

Pages and forms keep their current shape. Only the data-fetching call changes — e.g. `await getCandidates()` (direct import) becomes `await candidateServices.getCandidates()` (fetch under the hood).

## Data Flow & Connection Method

**Server Component reads** (e.g. the admin candidates list page) run on the Frontend's own Next.js server and call the Backend directly, server-to-server — no browser involved. The incoming request's session cookie is forwarded manually (via `headers()` from `next/headers`) so Better Auth on the Backend can validate it.

**Client-side mutations** (all forms — CV submission, status updates, milestone logging, login, etc.) are real browser-to-Backend calls. Cross-origin cookies between two different ports (`:3000` and `:5000`) are the classic failure point for this kind of split.

**Chosen approach: Next.js rewrite proxy.** `next.config.ts` defines a `rewrites()` rule so the browser always calls the Frontend's own origin (e.g. `/api/backend/candidates`), and Next.js transparently proxies that server-side to the real Backend (`http://localhost:5000/candidates`, or the production Backend URL). From the browser's perspective, every call is same-origin — cookies flow automatically, no CORS headers, no `SameSite=None`/`Secure` cross-site cookie configuration to fight with across environments.

## Error Handling

- **Backend:** `AppError` (custom error class carrying a status code + message) thrown from services, caught by a global Express error-handling middleware, every route handler wrapped in `catchAsync` so thrown errors reach that middleware instead of crashing the process.
- **Frontend:** `services/*.services.ts` functions throw a plain `Error` with a user-facing message when the Backend responds with a non-2xx status or an error payload. UI components keep the exact same local `error` state + inline message pattern they use today (`{error && <p className="text-sm text-destructive">{error}</p>}`) — only the thing being awaited/caught changes, not the UI pattern.

## Migration Phasing

Ported in the same phased style as the original build — one full vertical slice first to prove the pattern works end-to-end, then the rest:

1. **Scaffold both projects** — Backend skeleton (`shared/catchAsync`, `errorHelpers/AppError`, `middlewares/checkAuth` + global error handler, Prisma schema copied over and `migrate`d against the same database) + Frontend skeleton (`services/api-client.ts`, rewrite rule in `next.config.ts`)
2. **Auth** — mount Better Auth in the Backend, wire Frontend login through the proxy, confirm session/cookie flow works end-to-end before touching anything else
3. **Candidates** (CV submission + admin list/detail/status update) — first full vertical slice
4. **Jobs + Employers**
5. **Applications**
6. **Deployments** (the milestone tracker — most complex business logic, done once the pattern is proven safe)
7. **Employer Requirements, Contact Messages, Dashboard**
8. **File uploads** — Uploadthing's Express adapter, moved to the Backend; Frontend's uploader points at the Backend's upload route through the same rewrite proxy
9. **End-to-end verification** — every page and form re-tested against the new Backend before considering the old single-app repo retired

## Testing / Verification

- Type-check both projects independently after each phase (`tsc --noEmit` in both `Backend/` and `Frontend/`)
- Smoke-test each Backend module's endpoints directly (curl/Postman) before wiring the Frontend to them
- After each phase, manually re-verify the corresponding Frontend pages/forms against the new Backend (the same "drive the actual feature" verification used throughout the original build)
- Full production build (`next build`) on the Frontend and a successful `tsc`/start on the Backend as the final gate before considering the split complete

## Out of Scope (for this design)

- Deploying the two projects to separate hosts/services (this design covers local dev + the code split; deployment topology is a separate decision once the split is working locally)
- Any new features beyond what already exists in the single-app version — this is a lift-and-shift of existing functionality onto a new architecture, not a redesign of the product
