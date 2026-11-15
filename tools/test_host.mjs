import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const home = mkdtempSync(join(tmpdir(), 'rsi-host-'))
process.env.LOCALAPPDATA = home
const events = {}
let promptSpec = null
let route = null
const ctx = {
  logger: { info() {}, warn() {}, debug() {} },
  llm: { async *stream() { yield { type: 'text-delta', text: 'ok' } } },
  systemPrompt: { section(spec) { promptSpec = spec; return () => {} } },
  on(name, fn) { events[name] = fn; return () => {} },
  inject(names, cb) {
    cb({ webServer: { register(opts) { route = opts; return () => {} } } })
  },
}

const plugin = await import('../lib/index.js')
const dispose = plugin.apply(ctx, {})
if (!promptSpec || promptSpec.name !== 'rsi:policy-and-user-model') throw new Error('prompt section missing')
if (promptSpec.order !== 10001) throw new Error('prompt order')
if (!promptSpec.text().includes('[RSI ACTIVE POLICY]')) throw new Error('prompt directive missing')
if (!route || route.kind !== 'prefix' || route.path !== '/rsi') throw new Error('route missing')

// Observer must still call next().
await events['agent/pre-step']({
  agent: { options: { provider: 'deepseek-official', model: 'deepseek-flash' } },
  messages: [{ role: 'user', content: [{ type: 'text', text: '以后都用中文，回答先给结论，不要长篇大论' }] }],
  signal: { aborted: false },
}, async () => ({ kind: 'proceed' }))

let stateBody = ''
const res = { writeHead() {}, end(value) { stateBody = String(value) } }
await route.handler({ url: '/rsi/api/state', method: 'GET' }, res)
const snapshot = JSON.parse(stateBody)
if (!snapshot.ok) throw new Error('state not ok')
if (!snapshot.profile.principles.some(item => item.text.includes('用中文'))) throw new Error('profile not learned')

try { dispose() } catch {}
rmSync(home, { recursive: true, force: true })
console.log('RSI_HOST_TEST_PASS')
