# Editable Site Settings — Design

## Context

Company info, contact details, and social links are currently hardcoded in `Frontend/lib/constants.ts`'s `COMPANY` object (`name`, `shortName`, `since`, `license`, `phone`, `phoneAlt`, `whatsapp`, `email`, `address`), used across 8 public-facing files. The footer also has 4 social icons (Globe, chat, Send/Telegram, Link) that are currently pure decoration — `<span>` elements with no `href` at all.

The user wants to edit this information from the admin Settings page instead of it being hardcoded, so changes (address, phone, license number, social links, etc.) don't require a code deploy.

This is a distinct feature from the admin visual redesign spec (`2026-07-03-admin-visual-redesign-design.md`) — different scope (new data model + Backend module + public read-path change vs. pure visual/layout polish) — and gets its own implementation plan.

## Confirmed Scope

- **Editable:** company name, short name, "since" year, BMET license number, footer description paragraph, phone, phone alt, WhatsApp number, email, address, and 4 social URLs (website, WhatsApp-link, Telegram, other/generic link)
- **Not editable:** the footer's "EXPLORE" navigation links (Home, Current Jobs, Hire Workers, Submit CV, Our Team, About Us, Contact) — these stay as fixed site navigation (`NAV_LINKS` in `lib/constants.ts`, untouched)
- **Icon behavior change:** each social icon only renders if its corresponding URL is set (non-empty) — today all 4 render unconditionally with no destination

## Data Model (Backend)

New singleton table (one row, always present — seeded at migration time):

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

Seeded once with today's real `COMPANY` object values (from `lib/constants.ts`) as part of the migration/seed step — the public site must never render with zero rows.

## Backend Module

Follows the same five-file pattern as every other Backend module (`candidate`, ready to extend to `job`/`employer`/etc. per `Backend/prompt.md`):

- `siteSettings.interface.ts`, `siteSettings.validation.ts` (Zod schema for the editable fields — `email` validated as email, URLs validated as URL-or-empty-string)
- `siteSettings.service.ts`: `getSiteSettings()` (finds the one row), `updateSiteSettings(payload)` (updates it)
- `siteSettings.controller.ts`, `siteSettings.route.ts`:
  - `GET /site-settings` — **public, no `checkAuth`** (every visitor's page load needs this)
  - `PATCH /site-settings` — **`checkAuth` required**

## Frontend

- `services/site-settings.server-services.ts` (server-only, `import 'server-only'`): `getSiteSettings()`, fetched with `next: { revalidate: 60 }` (short cache — this data changes rarely, no need to hit the Backend on every single public page load, but also no need to build a full on-demand-revalidation webhook for an MVP)
- `services/site-settings.services.ts` (client-safe): `updateSiteSettings(payload)`, used by the new admin form
- **Rewire 8 files** from `import { COMPANY } from '@/lib/constants'` to `await getSiteSettings()`: `app/(public)/about/page.tsx`, `app/(public)/contact/page.tsx`, `app/(public)/hire-workers-from-bangladesh/page.tsx`, `app/(public)/_components/hero.tsx`, `app/(public)/_components/why-choose-us.tsx`, `components/site-footer.tsx`, `components/site-header.tsx` — all are (or become) Server Components, so this is a straightforward `await` addition
- `app/login/page.tsx` (already a Server Component) fetches site settings and passes `companyName` down as a prop to the client `LoginForm`, since a Client Component can't call `getSiteSettings()` (server-only) directly
- `components/site-footer.tsx`'s social icon row: each of the 4 icons becomes a conditionally-rendered `<a href={...}>` (only rendered when its URL field is non-empty) instead of an unconditional decorative `<span>`

## Admin UI

New "Site Information" card on `app/admin/settings/page.tsx`, alongside the existing "Change Password" card, grouped into three sections within one form:
- **Company Info:** company name, short name, since year, license number, description (textarea)
- **Contact Info:** phone, phone alt, WhatsApp number, email, address (textarea)
- **Social Links:** website URL, WhatsApp URL, Telegram URL, other URL (all optional)

Pre-filled with current values (fetched server-side in the Settings page, passed to a client form component, same pattern as the existing `ChangePasswordForm`). On save, calls `updateSiteSettings()` and shows the same inline success/error pattern already established.

## Testing / Verification

- No automated test suite (established project convention) — verify via `tsc --noEmit`, `next build`, and manual checks
- Confirm the Backend seed creates exactly one `SiteSettings` row with today's real values before any Frontend page relies on it
- Confirm all 8 rewired public files still render correctly with the seeded data (values should look identical to today's hardcoded `COMPANY` values immediately after migration)
- Confirm editing a field in the admin form and saving updates the public site's footer/pages within the 60s cache window
- Confirm a social URL left empty does not render that icon at all (not a dead link)
- Confirm the `GET /site-settings` endpoint truly requires no auth (public pages must load for anonymous visitors) and `PATCH /site-settings` truly requires it (a logged-out request must be rejected)
