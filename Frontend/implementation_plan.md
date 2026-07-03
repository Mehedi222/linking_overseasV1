# 🎨 Linking Overseas — Frontend UI/UX Plan & AI Prompts

## 📊 Current Project Status

### ✅ Already Implemented (Working Code Exists)

| Module | Feature | Status |
|--------|---------|--------|
| **Public Site** | Homepage (`Hero → WhyChooseUs → RecruitmentProcess → TrustGrid → ServicesGrid → CurrentJobsPreview → TopCountries → CTABanner`) | ✅ Done |
| **Public Site** | About, Contact (+ form), Our Team, Job listings + detail, CV submission form, Employer requirement form | ✅ Done |
| **Auth** | Staff login page (`app/login`), dark gradient "Staff Portal" card styling | ✅ Done |
| **Admin** | Candidates list + detail (read-only, grouped Cards + PDF export), Requirements inbox, Messages inbox | ✅ Done |
| **Admin** | One loading skeleton (`app/admin/candidates/loading.tsx`) | ✅ Done |
| **shadcn/ui** | accordion, badge, button, card, checkbox, dialog, form, input, label, select, separator, sheet, skeleton, table, textarea | ✅ Installed |

### ❌ Not Yet Implemented (Confirmed UI/UX Gaps)

| Gap | Where | Why It Matters |
|-----|-------|------------------|
| **No Admin Dashboard/overview page** | Nothing exists at `/admin` root | Business case wants at-a-glance stats + activity feed; staff currently land nowhere useful after login |
| **No search/filter/pagination anywhere in admin** | `admin/candidates`, `admin/requirements`, `admin/messages` all fetch entire tables | Won't scale past a handful of rows; will get worse once `Backend/prompt.md` adds Jobs/Applications/Deployments lists using the same pattern |
| **Status badge logic copy-pasted 3x** | Inline `STATUS_VARIANT` const in 3 separate files | No shared source of truth; a 4th/5th copy is coming with Application/Deployment statuses |
| **Only one `loading.tsx` in the whole app** | Everywhere except `admin/candidates` | Every other route flashes blank/unstyled while data loads |
| **Zero `error.tsx`, zero `not-found.tsx`** | Entire app | Any thrown error or bad URL hits Next.js's default unstyled page |
| **Missing shadcn components** | `alert-dialog`, `dropdown-menu`, `pagination`, `tabs`, `avatar`, `popover` not installed | Needed for confirmation dialogs, row action menus, pagination controls, etc. |
| **No inline status-update UI on candidate detail** | `app/admin/candidates/[id]/page.tsx` | `updateCandidateStatus` server action already exists but nothing calls it — staff can't actually change a candidate's status from the detail page today |
| **No testimonials or employer-logos section** | Homepage | Business case explicitly wants both; confirmed zero matches anywhere in the repo |

**Explicitly out of scope for this plan:** anything `Backend/prompt.md`'s own phases already build (the Employer/Job/Application/Deployment data models AND their admin UI — Jobs pages, Applications pages, the Deployment dashboard/timeline). This plan only covers UI/UX gaps those phases never touch, so the two documents don't duplicate each other.

**A note on visual design:** phases 3 and 7 below touch pages that are genuinely visual/creative (Admin Dashboard layout, homepage Testimonials/Employer Logos). Reference images for these are coming in a future prompt — those prompts intentionally specify structure and data, not a final look. Build them functional with plain shadcn components now; restyle later once the references arrive.

---

## 🎯 Implementation Plan — Prompts to Build Each Feature

> **How to use**: Copy each prompt below into your AI coding assistant conversation. Each prompt is self-contained and follows the existing project's conventions (Next.js Server Actions, Prisma, Zod v4, shadcn/ui — see the Quick Reference table at the bottom).

---

## Phase 1: Foundational UI Infrastructure (Prerequisites)

### Prompt 1.1 — Install Missing shadcn Components

