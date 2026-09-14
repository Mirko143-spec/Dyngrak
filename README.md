# Dyngrak

Dyngrak är en svensk webbapp som räknar ut din promille (BAC) utifrån vad du druckit
hemma, hur länge sedan och din kroppsvikt/kön — och rekommenderar sedan vilka barer i
Stockholm du bör besöka utifrån budget och avstånd, samt hur mycket du kan dricka på
varje stopp för att nå ditt målpromille utan att spräcka budgeten.

Appen är byggd med Vite, React 19 och TypeScript, och är uppdelad i två lager:

- **Lager A – deterministisk logik.** Widmarks formel, BAC-projektion, pour plan
  (fördelning av drycker per barstopp) och bar-ruttgenerering. Ren, testad kod
  (`widmark.ts`, `bacProjection.ts`, `pourPlan.ts`, `recommendations.ts`, `places.ts`) —
  inget AI inblandat, samma indata ger alltid samma utdata.
- **Lager B – AI-matchning.** En LLM (Google Gemini) rangordnar barerna i den
  redan beräknade rutten utifrån stämning/vibe-taggar och användarens preferenser, och
  ger varje bar en kort motivering i gränssnittet (`matcher.ts`, `systemPrompt.ts`).

## Reflektion: AI-komponenten

### Vilken ny AI-teknik/bibliotek identifierade vi och hur tillämpade vi det?

Ursprungsplanen var att låta AI:n hitta barer nära användaren i realtid via **Google
Places API** — det ligger kvar som en förberedd men oanvänd miljövariabel
(`VITE_GOOGLE_PLACES_API_KEY`) i projektet. Vi fick dock aldrig till den
integrationen, så barerna hämtas idag istället från en lokal mockdatabas
(`/data/bars.json`).

AI-tekniken vi faktiskt identifierade och tillämpade blev därför **Google Gemini**
(en LLM), som löser ett annat men besläktat problem: att matcha en bars "känsla"
(fritextfält som `vibes`, t.ex. `"mysigt"`, `"craft-öl"`, `"after-work"`) mot
användarens preferenser och ge en motivering på naturligt språk. Vi anropar Gemini
via dess REST-API direkt från klienten (`src/lib/matcher.ts`), med en egen gratis
API-nyckel. Tillämpningen är strikt inramad:

1. En systemprompt (`src/lib/systemPrompt.ts`) instruerar modellen om exakt vad den
   får göra: rangordna max 4 barer från en redan förfiltrerad lista, utifrån budget,
   avstånd, betyg, vibe och dryckespreferenser, samt skriva en kort svensk motivering.
2. Modellen förbjuds uttryckligen att räkna eller nämna promillevärden — det är redan
   gjort av Lager A och skickas in som fakta.
3. Modellen instrueras att **endast** returnera ett fördefinierat JSON-schema
   (`{ recommendations: [{ bar_id, reason, suggested_drinks }] }`), vilket sedan
   valideras strikt i kod (`parseResponse`) innan det används i gränssnittet.

Resultatet visas i `BarCard.tsx` som ett "✨ AI-tips" under varje bar, utan att AI:n
någonsin rör den bakomliggande promille- eller kostnadsberäkningen.

### Motivera varför vi valde den AI-tekniken/det biblioteket

En LLM passar bra för den uppgift AI:n faktiskt fick, eftersom att tolka fritext-vibes
och matcha dem mot en användares mjuka preferenser, och formulera en läsbar
motivering, kräver språkförståelse och generering av naturligt språk — inte exakta
tröskelvärden. Ett regelbaserat if/else-system hade kunnat filtrera på budget och
avstånd (vilket vi redan gör i Lager A), men hade inte lika enkelt kunnat resonera
om att "craft-öl" och "mysigt vinbibliotek" matchar en användare som gillar vin
bättre än ett festligt shot-ställe.

Gemini valdes framför alternativ (t.ex. OpenAI) för att den har en generös gratis
nivå på API:et, vilket gjorde det möjligt att bygga och testa integrationen utan
kostnad med en egen personlig nyckel, och för att API:t stödjer strukturerat
JSON-svar (`responseMimeType: "application/json"`) direkt, vilket gjorde det enklare
att garantera ett förutsägbart svarsformat att bygga UI på.

### Varför behövdes AI-komponenten? Skulle vi kunna löst det på ett annat sätt?

AI-komponenten behövdes inte för att appen ska fungera — hela kärnflödet
(promilleberäkning, ruttgenerering, pour plan) är helt regelbaserat och fungerar
utan den. Den behövdes för att **berika** upplevelsen: ge användaren en motivering
som känns personlig och läsvärd istället för bara en sorterad lista efter avstånd
eller pris.

Ett alternativ hade varit att bygga en egen enklare klassificerare eller
poängformel — t.ex. matcha valda dryckeskategorier mot vibe-taggar med ett
viktat poängsystem (regelbaserat, ingen AI). Det hade varit snabbare, gratis,
helt förutsägbart och utan de integritets- och säkerhetsrisker som följer med att
skicka användardata till en extern LLM-leverantör. Nackdelen är att en sådan
lösning blir stelbent — den kräver att varje ny vibe-tagg eller nyans hanteras
manuellt i koden, medan LLM:en generaliserar till nya taggar och formuleringar
utan att vi behöver skriva om logiken.

Vi landade därför i en medveten arkitektur där AI:n är ett tillägg ovanpå en fullt
fungerande regelbaserad grund, inte en förutsättning för att appen ska fungera: om
Gemini-anropet misslyckas (`Results.tsx`) fångas felet upp tyst och användaren ser
ändå den kompletta rutten och pour-planen utan AI-motiveringar.

## Kom igång

```bash
npm install
npm run dev      # startar dev-server
npm test         # kör enhetstester (Vitest)
npm run build    # typkontroll + produktionsbygge
```

Miljövariabler (`.env.local`, committas aldrig):

```
VITE_LLM_API_KEY=
VITE_LLM_API_URL=
```
