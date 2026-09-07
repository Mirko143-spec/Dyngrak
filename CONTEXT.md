# Dyngrak

A Swedish blood-alcohol calculator and Stockholm bar recommender: tell it what you've had, it tells you what you can still drink and where to drink it.

## Language

**BAC projection**:
The live, continuously-recomputed estimate of a person's current blood alcohol content, derived from what they drank before going out and how much time has passed since. Implemented as `projectBac` in `src/lib/bacProjection.ts`.
_Avoid_: current BAC, live promille

**Widmark formula**:
The underlying physiology math (grams of alcohol, body weight, sex-based distribution factor, elapsed-time metabolism) that a BAC projection is built on top of. A named, independent piece of arithmetic — not the projection itself.
_Avoid_: BAC calculation (too broad; could mean either this or the projection)

**Pour plan**:
How many of each chosen drink type (Öl, Vin, Shot, ...) to have, and at which stop on the bar route, to reach the target BAC projection. Implemented as `buildPourPlan` in `src/lib/pourPlan.ts`.
_Avoid_: drink breakdown, allocation

**Bar route**:
One budget tier's set of recommended stops plus an estimated total cost, produced by `generateRoutes`. A pour plan is layered on top of a bar route's stops, not part of the route itself.
_Avoid_: itinerary

**Pre-drink items** vs **drink categories**:
Two distinct vocabularies with their own gram tables. Pre-drink items are what was drunk *before* going out (used to seed the BAC projection). Drink categories are what's planned *at* the bars (used to build the pour plan). Don't conflate them even where a label coincides (e.g. both have a "Vin" at 14g).
_Avoid_: drink types (ambiguous between the two)