```
In my Linking Overseas project at `c:\projects\linking-overseas`, install the shadcn/ui components needed for upcoming admin polish work. Currently installed (in `components/ui/`): accordion, badge, button, card, checkbox, dialog, form, input, label, select, separator, sheet, skeleton, table, textarea.

Run:
npx shadcn@latest add alert-dialog dropdown-menu pagination tabs avatar popover

Confirm each lands in `components/ui/` following the existing convention (check `components.json` for the configured path/style — it's already set to `base-nova` style, `neutral` base color, `lucide` icons; don't change this config). Don't wire them into any page yet — this is just the install step.
```

### Prompt 1.2 — Shared Status Badge Helper

```
In my Linking Overseas project at `c:\projects\linking-overseas`, there are three separate hardcoded `STATUS_VARIANT` maps duplicated across `app/admin/candidates/page.tsx`, `app/admin/candidates/[id]/page.tsx`, and `app/admin/requirements/page.tsx` — each mapping a status string to a shadcn `Badge` variant (`default`/`secondary`/`destructive`/`outline`). Consolidate these into one shared helper.

1. Add to `lib/constants.ts`:
   ```ts
   export const STATUS_BADGE_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
     PENDING:     'secondary',
     REVIEWING:   'default',
     SHORTLISTED: 'default',
     REJECTED:    'destructive',
     DEPLOYED:    'outline',
     NEW:         'secondary',
     CONTACTED:   'default',
     CLOSED:      'outline',
   }

   export function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
     return STATUS_BADGE_VARIANTS[status] ?? 'secondary'
   }
   ```
   Match the exact variant values already used in the existing inline maps — don't change any current status's color/variant, only relocate the mapping. If any of the three existing files use slightly different variants for the same status, tell me the discrepancy before picking one.

2. Update `app/admin/candidates/page.tsx`, `app/admin/candidates/[id]/page.tsx`, and `app/admin/requirements/page.tsx`: delete their local `STATUS_VARIANT` const, import `getStatusVariant` from `@/lib/constants`, and call it wherever a `<Badge variant={...}>` is rendered for a status.

This map is intentionally generic (not scoped to just Candidate statuses) so that later Application/Deployment status badges (built in `Backend/prompt.md`) can extend the same map instead of creating a fourth copy — add a comment noting this.
```

---

## Phase 2: Admin List Search, Filter & Pagination Convention

### Prompt 2.1 — Retrofit Candidates List

```
In my Linking Overseas project at `c:\projects\linking-overseas`, the admin candidates list (`app/admin/candidates/page.tsx`) fetches the entire `Candidate` table via `getCandidates()` with no search, filter, or pagination. Establish the pattern here first, since it'll be reused on Requirements and Messages next.

1. Update `getCandidates()` in `server/actions/candidates.actions.ts` to accept an options object and return paginated results:
   ```ts
   export async function getCandidates(options?: { search?: string; status?: string; page?: number; pageSize?: number }) {
     const { search, status, page = 1, pageSize = 20 } = options ?? {}
     try {
       const where = {
         ...(status ? { status: status as CandidateStatus } : {}),
         ...(search ? {
           OR: [
             { name: { contains: search, mode: 'insensitive' as const } },
             { phone: { contains: search, mode: 'insensitive' as const } },
             { email: { contains: search, mode: 'insensitive' as const } },
           ],
         } : {}),
       }
       const [items, total] = await Promise.all([
         prisma.candidate.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
         prisma.candidate.count({ where }),
       ])
       return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
     } catch (error) {
       console.error('[getCandidates]', error)
       throw new Error('Failed to load candidates.')
     }
   }
   ```
   `getCandidates` currently has exactly one caller (its own list page), so this signature change is safe — confirm that's still true before changing it, and update the caller.

2. Create `components/admin/list-search-input.tsx` (client component) — a debounced (300ms) text input that reads the current `?q=` value from `useSearchParams` and pushes updates to the URL via `useRouter`, resetting `?page=` to 1 on every search change. Follow the `cursor-pointer` / shadcn `Input` conventions used elsewhere.

3. Create `components/admin/list-pagination.tsx` (client component) — wraps the newly-installed shadcn `pagination` component, reads `?page=` and a `totalPages` prop, pushes page changes to the URL while preserving other query params (`q`, `status`).

4. Update `app/admin/candidates/page.tsx`:
   - Accept `searchParams: Promise<{ q?: string; status?: string; page?: string }>`
   - Await it, call `getCandidates({ search: q, status, page: Number(page) || 1 })`
   - Render `<ListSearchInput />` above the table, a status `Select` filter (options from `CANDIDATE_STATUS_LABELS`) beside it, and `<ListPagination totalPages={...} />` below the table
   - Keep the existing empty-state paragraph for zero total candidates, and add a distinct "No candidates match your search" message when `total === 0` but `search` or `status` was provided

Follow existing conventions: shadcn/ui only, `cursor-pointer` on all interactive elements, `animate-fade-in` on the page wrapper (already present — don't duplicate it).
```

