import Link from 'next/link'
import { getEmployers } from '@/server/actions/employers.actions'
import { JobForm } from '../_components/job-form'

export const metadata = { title: 'Create Job — Admin' }

export default async function NewJobPage() {
  const employers = await getEmployers()

  return (
    <div className="animate-fade-in max-w-2xl space-y-6">
      <div>
        <Link href="/admin/jobs" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          ← Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold mt-1">Create Job</h1>
      </div>

      {employers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No employers yet — an employer record is needed before creating a job.
        </p>
      ) : (
        <JobForm employers={employers} />
      )}
    </div>
  )
}
