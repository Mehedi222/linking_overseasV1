'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[AdminError]', error)
  }, [error])

  return (
    <div className="animate-fade-in flex justify-center py-16">
      <Card className="max-w-md text-center">
        <CardContent className="space-y-4 pt-6">
          <AlertTriangle className="mx-auto size-10 text-destructive" />
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            This admin page hit an unexpected error. You can try again below.
          </p>
          <Button className="cursor-pointer" onClick={reset}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
