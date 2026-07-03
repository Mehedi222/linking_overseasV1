# CLAUDE MEMORY — Linking Overseas Ltd (RL-2081)

> This file is the single source of truth for project context and progress.
> Update it after every session. Claude reads this at the start of every conversation.
>
> **Skills reference:** `_skills/` folder — read the relevant skill file before implementing any feature.

---

## Project Identity

- **Company:** Linking Overseas Ltd
- **License:** BMET RL-2081 (Bangladesh Ministry of Expatriates' Welfare)
- **What it does:** Production-grade overseas recruitment platform connecting Bangladeshi workers to GCC employers (Saudi Arabia, UAE, Kuwait, Oman, Qatar, Bahrain)
- **Source files:** `1- Project Overview.md`, `LINKING-OVERSEAS-BUSINESS-CASE.md`, `Linking Overseas — Project Understanding.md`

---

## Tech Stack — STRICT, NO DEVIATIONS

| Layer | Technology |
|---|---|
| Framework | Next.js 15 — App Router only, no Pages Router |
| Language | TypeScript — Strict mode |
| Styling | Tailwind CSS v4 |
| UI Components | React 19 + shadcn/ui (ALL UI elements — no raw HTML tags) |
| Authentication | Better Auth |
| ORM | Prisma 6 — client generated to `app/generated/prisma` |
| Database | PostgreSQL |
| File Storage | Uploadthing (CV uploads, compliance report exports) |
| Auth Provider | Google OAuth (via Better Auth) |
| Forms | React Hook Form + Zod v4 |
| PDF Generation | React PDF |

> If a technology is not in this list, do not suggest or introduce it. Say "I don't know" instead of guessing.

---

## Architecture — Route Structure

```
app/
├── (public)/                        # No auth required
│   ├── page.tsx                     # Homepage
│   ├── current-overseas-jobs/[id]/  # Job listings + detail
│   ├── curriculum-vitae/            # CV submission form
│   ├── hire-workers-from-bangladesh/# Employer requirement form
│   ├── about/                       # Company profile, BMET badge
│   └── contact/                     # Contact form, WhatsApp, phone
│
├── (admin)/                         # Staff only — auth guard in layout.tsx
│   ├── dashboard/
│   ├── candidates/[id]/
│   ├── jobs/[id]/
│   ├── applications/[id]/
│   └── deployments/[id]/
│
└── (employer)/                      # GCC companies only — auth guard in layout.tsx
    ├── dashboard/
    ├── jobs/[id]/
    └── deployments/[id]/

server/actions/
├── candidates.actions.ts
├── jobs.actions.ts
├── applications.actions.ts
├── deployments.actions.ts
├── employers.actions.ts
└── reports.actions.ts

lib/
├── types.ts          # All shared TypeScript types
├── constants.ts      # Countries, job categories, milestone states
├── utils.ts          # Shared utilities
└── validations.ts    # Shared Zod schemas

prisma/schema.prisma  # All models
```

---

## Data Model

```
Candidate           — profile, CV file URL, screening status, notes
Job                 — employer, destination, role type, salary, status, slots
Application         — links Candidate ↔ Job; interview notes, decision
Deployment          — links Candidate + Employer + Job; current phase
DeploymentMilestone — immutable log entries (who, when, what, result) ← INSERT ONLY
Employer            — GCC company profile, contact, portal credentials
User                — staff accounts with roles (admin/recruiter/coordinator/trainer)
```

### Deployment Milestones — Enforced Order

| # | Milestone | Gate Condition |
|---|---|---|
| 1 | Medical Exam Scheduled | — |
| 2 | Medical Exam Completed | Must pass before BMET |
| 3 | Police Clearance Submitted | — |
| 4 | Police Clearance Verified | Must pass before BMET |
| 5 | BMET Clearance Submitted | Requires medical + police clearance |
| 6 | BMET Clearance Approved | Required before visa |
| 7 | Visa Submitted | — |
| 8 | Visa Approved | — |
| 9 | Visa Stamped | Required before flight |
| 10 | Flight Booked | — |
| 11 | Departure Confirmed | Terminal state |

**IMMUTABLE:** `DeploymentMilestone` rows are insert-only. No update or delete — ever.

---

## Non-Negotiable Coding Rules

1. **shadcn/ui for everything** — never raw `<button>`, `<input>`, `<select>`, etc.
2. **`cursor-pointer`** on every interactive element
3. **`animate-fade-in`** on every page-level wrapper `<div>`
4. **Server components by default** — `'use client'` only for interactivity/hooks/browser APIs
5. **Server actions for all mutations** — never expose writes to client directly
6. **`revalidatePath`** after every mutation
7. **`try/catch` everywhere** — `console.error` to log, never expose raw errors to UI
8. **Employer data scoping** — always filter `employerId === session.user.employerId`
9. **File uploads** — PDF/DOCX only, max 5MB, validated client (Zod) AND server before Uploadthing
10. **Audit integrity** — `DeploymentMilestone` is insert-only, enforced at server action level
11. **Secrets** — never expose `DATABASE_URL`, `BETTER_AUTH_SECRET`, `UPLOADTHING_SECRET`, `GOOGLE_CLIENT_SECRET` to client
12. **Always run `prisma generate`** before `next build`

---

## Environment Variables Required

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_APP_URL=
```

---

## Build Phases & Progress

### Phase 1 — Public Website & Intake (Weeks 1–3)
**Status: [ ] NOT STARTED**

- [ ] Next.js 15 project scaffold (App Router, TypeScript strict, Tailwind v4, shadcn/ui)
- [ ] Prisma schema + PostgreSQL connection
- [ ] Better Auth setup + Google OAuth (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- [ ] Homepage (`/`) — BMET badge, service overview, testimonials, employer logos, CTAs
- [ ] Job listings (`/current-overseas-jobs`) — browse + filter by destination/type
- [ ] Job detail page (`/current-overseas-jobs/[id]`)
- [ ] CV submission form (`/curriculum-vitae`) — file upload, Zod validation, Uploadthing
- [ ] Employer requirement form (`/hire-workers-from-bangladesh`) — admin dashboard notify
- [ ] About page (`/about`)
- [ ] Contact page (`/contact`) — form, WhatsApp, phone

### Phase 2 — Admin Portal Basics (Weeks 4–6)
**Status: [ ] NOT STARTED**

- [ ] Staff login + session (Better Auth + Google OAuth, role-based: admin/recruiter/coordinator/trainer)
- [ ] Auth guard in `(admin)/layout.tsx`
- [ ] Admin dashboard — stats, activity feed, quick actions
- [ ] Candidate list + detail (search, filter, notes, status, assign to job)
- [ ] Job management — create, list, filter, match candidates
- [ ] Application tracking — pipeline, notes, decisions, interview invites

### Phase 3 — Deployment Tracking (Weeks 7–12)
**Status: [ ] NOT STARTED**

- [ ] Deployment creation (link candidate + employer + job)
- [ ] Milestone logging — all 11 milestones, timestamped, user-attributed
- [ ] Milestone validation — BMET gate enforcement (can't approve without prerequisites)
- [ ] Deployment dashboard — active list, current phase indicator
- [ ] Deployment timeline view — visual milestone progress
- [ ] Immutable audit trail — insert-only, no edit/delete
- [ ] BMET compliance report export (React PDF)

### Phase 4 — Employer Portal (Weeks 13–16)
**Status: [ ] NOT STARTED**

- [ ] Employer auth (Google OAuth via Better Auth, scoped to own data only)
- [ ] Auth guard in `(employer)/layout.tsx`
- [ ] Employer dashboard — my jobs, my deployments, stats
- [ ] Job posting + candidate review + shortlisting
- [ ] Deployment visibility — real-time milestone status
- [ ] Document downloads — contracts, visa confirmations, deployment letters

### Phase 5 — Post-MVP (Future)
**Status: DEFERRED**

- Payment processing (bank transfer only at MVP)
- Mobile app (iOS/Android)
- Multi-language (Bengali, Arabic)
- Advanced analytics dashboards
- Video interviews
- SMS notifications
- Bulk CV/job upload
- Training LMS
- Financial products (partner integrations)

---

## Business Context (For Decision-Making)

- **Revenue model:** $800–$1,200/worker placed + add-on services (BMET processing $200–300, visa $100–200, flight $50–100)
- **Year 1 target:** 500+ candidates, 20–30 employers, 50–100 placements/month, $50K–$100K/month
- **Year 3 vision:** 2,000+ candidates, 150–200 employers, 1,000+ placements/year, $1.2–1.5M annual revenue
- **Free for candidates** — revenue is employer-side only
- **Margins:** ~75% gross ($600 of $800 placement fee after ~$200/deployment cost)

### Critical Risks to Always Keep in Mind
1. **BMET compliance** — zero violations; immutable audit trail is the core technical protection
2. **Employer data isolation** — one employer MUST NEVER see another's candidates or deployments
3. **Candidate data privacy** — CVs deleted from S3 after 12 months if not deployed
4. **Visa timeline variability** — Saudi 3–8 weeks, UAE 2–3 weeks, Kuwait 4–6 weeks — communicate clearly to employers

---

## Sessions Log

### Session 1 — [2026-07-02]
**What was done:**
- Read and understood `1- Project Overview.md` (the technical brief / role prompt)
- Read and understood `LINKING-OVERSEAS-BUSINESS-CASE.md` (business strategy, personas, risks, monetisation)
- Created `Linking Overseas — Project Understanding.md` (summary of project context)
- Created this file (`CLAUDE-MEMORY.md`) as persistent memory + progress tracker

**Current state:** No code written yet. Project is fully understood and documented. Ready to scaffold.

**Next step:** Await prompt for Phase 1 — project scaffold and public website.

---

> **HOW TO USE THIS FILE:**
> At the start of each session, read this file. At the end of each session, update the Sessions Log with what was done and what comes next. Mark phase checklist items as complete `[x]` as work is finished.
