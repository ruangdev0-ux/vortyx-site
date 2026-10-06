/* Manutenção — comparação antes × depois com controle deslizante e histórico de versões */
(function(){
  const d=document;
  const TOPICS=[
    {id:'resp',n:'Responsividade',v:'mob',lead:'No celular, o site antigo era só a versão de computador encolhida. O novo se reorganiza para a tela.',
      old:['Layout fixo de 960 px','Texto pequeno demais no celular','Botões difíceis de tocar'],nu:['Layout fluido para qualquer tela','Texto legível sem zoom','Botões com área de toque confortável'],
      m:[['Legibilidade no celular','ruim','boa',25,90],['Área de toque mínima','24 px','48 px',30,95]]},
    {id:'speed',n:'Velocidade',lead:'Imagens otimizadas, código enxuto e carregamento sob demanda deixam a página pronta mais cedo.',
      old:['Imagens de vários MB','Scripts que bloqueiam a página','Sem cache'],nu:['Imagens em WebP no tamanho certo','Scripts carregados depois','Cache configurado'],
      m:[['Tempo de carregamento','6,8 s','1,6 s',90,22],['Peso da página','5,2 MB','0,9 MB',88,18],['Nota de desempenho','38','92',38,92]]},
    {id:'org',n:'Organização',lead:'Menu enxuto, hierarquia clara e um caminho óbvio para o visitante agendar.',
      old:['Menu com 9 itens','Faixa piscando no topo','Informação importante escondida'],nu:['Menu com 4 itens + botão de ação','Título e chamada claros','Serviços em cartões'],
      m:[['Itens no menu','9','4',90,40],['Cliques até agendar','4','1',80,20]]},
    {id:'seo',n:'SEO',lead:'Título, descrição e estrutura corretos ajudam o buscador a entender e mostrar o site.',
      old:['Título da página: “Home”','Sem descrição','Sem dados estruturados'],nu:['Título com serviço e cidade','Descrição clara para o buscador','Dados estruturados de negócio local'],
      m:[['Nota de SEO','54','98',54,98],['Páginas com título único','20%','100%',20,100]]},
    {id:'a11y',n:'Acessibilidade',lead:'Contraste suficiente, textos alternativos e foco visível tornam o site usável por mais gente.',
      old:['Texto cinza claro sobre branco','Imagens sem texto alternativo','Foco do teclado invisível'],nu:['Contraste dentro das recomendações','Textos alternativos nas imagens','Foco visível em botões e links'],
      m:[['Contraste do texto','2,1:1','7,4:1',28,95],['Nota de acessibilidade','61','100',61,100]]},
    {id:'fix',n:'Correções',lead:'Links quebrados, imagens que não carregam e formulários com erro resolvidos.',
      old:['Link “Contato” levando a erro 404','Imagem quebrada na home','Formulário que não enviava'],nu:['Todos os links verificados','Imagens restauradas','Formulário testado e funcionando'],
      m:[['Links quebrados','7','0',70,0],['Erros no console','12','0',80,0]]},
    {id:'feat',n:'Novas funcionalidades',lead:'Manutenção também é evoluir: agenda online e botão de WhatsApp entraram na versão 2.0.',
      old:['Agendamento só por telefone','Sem atalho para conversar'],nu:['Agenda online com horários livres','Botão de WhatsApp em todas as páginas','Confirmação automática (exemplo)'],
      m:[['Canais de agendamento','1','3',33,100]]}
  ];
  const VERS=[
    {v:'1.0',dt:'mar/2024',t:'Lançamento',score:52,items:[['new','Site institucional com 5 páginas'],['new','Formulário de contato']]},
    {v:'1.1',dt:'jun/2024',t:'Ajustes de uso',score:68,items:[['fix','Link de contato corrigido'],['fix','Formulário voltou a enviar'],['imp','Primeiros ajustes para celular']]},
    {v:'1.2',dt:'out/2024',t:'Velocidade e SEO',score:84,items:[['imp','Imagens convertidas para WebP'],['imp','Títulos e descrições para buscadores'],['imp','Contraste e textos alternativos']]},
    {v:'2.0',dt:'fev/2025',t:'Nova versão',score:96,items:[['new','Novo layout responsivo'],['new','Agenda online'],['new','Botão de WhatsApp'],['imp','Menu reorganizado']]}
  ];
  const CANVAS={desk:[960,600],mob:[360,680]};
  const NAV_OLD=['Início','Quem Somos','Missão','Serviços','Fotos','Notícias','Links','Fale Conosco','Mapa do Site'];

  function page(isNew,mob){
    const nav=isNew?'<span>Serviços</span><span>Equipe</span><span>Contato</span><span class="cta">Agendar</span>':NAV_OLD.map(n=>`<span>${n}</span>`).join('');
    const seo=isNew?'<span class="q">fisioterapia cidade exemplo</span><small>bemviver.exemplo › fisioterapia</small><b>Clínica Bem Viver | Fisioterapia e pilates em Cidade Exemplo</b><p>Fisioterapia, pilates e reabilitação com agendamento online. Atendimento de segunda a sábado.</p>':'<span class="q">fisioterapia cidade exemplo</span><small>bemviver.exemplo › index.php?id=1</small><b>Home</b><p>Nenhuma descrição disponível para esta página.</p>';
    const fix=isNew?'✓ Página de contato funcionando':'Erro 404 · Página não encontrada';
    return `<div class="mk-x speed"><div class="bar"><i></i></div><span class="t">${isNew?'1,6 s':'6,8 s…'}</span></div>
      <div class="mk-top"><span class="mk-logo">${isNew?'Bem Viver':'CLÍNICA BEM VIVER'}</span><div class="mk-nav">${nav}</div></div>
      <div class="mk-marq">*** NOVIDADE!!! AGORA COM PILATES *** LIGUE JÁ *** NOVIDADE!!! ***</div>
      <div class="mk-hero"><div><div class="mk-h1">${isNew?'Movimento sem dor, no seu ritmo.':'Bem-vindo ao site da Clínica Bem Viver'}</div><p class="mk-p">${isNew?'Fisioterapia e pilates com acompanhamento individual. Agende sua avaliação.':'Clique nos links acima para navegar pelo nosso site. Melhor visualizado em 1024x768.'}</p><span class="mk-btn">${isNew?'Agendar avaliação':'Clique aqui'}</span></div><div class="mk-img">${isNew?'':'<span class="ph">foto_clinica_final2.jpg</span>'}</div></div>
      <div class="mk-cards"><div class="mk-card"><b>Fisioterapia</b>Reabilitação e alívio de dores.</div><div class="mk-card"><b>Pilates</b>Turmas reduzidas e aulas individuais.</div><div class="mk-card"><b>Avaliação</b>Plano de tratamento sob medida.</div></div>
      <div class="mk-foot">${isNew?'Clínica Bem Viver · clínica fictícia · Seg a sáb, 7h–20h':'© Clínica Bem Viver - Todos os direitos reservados - Visitas: 004521'}</div>
      <div class="mk-x seo">${seo}</div>
      <span class="mk-x a11y">${isNew?'Contraste 7,4:1 · alt ✓':'Contraste 2,1:1 · sem alt'}</span>
      <div class="mk-x fix">${fix}</div>
      <span class="mk-x feat wa"></span><div class="mk-x feat ag"><b>Agende online</b><div><span>08:00</span><span class="on">09:30</span><span>11:00</span><span>14:00</span></div></div>`;
  }

  const cmp=d.getElementById('cmp'),frame=d.getElementById('frame'),range=d.getElementById('range'),mkOld=d.getElementById('mkOld'),mkNew=d.getElementById('mkNew');
  let topic=TOPICS[0],view='desk';
  function fit(){const w=frame.clientWidth,h=frame.clientHeight;if(!w)return;const [cw,ch]=CANVAS[view];
    // versão antiga no celular: o site de computador inteiro encolhido (sem responsividade)
    const ow=view==='mob'?CANVAS.desk[0]:cw,os=w/ow;mkOld.style.width=ow+'px';mkOld.style.height=Math.ceil(h/os)+'px';mkOld.style.transform=`scale(${os})`;
    const ns=w/cw;mkNew.style.width=cw+'px';mkNew.style.height=Math.ceil(h/ns)+'px';mkNew.style.transform=`scale(${ns})`}
  function draw(){mkOld.innerHTML=page(false,view==='mob');mkNew.innerHTML=page(true,view==='mob');mkNew.classList.toggle('m',view==='mob');fit()}
  function setView(v){view=v;cmp.dataset.v=v;d.querySelectorAll('.mt-view button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===v));draw()}
  function setTopic(t){topic=t;cmp.dataset.t=t.id;
    d.querySelectorAll('#topics button').forEach(b=>{const on=b.dataset.t===t.id;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1});
    d.getElementById('lead').textContent=t.lead;
    d.getElementById('listOld').innerHTML=t.old.map(x=>`<li>${x}</li>`).join('');
    d.getElementById('listNew').innerHTML=t.nu.map(x=>`<li>${x}</li>`).join('');
    d.getElementById('metrics').innerHTML=t.m.map(([n,a,b,pa,pb])=>`<div class="mt-met"><span>${n}</span><b><s>${a}</s> → <em>${b}</em></b><i style="--a:${pa}%;--b:${pb}%"></i></div>`).join('');
    if(t.v&&t.v!==view)setView(t.v);else draw()}

  const tabs=d.getElementById('topics');
  tabs.innerHTML=TOPICS.map(t=>`<button type="button" role="tab" data-t="${t.id}" aria-controls="cmp">${t.n}</button>`).join('');
  tabs.addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(b)setTopic(TOPICS.find(t=>t.id===b.dataset.t))});
  tabs.addEventListener('keydown',e=>{const i=TOPICS.indexOf(topic);let n=i;if(e.key==='ArrowRight')n=(i+1)%TOPICS.length;else if(e.key==='ArrowLeft')n=(i+TOPICS.length-1)%TOPICS.length;else return;e.preventDefault();setTopic(TOPICS[n]);tabs.children[n].focus();tabs.children[n].scrollIntoView({block:'nearest',inline:'nearest'})});
  d.querySelector('.mt-view').addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b)setView(b.dataset.v)});
  const setP=v=>{frame.style.setProperty('--p',v+'%');range.setAttribute('aria-valuetext',`${v}% mostrando o depois`)};
  range.addEventListener('input',()=>setP(range.value));
  // arrastar em qualquer ponto do quadro (o input cobre a área; no toque, deixamos a rolagem vertical livre)
  let drag=false;const fromX=x=>{const r=frame.getBoundingClientRect();const v=Math.round(Math.max(0,Math.min(100,(x-r.left)/r.width*100)));range.value=v;setP(v)};
  frame.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;drag=true;fromX(e.clientX)});
  frame.addEventListener('pointermove',e=>{if(drag)fromX(e.clientX)});
  addEventListener('pointerup',()=>drag=false);
  if('ResizeObserver' in window)new ResizeObserver(fit).observe(frame);else addEventListener('resize',fit);

  /* histórico */
  const tl=d.getElementById('tl'),ver=d.getElementById('ver');
  tl.innerHTML=VERS.map((v,i)=>`<li role="presentation"><button type="button" role="tab" data-i="${i}" aria-selected="false"><b>v${v.v}</b><span>${v.t}</span></button></li>`).join('');
  const TAG={new:['t-new','novo'],fix:['t-fix','correção'],imp:['t-imp','melhoria']};
  function showVer(i){const v=VERS[i];tl.querySelectorAll('button').forEach((b,j)=>{b.setAttribute('aria-selected',j===i);b.tabIndex=j===i?0:-1});
    ver.style.animation='none';void ver.offsetWidth;ver.style.animation='';
    ver.innerHTML=`<div><h3>v${v.v} · ${v.t}</h3><p class="dt">${v.dt} (data fictícia)</p><ul>${v.items.map(([t,x])=>`<li><span class="${TAG[t][0]}">${TAG[t][1]}</span>${x}</li>`).join('')}</ul></div><div class="mt-score"><small>Saúde geral do site</small><b>${v.score}</b><i style="--w:${v.score}%"></i><small>nota ilustrativa de 0 a 100</small></div>`}
  tl.addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(b)showVer(+b.dataset.i)});
  tl.addEventListener('keydown',e=>{const c=[...tl.querySelectorAll('button')].findIndex(b=>b.getAttribute('aria-selected')==='true');let n=c;if(e.key==='ArrowRight')n=Math.min(3,c+1);else if(e.key==='ArrowLeft')n=Math.max(0,c-1);else return;e.preventDefault();showVer(n);tl.querySelectorAll('button')[n].focus()});

  setP(50);setTopic(TOPICS[0]);showVer(3);
})();
