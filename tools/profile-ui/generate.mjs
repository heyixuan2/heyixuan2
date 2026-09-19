import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Self-contained SVG images: no scripts, remote fonts, tracking, or services.
// The enclosing README anchors and summaries own all actual interaction.
export const controls = [
  { id: 'portfolio', label: 'Portfolio', note: 'Selected Work', icon: 'orbit', width: 232, height: 76, primary: true },
  { id: 'builds', label: 'Explore the Builds', note: 'Ideas Made Real', icon: 'layers', width: 264, height: 76, primary: true, down: true },
  { id: 'linkedin', label: 'LinkedIn', note: 'Let’s Connect', icon: 'linkedin', width: 232, height: 76, primary: true },
  { id: 'bambu', label: 'Bambu Studio AI', note: '01 / Physical Intelligence', icon: 'cube', width: 380, height: 88, project: true },
  { id: 'ashare', label: 'A-Share Neural Network', note: '02 / Finding Signal', icon: 'signal', width: 380, height: 88, project: true },
  { id: 'project', label: 'Explore Project', icon: 'arrow', width: 216, height: 48 },
  { id: 'discovery', label: 'From Discovery to Delivery', icon: 'route', width: 300, height: 54, disclosure: true },
  { id: 'notes', label: 'Engineering Notes', icon: 'notes', width: 280, height: 48, disclosure: true },
  { id: 'about', label: 'About the Builder', icon: 'person', width: 300, height: 54, disclosure: true },
  { id: 'principles', label: 'How I Work', icon: 'route', width: 300, height: 54, disclosure: true },
  { id: 'toolbox', label: 'Open the Toolbox', icon: 'toolbox', width: 300, height: 54, disclosure: true },
];

const themes = {
  light: { bg: '#f5f2ea', ink: '#171717', muted: '#696157', line: '#dbd5ca', accent: '#ef5a24', soft: '#eadbcd', wash: '#fffaf2' },
  dark: { bg: '#191a1b', ink: '#f3efe6', muted: '#bcb3a7', line: '#41403c', accent: '#ff7b43', soft: '#463327', wash: '#332820' },
};
const esc = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

function icon(kind, p) {
  const mark = `fill="none" stroke="${p.accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"`;
  const frame = inner => `<g ${mark}>${inner}</g>`;
  switch (kind) {
    case 'linkedin': return `<rect x="1" y="1" width="26" height="26" rx="2" fill="${p.ink}"/><g fill="${p.bg}"><circle cx="7.4" cy="8" r="1.8"/><path d="M5.9 11h3v10h-3zm5.5 0h2.9v1.4c.7-1.1 1.7-1.7 3.2-1.7 2.9 0 3.7 1.7 3.7 4.4V21h-3v-5.2c0-1.3-.1-2.5-1.7-2.5s-2.1 1.2-2.1 2.4V21h-3z"/></g><path class="trace" d="M1 1h26v26H1z" ${mark}/>`;
    case 'orbit': return frame('<circle cx="14" cy="14" r="10"/><path d="M4 14h20M14 4c-6 7-6 13 0 20M14 4c6 7 6 13 0 20" opacity=".45"/><g class="orbit"><circle cx="14" cy="4" r="2.4" fill="'+p.accent+'" stroke="none"/></g>');
    case 'layers': return frame('<path d="M3 9l11-6 11 6-11 6z"/><path class="layer-one" d="M3 14l11 6 11-6"/><path class="layer-two" d="M3 19l11 6 11-6"/>');
    case 'cube': return frame('<path d="M14 2l11 6v13l-11 6-11-6V8zM3 8l11 6 11-6M14 14v13"/><path class="trace" d="M3 8l11-6 11 6v13l-11 6" stroke-width="3"/>');
    case 'signal': return frame('<path d="M2 25h25M3 2v23" opacity=".4"/><path class="trace" d="M4 21l5-6 4 3 5-11 4 4 4-8"/><circle class="beacon" cx="26" cy="3" r="2.5" fill="'+p.accent+'" stroke="none"/>');
    case 'route': return frame('<path d="M4 21h8V7h12" opacity=".4"/><path class="trace" d="M4 21h8V7h12"/><circle cx="4" cy="21" r="2.5" fill="'+p.bg+'"/><circle class="beacon" cx="24" cy="7" r="2.5" fill="'+p.accent+'"/>');
    case 'notes': return frame('<path d="M6 3h13l4 4v19H6zM18 3v6h5"/><path class="trace" d="M10 13h9M10 17h9M10 21h6"/>');
    case 'person': return frame('<circle cx="14" cy="9" r="4.5"/><path d="M5 26v-4c0-7 18-7 18 0v4"/><path class="trace" d="M2 6V2h5M21 2h5v5M26 22v4h-5M7 26H2v-5"/>');
    case 'toolbox': return frame('<path d="M4 10h20v15H4zM9 10V5h10v5M4 16h20"/><path class="trace" d="M4 10h20v15H4z"/><path d="M11 14v5h6v-5" fill="'+p.bg+'"/>');
    default: return frame('<g class="arrow"><path d="M4 21L23 3M11 3h12v12"/></g>');
  }
}

