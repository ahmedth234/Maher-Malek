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
  const size=parseFloat(getComputedStyle(element).fontSize);
  function fits(){
   const width=Math.max(...lines.map(inkWidth));
   const height=Math.max(element.scrollHeight,element.getBoundingClientRect().height);
   return width<=maxWidth+.5&&height<=maxHeight+.5;
  }
  if(fits())return;
  let low=0,high=size;
  for(let pass=0;pass<12;pass++){
   const candidate=(low+high)/2;
   element.style.setProperty('font-size',`${candidate}px`,'important');
   if(fits())low=candidate;else high=candidate;
  }
  element.style.setProperty('font-size',`${low*.99}px`,'important');
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
  fitSections();
 }
 function fitSections(){
  const slots={
   rec4227041103:{'1780748008617000003':96,'1780748008617000005':190},
   rec2487446153:{'1772804808869':51,'1772813480591000001':42},
   rec2487446183:{'1778524751695000001':90,'1772813849329000001':60}
  };
  document.querySelectorAll('.reference-sections [data-elem-type="text"]').forEach(cell=>{
   const atom=cell.querySelector('.tn-atom');
   const record=cell.closest('[id^="rec"]');
   if(!atom||!record)return;
   let height=slots[record.id]?.[cell.dataset.elemId]||parseFloat(cell.dataset.fieldHeightValue)||64;
   if(record.id==='rec2487446103'&&cell.dataset.elemId!=='1763405219328')height=52;
   const width=cell.getBoundingClientRect().width;
   fit(atom,width<=innerWidth?width:innerWidth-36,height,[atom]);
  });
  document.querySelectorAll('.model-label').forEach(atom=>{
   fit(atom,Math.max(36,atom.parentElement.getBoundingClientRect().width-4),26,[atom]);
  });
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(fitHero);}}
 if(document.fonts){document.fonts.ready.then(schedule);document.fonts.addEventListener('loadingdone',schedule);}
 addEventListener('resize',schedule,{passive:true});
 if('ResizeObserver' in window)new ResizeObserver(schedule).observe(hero);
 schedule();
})();
