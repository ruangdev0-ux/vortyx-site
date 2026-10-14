/* Triagem de atendimento — entrada → triagem → decisão → encaminhamento.
   Regras por palavra-chave, tudo local (simulação). */
(function(){
  const d=document,K=window.VxKit,reduce=K.reduce;

  /* Regras ilustrativas. A ordem da lista é a prioridade quando mais de uma combina.
     Palavras escritas sem acento (o texto do cliente também é comparado sem acento).
     "*" no fim aceita continuação da palavra: "pagamento*" pega "pagamentos". */
  const RULES=[
    {k:'fin',n:'Financeiro',c:'#FFC24B',who:'Marta',team:'Financeiro',
     kw:['boleto*','nota fiscal','notas fiscais','pagamento*','pagar','cobranca*','cobrad*','fatura*','reembolso*','pix','segunda via'],
     show:'boleto, pagamento, nota fiscal, fatura, pix…',
     rep:'Recebido! A Marta, do financeiro, vai verificar e te envia a informação em breve (exemplo).'},
    {k:'sup',n:'Suporte',c:'#7462F5',who:'Diego',team:'Suporte',
     kw:['erro*','problema*','nao funciona*','bug*','travou','travando','ajuda','senha*','acesso','acessos','acessar','quebrad*','quebrou','defeito*'],
     show:'erro, problema, não funciona, senha, acesso…',
     rep:'Sinto muito pelo transtorno! O Diego, do suporte, já recebeu seu caso e vai te chamar por aqui (exemplo).'},
    {k:'age',n:'Agendamento',c:'#3EE08F',who:'Rui',team:'Agenda',
     kw:['agend*','horario*','marcar','remarcar','visita*','reuniao','reunioes','disponivel','disponiveis','disponibilidade'],
     show:'agendar, horário, marcar, visita, reunião…',
     rep:'Perfeito! O Rui cuida da agenda e vai te mandar os horários livres (exemplo).'},
    {k:'orc',n:'Orçamento',c:'#19E3D6',who:'Lívia',team:'Comercial',
     kw:['orcamento*','preco*','valor','valores','quanto custa*','cotacao','cotacoes','comprar','proposta*'],
     show:'orçamento, preço, valor, quanto custa…',
     rep:'Oi! Já encaminhei seu pedido de orçamento para a Lívia, do comercial. Ela retorna com os valores ainda hoje (exemplo).'}
  ];
  const OUT={k:'out',n:'Outros',c:'#9AA1BD',who:'Equipe',team:'Geral',rep:'Obrigado pela mensagem! Uma pessoa da equipe vai ler e responder em breve (exemplo).'};
  const BY=Object.fromEntries([...RULES,OUT].map(r=>[r.k,r]));

  const SAMPLES=['Quero um orçamento para 20 camisetas','O site não funciona no meu celular','Preciso da segunda via do boleto','Dá para agendar uma visita na sexta?','Apareceu um erro no pagamento','Vocês trabalham aos sábados?'];
  const RANDOM=['Qual o valor do plano anual?','Esqueci minha senha de acesso','A nota fiscal não chegou','Posso remarcar meu horário?','Quanto custa a entrega?','Apareceu um erro no pagamento','Vocês têm estacionamento?','Quero marcar uma reunião','Fui cobrado duas vezes no cartão','O aplicativo travou no login'];

  /* ---------- Comparação de palavras ---------- */
  const fold=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const L='a-z0-9';
  RULES.forEach(r=>{r.re=r.kw.map(w=>{const star=w.endsWith('*');w=w.replace('*','').replace(/ /g,'\\s+');
    return new RegExp(`(^|[^${L}])(${w}${star?`[${L}]*`:''})(?![${L}])`,'g')})});
  function classify(text){
    const s=fold(text),same=s.length===text.length,found=[];
    for(const r of RULES){
      const words=[];
      for(const re of r.re){re.lastIndex=0;let m;
        while((m=re.exec(s))){const i=m.index+m[1].length,w=(same?text.slice(i,i+m[2].length):m[2]).toLowerCase();if(!words.includes(w))words.push(w)}}
      if(words.length)found.push({r,words});
    }
    return {rule:found.length?found[0].r:OUT,found};
  }

  /* ---------- Fluxo ---------- */
  const flow=VxFlow(d.getElementById('flow'),[
    {id:'in',label:'Entrada',icon:'inbox'},{id:'tri',label:'Triagem',icon:'filter'},{id:'dec',label:'Decisão',icon:'route'},{id:'enc',label:'Encaminhamento',icon:'team'}],{linkMs:300,stepMs:380});
  const HINTS={in:'chat do site',tri:'procura palavras-chave',dec:'aplica a regra',enc:'fila + resposta automática'};
  function hints(){flow.reset();d.querySelectorAll('#flow .vxf-node').forEach(n=>n.querySelector('.vxf-t').textContent=HINTS[n.dataset.id])}

  const $=id=>d.getElementById(id);
  const msg=$('msg'),send=$('send'),auto=$('auto'),clear=$('clear'),result=$('result'),state=$('flowState'),panel=$('flowPanel');
  const queue=$('queue'),counts=$('counts'),rules=$('rules');
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const wait=ms=>new Promise(r=>setTimeout(r,reduce?0:ms));

  /* ---------- Fila e IDs sequenciais ---------- */
  let items=K.store('triagem',[]);
  const num=x=>parseInt(String(x).replace(/\D/g,''),10)||0;
  let seq=Math.max(1000,num(K.store('triagem-seq',1000)),...items.map(i=>num(i.id)));
  function nextId(){seq+=1;K.save('triagem-seq',seq);return '#'+seq}

  $('samples').innerHTML=SAMPLES.map(s=>`<button type="button" class="chip">${s}</button>`).join('');
  $('samples').addEventListener('click',e=>{const b=e.target.closest('.chip');if(b){msg.value=b.textContent;msg.focus()}});

  rules.innerHTML=RULES.map((r,i)=>`<li data-k="${r.k}"><span class="tr-p">${i+1}</span><b><i style="background:${r.c}"></i>${r.n}</b><span class="tr-to">→ ${r.who}</span><small>${r.show}</small><span class="tr-st"></span></li>`).join('')+
    `<li data-k="out" class="tr-fb"><span class="tr-p">–</span><b><i style="background:${OUT.c}"></i>Sem regra</b><span class="tr-to">→ fila geral</span><small>nenhuma palavra-chave encontrada</small><span class="tr-st"></span></li>`;
  function mark(res){
    const hit=res.found.map(f=>f.r.k);
    rules.querySelectorAll('li').forEach(li=>{const k=li.dataset.k,on=k===res.rule.k,also=!on&&hit.includes(k),st=li.querySelector('.tr-st');
      li.classList.toggle('on',on);li.classList.toggle('hit',also);
      st.className='tr-st tag'+(on?' info':'');st.textContent=on?'regra aplicada':also?'também encontrada':''});
  }
  function render(newId){
    $('total').textContent=`${items.length} ${items.length===1?'mensagem':'mensagens'}`;
    counts.innerHTML=[...RULES,OUT].map(r=>`<span><i style="background:${r.c}"></i>${r.k==='out'?'Geral':r.n} <b>${items.filter(i=>i.k===r.k).length}</b></span>`).join('');
    queue.innerHTML=items.length?items.map(i=>{const c=BY[i.k]||OUT,why=i.k==='out'?'sem regra':i.w&&i.w.length?'motivo: '+i.w.join(', '):'';
      return `<li${i.id===newId?' class="new"':''}><span class="av" style="background:${c.c}">${c.who[0]}</span><p>${esc(i.t)}<small>${esc(i.id)} · ${c.who}${why?' · '+esc(why):''}</small></p><span class="tag" style="color:${c.c}">${c.team}</span></li>`}).join('')
      :'<li class="tr-empty">A fila aparece aqui depois do primeiro envio.</li>';
  }

  /* ---------- Processamento ---------- */
  let busy=false;
  const lock=v=>{busy=v;send.disabled=auto.disabled=clear.disabled=v};
  function toFlow(){
    const box=$('flow').getBoundingClientRect(),top=parseFloat(getComputedStyle(panel).scrollMarginTop)||0;
    if(box.top<top||box.bottom>innerHeight)panel.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  }
  async function handle(text,quick){
    const res=classify(text),r=res.rule,id=nextId(),words=res.found.flatMap(f=>f.words);
    mark(res);
    if(!quick){
      await flow.run([
        {id:'in',text:'chat do site'},
        {id:'tri',text:words.length?`${words.length===1?'palavra encontrada':'palavras encontradas'}: ${words.slice(0,3).join(', ')}`:'nenhuma palavra-chave'},
        {id:'dec',text:res.found.length>1?`${res.found.length} regras encontradas · prioridade: ${r.n}`:res.found.length?`regra aplicada: ${r.n}`:'sem regra → fila geral'},
        {id:'enc',text:r===OUT?'Equipe · fila geral + resposta automática':`${r.who} · ${r.team} + resposta automática`}
      ]);
      result.innerHTML=`<div class="row"><span class="tag" style="color:${r.c};background:${r.c}1a">${r.n}</span><span><b>${id}</b> entrou na fila ${r===OUT?'geral (Equipe)':`de <b>${r.who}</b> (${r.team})`}</span></div><div class="tr-bubble"><small>Resposta automática · simulação</small>${r.rep}</div>`;
      result.hidden=false;
    }
    items.unshift({id,t:text,k:r.k,w:res.found.length?res.found[0].words.slice(0,2):[],at:Date.now()});
    items=items.slice(0,30);K.save('triagem',items);render(id);
  }
  async function sendOne(text){
    text=text.trim();if(!text){K.toast('Escreva ou escolha uma mensagem.');msg.focus();return}
    if(busy)return;lock(true);result.hidden=true;state.textContent='processando…';toFlow();
    await handle(text,false);
    state.textContent='concluído';lock(false);
  }
  async function batch(){
    if(busy)return;lock(true);result.hidden=true;toFlow();hints();
    const pool=[...RANDOM].sort(()=>Math.random()-.5).slice(0,5);
    for(let i=0;i<pool.length;i++){
      const last=i===pool.length-1;
      state.textContent=`processando ${i+1} de ${pool.length}…`;msg.value=pool[i];
      await handle(pool[i],!last);if(!last)await wait(220);
    }
    state.textContent=`concluído · ${pool.length} mensagens`;lock(false);
  }

  send.addEventListener('click',()=>sendOne(msg.value));
  msg.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();sendOne(msg.value)}});
  auto.addEventListener('click',batch);
  clear.addEventListener('click',()=>{items=[];seq=1000;K.drop('triagem');K.drop('triagem-seq');render();hints();
    result.hidden=true;state.textContent='aguardando mensagem';mark({rule:{k:''},found:[]})});
  hints();render();mark({rule:{k:''},found:[]});
})();
