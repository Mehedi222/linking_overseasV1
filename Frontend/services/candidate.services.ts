'use client'

import { apiClient } from './api-client'
import type { CVSubmissionValues } from '@/lib/validations'
import type { Candidate } from '@/lib/generated/prisma/client'

export async function submitCV(values: CVSubmissionValues) {
  return apiClient<Candidate>('/candidates', {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export async function updateCandidateStatus(id: string, status: Candidate['status'], notes?: string) {
  return apiClient<Candidate>(`/candidates/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  })
}
