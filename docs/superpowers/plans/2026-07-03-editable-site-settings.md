# Editable Site Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move company info, contact details, and social links out of the hardcoded `COMPANY` constant and into a DB-backed, admin-editable `SiteSettings` singleton, read by 8 public-facing files and writable from a new "Site Information" form on the admin Settings page.

**Architecture:** New Backend module (`siteSettings`) following the same five-file pattern as `candidate` (interface/validation/service/controller/route), exposing a public `GET /site-settings` and an authenticated `PATCH /site-settings`. Frontend gets a server-only read service (used independently by each Server Component that needs it — Next.js dedupes identical `fetch` calls automatically within one render) and a client-safe write service for the new admin form.

**Tech Stack:** Same as the rest of the split project — Express/TypeScript/Prisma on the Backend, Next.js Server/Client Components on the Frontend, Zod v4 validation, no automated test framework (verification via `tsc`, `next build`, and manual/curl checks).

## Global Constraints

- Design reference: `docs/superpowers/specs/2026-07-03-editable-site-settings-design.md`
- Editable fields: `companyName`, `shortName`, `since`, `license`, `description`, `phone`, `phoneAlt`, `whatsapp`, `email`, `address`, `websiteUrl`, `whatsappUrl`, `telegramUrl`, `otherUrl`
- **Not editable:** the footer's "EXPLORE" nav links (`NAV_LINKS` in `lib/constants.ts`) — untouched
- Each social URL field renders its icon **only when non-empty** — no more unconditional decorative icons
- `GET /site-settings` is public (no `checkAuth`); `PATCH /site-settings` requires `checkAuth`
- No automated test suite exists in either project — verification is `tsc --noEmit`, `next build`/`npm run build`, and curl/browser checks with exact expected output, matching every other phase of this project
- Both dev servers (Backend `:5000`, Frontend `:3000`) must be running for the curl-based verification steps — start them with `npm run dev` in each directory if not already running

---

### Task 1: Backend — SiteSettings schema, migration, and seed

**Files:**
- Modify: `Backend/prisma/schema.prisma`
- Create: `Backend/prisma/seed-site-settings.ts`

**Interfaces:**
- Produces: the `SiteSettings` Prisma model (fields listed in Global Constraints, all `String` except the four URL fields and `phoneAlt`/`whatsapp` which are `String?`), available to Task 2's service via `prisma.siteSettings`.

- [ ] **Step 1: Add the model to the schema**

Add to `Backend/prisma/schema.prisma` (append at the end of the file):
```prisma
model SiteSettings {
  id          String   @id @default(cuid())
  companyName String
  shortName   String
  since       String
  license     String
  description String
  phone       String
  phoneAlt    String?
  whatsapp    String?
  email       String
  address     String
  websiteUrl  String?
  whatsappUrl String?
  telegramUrl String?
  otherUrl    String?
  updatedAt   DateTime @updatedAt
}
```

- [ ] **Step 2: Run the migration**

```bash
cd c:/projects/linking_overseasV1/Backend
npx prisma migrate dev --name add_site_settings
npx prisma generate
```
Expected: `Your database is now in sync with your schema.` and `✔ Generated Prisma Client`.

- [ ] **Step 3: Create the seed script**

Create `Backend/prisma/seed-site-settings.ts` — seeds the one row with today's real values (currently hardcoded in `Frontend/lib/constants.ts`'s `COMPANY` object), only if no row exists yet:
```typescript
import 'dotenv/config'
import { prisma } from '../src/app/lib/prisma'

async function main() {
  const existing = await prisma.siteSettings.findFirst()
  if (existing) {
    console.log('SiteSettings already seeded:', existing.id)
    return
  }

  const settings = await prisma.siteSettings.create({
    data: {
      companyName: 'Linking Overseas Ltd',
      shortName: 'Linking Overseas',
      since: '2019',
      license: 'BMET RL-2081',
      description:
        'BMET RL-2081 licensed overseas recruitment agency in Bangladesh. We support skilled manpower recruitment, housemaid recruitment, visa processing and BMET clearance with ethical, transparent and dependable service.',
      phone: '+880 1XXX-XXXXXX',
      phoneAlt: '+880 2XXX-XXXXXX',
      whatsapp: '+880 1XXX-XXXXXX',
      email: 'info@linkingoverseas.com',
      address: '31/C/1, Sample Complex, 7th Floor, Topkhana Road, Dhaka-1000, Bangladesh',
    },
  })

  console.log('Seeded SiteSettings:', settings.id)
}

main()
  .catch((error) => {
    console.error('[seed-site-settings]', error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 4: Run the seed script**

```bash
cd c:/projects/linking_overseasV1/Backend
npx tsx prisma/seed-site-settings.ts
```
Expected: `Seeded SiteSettings: <some cuid>`.

- [ ] **Step 5: Verify tsc is clean**

```bash
cd c:/projects/linking_overseasV1/Backend
npx tsc --noEmit
```
Expected: no output, exit code 0.

- [ ] **Step 6: Commit**

```bash
cd c:/projects/linking_overseasV1
git add Backend/prisma
git commit -m "feat: add SiteSettings model, migration, and seed script"
```

---

### Task 2: Backend — siteSettings module (service, controller, route)

**Files:**
- Create: `Backend/src/app/modules/siteSettings/siteSettings.validation.ts`
- Create: `Backend/src/app/modules/siteSettings/siteSettings.service.ts`
- Create: `Backend/src/app/modules/siteSettings/siteSettings.controller.ts`
- Create: `Backend/src/app/modules/siteSettings/siteSettings.route.ts`
- Modify: `Backend/src/routes/index.ts`

**Interfaces:**
- Consumes: `prisma` (`@/app/lib/prisma`), `catchAsync`, `sendResponse`, `AppError`, `checkAuth` (all already exist from Tasks 2/4 of the Phase 1 plan).
- Produces: `SiteSettingsRoutes` (default export from `siteSettings.route.ts`), mounted at `/site-settings` — `GET /site-settings` (public) and `PATCH /site-settings` (authenticated).

- [ ] **Step 1: Create the validation schema**

Create `Backend/src/app/modules/siteSettings/siteSettings.validation.ts`:
```typescript
import { z } from 'zod'

