# 🌍 Linking Overseas — Backend Project Plan & AI Prompts

## 📊 Current Project Status

### ✅ Already Implemented (Working Code Exists)

| Module | Feature | Status |
|--------|---------|--------|
| **Public Site** | Homepage, About, Contact (+ form), Our Team | ✅ Done |
| **Public Site** | Job listings (`/current-overseas-jobs` + `[id]` detail) | ✅ Done |
| **Public Site** | CV submission form (`/curriculum-vitae`) with file uploads | ✅ Done |
| **Public Site** | Employer requirement intake form (`/hire-workers-from-bangladesh`) | ✅ Done |
| **Auth** | Better Auth (email/password), session-based admin guard (`app/admin/layout.tsx`) | ✅ Done |
| **Admin** | Candidates list + detail view, status/notes update, PDF export (React PDF) | ✅ Done |
| **Admin** | Messages inbox (`/admin/messages`), Requirements inbox (`/admin/requirements`) | ✅ Done |
| **File Uploads** | Uploadthing wired (CV/DOCX, photo, passport copy, certificates) | ✅ Done |
| **Prisma Schema** | `Candidate`, `Job`, `EmployerRequirement`, `ContactMessage`, Better Auth tables | ✅ Done |

### ❌ Not Yet Implemented (Needed to Reach MVP Per Project Understanding Doc)

| Module | Feature | Why It's Needed |
|--------|---------|------------------|
| **Employer** | `Employer` model (no login/portal — just a record) | `Job` and `Deployment` both need a real employer to reference, not just free text |
| **Job** | `employerId` relation + admin Job CRUD (create/edit/close) | Admin currently has no way to create or manage jobs — only the public listing exists, populated by seed data |
| **Application** | `Application` model (Candidate ↔ Job, status, interview notes) | There is no way to link a specific candidate to a specific job today; a Deployment is created from an accepted Application |
| **Deployment** | `Deployment` model (Candidate + Employer + Job, `currentPhase`) | **Core compliance feature** — doesn't exist at all yet |
| **DeploymentMilestone** | Immutable, order-enforced milestone log (medical → police → BMET → visa → flight) | **The heart of the platform** per the business case — the BMET audit trail |
| **Admin** | Deployment dashboard + timeline view | No UI exists for tracking deployments in progress |
| **Reports** | BMET compliance PDF export (all deployments + milestone dates) | Needed for audits, but not blocking initial launch |

**Explicitly out of scope for this plan:** Employer Portal (separate employer login/dashboard) and multi-role staff permissions (admin/recruiter/coordinator/trainer) — both deferred to a later phase. Any authenticated staff user can perform any admin action for now.

---

## 🎯 Implementation Plan — Prompts to Build Each Feature

> **How to use**: Copy each prompt below into your AI coding assistant conversation. Each prompt is self-contained and follows the existing project's conventions (Next.js Server Actions, Prisma, Zod v4, shadcn/ui — see the Quick Reference table at the bottom).

---

## Phase 1: Foundational Models — Employer & Application (Prerequisites)

### Prompt 1.1 — Add Employer Model

```
In my Linking Overseas project at `c:\projects\linking-overseas`, I need to add an Employer model to the Prisma schema so Jobs and future Deployments can reference a real employer record.

**Do NOT build an employer login/portal — this is just a data record for admin staff to select, no auth.**

1. Add to `prisma/schema.prisma`:
   - `Employer` model with: id (cuid), companyName, contactName, phone, email, country, city, businessType, notes (String?), createdAt, updatedAt
   - Add a `jobs Job[]` back-relation

2. Update the existing `Job` model:
   - Add `employerId String` and `employer Employer @relation(fields: [employerId], references: [id])`

3. Run `npx prisma migrate dev --name add-employer` and `npx prisma generate` after the schema change (generator output is `../lib/generated/prisma`, matching the existing config — don't change it).

4. Create `server/actions/employers.actions.ts` following the exact pattern in `server/actions/candidates.actions.ts` (`'use server'`, try/catch with `console.error('[functionName]', error)`, throw user-facing `Error` messages):
   - `createEmployer(data: unknown)` — validate with a new `employerSchema` in `lib/validations.ts` (companyName, contactName, phone, email, country, city, businessType required; notes optional), then `prisma.employer.create`, `revalidatePath('/admin/employers')`
   - `getEmployers()` — `findMany`, `orderBy: { createdAt: 'desc' }`
   - `getEmployerById(id: string)` — `findUnique`, throw if not found
   - `updateEmployer(id: string, data: unknown)` — validate, update, revalidate both list and detail paths

Since the existing `Job` model doesn't have `employerId` yet and there's no data to migrate, the migration can just add it as a required field — if `prisma migrate dev` complains about existing rows with no default, either clear the dev database's Job table first or make the column optional (`employerId String?`) and mention this tradeoff to me before proceeding.
```

