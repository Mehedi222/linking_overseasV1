import { CV_FORM_SECTIONS } from '@/lib/constants'

export function SectionNav() {
  return (
    <nav className="mx-auto mb-6 flex max-w-3xl flex-wrap justify-center gap-2 rounded-full border bg-background p-2 shadow-sm">
      {CV_FORM_SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
        >
          {section.label}
        </a>
      ))}
    </nav>
  )
}
