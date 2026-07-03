import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { COMPANY } from '@/lib/constants'

const CHECKLIST = [
  `${COMPANY.license} Verified`,
  'Fast Employer Response',
  'Overseas Hiring Ready',
]

export function WhyChooseUs() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-2 lg:items-stretch">
        <div className="rounded-2xl bg-slate-950 p-8 text-white">
          <h2 className="text-2xl font-bold tracking-tight">Why Choose {COMPANY.name}</h2>
          <p className="mt-2 text-sm text-slate-400">
            Clear company identity, licence, ethical recruitment workflow and employer-focused
            support for overseas hiring from Bangladesh.
          </p>
          <ul className="mt-6 space-y-3">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-slate-200">
                <CheckCircle2 className="size-4 shrink-0 text-orange-400" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/5 p-4">
              <div className="text-xs text-slate-400">Employer Focus</div>
              <div className="mt-1 text-lg font-semibold">4 Core Layers</div>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <div className="text-xs text-slate-400">Process Position</div>
              <div className="mt-1 text-lg font-semibold">End-to-End Support</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-2xl border bg-card p-8">
          <span className="flex size-10 items-center justify-center rounded-full bg-orange-500/10 text-sm font-semibold text-orange-500">
            01
          </span>
          <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-orange-500">
            Trust Foundation
          </h3>
          <p className="mt-1 text-lg font-semibold">Licensed &amp; Verified</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {COMPANY.license} licensed recruiting agency with visible company profile, Dhaka
            office and compliance-first positioning.
          </p>
          <Link
            href="/about"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:underline cursor-pointer"
          >
            Review Profile <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
