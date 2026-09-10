import { haversineDistance } from './distance'
import type { Bar } from '../types'
import barsJson from '../../data/bars.json'

// This is the seam: `getMockBars` uses the externalized Stockholm dataset in data/bars.json.
// It's meant to be swapped for a real place-finding/pricing adapter (e.g. an AI-driven one)
// that satisfies the same fetchNearbyBars contract — including honoring radius_m and price_levels.
export async function fetchNearbyBars(
  userLat: number,
  userLng: number,
  radius_m: number,
  price_levels: number[]
): Promise<Bar[]> {
  return getMockBars(userLat, userLng, radius_m, price_levels)
}

export function isWithinCoverage(userLat: number, userLng: number, maxRadiusMeters: number = 5000): boolean {
  const mockBars: Omit<Bar, 'distance_m'>[] = barsJson as unknown as Omit<Bar, 'distance_m'>[]
  return mockBars.some(b => haversineDistance(userLat, userLng, b.lat, b.lng) <= maxRadiusMeters)
}

function getMockBars(userLat: number, userLng: number, radius_m: number, price_levels: number[]): Bar[] {
  const mockData: Bar[] = (barsJson as unknown as Omit<Bar, 'distance_m'>[]).map(b => ({
    ...b,
    distance_m: 0,
  }))

  return mockData
    .filter(b => price_levels.includes(b.price_level))
    .map(b => ({ ...b, distance_m: haversineDistance(userLat, userLng, b.lat, b.lng) }))
    .filter(b => b.distance_m <= radius_m)
    .sort((a, b) => a.distance_m - b.distance_m)
}

