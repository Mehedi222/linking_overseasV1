import { Router } from 'express'
import { CandidateRoutes } from '../app/modules/candidate/candidate.route'

const router = Router()

router.use('/candidates', CandidateRoutes)

export default router
