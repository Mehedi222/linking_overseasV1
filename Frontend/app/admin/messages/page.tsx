import { getContactMessages } from '@/server/actions/contact.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ListSearchInput } from '@/components/admin/list-search-input'
import { ListPagination } from '@/components/admin/list-pagination'

export const metadata = { title: 'Contact Messages — Admin' }

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function MessagesPage({ searchParams }: Props) {
  const { q, page } = await searchParams
  const { items: messages, total, totalPages, page: currentPage } = await getContactMessages({
    search: q,
    page: page ? Number(page) : 1,
  })

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contact Messages</h1>
        <p className="text-sm text-muted-foreground">{total} total messages</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contact Submissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ListSearchInput placeholder="Search by name, email, or subject..." />

          {messages.length === 0 && total === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No contact messages yet.
            </p>
          ) : messages.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No messages match your search.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Received</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{m.email}</span>
                          {m.phone && <span className="text-xs text-muted-foreground">{m.phone}</span>}
                        </div>
                      </TableCell>
                      <TableCell>{m.subject}</TableCell>
                      <TableCell className="max-w-xs truncate">{m.message}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(m.createdAt).toLocaleDateString('en-GB')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ListPagination currentPage={currentPage} totalPages={totalPages} searchParams={{ q }} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
