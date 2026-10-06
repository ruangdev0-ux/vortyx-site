/* IA de triagem — SIMULAÇÃO: Recebida → Analisada → Classificada → Direcionada */
(function(){
  const d=document,K=window.VxKit,I=window.VxIA;
  const TOPIC={
    com:{n:'Comercial',c:'#19E3D6',terms:{'orcament':3,'preco':3,'valor':2,'comprar':3,'proposta':3,'plano':2,'contratar':3,'desconto':2}},
    sup:{n:'Suporte',c:'#A78BFA',terms:{'erro':3,'nao funciona':4,'nao consigo':3,'travou':3,'fora do ar':4,'senha':3,'acesso':2,'login':3,'parou':3,'lento':2}},
    fin:{n:'Financeiro',c:'#FFC24B',terms:{'boleto':4,'nota fiscal':4,'pagamento':3,'cobranc':3,'cobrad':3,'fatura':3,'reembolso':4,'estorno':4,'pix':2}}
  };
  const URG={terms:{'urgente':4,'agora':2,'hoje':2,'parado':3,'parada':3,'fora do ar':4,'nao funciona':2,'cobrad':1,'duas vezes':3,'imediat':3,'cancelar':2,'reclamacao':3,'prejuizo':3}};
  const QUEUES={com:{n:'Comercial',sla:'4 h'},sup:{n:'Suporte técnico',sla:'1 h'},fin:{n:'Financeiro',sla:'8 h'},out:{n:'Atendimento geral',sla:'24 h'},prio:{n:'Prioridade (plantão)',sla:'15 min'}};
  const POOL=['URGENTE: o site está fora do ar desde cedo','Quero uma proposta para 3 lojas','Fui cobrado duas vezes no cartão','Não consigo trocar minha senha','Vocês emitem nota fiscal para CNPJ?','Qual o horário de funcionamento?','O sistema está lento hoje, mas funcionando','Quero cancelar, o pedido não chegou e tive prejuízo','Tem desconto no plano anual?','Preciso da segunda via do boleto','O login parou de funcionar agora','Vocês atendem aos sábados?'];
  const topicRules=Object.fromEntries(Object.entries(TOPIC).map(([k,v])=>[k,{terms:v.terms}]));
  let items=[],counts={com:0,sup:0,fin:0,out:0,prio:0},seq=0,running=Promise.resolve(),pool=[...POOL].sort(()=>Math.random()-.5);
  const cols=[...d.querySelectorAll('.tg-col')],lists=cols.map(c=>c.querySelector('.tg-list')),log=d.getElementById('log');
  const wait=ms=>new Promise(r=>setTimeout(r,K.reduce?0:ms));
  const hhmm=()=>new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});

  function card(it,stage){
    const t=TOPIC[it.topic]||{n:'Outros',c:'#9AA1BD'};
    const meta=stage>=2?`<div class="meta"><span class="tag" style="color:${t.c};background:${t.c}1a">${t.n}</span><span class="tag ${it.urg==='alta'?'bad':it.urg==='média'?'warn':''}">urgência ${it.urg}</span></div>`:'';
    const dest=stage>=3?`<div class="meta"><span class="tag iris">→ ${QUEUES[it.q].n}</span><span class="tag">resposta em até ${QUEUES[it.q].sla}</span></div>`:'';
    const body=stage===1?`<p>${it.marked}</p><div class="meta"><span class="ia-think" aria-label="analisando"><i></i><i></i><i></i></span></div>`:`<p>${stage>=1?it.marked:I.esc(it.t)}</p>`;
    return `<article class="tg-card${it.urg==='alta'&&stage>=2?' urg':''}" data-id="${it.id}"><small>#${String(it.id).padStart(3,'0')} · ${it.at}</small>${body}${meta}${dest}</article>`}
  function place(it,stage){d.querySelectorAll(`.tg-card[data-id="${it.id}"]`).forEach(e=>e.remove());lists[stage].insertAdjacentHTML('afterbegin',card(it,stage));
    cols[stage].classList.add('pulse');setTimeout(()=>cols[stage].classList.remove('pulse'),400);
    // mantém a coluna enxuta
    [...lists[stage].children].slice(6).forEach(e=>e.remove())}

  function analyse(t){const tp=I.score(t,topicRules),u=I.score(t,{u:URG});const us=u.ranking[0].score;
    const topic=tp.empty||tp.ranking[0].score<2?'out':tp.best;const urg=us>=4?'alta':us>=2?'média':'baixa';
    const q=urg==='alta'?'prio':topic;
    const hits=[...(tp.empty?[]:tp.ranking.flatMap(r=>r.hits)),...u.ranking[0].hits];
    return {topic,urg,q,conf:tp.conf||.5,tHits:tp.empty?[]:tp.ranking[0].hits,uHits:u.ranking[0].hits,marked:I.mark(t,[...(tp.empty?[]:tp.ranking[0].hits.map(h=>[h,'c-'+tp.best])),...u.ranking[0].hits.map(h=>[h,'c-urg'])])}}

  async function process(t){const it=Object.assign({id:++seq,t,at:hhmm()},analyse(t));items.push(it);
    place(it,0);await wait(650);place(it,1);await wait(900);place(it,2);await wait(750);place(it,3);
    counts[it.q]++;renderQ();
    const tn=(TOPIC[it.topic]||{n:'Outros'}).n;
    const why=`${it.tHits.length?`assunto <b>${tn}</b> por “${I.words(it.t,it.tHits).join('”, “')}”`:'nenhum termo de assunto → <b>Outros</b>'}; ${it.uHits.length?`urgência <b>${it.urg}</b> por “${I.words(it.t,it.uHits).join('”, “')}”`:`urgência <b>${it.urg}</b> (sem sinais de pressa)`}${it.q==='prio'?' → vai para o <b>plantão</b>':''}.`;
    if(log.firstElementChild&&!log.firstElementChild.dataset.t)log.innerHTML='';
    const l=d.createElement('div');l.dataset.t=1;l.innerHTML=`<span class="muted">#${String(it.id).padStart(3,'0')}</span> ${why}`;log.prepend(l)}
  const enqueue=t=>{running=running.then(()=>process(t));return running};
  function renderQ(){const mx=Math.max(1,...Object.values(counts));const C={com:'#19E3D6',sup:'#A78BFA',fin:'#FFC24B',out:'#9AA1BD',prio:'#FF5C7A'};
    d.getElementById('queues').innerHTML=Object.keys(QUEUES).map(k=>`<div class="tg-q"><span>${QUEUES[k].n}</span><b>${counts[k]}</b><i style="--w:${counts[k]/mx*100}%;--c:${C[k]}"></i><small>prazo de resposta: ${QUEUES[k].sla} (exemplo)</small></div>`).join('')}

  const feed=d.getElementById('feed');
  feed.addEventListener('click',async()=>{feed.disabled=true;for(let i=0;i<4;i++){if(!pool.length)pool=[...POOL].sort(()=>Math.random()-.5);enqueue(pool.pop());await wait(300)}await running;feed.disabled=false});
  d.getElementById('own').addEventListener('submit',e=>{e.preventDefault();const i=d.getElementById('ownTxt');const v=i.value.trim();if(!v){K.toast('Escreva uma mensagem.');i.focus();return}enqueue(v);i.value=''});
  d.getElementById('clear').addEventListener('click',async()=>{await running;items=[];counts={com:0,sup:0,fin:0,out:0,prio:0};lists.forEach(l=>l.innerHTML='');renderQ();log.innerHTML='<span>— as explicações aparecem aqui —</span>'});
  renderQ();
})();
