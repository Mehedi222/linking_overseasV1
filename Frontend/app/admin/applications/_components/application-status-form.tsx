'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { APPLICATION_STATUS_LABELS } from '@/lib/constants'
import { updateApplicationStatus } from '@/server/actions/applications.actions'
import { ApplicationStatus } from '@/lib/generated/prisma/client'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  applicationId: string
  currentStatus: ApplicationStatus
  interviewNotes: string | null
  decisionNotes: string | null
}

export function ApplicationStatusForm({ applicationId, currentStatus, interviewNotes, decisionNotes }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus)
  const [notes, setNotes] = useState(
    currentStatus === 'INTERVIEWED' ? interviewNotes ?? '' : decisionNotes ?? ''
  )
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit() {
    setError('')
    setSubmitting(true)
    try {
      await updateApplicationStatus(applicationId, status, notes)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:max-w-xs">
        <Select value={status} onValueChange={(v) => setStatus(v as ApplicationStatus)}>
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value} className="cursor-pointer">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={status === 'INTERVIEWED' ? 'Interview notes' : 'Decision notes'}
        rows={3}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button className="cursor-pointer" onClick={onSubmit} disabled={submitting}>
        {submitting ? 'Saving...' : 'Update Status'}
      </Button>
    </div>
  )
}