### Prompt 1.2 — Add Application Model

```
In my Linking Overseas project at `c:\projects\linking-overseas`, add an Application model that links a Candidate to a Job, since there's currently no way to track that a specific candidate applied to (or was shortlisted for) a specific job.

1. Add to `prisma/schema.prisma`:
   ```
   enum ApplicationStatus {
     APPLIED
     SHORTLISTED
     INTERVIEWED
     SELECTED
     REJECTED
   }

   model Application {
     id             String            @id @default(cuid())
     candidateId    String
     candidate      Candidate         @relation(fields: [candidateId], references: [id])
     jobId          String
     job            Job               @relation(fields: [jobId], references: [id])
     status         ApplicationStatus @default(APPLIED)
     interviewNotes String?
     decisionNotes  String?
     createdAt      DateTime          @default(now())
     updatedAt      DateTime          @updatedAt

     @@unique([candidateId, jobId])
   }
   ```
2. Add back-relations: `applications Application[]` on both `Candidate` and `Job`.
3. Run `npx prisma migrate dev --name add-application` and `npx prisma generate`.

4. Create `server/actions/applications.actions.ts` following the exact pattern in `server/actions/candidates.actions.ts`:
   - `createApplication(candidateId: string, jobId: string)` — create with default status APPLIED, catch the unique-constraint error and throw `'This candidate has already applied to this job.'`, `revalidatePath('/admin/applications')`
   - `getApplications()` — `findMany` including `candidate` and `job`, ordered by `createdAt: 'desc'`
   - `getApplicationById(id: string)` — `findUnique` including `candidate` and `job`, throw if not found
   - `updateApplicationStatus(id: string, status: ApplicationStatus, notes?: string)` — update status + `decisionNotes` or `interviewNotes` depending on the status, revalidate list and detail paths

Add the corresponding Zod schema (`applicationStatusSchema` or similar, using `z.enum([...])` for status) to `lib/validations.ts` if the update action takes raw form input.
```

---

## Phase 2: Admin Job Management & Applications UI

### Prompt 2.1 — Admin Job CRUD

```
In my Linking Overseas project at `c:\projects\linking-overseas`, admin staff currently have no way to create or manage jobs — the public `/current-overseas-jobs` listing exists, but there's no admin page to add, edit, or close a job, and `Job` now has a required `employerId` (added in a previous step).

1. Add `getJobs()`, `getJobById(id)`, `createJob(data)`, `updateJob(id, data)`, `closeJob(id)` (sets `status: 'CLOSED'`) to `server/actions/jobs.actions.ts` — follow the existing file's conventions if functions already exist there for the public listing; otherwise follow `candidates.actions.ts`'s pattern exactly.
   - `createJob` and `updateJob` must accept `employerId` and validate it references a real Employer.
   - Slug: auto-generate from `title` + a short random suffix if not provided, ensure uniqueness (catch the unique constraint and retry once with a different suffix).

2. Add a `jobSchema` to `lib/validations.ts` (title, jobType, destination enum, salaryText, contractYears, positions, ageMin, ageMax, requirements, employerId — all required except where the Prisma schema marks them optional/defaulted).

3. Create admin pages:
   - `app/admin/jobs/page.tsx` — server component, list all jobs (title, employer name, destination, positions, status), each row links to `/admin/jobs/[id]`, "Create Job" button linking to a create form
   - `app/admin/jobs/[id]/page.tsx` — server component showing job detail + a client form (in `_components/job-form.tsx`) to edit fields and close the job
   - `app/admin/jobs/new/page.tsx` — create form, employer selected from a dropdown populated by `getEmployers()`

4. Add a "Jobs" link to the nav in `app/admin/layout.tsx`, matching the existing `Link` styling for Candidates/Requirements/Messages.

Follow all existing critical rules: shadcn/ui components only, `cursor-pointer` on every interactive element, `animate-fade-in` on the page wrapper div, `revalidatePath` after every mutation, try/catch with `console.error` in every server action.
```

