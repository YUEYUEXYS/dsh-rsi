import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RsiEngine, BENCHMARKS } from '../lib/engine.js'

function fakeLlm() {
  return {
    async *stream(options) {
      const text = String(options?.messages?.[0]?.content?.[0]?.text || '')
      if (text.includes('17 sheep')) yield { type: 'text-delta', text: '9' }
      else if (text.includes('exactly the keys')) yield { type: 'text-delta', text: '{"a":1,"b":2}' }
      else if (text.includes('three colors')) yield { type: 'text-delta', text: 'red\nblue\ngreen' }
      else if (text.includes('37 * 24')) yield { type: 'text-delta', text: '888' }
      else if (text.includes("r's are in")) yield { type: 'text-delta', text: '3' }
      else if (text.includes('one day after')) yield { type: 'text-delta', text: '2026-11-15' }
      else if (text.includes('header name,score')) yield { type: 'text-delta', text: 'name,score\nAda,10' }
      else if (text.includes('递归进化')) yield { type: 'text-delta', text: '递归进化' }
      else if (text.includes('只输出 JSON 数组')) yield { type: 'text-delta', text: '[{"name":"llm-a","systemPrompt":"先锁定格式，再验证数字，最后只交付答案。"}]' }
      else yield { type: 'text-delta', text: 'ok' }
    },
  }
}

const home = mkdtempSync(join(tmpdir(), 'rsi-engine-'))
try {
  const engine = new RsiEngine({ home })
  if (engine.state.generation !== 0) throw new Error('initial generation')
  if (!engine.directive().includes('[RSI ACTIVE POLICY]')) throw new Error('directive missing policy')
  engine.learnFromUser('以后都用中文，回答先给结论，不要写长篇大论')
  if (engine.state.profile.language !== 'zh') throw new Error('language learn')
  if (!engine.state.profile.principles.some(item => item.text.includes('用中文'))) throw new Error('principle learn')
  const learnedTurns = engine.state.profile.turns
  engine.learnFromUser('以后都用中文，回答先给结论，不要写长篇大论')
  if (engine.state.profile.turns !== learnedTurns) throw new Error('duplicate learn counted')

  const autoHome = join(home, 'auto')
  const auto = new RsiEngine({ home: autoHome })
  if (auto.state.mode !== 'auto') throw new Error('default mode is not auto')
  if (auto.state.route.reasoningEffort !== 'max') throw new Error('default effort')
  auto.setMode('auto')
  await auto.evolve({ generations: 2, candidates: 3, useLlm: false })
  if (auto.state.activeId !== auto.state.routeBest[Object.keys(auto.state.routeBest)[0]]) throw new Error('auto mode not following route best')

  const result = await engine.evolve({ generations: 2, candidates: 2, useLlm: true, llm: fakeLlm() })
  if (!result.ok) throw new Error('evolve not ok')
  if (engine.state.generation !== 2) throw new Error('generation not advanced')
  if (engine.state.policies.length < 8) throw new Error('policies not added')
  if (result.summary.length !== 2) throw new Error('summary length')
  if (!engine.state.policies.some(policy => policy.evidence === 'measured')) throw new Error('measured evidence missing')
  const measuredPolicy = engine.state.policies.find(policy => policy.evidence === 'measured')
  if (!measuredPolicy.lastResults || measuredPolicy.lastResults.length !== BENCHMARKS.length) throw new Error('benchmark evidence missing')
  if (!result.snapshot?.benchmarks || result.snapshot.benchmarks.length !== BENCHMARKS.length) throw new Error('benchmark labels missing')
  if (result.snapshot?.pluginVersion !== '0.1.0') throw new Error('plugin version missing')
  if (!result.snapshot?.front || result.snapshot.front.length !== 3) throw new Error('policy front missing')
  if (!result.snapshot?.routeBestId) throw new Error('route best missing')
  if (!result.snapshot.policies.some(policy => typeof policy.systemPrompt === 'string' && policy.systemPrompt.length > 0)) throw new Error('policy prompt missing')

  // A route keeps its own incumbent; a second model does not inherit it.
  const cross = new RsiEngine({ home: join(home, 'cross') })
  const routeA = { provider: 'deepseek-official', model: 'deepseek-flash', reasoningEffort: 'high' }
  const routeB = { provider: 'deepseek-official', model: 'deepseek-pro', reasoningEffort: 'max' }
  await cross.evolve({ generations: 1, candidates: 1, useLlm: false, route: routeA })
  await cross.evolve({ generations: 1, candidates: 1, useLlm: false, route: routeB })
  const keys = Object.keys(cross.state.routeBest)
  if (!keys.includes('deepseek-official/deepseek-flash/high')) throw new Error('route A not tracked')
  if (!keys.includes('deepseek-official/deepseek-pro/max')) throw new Error('route B not tracked')

  const best = engine.activePolicy()
  const applied = engine.apply(best.id)
  if (!applied.activeId) throw new Error('apply failed')
  const rolled = engine.rollback()
  if (!rolled.activeId) throw new Error('rollback failed')

  const saved = engine.exportGenome()
  if (saved.generation !== 2) throw new Error('export generation')
  const loaded = new RsiEngine({ home })
  if (loaded.state.generation !== 2) throw new Error('reload generation')

  // Keep active/best/baseline through trimming.
  const stressHome = join(home, 'stress')
  const stress = new RsiEngine({ home: stressHome })
  for (let round = 0; round < 28; round += 1) {
    await stress.evolve({ generations: 1, candidates: 5, useLlm: false })
    if (!stress.policy(stress.state.activeId)) throw new Error('active policy trimmed')
    if (!stress.policy(stress.state.bestId)) {
      console.log('BEST_MISSING', stress.state.bestId, stress.state.generation, stress.state.policies.length)
      console.log(stress.state.policies.map(p => p.id + ':' + p.fitness.toFixed(2)).join('\n'))
      throw new Error('best policy trimmed')
    }
    if (stress.state.policies.length > 96) throw new Error('genome unbounded')
  }
  if (!stress.policy(stress.state.baselineId)) throw new Error('baseline trimmed')

  // Proxy is an estimate, not measured.
  const proxy = await loaded.evolve({ generations: 1, candidates: 1, useLlm: false })
  if (proxy.summary[0].evidence !== 'proxy') throw new Error('proxy evidence')
  console.log('RSI_ENGINE_TEST_PASS')
} finally {
  rmSync(home, { recursive: true, force: true })
}
