# Barrekommendations-app – projektkontext

## Mål
AI-funktion som föreslår barer i Stockholm utifrån vikt, glas hittills,
måltal promille, budget och tid kvar av kvällen.

## Arkitektur
- Lager A: Widmark-baserad promilleberäkning (ren kod, ej AI) — se /src/bac.ts
- Lager B: LLM-matchning mot bardatabas via [lärarens API] — se /src/matcher.ts
- Data: barlista i /data/bars.json (namn, område, pris, vibe-taggar)

## Status just nu
- [x] BAC-formel implementerad och testad
- [ ] Bardatabas: bara 5 exempel-barer inlagda, behöver fler
- [ ] Systemprompt för matchning: v1 klar, ej testad mot riktiga API-svar
- [ ] Frontend: inte påbörjad

## Beslut som redan är tagna (ändra inte utan anledning)
- LLM:en får ALDRIG räkna promille själv, bara Lager A gör det
- Svar från LLM alltid i JSON, se schema i /src/matcher.ts

## Nästa steg
1. Fylla på bardatabasen
2. Testa matchningsprompten mot 3–4 olika användarscenarier