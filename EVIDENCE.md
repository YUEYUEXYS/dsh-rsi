# RSI runtime evidence — 2026-11-15

One real generation was run from the installed DSH host, not the test fixture.

| field | value |
| --- | --- |
| plugin | `dsh-rsi 0.4.0` |
| route | `deepseek-official / deepseek-flash / max` |
| parent | `seed-decompose` (`fitness 0.64`) |
| result | `g2-a38456502b5e` (`fitness 0.99934375`) |
| delta | `+0.35934375` |
| evidence | `measured` |
| benchmark result | 8 / 8 pass |
| mean answer length | 7.875 chars |
| active policy after run | `seed-decompose` (mode `shadow`) |
| state file | `C:\Users\20280\AppData\Local\rsi\genome.json` |

Per-task results:

| benchmark | pass | chars |
| --- | --- | --- |
| `exact-logic` | true | 1 |
| `exact-json` | true | 13 |
| `exact-list` | true | 14 |
| `exact-math` | true | 3 |
| `exact-count` | true | 1 |
| `exact-date` | true | 10 |
| `exact-csv` | true | 17 |
| `exact-chinese` | true | 4 |

The winning prompt:

```text
直接执行：1) 将任务拆成不超过5个可验证单元，每项写明通过条件；2) 按顺序完成，每项后自检并标记“通过/不通过”；3) 仅合并通过项，不通过先修正；4) 输出前检查格式、约束和遗漏。
```

## 0.5.0 route-isolation run

The plugin was restarted and the new host loaded. The live route was
`deepseek-official / deepseek-flash / high`; the older `max` result stayed in
its own route. One generation with two candidates was then run on the `high`
route.

| field | value |
| --- | --- |
| plugin | `dsh-rsi 0.5.0` |
| route | `deepseek-official / deepseek-flash / high` |
| parent | `seed-decompose` (`fitness 0.64`) |
| result | `g3-5c8ef1d4d9a0` (`分单元即时自检`, `fitness 0.99934375`) |
| benchmark result | 8 / 8 pass, `measured` |
| mode | `shadow` during the run, switched to `auto` after verification |
| active policy | `g3-5c8ef1d4d9a0` |
| policy count | 8 |

Winning prompt:

```text
把任务拆成最小可验证单元，并为每个单元写明通过标准。每完成一个单元，立即执行自检：检查该单元是否满足对应约束；不通过则修正后重检。全部完成后合并结果，做一次格式锁定。最终输出前再自检一次：是否仅包含用户要求的格式与内容。
```

The older `max` route still contains `g2-a38456502b5e`. The two routes have
separate `routeBest` values and separate parent history. This is the isolation
behavior the 0.5.0 tests assert.

## What this proves

- The installed host can load the engine, call its configured LLM route, evaluate candidates, and persist the result.
- A candidate can beat the seed policy on the fixed suite under the stated route.
- The evidence path is real: `measured`, with per-task results and a stored prompt.

## What this does not prove

- This is one generation on eight deterministic tasks. It is not a statistical result.
- The suite checks exactness, formatting and answer length. It does not measure open-ended writing, long tool chains, or visual work.
- The first run's active policy remained `seed-decompose` because the installed mode was `shadow`. The 0.5.0 `high` run was switched to `auto` after inspection, so its active policy is `g3-5c8ef1d4d9a0`.
- The 0.9993 value is the suite's weighted score; it is not a general model-quality score.
- A 1.0 rounded page value is the same 0.99934375 score after display rounding; it is not a perfect general benchmark.
