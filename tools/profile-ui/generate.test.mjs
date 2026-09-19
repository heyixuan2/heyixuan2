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
  for(const c of controls.filter(c=>['portfolio','builds','linkedin','bambu','ashare'].includes(c.id))) assert.ok(md.includes(`./assets/ui/${['portfolio','builds','linkedin'].includes(c.id)?'nav-':''}${c.id}-light.svg`),c.id);
  assert.equal((md.match(/<details(?:\s[^>]*)?>/g)||[]).length,0);
  assert.equal((md.match(/<summary>/g)||[]).length,0);
});

test('enterprise delivery principles are inline without a disclosure card', () => {
  const md=readFileSync(new URL('../../README.md',import.meta.url),'utf8');
  const section=md.split('## Enterprise AI, Built End to End.')[1].split('## Selected Public Builds')[0];
  assert.ok(!/<details|<summary|From Discovery to Delivery|assets\/ui\/discovery-/.test(section));
  for(const label of ['Problem Framing.','Rapid Delivery.','End-to-End Engineering.','Enterprise Judgment.']) {
    assert.ok(section.includes(`**${label}**`));
  }
  assert.ok(section.includes('The implementation stays private.'));
});

test('project descriptions are always visible and linked title cards match artwork width', () => {
  const md=readFileSync(new URL('../../README.md',import.meta.url),'utf8');
  const table=md.match(/<table>[\s\S]*?<\/table>/)[0];
  assert.ok(!/<details|<summary|Engineering Notes|Explore Project/.test(table));
  assert.ok(table.includes('<strong>From an Idea to a Physical Object.</strong>'));
  assert.ok(table.includes('<strong>Finding Signal in Financial Time Series.</strong>'));
  assert.equal((table.match(/<img[^>]*width="100%"/g)||[]).length,4);
  assert.ok(!/<img[^>]*height=/.test(table));
  for(const [repo,label] of [['bambu-studio-ai','Bambu Studio AI'],['ashare-neural-network','A-Share Neural Network']]) {
    assert.ok(table.includes(`<h3><a href="https://github.com/heyixuan2/${repo}">`));
    assert.ok(table.includes(`alt="${label}" width="100%"`));
  }
});

test('background credentials remain without the deferred personal sections', () => {
  const md=readFileSync(new URL('../../README.md',import.meta.url),'utf8');
  assert.ok(md.includes('**Mercedes-Benz · Georgetown DSAN · Cornell M.Eng.**'));
  assert.ok(!/About the Builder|How I Work|Open the Toolbox|Beyond the Demo/.test(md));
  assert.ok(!/assets\/ui\/(?:about|principles|toolbox)-/.test(md));
  const afterCredentials=md.slice(md.indexOf('**Mercedes-Benz · Georgetown DSAN · Cornell M.Eng.**'));
  assert.match(afterCredentials,/^\*\*Mercedes-Benz · Georgetown DSAN · Cornell M\.Eng\.\*\*<br>\nSystems thinking, from the model to the last mile\.\n\n## Building, One Day at a Time\./);
});

test('footer closes with artwork without repeating primary links', () => {
  const md=readFileSync(new URL('../../README.md',import.meta.url),'utf8');
  assert.equal((md.match(/alt="Portfolio"/g)||[]).length,1);
  assert.equal((md.match(/alt="LinkedIn"/g)||[]).length,1);
  assert.match(md, /<picture>\s*<source[^>]*field-notes-footer-dark\.jpg[\s\S]*?alt="Make complexity legible\."[^>]*>\s*<\/picture>\s*$/);
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
