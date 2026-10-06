/* Triagem de atendimento — regras por palavra-chave, tudo local (simulação) */
(function(){
  const d=document,K=window.VxKit;
  const CATS={
    orc:{n:'Orçamento',c:'#19E3D6',who:'Lívia',team:'Comercial',kw:['orçamento','orcamento','preço','preco','valor','quanto custa','cotação','cotacao','comprar','proposta'],rep:'Oi! Já encaminhei seu pedido de orçamento para a Lívia, do comercial. Ela retorna com os valores ainda hoje (exemplo).'},
    sup:{n:'Suporte',c:'#7462F5',who:'Diego',team:'Suporte',kw:['erro','problema','não funciona','nao funciona','bug','travou','ajuda','senha','acesso','quebrado','defeito'],rep:'Sinto muito pelo transtorno! O Diego, do suporte, já recebeu seu caso e vai te chamar por aqui (exemplo).'},
    fin:{n:'Financeiro',c:'#FFC24B',who:'Marta',team:'Financeiro',kw:['boleto','nota fiscal','pagamento','cobrança','cobranca','fatura','reembolso','pix','segunda via'],rep:'Recebido! A Marta, do financeiro, vai verificar e te envia a informação em breve (exemplo).'},
    age:{n:'Agendamento',c:'#3EE08F',who:'Rui',team:'Agenda',kw:['agendar','agenda','horário','horario','marcar','remarcar','visita','reunião','reuniao','disponível','disponivel'],rep:'Perfeito! O Rui cuida da agenda e vai te mandar os horários livres (exemplo).'},
    out:{n:'Outros',c:'#9AA1BD',who:'Equipe',team:'Geral',kw:[],rep:'Obrigado pela mensagem! Uma pessoa da equipe vai ler e responder em breve (exemplo).'}
  };
  const SAMPLES=['Quero um orçamento para 20 camisetas','O site não funciona no meu celular','Preciso da segunda via do boleto','Dá para agendar uma visita na sexta?','Vocês trabalham aos sábados?'];
  const RANDOM=['Qual o valor do plano anual?','Esqueci minha senha de acesso','A nota fiscal não chegou','Posso remarcar meu horário?','Quanto custa a entrega?','Apareceu um erro no pagamento','Vocês têm estacionamento?','Quero marcar uma reunião'];

  const flow=VxFlow(d.getElementById('flow'),[
    {id:'cli',label:'Cliente',icon:'user'},{id:'tri',label:'Triagem',icon:'filter'},{id:'cat',label:'Categoria',icon:'tag'},{id:'res',label:'Responsável',icon:'team'},{id:'rep',label:'Resposta',icon:'reply'}]);
  const msg=d.getElementById('msg'),send=d.getElementById('send'),auto=d.getElementById('auto'),result=d.getElementById('result'),state=d.getElementById('flowState');
  const log=d.getElementById('log'),queue=d.getElementById('queue'),counts=d.getElementById('counts');
  let items=K.store('triagem',[]);

  d.getElementById('samples').innerHTML=SAMPLES.map(s=>`<button type="button" class="chip">${s}</button>`).join('');
  d.getElementById('samples').addEventListener('click',e=>{const b=e.target.closest('.chip');if(b){msg.value=b.textContent;msg.focus()}});

  const norm=s=>s.toLowerCase();
  function classify(t){const s=norm(t);let best='out',hits=[];
    for(const k of ['fin','sup','age','orc']){const h=CATS[k].kw.filter(w=>s.includes(w));if(h.length>hits.length){best=k;hits=h}}
    return {k:best,hits}}
  const hhmm=()=>new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  function addLog(html){if(log.firstElementChild&&log.firstElementChild.tagName==='SPAN'&&!log.firstElementChild.dataset.t)log.innerHTML='';const l=d.createElement('div');l.dataset.t=1;l.innerHTML=`<span class="muted">${hhmm()}</span> ${html}`;log.prepend(l)}
  const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  async function process(text){
    text=text.trim();if(!text){K.toast('Escreva ou escolha uma mensagem.');msg.focus();return}
    if(flow.running)return;
    const {k,hits}=classify(text),c=CATS[k],id='#'+(1000+items.length+Math.floor(Math.random()*9)).toString();
    send.disabled=auto.disabled=true;state.textContent='processando…';result.hidden=true;
    await flow.run([
      {id:'cli',text:'mensagem recebida'},
      {id:'tri',text:hits.length?`achou: ${hits.slice(0,2).join(', ')}`:'nenhuma palavra-chave'},
      {id:'cat',text:c.n},
      {id:'res',text:`${c.who} · ${c.team}`},
      {id:'rep',text:'resposta enviada'}
    ]);
    addLog(`<b>${id}</b> “${esc(text.slice(0,48))}${text.length>48?'…':''}” → <b>${c.n}</b> → ${c.who}`);
    result.innerHTML=`<div class="row"><span class="tag" style="color:${c.c};background:${c.c}1a">${c.n}</span><span>encaminhado para <b>${c.who}</b> (${c.team})</span></div><div class="tr-bubble"><small>Resposta automática · simulação</small>${c.rep}</div>`;
    result.hidden=false;
    items.unshift({id,t:text,k,at:Date.now()});items=items.slice(0,30);K.save('triagem',items);render();
    state.textContent='concluído';send.disabled=auto.disabled=false;
  }
  function render(){
    d.getElementById('total').textContent=`${items.length} ${items.length===1?'mensagem':'mensagens'}`;
    counts.innerHTML=['orc','sup','fin','age'].map(k=>`<div><b>${items.filter(i=>i.k===k).length}</b><span><i style="background:${CATS[k].c}"></i>${CATS[k].n}</span></div>`).join('');
    queue.innerHTML=items.length?items.map(i=>{const c=CATS[i.k];return `<li><span class="av" style="background:${c.c}">${c.who[0]}</span><p>${esc(i.t)}<small>${i.id} · ${c.who} · ${c.n}</small></p><span class="tag" style="color:${c.c}">${c.team}</span></li>`}).join(''):'<li class="tr-empty">A fila aparece aqui depois do primeiro envio.</li>';
  }
  send.addEventListener('click',()=>process(msg.value));
  msg.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))process(msg.value)});
  auto.addEventListener('click',async()=>{const pool=[...RANDOM].sort(()=>Math.random()-.5).slice(0,5);for(const t of pool){msg.value=t;await process(t)}});
  d.getElementById('clear').addEventListener('click',()=>{items=[];K.drop('triagem');render();flow.reset();result.hidden=true;state.textContent='aguardando mensagem';log.innerHTML='<span>— nenhum evento ainda —</span>'});
  render();
})();
