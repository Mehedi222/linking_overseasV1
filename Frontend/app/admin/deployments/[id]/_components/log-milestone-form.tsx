'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MILESTONE_LABELS, MILESTONES_REQUIRING_RESULT } from '@/lib/constants'
import { logMilestone } from '@/server/actions/deployments.actions'
import { MilestoneType, MilestoneResult } from '@/lib/generated/prisma/client'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  deploymentId: string
  loggedById: string
  validNextMilestones: MilestoneType[]
}

export function LogMilestoneForm({ deploymentId, loggedById, validNextMilestones }: Props) {
  const router = useRouter()
  const [type, setType] = useState<MilestoneType | ''>('')
  const [result, setResult] = useState<MilestoneResult | ''>('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const needsResult = type !== '' && MILESTONES_REQUIRING_RESULT.includes(type)

  async function onSubmit() {
    if (!type) {
      setError('Select a milestone first.')
      return
    }
    if (needsResult && !result) {
      setError('This milestone requires a Pass/Fail result.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await logMilestone(deploymentId, type, loggedById, {
        result: result || undefined,
        notes: notes || undefined,
      })
      setType('')
      setResult('')
      setNotes('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (validNextMilestones.length === 0) {
    return <p className="text-sm text-muted-foreground">No further milestones can be logged right now.</p>
  }

  return (
    <div className="space-y-4">
      <Select value={type} onValueChange={(v) => setType((v as MilestoneType) ?? '')}>
        <SelectTrigger className="w-full cursor-pointer sm:w-80">
          <SelectValue placeholder="Select next milestone" />
        </SelectTrigger>
        <SelectContent>
          {validNextMilestones.map((m) => (
            <SelectItem key={m} value={m} className="cursor-pointer">
              {MILESTONE_LABELS[m]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {needsResult && (
        <Select value={result} onValueChange={(v) => setResult((v as MilestoneResult) ?? '')}>
          <SelectTrigger className="w-full cursor-pointer sm:w-48">
            <SelectValue placeholder="Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PASSED" className="cursor-pointer">Passed</SelectItem>
            <SelectItem value="FAILED" className="cursor-pointer">Failed</SelectItem>
          </SelectContent>
        </Select>
      )}

      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={2}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button className="cursor-pointer" onClick={onSubmit} disabled={submitting}>
        {submitting ? 'Logging...' : 'Log Milestone'}
      </Button>
    </div>
  )
}
