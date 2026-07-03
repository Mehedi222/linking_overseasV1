import Link from 'next/link'
import { getJobById } from '@/server/actions/jobs.actions'
import { getEmployers } from '@/server/actions/employers.actions'
import { JOB_STATUS_LABELS, getStatusVariant } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { JobForm } from '../_components/job-form'
import { CloseJobButton } from '../_components/close-job-button'

export const metadata = { title: 'Edit Job — Admin' }

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [job, employers] = await Promise.all([getJobById(id), getEmployers()])

  return (
    <div className="animate-fade-in max-w-2xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/admin/jobs" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
            ← Back to Jobs
          </Link>
          <h1 className="text-2xl font-bold mt-1">{job.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={getStatusVariant(job.status)}>{JOB_STATUS_LABELS[job.status]}</Badge>
          {job.status !== 'CLOSED' && <CloseJobButton jobId={job.id} />}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm employers={employers} job={job} />
        </CardContent>
      </Card>
    </div>
  )
}
