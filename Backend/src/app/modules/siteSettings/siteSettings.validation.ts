import { z } from 'zod'

export const updateSiteSettingsZodSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  shortName: z.string().min(1, 'Short name is required'),
  since: z.string().min(1, 'Since year is required'),
  license: z.string().min(1, 'License is required'),
  description: z.string().min(1, 'Description is required'),
  phone: z.string().min(1, 'Phone is required'),
  phoneAlt: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  email: z.string().email('Enter a valid email address'),
  address: z.string().min(1, 'Address is required'),
  websiteUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  whatsappUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  telegramUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  otherUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})
