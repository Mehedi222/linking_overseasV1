import Link from 'next/link'
import { getDeployments, getDeploymentStats } from '@/server/actions/deployments.actions'
import { MILESTONE_LABELS, getStatusVariant } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const metadata = { title: 'Deployments — Admin' }

export default async function DeploymentsPage() {
  const [deployments, stats] = await Promise.all([getDeployments(), getDeploymentStats()])

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deployments</h1>
        <p className="text-sm text-muted-foreground">{deployments.length} total deployments</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Deployments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{stats.inProgress}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          {deployments.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No deployments yet. Deployments are started from a selected application.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Employer</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Current Phase</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deployments.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.candidate.name}</TableCell>
                    <TableCell>{d.employer.companyName}</TableCell>
                    <TableCell>{d.job.title}</TableCell>
                    <TableCell>{d.currentPhase ? MILESTONE_LABELS[d.currentPhase] : 'Not started'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(d.status)}>{d.status.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/deployments/${d.id}`}
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
