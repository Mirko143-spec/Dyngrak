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

### Lager B – LLM-matchning mot bardatabas ← EJ IMPLEMENTERAT

**Mål:** En LLM (via lärarens API) tar emot användarens BAC-projektion, målpromille,
budget och avståndspreferens och returnerar en rankad lista med rekommenderade barer i JSON.

| Fil | Status | Ansvar |
|-----|--------|--------|
| `src/lib/matcher.ts` | ✅ Klar | Anropar LLM-API med systemprompt + användardata, parsear JSON-svar |
| `src/lib/systemPrompt.ts` | ✅ Klar | Systemprompt som instruerar LLM:en om vad den ska och inte ska göra |

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
| `src/lib/places.ts` | 25 hårdkodade mock-barer | Namn, adress, GPS, price_level (1–3), rating, estimerat drinkpris |
| `/data/bars.json` | Saknas | Tänkt extern JSON-fil med vibe-taggar (fest, mysigt, sport, m.m.) |

**OBS:** Vibe-taggar saknas helt i nuvarande datastruktur — behövs för att LLM:en ska kunna matcha stämning.

---

### Frontend

| Fil | Status |
|-----|--------|
| `src/pages/Landing.tsx` | Påbörjad – fördrinksinmatning, profil, starttid |
| `src/pages/Results.tsx` | Påbörjad – visar bar-rutter och pour plan |
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
- [x] Bardatabas: 25 mock-barer i places.ts
- [x] Bar-route-generering: regelbaserad filtrering i recommendations.ts
- [x] Frontend påbörjad: Landing + Results + komponenter
- [x] Tester: bacProjection.test.ts, pourPlan.test.ts, places.test.ts, userStore.test.ts
- [ ] Vibe-taggar på barer saknas
- [x] LLM-integration (Lager B): matcher.ts implementerad
- [x] Systemprompt: skriven (systemPrompt.ts)
- [ ] /data/bars.json: barlistan är hårdkodad i .ts, ej externaliserad

---

## Beslut som redan är tagna (ändra inte utan anledning)

1. LLM:en räknar **aldrig** promille — det gör bara Lager A (widmark.ts + bacProjection.ts)
2. LLM-svar alltid i JSON (schema definieras i matcher.ts)
3. `projectBac` och `buildPourPlan` är oberoende av varandra — LLM lägger sig ovanpå, inte emellan

---

## Nästa steg (prioritetsordning)

1. **Lägg till vibe-taggar** på mock-barerna i places.ts (t.ex. vibes: ['fest', 'mysigt'])
2. **Skriv systemprompt** i src/lib/systemPrompt.ts — instruera LLM att returnera JSON, aldrig räkna promille
3. **Implementera matcher.ts** — anrop till lärarens API med BAC-data + barlista + systemprompt
4. **Testa matchningen** mot 3–4 olika användarscenarier (nykter, lätt berusad, hög budget, låg budget)
5. **Externalisera bardatan** till /data/bars.json om LLM:en ska kunna läsa den direkt
