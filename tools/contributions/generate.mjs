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
  light: { bg: '#f5f2ea', light: '#fffcf5', fg: '#171717', muted: '#615d56', rule: '#d4cfc5', edge: '#b3a48d', shadow: '#735433', colors: ['#b1a797', '#f2a16a', '#f68943', '#ee5b1b', '#d13e09'] },
  dark: { bg: '#151719', light: '#25282a', fg: '#f3efe6', muted: '#b9b4aa', rule: '#414345', edge: '#c3b7a3', shadow: '#000000', colors: ['#b5b7ad', '#ed9665', '#ff994f', '#ff8537', '#ffae67'] }
};

// These are ordinal activity levels, not a linear count axis. The clear zero-day
// plinth is only a calendar position; its small thickness does not imply activity.
export const GLASS_HEIGHTS = [5, 11, 17, 23, 29];
const n = value => Number(value.toFixed(2));
const polygon = points => points.map(point => point.map(n).join(',')).join(' ');
const moved = (point, dx, dy) => [point[0] + dx, point[1] + dy];

function glassDefinitions(p, dark) {
  const gradients = p.colors.map((color, level) => {
    const strength = level === 0 ? .45 : .54 + level * .1;
    return `<linearGradient id="front-${level}" x1="0" y1="0" x2="1" y2=".12">
<stop stop-color="${color}" stop-opacity="${strength}"/><stop offset=".1" stop-color="#fffaf0" stop-opacity="${dark ? .62 : .55}"/>
<stop offset=".2" stop-color="${color}" stop-opacity="${strength * .8}"/><stop offset=".55" stop-color="${color}" stop-opacity="${strength * .68}"/>
<stop offset=".83" stop-color="${color}" stop-opacity="${strength}"/><stop offset=".94" stop-color="#fff7e9" stop-opacity=".38"/><stop offset="1" stop-color="${color}" stop-opacity=".85"/>
</linearGradient><linearGradient id="side-${level}" x1="0" y1="0" x2="1" y2=".4">
<stop stop-color="${color}" stop-opacity="${strength * .52}"/><stop offset=".4" stop-color="${color}" stop-opacity="${strength * .86}"/><stop offset=".8" stop-color="#fff8e9" stop-opacity=".35"/><stop offset="1" stop-color="${color}" stop-opacity="${strength}"/>
</linearGradient><linearGradient id="top-${level}" x1="0" y1="0" x2=".7" y2="1">
<stop stop-color="#fffdf5" stop-opacity="${dark ? .6 : .7}"/><stop offset=".28" stop-color="${color}" stop-opacity="${strength * .4}"/><stop offset=".78" stop-color="${color}" stop-opacity="${strength * .77}"/><stop offset="1" stop-color="#fff8e9" stop-opacity=".6"/>
</linearGradient><linearGradient id="base-${level}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${color}" stop-opacity=".5"/><stop offset=".52" stop-color="#fff8e8" stop-opacity=".7"/><stop offset="1" stop-color="${color}" stop-opacity=".7"/></linearGradient>`;
  }).join('\n');
  return `<defs>${gradients}
<linearGradient id="ground-shadow" x1="0" y1="0" x2=".55" y2="1"><stop stop-color="${p.shadow}" stop-opacity="${dark ? .46 : .15}"/><stop offset="1" stop-color="${p.shadow}" stop-opacity="0"/></linearGradient>
<linearGradient id="paper-light" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${p.light}"/><stop offset="1" stop-color="${p.bg}"/></linearGradient>
<filter id="soft-shadow" x="-25%" y="-25%" width="175%" height="200%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="1.3"/></filter>
<filter id="paper-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="8" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
</defs>`;
}

function prismGeometry(ax, ay, bx, by, height) {
  const base = [[0, 0], [ax, ay], [ax + bx, ay + by], [bx, by]];
  return { base, top: base.map(point => moved(point, 0, -height)) };
}

