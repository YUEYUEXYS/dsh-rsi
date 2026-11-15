// Policy engine. Prompt-level only; no weight or adapter changes.

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const MAX_POLICIES = 96
const MAX_HISTORY = 160
const MAX_LEDGER = 800
const MAX_PRINCIPLES = 16
const MAX_DIRECTIVE_CHARS = 7000
const PLUGIN_VERSION = '0.1.0'

const DEFAULT_OPERATORS = [
  {
    id: 'verify-first',
    label: '先验证再交付',
    text: '在给出最终答案前，先做一个成本最低的确定性检查：重算关键数字、回读约束、或检查输出格式。把检查结果写进内部推理，不要把检查过程铺成正文。',
  },
  {
    id: 'decompose',
    label: '最小可验证单元',
    text: '把任务拆成最小可验证单元；每完成一个单元就确认它满足输入约束，再进入下一个单元。不要一次性写完整答案后再回头猜哪里错了。',
  },
  {
    id: 'format-lock',
    label: '输出格式锁',
    text: '先锁定用户要求的输出格式、字段、数量和边界；最终答案只交付被要求的内容。禁止额外前言、总结、表情、编号或解释，除非用户明确要求。',
  },
  {
    id: 'counterexample',
    label: '反例自检',
    text: '在最终定稿前，主动构造一个最可能推翻当前答案的反例或边界条件；如果反例成立，修正答案后再交付。不要向用户展示反例草稿。',
  },
  {
    id: 'unknown-boundary',
    label: '未知边界',
    text: '把事实、推断、未知分开。未知信息不得编造；如果缺少关键输入，先用最小必要问题确认，或在答案中明确标注假设。',
  },
  {
    id: 'first-principles',
    label: '第一性原理',
    text: '先回到任务的最底层约束与目标，再选择方法；不要因为常见做法流行就直接套用。方法必须能解释为什么它比替代方案更满足当前约束。',
  },
  {
    id: 'tool-bottleneck',
    label: '瓶颈处才用工具',
    text: '只在信息缺口无法靠推理跨过时调用工具；一次工具调用要带回可验证的结构化结果。不要为了显得勤奋而重复读取同一信息。',
  },
  {
    id: 'compress',
    label: '结论先行',
    text: '先给结论，再给最短必要证据；删除重复、寒暄和不能改变决策的句子。简洁不等于省略关键约束。',
  },
  {
    id: 'user-model',
    label: '用户模型优先',
    text: '把用户长期偏好视为硬约束：语言、详略、格式、禁忌和做事顺序优先于通用风格。用户当前明确指令覆盖历史偏好。',
  },
  {
    id: 'recursive-audit',
    label: '递归审计',
    text: '交付前再问一次：这条策略本身有没有让答案变差？如果某个自检步骤只是在重复劳动，删掉它；只保留能改变结果的检查。',
  },
]

const BENCHMARKS = [
  {
    id: 'exact-logic',
    label: '逻辑陷阱',
    prompt: 'A farmer has 17 sheep. All but 9 die. How many sheep are left? Reply with only the integer, no words and no punctuation.',
    check: text => /^\s*9\s*$/.test(text),
  },
  {
    id: 'exact-json',
    label: '严格 JSON',
    prompt: 'Return only valid JSON with exactly the keys "a" and "b": a must be 1 and b must be 2. No Markdown, no prose.',
    check: text => {
      try {
        const value = JSON.parse(text.trim())
        return value && Object.keys(value).length === 2 && value.a === 1 && value.b === 2
      } catch { return false }
    },
  },
  {
    id: 'exact-list',
    label: '严格列表',
    prompt: 'List exactly three colors, one per line, no numbering and no extra words. The first color must be red.',
    check: text => {
      const lines = text.trim().split(/\r?\n/).map(line => line.trim()).filter(Boolean)
      return lines.length === 3 && lines[0].toLowerCase() === 'red'
    },
  },
  {
    id: 'exact-math',
    label: '精确算术',
    prompt: 'What is 37 * 24? Reply with only the integer, no words and no punctuation.',
    check: text => /^\s*888\s*$/.test(text),
  },
  {
    id: 'exact-count',
    label: '精确计数',
    prompt: "How many r's are in the word strawberry? Reply with only the integer, no words and no punctuation.",
    check: text => /^\s*3\s*$/.test(text),
  },
  {
    id: 'exact-date',
    label: '日期边界',
    prompt: 'What is the date one day after 2026-11-14? Reply with only YYYY-MM-DD, no words and no punctuation.',
    check: text => /^\s*2026-11-15\s*$/.test(text),
  },
  {
    id: 'exact-csv',
    label: '严格 CSV',
    prompt: 'Return only CSV with header name,score and one data row Ada,10. No Markdown, no prose, no code fence.',
    check: text => {
      const lines = text.trim().split(/\r?\n/).map(line => line.trim()).filter(Boolean)
      return lines.length === 2 && lines[0] === 'name,score' && lines[1] === 'Ada,10'
    },
  },
  {
    id: 'exact-chinese',
    label: '中文精确',
    prompt: '用中文回答，只输出四个汉字：递归进化。不要标点、不要解释、不要加引号。',
    check: text => text.trim() === '递归进化',
  },
]

