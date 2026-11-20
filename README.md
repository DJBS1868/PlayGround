# PlayGround

<!-- omgithub:readme:start -->
## 🚀 Build, play, and remix with OMGithub

**Remixed using [OMGithub.com](https://go.ondev.store/).**

[![OMGithub](https://img.shields.io/badge/OMGithub-Open%20project-orange?style=for-the-badge)](https://go.ondev.store/DJBS1868/PlayGround)
[![GitHub](https://img.shields.io/badge/GitHub-Source-181717?logo=github&style=for-the-badge)](https://github.com/DJBS1868/PlayGround)

- 🎮 [Open the project](https://go.ondev.store/DJBS1868/PlayGround).
- ✨ [Remix this project](https://go.ondev.store/DJBS1868/PlayGround?remix=1).
- 💻 [Explore the source](https://github.com/DJBS1868/PlayGround).
- 🛠️ [Check build runs](https://github.com/DJBS1868/PlayGround/actions).
- 🐛 [Report an issue](https://github.com/DJBS1868/PlayGround/issues).
- 👤 [Explore the creator's projects](https://go.ondev.store/DJBS1868).
- 🌍 [Create with OMGithub](https://go.ondev.store/).
- 🧬 [Explore the remix source](https://github.com/DJBS1868/PlayGround).
<!-- omgithub:readme:end -->

## Dune & Dust — Relic Hunter

A touch-first archaeological adventure built as a single-screen mobile web app. Excavate sun-buried sites, brush and mist relics back to life, appraise them under the loupe, and decide whether to grow the museum or take a collector's coin.

### Play

No build step is required. Serve the repository and open it on a phone-sized viewport:

```bash
python3 -m http.server 3002
# then open http://localhost:3002
```

### The loop

1. **Field** — swipe the site card or tap the rail to choose an expedition, then drag across the trench to sweep sand.
2. **Lift** — once the signal is exposed, lift the find and take it to the restoration lab.
3. **Lab** — dry-brush the grime, mist away the salt crust, then buff the surface with the cloth.
4. **Appraise** — read the condition, market value, and grade, then sell to the Atlas Museum for renown or to a private collector for coin.
5. **Reinvest** — spend earnings at the supply depot on wider trowels, better sieves, sonar, and conservation tools.

Progress saves automatically in `localStorage` under `dune_and_dust_save_v3`. The app is designed to stay within the viewport with no page scrolling, including compact 320 × 568 screens.
