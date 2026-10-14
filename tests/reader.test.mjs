import test from 'node:test';
import assert from 'node:assert/strict';
import {book,figures} from '../data.mjs';
import {textCardDraft,planReview,normalizeMask} from '../study-core.mjs';
import {cleanAnnotation} from '../annotations.mjs';
import {clinicalMatches,imageSearchResults,authorAnnotationMarkup} from '../reader-features.mjs';
test('older annotations migrate to yellow without losing their text or note',()=>{
  const old={id:'legacy',paragraphId:'p',start:3,end:7,note:'Husk dette.'},index={p:{id:'p',chapterId:'c',text:'En lunge.'}};
  assert.equal(cleanAnnotation(old,index).color,'yellow');assert.equal(cleanAnnotation({...old,color:'blue'},index).note,'Husk dette.');assert.equal(cleanAnnotation({...old,color:'untrusted'},index).color,'yellow');
});
test('a text card conceals the selected fact while preserving the source context',()=>{
  const paragraph='Luftvejene ender i alveoler.';const card=textCardDraft('alveoler',paragraph);
  assert.equal(card.answer,'alveoler');assert.ok(!card.front.includes('alveoler'));assert.equal(card.front.replace('[…]',card.answer),paragraph);assert.equal(textCardDraft('',paragraph),null);
});
test('reviewing advances the due date and preserves the source and answer',()=>{
  const card={source:{pageId:'lungs-airways'},answer:'Bronkier',reviews:3,interval:4},snapshot=structuredClone(card),now=1792022400000;
  const hard=planReview(card,'hard',now),good=planReview(card,'good',now),easy=planReview(card,'easy',now);
  assert.ok(hard.due>now&&good.due>hard.due&&easy.due>good.due);assert.equal(planReview(card,'again',now).due-now,60000);assert.equal(good.reviews,4);assert.deepEqual(card,snapshot);
});
test('figure mask coordinates stay inside the image regardless of viewport size',()=>{
  const mask=normalizeMask({x:94,y:93,w:20,h:20});assert.equal(mask.x+mask.w,100);assert.equal(mask.y+mask.h,100);assert.equal(normalizeMask({x:1,y:2,w:0,h:10}),null);assert.equal(normalizeMask({x:NaN,y:0,w:3,h:4}),null);
});
test('every atlas image has a real chapter and section source',()=>{
  for(const f of figures){const c=book.chapters.find(c=>c.id===f.chapterId);assert.ok(c);assert.ok(c.sections.some(s=>s.id===f.sectionId&&s.figureId===f.id));}
  assert.ok(imageSearchResults('blærer').some(r=>r.figureId==='hand-eczema'));
});
test('clinical synonym search finds breathlessness and rare disease without substring false positives',()=>{
  assert.ok(clinicalMatches(book.chapters.find(c=>c.id==='asthma'),'dyspnø'));
  assert.ok(clinicalMatches(book.chapters.find(c=>c.id==='aat'),'sjælden sygdom'));
  assert.equal(clinicalMatches(book.chapters.find(c=>c.id==='aat'),'lungerne'),false);
});
test('author regions and arrows stay inside the image and do not collide across views',()=>{
  const ids=[];
  for(const f of figures){
    const a=f.authorAnnotations;assert.ok(a.width>0&&a.height>0);
    for(const p of [...a.regions.flatMap(r=>r.points),...a.arrows.flatMap(r=>[r.from,r.to])])assert.ok(p.every(n=>Number.isFinite(n)&&n>=0&&n<=100));
    for(let i=0;i<2;i++){const markup=authorAnnotationMarkup(f);assert.ok(markup.includes('hidden'));ids.push(...[...markup.matchAll(/<marker id="([^"]+)"/g)].map(match=>match[1]));}
  }
  assert.equal(new Set(ids).size,ids.length);
});