function now() { return new Date().toISOString() }
function hash(value) { return createHash('sha256').update(String(value)).digest('hex').slice(0, 12) }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)) }
function cleanText(value) { return String(value == null ? '' : value).replace(/\u0000/g, '').trim() }
function normalizeRoute(route, fallback) {
  const previous = fallback && typeof fallback === 'object' ? fallback : {}
  const provider = cleanText(route?.provider || previous.provider) || 'deepseek-official'
  const model = cleanText(route?.model || previous.model) || 'deepseek-flash'
  const reasoningEffort = cleanText(route?.reasoningEffort || route?.effort || previous.reasoningEffort || previous.effort) || 'max'
  return { provider, model, reasoningEffort }
}
function routeKey(route) {
  const normalized = normalizeRoute(route)
  return [normalized.provider, normalized.model, normalized.reasoningEffort].join('/')
}

function tokenish(text) {
  const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const words = (text.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9_]+/g) || []).length
  return cjk + words * 1.25
}
function safeJson(value, fallback) {
  try { return JSON.parse(JSON.stringify(value)) } catch { return fallback }
}

function defaultProfile() {
  return {
    language: 'zh',
    verbosity: 'balanced',
    style: 'direct',
    principles: [],
    turns: 0,
    lastTextHash: '',
    lastLearnedAt: '',
    updatedAt: now(),
  }
}

function defaultState() {
  const seed = [
    {
      id: 'seed-balanced',
      name: '平衡基线',
      parentId: null,
      generation: 0,
      systemPrompt: '先理解约束与目标，再给结论；结论后只保留能改变决策的证据。交付前做一次最低成本的确定性检查。',
      operators: ['verify-first', 'format-lock'],
      fitness: 0.62,
      passRate: 0.5,
      cost: 0.2,
      evidence: 'seed',
      wins: 0,
      losses: 0,
      createdAt: now(),
    },
    {
      id: 'seed-decompose',
      name: '分解者',
      parentId: null,
      generation: 0,
      systemPrompt: '把任务拆成最小可验证单元，每完成一个单元就检查它是否满足约束；最后合并结果并做一次格式锁定。',
      operators: ['decompose', 'format-lock', 'verify-first'],
      fitness: 0.64,
      passRate: 0.5,
      cost: 0.25,
      evidence: 'seed',
      wins: 0,
      losses: 0,
      createdAt: now(),
    },
    {
      id: 'seed-adversarial',
      name: '反例者',
      parentId: null,
      generation: 0,
      systemPrompt: '先给出最可能的答案，再构造一个能推翻它的反例或边界条件；如果反例成立就修正。最终只交付修正后的答案。',
      operators: ['counterexample', 'verify-first', 'unknown-boundary'],
      fitness: 0.63,
      passRate: 0.5,
      cost: 0.3,
      evidence: 'seed',
      wins: 0,
      losses: 0,
      createdAt: now(),
    },
    {
      id: 'seed-compress',
      name: '压缩者',
      parentId: null,
      generation: 0,
      systemPrompt: '结论先行；删除寒暄、重复和不能改变决策的句子。先锁定输出格式与数量，再给出最短必要证据。',
      operators: ['compress', 'format-lock'],
      fitness: 0.6,
      passRate: 0.5,
      cost: 0.12,
      evidence: 'seed',
      wins: 0,
      losses: 0,
      createdAt: now(),
    },
  ]
  return {
    version: 1,
    generation: 0,
    enabled: true,
    mode: 'auto',
    activeId: 'seed-balanced',
    baselineId: 'seed-balanced',
    bestId: 'seed-decompose',
    previousActiveId: null,
    profile: defaultProfile(),
    route: normalizeRoute({ provider: 'deepseek-official', model: 'deepseek-flash', reasoningEffort: 'max' }),
    routeBest: { 'deepseek-official/deepseek-flash/max': 'seed-decompose' },
    policies: seed,
    operators: DEFAULT_OPERATORS.map(operator => ({ ...operator, uses: 0, wins: 0 })),
    history: [],
    ledger: [],
    createdAt: now(),
    updatedAt: now(),
  }
}

