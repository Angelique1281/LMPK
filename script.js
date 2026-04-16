/* ── NAVIGATION SPA ── */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'config') setTimeout(() => applyMaskFromBackgroundImage(), 100);
}

function openLookPreset(col, vol, traine, orn) {
  showPage('config');
  window.setTimeout(() => {
    const colorEl = document.querySelector(`.swatch[data-col="${col}"]`);
    const volEl = document.querySelector(`.opt-btn[data-vol="${vol}"]`);
    const traineEl = document.querySelector(`.opt-btn[data-traine="${traine}"]`);
    const ornEl = document.querySelector(`.opt-btn[data-orn="${orn}"]`);

    if (colorEl) setColor(colorEl);
    if (volEl) setVolant(volEl);
    if (traineEl) setTraine(traineEl);
    if (ornEl) setOrnement(ornEl);
  }, 120);
}
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
});

/* ── PANIER ── */
let cartItems = [];
function openCart() { document.getElementById('cart-overlay').classList.add('open'); document.getElementById('cart-drawer').classList.add('open'); }
function closeCart() { document.getElementById('cart-overlay').classList.remove('open'); document.getElementById('cart-drawer').classList.remove('open'); }
function addToCart() {
  const labels = { vert:'émeraude',blanc:'ivoire',rouge:'rafaëla',bleu:'acier','or-pale':'or pâle',cascade:'cascade',reduit:'volants réduits',sans:'sans volant',longue:'traîne longue',courte:'traîne courte','gants-courts':'gants courts','gants-longs':'gants longs','chapeau-blanc':'chapeau blanc','look-court-chapeau':'look court + chapeau','look-long-chapeau':'look long + chapeau' };
  cartItems.push({ nom:'Jeune Fille en Vert', col:labels[state.col]||state.col, vol:labels[state.vol]||state.vol, traine:labels[state.traine]||state.traine, orn:state.orn!=='sans'?labels[state.orn]||state.orn:null, prix:calcPrix() });
  renderCart();
  showToast('Ajouté à votre collection ✓');
  setTimeout(openCart, 600);
}
function renderCart() {
  const list = document.getElementById('cart-items-list');
  const footer = document.getElementById('cart-footer');
  document.getElementById('cart-count').textContent = cartItems.length;
  if (!cartItems.length) { list.innerHTML='<div class="cart-empty"><div class="cart-empty-ico">◇</div><div class="cart-empty-txt">Votre collection est vide</div></div>'; footer.style.display='none'; return; }
  footer.style.display='block';
  let total=0, html='';
  cartItems.forEach(it => { total+=it.prix; const d=[it.col,it.vol,it.traine,it.orn].filter(Boolean).join(' · '); html+=`<div class="cart-item"><div class="cart-item-nom">${it.nom}</div><div class="cart-item-detail">${d}</div><div class="cart-item-prix">${it.prix.toLocaleString('fr-FR')} €</div></div>`; });
  list.innerHTML=html;
  document.getElementById('cart-total').textContent=total.toLocaleString('fr-FR')+' €';
}

/* ── TOAST ── */
function showToast(msg) { const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3000); }

/* ── CONFIGURATEUR (repris de script.js) ── */
const overlay = document.getElementById("product-shape");
const colorPalettes = {
  vert:{main:'#01a244',mid:'#026d27',dark:'#023316'},
  blanc:{main:'#E8E4DB',mid:'#D4CFC5',dark:'#A09A8E'},
  rouge:{main:'#800110',mid:'#6a0213',dark:'#450209'},
  noir:{main:'#2A2A2A',mid:'#1E1E1E',dark:'#0E0E0E'},
  bleu:{main:'#1900FF',mid:'#1400CC',dark:'#0D0099'},
  'or-pale':{main:'#f2bb74',mid:'#de9f57',dark:'#bf7f3c'},
};
const prixBase = { vert:1890,blanc:2090,rouge:2290,noir:1990,bleu:2190,'or-pale':2690 };
const prixAdd  = { cascade:0,reduit:-200,sans:-300,longue:200,courte:0,'gants-courts':190,'gants-longs':290,'chapeau-blanc':220,'look-court-chapeau':410,'look-long-chapeau':510 };
const state = { col:'blanc',vol:'cascade',traine:'longue',orn:'sans' };
const defaultBackgroundImage='dernier.png', reducedVolantsImage='2volants.png', noVolantsImage='sansvolants.png', shortTrainImage='traine-courte.png', noTrainImage='sans-traine.png';
const dressMergeSplit=0.5, dressTransitionMs=220;
let currentBaseImageSrc=defaultBackgroundImage, renderRequestId=0;
const mergedDressCache=new Map();