### Prompt 2.2 — Admin Applications List & Candidate Matching

```
In my Linking Overseas project at `c:\projects\linking-overseas`, add an admin UI for the Application model (created in a previous step) so staff can link candidates to jobs and track their status.

1. Create `app/admin/applications/page.tsx` — server component, list all applications (candidate name, job title, status, applied date), filterable by status via a client-side `_components/status-filter.tsx` (follow the pattern in `app/(public)/current-overseas-jobs/_components/destination-filter.tsx` for how filters are built in this project).

2. Create `app/admin/applications/[id]/page.tsx` — detail view showing candidate summary, job summary, interview notes, and a client component (`_components/application-status-form.tsx`) to update status and add notes via `updateApplicationStatus`.

3. On the candidate detail page (`app/admin/candidates/[id]/page.tsx`), add a "Apply to Job" action — a client component that lets staff pick an open job (from `getJobs()` filtered to `status: 'PUBLISHED'`) and calls `createApplication`.

4. Add "Applications" to the admin nav in `app/admin/layout.tsx`.

Follow the existing conventions: server actions for all mutations, `revalidatePath` after changes, shadcn/ui only, `cursor-pointer` on interactive elements, `animate-fade-in` on page wrappers.
```

---

## Phase 3: Deployment Milestone Tracker (Core Compliance Feature)

This is the most important feature in the platform — the BMET-compliant, immutable audit trail. Read `Linking Overseas — Project Understanding.md` critical rule #8 before starting: **`DeploymentMilestone` rows are insert-only. No update or delete function may ever be written for this model.**

### Prompt 3.1 — Add Deployment & DeploymentMilestone Prisma Models

```
In my Linking Overseas project at `c:\projects\linking-overseas`, add the Deployment tracking models — the core regulatory feature of this platform. A Deployment is created once a candidate is selected (Application.status = SELECTED) for a job, and tracks their progress through a strict, ordered sequence of milestones required for BMET (Bangladesh Ministry of Expatriates' Welfare) compliance.

1. Add to `prisma/schema.prisma`:

   ```
   enum MilestoneType {
     MEDICAL_EXAM_SCHEDULED
     MEDICAL_EXAM_COMPLETED
     POLICE_CLEARANCE_SUBMITTED
     POLICE_CLEARANCE_VERIFIED
     BMET_CLEARANCE_SUBMITTED
     BMET_CLEARANCE_APPROVED
     VISA_SUBMITTED
     VISA_APPROVED
     VISA_STAMPED
     FLIGHT_BOOKED
     DEPARTURE_CONFIRMED
   }

   enum MilestoneResult {
     PASSED
     FAILED
   }

   enum DeploymentStatus {
     IN_PROGRESS
     COMPLETED
     CANCELLED
   }

   model Deployment {
     id            String            @id @default(cuid())
     candidateId   String
     candidate     Candidate         @relation(fields: [candidateId], references: [id])
     employerId    String
     employer      Employer          @relation(fields: [employerId], references: [id])
     jobId         String
     job           Job               @relation(fields: [jobId], references: [id])
     applicationId String            @unique
     application   Application       @relation(fields: [applicationId], references: [id])
     currentPhase  MilestoneType?
     status        DeploymentStatus  @default(IN_PROGRESS)
     milestones    DeploymentMilestone[]
     createdAt     DateTime          @default(now())
     updatedAt     DateTime          @updatedAt
   }

   model DeploymentMilestone {
     id           String           @id @default(cuid())
     deploymentId String
     deployment   Deployment       @relation(fields: [deploymentId], references: [id])
     type         MilestoneType
     result       MilestoneResult?
     notes        String?
     loggedById   String
     loggedBy     User             @relation(fields: [loggedById], references: [id])
     createdAt    DateTime         @default(now())

     @@index([deploymentId])
   }
   ```

2. Add back-relations: `deployments Deployment[]` on `Candidate`, `Employer`, `Job`; `deploymentMilestones DeploymentMilestone[]` on `User`.

3. Run `npx prisma migrate dev --name add-deployment-tracking` and `npx prisma generate`.

Do not add any update or delete capability to `DeploymentMilestone` in the schema or anywhere else — it is an append-only audit log by design.
```

