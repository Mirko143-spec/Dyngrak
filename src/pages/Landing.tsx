import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeroSection } from '../components/hero/HeroSection'
import { ProfileCard } from '../components/calculator/ProfileCard'
import { PreDrinkCard } from '../components/calculator/PreDrinkCard'
import { GoalCard } from '../components/calculator/GoalCard'
import { LiveBacCard } from '../components/calculator/LiveBacCard'
import { InfoCard } from '../components/calculator/InfoCard'
import { useUserStore } from '../stores/userStore'
import { useSessionStore } from '../stores/sessionStore'
import { projectBac } from '../lib/bacProjection'
import { GRAMS_PER_STANDARD_DRINK, calculateTargetDrinks } from '../lib/widmark'
import type { DistancePreference } from '../types'

export default function Landing() {
  const navigate = useNavigate()
  const { profile } = useUserStore()
  const { setBacResult, setSessionInput } = useSessionStore()

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [startTime, setStartTime] = useState('')
  const [target, setTarget] = useState(1.0)
  const [hours, setHours] = useState(4)
  const [categories, setCategories] = useState<string[]>(['ol'])
  const [distance, setDistance] = useState<DistancePreference>('near')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const projection = useMemo(
    () => projectBac({ preDrinkQuantities: quantities, startTime, now, profile }),
    [quantities, startTime, now, profile]
  )
  const { currentBac, gramsConsumed, hoursSinceStart, metabolizedPct, startedAt, weightKg, gender } = projection

  const handleCalculate = () => {
    const calc = calculateTargetDrinks({
      current_bac: currentBac,
      target_bac: target,
      weight_kg: weightKg,
      gender,
      hours_planned: hours,
    })

    setBacResult(calc)
    setSessionInput({
      pre_drink:
        gramsConsumed > 0
          ? { standard_drinks: gramsConsumed / GRAMS_PER_STANDARD_DRINK, started_at: startedAt ?? now }
          : null,
      target_bac: target,
      hours_planned: hours,
      drink_categories: categories,
      distance_pref: distance,
    })
    navigate('/resultat')
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <HeroSection />

      <div className="max-w-5xl mx-auto px-4 pt-10 pb-24">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-6">
            <ProfileCard />
            <PreDrinkCard
              quantities={quantities}
              onQuantitiesChange={(id, qty) => setQuantities(q => ({ ...q, [id]: qty }))}
              startTime={startTime}
              onStartTimeChange={setStartTime}
            />
            <GoalCard
              target={target}
              onTarget={setTarget}
              hours={hours}
              onHours={setHours}
              categories={categories}
              onToggleCategory={id =>
                setCategories(prev => (prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]))
              }
              distance={distance}
              onDistance={setDistance}
              onSubmit={handleCalculate}
            />
          </div>

          <div className="flex flex-col gap-6">
            <LiveBacCard
              currentBac={currentBac}
              gramsConsumed={gramsConsumed}
              hoursSinceStart={hoursSinceStart}
              metabolizedPct={metabolizedPct}
              gender={gender}
            />
            <InfoCard />
          </div>
        </div>
      </div>
    </main>
  )
}
