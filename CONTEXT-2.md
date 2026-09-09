# Dyngrak – projektkontext (uppdaterad)

En svensk bar-app för Stockholm: mata in vad du druckit hemma, hur länge, vad du väger —
appen räknar ut ditt nuvarande promille och rekommenderar vilka barer du bör besöka och
hur mycket du kan dricka på varje stopp för att nå ditt målpromille utan att spräcka budgeten.

---

## Mål

LLM-funktion som matchar användaren mot barer i Stockholm utifrån:
- Nuvarande BAC-projektion (beräknat från fördrink, tid och kroppsvikt)
- Målpromille
- Budget (billig / medel / dyr)
- Avståndspreferens (nära / längre / spelar ingen roll)
- Valda dryckeskategorier (Öl, Vin, Shot, Cider, Cocktail)
- Stämning och vibe-taggar (fest, mysigt, craft-öl, vin, etc.)

---

## Arkitektur & Flöde

```
[ Användarinput ] (vikt, kön, fördrinkar, starttid, målpromille, dryckesval)
       │
       ▼
[ Lager A: Deterministisk logik ]
  ├─ widmark.ts + bacProjection.ts ──► Beräknar BAC-projektion (promille)
  ├─ places.ts (bars.json) ──────────► Hämtar & avståndsberäknar barer
  ├─ recommendations.ts ─────────────► Bygger bar-rutter per budget-tier
  └─ pourPlan.ts ────────────────────► Allokerar drycker per barstopp
       │
       ▼
[ Frontend: Results.tsx ] ───────────► Visar rutter och stopp omedelbart
       │
       ▼ (asynkront i bakgrunden)
[ Lager B: LLM Matcher ] (Gemini API)
  ├─ systemPrompt.ts ────────────────► Instruktioner (strikt förbud mot promille-räkning)
  └─ matcher.ts ─────────────────────► Analyserar stämning/vibes, rankar & ger motivering
       │
       ▼
[ UI Uppdatering: BarCard.tsx ] ─────► Berikar korten med "✨ AI-tips" och vibe-taggar
```

---

## Komponenter och moduler

### Lager A – BAC-beräkning & Ruttgenerering (ren kod, deterministisk, ej AI)

| Fil | Status | Ansvar |
|-----|--------|--------|
| `src/lib/widmark.ts` | ✅ Klar & Testad | Widmark-formeln: råpromille utifrån gram alkohol, kroppsvikt och kön. Exporterar `calculateCurrentBacFromGrams` och `calculateTargetDrinks`. |
| `src/lib/bacProjection.ts` | ✅ Klar & Testad | **BAC-projektion**: tar fördrink-kvantiteter (`preDrinkQuantities`), starttid och användarprofil — returnerar `currentBac`, `gramsConsumed`, `hoursSinceStart` m.m. Exporterar `projectBac`. |
| `src/lib/pourPlan.ts` | ✅ Klar & Testad | **Pour plan**: fördelar gram alkohol över valda dryckeskategorier och bar-stopp. Exporterar `buildPourPlan`. |
| `src/lib/drinks.ts` | ✅ Klar | Gram-tabeller för `PRE_DRINK_ITEMS` (vad man drack hemma) och `DRINK_CATEGORIES` (vad man ska dricka på krogen). |
| `src/lib/distance.ts` | ✅ Klar | Haversine-formel för beräkning av avstånd mellan GPS-koordinater i meter. |
| `src/lib/places.ts` | ✅ Klar & Testad | Läser in bardata från `/data/bars.json`, beräknar användaravstånd och filtrerar på radie och prisnivåer (`fetchNearbyBars`). |
| `src/lib/recommendations.ts` | ✅ Klar | Skapar bar-rutter för de tre budget-kategorierna (cheap, medium, expensive) med estimerad totalkostnad och antal stopp (`generateRoutes`). |

> **Regel (ändra inte utan anledning):** LLM:en får **aldrig** räkna promille. Bara Lager A gör det.

---

### Lager B – LLM-matchning mot bardatabas ✅ IMPLEMENTERAT OCH VERIFIERAT

En LLM (Google Gemini via API) tar emot användarens beräknade BAC-projektion, målpromille,
budget, avståndspreferens och valda dryckeskategorier tillsammans med ruttens barer
(inklusive deras vibe-taggar) och returnerar motiveringar och rekommenderade drycker i JSON.

| Fil | Status | Ansvar |
|-----|--------|--------|
| `src/lib/matcher.ts` | ✅ Klar & Verifierad | Anropar Gemini API med systemprompt + användardata, hanterar retries (t.ex. 503-fel) och parsear/validerar strikt JSON-svar (`matchBars`). |
| `src/lib/systemPrompt.ts` | ✅ Klar & Verifierad | Systemprompt som instruerar LLM:en om regler (förbud mot promilleräkning), analys av stämning/vibes, max 2 meningars motivering och strikt JSON-schema. |

**LLM-svar är alltid strukturerad JSON** med följande schema:
```json
{
  "recommendations": [
    {
      "bar_id": "string",
      "reason": "string",
      "suggested_drinks": 2
    }
  ]
]
```

**Frontend-integration & Fallback:**
- `Results.tsx` anropar `matchBars` asynkront i en `useEffect` för den valda budget-rutten.
- Under tiden visas en diskret laddindikator: *"AI analyserar stämning och väljer motiveringar..."*.
- När svaret anländer uppdateras respektive `BarCard` med en snygg sektion: `✨ AI-tips: [motivering]`.
- Om API-anropet skulle misslyckas fångas felet upp mjukt utan att krascha sidan — användaren ser ändå den fullständiga rutt- och pour-planen.

