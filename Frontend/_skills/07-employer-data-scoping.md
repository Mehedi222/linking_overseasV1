# Skill: Employer Data Scoping

## Rule
Employers can **only** see their own jobs, candidates, and deployments.
Every Prisma query in an employer context must include `employerId` as a filter.

## Getting the Employer ID from Session

```ts
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const session = await auth.api.getSession({ headers: await headers() })
const employerId = session?.user?.employerId
if (!employerId) redirect('/employer/login')
```

## Correct Query Pattern

```ts
// Always scope by employerId
const jobs = await prisma.job.findMany({
  where: { employerId: session.user.employerId },
  orderBy: { createdAt: 'desc' },
})

const deployments = await prisma.deployment.findMany({
  where: { employerId: session.user.employerId },
  include: { candidate: true, job: true },
})

// Fetching a single record — always include employerId to prevent ID enumeration
const job = await prisma.job.findFirst({
  where: {
    id: jobId,
    employerId: session.user.employerId,  // REQUIRED
  },
})
```

## Server Action Pattern (employer mutations)

```ts
'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function closeJob(jobId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.employerId) throw new Error('Unauthorized')

  try {
    // always pass employerId in WHERE — prevents employer A closing employer B's job
    const job = await prisma.job.findFirst({
      where: { id: jobId, employerId: session.user.employerId },
    })
    if (!job) throw new Error('Job not found.')

    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'CLOSED' },
    })

    revalidatePath('/employer/jobs')
    return { success: true }
  } catch (error) {
    console.error('[closeJob]', error)
    throw new Error('Failed to close job. Please try again.')
  }
}
```

## Never Do
```ts
// WRONG — no employer scoping, any employer can see all jobs
const jobs = await prisma.job.findMany()

// WRONG — fetching by ID alone allows ID enumeration
const deployment = await prisma.deployment.findUnique({
  where: { id: deploymentId },
})

// RIGHT — always scope
const deployment = await prisma.deployment.findFirst({
  where: { id: deploymentId, employerId: session.user.employerId },
})
```

## The Golden Rule
> Any Prisma query in `app/(employer)/` or in `employers.actions.ts` **must** include `employerId: session.user.employerId` in the `where` clause.
