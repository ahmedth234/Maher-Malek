// Heure de Tunisie : le compte à rebours reste identique pour tous les invités.
const weddingDate = new Date('2027-03-27T20:00:00+01:00').getTime();
function updateCountdown(){
 const remaining=Math.max(0,weddingDate-Date.now());
 const values=[Math.floor(remaining/86400000),Math.floor(remaining/3600000)%24,Math.floor(remaining/60000)%60,Math.floor(remaining/1000)%60];
 ['days','hours','minutes','seconds'].forEach((id,i)=>document.getElementById(id).textContent=String(values[i]).padStart(2,'0'));
 document.getElementById('countdownMessage').hidden=remaining>0;
}
updateCountdown();setInterval(updateCountdown,1000);
const cover=document.getElementById('introOverlay');
const invitation=document.getElementById('invitation');
const openBtn=document.getElementById('openInviteBtn');
const openingVideo = document.getElementById('envelopeVideo');
const gardenVideo = document.getElementById('gardenVideo');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
// Les initiales sont intégrées aux images de la vidéo. Aucun calque ne suit le sceau.
let openingTimer;
let envelopeExitAnimation;
let openingRevealTimer;
const envelopeStage = document.querySelector('.envelope-stage');
const envelopeInterior = new Image();
envelopeInterior.src = 'assets/animation/envelope-open-interior.jpg';
let openingStarted = false;
function showEnvelope() {
 clearTimeout(openingTimer);
 clearTimeout(openingRevealTimer);
 openingStarted = false;
 cover.hidden = false;
 envelopeExitAnimation?.cancel();
 envelopeStage.querySelectorAll('.flap-layer').forEach(layer=>layer.remove());
 cover.classList.remove('opening','fading','departing','flap-opening','flap-revealing','flap-preparing');
 document.body.classList.add('locked');
 document.body.classList.remove('invitation-open');
 invitation.inert = true;
 openBtn.disabled = false;
 openingVideo.pause();
 openingVideo.currentTime = 0;
 gardenVideo.pause();
 window.scrollTo({top:0,behavior:'instant'});
 cover.tabIndex = -1;
 cover.focus({preventScroll:true});
}
async function finishOpening() {
 if (cover.hidden || cover.classList.contains('flap-opening') || cover.classList.contains('flap-preparing')) return;
 clearTimeout(openingTimer);
 function completeOpening() {
  if (!cover.classList.contains('flap-opening')) return;
  cover.hidden = true;
  openingVideo.pause();
  document.body.classList.remove('locked');
  invitation.inert = false;
  const heading = document.querySelector('h1');
  heading.tabIndex = -1;
  heading.focus({preventScroll:true});
 }
 function revealInvitation() {
  if (!cover.classList.contains('flap-opening')) return;
  document.body.classList.add('invitation-open');
  gardenVideo.currentTime = 0;
  if (!reducedMotion.matches) gardenVideo.play().catch(()=>{});
  cover.classList.add('flap-revealing');
  openingRevealTimer = setTimeout(completeOpening,reducedMotion.matches?0:600);
 }
 cover.classList.add('flap-preparing');
 if (!reducedMotion.matches && openingVideo.videoWidth) {
  try { await envelopeInterior.decode(); } catch {}
 }
 cover.classList.remove('flap-preparing');
 cover.classList.add('flap-opening');
 if (reducedMotion.matches || !openingVideo.videoWidth) { revealInvitation(); return; }
 openingVideo.pause();
 // Separate the upper flap (with its integrated seal) from the stationary body.
 // The moving flap is sampled from the final video frame; its lining remains fixed.
 try {
  const width = openingVideo.videoWidth;
  const height = openingVideo.videoHeight;
  const mask = document.createElement('canvas');
  mask.width=width;mask.height=height;
  const maskContext=mask.getContext('2d');
  const sx=width/720,sy=height/1280;
  maskContext.scale(sx,sy);
  maskContext.beginPath();
  maskContext.moveTo(26,0);maskContext.lineTo(694,0);maskContext.lineTo(360,350);maskContext.closePath();
  maskContext.fill();
  maskContext.beginPath();maskContext.ellipse(360,306,150,107,0,0,Math.PI*2);maskContext.fill();
  function createLayer(className,operation) {
   const layer=document.createElement('canvas');layer.width=width;layer.height=height;
   layer.className='flap-layer '+className;layer.setAttribute('aria-hidden','true');
   const context=layer.getContext('2d');context.drawImage(openingVideo,0,0,width,height);
   context.globalCompositeOperation=operation;context.drawImage(mask,0,0);
   envelopeStage.append(layer);return layer;
  }
  const body=document.createElement('canvas');body.width=width;body.height=height;
  body.className='flap-layer envelope-body-layer';body.setAttribute('aria-hidden','true');
  const bodyContext=body.getContext('2d');
  if(envelopeInterior.complete && envelopeInterior.naturalWidth) {
   bodyContext.drawImage(envelopeInterior,0,0,width,height);
  } else {
   const lining=bodyContext.createLinearGradient(0,0,0,height);
   lining.addColorStop(0,'#bd905f');lining.addColorStop(1,'#e4be8b');
   bodyContext.fillStyle=lining;bodyContext.fillRect(0,0,width,height);
  }
  envelopeStage.append(body);
  const flap=createLayer('envelope-upper-flap','destination-in');
  const bounds=envelopeStage.getBoundingClientRect();
  const flapBottom=bounds.top+bounds.height*(413/1280);
  envelopeExitAnimation=flap.animate([
   {transform:'translateY(0)'},
   {transform:`translateY(${-Math.max(0,flapBottom)-2}px)`}
  ],{duration:700,easing:'cubic-bezier(.4,0,.6,1)',fill:'forwards'});
  envelopeExitAnimation.finished.then(revealInvitation,()=>{});
 } catch {
  revealInvitation();
 }
}
async function openEnvelope() {
 if(openingStarted) return;
 openingStarted = true;
 openBtn.disabled = true;
 if(reducedMotion.matches){finishOpening();return;}
 cover.classList.add('opening');
 openingVideo.currentTime = 0;
 openingVideo.playbackRate = 1.2;
 try { await openingVideo.play(); }
 catch { finishOpening(); }
 openingTimer = setTimeout(finishOpening,20000);
}
openingVideo.addEventListener('ended',finishOpening);
openingVideo.addEventListener('error',()=>{if(openingStarted)finishOpening();});
openBtn.addEventListener('click',openEnvelope);
document.getElementById('replayInvite').addEventListener('click',showEnvelope);
// Petales en couches indépendantes : chute et dérive, avec retours décalés.
document.querySelectorAll('.petal-rain').forEach((layer,sectionIndex)=>{
 for(let i=0;i<12;i++){
  const drift=document.createElement('span');drift.className='petal-drift';
  const petal=document.createElement('img');petal.src=`assets/animation/petal-${i%3+1}.png`;petal.alt='';
  drift.style.cssText=`--x:${(i*29+sectionIndex*11)%100}%;--duration:${8+i%5}s;--delay:${-i*1.47}s;--drift:${i%2?'-':' '}${24+i*3}px;--size:${13+i%4*5}px;--spin:${i%2?'-':''}${100+i*27}deg`;
  drift.append(petal);layer.append(drift);
 }
});
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)gardenVideo.pause();else if(document.body.classList.contains('invitation-open'))gardenVideo.play().catch(()=>{});});
document.addEventListener('visibilitychange',()=>{if(document.hidden){gardenVideo.pause();}else if(!reducedMotion.matches&&document.body.classList.contains('invitation-open'))gardenVideo.play().catch(()=>{});});
showEnvelope();
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.section h2,.venue-arch,.timeline article,.promise>div').forEach(el=>{el.classList.add('reveal');observer.observe(el);});}
document.getElementById('calendarBtn')?.addEventListener('click',()=>{
 const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Maher et Malek//Invitation//FR','BEGIN:VEVENT','UID:maher-malek-20270327@invitation','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),'DTSTART:20270327T190000Z','DTEND:20270327T225900Z','SUMMARY:Mariage de Maher et Malek','LOCATION:Maison Berrich','DESCRIPTION:Accueil des invites des 19h30. Celebration a 20h (heure de Tunisie).','URL:https://maps.app.goo.gl/Nw6keg7uvs693axq7','END:VEVENT','END:VCALENDAR'].join('\r\n');
 const url=URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='maher-m malek-27-mars-2027.ics'.replace('m malek','malek');link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
const attendance=document.getElementById('attendance');
attendance.addEventListener('change',()=>{const absent=attendance.value==='non';document.getElementById('guestCount').hidden=absent;document.getElementById('guestCountLabel').hidden=absent;document.getElementById('responseBox').hidden=true;});
let response='';
document.getElementById('rsvpForm').addEventListener('submit',event=>{event.preventDefault();const name=document.getElementById('guestName').value.trim();if(!name){document.getElementById('guestName').setCustomValidity('Veuillez renseigner votre nom.');document.getElementById('guestName').reportValidity();return;}const count=document.getElementById('guestCount').value;response=attendance.value==='oui'?`Bonjour Maher et Malek ! C’est avec joie que je confirme ma présence à votre mariage le 27 mars 2027 à Maison Berrich. Nombre de personnes : ${count}.\n${name}`:`Bonjour Maher et Malek ! Je ne pourrai malheureusement pas être présent(e) le 27 mars 2027. Je vous souhaite une magnifique célébration et beaucoup de bonheur !\n${name}`;document.getElementById('responseText').textContent=response;document.getElementById('responseStatus').textContent='';document.getElementById('responseBox').hidden=false;document.getElementById('responseBox').scrollIntoView({behavior:'smooth',block:'center'});});
document.getElementById('guestName').addEventListener('input',event=>event.target.setCustomValidity(''));
async function copyResponse(){try{await navigator.clipboard.writeText(response);document.getElementById('responseStatus').textContent='Message copié. Vous pouvez le transmettre aux mariés.';}catch{document.getElementById('responseStatus').textContent='Sélectionnez le message ci-dessus pour le copier et le transmettre aux mariés.';}}
document.getElementById('copyResponse').addEventListener('click',copyResponse);
document.getElementById('shareResponse').addEventListener('click',async()=>{if(navigator.share){try{await navigator.share({title:'Mariage de Maher & Malek',text:response});document.getElementById('responseStatus').textContent='Vous pouvez transmettre ce message aux mariés depuis l’application choisie.';}catch(error){if(error.name!=='AbortError')await copyResponse();}}else await copyResponse();});


