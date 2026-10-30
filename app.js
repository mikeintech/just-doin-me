/* =====================================================================
   DROP CONFIG — the label/management team fills this in. Anything left
   empty shows an honest "pending" state instead of a fake value.
   ===================================================================== */
const ALBUM='https://music.apple.com/us/album/just-doin-me/6820234612';
const LINK='https://youngnudy.lnk.to/justdoinme'; // official smart link
const DROP={
  releaseDate:'',            // ISO time, e.g. '2026-11-14T00:00:00-05:00' — turns on countdown + calendar
  platforms:[                // official links, from youngnudy.lnk.to/justdoinme
    ['Apple Music',ALBUM,true],
    ['Spotify','https://open.spotify.com/album/7rrFGnr2bhrNu2Ns4Imhsf',true],
    ['Tidal','https://tidal.com/album/573666772',true],
    ['Amazon Music','https://music.amazon.com/albums/B0HM9R2X43',true],
    ['Audiomack','https://audiomack.com/young-nudy/album/just-doin-me-6082734',true],
    ['Deezer','https://www.deezer.com/album/1120753252',true],
    ['All platforms',LINK,true]
  ],
  merchUrl:'',               // bandana product page
  signupUrl:'',              // POST endpoint for the notify form (Laylo, Mailchimp, etc.)
  tour:[],                   // [{date:'2026-12-01',city:'Atlanta, GA',venue:'…',tickets:'https://…'}]
  socials:[['Instagram','https://www.instagram.com/'],['X','https://x.com/'],['TikTok','https://www.tiktok.com/'],['YouTube','https://www.youtube.com/']], // replace with official handles
  credits:[
    ['Artist','Young Nudy'],
    ['Featuring','Fatt Smaxk · 21 Savage · JID'],
    ['Tracks','16'],
    ['Producers',''],['Mixing',''],['Mastering',''],['Art direction',''],['Label','']
  ],
  blurb:'Young Nudy returns with JUST DOIN ME — 16 tracks, features from 21 Savage, JID and Fatt Smaxk, wrapped in a red-and-silver bandana. Listen now.'
};
const tracks=[['HITS'],['CHICKEN TENDER'],['LET ME SHOW YOU'],['WHO DAT IS'],['NONSTOP'],['STARS IN MY CAR','Fatt Smaxk'],['SPINNIN','21 Savage'],['WAR'],['SPAGHETTI'],['FBGM'],['BROKE BITCH'],['YA DIG'],['WHY WOULD I'],['JUDY','JID'],['VIBE OUT'],['CREAM PIE']];
const emblems=[
  {id:'title',name:'The Title',note:'CENTER',wide:true},
  {id:'medusa',name:'The Portrait',note:'CENTER'},
  {id:'snakes',name:'Serpents',note:'CORNERS ×4'},
  {id:'crest',name:'The Crest',note:'TOP'},
  {id:'cherub',name:'Cherub',note:'SIDES ×2'},
  {id:'sprig',name:'Laurel',note:'TOP ×2'},
  {id:'clover',name:'Quatrefoil',note:'SCATTERED'},
  {id:'border',name:'The Border',note:'EDGE'}
];
// every track owns one ornament from the cover (each appears twice, once per side)
const ORN=['crest','snakes','cherub','sprig','clover','medusa','border','title'];
const ornOf=i=>ORN[i%ORN.length];
const $=id=>document.getElementById(id);
const root=document.documentElement.style;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const pinned=new URLSearchParams(location.search).get('fold');
let progress=pinned!=null?clamp(+pinned):reduced?1:0,target=progress,flipped=false,frame,selected=-1,turn=0,turnTarget=0;
// scroll map (in viewport heights): unfold 0→1.3, hold, turn over 1.6→2.2, hold on tracklist
const U_END=1.3,F_START=1.6,F_END=2.2;

