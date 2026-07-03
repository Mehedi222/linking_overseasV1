import { NextRequest, NextResponse } from 'next/server'
import { deleteExpiredCandidateFiles } from '@/server/actions/retention.actions'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await deleteExpiredCandidateFiles()
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('[POST /api/cron/retention]', error)
    return NextResponse.json({ error: 'Retention job failed' }, { status: 500 })
  }
}
