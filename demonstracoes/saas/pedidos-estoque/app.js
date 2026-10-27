/* =========================================================
   Prateleira · Pedidos & Estoque — SaaS demonstrativo (Vortyx)
   Regras de negócio reais (reserva, baixa, estoque mínimo, transferência),
   perfis de acesso e várias unidades. Tudo fictício e salvo só no navegador.
   ========================================================= */
(function(){
  const d=document,K=window.VxKit,$=id=>d.getElementById(id),brl=K.brl,num=K.num;
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const DAY=864e5,KEY='prateleira:v1';

  /* ---------- Cadastros ---------- */
  const UNITS={centro:'Unidade Centro',norte:'Unidade Norte',cd:'Centro de Distribuição'};
  const UK=Object.keys(UNITS);
  const ROLES={admin:'Administrador',gerente:'Gerente de unidade',operador:'Operador'};
  const PROFILES={admin:{user:'helena',unit:'all'},gerente:{user:'rafael',unit:'norte'},operador:{user:'julia',unit:'centro'}};
  const PERMS={
    admin:{views:['painel','pedidos','estoque','alertas','relatorios','usuarios'],cancel:1,entrada:1,transfer:1,ajuste:1,allUnits:1},
    gerente:{views:['painel','pedidos','estoque','alertas','relatorios'],cancel:1,entrada:1,transfer:1,ajuste:1},
    operador:{views:['painel','pedidos','estoque','alertas'],cancel:0,entrada:0,transfer:0,ajuste:0}
  };
  const VIEWS={painel:'Painel',pedidos:'Pedidos',estoque:'Estoque',alertas:'Alertas',relatorios:'Relatórios',usuarios:'Usuários'};
  const ST={novo:'Novo',separacao:'Em separação',enviado:'Enviado',entregue:'Entregue',cancelado:'Cancelado'};
  const FLOW=['novo','separacao','enviado','entregue'];
  const CHANNELS=['Balcão','Loja virtual','WhatsApp','Atacado'];
  const P=[
    ['CAF-001','Café especial em grãos 1 kg','Cafés',89.9],['CAF-002','Café especial em grãos 500 g','Cafés',49.9],['CAF-003','Café moído tradicional 500 g','Cafés',32.9],
    ['CAF-004','Café moído extraforte 500 g','Cafés',34.9],['CAF-005','Café descafeinado 250 g','Cafés',38.5],['CAF-006','Café microlote 250 g','Cafés',64],
    ['CAP-001','Cápsulas espresso (10 un.)','Cápsulas',27.9],['CAP-002','Cápsulas lungo (10 un.)','Cápsulas',27.9],['CAP-003','Cápsulas descafeinado (10 un.)','Cápsulas',29.9],
    ['CHA-001','Chá verde 40 g','Chás',22.5],['CHA-002','Chá de hibisco 40 g','Chás',21],['CHA-003','Chá mate tostado 100 g','Chás',16.9],
    ['ACE-001','Filtro de papel nº 103 (30 un.)','Acessórios',9.9],['ACE-002','Prensa francesa 600 ml','Acessórios',129],['ACE-003','Moedor manual','Acessórios',189],
    ['ACE-004','Xícara de porcelana 90 ml','Acessórios',24.9],['ACE-005','Caneca térmica 350 ml','Acessórios',79.9],['ACE-006','Coador de pano','Acessórios',14.5],
    ['ACE-007','Chaleira bico de ganso','Acessórios',219],['ACE-008','Balança digital para café','Acessórios',149],
    ['MER-001','Açúcar demerara 1 kg','Mercearia',13.9],['MER-002','Bebida vegetal de aveia 1 L','Mercearia',18.9],['MER-003','Biscoito amanteigado 200 g','Mercearia',15.5],
    ['MER-004','Chocolate 70% 100 g','Mercearia',19.9],['MER-005','Mel silvestre 300 g','Mercearia',29.9],['MER-006','Granola artesanal 400 g','Mercearia',26.9],
    ['MER-007','Adoçante natural 75 ml','Mercearia',17.5],['MER-008','Cookies de cacau 150 g','Mercearia',16.9],['CAF-007','Café cold brew 300 ml','Cafés',18.9],['CAF-008','Kit degustação 4 cafés','Cafés',119]
  ].map(([sku,name,cat,price])=>({sku,name,cat,price}));
  const PBY=Object.fromEntries(P.map(p=>[p.sku,p]));
  const USERS=[
    {id:'helena',name:'Helena Duarte',role:'admin',unit:'all',on:true},{id:'marcos',name:'Marcos Teles',role:'gerente',unit:'centro',on:true},
    {id:'rafael',name:'Rafael Nunes',role:'gerente',unit:'norte',on:true},{id:'julia',name:'Júlia Campos',role:'operador',unit:'centro',on:true},
    {id:'paula',name:'Paula Siqueira',role:'operador',unit:'cd',on:true},{id:'tiago',name:'Tiago Moreira',role:'operador',unit:'norte',on:false}
  ];
  const CLIENTS=['Ana Ribeiro','Café do Largo (fictício)','Bruno Castro','Padaria Aurora (fictícia)','Carla Dias','Escritório Sete (fictício)','Diego Melo','Elisa Prado','Fernando Luz','Gabriela Neves','Hotel Serra Azul (fictício)','Igor Paiva','Joana Freire','Lucas Antunes','Marta Cruz','Nina Barros','Otávio Lima','Rita Sales'];

  /* ---------- Dados de exemplo (gerados de forma determinística) ---------- */
  function seed(){
    const r=K.rng(20261026),now=Date.now(),pick=a=>a[Math.floor(r()*a.length)];
    const stock={},min={};
    UK.forEach(u=>{stock[u]={};min[u]={};P.forEach(p=>{const big=u==='cd'?2.6:1;min[u][p.sku]=Math.round((4+r()*10)*big);stock[u][p.sku]=Math.round(min[u][p.sku]*(1.1+r()*2.6))})});
    // situações para os alertas: alguns itens abaixo do mínimo e um zerado
    stock.centro['CAF-001']=3;stock.centro['ACE-001']=2;stock.norte['CAP-001']=4;stock.norte['MER-002']=0;stock.cd['ACE-002']=5;
    const orders=[];let n=1040;
    for(let i=0;i<48;i++){
      const age=Math.floor(Math.pow(r(),1.35)*34*DAY)+Math.floor(r()*DAY*.6);
      const unit=r()<.44?'centro':r()<.6?'norte':'cd';
      const items=[];const k=1+Math.floor(r()*3);
      for(let j=0;j<k;j++){const p=pick(P);if(items.some(x=>x.sku===p.sku))continue;items.push({sku:p.sku,qty:1+Math.floor(r()*(unit==='cd'?8:3)),price:p.price})}
      let status=age>3*DAY?(r()<.07?'cancelado':'entregue'):pick(['novo','separacao','enviado','entregue']);
      orders.push({id:'P-'+(n++),unit,client:pick(CLIENTS),channel:unit==='cd'?'Atacado':pick(CHANNELS.slice(0,3)),created:now-age,status,items,log:[{t:now-age,txt:'Pedido criado',by:'sistema'}]});
    }
    // dois pedidos parados há mais de 2 dias (alerta de atraso)
    orders.push({id:'P-'+(n++),unit:'norte',client:'Hotel Serra Azul (fictício)',channel:'WhatsApp',created:now-2.8*DAY,status:'separacao',items:[{sku:'CAF-002',qty:6,price:49.9},{sku:'ACE-004',qty:12,price:24.9}],log:[{t:now-2.8*DAY,txt:'Pedido criado',by:'rafael'}]});
    orders.push({id:'P-'+(n++),unit:'centro',client:'Café do Largo (fictício)',channel:'Loja virtual',created:now-3.4*DAY,status:'novo',items:[{sku:'CAF-006',qty:2,price:64}],log:[{t:now-3.4*DAY,txt:'Pedido criado',by:'sistema'}]});
    orders.sort((a,b)=>b.created-a.created);
    const moves=[{t:now-1.2*DAY,unit:'cd',sku:'CAF-001',qty:40,type:'Entrada',by:'paula',note:'Recebimento do fornecedor'},
      {t:now-.9*DAY,unit:'cd',sku:'CAP-001',qty:-20,type:'Transferência',by:'helena',note:'Para Unidade Norte'},{t:now-.9*DAY,unit:'norte',sku:'CAP-001',qty:20,type:'Transferência',by:'helena',note:'Do Centro de Distribuição'},
      {t:now-.4*DAY,unit:'centro',sku:'MER-004',qty:-2,type:'Ajuste',by:'marcos',note:'Avaria'}];
    const diverg=[{unit:'centro',sku:'ACE-004',counted:Math.max(0,stock.centro['ACE-004']-3)},{unit:'cd',sku:'CHA-002',counted:stock.cd['CHA-002']+4}];
    return {v:1,at:now,stock,min,orders,moves,diverg,next:n,users:USERS.map(u=>({...u}))};
  }
  let S=K.store(KEY,null);
  if(!S||S.v!==1||Date.now()-S.at>7*DAY){S=seed();K.save(KEY,S)}
  const save=()=>K.save(KEY,S);

  /* ---------- Contexto ---------- */
  let profile=null,view='painel',unit='all',ordMode='lista',period=30,openDlg=null,lastFocus=null;
  const perm=()=>PERMS[profile];
  const me=()=>S.users.find(u=>u.id===PROFILES[profile].user);
  const units=()=>unit==='all'?UK:[unit];
  const inScope=o=>unit==='all'||o.unit===unit;
  const userName=id=>(S.users.find(u=>u.id===id)||{name:id==='sistema'?'Sistema':id}).name;
  const total=o=>o.items.reduce((a,i)=>a+i.qty*i.price,0);
  const active=o=>['novo','separacao','enviado'].includes(o.status);
  function reserved(u,sku){return S.orders.filter(o=>o.unit===u&&active(o)).reduce((a,o)=>a+o.items.filter(i=>i.sku===sku).reduce((x,i)=>x+i.qty,0),0)}
  const avail=(u,sku)=>S.stock[u][sku]-reserved(u,sku);
  const fdate=t=>new Date(t).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
  const fdt=t=>new Date(t).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});

  function alerts(){
    const out=[];
    units().forEach(u=>P.forEach(p=>{const a=avail(u,p.sku),m=S.min[u][p.sku];if(a<m)out.push({type:'estoque',sev:a<=0?'alta':'media',unit:u,sku:p.sku,txt:`${p.name}: ${a<=0?'sem saldo disponível':`${a} disponíveis`} (mínimo ${m})`})}));
    S.orders.filter(o=>inScope(o)&&['novo','separacao'].includes(o.status)&&Date.now()-o.created>2*DAY).forEach(o=>out.push({type:'atraso',sev:'media',unit:o.unit,order:o.id,txt:`Pedido ${o.id} parado em “${ST[o.status]}” há ${Math.floor((Date.now()-o.created)/DAY)} dias`}));
    S.diverg.filter(x=>units().includes(x.unit)).forEach(x=>out.push({type:'divergencia',sev:'media',unit:x.unit,sku:x.sku,txt:`Divergência de inventário em ${PBY[x.sku].name}: sistema ${S.stock[x.unit][x.sku]}, contagem ${x.counted}`}));
    return out.sort((a,b)=>(a.sev==='alta'?0:1)-(b.sev==='alta'?0:1));
  }

  /* ---------- Login ---------- */
  d.querySelectorAll('[data-profile]').forEach(b=>b.addEventListener('click',()=>enter(b.dataset.profile)));
  function enter(p){
    profile=p;unit=PROFILES[p].unit;view='painel';$('login').hidden=true;$('app').hidden=false;
    const u=me();$('me').innerHTML=`<span class="pt-av ${p[0]}" aria-hidden="true">${u.name.split(' ').map(x=>x[0]).join('')}</span><span><b>${esc(u.name)}</b><small>${ROLES[p]}</small></span>`;
    const sel=$('unit');sel.innerHTML=(perm().allUnits?'<option value="all">Todas as unidades</option>':'')+UK.filter(k=>perm().allUnits||k===unit).map(k=>`<option value="${k}">${UNITS[k]}</option>`).join('');
    sel.value=unit;sel.disabled=!perm().allUnits;
    renderNav();render();K.toast(`<b>${ROLES[p]}</b> · ${p==='admin'?'acesso a todas as unidades, relatórios e usuários.':p==='gerente'?'você vê somente a Unidade Norte.':'você opera pedidos e estoque da Unidade Centro.'}`);
    $('app').scrollIntoView({block:'start',behavior:K.reduce?'auto':'smooth'});
  }
  $('switch').addEventListener('click',()=>{profile=null;$('app').hidden=true;$('login').hidden=false;$('login').querySelector('.pt-prof').focus()});
  $('unit').addEventListener('change',e=>{unit=e.target.value;render()});

  function renderNav(){
    const al=alerts().length;
    $('nav').innerHTML=perm().views.map(v=>`<button type="button" data-view="${v}" ${v===view?'aria-current="page"':''}>${VIEWS[v]}${v==='alertas'&&al?` <em>${al}</em>`:''}</button>`).join('');
  }
  $('nav').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(!b)return;view=b.dataset.view;renderNav();render();$('main').focus({preventScroll:true});if(innerWidth<900)$('main').scrollIntoView({block:'start',behavior:K.reduce?'auto':'smooth'})});
  function render(){renderNav();({painel,pedidos,estoque,alertas:alertsView,relatorios,usuarios})[view]()}
  const H=(t,sub,act)=>`<div class="pt-vh"><div><h2>${t}</h2>${sub?`<p class="muted">${sub}</p>`:''}</div>${act||''}</div>`;
  const scopeTxt=()=>unit==='all'?'Todas as unidades':UNITS[unit];

  /* ---------- Painel ---------- */
  const sold=(days,u)=>S.orders.filter(o=>o.status==='entregue'&&Date.now()-o.created<=days*DAY&&(u?o.unit===u:inScope(o)));
  function painel(){
    const del=sold(period),rev=del.reduce((a,o)=>a+total(o),0),open=S.orders.filter(o=>inScope(o)&&active(o)).length;
    const low=alerts().filter(a=>a.type==='estoque').length;
    $('main').innerHTML=H('Painel',scopeTxt(),`<div class="chips" role="group" aria-label="Período">${[7,15,30].map(p=>`<button class="chip" type="button" data-per="${p}" aria-pressed="${p===period}">${p} dias</button>`).join('')}</div>`)+
      `<section class="pt-kpis" aria-label="Indicadores">${[['Vendas entregues',brl(rev),`${del.length} pedidos em ${period} dias`],['Pedidos em aberto',open,'novos, em separação ou enviados'],['Ticket médio',brl(del.length?rev/del.length:0),'por pedido entregue'],['Itens abaixo do mínimo',low,low?'veja em Alertas':'estoque em dia',low?'warn':'']]
        .map(([l,v,s,c])=>`<div class="pt-kpi ${c||''}"><span>${l}</span><b>${v}</b><small>${s}</small></div>`).join('')}</section>
      <div class="pt-grid">
        <section class="panel pt-span2"><div class="panel-h">Vendas por dia <small>pedidos entregues</small></div><div class="panel-b"><div class="vxc" id="cLine" data-label="Gráfico de linha: vendas entregues por dia (dados fictícios)"></div></div></section>
        <section class="panel"><div class="panel-h">Pedidos por etapa</div><div class="panel-b"><div class="vxc" id="cSt" data-label="Gráfico de barras: pedidos por etapa (dados fictícios)"></div></div></section>
        <section class="panel"><div class="panel-h">Mais vendidos <small>${period} dias</small></div><div class="panel-b"><ol class="pt-top">${topProducts(del).slice(0,5).map(x=>`<li><span>${esc(x.name)}</span><b>${num(x.qty)} un.</b></li>`).join('')||'<li class="muted">Sem vendas no período.</li>'}</ol></div></section>
        <section class="panel pt-span2"><div class="panel-h">Alertas recentes <button class="btn btn-g btn-s" type="button" data-go="alertas">Ver todos</button></div><div class="panel-b"><ul class="pt-alerts">${alerts().slice(0,4).map(alertRow).join('')||'<li class="muted">Nenhum alerta.</li>'}</ul></div></section>
      </div>`;
    const days=[];for(let i=period-1;i>=0;i--){const st=new Date(Date.now()-i*DAY);st.setHours(0,0,0,0);days.push(st.getTime())}
    VxCharts.line($('cLine'),{labels:days.map(fdate),series:[{name:'Vendas',values:days.map(t=>del.filter(o=>o.created>=t&&o.created<t+DAY).reduce((a,o)=>a+total(o),0)),color:'#19E3D6'}],format:v=>'R$ '+num(Math.round(v))});
    const ks=['novo','separacao','enviado','entregue'];VxCharts.bars($('cSt'),{labels:ks.map(k=>ST[k]),values:ks.map(k=>S.orders.filter(o=>inScope(o)&&o.status===k&&(k!=='entregue'||Date.now()-o.created<=period*DAY)).length),color:'#7462F5'});
  }
  function topProducts(list){const m={};list.forEach(o=>o.items.forEach(i=>{m[i.sku]=m[i.sku]||{sku:i.sku,name:PBY[i.sku].name,qty:0,rev:0};m[i.sku].qty+=i.qty;m[i.sku].rev+=i.qty*i.price}));return Object.values(m).sort((a,b)=>b.qty-a.qty)}
  const alertRow=a=>`<li class="pt-al sev-${a.sev}"><span class="pt-al-t">${a.type==='estoque'?'Estoque baixo':a.type==='atraso'?'Pedido atrasado':'Divergência'}</span><span class="pt-al-x">${esc(a.txt)}</span><span class="pt-al-u">${UNITS[a.unit]}</span></li>`;

  /* ---------- Pedidos ---------- */
  let oq='',ost='abertos';
  function pedidos(){
    $('main').innerHTML=H('Pedidos',scopeTxt(),`<button class="btn btn-p btn-s" type="button" id="newOrder">+ Novo pedido</button>`)+
      `<div class="pt-tools"><input class="input" type="search" id="oq" placeholder="Buscar nº ou cliente" aria-label="Buscar pedidos" value="${esc(oq)}">
        <label class="pt-l">Etapa<select class="select" id="ost"><option value="abertos">Em aberto</option><option value="">Todas</option>${Object.entries(ST).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label>
        <div class="chips" role="group" aria-label="Visualização"><button class="chip" type="button" data-mode="lista" aria-pressed="${ordMode==='lista'}">Lista</button><button class="chip" type="button" data-mode="quadro" aria-pressed="${ordMode==='quadro'}">Quadro</button></div></div>
      <div id="olist"></div>`;
    $('ost').value=ost;
    $('oq').addEventListener('input',e=>{oq=e.target.value;drawOrders()});$('ost').addEventListener('change',e=>{ost=e.target.value;drawOrders()});
    $('newOrder').addEventListener('click',newOrderDlg);
    drawOrders();
  }
  function filteredOrders(){const q=norm(oq);return S.orders.filter(o=>inScope(o)&&(!q||norm(o.id+' '+o.client).includes(q))&&(ost==='abertos'?active(o):!ost||o.status===ost))}
  function drawOrders(){
    const list=filteredOrders(),el=$('olist');
    if(ordMode==='quadro'){
      el.innerHTML=`<p class="pt-hint muted">Use “Avançar” para mover o pedido de etapa. Ao entregar, o estoque recebe a baixa.</p><div class="pt-board">${FLOW.map(s=>{const os=S.orders.filter(o=>inScope(o)&&o.status===s&&(s!=='entregue'||Date.now()-o.created<=3*DAY)).filter(o=>!norm(oq)||norm(o.id+' '+o.client).includes(norm(oq)));
        return `<section class="pt-col" aria-label="${ST[s]}"><h3>${ST[s]} <em>${os.length}</em></h3>${os.map(o=>`<article class="pt-card"><button type="button" class="pt-card-b" data-open="${o.id}"><b>${o.id}</b><span>${esc(o.client)}</span><small>${UNITS[o.unit]} · ${brl(total(o))}</small></button>${s!=='entregue'?`<button class="btn btn-g btn-s" type="button" data-adv="${o.id}" aria-label="Avançar ${o.id} para ${ST[FLOW[FLOW.indexOf(s)+1]]}">Avançar →</button>`:''}</article>`).join('')||'<p class="muted pt-empty">Vazio</p>'}${s==='entregue'?'<p class="muted pt-help">Últimos 3 dias</p>':''}</section>`}).join('')}</div>`;
    }else{
      el.innerHTML=`<div class="panel pt-tablewrap" tabindex="0" role="region" aria-label="Pedidos (dados fictícios)"><table class="pt-table"><caption class="vx-sr">Pedidos (dados fictícios)</caption><thead><tr><th scope="col">Pedido</th><th scope="col">Data</th><th scope="col">Cliente</th><th scope="col">Unidade</th><th scope="col">Canal</th><th scope="col">Total</th><th scope="col">Etapa</th><th scope="col"><span class="vx-sr">Ações</span></th></tr></thead>
        <tbody>${list.map(o=>`<tr><th scope="row" data-l="Pedido">${o.id}</th><td data-l="Data">${fdate(o.created)}</td><td data-l="Cliente">${esc(o.client)}</td><td data-l="Unidade">${UNITS[o.unit]}</td><td data-l="Canal">${o.channel}</td><td data-l="Total">${brl(total(o))}</td><td data-l="Etapa"><span class="pt-st st-${o.status}">${ST[o.status]}</span></td><td><button class="btn btn-g btn-s" type="button" data-open="${o.id}">Abrir</button></td></tr>`).join('')||`<tr><td colspan="8" class="muted pt-empty">Nenhum pedido com esses filtros.</td></tr>`}</tbody></table></div><p class="pt-count muted">${list.length} pedido${list.length===1?'':'s'}</p>`;
    }
  }
  function advance(o){
    const i=FLOW.indexOf(o.status);if(i<0||i>=FLOW.length-1)return;const nx=FLOW[i+1];
    if(nx==='entregue'){for(const it of o.items){S.stock[o.unit][it.sku]-=it.qty;S.moves.unshift({t:Date.now(),unit:o.unit,sku:it.sku,qty:-it.qty,type:'Baixa por venda',by:me().id,note:o.id})}}
    o.status=nx;o.log.push({t:Date.now(),txt:'Etapa: '+ST[nx]+(nx==='entregue'?' · baixa no estoque':''),by:me().id});save();
    K.toast(`<b>${o.id}</b> agora está em <b>${ST[nx]}</b>${nx==='entregue'?'. Estoque atualizado.':''}`);
  }

  /* ---------- Diálogo ---------- */
  function dialog(html,onReady){lastFocus=d.activeElement;$('dlgBody').innerHTML=html;$('dlg').hidden=false;d.body.classList.add('pt-lock');openDlg=true;
    const f=$('dlg').querySelector('input,select,textarea,button:not([data-close])');(f||$('dlg').querySelector('[data-close]')).focus();if(onReady)onReady()}
  function closeDlg(){if(!openDlg)return;$('dlg').hidden=true;d.body.classList.remove('pt-lock');openDlg=null;if(lastFocus&&d.contains(lastFocus))lastFocus.focus()}
  $('dlg').addEventListener('click',e=>{if(e.target===$('dlg')||e.target.closest('[data-close]'))closeDlg()});
  d.addEventListener('keydown',e=>{if(e.key==='Escape'&&openDlg)closeDlg()});

  function orderDlg(o){
    const i=FLOW.indexOf(o.status),nx=i>-1&&i<FLOW.length-1?FLOW[i+1]:null;
    dialog(`<h2 id="dlgTitle">Pedido ${o.id}</h2>
      <p class="muted">${UNITS[o.unit]} · ${o.channel} · ${fdt(o.created)}</p>
      <dl class="pt-dl"><div><dt>Cliente</dt><dd>${esc(o.client)}</dd></div><div><dt>Etapa</dt><dd><span class="pt-st st-${o.status}">${ST[o.status]}</span></dd></div><div><dt>Total</dt><dd>${brl(total(o))}</dd></div></dl>
      <table class="pt-table pt-mini"><caption class="vx-sr">Itens do pedido</caption><thead><tr><th scope="col">Produto</th><th scope="col">Qtd.</th><th scope="col">Subtotal</th></tr></thead><tbody>${o.items.map(it=>`<tr><td>${esc(PBY[it.sku].name)}</td><td>${it.qty}</td><td>${brl(it.qty*it.price)}</td></tr>`).join('')}</tbody></table>
      <h3>Histórico</h3><ol class="pt-log">${o.log.map(l=>`<li><span>${fdt(l.t)}</span>${esc(l.txt)} <small>· ${esc(userName(l.by))}</small></li>`).join('')}</ol>
      <div class="pt-dact">${nx?`<button class="btn btn-p" type="button" id="dAdv">Avançar para ${ST[nx]}</button>`:''}${active(o)&&perm().cancel?'<button class="btn btn-g" type="button" id="dCancel">Cancelar pedido</button>':''}${active(o)&&!perm().cancel?'<p class="muted pt-help">Seu perfil não pode cancelar pedidos.</p>':''}</div>`,()=>{
      const a=$('dAdv');if(a)a.addEventListener('click',()=>{advance(o);closeDlg();render()});
      const c=$('dCancel');if(c)c.addEventListener('click',()=>{o.status='cancelado';o.log.push({t:Date.now(),txt:'Pedido cancelado · reserva liberada',by:me().id});save();closeDlg();render();K.toast(`<b>${o.id}</b> cancelado. A reserva de estoque foi liberada.`)});
    });
  }
  function newOrderDlg(){
    const us=perm().allUnits?(unit==='all'?UK:[unit]):[unit];
    dialog(`<h2 id="dlgTitle">Novo pedido</h2><p class="muted">Ao criar, os itens ficam <b>reservados</b>. A baixa acontece na entrega.</p>
      <form id="nform" novalidate>
        <div class="pt-2"><label class="field">Unidade<select class="select" name="unit" id="nUnit" ${us.length>1?'':'disabled'}>${us.map(k=>`<option value="${k}">${UNITS[k]}</option>`).join('')}</select></label>
        <label class="field">Canal<select class="select" name="channel">${CHANNELS.map(c=>`<option>${c}</option>`).join('')}</select></label></div>
        <label class="field">Cliente<input class="input" name="client" required autocomplete="off" placeholder="Nome do cliente (fictício)"></label>
        <fieldset class="pt-items"><legend>Itens</legend><div id="nItems"></div><button class="btn btn-g btn-s" type="button" id="nAdd">+ Adicionar item</button></fieldset>
        <p class="pt-total">Total <b id="nTotal">${brl(0)}</b></p><p class="pt-err" id="nErr" role="alert"></p>
        <div class="pt-dact"><button class="btn btn-p" type="submit">Criar pedido</button><button class="btn btn-g" type="button" data-close>Cancelar</button></div></form>`,()=>{
      const box=$('nItems'),U=()=>$('nUnit').value;
      const row=()=>{const el=d.createElement('div');el.className='pt-irow';el.innerHTML=`<label class="field">Produto<select class="select" name="sku">${P.map(p=>`<option value="${p.sku}">${esc(p.name)}</option>`).join('')}</select></label><label class="field pt-q">Qtd.<input class="input" name="qty" type="number" min="1" value="1" inputmode="numeric"></label><small class="pt-av-txt"></small><button class="pt-rm" type="button" aria-label="Remover item">×</button>`;box.appendChild(el);upd()};
      const upd=()=>{let t=0;box.querySelectorAll('.pt-irow').forEach(r=>{const sku=r.querySelector('select').value,q=+r.querySelector('input').value||0,a=avail(U(),sku);t+=q*PBY[sku].price;const s=r.querySelector('.pt-av-txt');s.textContent=`${a} disponíveis`;s.classList.toggle('bad',q>a)});$('nTotal').textContent=brl(t)};
      box.addEventListener('input',upd);box.addEventListener('change',upd);$('nUnit').addEventListener('change',upd);
      box.addEventListener('click',e=>{const b=e.target.closest('.pt-rm');if(b){b.parentElement.remove();upd()}});
      $('nAdd').addEventListener('click',row);row();
      $('nform').addEventListener('submit',e=>{e.preventDefault();const f=e.target,err=$('nErr');err.textContent='';
        const client=f.client.value.trim();if(!client){f.client.setAttribute('aria-invalid','true');f.client.focus();err.textContent='Informe o cliente.';return}f.client.removeAttribute('aria-invalid');
        const items=[];for(const r of box.querySelectorAll('.pt-irow')){const sku=r.querySelector('select').value,q=Math.floor(+r.querySelector('input').value||0);if(q<1)continue;const ex=items.find(x=>x.sku===sku);if(ex)ex.qty+=q;else items.push({sku,qty:q,price:PBY[sku].price})}
        if(!items.length){err.textContent='Adicione pelo menos um item com quantidade.';return}
        const short=items.find(i=>i.qty>avail(U(),i.sku));if(short){err.textContent=`Estoque insuficiente: ${PBY[short.sku].name} tem ${avail(U(),short.sku)} disponíveis em ${UNITS[U()]}.`;return}
        const o={id:'P-'+(S.next++),unit:U(),client,channel:f.channel.value,created:Date.now(),status:'novo',items,log:[{t:Date.now(),txt:'Pedido criado · itens reservados',by:me().id}]};
        S.orders.unshift(o);save();closeDlg();ost='abertos';oq='';render();K.toast(`<b>${o.id}</b> criado · ${items.reduce((a,i)=>a+i.qty,0)} itens reservados em ${UNITS[o.unit]}.`)});
    });
  }

  /* ---------- Estoque ---------- */
  let sq='',scat='',slow=false;
  function estoque(){
    const can=perm();
    $('main').innerHTML=H('Estoque',scopeTxt()+' · disponível = em estoque − reservado em pedidos abertos',`<div class="pt-acts">${can.entrada?'<button class="btn btn-p btn-s" type="button" id="sIn">Registrar entrada</button>':''}${can.transfer?'<button class="btn btn-g btn-s" type="button" id="sTr">Transferir entre unidades</button>':''}</div>`)+
      `<div class="pt-tools"><input class="input" type="search" id="sq" placeholder="Buscar produto ou SKU" aria-label="Buscar produto" value="${esc(sq)}"><label class="pt-l">Categoria<select class="select" id="scat"><option value="">Todas</option>${[...new Set(P.map(p=>p.cat))].map(c=>`<option>${c}</option>`).join('')}</select></label><label class="od-chk pt-chk"><input type="checkbox" id="slow" ${slow?'checked':''}> Só abaixo do mínimo</label></div>
      <div id="stable"></div>
      <section class="panel pt-moves"><div class="panel-h">Movimentações recentes <small>${scopeTxt()}</small></div><div class="panel-b"><ol class="pt-log" id="moves"></ol></div></section>`;
    if(!can.entrada&&!can.transfer)$('main').querySelector('.pt-vh').insertAdjacentHTML('beforeend','<p class="muted pt-help">Seu perfil consulta o estoque; entradas e transferências ficam com o gerente.</p>');
    $('scat').value=scat;
    $('sq').addEventListener('input',e=>{sq=e.target.value;drawStock()});$('scat').addEventListener('change',e=>{scat=e.target.value;drawStock()});$('slow').addEventListener('change',e=>{slow=e.target.checked;drawStock()});
    const i=$('sIn');if(i)i.addEventListener('click',()=>moveDlg('entrada'));const t=$('sTr');if(t)t.addEventListener('click',()=>moveDlg('transfer'));
    drawStock();
  }
  function drawStock(){
    const q=norm(sq),us=units();
    const rows=P.filter(p=>(!q||norm(p.name+' '+p.sku).includes(q))&&(!scat||p.cat===scat)).map(p=>{const v=us.map(u=>({u,st:S.stock[u][p.sku],rs:reserved(u,p.sku),av:avail(u,p.sku),mn:S.min[u][p.sku]}));return {p,v,low:v.some(x=>x.av<x.mn),zero:v.some(x=>x.av<=0)}}).filter(r=>!slow||r.low);
    const sit=r=>r.zero?'<span class="pt-st st-cancelado">Sem saldo</span>':r.low?'<span class="pt-st st-separacao">Abaixo do mínimo</span>':'<span class="pt-st st-entregue">OK</span>';
    $('stable').innerHTML=unit==='all'?
      `<div class="panel pt-tablewrap" tabindex="0" role="region" aria-label="Estoque disponível por unidade"><table class="pt-table"><caption class="vx-sr">Estoque disponível por unidade</caption><thead><tr><th scope="col">Produto</th>${UK.map(u=>`<th scope="col">${UNITS[u].replace('Unidade ','').replace('Centro de Distribuição','CD')}</th>`).join('')}<th scope="col">Total disponível</th><th scope="col">Situação</th></tr></thead><tbody>${rows.map(r=>`<tr><th scope="row" data-l="Produto"><b>${esc(r.p.name)}</b><small>${r.p.sku} · ${r.p.cat}</small></th>${r.v.map(x=>`<td data-l="${UNITS[x.u]}" class="${x.av<x.mn?'pt-lowc':''}">${x.av} <small>/ mín. ${x.mn}</small></td>`).join('')}<td data-l="Total disponível"><b>${r.v.reduce((a,x)=>a+x.av,0)}</b></td><td data-l="Situação">${sit(r)}</td></tr>`).join('')}</tbody></table></div><p class="pt-count muted">${rows.length} produtos</p>`
      :`<div class="panel pt-tablewrap" tabindex="0" role="region" aria-label="Estoque da ${UNITS[unit]}"><table class="pt-table"><caption class="vx-sr">Estoque da ${UNITS[unit]}</caption><thead><tr><th scope="col">Produto</th><th scope="col">Em estoque</th><th scope="col">Reservado</th><th scope="col">Disponível</th><th scope="col">Mínimo</th><th scope="col">Situação</th></tr></thead><tbody>${rows.map(r=>{const x=r.v[0];return `<tr><th scope="row" data-l="Produto"><b>${esc(r.p.name)}</b><small>${r.p.sku} · ${r.p.cat}</small></th><td data-l="Em estoque">${x.st}</td><td data-l="Reservado">${x.rs}</td><td data-l="Disponível" class="${x.av<x.mn?'pt-lowc':''}"><b>${x.av}</b></td><td data-l="Mínimo">${x.mn}</td><td data-l="Situação">${sit(r)}</td></tr>`}).join('')}</tbody></table></div><p class="pt-count muted">${rows.length} produtos</p>`;
    $('moves').innerHTML=S.moves.filter(m=>us.includes(m.unit)).slice(0,12).map(m=>`<li><span>${fdt(m.t)}</span><b class="${m.qty<0?'neg':'pos'}">${m.qty>0?'+':''}${m.qty}</b> ${esc(PBY[m.sku].name)} · ${m.type} <small>· ${UNITS[m.unit]} · ${esc(userName(m.by))}${m.note?' · '+esc(m.note):''}</small></li>`).join('')||'<li class="muted">Sem movimentações.</li>';
  }
  function moveDlg(kind){
    const us=perm().allUnits?UK:[unit],tr=kind==='transfer';
    dialog(`<h2 id="dlgTitle">${tr?'Transferir entre unidades':'Registrar entrada'}</h2><p class="muted">${tr?'Sai do saldo disponível da origem e entra no destino.':'Recebimento de fornecedor ou devolução.'}</p>
      <form id="mform" novalidate>
        <label class="field">Produto<select class="select" name="sku" id="mSku">${P.map(p=>`<option value="${p.sku}">${esc(p.name)}</option>`).join('')}</select></label>
        <div class="pt-2"><label class="field">${tr?'Origem':'Unidade'}<select class="select" name="from" id="mFrom" ${us.length>1?'':'disabled'}>${us.map(k=>`<option value="${k}">${UNITS[k]}</option>`).join('')}</select></label>
        ${tr?`<label class="field">Destino<select class="select" name="to" id="mTo">${UK.map(k=>`<option value="${k}">${UNITS[k]}</option>`).join('')}</select></label>`:''}</div>
        <label class="field">Quantidade<input class="input" name="qty" type="number" min="1" value="10" inputmode="numeric" required></label>
        <p class="muted pt-help" id="mInfo"></p><p class="pt-err" id="mErr" role="alert"></p>
        <div class="pt-dact"><button class="btn btn-p" type="submit">${tr?'Transferir':'Registrar entrada'}</button><button class="btn btn-g" type="button" data-close>Cancelar</button></div></form>`,()=>{
      const info=()=>{const sku=$('mSku').value,f=$('mFrom').value;$('mInfo').textContent=`${UNITS[f]}: ${S.stock[f][sku]} em estoque, ${avail(f,sku)} disponíveis (mínimo ${S.min[f][sku]}).`};
      if(tr){const to=$('mTo');const first=UK.find(k=>k!==$('mFrom').value);to.value=first}
      ['mSku','mFrom'].forEach(id=>$(id).addEventListener('change',info));info();
      $('mform').addEventListener('submit',e=>{e.preventDefault();const f=e.target,sku=f.sku.value,from=$('mFrom').value,q=Math.floor(+f.qty.value||0),err=$('mErr');err.textContent='';
        if(q<1){err.textContent='Informe uma quantidade maior que zero.';f.qty.focus();return}
        if(tr){const to=$('mTo').value;if(to===from){err.textContent='Escolha um destino diferente da origem.';return}if(q>avail(from,sku)){err.textContent=`Só há ${avail(from,sku)} disponíveis na origem.`;return}
          S.stock[from][sku]-=q;S.stock[to][sku]+=q;S.moves.unshift({t:Date.now(),unit:from,sku,qty:-q,type:'Transferência',by:me().id,note:'Para '+UNITS[to]},{t:Date.now(),unit:to,sku,qty:q,type:'Transferência',by:me().id,note:'De '+UNITS[from]});
          K.toast(`<b>${q} un.</b> de ${esc(PBY[sku].name)} transferidas para ${UNITS[to]}.`)}
        else{S.stock[from][sku]+=q;S.moves.unshift({t:Date.now(),unit:from,sku,qty:q,type:'Entrada',by:me().id,note:'Registro manual'});K.toast(`Entrada de <b>${q} un.</b> registrada em ${UNITS[from]}.`)}
        S.moves=S.moves.slice(0,80);save();closeDlg();render()});
    });
  }

  /* ---------- Alertas ---------- */
  let atype='';
  function alertsView(){
    const all=alerts(),list=all.filter(a=>!atype||a.type===atype);
    $('main').innerHTML=H('Alertas',`${scopeTxt()} · gerados automaticamente pelas regras do sistema`,'')+
      `<div class="pt-tools"><div class="chips" role="group" aria-label="Tipo de alerta">${[['','Todos'],['estoque','Estoque baixo'],['atraso','Pedidos atrasados'],['divergencia','Divergências']].map(([k,l])=>`<button class="chip" type="button" data-at="${k}" aria-pressed="${atype===k}">${l} <b>${k?all.filter(a=>a.type===k).length:all.length}</b></button>`).join('')}</div></div>
      <ul class="pt-alerts pt-alerts-l">${list.map((a,i)=>`<li class="pt-al sev-${a.sev}"><span class="pt-al-t">${a.type==='estoque'?'Estoque baixo':a.type==='atraso'?'Pedido atrasado':'Divergência'}${a.sev==='alta'?' · urgente':''}</span><span class="pt-al-x">${esc(a.txt)}</span><span class="pt-al-u">${UNITS[a.unit]}</span><span class="pt-al-a">${
        a.type==='atraso'?`<button class="btn btn-g btn-s" type="button" data-open="${a.order}">Ver pedido</button>`:
        a.type==='estoque'?(perm().transfer?`<button class="btn btn-g btn-s" type="button" data-fix="tr">Transferir</button>`:'')+(perm().entrada?`<button class="btn btn-g btn-s" type="button" data-fix="in">Registrar entrada</button>`:'')+(!perm().entrada?'<small class="muted">Avise o gerente</small>':''):
        perm().ajuste?`<button class="btn btn-g btn-s" type="button" data-adj="${a.unit}|${a.sku}">Ajustar para a contagem</button>`:'<small class="muted">Ajuste feito pelo gerente</small>'}</span></li>`).join('')||'<li class="muted pt-empty">Nenhum alerta deste tipo.</li>'}</ul>
      <p class="muted pt-help">Regras: disponível abaixo do mínimo da unidade · pedido novo ou em separação há mais de 2 dias · contagem física diferente do saldo do sistema.</p>`;
  }

  /* ---------- Relatórios ---------- */
  function relatorios(){
    const del=sold(period),rev=del.reduce((a,o)=>a+total(o),0),items=del.reduce((a,o)=>a+o.items.reduce((x,i)=>x+i.qty,0),0),top=topProducts(del);
    $('main').innerHTML=H('Relatórios',scopeTxt(),`<div class="pt-acts"><div class="chips" role="group" aria-label="Período">${[7,15,30].map(p=>`<button class="chip" type="button" data-per="${p}" aria-pressed="${p===period}">${p} dias</button>`).join('')}</div><button class="btn btn-p btn-s" type="button" id="csv">Exportar CSV</button></div>`)+
      `<section class="pt-kpis" aria-label="Resumo">${[['Receita',brl(rev),'pedidos entregues'],['Pedidos',del.length,`em ${period} dias`],['Itens vendidos',num(items),'unidades'],['Ticket médio',brl(del.length?rev/del.length:0),'por pedido']].map(([l,v,s])=>`<div class="pt-kpi"><span>${l}</span><b>${v}</b><small>${s}</small></div>`).join('')}</section>
      <div class="pt-grid">
        <section class="panel"><div class="panel-h">Receita por unidade</div><div class="panel-b"><div class="vxc" id="cUnit" data-label="Gráfico de barras: receita por unidade (dados fictícios)"></div></div></section>
        <section class="panel pt-span2"><div class="panel-h">Produtos mais vendidos</div><div class="panel-b pt-tablewrap" tabindex="0" role="region" aria-label="Produtos mais vendidos no período"><table class="pt-table pt-mini"><caption class="vx-sr">Produtos mais vendidos no período</caption><thead><tr><th scope="col">Produto</th><th scope="col">Unidades</th><th scope="col">Receita</th></tr></thead><tbody>${top.slice(0,8).map(x=>`<tr><td data-l="Produto">${esc(x.name)}</td><td data-l="Unidades">${x.qty}</td><td data-l="Receita">${brl(x.rev)}</td></tr>`).join('')||'<tr><td colspan="3" class="muted">Sem vendas no período.</td></tr>'}</tbody></table></div></section>
        <section class="panel pt-span3"><div class="panel-h">Giro de estoque <small>vendido no período ÷ estoque atual</small></div><div class="panel-b pt-tablewrap" tabindex="0" role="region" aria-label="Giro e cobertura de estoque"><table class="pt-table pt-mini"><caption class="vx-sr">Giro e cobertura de estoque</caption><thead><tr><th scope="col">Produto</th><th scope="col">Vendido</th><th scope="col">Em estoque</th><th scope="col">Giro</th><th scope="col">Cobertura</th></tr></thead><tbody>${top.slice(0,8).map(x=>{const st=units().reduce((a,u)=>a+S.stock[u][x.sku],0),g=st?x.qty/st:0,cov=x.qty?Math.round(st/(x.qty/period)):0;return `<tr><td data-l="Produto">${esc(x.name)}</td><td data-l="Vendido">${x.qty}</td><td data-l="Em estoque">${st}</td><td data-l="Giro">${g.toFixed(2).replace('.',',')}×</td><td data-l="Cobertura">${cov?cov+' dias':'—'}</td></tr>`}).join('')}</tbody></table></div></section>
      </div>`;
    VxCharts.bars($('cUnit'),{labels:units().map(u=>UNITS[u].replace('Unidade ','').replace('Centro de Distribuição','CD')),values:units().map(u=>sold(period,u).filter(inScope).reduce((a,o)=>a+total(o),0)),color:'#19E3D6',format:v=>'R$ '+num(Math.round(v))});
    $('csv').addEventListener('click',()=>{
      const rows=[['pedido','data','unidade','cliente','canal','itens','total']].concat(del.map(o=>[o.id,new Date(o.created).toISOString().slice(0,10),UNITS[o.unit],o.client,o.channel,o.items.reduce((a,i)=>a+i.qty,0),total(o).toFixed(2)]));
      const csv='﻿'+rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(';')).join('\n');
      const a=d.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`prateleira-vendas-${period}d-demonstracao.csv`;d.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
      K.toast(`<b>CSV gerado</b> com ${del.length} pedidos fictícios (arquivo local, nada foi enviado).`)});
  }

  /* ---------- Usuários (somente Administrador) ---------- */
  function usuarios(){
    const cols=[['Ver todas as unidades','allUnits'],['Relatórios',null,'relatorios'],['Cancelar pedidos','cancel'],['Entrada de estoque','entrada'],['Transferências','transfer'],['Ajuste de inventário','ajuste'],['Gerenciar usuários',null,'usuarios']];
    $('main').innerHTML=H('Usuários e permissões','Perfis definem o que cada pessoa vê e pode fazer','')+
      `<div class="panel pt-tablewrap" tabindex="0" role="region" aria-label="Usuários (fictícios)"><table class="pt-table"><caption class="vx-sr">Usuários (fictícios)</caption><thead><tr><th scope="col">Nome</th><th scope="col">Perfil</th><th scope="col">Unidade</th><th scope="col">Acesso</th></tr></thead><tbody>${S.users.map(u=>`<tr><th scope="row" data-l="Nome">${esc(u.name)}</th><td data-l="Perfil">${ROLES[u.role]}</td><td data-l="Unidade">${u.unit==='all'?'Todas':UNITS[u.unit]}</td><td data-l="Acesso">${u.id===me().id?'<span class="tag info">você</span>':`<label class="od-chk"><input type="checkbox" data-user="${u.id}" ${u.on?'checked':''}> ativo</label>`}</td></tr>`).join('')}</tbody></table></div>
      <section class="panel pt-perm"><div class="panel-h">Matriz de permissões</div><div class="panel-b pt-tablewrap" tabindex="0" role="region" aria-label="Permissões por perfil"><table class="pt-table pt-mini pt-matrix"><caption class="vx-sr">Permissões por perfil</caption><thead><tr><th scope="col">Permissão</th>${Object.values(ROLES).map(r=>`<th scope="col">${r}</th>`).join('')}</tr></thead><tbody>${cols.map(([l,k,v])=>`<tr><th scope="row">${l}</th>${Object.keys(ROLES).map(r=>{const ok=k?!!PERMS[r][k]:PERMS[r].views.includes(v);return `<td>${ok?'<span class="pt-yes" aria-label="Sim">✓</span>':'<span class="pt-no" aria-label="Não">—</span>'}</td>`}).join('')}</tr>`).join('')}</tbody></table></div></section>`;
  }

  /* ---------- Delegação de cliques ---------- */
  $('main').addEventListener('click',e=>{
    const t=e.target.closest('button');if(!t)return;
    if(t.dataset.per){period=+t.dataset.per;render();return}
    if(t.dataset.mode){ordMode=t.dataset.mode;pedidos();return}
    if(t.dataset.go){view=t.dataset.go;render();return}
    if(t.dataset.at!==undefined&&t.closest('[aria-label="Tipo de alerta"]')){atype=t.dataset.at;alertsView();return}
    if(t.dataset.open){const o=S.orders.find(x=>x.id===t.dataset.open);if(o)orderDlg(o);return}
    if(t.dataset.adv){const o=S.orders.find(x=>x.id===t.dataset.adv);if(o){advance(o);render();const nb=d.querySelector(`[data-open="${o.id}"]`);if(nb)nb.focus()}return}
    if(t.dataset.fix){moveDlg(t.dataset.fix==='tr'?'transfer':'entrada');return}
    if(t.dataset.adj){const [u,sku]=t.dataset.adj.split('|'),x=S.diverg.find(v=>v.unit===u&&v.sku===sku);if(!x)return;const diff=x.counted-S.stock[u][sku];S.stock[u][sku]=x.counted;S.moves.unshift({t:Date.now(),unit:u,sku,qty:diff,type:'Ajuste de inventário',by:me().id,note:'Contagem física'});S.diverg=S.diverg.filter(v=>v!==x);save();render();K.toast(`Estoque de <b>${esc(PBY[sku].name)}</b> ajustado para ${x.counted} (${diff>0?'+':''}${diff}).`)}
  });
  $('main').addEventListener('change',e=>{const u=e.target.dataset.user;if(!u)return;const x=S.users.find(v=>v.id===u);x.on=e.target.checked;save();K.toast(`${esc(x.name)}: acesso <b>${x.on?'ativado':'desativado'}</b>.`)});

  $('reset').addEventListener('click',()=>{S=seed();save();if(profile)render();K.toast('Dados de exemplo restaurados.')});
})();
