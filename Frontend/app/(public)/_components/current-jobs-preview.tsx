import Link from 'next/link'
import { MapPin, Users, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getFeaturedJobs } from '@/server/actions/jobs.actions'
import { DESTINATION_LABELS } from '@/lib/constants'

export async function CurrentJobsPreview() {
  const jobs = await getFeaturedJobs(4)

  if (jobs.length === 0) return null

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Current Jobs</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Latest overseas job updates · Apply online or submit your CV for upcoming
            international opportunities
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {jobs.map((job) => (
            <Card key={job.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3">
                <Badge variant="secondary" className="w-fit">
                  {DESTINATION_LABELS[job.destination] ?? job.destination}
                </Badge>
                <h3 className="text-base font-semibold">{job.title}</h3>
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" /> {job.positions} Positions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" /> {job.contractYears} Year Contract
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" /> {job.salaryText}
                  </span>
                </div>
                <Button
                  render={<Link href={`/current-overseas-jobs/${job.slug}`} />}
                  className="mt-auto w-full cursor-pointer"
                  size="sm"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button
            render={<Link href="/current-overseas-jobs" />}
            variant="outline"
            className="cursor-pointer"
          >
            View All Current Jobs
          </Button>
        </div>
      </div>
    </section>
  )
}
