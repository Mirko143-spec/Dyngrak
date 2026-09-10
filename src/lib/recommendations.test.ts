import { describe, expect, it } from 'vitest'
import { generateRoutes } from './recommendations'
import type { BacResult } from '../types'

const STOCKHOLM = { lat: 59.3293, lng: 18.0686 }

const mockBacResult: BacResult = {
  current_bac: 0.4,
  target_bac: 0.8,
  total_grams_alcohol: 40,
  additional_drinks_needed: 3,
}

describe('generateRoutes auto-expansion', () => {
  it('guarantees routes for all budget tiers around T-Centralen even with narrow near radius', async () => {
    const routes = await generateRoutes({
      userLat: STOCKHOLM.lat,
      userLng: STOCKHOLM.lng,
      bacResult: mockBacResult,
      distancePref: 'near',
    })

    expect(routes.length).toBeGreaterThanOrEqual(2)
    const tiers = routes.map(r => r.tier)
    expect(tiers).toContain('cheap')
    expect(tiers).toContain('expensive')
  })
})
