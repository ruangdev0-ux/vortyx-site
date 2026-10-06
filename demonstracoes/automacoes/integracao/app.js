/* Integração site → API → sistema → banco/painel (tudo simulado no navegador) */
(function(){
  const d=document,K=window.VxKit;
  const PRODS=[{id:'cam',n:'Camiseta básica',ic:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M8 4 3 7l2 4 2-1v10h10V10l2 1 2-4-5-3c0 2-2 3-4 3S8 6 8 4Z"/></svg>',p:59.9,st:40},{id:'can',n:'Caneca térmica',ic:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M5 8h11v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4ZM16 10h2a2 2 0 0 1 0 4h-2M8 3v2M11 3v2"/></svg>',p:79.9,st:25},{id:'bol',n:'Bolsa de lona',ic:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M5 9h14l-1 11H6ZM9 9V7a3 3 0 0 1 6 0v2"/></svg>',p:119.9,st:15}];
  const flow=VxFlow(d.getElementById('flow'),[{id:'site',label:'Site',icon:'globe'},{id:'api',label:'API',icon:'api'},{id:'sis',label:'Sistema',icon:'gear'},{id:'db',label:'Banco',icon:'db'},{id:'dash',label:'Dashboard',icon:'chart'}]);
  const blank=()=>({orders:[],stock:Object.fromEntries(PRODS.map(p=>[p.id,p.st]))});
  let data=K.store('integracao',blank()),sel='cam',qty=1;
  const code=d.getElementById('code'),http=d.getElementById('http'),state=d.getElementById('flowState'),log=d.getElementById('log'),btn=d.getElementById('order');
  const prodsEl=d.getElementById('prods');
  function renderProds(){prodsEl.innerHTML=PRODS.map(p=>`<button type="button" class="in-prod" role="radio" aria-checked="${p.id===sel}" data-id="${p.id}"><span class="ic" aria-hidden="true">${p.ic}</span><span><b>${p.n}</b><small>estoque: ${data.stock[p.id]}</small></span><span class="pr">${K.brl(p.p)}</span></button>`).join('')}
  prodsEl.addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(!b)return;sel=b.dataset.id;qty=Math.min(qty,Math.max(1,data.stock[sel]));d.getElementById('qty').textContent=qty;renderProds()});
  d.getElementById('minus').addEventListener('click',()=>{qty=Math.max(1,qty-1);d.getElementById('qty').textContent=qty});
  d.getElementById('plus').addEventListener('click',()=>{qty=Math.min(9,qty+1);d.getElementById('qty').textContent=qty});

  const hl=o=>JSON.stringify(o,null,2).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])).replace(/"([^"]+)":/g,'<span class="k">"$1"</span>:').replace(/: "([^"]*)"/g,': <span class="s">"$1"</span>').replace(/: (-?[\d.]+)/g,': <span class="n">$1</span>');
  const ts=()=>new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  function addLog(h){if(!log.querySelector('[data-t]'))log.innerHTML='';const l=d.createElement('div');l.dataset.t=1;l.innerHTML=`<span class="muted">${ts()}</span> ${h}`;log.prepend(l)}

  btn.addEventListener('click',async()=>{
    if(flow.running)return;const p=PRODS.find(x=>x.id===sel);
    if(data.stock[sel]<qty){K.toast('Estoque insuficiente para essa quantidade (simulação).');return}
    btn.disabled=true;state.textContent='processando…';
    const id='PED-'+String(1001+data.orders.length).padStart(4,'0'),body={pedido:id,produto:p.id,quantidade:qty,total:+(p.p*qty).toFixed(2),canal:'site'};
    const flaky=d.getElementById('flaky').checked;
    code.innerHTML=`<span class="m">POST</span> /api/v1/pedidos\n<span class="c">// enviado pelo site</span>\n${hl(body)}`;http.textContent='enviando…';
    if(flaky){
      await flow.run([{id:'site',text:id},{id:'api',text:'503 · tentando de novo',error:true}]);
      code.innerHTML+=`\n\n<span class="e">← 503 Service Unavailable</span>\n<span class="c">// a integração espera 2 s e reenvia</span>`;http.textContent='503 · nova tentativa';
      addLog(`<b>${id}</b> API respondeu 503 · nova tentativa agendada`);
      await new Promise(r=>setTimeout(r,K.reduce?0:900));
    }
    const left=data.stock[sel]-qty;
    await flow.run([{id:'site',text:id},{id:'api',text:'201 created'},{id:'sis',text:`estoque ${data.stock[sel]} → ${left}`},{id:'db',text:'registro gravado'},{id:'dash',text:'painel atualizado'}]);
    code.innerHTML+=`\n\n<span class="s">← 201 Created</span>${flaky?' <span class="c">(2ª tentativa)</span>':''}\n${hl({ok:true,pedido:id,estoque_restante:left,registrado_em:new Date().toISOString().slice(0,19)})}`;
    http.textContent='201 created';
    data.stock[sel]=left;data.orders.push({id,p:sel,q:qty,t:body.total});K.save('integracao',data);
    addLog(`<b>${id}</b> ${qty}× ${p.n} · estoque ${p.id} = ${left} · painel sincronizado`);
    renderProds();renderDash(true);state.textContent='concluído';btn.disabled=false;
    if(left<1){qty=1;d.getElementById('qty').textContent=1}
  });

  function renderDash(bump){
    const ko=d.getElementById('kOrders'),kr=d.getElementById('kRev');
    ko.textContent=data.orders.length;kr.textContent=K.brl(data.orders.reduce((a,o)=>a+o.t,0));
    if(bump)[ko,kr].forEach(e=>{e.classList.remove('bump');void e.offsetWidth;e.classList.add('bump')});
    d.getElementById('stock').innerHTML=PRODS.map(p=>{const s=data.stock[p.id];return `<div class="${s/p.st<.3?'low':''}"><span>${p.n}</span><span class="mono">${s}/${p.st}</span><i style="--w:${s/p.st*100}%"></i></div>`}).join('');
    d.getElementById('sync').textContent=data.orders.length?'sincronizado '+ts():'—';
    VxCharts.bars(d.getElementById('chart'),{labels:PRODS.map(p=>p.n.split(' ')[0]),values:PRODS.map(p=>data.orders.filter(o=>o.p===p.id).reduce((a,o)=>a+o.q,0)),color:'#7462F5',format:v=>v%1?'':String(v)});
  }
  d.getElementById('reset').addEventListener('click',()=>{data=blank();K.drop('integracao');flow.reset();renderProds();renderDash();code.innerHTML='<span class="c">// a requisição aparece aqui</span>';http.textContent='—';state.textContent='aguardando pedido';log.innerHTML='<span>— nenhum evento ainda —</span>'});
  renderProds();renderDash();
})();
