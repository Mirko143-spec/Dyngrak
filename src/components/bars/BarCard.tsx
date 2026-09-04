import { motion } from 'framer-motion'
import type { Bar } from '../../types'

interface DrinkAtBar {
  id: string
  icon: string
  label: string
  count: number
}

interface BarCardProps {
  bar: Bar
  index: number
  drinks_here: number
  drinks?: DrinkAtBar[]
}

export function BarCard({ bar, index, drinks_here, drinks }: BarCardProps) {
  const distLabel =
    bar.distance_m < 1000
      ? `${Math.round(bar.distance_m)} m`
      : `${(bar.distance_m / 1000).toFixed(1)} km`

  const stars = '★'.repeat(Math.round(bar.rating)) + '☆'.repeat(5 - Math.round(bar.rating))

  return (
    <motion.a
      href={bar.google_maps_url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ x: 4 }}
      className="block rounded-xl p-5 transition-colors group no-underline border"
      style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{bar.name}</h3>
        <span className="text-sm ml-2 shrink-0" style={{ color: 'var(--accent-dark)' }}>
          {bar.rating.toFixed(1)} {stars.slice(0, 1)}
        </span>
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--text-faint)' }}>{bar.address}</p>

      {drinks && drinks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {drinks.map(d => (
            <span
              key={d.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent-dark)' }}
            >
              <span>{d.icon}</span>
              {d.count} {d.label}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-sm">
        <span className="flex items-center gap-1" style={{ color: 'var(--text-soft)' }}>
          <span>📍</span>
          {distLabel}
        </span>
        {(!drinks || drinks.length === 0) && (
          <span className="font-semibold" style={{ color: '#3f8a5c' }}>
            ~{drinks_here.toFixed(1)} glas
          </span>
        )}
        <span style={{ color: 'var(--text-soft)' }}>≈{bar.estimated_drink_price_sek} kr/glas</span>
      </div>
    </motion.a>
  )
}
