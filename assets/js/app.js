/* app.js – router, views, audio, recitation. */
$(function(){
const S=Store.get('settings',Store.defaults.settings), P=Store.get('progress',Store.defaults.progress);
let BM=Store.get('bookmarks',[]), HIST=Store.get('history',[]);
const player=$('#player')[0]; let cur={s:1,a:1}, rec=null, chunks=[], repeat=false, queue=false, curView='home', recCancel=false;
const toast=m=>{$('#toast .toast-body').text(m);bootstrap.Toast.getOrCreateInstance($('#toast')[0],{delay:1800}).show()};
const surah=n=>QURAN.find(x=>x.n==n);
const save=()=>{Store.set('settings',S);Store.set('progress',P);Store.set('bookmarks',BM);Store.set('history',HIST)};
const trKey=()=>S.trans;
const s2=(sel,w)=>$(sel).select2({theme:'bootstrap-5',width:w||'100%',minimumResultsForSearch:20});
function applyTheme(){$('html').attr('data-bs-theme',S.theme);document.documentElement.style.setProperty('--ar-size',S.arSize+'px');$('#themeBtn i').attr('class','bi '+(S.theme=='dark'?'bi-sun':'bi-moon-stars'))}
$('#themeBtn').on('click',()=>{S.theme=S.theme=='dark'?'light':'dark';applyTheme();save()});

/* ---- Audio ---- */
function play(s,a){cur={s,a};player.src=AI.audioUrl(s,a);player.playbackRate=+($('#speed').val()||1);player.play().catch(e=>{if(e&&e.name=='AbortError')return;toast('Audio unavailable (offline?)')});
  $('.ayah').removeClass('playing');const el=$(`.ayah[data-a=${a}]`).addClass('playing');if(el.length)el[0].scrollIntoView({behavior:'smooth',block:'center'});
  P.listened++;P.today=Math.min(P.goal,P.today+1);P.last={s,a};save()}
player.onended=()=>{const sr=surah(cur.s);if(repeat)return play(cur.s,cur.a);if(queue&&cur.a<(sr.count||sr.ayat.length))play(cur.s,cur.a+1)};

/* Stop all audio (Quran, TTS) and any live recording – called whenever the user switches tab */
function stopAll(){queue=false;repeat=false;player.pause();player.volume=1;$('.ayah').removeClass('playing');
 if(window.speechSynthesis)speechSynthesis.cancel();
 if(rec&&rec.state=='recording'){recCancel=true;rec.stop()}}

/* ---- Views ---- */
const V={
home(){const h=HADITH[new Date().getDate()%HADITH.length],sr=surah(P.last.s)||QURAN[0];const ay=QURAN[0].ayat[new Date().getDate()%7];
 return `<div class="hero"><div class="gold">Assalamu Alaikum</div><h2 class="h4" style="font-family:Fraunces">Continue your journey</h2>
 <p class="mb-2">Last read: ${sr.en}, Ayah ${P.last.a}</p><button class="btn btn-light" data-go="quran">Continue reading</button></div>
 <div class="card-n"><div class="d-flex justify-content-between"><b>Today's goal</b><span>${P.today}/${P.goal} ayat</span></div>
 <div class="progress my-2"><div class="progress-bar bg-success" style="width:${P.today/P.goal*100}%"></div></div><small class="text-muted"><i class="bi bi-fire"></i> ${P.streak}-day streak</small></div>
 <div class="quick mb-3"><a data-go="quran"><i class="bi bi-book"></i>Read</a><a data-go="quran" data-listen="1"><i class="bi bi-headphones"></i>Listen</a><a data-go="practice"><i class="bi bi-mic"></i>Practice</a>
 <a data-go="hadith"><i class="bi bi-chat-quote"></i>Hadith</a><a data-go="profile" data-bm="1"><i class="bi bi-bookmark"></i>Bookmarks</a></div>
 <div class="card-n"><small class="text-muted">Ayah of the day · Al-Fatihah</small><p class="ar mb-1">${ay.a}</p><small>${ay.en}</small></div>
 <div class="card-n"><small class="text-muted">Daily Hadith · ${h.grade}</small><p class="ar mb-1" style="font-size:22px">${h.ar}</p><small>${h.en}</small><div class="text-muted small mt-1">${h.ref}</div></div>`},
quran(){return `<input id="sq" class="form-control mb-3" placeholder="Search Surah by name or number" aria-label="Search surah"><div id="slist"></div>`},
practice(){return `<h2 class="h5">AI Recitation Practice <span class="demo-tag">DEMO</span></h2>
 <div class="card-n"><div class="row g-2"><div class="col-8"><select id="ps" class="form-select">${QURAN.map(s=>`<option value="${s.n}">${s.n}. ${s.en}</option>`).join('')}</select></div>
 <div class="col-4"><select id="pa" class="form-select"></select></div></div></div>
 <div class="card-n"><div id="ptext" class="ar"></div><div class="d-flex gap-2 flex-wrap mt-2"><button id="pref" class="btn btn-outline-success"><i class="bi bi-volume-up"></i> Listen</button>
 <button id="prec" class="btn btn-em"><i class="bi bi-mic"></i> Start recording</button></div><div id="pstat" class="small text-muted mt-2"></div></div><div id="pres"></div>
 <p class="small text-muted">Demo results are simulated. Real Tajweed verification needs a specialized Quranic speech API via a secure backend, and never replaces a qualified teacher.</p>`},
hadith(){return `<div class="row g-2 mb-2"><div class="col-6"><select id="hcol" class="form-select" aria-label="Hadith collection"><option value="">Featured</option>${Object.entries(Remote.COLS).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('')}</select></div>
 <div class="col-6 d-none" id="hbkw"><select id="hbk" class="form-select" aria-label="Book"></select></div></div>
 <input id="hq" class="form-control mb-2" placeholder="Search Hadith"><div class="d-flex gap-2 overflow-auto mb-3" id="hcats"><button class="btn btn-sm btn-outline-success active" data-c="">All</button>${CATS.map(c=>`<button class="btn btn-sm btn-outline-success" data-c="${c}">${c}</button>`).join('')}</div><div id="hlist"></div>`},
profile(){const hist=HIST.slice(-5).reverse();return `<h2 class="h5">Profile & settings</h2>
 <div class="card-n"><label class="form-label">Translation</label><select id="st" class="form-select mb-2"><option value="en">English</option><option value="ur">Urdu</option></select>
 <label class="form-label">AI guidance language</label><select id="sg" class="form-select mb-2"><option value="ur">Urdu</option><option value="en">English</option><option value="ar">Arabic</option><option value="roman">Roman Urdu</option></select>
 <label class="form-label">Arabic font size</label><input id="sz" type="range" min="22" max="44" class="form-range" value="${S.arSize}"></div>
 <div class="card-n"><b>Stats</b><div class="small">Listened: ${P.listened} · Practiced: ${P.practiced} · Streak: ${P.streak}</div></div>
 <div class="card-n" id="bms"><b>Bookmarks</b>${BM.length?BM.map(b=>`<div class="small mt-1">${b.label}</div>`).join(''):'<div class="small text-muted">None yet. Tap the bookmark icon on an ayah or hadith.</div>'}</div>
 <div class="card-n"><b>Recent practice</b>${hist.length?hist.map(h=>`<div class="small">${h.label} · ${h.date}</div>`).join(''):'<div class="small text-muted">No practice yet.</div>'}</div>`}
};
const bound={
 quran(){const draw=q=>{q=(q||'').toLowerCase();$('#slist').html(QURAN.filter(s=>!q||s.en.toLowerCase().includes(q)||s.ar.includes(q)||String(s.n)==q).map(s=>
  `<div class="card-n d-flex justify-content-between align-items-center" role="button" data-s="${s.n}"><div><b>${s.n}. ${s.en}</b><div class="small text-muted">${s.meaning} · ${s.count||s.ayat.length} ayat</div></div><span class="ar" style="font-size:24px;line-height:1.4">${s.ar}</span></div>`).join('')||'<p class="text-muted">No surah found.</p>')};
  draw();$('#sq').on('input',e=>draw(e.target.value));$('#slist').on('click','[data-s]',function(){openSurah($(this).data('s'))})},
 practice(){const fill=async()=>{const n=$('#ps').val();$('#pstat').text('');$('#ptext').removeData('t');
   if(!surah(n).ayat){$('#ptext').text('Loading…');$('#pa').empty().trigger('change.select2');
    try{await Remote.loadSurah(n)}catch(e){$('#ptext').text('');$('#pstat').text('Could not load this surah. Check your internet and try again.');return}}
   const sr=surah(n);$('#pa').html(sr.ayat.map((_,i)=>`<option value="${i+1}">Ayah ${i+1}</option>`).join('')).trigger('change.select2');show()};
  const show=()=>{$('#ptext').html(txt()).data('t',surah($('#ps').val()).ayat[$('#pa').val()-1].a);$('#pres').empty()};
  const txt=()=>surah($('#ps').val()).ayat[($('#pa').val()||1)-1].a.split(' ').map(w=>`<span class="w">${w}</span>`).join(' ');
  $('#ps').on('change',fill);$('#pa').on('change',show);fill();$('#pref').on('click',()=>{if($('#pa').val())play(+$('#ps').val(),+$('#pa').val())});$('#prec').on('click',toggleRec);s2('#ps');s2('#pa')},
 hadith(){let c='',src=HADITH,shown=20,col='',tok=0;
  const card=h=>`<div class="card-n"><span class="badge text-bg-success">${h.grade}</span> <span class="badge text-bg-secondary">${h.cat}</span><p class="ar mt-2" style="font-size:22px">${h.ar}</p><p>${S.trans=='ur'&&h.ur?`<span class="ur d-block">${h.ur}</span>`:h.en}</p><div class="small text-muted">${h.ref}</div>
  <div class="mt-2"><button class="btn btn-sm btn-outline-success" data-hs="${h.id}"><i class="bi bi-volume-up"></i> Listen</button> <button class="btn btn-sm" data-hb="${h.id}"><i class="bi bi-bookmark"></i></button> <button class="btn btn-sm" data-hc="${h.id}"><i class="bi bi-share"></i></button></div></div>`;
  const draw=()=>{const q=$('#hq').val().toLowerCase();const l=src.filter(h=>(!c||h.cat==c)&&(!q||(h.en+(h.ur||'')+h.ref).toLowerCase().includes(q)));
  $('#hlist').html(l.slice(0,shown).map(card).join('')+(l.length>shown?`<button class="btn btn-em w-100 mb-3" id="hmore">Load more (${l.length-shown} left)</button>`:'')||(col?'<p class="text-muted">No hadith matches.</p>':'<p class="text-muted">No hadith matches. Only a small verified sample is included in Featured.</p>'))};
  const load=async()=>{const t=++tok,bk=$('#hbk').val();$('#hlist').html('<p class="text-muted">Loading…</p>');
   try{const r=await Remote.hadithBook(col,bk);if(t!=tok)return;src=r}
   catch(e){if(t!=tok)return;src=[];$('#hlist').html('<div class="alert alert-warning">Could not load this book. Check your internet and try again.</div>');return}
   shown=20;draw()};
  $('#hcol').on('change',function(){col=this.value;c='';tok++;$('#hcats button').removeClass('active').first().addClass('active');$('#hcats').toggleClass('d-none',!!col);$('#hbkw').toggleClass('d-none',!col);
   if(!col){src=HADITH;shown=20;draw();return}
   $('#hbk').html(Array.from({length:Remote.COLS[col].books},(_,i)=>`<option value="${i+1}">Book ${i+1}</option>`).join('')).trigger('change.select2');load()});
  $('#hbk').on('change',load);s2('#hcol');s2('#hbk');
  draw();$('#hq').on('input',()=>{shown=20;draw()});$('#hcats').on('click','button',function(){$('#hcats button').removeClass('active');$(this).addClass('active');c=$(this).data('c');shown=20;draw()});
  $('#hlist').on('click','#hmore',()=>{shown+=20;draw()})
  .on('click','[data-hs]',function(){const h=src.find(x=>x.id==$(this).data('hs'));AI.speak(h.en,'en')})
  .on('click','[data-hb]',function(){const h=src.find(x=>x.id==$(this).data('hb'));BM.push({label:'Hadith: '+h.ref});save();toast('Bookmarked')})
  .on('click','[data-hc]',function(){const h=src.find(x=>x.id==$(this).data('hc'));share(`${h.ar}\n${h.en}\n(${h.ref})`)})},
 profile(){$('#st').val(S.trans).on('change',e=>{S.trans=e.target.value;save()});$('#sg').val(S.guide).on('change',e=>{S.guide=e.target.value;save();toast('Guidance language updated')});$('#sz').on('input',e=>{S.arSize=+e.target.value;applyTheme();save()});s2('#st');s2('#sg')}
};
function share(t){if(navigator.share)navigator.share({text:t}).catch(()=>{});else navigator.clipboard.writeText(t).then(()=>toast('Copied'))}
async function openSurah(n){let sr=surah(n);
 if(!sr.ayat){$('#view-quran').html('<p class="text-muted">Loading surah…</p>');
  try{sr=await Remote.loadSurah(n)}
  catch(e){$('#view-quran').html('<button class="btn btn-link p-0 mb-2" id="back"><i class="bi bi-arrow-left"></i> All surahs</button><div class="alert alert-warning">Could not load this surah. Check your internet and try again.</div>');$('#back').on('click',()=>show('quran'));return}}
 $('#view-quran').html(`<button class="btn btn-link p-0 mb-2" id="back"><i class="bi bi-arrow-left"></i> All surahs</button><h2 class="h5">${sr.en} · ${sr.ar}</h2>
 <div class="card-n d-flex flex-wrap gap-2 align-items-center"><button class="btn btn-em" id="pall"><i class="bi bi-play-fill"></i> Play surah</button><button class="btn btn-outline-success" id="pstop"><i class="bi bi-pause-fill"></i></button>
 <div class="form-check form-switch m-0"><input class="form-check-input" type="checkbox" id="rep"><label class="form-check-label" for="rep">Repeat ayah</label></div>
 <select id="speed" class="form-select w-auto">${[.5,.75,1,1.25,1.5].map(x=>`<option ${x==1?'selected':''} value="${x}">${x}x</option>`).join('')}</select><input type="range" id="vol" min="0" max="1" step=".1" value="1" class="form-range" style="width:90px" aria-label="Volume"></div>
 ${sr.ayat.map((y,i)=>`<div class="card-n ayah" data-a="${i+1}"><p class="ar">${y.a} <small>﴿${i+1}﴾</small></p><p class="${S.trans=='ur'?'ur':''} mb-2">${y[trKey()]}</p>
 <button class="btn btn-sm" data-p="${i+1}" aria-label="Play"><i class="bi bi-play-circle"></i></button><button class="btn btn-sm" data-b="${i+1}" aria-label="Bookmark"><i class="bi bi-bookmark"></i></button><button class="btn btn-sm" data-sh="${i+1}" aria-label="Share"><i class="bi bi-share"></i></button></div>`).join('')}`);
 $('#back').on('click',()=>show('quran'));$('#pall').on('click',()=>{queue=true;play(n,1)});$('#pstop').on('click',()=>{queue=false;player.pause()});
 $('#rep').on('change',e=>repeat=e.target.checked);$('#speed').on('change',e=>player.playbackRate=+e.target.value);$('#vol').on('input',e=>player.volume=+e.target.value);s2('#speed','90px');
 $('#view-quran').off('click.a').on('click.a','[data-p]',function(){queue=false;play(n,+$(this).data('p'))}).on('click.a','[data-b]',function(){const a=+$(this).data('b');BM.push({label:`${sr.en} ${a}`});save();toast('Bookmarked')}).on('click.a','[data-sh]',function(){const y=sr.ayat[$(this).data('sh')-1];share(`${y.a}\n${y.en}\n(${sr.en} ${$(this).data('sh')})`)});
 P.last={s:n,a:1};save()}
/* ---- Recording ---- */
async function toggleRec(){
 const btn=$('#prec');
 if(rec&&rec.state=='recording'){rec.stop();return}
 if(!$('#ptext').data('t'))return $('#pstat').text('Please wait for the ayah to load first.');
 if(!navigator.mediaDevices||!window.MediaRecorder)return $('#pstat').text('Recording is not supported in this browser.');
 try{const st=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];rec=new MediaRecorder(st);
  rec.ondataavailable=e=>chunks.push(e.data);
  rec.onstop=async()=>{st.getTracks().forEach(t=>t.stop());if(recCancel){recCancel=false;return}btn.removeClass('rec').html('<i class="bi bi-mic"></i> Record again');$('#pstat').text('Analyzing…');
   const blob=new Blob(chunks,{type:'audio/webm'});const res=await AI.analyze(blob,$('#ptext').data('t'));showResult(res,blob)};
  rec.start();btn.addClass('rec').html('<i class="bi bi-stop-fill"></i> Stop');$('#pstat').text('Recording… recite now.')
 }catch(e){$('#pstat').html('<span class="text-danger">Microphone access was denied. Allow it in your browser settings and try again.</span>')}}
function showResult(r,blob){P.practiced++;HIST.push({label:`${surah($('#ps').val()).en} ${$('#pa').val()}`,date:new Date().toLocaleDateString()});save();
 $('#pstat').text('');const words=r.words.map(w=>`<span class="w ${w.status=='ok'?'ok':w.status=='bad'?'bad':'unsure'}" data-w="${w.w}">${w.w}</span>`).join(' ');
 const un=r.words.find(w=>w.status!='ok');
 $('#pres').html(`<div class="card-n"><span class="demo-tag">DEMO · not verified Tajweed</span><p class="ar mt-2">${words}</p>
 <div class="small">Green: sounded correct · Amber: uncertain · Red: likely mistake. Score: ${r.score??'not available (no reliable engine connected)'}</div>
 ${un?`<div class="alert alert-warning mt-2 mb-2" id="gtxt" data-w="${un.w}" dir="${S.guide=='ur'||S.guide=='ar'?'rtl':'ltr'}">${AI.guide(S.guide,un.w)}</div><button class="btn btn-sm btn-outline-success" id="gsay"><i class="bi bi-volume-up"></i> Hear guidance</button>`:''}
 <audio controls src="${URL.createObjectURL(blob)}" class="w-100 mt-2"></audio></div>`);
 $('#gsay').on('click',()=>{const r=AI.speakGuide(S.guide,$('#gtxt').data('w'));if(r=='en'&&(S.guide=='ur'||S.guide=='roman'))toast('Urdu/Hindi voice not installed on this device, using English voice.')})}
/* ---- Router ---- */
function show(v){stopAll();curView=v;$('.view').addClass('d-none');$('#view-'+v).removeClass('d-none').html(V[v]());$('.bottom-nav a').removeClass('active').filter(`[data-view=${v}]`).addClass('active');
 if(bound[v])bound[v]();window.scrollTo(0,0)}
$(document).on('click','.bottom-nav a',function(){show($(this).data('view'))}).on('click','[data-go]',function(){show($(this).data('go'))});
applyTheme();show('home');
/* Upgrade the sample list to all 114 surahs in the background (cached for offline use) */
Remote.init().then(ok=>{if(!ok)return;if(curView=='quran'&&$('#slist').length)$('#sq').trigger('input');else if(curView=='practice')show('practice')});
});
