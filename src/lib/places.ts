import { haversineDistance } from './distance'
import type { Bar } from '../types'

// This is the seam: `getMockBars` is a placeholder adapter using a hardcoded
// Stockholm dataset. It's meant to be swapped for a real place-finding/pricing
// adapter (e.g. an AI-driven one) that satisfies the same fetchNearbyBars
// contract — including honoring radius_m and price_levels the way this one does.
export async function fetchNearbyBars(
  userLat: number,
  userLng: number,
  radius_m: number,
  price_levels: number[]
): Promise<Bar[]> {
  return getMockBars(userLat, userLng, radius_m, price_levels)
}

function getMockBars(userLat: number, userLng: number, radius_m: number, price_levels: number[]): Bar[] {
  const mockData: Bar[] = [
    // price_level 1 – billiga barer
    { id: 'm1',  name: 'Kvarnen',             address: 'Tjärhovsgatan 4, Södermalm',       rating: 4.3, price_level: 1, distance_m: 0, lat: 59.3145, lng: 18.0765, google_maps_url: 'https://maps.google.com/?q=Kvarnen+Stockholm',             estimated_drink_price_sek: 65 },
    { id: 'm2',  name: 'Folkbaren',           address: 'Renstiernas gata 30, Södermalm',   rating: 4.2, price_level: 1, distance_m: 0, lat: 59.3138, lng: 18.0842, google_maps_url: 'https://maps.google.com/?q=Folkbaren+Stockholm',           estimated_drink_price_sek: 65 },
    { id: 'm3',  name: 'The Dive Bar',        address: 'Hornsgatan 93, Södermalm',         rating: 4.0, price_level: 1, distance_m: 0, lat: 59.3155, lng: 18.0523, google_maps_url: 'https://maps.google.com/?q=The+Dive+Bar+Stockholm',        estimated_drink_price_sek: 65 },
    { id: 'm4',  name: 'Hornhuset',           address: 'Hornsgatan 143, Södermalm',        rating: 3.9, price_level: 1, distance_m: 0, lat: 59.3168, lng: 18.0482, google_maps_url: 'https://maps.google.com/?q=Hornhuset+Stockholm',           estimated_drink_price_sek: 65 },
    { id: 'm5',  name: 'Pub Anchor',          address: 'Sveavägen 90, Vasastan',           rating: 4.1, price_level: 1, distance_m: 0, lat: 59.3412, lng: 18.0582, google_maps_url: 'https://maps.google.com/?q=Pub+Anchor+Stockholm',          estimated_drink_price_sek: 65 },
    { id: 'm6',  name: 'Snotty Sounds Bar',   address: 'Skånegatan 90, Södermalm',         rating: 4.0, price_level: 1, distance_m: 0, lat: 59.3103, lng: 18.0788, google_maps_url: 'https://maps.google.com/?q=Snotty+Sounds+Bar+Stockholm',   estimated_drink_price_sek: 65 },
    { id: 'm7',  name: 'Nada Bar',            address: 'Nytorgsgatan 34, Södermalm',       rating: 4.2, price_level: 1, distance_m: 0, lat: 59.3125, lng: 18.0812, google_maps_url: 'https://maps.google.com/?q=Nada+Bar+Stockholm',            estimated_drink_price_sek: 65 },
    { id: 'm8',  name: 'Kafé 44',             address: 'Tjärhovsgatan 44, Södermalm',      rating: 3.8, price_level: 1, distance_m: 0, lat: 59.3141, lng: 18.0789, google_maps_url: 'https://maps.google.com/?q=Kafe+44+Stockholm',             estimated_drink_price_sek: 60 },

    // price_level 2 – mellanklass
    { id: 'm9',  name: 'Akkurat',             address: 'Hornsgatan 18, Södermalm',         rating: 4.4, price_level: 2, distance_m: 0, lat: 59.3178, lng: 18.0604, google_maps_url: 'https://maps.google.com/?q=Akkurat+Stockholm',             estimated_drink_price_sek: 85 },
    { id: 'm10', name: 'Södra Bar',           address: 'Mosebacke torg 3, Södermalm',      rating: 4.3, price_level: 2, distance_m: 0, lat: 59.3195, lng: 18.0759, google_maps_url: 'https://maps.google.com/?q=Sodra+Bar+Stockholm',           estimated_drink_price_sek: 85 },
    { id: 'm11', name: 'Mälarpaviljongen',    address: 'Norr Mälarstrand 64, Kungsholmen', rating: 4.2, price_level: 2, distance_m: 0, lat: 59.3298, lng: 18.0432, google_maps_url: 'https://maps.google.com/?q=Malarpaviljongen+Stockholm',    estimated_drink_price_sek: 90 },
    { id: 'm12', name: 'Landet',              address: 'Johan Enbergs väg 12, Liljeholmen',rating: 4.1, price_level: 2, distance_m: 0, lat: 59.3083, lng: 18.0209, google_maps_url: 'https://maps.google.com/?q=Landet+Stockholm',              estimated_drink_price_sek: 85 },
    { id: 'm13', name: 'Bonden',              address: 'Bondegatan 28, Södermalm',         rating: 4.2, price_level: 2, distance_m: 0, lat: 59.3137, lng: 18.0823, google_maps_url: 'https://maps.google.com/?q=Bonden+Stockholm',              estimated_drink_price_sek: 85 },
    { id: 'm14', name: 'Debaser Strand',      address: 'Hornstulls Strand 4, Södermalm',   rating: 4.3, price_level: 2, distance_m: 0, lat: 59.3162, lng: 18.0353, google_maps_url: 'https://maps.google.com/?q=Debaser+Strand+Stockholm',      estimated_drink_price_sek: 90 },
    { id: 'm15', name: 'Omnipollos Hatt',     address: 'Hökens gata 1, Södermalm',         rating: 4.5, price_level: 2, distance_m: 0, lat: 59.3192, lng: 18.0746, google_maps_url: 'https://maps.google.com/?q=Omnipollos+Hatt+Stockholm',     estimated_drink_price_sek: 95 },
    { id: 'm16', name: 'Koh Phangan',         address: 'Skånegatan 57, Södermalm',         rating: 4.0, price_level: 2, distance_m: 0, lat: 59.3108, lng: 18.0764, google_maps_url: 'https://maps.google.com/?q=Koh+Phangan+Stockholm',         estimated_drink_price_sek: 85 },
    { id: 'm17', name: 'Berns Salonger',      address: 'Berzelii Park, Norrmalm',          rating: 4.1, price_level: 2, distance_m: 0, lat: 59.3321, lng: 18.0721, google_maps_url: 'https://maps.google.com/?q=Berns+Salonger+Stockholm',      estimated_drink_price_sek: 90 },
    { id: 'm18', name: 'Trädgården',          address: 'Hammarby slussväg 2, Södermalm',   rating: 4.2, price_level: 2, distance_m: 0, lat: 59.3148, lng: 18.0861, google_maps_url: 'https://maps.google.com/?q=Tradgarden+Stockholm',          estimated_drink_price_sek: 85 },

    // price_level 3 – dyrare / finlir-kandidater
    { id: 'm19', name: 'Restaurang AG',       address: 'Kronobergsgatan 37, Kungsholmen',  rating: 4.6, price_level: 3, distance_m: 0, lat: 59.3345, lng: 18.0456, google_maps_url: 'https://maps.google.com/?q=Restaurang+AG+Stockholm',       estimated_drink_price_sek: 105 },
    { id: 'm20', name: 'Bar Agrikultur',      address: 'Bondegatan 1, Södermalm',          rating: 4.5, price_level: 3, distance_m: 0, lat: 59.3142, lng: 18.0801, google_maps_url: 'https://maps.google.com/?q=Bar+Agrikultur+Stockholm',      estimated_drink_price_sek: 110 },
    { id: 'm21', name: 'Operakällaren Bar',   address: 'Karl XII:s torg, Norrmalm',        rating: 4.5, price_level: 3, distance_m: 0, lat: 59.3303, lng: 18.0700, google_maps_url: 'https://maps.google.com/?q=Operakallaren+Stockholm',       estimated_drink_price_sek: 120 },
    { id: 'm22', name: 'Lilla Ego',           address: 'Västmannagatan 69, Vasastan',      rating: 4.6, price_level: 3, distance_m: 0, lat: 59.3418, lng: 18.0525, google_maps_url: 'https://maps.google.com/?q=Lilla+Ego+Stockholm',           estimated_drink_price_sek: 110 },
    { id: 'm23', name: 'Sturehof',            address: 'Stureplan 2, Östermalm',           rating: 4.4, price_level: 3, distance_m: 0, lat: 59.3356, lng: 18.0748, google_maps_url: 'https://maps.google.com/?q=Sturehof+Stockholm',            estimated_drink_price_sek: 115 },
    { id: 'm24', name: 'Grodan',              address: 'Grev Turegatan 16, Östermalm',     rating: 4.3, price_level: 3, distance_m: 0, lat: 59.3363, lng: 18.0763, google_maps_url: 'https://maps.google.com/?q=Grodan+Stockholm',              estimated_drink_price_sek: 110 },
    { id: 'm25', name: 'Teatern Hornstull',   address: 'Hornstulls Strand 4, Södermalm',   rating: 4.3, price_level: 3, distance_m: 0, lat: 59.3160, lng: 18.0348, google_maps_url: 'https://maps.google.com/?q=Teatern+Hornstull+Stockholm',   estimated_drink_price_sek: 110 },
  ]

  return mockData
    .filter(b => price_levels.includes(b.price_level))
    .map(b => ({ ...b, distance_m: haversineDistance(userLat, userLng, b.lat, b.lng) }))
    .filter(b => b.distance_m <= radius_m)
    .sort((a, b) => a.distance_m - b.distance_m)
}
