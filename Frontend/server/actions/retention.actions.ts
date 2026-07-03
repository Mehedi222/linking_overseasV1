'use server'

import { UTApi } from 'uploadthing/server'
import { prisma } from '@/lib/prisma'

const utapi = new UTApi()

const RETENTION_MONTHS = 12

// Uploadthing file URLs are shaped https://<app-id>.ufs.sh/f/<fileKey> — the schema
// only stores the full URL (not the key), so the key is recovered from the last path
// segment rather than requiring a schema change.
function fileKeyFromUrl(url: string): string | null {
  try {
    const { pathname } = new URL(url)
    const segments = pathname.split('/').filter(Boolean)
    return segments.at(-1) ?? null
  } catch {
    return null
  }
}

export async function deleteExpiredCandidateFiles() {
  try {
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS)

    const expiredCandidates = await prisma.candidate.findMany({
      where: {
        createdAt: { lt: cutoff },
        status: { not: 'DEPLOYED' },
        OR: [
          { cvResumeUrl: { not: null } },
          { photoUrl: { not: null } },
          { passportCopyUrl: { not: null } },
          { certificateUrls: { isEmpty: false } },
        ],
      },
    })

    let processed = 0
    for (const candidate of expiredCandidates) {
      const urls = [
        candidate.cvResumeUrl,
        candidate.photoUrl,
        candidate.passportCopyUrl,
        ...candidate.certificateUrls,
      ].filter((url): url is string => Boolean(url))

      const keys = urls.map(fileKeyFromUrl).filter((key): key is string => Boolean(key))
      if (keys.length > 0) {
        await utapi.deleteFiles(keys)
      }

      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { cvResumeUrl: null, photoUrl: null, passportCopyUrl: null, certificateUrls: [] },
      })
      processed++
    }

    console.log(`[deleteExpiredCandidateFiles] Processed ${processed} candidate(s).`)
    return { processed }
  } catch (error) {
    console.error('[deleteExpiredCandidateFiles]', error)
    throw new Error('Failed to run CV retention cleanup.')
  }
}
