'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { closeJob } from '@/server/actions/jobs.actions'
import { Button } from '@/components/ui/button'
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

export function CloseJobButton({ jobId }: { jobId: string }) {
  const router = useRouter()
  const [error, setError] = useState('')

  async function handleConfirm() {
    setError('')
    try {
      await closeJob(jobId)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" className="cursor-pointer" />}>
        Close Job
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Close this job?</AlertDialogTitle>
          <AlertDialogDescription>
            The job will no longer accept new applications and will be removed from the public listing.
            {error && <span className="block text-destructive mt-2">{error}</span>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction className="cursor-pointer" onClick={handleConfirm}>
            Close Job
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
