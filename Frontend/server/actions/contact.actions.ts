'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { contactMessageSchema } from '@/lib/validations'

export async function submitContactMessage(data: unknown) {
  const parsed = contactMessageSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid form data. Please check all fields.')

  try {
    await prisma.contactMessage.create({ data: parsed.data })

    revalidatePath('/admin/messages')
    return { success: true }
  } catch (error) {
    console.error('[submitContactMessage]', error)
    throw new Error('Failed to send your message. Please try again.')
  }
}

export async function getContactMessages(options?: { search?: string; page?: number; pageSize?: number }) {
  const { search, page = 1, pageSize = 20 } = options ?? {}
  try {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { subject: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}
    const [items, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contactMessage.count({ where }),
    ])
    return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
  } catch (error) {
    console.error('[getContactMessages]', error)
    throw new Error('Failed to load messages.')
  }
}
