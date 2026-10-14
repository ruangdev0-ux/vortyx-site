/* Brasa & Miolo — cardápio, combos, montagem do burger e pedido simulado (dados fictícios) */
(function(){
  const d=document,K=window.VxKit,reduce=K.reduce;
  const IMG='img/';

  /* ---------- burger em camadas (recortes de uma única foto) ----------
     Coordenadas em pixels da foto original (3000 px de largura).
     s = ponto onde a camada se apoia; t = ponto onde a próxima camada se apoia. */
  const L={
    base:   {f:'base',   x:972, y:3228,w:1204,h:784,t:3330,n:'Blend 150 g na brasa'},
    patty2: {f:'patty',  x:1123,y:3233,w:709, h:468,s:3440,t:3330,n:'Blend extra'},
    ketchup:{f:'ketchup',x:1055,y:2978,w:904, h:272,s:3110,t:3095,n:'Ketchup'},
    cheese: {f:'cheese', x:953, y:2724,w:1028,h:417,s:2790,t:2765,n:'Queijo'},
    tomato: {f:'tomato', x:1024,y:2331,w:755, h:418,s:2560,t:2515,n:'Tomate'},
    mayo:   {f:'mayo',   x:1023,y:2103,w:773, h:269,s:2240,t:2200,n:'Maionese da casa'},
    salad:  {f:'salad',  x:936, y:1456,w:1071,h:610,s:1960,t:1770,n:'Alface e cebola roxa'},
    bunTop: {f:'bunTop', x:1050,y:1155,w:935, h:326,s:1440,n:'Pão brioche com gergelim'}
  };
  const ORDER=['base','patty2','ketchup','cheese','tomato','mayo','salad','bunTop'];
  const ALL={patty2:1,ketchup:1,cheese:1,tomato:1,mayo:1,salad:1};
  const EXPLODE=.8; // quanto do espaçamento da foto o modo "camadas" preserva
  // deslocamento vertical de cada camada para o burger montado
  function shifts(on){let C=null;const out={};ORDER.forEach(k=>{if(k!=='base'&&k!=='bunTop'&&!on[k])return;const l=L[k];const sh=k==='base'?0:C-l.s;out[k]=sh;if(l.t)C=l.t+sh});return out}
  function bbox(sh,e){let top=1e9,bot=-1e9;for(const k in sh){const l=L[k],dy=sh[k]*(1-e);top=Math.min(top,l.y+dy);bot=Math.max(bot,l.y+l.h+dy)}return{top,bot}}

  function buildStage(el,{states,labels,pad=40}){
    // moldura = união de todos os estados que este palco mostra
    let top=1e9,bot=-1e9;states.forEach(([on,e])=>{const b=bbox(shifts(on),e);top=Math.min(top,b.top);bot=Math.max(bot,b.bot)});
    const FR={x:880,w:1380,y:top-pad,h:bot-top+pad*2};
    const stack=d.createElement('div');stack.className='bm-stack';stack.style.aspectRatio=`${FR.w}/${FR.h}`;el.style.setProperty('--ar',(FR.w/FR.h).toFixed(4));el.appendChild(stack);
    const shadow=d.createElement('span');shadow.className='bm-shadow';stack.appendChild(shadow);
    const nodes={},tags={};
    ORDER.forEach((k,i)=>{
      const l=L[k];const img=d.createElement('img');
      img.src=IMG+'camada-'+l.f+'.webp';img.alt='';img.decoding='async';img.className='lay lay-'+k;
      img.style.cssText=`left:${((l.x-FR.x)/FR.w*100).toFixed(3)}%;top:${((l.y-FR.y)/FR.h*100).toFixed(3)}%;width:${(l.w/FR.w*100).toFixed(3)}%;--i:${i};z-index:${i+1}`;
      stack.appendChild(img);nodes[k]=img;
      if(labels&&k!=='patty2'){const t=d.createElement('span');t.className='bm-lbl'+(k==='base'?' low':'');t.innerHTML=`<i></i>${l.n}`;t.style.cssText=`top:${(((k==='base'?3420:l.y+l.h*.5)-FR.y)/FR.h*100).toFixed(3)}%;--i:${i}`;stack.appendChild(t);tags[k]=t}
    });
    const ph=(L.base.y+L.base.h-FR.y)/FR.h*100;shadow.style.top=ph.toFixed(2)+'%';
    let on={};
    const set=(o)=>{on=o||on;const H=stack.clientHeight,u=H/FR.h,sh=shifts(on);
      ORDER.forEach(k=>{const n=nodes[k],vis=k in sh,v=vis?sh[k]:(k==='patty2'?-110:0);
        n.style.setProperty('--ya',(v*u).toFixed(1)+'px');n.style.setProperty('--ye',(v*(1-EXPLODE)*u).toFixed(1)+'px');n.classList.toggle('off',!vis);
        if(tags[k]){tags[k].style.setProperty('--ye',(v*(1-EXPLODE)*u).toFixed(1)+'px')}});
      // centraliza o burger montado e o aberto dentro da moldura
      const mid=FR.y+FR.h/2,a=bbox(sh,0),x=bbox(sh,EXPLODE);
      stack.style.setProperty('--cya',((mid-(a.top+a.bot)/2)*u).toFixed(1)+'px');
      stack.style.setProperty('--cye',((mid-(x.top+x.bot)/2)*u).toFixed(1)+'px');
      stack.style.setProperty('--sa',Math.min(1.22,(FR.h-pad*2)/(a.bot-a.top)*.82).toFixed(3));
    };
    return {el,stack,nodes,set};
  }

  /* ---------- dados ---------- */
  const CATS=[{id:'burgers',n:'Burgers'},{id:'acomp',n:'Acompanhamentos',img:'fritas',alt:'Batatas fritas em uma cestinha de metal sobre papel e tábua de madeira.'},{id:'bebidas',n:'Bebidas',img:'refri',alt:'Copo de refrigerante com gelo, gelado e com gotas por fora.'},{id:'sobremesas',n:'Sobremesas',img:'shake',alt:'Milkshake de chocolate com chantilly e calda escorrendo pelo pote.'}];
  const ITEMS=[
    {id:'b1',c:'burgers',n:'Brasa Bacon',d:'Blend de 150 g, queijo derretido, bacon crocante e pão brioche com gergelim preto.',p:38,img:'bacon',feat:1,tag:'Assinatura da casa',alt:'Hambúrguer com bacon crocante e queijo derretido em pão brioche com gergelim preto.'},
    {id:'b2',c:'burgers',n:'Smash Duplo',d:'Dois smash prensados na chapa, cheddar duplo, picles e molho da casa no brioche selado.',p:36,img:'duplo',feat:1,alt:'Hambúrguer com dois smash, cheddar derretido, picles e molho alaranjado.'},
    {id:'b3',c:'burgers',n:'Miolo Clássico',d:'Dois blends, cheddar, picles, cebola, maionese da casa e ketchup.',p:42,img:'classico',feat:1,alt:'Hambúrguer alto com dois blends, cheddar, picles, cebola e maionese.'},
    {id:'b4',c:'burgers',n:'Verde Brasa',d:'Burger de grão-de-bico, rúcula, tomate e queijo branco.',p:34,tag:'Vegetariano'},
    {id:'b5',c:'burgers',n:'Kids',d:'Blend de 90 g com queijo, em pão menor.',p:24},
    {id:'a1',c:'acomp',n:'Fritas da casa',d:'Batata cortada na hora, com sal de ervas.',p:16,img:'fritas'},
    {id:'a2',c:'acomp',n:'Onion rings',d:'Anéis de cebola empanados, com molho barbecue.',p:19},
    {id:'a3',c:'acomp',n:'Fritas cheddar e bacon',d:'Fritas com cheddar cremoso, bacon e cebolinha. Para dividir.',p:26},
    {id:'d1',c:'bebidas',n:'Refrigerante',d:'Copo de 400 ml com gelo, vários sabores.',p:7,img:'refri'},
    {id:'d2',c:'bebidas',n:'Limonada da casa',d:'Limão, hortelã e gengibre. 400 ml.',p:12},
    {id:'d3',c:'bebidas',n:'Chá gelado',d:'Pêssego ou limão. 400 ml.',p:10},
    {id:'s1',c:'sobremesas',n:'Milkshake de chocolate',d:'Chantilly, calda de chocolate e cacau. 400 ml.',p:21,img:'shake'},
    {id:'s2',c:'sobremesas',n:'Brownie com sorvete',d:'Brownie quente, sorvete de creme e calda de chocolate.',p:18}
  ];
  const COMBOS=[
    {id:'c1',n:'Combo Smash',d:'Smash Duplo, fritas da casa e refrigerante.',p:49,sep:59,img:'combo'},
    {id:'c2',n:'Combo Brasa',d:'Brasa Bacon, fritas da casa e limonada da casa.',p:54,sep:66,img:'combo'},
    {id:'c3',n:'Combo Clássico',d:'Miolo Clássico, fritas da casa e chá gelado.',p:58,sep:68,img:'combo'}
  ];
  const OPTS=[
    {k:'cheese',n:'Queijo',p:4,on:true},{k:'patty2',n:'Blend extra 150 g',p:12},{k:'tomato',n:'Tomate',p:3,on:true},
    {k:'salad',n:'Alface e cebola roxa',p:3,on:true},{k:'mayo',n:'Maionese da casa',p:2,on:true},{k:'ketchup',n:'Ketchup',p:2,on:true}
  ];
  const BASE=29;
  const HOURS=[[18,23],null,[18,23],[18,23],[18,23],[18,24],[12,24]];
  const DAYS=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const DELIVERY=7.9;
  const hh=h=>h===24?'0h':h+'h';
  /* ---------- carrinho (persistido no navegador) ---------- */
  let cart=K.store('brasa-cart-v3',{}),custom=K.store('brasa-custom-v3',{}),mode='entrega';
  const find=id=>ITEMS.find(i=>i.id===id)||COMBOS.find(i=>i.id===id)||custom[id];
  Object.keys(cart).forEach(id=>{if(!find(id))delete cart[id]});
  const thumb=it=>it.img?`<img src="${IMG}t-${it.img}.webp" alt="" width="64" height="48" loading="lazy">`:`<span class="bm-ph-x" aria-hidden="true">${it.n.charAt(0)}</span>`;

  /* ---------- status / horários ---------- */
  const now=new Date(),w=now.getDay(),h=HOURS[w],hr=now.getHours()+now.getMinutes()/60,open=!!h&&hr>=h[0]&&hr<h[1];
  const st=d.getElementById('status');st.textContent=open?'Aberto agora':'Fechado agora';st.classList.toggle('off',!open);
  d.getElementById('statusTxt').textContent=h?`hoje das ${hh(h[0])} às ${hh(h[1])}`:'abrimos amanhã às 18h';
  d.getElementById('hoursToday').textContent=h?`${hh(h[0])}–${hh(h[1])}`:'Fechado';
  d.getElementById('hours').innerHTML=[1,2,3,4,5,6,0].map(i=>`<li class="${i===w?'today':''}"><span>${DAYS[i]}</span><span>${HOURS[i]?`${hh(HOURS[i][0])} às ${hh(HOURS[i][1])}`:'Fechado'}</span></li>`).join('');

  /* ---------- herói: camadas se aproximam até formar o burger ---------- */
  const heroOn={ketchup:1,cheese:1,tomato:1,mayo:1,salad:1};
  const hero=buildStage(d.getElementById('heroStage'),{states:[[heroOn,0],[heroOn,EXPLODE]],labels:true,pad:30});
  const hs=hero.stack,tgl=d.getElementById('heroToggle');
  hs.classList.add('hero');
  function heroMode(open){hs.classList.toggle('exp',open);hs.classList.toggle('asm',!open);hs.style.setProperty('--e',open?1:0);
    tgl.setAttribute('aria-pressed',open);tgl.querySelector('span').textContent=open?'Montar o burger':'Ver as camadas'}
  hero.set(heroOn);
  if(reduce){heroMode(false);hs.classList.add('in')}
  else{
    // abre já separado, as camadas surgem e depois se encaixam
    heroMode(true);
    const imgs=[...hs.querySelectorAll('img')];
    Promise.all(imgs.map(i=>i.decode?i.decode().catch(()=>{}):0)).then(()=>{
      requestAnimationFrame(()=>{hs.classList.add('in');setTimeout(()=>{if(!touched)heroMode(false)},2300)})});
  }
  let touched=false;
  tgl.addEventListener('click',()=>{touched=true;hs.classList.add('in');heroMode(!hs.classList.contains('exp'))});
  // profundidade: camadas se deslocam levemente com o ponteiro (só em telas com mouse)
  if(!reduce&&matchMedia('(hover:hover) and (pointer:fine)').matches){
    const sec=d.querySelector('.bm-hero');let raf=0,px=0,py=0;
    sec.addEventListener('pointermove',e=>{const r=sec.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5;if(!raf)raf=requestAnimationFrame(()=>{raf=0;hs.style.setProperty('--px',px.toFixed(3));hs.style.setProperty('--py',py.toFixed(3))})});
    sec.addEventListener('pointerleave',()=>{hs.style.setProperty('--px',0);hs.style.setProperty('--py',0)});
  }

  /* ---------- monte o seu ---------- */
  const build=buildStage(d.getElementById('buildStage'),{states:[[ALL,0]],pad:150});
  build.stack.classList.add('build','in');build.stack.style.setProperty('--e',0);
  const bo=d.getElementById('buildOpts');let sel={};OPTS.forEach(o=>sel[o.k]=!!o.on);
  bo.insertAdjacentHTML('beforeend',OPTS.map(o=>`<label class="bm-opt"><input type="checkbox" value="${o.k}" ${o.on?'checked':''}><span class="box" aria-hidden="true"></span><span class="nm">${o.n}</span><span class="pr">+ ${K.brl(o.p)}</span></label>`).join(''));
  const buildPrice=()=>BASE+OPTS.reduce((a,o)=>a+(sel[o.k]?o.p:0),0);
  function syncBuild(){build.set(sel);d.getElementById('buildPrice').textContent=K.brl(buildPrice())}
  bo.addEventListener('change',e=>{sel[e.target.value]=e.target.checked;syncBuild()});
  d.getElementById('buildAdd').addEventListener('click',e=>{
    const chosen=OPTS.filter(o=>sel[o.k]);const id='m'+OPTS.map(o=>sel[o.k]?1:0).join('');
    custom[id]={id,n:'Burger montado',d:'Pão brioche, alface e blend 150 g'+(chosen.length?', '+chosen.map(o=>o.n.toLowerCase()).join(', '):''),p:buildPrice(),img:'monte'};
    K.save('brasa-custom-v3',custom);change(id,1);confirmBtn(e.currentTarget,'Adicionado ao pedido');
  });
  let rw=0;new ResizeObserver(()=>{const w=innerWidth;if(w===rw&&hs.clientHeight)return;rw=w;hero.set();build.set(sel)}).observe(d.body);
  syncBuild();

  /* ---------- destaques (fotos) ---------- */
  d.getElementById('featGrid').innerHTML=ITEMS.filter(i=>i.feat).map((it,i)=>`<article class="bm-fcard" data-reveal style="--d:${i}">
    <div class="ph"><img src="${IMG}${it.img}.webp" alt="${it.alt}" width="800" height="800" loading="lazy" decoding="async">${it.tag?`<span class="bm-tag">${it.tag}</span>`:''}</div>
    <div class="in"><h3>${it.n}</h3><p>${it.d}</p><div class="row"><span class="price">${K.brl(it.p)}</span><span data-ctl="${it.id}"></span></div></div></article>`).join('');

  /* ---------- combos ---------- */
  d.getElementById('combosList').innerHTML=COMBOS.map((c,i)=>`<li class="bm-combo" data-reveal style="--d:${i}">
    <div class="tx"><h3>${c.n}</h3><p>${c.d}</p><span class="price"><b>${K.brl(c.p)}</b><s><span class="vx-sr">Preço dos itens separados: </span>${K.brl(c.sep)}</s></span></div>
    <span data-ctl="${c.id}"></span></li>`).join('');

  /* ---------- cardápio completo ---------- */
  d.getElementById('menu').innerHTML=CATS.map(c=>`<section class="bm-mcat bm-mcat-${c.id}" aria-labelledby="mc-${c.id}" data-reveal>
    ${c.img?`<div class="ph"><img src="${IMG}${c.img}.webp" alt="${c.alt}" width="900" height="675" loading="lazy" decoding="async"></div>`:''}
    <h3 id="mc-${c.id}">${c.n}</h3>
    <ul>${ITEMS.filter(i=>i.c===c.id).map(it=>`<li class="bm-mi"><div class="tx"><b>${it.n}</b>${it.tag?`<span class="bm-tag">${it.tag}</span>`:''}<p>${it.d}</p></div><span class="price">${K.brl(it.p)}</span><span data-ctl="${it.id}"></span></li>`).join('')}</ul></section>`).join('');

  function control(it){const q=cart[it.id]||0;return q?`<span class="qty" role="group" aria-label="Quantidade de ${it.n}"><button type="button" data-dec="${it.id}" aria-label="Remover um ${it.n}">−</button><span aria-live="polite">${q}</span><button type="button" data-inc="${it.id}" aria-label="Adicionar mais um ${it.n}">+</button></span>`:`<button class="add" type="button" data-inc="${it.id}" aria-label="Adicionar ${it.n}"><span aria-hidden="true">+</span><em> Adicionar</em></button>`}

  /* ---------- pedido ---------- */
  const cartEl=d.getElementById('cart'),shade=d.getElementById('shade'),body=d.getElementById('cartBody'),foot=d.getElementById('cartFoot'),count=d.getElementById('count'),bar=d.getElementById('float');
  const qty=()=>Object.values(cart).reduce((a,b)=>a+b,0);
  const subtotal=()=>Object.entries(cart).reduce((a,[id,q])=>a+(find(id)?find(id).p*q:0),0);
  function change(id,delta){
    cart[id]=Math.max(0,(cart[id]||0)+delta);if(!cart[id])delete cart[id];K.save('brasa-cart-v3',cart);sync();
    if(delta>0){count.classList.remove('bump');void count.offsetWidth;count.classList.add('bump');K.toast(`<b>${find(id).n}</b> no seu pedido.`,1800)}
  }
  function confirmBtn(b,txt){if(!b)return;const old=b.innerHTML;b.classList.add('ok');b.innerHTML=`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 8.5 3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>${txt}`;setTimeout(()=>{b.classList.remove('ok');b.innerHTML=old},1400)}
  function sync(){
    const q=qty(),sub=subtotal(),tot=sub+(mode==='entrega'&&q?DELIVERY:0);
    count.textContent=q;d.getElementById('floatQty').textContent=`${q} ${q===1?'item':'itens'}`;d.getElementById('floatTotal').textContent=K.brl(tot);
    bar.hidden=!q||cartEl.classList.contains('open');d.body.classList.toggle('has-bar',!bar.hidden);
    d.querySelectorAll('[data-ctl]').forEach(s=>{const it=find(s.dataset.ctl);s.innerHTML=it?control(it):''});
    if(!q){body.innerHTML='<div class="bm-empty"><img src="img/t-fritas.webp" alt="" width="160" height="120" loading="lazy"><b>Seu pedido está vazio.</b><span>Escolha algo no cardápio, nos combos ou monte o seu burger.</span></div>';foot.innerHTML='';return}
    body.innerHTML=Object.entries(cart).map(([id,n])=>{const it=find(id);return `<div class="bm-line">${thumb(it)}<div class="tx"><b>${it.n}</b><span class="sub">${it.d&&id.startsWith('m')?it.d:K.brl(it.p)+' cada'}</span></div><span class="qty" role="group" aria-label="Quantidade de ${it.n}"><button type="button" data-dec="${id}" aria-label="Remover um ${it.n}">−</button><span>${n}</span><button type="button" data-inc="${id}" aria-label="Adicionar mais um ${it.n}">+</button></span></div>`}).join('');
    foot.innerHTML=`<div class="bm-mode" role="group" aria-label="Forma de recebimento"><button type="button" data-mode="entrega" aria-pressed="${mode==='entrega'}">Entrega</button><button type="button" data-mode="retirada" aria-pressed="${mode==='retirada'}">Retirada</button></div>
      <div class="bm-tot"><div><span>Subtotal</span><span>${K.brl(sub)}</span></div><div><span>${mode==='entrega'?'Entrega':'Retirada'}</span><span>${mode==='entrega'?K.brl(DELIVERY):'Grátis'}</span></div><div class="t"><span>Total</span><span>${K.brl(tot)}</span></div></div>
      <button class="bm-btn bm-btn-full" type="button" id="finish">Finalizar pedido (simulação)</button><p class="bm-note">Nenhum pedido é enviado. Esta é uma demonstração.</p>`;
  }
  d.addEventListener('click',e=>{
    const inc=e.target.closest('[data-inc]'),dec=e.target.closest('[data-dec]'),m=e.target.closest('[data-mode]');
    if(inc){change(inc.dataset.inc,1)}else if(dec)change(dec.dataset.dec,-1);else if(m){mode=m.dataset.mode;sync()}
    else if(e.target.closest('#finish')){const code='#'+String(1000+Math.floor(Math.random()*8999));
      body.innerHTML=`<div class="bm-done"><span class="bm-note">Pedido simulado</span><span class="code">${code}</span><b>Pedido recebido!</b><p class="bm-note">${mode==='entrega'?'Tempo estimado de entrega: 35–50 min.':'Retire no balcão em 15–20 min.'}<br>Em um site real, a loja receberia o pedido e você acompanharia o status por WhatsApp.</p></div>`;
      foot.innerHTML='<button class="bm-btn bm-btn-o bm-btn-full" type="button" id="newOrder">Fazer outro pedido</button>';cart={};K.save('brasa-cart-v3',cart);count.textContent='0';d.querySelectorAll('[data-ctl]').forEach(s=>{const it=find(s.dataset.ctl);s.innerHTML=it?control(it):''});d.getElementById('newOrder').focus()}
    else if(e.target.closest('#newOrder')){sync();closeCart()}
  });
  let lastF=null;
  function openCart(){lastF=d.activeElement;cartEl.classList.add('open');cartEl.removeAttribute('inert');cartEl.setAttribute('aria-hidden','false');shade.hidden=false;bar.hidden=true;d.body.classList.remove('has-bar');d.body.style.overflow='hidden';setTimeout(()=>d.getElementById('cartClose').focus(),50)}
  function closeCart(){cartEl.classList.remove('open');cartEl.setAttribute('inert','');cartEl.setAttribute('aria-hidden','true');shade.hidden=true;d.body.style.overflow='';sync();if(lastF&&lastF.isConnected)lastF.focus()}
  [d.getElementById('cartBtn'),bar].forEach(b=>b.addEventListener('click',openCart));
  d.getElementById('cartClose').addEventListener('click',closeCart);shade.addEventListener('click',closeCart);
  addEventListener('keydown',e=>{if(e.key==='Escape'&&cartEl.classList.contains('open'))closeCart()});

  /* ---------- cabeçalho ---------- */
  const hdr=d.getElementById('hdr');const onS=()=>hdr.classList.toggle('scrolled',scrollY>10);addEventListener('scroll',onS,{passive:true});onS();
  sync();
})();