export const updateSiteSettingsZodSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  shortName: z.string().min(1, 'Short name is required'),
  since: z.string().min(1, 'Since year is required'),
  license: z.string().min(1, 'License is required'),
  description: z.string().min(1, 'Description is required'),
  phone: z.string().min(1, 'Phone is required'),
  phoneAlt: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  email: z.string().email('Enter a valid email address'),
  address: z.string().min(1, 'Address is required'),
  websiteUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  whatsappUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  telegramUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  otherUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})
```

- [ ] **Step 2: Create the service**

Create `Backend/src/app/modules/siteSettings/siteSettings.service.ts`:
```typescript
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../errorHelpers/AppError'
import { updateSiteSettingsZodSchema } from './siteSettings.validation'

type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsZodSchema>

export const getSiteSettings = async () => {
  const settings = await prisma.siteSettings.findFirst()
  if (!settings) throw new AppError(404, 'Site settings not found. Run the seed script.')
  return settings
}

export const updateSiteSettings = async (payload: UpdateSiteSettingsInput) => {
  const existing = await prisma.siteSettings.findFirst()
  if (!existing) throw new AppError(404, 'Site settings not found. Run the seed script.')

  return prisma.siteSettings.update({
    where: { id: existing.id },
    data: {
      ...payload,
      phoneAlt: payload.phoneAlt || null,
      whatsapp: payload.whatsapp || null,
      websiteUrl: payload.websiteUrl || null,
      whatsappUrl: payload.whatsappUrl || null,
      telegramUrl: payload.telegramUrl || null,
      otherUrl: payload.otherUrl || null,
    },
  })
}
```

- [ ] **Step 3: Create the controller**

Create `Backend/src/app/modules/siteSettings/siteSettings.controller.ts`:
```typescript
import { catchAsync } from '../../shared/catchAsync'
import { sendResponse } from '../../shared/sendResponse'
import { AppError } from '../../errorHelpers/AppError'
import { updateSiteSettingsZodSchema } from './siteSettings.validation'
import * as siteSettingsService from './siteSettings.service'

export const getSiteSettings = catchAsync(async (_req, res) => {
  const settings = await siteSettingsService.getSiteSettings()
  sendResponse(res, { statusCode: 200, success: true, message: 'Site settings retrieved.', data: settings })
})

export const updateSiteSettings = catchAsync(async (req, res) => {
  const parsed = updateSiteSettingsZodSchema.safeParse(req.body)
  if (!parsed.success) throw new AppError(400, 'Invalid site settings data. Please check all fields.')

  const settings = await siteSettingsService.updateSiteSettings(parsed.data)
  sendResponse(res, { statusCode: 200, success: true, message: 'Site settings updated.', data: settings })
})
```

- [ ] **Step 4: Create the route**

Create `Backend/src/app/modules/siteSettings/siteSettings.route.ts`:
```typescript
import { Router } from 'express'
import { checkAuth } from '../../middlewares/checkAuth'
import * as siteSettingsController from './siteSettings.controller'

const router = Router()

router.get('/', siteSettingsController.getSiteSettings)
router.patch('/', checkAuth, siteSettingsController.updateSiteSettings)

export const SiteSettingsRoutes = router
export default SiteSettingsRoutes
```

- [ ] **Step 5: Mount the route**

Modify `Backend/src/routes/index.ts`:
```typescript
import { Router } from 'express'
import { CandidateRoutes } from '../app/modules/candidate/candidate.route'
import { SiteSettingsRoutes } from '../app/modules/siteSettings/siteSettings.route'

const router = Router()

router.use('/candidates', CandidateRoutes)
router.use('/site-settings', SiteSettingsRoutes)

