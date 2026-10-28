// Original decorative motion, driven locally without the model's remote scripts.
(() => {
 const scope = document.getElementById('referenceSections');
 const reduce = matchMedia('(prefers-reduced-motion: reduce)');
 const animations=[];
 const motionElements=scope.querySelectorAll('[data-motion-frames]');
 const animateElement = el => {
  if(reduce.matches||el.dataset.motionStarted)return;
  el.dataset.motionStarted='true';
  const values=JSON.parse(el.dataset.motionFrames);
  if(el.dataset.animateSbsEvent==='scroll')return;
  let duration=0;
  const times=values.map((v,i)=>{if(i)duration+=Number(v.ti)||0;return duration;});
  if(!duration)return;
  const frames=values.map((v,i)=>({transform:`translate(${Number(v.mx)||0}px, ${Number(v.my)||0}px) rotate(${Number(v.ro)||0}deg) scale(${v.sx??1},${v.sy??1})`,opacity:Number(v.op??1),offset:times[i]/duration}));
  const loop=el.dataset.animateSbsLoop==='loop';
  // Falling petals restart continuously, as in the reference.
  const anim=el.animate(frames,{duration,iterations:loop?Infinity:1,easing:'linear',fill:loop?'none':'forwards'});
  animations.push(anim);
 };
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)animateElement(entry.target);}),{threshold:.05});
 motionElements.forEach(el=>observer.observe(el));
 // The rose travels down the programme as the invitation is scrolled.
 const scrollRoses=Array.from(scope.querySelectorAll('[data-animate-sbs-event="scroll"]'));
 let queued=false;
 function positionRoses(){queued=false;if(reduce.matches)return;scrollRoses.forEach(el=>{const board=el.closest('.t396__artboard');const bounds=board.getBoundingClientRect();const fraction=Math.max(0,Math.min(1,(innerHeight*.8-bounds.top)/(bounds.height+innerHeight*.2)));el.style.transform=`translateY(${fraction*236}px)`;});}
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(positionRoses);}},{passive:true});positionRoses();
 // Fade in the panel copy and ornaments without affecting their absolute geometry.
 const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){if(!reduce.matches){const el=entry.target;const distance=Number(el.dataset.animateDistance)||25;el.animate([{opacity:0,translate:`0 ${Math.min(distance,35)}px`},{opacity:1,translate:'0 0'}],{duration:(Number(el.dataset.animateDuration)||1.5)*1000,easing:'ease-out',fill:'both'});}reveal.unobserve(entry.target);}}),{threshold:.05});
 scope.querySelectorAll('.t-animate:not([data-motion-frames])').forEach(el=>reveal.observe(el));
 reduce.addEventListener('change',()=>{if(reduce.matches){animations.forEach(a=>a.cancel());scrollRoses.forEach(el=>el.style.transform='');}else{motionElements.forEach(el=>{el.dataset.motionStarted='';animateElement(el);});}});
})();
