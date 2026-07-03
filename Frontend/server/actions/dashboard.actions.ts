'use server'

import { prisma } from '@/lib/prisma'
import { JobStatus, RequirementStatus } from '@/lib/generated/prisma/client'
import { CANDIDATE_STATUS_LABELS } from '@/lib/constants'

export async function getDashboardStats() {
  try {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const [newCandidatesToday, publishedJobs, pendingRequirements, totalMessages, statusGroups] = await Promise.all([
      prisma.candidate.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.job.count({ where: { status: JobStatus.PUBLISHED } }),
      prisma.employerRequirement.count({ where: { status: RequirementStatus.NEW } }),
      prisma.contactMessage.count(),
      prisma.candidate.groupBy({ by: ['status'], _count: true }),
    ])

    const candidatesByStatus = Object.keys(CANDIDATE_STATUS_LABELS).map((status) => ({
      status,
      label: CANDIDATE_STATUS_LABELS[status],
      count: statusGroups.find((g) => g.status === status)?._count ?? 0,
    }))

    // "Ongoing deployments" is intentionally omitted here — the Deployment model
    // doesn't exist yet (see Backend/prompt.md Phase 3). Add this stat once it lands.

    return { newCandidatesToday, publishedJobs, pendingRequirements, totalMessages, candidatesByStatus }
  } catch (error) {
    console.error('[getDashboardStats]', error)
    throw new Error('Failed to load dashboard stats.')
  }
}

type ActivityItem = {
  id: string
  type: 'candidate' | 'requirement' | 'message'
  label: string
  createdAt: Date
}

export async function getRecentActivity(limit = 10) {
  try {
    const [candidates, requirements, messages] = await Promise.all([
      prisma.candidate.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, name: true, createdAt: true },
      }),
      prisma.employerRequirement.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, companyName: true, createdAt: true },
      }),
      prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, name: true, subject: true, createdAt: true },
      }),
    ])

    const items: ActivityItem[] = [
      ...candidates.map((c) => ({
        id: c.id,
        type: 'candidate' as const,
        label: `New CV submitted by ${c.name}`,
        createdAt: c.createdAt,
      })),
      ...requirements.map((r) => ({
        id: r.id,
        type: 'requirement' as const,
        label: `New hiring requirement from ${r.companyName}`,
        createdAt: r.createdAt,
      })),
      ...messages.map((m) => ({
        id: m.id,
        type: 'message' as const,
        label: `New message from ${m.name}: ${m.subject}`,
        createdAt: m.createdAt,
      })),
    ]

    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit)
  } catch (error) {
    console.error('[getRecentActivity]', error)
    throw new Error('Failed to load recent activity.')
  }
}
