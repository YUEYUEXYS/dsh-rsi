# DSH RSI · 发布页 / Launch Kit

## 一句话

不改模型权重，让 DSH 插件按路线进化自己的提示词。

## 0.1.0 新增

- 按 `provider / model / reasoningEffort` 隔离最优策略和证据，不把不同模型、不同思考档位的分数混在一起。
- 评测请求使用路线记录的 `reasoningEffort`，不再写死。
- 策略池 96、历史 160、账本 800；API 支持 24 代、8 候选。
- 设置页显示实际路线和本路线最优，提供 6 代连跑。
- 新装默认 `auto`，只晋升严格更高分；旧状态保留原模式。

## 三句话

1. 静态 Prompt 不会自我淘汰；RSI 每代生成候选，用固定评测选择，只保留严格更强的。
2. 权重不变，不注册、不替换 Think Ultra 的 adapter；只增加自己的 system prompt section。
3. 打开设置最底部的 `RSI 配置`，可以看到实时进度、策略谱系、逐题证据和当前可回滚策略。

## 15 秒演示脚本

1. 打开 DSH 设置，滚到最底部：`RSI 配置`。
2. 指出顶部路线标签：模型 + 思考档位；说明不同路线不共享最优。
3. 点“进化 1 代”，展示实时进度条和候选序号。
4. 展示“代际曲线”和“父代 → 本代最优”的谱系。
5. 点“复制战绩”，把一段战绩文本粘贴到聊天里。
6. 切 `auto`，说明下一次回答会使用本路线的最优策略。

## GitHub 首屏文案

> **DSH RSI** — Recursive Strategy Improvement for DeepSeek Harness.
>
> The model stays fixed. The plugin evolves its own prompts, decomposition, verification habits, output contracts and user model.
>
> Each generation: candidates → deterministic benchmark → strict selection → the winner becomes the next parent. Route isolation keeps separate model / thinking-effort evidence separate.
>
> No adapter is registered or replaced. No weights change. The genome is bounded, evidenced and rollbackable.
>
> Works beside Think Ultra. Lives at the bottom of DSH settings.

## 三条短帖

**中文 · 技术圈**

> 我做了个 DSH 插件，不修改模型权重，只让提示词策略自己进化。
> 每代：生成候选 → 8 道固定题打分 → 只留严格更强的 → 赢家当下一代父代。
> 不同模型、不同思考档位各自记分，不共享最优。
> 入口在设置最底部，叫 RSI。

**中文 · 产品圈**

> RSI 把系统提示词当成可评测、可淘汰、可回滚的策略对象。
> 候选、评测、交叉、晋升全部在本地可见，和 Think Ultra 共存，不改权重。
> 新装默认 auto；旧状态可以切 shadow 只记录。

**English · builder**

> Built a DSH plugin that evolves its own prompts while model weights stay frozen.
> Candidates → deterministic eval → strict selection → winner becomes the next parent.
> Per-route evidence, live progress, lineage, rollback. Runs beside Think Ultra.

## 标题候选

- 不改权重，让 DSH 按路线进化：RSI 0.1.0
- 我把“越用越强”做成了一个可回滚的策略库
- 按评测淘汰策略的 DSH 插件
- 模型不动，插件进化：DSH RSI

## 发布前检查

- [ ] README 首屏说明权重不变、按路线评测、Think Ultra 边界。
- [ ] 15 秒演示录屏，重点拍实时进度、谱系、逐题证据，不拍长代码。
- [ ] 说明新装默认 `auto`，旧状态保留原模式；`shadow` 只记录。
- [ ] 不承诺具体 star 数；star 取决于发布渠道、演示质量和社区，不是代码能保证的指标。
- [ ] 不把 `proxy` 估算写成实测；证据标签保持 `seed / proxy / measured / partial / failed`。
- [ ] 不宣称跨模型全面碾压；路线隔离只保证证据不串线。
