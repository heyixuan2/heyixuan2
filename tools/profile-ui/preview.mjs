import http from 'node:http';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../../',import.meta.url));
const md=readFileSync(path.join(root,'README.md'),'utf8');
const rendered=execFileSync('gh',['api','markdown','--input','-'],{
  input:JSON.stringify({text:md,mode:'gfm',context:'heyixuan2/heyixuan2'}),encoding:'utf8',maxBuffer:8*1024*1024
});
const css=`
*{box-sizing:border-box}html{--bg:#fff;--ink:#1f2328;--muted:#656d76;--line:#d1d9e0;--subtle:#f6f8fa;--link:#0969da;color-scheme:light}
html[data-theme=dark]{--bg:#0d1117;--ink:#e6edf3;--muted:#9198a1;--line:#3d444d;--subtle:#151b23;--link:#4493f8;color-scheme:dark}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.preview-tools{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;padding:12px 24px;background:var(--subtle);border-bottom:1px solid var(--line);font-size:12px}.preview-tools nav{display:flex;gap:18px}.preview-tools a{color:var(--link)}
.readme{margin:28px auto;max-width:940px;padding:24px;border:1px solid var(--line);border-radius:6px}.file-label{font:12px ui-monospace,monospace;margin-bottom:20px}.markdown-body{overflow-wrap:break-word}
.markdown-body>:first-child{margin-top:0}.markdown-body img{max-width:100%;height:auto;box-sizing:content-box;background-color:transparent;vertical-align:middle}.markdown-body h2{font-size:24px;line-height:1.25;margin:24px 0 16px;padding-bottom:.3em;border-bottom:1px solid var(--line)}.markdown-body h3{font-size:20px;line-height:1.25;margin:20px 0 12px}.markdown-body p{margin-top:0;margin-bottom:16px}.markdown-body a{color:var(--link);text-decoration:none}.markdown-body a:hover{text-decoration:underline}.markdown-body a:focus-visible,.markdown-body summary:focus-visible{outline:2px solid var(--link);outline-offset:3px}
.markdown-body table{border-spacing:0;border-collapse:collapse;display:block;width:max-content;max-width:100%;overflow:auto;margin-bottom:16px}.markdown-body td,.markdown-body th{padding:6px 13px;border:1px solid var(--line)}.markdown-body td{vertical-align:top}.markdown-body tr:nth-child(2n){background:var(--subtle)}.markdown-body summary{display:list-item;cursor:pointer;margin:8px 0}.markdown-body details{margin-bottom:8px}.markdown-body details[open]>summary{margin-bottom:16px}.markdown-body li{margin-top:6px}.markdown-body sub{font-size:12px;color:var(--muted)}.markdown-body code{background:var(--subtle);padding:2px 5px;border-radius:4px}.markdown-body .anchor{display:none}
body.narrow .readme{max-width:390px;padding:16px}body.narrow .preview-tools{max-width:390px;margin:auto} @media(max-width:760px){.readme{margin:12px;padding:16px}.preview-tools{padding:12px}}
`;

http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1:4324');
  if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
  if(url.pathname.startsWith('/assets/')){
    if(!/^\/assets\/(?:ui\/)?[a-z0-9-]+\.(?:svg|jpg|gif|png)$/.test(url.pathname)){res.writeHead(400);res.end();return;}
    try{
      let data=readFileSync(path.join(root,url.pathname));
      const ext=path.extname(url.pathname);
      // Preview-only accessibility switch. Production uses the real OS preference.
      if(ext==='.svg' && url.searchParams.get('motion')==='reduce')data=Buffer.from(data.toString().replaceAll('prefers-reduced-motion:no-preference','max-width:0px'));
      res.setHeader('Content-Type',({'.svg':'image/svg+xml','.jpg':'image/jpeg','.gif':'image/gif','.png':'image/png'})[ext]);
      res.setHeader('Cache-Control','no-store');res.end(data);
    }catch{res.writeHead(404);res.end('Asset not found');}return;
  }
  const theme=url.searchParams.get('theme')==='dark'?'dark':'light';
  const narrow=url.searchParams.get('narrow')==='1';
  const reduce=url.searchParams.get('motion')==='reduce';
  let body=rendered.replaceAll('"./assets/','"/assets/');
  // GitHub adds this heading anchor after its Markdown API stage.
  body=body.replace(/<h2([^>]*)>Selected Public Builds<\/h2>/,'<h2$1 id="selected-public-builds">Selected Public Builds</h2>');
  body=body.replaceAll('(prefers-color-scheme: '+theme+')','(min-width: 0px)').replaceAll('(prefers-color-scheme: '+(theme==='dark'?'light':'dark')+')','(max-width: 0px)');
  if(reduce){
    body=body.replaceAll('(prefers-reduced-motion: reduce)','(min-width: 0px)').replace(/(\/assets\/ui\/[^" ]+\.svg)/g,'$1?motion=reduce');
  }
  if(narrow)body=body.replaceAll('(max-width: 1100px)','(min-width: 0px)').replaceAll('(orientation: portrait)','(min-width: 0px)');
  const qs=`&narrow=${narrow?1:0}&motion=${reduce?'reduce':'full'}`;
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.end(`<!doctype html><html lang="en" data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Yixuan He — Animated Profile UI Preview</title><style>${css}</style></head><body class="${narrow?'narrow':''}"><header class="preview-tools"><span>Local Preview · GitHub-Sanitized Markdown · Not Published</span><nav><a href="/?theme=${theme==='dark'?'light':'dark'}${qs}">Switch Theme</a><a href="/?theme=${theme}&narrow=${narrow?0:1}&motion=${reduce?'reduce':'full'}">${narrow?'Desktop':'Mobile'} Width</a><a href="/?theme=${theme}&narrow=${narrow?1:0}&motion=${reduce?'full':'reduce'}">${reduce?'Play Motion':'Reduce Motion'}</a></nav></header><main class="readme"><div class="file-label">heyixuan2 / README.md</div><article class="markdown-body">${body}</article></main></body></html>`);
}).listen(4324,'127.0.0.1',()=>console.log('Profile preview: http://127.0.0.1:4324/?theme=light'));
