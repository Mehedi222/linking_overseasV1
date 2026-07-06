import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../errorHelpers/AppError'
import { updateSiteSettingsZodSchema } from './siteSettings.validation'

type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsZodSchema>

export const getSiteSettings = async () => {
  const settings = await prisma.siteSettings.findFirst()
  if (!settings) throw new AppError(404, 'Site settings not found. Run the seed script.')
  return settings
}

export const updateSiteSettings = async (payload: UpdateSiteSettingsInput) => {
  const existing = await prisma.siteSettings.findFirst()
  if (!existing) throw new AppError(404, 'Site settings not found. Run the seed script.')

  return prisma.siteSettings.update({
    where: { id: existing.id },
    data: {
      ...payload,
      phoneAlt: payload.phoneAlt || null,
      whatsapp: payload.whatsapp || null,
      websiteUrl: payload.websiteUrl || null,
      whatsappUrl: payload.whatsappUrl || null,
      telegramUrl: payload.telegramUrl || null,
      otherUrl: payload.otherUrl || null,
    },
  })
}