/* ---------- track selection (shared by bandana back + track grid) ---------- */
const list=$('trackList'),grid=$('trackGrid');
function select(i){
  selected=i;const [name,feature]=tracks[i];
  document.querySelectorAll('[data-track]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.track===i)));
  $('trackNumber').textContent=String(i+1).padStart(2,'0');
  $('trackTitle').textContent=name;
  $('trackFeature').textContent=feature?`FEATURING ${feature.toUpperCase()}`:'';
  $('player').hidden=false;
  $('player').style.setProperty('--orn',`url('assets/emblems/${ornOf(i)}.webp')`);
  $('player').classList.remove('pop');void $('player').offsetWidth;$('player').classList.add('pop');
  setPreview(i);
  $('announcement').textContent=`Track ${i+1}: ${name}. Listen using the Apple Music album link.`;
  history.replaceState(null,'',`#track-${String(i+1).padStart(2,'0')}`);
}
/* ---------- 30-second previews (official Apple previews; hidden if not found) ---------- */
const audio=new Audio();let previews=null;
const norm=t=>t.toLowerCase().replace(/\(.*?\)|feat\..*|[^a-z0-9]/g,'');
const previewsReady=fetch('https://itunes.apple.com/lookup?id='+ALBUM.split('/').pop()+'&entity=song&limit=50')
  .then(r=>r.json()).then(d=>{previews={};(d.results||[]).forEach(r=>{if(r.previewUrl)previews[norm(r.trackName)]=r.previewUrl})})
  .catch(()=>{previews={}});
async function setPreview(i){
  audio.pause();const btn=$('playPreview');btn.hidden=true;btn.textContent='▶ PREVIEW';
  await previewsReady;if(selected!==i)return;
  const url=previews[norm(tracks[i][0])];if(!url)return;
  audio.src=url;btn.hidden=false;
}
$('playPreview').addEventListener('click',()=>{if(audio.paused){audio.play();}else audio.pause()});
audio.addEventListener('play',()=>$('playPreview').textContent='❚❚ PAUSE');
audio.addEventListener('pause',()=>$('playPreview').textContent='▶ PREVIEW');
audio.addEventListener('ended',()=>$('playPreview').textContent='▶ PREVIEW');
async function share(title,url,btn){
  try{if(navigator.share){await navigator.share({title,url});return}await navigator.clipboard.writeText(url);flash(btn,'LINK COPIED')}catch(e){if(e.name!=='AbortError')flash(btn,'COPY FAILED')}
}
function flash(btn,text){const old=btn.innerHTML;btn.textContent=text;setTimeout(()=>btn.innerHTML=old,1600)}
$('shareTrack').addEventListener('click',e=>share(`${tracks[selected][0]} — Young Nudy`,location.href,e.currentTarget));
tracks.forEach(([name,feature],i)=>{
  const b=document.createElement('button');b.className='track';b.type='button';b.dataset.track=i;b.setAttribute('aria-pressed','false');b.textContent=name;
  if(feature){const s=document.createElement('small');s.textContent=`FT ${feature.toUpperCase()}`;b.append(s)}
  b.addEventListener('click',()=>select(i));list.append(b);
  const li=document.createElement('li'),g=document.createElement('button');g.type='button';g.dataset.track=i;g.setAttribute('aria-pressed','false');
  g.innerHTML=`<span class="n">${String(i+1).padStart(2,'0')}</span><span class="t"></span><span class="e" aria-hidden="true" style="background-image:url('assets/emblems/${ornOf(i)}.webp')"></span>`;
  g.querySelector('.t').textContent=name;
  if(feature){const s=document.createElement('small');s.textContent=`FT ${feature.toUpperCase()}`;g.querySelector('.t').append(s)}
  g.addEventListener('click',()=>select(i));li.append(g);grid.append(li);
});

/* Browsers hit-test the turned-over 3D face in the wrong place, so clicks go to a flat,
   invisible copy of the list laid exactly over the visible one (same box, same -5° tilt). */
const hits=document.createElement('div');hits.className='track-hits';
const hitList=document.createElement('div');hitList.className='track-list';hitList.setAttribute('aria-label','Album tracks');hits.append(hitList);
document.querySelector('.float').append(hits);
tracks.forEach(([name,feature],i)=>{
  const b=document.createElement('button');b.className='track';b.type='button';b.dataset.track=i;b.setAttribute('aria-pressed','false');b.textContent=name;
  if(feature){const s=document.createElement('small');s.textContent=`FT ${feature.toUpperCase()}`;b.append(s)}
  b.addEventListener('click',()=>select(i));hitList.append(b);
});
list.setAttribute('aria-hidden','true');list.inert=true;

/* ---------- the fold: bottom half first, then right half ---------- */
function update(){
  const f3=ease(clamp(progress/.28)),f2=ease(clamp((progress-.28)/.36)),f1=ease(clamp((progress-.64)/.36));
  $('front').classList.toggle('tri',f3<.999);
  root.setProperty('--r3',`${(180*(1-f3)).toFixed(2)}deg`);
  root.setProperty('--b3',(.6+.4*f3).toFixed(3));
  const open=clamp((progress-.94)/.06);
  root.setProperty('--p',progress.toFixed(4));
  root.setProperty('--r2',`${(180*(1-f2)).toFixed(2)}deg`);
  root.setProperty('--r1',`${(-180*(1-f1)).toFixed(2)}deg`);
  root.setProperty('--sh2',(Math.sin(Math.PI*f2)*.6).toFixed(3));
  root.setProperty('--sh1',(Math.sin(Math.PI*f1)*.6).toFixed(3));
  root.setProperty('--tx',`${(25*(1-f1)+8.33*(1-f3)).toFixed(3)}%`);
  root.setProperty('--ty',`${(25*(1-f2)-8.33*(1-f3)).toFixed(3)}%`);
  root.setProperty('--sc',(1+.32*(1-progress)).toFixed(4));
  root.setProperty('--sw',((.5+.5*f1)*(.7+.3*f3)).toFixed(3));
  root.setProperty('--shh',((.5+.5*f2)*(.7+.3*f3)).toFixed(3));
  root.setProperty('--open',open.toFixed(3));
  root.setProperty('--flip',turn.toFixed(4));
  flipped=turn>.5;$('record').classList.toggle('flipped',flipped);
  $('flip').innerHTML=flipped?'BACK TO THE COVER <span>↻</span>':'TURN IT OVER <span>↻</span>';$('flip').setAttribute('aria-pressed',String(flipped));
  const done=progress>.995;
  $('unfold').hidden=done;$('flip').hidden=!done;$('reset').hidden=!done;$('scrollCue').hidden=progress>.05;
  $('sceneLabel').textContent=flipped?'02 / THE TRACKS':done?'01 / JUST DOIN ME':progress<.28?'01 / THE TRIANGLE':progress<.64?'01 / THE SECOND FOLD':'01 / THE LAST FOLD';
  $('sceneHint').textContent=flipped?'PICK A TRACK. GET INTO IT.':done?'MOVE YOUR CURSOR. CATCH THE SILVER.':'A LITTLE RED. A WHOLE WORLD.';
  const ready=turn>.97;hits.classList.toggle('on',ready);hitList.inert=!ready;
  $('unfold').innerHTML=progress>.03?'KEEP UNFOLDING <span>↗</span>':'UNFOLD THE ALBUM <span>↗</span>';
}
function animate(){
  progress+=(target-progress)*.075;turn+=(turnTarget-turn)*.075;
  if(Math.abs(target-progress)<.0008)progress=target;
  if(Math.abs(turnTarget-turn)<.0008)turn=turnTarget;
  update();frame=progress!==target||turn!==turnTarget?requestAnimationFrame(animate):null;
}
function seek(v,f=turnTarget){target=clamp(v);turnTarget=clamp(f);if(reduced){progress=target;turn=turnTarget;update()}else if(!frame)frame=requestAnimationFrame(animate)}
// hook for the promo film recorder: set the fold and turn instantly
window.__jdm={set(p,f){progress=target=clamp(p);turn=turnTarget=clamp(f);update()},select:i=>select(i)};
const vh=()=>innerHeight;
const go=y=>window.scrollTo({top:experience.offsetTop+y*vh(),behavior:reduced?'instant':'smooth'});
// the buttons scroll to the right spot, so the page and the bandana never disagree
function flip(){go(flipped?U_END+.1:F_END+.05)}
const experience=document.querySelector('.experience');
$('unfold').addEventListener('click',()=>go(U_END+.1));
$('flip').addEventListener('click',flip);
$('reset').addEventListener('click',()=>{$('player').hidden=true;go(0)});
$('closePlayer').addEventListener('click',()=>{$('player').hidden=true;audio.pause();history.replaceState(null,'',location.pathname+location.search);document.querySelector(`[data-track="${selected}"]`)?.focus()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('player').hidden)$('closePlayer').click()});
addEventListener('scroll',()=>{
  if(pinned==null){const y=(scrollY-experience.offsetTop)/vh();seek(y/U_END,(y-F_START)/(F_END-F_START))}
  const past=scrollY>experience.offsetHeight-innerHeight;document.querySelector('header').classList.toggle('solid',past);document.body.classList.toggle('past-hero',past);
},{passive:true});

