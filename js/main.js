(function(){
  const d=document, root=d.documentElement, body=d.body;
  body.classList.remove('no-js');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile=()=>innerWidth<768;

  /* ---------- WhatsApp ---------- */
  function waLink(msg){
    const text=encodeURIComponent(msg||CONFIG.whatsappMessage);
    const n=(CONFIG.whatsappNumber||'').replace(/\D/g,'');
    return n?`https://wa.me/${n}?text=${text}`:`https://wa.me/?text=${text}`;
  }
  function bindWa(scope){scope.querySelectorAll('.js-wa').forEach(a=>{a.href=waLink(a.dataset.msg);a.target='_blank';a.rel='noopener'})}
  bindWa(d);

  /* ---------- Fundador / ano ---------- */
  if(CONFIG.founderName){d.getElementById('founderName').textContent=CONFIG.founderName;d.getElementById('founderRole').textContent=CONFIG.founderRole}
  d.getElementById('year').textContent=new Date().getFullYear();

  /* ---------- Projetos ---------- */
  const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const ico=(id,s)=>`<svg width="${s}" height="${s}" aria-hidden="true"><use href="#${id}"/></svg>`;
  const symSrc=d.querySelector('.brand .sym').src;
  const TYPE_LABEL={cliente:'Projeto de cliente',proprio:'Projeto próprio',demo:'Demonstração Vortyx'};
  function projectCard(p,feat){
    const ext=p.link&&/^https?:/.test(p.link);
    const type=TYPE_LABEL[p.type]?p.type:'cliente';
    const badge=type==='demo'?'<span class="badge badge-demo">Demonstração Vortyx</span>':(type==='cliente'?'<span class="badge badge-client">Projeto de cliente</span>':'');
    const media=p.image
      ?`<div class="frame"><div class="frame-bar" aria-hidden="true"><i></i><i></i><i></i></div><img class="cover" src="${esc(p.image)}" alt="${esc(p.imageAlt||'Captura do projeto '+p.client)}" width="${p.imageWidth||1438}" height="${p.imageHeight||832}" loading="lazy" decoding="async"></div>`
      :(p.emblem?`<div class="emblem"><img src="${symSrc}" alt="" width="190" height="165"></div>`:'');
    const link=p.link?`<a class="btn ${feat?'btn-primary':'btn-ghost'} btn-sm" href="${esc(p.link)}"${ext?' target="_blank" rel="noopener"':''}>${esc(p.linkLabel||'Ver site')} ${ico('i-arrow',12)}${ext?'<span class="sr">(abre em nova aba)</span>':''}</a>`:'';
    return `<article class="proj rv proj-${type}${feat?' proj-feat':''}"><div class="media">${media}${badge}</div><div class="info">
      <p class="cat"><span>${esc(p.category)}</span>${type==='proprio'?`<span class="tp">${TYPE_LABEL[type]}</span>`:''}</p><h3>${esc(p.client)}</h3><p class="dsc">${esc(p.description)}</p>
      ${link?`<div class="links">${link}</div>`:''}</div></article>`;
  }
  const ctaCard=`<article class="proj proj-cta rv"><div><div class="rings" aria-hidden="true"><span></span><span></span><span></span></div>
      <h3>O próximo projeto pode ser o seu.</h3><p>Site, landing page, automação ou solução web: conte o que o seu negócio precisa.</p></div>
      <a class="btn btn-primary btn-sm js-wa" data-msg="Olá! Vim pelo site da Vortyx, vi os projetos e gostaria de conversar sobre o meu." href="https://wa.me/5535999348489">${ico('i-wa',16)}Conversar sobre meu projeto</a></article>`;
  const grid=d.getElementById('projGrid'), more=d.getElementById('projMore');
  const list=[...PROJECTS].sort((a,b)=>(b.featured?1:0)-(a.featured?1:0));
  const limit=Math.max(1,CONFIG.projectsOnHome||3);
  const shown=list.slice(0,limit), rest=list.slice(limit);
  // O primeiro projeto real de cliente com imagem ganha destaque (card maior)
  const featIdx=shown.findIndex(p=>p.type==='cliente'&&p.image);
  if(featIdx>-1){const fb=d.getElementById('projFeat');fb.innerHTML=projectCard(shown[featIdx],true);fb.hidden=false;d.getElementById('projWrap').classList.add('has-feat');bindWa(fb)}
  grid.innerHTML=shown.filter((p,i)=>i!==featIdx).map(p=>projectCard(p,false)).join('')+(shown.length<limit?ctaCard:'');
  if(rest.length){
    more.hidden=false;
    if(CONFIG.projectsPage){more.innerHTML=`<a class="btn btn-ghost" href="${esc(CONFIG.projectsPage)}">Ver todos os projetos ${ico('i-arrow',12)}</a>`}
    else{
      more.innerHTML=`<button class="btn btn-ghost" type="button" aria-expanded="false" aria-controls="projGrid">Ver todos os projetos (${list.length})</button>`;
      more.querySelector('button').addEventListener('click',e=>{
        grid.insertAdjacentHTML('beforeend',rest.map(p=>projectCard(p,false)).join(''));
        grid.querySelectorAll('.proj.rv:not(.in)').forEach(el=>{io.observe(el)});bindWa(grid);
        e.currentTarget.setAttribute('aria-expanded','true');more.hidden=true;
      });
    }
  }
  bindWa(grid);

  /* ---------- Reveal + stagger ---------- */
  d.querySelectorAll('[data-stagger]').forEach(g=>[...g.querySelectorAll('.rv')].forEach((el,i)=>el.style.setProperty('--i',Math.min(i,5))));
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -6% 0px',threshold:.08});
  d.querySelectorAll('.rv').forEach(el=>io.observe(el));
  requestAnimationFrame(()=>body.classList.add('loaded'));

  /* ---------- Header / menu ---------- */
  const hdr=d.getElementById('hdr'), burger=d.getElementById('burger'), mm=d.getElementById('mmenu');
  const totop=d.getElementById('totop'), fab=d.getElementById('fabWa');
  function setFloats(show){
    [totop,fab].forEach(b=>{if(show!==b.classList.contains('show')){b.classList.toggle('show',show);b.tabIndex=show?0:-1}});
  }
  function setMenu(open,kb){
    burger.setAttribute('aria-expanded',open);burger.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
    mm.classList.toggle('open',open);mm.setAttribute('aria-hidden',!open);mm.inert=!open;
    body.style.overflow=open?'hidden':'';
    if(open)setFloats(false);else requestAnimationFrame(onScroll);
    if(open&&kb)setTimeout(()=>{const f=mm.querySelector('nav a');if(f&&mm.classList.contains('open'))f.focus()},60);
  }
  mm.inert=true;
  burger.addEventListener('click',e=>setMenu(burger.getAttribute('aria-expanded')!=='true',e.detail===0));
  mm.querySelectorAll('a[href^="http"]').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  addEventListener('keydown',e=>{if(e.key==='Escape'&&mm.classList.contains('open')){setMenu(false);burger.focus()}});

  /* ---------- Serviços: cards expansíveis (um aberto por vez) ---------- */
  const cards=[...d.querySelectorAll('.svc')];
  function setCard(card,open,scroll){
    const btn=card.querySelector('.svc-top'), panel=card.querySelector('.svc-panel');
    btn.setAttribute('aria-expanded',open);card.classList.toggle('open',open);panel.inert=!open;
    if(open&&scroll){
      const top=card.getBoundingClientRect().top, off=parseFloat(getComputedStyle(root).scrollPaddingTop)||80;
      if(top<off||top>innerHeight*.55)scrollTo({top:scrollY+top-off-8,behavior:reduce?'auto':'smooth'});
    }
  }
  function openCard(id,scroll){const c=d.getElementById(id);if(!c)return;cards.forEach(o=>{if(o!==c&&o.classList.contains('open'))setCard(o,false)});setCard(c,true,scroll)}
  cards.forEach(c=>{
    c.querySelector('.svc-panel').inert=true;
    c.querySelector('.svc-top').addEventListener('click',()=>{
      const open=!c.classList.contains('open');
      if(open){cards.forEach(o=>{if(o!==c&&o.classList.contains('open'))setCard(o,false)});setTimeout(()=>setCard(c,true,true),0)}
      else setCard(c,false);
    });
    c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')});
  });

  /* ---------- Processo: etapas acendem ao entrar na tela ---------- */
  const stepsEl=d.getElementById('steps'), steps=[...d.querySelectorAll('.step')];
  const sio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;stepsEl.classList.add('play');steps.forEach((s,i)=>setTimeout(()=>s.classList.add('on'),reduce?0:250+i*260));sio.disconnect()}),{threshold:.35});
  sio.observe(stepsEl);

  /* ---------- Rolagem: header, progresso, botões flutuantes ---------- */
  const hdrProg=d.querySelector('.hdr-prog'), footer=d.querySelector('.ftr');
  let avoid=[];
  const collectAvoid=()=>{avoid=[...d.querySelectorAll('main .btn, .svc-more, .proj .links a, .contact-row a, .after a, details.choose summary, .chip')]};
  collectAvoid();
  let ticking=false, progress=0;
  function overlapsFloats(vw,vh){ // a área dos botões flutuantes (canto inferior direito)
    const zx=vw-96, zy=vh-(isMobile()?132:150);
    for(const el of avoid){const r=el.getBoundingClientRect();if(r.width&&r.right>zx&&r.bottom>zy&&r.top<vh)return true}
    return false;
  }
  function onScroll(){
    ticking=false;
    const y=scrollY, vh=innerHeight, vw=root.clientWidth;
    hdr.classList.toggle('scrolled',y>20);
    progress=Math.min(1,y/Math.max(1,(root.scrollHeight-vh)));
    hdrProg.style.setProperty('--p',progress.toFixed(4));totop.style.setProperty('--p',progress.toFixed(4));
    const show=y>vh*.85&&!mm.classList.contains('open')&&footer.getBoundingClientRect().top>vh-40&&!overlapsFloats(vw,vh);
    setFloats(show);
  }
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
  addEventListener('resize',onScroll);
  onScroll();

  /* ---------- Seção ativa (menu + 3D) ---------- */
  let active='inicio';
  const nav=d.querySelector('.nav'), navInd=d.querySelector('.nav-ind');
  const navLinks=d.querySelectorAll('.nav a, .mmenu nav a');
  // Seções que não estão no menu não acendem nenhum item (evita marcar a seção errada)
  const navMap={digital:'',diferenciais:'',processo:''};
  const navKeyOf=s=>s in navMap?navMap[s]:s;
  let navKey=null, navLock='';
  function moveInd(){
    const a=nav.querySelector('a.active');
    if(!a||!nav.offsetParent){navInd.classList.remove('on');return}
    navInd.style.setProperty('--x',a.offsetLeft+'px');navInd.style.setProperty('--w',a.offsetWidth+'px');navInd.classList.add('on');
  }
  function setNav(k){
    if(k===navKey)return;navKey=k;
    navLinks.forEach(a=>{const on=!!k&&a.dataset.link===k;a.classList.toggle('active',on);on?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current')});
    moveInd();
  }
  const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){active=e.target.dataset['3d'];if(!navLock)setNav(navKeyOf(active))}}),{rootMargin:'-48% 0px -48% 0px'});
  d.querySelectorAll('[data-3d]').forEach(s=>so.observe(s));
  setNav('inicio');
  addEventListener('resize',moveInd);
  if(d.fonts&&d.fonts.ready)d.fonts.ready.then(moveInd);

  /* ---------- Navegação interna animada (links mantêm href) ---------- */
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  let anim=0;
  function stopAnim(){if(anim){cancelAnimationFrame(anim);anim=0}root.style.scrollBehavior='';body.classList.remove('navigating');navLock=''}
  ['wheel','touchstart','keydown'].forEach(ev=>addEventListener(ev,()=>{if(anim)stopAnim()},{passive:true}));
  function goTo(el,key,after){
    const off=el.id==='inicio'?0:(parseFloat(getComputedStyle(root).scrollPaddingTop)||80);
    const to=Math.max(0,Math.min(el.getBoundingClientRect().top+scrollY-off,root.scrollHeight-innerHeight));
    const from=scrollY,dist=to-from;
    dispatchEvent(new CustomEvent('vx:nav'));
    const done=()=>{stopAnim();if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','-1');el.focus({preventScroll:true});if(after)after()};
    stopAnim();
    if(reduce||Math.abs(dist)<2){scrollTo(0,to);done();return}
    const dur=Math.min(1150,Math.max(520,Math.abs(dist)*.32)),t0=performance.now();
    if(key!==undefined){navLock=key||'-';setNav(key)}
    root.style.scrollBehavior='auto';body.classList.add('navigating');
    const step=now=>{const t=Math.min(1,(now-t0)/dur);scrollTo(0,from+dist*ease(t));if(t<1)anim=requestAnimationFrame(step);else{anim=0;done();setNav(navKeyOf(active))}};
    anim=requestAnimationFrame(step);
  }
  function navigate(id,push,after){
    const el=d.getElementById(id);if(!el)return false;
    const sec=el.closest('[data-3d]');
    const key=sec?navKeyOf(sec.dataset['3d']):'';
    if(push&&location.hash!=='#'+id){try{history.pushState(null,'','#'+id)}catch(e){}}
    if(mm.classList.contains('open')){setMenu(false);setTimeout(()=>goTo(el,key,after),reduce?0:260)}else goTo(el,key,after);
    return true;
  }
  d.addEventListener('click',e=>{
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const a=e.target.closest&&e.target.closest('a[href^="#"]');
    if(!a||a.classList.contains('js-wa'))return;
    const id=decodeURIComponent(a.getAttribute('href').slice(1));
    if(!id||!d.getElementById(id))return;
    e.preventDefault();
    const card=a.dataset.open;
    if(card)navigate(id,true,()=>{openCard(card,false);const c=d.getElementById(card);if(c)setTimeout(()=>{const r=c.getBoundingClientRect();scrollTo({top:scrollY+r.top-90,behavior:reduce?'auto':'smooth'});c.querySelector('.svc-top').focus({preventScroll:true})},60)});
    else navigate(id,true);
  });
  addEventListener('popstate',()=>{const id=location.hash.slice(1);navigate(id||'inicio',false)});
  if(location.hash.length>1){const el=d.getElementById(decodeURIComponent(location.hash.slice(1)));if(el)addEventListener('load',()=>setTimeout(()=>{scrollTo(0,Math.max(0,el.getBoundingClientRect().top+scrollY-(el.id==='inicio'?0:80)))},50),{once:true})}
  totop.addEventListener('click',()=>{totop.classList.remove('fly');void totop.offsetWidth;totop.classList.add('fly');try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}goTo(d.getElementById('inicio'),'inicio')});

  /* ---------- Resposta visual ao toque/clique ---------- */
  d.addEventListener('pointerdown',e=>{
    const b=e.target.closest('.btn,.totop,.fab-wa');
    if(!b||reduce)return;
    const r=b.getBoundingClientRect(),rp=d.createElement('span');
    rp.className='rp';rp.style.left=(e.clientX-r.left)+'px';rp.style.top=(e.clientY-r.top)+'px';
    b.appendChild(rp);setTimeout(()=>rp.remove(),700);
  },{passive:true});

  /* =========================================================
     VORTEX 3D — assinatura visual (Three.js carregado sob demanda)
     Robustez mobile: sem contexto WebGL de teste, atributos compactados
     (compatível com o mínimo do WebGL1), checagem de shader, perda de
     contexto, CDN reserva, qualidade adaptativa e diagnóstico (?debug3d).
     ========================================================= */
  const canvas=d.getElementById('vortex');
  const coarse=matchMedia('(pointer: coarse)').matches;
  const DEBUG=/[?&]debug3d\b/.test(location.search);
  const diag={etapa:'início',reduzMovimento:reduce,dpr:devicePixelRatio,tela:innerWidth+'x'+innerHeight};
  let diagBox=null;
  function note(k,v){diag[k]=v;if(!DEBUG)return;if(!diagBox){diagBox=d.createElement('pre');diagBox.style.cssText='position:fixed;left:8px;bottom:8px;z-index:99;max-width:calc(100vw - 16px);white-space:pre-wrap;font:11px/1.4 monospace;background:rgba(0,0,0,.8);color:#19E3D6;padding:8px 10px;border-radius:8px;pointer-events:none';body.appendChild(diagBox)}diagBox.textContent=Object.entries(diag).map(([a,b])=>a+': '+b).join('\n')}
  function fail(motivo){note('etapa','fallback');note('motivo',motivo);root.classList.add('no-webgl');canvas.classList.remove('ready')}
  note('etapa','aguardando');
  if(!('WebGLRenderingContext' in window)){fail('navegador sem WebGL');return}

  // 1º cópia local (js/vendor), depois CDNs como reserva — mesma versão (r128) em todas
  const SOURCES=['js/vendor/three.min.js','https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js'];
  function loadThree(i){
    i=i||0;
    if(window.THREE){initVortex();return}
    if(i>=SOURCES.length){fail('Three.js não carregou');return}
    note('etapa','carregando Three.js ('+(i+1)+')');
    const s=d.createElement('script');let done=false;
    const timer=setTimeout(()=>{if(!done){done=true;s.remove();loadThree(i+1)}},9000);
    s.src=SOURCES[i];s.async=true;if(/^https?:/.test(SOURCES[i]))s.crossOrigin='anonymous'; // crossorigin só para CDN (em file:// quebraria a cópia local)
    s.onload=()=>{if(done)return;done=true;clearTimeout(timer);window.THREE?initVortex():loadThree(i+1)};
    s.onerror=()=>{if(done)return;done=true;clearTimeout(timer);loadThree(i+1)};
    d.head.appendChild(s);
  }
  function schedule(){if(window.requestIdleCallback)requestIdleCallback(()=>loadThree(0),{timeout:1500});else setTimeout(()=>loadThree(0),300)}
  if(d.readyState==='complete')schedule();else addEventListener('load',schedule,{once:true});

  function initVortex(){
    const T=window.THREE;
    note('etapa','criando WebGL');
    const mobile=isMobile()||coarse;
    const lowPower=mobile||(navigator.hardwareConcurrency||4)<=4||(navigator.deviceMemory||8)<=4;
    let renderer;
    try{renderer=new T.WebGLRenderer({canvas,antialias:false,alpha:true,powerPreference:mobile?'default':'high-performance'})}
    catch(e){fail('contexto WebGL recusado');return}
    const gl=renderer.getContext();
    note('webgl',renderer.capabilities.isWebGL2?'WebGL 2':'WebGL 1');
    note('maxAtributos',gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
    try{const ext=gl.getExtension('WEBGL_debug_renderer_info');if(ext)note('gpu',gl.getParameter(ext.UNMASKED_RENDERER_WEBGL))}catch(e){}

    let DPR=Math.min(devicePixelRatio||1,mobile?1.5:(lowPower?1.5:2));
    renderer.setPixelRatio(DPR);
    const scene=new T.Scene();
    const camera=new T.PerspectiveCamera(40,1,.1,100);camera.position.z=7;
    const group=new T.Group();scene.add(group);

    const C={indigo:new T.Color('#3626FA'),iris:new T.Color('#7462F5'),cyan:new T.Color('#19E3D6'),soft:new T.Color('#5B55C9')};
    const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
    const deg=a=>a*Math.PI/180;
    // 3 atributos no total (position, aData, aColor): position = (ângulo, raio, z); aData = (tipo, semente, tamanho, alfa); aColor = (r, g, b, velocidade)
    const pos=[],dat=[],col=[];
    function push(a,r,z,t,c,s,al,sp){pos.push(a,r,z);dat.push(t,Math.random(),s,al);col.push(c.r,c.g,c.b,sp)}
    const k=mobile?.36:(lowPower?.6:1);
    // Ordem = prioridade: se o aparelho sofrer, o corte começa pelo fim (anéis de fundo, depois fluxo)
    // e os arcos do símbolo Vortyx (núcleo, ponto, anel médio e externo) sempre permanecem.
    function arc(n,R,from,to,c,th,sp){for(let i=0;i<n*k;i++){const a=deg(from+(to-from)*Math.random());push(a,R+gauss()*th,gauss()*th*1.4,0,c,1+Math.random()*1.4,.55+Math.random()*.45,sp)}}
    arc(1900,.6,-95,165,C.cyan,.035,.1);
    for(let i=0;i<700*k;i++){const a=Math.random()*Math.PI*2;push(a,Math.abs(gauss())*.13,gauss()*.05,0,C.cyan,1.2+Math.random(),.9,.2)}
    arc(3200,1.14,12,297,C.iris,.04,-.07);
    arc(4200,1.62,120,420,C.indigo,.045,.05);
    const logoCount=pos.length/3;
    // Fluxo em espiral
    for(let i=0;i<5200*k;i++){push(Math.random()*Math.PI*2,0,gauss()*.18,1,C.iris,.6+Math.random()*1.1,.45+Math.random()*.4,.5+Math.random()*.9)}
    // Anéis finos de fundo (eco das ondas do logo)
    [2.3,3.0,3.8].forEach((R,j)=>{for(let i=0;i<900*k;i++){const a=Math.random()*Math.PI*2;push(a,R+gauss()*.01,gauss()*.02,0,C.soft,.7,.16-j*.03,.012*(j%2?-1:1))}});
    const total=pos.length/3;note('partículas',total);

    const g=new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    g.setAttribute('aData',new T.Float32BufferAttribute(dat,4));
    g.setAttribute('aColor',new T.Float32BufferAttribute(col,4));

    const uniforms={uTime:{value:0},uInt:{value:1},uBoost:{value:0},uOpacity:{value:1},uPR:{value:DPR},uSize:{value:mobile?28:(lowPower?25:22)},
      uCyan:{value:C.cyan},uIris:{value:C.iris},uIndigo:{value:C.indigo}};
    const mat=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,depthTest:false,blending:T.AdditiveBlending,
      vertexShader:`
        attribute vec4 aData;attribute vec4 aColor;
        uniform float uTime;uniform float uInt;uniform float uBoost;uniform float uPR;uniform float uSize;
        uniform vec3 uCyan;uniform vec3 uIris;uniform vec3 uIndigo;
        varying vec3 vCol;varying float vA;
        void main(){
          float aAngle=position.x;float aRadius=position.y;float aType=aData.x;float aSeed=aData.y;float aSize=aData.z;float aSpeed=aColor.w;
          float t=uTime;vec3 p=vec3(0.,0.,position.z);float a;float r;vec3 c=aColor.rgb;float al=aData.w;
          if(aType<.5){
            a=aAngle+t*aSpeed*(.6+uBoost*.8);
            r=aRadius+sin(aAngle*5.+t*.7+aSeed*6.283)*.035*uInt+sin(a*2.-t*.4)*.03*uInt;
            p.z+=sin(aAngle*3.+t*.5)*.08*uInt;
          }else{
            float life=fract(aSeed+t*.028*aSpeed*(1.+uBoost*1.5));
            r=mix(3.1,.18,pow(max(life,.0001),.85));
            a=aAngle+t*aSpeed*.22+(3.1-r)*1.35;
            c=mix(uCyan,mix(uIris,uIndigo,smoothstep(1.6,3.1,r)),smoothstep(.3,1.5,r));
            al*=smoothstep(0.,.18,life)*(1.-smoothstep(.85,1.,life))*(.35+.65*uInt);
            p.z*=r*.35;p.z+=sin(a*2.+t*.6)*.12;
          }
          p.x=cos(a)*r;p.y=sin(a)*r;
          vec4 mv=modelViewMatrix*vec4(p,1.);
          gl_Position=projectionMatrix*mv;
          gl_PointSize=max(1.,uSize*aSize*uPR/max(-mv.z,.1));
          vCol=c;vA=al;
        }`,
      fragmentShader:`
        uniform float uOpacity;varying vec3 vCol;varying float vA;
        void main(){vec2 q=gl_PointCoord-.5;float d=length(q);if(d>.5)discard;float s=smoothstep(.5,0.,d);s*=s;gl_FragColor=vec4(vCol*s*vA*uOpacity,1.);}`
    });
    const pts=new T.Points(g,mat);
    pts.frustumCulled=false; // a posição real é calculada no shader; o culling automático pode esconder o objeto
    group.add(pts);

    // Compila já e confere se o shader foi aceito pela GPU (senão, fallback em vez de canvas vazio)
    note('etapa','compilando shader');
    try{renderer.compile(scene,camera)}catch(e){fail('erro ao compilar shader');return}
    const bad=(renderer.info.programs||[]).some(pr=>pr.diagnostics&&pr.diagnostics.runnable===false);
    if(bad||gl.isContextLost()){fail(bad?'shader recusado pela GPU':'contexto perdido');return}

    // Estados por seção: xf = posição relativa à largura visível (-1 esquerda, 1 direita)
    const S={
      inicio:     {xf:.6,  y:0,   s:1,   rx:.22, ry:-.18,i:1,   o:1},
      digital:    {xf:1.05,y:-.3, s:.85, rx:.8,  ry:-.4, i:.55, o:.3},
      servicos:   {xf:1.08,y:1.1, s:.75, rx:1.1, ry:-.35,i:.45, o:.26},
      diferenciais:{xf:-1.06,y:-.6,s:.8, rx:.5,  ry:.5,  i:.5,  o:.3},
      projetos:   {xf:1.08, y:1.0,s:.75, rx:1.2, ry:-.4, i:.4,  o:.26},
      processo:   {xf:1.05, y:-.5,s:.85, rx:.85, ry:-.25,i:.5,  o:.32},
      sobre:      {xf:-.95, y:0,  s:.95, rx:.55, ry:.45, i:.45, o:.45},
      contato:    {xf:0,    y:0,  s:1.25,rx:.12, ry:0,   i:1.15,o:.55}
    };
    const cur={x:0,y:0,s:.6,rx:1.4,ry:0,i:0,o:0};
    const mouse={x:0,y:0,tx:0,ty:0};
    if(matchMedia('(pointer:fine)').matches){addEventListener('pointermove',e=>{mouse.tx=e.clientX/innerWidth-.5;mouse.ty=e.clientY/innerHeight-.5},{passive:true})}
    let boost=0,boostT=0;
    d.querySelectorAll('.btn-primary').forEach(b=>{b.addEventListener('pointerenter',()=>boostT=1);b.addEventListener('pointerleave',()=>boostT=0)});
    let navT=0;addEventListener('vx:nav',()=>{if(reduce)return;boostT=1;clearTimeout(navT);navT=setTimeout(()=>boostT=0,650)}); // pulso discreto ao navegar

    // Tamanho a partir do próprio canvas (altura estável: não muda quando a barra do navegador mobile aparece/some)
    let time=0,raf=0,lost=false,last=performance.now();
    let halfW=1,lastW=0,lastH=0,rq=0,heroFree=.4;
    function resize(){
      rq=0;
      const w=Math.max(1,canvas.clientWidth||innerWidth),h=Math.max(1,canvas.clientHeight||innerHeight);
      if(w===lastW&&Math.abs(h-lastH)<2)return;
      lastW=w;lastH=h;
      renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
      halfW=Math.tan(deg(20))*camera.position.z*camera.aspect;
      const hw=d.querySelector('.hero .wrap');if(hw)heroFree=Math.min(.5,Math.max(0,(hw.getBoundingClientRect().top+scrollY-56)/h));
      note('canvas',w+'x'+h+' @'+DPR);
      if(reduce)draw(0);
    }
    const queue=()=>{if(!rq)rq=requestAnimationFrame(resize)};
    if(window.ResizeObserver)new ResizeObserver(queue).observe(canvas);
    addEventListener('resize',queue);addEventListener('orientationchange',()=>setTimeout(queue,250));
    resize();

    function target(){
      const st=S[active]||S.inicio, m=isMobile();
      if(m){ // mobile: atrás do conteúdo, mais discreto; no topo fica acima do título sem cobrir o texto
        const top=active==='inicio', fin=active==='contato';
        // no topo: encaixa o vórtice no espaço livre acima do texto (telas baixas, ex.: 320×640)
        const halfH=Math.tan(deg(20))*camera.position.z, free=Math.max(.18,heroFree)*2*halfH;
        const hy=halfH-free/2+.12, hs=Math.min(.6,free/2/1.75);
        return {x:top?0:Math.sign(st.xf)*halfW*.95,y:top?hy:(fin?0:.95),s:top?hs:(fin?.85:.62),rx:st.rx,ry:st.ry*.5,i:st.i*.8,o:top?.9:(fin?.42:.2)};
      }
      return {x:st.xf*halfW,y:st.y,s:st.s,rx:st.rx,ry:st.ry,i:st.i,o:st.o};
    }

    function draw(dt){
      if(!reduce)time+=dt;
      const tg=target(), l=reduce?1:1-Math.pow(.0016,dt);
      for(const key in tg)cur[key]+=(tg[key]-cur[key])*l;
      mouse.x+=(mouse.tx-mouse.x)*.04;mouse.y+=(mouse.ty-mouse.y)*.04;
      boost+=(boostT-boost)*.05;
      group.position.set(cur.x+mouse.x*.25,cur.y-mouse.y*.2+(reduce?0:Math.sin(time*.3)*.05),0);
      group.scale.setScalar(cur.s*(1+boost*.04));
      group.rotation.x=cur.rx+mouse.y*.35;
      group.rotation.y=cur.ry+mouse.x*.45;
      group.rotation.z=(reduce?0:time*.02)+progress*1.2;
      uniforms.uTime.value=time;uniforms.uInt.value=cur.i;uniforms.uBoost.value=boost;uniforms.uOpacity.value=cur.o;
      renderer.render(scene,camera);
    }

    // Qualidade adaptativa: se o aparelho não sustentar a animação, reduz resolução e depois partículas
    let tier=0,acc=0,frames=0,warm=true,slow=0;
    const tiers=[{dpr:Math.min(DPR,1),n:total},{dpr:1,n:Math.round(logoCount+(total-logoCount)*.45)},{dpr:.85,n:logoCount}];
    function adapt(dt){
      acc+=dt;frames++;
      if(acc<2)return;
      const fps=frames/acc;acc=0;frames=0;note('fps',fps.toFixed(0));
      if(warm){warm=false;return} // ignora a primeira janela (pico do carregamento)
      slow=fps<40?slow+1:0;
      if(slow>=2&&tier<tiers.length){slow=0;
        const q=tiers[tier++];
        DPR=q.dpr;renderer.setPixelRatio(DPR);uniforms.uPR.value=DPR;lastW=0;resize();
        g.setDrawRange(0,q.n);note('qualidade','nível '+tier);
      }
    }

    function frame(now){
      raf=0;
      if(d.hidden||lost)return;
      const real=(now-last)/1000,dt=Math.min(real,.05);last=now;
      draw(dt);if(real<1)adapt(real); // mede com o tempo real (ignora pausas longas, ex.: aba em segundo plano)
      raf=requestAnimationFrame(frame);
    }
    function start(){
      if(lost)return;
      if(reduce){draw(0);return}
      last=performance.now();
      if(!raf)raf=requestAnimationFrame(frame);
    }
    d.addEventListener('visibilitychange',()=>{if(!d.hidden)start()});

    // Perda de contexto (comum no mobile ao trocar de app ou com pouca memória)
    let lostTimer=0;
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;if(raf){cancelAnimationFrame(raf);raf=0}canvas.classList.remove('ready');note('etapa','contexto perdido');
      lostTimer=setTimeout(()=>{if(lost)fail('contexto não restaurado')},4000)},false);
    canvas.addEventListener('webglcontextrestored',()=>{clearTimeout(lostTimer);lost=false;root.classList.remove('no-webgl');canvas.classList.add('ready');note('etapa','ativo (restaurado)');lastW=0;resize();start()},false);

    if(reduce){let lastSec='';setInterval(()=>{if(active!==lastSec){lastSec=active;draw(0)}},300)}
    draw(0);
    canvas.classList.add('ready');
    note('etapa','ativo');
    start();
  }
})();
