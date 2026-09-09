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

## Arkitektur

### Lager A – BAC-beräkning (ren kod, ej AI)

| Fil | Ansvar |
|-----|--------|
| `src/lib/widmark.ts` | Widmark-formeln: råpromille utifrån gram alkohol, kroppsvikt och kön. Exporterar `calculateCurrentBacFromGrams` och `calculateTargetDrinks`. |
| `src/lib/bacProjection.ts` | **BAC-projektion**: tar fördrink-kvantiteter (`preDrinkQuantities`), starttid och användarprofil — returnerar `currentBac`, `gramsConsumed`, `hoursSinceStart` m.m. Bygger på widmark. Exporterar `projectBac`. |
| `src/lib/pourPlan.ts` | **Pour plan**: fördelar gram alkohol över valda dryckeskategorier och bar-stopp. Exporterar `buildPourPlan`. |
| `src/lib/drinks.ts` | Gram-tabeller för `PRE_DRINK_ITEMS` (vad man drack hemma) och `DRINK_CATEGORIES` (vad man ska dricka på krogen). |
| `src/lib/distance.ts` | Haversine-avstånd mellan GPS-koordinater. |

> **Regel (ändra inte utan anledning):** LLM:en får **aldrig** räkna promille. Bara Lager A gör det.

---

### Lager B – LLM-matchning mot bardatabas ✅ IMPLEMENTERAT OCH VERIFIERAT

**Mål:** En LLM (via lärarens API) tar emot användarens BAC-projektion, målpromille,
budget, avståndspreferens och valda dryckeskategorier tillsammans med filtrerade barer
(inklusive deras vibe-taggar) och returnerar en rankad lista med rekommenderade barer i JSON.

| Fil | Status | Ansvar |
|-----|--------|--------|
| `src/lib/matcher.ts` | ✅ Klar & Verifierad | Anropar LLM-API med systemprompt + användardata, hanterar retries och parsear JSON-svar |
| `src/lib/systemPrompt.ts` | ✅ Klar & Verifierad | Systemprompt som instruerar LLM:en om vad den ska och inte ska göra (inkl. stämning/vibes) |

**LLM-svar ska alltid vara JSON** med följande schema (att definiera i `matcher.ts`):
```json
{
  "recommendations": [
    {
      "bar_id": "string",
      "reason": "string",
      "suggested_drinks": 2
    }
  ]
}
```

---

### Data – Bardatabas

| Fil | Status | Innehåll |
|-----|--------|---------|
| `src/lib/places.ts` | ✅ Klar | Läser från `/data/bars.json`, beräknar avstånd och filtrerar på radius/pris |
| `/data/bars.json` | ✅ Klar | 25 barer i Stockholm med namn, adress, GPS, price_level, rating, pris och `vibes` |

---

### Frontend

| Fil | Status |
|-----|--------|
| `src/pages/Landing.tsx` | ✅ Klar – fördrinksinmatning, profil, starttid, mål och dryckesval |
| `src/pages/Results.tsx` | ✅ Klar – visar bar-rutter, pour plan, vibe-taggar och live AI-tips från matcher.ts |
| `src/components/bars/BarCard.tsx` | ✅ Klar – renderar barinfo, vibe-piller (`#mysigt`) och `aiReason` ("✨ AI-tips") |
| `src/components/` | Komponentmappar: bars, calculator, hero, layout, ui |
| `src/stores/userStore.ts` | Zustand-store för användarprofil och session |

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

- [x] Widmark-formeln implementerad och testad (widmark.ts)
- [x] BAC-projektion implementerad och testad (bacProjection.ts)
- [x] Pour plan implementerad och testad (pourPlan.ts)
- [x] Bardatabas externaliserad till /data/bars.json med 25 barer och vibe-taggar
- [x] Bar-route-generering: regelbaserad filtrering i recommendations.ts
- [x] LLM-integration (Lager B): matcher.ts implementerad och verifierad mot Gemini API
- [x] Systemprompt: skriven och testad med stöd för stämning/vibes (systemPrompt.ts)
- [x] Frontend: Landing + Results + BarCard uppdaterade med vibe-taggar och AI-rekommendationer
- [x] Tester: bacProjection.test.ts, pourPlan.test.ts, places.test.ts, userStore.test.ts

---

## Beslut som redan är tagna (ändra inte utan anledning)

1. LLM:en räknar **aldrig** promille — det gör bara Lager A (widmark.ts + bacProjection.ts)
2. LLM-svar alltid i JSON (schema definieras i matcher.ts)
3. `projectBac` och `buildPourPlan` är oberoende av varandra — LLM lägger sig ovanpå, inte emellan

---

## Nästa steg (prioritetsordning)

1. **Användartestning och finjustering av gränssnittet** (t.ex. filter på specifika vibes i sökningen)
2. **Ytterligare barer och områden** (utöka /data/bars.json med fler stadsdelar utanför Södermalm/City)
3. **Persistens eller delning av kvällens bar-rutt** (t.ex. exportera eller spara rutt i session/URL)
