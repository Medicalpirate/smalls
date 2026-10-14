export const highlightColors={yellow:{label:'Vigtigt',hex:'#ffd64d'},orange:{label:'Husk',hex:'#ff923c'},pink:{label:'Spørgsmål',hex:'#ed70b7'},blue:{label:'Begreber',hex:'#64a7f5'},green:{label:'Forstået',hex:'#48d77e'}};
export function createHighlightTools({state,escape,icon,addSelection,refresh,saveState,deleteAnnotation,createCard,openChat}){
  const toolbar=document.querySelector('#selection-toolbar');
  let activeId=null,lastBounds=null;
  const dialog=document.createElement('dialog');dialog.className='note-dialog';dialog.setAttribute('aria-label','Rediger note');document.body.append(dialog);
  const annotation=()=>state.annotations.find(a=>a.id===activeId);
  function render(){
    const a=annotation(),color=a?.color||state.highlightColor||'yellow';
    toolbar.innerHTML=`<div class="highlight-palette" aria-label="Overstregningsfarve">${Object.entries(highlightColors).map(([key,value])=>`<button type="button" class="highlight-color" data-highlight-color="${key}" aria-label="${value.label} · ${key==='yellow'?'gul':key==='orange'?'orange':key==='pink'?'pink':key==='blue'?'blå':'grøn'}" aria-pressed="${key===color}" title="${value.label}"><span style="background:${value.hex}"></span></button>`).join('')}</div><button type="button" data-highlight-action="note">${icon('note')}${a?.note?'Rediger note':'Tilføj note'}</button><button type="button" data-highlight-action="chat">${icon('chat')}Spørg</button><button type="button" data-highlight-action="card">${icon('cards')}Opret kort</button>${a?`<button type="button" data-highlight-action="delete">${icon('close')}Slet</button>`:''}<button type="button" class="icon-button" data-highlight-action="close" aria-label="Luk markeringsmenu">${icon('close')}</button>`;
  }
  function position(bounds){
    lastBounds=bounds;toolbar.hidden=false;
    const header=document.querySelector('.app-header').getBoundingClientRect().bottom;
    const width=toolbar.offsetWidth,height=toolbar.offsetHeight;
    toolbar.style.left=Math.max(8,Math.min(innerWidth-width-8,bounds.left+bounds.width/2-width/2))+'px';
    let top=bounds.top-height-12;if(top<header+6)top=bounds.bottom+12;
    toolbar.style.top=Math.max(header+6,Math.min(innerHeight-height-8,top))+'px';
  }
  function selection(bounds){activeId=null;render();position(bounds);}
  function show(id,bounds){activeId=id;state.selectedAnnotationId=id;render();position(bounds);}
  function clear(){activeId=null;lastBounds=null;toolbar.hidden=true;}
  function editNote(id){
    const a=state.annotations.find(a=>a.id===id);if(!a)return;
    const color=highlightColors[a.color||'yellow'];clear();
    dialog.innerHTML=`<form id="highlight-note-form"><div class="note-dialog-heading"><span class="color-dot" style="background:${color.hex}"></span><h2>${color.label}</h2><button type="button" class="icon-button" data-note-close aria-label="Luk note">${icon('close')}</button></div><blockquote>${escape(a.quote||'Note til kapitlet')}</blockquote><label class="sr-only" for="highlight-note-text">Din note</label><textarea id="highlight-note-text" placeholder="Skriv din note…" maxlength="4000">${escape(a.note)}</textarea><div class="note-dialog-actions"><button type="submit" class="action-primary">Gem og luk</button><button type="button" data-note-close>Annuller</button>${a.note?'<button type="button" class="delete-note" data-note-delete>Slet note</button>':''}</div></form>`;
    dialog.querySelector('form').onsubmit=e=>{e.preventDefault();a.note=dialog.querySelector('textarea').value.trim();saveState();dialog.close();refresh();};
    dialog.querySelectorAll('[data-note-close]').forEach(button=>button.onclick=()=>dialog.close());
    const remove=dialog.querySelector('[data-note-delete]');if(remove)remove.onclick=()=>{a.note='';if(a.start===a.end)state.annotations=state.annotations.filter(x=>x.id!==a.id);saveState();dialog.close();refresh();};
    dialog.showModal();dialog.querySelector('textarea').focus();
  }
  toolbar.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    const a=annotation();
    if(button.dataset.highlightColor){
      const color=button.dataset.highlightColor;state.highlightColor=color;
      if(a){a.color=color;saveState();clear();refresh();}else addSelection(false);
      return;
    }
    const action=button.dataset.highlightAction;
    if(action==='note'){if(a)editNote(a.id);else addSelection(true);}
    if(action==='card'){createCard(a);clear();}
    if(action==='chat'){openChat(a?.quote);clear();}
    if(action==='delete'&&a){deleteAnnotation(a.id);clear();}
    if(action==='close')clear();
  });
  document.addEventListener('pointerdown',event=>{if(!toolbar.contains(event.target)&&!event.target.closest('[data-annotation-id]'))clear();});
  window.addEventListener('resize',()=>{
    if(!activeId||!lastBounds)return;
    const selector=`mark[data-annotation-id="${CSS.escape(activeId)}"]`;
    const iframe=document.querySelector('#epub-frame iframe');
    let mark=document.querySelector(selector),offset={left:0,top:0};
    if(!mark&&iframe){try{mark=iframe.contentDocument.querySelector(selector);offset=iframe.getBoundingClientRect();}catch{}}
    if(mark){const rect=mark.getBoundingClientRect();position({left:rect.left+offset.left,top:rect.top+offset.top,bottom:rect.bottom+offset.top,width:rect.width});}
    else position(lastBounds);
  });
  return {selection,show,clear,editNote,hasActive:()=>Boolean(activeId)};
}
