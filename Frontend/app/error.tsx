'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[RootError]', error)
  }, [error])

  return (
    <div className="animate-fade-in flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md text-center">
        <CardContent className="space-y-4 pt-6">
          <AlertTriangle className="mx-auto size-10 text-destructive" />
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. Please try again, or return to the homepage.
          </p>
          <div className="flex justify-center gap-3">
            <Button className="cursor-pointer" onClick={reset}>
              Try Again
            </Button>
            <Button variant="outline" render={<Link href="/" />} className="cursor-pointer">
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
