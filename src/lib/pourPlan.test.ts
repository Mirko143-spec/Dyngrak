import { describe, expect, it } from 'vitest'
import { buildPourPlan } from './pourPlan'
import type { Bar, DrinkCategory } from '../types'

function bar(id: string): Bar {
  return {
    id,
    name: `Bar ${id}`,
    address: 'Some street',
    rating: 4.2,
    price_level: 2,
    distance_m: 500,
    lat: 59.33,
    lng: 18.06,
    google_maps_url: `https://maps.example/${id}`,
    estimated_drink_price_sek: 85,
  }
}

function category(id: string, grams: number): DrinkCategory {
  return { id, label: id, icon: '🍺', grams, priceIndex: 1, description: '' }
}

describe('buildPourPlan', () => {
  it('returns no categories and empty stops with nothing selected', () => {
    const plan = buildPourPlan({ totalGramsAlcohol: 0, categories: [], bars: [bar('a')] })

    expect(plan.categories).toEqual([])
    expect(plan.stops).toEqual([{ bar: bar('a'), drinks: [] }])
  })

  it('splits total grams evenly across categories and rounds each up', () => {
    // 84g split across 2 categories = 42g each; ol (12g) -> ceil(42/12)=4, vin (14g) -> ceil(42/14)=3
    const plan = buildPourPlan({
      totalGramsAlcohol: 84,
      categories: [category('ol', 12), category('vin', 14)],
      bars: [bar('a')],
    })

    expect(plan.categories).toEqual([
      { id: 'ol', icon: '🍺', label: 'ol', count: 4 },
      { id: 'vin', icon: '🍺', label: 'vin', count: 3 },
    ])
  })

  it('distributes one category evenly across bars with no remainder', () => {
    const plan = buildPourPlan({
      totalGramsAlcohol: 48, // ceil(48/12) = 4
      categories: [category('ol', 12)],
      bars: [bar('a'), bar('b'), bar('c'), bar('d')],
    })

    expect(plan.stops.map(s => s.drinks[0]?.count)).toEqual([1, 1, 1, 1])
  })

  it('staggers the remainder so no stop is left with zero total drinks', () => {
    // ol: ceil(3/... ) -> count 3 across 4 bars; vin: count 2 across 4 bars; shot: count 3 across 4 bars
    // (mirrors the scenario that previously left one bar with nothing)
    const plan = buildPourPlan({
      totalGramsAlcohol: 8 * 12, // splits to 3 categories of equal grams-per-unit for a clean count
      categories: [category('ol', 12), category('vin', 12), category('shot', 12)],
      bars: [bar('a'), bar('b'), bar('c'), bar('d')],
    })

    const totalPerStop = plan.stops.map(s => s.drinks.reduce((sum, d) => sum + d.count, 0))
    expect(totalPerStop.every(total => total > 0)).toBe(true)
  })

  it('omits zero-count drinks from a stop instead of listing them', () => {
    const plan = buildPourPlan({
      totalGramsAlcohol: 12, // ceil(12/12) = 1 total unit of "ol", spread across 3 bars
      categories: [category('ol', 12)],
      bars: [bar('a'), bar('b'), bar('c')],
    })

    const nonEmptyStops = plan.stops.filter(s => s.drinks.length > 0)
    expect(nonEmptyStops).toHaveLength(1)
  })

  it('pairs each stop with its own bar', () => {
    const bars = [bar('a'), bar('b')]
    const plan = buildPourPlan({ totalGramsAlcohol: 24, categories: [category('ol', 12)], bars })

    expect(plan.stops.map(s => s.bar.id)).toEqual(['a', 'b'])
  })

  it('returns no stops when there are no bars', () => {
    const plan = buildPourPlan({ totalGramsAlcohol: 24, categories: [category('ol', 12)], bars: [] })

    expect(plan.stops).toEqual([])
  })
})
