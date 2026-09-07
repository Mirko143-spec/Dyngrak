import type { Bar, DrinkCategory } from '../types'

export interface PourPlanDrink {
  id: string
  icon: string
  label: string
  count: number
}

export interface PourPlanStop {
  bar: Bar
  drinks: PourPlanDrink[]
}

export interface PourPlan {
  categories: PourPlanDrink[]
  stops: PourPlanStop[]
}

interface BuildPourPlanInput {
  totalGramsAlcohol: number
  categories: DrinkCategory[]
  bars: Bar[]
}

// Spread a drink type's count as evenly as possible across the bars on the route.
// The starting bar for each type's "remainder" unit is staggered so a short route
// doesn't end up with a stop that gets none of any type.
function distributeAcrossBars(count: number, barCount: number, offset: number): number[] {
  if (barCount <= 0) return []
  const base = Math.floor(count / barCount)
  const remainder = count % barCount
  return Array.from({ length: barCount }, (_, i) => base + ((i - offset + barCount) % barCount < remainder ? 1 : 0))
}

export function buildPourPlan({ totalGramsAlcohol, categories, bars }: BuildPourPlanInput): PourPlan {
  // Split the remaining grams evenly across the chosen drink types, then round each up to whole units.
  const categoryCounts: PourPlanDrink[] = categories.map(c => ({
    id: c.id,
    icon: c.icon,
    label: c.label,
    count: Math.ceil(totalGramsAlcohol / categories.length / c.grams),
  }))

  const perCategoryPerBar = categoryCounts.map((c, i) => distributeAcrossBars(c.count, bars.length, i))

  const stops: PourPlanStop[] = bars.map((bar, barIndex) => ({
    bar,
    drinks: categoryCounts
      .map((c, catIndex) => ({ ...c, count: perCategoryPerBar[catIndex][barIndex] ?? 0 }))
      .filter(d => d.count > 0),
  }))

  return { categories: categoryCounts, stops }
}
