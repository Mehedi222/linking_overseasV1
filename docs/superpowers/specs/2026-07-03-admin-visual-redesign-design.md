# Admin Dashboard Visual Redesign — Design

## Context

The admin section (`Frontend/app/admin/`) is currently plain shadcn `Card`+`Table` everywhere, with a single horizontal nav bar (no sidebar, no header/footer separation). The public site already has a more polished look (dark hero, animated plane background, Trust Grid icon-badge cards). The user asked for "world best design" visual polish, scoped down (per brainstorming) to: **admin dashboard first, visual/layout only, no feature changes, no reference site — Claude to propose the direction.**

Two visual directions were presented; the user chose **Option A — Refined Light**: elevate the existing light theme with consistent icon-badge accents (reusing the pattern already proven on the Dashboard's stat cards and the public site's Trust Grid), rather than importing the login page's dark/gradient premium look into admin wholesale.

This spec also folds in the sidebar/header/footer shell redesign discussed earlier in the same conversation (logo + vertical nav sidebar, header with page title + user menu, sticky footer, mobile hamburger) — building it once alongside the visual refresh rather than as two separate passes.

## Non-Goals

- No new features, no new data, no new navigation destinations beyond what exists today (Dashboard, Candidates, Jobs, Applications, Deployments, Requirements, Messages, Settings)
- No changes to the public site (homepage, job listings, CV form, etc.) — out of scope for this spec
- No changes to the login page's existing dark-gradient look — it stays as its own distinct style, reserved for auth-only pages, per the project's existing convention
- No changes to any server action, API route, or data model — this is `className`/JSX-structure only

## Architecture: The Shell

Replaces the single `<nav>` bar in `app/admin/layout.tsx` with a CSS Grid "holy grail" dashboard shell:

- **Desktop (`md:` and up):** two-column grid. Left column: fixed-width sidebar, full viewport height, independently scrollable if the nav list ever overflows. Right column: `grid-rows-[auto_1fr_auto]` sized to full viewport height — header row, scrollable content row, footer row. This means the footer sits at the bottom of the viewport when content is short, and gets pushed down (with the content area scrolling on its own) when content is tall — the sidebar never moves either way.
- **Mobile (below `md:`):** sidebar collapses into a hamburger menu using the shadcn `Sheet` component (already installed and used elsewhere in the app) — tapping it slides the same nav list in from the left. Header becomes a single row (hamburger + page title). Footer remains sticky.

### Sidebar contents
- Company name/logo at top (reuse `COMPANY.shortName` from `lib/constants.ts`)
- Vertical nav list, one lucide icon per item, same 8 destinations as today (7 existing + Settings, already added): `LayoutDashboard` (Dashboard), `Users` (Candidates), `Briefcase` (Jobs), `ClipboardList` (Applications), `Plane` (Deployments), `Building2` (Requirements), `MessageSquare` (Messages), `Settings` (Settings)

### Header contents
- Left: current page's title, derived from a static route → label lookup map (e.g. `/admin/candidates` → "Candidates") — no new prop threading through every page needed
- Right: shadcn `Avatar` (already installed) showing the user's initials, name next to it, opening a `DropdownMenu` (already installed) with "Settings" and "Log Out" — replaces the current bare "Logout" button + plain name text

### Footer contents
- Simple centered copyright line: `© {year} {COMPANY.name}`

## Design System (applied consistently across every admin page)

- **Icon badges:** `flex size-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600` — the exact pattern already used on the Dashboard's stat cards and the public site's Trust Grid cards. Applied to: every list page's card header (small icon next to the "All X" title), every empty state (larger version, centered), the Settings page's card header.
- **Typography:** page titles `text-2xl font-bold` (unchanged from today), section headers `text-lg font-semibold`, descriptions `text-sm text-muted-foreground` (unchanged) — codifying what's already mostly consistent, fixing the few pages that drift from it.
- **Cards:** add `transition-shadow hover:shadow-md` (already used on the public Trust Grid cards) to admin Cards that represent discrete items; static wrapper Cards (e.g. a list's outer Card) keep a plain subtle shadow, no hover effect.
- **Empty states:** every "No X yet." message becomes icon (muted, size-10, centered) + heading + the existing description text, instead of a single bare paragraph.
- **Tables:** add `hover:bg-muted/50` row highlighting; no column/data changes.
- **Status badges:** unchanged — `getStatusVariant()` already provides consistent coloring.

## Phasing

1. **Phase 1 — Shell + 2 representative pages.** Build the sidebar/header/footer shell (replacing `app/admin/layout.tsx`), then apply the full design system to the **Dashboard** (`app/admin/page.tsx`) and **Settings** (`app/admin/settings/`) pages. This proves every pattern (icon badges, typography, card treatment, the header's user dropdown) before touching the rest.
2. **Phase 2 — Roll out to remaining pages.** Apply the same established patterns (from Phase 1) to: Candidates (list + detail), Jobs (list + detail + new), Applications (list + detail), Deployments (list + detail), Requirements, Messages. Mechanical repetition of Phase 1's proven pattern — each page gets: icon badge on its card header, upgraded empty state, row-hover on its table, consistent typography. No new component types needed beyond what Phase 1 builds.

## Files touched (representative, not exhaustive — Phase 2 repeats the same shape across the remaining pages)

**New:**
- `components/admin/admin-sidebar.tsx` — desktop sidebar (logo + nav list)
- `components/admin/admin-nav-links.tsx` — the 8 nav links, shared between desktop sidebar and mobile sheet
- `components/admin/mobile-admin-sidebar.tsx` — client component, hamburger trigger + `Sheet` wrapping `AdminNavLinks`
- `components/admin/admin-header.tsx` — page title + user avatar/dropdown (client component, needs the dropdown's open state and `usePathname()` for the title lookup)
- `components/admin/admin-footer.tsx` — copyright line
- `lib/admin-nav.ts` — shared route→{label, icon} map, used by both the sidebar (for link labels/icons) and the header (for the current page title)

**Modified:**
- `app/admin/layout.tsx` — rewritten to compose the grid shell instead of the single nav bar; session-check/redirect logic unchanged
- `app/admin/page.tsx` (Dashboard) — icon badges on stat cards refined to the codified pattern, empty-state pattern applied to the activity feed if empty
- `app/admin/settings/_components/change-password-form.tsx` — icon badge header added to the Card, consistent with the design system (this was the specific ask that kicked off this whole redesign)

Phase 2 will touch the remaining 9 pages' `page.tsx` files with the equivalent, already-proven changes.

## Testing / Verification

- No automated test suite exists in this project (established convention) — verification is `tsc --noEmit`, `next build`, and manual browser checks at both desktop and mobile widths
- Confirm the shell's sticky-footer behavior at both a short page (Settings) and a long page (a list with many rows) to verify the grid-rows behavior works as intended
- Confirm the mobile hamburger menu opens/closes and its links navigate correctly
- Confirm no data/functionality regressed on any touched page (this is the "don't change any feature" constraint — a quick pass through each touched page's existing actions: e.g. Settings' password change still works, Dashboard's stats still show real numbers)
