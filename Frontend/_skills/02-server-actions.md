# Skill: Server Actions

## Rule
All data mutations go through server actions. Never write to the database, upload files, or perform sensitive operations from client components.

## File Location
`server/actions/<entity>.actions.ts`

## Pattern

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createCandidate(data: CreateCandidateInput) {
  try {
    const candidate = await prisma.candidate.create({ data })
    revalidatePath('/admin/candidates')
    return { success: true, candidate }
  } catch (error) {
    console.error('[createCandidate]', error)
    throw new Error('Failed to create candidate. Please try again.')
  }
}
```

## Rules
1. Always `'use server'` at the top
2. Always wrap in `try/catch`
3. Always `console.error` with a label `[actionName]` inside catch
4. Always throw a **clean user-facing message** — never re-throw the raw error
5. Always call `revalidatePath` after any mutation
6. Never expose database errors, stack traces, or internal details to the UI

## revalidatePath — What Path to Use
- After candidate mutation → `revalidatePath('/admin/candidates')`
- After job mutation → `revalidatePath('/admin/jobs')`
- After deployment mutation → `revalidatePath('/admin/deployments')`
- After employer mutation → `revalidatePath('/employer/dashboard')`
- If mutation affects a specific record → also revalidate `revalidatePath('/admin/candidates/[id]')`

## Return Shape (consistent)
```ts
// Success
return { success: true, data: result }

// Never return error objects — throw instead
throw new Error('User-facing message here')
```

## Never Do
```ts
// WRONG — no try/catch
export async function deleteJob(id: string) {
  await prisma.job.delete({ where: { id } })
}

// WRONG — raw error exposed
catch (error) {
  throw error  // exposes DB internals
}

// WRONG — mutation in a client component
'use client'
const res = await fetch('/api/candidates', { method: 'POST', body: ... })
```
