import { describe, expect, it } from 'vitest'
import { fetchNearbyBars, isWithinCoverage } from './places'

// Roughly the middle of Stockholm, where the mock bars are clustered.
const STOCKHOLM = { lat: 59.3293, lng: 18.0686 }
const GOTHENBURG = { lat: 57.7088, lng: 11.9746 }

describe('fetchNearbyBars', () => {
  it('excludes bars outside the requested radius', async () => {
    const wide = await fetchNearbyBars(STOCKHOLM.lat, STOCKHOLM.lng, 5000, [1, 2, 3])
    const narrow = await fetchNearbyBars(STOCKHOLM.lat, STOCKHOLM.lng, 600, [1, 2, 3])

    expect(narrow.length).toBeLessThan(wide.length)
    expect(narrow.every(b => b.distance_m <= 600)).toBe(true)
  })

  it('still filters by price level within the radius', async () => {
    const bars = await fetchNearbyBars(STOCKHOLM.lat, STOCKHOLM.lng, 5000, [3])

    expect(bars.every(b => b.price_level === 3)).toBe(true)
  })

  it('returns bars sorted nearest-first', async () => {
    const bars = await fetchNearbyBars(STOCKHOLM.lat, STOCKHOLM.lng, 5000, [1, 2, 3])
    const distances = bars.map(b => b.distance_m)

    expect(distances).toEqual([...distances].sort((a, b) => a - b))
  })

  it('returns nothing when the radius is smaller than any bar\'s distance', async () => {
    const bars = await fetchNearbyBars(STOCKHOLM.lat, STOCKHOLM.lng, 1, [1, 2, 3])

    expect(bars).toEqual([])
  })
})

describe('isWithinCoverage', () => {
  it('returns true for coordinates within Stockholm bar radius', () => {
    expect(isWithinCoverage(STOCKHOLM.lat, STOCKHOLM.lng, 5000)).toBe(true)
  })

  it('returns false for coordinates far away from Stockholm (e.g. Gothenburg)', () => {
    expect(isWithinCoverage(GOTHENBURG.lat, GOTHENBURG.lng, 5000)).toBe(false)
  })
})

