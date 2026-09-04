import type { Gender, BacResult } from '../types'

export const R_FACTOR: Record<Gender, number> = { male: 0.70, female: 0.60 }
export const GRAMS_PER_STANDARD_DRINK = 13
export const METABOLISM_RATE = 0.15

export function standardDrinksToGrams(drinks: number): number {
  return drinks * GRAMS_PER_STANDARD_DRINK
}

interface CurrentBacParams {
  standard_drinks_consumed: number
  weight_kg: number
  gender: Gender
  hours_since_first_drink: number
}

export function calculateCurrentBac(params: CurrentBacParams): number {
  const { standard_drinks_consumed, weight_kg, gender, hours_since_first_drink } = params
  const grams = standardDrinksToGrams(standard_drinks_consumed)
  const raw_bac = grams / (weight_kg * R_FACTOR[gender])
  const metabolized = METABOLISM_RATE * hours_since_first_drink
  return Math.max(0, raw_bac - metabolized)
}

interface CurrentBacFromGramsParams {
  grams_consumed: number
  weight_kg: number
  gender: Gender
  hours_since_first_drink: number
}

export function calculateCurrentBacFromGrams(params: CurrentBacFromGramsParams): number {
  const { grams_consumed, weight_kg, gender, hours_since_first_drink } = params
  const raw_bac = grams_consumed / (weight_kg * R_FACTOR[gender])
  const metabolized = METABOLISM_RATE * hours_since_first_drink
  return Math.max(0, raw_bac - metabolized)
}

interface TargetDrinksParams {
  current_bac: number
  target_bac: number
  weight_kg: number
  gender: Gender
  hours_planned: number
}

export function calculateTargetDrinks(params: TargetDrinksParams): BacResult {
  const { current_bac, target_bac, weight_kg, gender, hours_planned } = params
  const bac_needed = target_bac - current_bac + METABOLISM_RATE * hours_planned
  const grams_needed = Math.max(0, bac_needed * weight_kg * R_FACTOR[gender])
  const additional_drinks = grams_needed / GRAMS_PER_STANDARD_DRINK

  return {
    current_bac,
    target_bac,
    additional_drinks_needed: Math.ceil(additional_drinks),
    total_grams_alcohol: grams_needed,
  }
}
