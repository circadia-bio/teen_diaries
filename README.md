# 🌙 SleepDiaries Protocol

**A GitHub template repository for spinning up your own research fork of [SleepDiaries](https://github.com/circadia-bio/SleepDiaries).**

[![License: MIT](https://img.shields.io/badge/licence-MIT-yellow)](./LICENSE)
[![Template](https://img.shields.io/badge/GitHub-template%20repository-2ea44f?logo=github)](https://github.com/circadia-bio/SleepDiaries-Protocol/generate)
[![Source](https://img.shields.io/badge/source-circadia--bio%2FSleepDiaries-blue)](https://github.com/circadia-bio/SleepDiaries)

---

## 📖 What is this?

SleepDiaries Protocol is a **template repository**, not a working app on its own. It exists so other researchers and clinicians can spin up a clean, adaptable copy of [SleepDiaries](https://github.com/circadia-bio/SleepDiaries) — pinned to a specific released version — without inheriting Circadia Lab's own analytics, deployment config, citation metadata, or commit history.

Click **Use this template**, run one GitHub Action, and you get a ready-to-customise fork.

## ✨ How it works

1. **Use this template** to create your own copy of this repo
2. **Run a GitHub Action** and pick which SleepDiaries version to build from
3. The workflow downloads that release, strips out lab-specific config, cleans up the README, and commits the result to your new repo
4. A **`TEMPLATE_SETUP.md`** checklist appears, walking you through renaming, rebranding, and redeploying for your own study

## 🚀 Getting Started

1. Click **Use this template → Create a new repository** at the top of this page
2. In your new repo, go to **Actions → Initialize SleepDiaries Protocol from version → Run workflow**
3. Pick a SleepDiaries version from the dropdown and run it — this takes about a minute
4. Once it finishes, open **`TEMPLATE_SETUP.md`** at the root of your repo and work through the checklist

## 🗂️ What gets handled automatically during seeding

| Removed / cleaned | Why |
|---|---|
| `CITATION.cff` | Credits the original SleepDiaries research team specifically |
| `scripts/deploy.sh` | Points at Circadia Lab's Netlify domain and Fathom analytics account |
| `netlify.toml` | Deployment config tied to the original site |
| `.github/workflows/*` (original CI) | Lab-specific test/deploy pipelines — also, GitHub's default token can never push workflow files on your behalf, so these couldn't be carried over automatically either way |
| README badges (Tests, DOI, Last commit, Issues, PRs) | Reflect the original repo's live stats, not your fork's |
| Live `sleepdiaries.circadia-lab.uk` links | Won't resolve for a fresh fork |

Everything else — the full app source, questionnaire engine, i18n, theming — comes across untouched. See `TEMPLATE_SETUP.md` after seeding for what still needs a manual decision (citation, authors, roadmap, related tools).

## 🧬 Available versions

The seeding workflow currently offers: `v1.1.3`, `v1.1.2`, `v1.1.1`, `v1.1.0`. Check [SleepDiaries releases](https://github.com/circadia-bio/SleepDiaries/releases) for the latest — if a newer version isn't listed in the dropdown yet, let the maintainers know.

## 🤝 Related Tools

- 🌙 [**SleepDiaries**](https://github.com/circadia-bio/SleepDiaries) — the original open-source sleep diary app this template is built from
- 🔬 [**circadia-bio**](https://github.com/circadia-bio) — the Circadia Lab GitHub organisation

## 📄 Licence

Released under the [MIT License](./LICENSE).

Copyright © Circadia Lab — Lucas França & Mario Leocadio-Miguel
