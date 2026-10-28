// Keep the invitation readable in Android WebViews, including enlarged system text.
(() => {
 const hero=document.querySelector('.hero');
 if(!hero)return;
 let scheduled=false;
 function inkWidth(element){
  const range=document.createRange();range.selectNodeContents(element);
  return range.getBoundingClientRect().width;
 }
 function fit(element,maxWidth,maxHeight,lines){
  if(!element)return;
  element.style.removeProperty('font-size');
  let size=parseFloat(getComputedStyle(element).fontSize);
  for(let pass=0;pass<7;pass++){
   const width=Math.max(...lines.map(inkWidth));
   const height=Math.max(element.scrollHeight,element.getBoundingClientRect().height);
   const ratio=Math.min(1,maxWidth/Math.max(1,width),maxHeight/Math.max(1,height));
   if(ratio>=.99)break;
   size*=ratio*.985;
   element.style.setProperty('font-size',`${size}px`,'important');
  }
 }
 function fitHero(){
  scheduled=false;
  const box=hero.getBoundingClientRect();
  if(!box.width||!box.height)return;
  const title=hero.querySelector('.wedding-day');
  const date=hero.querySelector('.date-top');
  const names=hero.querySelector('h1');
  const cue=hero.querySelector('.scroll-cue');
  fit(title,box.width*.8,box.height*.058,[title]);
  fit(date,box.width*.8,box.height*.045,[date]);
  fit(names,box.width*.84,box.height*.27,Array.from(names.children));
  fit(cue,box.width*.84,box.height*.13,Array.from(cue.children));
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(fitHero);}}
 if(document.fonts){document.fonts.ready.then(schedule);document.fonts.addEventListener('loadingdone',schedule);}
 addEventListener('resize',schedule,{passive:true});
 if('ResizeObserver' in window)new ResizeObserver(schedule).observe(hero);
 schedule();
 const isAndroid=/Android/i.test(navigator.userAgent);
 const isEmbedded=/(FBAN|FBAV|FB_IAB|Messenger|Instagram|\bwv\b)/i.test(navigator.userAgent);
 if(isAndroid&&isEmbedded){
  const tip=document.createElement('aside');tip.className='external-browser-tip';tip.setAttribute('aria-label','Ouvrir dans un navigateur');
  const canonical=document.querySelector('link[rel="canonical"]')?.href||location.href.split('#')[0];
  const target=new URL(canonical);
  const link=document.createElement('a');link.textContent='Ouvrir dans Chrome ↗';
  link.href=`intent://${target.host}${target.pathname}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(target.href)};end`;
  const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Fermer cette indication');close.addEventListener('click',()=>tip.remove());
  tip.append(link,close);document.body.append(tip);
 }
})();
