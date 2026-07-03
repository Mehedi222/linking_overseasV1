import { RECRUITMENT_STEPS } from '@/lib/constants'
import { ICONS } from '@/components/icon-map'

const STEP_COLORS = [
  'bg-blue-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-sky-500',
  'bg-purple-500',
]

export function RecruitmentProcess() {
  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Recruitment Process</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Transparent screening, verified documentation, training and smooth deployment · Safe
            overseas employment
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {RECRUITMENT_STEPS.map((step, i) => {
            const Icon = ICONS[step.icon]
            return (
              <div key={step.step} className="flex flex-col items-center text-center">
                <div className={`flex size-16 items-center justify-center rounded-xl ${STEP_COLORS[i]} text-white shadow-lg`}>
                  <span className="text-xl font-bold">{step.step}</span>
                </div>
                <div className="mt-4 flex size-9 items-center justify-center rounded-full bg-background ring-1 ring-border">
                  {Icon && <Icon className="size-4 text-orange-500" />}
                </div>
                <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
