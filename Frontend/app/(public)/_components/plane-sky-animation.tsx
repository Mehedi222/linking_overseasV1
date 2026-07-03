import { Plane } from 'lucide-react'

const CLOUDS = [
  { top: '12%', width: 100, height: 44, duration: 46, delay: -6 },
  { top: '28%', width: 70, height: 32, duration: 60, delay: -30 },
  { top: '52%', width: 130, height: 52, duration: 52, delay: -16 },
  { top: '68%', width: 80, height: 36, duration: 38, delay: -22 },
]

// A small V-formation, offset from the lead plane. All five sit inside the
// same animated wrapper so they move and rotate together as one rigid group.
const FORMATION = [
  { dx: 0, dy: 0, size: 'size-10 sm:size-12', opacity: 'opacity-100' },
  { dx: -90, dy: 50, size: 'size-8 sm:size-9', opacity: 'opacity-90' },
  { dx: 90, dy: 50, size: 'size-8 sm:size-9', opacity: 'opacity-90' },
  { dx: -160, dy: 100, size: 'size-6 sm:size-7', opacity: 'opacity-75' },
  { dx: 160, dy: 100, size: 'size-6 sm:size-7', opacity: 'opacity-75' },
]

export function PlaneSkyAnimation() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {CLOUDS.map((cloud, i) => (
        <div
          key={i}
          className="animate-drift-cloud absolute rounded-full bg-white/[0.06] blur-2xl"
          style={{
            top: cloud.top,
            width: cloud.width,
            height: cloud.height,
            animationDuration: `${cloud.duration}s`,
            animationDelay: `${cloud.delay}s`,
          }}
        />
      ))}

      <div className="animate-fly-loop absolute text-orange-400/80 drop-shadow-[0_0_12px_rgba(249,115,22,0.35)]">
        <div className="relative">
          {FORMATION.map((plane, i) => (
            <Plane
              key={i}
              className={`absolute ${plane.size} ${plane.opacity}`}
              style={{ left: plane.dx, top: plane.dy, transform: 'translate(-50%, -50%)' }}
              strokeWidth={1.75}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
