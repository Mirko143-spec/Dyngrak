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
| `src/pages/Results.tsx` | ✅ Klar | Visar promillestatus, interaktiva budget-flikar, pour plan per bar, samt asynkron AI-matchning med laddstatus. Hanterar platsåtkomst med automatisk fallback till standardplats (T-Centralen) vid nekad åtkomst eller avsaknad av närliggande barer. |
| `src/components/bars/BarCard.tsx` | ✅ Klar | Renderar barinfo, avstånd, betyg, Google Maps-länk, pour plan-allokering, vibe-piller (`#mysigt`) och `aiReason` ("✨ AI-tips"). |
| `src/components/bars/TierSelector.tsx` | ✅ Klar | Flikväljare för budget-tiers (Billig / Medel / Lyx). |
| `src/components/bars/DistanceFilter.tsx` | ✅ Klar | Väljare för avståndspreferens (Nära / Längre / Spelar ingen roll). |
| `src/stores/userStore.ts` | ✅ Klar | Zustand-store för användarprofil med localStorage-persistens. |
| `src/stores/sessionStore.ts` | ✅ Klar | Zustand-store för aktuell beräkningssession (`sessionInput`, `bacResult`). |

---

### Geolocation, Standardplats & Demoläge (Instruktioner & Arkitektur)

För att appen och AI-matchningen ska kunna testas oavsett var utvecklaren eller användaren befinner sig fysiskt:

1. **Ingen IP-adress behövs**:
   - Webbläsarens `navigator.geolocation` levererar GPS-koordinater (`latitude` och `longitude`). Ingen IP-adresslagring eller IP-geolokalisering krävs.
2. **Standardplats (Default Coordinates)**:
   - T-Centralen / Sergels torg: `{ lat: 59.3293, lng: 18.0686 }`.
   - Detta är den centrala knutpunkten i Stockholm som appen utgår ifrån som standard.
3. **Automatisk fallback-logik**:
   - Om användaren **nekar** platsåtkomst i webbläsaren: Appen använder automatiskt standardplatsen.
   - Om användaren **tillåter** platsåtkomst men befinner sig utanför täckning (> 5 km från närmsta bar i databasen, så att 0 barer hittas): Appen växlar automatiskt över till standardplatsen vid T-Centralen.
   - Ett informationsfält visas för användaren: *"Inga barer hittades i din fysiska närhet — visar barer runt T-Centralen, Stockholm i demoläge."*
4. **Testbarhet**:
   - Denna logik säkerställer att utvecklare alltid kan köra `npm run dev` och testa hela flödet (inklusive Lager B Gemini AI-matchningen) utan att behöva mocka webbläsarens sensorer manuellt.

---

## Terminologi & Begrepp (använd konsekvent)

*Dyngrak: A Swedish blood-alcohol calculator and Stockholm bar recommender: tell it what you've had, it tells you what you can still drink and where to drink it.*