export default router
```

- [ ] **Step 6: Verify with curl**

```bash
cd c:/projects/linking_overseasV1/Backend
npm run dev
```
In a second terminal:
```bash
curl -s http://localhost:5000/site-settings
```
Expected: `{"success":true,"message":"Site settings retrieved.","data":{"id":"...","companyName":"Linking Overseas Ltd", ...}}`.

Then verify the write path is protected:
```bash
curl -i -X PATCH http://localhost:5000/site-settings -H "Content-Type: application/json" -d '{}'
```
Expected: HTTP `401`. Stop the dev server before continuing.

- [ ] **Step 7: Verify tsc is clean**

```bash
cd c:/projects/linking_overseasV1/Backend
npx tsc --noEmit
```
Expected: no output, exit code 0.

- [ ] **Step 8: Commit**

```bash
cd c:/projects/linking_overseasV1
git add Backend/src
git commit -m "feat: add siteSettings Backend module (get, update)"
```

---

### Task 3: Frontend — site settings services (server + client)

**Files:**
- Create: `Frontend/services/site-settings.server-services.ts`
- Create: `Frontend/services/site-settings.services.ts`

**Interfaces:**
- Consumes: `apiServer` (`@/services/api-server`), `apiClient` (`@/services/api-client`).
- Produces: `ISiteSettings` (type, exported from `site-settings.server-services.ts`), `getSiteSettings()` (server-only, returns `Promise<ISiteSettings>`), `updateSiteSettings(payload)` (client-safe) — every later task imports these by these exact names.

- [ ] **Step 1: Create the server-only read service**

Create `Frontend/services/site-settings.server-services.ts`:
```typescript
import 'server-only'
import { apiServer } from './api-server'

export interface ISiteSettings {
  id: string
  companyName: string
  shortName: string
  since: string
  license: string
  description: string
  phone: string
  phoneAlt: string | null
  whatsapp: string | null
  email: string
  address: string
  websiteUrl: string | null
  whatsappUrl: string | null
  telegramUrl: string | null
  otherUrl: string | null
}

export async function getSiteSettings() {
  return apiServer<ISiteSettings>('/site-settings', {
    next: { revalidate: 60 },
  })
}
```

- [ ] **Step 2: Create the client-safe write service**

Create `Frontend/services/site-settings.services.ts`:
```typescript
'use client'

import { apiClient } from './api-client'
import type { ISiteSettings } from './site-settings.server-services'

// All fields are plain strings (never null/undefined) — the admin form always
// submits an empty string for a cleared optional field, never omits the key.
export interface UpdateSiteSettingsInput {
  companyName: string
  shortName: string
  since: string
  license: string
  description: string
  phone: string
  phoneAlt: string
  whatsapp: string
  email: string
  address: string
  websiteUrl: string
  whatsappUrl: string
  telegramUrl: string
  otherUrl: string
}

