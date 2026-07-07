# Setting up your SleepDiaries Protocol fork

This repo was seeded from a tagged release of [SleepDiaries](https://github.com/circadia-bio/SleepDiaries). A few things were stripped out or auto-cleaned during initialization (analytics, citation metadata, the original deployment script, some README badges/links) — here's what to do next to make this yours.

## 1. Rename the app

- `app.json` — update `name`, `slug`, `scheme`, and bundle identifiers (`ios.bundleIdentifier`, `android.package`)
- `package.json` — update `name`
- Search the codebase for remaining "Sleep Diaries" strings in UI copy (`i18n/en.js`, `i18n/pt-BR.js`) and swap for your study/app name

## 2. Finish cleaning up the README

Seeding already removed the badges that only made sense on the original repo (Tests, DOI, Last commit, Issues, PRs) and dropped the live `sleepdiaries.circadia-lab.uk` links. A banner at the top marks this as inherited content. A few things still need a human decision, since they're not safe to strip automatically:

- **Title & description** — still says "Sleep Diaries"; update once you've renamed the app
- **Citation / Authors / Design Acknowledgement sections** — credit the original SleepDiaries team; keep these as attribution for the underlying work, but add your own name/study if you're publishing under a new name
- **Related Tools section** — links to other circadia-bio repos; remove if not relevant to your fork
- **Roadmap** — reflects the original project's history, not yours; replace with your own or remove
- **Installing as an App section** — the iOS/Android/desktop instructions still reference `sleepdiaries.circadia-lab.uk` as the example URL; update once you have your own deployed URL
- Once you've been through it, delete the inherited banner at the top

## 3. Rebrand

- `theme/typography.js` and related theme files — swap the colour palette and fonts, or keep the defaults if they suit your study
- `assets/` — replace the app icon, splash screens, and social preview image (`social.png`)
- `header.png`, `screens.png` — used in the README; replace or remove

## 4. Reconfigure deployment

The original `scripts/deploy.sh` (which handled PWA meta injection, Fathom analytics, and Netlify redirects) was removed since it pointed at the original lab's domain and analytics account. You'll need to:

- Write your own build/deploy script, or adapt the [original](https://github.com/circadia-bio/SleepDiaries/blob/main/scripts/deploy.sh) for your own domain and hosting
- Set up your own analytics if you want it (Fathom, Plausible, or none)
- Update `web/manifest.json` with your own app name and icons

## 5. Add your own CI (optional)

The original repo's `.github/workflows/` (tests, deploy pipeline) were stripped out during seeding — partly because they're lab-specific, and partly because GitHub's default Actions token is never allowed to push changes under `.github/workflows/` on your behalf, so they couldn't have been carried over automatically anyway. If you want CI, add your own workflow files once you've set up the repo.

## 6. Decide which questionnaires to keep

SleepDiaries ships with 8 validated instruments: ESS, ISI, DBAS-16, MEQ, PSQI, RU-SATED, STOP-BANG, MCTQ. If your study doesn't need all of them, they're implemented independently in `app/questionnaire.jsx` and scored in `storage/storage.js` — check the [SleepDiaries README](https://github.com/circadia-bio/SleepDiaries) for how each one is wired in before removing.

## 7. Citation

The original `CITATION.cff` was removed since it credits the SleepDiaries research team specifically. If you publish work using this adapted app, please still credit the original project:

> França, L.G.S. et al. SleepDiaries. https://github.com/circadia-bio/SleepDiaries

Add your own `CITATION.cff` for your fork if appropriate.

## 8. Clean up

Once you've been through this checklist, delete this file. The `.github/workflows/init-from-version.yml` workflow no longer exists at this point — it removes itself after running — so you're free to add your own CI.

---

Questions about the underlying app structure? See the [SleepDiaries repo](https://github.com/circadia-bio/SleepDiaries) or open an issue there.