- **BAC projection**: Det live-beräknade promillevärdet baserat på vad man druckit hemma och hur mycket tid som förflutit (*the live, continuously-recomputed estimate of a person's current blood alcohol content*). Implementeras som `projectBac` i `src/lib/bacProjection.ts`.
  - *Undvik*: "current BAC", "live promille".
- **Widmark formula**: Den underliggande fysiologiska matten (gram alkohol, kroppsvikt, kön/fördelningsfaktor och förbränning över tid) som BAC-projektionen bygger ovanpå. En namngiven, oberoende beräkning – inte själva projektionen. Implementeras i `src/lib/widmark.ts`.
  - *Undvik*: "BAC-beräkning" (för brett/vagt).
- **Pour plan**: Hur många av varje vald dryckestyp (Öl, Vin, Shot, ...) man ska ta och vid vilket stopp på bar-rutten för att nå målpromillen utan att överstiga den. Implementeras som `buildPourPlan` i `src/lib/pourPlan.ts`.
  - *Undvik*: "drink breakdown", "allocation".
- **Bar route**: En specifik budget-tiers (cheap/medium/expensive) uppsättning rekommenderade stopp plus estimerad totalkostnad, skapad av `generateRoutes`. En pour plan läggs ovanpå bar-ruttens stopp och är inte en del av rutten i sig.
  - *Undvik*: "itinerary".
- **Pre-drink items** vs **Drink categories**: Två helt distinkta vokabulär med egna gram-tabeller (`PRE_DRINK_ITEMS` vs `DRINK_CATEGORIES` i `src/lib/drinks.ts`).
  - *Pre-drink items*: Vad användaren drack *innan* man gick ut (hemma) – används för att mata BAC-projektionen.
  - *Drink categories*: Vad användaren planerar att dricka *ute på barerna* – används för att generera pour plan.
  - Förväxla inte dessa två även om en etikett sammanfaller (t.ex. att båda innehåller "Vin" à 14g).
  - *Undvik*: "drink types" (tvetydigt mellan de två begreppen).


---

## Status just nu

- [x] **Widmark-formeln**: implementerad och testad (`widmark.ts`)
- [x] **BAC-projektion**: implementerad och testad (`bacProjection.ts`)
- [x] **Pour plan**: implementerad och testad (`pourPlan.ts`)
- [x] **Bardatabas**: externaliserad till `/data/bars.json` med 290 barer och vibe-taggar
- [x] **Bar-route-generering**: regelbaserad filtrering och budget-tier-logik i `recommendations.ts`
- [x] **LLM-integration (Lager B)**: `matcher.ts` implementerad, ansluten mot Gemini API med retry-logik
- [x] **Systemprompt**: definierad och testad med stöd för vibe-taggar, motiveringar och JSON-schema (`systemPrompt.ts`)
- [x] **Frontend-integration**: `Results.tsx` och `BarCard.tsx` uppdaterade med asynkron laddning, vibe-piller och "✨ AI-tips"
- [x] **Typdefinitioner & Tsconfig**: `Bar.vibes` tillagt i `src/types/index.ts` och `tsconfig.json` inkluderar `data/`
- [x] **Enhetstester**: 28/28 tester passerar (`pourPlan.test.ts`, `places.test.ts`, `userStore.test.ts`, `bacProjection.test.ts`, `recommendations.test.ts`)
- [x] **Bygge**: `tsc && vite build` kompilerar utan fel

---

## Beslut som redan är tagna (ändra inte utan anledning)

1. **LLM:en räknar aldrig promille** — det gör uteslutande Lager A (`widmark.ts` + `bacProjection.ts`).
2. **LLM-svar alltid i JSON** (valideras och struktureras i `matcher.ts`).
3. **Lager A och B är löst kopplade** — `projectBac`, `generateRoutes` och `buildPourPlan` fungerar helt självständigt utan AI. LLM lägger sig ovanpå i gränssnittet för att berika med vibe-analys och motiveringar utan att vara en single-point-of-failure.
4. **Externaliserad bardata** — bardatan ligger i `/data/bars.json` för att enkelt kunna utökas eller ersättas med externa API:er framåt.
5. **Standardplats och automatisk demoläges-fallback** — Om användaren nekar platsåtkomst eller befinner sig för långt från databasens barer (> 5 km) används T-Centralen (`59.3293, 18.0686`) som standardplats så att rutter och AI-matchning alltid kan testas.

---

## Nästa steg (prioritetsordning)

1. **Implementera geolocation fallback i `Results.tsx`**: Automatisk övergång till T-Centralen med informationsbanner om inga barer finns i närheten.
2. **Användarfilter för vibes i UI**: Möjlighet för användaren att aktivt välja eller filtrera på önskad vibe (t.ex. bara visa barer med `#mysigt` eller `#dans`).
3. **Utökad bardatabas**: Lägga till fler barer i fler stadsdelar (Vasastan, Kungsholmen, Östermalm, Gamla Stan) i `/data/bars.json`.
4. **Ruttpersistens och delning**: Möjlighet att spara eller dela kvällens skapade bar-rutt via URL-parametrar eller länk.
5. **Testning av matchningsprompt**: Verifiera LLM-svaren och motiveringarna mot fler varierade användarscenarier och edge cases.

---

## Checklista: Implementering av Geolocation Fallback & Demoläge

- [x] **1. Positionshantering & detektering i `Results.tsx`**: Kontrollera om användarens GPS-position är inom räckhåll (< 5 km från mock-databasens barer i Stockholm). Om användaren nekar platsåtkomst, ett fel inträffar, eller om avståndet överstiger 5 km, aktiveras fallback till T-Centralen (`lat: 59.3293, lng: 18.0686`).
- [x] **2. Täckningsgaranti för T-Centralen**: Se till att ruttgenerering kring T-Centralen hittar tillräckligt med barer (billig/medel/lyx) även om standardradien är snäv, genom att vid behov automatiskt vidga sökningen till 2 km så att användaren alltid får rutter.
- [x] **3. Informationsbanner i UI (`Results.tsx`)**: Visa en tydlig banner när demoläge/fallback är aktivt: *"📍 Demoläge: Inga barer i din omedelbara närhet — visar barer runt T-Centralen, Stockholm."*
- [x] **4. Manuell växling mellan GPS och demoläge**: Ge användaren möjlighet att enkelt växla mellan sin verkliga GPS-position och standardplatsen T-Centralen via en knapp i gränssnittet.
- [x] **5. Verifiering och tester**: Kör `npm test` och `npm run build` för att bekräfta att alla befintliga och nya flöden fungerar utan fel.



