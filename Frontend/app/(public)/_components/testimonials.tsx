import { Card, CardContent } from '@/components/ui/card'
import { TESTIMONIALS } from '@/lib/constants'

export function Testimonials() {
  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Stories From Deployed Workers</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Real experiences from candidates we&rsquo;ve placed overseas
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name}>
              <CardContent className="flex flex-col gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-orange-500/10 text-sm font-semibold text-orange-500">
                  {t.name.charAt(0)}
                </span>
                <p className="text-sm text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.destination}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
