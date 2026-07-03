import Link from 'next/link'
import { SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminNotFound() {
  return (
    <div className="animate-fade-in flex justify-center py-16">
      <Card className="max-w-md text-center">
        <CardContent className="space-y-4 pt-6">
          <SearchX className="mx-auto size-10 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Not Found</h1>
          <p className="text-sm text-muted-foreground">
            That admin page doesn&rsquo;t exist or the record may have been removed.
          </p>
          <Button render={<Link href="/admin" />} className="cursor-pointer">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
