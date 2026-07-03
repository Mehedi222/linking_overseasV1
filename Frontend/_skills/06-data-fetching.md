# Skill: Data Fetching & Component Model

## Rule
Server components by default. Only add `'use client'` when the component needs:
- User interaction (onClick, onChange, etc.)
- React hooks (useState, useEffect, useRef)
- Browser APIs (window, localStorage, etc.)

## Server Component Pattern (default)

```tsx
// app/(admin)/candidates/page.tsx
import { prisma } from '@/lib/prisma'
import { CandidateTable } from './_components/candidate-table'

export default async function CandidatesPage() {
  const candidates = await prisma.candidate.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="animate-fade-in p-6 space-y-6">
      <CandidateTable candidates={candidates} />
    </div>
  )
}
```

## Client Component Pattern (only when needed)

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function CandidateActions({ candidateId }: { candidateId: string }) {
  const [loading, setLoading] = useState(false)
  // ...
}
```

## Loading State — `loading.tsx`
Every route folder must have a `loading.tsx` using shadcn Skeleton:

```tsx
// app/(admin)/candidates/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function CandidatesLoading() {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
```

## Error State — `error.tsx`
Every route folder must have an `error.tsx`:

```tsx
'use client'

// app/(admin)/candidates/error.tsx
export default function CandidatesError({ error, reset }: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="p-6 flex flex-col items-center gap-4">
      <p className="text-destructive">Something went wrong loading candidates.</p>
      <Button className="cursor-pointer" onClick={reset}>Try Again</Button>
    </div>
  )
}
```

## Rules
- Fetch data directly in server components with Prisma — no separate API routes needed
- Never use `useEffect` to fetch data — use server components instead
- Never `fetch('/api/...')` from client components for data reads — read in the server component and pass as props
- `loading.tsx` and `error.tsx` are **required** in every route folder
- Always call `revalidatePath` in server actions after mutations — this re-triggers server component data fetch