export async function updateSiteSettings(values: UpdateSiteSettingsInput) {
  return apiClient<ISiteSettings>('/site-settings', {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}
```

- [ ] **Step 3: Update apiServer to accept fetch options like `next`**

Read `Frontend/services/api-server.ts` first — its current signature already accepts `options: RequestInit` and spreads `...options` into the `fetch()` call, but `next: { revalidate }` is a Next.js-specific extension to `RequestInit`, not standard `RequestInit`. Modify the type to accept it:
```typescript
import 'server-only'
import { headers } from 'next/headers'

type ApiServerOptions = RequestInit & { next?: { revalidate?: number | false; tags?: string[] } }

export async function apiServer<T>(path: string, options: ApiServerOptions = {}): Promise<T> {
  const incomingHeaders = await headers()
  const cookie = incomingHeaders.get('cookie') ?? ''

  const res = await fetch(`${process.env.BACKEND_INTERNAL_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      cookie,
      ...options.headers,
    },
  })

  const body = await res.json()

  if (!res.ok || !body.success) {
    throw new Error(body.message ?? 'Something went wrong.')
  }

  return body.data as T
}

export default apiServer
```
Note: the previous hardcoded `cache: 'no-store'` is removed here — callers now control caching via `next: { revalidate }` (this task) or by passing `cache: 'no-store'` explicitly (existing callers like `candidate.server-services.ts` don't pass `next`, so they'll pick up the default `fetch` caching behavior; since Candidate reads are called from pages that already set `cache: 'no-store'` implicitly via `checkAuth`-gated dynamic rendering, this is safe — but to be explicit and preserve today's always-fresh behavior for candidates, add `cache: 'no-store'` directly in `candidate.server-services.ts`'s two calls instead of relying on the removed default.

- [ ] **Step 4: Preserve no-store behavior for existing candidate reads**

Modify `Frontend/services/candidate.server-services.ts` — add `cache: 'no-store'` explicitly to both calls, since `apiServer`'s hardcoded default was just removed in Step 3:
```typescript
import 'server-only'
import { apiServer } from './api-server'
import type { Candidate } from '@/lib/generated/prisma/client'

interface GetCandidatesResult {
  items: Candidate[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getCandidates(options?: {
  search?: string
  status?: string
  page?: number
  pageSize?: number
}) {
  const params = new URLSearchParams()
  if (options?.search) params.set('search', options.search)
  if (options?.status) params.set('status', options.status)
  if (options?.page) params.set('page', String(options.page))
  if (options?.pageSize) params.set('pageSize', String(options.pageSize))

  const qs = params.toString()
  return apiServer<GetCandidatesResult>(`/candidates${qs ? `?${qs}` : ''}`, { cache: 'no-store' })
}

export async function getCandidateById(id: string) {
  return apiServer<Candidate>(`/candidates/${id}`, { cache: 'no-store' })
}
```

- [ ] **Step 5: Verify tsc is clean**

```bash
cd c:/projects/linking_overseasV1/Frontend
npx tsc --noEmit
```
Expected: no output, exit code 0.

- [ ] **Step 6: Commit**

```bash
cd c:/projects/linking_overseasV1
git add Frontend/services
git commit -m "feat: add site settings server/client services, preserve candidate no-store caching"
```

---

### Task 4: Frontend — rewire the public site footer

**Files:**
- Modify: `Frontend/components/site-footer.tsx`

**Interfaces:**
- Consumes: `getSiteSettings()` (`@/services/site-settings.server-services`).

- [ ] **Step 1: Rewrite site-footer.tsx**

Replace the full contents of `Frontend/components/site-footer.tsx`:
```typescript
import Link from 'next/link'
import { Phone, Mail, MapPin, ShieldCheck, Globe, MessageCircle, Send, Link2 } from 'lucide-react'
import { NAV_LINKS } from '@/lib/constants'
import { getSiteSettings } from '@/services/site-settings.server-services'

export async function SiteFooter() {
  const settings = await getSiteSettings()

  const socialLinks = [
    { icon: Globe, href: settings.websiteUrl },
    { icon: MessageCircle, href: settings.whatsappUrl },
    { icon: Send, href: settings.telegramUrl },
    { icon: Link2, href: settings.otherUrl },
  ].filter((link): link is { icon: typeof Globe; href: string } => Boolean(link.href))

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-orange-500 text-white">
              <ShieldCheck className="size-5" />
            </span>
            <span className="text-sm font-bold text-white">{settings.companyName}</span>
          </div>
          <p className="text-sm text-slate-400">{settings.description}</p>
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              {socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-colors hover:bg-orange-500 hover:text-white"
                >
                  <link.icon className="size-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white">EXPLORE</h3>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-slate-400 hover:text-white cursor-pointer">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white">CONTACT</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {settings.address}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" />
              {settings.phone}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" />
              {settings.email}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white">COMPANY PROFILE</h3>
          <p className="mt-4 text-sm text-slate-400">
            Review our background, licensing, recruitment strengths and company information.
          </p>
          <span className="mt-4 inline-flex cursor-pointer items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500/90">
            Download Profile
          </span>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        Copyright © {new Date().getFullYear()} by linkingoverseas.com | {settings.companyName} · Since {settings.since}
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Verify tsc is clean**

```bash
cd c:/projects/linking_overseasV1/Frontend
npx tsc --noEmit
```
Expected: no output, exit code 0.

- [ ] **Step 3: Verify with curl (both servers running)**

```bash
curl -s http://localhost:3000 | grep -o "Linking Overseas Ltd\|BMET RL-2081 licensed"
```
Expected: both strings present, sourced from the DB now (identical text to before, since the seed matches the old hardcoded values).

- [ ] **Step 4: Commit**

```bash
cd c:/projects/linking_overseasV1
git add Frontend/components/site-footer.tsx
git commit -m "feat: rewire site footer to read from DB-backed site settings"
```

---

### Task 5: Frontend — rewire the public site header

**Files:**
- Modify: `Frontend/components/site-header.tsx`
- Modify: `Frontend/app/(public)/layout.tsx`

**Interfaces:**
- Consumes: `getSiteSettings()`, `ISiteSettings` (`@/services/site-settings.server-services`). `SiteHeader` cannot call this directly (it's a Client Component using `usePathname()`) — the public layout fetches once and passes it down as a prop.

- [ ] **Step 1: Update SiteHeader to accept a prop instead of importing COMPANY**

Replace the full contents of `Frontend/components/site-header.tsx`:
```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Phone, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ISiteSettings } from '@/services/site-settings.server-services'

export function SiteHeader({ settings }: { settings: ISiteSettings }) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40">
      <div className="hidden bg-slate-950 text-slate-300 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5 font-medium text-orange-400">
            <ShieldCheck className="size-3.5" />
            GOVT. APPROVED RECRUITING LICENCE NO. {settings.license.replace('BMET ', '')}
          </span>
          <div className="flex items-center gap-4">
            <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white">
              <Phone className="size-3.5" /> {settings.phone}
            </a>
            <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white">
              <Mail className="size-3.5" /> {settings.email}
            </a>
          </div>
        </div>
      </div>

      <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <span className="flex size-9 items-center justify-center rounded-lg bg-slate-950 text-orange-400">
              <ShieldCheck className="size-5" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight">{settings.companyName.toUpperCase()}</span>
              <span className="text-[10px] text-muted-foreground">Since {settings.since}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer',
                  pathname === link.href && 'text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <Button
              render={<Link href="/login" />}
              className="cursor-pointer bg-orange-500 text-white hover:bg-orange-500/90"
              size="sm"
            >
              Login
            </Button>
          </div>

          <Sheet>
            <SheetTrigger
              render={<Button variant="outline" size="icon" className="cursor-pointer lg:hidden" />}
            >
              <Menu />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{settings.companyName}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={<Link href={link.href} />}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                  >
                    {link.label}
                  </SheetClose>
                ))}
              </nav>
              <div className="px-4 pb-4">
                <SheetClose
                  render={<Link href="/login" />}
                  className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500/90"
                >
                  Login
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Update the public layout to fetch and pass the prop**

Replace the full contents of `Frontend/app/(public)/layout.tsx`:
```typescript
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { getSiteSettings } from '@/services/site-settings.server-services'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
```
Note: `SiteFooter` still calls `getSiteSettings()` itself (from Task 4) rather than receiving it as a prop here — Next.js automatically dedupes identical `fetch` calls (same URL + options) made during the same render pass, so this doesn't cause a second network request. Only `SiteHeader` needs the prop, because it's a Client Component that cannot call the server-only service itself.

- [ ] **Step 3: Verify tsc is clean**

```bash
cd c:/projects/linking_overseasV1/Frontend
npx tsc --noEmit
```
Expected: no output, exit code 0.

- [ ] **Step 4: Verify with curl**

```bash
curl -s http://localhost:3000 | grep -o "GOVT. APPROVED RECRUITING LICENCE NO. RL-2081\|LINKING OVERSEAS LTD"
```
Expected: both strings present.

- [ ] **Step 5: Commit**

```bash
cd c:/projects/linking_overseasV1
git add Frontend/components/site-header.tsx "Frontend/app/(public)/layout.tsx"
git commit -m "feat: rewire site header to receive site settings as a prop"
```

---

### Task 6: Frontend — rewire homepage components (Hero, WhyChooseUs)

**Files:**
- Modify: `Frontend/app/(public)/_components/hero.tsx`
- Modify: `Frontend/app/(public)/_components/why-choose-us.tsx`

**Interfaces:**
- Consumes: `getSiteSettings()` (`@/services/site-settings.server-services`).

- [ ] **Step 1: Rewrite hero.tsx**

Replace the full contents of `Frontend/app/(public)/_components/hero.tsx`:
```typescript
import Link from 'next/link'
import { ShieldCheck, BadgeCheck, Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSiteSettings } from '@/services/site-settings.server-services'
import { PlaneSkyAnimation } from './plane-sky-animation'

export async function Hero() {
  const settings = await getSiteSettings()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <PlaneSkyAnimation />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_55%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-1.5 text-xs font-medium text-orange-300">
            <BadgeCheck className="size-4" /> {settings.license} Verified · Trusted Agency
          </span>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Hire Skilled Bangladeshi Workers for Overseas Employment
          </h1>
          <p className="max-w-lg text-base text-slate-300">
            {settings.companyName} connects Bangladeshi job seekers with verified employers across the
            GCC region through transparent screening, compliant documentation and end-to-end
            deployment support.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              render={<Link href="/curriculum-vitae" />}
              size="lg"
              className="cursor-pointer bg-orange-500 text-white hover:bg-orange-500/90"
            >
              Submit CV
            </Button>
            <Button
              render={<Link href="/hire-workers-from-bangladesh" />}
              size="lg"
              variant="outline"
              className="cursor-pointer border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Submit Employer Requirement
            </Button>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-medium text-orange-300">
              <ShieldCheck className="size-4" /> BMET Verified
            </div>
            <div className="mt-4 text-4xl font-bold tracking-tight">{settings.license.replace('BMET ', '')}</div>
            <div className="mt-1 text-sm text-slate-400">Trusted Agency</div>
            <div className="mt-6 space-y-3 border-t border-white/10 pt-4 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="size-4 text-orange-400" /> Licensed Recruitment
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Plane className="size-4 text-orange-400" /> Overseas Deployment
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Rewrite why-choose-us.tsx**

Replace the full contents of `Frontend/app/(public)/_components/why-choose-us.tsx`:
```typescript
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { getSiteSettings } from '@/services/site-settings.server-services'

export async function WhyChooseUs() {
  const settings = await getSiteSettings()

  const checklist = [
    `${settings.license} Verified`,
    'Fast Employer Response',
    'Overseas Hiring Ready',
  ]

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-2 lg:items-stretch">
        <div className="rounded-2xl bg-slate-950 p-8 text-white">
          <h2 className="text-2xl font-bold tracking-tight">Why Choose {settings.companyName}</h2>
          <p className="mt-2 text-sm text-slate-400">
            Clear company identity, licence, ethical recruitment workflow and employer-focused
            support for overseas hiring from Bangladesh.
          </p>
          <ul className="mt-6 space-y-3">
            {checklist.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-slate-200">
                <CheckCircle2 className="size-4 shrink-0 text-orange-400" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/5 p-4">
              <div className="text-xs text-slate-400">Employer Focus</div>
              <div className="mt-1 text-lg font-semibold">4 Core Layers</div>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <div className="text-xs text-slate-400">Process Position</div>
              <div className="mt-1 text-lg font-semibold">End-to-End Support</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-2xl border bg-card p-8">
          <span className="flex size-10 items-center justify-center rounded-full bg-orange-500/10 text-sm font-semibold text-orange-500">
            01
          </span>
          <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-orange-500">
            Trust Foundation
          </h3>
          <p className="mt-1 text-lg font-semibold">Licensed &amp; Verified</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {settings.license} licensed recruiting agency with visible company profile, Dhaka
            office and compliance-first positioning.
          </p>
          <Link
            href="/about"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:underline cursor-pointer"
          >
            Review Profile <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify tsc is clean**

```bash
cd c:/projects/linking_overseasV1/Frontend
npx tsc --noEmit
```
Expected: no output, exit code 0.

- [ ] **Step 4: Verify with curl**

```bash
curl -s http://localhost:3000 | grep -o "Verified · Trusted Agency\|Why Choose Linking Overseas Ltd"
```
Expected: both strings present.

- [ ] **Step 5: Commit**

```bash
cd c:/projects/linking_overseasV1
git add "Frontend/app/(public)/_components/hero.tsx" "Frontend/app/(public)/_components/why-choose-us.tsx"
git commit -m "feat: rewire homepage Hero and WhyChooseUs to DB-backed site settings"
```

---

### Task 7: Frontend — rewire About, Contact, Hire Workers pages

**Files:**
- Modify: `Frontend/app/(public)/about/page.tsx`
- Modify: `Frontend/app/(public)/contact/page.tsx`
- Modify: `Frontend/app/(public)/hire-workers-from-bangladesh/page.tsx`

**Interfaces:**
- Consumes: `getSiteSettings()` (`@/services/site-settings.server-services`).

- [ ] **Step 1: Rewrite about/page.tsx**

Replace the full contents of `Frontend/app/(public)/about/page.tsx`:
```typescript
import type { Metadata } from 'next'
import { ShieldCheck, Target, Eye, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getSiteSettings } from '@/services/site-settings.server-services'

export const metadata: Metadata = { title: 'About Us — Linking Overseas' }

export default async function AboutPage() {
  const settings = await getSiteSettings()

  const stats = [
    { label: 'BMET License', value: settings.license },
    { label: 'Established', value: settings.since },
    { label: 'GCC Destinations', value: '6+' },
    { label: 'Year 1 Placement Target', value: '50–100/mo' },
  ]

  return (
    <div className="animate-fade-in">
      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-1.5 text-xs font-medium text-orange-300">
            <ShieldCheck className="size-4" /> {settings.license} Licensed Agency
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">About {settings.companyName}</h1>
          <p className="mt-3 text-sm text-slate-300">
            A production-grade recruitment platform connecting Bangladeshi job seekers to
            employers across the GCC region since {settings.since}.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="flex flex-col gap-1">
                <span className="text-lg font-bold text-orange-500">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          <Card>
            <CardContent className="flex flex-col gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-slate-950 text-orange-400">
                <Target className="size-5" />
              </span>
              <h2 className="text-lg font-semibold">Our Mission</h2>
              <p className="text-sm text-muted-foreground">
                To connect skilled and general Bangladeshi workers with verified overseas
                employers through an ethical, transparent and fully compliant recruitment
                process — protecting both candidates and employers at every step.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-slate-950 text-orange-400">
                <Eye className="size-5" />
              </span>
              <h2 className="text-lg font-semibold">Our Vision</h2>
              <p className="text-sm text-muted-foreground">
                To become Bangladesh&apos;s most trusted BMET-licensed recruitment agency,
                recognized for zero-violation compliance and dependable, end-to-end deployment
                support across the GCC.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-14">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-slate-950 text-orange-400">
              <Building2 className="size-5" />
            </span>
            <h2 className="text-lg font-semibold">Company Profile</h2>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {settings.companyName} is a {settings.license} licensed overseas recruitment agency based in
            Dhaka, Bangladesh. We support skilled manpower recruitment, housemaid and domestic
            worker recruitment, manpower training, work visa processing, BMET clearance, and air
            ticket coordination for employers across Saudi Arabia, UAE, Qatar, Kuwait, Oman and
            Bahrain.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Registered office: {settings.address}
          </p>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite contact/page.tsx**

Replace the full contents of `Frontend/app/(public)/contact/page.tsx`:
```typescript
import type { Metadata } from 'next'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ContactForm } from './_components/contact-form'
import { FaqSection } from '@/components/faq-section'
import { getSiteSettings } from '@/services/site-settings.server-services'

export const metadata: Metadata = { title: 'Contact Us — Linking Overseas' }

export default async function ContactPage() {
  const settings = await getSiteSettings()

  const contactCards = [
    { icon: Phone, label: 'Call Us', value: settings.phone, href: `tel:${settings.phone}` },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: settings.whatsapp ?? settings.phone,
      href: `https://wa.me/${(settings.whatsapp ?? settings.phone).replace(/[^\d]/g, '')}`,
    },
    { icon: Mail, label: 'Email', value: settings.email, href: `mailto:${settings.email}` },
    { icon: MapPin, label: 'Office', value: settings.address, href: undefined },
  ]

  return (
    <div className="animate-fade-in">
      <section className="bg-slate-950 py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact {settings.companyName}</h1>
          <p className="mt-3 text-sm text-slate-300">
            Reach us via form, phone, WhatsApp or email — our Dhaka office team responds within
            one business day.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contactCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="flex flex-col gap-2">
                <span className="flex size-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                  <card.icon className="size-5" />
                </span>
                <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
                {card.href ? (
                  <a href={card.href} target={card.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-sm font-medium hover:text-orange-500 cursor-pointer">
                    {card.value}
                  </a>
                ) : (
                  <span className="text-sm font-medium">{card.value}</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <ContactForm />
        </div>
      </section>

      <FaqSection />
    </div>
  )
}
```

- [ ] **Step 3: Rewrite hire-workers-from-bangladesh/page.tsx**

Replace the full contents of `Frontend/app/(public)/hire-workers-from-bangladesh/page.tsx`:
```typescript
import type { Metadata } from 'next'
import { CheckCircle2, MessageCircle, Phone } from 'lucide-react'
import { EmployerRequirementForm } from './_components/employer-requirement-form'
import { FaqSection } from '@/components/faq-section'
import { getSiteSettings } from '@/services/site-settings.server-services'

export const metadata: Metadata = { title: 'Hire Skilled Bangladeshi Workers — Linking Overseas' }

const EMPLOYER_BENEFITS = [
  'Access to skilled, semi-skilled and domestic worker categories from Bangladesh',
  'Demand-based recruitment planning for Middle East and overseas employers',
  'Transparent communication and ethical recruitment positioning',
  'Documentation, visa processing and BMET coordination support',
  'Employer-focused follow-up from our Dhaka office team',
]

export default async function HireWorkersPage() {
  const settings = await getSiteSettings()
  const whatsapp = settings.whatsapp ?? settings.phone

  return (
    <div className="animate-fade-in">
      <section className="bg-slate-950 py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Hire Skilled Bangladeshi Workers for Your Business
          </h1>
          <p className="mt-3 text-sm text-slate-300">
            Employer benefits, demand letter process, worker categories, destinations, timeline
            and submit requirement support from Bangladesh
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <EmployerRequirementForm />
      </section>

      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-xl font-semibold">Employer Benefits</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {settings.companyName} helps foreign employers, manpower buyers and recruitment partners hire
            workers from Bangladesh through a transparent and ethical process.
          </p>
          <ul className="mt-5 space-y-2.5">
            {EMPLOYER_BENEFITS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-orange-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-xl font-semibold">Please Prepare This Information Before You Contact Us</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          To receive faster support, please prepare your company details, recruitment
          requirements, and the identity of the contact person first.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href={`https://wa.me/${whatsapp.replace(/[^\d]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 cursor-pointer"
          >
            <MessageCircle className="size-4" /> WhatsApp: {whatsapp}
          </a>
          <a
            href={`mailto:${settings.email}`}
            className="flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-muted cursor-pointer"
          >
            <Phone className="size-4" /> Email: {settings.email}
          </a>
        </div>
      </section>

      <FaqSection />
    </div>
  )
}
```

- [ ] **Step 4: Verify tsc is clean**

```bash
cd c:/projects/linking_overseasV1/Frontend
npx tsc --noEmit
```
Expected: no output, exit code 0.

- [ ] **Step 5: Verify with curl**

```bash
curl -s http://localhost:3000/about | grep -o "About Linking Overseas Ltd"
curl -s http://localhost:3000/contact | grep -o "Contact Linking Overseas Ltd"
curl -s http://localhost:3000/hire-workers-from-bangladesh | grep -o "WhatsApp: +880"
```
Expected: all three greps return a match.

- [ ] **Step 6: Commit**

```bash
cd c:/projects/linking_overseasV1
git add "Frontend/app/(public)/about/page.tsx" "Frontend/app/(public)/contact/page.tsx" "Frontend/app/(public)/hire-workers-from-bangladesh/page.tsx"
git commit -m "feat: rewire About, Contact, Hire Workers pages to DB-backed site settings"
```

---

### Task 8: Frontend — rewire the login page's company name

**Files:**
- Modify: `Frontend/app/login/page.tsx`
- Modify: `Frontend/app/login/_components/login-form.tsx`

**Interfaces:**
- Consumes: `getSiteSettings()` (`@/services/site-settings.server-services`), from the Server Component `login/page.tsx`, passed as a `companyName` prop into the Client Component `LoginForm`.

- [ ] **Step 1: Update login/page.tsx to fetch and pass the prop**

Replace the full contents of `Frontend/app/login/page.tsx` (current file is 12 lines: a `Metadata` export + a synchronous component wrapping `<LoginForm />` in a centered flex div):
```typescript
import type { Metadata } from 'next'
import { LoginForm } from './_components/login-form'
import { getSiteSettings } from '@/services/site-settings.server-services'

export const metadata: Metadata = { title: 'Staff Login — Linking Overseas' }

export default async function LoginPage() {
  const settings = await getSiteSettings()

  return (
    <div className="animate-fade-in flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-12">
      <LoginForm companyName={settings.companyName} />
    </div>
  )
}
```

- [ ] **Step 2: Update LoginForm to accept the prop**

Modify `Frontend/app/login/_components/login-form.tsx` — two changes:

1. Remove the `COMPANY` import (line 14: `import { COMPANY } from '@/lib/constants'`) and change the function signature (line 24: `export function LoginForm() {`) to:
```typescript
export function LoginForm({ companyName }: { companyName: string }) {
```

2. Replace the footer text at line 149 (`{COMPANY.name}`) with:
```typescript
{companyName}
```

- [ ] **Step 4: Verify tsc is clean**

```bash
cd c:/projects/linking_overseasV1/Frontend
npx tsc --noEmit
```
Expected: no output, exit code 0.

- [ ] **Step 5: Verify with curl**

```bash
curl -s http://localhost:3000/login | grep -o "Linking Overseas Ltd"
```
Expected: match found.

- [ ] **Step 6: Commit**

```bash
cd c:/projects/linking_overseasV1
git add Frontend/app/login
git commit -m "feat: rewire login page's company name to DB-backed site settings"
```

---

### Task 9: Frontend — admin "Site Information" settings form

**Files:**
- Create: `Frontend/app/admin/settings/_components/site-settings-form.tsx`
- Modify: `Frontend/app/admin/settings/page.tsx`

**Interfaces:**
- Consumes: `getSiteSettings()` (server, for the initial page load), `updateSiteSettings()` (client, `@/services/site-settings.services`), `ISiteSettings` (type).
- Produces: nothing further consumed by later tasks (this is the last task before verification).

- [ ] **Step 1: Create the site settings form component**

Create `Frontend/app/admin/settings/_components/site-settings-form.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateSiteSettings } from '@/services/site-settings.services'
import type { ISiteSettings } from '@/services/site-settings.server-services'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// Every field is a plain, required string (never optional/undefined) — cleared
// optional fields are submitted as '' rather than omitted, so the inferred type
// here matches `UpdateSiteSettingsInput` in site-settings.services.ts exactly.
const siteSettingsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  shortName: z.string().min(1, 'Short name is required'),
  since: z.string().min(1, 'Since year is required'),
  license: z.string().min(1, 'License is required'),
  description: z.string().min(1, 'Description is required'),
  phone: z.string().min(1, 'Phone is required'),
  phoneAlt: z.string(),
  whatsapp: z.string(),
  email: z.string().email('Enter a valid email address'),
  address: z.string().min(1, 'Address is required'),
  websiteUrl: z.string().url('Enter a valid URL').or(z.literal('')),
  whatsappUrl: z.string().url('Enter a valid URL').or(z.literal('')),
  telegramUrl: z.string().url('Enter a valid URL').or(z.literal('')),
  otherUrl: z.string().url('Enter a valid URL').or(z.literal('')),
})

type SiteSettingsValues = z.infer<typeof siteSettingsSchema>

export function SiteSettingsForm({ settings }: { settings: ISiteSettings }) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const form = useForm<SiteSettingsValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      companyName: settings.companyName,
      shortName: settings.shortName,
      since: settings.since,
      license: settings.license,
      description: settings.description,
      phone: settings.phone,
      phoneAlt: settings.phoneAlt ?? '',
      whatsapp: settings.whatsapp ?? '',
      email: settings.email,
      address: settings.address,
      websiteUrl: settings.websiteUrl ?? '',
      whatsappUrl: settings.whatsappUrl ?? '',
      telegramUrl: settings.telegramUrl ?? '',
      otherUrl: settings.otherUrl ?? '',
    },
  })

  async function onSubmit(values: SiteSettingsValues) {
    setError('')
    setSuccess(false)
    try {
      await updateSiteSettings(values)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Site Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Company Info</h3>
              <FormField control={form.control} name="companyName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="shortName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="since" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Since (Year)</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="license" render={({ field }) => (
                  <FormItem>
                    <FormLabel>BMET License</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Footer Description</FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Contact Info</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phoneAlt" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Alt)</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="whatsapp" render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Social Links (optional — leave blank to hide the icon)</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="websiteUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="whatsappUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp URL</FormLabel>
                    <FormControl><Input placeholder="https://wa.me/..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="telegramUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telegram URL</FormLabel>
                    <FormControl><Input placeholder="https://t.me/..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="otherUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Link</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">Site settings updated successfully.</p>}

            <Button type="submit" className="cursor-pointer" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Site Information'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Wire it into the Settings page**

Replace the full contents of `Frontend/app/admin/settings/page.tsx`:
```typescript
import { ChangePasswordForm } from './_components/change-password-form'
import { SiteSettingsForm } from './_components/site-settings-form'
import { getSiteSettings } from '@/services/site-settings.server-services'

export const metadata = { title: 'Settings — Admin' }

export default async function SettingsPage() {
  const settings = await getSiteSettings()

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and site settings</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <SiteSettingsForm settings={settings} />
        <ChangePasswordForm />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify tsc is clean**

```bash
cd c:/projects/linking_overseasV1/Frontend
npx tsc --noEmit
```
Expected: no output, exit code 0.

- [ ] **Step 4: Commit**

```bash
cd c:/projects/linking_overseasV1
git add Frontend/app/admin/settings
git commit -m "feat: add admin Site Information form to the Settings page"
```

---

### Task 10: End-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Restart both servers**

```bash
cd c:/projects/linking_overseasV1/Backend
npm run dev
```
```bash
cd c:/projects/linking_overseasV1/Frontend
npm run dev
```
Expected: both start with no errors.

- [ ] **Step 2: Log in and load the Settings page**

Log in at `http://localhost:3000/login` (`admin` / whatever the current password is), navigate to `http://localhost:3000/admin/settings`.
Expected: both the "Site Information" card (pre-filled with today's real values) and the "Change Password" card render.

- [ ] **Step 3: Edit and save a site setting**

Change the "Phone" field to a distinguishable test value (e.g. `+880 1999-999999`), click "Save Site Information".
Expected: "Site settings updated successfully." message appears.

- [ ] **Step 4: Verify the public site reflects the change**

Wait up to 60 seconds (the `revalidate: 60` cache window from Task 3), then:
```bash
curl -s http://localhost:3000/contact | grep -o "+880 1999-999999"
```
Expected: match found, confirming the public Contact page now reads the updated value from the database.

- [ ] **Step 5: Revert the test value**

Go back to `/admin/settings`, change "Phone" back to `+880 1XXX-XXXXXX`, save again.
Expected: success message; the public site returns to the original placeholder value once the cache window passes.

- [ ] **Step 6: Full build check on both projects**

```bash
cd c:/projects/linking_overseasV1/Backend
npx tsc --noEmit
npm run build
```
```bash
cd c:/projects/linking_overseasV1/Frontend
npx tsc --noEmit
npx next build
```
Expected: all four commands succeed with no errors.

- [ ] **Step 7: Commit the verified state**

```bash
cd c:/projects/linking_overseasV1
git add -A
git commit -m "chore: verify editable site settings end-to-end"
git push
```
