/* =========================================================
   Vortyx · Hub de demonstrações — abas, cards e 3D do topo
   Depende de: js/config.js, js/demos.js, demos-kit/kit.js
   ========================================================= */
(function(){
  const d=document, K=window.VxKit;
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  d.querySelectorAll('.js-wa').forEach(a=>{a.href=K.wa(a.dataset.msg)});
  d.getElementById('year').textContent=new Date().getFullYear();
  d.getElementById('statDemos').textContent=DEMOS.length;

  /* ---------- Abas ---------- */
  const tabs=d.getElementById('tabs'),panel=d.getElementById('panel'),grid=d.getElementById('grid'),head=d.getElementById('catHead');
  const count=id=>DEMOS.filter(x=>x.cat===id).length;
  tabs.innerHTML=DEMO_CATS.map(c=>`<button class="tab" role="tab" id="tab-${c.id}" aria-controls="panel" aria-selected="false" tabindex="-1" data-cat="${c.id}">
      <svg aria-hidden="true"><use href="#c-${c.id}"/></svg><span><small>${c.n}</small><b>${esc(c.short)}</b></span><em>${count(c.id)}</em></button>`).join('');
  const btns=[...tabs.querySelectorAll('.tab')];
  const FX={'3D':'f3d','Simulação':'fsim','Interativo':''};
  const arrow='<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1.5 7h11M8 2.5 12.5 7 8 11.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function card(x,i){
    return `<article class="demo" style="--i:${i}">
      <div class="demo-media"><span class="fx ${FX[x.fx]||''}">${esc(x.fx)}</span><span class="demo-badge">Demonstração</span>
        <div class="demo-frame"><div class="demo-bar" aria-hidden="true"><i></i><i></i><i></i></div>
          <img src="../images/demos/${esc(x.thumb)}" alt="Prévia da demonstração ${esc(x.title)}" width="960" height="600" loading="lazy" decoding="async" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'demo-ph',textContent:'Prévia em breve'}))">
        </div></div>
      <div class="demo-info"><span class="demo-seg">${esc(x.segment)}</span><h3>${esc(x.title)}</h3><p>${esc(x.desc)}</p>
        <div class="demo-tags">${x.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div>
        <span class="demo-open">Abrir demonstração ${arrow}</span></div>
      <a class="demo-link" href="${esc(x.path)}" aria-label="Abrir demonstração: ${esc(x.title)}"></a>
    </article>`;
  }
  let current=null;
  // rola só a faixa de abas (horizontal); nunca mexe na rolagem vertical da página
  function revealTab(b){const bar=tabs;if(bar.scrollWidth<=bar.clientWidth+1)return;
    const r=b.getBoundingClientRect(),R=bar.getBoundingClientRect(),target=Math.max(0,Math.min(bar.scrollLeft+(r.left-R.left)-(bar.clientWidth-r.width)/2,bar.scrollWidth-bar.clientWidth));
    try{bar.scrollTo({left:target,behavior:K.reduce?'auto':'smooth'})}catch(e){bar.scrollLeft=target}}
  function select(id,{focus=false,push=true}={}){
    const c=DEMO_CATS.find(c=>c.id===id)||DEMO_CATS[0];
    if(current===c.id){if(push){try{history.replaceState(null,'','#'+c.id)}catch(e){}}return}current=c.id;
    btns.forEach(b=>{const on=b.dataset.cat===c.id;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;if(on){revealTab(b);if(focus)b.focus({preventScroll:true})}});
    panel.setAttribute('aria-labelledby','tab-'+c.id);
    const render=()=>{
      head.innerHTML=`<h2>${esc(c.name)}</h2><p>${esc(c.lead)}</p>`;
      grid.innerHTML=DEMOS.filter(x=>x.cat===c.id).map(card).join('');
      grid.classList.remove('swap-out');head.classList.remove('swap-out');
    };
    if(grid.children.length&&!K.reduce){grid.classList.add('swap-out');head.classList.add('swap-out');setTimeout(render,220)}else render();
    if(push){try{history.replaceState(null,'','#'+c.id)}catch(e){}}
  }
  tabs.addEventListener('click',e=>{const b=e.target.closest('.tab');if(b)select(b.dataset.cat)});
  tabs.addEventListener('keydown',e=>{
    const i=btns.findIndex(b=>b.dataset.cat===current);let n=-1;
    if(e.key==='ArrowRight')n=(i+1)%btns.length;else if(e.key==='ArrowLeft')n=(i-1+btns.length)%btns.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=btns.length-1;
    if(n>-1){e.preventDefault();select(btns[n].dataset.cat,{focus:true})}
  });
  const fromHash=()=>{const h=location.hash.slice(1);return DEMO_CATS.some(c=>c.id===h)?h:null};
  select(fromHash()||'sites',{push:false});
  addEventListener('hashchange',()=>{const h=fromHash();if(h)select(h,{push:false})});
  if(fromHash())requestAnimationFrame(()=>d.getElementById('explorar').scrollIntoView());

  /* ---------- 3D do topo: núcleo + 6 órbitas (os 6 serviços) ---------- */
  const canvas=d.getElementById('hubFx');
  K.three().then(T=>{
    if(!T)return;
    const mobile=innerWidth<760;
    let renderer;try{renderer=new T.WebGLRenderer({canvas,antialias:!mobile,alpha:true,powerPreference:'low-power'})}catch(e){return}
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1:1.5));
    const scene=new T.Scene(),cam=new T.PerspectiveCamera(40,1,.1,100);cam.position.set(0,0,9);
    const root=new T.Group();scene.add(root);
    const C=[0x3626FA,0x7462F5,0x19E3D6];
    // núcleo de partículas
    const N=mobile?900:1800,pos=new Float32Array(N*3),col=new Float32Array(N*3);
    for(let i=0;i<N;i++){const r=Math.pow(Math.random(),.6)*1.1,a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1);
      pos.set([r*Math.sin(b)*Math.cos(a),r*Math.sin(b)*Math.sin(a),r*Math.cos(b)],i*3);const c=new T.Color(C[i%3]);col.set([c.r,c.g,c.b],i*3)}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('color',new T.BufferAttribute(col,3));
    const core=new T.Points(g,new T.PointsMaterial({size:.035,vertexColors:true,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false}));root.add(core);
    // 6 órbitas com um satélite cada
    const sats=[];
    for(let i=0;i<6;i++){
      const R=1.7+i*.36,tilt=new T.Group();tilt.rotation.set(.35+i*.17,i*.6,0);root.add(tilt);
      const ring=new T.Mesh(new T.TorusGeometry(R,.004,6,160),new T.MeshBasicMaterial({color:C[i%3],transparent:true,opacity:.28}));tilt.add(ring);
      const s=new T.Mesh(new T.SphereGeometry(.07,16,16),new T.MeshBasicMaterial({color:i%2?0x19E3D6:0xB3A8FF}));tilt.add(s);
      const halo=new T.Mesh(new T.SphereGeometry(.16,16,16),new T.MeshBasicMaterial({color:i%2?0x19E3D6:0x7462F5,transparent:true,opacity:.18,blending:T.AdditiveBlending,depthWrite:false}));s.add(halo);
      sats.push({s,R,sp:.18+.05*(i%3),ph:i*1.1});
    }
    const mouse={x:0,y:0,tx:0,ty:0};
    if(matchMedia('(pointer:fine)').matches)addEventListener('pointermove',e=>{mouse.tx=e.clientX/innerWidth-.5;mouse.ty=e.clientY/innerHeight-.5},{passive:true});
    function size(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();
      const m=w<760;root.position.set(m?0:Math.min(3.4,w/h*1.6),m?1.2:0,0);root.scale.setScalar(m?.62:1)}
    size();addEventListener('resize',size);
    let t=0;
    K.loop(canvas,(dt)=>{t+=dt;mouse.x+=(mouse.tx-mouse.x)*.05;mouse.y+=(mouse.ty-mouse.y)*.05;
      core.rotation.y=t*.12;core.rotation.x=t*.05;
      sats.forEach(o=>{const a=o.ph+t*o.sp;o.s.position.set(Math.cos(a)*o.R,Math.sin(a)*o.R,0)});
      root.rotation.y=mouse.x*.35;root.rotation.x=mouse.y*.25;renderer.render(scene,cam)},{onSlow:l=>{if(l===1){renderer.setPixelRatio(1);size()}}});
    canvas.classList.add('ready');
  });
})();
