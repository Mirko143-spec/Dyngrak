import type { BudgetTier } from '../../types'

interface TierSelectorProps {
  selected: BudgetTier
  onChange: (tier: BudgetTier) => void
  availableTiers: BudgetTier[]
}

const TIER_CONFIG: Record<BudgetTier, { label: string; desc: string; icon: string }> = {
  cheap: { label: 'Billigast', desc: 'Barer & restauranger – inget lyxigt', icon: '🍺' },
  medium: { label: 'Händelserik kväll', desc: 'Lite mer action, aktiviteter', icon: '🎉' },
  expensive: { label: 'Finlir', desc: 'Välrenommerat men rimliga priser', icon: '🥂' },
}

export function TierSelector({ selected, onChange, availableTiers }: TierSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      {(['cheap', 'medium', 'expensive'] as BudgetTier[])
        .filter(t => availableTiers.includes(t))
        .map(tier => {
          const cfg = TIER_CONFIG[tier]
          return (
            <button
              key={tier}
              onClick={() => onChange(tier)}
              className="text-left p-4 rounded-xl border transition-all cursor-pointer"
              style={{
                borderColor: selected === tier ? 'var(--accent)' : 'var(--card-border)',
                background: selected === tier ? 'var(--accent-soft)' : 'var(--card)',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cfg.icon}</span>
                <div>
                  <p className="font-semibold">{cfg.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{cfg.desc}</p>
                </div>
                {selected === tier && (
                  <span className="ml-auto font-mono-label text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-dark)' }}>
                    Vald
                  </span>
                )}
              </div>
            </button>
          )
        })}
    </div>
  )
}