### Prompt 2.2 — Retrofit Requirements & Messages Lists

```
In my Linking Overseas project at `c:\projects\linking-overseas`, apply the exact same search/filter/pagination pattern built in the previous prompt (`components/admin/list-search-input.tsx`, `components/admin/list-pagination.tsx`) to the two remaining admin list pages.

1. `app/admin/requirements/page.tsx` + `getEmployerRequirements()` in `server/actions/employer-requirements.actions.ts`:
   - Add the same `{ search, status, page, pageSize }` options object (search across `companyName`, `fullName`, `email`; status filter using `RequirementStatus` — `NEW`/`CONTACTED`/`CLOSED`)
   - Wire up `ListSearchInput`, a status `Select`, and `ListPagination` the same way

2. `app/admin/messages/page.tsx` + `getContactMessages()` in `server/actions/contact.actions.ts`:
   - Same pattern, search across `name`, `email`, `subject` — `ContactMessage` has no status field, so skip the status filter for this one, search + pagination only

Both `getEmployerRequirements` and `getContactMessages` currently have exactly one caller each (their own list pages) — confirm that's still true before changing their signatures.

Note for future reference: `Backend/prompt.md`'s later phases add Jobs, Applications, and Deployments admin list pages — those should adopt this same `ListSearchInput` / `ListPagination` convention rather than fetching unpaginated tables, since those prompts were written before this convention existed.
```

---

## Phase 3: Admin Dashboard / Overview Page

### Prompt 3.1 — Build the Admin Dashboard

```
In my Linking Overseas project at `c:\projects\linking-overseas`, there is currently NO page at all at `/admin` root — `app/admin/` only has `candidates/`, `requirements/`, `messages/`, and `layout.tsx`. Build a dashboard/overview page so staff land somewhere useful after login.

**Visual design: no direct Dashboard mockup was provided, but reference screenshots of a comparable BMET-licensed recruitment site (Explorer Overseas Ltd) establish one card pattern used consistently across their Trust Grid, Services, and Recruitment Process sections — a colored rounded-square icon badge (`lucide-react` icon, ~40px, `bg-{color}-100 text-{color}-600 rounded-lg` or similar) + short title + one-line description/value, repeated in a grid. Reuse that exact pattern for the stat cards here instead of a generic bare shadcn `Card`: each stat card = icon badge + big number + label. For the quick-actions row, mirror their "Start Here" section — small clickable cards, each an icon + short label, linking out (Candidates/Requirements/Messages). Keep colors within the site's existing orange-accent-on-light-background palette (see `hero.tsx`/`cta-banner.tsx`) rather than introducing the reference site's blue.**

1. Create `server/actions/dashboard.actions.ts` (`'use server'`, same try/catch + `console.error` pattern as `candidates.actions.ts`):
   - `getDashboardStats()` returning:
     - `newCandidatesToday` — `prisma.candidate.count({ where: { createdAt: { gte: startOfToday } } })`
     - `publishedJobs` — count of jobs with `status: 'PUBLISHED'` (reuse the same filter as `getPublishedJobs` in `jobs.actions.ts`)
     - `candidatesByStatus` — `prisma.candidate.groupBy({ by: ['status'], _count: true })`, mapped to `CANDIDATE_STATUS_LABELS`
     - `pendingRequirements` — count of `EmployerRequirement` with `status: 'NEW'`
     - `unreadMessages` or total message count — whatever's simplest given `ContactMessage` has no read/unread field today (just show total count with a note it's not yet unread-tracked)
   - `getRecentActivity(limit = 10)` — fetch the most recent `limit` candidates, requirements, and messages (each with just id/name-or-title/createdAt/a type discriminator), merge and sort by `createdAt` descending, return the top `limit`

   **Do NOT add a "deployments" stat** — the `Deployment` model doesn't exist yet (it's built in `Backend/prompt.md` Phase 3). Add a code comment noting this stat should be added once that model lands. Don't fabricate placeholder data for it.

2. Create `app/admin/page.tsx` (server component):
   - Call `getDashboardStats()` and `getRecentActivity()`
   - Render a row of stat `Card`s (new CVs today, published jobs, pending requirements, candidates-by-status breakdown)
   - Render an activity feed list below (each item: type label, name/title, relative time)
   - Add quick-action links to `/admin/candidates`, `/admin/requirements`, `/admin/messages`

3. Update `app/admin/layout.tsx`: add a "Dashboard" link as the FIRST item in the nav, pointing to `/admin`, matching the existing `Link` styling used for Candidates/Requirements/Messages.

Follow existing conventions: `animate-fade-in` on the page wrapper, shadcn/ui only, `cursor-pointer` on all links.
```

