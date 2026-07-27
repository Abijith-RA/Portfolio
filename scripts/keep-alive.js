/**
 * ==============================================================================
 * Supabase Automatic Database Keep-Alive Script (scripts/keep-alive.js)
 * ==============================================================================
 * Purpose: Prevents Supabase Free Tier databases from pausing/deactivating due to 
 *          inactivity by sending an automated heartbeat query.
 * Usage:   node scripts/keep-alive.js OR npm run keep-alive
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...values] = trimmed.split('=');
        const val = values.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')) {
  console.error('[ERROR] Supabase credentials not found in .env file.');
  process.exit(1);
}

function pingSupabase() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ⚡ Sending Supabase Keep-Alive Heartbeat...`);

  const targetUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/profile?select=id&limit=1`;
  const curlCmd = `curl -s -w "\\n%{http_code}" -X GET "${targetUrl}" -H "apikey: ${supabaseAnonKey}" -H "Authorization: Bearer ${supabaseAnonKey}"`;

  exec(curlCmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`[${timestamp}] ❌ Heartbeat failed:`, error.message);
      process.exit(1);
    }

    const lines = stdout.trim().split('\n');
    const statusCode = lines.pop();
    const body = lines.join('\n');

    if (statusCode === '200') {
      console.log(`[${timestamp}] ✅ SUCCESS: Supabase database is ACTIVE! (HTTP 200)`);
      console.log(`[${timestamp}] 📊 Response acknowledged: ${body}`);
    } else {
      console.warn(`[${timestamp}] ⚠️ WARNING: Supabase returned HTTP ${statusCode}: ${body}`);
    }
  });
}

pingSupabase();
