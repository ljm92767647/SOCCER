const board=document.getElementById('board'),cards=new Map(),dialog=document.getElementById('player-dialog');let mode='roles';const galleryObservers=[];
// Keep the original main collection. Ref 3 is the extra, duplicate Dembele shirt.
const allRefs=new Set(DATA.roles.flatMap(r=>r.images));
for(const ref of allRefs){const p=DATA.jerseys[ref],a=document.createElement('button');a.type='button';a.className='jersey';a.dataset.name=p.name;a.setAttribute('aria-label',p.name+' 선수 능력 설명 열기');const img=document.createElement('img');img.src=p.src;img.alt=p.name+' 백넘버 유니폼';const label=document.createElement('span');label.className='card-name';label.textContent=p.name;a.append(img,label);cards.set(ref,a);a.addEventListener('click',()=>showPlayer(p))}
function showPlayer(p){document.querySelector('.player-visual').style.setProperty('--kit-color',p.color||'#576c90');document.getElementById('selected-uniform').src=p.src;document.getElementById('selected-uniform').alt=p.name+' 유니폼';document.getElementById('selected-name').textContent=p.name;document.getElementById('selected-skills').replaceChildren(document.getElementById(p.target).querySelector('.player-copy').cloneNode(true));dialog.showModal()}
function attachSlider(viewport,content,title){const rail=document.createElement('div');rail.className='scroll-control';const range=document.createElement('input');range.type='range';range.min='0';range.max='1000';range.step='1';range.value='0';range.setAttribute('aria-label',title+' 좌우 이동');rail.append(range);viewport.after(rail);let extent=0;function sync(){extent=Math.max(0,viewport.scrollWidth-viewport.clientWidth);rail.hidden=extent<2;range.value=extent?String(Math.round(viewport.scrollLeft/extent*1000)):'0';range.setAttribute('aria-valuetext',Math.round(Number(range.value)/10)+'% 이동')}range.addEventListener('input',()=>{viewport.scrollLeft=Number(range.value)/1000*extent});viewport.addEventListener('scroll',sync,{passive:true});const observer=new ResizeObserver(sync);observer.observe(viewport);observer.observe(content);galleryObservers.push(observer);sync()}
function arrange(){galleryObservers.splice(0).forEach(o=>o.disconnect());const previous=new Map([...cards].map(([ref,a])=>[ref,a.getBoundingClientRect()]));board.replaceChildren();board.className='single'+(mode==='signature'?' signature':'');const placed=new Set();for(const row of DATA[mode]){const refs=row.images.filter(ref=>allRefs.has(ref)&&!placed.has(ref));if(!refs.length)continue;const section=document.createElement('section');section.className='uniform-group'+(row.compact?' compact':'');const label=document.createElement('h3');label.className='row-label';label.textContent=row.title;const viewport=document.createElement('div');viewport.className='gallery-viewport';const grid=document.createElement('div');grid.className='uniform-grid';grid.style.setProperty('--count',refs.length);for(const ref of refs){placed.add(ref);grid.append(cards.get(ref))}viewport.append(grid);section.append(label,viewport);board.append(section);attachSlider(viewport,grid,row.title)}
if(!matchMedia('(prefers-reduced-motion: reduce)').matches)for(const [ref,a] of cards){const old=previous.get(ref),next=a.getBoundingClientRect();if(old.width&&a.isConnected)a.animate([{transform:`translate(${old.x-next.x}px,${old.y-next.y}px)`},{transform:'translate(0,0)'}],{duration:500,easing:'cubic-bezier(.22,.7,.3,1)'})}
}
function select(next){mode=next;document.getElementById('default-mode').setAttribute('aria-pressed',String(mode==='roles'));document.getElementById('signature-mode').setAttribute('aria-pressed',String(mode==='signature'));arrange()}
document.getElementById('default-mode').addEventListener('click',()=>select('roles'));document.getElementById('signature-mode').addEventListener('click',()=>select('signature'));
document.getElementById('close-player').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});const toggle=document.getElementById('toggle-notes');toggle.addEventListener('click',()=>{const notes=[...document.querySelectorAll('.player-note')],open=notes.some(n=>!n.open);notes.forEach(n=>n.open=open);toggle.textContent=open?'모두 접기':'모두 펼치기'});arrange();

const clubDialog=document.getElementById('club-dialog');
document.querySelectorAll('.club-button').forEach(button=>button.addEventListener('click',()=>{const crest=button.querySelector('img');document.getElementById('club-name').textContent=crest.alt;const image=crest.cloneNode(true);document.getElementById('club-crest').replaceChildren(image);clubDialog.showModal()}));
document.getElementById('close-club').addEventListener('click',()=>clubDialog.close());clubDialog.addEventListener('click',event=>{if(event.target===clubDialog)clubDialog.close()});

// Each home card opens one collection, while deep links and browser Back still work.
const screens=['home','clubs','uniforms','abilities','notes'];
function routeCollection(){const hash=decodeURIComponent(location.hash.slice(1));let view=['clubs','uniforms','abilities'].includes(hash)?hash:hash.startsWith('line-')||hash==='notes'?'uniforms':'home';document.body.dataset.view=view;for(const id of screens)document.getElementById(id).hidden=!(id===view||(view==='uniforms'&&id==='notes'));document.querySelectorAll('header nav a').forEach(a=>{if(a.hash==='#'+view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});if(view==='uniforms')arrange();window.scrollTo({top:0,behavior:'instant'});if(hash.startsWith('line-')){const entry=document.getElementById(hash);if(entry){document.getElementById('notes-archive').open=true;entry.open=true;entry.scrollIntoView({block:'start'})}}}
window.addEventListener('hashchange',routeCollection);routeCollection();

// Move a soft, neutral reflection across the black glass with the pointer.
for (const card of document.querySelectorAll('.entry-card')) {
  card.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty('--reflect-x', (event.clientX - bounds.left) + 'px');
    card.style.setProperty('--reflect-y', (event.clientY - bounds.top) + 'px');
    card.toggleAttribute('data-reflect', true);
  });
  const clearReflection = () => card.removeAttribute('data-reflect');
  card.addEventListener('pointerleave', clearReflection);
  card.addEventListener('pointercancel', clearReflection);
}
