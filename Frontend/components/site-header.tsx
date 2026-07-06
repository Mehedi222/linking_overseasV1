'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Phone, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ISiteSettings } from '@/services/site-settings.server-services'

export function SiteHeader({ settings }: { settings: ISiteSettings }) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40">
      <div className="hidden bg-slate-950 text-slate-300 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5 font-medium text-orange-400">
            <ShieldCheck className="size-3.5" />
            GOVT. APPROVED RECRUITING LICENCE NO. {settings.license.replace('BMET ', '')}
          </span>
          <div className="flex items-center gap-4">
            <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white">
              <Phone className="size-3.5" /> {settings.phone}
            </a>
            <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white">
              <Mail className="size-3.5" /> {settings.email}
            </a>
          </div>
        </div>
      </div>

      <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <span className="flex size-9 items-center justify-center rounded-lg bg-slate-950 text-orange-400">
              <ShieldCheck className="size-5" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight">{settings.companyName.toUpperCase()}</span>
              <span className="text-[10px] text-muted-foreground">Since {settings.since}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer',
                  pathname === link.href && 'text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <Button
              render={<Link href="/login" />}
              className="cursor-pointer bg-orange-500 text-white hover:bg-orange-500/90"
              size="sm"
            >
              Login
            </Button>
          </div>

          <Sheet>
            <SheetTrigger
              render={<Button variant="outline" size="icon" className="cursor-pointer lg:hidden" />}
            >
              <Menu />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{settings.companyName}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={<Link href={link.href} />}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                  >
                    {link.label}
                  </SheetClose>
                ))}
              </nav>
              <div className="px-4 pb-4">
                <SheetClose
                  render={<Link href="/login" />}
                  className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500/90"
                >
                  Login
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
