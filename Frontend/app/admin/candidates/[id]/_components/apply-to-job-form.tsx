'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createApplication } from '@/server/actions/applications.actions'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Job } from '@/lib/generated/prisma/client'

export function ApplyToJobForm({ candidateId, jobs }: { candidateId: string; jobs: Job[] }) {
  const router = useRouter()
  const [jobId, setJobId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit() {
    if (!jobId) {
      setError('Select a job first.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await createApplication(candidateId, jobId)
      setJobId('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (jobs.length === 0) {
    return <p className="text-sm text-muted-foreground">No open jobs available to apply to.</p>
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Select value={jobId} onValueChange={(v) => setJobId(v ?? '')}>
        <SelectTrigger className="w-full cursor-pointer sm:w-72">
          <SelectValue placeholder="Select a job" />
        </SelectTrigger>
        <SelectContent>
          {jobs.map((job) => (
            <SelectItem key={job.id} value={job.id} className="cursor-pointer">
              {job.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button className="cursor-pointer" onClick={onSubmit} disabled={submitting}>
        {submitting ? 'Applying...' : 'Apply to Job'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
