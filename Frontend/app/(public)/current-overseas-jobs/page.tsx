import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Users, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getPublishedJobs } from '@/server/actions/jobs.actions'
import { DESTINATION_LABELS } from '@/lib/constants'
import { DestinationFilter } from './_components/destination-filter'

export const metadata: Metadata = { title: 'Current Overseas Jobs — Linking Overseas' }

export default async function CurrentJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>
}) {
  const { destination } = await searchParams
  const jobs = await getPublishedJobs(destination)

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight">Current Overseas Jobs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse verified job listings from Linking Overseas Ltd, filtered by destination country.
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <DestinationFilter />
      </div>

      {jobs.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">
          No open positions for this destination right now. Please check back soon or{' '}
          <Link href="/curriculum-vitae" className="text-orange-500 underline cursor-pointer">
            submit your CV
          </Link>{' '}
          to be matched when new roles open.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      )}
    </div>
  )
}
