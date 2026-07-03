import Link from 'next/link'
import { ShieldCheck, BadgeCheck, Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { COMPANY } from '@/lib/constants'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_55%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-1.5 text-xs font-medium text-orange-300">
            <BadgeCheck className="size-4" /> {COMPANY.license} Verified · Trusted Agency
          </span>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Hire Skilled Bangladeshi Workers for Overseas Employment
          </h1>
          <p className="max-w-lg text-base text-slate-300">
            {COMPANY.name} connects Bangladeshi job seekers with verified employers across the
            GCC region through transparent screening, compliant documentation and end-to-end
            deployment support.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              render={<Link href="/curriculum-vitae" />}
              size="lg"
              className="cursor-pointer bg-orange-500 text-white hover:bg-orange-500/90"
            >
              Submit CV
            </Button>
            <Button
              render={<Link href="/hire-workers-from-bangladesh" />}
              size="lg"
              variant="outline"
              className="cursor-pointer border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Submit Employer Requirement
            </Button>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-medium text-orange-300">
              <ShieldCheck className="size-4" /> BMET Verified
            </div>
            <div className="mt-4 text-4xl font-bold tracking-tight">{COMPANY.license.replace('BMET ', '')}</div>
            <div className="mt-1 text-sm text-slate-400">Trusted Agency</div>
            <div className="mt-6 space-y-3 border-t border-white/10 pt-4 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="size-4 text-orange-400" /> Licensed Recruitment
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Plane className="size-4 text-orange-400" /> Overseas Deployment
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
