import type { Metadata } from 'next'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ContactForm } from './_components/contact-form'
import { FaqSection } from '@/components/faq-section'
import { COMPANY } from '@/lib/constants'

export const metadata: Metadata = { title: 'Contact Us — Linking Overseas' }

const CONTACT_CARDS = [
  { icon: Phone, label: 'Call Us', value: COMPANY.phone, href: `tel:${COMPANY.phone}` },
  { icon: MessageCircle, label: 'WhatsApp', value: COMPANY.whatsapp, href: `https://wa.me/${COMPANY.whatsapp.replace(/[^\d]/g, '')}` },
  { icon: Mail, label: 'Email', value: COMPANY.email, href: `mailto:${COMPANY.email}` },
  { icon: MapPin, label: 'Office', value: COMPANY.address, href: undefined },
]

export default function ContactPage() {
  return (
    <div className="animate-fade-in">
      <section className="bg-slate-950 py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact {COMPANY.name}</h1>
          <p className="mt-3 text-sm text-slate-300">
            Reach us via form, phone, WhatsApp or email — our Dhaka office team responds within
            one business day.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACT_CARDS.map((card) => (
            <Card key={card.label}>
              <CardContent className="flex flex-col gap-2">
                <span className="flex size-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                  <card.icon className="size-5" />
                </span>
                <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
                {card.href ? (
                  <a href={card.href} target={card.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-sm font-medium hover:text-orange-500 cursor-pointer">
                    {card.value}
                  </a>
                ) : (
                  <span className="text-sm font-medium">{card.value}</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <ContactForm />
        </div>
      </section>

      <FaqSection />
    </div>
  )
}
