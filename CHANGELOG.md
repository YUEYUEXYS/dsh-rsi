# Changelog

## 0.5.0 — 2026-11-15

- Add route isolation: `provider / model / reasoningEffort` each keeps its own `bestId`, parent, evidence, and front.
- Capture `reasoningEffort` from the live agent route and pass it to evaluation instead of hardcoding `max`.
- Raise policy pool to 96, history to 160, ledger to 800, API generations to 24, candidates to 8.
- New installs start in `auto`; existing state keeps its stored mode. `setMode('auto')` applies the current route best.
- Settings show route model + effort, route-scoped best, and a 6-generation run button.
- Rename the policy list from `策略基因库` to `策略库`; no marketing copy.
- Engine tests cover default route, separate route incumbents, and pool trimming.

## 0.4.0 — 2026-11-15

- Expand deterministic suite from 4 to 8 benchmarks: count, date, CSV, Chinese exact.
- Add `front` snapshot: best, leanest, most novel policy.
- Add policy inspector: full prompt, operators, parent, per-benchmark results.
- Add `pluginVersion` to state response.
- Add "export genome" action in settings.
- Add first-run hint at generation 0.
- Add nav icon replacement test.
- Tighten source headers and comments; drop repeated catch comments.
- Add real installed-host run: generation 1, 8/8 measured, winner `g2-a38456502b5e` (0.99934375); see `EVIDENCE.md`.
- Add live settings screenshot to README.
- Add `install.ps1` for the DSH desktop profile; junction + dependency + bundle, idempotent.
- Add GitHub Actions `check` workflow and `.editorconfig`.
- README rewritten as a technical manual; add `CHANGELOG.md`, `tools/check.mjs`, `npm test`.
- Version markers in host/client/package set to 0.4.0.

## 0.3.0 — 2026-11-15

- Fix settings root node closing early; all sections now render as siblings.
- Fix log/footer nesting inside the generation card.
- Add real-time evolution progress, lineage cards, per-benchmark dots, share card.
- Engine: strict `bestId` selection; auto mode follows global best; policy pool protects active/best/baseline.
- Client test now renders the full snapshot and asserts all section titles.
- Version markers set to 0.3.0.

## 0.2.0 — 2026-11-15

- Initial DSH host/client integration: prompt section, `/rsi` API, settings section.
- Four deterministic benchmarks; proxy and measured evidence.
- Atomic `genome.json` save; rollback; user model extraction.
- Fixed client syntax, candidate padding, profile normalization, 90s evaluation timeout.
