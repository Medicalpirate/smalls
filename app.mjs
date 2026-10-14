import {book,paragraphIndex,figures} from './data.mjs?v=20261015-toggle2';
import {segmentsForText,cleanAnnotation,paragraphSelection} from './annotations.mjs?v=20261015-toggle2';

import {createHighlightTools} from './highlight-tools.mjs?v=20261015-toggle2';
import {createReaderFeatures,figureMarkup,clinicalMatches,imageSearchResults} from './reader-features.mjs?v=20261015-toggle2';
import {planReview,textCardDraft,normalizeMask} from './study-core.mjs?v=20261015-toggle2';

let highlightTools=null,readerFeatures=null,studyCards=null;
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const icon=name=>`<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const storageKey='laegereolen-prototype-v1';
const sampleText=paragraphIndex['asthma-overview-1'].text;
const sampleStart=sampleText.indexOf('kronisk betændelsestilstand');
const state={version:1,highlightColor:'yellow',mode:'clinical',chapterId:'asthma',sectionId:'asthma-overview',panel:null,theme:'paper',size:18,font:'default',width:'comfortable',focus:false,bookmarks:[],annotations:[{id:'demo-annotation',chapterId:'asthma',paragraphId:'asthma-overview-1',start:sampleStart,end:sampleStart+'kronisk betændelsestilstand'.length,quote:'kronisk betændelsestilstand',note:'Læs dette afsnit igen før undervisningen. Lav min egen oversigt over symptomerne.',createdAt:0}],selectedAnnotationId:'demo-annotation'};
let selectionSegments=[];
let selectedQuote='';
let searchScope='book';
let searchResults=[];
let toastTimer;
let sectionObserver;
let undoAnnotation=null;
let chatMessages=[];
let chatContext='';
let storageWarningShown=false;
let pinnedSectionId=null;
let epubInstance=null;
let epubRendition=null;
let epubResizeObserver=null;
let epubContents=[];
let epubGeneration=0;
const epubPages=book.chapters.flatMap(c=>c.sections.map(s=>({chapterId:c.id,sectionId:s.id,href:'pages/'+s.id+'.xhtml'})));
const chapter=()=>book.chapters.find(c=>c.id===state.chapterId);
const getAnnotation=id=>state.annotations.find(a=>a.id===id);
const getSection=id=>book.chapters.flatMap(c=>c.sections).find(s=>s.id===id);

function loadState(){
  try{
    const value=JSON.parse(localStorage.getItem(storageKey));
    if(!value || value.version!==1)return;
    if(['clinical','study','book'].includes(value.mode))state.mode=value.mode;
    if(book.chapters.some(c=>c.id===value.chapterId))state.chapterId=value.chapterId;
    if(chapter().sections.some(s=>s.id===value.sectionId))state.sectionId=value.sectionId;
    else state.sectionId=chapter().sections[0].id;
    if(['paper','sepia','dark'].includes(value.theme))state.theme=value.theme;
    if(['yellow','orange','pink','blue','green'].includes(value.highlightColor))state.highlightColor=value.highlightColor;
    if(Number.isInteger(value.size)&&value.size>=16&&value.size<=24)state.size=value.size;
    if(['default','serif','sans'].includes(value.font))state.font=value.font;
    if(['comfortable','wide'].includes(value.width))state.width=value.width;
    if(typeof value.focus==='boolean')state.focus=value.focus;
    if([null,'notes','chat','bookmarks'].includes(value.panel))state.panel=value.panel;
    if(Array.isArray(value.bookmarks))state.bookmarks=[...new Set(value.bookmarks.filter(id=>book.chapters.some(c=>c.id===id)))];
    if(Array.isArray(value.annotations)){
      const seen=new Set();
      state.annotations=value.annotations.slice(0,500).map(a=>cleanAnnotation(a,paragraphIndex)).filter(a=>{if(!a||seen.has(a.id))return false;seen.add(a.id);return true;});
    }
    if(state.annotations.some(a=>a.id===value.selectedAnnotationId))state.selectedAnnotationId=value.selectedAnnotationId;
    else state.selectedAnnotationId=state.annotations[0]?.id||null;
  }catch{/* A new session is still usable when browser storage is unavailable. */}
}
function saveState(){
  try{localStorage.setItem(storageKey,JSON.stringify(state));}
  catch{if(!storageWarningShown){storageWarningShown=true;toast('Browseren kunne ikke gemme ændringerne. De beholdes, mens siden er åben.');}}
}
function toast(message,undo=false){
  clearTimeout(toastTimer);
  const box=$('#toast');
  box.innerHTML=`<span>${escape(message)}</span>${undo?'<button type="button" data-undo>Fortryd</button>':''}`;
  box.hidden=false;
  toastTimer=setTimeout(()=>{box.hidden=true;},undo?9000:3500);
}
function currentSection(){
  if(pinnedSectionId)return pinnedSectionId;
  const headerBottom=$('.app-header').getBoundingClientRect().bottom;
  const candidates=$$('.reading-section');
  if(scrollY+innerHeight>=document.documentElement.scrollHeight-12)return candidates.at(-1)?.id||state.sectionId;
  return candidates.filter(s=>s.getBoundingClientRect().top<=headerBottom+70).at(-1)?.id||candidates[0]?.id||state.sectionId;
}
function jumpToSection(sectionId){
  $('#contents-sidebar').classList.remove('mobile-open');
  $('[data-action="toc"]').setAttribute('aria-expanded','false');
  if(state.mode==='book'&&chapter().sections.some(s=>s.id===sectionId)){
    state.sectionId=sectionId;pinnedSectionId=sectionId;
    updateActiveSection();saveState();
    history.replaceState(null,'',`#${state.chapterId}/${state.sectionId}`);
    if(epubRendition)epubRendition.display('pages/'+sectionId+'.xhtml').catch(()=>toast('EPUB-afsnittet kunne ikke åbnes.'));
    return;
  }
  const section=document.getElementById(sectionId);
  if(!section)return;
  state.sectionId=sectionId;
  pinnedSectionId=sectionId;
  history.replaceState(null,'',`#${state.chapterId}/${state.sectionId}`);
  section.scrollIntoView({block:'start'});
  updateActiveSection();saveState();
}
function goToChapter(id,sectionId){
  if(!book.chapters.some(c=>c.id===id))return;
  state.chapterId=id;
  state.sectionId=chapter().sections.some(s=>s.id===sectionId)?sectionId:chapter().sections[0].id;
  pinnedSectionId=state.sectionId;
  clearSelection();
  $('#contents-sidebar').classList.remove('mobile-open');
  $('[data-action="toc"]').setAttribute('aria-expanded','false');
  renderAll();saveState();
  history.replaceState(null,'',`#${state.chapterId}/${state.sectionId}`);
  requestAnimationFrame(()=>{
    if(sectionId)jumpToSection(state.sectionId);
    else $('#reader').scrollIntoView({block:'start'});
  });
}
function updateActiveSection(){
  $$('.section-link').forEach(button=>{
    const active=button.dataset.sectionGo===state.sectionId;
    button.classList.toggle('active',active);
    if(active)button.setAttribute('aria-current','location');else button.removeAttribute('aria-current');
  });
}
function renderChrome(){
  document.body.dataset.mode=state.mode;
  document.body.dataset.theme=state.theme;
  document.body.dataset.width=state.width;
  document.body.style.setProperty('--reading-size',state.size+'px');
  document.body.classList.toggle('focus-mode',state.focus);
  document.body.classList.toggle('font-serif',state.font==='serif');
  document.body.classList.toggle('font-sans',state.font==='sans');
  $$('button[data-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===state.mode)));
  $('#current-chapter-label').textContent=chapter().title;
  $('.text-mode-label').textContent=state.mode==='book'?'Bogvisning':'Tekstvisning';
  $('[data-action="bookmark"]').setAttribute('aria-pressed',String(state.bookmarks.includes(state.chapterId)));
  $('[data-action="bookmark"]').setAttribute('aria-label',state.bookmarks.includes(state.chapterId)?'Fjern bogmærke til dette kapitel':'Gem dette kapitel som bogmærke');
  $('[data-action="focus"]').setAttribute('aria-pressed',String(state.focus));
  $('[data-action="focus"]').setAttribute('aria-label',state.focus?'Afslut fokusvisning':'Fokusvisning');
  $$('.reader-actions [data-action="notes"],.reader-actions [data-action="chat"]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.action===state.panel)));
  $('#bookmark-count').textContent=state.bookmarks.length;
  const annotations=state.annotations.filter(a=>a.chapterId===state.chapterId);
  $('#notes-count').textContent=annotations.length;
  $('#notes-count').hidden=annotations.length===0;
  $('#app-layout').classList.toggle('has-panel',Boolean(state.panel)&&!state.focus);
  $('#tool-panel').hidden=!state.panel||state.focus;
  $$('button[data-theme]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.theme===state.theme)));
  $('#size-label').textContent=state.mode==='book'?'Fra EPUB':state.size+' px';
  $('#font-select').value=state.font;
  $('#width-select').value=state.width;
  $('#font-select').disabled=state.mode==='book';
  $('#width-select').disabled=state.mode==='book';
  $$('button[data-size]').forEach(button=>button.disabled=state.mode==='book');
  if(state.mode==='book')epubContents.forEach(applyEpubTheme);
  readerFeatures?.syncAuthorAnnotations();
}
function renderContents(){
  $('#contents-tree').innerHTML=book.chapters.map(c=>`<div class="chapter-group ${c.id===state.chapterId?'current':''}"><button class="chapter-title" type="button" data-chapter="${c.id}" ${c.id===state.chapterId?'aria-current="page"':''}><span class="chapter-number">${c.number}</span><span>${escape(c.title)}</span></button>${c.sections.map((section,index)=>`<button class="section-link" type="button" data-section-go="${section.id}" data-chapter-go="${c.id}">${c.number}.${index+1} ${escape(section.title)}</button>`).join('')}</div>`).join('');
  updateActiveSection();readerFeatures?.renderSidebar();
}
function renderParagraph(p){
  const annotations=state.annotations.filter(a=>a.paragraphId===p.id);
  const text=segmentsForText(p.text,annotations).map(segment=>segment.annotationIds.length?`<mark data-annotation-id="${escape(segment.annotationIds.at(-1))}" data-highlight-color="${escape(state.annotations.find(a=>a.id===segment.annotationIds.at(-1))?.color||'yellow')}">${escape(segment.text)}</mark>`:escape(segment.text)).join('');
  const noteAnnotations=annotations.filter(a=>a.note.trim());
  const noteButton=noteAnnotations.length?`<button class="paragraph-note-button" type="button" data-select-annotation="${escape(noteAnnotations[0].id)}" aria-label="Åbn ${noteAnnotations.length} note til dette afsnit">${noteAnnotations.length}</button>`:'';
  return `<div class="paragraph-row"><p data-paragraph="${p.id}">${text}</p>${noteButton}</div>`;
}
function renderArticle(){
  disposeEpub();
  const c=chapter();
  const pageIndex=Math.max(0,c.sections.findIndex(s=>s.id===state.sectionId));
  const sections=state.mode==='book'?[c.sections[pageIndex]]:c.sections;
  $('#article-breadcrumb').innerHTML=`${icon('book')}<span>${escape(book.title)}</span>${icon('chevron')}<span>Kapitel ${c.number}</span>`;
  const wordCount=c.sections.flatMap(s=>s.paragraphs).reduce((sum,p)=>sum+p.text.split(/\s+/).length,0);
  $('#read-time').textContent=Math.max(1,Math.ceil(wordCount/180))+' min. læsning';
  if(state.mode==='book'){
    $('#book-article').innerHTML=`<nav class="book-page-controls" aria-label="Bogens sider"><button type="button" data-book-page="-1" aria-label="Forrige side">${icon('back')}</button><span id="epub-page-label" aria-live="polite">Åbner EPUB…</span><button type="button" data-book-page="1" aria-label="Næste side">${icon('chevron')}</button></nav><div id="epub-frame" class="epub-frame" aria-label="EPUB-bogens side"></div><div class="epub-caption"><span>EPUB-demobog · bogens eget sidelayout</span><a href="demo.epub" download>Hent demobogen ${icon('external')}</a></div>`;
    updateChapterPagination();
    mountEpub();
    return;
  }
  const pageControls=state.mode==='book'?`<nav class="book-page-controls" aria-label="Bogens sider"><button type="button" data-book-page="-1" ${pageIndex===0?'disabled':''} aria-label="Forrige side">${icon('back')}</button><span>Side ${pageIndex+1} af ${c.sections.length}</span><button type="button" data-book-page="1" ${pageIndex===c.sections.length-1?'disabled':''} aria-label="Næste side">${icon('chevron')}</button></nav>`:'';
  $('#book-article').innerHTML=`${pageControls}<div class="chapter-kicker"><span>Kapitel ${c.number}</span><span class="category-tag">${escape(c.category)}</span></div><h1 class="chapter-heading">${escape(c.title)}</h1><p class="chapter-subtitle">${escape(c.subtitle)}</p><nav class="section-chips" aria-label="Afsnit i kapitlet">${c.sections.map(s=>`<button type="button" data-section-go="${s.id}" data-chapter-go="${c.id}">${escape(s.title)}</button>`).join('')}</nav>${sections.map(s=>`<section class="reading-section" id="${s.id}"><h2><span class="section-number">${c.number}.${c.sections.indexOf(s)+1}</span>${escape(s.title)}</h2>${s.paragraphs.map(renderParagraph).join('')}${s.figureId?figureMarkup(s.figureId):''}${s.table?`<div class="table-wrap"><table class="content-table"><caption>${escape(s.table.caption)}</caption><thead><tr>${s.table.headers.map(h=>`<th scope="col">${escape(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(row=>`<tr>${row.map(cell=>`<td>${escape(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:''}</section>`).join('')}<div class="source-line">${icon('external')}<span>Eksempeltekst parafraseret fra</span><a href="${c.sourceUrl}" target="_blank" rel="noopener noreferrer">${escape(c.sourceName||'Wikipedia')}: ${escape(c.sourceTitle)}</a>${c.sourceName?'':'<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA</a>'}</div>${state.mode==='book'?`<div class="printed-page-footer"><span>${escape(book.title)} · Demobog</span><span>${pageIndex+1}</span></div>`:''}`;
  updateChapterPagination();readerFeatures?.decorate();
  sectionObserver?.disconnect();
  sectionObserver=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
    if(visible[0]&&!pinnedSectionId){state.sectionId=currentSection();updateActiveSection();saveState();}
  },{rootMargin:'-150px 0px -55% 0px',threshold:0});
  $$('.reading-section').forEach(section=>sectionObserver.observe(section));
}
function updateChapterPagination(){
  const index=book.chapters.indexOf(chapter());
  $('#previous-chapter').disabled=index===0;
  $('#next-chapter').disabled=index===book.chapters.length-1;
  $('#previous-title').textContent=book.chapters[index-1]?.title||'Bogens begyndelse';
  $('#next-title').textContent=book.chapters[index+1]?.title||'Bogens slutning';
}
function disposeEpub(){
  epubGeneration++;
  sectionObserver?.disconnect();
  epubResizeObserver?.disconnect();epubResizeObserver=null;
  try{epubRendition?.destroy();epubInstance?.destroy();}catch{}
  epubRendition=null;epubInstance=null;epubContents=[];
}
function applyEpubTheme(contents){
  const style=getComputedStyle(document.body);
  const bg=style.getPropertyValue('--paper').trim();
  const ink=style.getPropertyValue('--ink').trim();
  contents.document.documentElement.style.backgroundColor=bg;
  contents.document.body.style.backgroundColor=bg;
  contents.document.body.style.color=ink;
}
function paintEpubAnnotations(contents){
  contents.document.querySelectorAll('[data-paragraph]').forEach(p=>{
    const original=paragraphIndex[p.dataset.paragraph];if(!original)return;
    const annotations=state.annotations.filter(a=>a.paragraphId===original.id);
    p.innerHTML=segmentsForText(original.text,annotations).map(segment=>segment.annotationIds.length?`<mark data-annotation-id="${escape(segment.annotationIds.at(-1))}" data-highlight-color="${escape(state.annotations.find(a=>a.id===segment.annotationIds.at(-1))?.color||'yellow')}">${escape(segment.text)}</mark>`:escape(segment.text)).join('');
  });
  contents.document.querySelectorAll('mark').forEach(mark=>{const colors={yellow:'#ffd64d',orange:'#ff923c',pink:'#ed70b7',blue:'#64a7f5',green:'#48d77e'};mark.style.background=`color-mix(in srgb, ${colors[mark.dataset.highlightColor]||colors.yellow} 60%, transparent)`;});
  contents.document.querySelectorAll('[data-study-image-id]').forEach(image=>{
    const button=contents.document.createElement('button');button.type='button';button.textContent='Opret kort fra figur';button.style.cssText='font:11px Arial,sans-serif;padding:7px 10px;border:1px solid #ddd;border-radius:5px;background:#fff;color:#24313d;cursor:pointer;margin-top:8px';
    button.onclick=()=>createFigureCard(figures.find(f=>f.id===image.dataset.studyImageId));image.closest('figure').append(button);
  });
  contents.document.addEventListener('click',event=>{
    const mark=event.target.closest('[data-annotation-id]');
    if(mark&&contents.window.getSelection()?.isCollapsed){
      const rect=mark.getBoundingClientRect(),offset=contents.document.defaultView.frameElement.getBoundingClientRect();
      highlightTools?.show(mark.dataset.annotationId,{left:offset.left+rect.left,top:offset.top+rect.top,bottom:offset.top+rect.bottom,width:rect.width});
    }
  });
}
function placeSelectionToolbar(bounds){
  if(highlightTools){highlightTools.selection(bounds);return;}
  const toolbar=$('#selection-toolbar');toolbar.hidden=false;
  const width=toolbar.offsetWidth,height=toolbar.offsetHeight;
  const headerBottom=$('.app-header').getBoundingClientRect().bottom;
  toolbar.style.left=Math.max(10,Math.min(innerWidth-width-10,bounds.left+bounds.width/2-width/2))+'px';
  const top=bounds.top-height-10<headerBottom+5?bounds.bottom+9:bounds.top-height-10;
  toolbar.style.top=Math.max(headerBottom+5,Math.min(innerHeight-height-10,top))+'px';
}
async function mountEpub(){
  const frame=$('#epub-frame');if(!frame||state.mode!=='book')return;
  const generation=epubGeneration;
  try{
    if(typeof window.ePub!=='function')throw new Error('EPUB reader library unavailable');
    const instance=window.ePub();epubInstance=instance;
    const opened=instance.open(new URL('demo.epub',location.href).href,'epub').then(()=>instance.opened);
    let openTimer;
    try{await Promise.race([opened,new Promise((_,reject)=>{openTimer=setTimeout(()=>reject(new Error('EPUB loading timed out')),12000);})]);}
    finally{clearTimeout(openTimer);}
    if(generation!==epubGeneration||state.mode!=='book')return;
    const initialSize=frame.getBoundingClientRect();
    let lastWidth=initialSize.width,lastHeight=initialSize.height;
    const rendition=instance.renderTo(frame,{width:lastWidth,height:lastHeight,spread:'none',flow:'auto',allowScriptedContent:false});
    epubRendition=rendition;
    rendition.on('displayError',error=>{console.error('EPUB display failed',error);toast('EPUB-siden kunne ikke åbnes.');});
    rendition.hooks.content.register(contents=>{
      if(generation!==epubGeneration)return;
      epubContents=[contents];applyEpubTheme(contents);paintEpubAnnotations(contents);
    });
    rendition.on('selected',(_cfi,contents)=>{
      if(generation!==epubGeneration)return;
      const selection=contents.window.getSelection();
      if(!selection||selection.isCollapsed||!selection.rangeCount)return;
      const range=selection.getRangeAt(0);
      selectionSegments=[...contents.document.querySelectorAll('[data-paragraph]')].map(p=>paragraphSelection(p,range)).filter(Boolean);
      if(!selectionSegments.length)return;
      selectedQuote=selection.toString().trim().slice(0,800);
      const local=range.getBoundingClientRect();
      const iframe=contents.document.defaultView.frameElement;
      const offset=iframe?.getBoundingClientRect()||frame.getBoundingClientRect();
      const scale=offset.width/(contents.document.documentElement.clientWidth||640);
      placeSelectionToolbar({left:offset.left+local.left*scale,top:offset.top+local.top*scale,bottom:offset.top+local.bottom*scale,width:local.width*scale});
    });
    rendition.on('relocated',location=>{
      if(generation!==epubGeneration)return;
      const index=epubPages.findIndex(p=>location.start.href.split('#')[0].endsWith(p.href));
      if(index<0)return;
      const page=epubPages[index];state.chapterId=page.chapterId;state.sectionId=page.sectionId;pinnedSectionId=page.sectionId;
      const label=$('#epub-page-label');if(label)label.textContent=`Side ${index+1} af ${epubPages.length}`;
      $('[data-book-page="-1"]').disabled=index===0;
      $('[data-book-page="1"]').disabled=index===epubPages.length-1;
      renderChrome();renderContents();updateChapterPagination();saveState();
      $('#article-breadcrumb').innerHTML=`${icon('book')}<span>${escape(book.title)}</span>${icon('chevron')}<span>Kapitel ${chapter().number}</span>`;
      history.replaceState(null,'',`#${state.chapterId}/${state.sectionId}`);clearSelection();
    });
    rendition.on('keyup',event=>{if(event.shiftKey||event.ctrlKey||event.metaKey)return;if(event.key==='ArrowRight')turnEpubPage(1);if(event.key==='ArrowLeft')turnEpubPage(-1);});
    await rendition.display('pages/'+state.sectionId+'.xhtml');
    if(generation!==epubGeneration)return;
    epubResizeObserver=new ResizeObserver(entries=>{
      if(generation!==epubGeneration)return;
      const rect=entries[0]?.contentRect;
      if(!rect||rect.width<=0||rect.height<=0||Math.abs(rect.width-lastWidth)<1&&Math.abs(rect.height-lastHeight)<1)return;
      lastWidth=rect.width;lastHeight=rect.height;
      rendition.resize(rect.width,rect.height);
      if(!rendition.location)rendition.display('pages/'+state.sectionId+'.xhtml');
    });
    epubResizeObserver.observe(frame);
  }catch(error){
    if(generation!==epubGeneration)return;
    frame.innerHTML=`<div class="empty-state">EPUB-bogen kunne ikke åbnes.<br><button type="button" class="panel-primary" data-retry-epub>Prøv igen</button></div>`;
    const label=$('#epub-page-label');if(label)label.textContent='EPUB-visning';
    console.error('EPUB preview failed',error);
  }
}
function turnEpubPage(direction){
  if(!epubRendition)return;
  clearSelection();
  const action=direction>0?epubRendition.next():epubRendition.prev();
  action?.catch(()=>toast('Siden kunne ikke åbnes.'));
}
function annotationLocation(a){
  const p=paragraphIndex[a.paragraphId];
  const c=book.chapters.find(c=>c.id===p.chapterId);
  const section=c.sections.find(s=>s.id===p.sectionId);
  return {chapter:c,section,number:`${c.number}.${c.sections.indexOf(section)+1}`};
}
function panelHeading(title){return `<div class="panel-heading"><h2>${title}</h2><button class="icon-button" type="button" data-action="close-panel" aria-label="Luk sidepanel">${icon('close')}</button></div>`;}
function renderNotes(){
  const selected=getAnnotation(state.selectedAnnotationId);
  const sorted=[...state.annotations].sort((a,b)=>b.createdAt-a.createdAt);
  const location=selected?annotationLocation(selected):null;
  return `${panelHeading('Overstregninger og noter')}<p class="panel-description">Dine markeringer følger bogens tekst i alle tre visninger.</p><button class="panel-primary" type="button" data-new-note>${icon('plus')}Ny note til kapitlet</button>${selected?`<div class="note-editor"><div class="note-meta">${escape(location.chapter.title)}<br>Afsnit ${location.number} · ${escape(location.section.title)}</div><blockquote class="note-quote">${escape(selected.quote||location.chapter.title)}</blockquote><label for="note-edit">Din note</label><textarea id="note-edit" data-note-edit="${escape(selected.id)}" placeholder="Skriv din note…" maxlength="4000">${escape(selected.note)}</textarea><div class="note-editor-actions"><span class="note-save-label" id="note-save-label">${icon('check')}Gemt i browseren</span><button type="button" class="quiet-button" data-delete-annotation="${escape(selected.id)}" aria-label="Fjern denne markering og note">${icon('trash')}Fjern</button></div><button class="quiet-button" type="button" data-card-from-annotation="${escape(selected.id)}">${icon('cards')}Opret kort fra markeringen</button><button class="quiet-button" type="button" data-locate-annotation="${escape(selected.id)}">${icon('link')}Vis afsnittet i bogen</button></div>`:''}<p class="panel-list-title">Hele bogen · ${state.annotations.length} markering${state.annotations.length===1?'':'er'}</p>${sorted.length?sorted.map(a=>{const loc=annotationLocation(a);return `<button type="button" class="note-card ${a.id===state.selectedAnnotationId?'selected':''}" data-select-annotation="${escape(a.id)}"><span class="note-meta">${escape(loc.chapter.title)} · ${loc.number}</span><p>${escape(a.quote||loc.section.title)}</p><span class="note-preview" data-note-preview="${escape(a.id)}">${escape(a.note.slice(0,95)||'Overstregning uden note')}${a.note.length>95?'…':''}</span></button>`;}).join(''):`<div class="empty-state">${icon('highlight')}Marker et stykke bogtekst for at overstrege det eller tilføje en note.</div>`}`;
}
function renderChat(){
  return `${panelHeading('AI-chat')}<p class="panel-description">AI-demo · samtale om det kapitel, du læser.</p><div class="chat-context"><span class="field-label">${chatContext?'Markeret tekst':'Dit kapitel'}</span><p>${escape(chatContext||chapter().title)}</p></div><div class="chat-messages">${chatMessages.length?chatMessages.map(m=>`<div class="chat-message ${m.role}"><span class="message-label">${m.role==='user'?'Dig':'Eksempelsvar'}</span>${escape(m.text)}</div>`).join(''):`<div class="chat-message"><span class="message-label">Lægereolen · AI-demo</span>Hvad vil du arbejde med? Du kan få et eksempel på et resumé, en forklaring eller spørgsmål til din repetition.</div>`}</div><div class="chat-suggestions"><button type="button" data-prompt="Opsummer kapitlet">Opsummer kapitlet</button><button type="button" data-prompt="Forklar markeringen">Forklar markering</button><button type="button" data-prompt="Lav repetitionsspørgsmål">Repetitionsspørgsmål</button></div><form class="chat-form" id="chat-form"><input id="chat-input" placeholder="Spørg til bogteksten…" aria-label="Spørgsmål til AI-demo" maxlength="500"><button type="submit" aria-label="Send spørgsmål">${icon('send')}</button></form><p class="chat-demo-label">Svarene er forberedte demoeksempler. Der er ikke tilsluttet en AI-model.</p>`;
}
function renderBookmarks(){
  const chapters=book.chapters.filter(c=>state.bookmarks.includes(c.id));
  return `${panelHeading('Bogmærker')}<p class="panel-description">Find tilbage til de kapitler, du har gemt.</p>${chapters.length?chapters.map(c=>`<button type="button" class="bookmark-card" data-chapter="${c.id}">${icon('bookmark')}<span>${escape(c.title)}<small>Kapitel ${c.number} · ${escape(book.title)}</small></span>${icon('chevron')}</button>`).join(''):`<div class="empty-state">${icon('bookmark')}Brug bogmærket øverst til at gemme det kapitel, du læser.</div>`}`;
}
function renderPanel(){
  $('#tool-panel').innerHTML=state.panel==='notes'?renderNotes():state.panel==='chat'?renderChat():state.panel==='bookmarks'?renderBookmarks():'';
}
function renderAll(){renderChrome();renderContents();renderArticle();renderPanel();}
function openPanel(panel){state.panel=panel;state.focus=false;renderChrome();renderPanel();saveState();}
function clearSelection(){selectionSegments=[];selectedQuote='';highlightTools?.clear();$('#selection-toolbar').hidden=true;}
function selectionChanged(){
  if(state.mode==='book')return;
  const selection=window.getSelection();
  if(!selection||selection.isCollapsed||!selection.rangeCount){if(!highlightTools?.hasActive())$('#selection-toolbar').hidden=true;return;}
  const range=selection.getRangeAt(0);
  const article=$('#book-article');
  if(!article.contains(range.commonAncestorContainer)){clearSelection();return;}
  selectionSegments=$$('[data-paragraph]',article).map(p=>paragraphSelection(p,range)).filter(Boolean);
  if(!selectionSegments.length){clearSelection();return;}
  selectedQuote=selection.toString().trim().slice(0,800);
  const bounds=range.getBoundingClientRect();
  placeSelectionToolbar(bounds);
}
function addSelection(withNote){
  if(!selectionSegments.length){toast('Marker først et stykke bogtekst.');return;}
  let firstId;
  for(const segment of selectionSegments){
    const p=paragraphIndex[segment.paragraphId];
    const a={id:crypto.randomUUID(),chapterId:p.chapterId,...segment,quote:p.text.slice(segment.start,segment.end),note:'',color:state.highlightColor||'yellow',createdAt:Date.now()};
    if(!firstId)firstId=a.id;
    state.annotations.push(a);
  }
  state.selectedAnnotationId=firstId;
  if(withNote)state.focus=false;
  window.getSelection()?.removeAllRanges();clearSelection();
  renderAll();saveState();
  if(withNote)highlightTools?.editNote(firstId);
  else toast('Overstregningen er gemt i alle tre visninger.');
}
function newNote(){
  const p=chapter().sections.find(s=>s.id===state.sectionId)?.paragraphs[0]||chapter().sections[0].paragraphs[0];
  const a={id:crypto.randomUUID(),chapterId:state.chapterId,paragraphId:p.id,start:0,end:0,quote:'',note:'',createdAt:Date.now()};
  state.annotations.push(a);state.selectedAnnotationId=a.id;
  openPanel('notes');saveState();$('#note-edit')?.focus({preventScroll:true});
}
function selectAnnotation(id,locate=false){
  const a=getAnnotation(id);if(!a)return;
  state.selectedAnnotationId=id;
  const p=paragraphIndex[a.paragraphId];
  if(a.chapterId!==state.chapterId)goToChapter(a.chapterId,p.sectionId);
  openPanel('notes');
  if(locate)requestAnimationFrame(()=>jumpToSection(p.sectionId));
}
function deleteAnnotation(id){
  const a=getAnnotation(id);if(!a)return;
  undoAnnotation={...a};state.annotations=state.annotations.filter(x=>x.id!==id);state.selectedAnnotationId=state.annotations[0]?.id||null;
  renderAll();saveState();toast('Markering og note er fjernet.',true);
}
function demoReply(prompt){
  const c=chapter();
  let reply;
  if(/spørg|repetition|quiz/i.test(prompt))reply='Tre spørgsmål til repetition:\n\n'+c.sections.map((s,i)=>`${i+1}. Hvordan vil du med egne ord forklare “${s.title.toLocaleLowerCase('da')}”?`).join('\n');
  else if(/forklar|markering/i.test(prompt)&&chatContext)reply='Eksempel på forklaring:\n\n“'+chatContext+'”\n\nLæs udsagnet sammen med afsnittet “'+getSection(state.sectionId)?.title+'”. Notér de centrale begreber, og sammenhold dem med resten af kapitlet.';
  else reply='Eksempel på kapitelresumé:\n\n'+c.sections.map(s=>'• '+s.title+': '+s.paragraphs[0].text).join('\n\n');
  chatMessages.push({role:'user',text:prompt.slice(0,500)},{role:'assistant',text:reply});
  chatMessages=chatMessages.slice(-8);
  renderPanel();$('#chat-input')?.focus({preventScroll:true});
}
function openSearch(){const dialog=$('#search-dialog');if(!dialog.open)dialog.showModal();renderSearch();$('#search-input').focus();}
function matchedText(text,query){
  if(!query)return escape(text);
  const index=text.toLocaleLowerCase('da').indexOf(query.toLocaleLowerCase('da'));
  if(index<0)return escape(text);
  return escape(text.slice(0,index))+'<mark>'+escape(text.slice(index,index+query.length))+'</mark>'+escape(text.slice(index+query.length));
}
function excerpt(text,query){
  const index=Math.max(0,text.toLocaleLowerCase('da').indexOf(query.toLocaleLowerCase('da')));
  const start=Math.max(0,index-45),end=Math.min(text.length,index+query.length+100);
  return (start?'…':'')+text.slice(start,end)+(end<text.length?'…':'');
}
function renderSearch(){
  const query=$('#search-input').value.trim();
  searchResults=[];
  if(searchScope==='notes'){
    for(const a of state.annotations){const loc=annotationLocation(a);if(!query||(a.note+' '+a.quote+' '+loc.chapter.title).toLocaleLowerCase('da').includes(query.toLocaleLowerCase('da')))searchResults.push({chapterId:a.chapterId,sectionId:loc.section.id,annotationId:a.id,title:loc.section.title,meta:loc.chapter.title+' · Din note',text:a.note||a.quote});}
  }else{
    for(const c of book.chapters)for(const section of c.sections){
      const text=section.paragraphs.map(p=>p.text).join(' ');
      if(!query||(c.title+' '+section.title+' '+text).toLocaleLowerCase('da').includes(query.toLocaleLowerCase('da'))||state.mode==='clinical'&&clinicalMatches(c,query))searchResults.push({chapterId:c.id,sectionId:section.id,title:section.title,meta:'Kapitel '+c.number+' · '+c.title,text});
    }
  }
  if(searchScope==='book'&&state.mode==='clinical')searchResults.push(...imageSearchResults(query));
  $$('[data-scope]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.scope===searchScope)));
  $('#search-count').textContent=searchResults.length+' resultat'+(searchResults.length===1?'':'er');
  $('#search-results').innerHTML=searchResults.length?searchResults.slice(0,30).map((r,i)=>`<button type="button" class="search-result" data-search-result="${i}"><strong>${matchedText(r.title,query)}</strong><span class="result-meta">${escape(r.meta)}</span><p>${matchedText(excerpt(r.text,query),query)}</p></button>`).join(''):`<div class="empty-state">${icon('search')}${query?'Ingen resultater. Prøv et andet søgeord.':'Der er ingen noter endnu.'}</div>`;
}
function openSearchResult(index){
  const result=searchResults[index];if(!result)return;
  $('#search-dialog').close();if(result.figureId)return readerFeatures.atlasDetail(result.figureId);goToChapter(result.chapterId,result.sectionId);
  if(result.annotationId)selectAnnotation(result.annotationId,true);
}
function switchMode(mode){
  if(!['clinical','study','book'].includes(mode)||mode===state.mode)return;
  state.sectionId=currentSection();state.mode=mode;clearSelection();
  renderAll();saveState();requestAnimationFrame(()=>jumpToSection(state.sectionId));
}

document.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button){const mark=event.target.closest('[data-annotation-id]');if(mark&&window.getSelection()?.isCollapsed)highlightTools?.show(mark.dataset.annotationId,mark.getBoundingClientRect());return;}
  if(button.dataset.action==='cards')return studyCards?.openDeck();
  if(button.dataset.cardFromAnnotation)return createTextCard(getAnnotation(button.dataset.cardFromAnnotation));
  if(button.dataset.mode)return switchMode(button.dataset.mode);
  if(button.dataset.bookPage)return turnEpubPage(Number(button.dataset.bookPage));
  if(button.hasAttribute('data-retry-epub'))return renderArticle();
  if(button.dataset.chapter)return goToChapter(button.dataset.chapter);
  if(button.dataset.sectionGo){if(button.dataset.chapterGo!==state.chapterId)return goToChapter(button.dataset.chapterGo,button.dataset.sectionGo);return jumpToSection(button.dataset.sectionGo);}
  if(button.dataset.selectAnnotation)return selectAnnotation(button.dataset.selectAnnotation);
  if(button.dataset.locateAnnotation)return selectAnnotation(button.dataset.locateAnnotation,true);
  if(button.dataset.deleteAnnotation)return deleteAnnotation(button.dataset.deleteAnnotation);
  if(button.hasAttribute('data-new-note'))return newNote();
  if(button.hasAttribute('data-undo')&&undoAnnotation){state.annotations.push(undoAnnotation);state.selectedAnnotationId=undoAnnotation.id;undoAnnotation=null;renderAll();saveState();return toast('Markering og note er gendannet.');}
  if(button.dataset.selection){
    const action=button.dataset.selection;
    if(action==='highlight')return addSelection(false);
    if(action==='note')return addSelection(true);
    if(action==='chat'){chatContext=selectedQuote;openPanel('chat');window.getSelection()?.removeAllRanges();clearSelection();return;}
    clearSelection();window.getSelection()?.removeAllRanges();return;
  }
  if(button.dataset.theme){state.theme=button.dataset.theme;renderChrome();saveState();return;}
  if(button.dataset.size){state.size=Math.max(16,Math.min(24,state.size+(button.dataset.size==='+'?1:-1)));renderChrome();saveState();return;}
  if(button.dataset.scope){searchScope=button.dataset.scope;return renderSearch();}
  if(button.hasAttribute('data-search-result'))return openSearchResult(Number(button.dataset.searchResult));
  if(button.hasAttribute('data-close-search'))return $('#search-dialog').close();
  if(button.dataset.prompt)return demoReply(button.dataset.prompt);
  const action=button.dataset.action;
  if(action==='search')return openSearch();
  if(action==='bookmark'){
    state.bookmarks=state.bookmarks.includes(state.chapterId)?state.bookmarks.filter(id=>id!==state.chapterId):[...state.bookmarks,state.chapterId];
    renderChrome();if(state.panel==='bookmarks')renderPanel();saveState();return toast(state.bookmarks.includes(state.chapterId)?'Kapitlet er gemt som bogmærke.':'Bogmærket er fjernet.');
  }
  if(['notes','chat','bookmarks'].includes(action))return openPanel(state.panel===action?null:action);
  if(action==='close-panel')return openPanel(null);
  if(action==='settings'){
    const panel=$('#settings-panel');panel.hidden=!panel.hidden;$('.reader-actions [data-action="settings"]').setAttribute('aria-expanded',String(!panel.hidden));return;
  }
  if(action==='focus'){state.sectionId=currentSection();state.focus=!state.focus;renderChrome();saveState();requestAnimationFrame(()=>jumpToSection(state.sectionId));return;}
  if(action==='toc'){const sidebar=$('#contents-sidebar');sidebar.classList.toggle('mobile-open');button.setAttribute('aria-expanded',String(sidebar.classList.contains('mobile-open')));return;}
  if(button.id==='previous-chapter'){const i=book.chapters.indexOf(chapter());if(i>0)goToChapter(book.chapters[i-1].id);}
  if(button.id==='next-chapter'){const i=book.chapters.indexOf(chapter());if(i<book.chapters.length-1)goToChapter(book.chapters[i+1].id);}
});
$('#selection-toolbar').addEventListener('pointerdown',event=>event.preventDefault());
document.addEventListener('selectionchange',selectionChanged);
document.addEventListener('pointerup',()=>requestAnimationFrame(selectionChanged));
document.addEventListener('input',event=>{
  if(event.target.id==='search-input')return renderSearch();
  if(event.target.hasAttribute('data-note-edit')){
    const a=getAnnotation(event.target.dataset.noteEdit);if(!a)return;
    a.note=event.target.value.slice(0,4000);saveState();
    $('#note-save-label').innerHTML=icon('check')+'Gemt i browseren';
    const preview=$(`[data-note-preview="${CSS.escape(a.id)}"]`);if(preview)preview.textContent=a.note.slice(0,95)+(a.note.length>95?'…':'');
    const p=paragraphIndex[a.paragraphId];const paragraph=$(`[data-paragraph="${p.id}"]`);
    if(paragraph && !paragraph.parentElement.querySelector('.paragraph-note-button') && a.note.trim()){
      const button=document.createElement('button');button.type='button';button.className='paragraph-note-button';button.dataset.selectAnnotation=a.id;button.textContent='1';button.setAttribute('aria-label','Åbn note til dette afsnit');paragraph.parentElement.append(button);
    }
  }
});
document.addEventListener('submit',event=>{if(event.target.id==='chat-form'){event.preventDefault();const input=$('#chat-input');const prompt=input.value.trim();if(prompt)demoReply(prompt);}});
$('#font-select').addEventListener('change',event=>{state.font=event.target.value;renderChrome();saveState();});
$('#width-select').addEventListener('change',event=>{state.width=event.target.value;renderChrome();saveState();});
document.addEventListener('keydown',event=>{
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openSearch();return;}
  if(event.key==='Escape'){
    clearSelection();$('#settings-panel').hidden=true;$('.reader-actions [data-action="settings"]').setAttribute('aria-expanded','false');$('#contents-sidebar').classList.remove('mobile-open');$('[data-action="toc"]').setAttribute('aria-expanded','false');
  }
  if(event.key==='Enter'&&event.target.id==='search-input'&&searchResults.length){event.preventDefault();openSearchResult(0);}
});
$('#search-dialog').addEventListener('click',event=>{if(event.target===$('#search-dialog')){const box=event.target.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)event.target.close();}});
window.addEventListener('resize',selectionChanged);
window.addEventListener('wheel',()=>{pinnedSectionId=null;},{passive:true});
window.addEventListener('touchmove',()=>{pinnedSectionId=null;},{passive:true});
document.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(event.key)&&!['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName))pinnedSectionId=null;});
window.addEventListener('scroll',()=>{if(window.getSelection()&&!window.getSelection().isCollapsed)selectionChanged();if(!pinnedSectionId){state.sectionId=currentSection();updateActiveSection();saveState();}},{passive:true});
window.addEventListener('hashchange',()=>{const [c,s]=location.hash.slice(1).split('/');if(book.chapters.some(chapter=>chapter.id===c))goToChapter(c,s);});
function cardSource(paragraph){
  const c=book.chapters.find(c=>c.id===paragraph.chapterId),s=c.sections.find(s=>s.id===paragraph.sectionId);
  return {bookId:book.id,pageId:s.id,chapterId:c.id,sectionId:s.id,paragraphId:paragraph.id,title:book.title+' · '+c.title,sectionTitle:s.title,url:location.origin+location.pathname+'#'+c.id+'/'+s.id};
}
function createTextCard(annotation){
  const first=annotation?paragraphIndex[annotation.paragraphId]:paragraphIndex[selectionSegments[0]?.paragraphId];
  if(!first)return;
  const quote=annotation?(annotation.quote||first.text):selectedQuote;
  studyCards?.createTextCard(quote,first.text,cardSource(first));clearSelection();
}
function createFigureCard(figure){
  if(!figure)return;clearSelection();
  const c=book.chapters.find(c=>c.id===figure.chapterId),s=c.sections.find(s=>s.id===figure.sectionId);
  studyCards?.createImageCard(figure.id,{...cardSource({...s.paragraphs[0],chapterId:c.id,sectionId:s.id}),figureId:figure.id});
}
loadState();
highlightTools=createHighlightTools({state,escape,icon,addSelection,refresh:renderAll,saveState,deleteAnnotation,createCard:createTextCard,openChat:quote=>{chatContext=quote||selectedQuote;openPanel('chat');clearSelection();}});
readerFeatures=createReaderFeatures({getState:()=>state,goToChapter,jumpToSection,search:query=>{searchScope='book';openSearch();$('#search-input').value=query;renderSearch();},createImageCard:createFigureCard});
studyCards=window.StudiekortWidget.mount({reader:'#book-article',userId:'laegereolen-prototype',showDock:false,selectionMenu:false,planReview,textCardDraft,normalizeMask,
  getContext:()=>({bookId:book.id,pageId:state.sectionId,title:book.title,chapterId:state.chapterId,sectionId:state.sectionId}),
  resolveImage:card=>{const f=figures.find(f=>f.id===card.imageKey);return f?new URL(f.src,location.href).href:null;},
  openSource:source=>goToChapter(source.chapterId,source.sectionId||source.pageId),
  onCardsChange:counts=>{$$('#study-card-count').forEach(node=>node.textContent=counts.total);}
});
const [hashChapter,hashSection]=location.hash.slice(1).split('/');
if(book.chapters.some(c=>c.id===hashChapter)){state.chapterId=hashChapter;state.sectionId=chapter().sections.some(s=>s.id===hashSection)?hashSection:chapter().sections[0].id;}
renderAll();
if(location.hash)requestAnimationFrame(()=>jumpToSection(state.sectionId));