function normalizeState(raw) {
  const base = defaultState()
  if (!raw || typeof raw !== 'object') return base
  const route = normalizeRoute(raw.route)
  const policies = Array.isArray(raw.policies) && raw.policies.length ? raw.policies.filter(p => p && typeof p === 'object').map(policy => ({
    ...policy,
    id: String(policy.id || ''),
    name: String(policy.name || '未命名策略'),
    parentId: policy.parentId == null ? null : String(policy.parentId),
    generation: Number.isFinite(policy.generation) ? Math.max(0, Math.round(policy.generation)) : 0,
    systemPrompt: cleanText(policy.systemPrompt),
    operators: Array.isArray(policy.operators) ? policy.operators.filter(String) : [],
    fitness: Number.isFinite(policy.fitness) ? clamp(policy.fitness, 0, 1) : 0.5,
    passRate: Number.isFinite(policy.passRate) ? clamp(policy.passRate, 0, 1) : 0.5,
    cost: Number.isFinite(policy.cost) ? clamp(policy.cost, 0, 1) : 0.3,
    evidence: String(policy.evidence || 'unknown'),
    routeKey: cleanText(policy.routeKey),
    lastResults: Array.isArray(policy.lastResults)
      ? policy.lastResults.filter(item => item && typeof item === 'object').map(item => ({
        id: String(item.id || ''),
        ok: item.ok !== false,
        pass: item.pass === true,
        chars: Number.isFinite(item.chars) ? Math.max(0, Math.round(item.chars)) : 0,
        reason: item.reason == null ? null : String(item.reason).slice(0, 200),
      })).slice(0, 8)
      : [],
    wins: Number.isFinite(policy.wins) ? Math.max(0, Math.round(policy.wins)) : 0,
    losses: Number.isFinite(policy.losses) ? Math.max(0, Math.round(policy.losses)) : 0,
    createdAt: String(policy.createdAt || now()),
  })).filter(p => p.id && p.systemPrompt) : base.policies
  if (!policies.length) policies.push(...base.policies)
  const byId = new Map(policies.map(p => [p.id, p]))
  const baselineId = byId.has(String(raw.baselineId)) ? String(raw.baselineId) : base.baselineId
  const activeId = byId.has(String(raw.activeId)) ? String(raw.activeId) : baselineId
  const bestId = byId.has(String(raw.bestId)) ? String(raw.bestId) : activeId
  const currentRouteKey = routeKey(route)
  for (const policy of policies) {
    if (!policy.routeKey && (policy.evidence === 'measured' || policy.evidence === 'partial')) policy.routeKey = currentRouteKey
  }
  const routeBest = {}
  if (raw.routeBest && typeof raw.routeBest === 'object') {
    for (const [key, id] of Object.entries(raw.routeBest)) {
      if (byId.has(String(id)) && cleanText(key)) routeBest[cleanText(key)] = String(id)
    }
  }
  if (!routeBest[currentRouteKey] && byId.get(bestId)?.routeKey === currentRouteKey) routeBest[currentRouteKey] = bestId
  const rawProfile = raw.profile && typeof raw.profile === 'object' ? raw.profile : {}
  const principles = Array.isArray(rawProfile.principles)
    ? rawProfile.principles
      .filter(item => item && typeof item.text === 'string')
      .map(item => ({ text: cleanText(item.text).slice(0, 80), source: String(item.source || 'chat'), at: String(item.at || now()) }))
      .filter(item => item.text)
      .slice(-MAX_PRINCIPLES)
    : []
  return {
    ...base,
    ...raw,
    version: 1,
    generation: Number.isFinite(raw.generation) ? Math.max(0, Math.round(raw.generation)) : 0,
    enabled: raw.enabled !== false,
    mode: ['shadow', 'manual', 'auto'].includes(raw.mode) ? raw.mode : base.mode,
    policies,
    baselineId,
    activeId,
    bestId,
    routeBest,
    previousActiveId: byId.has(String(raw.previousActiveId)) ? String(raw.previousActiveId) : null,
    profile: {
      ...defaultProfile(),
      ...rawProfile,
      language: rawProfile.language === 'en' ? 'en' : 'zh',
      verbosity: ['concise', 'balanced', 'detailed'].includes(rawProfile.verbosity) ? rawProfile.verbosity : 'balanced',
      style: cleanText(rawProfile.style).slice(0, 40) || 'direct',
      principles,
      turns: Number.isFinite(rawProfile.turns) ? Math.max(0, Math.round(rawProfile.turns)) : 0,
      lastTextHash: String(rawProfile.lastTextHash || '').slice(0, 64),
      lastLearnedAt: String(rawProfile.lastLearnedAt || ''),
      updatedAt: String(rawProfile.updatedAt || now()),
    },
    route,
    operators: Array.isArray(raw.operators) && raw.operators.length
      ? raw.operators.filter(op => op && typeof op.id === 'string').map(op => ({
        ...op,
        id: String(op.id),
        label: String(op.label || op.id),
        text: cleanText(op.text),
        uses: Number.isFinite(op.uses) ? Math.max(0, Math.round(op.uses)) : 0,
        wins: Number.isFinite(op.wins) ? Math.max(0, Math.round(op.wins)) : 0,
      }))
      : base.operators,
    history: Array.isArray(raw.history) ? raw.history.slice(-MAX_HISTORY) : [],
    ledger: Array.isArray(raw.ledger) ? raw.ledger.slice(-MAX_LEDGER) : [],
    createdAt: String(raw.createdAt || now()),
    updatedAt: String(raw.updatedAt || now()),
  }
}

function extractTextParts(content) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content.map(part => {
    if (!part || typeof part !== 'object') return ''
    if (part.type === 'text') return String(part.text || '')
    return ''
  }).join('\n')
}

function messageText(message) {
  if (!message || typeof message !== 'object') return ''
  if (Array.isArray(message.parts)) return extractTextParts(message.parts)
  if (message.content !== undefined) return extractTextParts(message.content)
  return ''
}

export class RsiEngine {
  constructor(options = {}) {
    this.log = typeof options.log === 'function' ? options.log : () => {}
    this.home = options.home || join(process.env.LOCALAPPDATA || join(homedir(), '.dsh'), 'rsi')
    this.file = join(this.home, 'genome.json')
    this.busy = false
    this.pendingPolicyIds = new Set()
    this.progress = { busy: false, phase: 'idle', current: 0, total: 0, candidate: 0, totalCandidates: 0, task: '', generation: 0, startedAt: '' }
    this.state = this.load()
  }

  load() {
    try {
      if (!existsSync(this.file)) return defaultState()
      const raw = JSON.parse(readFileSync(this.file, 'utf8'))
      return normalizeState(raw)
    } catch (error) {
      this.log('warn', 'load failed: ' + String(error))
      return defaultState()
    }
  }

  save() {
    const temp = this.file + '.tmp-' + process.pid + '-' + Date.now()
    try {
      mkdirSync(dirname(this.file), { recursive: true })
      const state = { ...this.state, updatedAt: now() }
      writeFileSync(temp, JSON.stringify(state, null, 2), 'utf8')
      renameSync(temp, this.file)
      this.state = state
      return true
    } catch (error) {
      try { unlinkSync(temp) } catch {}
      this.log('warn', 'save failed: ' + String(error))
      return false
    }
  }

