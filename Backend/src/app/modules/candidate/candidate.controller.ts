import { catchAsync } from '../../shared/catchAsync'
import { sendResponse } from '../../shared/sendResponse'
import { createCandidateZodSchema, updateCandidateStatusZodSchema } from './candidate.validation'
import * as candidateService from './candidate.service'
import { AppError } from '../../errorHelpers/AppError'

export const createCandidate = catchAsync(async (req, res) => {
  const parsed = createCandidateZodSchema.safeParse(req.body)
  if (!parsed.success) throw new AppError(400, 'Invalid form data. Please check all fields.')

  const candidate = await candidateService.createCandidate(parsed.data)
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'CV submitted successfully.',
    data: candidate,
  })
})

export const getCandidates = catchAsync(async (req, res) => {
  const result = await candidateService.getCandidates(req.query)
  sendResponse(res, { statusCode: 200, success: true, message: 'Candidates retrieved.', data: result })
})

export const getCandidateById = catchAsync(async (req, res) => {
  const candidate = await candidateService.getCandidateById(req.params.id as string)
  sendResponse(res, { statusCode: 200, success: true, message: 'Candidate retrieved.', data: candidate })
})

export const updateCandidateStatus = catchAsync(async (req, res) => {
  const parsed = updateCandidateStatusZodSchema.safeParse(req.body)
  if (!parsed.success) throw new AppError(400, 'Invalid status update.')

  const candidate = await candidateService.updateCandidateStatus(
    req.params.id as string,
    parsed.data.status,
    parsed.data.notes
  )
  sendResponse(res, { statusCode: 200, success: true, message: 'Status updated.', data: candidate })
})
