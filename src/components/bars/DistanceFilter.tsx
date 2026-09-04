import type { DistancePreference } from '../../types'

interface DistanceFilterProps {
  selected: DistancePreference
  onChange: (pref: DistancePreference) => void
}

const OPTIONS: Array<{ value: DistancePreference; label: string; desc: string }> = [
  { value: 'near', label: 'Nära', desc: 'Under 600m' },
  { value: 'further', label: 'Lite längre', desc: 'Upp till 2 km' },
  { value: 'any', label: 'Spelar ingen roll', desc: 'Bästa pris' },
]

export function DistanceFilter({ selected, onChange }: DistanceFilterProps) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          title={opt.desc}
          className={`flex-1 py-2.5 px-2 rounded-lg border text-sm transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
            selected === opt.value ? 'border-transparent text-[#2a1a06]' : 'border-[var(--input-border)] hover:border-[var(--accent)]'
          }`}
          style={{
            color: selected === opt.value ? undefined : 'var(--text-soft)',
            background: selected === opt.value ? 'var(--accent-grad)' : undefined,
          }}
        >
          <span className="font-semibold">{opt.label}</span>
          <span className="text-[10px] opacity-70">{opt.desc}</span>
        </button>
      ))}
    </div>
  )
}
