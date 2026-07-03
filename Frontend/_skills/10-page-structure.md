# Skill: Page & Route Structure

## Every Route Folder Must Have

```
app/(admin)/candidates/
├── page.tsx        # The page — server component, fetches data
├── loading.tsx     # Skeleton loading state
├── error.tsx       # Error boundary (must be 'use client')
└── _components/    # Page-specific components (prefix with _ to avoid routing)
    ├── candidate-table.tsx
    └── candidate-filters.tsx
```

## page.tsx — Template

```tsx
// app/(admin)/candidates/page.tsx
import { prisma } from '@/lib/prisma'
import { CandidateTable } from './_components/candidate-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function CandidatesPage() {
  const candidates = await prisma.candidate.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="animate-fade-in p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <CandidateTable candidates={candidates} />
        </CardContent>
      </Card>
    </div>
  )
}
```

## loading.tsx — Template

```tsx
// app/(admin)/candidates/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
```

## error.tsx — Template

```tsx
'use client'

// app/(admin)/candidates/error.tsx
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="animate-fade-in p-6 flex flex-col items-center gap-4 text-center">
      <p className="text-destructive font-medium">Something went wrong.</p>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button className="cursor-pointer" onClick={reset}>Try Again</Button>
    </div>
  )
}
```

## Route Groups Summary

| Group | Path prefix | Auth |
|---|---|---|
| `(public)` | `/` `/current-overseas-jobs` `/curriculum-vitae` `/about` `/contact` | None |
| `(admin)` | `/admin/dashboard` `/admin/candidates` `/admin/jobs` etc. | Staff session |
| `(employer)` | `/employer/dashboard` `/employer/jobs` etc. | Employer session |

## Naming Conventions
- Route folders: `kebab-case` (e.g., `current-overseas-jobs`)
- Component files: `kebab-case.tsx` (e.g., `candidate-table.tsx`)
- Page-specific components go in `_components/` inside the route folder
- Shared components go in `components/` at the root

## animate-fade-in
Add this to your global CSS or Tailwind config:
```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
```
