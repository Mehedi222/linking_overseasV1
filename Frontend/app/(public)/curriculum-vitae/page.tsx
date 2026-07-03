import { CVForm } from './_components/cv-form'
import { SectionNav } from './_components/section-nav'

export const metadata = { title: 'Submit Your CV — Linking Overseas' }

export default function CVPage() {
  return (
    <div className="animate-fade-in min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Submit Your CV for Overseas Jobs</h1>
        <p className="text-muted-foreground mt-2">
          Submit your CV online to apply for overseas employment opportunities
        </p>
      </div>
      <SectionNav />
      <CVForm />
    </div>
  )
}
