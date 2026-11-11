#!/usr/bin/env node
/**
 * One-command production deploy:  pnpm ship
 *
 *  1. Fetches the production database settings from Vercel (kept in .vercel/, never committed)
 *  2. Compares your collections, blocks and fields with the last migration and writes a
 *     new migration only if something changed
 *  3. Deploys to Vercel — the build applies any pending migrations before going live
 *
 *  pnpm ship --check   stops after step 2 (no deploy)
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envFile = path.join(root, '.vercel', '.env.prod')
const migrationsDir = path.join(root, 'src', 'migrations')
const checkOnly = process.argv.includes('--check')

const run = (label, command, env = process.env) => {
  console.log(`\n› ${label}`)
  // shell: true so the .cmd shims for npx/pnpm resolve on Windows
  const result = spawnSync(command, { cwd: root, env, shell: true, stdio: 'inherit' })
  if (result.status !== 0) {
    console.error(`\n✗ Stopped: "${label}" failed. Nothing further was run.`)
    process.exit(result.status ?? 1)
  }
}

const parseEnv = (file) =>
  Object.fromEntries(
    readFileSync(file, 'utf-8')
      .split(/\r?\n/)
      .map((line) => line.match(/^([A-Z0-9_]+)=(.*)$/i))
      .filter(Boolean)
      .map(([, key, value]) => [key, value.replace(/^"(.*)"$/, '$1')]),
  )

const migrations = () =>
  existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((f) => f.endsWith('.ts') && f !== 'index.ts')
    : []

if (!existsSync(path.join(root, '.vercel', 'project.json'))) {
  console.error('✗ This folder is not linked to a Vercel project. Run: npx vercel link')
  process.exit(1)
}

run(
  'Fetching production settings from Vercel',
  'npx --yes vercel@latest env pull .vercel/.env.prod --environment production --yes',
)

const prod = parseEnv(envFile)
for (const key of ['POSTGRES_URL', 'BLOB_READ_WRITE_TOKEN']) {
  if (!prod[key]) {
    console.error(`✗ ${key} is missing on the Vercel project — is the database / photo storage still connected?`)
    process.exit(1)
  }
}

const before = migrations()
run(
  'Checking for schema changes',
  'pnpm payload migrate:create --skip-empty',
  // The schema must be compared exactly as production builds it. Photo storage adds a
  // column to media, so its token has to be present too or the check would drop that column.
  // Nothing is written to the database or to storage at this step.
  {
    ...process.env,
    BLOB_READ_WRITE_TOKEN: prod.BLOB_READ_WRITE_TOKEN,
    NODE_ENV: 'production',
    POSTGRES_URL: prod.POSTGRES_URL,
  },
)
const created = migrations().filter((f) => !before.includes(f))

console.log(
  created.length
    ? `\n✓ Schema changed — new migration: src/migrations/${created[0]}`
    : '\n✓ No schema changes — no migration needed',
)

if (checkOnly) {
  console.log('  --check given, so nothing was deployed.')
  process.exit(0)
}

run('Deploying to Vercel (pending migrations are applied during the build)', 'npx --yes vercel@latest deploy --prod --yes')

console.log('\n✓ Live. Commit src/migrations so the migration history stays with the code.')
