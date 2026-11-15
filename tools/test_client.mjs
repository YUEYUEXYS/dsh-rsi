import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const code = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
let loaded = null
const style = { id: '', textContent: '', setAttribute() {} }
let navButtons = []
const fakeSvg = {
  attrs: {},
  paths: [],
  firstChild: null,
  getAttribute(name) { return this.attrs[name] || null },
  setAttribute(name, value) { this.attrs[name] = value },
  removeChild() {},
  appendChild(node) { this.paths.push(node) },
}
const fakeButton = {
  textContent: 'RSI 配置',
  classList: { names: [], add(name) { this.names.push(name) } },
  querySelector() { return fakeSvg },
}
const document = {
  getElementById() { return null },
  createElement() { return style },
  createElementNS() { return { setAttribute() {} } },
  head: { appendChild() {} },
  querySelectorAll() { return navButtons },
  documentElement: {},
}
const React = {
  createElement(type, props, ...children) { return { type, props, children } },
  useState(value) {
    stateCalls += 1
    if (stateCalls === 1) return [fakeSnapshot, () => {}]
    if (selectedMode && stateCalls === 8) return ['g1-a', () => {}]
    return [value, () => {}]
  },
  useEffect() {},
  useCallback(fn) { return fn },
}
let stateCalls = 0
let selectedMode = false
const fakeSnapshot = {
  ok: true, pluginVersion: '0.1.0', enabled: true, mode: 'auto', generation: 2, activeId: 'g1-a', bestId: 'g1-a', routeBestId: 'g1-a',
  policyCount: 3, profile: { language: 'zh', verbosity: 'balanced', style: 'direct', principles: [], turns: 4 },
  route: { provider: 'deepseek-official', model: 'deepseek-flash', reasoningEffort: 'max' },
  policies: [{
    id: 'g1-a', name: '第1代 · 交叉', generation: 1, parentId: 'seed-balanced', parentName: '平衡基线', fitness: 0.88, passRate: 1, cost: 0.2,
    evidence: 'measured', operators: ['verify-first', 'format-lock'], novelty: 0.7,
    systemPrompt: '先锁定格式，再验证数字，最后只交付答案。',
    lastResults: [
      { id: 'exact-logic', ok: true, pass: true, chars: 1 },
      { id: 'exact-json', ok: true, pass: true, chars: 13 },
      { id: 'exact-list', ok: true, pass: true, chars: 12 },
      { id: 'exact-math', ok: true, pass: true, chars: 3 },
      { id: 'exact-count', ok: true, pass: true, chars: 1 },
      { id: 'exact-date', ok: true, pass: true, chars: 10 },
      { id: 'exact-csv', ok: true, pass: true, chars: 17 },
      { id: 'exact-chinese', ok: true, pass: true, chars: 4 },
    ],
  }],
  front: [
    { kind: 'best', label: '最强', id: 'g1-a', name: '第1代 · 交叉', fitness: 0.88, cost: 0.2, novelty: 0.7 },
    { kind: 'lean', label: '最省', id: 'seed-balanced', name: '平衡基线', fitness: 0.62, cost: 0.12, novelty: 0.3 },
    { kind: 'explorer', label: '最异', id: 'seed-decompose', name: '分解者', fitness: 0.64, cost: 0.25, novelty: 0.9 },
  ],
  operatorLabels: { 'verify-first': '先验证再交付', 'format-lock': '输出格式锁' },
  history: [{ generation: 1, bestName: '第1代 · 交叉', parentName: '平衡基线', bestFitness: 0.88 }],
  benchmarks: [
    { id: 'exact-logic', label: '逻辑陷阱' }, { id: 'exact-json', label: '严格 JSON' },
    { id: 'exact-list', label: '严格列表' }, { id: 'exact-math', label: '精确算术' },
    { id: 'exact-count', label: '精确计数' }, { id: 'exact-date', label: '日期边界' },
    { id: 'exact-csv', label: '严格 CSV' }, { id: 'exact-chinese', label: '中文精确' },
  ],
  progress: { busy: false, phase: 'idle', current: 0, total: 0, candidate: 0, totalCandidates: 0, task: '' },
  storage: 'test',
}
const sandbox = {
  window: { __ModuleLoader__: { load(options) { loaded = options.factory((name) => {
    if (name === 'react') return React
    throw new Error('unexpected require: ' + name)
  }) } } },
  document,
  fetch: async () => ({ ok: true, json: async () => ({ ok: true }) }),
  setInterval: () => 1,
  clearInterval() {},
  setTimeout: () => 1,
  clearTimeout() {},
  console,
  MutationObserver: class { observe() {} disconnect() {} },
  URL,
}
vm.runInNewContext(code, sandbox, { filename: 'client.js' })
if (!loaded) throw new Error('client did not load')
if (!Array.isArray(loaded.inject) || !loaded.inject.includes('slots')) throw new Error('client inject')
if (!loaded.inject.includes('locale')) throw new Error('client locale inject')
let section = null
let component = null
let dictionaries = null
let activeLocale = 'zh'
const locale = {
  register(namespace, value) { dictionaries = value },
  bind(namespace) {
    return key => dictionaries[activeLocale]?.[key] || dictionaries.en?.[key] || key
  },
  getSnapshot() { return { locale: activeLocale } },
  subscribe() { return () => {} },
  setLocale(value) { activeLocale = value },
}
const ctx = {
  slots: {
    inject(name, cb) { cb() },
    register(options, value) { section = options; component = value; return () => {} },
  },
  locale,
}
navButtons = [fakeButton]
loaded.apply(ctx)
if (!dictionaries || !dictionaries.zh || !dictionaries.en) throw new Error('locale dictionaries missing')
if (fakeSvg.attrs['data-rsi-icon'] !== 'loop') throw new Error('nav icon not replaced')
if (fakeSvg.paths.length !== 4) throw new Error('nav icon paths missing')
if (!fakeButton.classList.names.includes('rsi-nav-row')) throw new Error('nav row marker missing')
if (!section) throw new Error('section missing')
if (section.id !== 'rsi') throw new Error('section id')
if (section.order !== 100000) throw new Error('section order')
if (section.locale !== 'dsh-rsi') throw new Error('section locale')
if (section.label() !== 'RSI 配置') throw new Error('section label zh')
if (typeof component !== 'function') throw new Error('component missing')

