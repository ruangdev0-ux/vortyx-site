/* Ateliê Açúcar & Afeto — vitrine e encomenda (dados fictícios) */
(function(){
  const d=document,K=window.VxKit;
  const PRODUCTS=[
    {n:'Bolo de camadas de morango',c:'bolos',d:'Massa de baunilha, creme de morango e chantilly.',p:'a partir de R$ 129',ill:'layer',type:'bolo'},
    {n:'Bolo de pistache',c:'bolos',d:'Massa amanteigada com creme de pistache.',p:'a partir de R$ 159',ill:'cup',type:'bolo'},
    {n:'Macarons sortidos',c:'doces',d:'Caixa com 12 unidades, sabores da semana.',p:'R$ 72',ill:'mac',type:'doces'},
    {n:'Brigadeiros gourmet',c:'doces',d:'Cento com chocolate belga e confeitos.',p:'R$ 180 o cento',ill:'brig',type:'doces'},
    {n:'Torta de frutas',c:'tortas',d:'Massa sablée, creme de baunilha e frutas frescas.',p:'R$ 98',ill:'tart',type:'torta'},
    {n:'Cupcakes',c:'doces',d:'Caixa com 6, cobertura de cream cheese.',p:'R$ 54',ill:'cup',type:'doces'},
    {n:'Bolo de festa 3 andares',c:'festas',d:'Personalizado para casamentos e aniversários.',p:'sob consulta',ill:'layer',type:'festa'},
    {n:'Mesa de doces',c:'festas',d:'Seleção de doces finos para eventos.',p:'sob consulta',ill:'brig',type:'festa'}
  ];
  const FILTERS=[['todos','Todos'],['bolos','Bolos'],['doces','Doces'],['tortas','Tortas'],['festas','Festas']];
  const TYPES=[{id:'bolo',n:'Bolo',base:0},{id:'torta',n:'Torta',base:0},{id:'doces',n:'Caixa de doces',base:0},{id:'festa',n:'Bolo de festa',base:0}];
  const SIZES={bolo:[['1kg','1 kg','~10 fatias',129],['2kg','2 kg','~20 fatias',219],['3kg','3 kg','~30 fatias',309]],
    torta:[['p','Pequena','~8 fatias',98],['g','Grande','~14 fatias',158]],
    doces:[['12','12 unidades','caixa',72],['25','25 unidades','caixa',140],['50','50 unidades','bandeja',265]],
    festa:[['2a','2 andares','~40 fatias',520],['3a','3 andares','~70 fatias',890]]};

  /* vitrine */
  const filters=d.getElementById('filters'),grid=d.getElementById('grid');let f='todos';
  filters.innerHTML=FILTERS.map(([id,n])=>`<button type="button" data-f="${id}" aria-pressed="${id==='todos'}">${n}</button>`).join('');
  function render(){grid.innerHTML=PRODUCTS.filter(p=>f==='todos'||p.c===f).map((p,i)=>`<article class="aa-card" style="--i:${i}"><div class="aa-pic"><div class="ill ill-${p.ill}"></div></div><h3>${p.n}</h3><p>${p.d}</p><div class="r"><b>${p.p}</b><button type="button" data-type="${p.type}">Encomendar →</button></div></article>`).join('')}
  filters.addEventListener('click',e=>{const b=e.target.closest('[data-f]');if(!b)return;f=b.dataset.f;filters.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));render()});
  render();
  grid.addEventListener('click',e=>{const b=e.target.closest('[data-type]');if(!b)return;setType(b.dataset.type);d.getElementById('encomendar').scrollIntoView({behavior:K.reduce?'auto':'smooth'})});

  /* encomenda */
  const form=d.getElementById('orderForm'),types=d.getElementById('types'),sizes=d.getElementById('sizes');
  types.innerHTML=TYPES.map((t,i)=>`<label><input type="radio" name="tipo" value="${t.id}" ${i===0?'checked':''}>${t.n}</label>`).join('');
  function setType(t){const r=types.querySelector(`input[value="${t}"]`);if(r){r.checked=true;renderSizes();calc()}}
  function renderSizes(){const t=form.tipo.value;sizes.innerHTML=SIZES[t].map((s,i)=>`<label><input type="radio" name="tamanho" value="${s[0]}" ${i===0?'checked':''} required>${s[1]}<small>${s[2]} · ${K.brl(s[3])}</small></label>`).join('')}
  function calc(){const t=form.tipo.value,s=SIZES[t].find(x=>x[0]===(form.tamanho&&form.tamanho.value));if(!s){return}
    const extra=+form.recheio.value||0,tot=s[3]+extra*(t==='doces'?0:1);
    d.getElementById('est').textContent=K.brl(tot);
    d.getElementById('estTxt').textContent=`${TYPES.find(x=>x.id===t).n} · ${s[1]} · ${form.massa.value}${extra&&t!=='doces'?' · recheio especial':''}`}
  form.addEventListener('change',e=>{if(e.target.name==='tipo')renderSizes();calc()});
  renderSizes();calc();
  // data mínima: 2 dias
  const min=new Date();min.setDate(min.getDate()+2);const iso=x=>`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
  form.data.min=iso(min);form.data.value=iso(min);
  const ok=d.getElementById('ok');
  form.addEventListener('vx:submit',e=>{e.preventDefault();const v=e.detail,[y,m,dd]=v.data.split('-');
    d.getElementById('okTxt').textContent=`Obrigada, ${v.nome}! Sua encomenda de ${d.getElementById('estTxt').textContent.toLowerCase()} para ${dd}/${m} foi registrada nesta simulação. Em um site real, a confeitaria confirmaria os detalhes pelo WhatsApp.`;
    form.hidden=true;ok.hidden=false;ok.focus()});
  d.getElementById('again').addEventListener('click',()=>{form.reset();form.data.value=iso(min);renderSizes();calc();ok.hidden=true;form.hidden=false});
})();