function glassPrism(level, geometry, p, height) {
  const { base: b, top: t } = geometry;
  const bottomThickness = Math.min(height * .4, 2.4);
  const innerTop = t.map(point => {
    const center = [(t[0][0] + t[2][0]) / 2, (t[0][1] + t[2][1]) / 2];
    return [center[0] + (point[0] - center[0]) * .78, center[1] + (point[1] - center[1]) * .78];
  });
  return `<polygon points="${polygon(b)}" fill="${p.colors[level]}" opacity=".12"/>
<path d="M${polygon([t[0]])}L${polygon([b[0], b[1], b[2]])}M${polygon([b[1]])}L${polygon([t[1]])}" fill="none" stroke="${p.edge}" stroke-opacity=".22" stroke-width=".55"/>
<polygon points="${polygon([t[0], t[3], b[3], b[0]])}" fill="url(#side-${level})" stroke="${p.edge}" stroke-opacity=".43" stroke-width=".55"/>
<polygon points="${polygon([t[3], t[2], b[2], b[3]])}" fill="url(#front-${level})" stroke="${p.colors[level]}" stroke-opacity=".46" stroke-width=".6"/>
<polygon points="${polygon([moved(b[3], 0, -bottomThickness), moved(b[2], 0, -bottomThickness), b[2], b[3]])}" fill="url(#base-${level})"/>
<polygon points="${polygon(t)}" fill="url(#top-${level})" stroke="#fff9eb" stroke-opacity=".8" stroke-width=".65"/>
<polygon points="${polygon(innerTop)}" fill="none" stroke="${p.colors[level]}" stroke-opacity=".36" stroke-width=".48"/>
<path d="M${polygon([t[0]])}L${polygon([t[3], t[2]])}M${polygon([t[3]])}L${polygon([b[3]])}" fill="none" stroke="#fffdf5" stroke-opacity=".78" stroke-width=".65"/>
<path d="M${polygon([moved(t[3], .85, 1.5)])}L${polygon([moved(b[3], .85, -1.3)])}" stroke="#fffaf0" stroke-opacity=".54" stroke-width=".48"/>
<path d="M${polygon([b[0]])}L${polygon([b[3], b[2]])}" fill="none" stroke="#fff6e7" stroke-opacity=".7" stroke-width=".7"/>`;
}

export function calendarLayout(data, mobile = false) {
  const first = new Date(data.from);
  const start = +first - first.getUTCDay() * DAY;
  const count = Math.floor((+new Date(data.to) - start) / DAY / 7) + 1;
  const weeks = Array.from({ length: count }, () => []);
  data.days.forEach(day => weeks[Math.floor((+new Date(day.date) - start) / DAY / 7)].push(day));
  const chunks = mobile ? [weeks.slice(0, 27), weeks.slice(27)] : [weeks];
  const width = mobile ? 400 : 960;
  const height = mobile ? 760 : 520;
  const x0 = mobile ? 35 : 60;
  const dayStep = mobile ? [4.8, 14] : [7.7, 18];
  const stepX = (width - x0 - (mobile ? 22 : 36) - 6 * dayStep[0] - (mobile ? 12 : 16)) / (Math.max(...chunks.map(chunk => chunk.length)) - 1);
  const stepY = -stepX * .17;
  const heightScale = scaleLinear().domain([0, 29]).range([0, mobile ? 23 : 29]);
  const ax = stepX * .61;
  const ay = stepY * .61;
  const bx = mobile ? 4.1 : 5.6;
  const by = mobile ? 5.8 : 8.2;
  const panels = chunks.map((chunk, panelIndex) => {
    const top = mobile ? 213 + panelIndex * 221 : 151;
    const y0 = top + heightScale(29) - (chunk.length - 1) * stepY;
    const marks = chunk.flatMap((week, weekIndex) => week.map(day => {
      const h = heightScale(GLASS_HEIGHTS[day.level]);
      return { ...day, x: x0 + weekIndex * stepX + day.weekday * dayStep[0], y: y0 + weekIndex * stepY + day.weekday * dayStep[1], height: h, weekIndex: panelIndex * 27 + weekIndex, geometry: prismGeometry(ax, ay, bx, by, h) };
    })).sort((a, b) => a.y - b.y || a.x - b.x);
    return { chunk, top, x0, y0, stepX, stepY, dayStep, marks };
  });
  return { width, height, panels };
}

