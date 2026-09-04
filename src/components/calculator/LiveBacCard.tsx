import { Card } from '../ui/Card'
import { SleepingMascot } from '../hero/SleepingMascot'
import { R_FACTOR } from '../../lib/widmark'
import type { Gender } from '../../types'

interface LiveBacCardProps {
  currentBac: number
  gramsConsumed: number
  hoursSinceStart: number
  metabolizedPct: number
  gender: Gender
}

function fmt(n: number, digits = 2) {
  return n.toFixed(digits).replace('.', ',')
}

export function LiveBacCard({ currentBac, gramsConsumed, hoursSinceStart, metabolizedPct, gender }: LiveBacCardProps) {
  return (
    <div className="relative">
      <div className="absolute -top-[58px] right-0 z-10 pointer-events-none">
        <SleepingMascot className="w-[190px] h-auto" />
      </div>

      <Card className="relative overflow-visible">
        <h2 className="font-display font-semibold text-xl mb-5">Din promille just nu</h2>

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-mono-label text-5xl md:text-6xl font-semibold text-accent-grad leading-none">
              {fmt(currentBac)}‰
            </p>
            <p className="font-mono-label text-xs mt-3" style={{ color: 'var(--text-faint)' }}>
              {Math.round(gramsConsumed)} g alkohol · {fmt(hoursSinceStart, 1)} h sedan start · förbränt {fmt(metabolizedPct)}‰
            </p>
          </div>

          <p className="font-mono-label text-xs text-right leading-relaxed max-w-[220px]" style={{ color: 'var(--text-faint)' }}>
            Widmark: promille = gram / (vikt × r) − 0,15 × timmar.
            <br />
            r = {R_FACTOR[gender].toFixed(1)}.
          </p>
        </div>
      </Card>
    </div>
  )
}
