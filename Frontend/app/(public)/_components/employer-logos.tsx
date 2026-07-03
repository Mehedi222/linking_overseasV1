import { EMPLOYER_LOGOS } from '@/lib/constants'

export function EmployerLogos() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Trusted By</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            GCC employers who hire through Linking Overseas
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {EMPLOYER_LOGOS.map((employer) => (
            <div
              key={employer.name}
              className="flex h-16 items-center justify-center rounded-lg border bg-white px-6 shadow-sm"
            >
              {employer.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={employer.logoUrl} alt={employer.name} className="h-8 w-auto" />
              ) : (
                <span className="text-sm font-medium text-muted-foreground">{employer.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
