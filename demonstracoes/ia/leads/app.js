/* IA para organizar leads — SIMULAÇÃO por regras (interesse + prioridade com explicação) */
(function(){
  const d=document,K=window.VxKit,I=window.VxIA;
  const INT={
    site:{n:'Site institucional',terms:{'site':3,'pagina':2,'institucional':3,'portfolio':2}},
    loja:{n:'Loja virtual',terms:{'loja virtual':5,'e commerce':5,'ecommerce':5,'vender online':4,'catalogo':2,'pedidos':2}},
    auto:{n:'Automação',terms:{'automat':4,'whatsapp':2,'atendimento':2,'planilha':2,'integra':3,'chatbot':3}},
    sis:{n:'Sistema sob medida',terms:{'sistema':4,'controle':2,'estoque':3,'agenda':2,'crm':3,'dashboard':3,'relatorio':2}}
  };
  const SIG=[
    ['orcamento aprovado',22,'orçamento aprovado','p'],['ja tenho orcamento',22,'já tem orçamento','p'],['verba',14,'tem verba','p'],
    ['este mes',18,'prazo curto','p'],['urgente',18,'urgência','p'],['essa semana',18,'prazo curto','p'],['esta semana',18,'prazo curto','p'],['proximo mes',10,'prazo definido','p'],
    ['sou o dono',12,'fala com quem decide','p'],['sou a dona',12,'fala com quem decide','p'],['socio',10,'fala com quem decide','p'],['reuniao',8,'quer reunião','p'],
    ['so pesquisando',-18,'só pesquisando','n'],['sem pressa',-14,'sem pressa','n'],['ano que vem',-14,'prazo longo','n'],['talvez',-8,'indeciso','n'],['barato',-6,'foco em preço','n'],['estudante',-10,'perfil fora do público','n']
  ];
  const ORIGIN={Indicação:[12,'veio por indicação'],Google:[6,'buscou ativamente'],Site:[4,'chegou pelo site'],Instagram:[2,'veio do Instagram']};
  const SEED=[
    ['Renata Moura','Indicação','Sou a dona de uma loja de roupas e quero vender online. Já tenho orçamento e preciso para este mês.'],
    ['Caio Fernandes','Instagram','Talvez no ano que vem eu faça um site, só pesquisando valores.'],
    ['Patrícia Lemos','Google','Precisamos de um sistema de controle de estoque integrado à planilha. Reunião essa semana?'],
    ['Diego Araújo','Site','Quero automatizar o atendimento no WhatsApp da clínica, próximo mês.'],
    ['Lúcia Ramos','Site','Gostaria de um site institucional simples, sem pressa.'],
    ['Marcos Vieira','Indicação','Sou sócio de uma distribuidora, urgente: CRM e dashboard de vendas.'],
    ['Bia Santos','Instagram','Sou estudante e queria uma página barata para portfólio.'],
    ['Otávio Reis','Google','Loja virtual com catálogo e pedidos, verba definida para o próximo mês.']
  ];
  const intRules=Object.fromEntries(Object.entries(INT).map(([k,v])=>[k,{terms:v.terms}]));
  let leads=K.store('ia-leads',null)||SEED.map((s,i)=>({id:i+1,n:s[0],o:s[1],m:s[2]})),view='raw',busy=false;
  const save=()=>K.save('ia-leads',leads);
  const stage=d.getElementById('stage');

  function analyse(l){
    const r=I.score(l.m,intRules),interest=r.empty?null:r.best;
    const t=' '+I.norm(l.m)+' ';let s=35;const why=[];
    if(interest){why.push([`interesse: ${INT[interest].n.toLowerCase()}`,'']);s+=8}
    SIG.forEach(([k,w,label,kind])=>{if(t.includes(k)&&!why.some(x=>x[0]===label)){s+=w;why.push([label,kind])}});
    const o=ORIGIN[l.o];if(o){s+=o[0];why.push([o[1],o[0]>=10?'p':''])}
    s=Math.max(3,Math.min(98,s));
    const pr=s>=70?'quente':s>=45?'morno':'frio';
    return {interest,score:s,pr,why}}

  const COLS=[['quente','Quente','#FF6B8B','Atender hoje'],['morno','Morno','#FFC24B','Atender nesta semana'],['frio','Frio','#7DD3FC','Nutrir com conteúdo']];
  function render(){
    d.querySelectorAll('[data-v]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===view));
    if(view==='raw'){stage.innerHTML=`<div class="ld-raw">${leads.map(l=>`<div class="ld-row"><span><b>${I.esc(l.n)}</b><small>lead #${l.id}</small></span><p>${I.esc(l.m)}</p><span class="src">${l.o}</span></div>`).join('')}</div>`;return}
    const a=leads.map(l=>Object.assign({},l,analyse(l))).sort((x,y)=>y.score-x.score);
    stage.innerHTML=`<div class="ld-cols">${COLS.map(([id,n,c,hint])=>{const g=a.filter(x=>x.pr===id);
      return `<div class="ld-col"><h2><i style="background:${c}"></i>${n}<small>${g.length}</small></h2><p>${hint}</p><div class="ld-cards">${g.length?g.map((x,i)=>`<article class="ld-card" style="--i:${i}"><header><div><b>${I.esc(x.n)}</b><small>${x.o}</small></div><span class="ld-score" style="--s:${x.score};--c:${c}" title="Pontuação de prioridade (simulação)"><span>${x.score}</span></span></header><p>${I.esc(x.m)}</p><div class="ld-why">${x.why.map(([w,k])=>`<span class="${k}">${k==='p'?'+ ':k==='n'?'− ':''}${w}</span>`).join('')}</div>${x.interest?`<span class="ld-int">${INT[x.interest].n}</span>`:'<span class="ld-int">Interesse não identificado</span>'}</article>`).join(''):'<div class="ld-empty">Nenhum lead aqui.</div>'}</div></div>`}).join('')}</div>`}

  async function organize(){if(busy)return;busy=true;const b=d.getElementById('org');b.disabled=true;
    stage.innerHTML=`<div class="ld-working"><span class="ia-think"><i></i><i></i><i></i></span><span id="wk">Lendo ${leads.length} mensagens (simulação)…</span></div>`;
    const steps=['Identificando o interesse de cada lead…','Somando sinais de prazo, orçamento e origem…','Ordenando por prioridade…'];
    for(const s of steps){await new Promise(r=>setTimeout(r,K.reduce?0:420));const w=d.getElementById('wk');if(w)w.textContent=s}
    view='org';render();busy=false;b.disabled=false}
  d.getElementById('org').addEventListener('click',organize);
  d.querySelector('.ld-bar .chips').addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(!b||busy)return;if(b.dataset.v==='org'&&view==='raw'){organize();return}view=b.dataset.v;render()});
  const add=d.getElementById('add'),ab=d.getElementById('addBtn');
  ab.addEventListener('click',()=>{add.hidden=!add.hidden;ab.setAttribute('aria-expanded',!add.hidden);if(!add.hidden)add.n.focus()});
  add.addEventListener('submit',e=>{e.preventDefault();if(!add.checkValidity()){add.reportValidity();return}
    leads.unshift({id:Math.max(0,...leads.map(l=>l.id))+1,n:add.n.value.trim(),o:add.o.value,m:add.m.value.trim()});save();add.reset();render();
    K.toast(view==='org'?'Lead adicionado e organizado (simulação).':'Lead adicionado. Clique em “Organizar”.')});
  render();
  // botão para voltar aos leads de exemplo
  const reset=d.createElement('button');reset.type='button';reset.className='btn btn-g btn-s';reset.textContent='Restaurar exemplos';
  reset.addEventListener('click',()=>{leads=SEED.map((s,i)=>({id:i+1,n:s[0],o:s[1],m:s[2]}));K.drop('ia-leads');view='raw';render()});
  d.querySelector('.ld-bar').appendChild(reset);
})();
