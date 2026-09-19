import { parseHTML } from 'linkedom';
import { scaleLinear } from 'd3-scale';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const SOURCE = 'https://github.com/users/heyixuan2/contributions';
const DAY = 86400000;
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const integer = new Intl.NumberFormat('en-US');
const month = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
const dateLabel = value => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));

// Only unauthenticated, public calendar aggregates. No tokens or repository details.
export function parseCalendar(html) {
  const { document } = parseHTML(html);
  const tips = new Map([...document.querySelectorAll('tool-tip[for]')].map(el => [el.getAttribute('for'), el.textContent.trim()]));
  const days = [...document.querySelectorAll('td[data-date][data-level]')].map(el => {
    const date = el.getAttribute('data-date');
    const tip = tips.get(el.id);
    const countMatch = /^(No|[\d,]+) contributions? on /.exec(tip || '');
    const level = Number(el.getAttribute('data-level'));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !countMatch || !Number.isInteger(level) || level < 0 || level > 4) throw new Error('Public calendar format changed; keeping previous assets.');
    const count = countMatch[1] === 'No' ? 0 : Number(countMatch[1].replaceAll(',', ''));
    if (!Number.isSafeInteger(count) || count < 0 || ((count === 0) !== (level === 0))) throw new Error('Invalid contribution value.');
    return { date, count, level, weekday: new Date(date).getUTCDay() };
  }).sort((a, b) => a.date.localeCompare(b.date));
  if (days.length < 350 || days.length > 378 || new Set(days.map(d => d.date)).size !== days.length) throw new Error('Incomplete or duplicate calendar.');
  days.forEach((day, i) => {
    if (i && new Date(day.date) - new Date(days[i - 1].date) !== DAY) throw new Error('Calendar has gaps.');
  });
  const total = days.reduce((sum, day) => sum + day.count, 0);
  return { source: SOURCE, from: days[0].date, to: days.at(-1).date, total, days };
}

const themes = {
  light: { bg: '#f5f2ea', fg: '#171717', muted: '#615d56', rule: '#d4cfc5', accent: '#ae3d13', bar: '#d85925', colors: ['#dfdad0', '#efc2ad', '#e99266', '#d65c27', '#9f310c'] },
  dark: { bg: '#151719', fg: '#f3efe6', muted: '#b3afa6', rule: '#414345', accent: '#ff9460', bar: '#ff783e', colors: ['#35393b', '#69442f', '#a7552e', '#df783d', '#ffb57f'] }
};

