'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { ApplicationStatus } from '@/lib/generated/prisma/client'

export async function createApplication(candidateId: string, jobId: string) {
  try {
    const application = await prisma.application.create({
      data: { candidateId, jobId },
    })
    revalidatePath('/admin/applications')
    revalidatePath(`/admin/candidates/${candidateId}`)
    return { success: true, application }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      throw new Error('This candidate has already applied to this job.')
    }
    console.error('[createApplication]', error)
    throw new Error('Failed to create application. Please try again.')
  }
}

export async function getApplications() {
  try {
    return await prisma.application.findMany({
      include: { candidate: true, job: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('[getApplications]', error)
    throw new Error('Failed to load applications.')
  }
}

export async function getApplicationById(id: string) {
  try {
    const application = await prisma.application.findUnique({
      where: { id },
      include: { candidate: true, job: { include: { employer: true } }, deployment: true },
    })
    if (!application) throw new Error('Application not found.')
    return application
  } catch (error) {
    console.error('[getApplicationById]', error)
    throw new Error('Failed to load application.')
  }
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus, notes?: string) {
  try {
    await prisma.application.update({
      where: { id },
      data: {
        status,
        ...(status === 'INTERVIEWED' ? { interviewNotes: notes } : {}),
        ...(status === 'SELECTED' || status === 'REJECTED' ? { decisionNotes: notes } : {}),
      },
    })
    revalidatePath('/admin/applications')
    revalidatePath(`/admin/applications/${id}`)
    return { success: true }
  } catch (error) {
    console.error('[updateApplicationStatus]', error)
    throw new Error('Failed to update application status.')
  }
}
