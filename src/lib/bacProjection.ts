import type { Gender, UserProfile } from '../types'
import { PRE_DRINK_ITEMS } from './drinks'
import { METABOLISM_RATE, calculateCurrentBacFromGrams } from './widmark'

const DEFAULT_WEIGHT_KG = 80
const DEFAULT_GENDER: Gender = 'male'

export interface BacProjectionInput {
  preDrinkQuantities: Record<string, number>
  startTime: string
  now: Date
  profile: UserProfile | null
}

export interface BacProjection {
  currentBac: number
  gramsConsumed: number
  hoursSinceStart: number
  metabolizedPct: number
  startedAt: Date | null
  weightKg: number
  gender: Gender
}

// "HH:MM" is always anchored to today. If that puts the start time after `now`,
// the session must have begun yesterday (e.g. started at 23:30, it's now 01:15).
function parseStartTime(time: string, now: Date): Date | null {
  if (!time) return null
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null

  const started = new Date(now)
  started.setHours(h, m, 0, 0)
  if (started.getTime() > now.getTime()) {
    started.setDate(started.getDate() - 1)
  }
  return started
}

export function projectBac({ preDrinkQuantities, startTime, now, profile }: BacProjectionInput): BacProjection {
  const weightKg = profile?.weight_kg ?? DEFAULT_WEIGHT_KG
  const gender = profile?.gender ?? DEFAULT_GENDER

  const gramsConsumed = PRE_DRINK_ITEMS.reduce(
    (sum, item) => sum + (preDrinkQuantities[item.id] ?? 0) * item.grams,
    0
  )

  const startedAt = parseStartTime(startTime, now)
  const hoursSinceStart = startedAt ? Math.max(0, (now.getTime() - startedAt.getTime()) / 3600000) : 0

  const currentBac = calculateCurrentBacFromGrams({
    grams_consumed: gramsConsumed,
    weight_kg: weightKg,
    gender,
    hours_since_first_drink: hoursSinceStart,
  })

  const metabolizedPct = METABOLISM_RATE * hoursSinceStart

  return { currentBac, gramsConsumed, hoursSinceStart, metabolizedPct, startedAt, weightKg, gender }
}
