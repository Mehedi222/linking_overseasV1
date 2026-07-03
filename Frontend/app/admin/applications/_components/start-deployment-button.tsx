'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDeploymentFromApplication } from '@/server/actions/deployments.actions'
import { Button } from '@/components/ui/button'

export function StartDeploymentButton({ applicationId }: { applicationId: string }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleClick() {
    setError('')
    setSubmitting(true)
    try {
      const result = await createDeploymentFromApplication(applicationId)
      router.push(`/admin/deployments/${result.deployment.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button className="cursor-pointer" onClick={handleClick} disabled={submitting}>
        {submitting ? 'Starting Deployment...' : 'Start Deployment'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
