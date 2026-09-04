import { Card } from '../ui/Card'
import { PRE_DRINK_ITEMS } from '../../lib/drinks'

interface PreDrinkCardProps {
  quantities: Record<string, number>
  onQuantitiesChange: (id: string, qty: number) => void
  startTime: string
  onStartTimeChange: (time: string) => void
}

export function PreDrinkCard({ quantities, onQuantitiesChange, startTime, onStartTimeChange }: PreDrinkCardProps) {
  return (
    <Card>
      <h2 className="font-display font-semibold text-xl mb-1">2. Druckit innan?</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-soft)' }}>
        Ange vad du fått i dig hittills och när du tog första glaset.
      </p>

      <div className="flex flex-col gap-4 mb-6">
        {PRE_DRINK_ITEMS.map(item => {
          const qty = quantities[item.id] ?? 0
          return (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <div>
                <span className="font-medium">{item.label}</span>{' '}
                {item.volume && <span style={{ color: 'var(--text-faint)' }}>{item.volume}</span>}{' '}
                <span className="font-mono-label text-xs" style={{ color: 'var(--text-faint)' }}>{item.grams} g</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onQuantitiesChange(item.id, Math.max(0, qty - 1))}
                  className="w-8 h-8 rounded-full border border-[var(--input-border)] flex items-center justify-center cursor-pointer hover:border-[var(--accent)] transition-colors"
                  aria-label={`Minska ${item.label}`}
                >
                  −
                </button>
                <span className="w-4 text-center font-medium tabular-nums">{qty}</span>
                <button
                  onClick={() => onQuantitiesChange(item.id, qty + 1)}
                  className="w-8 h-8 rounded-full border border-[var(--input-border)] flex items-center justify-center cursor-pointer hover:border-[var(--accent)] transition-colors"
                  aria-label={`Öka ${item.label}`}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono-label text-[11px] tracking-widest text-[var(--label)] uppercase">
          Klockslag du började dricka
        </label>
        <input
          type="time"
          value={startTime}
          onChange={e => onStartTimeChange(e.target.value)}
          className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-3 text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
      </div>
    </Card>
  )
}