  get(filePath) {
    if (!filePath) return this.file
    return resolve(this.home, filePath)
  }

  policy(id) {
    return this.state.policies.find(policy => policy.id === id) || null
  }

  activePolicy() {
    return this.policy(this.state.activeId) || this.policy(this.state.baselineId) || this.state.policies[0]
  }

  routeBestFor(route = this.state.route) {
    const key = routeKey(route)
    const policy = this.policy(this.state.routeBest?.[key])
    if (policy) return policy
    const seedBest = [...this.state.policies]
      .filter(item => !item.routeKey && item.id.startsWith('seed-'))
      .sort((a, b) => b.fitness - a.fitness)[0]
    return seedBest || this.policy(this.state.baselineId) || this.state.policies[0] || null
  }

  setEnabled(value) {
    this.state.enabled = value !== false
    this.save()
    return this.state.enabled
  }

  setMode(value) {
    if (!['shadow', 'manual', 'auto'].includes(value)) throw new Error('BAD_MODE')
    this.state.mode = value
    if (value === 'auto') this.state.activeId = this.routeBestFor(this.state.route)?.id || this.state.bestId
    this.save()
    return value
  }

  setRoute(route) {
    if (!route || typeof route !== 'object') return this.state.route
    const next = normalizeRoute(route, this.state.route)
    this.state.route = next
    this.save()
    return this.state.route
  }

  noteRoute(agent) {
    // Optional metadata; a missing session must not break the turn.
    try {
      const options = agent?.options || {}
      const header = agent?.session?.header || {}
      const request = typeof agent?.session?.requestHeader === 'function' ? agent.session.requestHeader() : null
      const config = request?.config || {}
      const provider = cleanText(options.provider || header.provider || config.provider)
      const model = cleanText(options.model || header.model || config.model)
      if (!provider || !model) return
      const reasoningEffort = cleanText(
        options.reasoningEffort || header.reasoningEffort || config.reasoningEffort || options.reasoning?.effort,
      )
      const next = normalizeRoute({ provider, model, reasoningEffort }, this.state.route)
      if (routeKey(next) !== routeKey(this.state.route)) {
        this.state.route = next
        this.save()
      }
    } catch {}
  }

