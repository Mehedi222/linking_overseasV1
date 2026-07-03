import type { Metadata } from 'next'
import { UserRound } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { TEAM_ROLES } from '@/lib/constants'

export const metadata: Metadata = { title: 'Our Team — Linking Overseas' }

export default function OurTeamPage() {
  return (
    <div className="animate-fade-in">
      <section className="bg-slate-950 py-14 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Expert Team</h1>
          <p className="mt-3 text-sm text-slate-300">
            Dedicated professionals committed to your success
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {TEAM_ROLES.map((role) => (
            <Card key={role.title} className="text-center">
              <CardContent className="flex flex-col items-center gap-3">
                <span className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 p-[3px]">
                  <span className="flex size-full items-center justify-center rounded-[14px] bg-muted">
                    <UserRound className="size-9 text-muted-foreground" />
                  </span>
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{role.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">{role.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
