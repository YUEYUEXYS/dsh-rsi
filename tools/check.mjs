import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const run = (args) => execFileSync(process.execPath, args, { cwd: root, stdio: 'inherit' })

for (const file of ['lib/engine.js', 'lib/index.js', 'lib/client.js']) {
  run(['--check', join(root, file)])
}
console.log('CHECK_PASS')

for (const test of ['test_engine.mjs', 'test_host.mjs', 'test_client.mjs']) {
  run([join(root, 'tools', test)])
}
console.log('RSI_CHECK_PASS')
