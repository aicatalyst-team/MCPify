/**
 * MCPify Demo Recorder
 *
 * Records demo/demo.html as an animated GIF → saves to assets/demo.gif
 *
 * Usage:
 *   cd demo
 *   npm install
 *   node record.js
 *
 * Output: ../assets/demo.gif
 */

const puppeteer   = require('puppeteer');
const GIFEncoder  = require('gif-encoder-2');
const { PNG }     = require('pngjs');
const fs          = require('fs');
const path        = require('path');

// ─── Config ────────────────────────────────────────────────
const WIDTH    = 1920;
const HEIGHT   = 1080;
const FPS      = 24;             // frames per second
const DURATION = 42000;          // ms — full animation cycle
const QUALITY  = 10;             // 1 = best, 20 = smallest file
const OUT      = path.resolve(__dirname, '..', 'assets', 'demo.gif');
// ───────────────────────────────────────────────────────────

const FRAME_DELAY   = Math.round(1000 / FPS);
const TOTAL_FRAMES  = Math.ceil(DURATION / FRAME_DELAY);

async function record() {
  console.log('\n  ⚡  MCPify Demo Recorder\n');
  console.log(`  Resolution : ${WIDTH}×${HEIGHT}`);
  console.log(`  FPS        : ${FPS}`);
  console.log(`  Duration   : ${DURATION / 1000}s`);
  console.log(`  Frames     : ${TOTAL_FRAMES}`);
  console.log(`  Output     : ${OUT}\n`);

  // ── Launch browser ────────────────────────────────────────
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--allow-file-access-from-files',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1.5 });

  const demoUrl = 'file://' + path.resolve(__dirname, 'demo.html').replace(/\\/g, '/');
  console.log(`  Loading: ${demoUrl}\n`);
  await page.goto(demoUrl, { waitUntil: 'networkidle0' });

  // Give fonts and initial animation a moment to settle
  await new Promise(r => setTimeout(r, 800));

  // ── Set up GIF encoder ────────────────────────────────────
  const encoder = new GIFEncoder(WIDTH, HEIGHT, 'neuquant', true, TOTAL_FRAMES);
  encoder.setDelay(FRAME_DELAY);
  encoder.setRepeat(0);    // 0 = loop forever
  encoder.setQuality(QUALITY);
  encoder.start();

  // ── Capture frames ────────────────────────────────────────
  console.log('  Capturing frames...\n');
  const captureStart = Date.now();

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const frameStart = Date.now();

    // Screenshot as PNG
    const pngBuffer = await page.screenshot({ type: 'png', fullPage: false });

    // Decode PNG → RGBA pixel data
    const img = PNG.sync.read(pngBuffer);

    // Add frame to GIF
    encoder.addFrame(img.data);

    // Progress log every 20 frames
    if (i % 20 === 0 || i === TOTAL_FRAMES - 1) {
      const elapsed  = ((Date.now() - captureStart) / 1000).toFixed(1);
      const pct      = Math.round((i / TOTAL_FRAMES) * 100);
      const eta      = i > 0
        ? Math.round(((Date.now() - captureStart) / i) * (TOTAL_FRAMES - i) / 1000)
        : '?';
      process.stdout.write(`  Frame ${String(i + 1).padStart(4)} / ${TOTAL_FRAMES}  [${String(pct).padStart(3)}%]  ${elapsed}s elapsed  ETA: ${eta}s\r`);
    }

    // Pace frames to match target FPS (minus capture time)
    const frameTime = Date.now() - frameStart;
    const wait      = Math.max(0, FRAME_DELAY - frameTime);
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
  }

  console.log('\n\n  ✓ Capture complete. Encoding GIF...\n');

  // ── Finish encoding ───────────────────────────────────────
  encoder.finish();
  const gifData = Buffer.from(encoder.out.getData());
  fs.writeFileSync(OUT, gifData);

  await browser.close();

  const sizeMB = (gifData.length / 1024 / 1024).toFixed(1);
  console.log(`  ✅ Saved → ${OUT}`);
  console.log(`  📦 Size  : ${sizeMB} MB\n`);
  console.log('  Add to README above ## Overview:\n');
  console.log('  <p align="center">');
  console.log('    <img src="assets/demo.gif" alt="MCPify Demo" width="720" />');
  console.log('  </p>\n');
}

record().catch(err => {
  console.error('\n  ✗ Recording failed:', err.message);
  process.exit(1);
});
