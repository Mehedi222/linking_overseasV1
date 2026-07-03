'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { employerSchema } from '@/lib/validations'

export async function createEmployer(data: unknown) {
  const parsed = employerSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid form data. Please check all fields.')

  try {
    const employer = await prisma.employer.create({ data: parsed.data })
    revalidatePath('/admin/employers')
    return { success: true, employer }
  } catch (error) {
    console.error('[createEmployer]', error)
    throw new Error('Failed to create employer. Please try again.')
  }
}

export async function getEmployers() {
  try {
    return await prisma.employer.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('[getEmployers]', error)
    throw new Error('Failed to load employers.')
  }
}

export async function getEmployerById(id: string) {
  try {
    const employer = await prisma.employer.findUnique({ where: { id } })
    if (!employer) throw new Error('Employer not found.')
    return employer
  } catch (error) {
    console.error('[getEmployerById]', error)
    throw new Error('Failed to load employer.')
  }
}

export async function updateEmployer(id: string, data: unknown) {
  const parsed = employerSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid form data. Please check all fields.')

  try {
    await prisma.employer.update({ where: { id }, data: parsed.data })
    revalidatePath('/admin/employers')
    revalidatePath(`/admin/employers/${id}`)
    return { success: true }
  } catch (error) {
    console.error('[updateEmployer]', error)
    throw new Error('Failed to update employer.')
  }
}