export function renderCalendar(data, theme = 'light', mobile = false, animated = true) {
  const p = themes[theme];
  if (!p) throw new Error('Unknown theme');
  const { width, height, panels } = calendarLayout(data, mobile);
  const pad = mobile ? 26 : 32;
  const font = mobile ? 15 : 13;
  const parts = [];
  const text = (x, y, value, attrs = '') => parts.push(`<text x="${x}" y="${y}" ${attrs}>${escape(value)}</text>`);
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">Yixuan He — ${integer.format(data.total)} contributions</title><desc id="desc">Publicly visible GitHub calendar, ${data.from} to ${data.to}. One glass cuboid per day. Orange tint and height both encode GitHub's five ordinal activity levels, not a linear count scale. Clear low plinths mark zero-contribution days. Exact daily counts remain in this SVG and the adjacent JSON data. Activity is not a measure of impact. ${animated ? 'Days reveal in chronological week order once, then hold. Reduced motion shows the final state.' : 'Static edition.'}</desc>`);
  parts.push(glassDefinitions(p, theme === 'dark'));
  // Reuse only local vector fragments: the same five materials need not be
  // serialized hundreds of times. No external images, fonts, or URLs are used.
  const base = panels[0].marks[0].geometry.base;
  parts.push('<defs>');
  GLASS_HEIGHTS.forEach((height, level) => {
    const h = height * (mobile ? 23 / 29 : 1);
    parts.push(`<g id="glass-day-${level}">${glassPrism(level, prismGeometry(...base[1], ...base[3], h), p, h)}</g>`);
    const legendHeight = 5 + level * 4;
    parts.push(`<g id="glass-key-${level}">${glassPrism(level, prismGeometry(12, -2, 6, 8, legendHeight), p, legendHeight)}</g>`);
  });
  parts.push('</defs>');
  parts.push(`<style>text{font-family:Arial,Helvetica,sans-serif;fill:${p.fg};font-size:${font}px} .muted{fill:${p.muted}} .mono{font-family:Menlo,Consolas,monospace} .day{opacity:1}${animated ? '@media(prefers-reduced-motion:no-preference){.day{animation:reveal .75s ease-out both;animation-delay:var(--delay)}}@keyframes reveal{from{opacity:.4}to{opacity:1}}' : ''}</style><rect width="100%" height="100%" fill="url(#paper-light)"/><rect width="100%" height="100%" filter="url(#paper-grain)" opacity=".025"/>`);
  text(pad, 33, 'FIELD NOTES / ACTIVITY', `class="mono muted" font-size="${mobile ? 13 : 11}" letter-spacing="1.8"`);
  text(pad, 80, 'A Year in Motion.', `style="font-size:${mobile ? 32 : 34}px;font-weight:700;letter-spacing:-1px"`);
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
  panels.forEach((panel, panelIndex) => {
    const { chunk, top, x0, y0, stepX, stepY, dayStep, marks } = panel;
    if (mobile) text(pad, top - 16, `${dateLabel(chunk[0][0].date)} — ${dateLabel(chunk.at(-1).at(-1).date)}`, 'class="muted" style="font-size:12.5px"');
    // All shadows sit on the common ground plane; then paint back-to-front.
    parts.push(`<g class="ground-shadows" filter="url(#soft-shadow)" aria-hidden="true">`);
    marks.forEach(mark => {
      const b = mark.geometry.base;
      const dx = 3 + mark.height * .52;
      const dy = 4 + mark.height * .66;
      parts.push(`<polygon transform="translate(${n(mark.x)} ${n(mark.y)})" points="${polygon([b[0], b[1], moved(b[1], dx, dy), moved(b[2], dx, dy), moved(b[3], dx, dy), b[3]])}" fill="url(#ground-shadow)"/>`);
    });
    parts.push('</g>');
    marks.forEach(mark => {
      parts.push(`<g class="day" transform="translate(${n(mark.x)} ${n(mark.y)})" style="--delay:${(mark.weekIndex * .055).toFixed(3)}s" data-date="${mark.date}" data-count="${mark.count}" data-level="${mark.level}" data-height="${n(mark.height)}"><title>${mark.date}: ${integer.format(mark.count)} contributions</title><use href="#glass-day-${mark.level}"/></g>`);
    });
    [1, 3, 5].forEach(row => text(n(x0 - 16 + row * dayStep[0]), n(y0 + row * dayStep[1] + 3), ['S', 'M', 'T', 'W', 'T', 'F', 'S'][row], `class="muted mono" text-anchor="end" style="font-size:${mobile ? 12.5 : 11}px"`));
    let previousMonth;
    let previousLabelX = -100;
    chunk.forEach((week, i) => {
      const labelDate = new Date(week[0].date);
      const monthKey = week[0].date.slice(0, 7);
      const x = x0 + i * stepX;
      if (monthKey !== previousMonth && x - previousLabelX >= 34 && i <= chunk.length - 2) {
        text(n(x), n(y0 + i * stepY - (mobile ? 29 : 37)), month.format(labelDate), `class="muted" style="font-size:${mobile ? 12.5 : 11}px"`);
        previousLabelX = x;
      }
      previousMonth = monthKey;
    });
  });
  const bottom = mobile ? 665 : 456;
  const legendX = mobile ? 112 : 727;
  text(legendX - 36, bottom, 'Less', 'class="muted" style="font-size:12px"');
  GLASS_HEIGHTS.forEach((_, i) => parts.push(`<use href="#glass-key-${i}" transform="translate(${legendX + i * 29} ${bottom - 7})" aria-hidden="true"/>`));
  text(legendX + 150, bottom, 'More', 'class="muted" style="font-size:12px"');
  parts.push(`<path d="M${pad} ${height - 48}.5H${width - pad}" stroke="${p.rule}" stroke-width=".75"/>`);
  text(pad, height - 24, `GitHub public calendar · updated ${data.updated.slice(0, 10)}`, `class="muted" style="font-size:${mobile ? 12.5 : 11}px"`);
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