---

### Data – Bardatabas

| Fil | Status | Innehåll |
|-----|--------|---------|
| `/data/bars.json` | ✅ Klar | 25 barer i Stockholm med `id`, `name`, `address`, GPS (`lat`, `lng`), `price_level` (1–3), `rating`, `estimated_drink_price_sek`, `google_maps_url` och `vibes` (t.ex. `["mysigt", "craft-öl", "after-work"]`). |
| `src/types/index.ts` | ✅ Klar | TypeScript-definitioner, inklusive `Bar` med fältet `vibes?: string[]`. |
| `tsconfig.json` | ✅ Klar | Konfigurerad med `"include": ["src", "data"]` för sömlös JSON-import. |

---

### Frontend

| Fil | Status | Ansvar |
|-----|--------|--------|
| `src/pages/Landing.tsx` | ✅ Klar | Inmatning av profil (vikt, kön), fördrinkar, tid, målpromille, dryckesval och avståndspreferens. |
| `src/pages/Results.tsx` | ✅ Klar | Visar promillestatus, interaktiva budget-flikar, pour plan per bar, samt asynkron AI-matchning med laddstatus. |
| `src/components/bars/BarCard.tsx` | ✅ Klar | Renderar barinfo, avstånd, betyg, Google Maps-länk, pour plan-allokering, vibe-piller (`#mysigt`) och `aiReason` ("✨ AI-tips"). |
| `src/components/bars/TierSelector.tsx` | ✅ Klar | Flikväljare för budget-tiers (Billig / Medel / Lyx). |
| `src/components/bars/DistanceFilter.tsx` | ✅ Klar | Väljare för avståndspreferens (Nära / Längre / Spelar ingen roll). |
| `src/stores/userStore.ts` | ✅ Klar | Zustand-store för användarprofil med localStorage-persistens. |
| `src/stores/sessionStore.ts` | ✅ Klar | Zustand-store för aktuell beräkningssession (`sessionInput`, `bacResult`). |

---

## Terminologi (använd konsekvent)

**BAC projection** — det live-beräknade promillevärdet baserat på fördrink + tid. Implementeras av `projectBac`.
Undvik: "current BAC", "live promille"

**Widmark formula** — den underliggande fysiologiska matten (gram, vikt, kön, tid).
Undvik: "BAC-beräkning" (för vagt)

**Pour plan** — hur många av varje dryckeskategori man ska ha, och på vilket stopp.
Undvik: drink breakdown, allocation

**Bar route** — en budget-tiers uppsättning rekommenderade stopp + estimerad totalkostnad.
Undvik: itinerary

**Pre-drink items** — vad man drack *hemma* (används för BAC-projektionen).
**Drink categories** — vad man planerar dricka *på baren* (används för pour plan).
Undvik: "drink types" (tvetydigt mellan de två)

---

## Status just nu

- [x] **Widmark-formeln**: implementerad och testad (`widmark.ts`)
- [x] **BAC-projektion**: implementerad och testad (`bacProjection.ts`)
- [x] **Pour plan**: implementerad och testad (`pourPlan.ts`)
- [x] **Bardatabas**: externaliserad till `/data/bars.json` med 25 barer och vibe-taggar
- [x] **Bar-route-generering**: regelbaserad filtrering och budget-tier-logik i `recommendations.ts`
- [x] **LLM-integration (Lager B)**: `matcher.ts` implementerad, ansluten mot Gemini API med retry-logik
- [x] **Systemprompt**: definierad och testad med stöd för vibe-taggar, motiveringar och JSON-schema (`systemPrompt.ts`)
- [x] **Frontend-integration**: `Results.tsx` och `BarCard.tsx` uppdaterade med asynkron laddning, vibe-piller och "✨ AI-tips"
- [x] **Typdefinitioner & Tsconfig**: `Bar.vibes` tillagt i `src/types/index.ts` och `tsconfig.json` inkluderar `data/`
- [x] **Enhetstester**: 25/25 tester passerar (`pourPlan.test.ts`, `places.test.ts`, `userStore.test.ts`, `bacProjection.test.ts`)
- [x] **Bygge**: `tsc && vite build` kompilerar utan fel

---

## Beslut som redan är tagna (ändra inte utan anledning)

1. **LLM:en räknar aldrig promille** — det gör uteslutande Lager A (`widmark.ts` + `bacProjection.ts`).
2. **LLM-svar alltid i JSON** (valideras och struktureras i `matcher.ts`).
3. **Lager A och B är löst kopplade** — `projectBac`, `generateRoutes` och `buildPourPlan` fungerar helt självständigt utan AI. LLM lägger sig ovanpå i gränssnittet för att berika med vibe-analys och motiveringar utan att vara en single-point-of-failure.
4. **Externaliserad bardata** — bardatan ligger i `/data/bars.json` för att enkelt kunna utökas eller ersättas med externa API:er framåt.

---

## Nästa steg (prioritetsordning)

1. **Användarfilter för vibes i UI**: Möjlighet för användaren att aktivt välja eller filtrera på önskad vibe (t.ex. bara visa barer med `#mysigt` eller `#dans`).
2. **Utökad bardatabas**: Lägga till fler barer i fler stadsdelar (Vasastan, Kungsholmen, Östermalm, Gamla Stan) i `/data/bars.json`.
3. **Ruttpersistens och delning**: Möjlighet att spara eller dela kvällens skapade bar-rutt via URL-parametrar eller länk.
