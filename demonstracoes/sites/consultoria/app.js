/* Marino Consultoria — serviços, método, depoimentos e agenda (dados fictícios) */
(function(){
  const d=document,K=window.VxKit;
  const SERVICES=[
    {n:'Diagnóstico de gestão',d:'Leitura completa da operação: processos, números, equipe e gargalos, com relatório e prioridades.',t:['2 a 4 semanas','Relatório']},
    {n:'Mapeamento de processos',d:'Desenho dos fluxos principais, responsáveis e pontos de controle, em linguagem que a equipe entende.',t:['Fluxogramas','Manuais']},
    {n:'Indicadores e painéis',d:'Definição de poucos indicadores que importam e uma rotina simples para acompanhar.',t:['KPIs','Rotina semanal']},
    {n:'Acompanhamento mensal',d:'Reuniões periódicas para manter o plano andando e ajustar a rota com o dono.',t:['Mentoria','Plano de ação']}
  ];
  const STEPS=[
    {n:'Entender',s:'Escuta e dados',d:'Começamos ouvindo o dono e a equipe e olhando os números que já existem. Nada de receita pronta.',in:'Entrevistas, visitas e levantamento de dados.',out:'Mapa da situação atual e principais gargalos.'},
    {n:'Priorizar',s:'O que vem primeiro',d:'Nem tudo precisa ser resolvido agora. Escolhemos juntos as três frentes com mais impacto.',in:'Mapa da situação e objetivos do negócio.',out:'Plano de ação com prioridades e responsáveis.'},
    {n:'Implantar',s:'Mão na massa',d:'Processos desenhados, rotinas criadas e indicadores no ar, junto com a equipe.',in:'Plano de ação aprovado.',out:'Processos documentados e painel de indicadores.'},
    {n:'Acompanhar',s:'Ajustar a rota',d:'Revisões periódicas para medir, corrigir e manter o que foi construído funcionando.',in:'Indicadores e feedback da equipe.',out:'Ajustes, novas metas e autonomia da equipe.'}
  ];
  const QUOTES=[
    {q:'Pela primeira vez a equipe sabe o que fazer sem depender de mim para cada decisão.',n:'Cláudia R.',r:'Sócia de clínica (fictícia)'},
    {q:'O diagnóstico mostrou em duas semanas o que a gente não enxergava havia anos.',n:'Paulo M.',r:'Diretor de distribuidora (fictícia)'},
    {q:'Saímos de planilhas soltas para uma reunião semanal com três números que importam.',n:'Renata S.',r:'Gestora de escola (fictícia)'}
  ];

  /* serviços */
  d.getElementById('services').innerHTML=SERVICES.map((s,i)=>`<article class="mc-svc" data-reveal style="--d:${i%2}"><span class="n">${String(i+1).padStart(2,'0')}</span><div><h3>${s.n}</h3><p>${s.d}</p><ul>${s.t.map(x=>`<li>${x}</li>`).join('')}</ul></div></article>`).join('');

  /* método */
  const tabs=d.getElementById('stepTabs'),panel=d.getElementById('stepPanel');
  tabs.innerHTML=STEPS.map((s,i)=>`<button role="tab" type="button" id="st${i}" aria-controls="stepPanel" aria-selected="${i===0}" tabindex="${i?-1:0}"><b>${i+1}</b><span>${s.n}</span></button>`).join('');
  function step(i){const s=STEPS[i];tabs.querySelectorAll('button').forEach((b,j)=>{b.setAttribute('aria-selected',j===i);b.tabIndex=j===i?0:-1});
    panel.setAttribute('aria-labelledby','st'+i);panel.classList.remove('swap');void panel.offsetWidth;panel.classList.add('swap');
    panel.innerHTML=`<p class="mc-eyebrow">Etapa ${i+1} de 4 · ${s.s}</p><h3>${s.n}</h3><p>${s.d}</p><div class="cols"><div><span>Entrada</span><p>${s.in}</p></div><div><span>Entrega</span><p>${s.out}</p></div></div><div class="bar"><i style="width:${(i+1)*25}%"></i></div>`}
  tabs.addEventListener('click',e=>{const b=e.target.closest('button');if(b)step([...tabs.children].indexOf(b))});
  tabs.addEventListener('keydown',e=>{const c=[...tabs.children].findIndex(b=>b.getAttribute('aria-selected')==='true');let n=c;
    if(e.key==='ArrowRight'||e.key==='ArrowDown')n=(c+1)%4;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')n=(c+3)%4;else return;e.preventDefault();step(n);tabs.children[n].focus()});
  step(0);

  /* depoimentos */
  let q=0;const qt=d.getElementById('quotes');
  function quote(){const x=QUOTES[q];qt.innerHTML=`<figure class="mc-quote"><blockquote>${x.q}</blockquote><figcaption><span class="av" aria-hidden="true">${x.n[0]}</span><span><b>${x.n}</b>${x.r}</span><span class="tag">Demonstrativo</span></figcaption></figure>`;d.getElementById('qPos').textContent=`${q+1} / ${QUOTES.length}`}
  d.getElementById('qPrev').addEventListener('click',()=>{q=(q+QUOTES.length-1)%QUOTES.length;quote()});
  d.getElementById('qNext').addEventListener('click',()=>{q=(q+1)%QUOTES.length;quote()});
  quote();

  /* agenda */
  const DN=['dom','seg','ter','qua','qui','sex','sáb'],FULL=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
  const SLOTS=['09:00','09:30','10:30','11:00','14:00','15:00','16:30','17:00'];
  const days=[];const t=new Date();t.setHours(0,0,0,0);while(days.length<5){t.setDate(t.getDate()+1);if(t.getDay()%6)days.push(new Date(t))}
  const key=x=>`${x.getFullYear()}${x.getMonth()}${x.getDate()}`;
  let di=0,sl=null;const cd=d.getElementById('calDays'),cs=d.getElementById('calSlots'),picked=d.getElementById('picked'),slot=d.getElementById('slot');
  cd.innerHTML=days.map((x,i)=>`<button type="button" data-di="${i}" aria-pressed="${i===0}" title="${FULL[x.getDay()]}, ${x.getDate()}"><span>${DN[x.getDay()]}</span><b>${x.getDate()}</b></button>`).join('');
  function renderSlots(){const r=K.rng(+key(days[di]));cs.innerHTML=SLOTS.map(h=>{const busy=r()<.35;return `<button type="button" data-h="${h}" ${busy?'disabled aria-label="'+h+' indisponível"':''} aria-pressed="${sl===h&&!busy}">${h}</button>`}).join('')}
  function upd(){const x=days[di];if(sl){picked.className='mc-picked on';picked.textContent=`Horário escolhido: ${FULL[x.getDay()]}, ${String(x.getDate()).padStart(2,'0')}/${String(x.getMonth()+1).padStart(2,'0')}, às ${sl}.`;slot.value=picked.textContent}else{picked.className='mc-picked';picked.textContent='Nenhum horário escolhido.';slot.value=''}}
  cd.addEventListener('click',e=>{const b=e.target.closest('[data-di]');if(!b)return;di=+b.dataset.di;sl=null;cd.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderSlots();upd()});
  cs.addEventListener('click',e=>{const b=e.target.closest('[data-h]');if(!b||b.disabled)return;sl=b.dataset.h;cs.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));upd()});
  renderSlots();upd();

  const form=d.getElementById('contact'),ok=d.getElementById('ok');
  form.addEventListener('vx:submit',e=>{e.preventDefault();
    if(!sl){picked.className='mc-picked warn';picked.textContent='Escolha um dia e um horário na agenda antes de confirmar.';cs.querySelector('button:not(:disabled)')?.focus();return}
    const v=e.detail;d.getElementById('okTxt').textContent=`${v.nome}, a conversa com a ${v.empresa} ficou marcada: ${slot.value.replace('Horário escolhido: ','')} Tema: ${v.desafio.toLowerCase()}. Em um site real, você receberia a confirmação por e-mail ou WhatsApp.`;
    form.hidden=true;ok.hidden=false;ok.focus()});
  d.getElementById('again').addEventListener('click',()=>{form.reset();sl=null;renderSlots();upd();ok.hidden=true;form.hidden=false});
})();
