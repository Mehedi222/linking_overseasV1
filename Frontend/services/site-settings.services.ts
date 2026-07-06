'use client'

import { apiClient } from './api-client'
import type { ISiteSettings } from './site-settings.server-services'

// All fields are plain strings (never null/undefined) — the admin form always
// submits an empty string for a cleared optional field, never omits the key.
export interface UpdateSiteSettingsInput {
  companyName: string
  shortName: string
  since: string
  license: string
  description: string
  phone: string
  phoneAlt: string
  whatsapp: string
  email: string
  address: string
  websiteUrl: string
  whatsappUrl: string
  telegramUrl: string
  otherUrl: string
}

export async function updateSiteSettings(values: UpdateSiteSettingsInput) {
  return apiClient<ISiteSettings>('/site-settings', {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}
