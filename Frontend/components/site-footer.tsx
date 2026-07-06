import Link from 'next/link'
import { Phone, Mail, MapPin, ShieldCheck, Globe, MessageCircle, Send, Link2 } from 'lucide-react'
import { NAV_LINKS } from '@/lib/constants'
import { getSiteSettings } from '@/services/site-settings.server-services'

export async function SiteFooter() {
  const settings = await getSiteSettings()

  const socialLinks = [
    { icon: Globe, href: settings.websiteUrl },
    { icon: MessageCircle, href: settings.whatsappUrl },
    { icon: Send, href: settings.telegramUrl },
    { icon: Link2, href: settings.otherUrl },
  ].filter((link): link is { icon: typeof Globe; href: string } => Boolean(link.href))

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-orange-500 text-white">
              <ShieldCheck className="size-5" />
            </span>
            <span className="text-sm font-bold text-white">{settings.companyName}</span>
          </div>
          <p className="text-sm text-slate-400">{settings.description}</p>
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              {socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-colors hover:bg-orange-500 hover:text-white"
                >
                  <link.icon className="size-4" />
                </a>
              ))}
            </div>
          )}
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
              {settings.address}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" />
              {settings.phone}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" />
              {settings.email}
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
        Copyright © {new Date().getFullYear()} by linkingoverseas.com | {settings.companyName} · Since {settings.since}
      </div>
    </footer>
  )
}