### Prompt 3.2 — Deployment Server Actions with Ordered Milestone Validation

```
In my Linking Overseas project at `c:\projects\linking-overseas`, implement the server actions for the Deployment Milestone Tracker (models added in a previous step). This is the platform's core compliance feature — a candidate cannot progress past certain milestones without completing prerequisites, and the milestone log can never be edited or deleted once written.

**The required milestone order:**

| Milestone | Prerequisite (must exist with `result: PASSED` where applicable) |
|---|---|
| `MEDICAL_EXAM_SCHEDULED` | none |
| `MEDICAL_EXAM_COMPLETED` | `MEDICAL_EXAM_SCHEDULED` must exist |
| `POLICE_CLEARANCE_SUBMITTED` | none |
| `POLICE_CLEARANCE_VERIFIED` | `POLICE_CLEARANCE_SUBMITTED` must exist |
| `BMET_CLEARANCE_SUBMITTED` | `MEDICAL_EXAM_COMPLETED` with `result: PASSED` AND `POLICE_CLEARANCE_VERIFIED` with `result: PASSED` |
| `BMET_CLEARANCE_APPROVED` | `BMET_CLEARANCE_SUBMITTED` must exist |
| `VISA_SUBMITTED` | `BMET_CLEARANCE_APPROVED` must exist |
| `VISA_APPROVED` | `VISA_SUBMITTED` must exist |
| `VISA_STAMPED` | `VISA_APPROVED` must exist |
| `FLIGHT_BOOKED` | `VISA_STAMPED` must exist |
| `DEPARTURE_CONFIRMED` | `FLIGHT_BOOKED` must exist (terminal state — sets `Deployment.status = COMPLETED`) |

`MEDICAL_EXAM_COMPLETED` and `POLICE_CLEARANCE_VERIFIED` require a `result` (`PASSED` or `FAILED`) to be passed in. If `result: FAILED` is logged, still allow the insert (it's part of the audit trail) but block any dependent milestone until a later attempt passes — don't overthink retries in this prompt, just make sure a FAILED result doesn't satisfy the prerequisite check.

1. Add a `MILESTONE_PREREQUISITES` map to `lib/constants.ts` describing the table above (a plain object keyed by `MilestoneType`, each value either `null` or an array of `{ type: MilestoneType; requiresResult?: 'PASSED' }`).

2. Create `server/actions/deployments.actions.ts` following the `'use server'` / try-catch / `console.error` / `revalidatePath` conventions in `server/actions/candidates.actions.ts`:

   - `getDeployments()` — `findMany` including `candidate`, `employer`, `job`, ordered by `createdAt: 'desc'`
   - `getDeploymentById(id: string)` — `findUnique` including `candidate`, `employer`, `job`, and `milestones` ordered by `createdAt: 'asc'`, throw if not found
   - `logMilestone(deploymentId: string, type: MilestoneType, loggedById: string, options?: { result?: MilestoneResult; notes?: string })`:
     1. Look up the deployment's existing milestones.
     2. Check `MILESTONE_PREREQUISITES[type]` against the existing milestones — if any required prerequisite is missing (or doesn't have the required `result`), throw a clear error naming which prerequisite is missing (e.g. `'Cannot log BMET_CLEARANCE_SUBMITTED — medical exam must be passed first.'`).
     3. If the type itself requires a `result` (`MEDICAL_EXAM_COMPLETED`, `POLICE_CLEARANCE_VERIFIED`) and none was provided, throw.
     4. In a `prisma.$transaction`, create the `DeploymentMilestone` row AND update `Deployment.currentPhase` to `type` (and `status: 'COMPLETED'` if `type === 'DEPARTURE_CONFIRMED'`).
     5. `revalidatePath('/admin/deployments')` and `revalidatePath(\`/admin/deployments/${deploymentId}\`)`.
   - **Do not write any update or delete function for milestones.** The only mutation on `DeploymentMilestone` is `logMilestone`'s create.

3. `createDeploymentFromApplication` is implemented separately in the next prompt — don't build it here.

Write this carefully — the prerequisite validation is the single most important piece of business logic in the whole platform. Add inline comments only where the "why" isn't obvious from the prerequisite table (e.g. why FAILED results don't satisfy a prerequisite).
```

### Prompt 3.3 — Create Deployment from a Selected Application

```
In my Linking Overseas project at `c:\projects\linking-overseas`, wire up the transition from "candidate selected for a job" to "deployment created and tracked."

