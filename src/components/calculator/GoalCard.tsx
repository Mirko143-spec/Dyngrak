import { Card } from '../ui/Card'
import { Slider } from '../ui/Slider'
import { Button } from '../ui/Button'
import { DRINK_CATEGORIES } from '../../lib/drinks'
import type { DistancePreference } from '../../types'

const DISTANCE_OPTIONS: Array<{ value: DistancePreference; label: string }> = [
  { value: 'near', label: 'Nära dig' },
  { value: 'further', label: 'Lite längre bort' },
  { value: 'any', label: 'Avstånd spelar ingen roll' },
]

interface GoalCardProps {
  target: number
  onTarget: (v: number) => void
  hours: number
  onHours: (v: number) => void
  categories: string[]
  onToggleCategory: (id: string) => void
  distance: DistancePreference
  onDistance: (v: DistancePreference) => void
  onSubmit: () => void
}

export function GoalCard({ target, onTarget, hours, onHours, categories, onToggleCategory, distance, onDistance, onSubmit }: GoalCardProps) {
  const activeCategories = DRINK_CATEGORIES.filter(c => categories.includes(c.id))

  return (
    <Card>
      <h2 className="font-display font-semibold text-xl mb-1">3. Mål och tid</h2>
      <p className="text-sm mb-7" style={{ color: 'var(--text-soft)' }}>
        Så vet vi hur mycket du hinner dricka i kväll.
      </p>

      <div className="flex flex-col gap-7 mb-7">
        <Slider
          label="Önskad promille"
          value={target}
          min={0.5}
          max={2.0}
          step={0.1}
          onChange={onTarget}
          formatValue={v => `${v.toFixed(2).replace('.', ',')} ‰`}
        />
        <Slider
          label="Hur många timmar vill du dricka"
          value={hours}
          min={3}
          max={12}
          step={1}
          onChange={onHours}
          formatValue={v => `${v} h`}
        />
      </div>

      <div className="flex flex-col gap-3 mb-2">
        <label className="font-mono-label text-[11px] tracking-widest text-[var(--label)] uppercase">
          Vad vill du dricka i kväll?
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {DRINK_CATEGORIES.map(c => {
            const selected = categories.includes(c.id)
            return (
              <button
                key={c.id}
                onClick={() => onToggleCategory(c.id)}
                aria-pressed={selected}
                className={`py-3 px-2 rounded-xl border font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selected ? 'text-[#2a1a06] border-transparent' : 'border-[var(--input-border)] text-[var(--text-soft)] hover:border-[var(--accent)]'
                }`}
                style={selected ? { background: 'var(--accent-grad)' } : undefined}
              >
                <span>{c.icon}</span>
                {c.label}
              </button>
            )
          })}
        </div>
        {activeCategories.length > 0 && (
          <div className="flex flex-col gap-1">
            {activeCategories.map(c => (
              <p key={c.id} className="text-sm" style={{ color: 'var(--text-soft)' }}>
                {c.description}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-7 mb-7">
        <label className="font-mono-label text-[11px] tracking-widest text-[var(--label)] uppercase">Avstånd</label>
        <div className="flex flex-col gap-2.5">
          {DISTANCE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onDistance(opt.value)}
              className={`w-full py-3.5 rounded-xl border font-medium transition-all cursor-pointer ${
                distance === opt.value ? 'text-[#2a1a06] border-transparent' : 'border-[var(--input-border)] text-[var(--text)] hover:border-[var(--accent)]'
              }`}
              style={distance === opt.value ? { background: 'var(--accent-grad)' } : undefined}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={onSubmit} variant="primary">
        Räkna ut kvällen
      </Button>
    </Card>
  )
}
