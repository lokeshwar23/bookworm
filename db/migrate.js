#!/usr/bin/env node
// BookWorm — Database Migration Script
// Usage: node db/migrate.js
// Requires DATABASE_URL to be set in .env.local (or the shell environment)

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Load .env.local manually (no external dotenv dependency needed)
// ---------------------------------------------------------------------------
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env.local');
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local not found — rely on shell environment
  }
}

loadEnv();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL is not set. Add it to .env.local or export it in your shell.');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });

async function run() {
  try {
    console.log('📦  Running schema.sql …');
    const schema = readFileSync(resolve(__dirname, 'schema.sql'), 'utf8');
    await sql.unsafe(schema);
    console.log('✅  schema.sql applied.');

    console.log('🌱  Running seed.sql …');
    const seed = readFileSync(resolve(__dirname, 'seed.sql'), 'utf8');
    await sql.unsafe(seed);
    console.log('✅  seed.sql applied.');

    console.log('\n🎉  Migration complete!');
  } catch (err) {
    console.error('❌  Migration failed:', err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
