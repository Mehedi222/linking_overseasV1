import { getEmployerRequirements } from '@/server/actions/employer-requirements.actions'
import { getStatusVariant } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ListSearchInput } from '@/components/admin/list-search-input'
import { ListPagination } from '@/components/admin/list-pagination'
import { RequirementStatusFilter } from './_components/requirement-status-filter'

export const metadata = { title: 'Employer Requirements — Admin' }

interface Props {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}

export default async function RequirementsPage({ searchParams }: Props) {
  const { q, status, page } = await searchParams
  const { items: requirements, total, totalPages, page: currentPage } = await getEmployerRequirements({
    search: q,
    status,
    page: page ? Number(page) : 1,
  })

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Employer Requirements</h1>
        <p className="text-sm text-muted-foreground">{total} total submissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Hire Worker Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <ListSearchInput placeholder="Search by company, contact, or email..." />
            <RequirementStatusFilter current={status} />
          </div>

          {requirements.length === 0 && total === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No employer requirements yet. Share the Hire Workers form link with employers.
            </p>
          ) : requirements.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No requirements match your search.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Worker Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requirements.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.companyName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{r.fullName}</span>
                          <span className="text-xs text-muted-foreground">{r.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>{r.country}</TableCell>
                      <TableCell>{r.workerType}</TableCell>
                      <TableCell>{r.quantity}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(r.createdAt).toLocaleDateString('en-GB')}
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
