import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSessionStore } from '../stores/sessionStore'
import { generateRoutes } from '../lib/recommendations'
import { TierSelector } from '../components/bars/TierSelector'
import { DistanceFilter } from '../components/bars/DistanceFilter'
import { BarCard } from '../components/bars/BarCard'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { DRINK_CATEGORIES } from '../lib/drinks'
import { buildPourPlan } from '../lib/pourPlan'
import { matchBars } from '../lib/matcher'
import type { BudgetTier, DistancePreference, BarRoute } from '../types'

const STOCKHOLM = { lat: 59.3293, lng: 18.0686 }

export default function Results() {
  const navigate = useNavigate()
  const { bacResult, sessionInput } = useSessionStore()
  const [routes, setRoutes] = useState<BarRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tier, setTier] = useState<BudgetTier>('cheap')
  const [distPref, setDistPref] = useState<DistancePreference>(sessionInput?.distance_pref ?? 'near')
  const [userPos, setUserPos] = useState<{ lat: number; lng: number }>(STOCKHOLM)

  // AI-matchningstillstånd
  const [aiReasons, setAiReasons] = useState<Record<string, string>>({})
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    )
  }, [])

  useEffect(() => {
    if (!bacResult) return
    setLoading(true)
    setError('')
    generateRoutes({ userLat: userPos.lat, userLng: userPos.lng, bacResult, distancePref: distPref })
      .then(r => {
        setRoutes(r)
        if (r.length > 0) setTier(r[0].tier)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [distPref, userPos, bacResult])

  const activeRoute = routes.find(r => r.tier === tier)

  // Hämta AI-rekommendationer för den valda rutten i bakgrunden
  useEffect(() => {
    if (!bacResult || !activeRoute || activeRoute.bars.length === 0) return

    let isSubscribed = true
    setAiLoading(true)

    matchBars({
      currentBac: bacResult.current_bac,
      targetBac: bacResult.target_bac,
      budget: tier,
      distancePref: distPref,
      drinkCategories: sessionInput?.drink_categories ?? [],
      bars: activeRoute.bars,
    })
      .then(res => {
        if (!isSubscribed) return
        const map: Record<string, string> = {}
        for (const rec of res.recommendations) {
          map[rec.bar_id] = rec.reason
        }
        setAiReasons(map)
      })
      .catch(err => {
        console.warn('Lager B (AI matcher) felade, fallback till regelbaserad rutt:', err)
      })
      .finally(() => {
        if (isSubscribed) setAiLoading(false)
      })

    return () => {
      isSubscribed = false
    }
  }, [activeRoute, bacResult, tier, distPref, sessionInput?.drink_categories])

  if (!bacResult) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-4" style={{ background: 'var(--bg)' }}>
        <p style={{ color: 'var(--text-soft)' }}>Ingen beräkning gjord ännu.</p>
        <Button onClick={() => navigate('/')} variant="primary">Till kalkylatorn</Button>
      </main>
    )
  }

  const selectedCategories = DRINK_CATEGORIES.filter(c => sessionInput?.drink_categories?.includes(c.id))
  const pourPlan = buildPourPlan({
    totalGramsAlcohol: bacResult.total_grams_alcohol,
    categories: selectedCategories,
    bars: activeRoute?.bars ?? [],
  })

  return (
    <main className="min-h-screen pb-16" style={{ background: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto px-4 pt-24">
        <motion.div className="mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-bold text-4xl mb-1">Kvällens plan</h1>
          <p className="text-sm mb-4" style={{ color: 'var(--text-soft)' }}>
            Mål: <strong style={{ color: 'var(--accent-dark)' }}>{bacResult.target_bac}‰</strong>
            {' '}— behöver{' '}
            <strong style={{ color: '#3f8a5c' }}>{bacResult.additional_drinks_needed} standardglas</strong> till
          </p>

          {pourPlan.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pourPlan.categories.map(c => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium"
                  style={{ borderColor: 'var(--card-border)', background: 'var(--card)' }}
                >
                  <span>{c.icon}</span>
                  {c.count} {c.label}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        <div className="mb-6">
          <p className="font-mono-label text-xs tracking-widest mb-3" style={{ color: 'var(--label)' }}>Avstånd</p>
          <DistanceFilter selected={distPref} onChange={setDistPref} />
        </div>

        <div className="mb-8">
          <p className="font-mono-label text-xs tracking-widest mb-3" style={{ color: 'var(--label)' }}>Budget-typ</p>
          <TierSelector
            selected={tier}
            onChange={setTier}
            availableTiers={routes.map(r => r.tier)}
          />
        </div>

        {loading && (
          <div className="text-center py-12">
            <div
              className="inline-block w-8 h-8 border-2 rounded-full animate-spin mb-4"
              style={{ borderColor: 'var(--accent-soft)', borderTopColor: 'var(--accent)' }}
            />
            <p className="text-sm" style={{ color: 'var(--text-soft)' }}>Söker barer i Stockholm...</p>
          </div>
        )}

        {error && (
          <Card>
            <p className="text-sm text-red-500">{error}</p>
          </Card>
        )}

        {activeRoute && !loading && (
          <motion.div
            key={`${tier}-${distPref}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--text-soft)' }}>{activeRoute.bars.length} ställen</span>
              <span className="font-semibold text-lg" style={{ color: 'var(--accent-dark)' }}>
                ~{activeRoute.estimated_total_cost_sek} kr totalt
              </span>
            </div>

            {aiLoading && (
              <div
                className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-lg text-xs font-medium border"
                style={{
                  background: 'rgba(217, 119, 6, 0.05)',
                  borderColor: 'rgba(217, 119, 6, 0.2)',
                  color: 'var(--text-soft)',
                }}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span>AI analyserar stämning och väljer motiveringar...</span>
              </div>
            )}

            {pourPlan.stops.map(({ bar, drinks }, i) => (
              <BarCard
                key={bar.id}
                bar={bar}
                index={i}
                drinks_here={activeRoute.estimated_drinks_per_bar}
                drinks={drinks}
                aiReason={aiReasons[bar.id]}
              />
            ))}
          </motion.div>
        )}

        {!loading && routes.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="mb-4" style={{ color: 'var(--text-soft)' }}>Inga barer hittades med dessa inställningar.</p>
            <Button onClick={() => setDistPref('any')} variant="ghost">
              Utöka sökning
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
