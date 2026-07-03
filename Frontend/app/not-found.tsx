import Link from 'next/link'
import { SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = { title: 'Page Not Found — Linking Overseas' }

export default function NotFound() {
  return (
    <div className="animate-fade-in flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md text-center">
        <CardContent className="space-y-4 pt-6">
          <SearchX className="mx-auto size-10 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Page Not Found</h1>
          <p className="text-sm text-muted-foreground">
            The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.
          </p>
          <Button render={<Link href="/" />} className="cursor-pointer">
            Go Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
