#!/usr/bin/env node
/**
 * scripts/bundle-models.mjs
 * Copies MediaPipe WASM runtime from node_modules into public/models/wasm/
 * and downloads .task model files into public/models/
 * Run: node scripts/bundle-models.mjs
 */
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import { get } from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC_MODELS = join(ROOT, 'public', 'models');
const WASM_DEST = join(PUBLIC_MODELS, 'wasm');
const WASM_SRC = join(ROOT, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm');

const MODELS = [
  {
    name: 'pose_landmarker_lite.task',
    url: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
  },
  {
    name: 'hand_landmarker.task',
    url: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
  },
];

function ensureDir(p) {
  if (!existsSync(p)) { mkdirSync(p, { recursive: true }); console.log(`  Created: ${p}`); }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (existsSync(dest)) {
      console.log(`  ✓ Exists: ${dest.split('/').pop()} (${(statSync(dest).size/1024/1024).toFixed(1)} MB)`);
      return resolve();
    }
    console.log(`  ↓ Downloading: ${dest.split('/').pop()} ...`);
    const file = createWriteStream(dest);
    get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`  ✓ Done: ${dest.split('/').pop()} (${(statSync(dest).size/1024/1024).toFixed(1)} MB)`);
        resolve();
      });
    }).on('error', (e) => { file.close(); reject(e); });
  });
}

async function main() {
  console.log('\n🔧 MediaPipe Model Bundler\n');
  ensureDir(PUBLIC_MODELS);
  ensureDir(WASM_DEST);

  if (!existsSync(WASM_SRC)) {
    console.error('WASM source not found in node_modules. Run npm install first.');
    process.exit(1);
  }
  const wasmFiles = readdirSync(WASM_SRC);
  console.log(`Copying ${wasmFiles.length} WASM files from node_modules...`);
  for (const f of wasmFiles) {
    const dest = join(WASM_DEST, f);
    if (!existsSync(dest)) { copyFileSync(join(WASM_SRC, f), dest); console.log(`  ✓ Copied: ${f}`); }
    else console.log(`  ✓ Exists: ${f}`);
  }

  console.log('\nDownloading model files...');
  for (const m of MODELS) await downloadFile(m.url, join(PUBLIC_MODELS, m.name));

  console.log('\n✅ Models bundled into public/models/\n');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
