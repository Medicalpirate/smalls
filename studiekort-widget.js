/*
 * Studiekort Widget v0.1 — standalone, dependency-free browser component.
 * Book content stays in the reader/browser. No external requests are made.
 */
(function (global) {
  'use strict';
  const STYLE = `
    :host{all:initial;font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif;color:#17364e}
    *,*:before,*:after{box-sizing:border-box}
    button,input,textarea{font:inherit}
    button{cursor:pointer}
    button:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid #68c4ed;outline-offset:2px}
    .root{position:fixed;inset:0;z-index:2147483646;pointer-events:none}
    .dock{position:fixed;right:20px;bottom:20px;display:flex;gap:8px;align-items:center;pointer-events:auto}
    .btn{border:1px solid #bdd6e3;border-radius:10px;background:#fff;color:#164763;padding:10px 13px;font-size:14px;font-weight:700;box-shadow:0 4px 16px #0d324128}
    .btn:hover{background:#eef8fc}.btn.primary{background:#087daf;color:#fff;border-color:#087daf}.btn.primary:hover{background:#066e9c}
    .btn.small{padding:6px 9px;font-size:13px}.btn:disabled{opacity:.55;cursor:not-allowed}
    .selection{position:fixed;pointer-events:auto;background:#173e59;padding:5px;border-radius:9px;box-shadow:0 8px 25px #0a293b44}
    .selection .btn{background:transparent;color:white;border:0;box-shadow:none}.selection .btn:hover{background:#285e7b}
    .scrim{position:fixed;inset:0;background:#0926389c;pointer-events:auto;display:flex;align-items:center;justify-content:center;padding:14px}
    .panel{width:min(100%,680px);max-height:90vh;overflow:auto;background:#fff;border-radius:15px;box-shadow:0 24px 75px #001e3655;padding:22px}
    .panel-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:17px}
    h2{font-size:21px;line-height:1.25;margin:0;color:#17364e}h3{font-size:16px;margin:0 0 10px}
    .sub{font-size:13px;color:#637f90;line-height:1.45;margin:5px 0 0}
    .close{width:32px;height:32px;border:0;border-radius:8px;background:#edf4f7;color:#36586c;font-size:23px;line-height:1}
    .field{display:grid;gap:6px;margin:15px 0}.field label{font-size:14px;font-weight:700}.field textarea{width:100%;min-height:78px;resize:vertical;border:1px solid #bed3df;border-radius:8px;padding:10px;color:#17364e;font-size:15px}
    .actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}
    .status{font-size:13px;color:#496e82;background:#edf7fb;border:1px solid #d2e8f2;padding:9px 11px;border-radius:8px;margin:12px 0}
    .stats{display:flex;gap:10px;margin:14px 0 18px}.stat{flex:1;background:#f1f7fa;border-radius:9px;padding:12px}.stat strong{display:block;font-size:24px}.stat span{font-size:12px;color:#627f91}
    .list{display:grid;gap:7px}.item{border:1px solid #d9e7ed;border-radius:9px;padding:11px 12px;display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.item-text{min-width:0}.item strong{font-size:14px;line-height:1.4;display:block;overflow-wrap:anywhere}.item small{font-size:12px;color:#668294}.tag{white-space:nowrap;font-size:11px;font-weight:700;padding:4px 7px;border-radius:99px;background:#e8f5fb;color:#086b99}
    .empty{padding:24px;text-align:center;color:#668294;border:1px dashed #b9d2de;border-radius:9px;font-size:14px}
    .review-front{font-size:20px;line-height:1.45;font-weight:650;white-space:pre-wrap;overflow-wrap:anywhere;margin:22px 0}
    .answer{border-top:1px solid #dce9ef;margin-top:20px;padding-top:16px;white-space:pre-wrap;line-height:1.5;font-size:16px}
    .rating{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:20px}.rating .btn{padding:10px 5px}
    .image-frame{position:relative;width:100%;margin:16px auto;border:1px solid #c9dbe4;border-radius:5px;overflow:hidden;background:#f2f7fa}.image-frame img{display:block;width:100%;height:auto}.image-frame .mask{position:absolute;border:2px solid white;background:#087dafde;display:grid;place-items:center;color:white;font-weight:800}.image-frame.revealed .mask{background:#ffcc6677;border-color:#ce8d14;color:#6f4d05}
    .pick-tip{position:fixed;left:50%;top:14px;transform:translateX(-50%);max-width:calc(100vw - 24px);background:#123e5d;color:white;border-radius:9px;padding:10px 13px;pointer-events:auto;font-size:14px;box-shadow:0 8px 22px #0a293b44;display:flex;gap:12px;align-items:center}
    .pick-tip button{background:transparent;color:white;border:1px solid #a6c8da;border-radius:6px;padding:5px 8px}
    .draw{position:fixed;border:3px solid #0b87ba;background:#087daf16;pointer-events:auto;touch-action:none;cursor:crosshair}
    .draw::before{content:"Klik eller træk for at skjule et område";position:absolute;left:5px;bottom:5px;background:#123e5de8;color:#fff;border-radius:5px;padding:5px 7px;font-size:12px;pointer-events:none}
    .drawing-box{position:absolute;border:2px solid #f3ae35;background:#ffd16870;pointer-events:none}
    .notice{position:fixed;right:20px;bottom:78px;max-width:300px;background:#173e59;color:white;padding:10px 12px;border-radius:9px;font-size:13px;pointer-events:none}
    [hidden]{display:none!important}.panel{background:var(--surface,#fff);color:var(--ink,#24313d)}h2{color:var(--ink,#24313d)}.btn.primary{background:var(--accent,#7a559c);border-color:var(--accent,#7a559c);color:var(--paper,#fff)}.btn.primary:hover{filter:brightness(.95);background:var(--accent,#7a559c)}.btn{box-shadow:none;border-color:var(--line,#e1e7ec);background:var(--surface,#fff);color:var(--ink,#24313d)}.field textarea{color:var(--ink,#24313d);background:var(--paper,#fff);border-color:var(--line,#e1e7ec)}.stat,.status{background:var(--accent-soft,#f0eaf6);color:var(--ink,#24313d);border-color:var(--line,#e1e7ec)}.stat span,.sub,.item small{color:var(--muted,#6d7a86)}.item{border-color:var(--line,#e1e7ec)}.close{background:var(--soft,#f0f3f6);color:var(--ink,#24313d)}.card-actions{display:flex;gap:7px;margin-top:10px}.image-frame .mask{background:var(--accent,#7a559c);border-color:white}.image-frame.revealed .mask{background:transparent;border:2px dashed var(--accent,#7a559c)}.figure-draw{position:absolute;inset:0;cursor:crosshair;touch-action:none}.figure-picker img{user-select:none}.figure-picker{max-width:600px}.figure-picker img{max-height:none;width:100%;height:auto}.figure-picker .figure-draw{inset:0}
    @media(max-width:600px){.dock{right:10px;bottom:10px}.dock .btn{padding:9px;font-size:12px}.panel{padding:17px}.rating{grid-template-columns:repeat(2,1fr)}.field textarea{font-size:16px}}
  `;
  const DAY = 86400000;
  const now = () => Date.now();
  const make = (tag, attrs = {}, text) => {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'class') node.className = value;
      else if (key === 'style') Object.assign(node.style, value);
      else node.setAttribute(key, String(value));
    }
    if (text != null) node.textContent = String(text);
    return node;
  };
  function mount(options) {
    if (!options || !options.reader || typeof options.getContext !== 'function') {
      throw new Error('StudiekortWidget.mount kræver reader og getContext.');
    }
    const reader = typeof options.reader === 'string' ? document.querySelector(options.reader) : options.reader;
    if (!reader) throw new Error('Bogsidens reader-element blev ikke fundet.');
    const userId = String(options.userId || 'local');
    const key = 'studiekort-widget-v1:' + userId;
    const storage = options.storage || {
      load: () => JSON.parse(localStorage.getItem(key) || '[]'),
      save: cards => localStorage.setItem(key, JSON.stringify(cards))
    };
    const host = make('div');
    host.setAttribute('data-studiekort-widget', '');
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.appendChild(make('style', {}, STYLE));
    const root = make('div', { class: 'root' });
    shadow.appendChild(root);
    let cards = [], draft = null, current = null, queue = [], index = 0, revealed = false, pickMode = false, selectionTimer;
    const notify = message => {
      root.querySelector('.notice')?.remove();
      const n = make('div', { class: 'notice', role: 'status' }, message);
      root.appendChild(n);
      setTimeout(() => n.remove(), 3200);
    };
    const context = () => {
      const value = options.getContext();
      if (!value?.bookId || !value?.pageId) throw new Error('getContext skal returnere bookId og pageId.');
      return { bookId: String(value.bookId), pageId: String(value.pageId), title: String(value.title || ''), url: location.href };
    };
    const persist = async () => { await storage.save(cards); updateDock(); };
    const imageKey = image => String(options.identifyImage?.(image) || image.dataset.studyImageId || [...reader.querySelectorAll('img')].indexOf(image));
    const resolveImage = async card => {
      if (options.resolveImage) return await options.resolveImage(card);
      const c = context();
      if (card.source.bookId !== c.bookId || card.source.pageId !== c.pageId) return null;
      const found = [...reader.querySelectorAll('img')].find(img => imageKey(img) === card.imageKey);
      return found?.currentSrc || found?.src || null;
    };
    function updateDock() {
      const due = cards.filter(c => c.due <= now()).length;
      dockDeck.textContent = 'Studiekort · ' + due;
      options.onCardsChange?.({total:cards.length,due});
    }
    const dock = make('div', { class: 'dock' });
    const dockImage = make('button', { class: 'btn', type: 'button' }, 'Lav billedkort');
    const dockDeck = make('button', { class: 'btn primary', type: 'button' }, 'Studiekort');
    dock.append(dockImage, dockDeck); root.appendChild(dock);
    if(options.showDock===false)dock.hidden=true;
    function clearFloating() { root.querySelector('.selection')?.remove(); }
    let restoreFocus=null;
    function closePanel() { root.querySelector('.scrim')?.remove(); restoreFocus?.focus?.({preventScroll:true}); }
    function panel(title, subtitle) {
      if(!root.querySelector('.scrim'))restoreFocus=document.activeElement;
      closePanel(); clearFloating();
      const scrim = make('div', { class: 'scrim' });
      const box = make('div', { class: 'panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': title });
      const head = make('div', { class: 'panel-head' });
      const labels = make('div'); labels.append(make('h2', {}, title), make('p', { class: 'sub' }, subtitle || ''));
      const close = make('button', { class: 'close', type: 'button', 'aria-label': 'Luk' }, '×');
      close.onclick = closePanel; head.append(labels, close); box.appendChild(head); scrim.appendChild(box); root.appendChild(scrim);
      box.tabIndex=-1;box.focus({preventScroll:true});
      box.addEventListener('keydown',event=>{
        if(event.key!=='Tab')return;
        const controls=[...box.querySelectorAll('button:not(:disabled),textarea,input,a[href]')];
        const focused=shadow.activeElement,index=controls.indexOf(focused);
        if(event.shiftKey&&(index<=0)){event.preventDefault();controls.at(-1)?.focus();}
        if(!event.shiftKey&&(index<0||index===controls.length-1)){event.preventDefault();controls[0]?.focus();}
      });
      scrim.addEventListener('pointerdown', event => { if (event.target === scrim) closePanel(); });
      return box;
    }
    async function editor() {
      const box = panel(draft.id?'Rediger studiekort':draft.type === 'image' ? 'Nyt billedkort' : 'Nyt tekstkort', 'Tilpas spørgsmålet og svaret, før kortet gemmes.');
      const first = make('div', { class: 'field' });
      first.append(make('label', { for: 'sk-front' }, 'Forside · spørgsmål'));
      const front = make('textarea', { id: 'sk-front', required: '' }); front.value = draft.front || ''; first.appendChild(front);
      const second = make('div', { class: 'field' });
      second.append(make('label', { for: 'sk-back' }, 'Bagside · svar'));
      const back = make('textarea', { id: 'sk-back', required: '' }); back.value = draft.answer || ''; second.appendChild(back);
      const note = make('div', { class: 'status' }, 'Kilde: ' + (draft.source.title || draft.source.bookId) + ' · ' + (draft.source.sectionTitle || draft.source.pageId) + '. Gemmes i denne browser.');
      const actions = make('div', { class: 'actions' });
      const cancel = make('button', { class: 'btn', type: 'button' }, 'Annuller');
      const save = make('button', { class: 'btn primary', type: 'button' }, 'Gem kort');
      cancel.onclick = closePanel;
      save.onclick = async () => {
        if (!front.value.trim() || !back.value.trim()) { notify('Udfyld både spørgsmål og svar.'); return; }
        const saved={ ...draft,id:draft.id||global.crypto?.randomUUID?.()||String(now())+Math.random(),front:front.value.trim(),answer:back.value.trim(),due:draft.due??now(),interval:draft.interval||0,reviews:draft.reviews||0,created:draft.created||now() };
        const index=cards.findIndex(c=>c.id===saved.id);if(index<0)cards.push(saved);else cards[index]=saved;
        await persist(); closePanel(); notify('Kortet er gemt.');
      };
      actions.append(cancel, save); box.append(first, second, note, actions); front.focus();
      if(draft.type==='image'){
        const imageUrl=await resolveImage(draft);
        if(imageUrl&&box.isConnected){const frame=make('div',{class:'image-frame'});frame.append(make('img',{src:imageUrl,alt:'Figuren på kortets forside'}),make('div',{class:'mask',style:{left:draft.mask.x+'%',top:draft.mask.y+'%',width:draft.mask.w+'%',height:draft.mask.h+'%'}},'?'));box.insertBefore(frame,first);}
      }
    }
    function selectionHandler() {
      if (pickMode) return;
      clearTimeout(selectionTimer);
      selectionTimer = setTimeout(() => {
        const selection = global.getSelection();
        const selected = selection?.toString().trim();
        if (!selected || selected.length < 3 || !reader.contains(selection.anchorNode) || !reader.contains(selection.focusNode)) { clearFloating(); return; }
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        clearFloating();
        const pop = make('div', { class: 'selection', style: { left: Math.max(8, Math.min(global.innerWidth - 160, rect.left)) + 'px', top: Math.max(8, rect.top - 47) + 'px' } });
        const button = make('button', { class: 'btn small', type: 'button' }, 'Lav tekstkort');
        button.onpointerdown = event => event.preventDefault();
        button.onclick = () => {
          let sentence = selected;
          const paragraph = selection.anchorNode?.parentElement?.closest('p');
          if (paragraph && paragraph.textContent.includes(selected)) sentence = paragraph.textContent.replace(selected, '[…]');
          draft = { type: 'text', front: sentence === selected ? 'Hvad mangler her? […]' : sentence, answer: selected, source: context() };
          editor();
        };
        pop.appendChild(button); root.appendChild(pop);
      }, 0);
    }
    if(options.selectionMenu!==false){reader.addEventListener('mouseup', selectionHandler);reader.addEventListener('keyup', selectionHandler);document.addEventListener('selectionchange', selectionHandler);}
    function stopPick() { pickMode = false; root.querySelector('.pick-tip')?.remove(); root.querySelector('.draw')?.remove(); dockImage.disabled = false; }
    function pickImage() {
      pickMode = true; clearFloating(); dockImage.disabled = true;
      const tip = make('div', { class: 'pick-tip' }, 'Klik på et billede i bogen.');
      const cancel = make('button', { type: 'button' }, 'Afslut'); cancel.onclick = stopPick; tip.appendChild(cancel); root.appendChild(tip);
      notify('Vælg et billede i bogsiden.');
    }
    function imageClick(event) {
      if (!pickMode) return;
      const image = event.target.closest?.('img');
      if (!image || !reader.contains(image)) return;
      event.preventDefault(); event.stopPropagation();
      const source = context(), key = imageKey(image), rect = image.getBoundingClientRect();
      stopPick();
      if (rect.width < 30 || rect.height < 30) { notify('Billedet er for lille til et kort.'); return; }
      const draw = make('div', { class: 'draw', style: { left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px' } });
      root.appendChild(draw);
      let start = null, shape = null;
      const pos = event => {
        const r = draw.getBoundingClientRect();
        return { x: Math.max(0, Math.min(100, 100 * (event.clientX - r.left) / r.width)), y: Math.max(0, Math.min(100, 100 * (event.clientY - r.top) / r.height)) };
      };
      draw.addEventListener('pointerdown', event => {
        event.preventDefault(); draw.setPointerCapture(event.pointerId); start = pos(event);
        shape = make('div', { class: 'drawing-box' }); draw.appendChild(shape);
      });
      draw.addEventListener('pointermove', event => {
        if (!start || !shape) return;
        const end = pos(event);
        Object.assign(shape.style, { left: Math.min(start.x, end.x) + '%', top: Math.min(start.y, end.y) + '%', width: Math.abs(start.x - end.x) + '%', height: Math.abs(start.y - end.y) + '%' });
      });
      draw.addEventListener('pointerup', event => {
        if (!start) return;
        const end = pos(event);
        let mask = { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), w: Math.abs(start.x - end.x), h: Math.abs(start.y - end.y) };
        if (mask.w < 3 || mask.h < 3) mask = { x: Math.max(0, Math.min(80, end.x - 10)), y: Math.max(0, Math.min(82, end.y - 9)), w: 20, h: 18 };
        start = null; draw.remove();
        draft = { type: 'image', front: 'Hvad er skjult i billedet?', answer: '', source, imageKey: key, mask };
        editor();
      });
    }
    reader.addEventListener('click', imageClick, true);
    function showDeck() {
      const box = panel('Mine studiekort', 'Tekstkort og figurkort · planlagt repetition.');
      const due = cards.filter(c => c.due <= now()).length;
      const stats = make('div', { class: 'stats' });
      for (const [value, label] of [[cards.length, 'Kort i alt'], [due, 'Klar nu']]) {
        const cell = make('div', { class: 'stat' }); cell.append(make('strong', {}, value), make('span', {}, label)); stats.appendChild(cell);
      }
      box.appendChild(stats);
      const start = make('button', { class: 'btn primary', type: 'button' }, 'Start repetition');
      start.disabled = !due;
      start.onclick = () => { queue = cards.filter(c => c.due <= now()).sort((a,b) => a.due - b.due).map(c => c.id); index = 0; revealed = false; showReview(); };
      box.appendChild(start);
      const list = make('div', { class: 'list', style: { marginTop: '18px' } });
      if (!cards.length) list.appendChild(make('div', { class: 'empty' }, 'Ingen kort endnu. Markér tekst eller vælg et billede i bogen.'));
      cards.slice().sort((a,b) => b.created - a.created).forEach(card => {
        const item = make('div', { class: 'item' });
        const left = make('div', { class: 'item-text' });
        left.append(make('strong', {}, card.front), make('small', {}, (card.source.title || card.source.bookId) + ' · ' + (card.source.sectionTitle||card.source.pageId) + ' · ' + (card.due <= now() ? 'klar nu' : 'Næste: '+new Date(card.due).toLocaleDateString('da-DK'))));
        const actions=make('div',{class:'card-actions'});
        const edit=make('button',{class:'btn small',type:'button'},'Rediger');edit.onclick=()=>{draft={...card};editor();};
        const source=make('button',{class:'btn small',type:'button'},'Vis i bogen');source.onclick=()=>{closePanel();options.openSource?.(card.source);};
        actions.append(edit,source);left.append(actions);
        item.append(left, make('span', { class: 'tag' }, card.type === 'image' ? 'Figur' : 'Tekst')); list.appendChild(item);
      });
      box.appendChild(list);
    }
    async function showReview() {
      const card = cards.find(c => c.id === queue[index]);
      if (!card) {
        const box = panel('Dagens kort er gennemgået', 'Næste repetition er planlagt.');
        const done = make('button', { class: 'btn primary', type: 'button' }, 'Se deck');
        done.onclick = showDeck; box.appendChild(done); return;
      }
      const box = panel('Repetition', 'Kort ' + (index + 1) + ' af ' + queue.length);
      box.appendChild(make('div', { class: 'review-front' }, card.front));
      if (card.type === 'image') {
        const imageUrl = await resolveImage(card);
        if (imageUrl) {
          const frame = make('div', { class: 'image-frame' + (revealed ? ' revealed' : '') });
          const image = make('img', { src: imageUrl, alt: 'Billede fra bogen' });
          const mask = make('div', { class: 'mask', style: { left: card.mask.x + '%', top: card.mask.y + '%', width: card.mask.w + '%', height: card.mask.h + '%' } }, revealed ? '' : '?');
          frame.append(image, mask); box.appendChild(frame);
        } else {
          const notice = make('div', { class: 'status' }, 'Åbn kildesiden for at vise dette billede. Leverandøren kan tilføje resolveImage for kort på andre sider.');
          const link = make('a', { href: card.source.url }, 'Åbn kildeside'); link.style.color = '#087daf'; notice.append(' ', link); box.appendChild(notice);
        }
      }
      if (revealed) {
        box.appendChild(make('div', { class: 'answer' }, card.answer));
        const rating = make('div', { class: 'rating' });
        for (const [name,label] of [['again','Igen'],['hard','Svær'],['good','God'],['easy','Let']]) {
          const button = make('button', { class: 'btn', type: 'button' }, label);
          button.onclick = async () => {
            const old = Math.max(0, card.interval || 0);
            const days = name === 'again' ? 0 : name === 'hard' ? Math.max(1,old * 1.2) : name === 'good' ? Math.max(3,old * 2.4) : Math.max(7,old * 3.5);
            Object.assign(card,options.planReview?.(card,name)||{interval:days,due:now()+(name==='again'?60000:days*DAY),reviews:(card.reviews||0)+1});
            await persist(); index++; revealed = false; showReview();
          };
          rating.appendChild(button);
        }
        box.appendChild(rating);
      } else {
        const reveal = make('button', { class: 'btn primary', type: 'button' }, 'Vis svar');
        reveal.onclick = () => { revealed = true; showReview(); };
        box.appendChild(reveal);
      }
    }
    dockImage.onclick = pickImage;
    dockDeck.onclick = showDeck;
    const keyHandler = event => { if (event.key === 'Escape') { stopPick(); closePanel(); clearFloating(); } };
    document.addEventListener('keydown', keyHandler);
    Promise.resolve(storage.load()).then(result => {
      cards = Array.isArray(result) ? result : [];
      updateDock();
    }).catch(error => notify('Kort kunne ikke indlæses: ' + error.message));
    return {
      openDeck: showDeck,
      unmount() { reader.removeEventListener('mouseup', selectionHandler); reader.removeEventListener('keyup', selectionHandler); reader.removeEventListener('click', imageClick, true); document.removeEventListener('selectionchange', selectionHandler); document.removeEventListener('keydown', keyHandler); host.remove(); },
      getCards() { return cards.map(card => ({ ...card })); }
      ,createTextCard(selected,paragraph,source){
        const answer=String(selected||'').trim();if(!answer)return;
        const front=paragraph?.includes(answer)?paragraph.replace(answer,'[…]'):'Hvad beskriver følgende tekst?';
        draft={...(options.textCardDraft?.(answer,paragraph)||{type:'text',front,answer}),source:source||context()};editor();
      }
      ,async createImageCard(imageKey,source){
        const value={type:'image',imageKey,source:source||context()};
        const url=await resolveImage(value);if(!url){notify('Figuren kunne ikke åbnes.');return;}
        const box=panel('Lav kort fra figur','Træk et felt over det, du vil skjule. Et klik skjuler et mindre område.');
        const frame=make('div',{class:'image-frame figure-picker'}),image=make('img',{src:url,alt:'Vælg det område på figuren, der skal skjules',draggable:'false'}),layer=make('div',{class:'figure-draw'});
        frame.append(image,layer);box.append(frame);
        let start=null,shape=null;
        const point=e=>{const r=layer.getBoundingClientRect();return{x:Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100)),y:Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100))};};
        layer.onpointerdown=e=>{e.preventDefault();layer.setPointerCapture(e.pointerId);start=point(e);shape=make('div',{class:'drawing-box'});layer.append(shape);};
        layer.onpointermove=e=>{if(!start)return;const end=point(e);Object.assign(shape.style,{left:Math.min(start.x,end.x)+'%',top:Math.min(start.y,end.y)+'%',width:Math.abs(start.x-end.x)+'%',height:Math.abs(start.y-end.y)+'%'});};
        layer.onpointerup=e=>{if(!start)return;const end=point(e);let mask={x:Math.min(start.x,end.x),y:Math.min(start.y,end.y),w:Math.abs(start.x-end.x),h:Math.abs(start.y-end.y)};
          if(mask.w<3||mask.h<3)mask={x:Math.max(0,Math.min(80,end.x-10)),y:Math.max(0,Math.min(82,end.y-9)),w:20,h:18};
          start=null;mask=options.normalizeMask?.(mask)||mask;draft={...value,mask,front:'Hvad er skjult i figuren?',answer:''};editor();};
      }
    };
  }
  global.StudiekortWidget = { mount, version: '0.1.0' };
})(window);
