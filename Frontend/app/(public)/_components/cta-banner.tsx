import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CTABanner() {
  return (
    <section className="bg-gradient-to-r from-orange-500 to-orange-400 py-14 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:text-left">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Start Your Next Recruitment Step</h2>
          <p className="mt-2 max-w-xl text-sm text-orange-50">
            Candidates can submit a CV and employers can send recruitment requirements from the
            homepage.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            render={<Link href="/curriculum-vitae" />}
            size="lg"
            className="cursor-pointer bg-slate-950 text-white hover:bg-slate-900"
          >
            Submit CV
          </Button>
          <Button
            render={<Link href="/hire-workers-from-bangladesh" />}
            size="lg"
            variant="outline"
            className="cursor-pointer border-white/40 bg-white/10 text-white hover:bg-white/20"
          >
            Submit Employer Requirement
          </Button>
        </div>
      </div>
    </section>
  )
}
