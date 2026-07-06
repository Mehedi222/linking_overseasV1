import 'server-only'
import { apiServer } from './api-server'

export interface ISiteSettings {
  id: string
  companyName: string
  shortName: string
  since: string
  license: string
  description: string
  phone: string
  phoneAlt: string | null
  whatsapp: string | null
  email: string
  address: string
  websiteUrl: string | null
  whatsappUrl: string | null
  telegramUrl: string | null
  otherUrl: string | null
}

export async function getSiteSettings() {
  return apiServer<ISiteSettings>('/site-settings', {
    next: { revalidate: 60 },
  })
}
