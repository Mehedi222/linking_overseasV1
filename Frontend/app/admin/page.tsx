import Link from 'next/link'
import { Briefcase, Building2, FileText, Mail, MessagesSquare, Users } from 'lucide-react'
import { getDashboardStats, getRecentActivity } from '@/server/actions/dashboard.actions'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = { title: 'Dashboard — Admin' }

const STAT_CARDS = [
  { key: 'newCandidatesToday', label: 'New CVs Today', icon: FileText, color: 'bg-orange-100 text-orange-600' },
  { key: 'publishedJobs', label: 'Published Jobs', icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
  { key: 'pendingRequirements', label: 'Pending Requirements', icon: Building2, color: 'bg-amber-100 text-amber-600' },
  { key: 'totalMessages', label: 'Total Messages', icon: Mail, color: 'bg-emerald-100 text-emerald-600' },
] as const

const QUICK_ACTIONS = [
  { label: 'Candidates', href: '/admin/candidates', icon: Users },
  { label: 'Requirements', href: '/admin/requirements', icon: Building2 },
  { label: 'Messages', href: '/admin/messages', icon: MessagesSquare },
] as const

export default async function AdminDashboardPage() {
  const [stats, activity] = await Promise.all([getDashboardStats(), getRecentActivity()])

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of candidates, jobs, and inbound activity</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((s) => (
          <Card key={s.key}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats[s.key]}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold">Candidates by Status</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {stats.candidatesByStatus.map((s) => (
              <div key={s.status} className="text-center">
                <p className="text-xl font-bold">{s.count}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
            {activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No recent activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {activity.map((item) => (
                  <li
                    key={`${item.type}-${item.id}`}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-sm">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
            <div className="space-y-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm hover:bg-muted"
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
