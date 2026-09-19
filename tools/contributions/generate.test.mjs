import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { parseCalendar, renderCalendar } from './generate.mjs';

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
    assert.ok(!/<script|<foreignObject|href=/.test(svg));
    assert.ok(!renderCalendar(data, theme, mobile, false).includes('@keyframes'));
  }
});
