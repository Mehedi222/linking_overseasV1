import { Router } from 'express'
import { CandidateRoutes } from '../app/modules/candidate/candidate.route'
import { SiteSettingsRoutes } from '../app/modules/siteSettings/siteSettings.route'

const router = Router()

router.use('/candidates', CandidateRoutes)
router.use('/site-settings', SiteSettingsRoutes)

export default router
