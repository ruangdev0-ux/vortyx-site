/* Brasa & Miolo — cardápio e carrinho (dados fictícios) */
(function(){
  const d=document,K=window.VxKit;
  const CATS=[{id:'burgers',n:'Burgers',th:'burger'},{id:'acomp',n:'Acompanhamentos',th:'side'},{id:'bebidas',n:'Bebidas',th:'drink'},{id:'sobremesas',n:'Sobremesas',th:'dessert'}];
  const ITEMS=[
    {id:'b1',c:'burgers',n:'Smash Clássico',d:'Dois smash de 80 g, queijo prato, cebola na chapa e molho da casa.',p:32,tag:'Mais pedido'},
    {id:'b2',c:'burgers',n:'Brasa Bacon',d:'Blend 150 g, cheddar, bacon crocante e maionese defumada.',p:38},
    {id:'b3',c:'burgers',n:'Miolo Duplo',d:'Dois blends de 120 g, queijo duplo e picles da casa.',p:44},
    {id:'b4',c:'burgers',n:'Verde Brasa',d:'Burger de grão-de-bico, rúcula, tomate assado e molho de ervas.',p:34,tag:'Vegetariano'},
    {id:'b5',c:'burgers',n:'Kids',d:'Burger 90 g com queijo, em pão menor.',p:24},
    {id:'a1',c:'acomp',n:'Fritas da casa',d:'Batata cortada na hora, com sal de ervas.',p:16},
    {id:'a2',c:'acomp',n:'Onion rings',d:'Anéis de cebola empanados, com molho barbecue.',p:19},
    {id:'a3',c:'acomp',n:'Fritas com cheddar e bacon',d:'Porção generosa para dividir.',p:26},
    {id:'d1',c:'bebidas',n:'Refrigerante lata',d:'350 ml, vários sabores.',p:7},
    {id:'d2',c:'bebidas',n:'Limonada da casa',d:'Limão, hortelã e gengibre. 400 ml.',p:12},
    {id:'d3',c:'bebidas',n:'Chá gelado',d:'Pêssego ou limão. 400 ml.',p:10},
    {id:'s1',c:'sobremesas',n:'Brownie quente',d:'Com bola de sorvete de creme.',p:18},
    {id:'s2',c:'sobremesas',n:'Milkshake',d:'Chocolate, morango ou doce de leite. 400 ml.',p:21}
  ];
  const HOURS=[[18,23],null,[18,23],[18,23],[18,23],[18,24],[12,24]];
  const DAYS=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const DELIVERY=7.9;
  let cart=K.store('brasa-cart',{}),mode='entrega';
  const thOf=c=>CATS.find(x=>x.id===c).th;

  /* status / horários */
  const now=new Date(),w=now.getDay(),h=HOURS[w],hr=now.getHours()+now.getMinutes()/60,open=!!h&&hr>=h[0]&&hr<h[1];
  const st=d.getElementById('status');st.textContent=open?'Aberto agora':'Fechado agora';st.classList.toggle('off',!open);
  d.getElementById('statusTxt').textContent=h?`· hoje das ${h[0]}h às ${h[1]===24?'0h':h[1]+'h'}`:'· abrimos amanhã às 18h';
  d.getElementById('hoursToday').textContent=h?`${h[0]}h às ${h[1]===24?'0h':h[1]+'h'}`:'Fechado';
  d.getElementById('hours').innerHTML=[1,2,3,4,5,6,0].map(i=>`<li class="${i===w?'today':''}"><span>${DAYS[i]}</span><span>${HOURS[i]?`${HOURS[i][0]}h às ${HOURS[i][1]===24?'0h':HOURS[i][1]+'h'}`:'Fechado'}</span></li>`).join('');

  /* cardápio */
  const cats=d.getElementById('cats'),grid=d.getElementById('grid');
  cats.innerHTML=CATS.map((c,i)=>`<button role="tab" aria-selected="${i===0}" data-c="${c.id}">${c.n}</button>`).join('');
  let cur='burgers';
  function control(it){const q=cart[it.id]||0;return q?`<span class="qty" aria-label="Quantidade de ${it.n}"><button type="button" data-dec="${it.id}" aria-label="Remover um">−</button><span>${q}</span><button type="button" data-inc="${it.id}" aria-label="Adicionar mais um">+</button></span>`:`<button class="add" type="button" data-inc="${it.id}">+ Adicionar</button>`}
  function renderGrid(){grid.innerHTML=ITEMS.filter(i=>i.c===cur).map((it,i)=>`<article class="bm-item" style="--i:${i}"><div class="th th-${thOf(it.c)}" aria-hidden="true"></div><div>${it.tag?`<span class="bm-tag">${it.tag}</span>`:''}<h3>${it.n}</h3><p>${it.d}</p><div class="row"><span class="price">${K.brl(it.p)}</span><span data-ctl="${it.id}">${control(it)}</span></div></div></article>`).join('')}
  cats.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b)return;cur=b.dataset.c;cats.querySelectorAll('button').forEach(x=>x.setAttribute('aria-selected',x===b));renderGrid()});
  renderGrid();

  /* carrinho */
  const cartEl=d.getElementById('cart'),shade=d.getElementById('shade'),body=d.getElementById('cartBody'),foot=d.getElementById('cartFoot'),count=d.getElementById('count'),flo=d.getElementById('float');
  const qty=()=>Object.values(cart).reduce((a,b)=>a+b,0);
  const subtotal=()=>Object.entries(cart).reduce((a,[id,q])=>a+ITEMS.find(i=>i.id===id).p*q,0);
  function change(id,delta){cart[id]=Math.max(0,(cart[id]||0)+delta);if(!cart[id])delete cart[id];K.save('brasa-cart',cart);sync();if(delta>0){count.classList.remove('bump');void count.offsetWidth;count.classList.add('bump')}}
  function sync(){
    const q=qty(),sub=subtotal(),tot=sub+(mode==='entrega'&&q?DELIVERY:0);
    count.textContent=q;d.getElementById('floatQty').textContent=`${q} ${q===1?'item':'itens'}`;d.getElementById('floatTotal').textContent=K.brl(tot);
    flo.hidden=!q||cartEl.classList.contains('open');
    grid.querySelectorAll('[data-ctl]').forEach(s=>{s.innerHTML=control(ITEMS.find(i=>i.id===s.dataset.ctl))});
    if(!q){body.innerHTML='<div class="bm-empty"><b>Seu pedido está vazio.</b><span>Escolha algo no cardápio para começar.</span></div>';foot.innerHTML='';return}
    body.innerHTML=Object.entries(cart).map(([id,n])=>{const it=ITEMS.find(i=>i.id===id);return `<div class="bm-line"><div><b>${it.n}</b><div class="sub">${K.brl(it.p)} cada</div></div><span class="qty"><button type="button" data-dec="${id}" aria-label="Remover um ${it.n}">−</button><span>${n}</span><button type="button" data-inc="${id}" aria-label="Adicionar mais um ${it.n}">+</button></span></div>`}).join('');
    foot.innerHTML=`<div class="bm-mode" role="group" aria-label="Forma de recebimento"><button type="button" data-mode="entrega" aria-pressed="${mode==='entrega'}">Entrega</button><button type="button" data-mode="retirada" aria-pressed="${mode==='retirada'}">Retirada</button></div>
      <div class="bm-tot"><div><span>Subtotal</span><span>${K.brl(sub)}</span></div><div><span>Entrega (exemplo)</span><span>${mode==='entrega'?K.brl(DELIVERY):'Grátis'}</span></div><div class="t"><span>Total</span><span>${K.brl(tot)}</span></div></div>
      <button class="bm-btn" type="button" id="finish">Finalizar pedido (simulação)</button><p class="bm-note" style="text-align:center">Nenhum pedido é enviado. Demonstração.</p>`;
  }
  d.addEventListener('click',e=>{
    const inc=e.target.closest('[data-inc]'),dec=e.target.closest('[data-dec]'),m=e.target.closest('[data-mode]');
    if(inc)change(inc.dataset.inc,1);else if(dec)change(dec.dataset.dec,-1);else if(m){mode=m.dataset.mode;sync()}
    else if(e.target.id==='finish'){const code='#'+String(1000+Math.floor(Math.random()*8999));
      body.innerHTML=`<div class="bm-done"><span class="bm-note">Pedido simulado</span><span class="code">${code}</span><b>Recebemos seu pedido!</b><p class="bm-note">${mode==='entrega'?'Tempo estimado de entrega: 35–50 min (exemplo).':'Retire em 15–20 min (exemplo).'}<br>Em um site real, você acompanharia o pedido por WhatsApp.</p></div>`;
      foot.innerHTML='<button class="bm-btn bm-btn-o" type="button" id="newOrder">Fazer outro pedido</button>';cart={};K.save('brasa-cart',cart);count.textContent='0'}
    else if(e.target.id==='newOrder'){sync();closeCart()}
  });
  let lastF=null;
  function openCart(){lastF=d.activeElement;cartEl.classList.add('open');cartEl.removeAttribute('inert');cartEl.setAttribute('aria-hidden','false');shade.hidden=false;flo.hidden=true;d.body.style.overflow='hidden';setTimeout(()=>d.getElementById('cartClose').focus(),50)}
  function closeCart(){cartEl.classList.remove('open');cartEl.setAttribute('inert','');cartEl.setAttribute('aria-hidden','true');shade.hidden=true;d.body.style.overflow='';sync();if(lastF)lastF.focus()}
  [d.getElementById('cartBtn'),d.getElementById('heroCart'),flo].forEach(b=>b.addEventListener('click',openCart));
  d.getElementById('cartClose').addEventListener('click',closeCart);shade.addEventListener('click',closeCart);
  addEventListener('keydown',e=>{if(e.key==='Escape'&&cartEl.classList.contains('open'))closeCart()});
  sync();
})();
