import { fetchNearbyBars } from './places'
import type { Bar, BarRoute, BacResult, BudgetTier, DistancePreference } from '../types'

interface RouteParams {
  userLat: number
  userLng: number
  bacResult: BacResult
  distancePref: DistancePreference
}

const DISTANCE_RADIUS: Record<DistancePreference, number> = {
  near: 600,
  further: 2000,
  any: 5000,
}

const TIER_PRICE_LEVELS: Record<BudgetTier, number[]> = {
  cheap: [1, 2],
  medium: [2, 3],
  expensive: [3],
}

async function fetchBarsWithAutoExpand(
  userLat: number,
  userLng: number,
  initialRadius: number,
  priceLevels: number[],
  minCount: number,
  ratingThreshold?: number
): Promise<Bar[]> {
  let bars = await fetchNearbyBars(userLat, userLng, initialRadius, priceLevels)
  if (ratingThreshold) {
    bars = bars.filter(b => b.rating >= ratingThreshold).sort((a, b) => b.rating - a.rating)
  }

  // Täckningsgaranti: expandera radie om färre än minCount barer hittas
  if (bars.length < minCount && initialRadius < 2000) {
    let expanded = await fetchNearbyBars(userLat, userLng, 2000, priceLevels)
    if (ratingThreshold) {
      expanded = expanded.filter(b => b.rating >= ratingThreshold).sort((a, b) => b.rating - a.rating)
    }
    if (expanded.length > bars.length) {
      bars = expanded
    }
  }

  if (bars.length < minCount && initialRadius < 5000) {
    let expanded = await fetchNearbyBars(userLat, userLng, 5000, priceLevels)
    if (ratingThreshold) {
      expanded = expanded.filter(b => b.rating >= ratingThreshold).sort((a, b) => b.rating - a.rating)
    }
    if (expanded.length > bars.length) {
      bars = expanded
    }
  }

  return bars
}

export async function generateRoutes(params: RouteParams): Promise<BarRoute[]> {
  const { userLat, userLng, bacResult, distancePref } = params
  const radius = DISTANCE_RADIUS[distancePref]

  const [cheapBars, mediumBars, expensiveBars] = await Promise.all([
    fetchBarsWithAutoExpand(userLat, userLng, radius, TIER_PRICE_LEVELS.cheap, 3),
    fetchBarsWithAutoExpand(userLat, userLng, radius, TIER_PRICE_LEVELS.medium, 3),
    fetchBarsWithAutoExpand(userLat, userLng, radius, TIER_PRICE_LEVELS.expensive, 1, 4.2),
  ])

  const tiers: Array<{ tier: BudgetTier; bars: Bar[]; min_count: number }> = [
    { tier: 'cheap', bars: cheapBars, min_count: 3 },
    { tier: 'medium', bars: mediumBars, min_count: 3 },
    { tier: 'expensive', bars: expensiveBars, min_count: 1 },
  ]

  return tiers
    .filter(({ bars, min_count }) => bars.length >= min_count)
    .map(({ tier, bars }): BarRoute => {
      const selected = bars.slice(0, tier === 'expensive' ? 1 : 4)
      const drinks_per_bar = Math.max(0.5, bacResult.additional_drinks_needed) / selected.length
      const avg_price = selected.reduce((s, b) => s + b.estimated_drink_price_sek, 0) / selected.length
      return {
        tier,
        distance_pref: distancePref,
        bars: selected,
        estimated_total_cost_sek: Math.round(Math.max(0.5, bacResult.additional_drinks_needed) * avg_price),
        estimated_drinks_per_bar: Math.ceil(drinks_per_bar * 10) / 10,
      }
    })
}

