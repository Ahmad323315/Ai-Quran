/* remote-data.js – loads the COMPLETE Quran (114 surahs) and Hadith books from public APIs.
   Data is cached in the browser (Cache API) so it works offline after the first load.
   Sources: api.alquran.cloud (Uthmani text, Sahih International, Jalandhry Urdu)
            fawazahmed0/hadith-api via jsDelivr (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah) */
const Remote={
  Q:'https://api.alquran.cloud/v1',
  H:'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions',
  COLS:{
    bukhari:{name:'Sahih al-Bukhari',books:97},
    muslim:{name:'Sahih Muslim',books:56},
    abudawud:{name:'Sunan Abi Dawud',books:43},
    tirmidhi:{name:"Jami' at-Tirmidhi",books:49},
    nasai:{name:"Sunan an-Nasa'i",books:51},
    ibnmajah:{name:'Sunan Ibn Majah',books:37}
  },
  /* fetch JSON with cache-first strategy (safe if Cache API is unavailable) */
  async get(url){
    let c=null;
    try{c=await caches.open('noor-data-v1');const m=await c.match(url);if(m)return await m.json()}catch(e){c=null}
    const r=await fetch(url);
    if(!r.ok)throw new Error('HTTP '+r.status);
    try{if(c)await c.put(url,r.clone())}catch(e){}
    return r.json()
  },
  /* Replace the 2-surah sample list with all 114 surahs (ayat are loaded lazily per surah) */
  async init(){
    try{
      const j=await this.get(this.Q+'/surah');
      if(!j.data||j.data.length!=114)return false;
      const old=QURAN.slice();QURAN.length=0;
      j.data.forEach(s=>{
        const o=old.find(x=>x.n==s.number);
        if(o){o.count=s.numberOfAyahs;QURAN.push(o)}
        else QURAN.push({n:s.number,ar:s.name.replace(/^\S+\s+/,''),en:s.englishName,meaning:s.englishNameTranslation,count:s.numberOfAyahs,ayat:null});
      });
      return true
    }catch(e){return false}
  },
  /* Load all ayat of one surah (Arabic + English + Urdu) */
  async loadSurah(n){
    const sr=QURAN.find(x=>x.n==n);
    if(sr.ayat)return sr;
    const j=await this.get(`${this.Q}/surah/${n}/editions/quran-uthmani,en.sahih,ur.jalandhry`);
    const [a,e,u]=j.data;
    const bare=w=>w.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g,'');
    sr.ayat=a.ayahs.map((x,i)=>{
      let t=x.text;
      /* the API prepends the Bismillah to ayah 1 of every surah except 1 and 9; remove it (4 words) */
      if(i==0&&n!=1&&n!=9){const w=t.split(' ');if(w.length>4&&bare(w[0])=='بسم')t=w.slice(4).join(' ')}
      return{a:t,en:e.ayahs[i].text,ur:u.ayahs[i].text}
    });
    return sr
  },
  /* Load one hadith book (section) with Arabic + English + Urdu merged by hadith number */
  async hadithBook(col,bk){
    const g=p=>this.get(`${this.H}/${p}-${col}/sections/${bk}.json`).catch(()=>null);
    const [ar,en,ur]=await Promise.all([g('ara'),g('eng'),g('urd')]);
    const base=en||ar;
    if(!base||!base.hadiths)throw new Error('not available');
    const idx=o=>{const m={};(o&&o.hadiths?o.hadiths:[]).forEach(h=>m[h.hadithnumber]=h);return m};
    const A=idx(ar),U=idx(ur),E=idx(en);
    const name=this.COLS[col].name;
    const sec=base.metadata&&base.metadata.section?Object.values(base.metadata.section)[0]:'';
    const cat='Book '+bk+(sec?': '+sec:'');
    return base.hadiths.map(h=>{
      const n=h.hadithnumber;
      const gr=h.grades&&h.grades.length?h.grades[0].grade:(col=='bukhari'||col=='muslim'?'Sahih':'Grade n/a');
      return{id:col+'-'+n,cat,ar:(A[n]&&A[n].text)||'',en:(E[n]&&E[n].text)||h.text||'',ur:(U[n]&&U[n].text)||'',ref:name+' '+n,grade:gr}
    }).filter(h=>h.en||h.ar)
  }
};