const art=document.querySelector('.art-space'),tilt=document.querySelector('.tilt');
art.addEventListener('pointermove',e=>{
  if(reduced||e.pointerType==='touch'||flipped){tilt.style.transform='rotate(-5deg)';return}
  const r=art.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  root.setProperty('--mx',`${x*100}%`);root.setProperty('--my',`${y*100}%`);
  tilt.style.transform=`rotate(-5deg) rotateX(${(y-.5)*-8}deg) rotateY(${(x-.5)*8}deg)`;
});
art.addEventListener('pointerleave',()=>{tilt.style.transform='rotate(-5deg)'});
// phones: let the device tilt drive the silver
addEventListener('deviceorientation',e=>{
  if(reduced||e.gamma==null)return;
  root.setProperty('--mx',`${50+clamp(e.gamma/30,-1,1)*45}%`);root.setProperty('--my',`${50+clamp((e.beta-45)/30,-1,1)*45}%`);
});

/* ---------- wallpaper maker ---------- */
const canvas=$('wp'),ctx=canvas.getContext('2d');
const wp={emblem:'medusa',cloth:'red',title:'on'};
const cache={};
const load=src=>cache[src]||(cache[src]=new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src}));
const choices=['medusa','crest','snakes','cherub','title'];
choices.forEach(id=>{const b=document.createElement('button');b.type='button';b.dataset.v=id;b.textContent=emblems.find(m=>m.id===id).name.replace('The ','').toUpperCase();b.setAttribute('aria-pressed',String(id===wp.emblem));$('wpEmblem').append(b)});
[['wpEmblem','emblem'],['wpCloth','cloth'],['wpTitle','title']].forEach(([id,key])=>{
  $(id).addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;wp[key]=b.dataset.v;$(id).querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw()});
});
function fit(img,cx,cy,mw,mh){const s=Math.min(mw/img.width,mh/img.height);const w=img.width*s,h=img.height*s;ctx.drawImage(img,cx-w/2,cy-h/2,w,h)}
async function draw(){
  const [cloth,print,emb,title]=await Promise.all([load('assets/fabric-base.webp'),load('assets/silver-overlay.webp'),load(`assets/emblems/${wp.emblem}.webp`),load('assets/emblems/title.webp')]);
  const W=1080,H=1920,s=H/cloth.height;
  if(wp.cloth==='red'){ctx.drawImage(cloth,(W-cloth.width*s)/2,0,cloth.width*s,H)}else{ctx.fillStyle='#0e0a09';ctx.fillRect(0,0,W,H)}
  // keep the clock zone and bottom controls calm
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#000a');g.addColorStop(.3,'#0000');g.addColorStop(.82,'#0000');g.addColorStop(1,'#0009');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // side borders lifted straight from the print
  const bw=print.width*.055,bs=H/print.height;
  ctx.drawImage(print,0,0,bw,print.height,0,0,bw*bs,H);
  ctx.drawImage(print,print.width-bw,0,bw,print.height,W-bw*bs,0,bw*bs,H);
  const showTitle=wp.title==='on'&&wp.emblem!=='title';
  fit(emb,W/2,showTitle?1000:1080,wp.emblem==='title'?800:620,620);
  if(showTitle)fit(title,W/2,1440,700,300);
  ctx.fillStyle='#e8dfd1';ctx.font='500 26px "DM Sans",Arial';ctx.textAlign='center';
  if('letterSpacing' in ctx)ctx.letterSpacing='10px';
  ctx.fillText('YOUNG NUDY',W/2,1660);
  if('letterSpacing' in ctx)ctx.letterSpacing='0px';
}
$('wpSave').addEventListener('click',()=>canvas.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`just-doin-me-${wp.emblem}-${wp.cloth}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)},'image/png'));
document.fonts?.ready.then(draw);draw();
update();

/* ---------- listen ---------- */
DROP.platforms.forEach(([name,url,direct])=>{const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.className='platform';a.innerHTML=`<b></b><span>${direct?'OPEN ALBUM':'SEARCH'} ↗</span>`;a.querySelector('b').textContent=name;$('platforms').append(a)});
$('shareAlbum').addEventListener('click',e=>share('Young Nudy — Just Doin Me',LINK,e.currentTarget));
if(DROP.releaseDate){
  const t=new Date(DROP.releaseDate);
  const tick=()=>{const d=t-Date.now();if(d<=0){$('countdown').hidden=true;return}
    const s=Math.floor(d/1e3);$('countdown').hidden=false;$('dropHeadline').innerHTML='Drops<br>soon.';
    $('countdown').innerHTML=[[Math.floor(s/86400),'DAYS'],[Math.floor(s/3600)%24,'HRS'],[Math.floor(s/60)%60,'MIN'],[s%60,'SEC']].map(([v,l])=>`<span><b>${String(v).padStart(2,'0')}</b>${l}</span>`).join('');setTimeout(tick,1000)};
  tick();
  $('calendar').hidden=false;
  $('calendar').addEventListener('click',()=>{const f=d=>d.toISOString().replace(/[-:]|\.\d+/g,'');const end=new Date(t.getTime()+36e5);
    const ics=`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:jdm-${f(t)}\r\nDTSTAMP:${f(new Date())}\r\nDTSTART:${f(t)}\r\nDTEND:${f(end)}\r\nSUMMARY:Young Nudy — Just Doin Me drops\r\nURL:${ALBUM}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='just-doin-me.ics';a.click()});
}



/* ---------- socials ---------- */
DROP.socials.forEach(([n,u])=>{const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener';a.textContent=n.toUpperCase();$('socials').append(a)});

/* ---------- chapter rail ---------- */
const railLinks=[...document.querySelectorAll('#rail a')];
const chapters=railLinks.map(a=>document.querySelector(a.getAttribute('href')));
const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){railLinks.forEach(a=>a.removeAttribute('aria-current'));railLinks[chapters.indexOf(e.target)]?.setAttribute('aria-current','true')}}),{rootMargin:'-45% 0px -50% 0px'});
chapters.forEach(c=>c&&ro.observe(c));

/* ---------- deep link: #track-07 opens that track ---------- */
const m=location.hash.match(/^#track-(\d{1,2})$/);
if(m&&tracks[+m[1]-1]){select(+m[1]-1);document.getElementById('tracks').scrollIntoView()}
