import 'server-only'
import { apiServer } from './api-server'
import type { Candidate } from '@/lib/generated/prisma/client'

interface GetCandidatesResult {
  items: Candidate[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getCandidates(options?: {
  search?: string
  status?: string
  page?: number
  pageSize?: number
}) {
  const params = new URLSearchParams()
  if (options?.search) params.set('search', options.search)
  if (options?.status) params.set('status', options.status)
  if (options?.page) params.set('page', String(options.page))
  if (options?.pageSize) params.set('pageSize', String(options.pageSize))

  const qs = params.toString()
  return apiServer<GetCandidatesResult>(`/candidates${qs ? `?${qs}` : ''}`)
}

export async function getCandidateById(id: string) {
  return apiServer<Candidate>(`/candidates/${id}`)
}