---

## Phase 4: Candidate Detail — Inline Status-Update UI

### Prompt 4.1 — Add Status Update Form to Candidate Detail

```
In my Linking Overseas project at `c:\projects\linking-overseas`, the `updateCandidateStatus(id, status, notes)` server action already exists in `server/actions/candidates.actions.ts`, but nothing in the UI calls it — `app/admin/candidates/[id]/page.tsx` is a pure read-only view (grouped Cards + a PDF export button). Add the missing form so staff can actually update a candidate's status.

1. Create `app/admin/candidates/[id]/_components/status-update-form.tsx` (client component):
   - A shadcn `Select` populated from `CANDIDATE_STATUS_LABELS` (imported from `lib/constants.ts`), defaulting to the candidate's current status
   - A `Textarea` for notes, defaulting to the candidate's current `notes` value
   - Wrap the submit action in the newly-installed `alert-dialog` for a confirmation step (status changes — especially to REJECTED or DEPLOYED — are consequential)
   - On confirm, call `updateCandidateStatus(id, status, notes)`
   - Use the project's standard local `useState` error-string pattern for failures: `{error && <p className="text-sm text-destructive">{error}</p>}`
   - **Deviation from the public-form pattern on purpose**: do NOT swap the form out for a full "success screen" like `cv-form.tsx`/`contact-form.tsx` do — this is an in-place update on a persistent detail page, not a one-shot submission. On success, just clear the error state; `updateCandidateStatus` already calls `revalidatePath` internally, which will refresh the page's status badge automatically.

2. Update `app/admin/candidates/[id]/page.tsx`: render `<StatusUpdateForm candidate={candidate} />` near the existing status `Badge` in the header area.

Follow existing conventions: shadcn/ui only, `cursor-pointer` on all interactive elements.
```

---

## Phase 5: Loading States for Missing Routes

### Prompt 5.1 — Add Loading Skeletons

```
In my Linking Overseas project at `c:\projects\linking-overseas`, only `app/admin/candidates/loading.tsx` exists as a loading skeleton — every other route shows a blank/unstyled flash while data loads. Add matching skeletons using the exact same pattern (shadcn `Skeleton` components approximating the final layout).

Read `app/admin/candidates/loading.tsx` first and mirror its structure and style for each of these:

1. `app/admin/loading.tsx` — skeleton for the new Dashboard (Phase 3): a few stat-card-shaped `Skeleton` blocks in a row, plus a list-shaped skeleton below for the activity feed
2. `app/admin/candidates/[id]/loading.tsx` — skeleton approximating the grouped-Cards detail layout (a few `Skeleton` blocks stacked, matching card-group shapes)
3. `app/admin/requirements/loading.tsx` and `app/admin/messages/loading.tsx` — table-row skeletons matching `app/admin/candidates/loading.tsx` almost exactly (same shape of data)
4. `app/(public)/current-overseas-jobs/loading.tsx` — skeleton for the job listing grid
5. `app/(public)/current-overseas-jobs/[id]/loading.tsx` — skeleton for a single job detail page

Also check whether `app/admin/candidates/loading.tsx` needs a search-bar-shaped `Skeleton` row added at the top, now that Phase 2 added a search/filter toolbar above the table — if so, update it to match.

Skip purely static pages with no async data fetch (About, Our Team, Contact) — there's nothing to await on those.
```

