/* ai-service.js – service layer. Every method has a MOCK implementation.
   Swap BASE for your secure backend/API gateway; NEVER put API keys in frontend code. */
const AI={
  BASE:null, // e.g. '/api' once a backend exists
  RATE:0.8,  // speaking speed (1 = default, lower = slower)
  LANG:{en:'en-US',ur:'ur-PK',ar:'ar-SA',hi:'hi-IN'},
  audioUrl(s,a){return `https://everyayah.com/data/Alafasy_128kbps/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`},
  /** Real: POST audio blob to Quranic ASR + Tajweed service. Mock: DEMO ONLY, results are NOT real. */
  async analyze(blob,text){
    if(this.BASE){const f=new FormData();f.append('audio',blob);f.append('text',text);return (await fetch(this.BASE+'/analyze',{method:'POST',body:f})).json()}
    await new Promise(r=>setTimeout(r,1200));
    const words=text.split(' ').map((w,i)=>({w,status:i%5==3?'unsure':'ok',confidence:i%5==3?.45:.9}));
    return{demo:true,type:'transcription-demo',tajweedVerified:false,score:null,words};
  },
  /* Friendly guidance. {W} = the Arabic word. `say:'ur'` = Urdu-family: spoken with an Urdu voice, else a Hindi voice
     (spoken Hindi and Urdu are the same, so the Devanagari text below is read naturally), else English as last resort. */
  T:{
    en:{l:'en',t:"No worries! Listen to {W} once more and repeat it slowly. Pay close attention to the vowel marks. You're doing great!"},
    ur:{l:'ur',say:'ur',t:"کوئی بات نہیں! {W} کو ایک بار پھر دھیان سے سنیں اور آہستہ آہستہ دہرائیں۔ حرکات پر خاص توجہ دیں۔ آپ بہت اچھا کر رہے ہیں!"},
    ar:{l:'ar',t:"لا بأس! استمع إلى {W} مرة أخرى وكررها ببطء مع الانتباه إلى الحركات. أنت تقوم بعمل رائع!"},
    roman:{l:'en',say:'ur',t:"Koi baat nahi! Is lafz {W} ko ek baar phir dhyan se sunein aur aahista aahista dohrayein. Harakat par khaas tawajjuh dein. Aap bohat acha kar rahe hain!"},
    hi:{l:'hi',t:"कोई बात नहीं! {W} को एक बार फिर ध्यान से सुनें और आहिस्ता आहिस्ता दोहराएँ। हरकात पर ख़ास तवज्जोह दें। आप बहुत अच्छा कर रहे हैं!"}
  },
  /** Text shown on screen (selected language). The Arabic word is shown in proper Arabic script. */
  guide(lang,word){
    const g=this.T[lang]||this.T.en;
    return g.t.replace('{W}',`<span class="ar" dir="rtl" lang="ar" style="font-size:1.5em;line-height:1.4;display:inline">${word}</span>`);
  },
  /* Pick the most natural-sounding installed voice for a language ('en','ur','ar','hi') */
  voice(lang){
    if(!window.speechSynthesis)return null;
    const vs=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().replace('_','-').startsWith(lang));
    if(!vs.length)return null;
    const score=v=>(/natural|neural/i.test(v.name)?4:0)+(/online|google/i.test(v.name)?2:0)+(v.localService?0:1);
    return vs.sort((a,b)=>score(b)-score(a))[0];
  },
  _say(parts){
    speechSynthesis.cancel();
    parts.forEach(p=>{const u=new SpeechSynthesisUtterance(p.t);const v=this.voice(p.l);
      if(v){u.voice=v;u.lang=v.lang}else u.lang=this.LANG[p.l]||'en-US';
      u.rate=p.r||this.RATE;u.pitch=1.05;speechSynthesis.speak(u)});
  },
  /** Speak guidance in the selected language. Returns which voice family was used: 'ur' | 'hi' | 'en' | 'ar' (or null). */
  speakGuide(lang,word){
    if(!window.speechSynthesis)return null;
    const g=this.T[lang]||this.T.en;let l=g.l,text=g.t;
    if(g.say){
      if(this.voice('ur')){l='ur';text=this.T.ur.t}
      else if(this.voice('hi')){l='hi';text=this.T.hi.t}
      else{l='en';text=this.T.roman.t}
    }
    const segs=text.split('{W}'),q=[],hasAr=!!this.voice('ar');
    segs.forEach((s,i)=>{if(s.trim())q.push({t:s,l});if(i<segs.length-1&&hasAr)q.push({t:word,l:'ar',r:.6})});
    this._say(q);return l;
  },
  speak(text,lang){ // generic TTS (e.g. hadith). Replace with a cloud TTS API for best quality.
    if(!window.speechSynthesis)return;
    this._say([{t:text,l:lang=='roman'?'en':lang}]);
  }
};
if(window.speechSynthesis)speechSynthesis.getVoices(); // warm up voice list
