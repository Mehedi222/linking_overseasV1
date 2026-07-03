import { Router } from 'express'
import { checkAuth } from '../../middlewares/checkAuth'
import * as candidateController from './candidate.controller'

const router = Router()

router.post('/', candidateController.createCandidate)
router.get('/', checkAuth, candidateController.getCandidates)
router.get('/:id', checkAuth, candidateController.getCandidateById)
router.patch('/:id/status', checkAuth, candidateController.updateCandidateStatus)

export const CandidateRoutes = router
export default CandidateRoutes
