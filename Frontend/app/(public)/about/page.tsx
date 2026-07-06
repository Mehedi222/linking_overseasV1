import type { Metadata } from 'next'
import { ShieldCheck, Target, Eye, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getSiteSettings } from '@/services/site-settings.server-services'

export const metadata: Metadata = { title: 'About Us — Linking Overseas' }

export default async function AboutPage() {
  const settings = await getSiteSettings()

  const stats = [
    { label: 'BMET License', value: settings.license },
    { label: 'Established', value: settings.since },
    { label: 'GCC Destinations', value: '6+' },
    { label: 'Year 1 Placement Target', value: '50–100/mo' },
  ]

  return (
    <div className="animate-fade-in">
      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-1.5 text-xs font-medium text-orange-300">
            <ShieldCheck className="size-4" /> {settings.license} Licensed Agency
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">About {settings.companyName}</h1>
          <p className="mt-3 text-sm text-slate-300">
            A production-grade recruitment platform connecting Bangladeshi job seekers to
            employers across the GCC region since {settings.since}.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="flex flex-col gap-1">
                <span className="text-lg font-bold text-orange-500">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          <Card>
            <CardContent className="flex flex-col gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-slate-950 text-orange-400">
                <Target className="size-5" />
              </span>
              <h2 className="text-lg font-semibold">Our Mission</h2>
              <p className="text-sm text-muted-foreground">
                To connect skilled and general Bangladeshi workers with verified overseas
                employers through an ethical, transparent and fully compliant recruitment
                process — protecting both candidates and employers at every step.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-slate-950 text-orange-400">
                <Eye className="size-5" />
              </span>
              <h2 className="text-lg font-semibold">Our Vision</h2>
              <p className="text-sm text-muted-foreground">
                To become Bangladesh&apos;s most trusted BMET-licensed recruitment agency,
                recognized for zero-violation compliance and dependable, end-to-end deployment
                support across the GCC.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-14">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-slate-950 text-orange-400">
              <Building2 className="size-5" />
            </span>
            <h2 className="text-lg font-semibold">Company Profile</h2>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {settings.companyName} is a {settings.license} licensed overseas recruitment agency based in
            Dhaka, Bangladesh. We support skilled manpower recruitment, housemaid and domestic
            worker recruitment, manpower training, work visa processing, BMET clearance, and air
            ticket coordination for employers across Saudi Arabia, UAE, Qatar, Kuwait, Oman and
            Bahrain.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Registered office: {settings.address}
          </p>
        </div>
      </section>
    </div>
  )
}
