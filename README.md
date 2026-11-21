# Sunset Ledger — GTA VI Trophy Guide

[![Trophies](https://img.shields.io/badge/trophies-55%2F55-gold)](app/data/trophies.json)
[![Competition](https://img.shields.io/badge/make.fun-gta6--trophy--guide--01-coral)](https://make.fun/bounty/gta6-trophy-guide-01)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

The complete GTA VI trophy guide: **all 55 trophies** (1 Platinum, 2 Gold, 6 Silver, 46 Bronze), each with a guide in plain words and **cited steps** — 85 steps, every one naming its source. A 7-phase roadmap leads from the Chapter 1 missable to the Platinum. Progress saves in the browser; export and import it as JSON.

## What makes it honest

- **One missable, flagged loudly.** Positive Mental Attitude — meditate at Jason's house in Chapter 1, before the chapter ends. The guide says so on the masthead, on the Missables page, and on the trophy itself.
- **Five unconfirmed, flagged as unconfirmed.** In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin — PowerPyx lists all five conditions as unknown. The guide gives the best reading of each official description and marks every single-source report as unverified. Nothing unconfirmed is presented as fact.
- **Every specific claim cites a source.** Sources: Exophase, PSNProfiles, Mobalytics, HappyGamer, GTAScoop, GameMapa, KeenGamer, BoostingFactory, EGamers, HowToVideoGame, Push Square. Citations are real links in the app.

## The guide

- **Checklist** — all 55 trophies with grade, kind, count, guide, cited steps and sources. Filter by grade or kind, search, hide earned, tick them off.
- **Roadmap** — 7 phases in order: the missable first, the 17 story trophies, 8 stranger strands, the big open-world counts, the one-offs, the 5 unknowns, then the Platinum.
- **Missables & Unknowns** — the one trophy you can miss and the five nobody has confirmed yet, in one place.
- **Settings** — hide story spoilers (blurs hidden-trophy descriptions), reset progress.

## Run it

```sh
node serve.ts        # then open http://localhost:8080
```

No build step, no network at load time — plain static files. Build the submission dossier with:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Referral

Built for the make.fun competition as **@lyso**. Referral code: **p9r33tb4**.

## License

MIT. An unofficial fan guide — Grand Theft Auto and GTA are trademarks of Take-Two Interactive. Not affiliated with Rockstar Games.
