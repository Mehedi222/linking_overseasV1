import { catchAsync } from '../../shared/catchAsync'
import { sendResponse } from '../../shared/sendResponse'
import { AppError } from '../../errorHelpers/AppError'
import { updateSiteSettingsZodSchema } from './siteSettings.validation'
import * as siteSettingsService from './siteSettings.service'

export const getSiteSettings = catchAsync(async (_req, res) => {
  const settings = await siteSettingsService.getSiteSettings()
  sendResponse(res, { statusCode: 200, success: true, message: 'Site settings retrieved.', data: settings })
})

export const updateSiteSettings = catchAsync(async (req, res) => {
  const parsed = updateSiteSettingsZodSchema.safeParse(req.body)
  if (!parsed.success) throw new AppError(400, 'Invalid site settings data. Please check all fields.')

  const settings = await siteSettingsService.updateSiteSettings(parsed.data)
  sendResponse(res, { statusCode: 200, success: true, message: 'Site settings updated.', data: settings })
})
