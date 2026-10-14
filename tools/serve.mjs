import http from 'node:http';
import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const allowed=new Set(['index.html','styles.css','app.mjs','data.mjs','annotations.mjs','favicon.svg','demo.epub','vendor/epub.min.js','vendor/jszip.min.js','vendor/epub-LICENSE.txt','vendor/jszip-LICENSE.txt','features.css','study-core.mjs','highlight-tools.mjs','reader-features.mjs','studiekort-widget.js','assets/airways.svg','assets/chest-xray.jpg','assets/hand-eczema.jpg']);
const mime={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',mjs:'text/javascript; charset=utf-8',js:'text/javascript; charset=utf-8',epub:'application/epub+zip',txt:'text/plain; charset=utf-8',svg:'image/svg+xml',jpg:'image/jpeg'};
const server=http.createServer(async(req,res)=>{
  const pathname=new URL(req.url,'http://127.0.0.1').pathname;
  const name=pathname==='/'?'index.html':pathname.slice(1);
  if(!allowed.has(name)){res.writeHead(404);res.end('Not found');return;}
  try{const content=await readFile(new URL(name,root));res.writeHead(200,{'Content-Type':mime[name.split('.').at(-1)],'Cache-Control':'no-store'});res.end(content);}
  catch{res.writeHead(500);res.end('Preview unavailable');}
});
server.listen(8766,'127.0.0.1',()=>process.stdout.write('http://127.0.0.1:8766/\n'));