  learnFromUser(text) {
    const source = cleanText(text)
    if (source.length < 2) return
    const profile = this.state.profile
    const digest = hash(source)
    const lastAt = Date.parse(profile.lastLearnedAt || '')
    if (profile.lastTextHash === digest && Number.isFinite(lastAt) && Date.now() - lastAt < 30000) return
    profile.lastTextHash = digest
    profile.lastLearnedAt = now()
    profile.turns = (Number(profile.turns) || 0) + 1
    const cjk = (source.match(/[\u4e00-\u9fff]/g) || []).length
    if (/(用英语|英文|english|in english)/i.test(source)) profile.language = 'en'
    else if (/(用中文|中文|mandarin|chinese)/i.test(source)) profile.language = 'zh'
    else if (cjk > 0) profile.language = 'zh'
    if (/(简洁|简短|别啰嗦|少说|short|brief|concise)/i.test(source)) profile.verbosity = 'concise'
    if (/(详细|展开|完整说明|detailed|expand)/i.test(source)) profile.verbosity = 'detailed'
    if (/(直接|别绕|说重点|direct|straight)/i.test(source)) profile.style = 'direct'
    if (/(温柔|耐心|gentle|patient)/i.test(source)) profile.style = 'gentle'

    const patterns = [
      /(?:以后|今后|始终|永远|每次|always|from now on)\s*(?:都|要|用|按|keep|use)?\s*([^。！？!?\n]{2,40})/gi,
      /(?:不要|别|不许|禁止|不能|never)\s*([^。！？!?\n]{2,40})/gi,
      /(?:我喜欢|我讨厌|偏好|prefer|I like|I hate)\s*([^。！？!?\n]{2,40})/gi,
    ]
    const seen = new Set(profile.principles.map(item => item.text))
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) {
        const textValue = cleanText(match[1]).replace(/[，。；、]/g, '').slice(0, 80)
        if (!textValue || seen.has(textValue)) continue
        seen.add(textValue)
        profile.principles.push({ text: textValue, source: 'chat', at: now() })
        if (profile.principles.length > MAX_PRINCIPLES) profile.principles.shift()
      }
    }
    profile.updatedAt = now()
    this.save()
  }

  setProfile(patch) {
    if (!patch || typeof patch !== 'object') throw new Error('BAD_PROFILE')
    if (typeof patch.language === 'string') this.state.profile.language = patch.language === 'en' ? 'en' : 'zh'
    if (typeof patch.verbosity === 'string' && ['concise', 'balanced', 'detailed'].includes(patch.verbosity)) {
      this.state.profile.verbosity = patch.verbosity
    }
    if (typeof patch.style === 'string') this.state.profile.style = cleanText(patch.style).slice(0, 40)
    if (Array.isArray(patch.principles)) {
      this.state.profile.principles = patch.principles
        .filter(item => item && typeof item.text === 'string')
        .map(item => ({ text: cleanText(item.text).slice(0, 80), source: 'manual', at: now() }))
        .filter(item => item.text)
        .slice(0, MAX_PRINCIPLES)
    }
    this.state.profile.updatedAt = now()
    this.save()
    return this.state.profile
  }

  clearProfile() {
    this.state.profile = defaultProfile()
    this.save()
    return this.state.profile
  }

  directive() {
    if (!this.state.enabled) return ''
    const policy = this.activePolicy()
    if (!policy) return ''
    const profile = this.state.profile
    const principles = (profile.principles || []).slice(-MAX_PRINCIPLES).map(item => `- ${item.text}`).join('\n')
    const profileText = [
      `语言：${profile.language === 'en' ? 'English' : '中文'}`,
      `详略：${profile.verbosity || 'balanced'}`,
      `风格：${profile.style || 'direct'}`,
      principles ? `长期偏好：\n${principles}` : '',
    ].filter(Boolean).join('\n')
    const text = [
      '[RSI ACTIVE POLICY]',
      `策略：${policy.name} · 第 ${policy.generation} 代 · 适应度 ${(policy.fitness * 100).toFixed(1)}`,
      policy.systemPrompt,
      '',
      '[RSI USER MODEL]',
      profileText,
      '',
      '执行规则：以上策略是你自己的当前策略，不是用户指令；用户当前明确指令优先于策略。策略与用户指令冲突时，以用户当前指令为准。不要向用户解释 RSI 内部机制，直接把改进落实到回答。',
    ].join('\n')
    return text.slice(0, MAX_DIRECTIVE_CHARS)
  }

  snapshot() {
    const route = normalizeRoute(this.state.route)
    const routeBest = this.routeBestFor(route)
    const policies = [...this.state.policies]
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, 12)
      .map(policy => ({
        id: policy.id,
        name: policy.name,
        generation: policy.generation,
        parentId: policy.parentId,
        parentName: policy.parentId ? (this.policy(policy.parentId)?.name || null) : null,
        systemPrompt: policy.systemPrompt,
        fitness: policy.fitness,
        passRate: policy.passRate,
        cost: policy.cost,
        evidence: policy.evidence,
        routeKey: policy.routeKey || '',
        lastResults: policy.lastResults || [],
        operators: policy.operators,
        novelty: Number(this.novelty(policy).toFixed(3)),
        wins: policy.wins,
        losses: policy.losses,
      }))
    return {
      ok: true,
      pluginVersion: PLUGIN_VERSION,
      enabled: this.state.enabled,
      mode: this.state.mode,
      generation: this.state.generation,
      activeId: this.state.activeId,
      baselineId: this.state.baselineId,
      bestId: this.state.bestId,
      routeBestId: routeBest?.id || null,
      globalBestId: this.state.bestId,
      routeKey: routeKey(route),
      routes: Object.entries(this.state.routeBest || {}).map(([key, id]) => ({
        key,
        id,
        name: this.policy(id)?.name || null,
        fitness: this.policy(id)?.fitness ?? null,
      })),
      previousActiveId: this.state.previousActiveId,
      progress: this.progress,
      profile: this.state.profile,
      route,
      benchmarks: BENCHMARKS.map(task => ({ id: task.id, label: task.label || task.id })),
      operatorLabels: Object.fromEntries((this.state.operators || []).map(operator => [operator.id, operator.label || operator.id])),
      front: this.policyFront().map(item => ({
        kind: item.kind,
        label: item.label,
        id: item.policy.id,
        name: item.policy.name,
        fitness: item.policy.fitness,
        passRate: item.policy.passRate,
        cost: item.policy.cost,
        evidence: item.policy.evidence,
        novelty: Number(this.novelty(item.policy).toFixed(3)),
      })),
      policies,
      policyCount: this.state.policies.length,
      history: this.state.history.slice(-16),
      ledger: this.state.ledger.slice(-12),
      storage: this.file,
    }
  }

  apply(id) {
    if (this.busy) throw new Error('BUSY')
    const policy = this.policy(String(id))
    if (!policy) throw new Error('NO_POLICY')
    if (this.state.activeId === policy.id) return this.snapshot()
    this.state.previousActiveId = this.state.activeId
    this.state.activeId = policy.id
    const currentBest = this.policy(this.state.bestId)
    if (!currentBest || policy.fitness > currentBest.fitness) this.state.bestId = policy.id
    this.state.ledger.push({ at: now(), type: 'apply', id: policy.id, fitness: policy.fitness })
    this.state.ledger = this.state.ledger.slice(-MAX_LEDGER)
    this.save()
    return this.snapshot()
  }

  rollback() {
    if (this.busy) throw new Error('BUSY')
    const target = this.state.previousActiveId || this.state.baselineId
    const policy = this.policy(target)
    if (!policy) throw new Error('NO_ROLLBACK')
    this.state.previousActiveId = this.state.activeId
    this.state.activeId = policy.id
    this.state.ledger.push({ at: now(), type: 'rollback', id: policy.id, fitness: policy.fitness })
    this.state.ledger = this.state.ledger.slice(-MAX_LEDGER)
    this.save()
    return this.snapshot()
  }

  reset() {
    const profile = this.state.profile
    this.state = defaultState()
    this.state.profile = profile
    this.save()
    return this.snapshot()
  }

  exportGenome() {
    return safeJson(this.state, defaultState())
  }

  async sample(llm, route, system, prompt, maxTokens = 1000) {
    if (!llm || typeof llm.stream !== 'function') return { ok: false, reason: 'no-llm', text: '' }
    const provider = cleanText(route?.provider || this.state.route.provider)
    const model = cleanText(route?.model || this.state.route.model)
    const reasoningEffort = cleanText(route?.reasoningEffort || route?.effort) || 'max'
    if (!provider || !model) return { ok: false, reason: 'no-route', text: '' }
    const messages = [{
      role: 'user',
      source: { kind: 'user' },
      content: [{ type: 'text', text: String(prompt || '') }],
    }]
    let text = ''
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 90_000)
    try {
      for await (const chunk of llm.stream({
        provider,
        model,
        reasoningEffort,
        messages,
        system: String(system || ''),
        temperature: 0.3,
        maxTokens,
        signal: controller.signal,
      })) {
        if (chunk?.type === 'text-delta') text += String(chunk.text || '')
      }
      return { ok: true, text: text.trim() }
    } catch (error) {
      return { ok: false, reason: String(error?.message || error), text: text.trim() }
    } finally {
      clearTimeout(timer)
    }
  }

  scoreAnswer(task, text) {
    try {
      const clean = String(text || '').trim()
      const pass = Boolean(task.check(clean))
      return {
        pass: pass ? 1 : 0,
        clean: clean.length === 0 ? 0 : 1,
        chars: clean.length,
      }
    } catch {
      return { pass: 0, clean: 0, chars: 0 }
    }
  }

  novelty(policy) {
    const mine = new Set(policy.operators || [])
    let maxSimilarity = 0
    for (const other of this.state.policies) {
      if (other.id === policy.id) continue
      const theirs = new Set(other.operators || [])
      const union = new Set([...mine, ...theirs]).size
      if (!union) continue
      let shared = 0
      for (const id of mine) if (theirs.has(id)) shared += 1
      maxSimilarity = Math.max(maxSimilarity, shared / union)
    }
    return clamp(1 - maxSimilarity, 0, 1)
  }

  policyFront(route = this.state.route) {
    const key = routeKey(route)
    const eligible = this.state.policies.filter(policy => !policy.routeKey || policy.routeKey === key)
    const ranked = [...eligible].sort((a, b) => b.fitness - a.fitness)
    if (!ranked.length) return []
    const best = ranked[0]
    const lean = ranked.filter(policy => policy.passRate >= 0.5).sort((a, b) => a.cost - b.cost)[0] || best
    const explorer = [...eligible]
      .sort((a, b) => this.novelty(b) - this.novelty(a) || b.generation - a.generation)[0] || best
    return [
      { kind: 'best', label: '最强', policy: best },
      { kind: 'lean', label: '最省', policy: lean },
      { kind: 'explorer', label: '最异', policy: explorer },
    ]
  }

  proxyFitness(policy, generation) {
    const prompt = String(policy.systemPrompt || '')
    const operatorCount = (policy.operators || []).length
    const hasFormat = /格式|字段|数量|输出|format|json|exact/i.test(prompt)
    const hasCheck = /检查|验证|回读|boundary|counterexample|审计|verify/i.test(prompt)
    const hasShort = /简洁|最短|删除|concise|compress/i.test(prompt)
    const ids = new Set(policy.operators || [])
    const synergyPairs = [
      ['decompose', 'verify-first'],
      ['counterexample', 'unknown-boundary'],
      ['compress', 'format-lock'],
      ['first-principles', 'tool-bottleneck'],
      ['recursive-audit', 'user-model'],
    ]
    const synergy = synergyPairs.reduce((sum, pair) => sum + (pair.every(id => ids.has(id)) ? 0.025 : 0), 0)
    const novelty = Math.min(0.025, this.novelty(policy) * 0.025)
    const raw = 0.48 + Math.min(0.2, prompt.length / 3000) + Math.min(0.12, operatorCount * 0.025)
      + (hasFormat ? 0.05 : 0) + (hasCheck ? 0.06 : 0) + (hasShort ? 0.03 : 0)
      + Math.min(0.125, synergy) + Math.min(0.04, generation * 0.004) + novelty
    return clamp(raw, 0.35, 0.88)
  }

  async evaluate(policy, llm, route, useLlm) {
    if (!useLlm || !llm) {
      const fitness = this.proxyFitness(policy, policy.generation)
      return { fitness, passRate: fitness, cost: 0.2, evidence: 'proxy', tasks: [] }
    }
    const tasks = []
    for (const [taskIndex, task] of BENCHMARKS.entries()) {
      this.progress.phase = 'evaluating'
      this.progress.task = task.label || task.id
      this.progress.taskIndex = taskIndex + 1
      this.progress.taskTotal = BENCHMARKS.length
      const result = await this.sample(
        llm,
        route,
        [policy.systemPrompt, this.directiveProfileOnly()].filter(Boolean).join('\n\n'),
        task.prompt,
        900,
      )
      const score = this.scoreAnswer(task, result.text)
      tasks.push({ id: task.id, ok: result.ok, reason: result.reason || null, ...score })
    }
    const measured = tasks.filter(task => task.ok)
    const passRate = measured.length ? measured.reduce((sum, task) => sum + task.pass, 0) / measured.length : 0
    const cleanRate = measured.length ? measured.reduce((sum, task) => sum + task.clean, 0) / measured.length : 0
    const avgChars = measured.length ? measured.reduce((sum, task) => sum + task.chars, 0) / measured.length : 0
    const efficiency = clamp(1 - avgChars / 1200, 0, 1)
    const fitness = clamp(passRate * 0.7 + cleanRate * 0.2 + efficiency * 0.1, 0, 1)
    const evidence = measured.length === 0 ? 'failed' : measured.length === tasks.length ? 'measured' : 'partial'
    return { fitness, passRate, cost: clamp(avgChars / 1200, 0, 1), evidence, tasks }
  }

  directiveProfileOnly() {
    const profile = this.state.profile
    const principles = (profile.principles || []).map(item => `- ${item.text}`).join('\n')
    return [
      `用户语言：${profile.language === 'en' ? 'English' : '中文'}`,
      `用户偏好详略：${profile.verbosity || 'balanced'}`,
      `用户偏好风格：${profile.style || 'direct'}`,
      principles ? `用户长期偏好：\n${principles}` : '',
    ].filter(Boolean).join('\n')
  }

  operatorsFor(parent) {
    const pool = this.state.operators || []
    const inherited = (parent.operators || []).slice(0, 4)
    const weighted = pool
      .map(operator => ({ operator, weight: (operator.wins + 1) / (operator.uses + 1) }))
      .filter(item => !inherited.includes(item.operator.id))
      .sort((a, b) => b.weight - a.weight)
    const chosen = weighted.slice(0, 2).map(item => item.operator.id)
    return [...inherited, ...chosen].slice(0, 5)
  }

  builtinCandidates(parent, generation, count) {
    const pool = this.state.operators || []
    const chosen = this.operatorsFor(parent)
    const candidates = []
    for (let index = 0; index < count; index += 1) {
      if (index === 0 && generation > 0) {
        const mate = this.state.policies
          .filter(policy => policy.id !== parent.id)
          .sort((a, b) => b.fitness - a.fitness)[0]
        if (mate) {
          const operators = [...new Set([...(parent.operators || []), ...(mate.operators || [])])].slice(0, 5)
          const prompt = [
            parent.systemPrompt,
            '交叉：合并另一条高分策略，只保留能改变结果的部分。',
            mate.systemPrompt.slice(0, 700),
            `第 ${generation + 1} 代：合并后只保留一条最短可执行路径，交付前检查格式与数量。`,
          ].filter(Boolean).join('\n\n')
          candidates.push({
            name: `第${generation + 1}代 · 交叉`,
            systemPrompt: prompt,
            operators,
            parentId: parent.id,
            generation: generation + 1,
          })
          continue
        }
      }
      const operator = pool[(index + generation) % Math.max(1, pool.length)]
      const operators = [...new Set([...chosen, operator.id])].slice(0, 5)
      const extra = operators
        .map(id => pool.find(item => item.id === id)?.text)
        .filter(Boolean)
        .join('\n')
      const prompt = [
        parent.systemPrompt,
        extra,
        `第 ${generation + 1} 代：只保留能改变结果的步骤，交付前检查格式与数量。`,
      ].filter(Boolean).join('\n\n')
      candidates.push({
        name: `第${generation + 1}代 · ${operator?.label || '变异'}`,
        systemPrompt: prompt,
        operators,
        parentId: parent.id,
        generation: generation + 1,
      })
    }
    return candidates
  }

  async llmCandidates(parent, generation, count, llm, route) {
    const prompt = [
      '你是 RSI 的策略变异器。基于下面的当前策略，生成新的策略候选。',
      '只输出 JSON 数组，最多 ' + count + ' 个对象；每个对象只有 name 和 systemPrompt 两个字符串字段。',
      '要求：新策略必须比父策略更短或更可执行；必须包含至少一个可验证的自检步骤；不得改变模型权重；不得要求联网、安装代码或读取秘密。',
      '父策略：',
      parent.systemPrompt,
      '用户模型：',
      this.directiveProfileOnly(),
    ].join('\n')
    const result = await this.sample(llm, route, '你只输出严格 JSON，不要输出解释。', prompt, 1400)
    if (!result.ok) return []
    try {
      const match = result.text.match(/\[[\s\S]*\]/)
      if (!match) return []
      const parsed = JSON.parse(match[0])
      if (!Array.isArray(parsed)) return []
      return parsed
        .filter(item => item && typeof item.systemPrompt === 'string')
        .slice(0, count)
        .map((item, index) => ({
          name: cleanText(item.name).slice(0, 40) || `第${generation + 1}代 · LLM ${index + 1}`,
          systemPrompt: cleanText(item.systemPrompt).slice(0, 2200),
          operators: this.operatorsFor(parent),
          parentId: parent.id,
          generation: generation + 1,
        }))
        .filter(item => item.systemPrompt)
    } catch {
      return []
    }
  }

  addPolicy(candidate, evaluation, route = this.state.route) {
    const id = `g${candidate.generation}-${hash(candidate.systemPrompt + candidate.name + Date.now())}`
    const policy = {
      id,
      name: candidate.name,
      parentId: candidate.parentId || null,
      generation: candidate.generation,
      systemPrompt: candidate.systemPrompt,
      operators: candidate.operators || [],
      routeKey: routeKey(route),
      fitness: evaluation.fitness,
      passRate: evaluation.passRate,
      cost: evaluation.cost,
      evidence: evaluation.evidence,
      lastResults: Array.isArray(evaluation.tasks)
        ? evaluation.tasks.map(task => ({ id: String(task.id || ''), ok: task.ok !== false, pass: task.pass === 1, chars: Number.isFinite(task.chars) ? task.chars : 0, reason: task.reason || null }))
        : [],
      wins: 0,
      losses: 0,
      createdAt: now(),
    }
    this.state.policies.push(policy)
    this.pendingPolicyIds.add(policy.id)
    this.state.policies.sort((a, b) => b.fitness - a.fitness)
    if (this.state.policies.length > MAX_POLICIES) {
      const protectedIds = new Set([
        policy.id,
        ...this.pendingPolicyIds,
        this.state.activeId,
        this.state.bestId,
        this.state.baselineId,
        this.state.previousActiveId,
        ...Object.values(this.state.routeBest || {}),
      ].filter(Boolean))
      while (this.state.policies.length > MAX_POLICIES) {
        let victimIndex = -1
        for (let index = this.state.policies.length - 1; index >= 0; index -= 1) {
          if (!protectedIds.has(this.state.policies[index].id)) {
            victimIndex = index
            break
          }
        }
        if (victimIndex < 0) break
        this.state.policies.splice(victimIndex, 1)
      }
    }
    return policy
  }

  updateOperatorCredit(candidate, winner) {
    for (const operator of this.state.operators) {
      if (!(candidate.operators || []).includes(operator.id)) continue
      operator.uses += 1
      if (winner) operator.wins += 1
    }
  }

  trimHistory() {
    this.state.history = this.state.history.slice(-MAX_HISTORY)
    this.state.ledger = this.state.ledger.slice(-MAX_LEDGER)
  }

  async evolve(options = {}) {
    if (this.busy) throw new Error('BUSY')
    this.busy = true
    this.pendingPolicyIds.clear()
    this.progress = { busy: true, phase: 'prepare', current: 0, total: 0, candidate: 0, totalCandidates: 0, task: '', generation: this.state.generation, startedAt: now() }
    try {
      const generations = clamp(Math.round(Number(options.generations) || 1), 1, 24)
      const count = clamp(Math.round(Number(options.candidates) || 3), 1, 8)
      const useLlm = options.useLlm !== false
      const llm = options.llm || null
      const route = normalizeRoute(options.route || this.state.route)
      this.state.route = route
      const routeStamp = routeKey(route)
      const summary = []
      for (let step = 0; step < generations; step += 1) {
        this.progress.phase = 'candidates'
        this.progress.current = step + 1
        this.progress.total = generations
        this.progress.candidate = 0
        this.progress.totalCandidates = count
        const parent = this.routeBestFor(route) || this.activePolicy()
        if (!parent) break
        const nextGeneration = this.state.generation + 1
        let candidates = []
        if (useLlm && llm) candidates = await this.llmCandidates(parent, nextGeneration, count, llm, route)
        if (candidates.length < count) {
          candidates = candidates.concat(this.builtinCandidates(parent, nextGeneration, count - candidates.length))
        }
        if (candidates.length === 0) candidates = this.builtinCandidates(parent, nextGeneration, count)
        this.progress.totalCandidates = candidates.length
        const evaluated = []
        for (const [candidateIndex, candidate] of candidates.entries()) {
          this.progress.candidate = candidateIndex + 1
          this.progress.phase = 'evaluating'
          const evaluation = await this.evaluate(candidate, llm, route, useLlm)
          const policy = this.addPolicy(candidate, evaluation, route)
          evaluated.push({ policy, evaluation })
        }
        const best = evaluated.slice().sort((a, b) => b.policy.fitness - a.policy.fitness)[0]
        if (!best) break
        const currentBest = this.routeBestFor(route)
        const globalBest = this.policy(this.state.bestId)
        // Ties do not displace the incumbent.
        const isWinner = !currentBest || best.policy.fitness > currentBest.fitness + 1e-9
        for (const item of evaluated) this.updateOperatorCredit(item.policy, item.policy.id === best.policy.id)
        if (isWinner) {
          this.state.routeBest[routeStamp] = best.policy.id
          if (!globalBest || best.policy.fitness > globalBest.fitness + 1e-9) this.state.bestId = best.policy.id
        }
        this.pendingPolicyIds.clear()
        this.state.generation = nextGeneration
        if (this.state.mode === 'auto') this.state.activeId = this.routeBestFor(route)?.id || this.state.bestId
        const entry = {
          at: now(),
          generation: nextGeneration,
          routeKey: routeStamp,
          parentId: parent.id,
          parentName: parent.name,
          bestId: best.policy.id,
          bestName: best.policy.name,
          winner: isWinner,
          routeBestId: this.state.routeBest[routeStamp] || null,
          globalBestId: this.state.bestId,
          bestFitness: best.policy.fitness,
          delta: currentBest ? best.policy.fitness - currentBest.fitness : best.policy.fitness,
          evidence: best.evaluation.evidence,
          candidates: evaluated.map(item => ({ id: item.policy.id, fitness: item.policy.fitness, evidence: item.evaluation.evidence })),
        }
        this.state.history.push(entry)
        this.state.ledger.push({ at: entry.at, type: 'evolve', generation: nextGeneration, bestId: entry.bestId, fitness: entry.bestFitness, evidence: entry.evidence })
        this.trimHistory()
        summary.push(entry)
      }
      this.save()
      this.progress = { busy: false, phase: 'idle', current: 0, total: 0, candidate: 0, totalCandidates: 0, task: '', generation: this.state.generation, startedAt: '' }
      return { ok: true, generation: this.state.generation, activeId: this.state.activeId, bestId: this.state.bestId, routeBestId: this.state.routeBest[routeStamp] || null, route, mode: this.state.mode, summary, snapshot: this.snapshot() }
    } finally {
      this.pendingPolicyIds.clear()
      this.busy = false
      this.progress = { busy: false, phase: 'idle', current: 0, total: 0, candidate: 0, totalCandidates: 0, task: '', generation: this.state.generation, startedAt: '' }
    }
  }
}

export { BENCHMARKS, DEFAULT_OPERATORS, PLUGIN_VERSION, defaultState, normalizeState }
