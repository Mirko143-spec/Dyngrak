/**
 * Tester för matcher.ts
 *
 * Tre nivåer:
 *  1. Enhetstester – mockad fetch, kontrollerar att svaret parseas korrekt
 *  2. Feltester    – kontrollerar att fel-sökvägar ger tydliga felmeddelanden
 *  3. Live smoke-test – ett riktigt API-anrop mot Gemini (körs sist)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { matchBars } from './matcher'
import type { Bar, BudgetTier, DistancePreference } from '../types'

// ─── Testdata ────────────────────────────────────────────────────────────────

const SAMPLE_BARS: Bar[] = [
  {
    id: 'm1',
    name: 'Kvarnen',
    address: 'Tjärhovsgatan 4, Södermalm',
    rating: 4.3,
    price_level: 1,
    distance_m: 350,
    lat: 59.3145,
    lng: 18.0765,
    google_maps_url: 'https://maps.google.com/?q=Kvarnen+Stockholm',
    estimated_drink_price_sek: 65,
  },
  {
    id: 'm9',
    name: 'Akkurat',
    address: 'Hornsgatan 18, Södermalm',
    rating: 4.4,
    price_level: 2,
    distance_m: 480,
    lat: 59.3178,
    lng: 18.0604,
    google_maps_url: 'https://maps.google.com/?q=Akkurat+Stockholm',
    estimated_drink_price_sek: 85,
  },
  {
    id: 'm15',
    name: 'Omnipollos Hatt',
    address: 'Hökens gata 1, Södermalm',
    rating: 4.5,
    price_level: 2,
    distance_m: 520,
    lat: 59.3192,
    lng: 18.0746,
    google_maps_url: 'https://maps.google.com/?q=Omnipollos+Hatt+Stockholm',
    estimated_drink_price_sek: 95,
  },
]

const BASE_INPUT = {
  currentBac: 0.3,
  targetBac: 0.8,
  budget: 'cheap' as BudgetTier,
  distancePref: 'near' as DistancePreference,
  drinkCategories: ['Öl', 'Cider'],
  bars: SAMPLE_BARS,
}

// ─── Hjälpare: bygg ett fejkat Gemini-API-svar ───────────────────────────────

function makeFakeApiResponse(jsonContent: string) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [
        {
          content: {
            parts: [{ text: jsonContent }],
          },
        },
      ],
    }),
  } as unknown as Response
}

// ─── Enhetstester (mockad fetch) ─────────────────────────────────────────────

describe('matchBars – enhetstester (mockad fetch)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_LLM_API_KEY', 'test-key')
    vi.stubEnv('VITE_LLM_API_URL', 'https://example.com/api')
    vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('returnerar tom lista direkt om inga barer skickas in', async () => {
    const result = await matchBars({ ...BASE_INPUT, bars: [] })
    expect(result.recommendations).toHaveLength(0)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('parsear ett korrekt JSON-svar från LLM:en', async () => {
    const fakeJson = JSON.stringify({
      recommendations: [
        { bar_id: 'm1', reason: 'Billig och nära.', suggested_drinks: 2 },
        { bar_id: 'm9', reason: 'Bra öl-urval.', suggested_drinks: 1 },
      ],
    })
    vi.mocked(fetch).mockResolvedValueOnce(makeFakeApiResponse(fakeJson))

    const result = await matchBars(BASE_INPUT)

    expect(result.recommendations).toHaveLength(2)
    expect(result.recommendations[0].bar_id).toBe('m1')
    expect(result.recommendations[0].suggested_drinks).toBe(2)
    expect(typeof result.recommendations[0].reason).toBe('string')
  })

  it('hanterar att LLM:en lindar JSON i markdown-kodblock', async () => {
    const fakeJson =
      '```json\n' +
      JSON.stringify({
        recommendations: [
          { bar_id: 'm15', reason: 'Craft-öl i toppklass.', suggested_drinks: 3 },
        ],
      }) +
      '\n```'

    vi.mocked(fetch).mockResolvedValueOnce(makeFakeApiResponse(fakeJson))

    const result = await matchBars(BASE_INPUT)
    expect(result.recommendations[0].bar_id).toBe('m15')
  })

  it('kastar fel om LLM:en returnerar ogiltig JSON', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFakeApiResponse('Det här är ingen JSON alls!')
    )
    await expect(matchBars(BASE_INPUT)).rejects.toThrow('ogiltig JSON')
  })

  it('kastar fel om recommendations-arrayen saknas i svaret', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFakeApiResponse(JSON.stringify({ something_else: [] }))
    )
    await expect(matchBars(BASE_INPUT)).rejects.toThrow('recommendations')
  })

  it('kastar fel om API returnerar HTTP-fel (t.ex. 429)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: async () => 'Rate limit exceeded',
    } as unknown as Response)

    await expect(matchBars(BASE_INPUT)).rejects.toThrow('429')
  })

  it('kastar fel om VITE_LLM_API_KEY saknas', async () => {
    // Stuba till tomma strängar – vi.unstubAllEnvs() räcker inte när
    // vite.config sätter env som fallback via process.env
    vi.stubEnv('VITE_LLM_API_KEY', '')
    vi.stubEnv('VITE_LLM_API_URL', '')
    await expect(matchBars(BASE_INPUT)).rejects.toThrow('VITE_LLM_API_KEY')
  })
})

// ─── Live smoke-test mot riktigt Gemini-API ───────────────────────────────────
//
// Hoppar automatiskt över om VITE_LLM_API_KEY inte är definierad (t.ex. CI).

describe('matchBars – live smoke-test (riktigt API-anrop)', () => {
  const apiKey = import.meta.env.VITE_LLM_API_KEY as string | undefined
  const apiUrl = import.meta.env.VITE_LLM_API_URL as string | undefined
  const shouldSkip = !apiKey || !apiUrl

  it.skipIf(shouldSkip)(
    'anropar Gemini och returnerar rankade bar-rekommendationer',
    async () => {
      const result = await matchBars({
        currentBac: 0.4,
        targetBac: 0.8,
        budget: 'medium',
        distancePref: 'near',
        drinkCategories: ['Öl', 'Cocktail'],
        bars: SAMPLE_BARS,
      })

      expect(Array.isArray(result.recommendations)).toBe(true)
      expect(result.recommendations.length).toBeGreaterThan(0)
      expect(result.recommendations.length).toBeLessThanOrEqual(4)

      for (const rec of result.recommendations) {
        expect(typeof rec.bar_id).toBe('string')
        expect(rec.bar_id.length).toBeGreaterThan(0)
        expect(typeof rec.reason).toBe('string')
        expect(rec.reason.length).toBeGreaterThan(0)
        expect(typeof rec.suggested_drinks).toBe('number')
        expect(rec.suggested_drinks).toBeGreaterThanOrEqual(1)

        const validIds = SAMPLE_BARS.map(b => b.id)
        expect(validIds).toContain(rec.bar_id)
      }

      console.log('\n✅ Live LLM-svar:\n', JSON.stringify(result, null, 2))
    },
    30_000
  )
})
