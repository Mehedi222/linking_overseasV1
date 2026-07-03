import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MapPin, Users, Clock, Calendar, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getJobBySlug } from '@/server/actions/jobs.actions'
import { DESTINATION_LABELS } from '@/lib/constants'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  try {
    const job = await getJobBySlug(id)
    return { title: `${job.title} — Linking Overseas` }
  } catch {
    return { title: 'Job Not Found — Linking Overseas' }
  }
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const job = await getJobBySlug(id).catch(() => null)
  if (!job) notFound()

  const requirements = job.requirements.split('\n').filter(Boolean)

  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 py-12">
      <Badge variant="secondary" className="w-fit">
        {DESTINATION_LABELS[job.destination] ?? job.destination}
      </Badge>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">{job.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{job.jobType}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card size="sm">
          <CardContent className="flex flex-col items-center gap-1 text-center">
            <Users className="size-4 text-orange-500" />
            <span className="text-sm font-semibold">{job.positions}</span>
            <span className="text-xs text-muted-foreground">Positions</span>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex flex-col items-center gap-1 text-center">
            <Clock className="size-4 text-orange-500" />
            <span className="text-sm font-semibold">{job.contractYears} Year</span>
            <span className="text-xs text-muted-foreground">Contract</span>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex flex-col items-center gap-1 text-center">
            <Calendar className="size-4 text-orange-500" />
            <span className="text-sm font-semibold">{job.ageMin}–{job.ageMax}</span>
            <span className="text-xs text-muted-foreground">Age Range</span>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex flex-col items-center gap-1 text-center">
            <MapPin className="size-4 text-orange-500" />
            <span className="text-sm font-semibold">{job.salaryText}</span>
            <span className="text-xs text-muted-foreground">Salary</span>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Key Requirements</h2>
        <ul className="mt-3 space-y-2">
          {requirements.map((req, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-orange-500" />
              {req}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button render={<Link href="/curriculum-vitae" />} className="cursor-pointer">
          Apply — Submit Your CV
        </Button>
        <Button render={<Link href="/current-overseas-jobs" />} variant="outline" className="cursor-pointer">
          Back to All Jobs
        </Button>
      </div>
    </div>
  )
}
