import { Router } from 'express'
import { checkAuth } from '../../middlewares/checkAuth'
import * as siteSettingsController from './siteSettings.controller'

const router = Router()

router.get('/', siteSettingsController.getSiteSettings)
router.patch('/', checkAuth, siteSettingsController.updateSiteSettings)

export const SiteSettingsRoutes = router
export default SiteSettingsRoutes
