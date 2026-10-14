/* IA de classificação — SIMULAÇÃO por listas de termos com pesos (não há modelo de IA real).
   Entrada → Análise → Classificação → Ação. A certeza é uma regra simples sobre os pontos,
   não uma probabilidade de modelo. */
(function(){
  const d=document,K=window.VxKit,I=window.VxIA;
  const CL={
    com:{n:'Comercial',c:'#19E3D6',m:'c-com',terms:{'orcament':3,'preco':3,'valor':2,'quanto custa':3,'comprar':3,'proposta':3,'plano':2,'desconto':2,'contratar':3,'cotacao':3,'interesse':2,'catalogo':2,'pacote':2,'promocao':2,
      'cancel':2,'renovar':2}},
    sup:{n:'Suporte',c:'#A78BFA',m:'c-sup',terms:{'erro':3,'problema':3,'nao funciona':4,'nao consigo':3,'travou':3,'travando':3,'bug':3,'senha':3,'acesso':2,'login':3,'instalar':2,'configurar':2,'ajuda':1,'parou':2,'lento':2,'quebrou':3,'defeito':3,
      'nao entra':4,'nao consigo entrar':4,'entrar':2,'tentando':2,'acessar':2,'nao carrega':4,'carregando':2,'nao abre':3,'caiu':2,'fora do ar':4,'nao chegou':2}},
    fin:{n:'Financeiro',c:'#FFC24B',m:'c-fin',terms:{'boleto':4,'nota fiscal':4,'pagamento':3,'pagar':2,'cobranc':3,'cobrad':3,'fatura':3,'reembolso':4,'estorno':4,'pix':2,'segunda via':4,'vencimento':3,'venceu':3,'parcela':2,'cartao':2,'recibo':3,
      'paguei':3,'cobraram':3}}
  };
  const OUT={n:'Outros',c:'#9AA1BD'};
  const URG={'urgente':3,'urgencia':3,'socorro':3,'bloquead':3,'fora do ar':3,'agora':2,'parou':2,'parado':2,'imediat':2,'o quanto antes':2,'hoje':1};
  const EX=['Meu boleto venceu, consigo a segunda via?','to tentando entrar e nada','quero cancelar, o app vive travando e já paguei a fatura','Quanto custa o plano anual para 5 usuários?','URGENTE: o sistema parou e ninguém consegue acessar!!','Vocês abrem no feriado?'];
  const BATCH=['Gostaria de uma proposta para minha loja','A nota fiscal de setembro não chegou','Erro ao finalizar o pedido no app','Vocês têm estacionamento?','Tem desconto para pagamento no Pix?','O login parou de funcionar hoje cedo','Preciso do recibo do último pagamento','Qual o endereço da loja do centro?'];

  /* ---------- Análise: mesmos critérios do motor compartilhado (termo inteiro ou início de palavra, até 2 ocorrências) ---------- */
  const N=s=>' '+I.norm(s).replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ')+' ';
  const rx=k=>new RegExp(' '+I.norm(k).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g');
  function hits(text,terms){const t=N(text),out=[];
    for(const [term,w] of Object.entries(terms)){const m=t.match(rx(term));if(m)out.push({term,pts:w*Math.min(2,m.length)})}
    return out}
  const sum=a=>a.reduce((s,h)=>s+h.pts,0);

  /* ---------- Regras de certeza (as mesmas que aparecem na página) ---------- */
  function analyze(text){
    const rank=Object.keys(CL).map(id=>{const h=hits(text,CL[id].terms);return {id,h,s:sum(h)}}).sort((a,b)=>b.s-a.s);
    const [a,b]=rank,s1=a.s,s2=b.s;let lvl,why,cand=[];
    if(s1===0){lvl='Nenhuma';why='nenhum sinal reconhecido'}
    else if(s1===s2){lvl='Ambígua';cand=rank.filter(r=>r.s===s1);why=`empate: ${cand.map(r=>`${CL[r.id].n} ${r.s}`).join(' × ')} pts`}
    else if(s2>=3&&s2*2>=s1){lvl='Ambígua';cand=rank.filter(r=>r.s>=3&&r.s*2>=s1);why=`${cand.map(r=>`${CL[r.id].n} ${r.s}`).join(' × ')} pts: mais de uma categoria com sinais fortes`}
    else if(s1<3){lvl='Baixa';why=`só ${s1} pt${s1>1?'s':''} em ${CL[a.id].n} (mínimo 3)`}
    else if(s1>=6&&s1-s2>=4){lvl='Alta';why=`${s1} pts, ${s1-s2} à frente da 2ª categoria`}
    else {lvl='Média';why=`${s1} pts, ${s1-s2} à frente da 2ª categoria`}
    const auto=lvl==='Alta'||lvl==='Média';
    const cat=lvl==='Nenhuma'?'out':lvl==='Ambígua'?null:a.id;
    const uh=hits(text,URG),bang=(text.match(/!/g)||[]).length>=2;if(bang)uh.push({term:'!!',pts:2});
    const up=sum(uh),urg=up>=3?'Alta':'Normal';
    let act;
    if(auto)act=`Etiqueta ${CL[cat].n} → fila ${CL[cat].n}${urg==='Alta'?' · prioridade alta':''}`;
    else if(lvl==='Ambígua')act=`${cand.map(r=>CL[r.id].n).join(' + ')} → revisão humana`;
    else if(lvl==='Baixa')act=`Sinal fraco de ${CL[a.id].n} → revisão humana`;
    else act='Sem categoria → revisão humana';
    return {rank,lvl,why,cand,auto,cat,top:a.id,uh,urg,act,short:auto?`Fila ${CL[cat].n}`:'Revisão'};
  }
  const name=r=>r.cat?(CL[r.cat]||OUT).n:'Indefinida';
  const color=r=>r.cat?(CL[r.cat]||OUT).c:'#F472B6';

  const txt=d.getElementById('txt'),out=d.getElementById('out'),live=d.getElementById('live'),panel=d.getElementById('outPanel'),levels=d.getElementById('levels');
  d.getElementById('ex').innerHTML=EX.map(e=>`<button type="button" class="chip">${I.esc(e)}</button>`).join('');
  d.getElementById('ex').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;txt.value=b.textContent;count();run(true)});
  const count=()=>d.getElementById('chars').textContent=`${txt.value.length}/300`;
  function toResult(){const r=panel.getBoundingClientRect(),top=parseFloat(getComputedStyle(panel).scrollMarginTop)||0;
    if(r.top<top||r.top>innerHeight*.45)panel.scrollIntoView({behavior:K.reduce?'auto':'smooth',block:'start'})}
  let timer=0,busy=false;
  async function run(jump){const v=txt.value.trim();
    if(!v){out.innerHTML='<p class="cl-wait">Escreva ou escolha uma mensagem.</p>';return}
    if(busy)return;busy=true;if(jump)toResult();
    out.innerHTML='<p class="cl-wait"><span class="ia-think" aria-hidden="true"><i></i><i></i><i></i></span> analisando (simulação)…</p>';
    await new Promise(r=>setTimeout(r,K.reduce?0:420));busy=false;
    const r=analyze(v),hs=r.rank.flatMap(x=>x.h.map(h=>({...h,id:x.id}))),tot=r.rank.reduce((a,x)=>a+x.s,0)||1;
    const marks=hs.map(h=>[h.term,CL[h.id].m]).concat(r.uh.filter(h=>h.term!=='!!').map(h=>[h.term,'c-urg']));
    const word=t=>I.words(v,[t])[0]||t;
    const sig=hs.length?hs.map(h=>`<span class="ic-sig"><i style="background:${CL[h.id].c}"></i>${I.esc(word(h.term))} <small><span class="ic-cn">${CL[h.id].n} </span><span class="vx-sr">${CL[h.id].n} </span>+${h.pts}</small></span>`).join(''):'<span class="muted">nenhum</span>';
    const usig=r.uh.length?r.uh.map(h=>`<span class="ic-sig u"><i></i>${I.esc(h.term==='!!'?'!!':word(h.term))} <small>+${h.pts}</small></span>`).join(''):'';
    const cats=new Set(hs.map(h=>h.id)).size;
    const steps=[['Entrada','mensagem recebida'],['Análise',hs.length?`${hs.length} ${hs.length>1?'sinais':'sinal'} · ${cats} ${cats>1?'categorias':'categoria'}`:'nenhum sinal'],
      ['Classificação',`${r.lvl==='Ambígua'?r.cand.map(c=>CL[c.id].n).join(' + '):name(r)} · ${r.lvl.toLowerCase()}`],['Ação',r.auto?`fila ${CL[r.cat].n}`:'revisão humana']];
    out.innerHTML=`<div class="cl-res">
      <ol class="ic-steps">${steps.map((s,i)=>`<li${i===3?` class="${r.auto?'go':'rev'}"`:''}><small>${s[0]}</small>${s[1]}</li>`).join('')}</ol>
      <div class="cl-quote">${I.mark(v,marks)}</div>
      <dl class="ic-out">
        <dt>Categoria</dt><dd><span class="cl-badge" style="background:${color(r)}22;color:${color(r)}"><i style="background:${color(r)}"></i>${name(r)}</span>${r.lvl==='Baixa'?`<span class="muted ic-note">provável ${CL[r.top].n}, sem sinais suficientes</span>`:''}</dd>
        <dt>Sinais</dt><dd class="ic-sigs">${sig}</dd>
        <dt>Certeza</dt><dd><b class="ic-lvl l-${I.norm(r.lvl)}">${r.lvl}</b> <span class="muted">· ${I.esc(r.why)}</span></dd>
        <dt>Urgência</dt><dd><b class="ic-urg${r.urg==='Alta'?' hi':''}">${r.urg}</b> ${usig?`<span class="ic-sigs">${usig}</span>`:'<span class="muted">· nenhum sinal de urgência</span>'}</dd>
        <dt>Ação</dt><dd class="ic-act ${r.auto?'go':'rev'}">${r.auto?`<b>Automática</b> · ${I.esc(r.act)}`:`<b>${I.esc(r.act)}</b>`}</dd>
      </dl>
      <div class="ic-pts"><p class="ic-h">Pontos por categoria</p><div class="ia-conf">${Object.keys(CL).map(id=>{const x=r.rank.find(y=>y.id===id),w=Math.round(x.s/tot*100);
        return `<div class="row${(r.cat===id||r.cand.some(c=>c.id===id))?' win':''}"><span>${CL[id].n}</span><span class="bar"><i style="background:${CL[id].c}" data-w="${w}"></i></span><span>${x.s} pts</span></div>`}).join('')}
        <div class="row${r.cat==='out'?' win':''}"><span>Outros</span><span class="ic-o muted">sem sinais → revisão</span><span>—</span></div></div></div>
    </div>`;
    levels.querySelectorAll('li').forEach(li=>li.classList.toggle('on',li.dataset.l===r.lvl));
    requestAnimationFrame(()=>out.querySelectorAll('.bar i').forEach(i=>i.style.width=i.dataset.w+'%'));
  }
  d.getElementById('go').addEventListener('click',()=>run(true));
  txt.addEventListener('input',()=>{count();if(live.checked){clearTimeout(timer);timer=setTimeout(()=>run(false),450)}});
  txt.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();run(true)}});

  /* ---------- Caixa de entrada em lote ---------- */
  const rowsEl=d.getElementById('rows');
  rowsEl.innerHTML=BATCH.map(b=>`<tr><td>${I.esc(b)}</td><td class="muted">—</td><td class="muted d-col">—</td><td class="muted d-col">—</td></tr>`).join('');
  d.getElementById('batch').addEventListener('click',async e=>{const btn=e.currentTarget;btn.disabled=true;
    for(let i=0;i<BATCH.length;i++){const tr=rowsEl.children[i],r=analyze(BATCH[i]),c=tr.children;
      c[1].innerHTML='<span class="ia-think" aria-hidden="true"><i></i><i></i><i></i></span>';await new Promise(x=>setTimeout(x,K.reduce?0:200));
      tr.classList.add('done');[1,2,3].forEach(k=>c[k].classList.remove('muted'));
      c[1].innerHTML=`<span class="cl-pill" style="background:${color(r)}1f;color:${color(r)}"><i style="background:${color(r)}"></i>${name(r)}</span><span class="m-col">${r.auto?CL[r.cat].n:'Revisão'} · ${r.lvl}${r.urg==='Alta'?' · urgente':''}</span>`;
      c[2].innerHTML=`<span class="ic-lvl l-${I.norm(r.lvl)}">${r.lvl}</span>`;
      c[3].innerHTML=`<span class="ic-a ${r.auto?'go':'rev'}">${r.short}</span>${r.urg==='Alta'?'<span class="ic-u">urgente</span>':''}`}
    btn.disabled=false;btn.textContent='Classificar de novo'});
})();
