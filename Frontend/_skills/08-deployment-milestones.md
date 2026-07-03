# Skill: Deployment Milestones

## Rules
1. Milestone entries are **insert-only** — no update, no delete, ever
2. Milestone order is **enforced** — cannot skip ahead without prerequisites
3. Every entry records: who entered it, when, and the result
4. This is the BMET audit trail — it is non-negotiable

## Milestone Order & Gate Conditions

```ts
// lib/constants.ts
export const MILESTONES = [
  { key: 'MEDICAL_SCHEDULED',        label: 'Medical Exam Scheduled',     requires: [] },
  { key: 'MEDICAL_COMPLETED',        label: 'Medical Exam Completed',     requires: ['MEDICAL_SCHEDULED'] },
  { key: 'POLICE_SUBMITTED',         label: 'Police Clearance Submitted', requires: [] },
  { key: 'POLICE_VERIFIED',          label: 'Police Clearance Verified',  requires: ['POLICE_SUBMITTED'] },
  { key: 'BMET_SUBMITTED',           label: 'BMET Clearance Submitted',   requires: ['MEDICAL_COMPLETED', 'POLICE_VERIFIED'] },
  { key: 'BMET_APPROVED',            label: 'BMET Clearance Approved',    requires: ['BMET_SUBMITTED'] },
  { key: 'VISA_SUBMITTED',           label: 'Visa Submitted',             requires: ['BMET_APPROVED'] },
  { key: 'VISA_APPROVED',            label: 'Visa Approved',              requires: ['VISA_SUBMITTED'] },
  { key: 'VISA_STAMPED',             label: 'Visa Stamped',               requires: ['VISA_APPROVED'] },
  { key: 'FLIGHT_BOOKED',            label: 'Flight Booked',              requires: ['VISA_STAMPED'] },
  { key: 'DEPARTURE_CONFIRMED',      label: 'Departure Confirmed',        requires: ['FLIGHT_BOOKED'] },
] as const

export type MilestoneKey = typeof MILESTONES[number]['key']
```

## Server Action — Log a Milestone

```ts
// server/actions/deployments.actions.ts
'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { MILESTONES, type MilestoneKey } from '@/lib/constants'

export async function logMilestone(deploymentId: string, milestone: MilestoneKey, notes?: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')

  try {
    // 1. Get existing milestones for this deployment
    const existing = await prisma.deploymentMilestone.findMany({
      where: { deploymentId },
      select: { milestone: true },
    })
    const completed = new Set(existing.map((m) => m.milestone))

    // 2. Check gate conditions
    const definition = MILESTONES.find((m) => m.key === milestone)
    if (!definition) throw new Error('Unknown milestone.')

    for (const required of definition.requires) {
      if (!completed.has(required)) {
        throw new Error(`Cannot log "${definition.label}" — "${required}" is not yet completed.`)
      }
    }

    // 3. Check not already logged
    if (completed.has(milestone)) {
      throw new Error(`Milestone "${definition.label}" is already logged.`)
    }

    // 4. Insert — never update, never delete
    await prisma.deploymentMilestone.create({
      data: {
        deploymentId,
        milestone,
        notes: notes ?? null,
        loggedById: session.user.id,
        loggedAt: new Date(),
      },
    })

    revalidatePath(`/admin/deployments/${deploymentId}`)
    return { success: true }
  } catch (error) {
    console.error('[logMilestone]', error)
    if (error instanceof Error) throw error
    throw new Error('Failed to log milestone. Please try again.')
  }
}
```

## Prisma Schema (DeploymentMilestone)

```prisma
model DeploymentMilestone {
  id           String     @id @default(cuid())
  deploymentId String
  deployment   Deployment @relation(fields: [deploymentId], references: [id])
  milestone    String     // MilestoneKey
  notes        String?
  loggedById   String
  loggedBy     User       @relation(fields: [loggedById], references: [id])
  loggedAt     DateTime   @default(now())

  @@index([deploymentId])
}
```

## Never Do
```ts
// WRONG — editing an existing milestone
await prisma.deploymentMilestone.update({ where: { id }, data: { notes: '...' } })

// WRONG — deleting a milestone
await prisma.deploymentMilestone.delete({ where: { id } })

// WRONG — logging without checking prerequisites
await prisma.deploymentMilestone.create({ data: { milestone: 'BMET_APPROVED', ... } })
```

## Display — Timeline Component
Show milestones as an ordered list with timestamps and who logged each:
```tsx
{milestones.map((m) => (
  <div key={m.id} className="flex gap-3">
    <Badge variant="default">{m.milestone}</Badge>
    <span className="text-sm text-muted-foreground">
      {format(m.loggedAt, 'dd MMM yyyy HH:mm')} — {m.loggedBy.name}
    </span>
  </div>
))}
```