const findTitle = node => {
  if (!node || typeof node !== 'object') return ''
  if (node.type === 'h3') return (node.children || []).join('')
  for (const child of (node.children || [])) {
    const found = findTitle(child)
    if (found) return found
  }
  return ''
}
const hasText = (node, needle) => {
  if (typeof node === 'string') return node.includes(needle)
  if (!node || typeof node !== 'object') return false
  return (node.children || []).some(child => hasText(child, needle))
}
const zhT = locale.bind('dsh-rsi')
const tree = component({ t: zhT })
if (!tree || tree.type !== 'div') throw new Error('component render')
const sectionTitles = tree.children.map(findTitle).filter(Boolean)
for (const title of ['三目标前沿', '进化控制台', '策略库', '用户模型', '代际曲线', '运行日志']) {
  if (!sectionTitles.includes(title)) throw new Error('missing section: ' + title)
}
selectedMode = true
stateCalls = 0
const selectedTree = component({ t: zhT })
if (!hasText(selectedTree, '复制提示词')) throw new Error('inspector copy missing')
if (!hasText(selectedTree, '先锁定格式')) throw new Error('inspector prompt missing')
activeLocale = 'en'
if (section.label() !== 'RSI Settings') throw new Error('section label en')
const enT = locale.bind('dsh-rsi')
selectedMode = true
stateCalls = 0
const enTree = component({ t: enT })
const enTitles = enTree.children.map(findTitle).filter(Boolean)
for (const title of ['Three-target frontier', 'Evolution console', 'Policy library', 'User model', 'Generation curve', 'Run log']) {
  if (!enTitles.includes(title)) throw new Error('missing en section: ' + title)
}
if (!hasText(enTree, 'Evolve 1 generation')) throw new Error('en action missing')
if (!hasText(enTree, 'Gen 1 · Crossover')) throw new Error('en policy name missing')
if (!hasText(enTree, 'Copy prompt')) throw new Error('en inspector missing')
console.log('RSI_CLIENT_TEST_PASS')
