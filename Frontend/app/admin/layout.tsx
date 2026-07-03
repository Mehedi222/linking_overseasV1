import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { LogoutButton } from '@/components/logout-button'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <nav className="border-b bg-background px-6 py-3 flex items-center gap-4">
        <span className="font-semibold text-sm">Linking Overseas — Admin</span>
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          Dashboard
        </Link>
        <Link href="/admin/candidates" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          Candidates
        </Link>
        <Link href="/admin/jobs" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          Jobs
        </Link>
        <Link href="/admin/applications" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          Applications
        </Link>
        <Link href="/admin/deployments" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          Deployments
        </Link>
        <Link href="/admin/requirements" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          Requirements
        </Link>
        <Link href="/admin/messages" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          Messages
        </Link>
        <span className="ml-auto text-sm text-muted-foreground">{session.user.name}</span>
        <LogoutButton />
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
