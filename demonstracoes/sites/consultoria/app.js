/* Marino Consultoria — herói animado, raio-X da operação, frentes, método e agenda (dados fictícios) */
(function(){
  const d=document,K=window.VxKit,$=id=>d.getElementById(id),reduce=K.reduce;

  /* ---------- herói: emaranhado → três trilhas ---------- */
  const flow=$('flow');
  if(flow&&!reduce){
    const anims=[...flow.querySelectorAll('animate')];
    if(anims.length&&typeof anims[0].beginElement==='function'){
      anims.forEach(a=>a.parentNode.setAttribute('d',a.getAttribute('from')));
      flow.classList.add('start');
      setTimeout(()=>{anims.forEach(a=>a.beginElement());flow.classList.add('run')},450);
    }
  }

  /* ---------- dados ---------- */
  const LEVELS=['Inicial','Em formação','Estruturado','Consolidado'];
  const FRONTS=[
    {id:'proc',n:'Processos',q:'Como o trabalho do dia a dia é executado?',o:['Cada pessoa faz do seu jeito; depende de quem está.','Os processos principais existem na cabeça de algumas pessoas.','Os processos principais estão escritos, mas nem sempre são seguidos.','Processos documentados, seguidos e revisados com a equipe.'],
      why:'Sem um padrão, cada erro precisa ser resolvido de novo.',a:['Mapear os três processos que mais geram retrabalho.','Definir um responsável e um padrão para cada um.','Registrar em uma página, na linguagem da equipe.'],front:'Processos',fa:'#fr2',topic:0},
    {id:'ind',n:'Indicadores',q:'Como os números chegam até quem decide?',o:['Os números aparecem quando alguém pede, e chegam tarde.','Existem relatórios, mas ninguém sabe bem quais olhar.','Alguns indicadores são acompanhados, sem rotina fixa.','Poucos indicadores, revisados em data certa, guiando decisões.'],
      why:'Sem números no momento certo, as decisões ficam no escuro.',a:['Escolher até cinco indicadores que guiam decisões.','Definir a fonte e a data de atualização de cada um.','Revisar os números em uma reunião fixa.'],front:'Indicadores e rotina de gestão',fa:'#fr3',topic:1},
    {id:'rot',n:'Rotina de gestão',q:'Como funcionam as reuniões de acompanhamento?',o:['Reuniões acontecem quando surge um problema.','Há reuniões, mas sem pauta nem acompanhamento.','Existe uma rotina, que se perde quando o mês aperta.','Rotina semanal e mensal com pauta, decisões e responsáveis.'],
      why:'Sem rotina, o que foi combinado se perde na semana seguinte.',a:['Criar uma reunião semanal de 30 minutos com pauta fixa.','Registrar decisões e responsáveis.','Começar cada encontro pelas pendências anteriores.'],front:'Indicadores e rotina de gestão',fa:'#fr3',topic:1},
    {id:'pap',n:'Papéis e responsabilidades',q:'Como as decisões são distribuídas?',o:['Tudo passa pelo dono, inclusive decisões pequenas.','Cada um sabe sua tarefa, mas não onde termina sua responsabilidade.','Os papéis estão definidos, com algumas sobreposições.','Cada área tem responsável claro e autonomia para decidir.'],
      why:'Enquanto tudo depende do dono, a empresa cresce no ritmo dele.',a:['Listar as decisões que hoje param no dono.','Definir quem decide o quê, e até que limite.','Comunicar à equipe e acompanhar por 30 dias.'],front:'Processos',fa:'#fr2',topic:2},
    {id:'fin',n:'Finanças e margem',q:'O quanto vocês conhecem margem e caixa?',o:['Sabemos o saldo do banco, não a margem de cada produto ou serviço.','O resultado do mês só aparece depois que ele fecha.','Custos e margens são conhecidos, mas pouco usados para decidir.','Margem e caixa acompanhados e usados em preço e investimento.'],
      why:'Vender mais sem conhecer a margem pode aumentar o problema.',a:['Separar custos fixos e variáveis.','Calcular a margem dos principais produtos ou serviços.','Acompanhar caixa e margem uma vez por semana.'],front:'Indicadores e rotina de gestão',fa:'#fr3',topic:3},
    {id:'pla',n:'Planejamento',q:'Como o plano vira execução?',o:['O planejamento é o que dá para fazer nesta semana.','Existe uma meta anual, sem plano para chegar nela.','Há um plano, mas ele não vira tarefas e prazos.','Plano com prioridades, responsáveis e revisão periódica.'],
      why:'Uma meta sem desdobramento vira apenas um desejo.',a:['Escolher no máximo três prioridades para o trimestre.','Transformar cada uma em tarefas com prazo e dono.','Revisar o andamento uma vez por mês.'],front:'Planejamento e acompanhamento',fa:'#fr4',topic:4}
  ];
  // em empate, a base vem primeiro: papéis e processos antes de indicadores e planejamento
  const BASE=['pap','proc','rot','ind','fin','pla'];
  const TOPICS=['Organizar processos','Indicadores e rotina de gestão','Papéis e responsabilidades','Custos, margem e caixa','Planejamento e execução','Outro'];

  /* ---------- raio-X ---------- */
  const ans=new Array(FRONTS.length).fill(null);let cur=0,done=false;
  const xOpts=$('xOpts'),xNext=$('xNext'),xBack=$('xBack'),xBars=$('xBars'),xRes=$('xRes'),xMap=$('xMap'),xCard=$('xCard');
  $('xProg').innerHTML=FRONTS.map(()=>'<i></i>').join('');
  xBars.innerHTML=FRONTS.map((f,i)=>`<li data-i="${i}"><span class="n">${f.n}</span><span class="bar"><i></i></span><span class="lv">Sem resposta</span></li>`).join('');

  function renderQ(focus){
    const f=FRONTS[cur];
    $('xFront').textContent=f.n;$('xAsk').textContent=f.q;
    xOpts.innerHTML=f.o.map((t,j)=>`<label class="mc-opt"><input type="radio" name="x-${f.id}" value="${j}" ${ans[cur]===j?'checked':''}><span class="lv">${LEVELS[j]}</span><span class="tx">${t}</span></label>`).join('');
    $('xStep').textContent=`${cur+1} de ${FRONTS.length}`;
    [...$('xProg').children].forEach((s,i)=>{s.className=i===cur?'on':(ans[i]!==null?'ok':'')});
    xBack.hidden=cur===0;
    xNext.textContent=cur===FRONTS.length-1?'Ver resultado':'Próxima';
    xNext.disabled=ans[cur]===null;
    xOpts.classList.remove('swap');void xOpts.offsetWidth;xOpts.classList.add('swap');
    if(focus){$('xLegend').focus({preventScroll:true});const r=xCard.getBoundingClientRect(),top=(parseFloat(getComputedStyle(d.documentElement).scrollPaddingTop)||110);if(r.top<top-4||r.top>innerHeight*.5)xCard.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})}
  }
  function renderBars(){
    [...xBars.children].forEach((li,i)=>{const v=ans[i];li.querySelector('.bar i').style.width=v===null?'0':`${(v+1)*25}%`;li.querySelector('.lv').textContent=v===null?'Sem resposta':LEVELS[v];li.classList.toggle('set',v!==null)});
  }
  function go(n,focus){cur=n;done=false;xCard.classList.remove('is-done');$('xQ').hidden=false;$('xDone').hidden=true;renderQ(focus)}
  function next(){if(done){go(0,true);return}if(ans[cur]===null)return;if(cur<FRONTS.length-1)go(cur+1,true);else finish()}
  let auto=0;
  xOpts.addEventListener('change',e=>{ans[cur]=+e.target.value;xNext.disabled=false;renderBars();[...$('xProg').children][cur].className='on'});
  // clique com o mouse ou toque avança sozinho; teclado (setas) só seleciona
  xOpts.addEventListener('click',e=>{const l=e.target.closest('.mc-opt');if(!l||e.detail===0)return;clearTimeout(auto);auto=setTimeout(next,reduce?0:320)});
  xNext.addEventListener('click',next);
  xBack.addEventListener('click',()=>{clearTimeout(auto);if(done){go(FRONTS.length-1,true)}else if(cur>0)go(cur-1,true)});

  function weakest(){
    const idx=FRONTS.map((f,i)=>i);
    idx.sort((a,b)=>ans[a]-ans[b]||BASE.indexOf(FRONTS[a].id)-BASE.indexOf(FRONTS[b].id));
    return idx.slice(0,2);
  }
  let picked=[];
  function finish(){
    done=true;picked=weakest();
    xCard.classList.add('is-done');$('xQ').hidden=true;$('xDone').hidden=false;
    $('xStep').textContent='6 de 6';[...$('xProg').children].forEach(s=>s.className='ok');
    xNext.textContent='Revisar respostas';xNext.disabled=false;xBack.hidden=false;
    [...xBars.children].forEach((li,i)=>li.classList.toggle('pri',picked.includes(i)));
    const allOk=ans.every(v=>v>=2);
    $('xSum').textContent=allOk?`A operação já tem base. As frentes com mais espaço para evoluir são ${FRONTS[picked[0]].n.toLowerCase()} e ${FRONTS[picked[1]].n.toLowerCase()}.`
      :`As frentes mais frágeis hoje são ${FRONTS[picked[0]].n.toLowerCase()} e ${FRONTS[picked[1]].n.toLowerCase()}. Em caso de empate, a base vem primeiro: papéis e processos antes de indicadores e planejamento.`;
    $('xStart').innerHTML=picked.map((i,k)=>{const f=FRONTS[i];return `<article class="mc-x-sc"><p class="k">Prioridade ${k+1} · ${LEVELS[ans[i]]}</p><h4>${f.n}</h4><p class="why">${f.why}</p>
      <p class="lb">Primeiras ações</p><ol>${f.a.map(x=>`<li>${x}</li>`).join('')}</ol>
      <p class="lb">No método</p><p class="mt"><a href="#mt1">1 Entender</a> confirma o quadro, <a href="#mt2">2 Priorizar</a> transforma em plano e <a href="#mt3">3 Implantar</a> coloca as ações em prática. Frente relacionada: <a href="${f.fa}">${f.front}</a>.</p></article>`}).join('');
    xRes.hidden=false;xMap.classList.add('show');
    requestAnimationFrame(()=>{xRes.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});xRes.focus({preventScroll:true})});
  }
  $('xRedo').addEventListener('click',()=>{ans.fill(null);picked=[];xRes.hidden=true;xMap.classList.remove('show');[...xBars.children].forEach(li=>li.classList.remove('pri'));renderBars();go(0,false);
    $('raio-x').scrollIntoView({behavior:reduce?'auto':'smooth'});$('xLegend').focus({preventScroll:true})});
  $('xTake').addEventListener('click',()=>{
    const a=FRONTS[picked[0]],b=FRONTS[picked[1]];
    $('desafio').value=TOPICS[a.topic];
    $('msg').value=`Resultado do raio-X: frentes mais frágeis — ${a.n} (${LEVELS[ans[picked[0]]].toLowerCase()}) e ${b.n} (${LEVELS[ans[picked[1]]].toLowerCase()}).`;
    $('fromX').hidden=false;
    $('conversa').scrollIntoView({behavior:reduce?'auto':'smooth'});
    setTimeout(()=>d.querySelector('#contact input[name=nome]').focus({preventScroll:true}),reduce?0:500);
  });
  renderQ(false);renderBars();

  /* ---------- frentes ---------- */
  const FR=[
    {n:'Diagnóstico',r:'Não saber por onde começar, ou atacar sintomas em vez de causas.',f:'Entrevistas com dono e equipe, leitura dos números existentes e acompanhamento da rotina.',e:'Relatório com gargalos priorizados e o plano em uma página.'},
    {n:'Processos',r:'Retrabalho e dependência de pessoas específicas.',f:'Mapeamento dos fluxos principais, padrão de execução, papéis e pontos de controle, junto com a equipe.',e:'Processos documentados em linguagem simples, com responsáveis definidos.'},
    {n:'Indicadores e rotina de gestão',r:'Decisões no escuro e números que chegam tarde.',f:'Escolha de poucos indicadores, a fonte de cada número e uma rotina de reuniões com pauta.',e:'Painel simples de indicadores e calendário de rotina com pauta modelo.'},
    {n:'Planejamento e acompanhamento',r:'Planos que não saem do papel.',f:'Prioridades do período desdobradas em tarefas, prazos e responsáveis, com revisões periódicas.',e:'Plano de 90 dias e acompanhamento mensal até a rotina andar sozinha.'}
  ];
  $('fronts').innerHTML=FR.map((f,i)=>`<article class="mc-fr" id="fr${i+1}" data-reveal style="--d:${i}">
    <h3><span>${String(i+1).padStart(2,'0')}</span>${f.n}</h3>
    <dl><div><dt>Resolve</dt><dd>${f.r}</dd></div><div><dt>O que fazemos</dt><dd>${f.f}</dd></div><div><dt>Você recebe</dt><dd>${f.e}</dd></div></dl></article>`).join('');

  /* ---------- método ---------- */
  const STEPS=[
    {n:'Entender',o:'Enxergar a operação como ela é.',a:'Conversas com o dono e a equipe, visitas e leitura dos números existentes.',e:'Mapa da situação atual e principais gargalos.',p:'1 a 2 semanas'},
    {n:'Priorizar',o:'Escolher o que resolver primeiro.',a:'Definição conjunta das frentes de maior impacto.',e:'Plano em uma página, com prioridades e responsáveis.',p:'cerca de 1 semana'},
    {n:'Implantar',o:'Fazer o plano acontecer.',a:'Processos desenhados, papéis definidos e indicadores no ar, com a equipe.',e:'Processos documentados e rotina de gestão funcionando.',p:'4 a 8 semanas, conforme a frente'},
    {n:'Acompanhar',o:'Manter o que foi construído.',a:'Revisões periódicas para medir, corrigir e ajustar a rota.',e:'Ajustes, novas metas e autonomia da equipe.',p:'mensal, enquanto fizer sentido'}
  ];
  $('timeline').innerHTML=STEPS.map((s,i)=>`<li class="mc-ts" id="mt${i+1}" data-reveal style="--d:${i}"><span class="dot" aria-hidden="true">${i+1}</span>
    <h3><span class="vx-sr">Etapa ${i+1}: </span>${s.n}</h3><dl><div><dt>Objetivo</dt><dd>${s.o}</dd></div><div><dt>Ação</dt><dd>${s.a}</dd></div><div><dt>Entrega</dt><dd>${s.e}</dd></div><div class="pz"><dt>Prazo típico</dt><dd>${s.p}</dd></div></dl></li>`).join('');
  K.reveal&&K.reveal(d.querySelector('#frentes'));K.reveal&&K.reveal(d.querySelector('#metodo'));

  /* ---------- agenda ---------- */
  const DN=['dom','seg','ter','qua','qui','sex','sáb'],FULL=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
  const SLOTS=['09:00','09:30','10:30','11:00','14:00','15:00','16:30','17:00'];
  const days=[];const t=new Date();t.setHours(0,0,0,0);while(days.length<5){t.setDate(t.getDate()+1);if(t.getDay()%6)days.push(new Date(t))}
  const key=x=>`${x.getFullYear()}${x.getMonth()}${x.getDate()}`;
  let di=0,sl=null;const cd=$('calDays'),cs=$('calSlots'),pk=$('picked'),slot=$('slot');
  cd.innerHTML=days.map((x,i)=>`<button type="button" data-di="${i}" aria-pressed="${i===0}"><span>${DN[x.getDay()]}</span> <b>${x.getDate()}</b><i class="vx-sr">, ${FULL[x.getDay()]}</i></button>`).join('');
  function renderSlots(){const r=K.rng(+key(days[di]));cs.innerHTML=SLOTS.map(h=>{const busy=r()<.35;return `<button type="button" data-h="${h}" ${busy?'disabled aria-label="'+h+', indisponível"':''} aria-pressed="${sl===h&&!busy}">${h}</button>`}).join('')}
  function upd(){const x=days[di];if(sl){pk.className='mc-picked on';pk.textContent=`Horário escolhido: ${FULL[x.getDay()]}, ${String(x.getDate()).padStart(2,'0')}/${String(x.getMonth()+1).padStart(2,'0')}, às ${sl}.`;slot.value=pk.textContent}else{pk.className='mc-picked';pk.textContent='Nenhum horário escolhido.';slot.value=''}}
  cd.addEventListener('click',e=>{const b=e.target.closest('[data-di]');if(!b)return;di=+b.dataset.di;sl=null;cd.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderSlots();upd()});
  cs.addEventListener('click',e=>{const b=e.target.closest('[data-h]');if(!b||b.disabled)return;sl=b.dataset.h;cs.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));upd()});
  renderSlots();upd();
  const form=$('contact'),ok=$('ok');
  form.addEventListener('vx:submit',e=>{e.preventDefault();
    if(!sl){pk.className='mc-picked warn';pk.textContent='Escolha um dia e um horário antes de confirmar.';cs.querySelector('button:not(:disabled)')?.focus();return}
    const v=e.detail;$('okTxt').textContent=`${v.nome}, a conversa com a ${v.empresa} ficou marcada: ${slot.value.replace('Horário escolhido: ','')} Tema: ${v.desafio.toLowerCase()}. Nada foi enviado: em um site real, a confirmação chegaria por e-mail ou WhatsApp.`;
    form.hidden=true;ok.hidden=false;ok.focus()});
  $('again').addEventListener('click',()=>{form.reset();$('fromX').hidden=true;sl=null;renderSlots();upd();ok.hidden=true;form.hidden=false});

  /* cabeçalho */
  const hdr=$('hdr'),onS=()=>hdr.classList.toggle('scrolled',scrollY>8);addEventListener('scroll',onS,{passive:true});onS();
})();
