'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { MILESTONE_PREREQUISITES, MILESTONES_REQUIRING_RESULT } from '@/lib/constants'
import { MilestoneResult, MilestoneType } from '@/lib/generated/prisma/client'

export async function getDeployments() {
  try {
    return await prisma.deployment.findMany({
      include: { candidate: true, employer: true, job: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('[getDeployments]', error)
    throw new Error('Failed to load deployments.')
  }
}

export async function getDeploymentStats() {
  try {
    const [total, inProgress, completed, byPhase] = await Promise.all([
      prisma.deployment.count(),
      prisma.deployment.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.deployment.count({ where: { status: 'COMPLETED' } }),
      prisma.deployment.groupBy({ by: ['currentPhase'], _count: true, where: { status: 'IN_PROGRESS' } }),
    ])
    return { total, inProgress, completed, byPhase }
  } catch (error) {
    console.error('[getDeploymentStats]', error)
    throw new Error('Failed to load deployment stats.')
  }
}

export async function getDeploymentById(id: string) {
  try {
    const deployment = await prisma.deployment.findUnique({
      where: { id },
      include: {
        candidate: true,
        employer: true,
        job: true,
        milestones: { include: { loggedBy: true }, orderBy: { createdAt: 'asc' } },
      },
    })
    if (!deployment) throw new Error('Deployment not found.')
    return deployment
  } catch (error) {
    console.error('[getDeploymentById]', error)
    throw new Error('Failed to load deployment.')
  }
}

/**
 * Returns the milestone types that are currently valid to log next, given what's
 * already been recorded for this deployment. Centralized here (rather than duplicated
 * in the UI) so the dropdown and the server-side validation always agree.
 */
export async function getValidNextMilestones(deploymentId: string) {
  try {
    const milestones = await prisma.deploymentMilestone.findMany({ where: { deploymentId } })
    const loggedTypes = new Set(milestones.map((m) => m.type))

    return (Object.keys(MILESTONE_PREREQUISITES) as MilestoneType[]).filter((type) => {
      if (loggedTypes.has(type)) return false // already logged — not a "next" step (no re-logging)
      const prerequisites = MILESTONE_PREREQUISITES[type]
      if (!prerequisites) return true
      return prerequisites.every((prereq) => {
        const match = milestones.find((m) => m.type === prereq.type)
        if (!match) return false
        if (prereq.requiresResult && match.result !== prereq.requiresResult) return false
        return true
      })
    })
  } catch (error) {
    console.error('[getValidNextMilestones]', error)
    throw new Error('Failed to determine valid next milestones.')
  }
}

export async function logMilestone(
  deploymentId: string,
  type: MilestoneType,
  loggedById: string,
  options?: { result?: MilestoneResult; notes?: string }
) {
  try {
    const existingMilestones = await prisma.deploymentMilestone.findMany({ where: { deploymentId } })

    const prerequisites = MILESTONE_PREREQUISITES[type]
    if (prerequisites) {
      for (const prereq of prerequisites) {
        const match = existingMilestones.find((m) => m.type === prereq.type)
        if (!match) {
          throw new Error(`Cannot log this milestone — "${prereq.type}" has not been logged yet.`)
        }
        // A FAILED result does not satisfy a prerequisite that requires PASSED — the
        // candidate must have a later, successful attempt logged before proceeding.
        if (prereq.requiresResult && match.result !== prereq.requiresResult) {
          throw new Error(
            `Cannot log this milestone — "${prereq.type}" must have result "${prereq.requiresResult}" first.`
          )
        }
      }
    }

    if (MILESTONES_REQUIRING_RESULT.includes(type) && !options?.result) {
      throw new Error('This milestone requires a Pass/Fail result.')
    }

    await prisma.$transaction([
      prisma.deploymentMilestone.create({
        data: {
          deploymentId,
          type,
          result: options?.result,
          notes: options?.notes,
          loggedById,
        },
      }),
      prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          currentPhase: type,
          ...(type === 'DEPARTURE_CONFIRMED' ? { status: 'COMPLETED' } : {}),
        },
      }),
    ])

    revalidatePath('/admin/deployments')
    revalidatePath(`/admin/deployments/${deploymentId}`)
    return { success: true }
  } catch (error) {
    console.error('[logMilestone]', error)
    throw error instanceof Error ? error : new Error('Failed to log milestone.')
  }
}

export async function createDeploymentFromApplication(applicationId: string) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    })
    if (!application) throw new Error('Application not found.')
    if (application.status !== 'SELECTED') {
      throw new Error('Only applications with status "Selected" can start a deployment.')
    }

    const deployment = await prisma.deployment.create({
      data: {
        candidateId: application.candidateId,
        employerId: application.job.employerId,
        jobId: application.jobId,
        applicationId: application.id,
      },
    })

    revalidatePath('/admin/deployments')
    revalidatePath(`/admin/applications/${applicationId}`)
    return { success: true, deployment }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      throw new Error('A deployment already exists for this application.')
    }
    console.error('[createDeploymentFromApplication]', error)
    throw error instanceof Error ? error : new Error('Failed to create deployment.')
  }
}