export function renderCalendar(data, theme = 'light', mobile = false, animated = true) {
  const p = themes[theme];
  if (!p) throw new Error('Unknown theme');
  const first = new Date(data.from);
  const start = +first - first.getUTCDay() * DAY;
  const weeks = Array.from({ length: Math.floor((+new Date(data.to) - start) / DAY / 7) + 1 }, () => []);
  data.days.forEach(day => weeks[Math.floor((+new Date(day.date) - start) / DAY / 7)].push(day));
  const width = mobile ? 400 : 960;
  const height = mobile ? 626 : 376;
  const pad = mobile ? 26 : 32;
  const cell = mobile ? 9 : 12;
  const step = mobile ? 12 : 16;
  const font = mobile ? 15 : 13;
  const parts = [];
  const text = (x, y, value, attrs = '') => parts.push(`<text x="${x}" y="${y}" ${attrs}>${escape(value)}</text>`);
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">Yixuan He — ${integer.format(data.total)} contributions</title><desc id="desc">Publicly visible GitHub calendar, ${data.from} to ${data.to}. One square per day; orange intensity follows GitHub activity levels. Weekly bars show summed contributions. Activity is not a measure of impact. ${animated ? 'Weeks reveal chronologically once, then hold. Reduced motion shows the final state.' : 'Static edition.'}</desc>`);
  parts.push(`<style>text{font-family:Arial,Helvetica,sans-serif;fill:${p.fg};font-size:${font}px} .muted{fill:${p.muted}} .mono{font-family:Menlo,Consolas,monospace} .week{opacity:1}${animated ? '@media(prefers-reduced-motion:no-preference){.week{animation:reveal .7s ease-out both;animation-delay:var(--delay)}}@keyframes reveal{from{opacity:.18}to{opacity:1}}' : ''}</style><rect width="100%" height="100%" fill="${p.bg}"/>`);
  text(pad, 33, 'FIELD NOTES / ACTIVITY', `class="mono muted" font-size="${mobile ? 13 : 11}" letter-spacing="1.8"`);
  text(pad, mobile ? 80 : 80, 'A year in motion.', `style="font-size:${mobile ? 32 : 34}px;font-weight:700;letter-spacing:-1px"`);
  if (mobile) {
    text(pad, 125, integer.format(data.total), 'style="font-size:32px;font-weight:700;letter-spacing:-1px"');
    text(137, 124, 'contributions', 'class="muted"');
    text(pad, 153, `${dateLabel(data.from)} — ${dateLabel(data.to)}`, 'class="muted" style="font-size:14px"');
  } else {
    text(width - pad, 77, integer.format(data.total), 'text-anchor="end" style="font-size:38px;font-weight:700;letter-spacing:-1px"');
    text(width - pad, 99, 'contributions', 'text-anchor="end" class="muted"');
    text(pad, 105, `${dateLabel(data.from)} — ${dateLabel(data.to)}`, 'class="muted"');
  }
  parts.push(`<path d="M${pad} ${mobile ? 174 : 123}.5H${width - pad}" stroke="${p.rule}" stroke-width="1"/>`);
  const chunks = mobile ? [weeks.slice(0, 27), weeks.slice(27)] : [weeks];
  const maxWeek = Math.max(1, ...weeks.map(w => w.reduce((s, d) => s + d.count, 0)));
  const barHeight = scaleLinear().domain([0, maxWeek]).range([0, mobile ? 28 : 40]);
  chunks.forEach((chunk, chunkIndex) => {
    const y = mobile ? 208 + chunkIndex * 173 : 157;
    const x0 = mobile ? 52 : 72;
    [1, 3, 5].forEach(row => text(pad, y + row * step + cell - 2, ['S', 'M', 'T', 'W', 'T', 'F', 'S'][row], `class="muted mono" style="font-size:${mobile ? 14 : 11}px"`));
    let previousMonth;
    const firstMonth = chunk[0][0].date.slice(0, 7);
    const nextMonthIndex = chunk.findIndex(week => week[0].date.slice(0, 7) !== firstMonth);
    chunk.forEach((week, i) => {
      const globalIndex = (mobile ? chunkIndex * 27 : 0) + i;
      const x = x0 + i * step;
      const labelDate = new Date(week[0].date);
      const monthKey = labelDate.toISOString().slice(0, 7);
      const crowdedFirstLabel = mobile && i === 0 && nextMonthIndex > 0 && nextMonthIndex < 3;
      if (monthKey !== previousMonth && i <= chunk.length - 2 && !crowdedFirstLabel) {
        text(x, y - 12, month.format(labelDate), `class="muted" style="font-size:${mobile ? 14 : 11}px"`);
      }
      previousMonth = monthKey;
      parts.push(`<g class="week" style="--delay:${(globalIndex * 0.055).toFixed(3)}s">`);
      week.forEach(day => parts.push(`<rect x="${x}" y="${y + day.weekday * step}" width="${cell}" height="${cell}" rx="1" fill="${p.colors[day.level]}" data-date="${day.date}" data-count="${day.count}"><title>${day.date}: ${integer.format(day.count)} contributions</title></rect>`));
      const count = week.reduce((sum, d) => sum + d.count, 0);
      const h = barHeight(count);
      parts.push(`<rect x="${x}" y="${y + 7 * step + (mobile ? 32 : 46) - h}" width="${cell}" height="${h.toFixed(2)}" fill="${p.bar}" opacity=".82"><title>Week of ${new Date(start + globalIndex * 7 * DAY).toISOString().slice(0, 10)}: ${integer.format(count)} contributions</title></rect></g>`);
    });
  });
  const bottom = mobile ? 560 : 337;
  text(pad, bottom, 'WEEKLY TOTALS ↑', `class="mono muted" style="font-size:${mobile ? 14 : 11}px;letter-spacing:.6px"`);
  const legendX = mobile ? 250 : 751;
  text(legendX - 36, bottom, 'Less', `class="muted" style="font-size:${mobile ? 14 : 11}px"`);
  p.colors.forEach((color, i) => parts.push(`<rect x="${legendX + i * 15}" y="${bottom - 10}" width="11" height="11" rx="1" fill="${color}"/>`));
  text(legendX + 79, bottom, 'More', `class="muted" style="font-size:${mobile ? 14 : 11}px"`);
  text(pad, mobile ? 591 : 363, `GitHub public calendar · updated ${data.updated.slice(0, 10)}`, `class="muted" style="font-size:${mobile ? 14 : 11}px"`);
  parts.push('</svg>');
  return parts.join('\n');
}

export async function main() {
  const response = await fetch(SOURCE, { headers: { 'User-Agent': 'heyixuan2-profile-contribution-art/1.0', 'Accept': 'text/html' }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Public calendar HTTP ${response.status}; keeping previous assets.`);
  const data = { ...parseCalendar(await response.text()), updated: new Date().toISOString() };
  const root = fileURLToPath(new URL('../../', import.meta.url));
  // Build all outputs before writing any: failed fetch/validation never blanks the profile.
  const outputs = [];
  for (const theme of ['light', 'dark']) for (const mobile of [false, true]) {
    const name = `contributions-${theme}${mobile ? '-mobile' : ''}`;
    outputs.push([`assets/${name}.svg`, renderCalendar(data, theme, mobile)]);
    outputs.push([`assets/${name}-static.svg`, renderCalendar(data, theme, mobile, false)]);
  }
  outputs.push(['assets/contributions.json', JSON.stringify(data, null, 2) + '\n']);
  await mkdir(path.join(root, 'assets'), { recursive: true });
  for (const [name, body] of outputs) await writeFile(path.join(root, name), body);
  console.log(JSON.stringify({ result: 'PASS', source: SOURCE, total: data.total, days: data.days.length, from: data.from, to: data.to, assets: outputs.length }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
