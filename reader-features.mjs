import {book,figures,paragraphIndex} from './data.mjs?v=20261015-toggle2';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalized=value=>String(value).toLocaleLowerCase('da').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const aliases={asthma:['dyspnø','pibende','hvæsende','rhonchi','hoste','åndenød','trykken','natlig'],copd:['dyspnø','åndenød','opspyt','kronisk hoste','emfysem'],aat:['sjælden','arvelig','ung','emfysem','lever','familiær','alfa 1','aat'],eczema:['derma','udslæt','kløe','blærer','vesikler','hænder','eksem']};
const glossary={alveoler:'Små luftfyldte hulrum i lungerne, hvor luft og blod ligger tæt på hinanden.',spirometri:'En måling af lungefunktionen. Målingen beskriver blandt andet, hvordan luft bevæger sig ud af lungerne.',dyspnø:'Det lægefaglige ord for åndenød.',vesikler:'Små væskefyldte blærer i huden.',bronkier:'Luftveje, som forgrener sig fra luftrøret ind i lungerne.',mellemgulvet:'Musklen under lungerne, som bidrager til indåndingen.',kuldioxid:'En gas, kroppen afgiver gennem udåndingen.'};
const explanations={
  'resp-intro-1':['Vejrtrækning skifter luften i lungerne. Kroppen optager ilt og afgiver kuldioxid.','Tænk på et åndedrag som to faser: luft ind, derefter luft ud.'],
  'resp-in-1':['Når brysthulen bliver større, falder trykket i lungerne. Derfor strømmer luft ind.','Følg kæden: muskler arbejder → mere plads → lavere tryk → indånding.'],
  'resp-out-1':['I hvile kan udåndingen ske, når musklerne slapper af, og brystkassen vender tilbage.','Sammenlign med indåndingen: Hvilke dele af kæden vender retning?'],
  'lungs-anatomy-1':['Lungerne ligger i brystkassen. Lungehinden knytter lungerne til brysthulen.','Se thoraxbilledet, og find de to lungefelter omkring hjerteskyggen.'],
  'lungs-airways-1':['Luften passerer gennem en række luftveje, der bliver mindre og mindre. De ender i alveoler.','Følg pilene på figuren: mund eller næse → luftrør → bronkier → alveoler.'],
  'lungs-exchange-1':['I alveolerne bevæger ilt sig mod blodet, mens kuldioxid bevæger sig mod luften.','Tegn to pile i hver sin retning, og sæt navn på gasserne.'],
  'asthma-overview-1':['Astma er en vedvarende betændelsestilstand i luftvejene. Symptomerne kan komme og gå.','En person kan have få symptomer i en periode og flere i en anden.'],
  'asthma-overview-2':['Både arvelige forhold og omgivelser kan spille ind, og forløbet varierer mellem personer.','To personer med samme diagnose kan opleve symptomer med forskellig hyppighed.'],
  'asthma-symptoms-1':['Se efter mønstret i symptomerne: hvornår de kommer, og hvad de hænger sammen med.','Notér tidspunkt og påvirkning ved siden af hvert symptom, når du læser en case.'],
  'asthma-alert-1':['Svært påvirket tale, udmattelse og påvirket bevidsthed er alvorlige fund i afsnittet.','Adskil typiske symptomer fra tegn på et alvorligt anfald i dine noter.'],
  'asthma-assessment-1':['Sygehistorie og målinger af lungefunktion bruges sammen, når tilstanden vurderes.','Lav to kolonner: hvad personen fortæller, og hvad undersøgelserne viser.'],
  'copd-findings-1':['KOL-opslaget beskriver symptomer, som ofte udvikler sig gradvist.','Sammenlign et gradvist forløb med astmaopslagets variation over tid.'],
  'copd-assessment-1':['Spirometri og mulige andre forklaringer indgår i udredningen.','Åbn sammenligningen mellem KOL, astma og alfa-1-antitrypsinmangel.'],
  'aat-overview-1':['Den arvelige tilstand kan påvirke både lunger og lever.','Saml spor fra flere organer i stedet for kun at tænke på lungerne.'],
  'aat-assessment-1':['Blodprøver og genetiske undersøgelser bidrager til udredningen.','Knyt hver undersøgelse til det spørgsmål, den hjælper med at afklare.'],
  'eczema-findings-1':['Beskriv hudforandringerne med form, placering og forløb.','Find ordet vesikler og sammenhold det med billedets beskrivelse.'],
  'eczema-context-1':['Hudforandringer læses sammen med oplysninger om påvirkninger i hverdagen.','Lav en liste over, hvilke oplysninger du ville spørge efter i en case.']
};
const clinical={
  asthma:{facts:[['Typiske fund','Hoste, åndenød og trykken for brystet. Symptomer kan variere.','asthma-overview'],['Faresignaler','Talebesvær, udmattelse eller påvirket bevidsthed ved svære anfald.','asthma-symptoms'],['Undersøgelser','Sygehistorie og lungefunktionsmåling i sammenhæng.','asthma-assessment'],['Kan ligne','KOL. Sammenhold forløbet og undersøgelserne.','asthma-assessment']],compare:['Hoste, åndenød, trykken','Varierende symptomer','Sygehistorie og lungefunktion','Variation og udløsende påvirkninger']},
  copd:{facts:[['Typiske fund','Langvarig hoste, opspyt og åndenød ved aktivitet.','copd-findings'],['Vær opmærksom på','Tidlig sygdom og familiehistorie kan pege på andre forklaringer.','copd-assessment'],['Undersøgelser','Spirometri og sygehistorie.','copd-assessment'],['Kan ligne','Astma; tilstandene kan også optræde sammen.','copd-assessment']],compare:['Hoste, opspyt, åndenød','Ofte gradvis udvikling','Spirometri','Vedvarende luftvejsobstruktion']},
  aat:{facts:[['Relevant ved','Tidligt opstået eller familiær lungesygdom.','aat-overview'],['Vær opmærksom på','Lunger og lever kan være involveret.','aat-overview'],['Undersøgelser','AAT i blodet og genetiske undersøgelser.','aat-assessment'],['Kan ligne','Andre årsager til KOL og leversygdom.','aat-assessment']],compare:['Lunge- og leverpåvirkning','Arvelig tilstand','AAT-måling og genetik','Tidlig debut og familiehistorie']},
  eczema:{facts:[['Se efter','Udslættets form, placering og forløb.','eczema-findings'],['Begreber','Vesikler: små væskefyldte blærer.','eczema-findings'],['Sygehistorie','Arbejde, handsker og kontakt med forskellige stoffer.','eczema-context'],['Visuelt opslag','Se det kliniske eksempel i billedatlasset.','eczema-findings']]}
};
const learningGoals={
  respiration:['Beskrive, hvorfor kroppen optager ilt og afgiver kuldioxid.','Forklare mekanismen bag indånding.','Forklare udåndingen i hvile.'],
  lungs:['Beskrive lungernes placering og lungehindens rolle.','Følge luftens vej fra mund og næse til alveolerne.','Forklare retningen af gasudvekslingen.'],
  asthma:['Forklare astma som en betændelsestilstand i luftvejene.','Beskrive symptomer og kende de alvorlige fund i afsnittet.','Forklare, hvordan sygehistorie og lungefunktion indgår i vurderingen.'],
  copd:['Beskrive det typiske symptomforløb ved KOL.','Forklare spirometriens rolle og sammenligne med astma.'],
  aat:['Knytte den arvelige tilstand til lunge- og leverpåvirkning.','Beskrive de undersøgelser, som nævnes i afsnittet.'],
  eczema:['Beskrive hudforandringerne og forklare begrebet vesikler.','Sætte fundene i sammenhæng med sygehistorien.']
};
export function clinicalMatches(chapter,query){const q=normalized(query);if(!q)return false;return (aliases[chapter.id]||[]).some(term=>normalized(term).includes(q)||q.split(/\s+/).includes(normalized(term)));}
export function imageSearchResults(query){return figures.filter(f=>normalized([f.title,f.type,f.body,...f.tags].join(' ')).includes(normalized(query))).map(f=>({title:f.title,chapterId:f.chapterId,sectionId:f.sectionId,figureId:f.id,meta:'Billedatlas · '+f.type,text:f.caption}));}
let authorLayerCounter=0;
export function authorAnnotationMarkup(f){
  const a=f.authorAnnotations;if(!a)return '';
  const marker='author-arrow-'+f.id+'-'+authorLayerCounter++;
  const point=p=>[p[0]*a.width/100,p[1]*a.height/100];
  return `<div class="author-annotation-layer" data-author-layer="${f.id}" aria-hidden="true" hidden><svg viewBox="0 0 ${a.width} ${a.height}" xmlns="http://www.w3.org/2000/svg"><defs>${a.arrows.map((arrow,i)=>`<marker id="${marker}-${i}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 8 4 0 8Z" fill="${arrow.color}"/></marker>`).join('')}</defs>${a.regions.map(region=>`<polygon points="${region.points.map(p=>point(p).join(',')).join(' ')}" fill="${region.color}" fill-opacity=".26" stroke="${region.color}" stroke-width="2" vector-effect="non-scaling-stroke"/>`).join('')}${a.arrows.map((arrow,i)=>{const [x1,y1]=point(arrow.from),[x2,y2]=point(arrow.to);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${arrow.color}" stroke-width="3" vector-effect="non-scaling-stroke" marker-end="url(#${marker}-${i})"/>`;}).join('')}</svg>${a.labels.map(label=>`<span class="author-annotation-label" style="left:${label.x}%;top:${label.y}%;background:${label.color}">${escape(label.text)}</span>`).join('')}</div>`;
}
const authorFigureToggle=f=>`<label class="author-toggle author-figure-toggle"><input type="checkbox" role="switch" data-author-figure="${f.id}" aria-label="Forfatterens annotationer på ${escape(f.title)}"><span class="toggle-track" aria-hidden="true"></span><span>Forfatterens annotationer</span><small>Demo</small></label><p class="author-annotation-description" data-author-description="${f.id}" hidden>${escape(f.authorAnnotations.description)}</p>`;
export function figureMarkup(id){const f=figures.find(f=>f.id===id);if(!f)return '';const a=f.authorAnnotations;return `<figure class="book-figure"><div class="figure-image-stage" style="max-width:${Math.round(410*a.width/a.height)}px"><img src="${f.src}" data-study-image-id="${f.id}" alt="${escape(f.title)}" loading="lazy">${authorAnnotationMarkup(f)}</div><figcaption><strong>${escape(f.title)}</strong><span>${escape(f.caption)}</span><small>${f.sourceUrl?`<a href="${f.sourceUrl}" target="_blank" rel="noopener noreferrer">${escape(f.credit)}</a> · <a href="${f.licenseUrl}" target="_blank" rel="noopener noreferrer">Licens</a>`:escape(f.credit)}</small></figcaption>${authorFigureToggle(f)}<div class="figure-actions"><button type="button" data-figure-card="${f.id}">Opret kort fra figur</button><button type="button" data-atlas-open="${f.id}">Se i billedatlas</button><button type="button" data-pin-figure="${f.id}">Gem som vagtkort</button></div></figure>`;}

export function createReaderFeatures({getState,goToChapter,jumpToSection,search,createImageCard}){
  const key='laegereolen-features-v1',statuses=['unread','read','repeat'];let stored={progress:{},pins:[],authorAnnotations:false,authorOverrides:{}};
  try{const data=JSON.parse(localStorage.getItem(key));if(data&&typeof data==='object'){stored.progress=data.progress&&typeof data.progress==='object'?data.progress:{};stored.pins=Array.isArray(data.pins)?data.pins.filter(p=>p&&typeof p.id==='string'&&book.chapters.some(c=>c.id===p.chapterId)&&typeof p.title==='string'&&typeof p.group==='string'):[];}}catch{}
  const persist=()=>{try{localStorage.setItem(key,JSON.stringify(stored));}catch{}};
  try{const data=JSON.parse(localStorage.getItem(key));if(typeof data?.authorAnnotations==='boolean')stored.authorAnnotations=data.authorAnnotations;for(const f of figures)if(typeof data?.authorOverrides?.[f.id]==='boolean')stored.authorOverrides[f.id]=data.authorOverrides[f.id];}catch{}
  const authorEnabled=id=>stored.authorOverrides[id]??stored.authorAnnotations;
  function syncAuthorAnnotations(){
    document.querySelectorAll('[data-author-global]').forEach(input=>input.checked=stored.authorAnnotations);
    document.querySelectorAll('[data-author-figure]').forEach(input=>input.checked=authorEnabled(input.dataset.authorFigure));
    document.querySelectorAll('[data-author-layer]').forEach(layer=>layer.hidden=(getState().mode!=='study'&&!layer.closest('.feature-dialog'))||!authorEnabled(layer.dataset.authorLayer));
    document.querySelectorAll('[data-author-description]').forEach(text=>text.hidden=(getState().mode!=='study'&&!text.closest('.feature-dialog'))||!authorEnabled(text.dataset.authorDescription));
    const setting=document.querySelector('#author-annotations-setting');if(setting)setting.hidden=getState().mode!=='study';
  }
  const dialog=document.createElement('dialog');dialog.className='feature-dialog';document.body.append(dialog);
  let atlasFilter='Alle',atlasQuery='',atlasSelected=[],compareSelected=['asthma','copd'],activeFigure=null,pinGroup='Alle';
  const status=id=>statuses.includes(stored.progress[id])?stored.progress[id]:'unread';
  const chapter=()=>book.chapters.find(c=>c.id===getState().chapterId);
  const open=(title,content,wide=false)=>{dialog.classList.toggle('wide-dialog',wide);dialog.setAttribute('aria-label',title);dialog.innerHTML=`<div class="feature-dialog-head"><div><span class="field-label">Lægereolen</span><h2>${escape(title)}</h2></div><button type="button" class="icon-button" data-feature-close aria-label="Luk ${escape(title)}">×</button></div>${content}`;if(!dialog.open)dialog.showModal();};
  const locate=(c,s)=>{dialog.close();goToChapter(c,s);};
  function renderSidebar(){
    document.querySelectorAll('.section-link').forEach(button=>{button.querySelector('.reading-status-dot')?.remove();if(getState().mode==='study'){const dot=document.createElement('span');dot.className='reading-status-dot '+status(button.dataset.sectionGo);dot.title={unread:'Ikke læst',read:'Læst',repeat:'Skal repeteres'}[status(button.dataset.sectionGo)];dot.setAttribute('aria-label',dot.title);button.append(dot);}});
    const count=document.querySelector('#watch-count');if(count)count.textContent=stored.pins.length;
    const shortcut=document.querySelector('.sidebar-shortcuts [data-feature-watch]');if(shortcut)shortcut.hidden=getState().mode!=='clinical';
  }
  function decorate(){
    renderSidebar();const article=document.querySelector('#book-article'),c=chapter();
    document.querySelector('#search-input').placeholder=getState().mode==='clinical'?'Søg symptom, fund, sygdom eller billede…':'Søg i kapitler, afsnit og noter…';
    if(getState().mode==='clinical'){
      const facts=clinical[c.id]?.facts||c.sections.map(s=>[s.title,s.paragraphs[0].text,s.id]);
      const tools=document.createElement('section');tools.className='clinical-tools';tools.setAttribute('aria-label','Kliniske værktøjer');
      tools.innerHTML=`<div class="clinical-tool-row"><button type="button" data-feature-search>⌕ Søg på symptom eller fund</button><button type="button" data-feature-atlas>Billedatlas</button><button type="button" data-feature-compare>Sammenlign diagnoser</button><button type="button" data-feature-watch>Mine vagtkort <span>${stored.pins.length}</span></button></div><div class="clinical-search-hints"><span>Prøv:</span>${['åndenød','udslæt','sjælden'].map(q=>`<button type="button" data-find-term="${q}">${q}</button>`).join('')}</div><details class="quick-overview" open><summary><span>Overblik på 30 sekunder</span><small>Fra bogens afsnit</small></summary><div class="quick-grid">${facts.map(([title,text,id])=>`<div class="quick-fact ${title==='Faresignaler'?'alert-fact':''}"><h3>${escape(title)}</h3><p>${escape(text)}</p><div><button type="button" data-quick-go="${id}">Vis afsnit →</button><button type="button" data-pin-section="${id}" aria-label="Gem ${escape(title)} som vagtkort">Gem</button></div></div>`).join('')}</div></details>`;
      const subtitle=article.querySelector('.chapter-subtitle');subtitle?.after(tools);
      article.querySelectorAll('.reading-section').forEach(section=>{const button=document.createElement('button');button.type='button';button.className='section-save';button.dataset.pinSection=section.id;button.textContent='Gem afsnit som vagtkort';section.append(button);});
    }
    if(getState().mode==='study'){
      const read=c.sections.filter(s=>status(s.id)==='read').length;
      const goals=document.createElement('details');goals.className='learning-goals';goals.open=true;
      goals.innerHTML=`<summary>Det skal du kunne <small>${read} af ${c.sections.length} afsnit læst</small></summary><ul>${(learningGoals[c.id]||c.sections.map(s=>'Forklare '+s.title.toLocaleLowerCase('da')+' med egne ord.')).map(goal=>`<li>${escape(goal)}</li>`).join('')}</ul><div class="learning-progress"><span style="width:${read/c.sections.length*100}%"></span></div>${c.sections.some(s=>s.figureId)?'<label class="author-toggle author-chapter-toggle"><input type="checkbox" role="switch" data-author-global aria-label="Vis alle forfatterannotationer"><span class="toggle-track" aria-hidden="true"></span><span>Vis alle forfatterannotationer</span></label>':''}`;
      article.querySelector('.chapter-subtitle')?.after(goals);
      article.querySelectorAll('.reading-section').forEach(section=>{
        const label=document.createElement('label');label.className='section-progress';label.innerHTML=`<span>Læsestatus</span><select aria-label="Læsestatus for ${escape(c.sections.find(s=>s.id===section.id).title)}" data-reading-status="${section.id}"><option value="unread">Ikke læst</option><option value="read">Læst</option><option value="repeat">Skal repeteres</option></select>`;label.querySelector('select').value=status(section.id);section.querySelector('h2').after(label);
      });
      article.querySelectorAll('[data-paragraph]').forEach(p=>{
        const row=p.closest('.paragraph-row');const button=document.createElement('button');button.className='explain-paragraph';button.type='button';button.dataset.explainParagraph=p.dataset.paragraph;button.setAttribute('aria-label','Forklar afsnit: '+p.textContent.slice(0,45));button.textContent='Forklar';row.append(button);
        const walker=document.createTreeWalker(p,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
        for(const node of nodes){if(node.parentElement.closest('mark'))continue;const terms=Object.keys(glossary),regex=new RegExp('\\b('+terms.join('|')+')\\b','gi');let match,last=0;const fragment=document.createDocumentFragment();let changed=false;
          while((match=regex.exec(node.textContent))){fragment.append(document.createTextNode(node.textContent.slice(last,match.index)));const term=document.createElement('button');term.type='button';term.className='glossary-term';term.dataset.explainTerm=match[0].toLocaleLowerCase('da');term.dataset.termParagraph=p.dataset.paragraph;term.textContent=match[0];fragment.append(term);last=match.index+match[0].length;changed=true;}if(changed){fragment.append(document.createTextNode(node.textContent.slice(last)));node.replaceWith(fragment);}
        }
      });
    }
    syncAuthorAnnotations();
  }
  function explain(id,term){const p=paragraphIndex[id];if(!p)return;const s=book.chapters.find(c=>c.id===p.chapterId).sections.find(s=>s.id===p.sectionId);const content=explanations[id]||[p.text,'Læs sætningen i sammenhæng med resten af afsnittet.'];
    open(term?'Begreb: '+term:'Forstå afsnittet',`<p class="feature-context">${escape(s.title)} · ${escape(book.title)}</p>${term?`<div class="simple-explanation"><h3>Betydning</h3><p>${escape(glossary[term])}</p></div>`:''}<div class="simple-explanation"><h3>Kort fortalt</h3><p>${escape(content[0])}</p></div><div class="example-explanation"><h3>Eksempel eller huskeregel</h3><p>${escape(content[1])}</p></div><details class="explanation-original"><summary>Se den oprindelige bogtekst</summary><blockquote>${escape(p.text)}</blockquote></details><button type="button" class="action-primary" data-source-go="${p.chapterId}" data-source-section="${p.sectionId}">Tilbage til afsnittet</button>`);
  }
  function atlas(){activeFigure=null;open('Billedatlas',`<p class="feature-context">Find et visuelt eksempel, og gå direkte til afsnittet i bogen.</p><div class="atlas-controls"><label>Søg efter billede<input id="atlas-search" type="search" value="${escape(atlasQuery)}" placeholder="Fx thorax, blærer eller alveoler"></label><label>Billedtype<select id="atlas-filter">${['Alle','Anatomi','Røntgen','Dermatologi'].map(t=>`<option ${atlasFilter===t?'selected':''}>${t}</option>`).join('')}</select></label></div><div id="atlas-results"></div>`,true);renderAtlasResults();}
  function renderAtlasResults(){const list=figures.filter(f=>(atlasFilter==='Alle'||f.type===atlasFilter)&&normalized([f.title,f.body,...f.tags].join(' ')).includes(normalized(atlasQuery)));const root=dialog.querySelector('#atlas-results');if(!root)return;
    root.innerHTML=`<div class="atlas-grid">${list.map(f=>`<article class="atlas-tile"><button type="button" data-atlas-detail="${f.id}"><img src="${f.src}" alt="${escape(f.title)}"><span class="field-label">${f.type} · ${f.body}</span><strong>${escape(f.title)}</strong></button><label class="atlas-select"><input type="checkbox" data-atlas-compare="${f.id}" ${atlasSelected.includes(f.id)?'checked':''}>Sammenlign billede</label></article>`).join('')}</div>${!list.length?'<p class="empty-state">Ingen billeder matcher. Prøv en anden søgning.</p>':''}<button type="button" class="action-primary" data-atlas-compare-show ${atlasSelected.length<2?'disabled':''}>Sammenlign ${atlasSelected.length} billeder</button>`;}
  function atlasDetail(id){const f=figures.find(f=>f.id===id);if(!f)return;activeFigure=id;
    open(f.title,`<div class="atlas-detail-image" style="--atlas-ratio:${f.authorAnnotations.width/f.authorAnnotations.height}"><img src="${f.src}" alt="${escape(f.title)}">${authorAnnotationMarkup(f)}</div><p>${escape(f.caption)}</p><p class="atlas-credit">${f.sourceUrl?`<a href="${f.sourceUrl}" target="_blank" rel="noopener noreferrer">${escape(f.credit)}</a> · <a href="${f.licenseUrl}" target="_blank" rel="noopener noreferrer">Licens</a>`:escape(f.credit)}</p>${authorFigureToggle(f)}<div class="feature-actions"><button type="button" data-feature-atlas>← Billedatlas</button><button type="button" data-source-go="${f.chapterId}" data-source-section="${f.sectionId}">Vis i bogen</button><button type="button" data-pin-figure="${f.id}">Gem som vagtkort</button><button type="button" class="action-primary" data-figure-card="${f.id}">Opret kort fra figur</button></div>`,true);syncAuthorAnnotations();
  }
  function compare(){const choices=['asthma','copd','aat'].map(id=>book.chapters.find(c=>c.id===id));open('Sammenlign diagnoser',`<p class="feature-context">Vælg to eller tre opslag. Hvert opslag kan åbnes i bogen.</p><div class="diagnosis-picks">${choices.map(c=>`<label><input type="checkbox" data-diagnosis-pick="${c.id}" ${compareSelected.includes(c.id)?'checked':''}>${escape(c.title)}</label>`).join('')}</div><div id="diagnosis-comparison"></div>`,true);renderComparison();}
  function renderComparison(){const root=dialog.querySelector('#diagnosis-comparison');const chosen=compareSelected.map(id=>book.chapters.find(c=>c.id===id));root.innerHTML=chosen.length<2?'<p class="empty-state">Vælg mindst to diagnoser.</p>':`<div class="table-wrap"><table class="comparison-table"><thead><tr><th>Det vil du afklare</th>${chosen.map(c=>`<th>${escape(c.title)}</th>`).join('')}</tr></thead><tbody>${['Symptomer','Forløb','Undersøgelser','Adskillende spor'].map((label,i)=>`<tr><th>${label}</th>${chosen.map(c=>`<td>${escape(clinical[c.id].compare[i])}</td>`).join('')}</tr>`).join('')}<tr><th>Kilde i bogen</th>${chosen.map(c=>`<td><button type="button" data-source-go="${c.id}" data-source-section="${c.sections[iSection(c.id)].id}">Læs ${escape(c.title)} →</button></td>`).join('')}</tr></tbody></table></div><p class="atlas-credit">Eksempelopslag baseret på Lægehåndbogen. Sammenligningen viser udvalgte forhold.</p>`;}
  const iSection=id=>id==='asthma'?2:1;
  function savePin(chapterId,sectionId,figureId){const c=book.chapters.find(c=>c.id===chapterId),s=c.sections.find(s=>s.id===sectionId),f=figures.find(f=>f.id===figureId);
    open('Gem som vagtkort',`<p class="feature-context">Et hurtigt link til ${escape(f?.title||s.title)}.</p><form id="save-watch-form"><label class="feature-field">Titel<input id="watch-title" value="${escape(f?.title||c.title+' · '+s.title)}" maxlength="160" required></label><label class="feature-field">Samling<input id="watch-group" value="Akutmodtagelsen" list="watch-groups" maxlength="60" required></label><datalist id="watch-groups">${['Akutmodtagelsen','Dermatologi',...new Set(stored.pins.map(p=>p.group))].map(g=>`<option value="${escape(g)}"></option>`).join('')}</datalist><div class="feature-actions"><button type="button" data-feature-close>Annuller</button><button class="action-primary" type="submit">Gem vagtkort</button></div></form>`);
    dialog.querySelector('form').onsubmit=e=>{e.preventDefault();stored.pins.push({id:crypto.randomUUID(),chapterId,sectionId,figureId,title:dialog.querySelector('#watch-title').value.trim(),group:dialog.querySelector('#watch-group').value.trim()});persist();renderSidebar();watch();};
  }
  function watch(){const groups=['Alle',...new Set(stored.pins.map(p=>p.group))];if(!groups.includes(pinGroup))pinGroup='Alle';open('Mine vagtkort',`<p class="feature-context">Dine gemte afsnit og billeder, samlet til hurtige opslag.</p><div class="watch-groups">${groups.map(g=>`<button type="button" data-watch-group="${escape(g)}" aria-pressed="${g===pinGroup}">${escape(g)}</button>`).join('')}</div><div class="watch-list">${stored.pins.filter(p=>pinGroup==='Alle'||p.group===pinGroup).map(p=>`<article class="watch-card"><span class="field-label">${escape(p.group)} · ${p.figureId?'Billede':'Bogafsnit'}</span><h3>${escape(p.title)}</h3><div class="feature-actions"><button type="button" class="action-primary" data-watch-open="${p.id}">Åbn opslag</button><button type="button" data-watch-delete="${p.id}" aria-label="Fjern vagtkort ${escape(p.title)}">Fjern</button></div></article>`).join('')||'<p class="empty-state">Gem et afsnit fra det kliniske overblik eller et billede fra atlasset.</p>'}</div>`);}
  document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;
    if(button.hasAttribute('data-feature-close'))dialog.close();
    if(button.hasAttribute('data-feature-search'))search('');
    if(button.dataset.findTerm)search(button.dataset.findTerm);
    if(button.hasAttribute('data-feature-atlas'))atlas();
    if(button.dataset.atlasOpen)atlasDetail(button.dataset.atlasOpen);
    if(button.dataset.atlasDetail)atlasDetail(button.dataset.atlasDetail);
    if(button.hasAttribute('data-feature-compare'))compare();
    if(button.hasAttribute('data-feature-watch'))watch();
    if(button.dataset.quickGo)jumpToSection(button.dataset.quickGo);
    if(button.dataset.pinSection)savePin(chapter().id,button.dataset.pinSection);
    if(button.dataset.pinFigure){const f=figures.find(f=>f.id===button.dataset.pinFigure);if(f)savePin(f.chapterId,f.sectionId,f.id);}
    if(button.dataset.figureCard){const f=figures.find(f=>f.id===button.dataset.figureCard);if(f){dialog.close();createImageCard(f);}}
    if(button.dataset.explainParagraph)explain(button.dataset.explainParagraph);
    if(button.dataset.explainTerm)explain(button.dataset.termParagraph,button.dataset.explainTerm);
    if(button.dataset.sourceGo)locate(button.dataset.sourceGo,button.dataset.sourceSection);
    if(button.dataset.watchGroup){pinGroup=button.dataset.watchGroup;watch();}
    if(button.dataset.watchDelete){stored.pins=stored.pins.filter(p=>p.id!==button.dataset.watchDelete);persist();renderSidebar();watch();}
    if(button.dataset.watchOpen){const p=stored.pins.find(p=>p.id===button.dataset.watchOpen);if(p?.figureId)atlasDetail(p.figureId);else if(p)locate(p.chapterId,p.sectionId);}
    if(button.hasAttribute('data-atlas-compare-show')){const selected=atlasSelected.map(id=>figures.find(f=>f.id===id));open('Sammenlign billeder',`<div class="atlas-compare-grid">${selected.map(f=>`<article><img src="${f.src}" alt="${escape(f.title)}"><h3>${escape(f.title)}</h3><p>${escape(f.caption)}</p><button type="button" data-atlas-detail="${f.id}">Se detaljer</button></article>`).join('')}</div>`,true);}
  });
  document.addEventListener('change',event=>{
    const target=event.target;
    if(target.hasAttribute('data-author-global')){stored.authorAnnotations=target.checked;stored.authorOverrides={};persist();syncAuthorAnnotations();}
    if(target.dataset.authorFigure){stored.authorOverrides[target.dataset.authorFigure]=target.checked;persist();syncAuthorAnnotations();}
    if(target.dataset.readingStatus){stored.progress[target.dataset.readingStatus]=target.value;persist();renderSidebar();const c=chapter(),read=c.sections.filter(s=>status(s.id)==='read').length;document.querySelector('.learning-goals summary small').textContent=`${read} af ${c.sections.length} afsnit læst`;document.querySelector('.learning-progress span').style.width=read/c.sections.length*100+'%';}
    if(target.id==='atlas-filter'){atlasFilter=target.value;renderAtlasResults();}
    if(target.dataset.atlasCompare){atlasSelected=target.checked?[...new Set([...atlasSelected,target.dataset.atlasCompare])]:atlasSelected.filter(id=>id!==target.dataset.atlasCompare);renderAtlasResults();}
    if(target.dataset.diagnosisPick){compareSelected=target.checked?[...compareSelected,target.dataset.diagnosisPick]:compareSelected.filter(id=>id!==target.dataset.diagnosisPick);renderComparison();}
  });
  dialog.addEventListener('input',event=>{if(event.target.id==='atlas-search'){atlasQuery=event.target.value;renderAtlasResults();}});
  return {decorate,renderSidebar,atlasDetail,syncAuthorAnnotations};
}
