import test from 'node:test';
import assert from 'node:assert/strict';
import {segmentsForText,cleanAnnotation} from '../annotations.mjs';

test('overlapping highlights preserve the complete paragraph and every annotation',()=>{
  const text='En bog med æ, ø og å.';
  const annotations=[{id:'a',start:3,end:11},{id:'b',start:7,end:15}];
  const segments=segmentsForText(text,annotations);
  assert.equal(segments.map(s=>s.text).join(''),text);
  assert.deepEqual(segments.find(s=>s.start===7).annotationIds,['a','b']);
  assert.equal(segments.find(s=>s.start===11).text,text.slice(11,15));
});
test('out of bounds highlights are clipped, and empty chapter notes do not remove text',()=>{
  const text='Luftveje';
  const segments=segmentsForText(text,[{id:'a',start:-4,end:4},{id:'b',start:6,end:50},{id:'note',start:0,end:0}]);
  assert.equal(segments.map(s=>s.text).join(''),text);
  assert.equal(segments[0].text,'Luft');
  assert.equal(segments.at(-1).text,'je');
  assert.equal(segments.some(s=>s.annotationIds.includes('note')),false);
});
test('restored annotations use the original paragraph for quote and chapter identity',()=>{
  const index={p:{id:'p',chapterId:'book-1',text:'En sammenhængende bogtekst.'}};
  const result=cleanAnnotation({id:'a',paragraphId:'p',chapterId:'wrong',start:3,end:18,quote:'wrong',note:'Min note'},index);
  assert.equal(result.chapterId,'book-1');
  assert.equal(result.quote,index.p.text.slice(3,18));
  assert.equal(result.note,'Min note');
  assert.equal(cleanAnnotation({id:'a',paragraphId:'missing',start:0,end:2},index),null);
  assert.equal(cleanAnnotation({id:'a',paragraphId:'p',start:0,end:999},index),null);
});
