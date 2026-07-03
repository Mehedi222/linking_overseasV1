import { Card, CardContent } from '@/components/ui/card'
import { TRUST_POINTS } from '@/lib/constants'
import { ICONS } from '@/components/icon-map'

export function TrustGrid() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Why Global Employers Trust Us</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Government licensing, compliance-first recruitment and direct employer coordination
            from Dhaka
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TRUST_POINTS.map((point) => {
            const Icon = ICONS[point.icon]
            return (
              <Card key={point.title} className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                    {Icon && <Icon className="size-5" />}
                  </span>
                  <h3 className="text-sm font-semibold">{point.title}</h3>
                  <p className="text-xs text-muted-foreground">{point.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
