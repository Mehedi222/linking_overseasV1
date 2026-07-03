import Link from 'next/link'
import { Phone, Mail, MapPin, ShieldCheck, Globe, MessageCircle, Send, Link2 } from 'lucide-react'
import { COMPANY, NAV_LINKS } from '@/lib/constants'

export function SiteFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-orange-500 text-white">
              <ShieldCheck className="size-5" />
            </span>
            <span className="text-sm font-bold text-white">{COMPANY.name}</span>
          </div>
          <p className="text-sm text-slate-400">
            {COMPANY.license} licensed overseas recruitment agency in Bangladesh. We support
            skilled manpower recruitment, housemaid recruitment, visa processing and BMET
            clearance with ethical, transparent and dependable service.
          </p>
          <div className="flex items-center gap-3">
            {[Globe, MessageCircle, Send, Link2].map((Icon, i) => (
              <span
                key={i}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-colors hover:bg-orange-500 hover:text-white"
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white">EXPLORE</h3>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-slate-400 hover:text-white cursor-pointer">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white">CONTACT</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {COMPANY.address}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" />
              {COMPANY.phone}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" />
              {COMPANY.email}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white">COMPANY PROFILE</h3>
          <p className="mt-4 text-sm text-slate-400">
            Review our background, licensing, recruitment strengths and company information.
          </p>
          <span className="mt-4 inline-flex cursor-pointer items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500/90">
            Download Profile
          </span>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        Copyright © {new Date().getFullYear()} by linkingoverseas.com | {COMPANY.name} · Since {COMPANY.since}
      </div>
    </footer>
  )
}
