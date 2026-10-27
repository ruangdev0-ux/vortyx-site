/* =========================================================
   Ordena · Central de Atendimento — SaaS demonstrativo (Vortyx)
   Tudo roda no navegador: a "IA" é uma classificação simulada por
   sinais (palavras e expressões). Empresa, pessoas e mensagens são fictícias.
   ========================================================= */
(function(){
  const d=document,K=window.VxKit,$=id=>d.getElementById(id);
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const MIN=60000,KEY='ordena:v1';

  /* ---------- Cadastros fixos ---------- */
  const TEAM=[{id:'bruna',name:'Bruna Lima',role:'Atendente'},{id:'diego',name:'Diego Rocha',role:'Atendente'},{id:'ana',name:'Ana Souza',role:'Atendente'},{id:'carlos',name:'Carlos Prado',role:'Supervisor'}];
  const PROFILES={atendente:{user:'bruna',label:'Atendente'},supervisor:{user:'carlos',label:'Supervisor'}};
  const CH={whatsapp:'WhatsApp',instagram:'Instagram',email:'E-mail',site:'Formulário do site'};
  const CATS={
    agendamento:{label:'Agendamento',color:'#19E3D6',base:1,signals:['agendar','marcar','horario','consulta','disponivel','vaga','remarcar','encaixe','agenda','atendimento para']},
    orcamento:{label:'Orçamento',color:'#9C8DFF',base:0,signals:['valor','preco','quanto custa','orcamento','custa','tabela','particular','quanto fica']},
    duvida:{label:'Dúvida',color:'#5B8CFF',base:0,signals:['duvida','como funciona','preciso levar','jejum','endereco','estacionamento','aceita','como faco','qual o horario','funciona aos','preparo']},
    reclamacao:{label:'Reclamação',color:'#FF5C7A',base:2,signals:['demora','absurdo','pessimo','reclamacao','insatisfeit','ninguem responde','atrasou','atraso','errado','descaso','esperando ha']},
    financeiro:{label:'Financeiro',color:'#FFC24B',base:1,signals:['boleto','pagamento','nota fiscal','reembolso','cobranca','pix','segunda via','fatura','recibo','cobrado']}
  };
  const URGENT=['urgente','hoje','agora','dor ','dor.','febre','o quanto antes','emergencia','ainda hoje','rapido'];
  const NEG=['nao consigo','problema','chatead','absurdo','pessimo','demora','descaso','insatisfeit','errado','ninguem responde','reclamacao'];
  const POS=['obrigad','otimo','adorei','parabens','perfeito','maravilh'];
  const SERVICES=['dermatologia','cardiologia','pediatria','ginecologia','ortopedia','check-up','exame de sangue','ultrassom','retorno','nutricao'];
  const PRIO={alta:{label:'Alta',sla:30},media:{label:'Média',sla:120},baixa:{label:'Baixa',sla:480}};
  const TPL_DEF={
    agendamento:'Olá, {nome}! Tudo bem? Temos horários para {servico} {data}. Posso confirmar um deles para você?',
    orcamento:'Olá, {nome}! Obrigado pelo contato. O valor de {servico} depende do tipo de atendimento. Posso te enviar a tabela atualizada?',
    duvida:'Olá, {nome}! Claro, posso ajudar. Sobre {servico}: vou te passar as orientações principais por aqui.',
    reclamacao:'Olá, {nome}. Sentimos muito pelo transtorno. Já estou verificando o que aconteceu e retorno com uma solução ainda hoje.',
    financeiro:'Olá, {nome}! Vou verificar a sua solicitação no financeiro e te envio a resposta por aqui.',
    outros:'Olá, {nome}! Recebemos a sua mensagem. Pode me contar um pouco mais para eu direcionar ao setor certo?'
  };

  /* ---------- Classificação simulada ---------- */
  function classify(text,disabled){
    const t=' '+norm(text)+' ';const scores={},sig={};
    for(const k in CATS){if(disabled&&disabled.includes(k))continue;let hits=CATS[k].signals.filter(w=>t.includes(w));hits=hits.filter(w=>!hits.some(x=>x!==w&&x.includes(w)));if(hits.length){scores[k]=hits.length;sig[k]=hits}}
    const ranked=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
    const cat=ranked.length?ranked[0][0]:'outros';
    const total=ranked.reduce((a,b)=>a+b[1],0),top=ranked.length?ranked[0][1]:0;
    let conf=ranked.length?Math.round(55+42*(top/total)*Math.min(1,.55+top*.2)):38;
    const urg=URGENT.filter(w=>t.includes(w)),neg=NEG.filter(w=>t.includes(w)),pos=POS.filter(w=>t.includes(w));
    const sentiment=neg.length>pos.length?'negativo':pos.length>neg.length?'positivo':'neutro';
    const p=(CATS[cat]?CATS[cat].base:0)+(urg.length?2:0)+(sentiment==='negativo'?1:0);
    const prio=p>=3?'alta':p>=1?'media':'baixa';
    const svc=SERVICES.find(s=>t.includes(norm(s)))||'';
    const dm=text.match(/\b(\d{1,2}\/\d{1,2})\b/);const dw=t.match(/\b(hoje|amanha|segunda|terca|quarta|quinta|sexta|sabado|semana que vem|essa semana|esta semana)\b/);
    const per=t.match(/\b(de manha|pela manha|a tarde|de tarde|a noite)\b/);
    const date=dm?dm[1]:dw?({amanha:'amanhã',terca:'terça',sabado:'sábado'}[dw[1]]||dw[1]):'';
    const phone=(text.match(/\(?\d{2}\)?\s?9?\d{4}-?\d{4}/)||[''])[0];
    const nm=text.match(/meu nome (?:é|e) ([A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wáéíóúâêôãõç]+(?: [A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wáéíóúâêôãõç]+)?)/);
    const review=cat==='outros'||conf<62;
    return {cat,conf:Math.min(97,conf),prio,sentiment,review,signals:sig[cat]||[],urgency:urg.map(s=>s.trim().replace(/\.$/,'')),
      data:{nome:nm?nm[1]:'',servico:svc,data:[date,per?{'de manha':'de manhã','pela manha':'de manhã','a tarde':'à tarde','de tarde':'à tarde','a noite':'à noite'}[per[1]]:''].filter(Boolean).join(' · '),telefone:phone}};
  }

  /* ---------- Dados de exemplo ---------- */
  const SEED=[
    ['Mariana Alves','whatsapp','Oi! Queria agendar uma consulta de dermatologia para semana que vem, de preferência à tarde.',4,'aberta',''],
    ['Rogério Tavares','email','Boa tarde. Estou esperando há 40 minutos na recepção e ninguém responde. Isso é um descaso, atrasou demais.',7,'aberta','diego'],
    ['Paula Mendes','instagram','Quanto custa o check-up completo particular?',12,'aberta',''],
    ['Henrique Sales','whatsapp','Preciso da segunda via do boleto de outubro, por favor.',18,'atendimento','bruna'],
    ['Luiza Prado','site','Meu filho está com febre desde ontem. Tem encaixe com pediatria ainda hoje?',21,'aberta',''],
    ['Tatiane Rocha','whatsapp','O exame de sangue precisa de jejum? Quantas horas?',26,'atendimento','ana'],
    ['Fábio Nunes','email','Gostaria de remarcar o meu retorno de cardiologia para quinta de manhã.',33,'aberta','bruna'],
    ['Camila Duarte','instagram','Vocês aceitam pagamento por pix? E emitem nota fiscal?',41,'aberta',''],
    ['Sérgio Lopes','site','Fui cobrado duas vezes na mesma consulta. Preciso de reembolso urgente.',47,'aberta','diego'],
    ['Renata Campos','whatsapp','Tem estacionamento no endereço novo?',55,'resolvida','ana'],
    ['Igor Martins','whatsapp','Quero marcar ultrassom para 12/11, tem vaga?',63,'atendimento','bruna'],
    ['Beatriz Lima','email','Olá, meu nome é Beatriz Lima. Qual o preço da consulta de ginecologia particular?',72,'aberta',''],
    ['Otávio Ramos','instagram','Parabéns pelo atendimento de ontem, a equipe foi ótima! Obrigado.',85,'resolvida','diego'],
    ['Aline Teixeira','whatsapp','Como funciona o preparo para o ultrassom abdominal?',96,'atendimento','ana'],
    ['Gustavo Freitas','site','Preciso agendar ortopedia, estou com dor no joelho. O quanto antes.',110,'aberta',''],
    ['Juliana Reis','email','Não recebi o recibo do pagamento feito na semana passada.',124,'aberta','bruna'],
    ['Marcos Vieira','whatsapp','Oi, vocês funcionam aos sábados?',140,'resolvida','bruna'],
    ['Sabrina Costa','instagram','Quanto fica a consulta de nutrição? Tem pacote?',158,'aberta',''],
    ['Leandro Pires','whatsapp','Já é a terceira vez que remarcam meu exame. Péssimo.',176,'atendimento','diego'],
    ['Carolina Mota','site','Gostaria de marcar check-up para amanhã de manhã.',195,'aberta','ana'],
    ['Eduardo Brito','email','Bom dia, segue o pedido médico em anexo. Quando consigo agendar?',230,'aberta',''],
    ['Natália Gomes','whatsapp','Obrigada! Deu tudo certo com o agendamento.',260,'resolvida','ana'],
    ['Vinícius Souza','instagram','Oi, tudo bem?',290,'aberta',''],
    ['Patrícia Ramos','email','A fatura veio com valor errado, preciso de ajuda com a cobrança.',330,'aberta','diego']
  ];
  const POOL=[
    ['Débora Fontes','whatsapp','Oi! Tem horário para pediatria amanhã à tarde?'],
    ['Ricardo Lemos','email','Estou insatisfeito, a consulta atrasou mais de uma hora e ninguém explicou nada.'],
    ['Lívia Andrade','instagram','Qual o valor do ultrassom particular?'],
    ['André Moura','site','Preciso da nota fiscal da consulta de setembro para o reembolso do plano.'],
    ['Helena Barros','whatsapp','O exame de sangue precisa de preparo? Posso tomar café antes?'],
    ['Tiago Rezende','whatsapp','Urgente: estou com dor forte e queria um encaixe ainda hoje com ortopedia.'],
    ['Fernanda Luz','email','Gostaria de remarcar minha consulta de dermatologia para 20/11.'],
    ['Caio Ribeiro','instagram','Vocês têm estacionamento? E qual o endereço?'],
    ['Mônica Prates','site','Fui cobrada no pix e o pagamento não aparece. Podem verificar?'],
    ['Rafael Dias','whatsapp','Bom dia! Queria saber se vocês atendem cardiologia.']
  ];
  const ANSWERS={duvida:'Olá! Sim, posso te ajudar com isso. Vou te passar as orientações por aqui.',agendamento:'Olá! Temos horário disponível. Posso confirmar para você?',financeiro:'Olá! Vou verificar com o financeiro e já te retorno.',reclamacao:'Sentimos muito. Já estamos verificando com a equipe.',orcamento:'Olá! Vou te enviar a tabela de valores.',outros:'Olá! Como posso ajudar?'};
  function seed(){
    const now=Date.now();let id=1;
    const convs=SEED.map(([name,ch,text,ago,status,owner])=>{
      const t=now-ago*MIN,ai=classify(text);
      const c={id:'c'+(id++),contact:name,channel:ch,created:t,status,owner,ai,msgs:[{from:'c',text,t}],first:null};
      if(status!=='aberta'){const rt=t+Math.round((3+ago%11)*MIN*.9);c.first=Math.min(rt,now-MIN);c.msgs.push({from:'a',who:owner||'bruna',text:ANSWERS[ai.cat]||ANSWERS.outros,t:c.first})}
      return c});
    return {v:1,at:now,convs,pool:0,next:id,tpl:{...TPL_DEF},disabled:[],rule:'rodizio',online:{bruna:true,diego:true,ana:true,carlos:true},rr:0};
  }
  let S=K.store(KEY,null);
  if(!S||S.v!==1||Date.now()-S.at>12*3600*1000){S=seed();K.save(KEY,S)}
  const save=()=>K.save(KEY,S);

  /* ---------- Estado da interface ---------- */
  let profile=null,view='inbox',sel=null,mobileOpen=false;
  const me=()=>profile?PROFILES[profile].user:'';
  const isSup=()=>profile==='supervisor';
  const teamName=id=>(TEAM.find(x=>x.id===id)||{}).name||'Sem responsável';
  const initials=n=>n.split(' ').map(x=>x[0]).slice(0,2).join('');
  const ago=t=>{const m=Math.max(0,Math.round((Date.now()-t)/MIN));return m<1?'agora':m<60?`há ${m} min`:`há ${Math.floor(m/60)} h${m%60?' '+(m%60)+' min':''}`};
  const hhmm=t=>new Date(t).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  const catLabel=k=>(CATS[k]||{label:'Outros'}).label;
  const catColor=k=>(CATS[k]||{color:'#8B92AE'}).color;
  function sla(c){
    if(c.status==='resolvida'||c.first)return null;
    const left=Math.round((c.created+PRIO[c.ai.prio].sla*MIN-Date.now())/MIN);
    return {left,late:left<0};
  }

  /* ---------- Login / perfis ---------- */
  d.querySelectorAll('[data-profile]').forEach(b=>b.addEventListener('click',()=>enter(b.dataset.profile)));
  function enter(p){
    profile=p;$('login').hidden=true;$('app').hidden=false;
    const u=TEAM.find(x=>x.id===me());
    $('me').innerHTML=`<span class="od-av ${isSup()?'sup':''}" aria-hidden="true">${initials(u.name)}</span><span><b>${esc(u.name)}</b><small>${PROFILES[p].label}</small></span>`;
    $('navConfig').hidden=!isSup();
    $('fOw').innerHTML=(isSup()?'<option value="">Toda a equipe</option>':'<option value="fila">Minhas e sem responsável</option><option value="">Toda a equipe</option>')+
      `<option value="${me()}">Somente minhas</option><option value="sem">Sem responsável</option>`+(isSup()?TEAM.filter(x=>x.role==='Atendente').map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join(''):'');
    sel=null;mobileOpen=false;go('inbox');
    K.toast(`<b>Perfil ${PROFILES[p].label}</b> · ${isSup()?'acesso a toda a equipe, painel e configurações.':'você vê a sua fila e as conversas sem responsável.'}`);
    $('app').scrollIntoView({block:'start',behavior:K.reduce?'auto':'smooth'});
  }
  $('switch').addEventListener('click',()=>{profile=null;$('app').hidden=true;$('login').hidden=false;$('login').querySelector('.od-prof').focus()});

  /* ---------- Navegação entre telas ---------- */
  const navBtns=[...$('nav').querySelectorAll('button')];
  navBtns.forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));
  function go(v){
    if(v==='config'&&!isSup())v='inbox';view=v;
    navBtns.forEach(b=>b.dataset.view===v?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current'));
    $('vInbox').hidden=v!=='inbox';$('vPanel').hidden=v!=='panel';$('vConfig').hidden=v!=='config';
    if(v==='inbox')renderInbox();else if(v==='panel')renderPanel();else renderConfig();
  }

  /* ---------- Filtros ---------- */
  $('fCh').insertAdjacentHTML('beforeend',Object.entries(CH).map(([k,v])=>`<option value="${k}">${v}</option>`).join(''));
  $('fCat').insertAdjacentHTML('beforeend',Object.entries(CATS).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')+'<option value="outros">Outros / revisão</option>');
  ['q','fCh','fCat','fPr','fSt','fOw'].forEach(id=>$(id).addEventListener(id==='q'?'input':'change',()=>renderList()));
  function visible(){
    const q=norm($('q').value),ch=$('fCh').value,cat=$('fCat').value,pr=$('fPr').value,st=$('fSt').value,ow=$('fOw').value;
    return S.convs.filter(c=>(!q||norm(c.contact+' '+c.msgs.map(m=>m.text).join(' ')).includes(q))&&(!ch||c.channel===ch)&&(!cat||c.ai.cat===cat)&&(!pr||c.ai.prio===pr)
      &&(st==='abertas'?c.status!=='resolvida':!st||c.status===st)
      &&(!ow||(ow==='fila'?(c.owner===me()||!c.owner):ow==='sem'?!c.owner:c.owner===ow)))
      .sort((a,b)=>{const P={alta:0,media:1,baixa:2};const ra=a.status==='resolvida',rb=b.status==='resolvida';if(ra!==rb)return ra?1:-1;
        const sa=sla(a),sb=sla(b);if(!!(sa&&sa.late)!==!!(sb&&sb.late))return sa&&sa.late?-1:1;if(P[a.ai.prio]!==P[b.ai.prio])return P[a.ai.prio]-P[b.ai.prio];return b.created-a.created});
  }

  /* ---------- Caixa de entrada ---------- */
  function renderInbox(){renderList();renderConv();$('inbox').classList.toggle('m-open',mobileOpen)}
  function renderList(){
    const list=visible();
    const open=S.convs.filter(c=>c.status!=='resolvida'&&(isSup()||c.owner===me()||!c.owner)).length;
    $('navCount').textContent=open;
    $('lcount').textContent=`${list.length} conversa${list.length===1?'':'s'} · ordenadas por prazo e prioridade`;
    $('items').innerHTML=list.map(c=>{const s=sla(c),last=c.msgs[c.msgs.length-1];
      return `<li><button type="button" class="od-item ${c.id===sel?'on':''} ${c.status==='resolvida'?'done':''}" data-id="${c.id}" ${c.id===sel?'aria-current="true"':''}>
        <span class="od-i1"><span class="od-ch ch-${c.channel}">${CH[c.channel]}</span><span class="od-time">${ago(c.created)}</span></span>
        <span class="od-i2"><b>${esc(c.contact)}</b>${c.owner?`<span class="od-mini" title="${esc(teamName(c.owner))}">${initials(teamName(c.owner))}</span>`:'<span class="od-mini sem">—</span>'}</span>
        <span class="od-prev">${last.from==='a'?'<em>Você:</em> ':''}${esc(last.text)}</span>
        <span class="od-i3"><span class="tag" style="color:${catColor(c.ai.cat)};background:${catColor(c.ai.cat)}1a">${catLabel(c.ai.cat)}</span><span class="od-pr pr-${c.ai.prio}">${PRIO[c.ai.prio].label}</span>
          ${c.status==='resolvida'?'<span class="tag ok">Resolvida</span>':s?`<span class="od-sla ${s.late?'late':''}">${s.late?`Prazo estourado · ${-s.left} min`:`Responder em ${s.left} min`}</span>`:'<span class="tag info">Em atendimento</span>'}</span>
      </button></li>`}).join('')||'<li class="od-empty">Nenhuma conversa com esses filtros.</li>';
  }
  $('items').addEventListener('click',e=>{const b=e.target.closest('.od-item');if(!b)return;sel=b.dataset.id;mobileOpen=true;renderInbox();
    const c=$('conv');if(innerWidth<900){c.scrollIntoView({block:'start',behavior:K.reduce?'auto':'smooth'});}c.querySelector('h2').focus({preventScroll:innerWidth>=900})});

  function renderConv(){
    const c=S.convs.find(x=>x.id===sel);
    if(!c){$('conv').innerHTML=`<div class="od-blank"><h2 tabindex="-1">Selecione uma conversa</h2><p class="muted">A IA já classificou cada mensagem que chegou. Abra uma conversa para ver a análise e a resposta sugerida.</p></div>`;
      $('ai').innerHTML=`<div class="od-blank sm"><p class="muted">A análise da IA aparece aqui.</p></div>`;return}
    const canEdit=isSup()||c.owner===me()||!c.owner;
    const owners=TEAM.filter(x=>x.role==='Atendente');
    $('conv').innerHTML=`<div class="od-ch-h">
        <button class="btn btn-g btn-s od-back" type="button" id="back">← Conversas</button>
        <div class="od-who"><h2 tabindex="-1">${esc(c.contact)}</h2><small><span class="od-ch ch-${c.channel}">${CH[c.channel]}</span> · recebida às ${hhmm(c.created)}</small></div>
        <div class="od-ctl">
          <label class="field">Status<select class="select" id="cSt" ${canEdit?'':'disabled'}><option value="aberta">Nova</option><option value="atendimento">Em atendimento</option><option value="resolvida">Resolvida</option></select></label>
          <label class="field">Responsável<select class="select" id="cOw" ${isSup()?'':'disabled'}><option value="">Sem responsável</option>${owners.map(o=>`<option value="${o.id}">${esc(o.name)}</option>`).join('')}</select></label>
          ${!isSup()&&c.owner!==me()?`<button class="btn btn-g btn-s" type="button" id="take">Assumir conversa</button>`:''}
        </div></div>
      <ol class="od-thread" id="thread" aria-label="Mensagens">${c.msgs.map(m=>`<li class="od-msg ${m.from==='a'?'out':'in'}"><p>${esc(m.text)}</p><small>${m.from==='a'?esc(teamName(m.who))+' · ':''}${hhmm(m.t)}${m.sim?' · envio simulado':''}</small></li>`).join('')}</ol>
      <form class="od-reply" id="reply">
        <label class="field" for="replyTxt">Resposta${c.ai.review?' · <span class="od-warn">IA pediu revisão humana</span>':''}</label>
        <textarea class="textarea" id="replyTxt" rows="3" ${canEdit?'':'disabled'} placeholder="Escreva ou use a sugestão da IA"></textarea>
        <div class="od-ract"><button class="btn btn-g btn-s" type="button" id="useSug" ${canEdit?'':'disabled'}>Usar sugestão da IA</button><label class="od-chk"><input type="checkbox" id="resolve"> Marcar como resolvida</label><button class="btn btn-p btn-s" type="submit" ${canEdit?'':'disabled'}>Enviar (simulado)</button></div>
        ${canEdit?'':'<p class="muted od-help">Esta conversa é de outro atendente. Perfis de Atendente só respondem as próprias conversas e as sem responsável.</p>'}
      </form>`;
    $('cSt').value=c.status;$('cOw').value=c.owner||'';
    const th=$('thread');th.scrollTop=th.scrollHeight;
    $('back').addEventListener('click',()=>{mobileOpen=false;renderInbox();const b=d.querySelector(`.od-item[data-id="${c.id}"]`);if(b){b.scrollIntoView({block:'center'});b.focus({preventScroll:true})}});
    $('cSt').addEventListener('change',e=>{c.status=e.target.value;if(c.status!=='aberta'&&!c.owner)c.owner=me()==='carlos'?'':me();save();renderList();renderAi(c);K.toast(`Status: <b>${e.target.selectedOptions[0].text}</b>`)});
    $('cOw').addEventListener('change',e=>{c.owner=e.target.value;save();renderList();K.toast(`Conversa atribuída a <b>${esc(teamName(c.owner))}</b>`)});
    const tk=$('take');if(tk)tk.addEventListener('click',()=>{c.owner=me();if(c.status==='aberta')c.status='atendimento';save();renderInbox();K.toast('Conversa <b>assumida</b> por você.')});
    $('useSug').addEventListener('click',()=>{$('replyTxt').value=suggest(c);$('replyTxt').focus()});
    $('reply').addEventListener('submit',e=>{e.preventDefault();const txt=$('replyTxt').value.trim();if(!txt){$('replyTxt').setAttribute('aria-invalid','true');$('replyTxt').focus();K.toast('Escreva uma resposta ou use a sugestão da IA.');return}
      const now=Date.now();c.msgs.push({from:'a',who:me(),text:txt,t:now,sim:true});if(!c.first)c.first=now;if(!c.owner&&!isSup())c.owner=me();
      c.status=$('resolve').checked?'resolvida':'atendimento';save();renderInbox();K.toast('<b>Simulação:</b> resposta registrada. Nada foi enviado de verdade.')});
    renderAi(c);
  }
  function fill(tpl,c){const x=c.ai.data,first=(x.nome||c.contact).split(' ')[0];
    return tpl.replace('{nome}',first).replace('{servico}',x.servico||'o atendimento').replace('{data}',x.data?'para '+x.data:'nos próximos dias').replace(/\s+([.,?!])/g,'$1')}
  const suggest=c=>fill(S.tpl[c.ai.cat]||S.tpl.outros||TPL_DEF.outros,c);
  function renderAi(c){
    const a=c.ai,x=a.data,s=sla(c);
    const json={categoria:a.cat,prioridade:a.prio,sentimento:a.sentiment,confianca:a.conf/100,revisao_humana:a.review,dados_extraidos:{nome:x.nome||c.contact,servico:x.servico||null,data_pretendida:x.data||null,telefone:x.telefone||null},sinais:a.signals,urgencia:a.urgency};
    $('ai').innerHTML=`<div class="panel-h">Análise da IA <small>simulação</small></div>
      <div class="panel-b od-aib">
        <div class="od-ai-cat"><span class="od-dot" style="background:${catColor(a.cat)}"></span><div><small>Categoria</small><b>${a.cat==='outros'?'Outros · revisão humana':catLabel(a.cat)}</b></div></div>
        <div class="od-conf"><div class="od-conf-l"><small>Confiança</small><b>${a.conf}%</b></div><span class="od-meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${a.conf}" aria-label="Confiança da classificação"><i style="width:${a.conf}%"></i></span></div>
        <dl class="od-facts">
          <div><dt>Prioridade</dt><dd><span class="od-pr pr-${a.prio}">${PRIO[a.prio].label}</span> <span class="muted">· prazo de ${PRIO[a.prio].sla} min</span></dd></div>
          <div><dt>Sentimento</dt><dd>${a.sentiment}</dd></div>
          <div><dt>Prazo</dt><dd>${c.status==='resolvida'?'resolvida':s?(s.late?`<span class="od-sla late">estourado há ${-s.left} min</span>`:`${s.left} min para responder`):'primeira resposta enviada'}</dd></div>
        </dl>
        <h3>Dados extraídos</h3>
        <dl class="od-facts">
          <div><dt>Nome</dt><dd>${esc(x.nome||c.contact)}</dd></div>
          <div><dt>Serviço</dt><dd>${x.servico?esc(x.servico):'<span class="muted">não informado</span>'}</dd></div>
          <div><dt>Data pretendida</dt><dd>${x.data?esc(x.data):'<span class="muted">não informada</span>'}</dd></div>
        </dl>
        <h3>Por que a IA decidiu assim</h3>
        <p class="od-sig">${a.signals.length?a.signals.map(w=>`<span class="tag iris">“${esc(w)}”</span>`).join(' '):'<span class="muted">Nenhum sinal forte encontrado. A conversa vai para revisão humana.</span>'}${a.urgency.length?` ${a.urgency.map(w=>`<span class="tag bad">urgência: “${esc(w)}”</span>`).join(' ')}`:''}</p>
        <h3>Resposta sugerida</h3>
        <p class="od-sug">${esc(suggest(c))}</p>
        <details class="od-prod"><summary>Como funcionaria em produção</summary>
          <ol class="od-flow"><li>Mensagem chega pela API do canal (WhatsApp, Instagram, e-mail ou site)</li><li>Serviço de IA classifica e extrai os dados</li><li>Regras definem prioridade, prazo e responsável</li><li>A conversa entra na caixa de entrada</li><li>Os indicadores são atualizados no painel</li></ol>
          <p class="muted od-help">Resultado desta classificação em formato de dados (JSON):</p>
          <pre class="od-json" tabindex="0" aria-label="Classificação em formato JSON">${esc(JSON.stringify(json,null,2))}</pre>
        </details>
      </div>`;
  }

  /* ---------- Nova mensagem simulada ---------- */
  $('simulate').addEventListener('click',()=>{
    const [name,ch,text]=POOL[S.pool%POOL.length];S.pool++;
    const ai=classify(text,S.disabled);let owner='';
    if(S.rule==='rodizio'){const on=TEAM.filter(x=>x.role==='Atendente'&&S.online[x.id]);if(on.length){owner=on[S.rr%on.length].id;S.rr++}}
    const c={id:'c'+(S.next++),contact:name,channel:ch,created:Date.now(),status:'aberta',owner,ai,msgs:[{from:'c',text,t:Date.now()}],first:null,fresh:true};
    S.convs.unshift(c);save();
    const btn=$('simulate');btn.disabled=true;btn.textContent='Classificando…';
    setTimeout(()=>{btn.disabled=false;btn.textContent='+ Simular nova mensagem';
      if(view!=='inbox')go(view);else{$('fSt').value='abertas';renderList();const b=d.querySelector(`.od-item[data-id="${c.id}"]`);if(b){b.classList.add('new');}}
      K.toast(`<b>Nova mensagem · ${CH[ch]}</b><br>${esc(name)}: classificada como <b>${ai.cat==='outros'?'Outros (revisão)':catLabel(ai.cat)}</b>, prioridade ${PRIO[ai.prio].label.toLowerCase()}, ${ai.conf}% de confiança${owner?` · atribuída a ${esc(teamName(owner))}`:''}.`,4800)},K.reduce?0:650);
  });

  /* ---------- Painel ---------- */
  function renderPanel(){
    const mine=c=>isSup()||c.owner===me();
    const scope=S.convs.filter(mine);
    const open=scope.filter(c=>c.status!=='resolvida').length,done=scope.filter(c=>c.status==='resolvida').length;
    const fr=scope.filter(c=>c.first).map(c=>(c.first-c.created)/MIN);const avg=fr.length?Math.round(fr.reduce((a,b)=>a+b,0)/fr.length):0;
    const late=scope.filter(c=>{const s=sla(c);return s&&s.late}).length;
    const rev=scope.filter(c=>c.ai.review&&c.status!=='resolvida').length;
    $('kpis').innerHTML=[['Em aberto',open,isSup()?'toda a equipe':'suas conversas'],['1ª resposta média',avg+' min','nas conversas respondidas'],['Resolvidas',done,'no período'],['Prazo estourado',late,late?'precisam de atenção':'tudo no prazo',late?'bad':''],['Revisão humana',rev,'IA com pouca certeza']]
      .map(([l,v,s,c])=>`<div class="od-kpi ${c||''}"><span>${l}</span><b>${v}</b><small>${s}</small></div>`).join('');
    const chs=Object.keys(CH);VxCharts.bars($('chCh'),{labels:chs.map(k=>CH[k].replace('Formulário do site','Site')),values:chs.map(k=>scope.filter(c=>c.channel===k).length),color:'#7462F5'});
    const cats=[...Object.keys(CATS),'outros'].map(k=>({label:catLabel(k),value:scope.filter(c=>c.ai.cat===k).length,color:catColor(k)})).filter(x=>x.value);
    VxCharts.donut($('chCat'),{items:cats,center:[String(scope.length),'conversas']});
    $('catLeg').innerHTML=cats.map(x=>`<li><i style="background:${x.color}"></i>${x.label}<b>${x.value}</b></li>`).join('');
    const now=Date.now(),labels=[],vals=[];for(let h=11;h>=0;h--){const end=now-h*60*MIN,st=end-60*MIN;labels.push(hhmm(end).slice(0,2)+'h');vals.push(scope.filter(c=>c.created>st&&c.created<=end).length)}
    VxCharts.line($('chHour'),{labels,series:[{name:'Mensagens',values:vals,color:'#19E3D6'}]});
    const rows=TEAM.filter(x=>x.role==='Atendente'&&(isSup()||x.id===me())).map(u=>{const cs=S.convs.filter(c=>c.owner===u.id),f=cs.filter(c=>c.first).map(c=>(c.first-c.created)/MIN);
      return `<tr><th scope="row"><span class="od-mini">${initials(u.name)}</span> ${esc(u.name)}</th><td>${cs.length}</td><td>${cs.filter(c=>c.status!=='resolvida').length}</td><td>${cs.filter(c=>c.status==='resolvida').length}</td><td>${f.length?Math.round(f.reduce((a,b)=>a+b,0)/f.length)+' min':'—'}</td></tr>`}).join('');
    $('team').innerHTML=rows;$('teamTitle').textContent=isSup()?'Desempenho por atendente':'Seus números';
  }

  /* ---------- Configurações ---------- */
  function renderConfig(){
    $('cfgCats').innerHTML=Object.entries(CATS).map(([k,v])=>`<li><label class="od-chk"><input type="checkbox" data-cat="${k}" ${S.disabled.includes(k)?'':'checked'}><b style="color:${v.color}">${v.label}</b></label><span>${v.signals.slice(0,6).map(w=>`<span class="tag">${esc(w)}</span>`).join(' ')}${v.signals.length>6?` <span class="muted">+${v.signals.length-6}</span>`:''}</span></li>`).join('');
    $('cfgTpl').innerHTML=Object.keys(TPL_DEF).map(k=>`<label class="field">${k==='outros'?'Outros / revisão':catLabel(k)}<textarea class="textarea" rows="2" name="${k}">${esc(S.tpl[k]||TPL_DEF[k])}</textarea></label>`).join('')+'<div class="od-ract"><button class="btn btn-p btn-s" type="submit">Salvar respostas-modelo</button><button class="btn btn-g btn-s" type="button" id="tplReset">Voltar ao padrão</button></div>';
    $('cfgRule').value=S.rule;ruleHelp();
    $('cfgTeam').innerHTML=TEAM.map(u=>`<li><span class="od-mini">${initials(u.name)}</span><span><b>${esc(u.name)}</b><small>${u.role}</small></span>${u.role==='Atendente'?`<label class="od-chk"><input type="checkbox" data-on="${u.id}" ${S.online[u.id]?'checked':''}> online</label>`:'<span class="tag iris">supervisão</span>'}</li>`).join('');
    $('tplReset').addEventListener('click',()=>{S.tpl={...TPL_DEF};save();renderConfig();K.toast('Respostas-modelo restauradas.')});
  }
  function ruleHelp(){$('ruleHelp').textContent=S.rule==='rodizio'?'Cada nova mensagem vai para o próximo atendente online, em sequência.':'Novas mensagens entram sem responsável; a equipe assume pela caixa de entrada.'}
  $('cfgCats').addEventListener('change',e=>{const k=e.target.dataset.cat;if(!k)return;S.disabled=e.target.checked?S.disabled.filter(x=>x!==k):[...S.disabled,k];save();K.toast(`Categoria <b>${catLabel(k)}</b> ${e.target.checked?'ativada':'desativada'} para novas classificações.`)});
  $('reclass').addEventListener('click',()=>{let n=0;S.convs.forEach(c=>{if(c.status==='resolvida')return;const old=c.ai.cat;c.ai=classify(c.msgs[0].text,S.disabled);if(c.ai.cat!==old)n++});save();K.toast(`Conversas em aberto reclassificadas · <b>${n}</b> mudaram de categoria.`)});
  $('cfgTpl').addEventListener('submit',e=>{e.preventDefault();new FormData(e.target).forEach((v,k)=>{S.tpl[k]=String(v).trim()||TPL_DEF[k]});save();K.toast('<b>Respostas-modelo salvas</b> neste navegador.')});
  $('cfgRule').addEventListener('change',e=>{S.rule=e.target.value;save();ruleHelp()});
  $('cfgTeam').addEventListener('change',e=>{const k=e.target.dataset.on;if(!k)return;S.online[k]=e.target.checked;save()});

  /* ---------- Restaurar ---------- */
  $('reset').addEventListener('click',()=>{S=seed();save();sel=null;mobileOpen=false;if(profile)go(view);K.toast('Dados de exemplo restaurados.')});

  /* prazos andam sozinhos: atualiza a lista a cada 30 s */
  setInterval(()=>{if(profile&&view==='inbox'&&!d.hidden)renderList()},30000);
  addEventListener('resize',()=>{if(innerWidth>=900&&mobileOpen){$('inbox').classList.remove('m-open')}else if(profile&&view==='inbox')$('inbox').classList.toggle('m-open',mobileOpen)});
})();
