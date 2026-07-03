import Link from 'next/link'
import { getApplicationById } from '@/server/actions/applications.actions'
import { APPLICATION_STATUS_LABELS, getStatusVariant } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ApplicationStatusForm } from '../_components/application-status-form'
import { StartDeploymentButton } from '../_components/start-deployment-button'

export const metadata = { title: 'Application — Admin' }

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const application = await getApplicationById(id)

  return (
    <div className="animate-fade-in max-w-2xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/admin/applications" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
            ← Back to Applications
          </Link>
          <h1 className="text-2xl font-bold mt-1">{application.candidate.name}</h1>
        </div>
        <Badge variant={getStatusVariant(application.status)}>{APPLICATION_STATUS_LABELS[application.status]}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidate & Job</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <span className="text-sm font-medium text-muted-foreground">Candidate</span>
            <Link
              href={`/admin/candidates/${application.candidate.id}`}
              className="col-span-2 text-sm text-primary underline-offset-4 hover:underline cursor-pointer"
            >
              {application.candidate.name}
            </Link>
          </div>
          <Separator />
          <div className="grid grid-cols-3 gap-4">
            <span className="text-sm font-medium text-muted-foreground">Job</span>
            <span className="col-span-2 text-sm">{application.job.title}</span>
          </div>
          <Separator />
          <div className="grid grid-cols-3 gap-4">
            <span className="text-sm font-medium text-muted-foreground">Employer</span>
            <span className="col-span-2 text-sm">{application.job.employer.companyName}</span>
          </div>
          <Separator />
          <div className="grid grid-cols-3 gap-4">
            <span className="text-sm font-medium text-muted-foreground">Applied</span>
            <span className="col-span-2 text-sm">{new Date(application.createdAt).toLocaleString('en-GB')}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ApplicationStatusForm
            applicationId={application.id}
            currentStatus={application.status}
            interviewNotes={application.interviewNotes}
            decisionNotes={application.decisionNotes}
          />
        </CardContent>
      </Card>

      {application.status === 'SELECTED' && !application.deployment && (
        <Card>
          <CardHeader>
            <CardTitle>Deployment</CardTitle>
          </CardHeader>
          <CardContent>
            <StartDeploymentButton applicationId={application.id} />
          </CardContent>
        </Card>
      )}

      {application.deployment && (
        <Card>
          <CardHeader>
            <CardTitle>Deployment</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/admin/deployments/${application.deployment.id}`}
              className="text-sm text-primary underline-offset-4 hover:underline cursor-pointer"
            >
              View Deployment →
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
