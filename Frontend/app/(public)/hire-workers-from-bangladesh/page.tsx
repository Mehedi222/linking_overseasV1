import type { Metadata } from 'next'
import { CheckCircle2, MessageCircle, Phone } from 'lucide-react'
import { EmployerRequirementForm } from './_components/employer-requirement-form'
import { FaqSection } from '@/components/faq-section'
import { COMPANY } from '@/lib/constants'

export const metadata: Metadata = { title: 'Hire Skilled Bangladeshi Workers — Linking Overseas' }

const EMPLOYER_BENEFITS = [
  'Access to skilled, semi-skilled and domestic worker categories from Bangladesh',
  'Demand-based recruitment planning for Middle East and overseas employers',
  'Transparent communication and ethical recruitment positioning',
  'Documentation, visa processing and BMET coordination support',
  'Employer-focused follow-up from our Dhaka office team',
]

export default function HireWorkersPage() {
  return (
    <div className="animate-fade-in">
      <section className="bg-slate-950 py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Hire Skilled Bangladeshi Workers for Your Business
          </h1>
          <p className="mt-3 text-sm text-slate-300">
            Employer benefits, demand letter process, worker categories, destinations, timeline
            and submit requirement support from Bangladesh
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <EmployerRequirementForm />
      </section>

      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-xl font-semibold">Employer Benefits</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {COMPANY.name} helps foreign employers, manpower buyers and recruitment partners hire
            workers from Bangladesh through a transparent and ethical process.
          </p>
          <ul className="mt-5 space-y-2.5">
            {EMPLOYER_BENEFITS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-orange-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-xl font-semibold">Please Prepare This Information Before You Contact Us</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          To receive faster support, please prepare your company details, recruitment
          requirements, and the identity of the contact person first.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href={`https://wa.me/${COMPANY.whatsapp.replace(/[^\d]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 cursor-pointer"
          >
            <MessageCircle className="size-4" /> WhatsApp: {COMPANY.whatsapp}
          </a>
          <a
            href={`mailto:${COMPANY.email}`}
            className="flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-muted cursor-pointer"
          >
            <Phone className="size-4" /> Email: {COMPANY.email}
          </a>
        </div>
      </section>

      <FaqSection />
    </div>
  )
}
