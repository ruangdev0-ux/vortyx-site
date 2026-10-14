/* IA de triagem — SIMULAÇÃO: da mensagem solta à ficha pronta.
   Entrada → Interpretação → Extração de dados → Decisão operacional.
   Não há IA real: intenção e dados saem de padrões de texto e regras locais. */
(function(){
  const d=document,K=window.VxKit,I=window.VxIA,$=id=>d.getElementById(id);
  const fold=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');

  /* ---------- Intenções: sinais no texto (ordem = desempate) ---------- */
  const INTENTS={
    cob:{n:'Cobrança',re:/\b(?:cobrad\w*|cobranca\w*|cobraram|cobrou|fatura\w*|boleto\w*|estorno|reembolso|duas vezes|pagamento\w*|paguei|debitad\w*)\b/g,
      need:[{k:'cob',label:'Valor ou data da cobrança',any:['valor','data','periodo']}],ask:'Você consegue informar o valor ou quando essa cobrança apareceu?',reply:'Foi R$ 189,90, ontem',q:'fin'},
    orc:{n:'Orçamento',re:/\b(?:orcamento\w*|cotacao|cotacoes|proposta\w*|preco\w*|quanto custa\w*)\b/g,
      need:[{k:'qtd',label:'Quantidade ou porte',any:['qtd']}],ask:'Qual é a quantidade ou o tamanho aproximado da necessidade?',reply:'Seriam 3 lojas',q:'com'},
    fal:{n:'Falha técnica',re:/\b(?:caiu|parou|parad[ao]s?|fora do ar|nao funciona\w*|erro\w*|travou|travando|nao abre|nao carrega|ninguem consegue|nao consigo|bug|lento)\b/g,
      need:[{k:'oque',label:'O que parou',any:['canal']},{k:'quando',label:'Desde quando ou impacto',any:['periodo','data','impacto']}],ask:'O que parou e desde quando isso está acontecendo?',reply:'O app, desde as 9h',q:'sup'},
    ent:{n:'Entrega',re:/\b(?:nao chegou|chegou|entrega\w*|entregue|encomenda|rastreio|rastreamento|transportadora|atrasad\w*|pedido)\b/g,
      need:[{k:'ped',label:'Número do pedido',any:['pedido']}],ask:'Pode me passar o número do pedido?',reply:'Pedido 4821',q:'log'}
  };
  /* ---------- Dados extraídos (padrões simples sobre o texto sem acentos) ---------- */
  const FIELDS=[
    ['pedido','Pedido',/(?:pedido|encomenda|compra)\s*(?:n(?:o|º|°|umero)?\.?\s*)?#?\s*(\d{3,})|#\s?(\d{3,})/g],
    ['valor','Valor',/r\$\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\b\d+(?:,\d{2})?\s?reais\b/g],
    ['data','Data',/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g],
    ['periodo','Período',/\b(?:hoje cedo|anteontem|ontem|hoje|semana passada|mes passado|esta semana|essa semana|desde (?:as |a |o )?\d{1,2}(?::\d{2}|h\d{0,2})?|desde (?:ontem|hoje|cedo|segunda|terca|quarta|quinta|sexta|sabado|domingo|de manha|o almoco)|ha \d+ (?:minutos|horas|dias|semanas))\b/g],
    ['qtd','Quantidade',/\b\d+\s+(?:lojas?|unidades?|filiais|filial|usuarios?|pessoas|funcionarios|computadores|maquinas|pecas|caixas|itens|produtos|camisetas|licencas)\b|\b(?:pequena|media|grande)s? (?:empresa|loja|rede|operacao)\b/g],
    ['impacto','Impacto',/\b(?:equipe toda|toda a equipe|ninguem consegue|ninguem esta conseguindo|todos os clientes|todo mundo|tudo parado|estamos parados|(?:loja|empresa|operacao|producao) (?:toda )?(?:esta )?parad[ao])\b/g],
    ['canal','Canal / produto',/\b(?:aplicativo|app|site|sistema|cartao|pix|login|e-?mail|whatsapp|loja virtual|maquininha)\b/g]
  ];
  const QUEUES={com:{n:'Comercial',sla:'4 h'},log:{n:'Logística',sla:'8 h'},fin:{n:'Financeiro',sla:'8 h'},sup:{n:'Suporte técnico',sla:'1 h'},
    prio:{n:'Prioridade (plantão)',sla:'15 min'},comp:{n:'Aguardando complemento',note:'depende da resposta do cliente'},rev:{n:'Revisão humana',note:'uma pessoa lê e decide'}};
  const ST={pronta:['✓','Ficha pronta'],comp:['…','Aguardando complemento'],prio:['!','Plantão'],rev:['?','Revisão humana']};
  const EX=[['Entrega · sem nº','meu pedido não chegou'],['Entrega · com nº','o pedido 4821 não chegou e já passou do prazo'],['Cobrança · sem valor','fui cobrado duas vezes'],
    ['Cobrança · com valor','fui cobrado duas vezes de R$ 189,90 ontem'],['Falha crítica','URGENTE: o sistema caiu e a equipe toda está parada desde as 9h'],['Orçamento','quero orçamento para 3 lojas']];
  const POOL=['meu pedido não chegou','o pedido 4821 não chegou e já passou do prazo','fui cobrado duas vezes','fui cobrado duas vezes de R$ 189,90 ontem','URGENTE: o sistema caiu e a equipe toda está parada desde as 9h','quero orçamento para 3 lojas',
    'o app não abre desde ontem','quanto custa o plano para minha empresa?','Vocês atendem aos sábados?','Recebi a fatura de 12/10 com valor errado','minha encomenda está atrasada, pedido #5530','ninguém consegue entrar no sistema'];

  function analyze(text){
    const n=fold(text),same=n.length===text.length,src=same?text:n,marks=[],found={};
    const score={};for(const k in INTENTS){const m=n.match(INTENTS[k].re);score[k]=m?m.length:0;
      INTENTS[k].re.lastIndex=0;let x;while((x=INTENTS[k].re.exec(n)))marks.push([x.index,x.index+x[0].length,'tg-i'])}
    let intent=null,best=0;for(const k of Object.keys(INTENTS))if(score[k]>best){best=score[k];intent=k}
    for(const [key,label,re] of FIELDS){re.lastIndex=0;const x=re.exec(n);if(!x)continue;
      let a=x.index,b=a+x[0].length,val=src.slice(a,b).trim();
      if(key==='pedido'){const num=x[1]||x[2];val=num;}
      found[key]={label,val};marks.push([a,b,'tg-d'])}
    const it=intent?INTENTS[intent]:null;
    const missing=it?it.need.filter(g=>!g.any.some(f=>found[f])).map(g=>g.label):[];
    let st,q;
    if(!it){st='rev';q='rev'}
    else if(intent==='fal'&&found.impacto){st='prio';q='prio'}
    else if(missing.length){st='comp';q='comp'}
    else{st='pronta';q=it.q}
    return {intent,found,missing,st,q,marks,urgent:/\burgente\b/.test(n)};
  }
  function markHTML(text,marks){
    if(fold(text).length!==text.length||!marks.length)return I.esc(text);
    const ms=marks.slice().sort((a,b)=>a[0]-b[0]||(b[1]-b[0])-(a[1]-a[0])||(a[2]==='tg-d'?-1:1)),keep=[];let end=-1;
    ms.forEach(m=>{if(m[0]>=end){keep.push(m);end=m[1]}});
    let out='',i=0;keep.forEach(([a,b,c])=>{out+=I.esc(text.slice(i,a))+`<mark class="${c}">${I.esc(text.slice(a,b))}</mark>`;i=b});
    return out+I.esc(text.slice(i));
  }

  /* ---------- Estado ---------- */
  let items=[],seq=0,sel=null,busy=false;
  const wait=ms=>new Promise(r=>setTimeout(r,K.reduce?0:ms));
  const track=[...$('track').children],now=$('now'),list=$('list'),ficha=$('ficha'),panel=$('fichaPanel');
  const full=it=>[it.t,...it.extra].join(' · ');

  function setTrack(stage,it,txt){
    track.forEach((li,i)=>{li.classList.toggle('on',i===stage);li.classList.toggle('done',i<stage||stage===4);li.querySelector('small').textContent=txt[i]||''});
    now.textContent=stage===4?`#${pad(it.id)} · ${ST[it.r.st][1]}`:`#${pad(it.id)} · ${['Recebida','Interpretada','Dados conferidos','Decisão'][stage]}…`;
  }
  const pad=n=>String(n).padStart(3,'0');
  function trackTexts(it){const r=it.r,f=Object.keys(r.found).length;
    return [`#${pad(it.id)}`,r.intent?INTENTS[r.intent].n:'não identificada',`${f} ${f===1?'dado':'dados'} · ${r.missing.length} faltando`,ST[r.st][1]]}

  function renderList(){
    $('msgCount').textContent=`${items.length} ${items.length===1?'mensagem':'mensagens'}`;
    list.innerHTML=items.length?items.slice().reverse().map(it=>{const s=it.stage<4?null:ST[it.r.st];
      return `<li><button type="button" class="tg-card${it.id===sel?' sel':''}${it.stage===0?' new':''}" data-id="${it.id}" aria-pressed="${it.id===sel}"><span class="tg-c-top"><span class="mono">#${pad(it.id)}</span>${s?`<span class="st st-${it.r.st}"><span aria-hidden="true">${s[0]}</span> ${s[1]}</span>`:'<span class="st">processando…</span>'}</span>
        <span class="tg-c-txt">${markHTML(full(it),it.stage>=2?it.r.marks2:[])}</span><span class="tg-steps" aria-hidden="true">${[0,1,2,3].map(i=>`<i class="${i<=Math.min(it.stage,3)?'on':''}"></i>`).join('')}</span></button></li>`}).join('')
      :'<li class="tg-empty">As mensagens aparecem aqui. Toque em uma para abrir a ficha.</li>';
  }
  function renderQueues(){const c={};items.filter(i=>i.stage>=4).forEach(i=>c[i.r.q]=(c[i.r.q]||0)+1);
    $('queues').innerHTML=Object.keys(QUEUES).map(k=>{const Q=QUEUES[k];return `<div class="tg-q q-${k}"><span>${Q.n}</span><b>${c[k]||0}</b><small>${Q.sla?`prazo de exemplo: ${Q.sla}`:Q.note}</small></div>`}).join('')}
  function renderFicha(){
    const it=items.find(i=>i.id===sel);if(!it||it.stage<4){return}
    const r=it.r,I0=r.intent?INTENTS[r.intent]:null,Q=QUEUES[r.q],s=ST[r.st];
    const found=Object.values(r.found);
    const dec={pronta:'Ficha pronta para encaminhar',comp:'Aguardando complemento',prio:'Prioridade (plantão): alto impacto',rev:'Revisão humana: intenção não identificada'}[r.st];
    const next={pronta:`Encaminhar para ${Q.n}`,comp:'Pedir o dado que falta ao cliente',prio:'Acionar o plantão agora',rev:'Uma pessoa lê a mensagem e decide'}[r.st];
    $('fichaId').textContent=`#${pad(it.id)}`;
    ficha.innerHTML=`<div class="tg-f">
      <p class="tg-f-st st st-${r.st}"><span aria-hidden="true">${s[0]}</span> ${dec}</p>
      <p class="tg-quote">${markHTML(full(it),r.marks2)}</p>
      ${it.extra.length?`<p class="tg-hist">Complemento recebido (simulação): “${I.esc(it.extra.join(' · '))}”</p>`:''}
      <dl class="tg-dl">
        <dt>Intenção</dt><dd>${I0?I0.n:'não identificada'}</dd>
        <dt>Dados encontrados</dt><dd>${found.length?`<ul class="tg-ck">${found.map(f=>`<li class="ok"><span aria-hidden="true">✓</span><span><span class="vx-sr">Encontrado: </span>${f.label}: <b>${I.esc(f.val)}</b></span></li>`).join('')}</ul>`:'<span class="muted">nenhum</span>'}</dd>
        <dt>Dados faltando</dt><dd>${r.missing.length?`<ul class="tg-ck">${r.missing.map(m=>`<li class="bad"><span aria-hidden="true">✗</span><span><span class="vx-sr">Faltando: </span>${m}</span></li>`).join('')}</ul>`:`<span class="muted">${I0?'nenhum':'—'}</span>`}</dd>
        <dt>Decisão</dt><dd><b>${s[1]}</b></dd>
        <dt>Próximo passo</dt><dd>${next}</dd>
        <dt>Fila</dt><dd>${Q.n}${Q.sla?` <span class="muted">· prazo de exemplo: ${Q.sla}</span>`:` <span class="muted">· ${Q.note}</span>`}</dd>
      </dl>
      ${r.st==='comp'?`<div class="tg-ask"><p class="tg-ask-h">Resposta sugerida</p><p class="tg-ask-t" id="askT">${I.esc(I0.ask)}</p>
        <div class="tg-ask-b"><button type="button" class="btn btn-g btn-s" id="copy">Copiar texto</button><button type="button" class="btn btn-g btn-s" id="sim">Simular resposta do cliente</button></div>
        <p class="tg-ask-n" id="copyMsg" role="status" aria-live="polite">Nada é enviado: a resposta do cliente também é simulada.</p></div>`:''}
    </div>`;
  }
  function select(id,jump){sel=id;renderList();renderFicha();const it=items.find(i=>i.id===id);
    if(it&&it.stage>=4)$('announce').textContent=`Ficha #${pad(id)}: ${ST[it.r.st][1]}.${it.r.missing.length?' Faltando: '+it.r.missing.join(', ')+'.':''}`;
    if(jump)toFicha()}
  function toFicha(){const r=panel.getBoundingClientRect(),top=parseFloat(getComputedStyle(panel).scrollMarginTop)||0;
    if(r.top<top||r.top>innerHeight*.55)panel.scrollIntoView({behavior:K.reduce?'auto':'smooth',block:'start'})}

  function analyzeItem(it){it.r=analyze(full(it));
    // marcas calculadas sobre o texto completo (mensagem + complementos)
    it.r.marks2=it.r.marks}
  async function run(it,quick){
    analyzeItem(it);const tx=trackTexts(it);
    if(quick){it.stage=4;setTrack(4,it,tx);renderList();renderQueues();return}
    for(let s=it.stage;s<4;s++){it.stage=s;setTrack(s,it,tx.slice(0,s+1));renderList();await wait(s===0?300:400)}
    it.stage=4;setTrack(4,it,tx);renderList();renderQueues();
  }
  async function process(texts,{jump=true}={}){
    if(busy)return;busy=true;lock(true);
    for(let i=0;i<texts.length;i++){const last=i===texts.length-1,it={id:++seq,t:texts[i],extra:[],stage:0};items.push(it);if(items.length>12)items.shift();
      await run(it,!last);if(!last)await wait(380)}
    select(seq,jump);busy=false;lock(false);
  }
  function lock(v){['feed','clear'].forEach(id=>$(id).disabled=v);d.querySelectorAll('#own button,#ex button').forEach(b=>b.disabled=v)}

  /* ---------- Eventos ---------- */
  $('ex').innerHTML=EX.map(([l,t])=>`<button type="button" class="chip" data-t="${I.esc(t)}" title="${I.esc(t)}" aria-label="Exemplo ${l}: ${I.esc(t)}">${l}</button>`).join('');
  $('ex').addEventListener('click',e=>{const b=e.target.closest('.chip');if(b)process([b.dataset.t])});
  $('own').addEventListener('submit',e=>{e.preventDefault();const i=$('ownTxt'),v=i.value.trim();if(!v){K.toast('Escreva uma mensagem.');i.focus();return}i.value='';process([v])});
  $('feed').addEventListener('click',()=>{const pool=[...POOL].sort(()=>Math.random()-.5).slice(0,4);process(pool)});
  list.addEventListener('click',e=>{const b=e.target.closest('.tg-card');if(b&&!busy){const id=+b.dataset.id,it=items.find(i=>i.id===id);if(it&&it.stage>=4)select(id,true)}});
  ficha.addEventListener('click',async e=>{
    if(e.target.id==='copy'){const t=$('askT').textContent;let ok=false;
      try{await navigator.clipboard.writeText(t);ok=true}catch(_){const ta=d.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';d.body.appendChild(ta);ta.select();try{ok=d.execCommand('copy')}catch(__){}ta.remove()}
      $('copyMsg').textContent=ok?'Texto copiado. Nada foi enviado.':'Não foi possível copiar automaticamente; selecione o texto acima.';}
    if(e.target.id==='sim'&&!busy){const it=items.find(i=>i.id===sel);if(!it||it.r.st!=='comp')return;
      busy=true;lock(true);it.extra.push(INTENTS[it.r.intent].reply);it.stage=1;await run(it,false);busy=false;lock(false);select(it.id,true)}
  });
  $('clear').addEventListener('click',()=>{if(busy)return;items=[];seq=0;sel=null;renderList();renderQueues();
    track.forEach(li=>{li.classList.remove('on','done');li.querySelector('small').textContent=''});now.textContent='Aguardando mensagem.';$('fichaId').textContent='—';
    ficha.innerHTML='<p class="tg-wait">Envie ou escolha uma mensagem. A ficha mostra intenção, dados encontrados, dados faltando, decisão e próximo passo.</p>';$('announce').textContent=''});
  renderQueues();
})();
