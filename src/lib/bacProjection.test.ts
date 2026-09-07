import { describe, expect, it } from 'vitest'
import { projectBac } from './bacProjection'
import type { UserProfile } from '../types'

const NOW = new Date('2026-09-04T22:00:00')

function profile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'local',
    user_id: 'local',
    weight_kg: 90,
    gender: 'male',
    created_at: NOW.toISOString(),
    ...overrides,
  }
}

describe('projectBac', () => {
  it('returns all zeros with nothing entered', () => {
    const result = projectBac({ preDrinkQuantities: {}, startTime: '', now: NOW, profile: null })

    expect(result.gramsConsumed).toBe(0)
    expect(result.hoursSinceStart).toBe(0)
    expect(result.currentBac).toBe(0)
    expect(result.metabolizedPct).toBe(0)
    expect(result.startedAt).toBeNull()
  })

  it('defaults to 80kg/male when no profile is saved', () => {
    const result = projectBac({ preDrinkQuantities: { starkol: 2 }, startTime: '', now: NOW, profile: null })

    expect(result.weightKg).toBe(80)
    expect(result.gender).toBe('male')
  })

  it('uses the saved profile when present', () => {
    const result = projectBac({
      preDrinkQuantities: {},
      startTime: '',
      now: NOW,
      profile: profile({ weight_kg: 65, gender: 'female' }),
    })

    expect(result.weightKg).toBe(65)
    expect(result.gender).toBe('female')
  })

  it('sums grams across pre-drink quantities using the drink catalogue', () => {
    // 2 starköl (12g) + 1 vin (14g) = 38g
    const result = projectBac({
      preDrinkQuantities: { starkol: 2, vin: 1 },
      startTime: '',
      now: NOW,
      profile: profile(),
    })

    expect(result.gramsConsumed).toBe(38)
  })

  it('computes hours elapsed for a start time earlier the same day', () => {
    // started 20:00, now 22:00 -> 2 hours
    const result = projectBac({ preDrinkQuantities: {}, startTime: '20:00', now: NOW, profile: profile() })

    expect(result.hoursSinceStart).toBeCloseTo(2, 5)
    expect(result.startedAt?.toISOString()).toBe(new Date('2026-09-04T20:00:00').toISOString())
  })

  it('rolls a start time after `now` back to yesterday instead of clamping to 0', () => {
    // it's 22:00, but the entered start time is 23:30 -> must have been last night
    const result = projectBac({ preDrinkQuantities: {}, startTime: '23:30', now: NOW, profile: profile() })

    expect(result.startedAt?.toISOString()).toBe(new Date('2026-09-03T23:30:00').toISOString())
    expect(result.hoursSinceStart).toBeCloseTo(22.5, 5)
  })

  it('treats an unparsable start time as not started', () => {
    const result = projectBac({ preDrinkQuantities: {}, startTime: 'nope', now: NOW, profile: profile() })

    expect(result.startedAt).toBeNull()
    expect(result.hoursSinceStart).toBe(0)
  })

  it('combines grams, weight, and elapsed time into a current BAC that falls as time passes', () => {
    const justStarted = projectBac({
      preDrinkQuantities: { storstark: 3 },
      startTime: '22:00',
      now: NOW,
      profile: profile({ weight_kg: 90, gender: 'male' }),
    })
    const twoHoursLater = projectBac({
      preDrinkQuantities: { storstark: 3 },
      startTime: '22:00',
      now: new Date('2026-09-05T00:00:00'),
      profile: profile({ weight_kg: 90, gender: 'male' }),
    })

    expect(justStarted.currentBac).toBeGreaterThan(0)
    expect(twoHoursLater.currentBac).toBeLessThan(justStarted.currentBac)
  })
})
