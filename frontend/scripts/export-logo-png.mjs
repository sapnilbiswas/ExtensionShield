#!/usr/bin/env node
/**
 * Export ExtensionShield logo from SVG to PNG.
 * Run from repo root: node frontend/scripts/export-logo-png.mjs
 * Or from frontend: node scripts/export-logo-png.mjs
 * Requires: npm install sharp (dev)
 */

import sharp from 'sharp';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendDir = __dirname.includes('frontend') ? join(__dirname, '..') : join(__dirname, 'frontend');
const publicDir = join(frontendDir, 'public');
const svgPath = join(publicDir, 'extension-shield-logo.svg');
const outPath = join(publicDir, 'extension-shield-logo.png');
const outPath512 = join(publicDir, 'extension-shield-logo-512.png');
const outPath1024 = join(publicDir, 'extension-shield-logo-1024.png');

if (!existsSync(svgPath)) {
  console.error('SVG not found at', svgPath);
  process.exit(1);
}

const svg = readFileSync(svgPath);

async function run() {
  try {
    await sharp(svg)
      .resize(512, 512)
      .png()
      .toFile(outPath512);
    console.log('Written:', outPath512);

    await sharp(svg)
      .resize(1024, 1024)
      .png()
      .toFile(outPath1024);
    console.log('Written:', outPath1024);

    await sharp(svg)
      .resize(256, 256)
      .png()
      .toFile(outPath);
    console.log('Written:', outPath);
    console.log('\nDownload: frontend/public/extension-shield-logo.png (256px) or extension-shield-logo-512.png (512px) or extension-shield-logo-1024.png (1024px)');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
