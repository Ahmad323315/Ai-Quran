/* storage.js – localStorage wrapper (safe if storage is blocked) */
const Store={
  get(k,d){try{const v=localStorage.getItem('noor:'+k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){try{localStorage.setItem('noor:'+k,JSON.stringify(v))}catch(e){}},
  defaults:{settings:{theme:'light',trans:'en',guide:'roman',arSize:28},bookmarks:[],progress:{listened:0,practiced:0,today:0,goal:10,streak:1,last:{s:1,a:1}},history:[]}
};
