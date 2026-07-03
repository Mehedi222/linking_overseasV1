import { Card, CardContent } from '@/components/ui/card'
import { SERVICES } from '@/lib/constants'
import { ICONS } from '@/components/icon-map'

export function ServicesGrid() {
  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Our Services</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Overseas recruitment agency Bangladeshi employers trust for skilled manpower
            recruitment, housemaid recruitment, domestic worker recruitment, work visa processing
            and BMET clearance service
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = ICONS[service.icon]
            return (
              <Card key={service.title} className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-slate-950 text-orange-400">
                    {Icon && <Icon className="size-5" />}
                  </span>
                  <h3 className="text-base font-semibold">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
