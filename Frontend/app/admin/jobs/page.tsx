import Link from 'next/link'
import { getJobs } from '@/server/actions/jobs.actions'
import { DESTINATIONS, JOB_STATUS_LABELS, getStatusVariant } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const metadata = { title: 'Jobs — Admin' }

export default async function JobsPage() {
  const jobs = await getJobs()

  const destinationLabel = (val: string) => DESTINATIONS.find((d) => d.value === val)?.label ?? val

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-sm text-muted-foreground">{jobs.length} total jobs</p>
        </div>
        <Button render={<Link href="/admin/jobs/new" />} className="cursor-pointer">
          Create Job
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No jobs yet. Create one to start receiving applications.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Employer</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Positions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.employer.companyName}</TableCell>
                    <TableCell>{destinationLabel(job.destination)}</TableCell>
                    <TableCell>{job.positions}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(job.status)}>{JOB_STATUS_LABELS[job.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="text-sm text-primary underline-offset-4 hover:underline cursor-pointer"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
