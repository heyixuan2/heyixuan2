import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { controls, renderControl, renderCompact, renderNavigation } from './generate.mjs';

test('all controls are accessible, self-contained, motion-aware SVGs', () => {
  assert.equal(new Set(controls.map(c=>c.id)).size, controls.length);
  for (const c of controls) for (const theme of ['light','dark']) {
    const svg=renderControl(c,theme);
    assert.ok(svg.includes(`<title id="title">${c.label}</title>`));
    assert.ok(svg.includes('prefers-reduced-motion:no-preference'));
    assert.ok(svg.includes('@keyframes'));
    assert.ok(!/<script|<foreignObject|href=|url\(https?:|@import/.test(svg));
    assert.ok(!/\.label\s*\{[^}]*animation/.test(svg));
    assert.ok(svg.includes(`viewBox="0 0 ${c.width} ${c.height}"`));
    assert.equal(readFileSync(new URL(`../../assets/ui/${c.id}-${theme}.svg`, import.meta.url),'utf8'),svg);
  }
});

test('compact project controls keep meaningful labels and theme parity', () => {
  for (const id of ['bambu','ashare','notes']) for (const theme of ['light','dark']) {
    const svg=renderCompact(id,theme);
    assert.ok(svg.includes(controls.find(c=>c.id===id).label));
    assert.ok(svg.includes('prefers-reduced-motion:no-preference'));
    assert.ok(!/<script|<foreignObject|href=|url\(https?:|@import/.test(svg));
    assert.equal(readFileSync(new URL(`../../assets/ui/${id}-${theme}-mobile.svg`,import.meta.url),'utf8'),svg);
  }
});

test('README removes auxiliary links and uses designed controls for every text CTA', () => {
  const md=readFileSync(new URL('../../README.md', import.meta.url),'utf8');
  assert.ok(!/Artwork editions|Prefer stillness|Change appearance|Static light|Static dark|\[View portfolio/.test(md));
  assert.ok(md.includes('## From Idea to MVP. Built for Enterprise Realities.'));
  assert.ok(md.includes('## Selected Public Builds'));
  assert.ok(md.includes('href="#selected-public-builds"'));
  for(const c of controls) assert.ok(md.includes(`./assets/ui/${c.id==='builds'?'nav-':''}${c.id}-light.svg`),c.id);
  assert.equal((md.match(/<details>/g)||[]).length,6);
  assert.equal((md.match(/<summary>/g)||[]).length,6);
});

test('primary navigation fills one row in three equal slots', () => {
  const md=readFileSync(new URL('../../README.md',import.meta.url),'utf8');
  const row=md.match(/<p>\n[\s\S]*?<\/p>/)[0];
  assert.equal((row.match(/width="33\.333333%"/g)||[]).length,3);
  assert.equal((row.replace(/<!--[\s\S]*?-->/g,'').match(/<\/a><a /g)||[]).length,2);
  for(const id of ['portfolio','builds','linkedin']) for(const theme of ['light','dark']) for(const compact of [false,true]){
    const svg=renderNavigation(id,theme,compact);
    assert.ok(svg.includes(`viewBox="0 0 ${compact?'180 108':'288 76'}"`));
    assert.ok(svg.includes('prefers-reduced-motion:no-preference'));
    assert.equal(readFileSync(new URL(`../../assets/ui/nav-${id}-${theme}${compact?'-mobile':''}.svg`,import.meta.url),'utf8'),svg);
  }
});
