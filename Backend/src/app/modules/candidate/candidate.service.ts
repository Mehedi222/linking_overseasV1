import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../errorHelpers/AppError'
import { Destination, Gender, MaritalStatus, Religion, CandidateStatus } from '../../../generated/prisma/client'
import { createCandidateZodSchema } from './candidate.validation'
import { IGetCandidatesQuery } from './candidate.interface'

type CreateCandidateInput = z.infer<typeof createCandidateZodSchema>

export const createCandidate = async (payload: CreateCandidateInput) => {
  const {
    dateOfBirth,
    passportIssueDate,
    passportExpiryDate,
    passingYear,
    destination,
    gender,
    maritalStatus,
    religion,
    ...rest
  } = payload

  return prisma.candidate.create({
    data: {
      ...rest,
      destination: destination as Destination,
      gender: gender as Gender,
      maritalStatus: maritalStatus as MaritalStatus,
      religion: religion as Religion,
      dateOfBirth: new Date(dateOfBirth),
      passportIssueDate: passportIssueDate ? new Date(passportIssueDate) : null,
      passportExpiryDate: new Date(passportExpiryDate),
      passingYear: passingYear ? parseInt(passingYear, 10) : null,
    },
  })
}

export const getCandidates = async (query: IGetCandidatesQuery) => {
  const page = query.page ? Number(query.page) : 1
  const pageSize = query.pageSize ? Number(query.pageSize) : 20

  const where = {
    ...(query.status ? { status: query.status as CandidateStatus } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { phone: { contains: query.search, mode: 'insensitive' as const } },
            { email: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.candidate.count({ where }),
  ])

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

export const getCandidateById = async (id: string) => {
  const candidate = await prisma.candidate.findUnique({ where: { id } })
  if (!candidate) throw new AppError(404, 'Candidate not found.')
  return candidate
}

export const updateCandidateStatus = async (id: string, status: CandidateStatus, notes?: string) => {
  return prisma.candidate.update({ where: { id }, data: { status, notes } })
}
