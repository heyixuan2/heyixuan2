import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { readFileSync } from 'node:fs';
import { parseCalendar, renderCalendar, calendarLayout, GLASS_HEIGHTS } from './generate.mjs';

const days = Array.from({ length: 371 }, (_, i) => ({ date: new Date(Date.UTC(2025, 8, 14) + i * 86400000).toISOString().slice(0, 10), count: i % 5, level: i % 5, weekday: i % 7 }));
const html = days.map((d, i) => `<td data-date="${d.date}" data-level="${d.level}" id="d${i}"></td><tool-tip for="d${i}">${d.count || 'No'} contributions on date.</tool-tip>`).join('');

test('public calendar counts, dates, and zero days are preserved', () => {
  const data = parseCalendar(html);
  assert.equal(data.total, days.reduce((s, d) => s + d.count, 0));
  assert.deepEqual(data.days, days);
});
test('fail closed on changed markup, duplicate dates, and incomplete data', () => {
  assert.throws(() => parseCalendar('<html>rate limited</html>'));
  assert.throws(() => parseCalendar(html.replace('No contributions', 'unrecognized')));
  assert.throws(() => parseCalendar(html.replace(days[1].date, days[0].date)));
});
test('every theme and layout preserves every daily mark, accessibility, and no external resources', () => {
  const data = { ...parseCalendar(html), updated: '2026-09-19T00:00:00Z' };
  for (const theme of ['light', 'dark']) for (const mobile of [false, true]) {
    const svg = renderCalendar(data, theme, mobile);
    const { document } = parseHTML(svg);
    assert.equal(document.querySelectorAll('[data-date]').length, days.length);
    assert.equal([...document.querySelectorAll('[data-count]')].reduce((s, el) => s + Number(el.getAttribute('data-count')), 0), data.total);
    assert.ok(svg.includes('prefers-reduced-motion:no-preference'));
    assert.ok(svg.includes('aria-labelledby="title desc"'));
    assert.ok(!/<script|<foreignObject|href="(?!#)/.test(svg));
    for (const reference of document.querySelectorAll('use[href]')) {
      assert.ok(document.querySelector(reference.getAttribute('href')), 'local fragment exists');
    }
    assert.ok(!renderCalendar(data, theme, mobile, false).includes('@keyframes'));
  }
});

test('glass geometry preserves exact dates and ordinal levels across responsive layouts', () => {
  const data = { ...parseCalendar(html), updated: '2026-09-19T00:00:00Z' };
  assert.ok(GLASS_HEIGHTS.every((height, i) => height > 0 && (!i || height > GLASS_HEIGHTS[i - 1])));
  for (const mobile of [false, true]) {
    const layout = calendarLayout(data, mobile);
    assert.equal(layout.panels.length, mobile ? 2 : 1);
    const marks = layout.panels.flatMap(panel => panel.marks);
    assert.equal(new Set(marks.map(mark => mark.date)).size, days.length);
    assert.deepEqual(marks.map(mark => mark.date).sort(), days.map(day => day.date));
    for (const panel of layout.panels) {
      assert.ok(panel.stepY < 0, 'calendar recedes toward upper right');
      for (const [i, mark] of panel.marks.entries()) {
        if (i) assert.ok(mark.y >= panel.marks[i - 1].y, 'back-to-front paint order');
        assert.equal(mark.geometry.top.length, 4, 'rectangular prism, never a cylinder');
        for (const point of [...mark.geometry.base, ...mark.geometry.top]) {
          assert.ok(Number.isFinite(point[0]) && Number.isFinite(point[1]));
          assert.ok(mark.x + point[0] >= 0 && mark.x + point[0] < layout.width);
          assert.ok(mark.y + point[1] > 125 && mark.y + point[1] < layout.height - 85);
        }
      }
    }
    const svg = renderCalendar(data, 'light', mobile);
    const { document } = parseHTML(svg);
    for (const day of days) {
      const mark = document.querySelector(`[data-date="${day.date}"]`);
      assert.equal(Number(mark.getAttribute('data-level')), day.level);
      assert.equal(Number(mark.getAttribute('data-count')), day.count);
      assert.ok(mark.querySelector('title').textContent.includes(`${day.count} contributions`));
    }
    assert.ok(svg.includes('not a linear count scale'));
    assert.ok(svg.includes('zero-contribution days'));
    assert.ok(!svg.includes('Tint + Height = Activity Level'));
    assert.ok(!/NaN|Infinity|<image|<circle|<ellipse/.test(svg));
    assert.ok(Buffer.byteLength(svg) < 220000, 'shared glass fragments keep the SVG lightweight');
  }
});

test('zero activity, outliers, and 54-week calendars remain finite and truthful', () => {
  for (const length of [350, 371, 378]) {
    for (const peak of [0, 1000000]) {
      const edgeDays = Array.from({ length }, (_, i) => ({
        date: new Date(Date.UTC(2025, 8, 14) + i * 86400000).toISOString().slice(0, 10),
        count: i === length - 1 ? peak : 0, level: i === length - 1 && peak ? 4 : 0, weekday: i % 7
      }));
      const data = { from: edgeDays[0].date, to: edgeDays.at(-1).date, days: edgeDays, total: peak, updated: '2026-09-19T00:00:00Z' };
      for (const mobile of [false, true]) {
        const svg = renderCalendar(data, 'dark', mobile, false);
        const { document } = parseHTML(svg);
        assert.equal(document.querySelectorAll('[data-date]').length, length);
        assert.equal([...document.querySelectorAll('[data-count]')].reduce((sum, node) => sum + Number(node.getAttribute('data-count')), 0), peak);
        assert.ok(!/NaN|Infinity|@keyframes/.test(svg));
      }
    }
  }
});

test('checked-in artwork is reproducible from the public data snapshot', () => {
  const data = JSON.parse(readFileSync(new URL('../../assets/contributions.json', import.meta.url), 'utf8'));
  assert.equal(data.total, data.days.reduce((sum, day) => sum + day.count, 0));
  for (const theme of ['light', 'dark']) for (const mobile of [false, true]) for (const animated of [false, true]) {
    const name = `contributions-${theme}${mobile ? '-mobile' : ''}${animated ? '' : '-static'}.svg`;
    assert.equal(readFileSync(new URL(`../../assets/${name}`, import.meta.url), 'utf8'), renderCalendar(data, theme, mobile, animated));
  }
});

test('README selects responsive themes and reduced-motion files without auxiliary controls', () => {
  const md = readFileSync(new URL('../../README.md', import.meta.url), 'utf8');
  const chart = md.split('## Building, One Day at a Time.')[1].split('<br>')[0];
  for (const theme of ['light', 'dark']) for (const mobile of [false, true]) for (const animated of [false, true]) {
    assert.ok(chart.includes(`contributions-${theme}${mobile ? '-mobile' : ''}${animated ? '' : '-static'}.svg`));
  }
  assert.ok(!chart.includes('One glass column per day.'));
  assert.ok(!chart.includes('<sub>'));
  assert.equal((chart.match(/orientation: portrait/g) || []).length, 4, 'landscape uses the wide calendar');
  assert.ok(!/weekly totals|Daily squares|<details|<summary/.test(chart));
});
