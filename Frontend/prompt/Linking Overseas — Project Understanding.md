# Linking Overseas — Project Understanding

## What it is

A production-grade overseas recruitment platform for a licensed Bangladeshi employment agency (BMET license RL-2081) that connects Bangladeshi job seekers to GCC employers (Saudi Arabia, UAE, Kuwait, Oman, Qatar, Bahrain).

---

## Three Portals

| Portal | Users | Key Function |
|---|---|---|
| **Public Website** | Candidates & Employers | Browse jobs, submit CVs, post hiring needs, contact |
| **Admin Portal** | Internal staff (4 roles) | Manage candidates/jobs/applications/deployments, BMET reports |
| **Employer Portal** | GCC companies | Post jobs, track deployment milestones, download docs — scoped to their own data only |

---

## The Core Compliance Requirement

The **deployment milestone tracker** is the heart of the platform. It follows a strict, enforced order:

| Milestone | Required Before Next |
|---|---|
| Medical Exam Scheduled | — |
| Medical Exam Completed | Must pass before BMET |
| Police Clearance Submitted | — |
| Police Clearance Verified | Must pass before BMET |
| BMET Clearance Submitted | Requires medical + police clearance complete |
| BMET Clearance Approved | Required before visa |
| Visa Submitted | — |
| Visa Approved | — |
| Visa Stamped | Required before flight |
| Flight Booked | — |
| Departure Confirmed | Terminal state |

Milestone entries are **immutable** — insert-only, no edits or deletes — to satisfy BMET audit requirements.

---

## Tech Stack (Fixed — No Deviations)

| Layer | Technology |
|---|---|
| Framework | Next.js 15 — App Router only |
| Language | TypeScript — Strict mode |
| Styling | Tailwind CSS v4 |
| UI | React 19 + shadcn/ui |
| Authentication | Better Auth |
| Database ORM | Prisma 6 |
| Database | PostgreSQL |
| File Storage | Uploadthing |
| Auth Provider | Google OAuth (via Better Auth) |
| Forms | React Hook Form + Zod v4 |
| PDF Generation | React PDF |

---

## Architecture

### Route Structure

```
app/
├── (public)/                        # Public routes — no auth required
│   ├── page.tsx                     # Homepage
│   ├── current-overseas-jobs/       # Job listings (browse + filter)
│   │   └── [id]/
│   ├── curriculum-vitae/            # CV submission form
│   ├── hire-workers-from-bangladesh/ # Employer job requirement form
│   ├── about/                       # Company profile, BMET license, team
│   └── contact/                     # Contact form, WhatsApp, phone
│
├── (admin)/                         # Admin portal — staff only
│   ├── layout.tsx                   # Auth guard: admin session required
│   ├── dashboard/
│   ├── candidates/[id]/
│   ├── jobs/[id]/
│   ├── applications/[id]/
│   └── deployments/[id]/
│
└── (employer)/                      # Employer portal — GCC companies only
    ├── layout.tsx                   # Auth guard: employer session required
    ├── dashboard/
    ├── jobs/[id]/
    └── deployments/[id]/

server/
└── actions/
    ├── candidates.actions.ts
    ├── jobs.actions.ts
    ├── applications.actions.ts
    ├── deployments.actions.ts
    ├── employers.actions.ts

    └── reports.actions.ts

lib/
├── types.ts
├── constants.ts
├── utils.ts
└── validations.ts

prisma/
└── schema.prisma
```

### Core Data Model

```
Candidate           — profile, CV file URL, screening status, notes
Job                 — employer, destination, role type, salary, status, slots
Application         — links Candidate ↔ Job; interview notes, decision
Deployment          — links Candidate + Employer + Job; current phase
DeploymentMilestone — immutable log entries (who, when, what, result)
Employer            — GCC company profile, contact, portal credentials
User                — staff accounts with roles (admin/recruiter/coordinator/trainer)
```

---

## Critical Rules

1. **Always use shadcn/ui** for every UI element — never raw `<button>`, `<input>`, or other plain HTML elements when a shadcn equivalent exists.
2. Always add **`cursor-pointer`** to all interactive elements.
3. Always add **`animate-fade-in`** on all page-level wrapper divs.
4. All data mutations go through **server actions** — never expose writes to the client directly.
5. Always wrap async operations in **`try/catch`**. Log with `console.error`. Never expose raw stack traces or DB errors to the UI.
6. **Employer data scoping:** Always filter by `employerId === session.user.employerId`. Never return another employer's data.
7. **File uploads:** PDF/DOCX only, max 5MB — validated on both client (Zod) and server before Uploadthing upload.
8. **Audit trail integrity:** `DeploymentMilestone` rows are insert-only. No update or delete — enforced at the server action level.
9. **Server components by default.** Only use `'use client'` when the component needs interactivity, browser APIs, or React hooks.
10. Call **`revalidatePath`** after every mutation to keep server-rendered pages fresh.
11. Never expose secrets (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `UPLOADTHING_SECRET`, `GOOGLE_CLIENT_SECRET`) to the client.
12. Prisma client is generated to `app/generated/prisma`. Always run `prisma generate` before `next build`.

---

## Business Context

- **License:** BMET RL-2081 (Bangladesh Ministry of Expatriates' Welfare)
- **Market:** 700,000+ Bangladeshi workers deployed overseas annually; GCC = 60% of placements
- **Revenue model:** Employer placement fees ($800–$1,200/worker) + add-on services
- **Year 1 target:** 500+ candidates, 20–30 employer partners, 50–100 placements/month, $50K–$100K/month revenue
- **Regulatory priority:** Zero BMET violations; immutable audit trail is non-negotiable

---

## MVP Scope — What This Is NOT

- Not a payment platform (bank transfer only; online payments in Phase 5)
- Not a mobile app (responsive web only; native apps in Phase 5)
- Not multi-language (English only; Bengali and Arabic in later phases)
- Not a video interviewing platform (email/phone coordination only)
- Not a training LMS (document library only; no courses or assessments)
- Not a fintech product (no loans, insurance, or remittance)
- Not a real-time WebSocket app (server-fetched data with standard revalidation)
