'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { employerRequirementSchema } from '@/lib/validations'
import { RequirementStatus } from '@/lib/generated/prisma/client'

export async function submitEmployerRequirement(data: unknown) {
  const parsed = employerRequirementSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid form data. Please check all fields.')

  const { quantity, ...rest } = parsed.data

  try {
    await prisma.employerRequirement.create({
      data: {
        ...rest,
        quantity: parseInt(quantity, 10),
      },
    })

    revalidatePath('/admin/requirements')
    return { success: true }
  } catch (error) {
    console.error('[submitEmployerRequirement]', error)
    throw new Error('Failed to submit your requirement. Please try again.')
  }
}

export async function getEmployerRequirements(options?: {
  search?: string
  status?: string
  page?: number
  pageSize?: number
}) {
  const { search, status, page = 1, pageSize = 20 } = options ?? {}
  try {
    const where = {
      ...(status ? { status: status as RequirementStatus } : {}),
      ...(search
        ? {
            OR: [
              { companyName: { contains: search, mode: 'insensitive' as const } },
              { fullName: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }
    const [items, total] = await Promise.all([
      prisma.employerRequirement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.employerRequirement.count({ where }),
    ])
    return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
  } catch (error) {
    console.error('[getEmployerRequirements]', error)
    throw new Error('Failed to load requirements.')
  }
}