---

## Phase 6: Error & Not-Found Boundaries

### Prompt 6.1 — Add Error and Not-Found Pages

```
In my Linking Overseas project at `c:\projects\linking-overseas`, there are currently ZERO `error.tsx` and ZERO `not-found.tsx` files anywhere in the app — any thrown error or bad URL falls through to Next.js's unstyled default page. Add proper boundaries.

1. `app/error.tsx` (public-facing root boundary) — client component (`'use client'`, required by Next.js for error boundaries), receives `error` and `reset` props, shows a centered shadcn `Card` with a friendly message ("Something went wrong") and a `Button` calling `reset()` to retry. Log the error with `console.error('[RootError]', error)`.

2. `app/not-found.tsx` (public-facing root 404) — centered message + a `Button`/`Link` back to `/`.

3. `app/admin/error.tsx` — same pattern as #1, but rendered so it stays within the admin shell's visual context (plain shadcn `Card`, consistent with the rest of `/admin` — don't try to preserve the actual `AdminLayout` nav bar, since an error boundary replaces its own segment's content, but keep the styling admin-appropriate rather than reusing the public site's look).

4. `app/admin/not-found.tsx` — same idea, admin-appropriate styling, links back to `/admin`.

Follow existing conventions: shadcn/ui only, `cursor-pointer` on buttons/links, `animate-fade-in` on the wrapper.
```

---

## Phase 7: Homepage — Testimonials & Employer Logos

### Prompt 7.1 — Add Testimonials and Employer Logos Sections

```
In my Linking Overseas project at `c:\projects\linking-overseas`, the business case calls for a "testimonials from deployed workers" section and an "employer logos" section on the homepage — neither exists today (confirmed: zero matches for "testimonial" or "logo" anywhere in the repo). Add both, following the exact structural shape already used by sections like `trust-grid.tsx` (a `lib/constants.ts` data array → a server component → inserted into the homepage composition).

**Visual design: reference screenshots of a comparable site (Explorer Overseas Ltd) don't show a literal testimonials or employer-logos section either, but they do establish two concrete, reusable patterns to apply here instead of a generic plain layout:**

- **Employer Logos → mirror their "A PROUD MEMBER OF" treatment**: a small centered uppercase heading, then a row of logos each sitting in its own bordered white box with a subtle shadow (`border rounded-lg bg-white p-4 shadow-sm`), evenly spaced. This maps directly onto a row of employer/partner logos — reuse it as-is rather than inventing a different treatment.
- **Testimonials → mirror the site's recurring "icon/avatar + title + description" card language** (same shape used in their Trust Grid / Services / Recruitment Process sections): a grid of cards, each with a circular avatar placeholder (initials, not a real photo — deployed candidates' photos shouldn't be used without explicit consent), name (or first name + destination country, e.g. "Rahim — deployed to Saudi Arabia" for privacy), and the quote text below. Do not add a carousel or star ratings — keep it a static grid consistent with the rest of the homepage's card sections.

Build both with this structure now; only the copy (real quotes, real partner logos) is still pending.

1. Add to `lib/constants.ts`:
   ```ts
   export const TESTIMONIALS = [
     { name: 'placeholder', destination: 'placeholder destination country', quote: 'placeholder quote text' },
     // add 3-5 placeholder entries; real quotes to be supplied later
   ] as const

   export const EMPLOYER_LOGOS = [
     { name: 'placeholder company name', logoUrl: '' },
     // add 4-6 placeholder entries; real logos to be supplied later
   ] as const
   ```

2. Create `app/(public)/_components/testimonials.tsx` (server component) — `<section>` wrapper, `max-w-7xl` centered container, heading + subheading, then a grid mapping over `TESTIMONIALS`: each entry a `Card` with a circular avatar (render the person's initials inside a colored circle — no image needed since `TESTIMONIALS` has no photo field), name/destination line, and quote text.

3. Create `app/(public)/_components/employer-logos.tsx` (server component) — heading (e.g. "Trusted By"), then a flex/grid row of `EMPLOYER_LOGOS`, each logo wrapped in a bordered white box (`border rounded-lg bg-white p-4 shadow-sm`) matching the reference site's membership-badge treatment; render the company name as text if `logoUrl` is empty — don't build image-upload/CMS logic, this is static data.

4. Update `app/(public)/page.tsx` — insert `<Testimonials />` and `<EmployerLogos />` into the composition, likely between `TrustGrid`/`ServicesGrid` and `CTABanner` (exact position isn't final — use your best judgment here, it'll likely be adjusted once real content/reference images arrive).

Follow existing conventions: `animate-fade-in` is only needed on page-level wrappers, not individual sections (check how the existing sections like `trust-grid.tsx` handle this and match it exactly).
```

