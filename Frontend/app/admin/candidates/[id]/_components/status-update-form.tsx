'use client'

import { useState } from 'react'
import type { Candidate } from '@/lib/generated/prisma/client'
import { CANDIDATE_STATUS_LABELS } from '@/lib/constants'
import { updateCandidateStatus } from '@/server/actions/candidates.actions'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function StatusUpdateForm({ candidate }: { candidate: Candidate }) {
  const [status, setStatus] = useState(candidate.status)
  const [notes, setNotes] = useState(candidate.notes ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirm() {
    setError('')
    setSubmitting(true)
    try {
      await updateCandidateStatus(candidate.id, status, notes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:max-w-xs">
        <Select value={status} onValueChange={(v) => setStatus(v as Candidate['status'])}>
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CANDIDATE_STATUS_LABELS).map(([value, label]) => (
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
        placeholder="Admin notes (optional)"
        rows={3}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <AlertDialog>
        <AlertDialogTrigger render={<Button className="cursor-pointer" disabled={submitting} />}>
          {submitting ? 'Saving...' : 'Update Status'}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm status change</AlertDialogTitle>
            <AlertDialogDescription>
              Set {candidate.name}&rsquo;s status to &ldquo;{CANDIDATE_STATUS_LABELS[status]}&rdquo;? This will be
              visible immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction className="cursor-pointer" onClick={handleConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
