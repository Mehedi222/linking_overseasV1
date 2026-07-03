import Link from 'next/link'
import { getApplications } from '@/server/actions/applications.actions'
import { APPLICATION_STATUS_LABELS, getStatusVariant } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const metadata = { title: 'Applications — Admin' }

export default async function ApplicationsPage() {
  const applications = await getApplications()

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Applications</h1>
        <p className="text-sm text-muted-foreground">{applications.length} total applications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No applications yet. Applications are created from a candidate&rsquo;s detail page.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.candidate.name}</TableCell>
                    <TableCell>{app.job.title}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(app.status)}>{APPLICATION_STATUS_LABELS[app.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(app.createdAt).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/applications/${app.id}`}
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
