/* =========================================================
   Vortyx · Kit das demonstrações
   - Barra "Demonstração Vortyx" com voltar + "Quero algo assim"
   - WhatsApp usando o número oficial de js/config.js (CONFIG)
   - Utilidades: toast, reveal, formulários simulados, storage,
     carregamento sob demanda do Three.js (com fallback)
   Uso em cada demo:
     <body data-root="../../../" data-demo="site para barbearia">
     <script src="../../../js/config.js"></script>
     <script src="../../../demos-kit/kit.js"></script>
   ========================================================= */
(function(){
  const d=document, html=d.documentElement;
  html.classList.remove('no-js');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce)html.classList.add('vx-reduce');

  const cfg=(typeof CONFIG!=='undefined'&&CONFIG)||{};
  const NUMBER=String(cfg.whatsappNumber||'').replace(/\D/g,'');

  function wa(msg){
    const text=encodeURIComponent(msg||cfg.whatsappMessage||'Olá! Vim pelo site da Vortyx.');
    return NUMBER?`https://wa.me/${NUMBER}?text=${text}`:`https://wa.me/?text=${text}`;
  }

  /* ---------- Storage seguro (localStorage pode falhar) ---------- */
  const NS='vxdemo:';
  function store(key,def){try{const v=localStorage.getItem(NS+key);return v?JSON.parse(v):def}catch(e){return def}}
  function save(key,val){try{localStorage.setItem(NS+key,JSON.stringify(val))}catch(e){}}
  function drop(key){try{localStorage.removeItem(NS+key)}catch(e){}}

  /* ---------- Toast ---------- */
  let toastEl=null,toastT=0;
  function toast(msg,ms){
    if(!toastEl){toastEl=d.createElement('div');toastEl.className='vx-toast';toastEl.setAttribute('role','status');toastEl.setAttribute('aria-live','polite');d.body.appendChild(toastEl)}
    toastEl.innerHTML=msg;toastEl.classList.add('on');clearTimeout(toastT);
    toastT=setTimeout(()=>toastEl.classList.remove('on'),ms||3200);
  }

  /* ---------- Reveal ---------- */
  function reveal(scope){
    const els=(scope||d).querySelectorAll('[data-reveal]:not(.in)');
    if(reduce||!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return}
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -6% 0px',threshold:.06});
    els.forEach(e=>io.observe(e));
    // rede de segurança: rolagem rápida, âncoras ou tecla End não deixam conteúdo já passado invisível
    let pend=[...els],raf=0;
    const sweep=()=>{raf=0;const lim=innerHeight*.98;pend=pend.filter(e=>{if(e.classList.contains('in'))return false;if(e.getBoundingClientRect().top<lim){e.classList.add('in');io.unobserve(e);return false}return true});if(!pend.length)removeEventListener('scroll',onScroll)};
    const onScroll=()=>{if(!raf)raf=requestAnimationFrame(sweep)};
    addEventListener('scroll',onScroll,{passive:true});
  }

  /* ---------- Formulários simulados ---------- */
  function forms(scope){
    (scope||d).querySelectorAll('form[data-demo-form]').forEach(f=>{
      if(f.dataset.bound)return;f.dataset.bound='1';
      f.addEventListener('submit',e=>{
        e.preventDefault();
        if(!f.checkValidity()){f.reportValidity();return}
        const ev=new CustomEvent('vx:submit',{cancelable:true,detail:Object.fromEntries(new FormData(f))});
        if(f.dispatchEvent(ev))toast(f.dataset.demoForm||'<b>Simulação:</b> nenhum dado foi enviado. Esta é uma demonstração.');
      });
    });
  }

  /* ---------- Three.js sob demanda ---------- */
  let threeP=null;
  function webgl(){try{const c=d.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl')||c.getContext('experimental-webgl')))}catch(e){return false}}
  function three(){
    if(reduce||!webgl()){html.classList.add('no-3d');return Promise.resolve(null)}
    if(window.THREE)return Promise.resolve(window.THREE);
    if(!threeP)threeP=new Promise(res=>{
      const s=d.createElement('script');s.src=ROOT+'js/vendor/three.min.js';s.async=true;
      s.onload=()=>res(window.THREE||null);s.onerror=()=>{html.classList.add('no-3d');res(null)};
      d.head.appendChild(s);
    });
    return threeP;
  }
  /* Loop de render que pausa fora da tela e com a aba oculta.
     Qualidade adaptativa: se a média ficar abaixo de ~38 fps, chama opts.onSlow(nível)
     (nível 1: a página reduz a resolução; nível 2: o loop passa a desenhar a ~30 fps). */
  function loop(canvas,fn,opts){
    opts=opts||{};
    let vis=true,raf=0,last=performance.now(),acc=0,n=0,level=0,skip=0,frame=0,lastDraw=performance.now();
    const tick=t=>{raf=0;if(!vis||d.hidden)return;raf=requestAnimationFrame(tick);
      const raw=(t-last)/1000;last=t;if(raw<1){acc+=raw;n++}
      if(acc>=1.2&&n>=8){const avg=acc/n;acc=0;n=0;if(avg>1/38&&level<2){level++;if(opts.onSlow)opts.onSlow(level);if(level===2)skip=1}}
      if(skip&&(++frame%(skip+1)))return;
      const dt=Math.min(.05,(t-lastDraw)/1000);lastDraw=t;fn(dt,t/1000)};
    const go=()=>{if(!raf){last=lastDraw=performance.now();raf=requestAnimationFrame(tick)}};
    if('IntersectionObserver' in window)new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis)go()}).observe(canvas);
    d.addEventListener('visibilitychange',()=>{if(!d.hidden)go()});
    go();
  }

  /* Animações CSS infinitas pausam fora da tela (economiza bateria em celulares) */
  function pauseOffscreen(){
    if(reduce||!('IntersectionObserver' in window))return;
    const els=[...d.querySelectorAll('body *')].filter(e=>{const s=getComputedStyle(e);return s.animationName!=='none'&&s.animationIterationCount==='infinite'&&!e.closest('.vx-kit')});
    if(!els.length)return;
    const io=new IntersectionObserver(es=>es.forEach(x=>{x.target.style.animationPlayState=x.isIntersecting?'':'paused'}),{rootMargin:'80px'});
    els.forEach(e=>io.observe(e));
  }

  /* ---------- Formatação ---------- */
  const brl=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const num=n=>Number(n||0).toLocaleString('pt-BR');
  function rng(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return((s>>>0)%100000)/100000}}

  /* ---------- Barra da Vortyx ---------- */
  const body=d.body;
  const ROOT=body.dataset.root||'../../../';
  const NAME=body.dataset.demo||'projeto';
  const MSG=body.dataset.msg||`Olá! Vi a demonstração de ${NAME} da Vortyx e gostaria de conversar sobre algo parecido para o meu negócio.`;
  const WA_ICON='<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.86 9.86 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z"/></svg>';
  if(body.dataset.kit!=='off'){
    const bar=d.createElement('div');
    bar.className='vx-kit';bar.setAttribute('role','region');bar.setAttribute('aria-label','Demonstração Vortyx');
    bar.innerHTML=`<div class="vx-kit-l">
        <a class="vx-kit-back" href="${ROOT}demonstracoes/#${body.dataset.cat||''}" aria-label="Voltar para demonstrações"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="t">Voltar para demonstrações</span></a>
        <span class="vx-kit-tag"><span class="vx-kit-dot" aria-hidden="true"></span><img src="${ROOT}images/vortyx-simbolo.webp" alt="" width="20" height="17"><b>Demonstração Vortyx</b><span>· Projeto demonstrativo</span></span>
      </div>
      <div class="vx-kit-r"><a class="vx-kit-cta" href="${wa(MSG)}" target="_blank" rel="noopener">${WA_ICON}<span class="t-long">Quero algo assim</span><span class="t-short">Quero assim</span></a></div>`;
    body.insertBefore(bar,body.firstChild);
    body.classList.add('has-kit');
  }

  /* Foco preso no diálogo aberto (aria-modal): Tab e Shift+Tab circulam dentro dele */
  const FOCUSABLE='a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  d.addEventListener('keydown',e=>{
    if(e.key!=='Tab')return;
    const dlg=[...d.querySelectorAll('[aria-modal="true"]')].reverse().find(x=>!x.hidden&&!x.inert&&!x.hasAttribute('inert')&&x.getAttribute('aria-hidden')!=='true'&&x.getClientRects().length);
    if(!dlg)return;
    const f=[...dlg.querySelectorAll(FOCUSABLE)].filter(x=>x.getClientRects().length&&!x.closest('[hidden]'));
    if(!f.length)return;
    const first=f[0],last=f[f.length-1],a=d.activeElement;
    if(!dlg.contains(a)){e.preventDefault();first.focus();return}
    if(e.shiftKey&&a===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&a===last){e.preventDefault();first.focus()}
  });

  window.VxKit={root:ROOT,reduce,wa,msg:MSG,toast,reveal,forms,store,save,drop,three,loop,brl,num,rng};
  const ready=()=>{reveal();forms();d.dispatchEvent(new CustomEvent('vx:ready'));setTimeout(pauseOffscreen,600)};
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',ready);else ready();
})();