1. Add `createDeploymentFromApplication(applicationId: string)` to `server/actions/deployments.actions.ts`:
   - Look up the `Application` (including `candidate` and `job` with its `employer`).
   - Throw if the application's status isn't `SELECTED`.
   - Throw if a Deployment already exists for this `applicationId` (the schema's `@@unique` on `applicationId` will also catch this at the DB level — catch that constraint error and surface a friendly message).
   - Create the `Deployment` with `candidateId`, `employerId` (from the job), `jobId`, `applicationId`, `currentPhase: null`, `status: 'IN_PROGRESS'`.
   - `revalidatePath('/admin/deployments')` and `revalidatePath('/admin/applications/' + applicationId)`.

2. On `app/admin/applications/[id]/page.tsx` (built in Phase 2), add a "Start Deployment" button that only appears when `application.status === 'SELECTED'` and no deployment exists yet for it — call `createDeploymentFromApplication` and redirect to the new deployment's detail page on success.

Follow existing conventions: shadcn/ui `Button`, `cursor-pointer`, try/catch with a toast or inline error message on failure (check how errors are surfaced elsewhere in the admin UI, e.g. in `cv-form.tsx` or the candidate status update flow, and match that pattern).
```

---

## Phase 4: Admin Deployment Dashboard & Timeline

### Prompt 4.1 — Deployment Dashboard/List Page

```
In my Linking Overseas project at `c:\projects\linking-overseas`, build the admin deployment dashboard using the Deployment/DeploymentMilestone actions from Phase 3.

1. Create `app/admin/deployments/page.tsx` — server component:
   - Fetch via `getDeployments()`
   - Render a table: candidate name, employer name, job title, `currentPhase` (human-readable label — add a `MILESTONE_LABELS` map to `lib/constants.ts` if not already there, e.g. `MEDICAL_EXAM_SCHEDULED` → "Medical Exam Scheduled"), status, days since last milestone
   - Each row links to `/admin/deployments/[id]`
   - Add a phase filter (client component, same pattern as the destination/status filters used elsewhere) so staff can quickly see e.g. "all deployments awaiting BMET clearance"

2. Add a stats summary at the top of the dashboard (count of deployments per `currentPhase`, computed with a `groupBy` on `Deployment.currentPhase` — add `getDeploymentStats()` to `server/actions/deployments.actions.ts` if it doesn't fit cleanly into `getDeployments()`).

3. Add "Deployments" to the admin nav in `app/admin/layout.tsx`.

Follow existing conventions: `animate-fade-in` on the page wrapper, shadcn/ui `Table` (or `Card` list if that's more consistent with `app/admin/candidates/page.tsx` — check that file first and match its layout style), `cursor-pointer` on all links/buttons.
```

### Prompt 4.2 — Deployment Detail Page with Milestone Timeline & Logging UI

```
In my Linking Overseas project at `c:\projects\linking-overseas`, build the deployment detail page — this is where staff log milestones and where the immutable audit trail is visible.

1. Create `app/admin/deployments/[id]/page.tsx` — server component:
   - Fetch via `getDeploymentById(id)`
   - Show candidate, employer, and job summary at the top
   - Render a vertical timeline of all logged milestones in order (timestamp, type label, result if present, notes, and the staff member who logged it via `loggedBy.name`) — this is the audit trail; make clear in the UI that these entries cannot be edited or removed (no edit/delete buttons should exist for milestone rows, ever)

2. Create `_components/log-milestone-form.tsx` (client component):
   - A dropdown of milestone types that are currently valid next steps given the deployment's logged milestones (compute this client-side from the milestones passed as props, or add a small server action `getValidNextMilestones(deploymentId)` that uses the same `MILESTONE_PREREQUISITES` map from Phase 3 — prefer the server action so the validation logic isn't duplicated in two places)
   - If the selected type is `MEDICAL_EXAM_COMPLETED` or `POLICE_CLEARANCE_VERIFIED`, show a required Pass/Fail selector
   - Optional notes textarea
   - Calls `logMilestone` on submit; surface the thrown error message directly if the server rejects it (e.g. prerequisite not met — though the dropdown should already prevent most of these)

3. Get the current staff user's id for `loggedById` from the session (`auth.api.getSession`) in the page/server action — don't trust a client-submitted user id.

Follow existing conventions: shadcn/ui `Select`, `RadioGroup` or similar for pass/fail, `cursor-pointer`, `animate-fade-in`, try/catch everywhere, `revalidatePath` already handled inside `logMilestone`.
```

---

## Phase 5: BMET Compliance Report Export (Stretch — Post-MVP)

### Prompt 5.1 — Compliance PDF Export

```
In my Linking Overseas project at `c:\projects\linking-overseas`, add a compliance report export for BMET audits, reusing the existing React PDF setup from `app/admin/candidates/[id]/_components/candidate-pdf-document.tsx` and `candidate-pdf-button.tsx`.

1. Create `app/admin/deployments/_components/compliance-report-document.tsx` (React PDF `Document`) — one page per deployment (or a single multi-row table if there are many), listing: candidate name, employer, job, and every milestone with its type, result, timestamp, and the staff member who logged it. Mirror the structure/styling of `candidate-pdf-document.tsx` exactly rather than inventing a new PDF layout style.

2. Create `app/admin/deployments/_components/compliance-report-button.tsx` — client component mirroring `candidate-pdf-button.tsx`'s pattern, using `getDeployments()` (optionally filtered by a date range or status) as the data source.

3. Add the export button to `app/admin/deployments/page.tsx`.

This is explicitly a post-MVP nice-to-have — don't add it until Phase 3 and 4 are working end-to-end, since the report is only as good as the underlying milestone data.
```

---

## Phase 6: Security & Compliance Follow-Ups (From Original Project Spec)

The original project-overview spec (`1- Project Overview.md`) calls for two items that were never carried into this plan and aren't implemented today. Neither blocks the Deployment Milestone Tracker work in Phases 1-4, but both come from the project's own compliance/security rules, not new scope creep.

### Prompt 6.1 — Wire Up Google OAuth Sign-In

```
In my Linking Overseas project at `c:\projects\linking-overseas`, the original spec calls for staff (and later employer) sign-in via Google OAuth through Better Auth, but `lib/auth.ts` currently only has `emailAndPassword` enabled — no OAuth provider is configured, and `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` exist as empty env vars.

1. Update `lib/auth.ts` to add Google as a social provider:
   ```ts
   socialProviders: {
     google: {
       clientId: process.env.GOOGLE_CLIENT_ID as string,
       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
     },
   },
   ```
   Keep `emailAndPassword` enabled alongside it — don't remove the existing sign-in method, add Google as a second option.

2. Update `lib/auth-client.ts` if it needs a corresponding client-side method for triggering the Google sign-in flow (check how `authClient.signIn.username(...)` is currently called in `login-form.tsx` and add the equivalent `authClient.signIn.social({ provider: 'google' })` call).

3. Add a "Continue with Google" button to `app/login/_components/login-form.tsx`, styled consistently with the existing dark-gradient card (a full-width button above or below the existing username/password form, with a divider like "or continue with").

4. Remind me that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` need real values from the Google Cloud Console (OAuth consent screen + credentials) before this works in any environment — don't invent placeholder values.

This does not change or remove the existing email/password login — it's purely additive.
```

### Prompt 6.2 — CV File Retention Policy (12-Month Auto-Deletion)

```
In my Linking Overseas project at `c:\projects\linking-overseas`, the original spec's data-minimization rule requires candidates' uploaded CV files to be deleted from Uploadthing after 12 months if the candidate has not been deployed. Nothing currently implements this.

1. Create `server/actions/retention.actions.ts` (`'use server'`, same try/catch + `console.error` convention):
   - `deleteExpiredCandidateFiles()` — find all `Candidate` rows where `createdAt` is older than 12 months AND `status !== 'DEPLOYED'`, delete each candidate's uploaded files from Uploadthing (`cvResumeUrl`, `photoUrl`, `passportCopyUrl`, `certificateUrls`) via the Uploadthing SDK's delete-by-key/URL method (check `lib/uploadthing.ts` for how the client is configured), then null out those URL fields on the Candidate row (keep the Candidate record itself — this is file cleanup, not record deletion).
   - Log a count of how many candidates were processed.

2. This needs to run on a schedule, not on a request — since there's no background job runner in this stack today, add a note (not code) describing the two realistic options for this Next.js app: a Vercel Cron Job calling a protected API route (`app/api/cron/retention/route.ts` that calls `deleteExpiredCandidateFiles()`, secured by checking a shared secret header against an env var), or an external scheduler hitting the same route. Implement the API route option since it doesn't require picking a specific hosting provider's cron config — just the route + the secret-header check.

3. Do NOT wire this into any user-facing UI — it's a backend maintenance job only.

Tell me if `lib/uploadthing.ts` doesn't expose a straightforward delete-by-URL method — if the SDK requires file keys instead of full URLs, flag that the current schema only stores URLs and ask before inventing a workaround.
```

---

## 🔑 Quick Reference: Project Conventions

| Convention | Pattern |
|-----------|---------|
| **Server actions** | `'use server'` at the top of `server/actions/<domain>.actions.ts`; plain exported async functions, no framework wrapper |
| **Error handling** | `try { ... } catch (error) { console.error('[functionName]', error); throw new Error('User-facing message.') }` |
| **Validation** | Zod v4 schemas in `lib/validations.ts`, `schema.safeParse(data)`, throw on `!parsed.success` |
| **Prisma import** | `import { prisma } from '@/lib/prisma'` |
| **Generated types/enums** | `import { X } from '@/lib/generated/prisma/client'` (generator output is `lib/generated/prisma`, not `app/generated/prisma`) |
| **Mutations** | Always call `revalidatePath(...)` for every affected route after a successful write |
| **Auth check** | `const session = await auth.api.getSession({ headers: await headers() })`; `redirect('/login')` if none (see `app/admin/layout.tsx`) |
| **Roles** | Single `role` string on `User` (default `"admin"`) — no granular RBAC yet; any authenticated staff user can perform any admin action |
| **UI components** | shadcn/ui only — never raw `<button>`, `<input>`, etc. |
| **Interactive elements** | Always add `cursor-pointer` |
| **Page wrappers** | Always add `animate-fade-in` on the top-level page div |
| **Server vs client** | Server components by default; `'use client'` only when interactivity/hooks/browser APIs are needed |
| **File uploads** | Uploadthing, PDF/DOCX only, max 5MB, validated both client (Zod) and server |
| **Audit trail** | `DeploymentMilestone` is insert-only — never write an update or delete action for it |
| **Prisma schema file** | Single `prisma/schema.prisma` (not split into multiple files) |

---

## 📋 Execution Order (Recommended)

1. **Prompt 1.1** — Employer model (10 min)
2. **Prompt 1.2** — Application model (15 min)
3. Run `prisma migrate dev` + `prisma generate`
4. **Prompt 2.1** — Admin Job CRUD (20 min)
5. **Prompt 2.2** — Admin Applications list/matching (20 min)
6. **Prompt 3.1** — Deployment + DeploymentMilestone schema (15 min)
7. **Prompt 3.2** — Deployment actions with ordered milestone validation (30 min) — the compliance core, take this one slowly
8. **Prompt 3.3** — Create Deployment from a selected Application (15 min)
9. Run `prisma migrate dev` + `prisma generate` again
10. **Prompt 4.1** — Deployment dashboard (20 min)
11. **Prompt 4.2** — Deployment detail + milestone logging UI (30 min)
12. Test the full flow end-to-end: CV → Application → Selected → Deployment → log all 11 milestones in order → confirm out-of-order logging is rejected
13. **(Post-MVP) Prompt 5.1** — Compliance PDF export
14. **Prompt 6.1** — Google OAuth sign-in (20 min, needs real Google Cloud credentials before it's testable)
15. **Prompt 6.2** — CV file 12-month retention job (25 min)
