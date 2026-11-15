// Host plugin: prompt section, /rsi API, route/profile observers.

import { RsiEngine, PLUGIN_VERSION } from './engine.js'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export const name = 'dsh-rsi'
export const inject = ['systemPrompt', 'llm']

function log(ctx, level, message) {
  try { ctx.logger?.[level]?.(String(message)) } catch {}
}

function textOf(value) {
  if (typeof value === 'string') return value
  if (!Array.isArray(value)) return ''
  return value.map(part => {
    if (!part || typeof part !== 'object') return ''
    return part.type === 'text' ? String(part.text || '') : ''
  }).join('\n')
}

function messageText(message) {
  if (!message || typeof message !== 'object') return ''
  if (Array.isArray(message.parts)) return textOf(message.parts)
  if (message.content !== undefined) return textOf(message.content)
  return ''
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', chunk => {
      size += chunk.length
      if (size > 131072) {
        reject(new Error('BODY_TOO_LARGE'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sendJson(res, status, body) {
  const text = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-cache',
  })
  res.end(text)
}

export function apply(ctx, config = {}) {
  const engine = new RsiEngine({ log: (level, message) => log(ctx, level, message) })
  const disposers = []

  // Active policy plus learned user model.
  try {
    disposers.push(ctx.systemPrompt.section({
      name: 'rsi:policy-and-user-model',
      order: 10001,
      text: () => engine.directive(),
      interpolate: false,
    }))
  } catch (error) {
    log(ctx, 'warn', 'prompt section failed: ' + String(error))
  }

  // Best-effort route capture. The settings page can open before the first turn.
  try {
    disposers.push(ctx.on('agent/created', ({ agent }) => {
      try { engine.noteRoute(agent) } catch {}
    }))
    disposers.push(ctx.on('agent/pre-step', async (payload, next) => {
      try {
        const agent = payload?.agent
        if (agent) engine.noteRoute(agent)
        const messages = Array.isArray(payload?.messages) ? payload.messages : []
        let latest = ''
        for (const message of messages) {
          if (message?.role !== 'user') continue
          const text = messageText(message)
          if (text) latest = text
        }
        if (latest) engine.learnFromUser(latest)
      } catch (error) {
        log(ctx, 'debug', 'observer failed: ' + String(error))
      }
      return next()
    }))
  } catch (error) {
    log(ctx, 'warn', 'agent observer failed: ' + String(error))
  }

  ctx.inject(['webServer'], wsCtx => {
    let disposeRoute = null
    try {
      const reg = wsCtx.webServer.register({
        kind: 'prefix',
        path: '/rsi',
        handler: async (req, res) => {
          try {
            const url = new URL(req.url || '/', 'http://localhost')
            const path = url.pathname.replace(/^\/rsi/, '') || '/api/state'
            if (path === '/api/state' && req.method === 'GET') {
              sendJson(res, 200, engine.snapshot())
              return
            }
            if (path === '/api/export' && req.method === 'GET') {
              sendJson(res, 200, { ok: true, genome: engine.exportGenome() })
              return
            }
            if (path === '/api/evolve' && req.method === 'POST') {
              const body = JSON.parse(await readBody(req) || '{}')
              if (body.route) engine.setRoute(body.route)
              const result = await engine.evolve({
                generations: body.generations,
                candidates: body.candidates,
                useLlm: body.useLlm !== false,
                llm: ctx.llm,
                route: body.route || engine.state.route,
              })
              sendJson(res, 200, result)
              return
            }
            if (path === '/api/apply' && req.method === 'POST') {
              const body = JSON.parse(await readBody(req) || '{}')
              sendJson(res, 200, { ok: true, snapshot: engine.apply(body.id) })
              return
            }
            if (path === '/api/rollback' && req.method === 'POST') {
              sendJson(res, 200, { ok: true, snapshot: engine.rollback() })
              return
            }
            if (path === '/api/profile' && req.method === 'POST') {
              const body = JSON.parse(await readBody(req) || '{}')
              sendJson(res, 200, { ok: true, profile: engine.setProfile(body) })
              return
            }
            if (path === '/api/profile/clear' && req.method === 'POST') {
              sendJson(res, 200, { ok: true, profile: engine.clearProfile() })
              return
            }
            if (path === '/api/mode' && req.method === 'POST') {
              const body = JSON.parse(await readBody(req) || '{}')
              sendJson(res, 200, { ok: true, mode: engine.setMode(body.mode) })
              return
            }
            if (path === '/api/enabled' && req.method === 'POST') {
              const body = JSON.parse(await readBody(req) || '{}')
              sendJson(res, 200, { ok: true, enabled: engine.setEnabled(body.enabled) })
              return
            }
            if (path === '/api/reset' && req.method === 'POST') {
              sendJson(res, 200, { ok: true, snapshot: engine.reset() })
              return
            }
            sendJson(res, 404, { ok: false, error: 'NOT_FOUND' })
          } catch (error) {
            const message = String(error?.message || error)
            sendJson(res, message === 'BUSY' ? 409 : 400, { ok: false, error: message })
          }
        },
      })
      if (typeof reg === 'function') disposeRoute = reg
      else if (reg && typeof reg.dispose === 'function') disposeRoute = () => reg.dispose()
    } catch (error) {
      log(ctx, 'warn', 'web route failed: ' + String(error))
    }
    disposers.push(() => { try { disposeRoute?.() } catch {} })
  })

  const saved = engine.save()
  try {
    const marker = join(engine.home, 'host.json')
    mkdirSync(dirname(marker), { recursive: true })
    writeFileSync(marker, JSON.stringify({
      at: new Date().toISOString(),
      pid: process.pid,
      version: PLUGIN_VERSION,
      generation: engine.state.generation,
    }), 'utf8')
  } catch {}
  log(ctx, saved ? 'info' : 'warn', 'RSI ready — generation=' + engine.state.generation + ' active=' + engine.state.activeId)

  return () => {
    for (const dispose of disposers.reverse()) {
      try { dispose() } catch {}
    }
    try { engine.save() } catch {}
  }
}
