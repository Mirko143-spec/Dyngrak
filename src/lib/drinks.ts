import type { PreDrinkItem, DrinkCategory } from '../types'

export const PRE_DRINK_ITEMS: PreDrinkItem[] = [
  { id: 'starkol', label: 'Starköl', volume: '33 cl', grams: 12 },
  { id: 'storstark', label: 'Storstark', volume: '50 cl', grams: 18 },
  { id: 'vin', label: 'Vin', volume: '15 cl', grams: 14 },
  { id: 'shot', label: 'Shot', volume: '4 cl', grams: 13 },
  { id: 'drink', label: 'Drink', volume: '', grams: 16 },
]

export const DRINK_CATEGORIES: DrinkCategory[] = [
  { id: 'ol', label: 'Öl', icon: '🍺', grams: 12, priceIndex: 1, description: 'Öl: 33 cl starköl ≈ 12 g ren alkohol, prisindex ×1' },
  { id: 'cider', label: 'Cider', icon: '🍏', grams: 14, priceIndex: 1.1, description: 'Cider: 33 cl ≈ 14 g ren alkohol, prisindex ×1,1' },
  { id: 'vin', label: 'Vin', icon: '🍷', grams: 14, priceIndex: 1.2, description: 'Vin: 15 cl glas ≈ 14 g ren alkohol, prisindex ×1,2' },
  { id: 'bubbel', label: 'Bubbel', icon: '🍾', grams: 12, priceIndex: 1.5, description: 'Bubbel: 12 cl glas ≈ 12 g ren alkohol, prisindex ×1,5' },
  { id: 'cocktail', label: 'Cocktail', icon: '🍸', grams: 16, priceIndex: 2, description: 'Cocktail: ≈ 16 g ren alkohol, prisindex ×2' },
  { id: 'shot', label: 'Shot', icon: '🥃', grams: 13, priceIndex: 0.8, description: 'Shot: 4 cl ≈ 13 g ren alkohol, prisindex ×0,8' },
]
