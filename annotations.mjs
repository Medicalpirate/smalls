export function segmentsForText(text, annotations) {
  const valid = annotations.filter(a=>Number.isInteger(a.start)&&Number.isInteger(a.end)&&a.end>a.start).map(a=>({...a,start:Math.max(0,a.start),end:Math.min(text.length,a.end)})).filter(a=>a.end>a.start);
  const boundaries = [...new Set([0,text.length,...valid.flatMap(a=>[a.start,a.end])])].sort((a,b)=>a-b);
  return boundaries.slice(0,-1).map((start,i)=>({text:text.slice(start,boundaries[i+1]),start,end:boundaries[i+1],annotationIds:valid.filter(a=>a.start<boundaries[i+1]&&a.end>start).map(a=>a.id)}));
}

export function cleanAnnotation(value, paragraphIndex) {
  if(!value || typeof value!=='object')return null;
  const p=paragraphIndex[value.paragraphId];
  if(!p || typeof value.id!=='string' || value.id.length>80)return null;
  if(!Number.isInteger(value.start)||!Number.isInteger(value.end)||value.start<0||value.end<value.start||value.end>p.text.length)return null;
  return {id:value.id,chapterId:p.chapterId,paragraphId:p.id,start:value.start,end:value.end,quote:p.text.slice(value.start,value.end),note:typeof value.note==='string'?value.note.slice(0,4000):'',color:['yellow','orange','pink','blue','green'].includes(value.color)?value.color:'yellow',createdAt:Number.isFinite(value.createdAt)?value.createdAt:0};
}

export function paragraphSelection(paragraph, range) {
  if(!range.intersectsNode(paragraph))return null;
  const startRange=paragraph.ownerDocument.createRange();startRange.selectNodeContents(paragraph);
  const endRange=paragraph.ownerDocument.createRange();endRange.selectNodeContents(paragraph);
  const containsStart=paragraph.contains(range.startContainer);
  const containsEnd=paragraph.contains(range.endContainer);
  let start=0,end=paragraph.textContent.length;
  if(containsStart){startRange.setEnd(range.startContainer,range.startOffset);start=startRange.toString().length;}
  if(containsEnd){endRange.setEnd(range.endContainer,range.endOffset);end=endRange.toString().length;}
  return end>start?{paragraphId:paragraph.dataset.paragraph,start,end}:null;
}
