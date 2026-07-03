import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getDeploymentById, getValidNextMilestones } from '@/server/actions/deployments.actions'
import { MILESTONE_LABELS, getStatusVariant } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { LogMilestoneForm } from './_components/log-milestone-form'

export const metadata = { title: 'Deployment — Admin' }

export default async function DeploymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const [deployment, validNextMilestones] = await Promise.all([
    getDeploymentById(id),
    getValidNextMilestones(id),
  ])

  return (
    <div className="animate-fade-in max-w-2xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/admin/deployments" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
            ← Back to Deployments
          </Link>
          <h1 className="text-2xl font-bold mt-1">{deployment.candidate.name}</h1>
        </div>
        <Badge variant={getStatusVariant(deployment.status)}>{deployment.status.replace('_', ' ')}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deployment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <span className="text-sm font-medium text-muted-foreground">Employer</span>
            <span className="col-span-2 text-sm">{deployment.employer.companyName}</span>
          </div>
          <Separator />
          <div className="grid grid-cols-3 gap-4">
            <span className="text-sm font-medium text-muted-foreground">Job</span>
            <span className="col-span-2 text-sm">{deployment.job.title}</span>
          </div>
          <Separator />
          <div className="grid grid-cols-3 gap-4">
            <span className="text-sm font-medium text-muted-foreground">Current Phase</span>
            <span className="col-span-2 text-sm">
              {deployment.currentPhase ? MILESTONE_LABELS[deployment.currentPhase] : 'Not started'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Milestone Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {deployment.milestones.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No milestones logged yet.</p>
          ) : (
            <ul className="space-y-4">
              {deployment.milestones.map((m) => (
                <li key={m.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{MILESTONE_LABELS[m.type]}</span>
                    {m.result && (
                      <Badge variant={m.result === 'PASSED' ? 'default' : 'destructive'}>{m.result}</Badge>
                    )}
                  </div>
                  {m.notes && <p className="text-sm text-muted-foreground mt-1">{m.notes}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(m.createdAt).toLocaleString('en-GB')} · logged by {m.loggedBy.name}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            This audit trail is insert-only — milestone entries cannot be edited or removed.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log Milestone</CardTitle>
        </CardHeader>
        <CardContent>
          <LogMilestoneForm
            deploymentId={deployment.id}
            loggedById={session.user.id}
            validNextMilestones={validNextMilestones}
          />
        </CardContent>
      </Card>
    </div>
  )
}
