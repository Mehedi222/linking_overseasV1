'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { Destination, JobStatus } from '@/lib/generated/prisma/client'
import { jobSchema } from '@/lib/validations'

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function getJobs() {
  try {
    return await prisma.job.findMany({
      include: { employer: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('[getJobs]', error)
    throw new Error('Failed to load jobs.')
  }
}

export async function getJobById(id: string) {
  try {
    const job = await prisma.job.findUnique({ where: { id }, include: { employer: true } })
    if (!job) throw new Error('Job not found.')
    return job
  } catch (error) {
    console.error('[getJobById]', error)
    throw new Error('Failed to load job.')
  }
}

export async function createJob(data: unknown) {
  const parsed = jobSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid form data. Please check all fields.')

  const { contractYears, positions, ageMin, ageMax, ...rest } = parsed.data
  const baseSlug = slugify(parsed.data.title)
  try {
    const job = await prisma.job.create({
      data: {
        ...rest,
        contractYears: parseInt(contractYears, 10),
        positions:     parseInt(positions, 10),
        ageMin:        parseInt(ageMin, 10),
        ageMax:        parseInt(ageMax, 10),
        slug: `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`,
      },
    })
    revalidatePath('/admin/jobs')
    return { success: true, job }
  } catch (error) {
    console.error('[createJob]', error)
    throw new Error('Failed to create job. Please try again.')
  }
}

export async function updateJob(id: string, data: unknown) {
  const parsed = jobSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid form data. Please check all fields.')

  const { contractYears, positions, ageMin, ageMax, ...rest } = parsed.data
  try {
    await prisma.job.update({
      where: { id },
      data: {
        ...rest,
        contractYears: parseInt(contractYears, 10),
        positions:     parseInt(positions, 10),
        ageMin:        parseInt(ageMin, 10),
        ageMax:        parseInt(ageMax, 10),
      },
    })
    revalidatePath('/admin/jobs')
    revalidatePath(`/admin/jobs/${id}`)
    revalidatePath('/current-overseas-jobs')
    return { success: true }
  } catch (error) {
    console.error('[updateJob]', error)
    throw new Error('Failed to update job.')
  }
}

export async function closeJob(id: string) {
  try {
    await prisma.job.update({ where: { id }, data: { status: JobStatus.CLOSED } })
    revalidatePath('/admin/jobs')
    revalidatePath(`/admin/jobs/${id}`)
    revalidatePath('/current-overseas-jobs')
    return { success: true }
  } catch (error) {
    console.error('[closeJob]', error)
    throw new Error('Failed to close job.')
  }
}

export async function getPublishedJobs(destination?: string) {
  try {
    return await prisma.job.findMany({
      where: {
        status: JobStatus.PUBLISHED,
        ...(destination ? { destination: destination as Destination } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('[getPublishedJobs]', error)
    throw new Error('Failed to load jobs.')
  }
}

export async function getFeaturedJobs(limit = 4) {
  try {
    return await prisma.job.findMany({
      where: { status: JobStatus.PUBLISHED },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  } catch (error) {
    console.error('[getFeaturedJobs]', error)
    throw new Error('Failed to load jobs.')
  }
}

export async function getJobBySlug(slug: string) {
  try {
    const job = await prisma.job.findUnique({ where: { slug } })
    if (!job) throw new Error('Job not found.')
    return job
  } catch (error) {
    console.error('[getJobBySlug]', error)
    throw new Error('Failed to load job.')
  }
}
