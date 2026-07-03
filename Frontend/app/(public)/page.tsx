import type { Metadata } from 'next'
import { Hero } from './_components/hero'
import { WhyChooseUs } from './_components/why-choose-us'
import { RecruitmentProcess } from './_components/recruitment-process'
import { TrustGrid } from './_components/trust-grid'
import { ServicesGrid } from './_components/services-grid'
import { CurrentJobsPreview } from './_components/current-jobs-preview'
import { TopCountries } from './_components/top-countries'
import { Testimonials } from './_components/testimonials'
import { EmployerLogos } from './_components/employer-logos'
import { CTABanner } from './_components/cta-banner'

export const metadata: Metadata = {
  title: 'Linking Overseas Ltd — BMET Licensed Recruitment Agency',
  description:
    'Linking Overseas Ltd (BMET RL-2081) connects Bangladeshi job seekers with verified employers across Saudi Arabia, UAE, Qatar, Kuwait, Oman and Bahrain.',
}

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <Hero />
      <WhyChooseUs />
      <RecruitmentProcess />
      <TrustGrid />
      <ServicesGrid />
      <CurrentJobsPreview />
      <TopCountries />
      <Testimonials />
      <EmployerLogos />
      <CTABanner />
    </div>
  )
}
