import { TOP_COUNTRIES } from '@/lib/constants'

export function TopCountries() {
  return (
    <section className="border-y bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-center text-lg font-semibold tracking-tight">Top Countries We Serve</h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {TOP_COUNTRIES.map((country) => (
            <div key={country.name} className="flex flex-col items-center gap-1.5">
              <span className="text-3xl">{country.flag}</span>
              <span className="text-xs text-muted-foreground">{country.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
