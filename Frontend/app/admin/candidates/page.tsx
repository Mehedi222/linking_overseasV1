import { getCandidates } from '@/services/candidate.server-services'
import { DESTINATIONS, CANDIDATE_STATUS_LABELS, getStatusVariant } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ListSearchInput } from '@/components/admin/list-search-input'
import { ListPagination } from '@/components/admin/list-pagination'
import Link from 'next/link'

export const metadata = { title: 'Candidates — Admin' }

interface Props {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}

export default async function CandidatesPage({ searchParams }: Props) {
  const { q, status, page } = await searchParams
  const { items: candidates, total, totalPages, page: currentPage } = await getCandidates({
    search: q,
    status,
    page: page ? Number(page) : 1,
  })

  const destinationLabel = (val: string) =>
    DESTINATIONS.find((d) => d.value === val)?.label ?? val

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-sm text-muted-foreground">{total} total submissions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All CV Submissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <ListSearchInput placeholder="Search by name, phone, or email..." />
          </div>

          {candidates.length === 0 && total === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No candidates yet. Share the CV submission link with applicants.
            </p>
          ) : candidates.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No candidates match your search.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Desired Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell>{destinationLabel(c.destination)}</TableCell>
                      <TableCell>{c.desiredPosition}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(c.status)}>
                          {CANDIDATE_STATUS_LABELS[c.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(c.createdAt).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/candidates/${c.id}`}
                          className="text-sm text-primary underline-offset-4 hover:underline cursor-pointer"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ListPagination currentPage={currentPage} totalPages={totalPages} searchParams={{ q, status }} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
