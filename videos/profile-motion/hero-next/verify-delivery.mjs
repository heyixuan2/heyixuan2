import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const readme = readFileSync(`${root}README.md`, 'utf8');
assert.ok(!/<(?:script|style|iframe)\b|\bonclick=|\bstyle=/i.test(readme));
for (const match of readme.matchAll(/(?:src|srcset)="(\.\/assets\/[^\"]+)"/g)) {
  assert.ok(existsSync(`${root}${match[1]}`), match[1]);
}
const hero = readme.split('</picture>')[0];
assert.ok(hero.includes('(prefers-reduced-motion: reduce)'));
const results = [];
for (const theme of ['light', 'dark']) {
  const file = `${root}assets/field-notes-hero-${theme}.gif`;
  assert.ok(hero.includes(`field-notes-hero-${theme}.gif`));
  assert.ok(hero.includes(`field-notes-hero-${theme}.jpg`));
  assert.ok(statSync(file).size < 2_000_000, `${theme}: asset too heavy`);
  const info = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries',
    'format=duration,size:stream=width,height,nb_frames', '-of', 'json', file]));
  assert.equal(info.streams[0].width, 1586);
  assert.equal(info.streams[0].height, 992);
  assert.equal(Number(info.streams[0].nb_frames), 120);
  assert.equal(Number(info.format.duration), 8);
  const frames = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-vf',
    'select=eq(n\\,0)+eq(n\\,21)+eq(n\\,119)', '-fps_mode', 'passthrough',
    '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], {maxBuffer: 20_000_000});
  const frameBytes = 1586 * 992 * 3;
  assert.equal(frames.length, frameBytes * 3);
  const first = frames.subarray(0, frameBytes);
  const moving = frames.subarray(frameBytes, frameBytes * 2);
  const last = frames.subarray(frameBytes * 2);
  // GIF's rectangle-local palette dithering can change quantized pixels even
  // when the photographic pose is identical. Bound the average channel error
  // to less than one 8-bit level; still require unchanged headline pixels during motion.
  let finalError = 0;
  for (let i = 0; i < frameBytes; i++) finalError += Math.abs(first[i] - last[i]);
  const finalMeanAbsoluteChannelDifference = finalError / frameBytes;
  assert.ok(finalMeanAbsoluteChannelDifference < 0.75,
    `${theme}: final hold exceeds GIF palette tolerance`);
  assert.ok(!first.equals(moving), `${theme}: frozen animation`);
  // The source lettering on the left must remain unchanged during motion.
  for (let y = 0; y < 992; y++) {
    const start = y * 1586 * 3;
    assert.ok(first.subarray(start, start + 880 * 3).equals(moving.subarray(start, start + 880 * 3)),
      `${theme}: motion changed the headline area`);
  }
  results.push({theme, bytes: statSync(file).size, duration: 8, frames: 120,
    motionPresent: true, finalMeanAbsoluteChannelDifference, headlineUnchanged: true});
}
console.log(JSON.stringify({result: 'PASS', results}, null, 2));
