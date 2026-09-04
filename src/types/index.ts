export type Gender = 'male' | 'female'

export interface UserProfile {
  id: string
  user_id: string
  name?: string
  weight_kg: number
  gender: Gender
  created_at: string
}

export interface PreDrink {
  standard_drinks: number
  started_at: Date
}

export interface SessionInput {
  pre_drink: PreDrink | null
  target_bac: number
  hours_planned: number
  drink_categories?: string[]
  distance_pref?: DistancePreference
}

export interface PreDrinkItem {
  id: string
  label: string
  volume: string
  grams: number
}

export interface DrinkCategory {
  id: string
  label: string
  icon: string
  grams: number
  priceIndex: number
  description: string
}

export interface BacResult {
  current_bac: number
  target_bac: number
  additional_drinks_needed: number
  total_grams_alcohol: number
}

export type BudgetTier = 'cheap' | 'medium' | 'expensive'
export type DistancePreference = 'near' | 'further' | 'any'

export interface Bar {
  id: string
  name: string
  address: string
  rating: number
  price_level: number
  distance_m: number
  lat: number
  lng: number
  google_maps_url: string
  estimated_drink_price_sek: number
}

export interface BarRoute {
  tier: BudgetTier
  distance_pref: DistancePreference
  bars: Bar[]
  estimated_total_cost_sek: number
  estimated_drinks_per_bar: number
}
