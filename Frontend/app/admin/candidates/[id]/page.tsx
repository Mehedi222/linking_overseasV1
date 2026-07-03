import { getCandidateById } from '@/services/candidate.server-services'
import { getJobs } from '@/server/actions/jobs.actions'
import { DESTINATIONS, CANDIDATE_STATUS_LABELS, getStatusVariant } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { CandidatePDFButton } from './_components/candidate-pdf-button'
import { StatusUpdateForm } from './_components/status-update-form'
import { ApplyToJobForm } from './_components/apply-to-job-form'

function fmtDate(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('en-GB') : '—'
}

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [candidate, jobs] = await Promise.all([getCandidateById(id), getJobs()])
  const openJobs = jobs.filter((job) => job.status === 'PUBLISHED')

  const destinationLabel = DESTINATIONS.find((d) => d.value === candidate.destination)?.label ?? candidate.destination

  const groups = [
    {
      title: 'Personal Information',
      fields: [
        { label: 'Full Name', value: candidate.name },
        { label: "Father's Name", value: candidate.fatherName },
        { label: "Mother's Name", value: candidate.motherName || '—' },
        { label: 'Date of Birth', value: fmtDate(candidate.dateOfBirth) },
        { label: 'Gender', value: candidate.gender },
        { label: 'Marital Status', value: candidate.maritalStatus },
        { label: 'Nationality', value: candidate.nationality },
        { label: 'Religion', value: candidate.religion },
      ],
    },
    {
      title: 'Contact Information',
      fields: [
        { label: 'Mobile Number', value: candidate.phone },
        { label: 'Email', value: candidate.email },
        { label: 'Present Address', value: candidate.presentAddress },
        { label: 'Permanent Address', value: candidate.permanentAddress || '—' },
      ],
    },
    {
      title: 'Passport Information',
      fields: [
        { label: 'Passport Number', value: candidate.passportNumber },
        { label: 'Issue Date', value: fmtDate(candidate.passportIssueDate) },
        { label: 'Expiry Date', value: fmtDate(candidate.passportExpiryDate) },
        { label: 'Place of Issue', value: candidate.passportPlaceOfIssue },
      ],
    },
    {
      title: 'Educational Qualification',
      fields: [
        { label: 'Highest Education', value: candidate.highestEducation },
        { label: 'Passing Year', value: candidate.passingYear?.toString() || '—' },
      ],
    },
    {
      title: 'Work Experience',
      fields: [
        { label: 'Desired Position', value: candidate.desiredPosition },
        { label: 'Years of Experience', value: candidate.experienceLevel },
        { label: 'Skills & Qualifications', value: candidate.skillsQualifications || '—' },
        { label: 'Previous Employer', value: candidate.previousEmployer || '—' },
      ],
    },
    {
      title: 'Job Preferences',
      fields: [
        { label: 'Preferred Country', value: destinationLabel },
        { label: 'Expected Salary', value: candidate.expectedSalary || '—' },
      ],
    },
  ]

  const documents = [
    { label: 'CV / Resume', url: candidate.cvResumeUrl },
    { label: 'Photo', url: candidate.photoUrl },
    { label: 'Passport Copy', url: candidate.passportCopyUrl },
  ].filter((d) => d.url)

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/admin/candidates" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
            ← Back to Candidates
          </Link>
          <h1 className="text-2xl font-bold mt-1">{candidate.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={getStatusVariant(candidate.status)}>
            {CANDIDATE_STATUS_LABELS[candidate.status]}
          </Badge>
          <CandidatePDFButton candidate={candidate} destinationLabel={destinationLabel} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusUpdateForm candidate={candidate} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apply to Job</CardTitle>
        </CardHeader>
        <CardContent>
          <ApplyToJobForm candidateId={candidate.id} jobs={openJobs} />
        </CardContent>
      </Card>

      {groups.map((group) => (
        <Card key={group.title}>
          <CardHeader>
            <CardTitle>{group.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {group.fields.map((f, i) => (
              <div key={f.label}>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-sm font-medium text-muted-foreground">{f.label}</span>
                  <span className="col-span-2 text-sm">{f.value}</span>
                </div>
                {i < group.fields.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {(documents.length > 0 || candidate.certificateUrls.length > 0) && (
        <Card>
          <CardHeader><CardTitle>Uploaded Documents</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {documents.map((doc) => (
              <a
                key={doc.label}
                href={doc.url ?? '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-lg border border-border bg-background px-2.5 h-8 text-sm font-medium hover:bg-muted cursor-pointer transition-colors"
              >
                {doc.label}
              </a>
            ))}
            {candidate.certificateUrls.map((url, i) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-lg border border-border bg-background px-2.5 h-8 text-sm font-medium hover:bg-muted cursor-pointer transition-colors"
              >
                Certificate {i + 1}
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {candidate.additionalInfo && (
        <Card>
          <CardHeader><CardTitle>Additional Information</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{candidate.additionalInfo}</p>
          </CardContent>
        </Card>
      )}

      {candidate.notes && (
        <Card>
          <CardHeader><CardTitle>Admin Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{candidate.notes}</p>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        Submitted on {new Date(candidate.createdAt).toLocaleString('en-GB')}
      </p>
    </div>
  )
}
