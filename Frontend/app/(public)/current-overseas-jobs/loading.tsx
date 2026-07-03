import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <Skeleton className="mx-auto h-8 w-72" />
        <Skeleton className="mx-auto mt-3 h-4 w-96 max-w-full" />
      </div>
      <div className="mt-8 flex justify-center">
        <Skeleton className="h-10 w-56" />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 pt-6">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