export function renderControl(c, theme) {
  const p = themes[theme];
  if (!p || !c) throw new Error('Unknown control or theme');
  const { width: w, height: h } = c;
  const ix = c.project ? w - 48 : 18;
  const iy = c.project ? 31 : (h - 28) / 2;
  const labelX = c.project ? 18 : c.icon === 'arrow' ? 55 : 59;
  const labelY = c.primary ? 46 : c.project ? 59 : h / 2 + 6;
  const size = c.project ? (c.id === 'ashare' ? 23 : 25) : c.primary ? 19 : c.id === 'discovery' ? 15.5 : 17;
  const arrow = c.disclosure ? '' : `<g transform="translate(${w - 29} ${c.primary ? 39 : 25})"><g class="${c.down ? 'down' : 'arrow'}" fill="none" stroke="${p.ink}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${c.down ? 'M0-5v12m-5-5 5 5 5-5' : 'M-5 5L5-5M-3-5h8v8'}"/></g></g>`;
  // All titles remain present even if animation or CSS is disabled.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
<title id="title">${esc(c.label)}</title><desc id="desc">${c.disclosure ? 'Expand this section.' : 'Open '+esc(c.label)+'.'} Orange editorial linework animates; text remains still. Motion follows your system preference.</desc>
<defs><clipPath id="frame"><rect x=".5" y=".5" width="${w-1}" height="${h-1}" rx="2"/></clipPath><linearGradient id="wash"><stop stop-color="${p.wash}" stop-opacity="0"/><stop offset=".5" stop-color="${p.wash}" stop-opacity=".7"/><stop offset="1" stop-color="${p.wash}" stop-opacity="0"/></linearGradient></defs>
<style>
text{font-family:Arial,Helvetica,sans-serif;fill:${p.ink}}.label{font-weight:900;letter-spacing:-.65px}.note{font-family:Menlo,Consolas,monospace;fill:${p.muted};letter-spacing:.65px;font-size:8.5px}.orbit{transform-origin:14px 14px}.travel{transform:translateX(-${w+80}px)}
@media(prefers-reduced-motion:no-preference){
.travel{animation:travel 5.6s cubic-bezier(.4,0,.2,1) infinite}.arrow{animation:arrow 4.8s ease-in-out infinite}.down{animation:down 4.8s ease-in-out infinite}.orbit{animation:orbit 9s linear infinite}.trace{stroke-dasharray:90;animation:trace 5.6s ease-in-out infinite}.beacon{animation:beacon 4.2s ease-in-out infinite}.layer-one{animation:layer1 5s ease-in-out infinite}.layer-two{animation:layer2 5s ease-in-out infinite}
}
@keyframes travel{0%,12%{transform:translateX(-${w+80}px)}65%,100%{transform:translateX(${w+80}px)}}
@keyframes arrow{0%,40%,100%{transform:translate(0,0)}54%{transform:translate(3px,-3px)}68%{transform:translate(0,0)}}
@keyframes down{0%,40%,100%{transform:translateY(0)}54%{transform:translateY(4px)}68%{transform:translateY(0)}}
@keyframes orbit{to{transform:rotate(360deg)}}
@keyframes trace{0%,12%,100%{stroke-dashoffset:0;opacity:1}40%{stroke-dashoffset:90;opacity:.3}75%{stroke-dashoffset:0;opacity:1}}
@keyframes beacon{0%,30%,100%{opacity:1}50%{opacity:.35}70%{opacity:1}}
@keyframes layer1{0%,20%,80%,100%{transform:translateY(0)}45%{transform:translateY(-3px)}}
@keyframes layer2{0%,30%,90%,100%{transform:translateY(0)}55%{transform:translateY(-4px)}}
</style>
<g clip-path="url(#frame)"><rect width="${w}" height="${h}" fill="${p.bg}"/><rect class="travel" x="${w/2-50}" width="100" height="${h}" fill="url(#wash)"/><path d="M18 ${h-4}H${w-18}" stroke="${p.line}"/><path d="M18 ${h-4}h${c.project ? 44 : 26}" stroke="${p.accent}" stroke-width="2"/><path class="travel" d="M${w/2-44} ${h-4}h88" stroke="${p.accent}" stroke-width="2"/>
${c.note ? `<text class="note" x="${labelX}" y="${c.project ? 24 : 26}">${esc(c.note)}</text>` : ''}
<text class="label" x="${labelX}" y="${labelY}" font-size="${size}">${esc(c.label)}</text>
<g transform="translate(${ix} ${iy})">${icon(c.icon,p)}</g>
${c.project ? '' : arrow}
</g><rect x=".5" y=".5" width="${w-1}" height="${h-1}" rx="2" fill="none" stroke="${p.line}"/>
</svg>\n`;
}

export function renderCompact(id, theme) {
  const c=controls.find(c=>c.id===id);
  const p=themes[theme];
  const notes=id==='notes';
  const h=notes?52:96;
  const lines=id==='bambu'?['Bambu','Studio AI']:['A-Share','Neural Network'];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="${h}" viewBox="0 0 180 ${h}" role="img" aria-labelledby="title"><title id="title">${c.label}</title>
<style>text{font-family:Arial,Helvetica,sans-serif;font-weight:900;fill:${p.ink};letter-spacing:-.5px}.trace{stroke-dasharray:90}@media(prefers-reduced-motion:no-preference){.trace{animation:trace 5.6s ease-in-out infinite}.rule{animation:rule 5.6s ease-in-out infinite}}@keyframes trace{0%,100%{stroke-dashoffset:0}40%{stroke-dashoffset:90}75%{stroke-dashoffset:0}}@keyframes rule{0%,100%{transform:translateX(0)}50%{transform:translateX(108px)}}</style>
<rect x=".5" y=".5" width="179" height="${h-1}" rx="2" fill="${p.bg}" stroke="${p.line}"/>
${notes?`<g transform="translate(12 11)">${icon('notes',p)}</g><text x="50" y="33" font-size="25">Notes</text>`:`<text x="12" y="21" font-size="9" style="font-family:Menlo,Consolas,monospace;font-weight:400;fill:${p.muted};letter-spacing:1px">${id==='bambu'?'01 / Build':'02 / Research'}</text><text x="12" y="48" font-size="25">${lines[0]}</text><text x="12" y="74" font-size="${id==='ashare'?21:25}">${lines[1]}</text>`}
<path d="M12 ${h-4}h156" stroke="${p.line}"/><path class="rule" d="M12 ${h-4}h36" stroke="${p.accent}" stroke-width="2"/>
</svg>\n`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const out = fileURLToPath(new URL('../../assets/ui/', import.meta.url));
  await mkdir(out, { recursive: true });
  for (const c of controls) for (const theme of Object.keys(themes)) {
    await writeFile(path.join(out, `${c.id}-${theme}.svg`), renderControl(c, theme));
  }
  for (const id of ['bambu','ashare','notes']) for (const theme of Object.keys(themes)) {
    await writeFile(path.join(out, `${id}-${theme}-mobile.svg`), renderCompact(id, theme));
  }
  console.log(`Generated ${controls.length * 2 + 6} self-contained SVG controls.`);
}
