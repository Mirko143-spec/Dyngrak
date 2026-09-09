/**
 * Lager B – LLM-matchning mot bardatabasen.
 *
 * Anropar lärarens Gemini-API med:
 *  - en systemprompt (systemPrompt.ts) som förbjuder LLM:en att räkna promille
 *  - användarens BAC-projektion (redan beräknad av Lager A), målpromille,
 *    budget, avståndspreferens och valda dryckeskategorier
 *  - en filtrerad barlista (max MAX_BARS_TO_LLM barer)
 *
 * Returnerar en rankad lista med LlmRecommendation-objekt.
 *
 * Regel (ändra inte utan anledning): LLM:en räknar ALDRIG promille.
 * Bara Lager A (widmark.ts + bacProjection.ts) gör det.
 */

import type { Bar, BudgetTier, DistancePreference } from '../types'
import { SYSTEM_PROMPT } from './systemPrompt'

// ─── Publika typer ────────────────────────────────────────────────────────────

/** En enskild bar-rekommendation från LLM:en. */
export interface LlmRecommendation {
  bar_id: string
  reason: string
  suggested_drinks: number
}

/** Det fullständiga JSON-schema som LLM:en förväntas returnera. */
export interface LlmMatchResult {
  recommendations: LlmRecommendation[]
}

/** Allt som matchBars behöver för att bygga sin prompt. */
export interface MatchInput {
  /** BAC-projektion från Lager A — LLM:en räknar detta ALDRIG själv. */
  currentBac: number
  /** Användarens önskade slutpromille. */
  targetBac: number
  /** Budgetkategori: cheap | medium | expensive. */
  budget: BudgetTier
  /** Avståndspreferens: near | further | any. */
  distancePref: DistancePreference
  /** Valda dryckeskategorier, t.ex. ['Öl', 'Vin']. */
  drinkCategories: string[]
  /** Förfiltrerade barer (från fetchNearbyBars / generateRoutes). */
  bars: Bar[]
}

// ─── Interna konstanter ───────────────────────────────────────────────────────

/** Max antal barer som skickas till LLM:en (håller token-kostnad nere). */
const MAX_BARS_TO_LLM = 10


// ─── Hjälpfunktioner ──────────────────────────────────────────────────────────

/**
 * Bygger den användar-del av prompten som skickas till LLM:en.
 * Observera: currentBac och targetBac är redan beräknade av Lager A och
 * presenteras här som fakta — LLM:en behöver inte (och ska inte) räkna om dem.
 */
function buildUserPrompt(input: MatchInput): string {
  const barsPayload = input.bars
    .slice(0, MAX_BARS_TO_LLM)
    .map(b => ({
      id: b.id,
      name: b.name,
      address: b.address,
      rating: b.rating,
      price_level: b.price_level,
      distance_m: Math.round(b.distance_m),
      estimated_drink_price_sek: b.estimated_drink_price_sek,
      vibes: b.vibes ?? [],
    }))

  return JSON.stringify({
    current_bac: input.currentBac,
    target_bac: input.targetBac,
    budget: input.budget,
    distance_preference: input.distancePref,
    drink_categories: input.drinkCategories,
    bars: barsPayload,
  })
}

/**
 * Parsear LLM-svaret till LlmMatchResult.
 * Kastar ett tydligt fel om svaret inte uppfyller det förväntade schemat.
 */
function parseResponse(raw: string): LlmMatchResult {
  let parsed: unknown
  try {
    // Gemini kan ibland omge JSON med ```json … ``` — ta bort det
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(`matcher: LLM returnerade ogiltig JSON: ${raw.slice(0, 200)}`)
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !Array.isArray((parsed as Record<string, unknown>).recommendations)
  ) {
    throw new Error('matcher: LLM-svar saknar "recommendations"-array')
  }

  const result = parsed as LlmMatchResult

  for (const rec of result.recommendations) {
    if (
      typeof rec.bar_id !== 'string' ||
      typeof rec.reason !== 'string' ||
      typeof rec.suggested_drinks !== 'number'
    ) {
      throw new Error('matcher: Ogiltigt fält i recommendations-objekt')
    }
  }

  return result
}

// ─── Publik API ───────────────────────────────────────────────────────────────

/**
 * Matchar användaren mot en förfiltrerad barlista via LLM.
 *
 * @param input - BAC-projektion (från Lager A), preferences och barlista
 * @returns Rankad lista med LlmRecommendation-objekt
 * @throws Om API-anropet misslyckas eller LLM:en returnerar ogiltig JSON
 */
export async function matchBars(input: MatchInput): Promise<LlmMatchResult> {
  const apiKey = (import.meta.env.VITE_LLM_API_KEY as string | undefined)?.trim() ?? ''
  const apiUrl = (import.meta.env.VITE_LLM_API_URL as string | undefined)?.trim() ?? ''

  if (!apiKey || !apiUrl) {
    throw new Error(
      'matcher: VITE_LLM_API_KEY eller VITE_LLM_API_URL saknas i miljövariablerna'
    )
  }

  if (input.bars.length === 0) {
    return { recommendations: [] }
  }

  const userPrompt = buildUserPrompt(input)

  const requestBody = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.4,
      maxOutputTokens: 4096,
    },
  }

  let response: Response | null = null
  const MAX_RETRIES = 2

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (response.ok) break

    // Tillfällig överbelastning hos Gemini (503) – vänta och försök igen
    if (response.status === 503 && attempt < MAX_RETRIES) {
      await new Promise(res => setTimeout(res, 1500 * (attempt + 1)))
      continue
    }

    break
  }

  if (!response || !response.ok) {
    const status = response?.status ?? 0
    const statusText = response?.statusText ?? 'Unknown'
    const errorText = (await response?.text().catch(() => '<tomt svar>')) ?? '<tomt svar>'
    throw new Error(
      `matcher: API-anrop misslyckades (${status} ${statusText}): ${errorText.slice(0, 300)}`
    )
  }

  const data = await response.json()

  // Gemini-svarsstruktur: candidates[0].content.parts[0].text
  const rawText: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!rawText) {
    throw new Error('matcher: Tomt eller oväntat svar från LLM-API:t')
  }

  return parseResponse(rawText)
}