---

## 🔑 Quick Reference: Project Conventions

| Convention | Pattern |
|-----------|---------|
| **Server actions** | `'use server'` at the top of `server/actions/<domain>.actions.ts`; plain exported async functions, no framework wrapper |
| **Error handling** | `try { ... } catch (error) { console.error('[functionName]', error); throw new Error('User-facing message.') }` |
| **Validation** | Zod v4 schemas in `lib/validations.ts`, `schema.safeParse(data)`, throw on `!parsed.success` |
| **Prisma import** | `import { prisma } from '@/lib/prisma'` |
| **Generated types/enums** | `import { X } from '@/lib/generated/prisma/client'` |
| **Mutations** | Always call `revalidatePath(...)` for every affected route after a successful write |
| **Auth check** | `const session = await auth.api.getSession({ headers: await headers() })`; `redirect('/login')` if none |
| **No toast library** | Public forms use local `useState` for `error`/`submitted`; success swaps the form for an inline "success screen" (Card + ✓ + "Submit Another"); errors render as `{error && <p className="text-sm text-destructive">{error}</p>}` above the submit button. In-place admin updates (e.g. status changes) skip the success-screen swap and just clear the error, relying on `revalidatePath` |
| **Admin list pattern** | `<div className="space-y-6">` → header (`h1` + muted count subtitle) → single `Card > CardHeader/CardTitle + CardContent > Table` → (as of Phase 2) search/filter toolbar above the table, pagination below |
| **Admin detail pattern** | Stack of `Card`s per logical field group, `label / value` grid rows separated by `Separator`, conditional rendering for optional fields |
| **Status badges** | `getStatusVariant(status)` from `lib/constants.ts` (as of Phase 1) — never a new inline `STATUS_VARIANT` map |
| **UI components** | shadcn/ui only — never raw `<button>`, `<input>`, etc. |
| **Interactive elements** | Always add `cursor-pointer` |
| **Page wrappers** | Always add `animate-fade-in` on the top-level page div |
| **Server vs client** | Server components by default; `'use client'` only when interactivity/hooks/browser APIs are needed |
| **Staff/auth page styling** | Dark gradient theme (`slate-950`/`indigo-950`/`purple-600`) is reserved for the login page specifically — the rest of `/admin` uses the plain light shadcn Card style; don't mix the two without a reason |

---

## 📋 Execution Order (Recommended)

1. **Prompt 1.1** — Install missing shadcn components (5 min)
2. **Prompt 1.2** — Shared status badge helper (15 min)
3. **Prompt 2.1** — Retrofit Candidates list with search/filter/pagination (30 min) — establishes the pattern
4. **Prompt 2.2** — Retrofit Requirements & Messages lists (20 min) — reuses the pattern
5. **Prompt 3.1** — Admin Dashboard page (30 min)
6. **Prompt 4.1** — Candidate status-update form (20 min)
   *(Steps 5 and 6 are independent of each other — either order works)*
7. **Prompt 5.1** — Loading skeletons for remaining routes (20 min)
8. **Prompt 6.1** — Error & not-found boundaries (15 min)
9. **Prompt 7.1** — Homepage testimonials & employer logos (20 min, placeholder content — revisit once reference images/real content arrive)
10. Test end-to-end: search/filter/paginate each admin list, confirm the Dashboard's stats match reality, update a candidate's status and confirm the badge refreshes, trigger a 404 and a thrown error to confirm the new boundaries render instead of Next.js defaults
