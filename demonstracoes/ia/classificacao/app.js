/* IA de classificação — SIMULAÇÃO por regras (não há modelo de IA real) */
(function(){
  const d=document,K=window.VxKit,I=window.VxIA;
  const CL={
    com:{n:'Comercial',c:'#19E3D6',m:'c-com',terms:{'orcament':3,'preco':3,'valor':2,'quanto custa':3,'comprar':3,'proposta':3,'plano':2,'desconto':2,'contratar':3,'cotacao':3,'interesse':2,'catalogo':2,'pacote':2,'promocao':2}},
    sup:{n:'Suporte',c:'#A78BFA',m:'c-sup',terms:{'erro':3,'problema':3,'nao funciona':4,'nao consigo':3,'travou':3,'travando':3,'bug':3,'senha':3,'acesso':2,'login':3,'instalar':2,'configurar':2,'ajuda':1,'parou':2,'lento':2,'quebrou':3,'defeito':3}},
    fin:{n:'Financeiro',c:'#FFC24B',m:'c-fin',terms:{'boleto':4,'nota fiscal':4,'pagamento':3,'pagar':2,'cobranc':3,'cobrad':3,'fatura':3,'reembolso':4,'estorno':4,'pix':2,'segunda via':4,'vencimento':3,'venceu':3,'parcela':2,'cartao':2,'recibo':3}}
  };
  const OUT={n:'Outros',c:'#9AA1BD',m:''};
  const EX=['Quanto custa o plano anual para 5 usuários?','Não consigo acessar com minha senha','Meu boleto venceu, consigo a segunda via?','Vocês abrem no feriado?','Fui cobrado duas vezes no cartão','O sistema travou depois da atualização'];
  const BATCH=['Gostaria de uma proposta para minha loja','A nota fiscal de setembro não chegou','Erro ao finalizar o pedido no app','Vocês têm estacionamento?','Tem desconto para pagamento no Pix?','O login parou de funcionar hoje cedo','Preciso do recibo do último pagamento','Qual o endereço da loja do centro?'];
  const rules=Object.fromEntries(Object.entries(CL).map(([k,v])=>[k,{terms:v.terms}]));
  const meta=id=>CL[id]||OUT;
  function classify(text){const r=I.score(text,rules);
    // regra de "Outros": nenhuma palavra relevante ou pontuação muito baixa
    if(r.empty||r.ranking[0].score<2)return {best:'out',conf:r.empty?.62:.5,ranking:r.ranking,hits:[],low:!r.empty};
    return {best:r.best,conf:r.conf,ranking:r.ranking,hits:r.ranking.flatMap(x=>x.hits.map(h=>({h,id:x.id})))}}

  const txt=d.getElementById('txt'),out=d.getElementById('out'),live=d.getElementById('live');
  d.getElementById('ex').innerHTML=EX.map(e=>`<button type="button" class="chip">${e}</button>`).join('');
  d.getElementById('ex').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;txt.value=b.textContent;count();run()});
  const count=()=>d.getElementById('chars').textContent=`${txt.value.length}/300`;
  let timer=0,busy=false;
  async function run(){const v=txt.value.trim();if(!v){out.innerHTML='<p class="cl-wait">Escreva ou escolha uma mensagem.</p>';return}
    if(busy)return;busy=true;out.innerHTML='<p class="cl-wait"><span class="ia-think" aria-label="Analisando"><i></i><i></i><i></i></span> analisando (simulação)…</p>';
    await new Promise(r=>setTimeout(r,K.reduce?0:520));busy=false;
    const r=classify(v),m=meta(r.best),tot=r.ranking.reduce((a,x)=>a+x.score,0)||1;
    const html=I.mark(v,r.hits.map(h=>[h.h,CL[h.id].m]));
    const rows=Object.keys(CL).map(id=>({id,s:(r.ranking.find(x=>x.id===id)||{score:0}).score})).concat([{id:'out',s:r.best==='out'?1:0}]);
    out.innerHTML=`<div class="cl-res"><div class="cl-top"><span class="cl-badge" style="background:${m.c}22;color:${m.c}"><i style="background:${m.c}"></i>${m.n}</span><span class="cl-gauge">confiança<b>${I.pct(r.conf)}</b></span></div>
      <div class="cl-quote">${html}</div>
      <div class="ia-conf">${rows.map(x=>{const mm=meta(x.id),w=x.id==='out'?(r.best==='out'?100:0):Math.round(x.s/tot*100);return `<div class="row${x.id===r.best?' win':''}"><span>${mm.n}</span><span class="bar"><i style="background:${mm.c}" data-w="${w}"></i></span><span>${x.id==='out'?(r.best==='out'?'—':'0'):x.s} pts</span></div>`}).join('')}</div>
      <p class="cl-why">${r.best==='out'?'Nenhum termo típico de Comercial, Suporte ou Financeiro foi encontrado, então a mensagem vai para <b>Outros</b> e uma pessoa da equipe lê.':`Palavras que pesaram: ${I.words(v,r.hits.map(h=>h.h)).map(h=>`<b>${I.esc(h)}</b>`).join(', ')}.`}</p>
      ${r.conf<.6?'<p class="cl-low">Confiança baixa: em um sistema real, esta mensagem iria para revisão humana.</p>':''}</div>`;
    requestAnimationFrame(()=>out.querySelectorAll('.bar i').forEach(i=>i.style.width=i.dataset.w+'%'));
  }
  d.getElementById('go').addEventListener('click',run);
  txt.addEventListener('input',()=>{count();if(live.checked){clearTimeout(timer);timer=setTimeout(run,450)}});
  txt.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))run()});

  /* lote */
  const rowsEl=d.getElementById('rows');
  rowsEl.innerHTML=BATCH.map((b,i)=>`<tr data-i="${i}"><td>${I.esc(b)}</td><td class="muted">—</td><td class="muted">—</td></tr>`).join('');
  d.getElementById('batch').addEventListener('click',async e=>{const btn=e.currentTarget;btn.disabled=true;
    for(let i=0;i<BATCH.length;i++){const tr=rowsEl.children[i],r=classify(BATCH[i]),m=meta(r.best);
      tr.children[1].innerHTML='<span class="ia-think"><i></i><i></i><i></i></span>';await new Promise(x=>setTimeout(x,K.reduce?0:220));
      tr.classList.add('done');tr.children[1].className='';tr.children[2].className='';
      tr.children[1].innerHTML=`<span class="cl-pill" style="background:${m.c}1f;color:${m.c}"><i style="background:${m.c}"></i>${m.n}</span>`;
      tr.children[2].innerHTML=`<span class="cl-mini"><span><i style="width:${Math.round(r.conf*100)}%"></i></span>${I.pct(r.conf)}</span>`}
    btn.disabled=false;btn.textContent='Classificar de novo'});
})();
