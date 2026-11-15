// Settings UI. Same-origin /rsi/api only.

window.__ModuleLoader__.load({
  id: 'dsh-rsi',
  factory: (require) => {
    const React = require('react')
    const h = React.createElement
    const exports = {}

    const CSS = `
      .rsi-nav-row svg { color: #8a8a8a; }
      .rsi-page { display: flex; flex-direction: column; gap: 12px; padding: 4px 2px 28px; min-width: 0; color: var(--dsw-alias-label-primary); }
      .rsi-hero { border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px; padding: 16px 18px; background: var(--dsw-alias-bg-layer-1); }
      .rsi-kicker { display: flex; align-items: center; gap: 8px; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: #5eead4; font-weight: 650; }
      .rsi-mark { width: 28px; height: 28px; border: 1px solid color-mix(in srgb, #5eead4 40%, transparent); border-radius: 8px; display: grid; place-items: center; background: color-mix(in srgb, #5eead4 7%, transparent); }
      .rsi-title { margin: 8px 0 0; font-size: 22px; line-height: 1.2; letter-spacing: -.01em; font-weight: 700; }
      .rsi-sub { margin: 6px 0 0; max-width: 760px; font-size: 12.5px; line-height: 1.65; color: var(--dsw-alias-label-secondary); }
      .rsi-hero-line { margin-top: 13px; display: flex; flex-wrap: wrap; gap: 7px; }
      .rsi-pill { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 999px; padding: 5px 10px; font-size: 11px; color: var(--dsw-alias-label-secondary); background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 86%, transparent); }
      .rsi-pill b { color: var(--dsw-alias-label-primary); font-weight: 650; }
      .rsi-pill.good { border-color: color-mix(in srgb, #5eead4 45%, transparent); color: #5eead4; }
      .rsi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
      .rsi-front { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
      .rsi-front-card { border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; padding: 10px 11px; background: var(--dsw-alias-bg-layer-2); }
      .rsi-front-kicker { display: flex; align-items: center; justify-content: space-between; gap: 6px; color: #5eead4; font-size: 10px; font-weight: 700; letter-spacing: .08em; }
      .rsi-front-name { margin-top: 4px; font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .rsi-front-foot { margin-top: 5px; font: 11px ui-monospace, monospace; color: var(--dsw-alias-label-secondary); display: flex; justify-content: space-between; gap: 8px; }
      .rsi-first { border: 1px dashed color-mix(in srgb, #5eead4 38%, transparent); border-radius: 12px; padding: 10px 12px; color: var(--dsw-alias-label-secondary); font-size: 11.5px; line-height: 1.65; background: color-mix(in srgb, #5eead4 5%, transparent); }
      .rsi-first b { color: #5eead4; }
      .rsi-name-btn { appearance: none; background: none; border: 0; padding: 0; color: var(--dsw-alias-label-primary); font: inherit; font-weight: 650; text-align: left; cursor: pointer; }
      .rsi-name-btn:hover { color: #5eead4; text-decoration: underline; text-underline-offset: 3px; }
      .rsi-inspector { margin-top: 12px; border: 1px solid color-mix(in srgb, #5eead4 30%, var(--dsw-alias-border-l1)); border-radius: 12px; padding: 12px; background: color-mix(in srgb, #5eead4 4%, var(--dsw-alias-bg-layer-2)); }
      .rsi-inspector-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
      .rsi-inspector-title { font-size: 12px; font-weight: 700; }
      .rsi-inspector-meta { margin-top: 4px; font-size: 10.5px; color: var(--dsw-alias-label-tertiary); }
      .rsi-prompt { margin: 9px 0 0; max-height: 220px; overflow: auto; white-space: pre-wrap; word-break: break-word; border: 1px solid var(--dsw-alias-border-l1); border-radius: 9px; padding: 9px 10px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary); font: 11px/1.65 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      .rsi-ops { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
      .rsi-op { border: 1px solid var(--dsw-alias-border-l2); border-radius: 999px; padding: 2px 7px; font-size: 10px; color: var(--dsw-alias-label-secondary); }
      .rsi-legend { margin-top: 8px; font-size: 10.5px; color: var(--dsw-alias-label-tertiary); }
      .rsi-stat { border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px; padding: 13px 14px; background: var(--dsw-alias-bg-layer-1); }
      .rsi-stat-label { font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--dsw-alias-label-tertiary); }
      .rsi-stat-value { margin-top: 6px; font-size: 20px; line-height: 1; font-weight: 760; font-variant-numeric: tabular-nums; }
      .rsi-stat-foot { margin-top: 7px; font-size: 11px; color: var(--dsw-alias-label-secondary); }
      .rsi-card { border: 1px solid var(--dsw-alias-border-l1); border-radius: 16px; padding: 16px; background: var(--dsw-alias-bg-layer-1); }
      .rsi-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
      .rsi-card-title { margin: 0; font-size: 14px; font-weight: 700; }
      .rsi-card-sub { margin: 4px 0 0; font-size: 12px; color: var(--dsw-alias-label-secondary); line-height: 1.6; }
      .rsi-controls { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 13px; }
      .rsi-btn { appearance: none; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); border-radius: 10px; padding: 8px 12px; font-size: 12px; font-weight: 650; cursor: pointer; transition: .15s ease; }
      .rsi-btn:hover { border-color: color-mix(in srgb, #5eead4 55%, transparent); transform: translateY(-1px); }
      .rsi-btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }
      .rsi-btn.primary { border-color: color-mix(in srgb, #5eead4 65%, transparent); background: color-mix(in srgb, #5eead4 16%, var(--dsw-alias-bg-layer-2)); color: #5eead4; }
      .rsi-btn.danger { border-color: color-mix(in srgb, #fb7185 45%, transparent); color: #fb7185; }
      .rsi-select { border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); padding: 8px 10px; font-size: 12px; }
      .rsi-toggle { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: var(--dsw-alias-label-secondary); }
      .rsi-toggle input { accent-color: #5eead4; }
      .rsi-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
      .rsi-table th { text-align: left; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--dsw-alias-label-tertiary); font-weight: 600; padding: 0 8px 8px; }
      .rsi-table td { border-top: 1px solid var(--dsw-alias-border-l1); padding: 10px 8px; vertical-align: middle; }
      .rsi-name { font-weight: 650; }
      .rsi-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; }
      .rsi-bar { height: 5px; width: 100%; min-width: 70px; border-radius: 999px; background: var(--dsw-alias-bg-layer-2); overflow: hidden; }
      .rsi-bar > i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #5eead4, #a3e635); }
      .rsi-badge { display: inline-block; border-radius: 6px; padding: 2px 6px; font-size: 10px; border: 1px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-secondary); }
      .rsi-badge.active { border-color: color-mix(in srgb, #5eead4 50%, transparent); color: #5eead4; }
      .rsi-badge.proxy { border-color: color-mix(in srgb, #fbbf24 40%, transparent); color: #fbbf24; }
      .rsi-empty { padding: 20px 0; text-align: center; color: var(--dsw-alias-label-tertiary); font-size: 12px; }
      .rsi-profile { width: 100%; box-sizing: border-box; min-height: 108px; resize: vertical; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); padding: 10px 12px; font: 12px/1.65 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      .rsi-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--dsw-alias-border-l1); font-size: 12px; }
      .rsi-row:last-child { border-bottom: 0; }
      .rsi-muted { color: var(--dsw-alias-label-tertiary); font-size: 11px; }
      .rsi-log { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 7px; }
      .rsi-log li { display: flex; gap: 9px; font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
      .rsi-log time { flex: none; color: var(--dsw-alias-label-tertiary); font-family: ui-monospace, monospace; }
      .rsi-copy { margin-left: auto; }
      .rsi-progress { border: 1px solid color-mix(in srgb, #5eead4 34%, transparent); border-radius: 13px; padding: 11px 13px; background: color-mix(in srgb, #5eead4 7%, var(--dsw-alias-bg-layer-1)); }
      .rsi-progress-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; font-size: 11px; color: var(--dsw-alias-label-secondary); }
      .rsi-progress-label { color: #5eead4; font-weight: 650; }
      .rsi-progress-track { height: 6px; border-radius: 999px; overflow: hidden; background: var(--dsw-alias-bg-layer-2); }
      .rsi-progress-track > i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #5eead4, #a3e635); transition: width .3s ease; }
      .rsi-lineage { display: flex; gap: 8px; overflow-x: auto; padding: 2px 0 6px; }
      .rsi-node { flex: 0 0 148px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; padding: 9px 10px; background: color-mix(in srgb, #5eead4 5%, var(--dsw-alias-bg-layer-2)); }
      .rsi-node-gen { display: inline-block; font: 10px ui-monospace, monospace; color: #5eead4; font-weight: 700; }
      .rsi-node-name { display: block; margin-top: 3px; font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .rsi-node-parent { display: block; margin-top: 3px; font-size: 10px; color: var(--dsw-alias-label-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .rsi-node-score { display: block; margin-top: 5px; font: 11px ui-monospace, monospace; color: var(--dsw-alias-label-secondary); }
      .rsi-dots { display: flex; flex-wrap: wrap; gap: 3px; }
      .rsi-dot { width: 17px; height: 17px; display: grid; place-items: center; border-radius: 5px; font-size: 10px; font-weight: 700; border: 1px solid var(--dsw-alias-border-l2); }
      .rsi-dot.pass { color: #5eead4; border-color: color-mix(in srgb, #5eead4 55%, transparent); background: color-mix(in srgb, #5eead4 9%, transparent); }
      .rsi-dot.fail { color: #fbbf24; border-color: color-mix(in srgb, #fbbf24 45%, transparent); }
      .rsi-dot.error { color: #fb7185; border-color: color-mix(in srgb, #fb7185 45%, transparent); }
      .rsi-error { border: 1px solid color-mix(in srgb, #fb7185 45%, transparent); background: color-mix(in srgb, #fb7185 9%, var(--dsw-alias-bg-layer-1)); color: #fb7185; border-radius: 12px; padding: 11px 13px; font-size: 12px; }
      @media (max-width: 720px) { .rsi-grid, .rsi-front { grid-template-columns: repeat(2, minmax(0, 1fr)); } .rsi-title { font-size: 22px; } }
    `

    const NS = 'dsh-rsi'
    const I18N = {
      zh: {
        section: 'RSI 配置',
        subtitle: '模型权重不变。插件进化自己的系统提示词、任务分解、验证习惯和用户模型。',
        connecting: '正在连接宿主…',
        running: '运行中',
        paused: '已暂停',
        mode: '模式',
        route: '路由',
        coexist: '共存',
        version: '版本',
        copyCard: '复制战绩',
        copiedCard: '战绩已复制',
        clipboardError: '剪贴板不可用：{error}',
        idle: '空闲',
        progressEvaluating: '评测 {task} · 候选 {current}/{total}',
        progressCandidates: '生成候选 · 第 {current}/{total} 代',
        statGeneration: '代际',
        statGenerationFoot: 'GENERATION',
        statBest: '最优适应度',
        statBestFoot: '本路线 · {evidence}',
        statPolicies: '策略数',
        statPoliciesFoot: '策略池',
        statActive: '当前',
        activeBest: '最优',
        activeStable: '稳定',
        frontierTitle: '三目标前沿',
        frontierSub: '同时保留最强、最省、最异三条策略。',
        frontierTargets: '3 个目标',
        frontBest: '最强',
        frontLean: '最省',
        frontExplorer: '最异',
        consoleTitle: '进化控制台',
        consoleSub: '每代生成候选，按固定评测选择；自动晋升只应用本路线最优，影子模式只记录。',
        realEval: '真实评测（调用模型）',
        evolveOne: '进化 1 代',
        evolving: '进化中…',
        evolveSix: '连跑 6 代',
        applyBest: '应用最优',
        rollback: '回滚',
        exportGenome: '导出 genome',
        modeShadow: '影子模式',
        modeManual: '手动应用',
        modeAuto: '自动晋升',
        injectPolicy: '注入当前策略',
        enableRsi: '启用 RSI',
        pauseRsi: '暂停 RSI',
        libraryTitle: '策略库',
        librarySub: '按适应度排序；没有真实评测时标为估算。',
        policyCount: '{n} 条策略',
        libraryEmpty: '还没有策略。点击“进化 1 代”开始。',
        tablePolicy: '策略',
        tableGeneration: '代',
        tableFitness: '适应度',
        tableEvidence: '证据',
        tableEvaluation: '评测',
        tableAction: '操作',
        passRate: '通过率',
        evidenceMeasured: '实测',
        evidenceProxy: '估算',
        evidencePartial: '部分实测',
        evidenceFailed: '评测失败',
        evidenceSeed: '种子',
        evidenceUnknown: '未知',
        pass: '通过',
        fail: '未通过',
        callFailed: '调用失败',
        inUse: '使用中',
        apply: '应用',
        legend: '✓ 通过 · × 未通过 · ! 调用失败 · 点击策略名查看完整提示词',
        meta: 'G{gen} · 父代 {parent} · 适应度 {fitness} · 通过率 {passRate} · 成本 {cost} · 异度 {novelty}',
        copyPrompt: '复制提示词',
        noPrompt: '（无提示词）',
        profileTitle: '用户模型',
        profileSub: '从对话提取长期偏好，也可以手动编辑。每行一条，最多 16 条。',
        save: '保存',
        clear: '清空',
        placeholder: '例如：\n以后都用中文\n回答先给结论\n不要写长篇大论',
        profileMeta: '语言 {language} · 详略 {verbosity} · 风格 {style} · 已观察 {turns} 轮',
        curveTitle: '代际曲线',
        curveSub: '每代最优适应度。组合与交叉带来非线性，不靠无限加长提示词。',
        generations: '{n} 代',
        curveEmpty: '运行第一代后出现曲线。',
        recent: '最近 {n} 代 · 当前 G{gen}',
        logsTitle: '运行日志',
        waiting: '等待操作…',
        footer: '策略提示词注入，不改权重。Think Ultra adapter 保持原样。存储：{storage}',
        firstRun: '第 0 代：先点“进化 1 代”。当前模式 {mode}；每代只和本路线已有最优比较。',
        summaryTitle: 'DSH RSI / G{gen} / 最优 {fitness} / {count} 条策略',
        summaryEvidence: '证据：{evidence} / 模式：{mode}',
        summaryScope: '权重不变。策略、分解、验证和用户模型由插件进化；不替换 Think Ultra adapter。',
        logDone: '{action} 完成',
        logFailed: '{action} 失败：{error}',
        logCardCopied: '战绩已复制',
        logPolicyCopied: '策略提示词已复制：{name}',
        logGenomeExported: '已导出 genome',
        logProfileSaved: '用户模型已保存',
        logProfileCleared: '用户模型已清空',
        modeChange: '切换模式',
        applyPolicy: '应用 {name}',
        exportError: '导出失败：{error}',
        languageEnglish: 'English',
        languageChinese: '中文',
        verbosityBalanced: '均衡',
        verbosityDetailed: '详细',
        verbosityConcise: '精简',
        styleDirect: '直接',
        styleWarm: '温和',
        styleNeutral: '中性',
        cost: '成本',
        novelty: '异度',
        agoJustNow: '刚刚',
        agoMinutes: '{n} 分钟前',
        agoHours: '{n} 小时前',
        parent: '父代',
        seed: '种子',
        policyBalanced: '平衡基线',
        policyDecomposer: '分解者',
        policyCounterexample: '反例者',
        policyCompressor: '压缩者',
        policyUnnamed: '未命名策略',
        policyMinimalSelfCheck: '最小单元自检版',
        policyUnitSelfCheck: '分单元即时自检',
        policyCrossover: '交叉',
        policyMutation: '变异',
        policyGenName: '第 {gen} 代 · {kind}',
        policyLLM: 'LLM {n}',
        'bench.exact-logic': '逻辑陷阱',
        'bench.exact-json': '严格 JSON',
        'bench.exact-list': '严格列表',
        'bench.exact-math': '精确算术',
        'bench.exact-count': '精确计数',
        'bench.exact-date': '日期边界',
        'bench.exact-csv': '严格 CSV',
        'bench.exact-chinese': '中文精确',
        'op.verify-first': '先验证再交付',
        'op.decompose': '最小可验证单元',
        'op.format-lock': '输出格式锁',
        'op.counterexample': '反例自检',
        'op.unknown-boundary': '未知边界',
        'op.first-principles': '第一性原理',
        'op.tool-bottleneck': '瓶颈处才用工具',
        'op.compress': '结论先行',
        'op.user-model': '用户模型优先',
        'op.recursive-audit': '递归审计',
      },
      en: {
        section: 'RSI Settings',
        subtitle: 'Model weights stay untouched. The plugin evolves its own system prompt, task breakdown, verification habits, and user model.',
        connecting: 'Connecting to the host…',
        running: 'Running',
        paused: 'Paused',
        mode: 'Mode',
        route: 'Route',
        coexist: 'Coexist',
        version: 'Version',
        copyCard: 'Copy record',
        copiedCard: 'Record copied',
        clipboardError: 'Clipboard unavailable: {error}',
        idle: 'Idle',
        progressEvaluating: 'Evaluating {task} · candidate {current}/{total}',
        progressCandidates: 'Generating candidates · generation {current}/{total}',
        statGeneration: 'GENERATION',
        statGenerationFoot: 'generation',
        statBest: 'BEST FITNESS',
        statBestFoot: 'This route · {evidence}',
        statPolicies: 'POLICIES',
        statPoliciesFoot: 'policy pool',
        statActive: 'ACTIVE',
        activeBest: 'BEST',
        activeStable: 'STABLE',
        frontierTitle: 'Three-target frontier',
        frontierSub: 'Keeps the strongest, leanest, and most novel policy at once.',
        frontierTargets: '3 TARGETS',
        frontBest: 'STRONGEST',
        frontLean: 'LEANEST',
        frontExplorer: 'MOST NOVEL',
        consoleTitle: 'Evolution console',
        consoleSub: 'Each generation produces candidates and selects by a fixed suite. Auto applies this route\'s best; shadow only records.',
        realEval: 'Live evaluation (calls the model)',
        evolveOne: 'Evolve 1 generation',
        evolving: 'Evolving…',
        evolveSix: 'Run 6 generations',
        applyBest: 'Apply best',
        rollback: 'Roll back',
        exportGenome: 'Export genome',
        modeShadow: 'Shadow',
        modeManual: 'Manual apply',
        modeAuto: 'Auto promote',
        injectPolicy: 'Inject current policy',
        enableRsi: 'Enable RSI',
        pauseRsi: 'Pause RSI',
        libraryTitle: 'Policy library',
        librarySub: 'Sorted by fitness; estimates are marked when there is no live evaluation.',
        policyCount: '{n} policies',
        libraryEmpty: 'No policies yet. Start with “Evolve 1 generation”.',
        tablePolicy: 'Policy',
        tableGeneration: 'Gen',
        tableFitness: 'Fitness',
        tableEvidence: 'Evidence',
        tableEvaluation: 'Eval',
        tableAction: 'Action',
        passRate: 'Pass rate',
        evidenceMeasured: 'measured',
        evidenceProxy: 'estimated',
        evidencePartial: 'partial',
        evidenceFailed: 'failed',
        evidenceSeed: 'seed',
        evidenceUnknown: 'unknown',
        pass: 'pass',
        fail: 'fail',
        callFailed: 'call failed',
        inUse: 'IN USE',
        apply: 'Apply',
        legend: '✓ pass · × fail · ! call failed · click a policy name for its full prompt',
        meta: 'G{gen} · parent {parent} · fitness {fitness} · pass {passRate} · cost {cost} · novelty {novelty}',
        copyPrompt: 'Copy prompt',
        noPrompt: '(no prompt)',
        profileTitle: 'User model',
        profileSub: 'Extract long-term preferences from the conversation, or edit by hand. One per line, up to 16.',
        save: 'Save',
        clear: 'Clear',
        placeholder: 'Example:\nAlways answer in Chinese\nLead with the conclusion\nSkip long explanations',
        profileMeta: 'Language {language} · detail {verbosity} · style {style} · observed {turns} turns',
        curveTitle: 'Generation curve',
        curveSub: 'Best fitness per generation. Recombination and crossover create nonlinear gains without endlessly longer prompts.',
        generations: '{n} generations',
        curveEmpty: 'Run the first generation to see the curve.',
        recent: 'Last {n} generations · current G{gen}',
        logsTitle: 'Run log',
        waiting: 'Waiting for action…',
        footer: 'Policy prompts are injected; weights are unchanged. The Think Ultra adapter is untouched. Storage: {storage}',
        firstRun: 'Generation 0: start with “Evolve 1 generation”. Current mode is {mode}; each generation is compared only with this route\'s best.',
        summaryTitle: 'DSH RSI / G{gen} / best {fitness} / {count} policies',
        summaryEvidence: 'Evidence: {evidence} / Mode: {mode}',
        summaryScope: 'Weights unchanged. The plugin evolves policies, breakdown, verification, and the user model; the Think Ultra adapter is untouched.',
        logDone: '{action} · done',
        logFailed: '{action} · failed: {error}',
        logCardCopied: 'Record copied',
        logPolicyCopied: 'Prompt copied: {name}',
        logGenomeExported: 'Genome exported',
        logProfileSaved: 'User model saved',
        logProfileCleared: 'User model cleared',
        modeChange: 'Switch mode',
        applyPolicy: 'Apply {name}',
        exportError: 'Export failed: {error}',
        languageEnglish: 'English',
        languageChinese: 'Chinese',
        verbosityBalanced: 'balanced',
        verbosityDetailed: 'detailed',
        verbosityConcise: 'concise',
        styleDirect: 'direct',
        styleWarm: 'warm',
        styleNeutral: 'neutral',
        cost: 'cost',
        novelty: 'novelty',
        agoJustNow: 'just now',
        agoMinutes: '{n}m ago',
        agoHours: '{n}h ago',
        parent: 'parent',
        seed: 'seed',
        policyBalanced: 'Balanced baseline',
        policyDecomposer: 'Decomposer',
        policyCounterexample: 'Counterexample',
        policyCompressor: 'Compressor',
        policyUnnamed: 'Unnamed policy',
        policyMinimalSelfCheck: 'Minimal-unit self-check',
        policyUnitSelfCheck: 'Per-unit instant self-check',
        policyCrossover: 'Crossover',
        policyMutation: 'Mutation',
        policyGenName: 'Gen {gen} · {kind}',
        policyLLM: 'LLM {n}',
        'bench.exact-logic': 'Logic trap',
        'bench.exact-json': 'Strict JSON',
        'bench.exact-list': 'Strict list',
        'bench.exact-math': 'Exact arithmetic',
        'bench.exact-count': 'Exact count',
        'bench.exact-date': 'Date boundary',
        'bench.exact-csv': 'Strict CSV',
        'bench.exact-chinese': 'Precise Chinese',
        'op.verify-first': 'Verify before delivery',
        'op.decompose': 'Smallest verifiable unit',
        'op.format-lock': 'Output format lock',
        'op.counterexample': 'Counterexample check',
        'op.unknown-boundary': 'Unknown boundary',
        'op.first-principles': 'First principles',
        'op.tool-bottleneck': 'Tools at the bottleneck',
        'op.compress': 'Conclusion first',
        'op.user-model': 'User model first',
        'op.recursive-audit': 'Recursive audit',
      },
      ja: {
        section: 'RSI 設定',
        subtitle: 'モデルの重みは変更しません。プラグイン自身のシステムプロンプト、タスク分解、検証習慣、ユーザーモデルを進化させます。',
        connecting: 'ホストに接続中…',
        running: '実行中',
        paused: '一時停止',
        mode: 'モード',
        route: 'ルート',
        coexist: '共存',
        version: 'バージョン',
        copyCard: '戦績をコピー',
        copiedCard: '戦績をコピーしました',
        clipboardError: 'クリップボードを利用できません：{error}',
        idle: '待機中',
        progressEvaluating: '評価 {task} · 候補 {current}/{total}',
        progressCandidates: '候補を生成 · 第 {current}/{total} 世代',
        statGeneration: '世代',
        statGenerationFoot: 'GENERATION',
        statBest: '最良適応度',
        statBestFoot: 'このルート · {evidence}',
        statPolicies: 'ポリシー数',
        statPoliciesFoot: 'ポリシープール',
        statActive: '現在',
        activeBest: '最良',
        activeStable: '安定',
        frontierTitle: '三目標フロンティア',
        frontierSub: '最強・最省・最も多様なポリシーを同時に保持します。',
        frontierTargets: '3 目標',
        frontBest: '最強',
        frontLean: '最省',
        frontExplorer: '最も多様',
        consoleTitle: '進化コンソール',
        consoleSub: '各世代で候補を生成し、固定評価で選択します。auto はこのルートの最良を適用し、shadow は記録のみです。',
        realEval: '実評価（モデル呼び出し）',
        evolveOne: '1 世代進化',
        evolving: '進化中…',
        evolveSix: '6 世代連続',
        applyBest: '最良を適用',
        rollback: 'ロールバック',
        exportGenome: 'genome をエクスポート',
        modeShadow: 'シャドウ',
        modeManual: '手動適用',
        modeAuto: '自動昇格',
        injectPolicy: '現在のポリシーを注入',
        enableRsi: 'RSI を有効化',
        pauseRsi: 'RSI を一時停止',
        libraryTitle: 'ポリシーライブラリ',
        librarySub: '適応度順。実評価がない場合は推定として表示。',
        policyCount: '{n} ポリシー',
        libraryEmpty: 'ポリシーがありません。「1 世代進化」から始めてください。',
        tablePolicy: 'ポリシー',
        tableGeneration: '世代',
        tableFitness: '適応度',
        tableEvidence: '証拠',
        tableEvaluation: '評価',
        tableAction: '操作',
        passRate: '合格率',
        evidenceMeasured: '実測',
        evidenceProxy: '推定',
        evidencePartial: '部分実測',
        evidenceFailed: '評価失敗',
        evidenceSeed: 'シード',
        evidenceUnknown: '不明',
        pass: '合格',
        fail: '不合格',
        callFailed: '呼び出し失敗',
        inUse: '使用中',
        apply: '適用',
        legend: '✓ 合格 · × 不合格 · ! 呼び出し失敗 · ポリシー名をクリックすると全文を表示',
        meta: 'G{gen} · 親 {parent} · 適応度 {fitness} · 合格率 {passRate} · コスト {cost} · 新規性 {novelty}',
        copyPrompt: 'プロンプトをコピー',
        noPrompt: '（プロンプトなし）',
        profileTitle: 'ユーザーモデル',
        profileSub: '会話から長期設定を抽出し、手動編集もできます。1 行に 1 件、最大 16 件。',
        save: '保存',
        clear: 'クリア',
        placeholder: '例：\n以後は日本語で\n結論から答える\n長文は避ける',
        profileMeta: '言語 {language} · 詳しさ {verbosity} · スタイル {style} · 観察 {turns} ターン',
        curveTitle: '世代曲線',
        curveSub: '各世代の最良適応度。組み合わせと交叉で非線形に改善し、プロンプトを無限に長くしません。',
        generations: '{n} 世代',
        curveEmpty: '最初の世代を実行すると曲線が表示されます。',
        recent: '直近 {n} 世代 · 現在 G{gen}',
        logsTitle: '実行ログ',
        waiting: '操作待ち…',
        footer: 'ポリシーを注入します。重みは変更しません。Think Ultra adapter はそのままです。保存先：{storage}',
        firstRun: '第 0 世代：「1 世代進化」を押してください。現在のモードは {mode}。各世代はこのルートの最良とのみ比較します。',
        summaryTitle: 'DSH RSI / G{gen} / 最良 {fitness} / {count} ポリシー',
        summaryEvidence: '証拠：{evidence} / モード：{mode}',
        summaryScope: '重みは変更しません。ポリシー、分解、検証、ユーザーモデルはプラグインが進化させ、Think Ultra adapter は置き換えません。',
        logDone: '{action} 完了',
        logFailed: '{action} 失敗：{error}',
        logCardCopied: '戦績をコピーしました',
        logPolicyCopied: 'プロンプトをコピー：{name}',
        logGenomeExported: 'genome をエクスポートしました',
        logProfileSaved: 'ユーザーモデルを保存しました',
        logProfileCleared: 'ユーザーモデルをクリアしました',
        modeChange: 'モード切替',
        applyPolicy: '{name} を適用',
        exportError: 'エクスポート失敗：{error}',
        languageEnglish: 'English',
        languageChinese: '中文',
        verbosityBalanced: 'バランス',
        verbosityDetailed: '詳細',
        verbosityConcise: '簡潔',
        styleDirect: '直接',
        styleWarm: '穏やか',
        styleNeutral: '中立',
        cost: 'コスト',
        novelty: '新規性',
        agoJustNow: 'たった今',
        agoMinutes: '{n} 分前',
        agoHours: '{n} 時間前',
        parent: '親',
        seed: 'シード',
        policyBalanced: 'バランス基準',
        policyDecomposer: '分解者',
        policyCounterexample: '反例者',
        policyCompressor: '圧縮者',
        policyUnnamed: '無名ポリシー',
        policyMinimalSelfCheck: '最小単位セルフチェック版',
        policyUnitSelfCheck: 'ユニット別即時セルフチェック',
        policyCrossover: '交叉',
        policyMutation: '変異',
        policyGenName: '第 {gen} 世代 · {kind}',
        policyLLM: 'LLM {n}',
        'bench.exact-logic': '論理の罠',
        'bench.exact-json': '厳格 JSON',
        'bench.exact-list': '厳格リスト',
        'bench.exact-math': '正確な算術',
        'bench.exact-count': '正確な計数',
        'bench.exact-date': '日付境界',
        'bench.exact-csv': '厳格 CSV',
        'bench.exact-chinese': '中国語の正確さ',
        'op.verify-first': '納品前に検証',
        'op.decompose': '最小検証単位',
        'op.format-lock': '出力形式ロック',
        'op.counterexample': '反例チェック',
        'op.unknown-boundary': '未知の境界',
        'op.first-principles': '第一原理',
        'op.tool-bottleneck': 'ボトルネックでツール',
        'op.compress': '結論を先に',
        'op.user-model': 'ユーザーモデル優先',
        'op.recursive-audit': '再帰監査',
      },
      es: {
        section: 'Ajustes RSI',
        subtitle: 'Los pesos no cambian. El plugin evoluciona su propio prompt de sistema, desglose de tareas, hábitos de verificación y modelo de usuario.',
        connecting: 'Conectando al host…',
        running: 'En ejecución',
        paused: 'En pausa',
        mode: 'Modo',
        route: 'Ruta',
        coexist: 'Coexistencia',
        version: 'Versión',
        copyCard: 'Copiar registro',
        copiedCard: 'Registro copiado',
        clipboardError: 'Portapapeles no disponible: {error}',
        idle: 'Inactivo',
        progressEvaluating: 'Evaluando {task} · candidato {current}/{total}',
        progressCandidates: 'Generando candidatos · generación {current}/{total}',
        statGeneration: 'GENERACIÓN',
        statGenerationFoot: 'generación',
        statBest: 'MEJOR FITNESS',
        statBestFoot: 'Esta ruta · {evidence}',
        statPolicies: 'POLÍTICAS',
        statPoliciesFoot: 'reserva de políticas',
        statActive: 'ACTIVA',
        activeBest: 'MEJOR',
        activeStable: 'ESTABLE',
        frontierTitle: 'Frontera de tres objetivos',
        frontierSub: 'Conserva a la vez la política más fuerte, la más económica y la más novedosa.',
        frontierTargets: '3 OBJETIVOS',
        frontBest: 'MÁS FUERTE',
        frontLean: 'MÁS ECONÓMICA',
        frontExplorer: 'MÁS NOVEDOSA',
        consoleTitle: 'Consola de evolución',
        consoleSub: 'Cada generación genera candidatos y los selecciona con una suite fija. Auto aplica la mejor de esta ruta; shadow solo registra.',
        realEval: 'Evaluación real (llama al modelo)',
        evolveOne: 'Evolucionar 1 generación',
        evolving: 'Evolucionando…',
        evolveSix: 'Ejecutar 6 generaciones',
        applyBest: 'Aplicar la mejor',
        rollback: 'Revertir',
        exportGenome: 'Exportar genome',
        modeShadow: 'Sombra',
        modeManual: 'Aplicación manual',
        modeAuto: 'Promoción automática',
        injectPolicy: 'Inyectar política actual',
        enableRsi: 'Activar RSI',
        pauseRsi: 'Pausar RSI',
        libraryTitle: 'Biblioteca de políticas',
        librarySub: 'Ordenadas por fitness; las estimaciones se marcan cuando no hay evaluación real.',
        policyCount: '{n} políticas',
        libraryEmpty: 'Aún no hay políticas. Empieza con «Evolucionar 1 generación».',
        tablePolicy: 'Política',
        tableGeneration: 'Gen',
        tableFitness: 'Fitness',
        tableEvidence: 'Evidencia',
        tableEvaluation: 'Evaluación',
        tableAction: 'Acción',
        passRate: 'Tasa de aprobación',
        evidenceMeasured: 'medida',
        evidenceProxy: 'estimada',
        evidencePartial: 'parcial',
        evidenceFailed: 'fallida',
        evidenceSeed: 'semilla',
        evidenceUnknown: 'desconocida',
        pass: 'aprueba',
        fail: 'falla',
        callFailed: 'llamada fallida',
        inUse: 'EN USO',
        apply: 'Aplicar',
        legend: '✓ aprueba · × falla · ! llamada fallida · pulsa el nombre para ver el prompt completo',
        meta: 'G{gen} · padre {parent} · fitness {fitness} · aprobación {passRate} · coste {cost} · novedad {novelty}',
        copyPrompt: 'Copiar prompt',
        noPrompt: '(sin prompt)',
        profileTitle: 'Modelo de usuario',
        profileSub: 'Extrae preferencias duraderas de la conversación o edítalas a mano. Una por línea, máximo 16.',
        save: 'Guardar',
        clear: 'Vaciar',
        placeholder: 'Ejemplo:\nResponde siempre en español\nEmpieza por la conclusión\nEvita explicaciones largas',
        profileMeta: 'Idioma {language} · detalle {verbosity} · estilo {style} · observados {turns} turnos',
        curveTitle: 'Curva de generaciones',
        curveSub: 'Mejor fitness por generación. La combinación y el cruce producen mejoras no lineales sin alargar los prompts indefinidamente.',
        generations: '{n} generaciones',
        curveEmpty: 'Ejecuta la primera generación para ver la curva.',
        recent: 'Últimas {n} generaciones · actual G{gen}',
        logsTitle: 'Registro de ejecución',
        waiting: 'Esperando acción…',
        footer: 'Se inyectan prompts de política; los pesos no cambian. El adapter de Think Ultra queda intacto. Almacenamiento: {storage}',
        firstRun: 'Generación 0: pulsa «Evolucionar 1 generación». El modo actual es {mode}; cada generación solo se compara con la mejor de esta ruta.',
        summaryTitle: 'DSH RSI / G{gen} / mejor {fitness} / {count} políticas',
        summaryEvidence: 'Evidencia: {evidence} / Modo: {mode}',
        summaryScope: 'Los pesos no cambian. El plugin evoluciona políticas, desglose, verificación y modelo de usuario; no sustituye el adapter de Think Ultra.',
        logDone: '{action} · completado',
        logFailed: '{action} · fallido: {error}',
        logCardCopied: 'Registro copiado',
        logPolicyCopied: 'Prompt copiado: {name}',
        logGenomeExported: 'Genome exportado',
        logProfileSaved: 'Modelo de usuario guardado',
        logProfileCleared: 'Modelo de usuario vaciado',
        modeChange: 'Cambiar modo',
        applyPolicy: 'Aplicar {name}',
        exportError: 'Error de exportación: {error}',
        languageEnglish: 'English',
        languageChinese: '中文',
        verbosityBalanced: 'equilibrado',
        verbosityDetailed: 'detallado',
        verbosityConcise: 'conciso',
        styleDirect: 'directo',
        styleWarm: 'cálido',
        styleNeutral: 'neutral',
        cost: 'coste',
        novelty: 'novedad',
        agoJustNow: 'ahora mismo',
        agoMinutes: 'hace {n} min',
        agoHours: 'hace {n} h',
        parent: 'padre',
        seed: 'semilla',
        policyBalanced: 'Base equilibrada',
        policyDecomposer: 'Descomponedor',
        policyCounterexample: 'Contraejemplo',
        policyCompressor: 'Compresor',
        policyUnnamed: 'Política sin nombre',
        policyMinimalSelfCheck: 'Autocheck de unidad mínima',
        policyUnitSelfCheck: 'Autocheck instantáneo por unidad',
        policyCrossover: 'Cruce',
        policyMutation: 'Mutación',
        policyGenName: 'Gen {gen} · {kind}',
        policyLLM: 'LLM {n}',
        'bench.exact-logic': 'Trampa lógica',
        'bench.exact-json': 'JSON estricto',
        'bench.exact-list': 'Lista estricta',
        'bench.exact-math': 'Aritmética exacta',
        'bench.exact-count': 'Conteo exacto',
        'bench.exact-date': 'Límite de fecha',
        'bench.exact-csv': 'CSV estricto',
        'bench.exact-chinese': 'Chino preciso',
        'op.verify-first': 'Verificar antes de entregar',
        'op.decompose': 'Unidad verificable mínima',
        'op.format-lock': 'Bloqueo de formato',
        'op.counterexample': 'Comprobación de contraejemplo',
        'op.unknown-boundary': 'Límite desconocido',
        'op.first-principles': 'Primeros principios',
        'op.tool-bottleneck': 'Herramientas en el cuello de botella',
        'op.compress': 'Conclusión primero',
        'op.user-model': 'Modelo de usuario primero',
        'op.recursive-audit': 'Auditoría recursiva',
      },
      fr: {
        section: 'Réglages RSI',
        subtitle: 'Les poids restent intacts. Le plugin fait évoluer son propre prompt système, sa décomposition des tâches, ses habitudes de vérification et son modèle utilisateur.',
        connecting: 'Connexion à l’hôte…',
        running: 'En cours',
        paused: 'En pause',
        mode: 'Mode',
        route: 'Route',
        coexist: 'Coexistence',
        version: 'Version',
        copyCard: 'Copier le bilan',
        copiedCard: 'Bilan copié',
        clipboardError: 'Presse-papiers indisponible : {error}',
        idle: 'Inactif',
        progressEvaluating: 'Évaluation de {task} · candidat {current}/{total}',
        progressCandidates: 'Génération de candidats · génération {current}/{total}',
        statGeneration: 'GÉNÉRATION',
        statGenerationFoot: 'génération',
        statBest: 'MEILLEUR FITNESS',
        statBestFoot: 'Cette route · {evidence}',
        statPolicies: 'POLITIQUES',
        statPoliciesFoot: 'réserve de politiques',
        statActive: 'ACTIVE',
        activeBest: 'MEILLEURE',
        activeStable: 'STABLE',
        frontierTitle: 'Frontière à trois objectifs',
        frontierSub: 'Conserve à la fois la politique la plus forte, la plus économique et la plus originale.',
        frontierTargets: '3 OBJECTIFS',
        frontBest: 'LA PLUS FORTE',
        frontLean: 'LA PLUS ÉCONOME',
        frontExplorer: 'LA PLUS ORIGINALE',
        consoleTitle: 'Console d’évolution',
        consoleSub: 'Chaque génération produit des candidats et les sélectionne avec une suite fixe. Auto applique la meilleure de cette route ; shadow se contente d’enregistrer.',
        realEval: 'Évaluation réelle (appelle le modèle)',
        evolveOne: 'Faire évoluer 1 génération',
        evolving: 'Évolution…',
        evolveSix: 'Enchaîner 6 générations',
        applyBest: 'Appliquer la meilleure',
        rollback: 'Revenir en arrière',
        exportGenome: 'Exporter le génome',
        modeShadow: 'Ombre',
        modeManual: 'Application manuelle',
        modeAuto: 'Promotion automatique',
        injectPolicy: 'Injecter la politique actuelle',
        enableRsi: 'Activer RSI',
        pauseRsi: 'Mettre RSI en pause',
        libraryTitle: 'Bibliothèque de politiques',
        librarySub: 'Triées par fitness ; les estimations sont signalées en l’absence d’évaluation réelle.',
        policyCount: '{n} politiques',
        libraryEmpty: 'Aucune politique. Commencez par « Faire évoluer 1 génération ».',
        tablePolicy: 'Politique',
        tableGeneration: 'Gén',
        tableFitness: 'Fitness',
        tableEvidence: 'Preuve',
        tableEvaluation: 'Évaluation',
        tableAction: 'Action',
        passRate: 'Taux de réussite',
        evidenceMeasured: 'mesurée',
        evidenceProxy: 'estimée',
        evidencePartial: 'partielle',
        evidenceFailed: 'échouée',
        evidenceSeed: 'graine',
        evidenceUnknown: 'inconnue',
        pass: 'réussit',
        fail: 'échoue',
        callFailed: 'appel échoué',
        inUse: 'EN USAGE',
        apply: 'Appliquer',
        legend: '✓ réussit · × échoue · ! appel échoué · cliquez sur le nom pour voir le prompt complet',
        meta: 'G{gen} · parent {parent} · fitness {fitness} · réussite {passRate} · coût {cost} · nouveauté {novelty}',
        copyPrompt: 'Copier le prompt',
        noPrompt: '(aucun prompt)',
        profileTitle: 'Modèle utilisateur',
        profileSub: 'Extrayez les préférences durables de la conversation ou modifiez-les à la main. Une par ligne, 16 maximum.',
        save: 'Enregistrer',
        clear: 'Vider',
        placeholder: 'Exemple :\nRéponds toujours en français\nCommence par la conclusion\nÉvite les longues explications',
        profileMeta: 'Langue {language} · détail {verbosity} · style {style} · {turns} tours observés',
        curveTitle: 'Courbe des générations',
        curveSub: 'Meilleur fitness par génération. Le croisement et la recombinaison créent des gains non linéaires sans allonger indéfiniment les prompts.',
        generations: '{n} générations',
        curveEmpty: 'Lancez la première génération pour voir la courbe.',
        recent: 'Dernières {n} générations · actuelle G{gen}',
        logsTitle: 'Journal d’exécution',
        waiting: 'En attente d’une action…',
        footer: 'Les prompts de politique sont injectés ; les poids ne changent pas. L’adapter Think Ultra reste intact. Stockage : {storage}',
        firstRun: 'Génération 0 : commencez par « Faire évoluer 1 génération ». Le mode actuel est {mode} ; chaque génération n’est comparée qu’à la meilleure de cette route.',
        summaryTitle: 'DSH RSI / G{gen} / meilleur {fitness} / {count} politiques',
        summaryEvidence: 'Preuve : {evidence} / Mode : {mode}',
        summaryScope: 'Les poids ne changent pas. Le plugin fait évoluer politiques, décomposition, vérification et modèle utilisateur ; il ne remplace pas l’adapter Think Ultra.',
        logDone: '{action} · terminé',
        logFailed: '{action} · échec : {error}',
        logCardCopied: 'Bilan copié',
        logPolicyCopied: 'Prompt copié : {name}',
        logGenomeExported: 'Génome exporté',
        logProfileSaved: 'Modèle utilisateur enregistré',
        logProfileCleared: 'Modèle utilisateur vidé',
        modeChange: 'Changer de mode',
        applyPolicy: 'Appliquer {name}',
        exportError: 'Échec de l’export : {error}',
        languageEnglish: 'English',
        languageChinese: '中文',
        verbosityBalanced: 'équilibré',
        verbosityDetailed: 'détaillé',
        verbosityConcise: 'concis',
        styleDirect: 'direct',
        styleWarm: 'chaleureux',
        styleNeutral: 'neutre',
        cost: 'coût',
        novelty: 'nouveauté',
        agoJustNow: 'à l’instant',
        agoMinutes: 'il y a {n} min',
        agoHours: 'il y a {n} h',
        parent: 'parent',
        seed: 'graine',
        policyBalanced: 'Base équilibrée',
        policyDecomposer: 'Décomposeur',
        policyCounterexample: 'Contre-exemple',
        policyCompressor: 'Compresseur',
        policyUnnamed: 'Politique sans nom',
        policyMinimalSelfCheck: 'Auto-vérification unitaire minimale',
        policyUnitSelfCheck: 'Auto-vérification instantanée par unité',
        policyCrossover: 'Croisement',
        policyMutation: 'Mutation',
        policyGenName: 'Gén {gen} · {kind}',
        policyLLM: 'LLM {n}',
        'bench.exact-logic': 'Piège logique',
        'bench.exact-json': 'JSON strict',
        'bench.exact-list': 'Liste stricte',
        'bench.exact-math': 'Arithmétique exacte',
        'bench.exact-count': 'Comptage exact',
        'bench.exact-date': 'Limite de date',
        'bench.exact-csv': 'CSV strict',
        'bench.exact-chinese': 'Chinois précis',
        'op.verify-first': 'Vérifier avant de livrer',
        'op.decompose': 'Plus petite unité vérifiable',
        'op.format-lock': 'Verrouillage du format',
        'op.counterexample': 'Contre-exemple',
        'op.unknown-boundary': 'Frontière inconnue',
        'op.first-principles': 'Principes premiers',
        'op.tool-bottleneck': 'Outils au goulot',
        'op.compress': 'Conclusion d’abord',
        'op.user-model': 'Modèle utilisateur d’abord',
        'op.recursive-audit': 'Audit récursif',
      },
      de: {
        section: 'RSI-Einstellungen',
        subtitle: 'Die Modellgewichte bleiben unverändert. Das Plugin entwickelt seinen eigenen System-Prompt, seine Aufgabenzerlegung, Prüfgewohnheiten und sein Nutzermodell weiter.',
        connecting: 'Verbindung zum Host…',
        running: 'Läuft',
        paused: 'Pausiert',
        mode: 'Modus',
        route: 'Route',
        coexist: 'Koexistenz',
        version: 'Version',
        copyCard: 'Bilanz kopieren',
        copiedCard: 'Bilanz kopiert',
        clipboardError: 'Zwischenablage nicht verfügbar: {error}',
        idle: 'Leerlauf',
        progressEvaluating: 'Prüfe {task} · Kandidat {current}/{total}',
        progressCandidates: 'Kandidaten erzeugen · Generation {current}/{total}',
        statGeneration: 'GENERATION',
        statGenerationFoot: 'Generation',
        statBest: 'BESTE FITNESS',
        statBestFoot: 'Diese Route · {evidence}',
        statPolicies: 'RICHTLINIEN',
        statPoliciesFoot: 'Richtlinien-Pool',
        statActive: 'AKTIV',
        activeBest: 'BESTE',
        activeStable: 'STABIL',
        frontierTitle: 'Drei-Ziel-Front',
        frontierSub: 'Hält die stärkste, sparsamste und neuartigste Richtlinie gleichzeitig.',
        frontierTargets: '3 ZIELE',
        frontBest: 'STÄRKSTE',
        frontLean: 'SPARSAMSTE',
        frontExplorer: 'NEUARTIGSTE',
        consoleTitle: 'Evolutionskonsole',
        consoleSub: 'Jede Generation erzeugt Kandidaten und wählt sie über eine feste Suite aus. Auto wendet die beste dieser Route an; Shadow zeichnet nur auf.',
        realEval: 'Echte Bewertung (ruft das Modell auf)',
        evolveOne: '1 Generation entwickeln',
        evolving: 'Entwicklung…',
        evolveSix: '6 Generationen laufen lassen',
        applyBest: 'Beste anwenden',
        rollback: 'Zurücksetzen',
        exportGenome: 'Genom exportieren',
        modeShadow: 'Shadow',
        modeManual: 'Manuell anwenden',
        modeAuto: 'Automatisch befördern',
        injectPolicy: 'Aktuelle Richtlinie injizieren',
        enableRsi: 'RSI aktivieren',
        pauseRsi: 'RSI pausieren',
        libraryTitle: 'Richtlinienbibliothek',
        librarySub: 'Nach Fitness sortiert; Schätzungen werden ohne echte Bewertung markiert.',
        policyCount: '{n} Richtlinien',
        libraryEmpty: 'Noch keine Richtlinien. Starte mit „1 Generation entwickeln“.',
        tablePolicy: 'Richtlinie',
        tableGeneration: 'Gen',
        tableFitness: 'Fitness',
        tableEvidence: 'Beleg',
        tableEvaluation: 'Bewertung',
        tableAction: 'Aktion',
        passRate: 'Bestehensquote',
        evidenceMeasured: 'gemessen',
        evidenceProxy: 'geschätzt',
        evidencePartial: 'teilweise',
        evidenceFailed: 'fehlgeschlagen',
        evidenceSeed: 'Startwert',
        evidenceUnknown: 'unbekannt',
        pass: 'bestanden',
        fail: 'nicht bestanden',
        callFailed: 'Aufruf fehlgeschlagen',
        inUse: 'IN VERWENDUNG',
        apply: 'Anwenden',
        legend: '✓ bestanden · × nicht bestanden · ! Aufruf fehlgeschlagen · Richtlinienname für den vollen Prompt anklicken',
        meta: 'G{gen} · Eltern {parent} · Fitness {fitness} · Quote {passRate} · Kosten {cost} · Neuheit {novelty}',
        copyPrompt: 'Prompt kopieren',
        noPrompt: '(kein Prompt)',
        profileTitle: 'Nutzermodell',
        profileSub: 'Langfristige Vorlieben aus dem Gespräch ziehen oder von Hand bearbeiten. Eine pro Zeile, maximal 16.',
        save: 'Speichern',
        clear: 'Leeren',
        placeholder: 'Beispiel:\nAntworte immer auf Deutsch\nBeginne mit dem Fazit\nVermeide lange Erklärungen',
        profileMeta: 'Sprache {language} · Detail {verbosity} · Stil {style} · {turns} Runden beobachtet',
        curveTitle: 'Generationskurve',
        curveSub: 'Beste Fitness pro Generation. Rekombination und Kreuzung erzeugen nichtlineare Gewinne, ohne Prompts endlos zu verlängern.',
        generations: '{n} Generationen',
        curveEmpty: 'Starte die erste Generation, um die Kurve zu sehen.',
        recent: 'Letzte {n} Generationen · aktuell G{gen}',
        logsTitle: 'Laufprotokoll',
        waiting: 'Warte auf Aktion…',
        footer: 'Richtlinien-Prompts werden injiziert; die Gewichte bleiben unverändert. Der Think-Ultra-Adapter bleibt unangetastet. Speicher: {storage}',
        firstRun: 'Generation 0: Starte mit „1 Generation entwickeln“. Aktueller Modus: {mode}; jede Generation wird nur mit der besten dieser Route verglichen.',
        summaryTitle: 'DSH RSI / G{gen} / beste {fitness} / {count} Richtlinien',
        summaryEvidence: 'Beleg: {evidence} / Modus: {mode}',
        summaryScope: 'Gewichte unverändert. Das Plugin entwickelt Richtlinien, Zerlegung, Prüfung und Nutzermodell; der Think-Ultra-Adapter wird nicht ersetzt.',
        logDone: '{action} · erledigt',
        logFailed: '{action} · fehlgeschlagen: {error}',
        logCardCopied: 'Bilanz kopiert',
        logPolicyCopied: 'Prompt kopiert: {name}',
        logGenomeExported: 'Genom exportiert',
        logProfileSaved: 'Nutzermodell gespeichert',
        logProfileCleared: 'Nutzermodell geleert',
        modeChange: 'Modus wechseln',
        applyPolicy: '{name} anwenden',
        exportError: 'Export fehlgeschlagen: {error}',
        languageEnglish: 'English',
        languageChinese: '中文',
        verbosityBalanced: 'ausgewogen',
        verbosityDetailed: 'ausführlich',
        verbosityConcise: 'knapp',
        styleDirect: 'direkt',
        styleWarm: 'freundlich',
        styleNeutral: 'neutral',
        cost: 'Kosten',
        novelty: 'Neuheit',
        agoJustNow: 'gerade eben',
        agoMinutes: 'vor {n} Min.',
        agoHours: 'vor {n} Std.',
        parent: 'Eltern',
        seed: 'Startwert',
        policyBalanced: 'Ausgewogene Basis',
        policyDecomposer: 'Zerleger',
        policyCounterexample: 'Gegenbeispiel',
        policyCompressor: 'Kompressor',
        policyUnnamed: 'Unbenannte Richtlinie',
        policyMinimalSelfCheck: 'Selbstprüfung kleinster Einheit',
        policyUnitSelfCheck: 'Sofortige Prüfung pro Einheit',
        policyCrossover: 'Kreuzung',
        policyMutation: 'Mutation',
        policyGenName: 'Gen {gen} · {kind}',
        policyLLM: 'LLM {n}',
        'bench.exact-logic': 'Logikfalle',
        'bench.exact-json': 'Strenges JSON',
        'bench.exact-list': 'Strenge Liste',
        'bench.exact-math': 'Exakte Arithmetik',
        'bench.exact-count': 'Exakte Zählung',
        'bench.exact-date': 'Datumsgrenze',
        'bench.exact-csv': 'Strenges CSV',
        'bench.exact-chinese': 'Präzises Chinesisch',
        'op.verify-first': 'Vor Lieferung prüfen',
        'op.decompose': 'Kleinste prüfbare Einheit',
        'op.format-lock': 'Ausgabeformat sperren',
        'op.counterexample': 'Gegenbeispiel prüfen',
        'op.unknown-boundary': 'Unbekannte Grenze',
        'op.first-principles': 'Erste Prinzipien',
        'op.tool-bottleneck': 'Werkzeuge am Engpass',
        'op.compress': 'Fazit zuerst',
        'op.user-model': 'Nutzermodell zuerst',
        'op.recursive-audit': 'Rekursive Prüfung',
      },
      ru: {
        section: 'Настройки RSI',
        subtitle: 'Веса модели не меняются. Плагин развивает собственный системный промпт, декомпозицию задач, привычки проверки и модель пользователя.',
        connecting: 'Подключение к хосту…',
        running: 'Работает',
        paused: 'Приостановлено',
        mode: 'Режим',
        route: 'Маршрут',
        coexist: 'Сосуществование',
        version: 'Версия',
        copyCard: 'Копировать итог',
        copiedCard: 'Итог скопирован',
        clipboardError: 'Буфер обмена недоступен: {error}',
        idle: 'Ожидание',
        progressEvaluating: 'Проверка {task} · кандидат {current}/{total}',
        progressCandidates: 'Генерация кандидатов · поколение {current}/{total}',
        statGeneration: 'ПОКОЛЕНИЕ',
        statGenerationFoot: 'поколение',
        statBest: 'ЛУЧШАЯ ПРИСПОСОБЛЕННОСТЬ',
        statBestFoot: 'Этот маршрут · {evidence}',
        statPolicies: 'ПОЛИТИКИ',
        statPoliciesFoot: 'пул политик',
        statActive: 'АКТИВНА',
        activeBest: 'ЛУЧШАЯ',
        activeStable: 'СТАБИЛЬНАЯ',
        frontierTitle: 'Фронт трёх целей',
        frontierSub: 'Одновременно сохраняет самую сильную, самую экономную и самую необычную политику.',
        frontierTargets: '3 ЦЕЛИ',
        frontBest: 'САМАЯ СИЛЬНАЯ',
        frontLean: 'САМАЯ ЭКОНОМНАЯ',
        frontExplorer: 'САМАЯ НЕОБЫЧНАЯ',
        consoleTitle: 'Консоль эволюции',
        consoleSub: 'Каждое поколение создаёт кандидатов и выбирает их по фиксированному набору. Auto применяет лучшую для этого маршрута; shadow только записывает.',
        realEval: 'Реальная проверка (вызов модели)',
        evolveOne: 'Развить 1 поколение',
        evolving: 'Развитие…',
        evolveSix: 'Запустить 6 поколений',
        applyBest: 'Применить лучшую',
        rollback: 'Откатить',
        exportGenome: 'Экспорт генома',
        modeShadow: 'Тень',
        modeManual: 'Ручное применение',
        modeAuto: 'Автоповышение',
        injectPolicy: 'Внедрить текущую политику',
        enableRsi: 'Включить RSI',
        pauseRsi: 'Приостановить RSI',
        libraryTitle: 'Библиотека политик',
        librarySub: 'Сортировка по приспособленности; оценки помечаются без реальной проверки.',
        policyCount: '{n} политик',
        libraryEmpty: 'Политик пока нет. Начните с «Развить 1 поколение».',
        tablePolicy: 'Политика',
        tableGeneration: 'Пок.',
        tableFitness: 'Приспособленность',
        tableEvidence: 'Доказательство',
        tableEvaluation: 'Проверка',
        tableAction: 'Действие',
        passRate: 'Доля прохождений',
        evidenceMeasured: 'измерено',
        evidenceProxy: 'оценено',
        evidencePartial: 'частично',
        evidenceFailed: 'ошибка',
        evidenceSeed: 'начальное',
        evidenceUnknown: 'неизвестно',
        pass: 'проходит',
        fail: 'не проходит',
        callFailed: 'вызов не удался',
        inUse: 'ИСПОЛЬЗУЕТСЯ',
        apply: 'Применить',
        legend: '✓ проходит · × не проходит · ! вызов не удался · нажмите на имя для полного промпта',
        meta: 'G{gen} · родитель {parent} · приспособленность {fitness} · прохождение {passRate} · цена {cost} · новизна {novelty}',
        copyPrompt: 'Копировать промпт',
        noPrompt: '(нет промпта)',
        profileTitle: 'Модель пользователя',
        profileSub: 'Извлекайте долгосрочные предпочтения из диалога или редактируйте вручную. По одному в строке, до 16.',
        save: 'Сохранить',
        clear: 'Очистить',
        placeholder: 'Пример:\nВсегда отвечай по-русски\nСначала вывод\nБез длинных объяснений',
        profileMeta: 'Язык {language} · детализация {verbosity} · стиль {style} · наблюдений {turns}',
        curveTitle: 'Кривая поколений',
        curveSub: 'Лучшая приспособленность за поколение. Рекомбинация и скрещивание дают нелинейный рост без бесконечного удлинения промптов.',
        generations: '{n} поколений',
        curveEmpty: 'Запустите первое поколение, чтобы увидеть кривую.',
        recent: 'Последние {n} поколений · текущее G{gen}',
        logsTitle: 'Журнал работы',
        waiting: 'Ожидание действия…',
        footer: 'Промпты политик внедряются; веса не меняются. Адаптер Think Ultra не затрагивается. Хранилище: {storage}',
        firstRun: 'Поколение 0: начните с «Развить 1 поколение». Текущий режим — {mode}; каждое поколение сравнивается только с лучшим на этом маршруте.',
        summaryTitle: 'DSH RSI / G{gen} / лучшая {fitness} / {count} политик',
        summaryEvidence: 'Доказательство: {evidence} / Режим: {mode}',
        summaryScope: 'Веса не меняются. Плагин развивает политики, декомпозицию, проверку и модель пользователя; адаптер Think Ultra не заменяется.',
        logDone: '{action} · готово',
        logFailed: '{action} · ошибка: {error}',
        logCardCopied: 'Итог скопирован',
        logPolicyCopied: 'Промпт скопирован: {name}',
        logGenomeExported: 'Геном экспортирован',
        logProfileSaved: 'Модель пользователя сохранена',
        logProfileCleared: 'Модель пользователя очищена',
        modeChange: 'Сменить режим',
        applyPolicy: 'Применить {name}',
        exportError: 'Ошибка экспорта: {error}',
        languageEnglish: 'English',
        languageChinese: '中文',
        verbosityBalanced: 'сбалансированно',
        verbosityDetailed: 'подробно',
        verbosityConcise: 'кратко',
        styleDirect: 'прямо',
        styleWarm: 'тепло',
        styleNeutral: 'нейтрально',
        cost: 'цена',
        novelty: 'новизна',
        agoJustNow: 'только что',
        agoMinutes: '{n} мин назад',
        agoHours: '{n} ч назад',
        parent: 'родитель',
        seed: 'начальное',
        policyBalanced: 'Сбалансированная база',
        policyDecomposer: 'Декомпозитор',
        policyCounterexample: 'Контрпример',
        policyCompressor: 'Компрессор',
        policyUnnamed: 'Безымянная политика',
        policyMinimalSelfCheck: 'Самопроверка минимального блока',
        policyUnitSelfCheck: 'Мгновенная самопроверка по блокам',
        policyCrossover: 'Скрещивание',
        policyMutation: 'Мутация',
        policyGenName: 'Пок. {gen} · {kind}',
        policyLLM: 'LLM {n}',
        'bench.exact-logic': 'Логическая ловушка',
        'bench.exact-json': 'Строгий JSON',
        'bench.exact-list': 'Строгий список',
        'bench.exact-math': 'Точная арифметика',
        'bench.exact-count': 'Точный подсчёт',
        'bench.exact-date': 'Граница даты',
        'bench.exact-csv': 'Строгий CSV',
        'bench.exact-chinese': 'Точный китайский',
        'op.verify-first': 'Проверить перед сдачей',
        'op.decompose': 'Минимальная проверяемая единица',
        'op.format-lock': 'Фиксация формата',
        'op.counterexample': 'Проверка контрпримером',
        'op.unknown-boundary': 'Граница неизвестного',
        'op.first-principles': 'Первые принципы',
        'op.tool-bottleneck': 'Инструменты в узком месте',
        'op.compress': 'Сначала вывод',
        'op.user-model': 'Сначала модель пользователя',
        'op.recursive-audit': 'Рекурсивный аудит',
      },
      pt: {
        section: 'Configurações RSI',
        subtitle: 'Os pesos do modelo não mudam. O plugin evolui o próprio prompt de sistema, a decomposição de tarefas, os hábitos de verificação e o modelo de usuário.',
        connecting: 'Conectando ao host…',
        running: 'Em execução',
        paused: 'Pausado',
        mode: 'Modo',
        route: 'Rota',
        coexist: 'Coexistência',
        version: 'Versão',
        copyCard: 'Copiar registro',
        copiedCard: 'Registro copiado',
        clipboardError: 'Área de transferência indisponível: {error}',
        idle: 'Ocioso',
        progressEvaluating: 'Avaliando {task} · candidato {current}/{total}',
        progressCandidates: 'Gerando candidatos · geração {current}/{total}',
        statGeneration: 'GERAÇÃO',
        statGenerationFoot: 'geração',
        statBest: 'MELHOR FITNESS',
        statBestFoot: 'Esta rota · {evidence}',
        statPolicies: 'POLÍTICAS',
        statPoliciesFoot: 'reserva de políticas',
        statActive: 'ATIVA',
        activeBest: 'MELHOR',
        activeStable: 'ESTÁVEL',
        frontierTitle: 'Fronteira de três objetivos',
        frontierSub: 'Mantém ao mesmo tempo a política mais forte, a mais econômica e a mais original.',
        frontierTargets: '3 METAS',
        frontBest: 'MAIS FORTE',
        frontLean: 'MAIS ECONÔMICA',
        frontExplorer: 'MAIS ORIGINAL',
        consoleTitle: 'Console de evolução',
        consoleSub: 'Cada geração produz candidatos e os seleciona por uma suíte fixa. Auto aplica a melhor desta rota; shadow apenas registra.',
        realEval: 'Avaliação real (chama o modelo)',
        evolveOne: 'Evoluir 1 geração',
        evolving: 'Evoluindo…',
        evolveSix: 'Executar 6 gerações',
        applyBest: 'Aplicar a melhor',
        rollback: 'Reverter',
        exportGenome: 'Exportar genoma',
        modeShadow: 'Sombra',
        modeManual: 'Aplicação manual',
        modeAuto: 'Promoção automática',
        injectPolicy: 'Injetar política atual',
        enableRsi: 'Ativar RSI',
        pauseRsi: 'Pausar RSI',
        libraryTitle: 'Biblioteca de políticas',
        librarySub: 'Ordenadas por fitness; estimativas são marcadas quando não há avaliação real.',
        policyCount: '{n} políticas',
        libraryEmpty: 'Ainda não há políticas. Comece com “Evoluir 1 geração”.',
        tablePolicy: 'Política',
        tableGeneration: 'Ger.',
        tableFitness: 'Fitness',
        tableEvidence: 'Evidência',
        tableEvaluation: 'Avaliação',
        tableAction: 'Ação',
        passRate: 'Taxa de aprovação',
        evidenceMeasured: 'medida',
        evidenceProxy: 'estimada',
        evidencePartial: 'parcial',
        evidenceFailed: 'falhou',
        evidenceSeed: 'semente',
        evidenceUnknown: 'desconhecida',
        pass: 'passa',
        fail: 'falha',
        callFailed: 'chamada falhou',
        inUse: 'EM USO',
        apply: 'Aplicar',
        legend: '✓ passa · × falha · ! chamada falhou · clique no nome para ver o prompt completo',
        meta: 'G{gen} · pai {parent} · fitness {fitness} · aprovação {passRate} · custo {cost} · novidade {novelty}',
        copyPrompt: 'Copiar prompt',
        noPrompt: '(sem prompt)',
        profileTitle: 'Modelo de usuário',
        profileSub: 'Extraia preferências duradouras da conversa ou edite à mão. Uma por linha, até 16.',
        save: 'Salvar',
        clear: 'Limpar',
        placeholder: 'Exemplo:\nResponda sempre em português\nComece pela conclusão\nEvite explicações longas',
        profileMeta: 'Idioma {language} · detalhe {verbosity} · estilo {style} · {turns} turnos observados',
        curveTitle: 'Curva de gerações',
        curveSub: 'Melhor fitness por geração. Recombinação e cruzamento geram ganhos não lineares sem alongar os prompts indefinidamente.',
        generations: '{n} gerações',
        curveEmpty: 'Execute a primeira geração para ver a curva.',
        recent: 'Últimas {n} gerações · atual G{gen}',
        logsTitle: 'Registro de execução',
        waiting: 'Aguardando ação…',
        footer: 'Prompts de política são injetados; os pesos não mudam. O adapter Think Ultra permanece intacto. Armazenamento: {storage}',
        firstRun: 'Geração 0: comece com “Evoluir 1 geração”. O modo atual é {mode}; cada geração só é comparada com a melhor desta rota.',
        summaryTitle: 'DSH RSI / G{gen} / melhor {fitness} / {count} políticas',
        summaryEvidence: 'Evidência: {evidence} / Modo: {mode}',
        summaryScope: 'Os pesos não mudam. O plugin evolui políticas, decomposição, verificação e modelo de usuário; não substitui o adapter Think Ultra.',
        logDone: '{action} · concluído',
        logFailed: '{action} · falhou: {error}',
        logCardCopied: 'Registro copiado',
        logPolicyCopied: 'Prompt copiado: {name}',
        logGenomeExported: 'Genoma exportado',
        logProfileSaved: 'Modelo de usuário salvo',
        logProfileCleared: 'Modelo de usuário limpo',
        modeChange: 'Mudar modo',
        applyPolicy: 'Aplicar {name}',
        exportError: 'Falha na exportação: {error}',
        languageEnglish: 'English',
        languageChinese: '中文',
        verbosityBalanced: 'equilibrado',
        verbosityDetailed: 'detalhado',
        verbosityConcise: 'conciso',
        styleDirect: 'direto',
        styleWarm: 'caloroso',
        styleNeutral: 'neutro',
        cost: 'custo',
        novelty: 'novidade',
        agoJustNow: 'agora mesmo',
        agoMinutes: 'há {n} min',
        agoHours: 'há {n} h',
        parent: 'pai',
        seed: 'semente',
        policyBalanced: 'Base equilibrada',
        policyDecomposer: 'Decompositor',
        policyCounterexample: 'Contraexemplo',
        policyCompressor: 'Compressor',
        policyUnnamed: 'Política sem nome',
        policyMinimalSelfCheck: 'Autoverificação de unidade mínima',
        policyUnitSelfCheck: 'Autoverificação instantânea por unidade',
        policyCrossover: 'Cruzamento',
        policyMutation: 'Mutação',
        policyGenName: 'Ger. {gen} · {kind}',
        policyLLM: 'LLM {n}',
        'bench.exact-logic': 'Armadilha lógica',
        'bench.exact-json': 'JSON estrito',
        'bench.exact-list': 'Lista estrita',
        'bench.exact-math': 'Aritmética exata',
        'bench.exact-count': 'Contagem exata',
        'bench.exact-date': 'Limite de data',
        'bench.exact-csv': 'CSV estrito',
        'bench.exact-chinese': 'Chinês preciso',
        'op.verify-first': 'Verificar antes de entregar',
        'op.decompose': 'Menor unidade verificável',
        'op.format-lock': 'Bloqueio de formato',
        'op.counterexample': 'Checagem de contraexemplo',
        'op.unknown-boundary': 'Limite desconhecido',
        'op.first-principles': 'Primeiros princípios',
        'op.tool-bottleneck': 'Ferramentas no gargalo',
        'op.compress': 'Conclusão primeiro',
        'op.user-model': 'Modelo de usuário primeiro',
        'op.recursive-audit': 'Auditoria recursiva',
      },
    }

    function tr(t, key, params) {
      const template = t(key)
      if (!params) return template
      return String(template).replace(/\{(\w+)\}/g, (match, name) => name in params ? String(params[name]) : match)
    }

    function keyed(t, prefix, value, fallback) {
      const key = prefix + '.' + value
      const text = t(key)
      return text === key ? (fallback || value) : text
    }

    function installStyle() {
      try {
        const existing = document.getElementById('dsh-rsi-style')
        const style = existing || document.createElement('style')
        style.id = 'dsh-rsi-style'
        style.setAttribute('data-plugin', 'dsh-rsi')
        style.textContent = CSS
        if (!existing) document.head.appendChild(style)
      } catch {}
    }

    async function call(path, body) {
      const response = await fetch('/rsi/api/' + path, body === undefined ? {
        method: 'GET',
        cache: 'no-store',
      } : {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      let json = null
      try { json = await response.json() } catch { json = { ok: false, error: 'BAD_RESPONSE' } }
      if (!response.ok) throw new Error(json?.error || ('HTTP ' + response.status))
      return json
    }

    function fmt(value) { return Number.isFinite(value) ? (value * 100).toFixed(1) : '0.0' }
    const EVIDENCE_KEY = {
      measured: 'evidenceMeasured', proxy: 'evidenceProxy', partial: 'evidencePartial',
      failed: 'evidenceFailed', seed: 'evidenceSeed',
    }
    function evidenceText(value, t) {
      return t ? t(EVIDENCE_KEY[value] || 'evidenceUnknown') : ({ measured: '实测', proxy: '估算', partial: '部分实测', failed: '评测失败', seed: '种子' }[value] || '未知')
    }
    function ago(value, t) {
      try {
        const ms = Date.now() - new Date(value).getTime()
        if (!Number.isFinite(ms) || ms < 0) return ''
        const now = t ? t('agoJustNow') : '刚刚'
        if (ms < 60_000) return now
        if (ms < 3_600_000) return t ? tr(t, 'agoMinutes', { n: Math.floor(ms / 60_000) }) : Math.floor(ms / 60_000) + ' 分钟前'
        return t ? tr(t, 'agoHours', { n: Math.floor(ms / 3_600_000) }) : Math.floor(ms / 3_600_000) + ' 小时前'
      } catch { return '' }
    }

    function Icon(props) {
      const size = props?.size || 18
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
        h('path', { d: 'M20 12a8 8 0 1 1-2.34-5.66' }),
        h('path', { d: 'M20 4v5h-5' }),
        h('path', { d: 'M8 12h8' }),
        h('path', { d: 'M12 8v8' }))
    }

    function Stat(props) {
      return h('div', { className: 'rsi-stat' },
        h('div', { className: 'rsi-stat-label' }, props.label),
        h('div', { className: 'rsi-stat-value' }, props.value),
        h('div', { className: 'rsi-stat-foot' }, props.foot))
    }

function RsiSection(props) {
      const t = props?.t || (key => key)
      const [snapshot, setSnapshot] = React.useState(null)
      const [busy, setBusy] = React.useState('')
      const [error, setError] = React.useState('')
      const [useLlm, setUseLlm] = React.useState(true)
      const [profileText, setProfileText] = React.useState('')
      const [dirty, setDirty] = React.useState(false)
      const [log, setLog] = React.useState([])
      const [selectedId, setSelectedId] = React.useState(null)

      const pushLog = React.useCallback((text) => {
        setLog(previous => [...previous.slice(-8), { at: new Date().toISOString(), text }])
      }, [])

      const refresh = React.useCallback(async () => {
        try {
          const next = await call('state')
          setSnapshot(next)
          if (!dirty) {
            const principles = (next.profile?.principles || []).map(item => item.text).join('\n')
            setProfileText(principles)
          }
          setError('')
        } catch (e) {
          setError(String(e?.message || e))
        }
      }, [dirty])

      React.useEffect(() => { void refresh() }, [refresh])
      React.useEffect(() => {
        const timer = setInterval(() => { void refresh() }, 3000)
        return () => clearInterval(timer)
      }, [refresh])

      async function run(path, body, action, params) {
        if (busy) return
        setBusy(action)
        setError('')
        const actionText = tr(t, action, params)
        pushLog(actionText + ' …')
        try {
          const result = await call(path, body)
          if (result?.snapshot) setSnapshot(result.snapshot)
          else await refresh()
          pushLog(tr(t, 'logDone', { action: actionText }))
        } catch (e) {
          const message = String(e?.message || e)
          setError(message)
          pushLog(tr(t, 'logFailed', { action: actionText, error: message }))
        } finally {
          setBusy('')
        }
      }

      async function saveProfile() {
        const lines = profileText.split(/\r?\n/).map(line => line.trim()).filter(Boolean).slice(0, 16)
        setDirty(false)
        await run('profile', { principles: lines.map(text => ({ text })) }, 'save')
      }

      if (!snapshot) {
        return h('div', { className: 'rsi-page' },
          h('div', { className: 'rsi-hero' },
            h('div', { className: 'rsi-kicker' }, h('span', { className: 'rsi-mark' }, h(Icon, { size: 18 })), 'DSH RSI'),
            h('h2', { className: 'rsi-title' }, t('section')),
            h('p', { className: 'rsi-sub' }, t('connecting'))),
          error ? h('div', { className: 'rsi-error' }, error) : null)
      }

      const profile = snapshot.profile || {}
      const policies = snapshot.policies || []
      const bestId = snapshot.routeBestId || snapshot.bestId
      const best = policies.find(item => item.id === bestId) || policies[0]
      const history = snapshot.history || []
      const progress = snapshot.progress || {}
      const benchmarkLabels = new Map((snapshot.benchmarks || []).map(item => [item.id, item.label || item.id]))
      const operatorLabels = snapshot.operatorLabels || {}
      const front = snapshot.front || []
      const selected = policies.find(item => item.id === selectedId) || null

      const modeText = {
        shadow: t('modeShadow'), manual: t('modeManual'), auto: t('modeAuto'),
      }[snapshot.mode] || snapshot.mode
      const routeEffort = snapshot.route?.reasoningEffort || snapshot.route?.effort || ''
      const routeLabel = [snapshot.route?.model || 'unknown', routeEffort].filter(Boolean).join(' · ')
      const progressText = progress.busy
        ? (progress.phase === 'evaluating'
          ? tr(t, 'progressEvaluating', { task: progress.task || '…', current: progress.candidate || 0, total: progress.totalCandidates || 0 })
          : tr(t, 'progressCandidates', { current: progress.current || 0, total: progress.total || 0 }))
        : (busy ? tr(t, busy, { name: '' }) : t('idle'))

      const benchLabel = (id) => keyed(t, 'bench', id, benchmarkLabels.get(id) || id)
      const opLabel = (id) => keyed(t, 'op', id, operatorLabels[id] || id)
      const frontLabel = (kind, fallback) => ({
        best: t('frontBest'), lean: t('frontLean'), explorer: t('frontExplorer'),
      }[kind] || fallback)
      const policyName = (name) => {
        if (!name) return name
        const exact = {
          '平衡基线': 'policyBalanced', '分解者': 'policyDecomposer', '反例者': 'policyCounterexample',
          '压缩者': 'policyCompressor', '未命名策略': 'policyUnnamed',
          '最小单元自检版': 'policyMinimalSelfCheck', '分单元即时自检': 'policyUnitSelfCheck',
        }
        if (exact[name]) return t(exact[name])
        const match = /^第(\d+)代 · (.+)$/.exec(name)
        if (!match) return name
        let kind = match[2]
        if (kind === '交叉') kind = t('policyCrossover')
        else if (kind === '变异') kind = t('policyMutation')
        else {
          const llm = /^LLM\s+(\d+)$/.exec(kind)
          if (llm) kind = tr(t, 'policyLLM', { n: llm[1] })
          else {
            const operatorId = Object.keys(operatorLabels).find(id => operatorLabels[id] === kind)
            if (operatorId) kind = opLabel(operatorId)
          }
        }
        return tr(t, 'policyGenName', { gen: match[1], kind })
      }
      const profileWord = (value) => ({
        balanced: 'verbosityBalanced', detailed: 'verbosityDetailed', concise: 'verbosityConcise',
        direct: 'styleDirect', warm: 'styleWarm', neutral: 'styleNeutral',
      }[value] ? t({
        balanced: 'verbosityBalanced', detailed: 'verbosityDetailed', concise: 'verbosityConcise',
        direct: 'styleDirect', warm: 'styleWarm', neutral: 'styleNeutral',
      }[value]) : (value || '—'))
      const profileLanguage = profile.language === 'en' ? t('languageEnglish')
        : profile.language === 'zh' ? t('languageChinese') : (profile.language || '—')

      async function copyCard() {
        const lines = [
          tr(t, 'summaryTitle', { gen: snapshot.generation, fitness: fmt(best?.fitness ?? 0), count: snapshot.policyCount }),
          tr(t, 'summaryEvidence', { evidence: evidenceText(best?.evidence, t), mode: modeText }),
          t('summaryScope'),
        ]
        try {
          await navigator.clipboard.writeText(lines.join('\n'))
          pushLog(t('logCardCopied'))
        } catch (e) {
          setError(tr(t, 'clipboardError', { error: String(e?.message || e) }))
        }
      }

      async function copyPolicy(policy) {
        try {
          await navigator.clipboard.writeText(String(policy?.systemPrompt || ''))
          pushLog(tr(t, 'logPolicyCopied', { name: policyName(policy?.name || policy?.id || '') }))
        } catch (e) {
          setError(tr(t, 'clipboardError', { error: String(e?.message || e) }))
        }
      }

      async function exportGenome() {
        try {
          const result = await call('export')
          const text = JSON.stringify(result?.genome || result, null, 2)
          const blob = new Blob([text], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = 'rsi-genome-' + snapshot.generation + '.json'
          document.body?.appendChild(anchor)
          anchor.click()
          anchor.remove?.()
          URL.revokeObjectURL(url)
          pushLog(t('logGenomeExported'))
        } catch (e) {
          setError(tr(t, 'exportError', { error: String(e?.message || e) }))
        }
      }

      return h('div', { className: 'rsi-page' },
        h('section', { className: 'rsi-hero' },
          h('div', { className: 'rsi-kicker' }, h('span', { className: 'rsi-mark' }, h(Icon, { size: 16 })), 'DSH RSI'),
          h('h2', { className: 'rsi-title' }, t('section')),
          h('p', { className: 'rsi-sub' }, t('subtitle')),
          h('div', { className: 'rsi-hero-line' },
            h('span', { className: 'rsi-pill good' }, '● ', h('b', null, snapshot.enabled ? t('running') : t('paused'))),
            h('span', { className: 'rsi-pill' }, t('mode') + ' ', h('b', null, modeText)),
            h('span', { className: 'rsi-pill' }, t('route') + ' ', h('b', null, routeLabel)),
            h('span', { className: 'rsi-pill' }, 'Think Ultra ', h('b', null, t('coexist'))),
            h('span', { className: 'rsi-pill' }, t('version') + ' ', h('b', null, snapshot.pluginVersion || '0.1.0')),
            h('button', { className: 'rsi-btn rsi-copy', disabled: Boolean(busy), onClick: () => void copyCard() }, t('copyCard')))),

        progress.busy ? h('div', { className: 'rsi-progress' },
          h('div', { className: 'rsi-progress-head' },
            h('span', { className: 'rsi-progress-label' }, progressText),
            h('span', { className: 'rsi-mono' }, Math.round(((progress.current || 0) / Math.max(1, progress.total || 1)) * 100) + '%')),
          h('div', { className: 'rsi-progress-track' },
            h('i', { style: { width: Math.max(4, Math.round(((progress.current || 0) / Math.max(1, progress.total || 1)) * 100)) + '%' } }))) : null,

        snapshot.generation === 0 && history.length === 0
          ? h('div', { className: 'rsi-first' },
            h('b', null, t('statGeneration') + ' 0：'), tr(t, 'firstRun', { mode: modeText }))
          : null,

        h('div', { className: 'rsi-grid' },
          h(Stat, { label: t('statGeneration'), value: snapshot.generation, foot: t('statGenerationFoot') }),
          h(Stat, { label: t('statBest'), value: fmt(best?.fitness ?? 0), foot: tr(t, 'statBestFoot', { evidence: evidenceText(best?.evidence, t) }) }),
          h(Stat, { label: t('statPolicies'), value: snapshot.policyCount, foot: t('statPoliciesFoot') }),
          h(Stat, { label: t('statActive'), value: snapshot.activeId === bestId ? t('activeBest') : t('activeStable'), foot: snapshot.activeId?.slice(0, 16) || '—' })),

        front.length
          ? h('section', { className: 'rsi-card' },
            h('div', { className: 'rsi-card-head' },
              h('div', null,
                h('h3', { className: 'rsi-card-title' }, t('frontierTitle')),
                h('p', { className: 'rsi-card-sub' }, t('frontierSub'))),
              h('span', { className: 'rsi-badge' }, t('frontierTargets'))),
            h('div', { className: 'rsi-front' }, front.map((item, index) => h('div', { className: 'rsi-front-card', key: item.kind + (item.id || index) },
              h('div', { className: 'rsi-front-kicker' }, h('span', null, frontLabel(item.kind, item.label)), h('span', { className: 'rsi-mono' }, fmt(item.fitness))),
              h('div', { className: 'rsi-front-name' }, policyName(item.name) || item.id),
              h('div', { className: 'rsi-front-foot' },
                h('span', null, t('cost') + ' ' + fmt(item.cost) + '%'),
                h('span', null, t('novelty') + ' ' + fmt(item.novelty))
              )
            )))) : null,

        h('section', { className: 'rsi-card' },
          h('div', { className: 'rsi-card-head' },
            h('div', null,
              h('h3', { className: 'rsi-card-title' }, t('consoleTitle')),
              h('p', { className: 'rsi-card-sub' }, t('consoleSub'))),
            h('label', { className: 'rsi-toggle' },
              h('input', { type: 'checkbox', checked: useLlm, onChange: event => setUseLlm(event.target.checked) }),
              t('realEval'))),
          h('div', { className: 'rsi-controls' },
            h('button', { className: 'rsi-btn primary', disabled: Boolean(busy), onClick: () => void run('evolve', { generations: 1, candidates: 3, useLlm }, 'evolveOne') }, busy === 'evolveOne' ? t('evolving') : t('evolveOne')),
            h('button', { className: 'rsi-btn', disabled: Boolean(busy), onClick: () => void run('evolve', { generations: 6, candidates: 3, useLlm }, 'evolveSix') }, t('evolveSix')),
            h('button', { className: 'rsi-btn', disabled: Boolean(busy) || !best, onClick: () => best && void run('apply', { id: best.id }, 'applyBest') }, t('applyBest')),
            h('button', { className: 'rsi-btn', disabled: Boolean(busy), onClick: () => void run('rollback', undefined, 'rollback') }, t('rollback')),
            h('button', { className: 'rsi-btn', disabled: Boolean(busy), onClick: () => void exportGenome() }, t('exportGenome')),
            h('select', {
              className: 'rsi-select', value: snapshot.mode, disabled: Boolean(busy),
              onChange: event => void run('mode', { mode: event.target.value }, 'modeChange'),
            },
            h('option', { value: 'shadow' }, t('modeShadow')),
            h('option', { value: 'manual' }, t('modeManual')),
            h('option', { value: 'auto' }, t('modeAuto'))),
            h('label', { className: 'rsi-toggle' },
              h('input', {
                type: 'checkbox', checked: Boolean(snapshot.enabled), disabled: Boolean(busy),
                onChange: event => void run('enabled', { enabled: event.target.checked }, event.target.checked ? 'enableRsi' : 'pauseRsi'),
              }),
              t('injectPolicy'))),
          error ? h('div', { className: 'rsi-error', style: { marginTop: '10px' } }, error) : null),

        h('section', { className: 'rsi-card' },
          h('div', { className: 'rsi-card-head' },
            h('div', null,
              h('h3', { className: 'rsi-card-title' }, t('libraryTitle')),
              h('p', { className: 'rsi-card-sub' }, t('librarySub'))),
            h('span', { className: 'rsi-badge' }, tr(t, 'policyCount', { n: snapshot.policyCount }))),
          policies.length === 0 ? h('div', { className: 'rsi-empty' }, t('libraryEmpty')) : h('div', { style: { overflowX: 'auto' } },
            h('table', { className: 'rsi-table' },
              h('thead', null, h('tr', null,
                h('th', null, t('tablePolicy')),
                h('th', null, t('tableGeneration')),
                h('th', null, t('tableFitness')),
                h('th', null, t('tableEvidence')),
                h('th', null, t('tableEvaluation')),
                h('th', null, t('tableAction')))),
              h('tbody', null, policies.slice(0, 8).map(policy => h('tr', { key: policy.id },
                h('td', null,
                  h('button', { className: 'rsi-name-btn', title: t('copyPrompt'), onClick: () => setSelectedId(policy.id) }, policyName(policy.name)),
                  h('div', { className: 'rsi-muted rsi-mono' }, policy.id)),
                h('td', { className: 'rsi-mono' }, 'G' + policy.generation),
                h('td', null,
                  h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                    h('div', { className: 'rsi-bar' }, h('i', { style: { width: fmt(policy.fitness) + '%' } })),
                    h('span', { className: 'rsi-mono', style: { minWidth: '38px' } }, fmt(policy.fitness))),
                  h('div', { className: 'rsi-muted' }, t('passRate') + ' ' + fmt(policy.passRate) + '%')),
                h('td', null, h('span', { className: 'rsi-badge ' + (policy.evidence === 'proxy' || policy.evidence === 'failed' || policy.evidence === 'partial' ? 'proxy' : '') }, evidenceText(policy.evidence, t))),
                h('td', null, (policy.lastResults || []).length
                  ? h('div', { className: 'rsi-dots' }, policy.lastResults.map(result => h('span', {
                    key: result.id,
                    className: 'rsi-dot ' + (result.pass ? 'pass' : result.ok ? 'fail' : 'error'),
                    title: benchLabel(result.id) + '：' + (result.pass ? t('pass') : result.ok ? t('fail') : t('callFailed')),
                  }, result.pass ? '✓' : result.ok ? '×' : '!')))
                  : h('span', { className: 'rsi-muted' }, '—')),
                h('td', null, policy.id === snapshot.activeId
                  ? h('span', { className: 'rsi-badge active' }, t('inUse'))
                  : h('button', { className: 'rsi-btn', disabled: Boolean(busy), onClick: () => void run('apply', { id: policy.id }, 'applyPolicy', { name: policyName(policy.name) }) }, t('apply'))))))),
          h('div', { className: 'rsi-legend' }, t('legend')),
          selected ? h('div', { className: 'rsi-inspector' },
            h('div', { className: 'rsi-inspector-head' },
              h('div', null,
                h('div', { className: 'rsi-inspector-title' }, policyName(selected.name)),
                h('div', { className: 'rsi-inspector-meta' }, tr(t, 'meta', {
                  gen: selected.generation,
                  parent: selected.parentName || selected.parentId || t('seed'),
                  fitness: fmt(selected.fitness),
                  passRate: fmt(selected.passRate),
                  cost: fmt(selected.cost),
                  novelty: fmt(selected.novelty),
                }))),
              h('button', { className: 'rsi-btn', onClick: () => void copyPolicy(selected) }, t('copyPrompt'))),
            h('div', { className: 'rsi-ops' }, (selected.operators || []).map(id => h('span', { className: 'rsi-op', key: id }, opLabel(id)))),
            h('pre', { className: 'rsi-prompt' }, selected.systemPrompt || t('noPrompt'))) : null)),

        h('section', { className: 'rsi-card' },
          h('div', { className: 'rsi-card-head' },
            h('div', null,
              h('h3', { className: 'rsi-card-title' }, t('profileTitle')),
              h('p', { className: 'rsi-card-sub' }, t('profileSub'))),
            h('div', { style: { display: 'flex', gap: '8px' } },
              h('button', { className: 'rsi-btn', disabled: Boolean(busy), onClick: () => void saveProfile() }, t('save')),
              h('button', { className: 'rsi-btn danger', disabled: Boolean(busy), onClick: () => { setProfileText(''); setDirty(true); void run('profile/clear', undefined, 'clear') } }, t('clear')))),
          h('textarea', {
            className: 'rsi-profile', value: profileText, spellCheck: false,
            placeholder: t('placeholder'),
            onChange: event => { setProfileText(event.target.value); setDirty(true) },
          }),
          h('div', { className: 'rsi-muted', style: { marginTop: '8px' } },
            tr(t, 'profileMeta', {
              language: profileLanguage,
              verbosity: profileWord(profile.verbosity),
              style: profileWord(profile.style),
              turns: profile.turns || 0,
            }))),

        h('section', { className: 'rsi-card' },
          h('div', { className: 'rsi-card-head' },
            h('div', null,
              h('h3', { className: 'rsi-card-title' }, t('curveTitle')),
              h('p', { className: 'rsi-card-sub' }, t('curveSub'))),
            h('span', { className: 'rsi-badge' }, tr(t, 'generations', { n: history.length }))),
          history.length === 0 ? h('div', { className: 'rsi-empty' }, t('curveEmpty')) : h('div', { className: 'rsi-curve' },
            h('div', { className: 'rsi-lineage' },
              history.slice(-8).map((entry, index) => h('div', { className: 'rsi-node', key: entry.at + index },
                h('span', { className: 'rsi-node-gen' }, 'G' + entry.generation),
                h('span', { className: 'rsi-node-name' }, policyName(entry.bestName) || entry.bestId),
                h('span', { className: 'rsi-node-parent' }, '← ' + (entry.parentName || entry.parentId || t('seed'))),
                h('span', { className: 'rsi-node-score' }, fmt(entry.bestFitness))))),
            h('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '7px', height: '96px', marginTop: '14px' } },
              history.slice(-16).map((entry, index) => h('div', {
                key: entry.at + index,
                title: 'G' + entry.generation + ' · ' + fmt(entry.bestFitness),
                style: { flex: '1 1 0', minWidth: '10px', height: Math.max(8, Math.round(entry.bestFitness * 96)) + 'px', borderRadius: '6px 6px 3px 3px', background: index === history.slice(-16).length - 1 ? 'linear-gradient(180deg,#d4d4d4,#8a8a8a)' : 'color-mix(in srgb, #d4d4d4 38%, var(--dsw-alias-bg-layer-2))' },
              })),
            ),
            h('div', { className: 'rsi-muted', style: { marginTop: '8px' } }, tr(t, 'recent', { n: Math.min(16, history.length), gen: snapshot.generation })))),

        h('section', { className: 'rsi-card' },
          h('h3', { className: 'rsi-card-title' }, t('logsTitle')),
          log.length === 0 ? h('div', { className: 'rsi-empty' }, t('waiting')) : h('ul', { className: 'rsi-log' },
            log.slice(-8).reverse().map((item, index) => h('li', { key: index }, h('time', null, ago(item.at, t)), h('span', null, item.text))))),
        h('div', { className: 'rsi-muted', style: { padding: '2px 2px 0' } },
          tr(t, 'footer', { storage: snapshot.storage }))
        )
    }

    exports.inject = ['slots', 'locale']
    exports.apply = function (ctx) {
      installStyle()
      if (ctx.locale?.register) ctx.locale.register(NS, I18N)
      const t = ctx.locale?.bind ? ctx.locale.bind(NS) : (key => I18N.zh[key] || key)
      try {
        localStorage.setItem('dsh-rsi:client', JSON.stringify({ at: new Date().toISOString(), version: '0.1.0' }))
      } catch {}
      let dispose = null
      try {
        dispose = ctx.slots.inject('settings.section', () => {
          const registered = ctx.slots.register({
            name: 'settings.section',
            id: 'rsi',
            order: 100000,
            locale: NS,
            label: () => t('section'),
          }, RsiSection)
          try {
            localStorage.setItem('dsh-rsi:section', JSON.stringify({ at: new Date().toISOString(), version: '0.1.0', order: 100000 }))
          } catch {}
          return registered
        })
      } catch (error) {
        try { console.warn('[dsh-rsi] settings registration failed', error) } catch {}
      }

      // The label follows the active locale, so match every registered spelling.
      const sectionLabels = new Set(['RSI 配置', 'RSI Settings'])
      for (const dictionary of Object.values(I18N)) {
        if (dictionary.section) sectionLabels.add(dictionary.section)
      }
      let observer = null
      const mark = () => {
        try {
          const nodes = document.querySelectorAll('nav button, [role=navigation] button')
          for (const button of nodes) {
            const text = (button.textContent || '').replace(/\s+/g, ' ').trim()
            if (!sectionLabels.has(text)) continue
            button.classList.add('rsi-nav-row')
            const svg = button.querySelector('svg')
            if (!svg || svg.getAttribute('data-rsi-icon') === 'loop') continue
            svg.setAttribute('data-rsi-icon', 'loop')
            svg.setAttribute('viewBox', '0 0 24 24')
            svg.setAttribute('fill', 'none')
            svg.setAttribute('stroke', 'currentColor')
            svg.setAttribute('stroke-width', '2')
            svg.setAttribute('stroke-linecap', 'round')
            svg.setAttribute('stroke-linejoin', 'round')
            while (svg.firstChild) svg.removeChild(svg.firstChild)
            const SVG_NS = 'http://www.w3.org/2000/svg'
            for (const d of ['M20 12a8 8 0 1 1-2.34-5.66', 'M20 4v5h-5', 'M8 12h8', 'M12 8v8']) {
              const path = document.createElementNS(SVG_NS, 'path')
              path.setAttribute('d', d)
              svg.appendChild(path)
            }
          }
        } catch {}
      }
      mark()
      let stopLocale = null
      try {
        if (ctx.locale?.subscribe) stopLocale = ctx.locale.subscribe(() => setTimeout(mark, 0))
      } catch {}
      try {
        observer = new MutationObserver(mark)
        observer.observe(document.documentElement, { childList: true, subtree: true })
      } catch {}
      return () => {
        try { observer?.disconnect() } catch {}
        try { stopLocale?.() } catch {}
        try { dispose?.() } catch {}
      }
    }

    return { inject: exports.inject, apply: exports.apply }
  },
})
