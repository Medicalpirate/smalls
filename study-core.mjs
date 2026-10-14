export function textCardDraft(selected,paragraph=''){
  const answer=String(selected).trim();
  if(!answer)return null;
  return {type:'text',front:paragraph.includes(answer)?paragraph.replace(answer,'[…]'):'Hvad beskriver følgende tekst?',answer};
}
export function planReview(card,rating,timestamp=Date.now()){
  if(!['again','hard','good','easy'].includes(rating))throw new Error('Unknown review rating');
  const old=Number.isFinite(card.interval)?Math.max(0,card.interval):0;
  const days=rating==='again'?0:rating==='hard'?Math.max(1,old*1.2):rating==='good'?Math.max(3,old*2.4):Math.max(7,old*3.5);
  return {interval:days,due:timestamp+(rating==='again'?60000:days*86400000),reviews:(card.reviews||0)+1};
}
export function normalizeMask(value){
  if(!value||!['x','y','w','h'].every(k=>Number.isFinite(value[k])))return null;
  const x=Math.max(0,Math.min(99,value.x)),y=Math.max(0,Math.min(99,value.y));
  const w=Math.max(0,Math.min(100-x,value.w)),h=Math.max(0,Math.min(100-y,value.h));
  return w>0&&h>0?{x,y,w,h}:null;
}