function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;});}
function getMergedDressImage(baseSrc,trainSrc){const k=`${baseSrc}::${trainSrc}`;if(mergedDressCache.has(k))return mergedDressCache.get(k);const p=Promise.all([loadImage(baseSrc),loadImage(trainSrc)]).then(([b,t])=>{const w=b.naturalWidth,h=b.naturalHeight,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),s=Math.floor(h*dressMergeSplit);x.drawImage(b,0,0,w,s,0,0,w,s);x.drawImage(t,0,s,w,h-s,0,s,w,h-s);return c.toDataURL('image/png');}).catch(()=>baseSrc);mergedDressCache.set(k,p);return p;}
async function renderDressImage(){const img=document.getElementById('background-image'),tl=document.getElementById('train-image');if(!img)return;const id=++renderRequestId;let finalSrc=currentBaseImageSrc;if(state.traine==='courte')finalSrc=await getMergedDressImage(currentBaseImageSrc,shortTrainImage);else if(state.traine==='sans')finalSrc=await getMergedDressImage(currentBaseImageSrc,noTrainImage);if(id!==renderRequestId)return;if(tl){tl.style.opacity='0';tl.src='data:,';}if(img.getAttribute('src')===finalSrc){applyMaskFromBackgroundImage();return;}try{await loadImage(finalSrc);}catch(_){}if(id!==renderRequestId)return;img.style.opacity='0';window.setTimeout(()=>{if(id!==renderRequestId)return;img.setAttribute('src',finalSrc);applyMaskFromBackgroundImage();requestAnimationFrame(()=>{if(id!==renderRequestId)return;img.style.opacity='1';});},Math.floor(dressTransitionMs*.45));}
function applyHex(hex){if(!overlay)return;overlay.style.fill=hex;}
function applyColorTuning(){const svg=document.getElementById('product-svg'),sh=document.getElementById('product-shape');if(!svg||!sh)return;if(state.col==='or-pale'){svg.style.mixBlendMode='color';svg.style.filter='sepia(0.12) saturate(1.2) brightness(1.02)';sh.style.opacity='0.92';}else{svg.style.mixBlendMode='';svg.style.filter='';sh.style.opacity='1';}}
function animateColorSwitch(fn){const svg=document.getElementById('product-svg');if(!svg){fn();return;}svg.style.opacity='0.84';requestAnimationFrame(()=>requestAnimationFrame(()=>{fn();svg.style.opacity='1';}));}
function setColor(el){document.querySelectorAll('.swatch').forEach(s=>s.classList.remove('active'));el.classList.add('active');state.col=el.dataset.col;const c=colorPalettes[state.col];animateColorSwitch(()=>{applyHex(c.main);applyColorTuning();});updatePrix();updateResume();}
function applyMaskFromBackgroundImage(){const img=document.getElementById('background-image'),ps=document.getElementById('product-svg'),os=document.getElementById('overlay-svg');if(!img)return;const src=img.getAttribute('src');if(!src)return;const mu=`url("${src}")`;if(ps){ps.style.maskImage=mu;ps.style.webkitMaskImage=mu;}if(os){os.style.maskImage=mu;os.style.webkitMaskImage=mu;}}
function updateBackgroundForVolants(){let s=defaultBackgroundImage;if(state.vol==='reduit')s=reducedVolantsImage;if(state.vol==='sans')s=noVolantsImage;currentBaseImageSrc=s;renderDressImage();}
function setVolant(btn){document.querySelectorAll('[data-vol]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');state.vol=btn.dataset.vol;updateBackgroundForVolants();updatePrix();updateResume();}
function setTraine(btn){document.querySelectorAll('[data-traine]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');state.traine=btn.dataset.traine;renderDressImage();updatePrix();updateResume();}
function setOrnement(btn){document.querySelectorAll('[data-orn]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');state.orn=btn.dataset.orn;applyOrnementState();updatePrix();updateResume();}
function applyOrnementState(){const g=document.getElementById('gants'),ch=document.getElementById('chapeau'),sg=document.getElementById('short-gloves-image'),lg=document.getElementById('long-gloves-image'),hat=document.getElementById('hat-image');const ss=state.orn==='gants-courts'||state.orn==='look-court-chapeau',sl=state.orn==='gants-longs'||state.orn==='look-long-chapeau',sh=state.orn==='chapeau-blanc'||state.orn==='look-court-chapeau'||state.orn==='look-long-chapeau';if(g)g.style.opacity='0';if(sg){if(ss){if(sg.getAttribute('src')!=='gants-courts.png')sg.setAttribute('src','gants-courts.png');sg.style.opacity='1';}else{sg.style.opacity='0';sg.setAttribute('src','data:,');}}if(lg){if(sl){if(lg.getAttribute('src')!=='gants-longs.png')lg.setAttribute('src','gants-longs.png');lg.style.opacity='1';}else{lg.style.opacity='0';lg.setAttribute('src','data:,');}}if(ch)ch.style.opacity='0';if(hat){if(sh){if(hat.getAttribute('src')!=='chapeau.png')hat.setAttribute('src','chapeau.png');hat.style.opacity='1';}else{hat.style.opacity='0';hat.setAttribute('src','data:,');}}}
function calcPrix(){let p=prixBase[state.col]||1890;p+=(prixAdd[state.vol]||0);p+=(prixAdd[state.traine]||0);p+=(prixAdd[state.orn]||0);return p;}
function updatePrix(){const el=document.getElementById('prix');if(!el)return;el.innerHTML=calcPrix().toLocaleString('fr-FR')+' <span>€</span>';const nums={vert:'01',blanc:'02',rouge:'03',noir:'04',bleu:'05','or-pale':'06'};const ed=document.getElementById('edition');if(ed)ed.textContent='JEUNE FILLE EN VERT — N°'+(nums[state.col]||'01')+' / 30';}
function updateResume(){const el=document.getElementById('config-resume');if(!el)return;const L={vert:'émeraude',blanc:'ivoire',rouge:'rafaëla',bleu:'acier','or-pale':'or pâle',cascade:'cascade',reduit:'volants réduits',sans:'sans volant',longue:'traîne longue',courte:'traîne courte','gants-courts':'gants courts','gants-longs':'gants longs','chapeau-blanc':'chapeau blanc','look-court-chapeau':'look total court','look-long-chapeau':'look total long'};const tags=[state.col,state.vol,state.traine];if(state.orn!=='sans')tags.push(state.orn);el.innerHTML=tags.map(t=>`<span class="config-tag">${L[t]||t}</span>`).join('');}

/* init */
applyHex(colorPalettes.blanc.main);
updateBackgroundForVolants();
applyMaskFromBackgroundImage();
applyColorTuning();
applyOrnementState();
updatePrix();
updateResume();
renderCart();
