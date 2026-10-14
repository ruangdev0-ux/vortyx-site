/* Captação de lead — entrada → validação → registro → encaminhamento (simulação local) */
(function(){
  const d=document,K=window.VxKit,reduce=K.reduce;
  const $=id=>d.getElementById(id);
  const flow=VxFlow($('flow'),[{id:'in',label:'Entrada',icon:'form'},{id:'val',label:'Validação',icon:'check'},{id:'reg',label:'Registro',icon:'db'},{id:'enc',label:'Encaminhamento',icon:'bell'}],{linkMs:300,stepMs:380});
  const HINTS={in:'formulário do site',val:'confere os dados',reg:'cria o contato no CRM',enc:'avisa a pessoa responsável'};
  const form=$('form'),state=$('flowState'),send=$('send'),result=$('result'),panel=$('flowPanel'),tip=$('tip'),rules=$('rules');
  const NAMES=['Carla Nunes','Bruno Teixeira','Aline Prado','Fábio Lemos','Joana Ribeiro','Otávio Reis'];
  const SELLERS=['Lívia','Rui','Paula'];
  let leads=K.store('leads',[]),busy=false;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const digits=s=>s.replace(/\D/g,'');
  const mask=v=>{v=digits(v).slice(0,11);return v.length>6?`(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`:v.length>2?`(${v.slice(0,2)}) ${v.slice(2)}`:v};
  form.tel.addEventListener('input',()=>{form.tel.value=mask(form.tel.value)});

  function hints(){flow.reset();d.querySelectorAll('#flow .vxf-node').forEach(n=>n.querySelector('.vxf-t').textContent=HINTS[n.dataset.id])}

  /* ---------- Validação: as mesmas regras de antes, agora visíveis ---------- */
  const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function checks(v){
    const mailOk=EMAIL.test(v.email),t=digits(v.tel).length,dup=mailOk&&leads.some(l=>l.email===v.email.toLowerCase());
    return [
      {f:'nome',ok:v.nome.trim().length>=3,label:'Nome com pelo menos 3 letras',msg:'nome muito curto',hint:'Use pelo menos 3 letras.'},
      {f:'email',ok:mailOk,label:'E-mail em formato válido',msg:'e-mail inválido',hint:'Confira o formato, ex.: nome@empresa.com.br'},
      {f:'tel',ok:t>=10&&t<=11,label:'WhatsApp com DDD',msg:'WhatsApp incompleto',hint:'Informe DDD + número (10 ou 11 dígitos).'},
      {f:'email',ok:mailOk?!dup:null,label:'Contato ainda não cadastrado',msg:'contato já está no CRM',hint:'Este e-mail já está no CRM. Duplicados não entram.'}
    ];
  }
  /* ---------- Prioridade: mesmos pesos e faixas de antes ---------- */
  function score(v){
    const b=+v.budget,parts=[['base',40]];
    parts.push(['orçamento',b===3?30:b===2?15:0]);
    parts.push([`origem ${v.origem}`,v.origem==='Indicação'?20:v.origem==='Google'?10:5]);
    const hot=v.interesse==='Sistema sob medida'||v.interesse==='Automação';
    parts.push(['interesse',hot?10:0]);
    const sum=parts.reduce((a,p)=>a+p[1],0),sc=Math.min(99,sum);
    const pri=sc>=75?['Alta','ok']:sc>=55?['Média','warn']:['Baixa','info'];
    const calc=parts.filter(p=>p[1]||p[0]==='base').map(p=>`${p[1]} ${p[0]}`).join(' + ')+` = ${sum}`+(sum>99?' (limite 99)':'')+` → ${pri[0]}`;
    return {sc,pri,calc,keys:['base','b'+b,'o'+v.origem,'i'+(hot?1:0),pri[0]]};
  }
  /* Rodízio: o próximo depois de quem recebeu o último contato (Lívia → Rui → Paula → Lívia).
     Antes era calculado pelo tamanho do CRM, que trava em 20 contatos; o resultado é o mesmo até lá. */
  const nextSeller=()=>leads.length?SELLERS[(SELLERS.indexOf(leads[0].who)+1)%SELLERS.length]:SELLERS[0];

  function mark(keys){rules.querySelectorAll('em').forEach(e=>e.classList.toggle('on',keys.includes(e.dataset.r)))}
  function fieldErrors(list){
    ['nome','email','tel'].forEach(f=>{form[f].removeAttribute('aria-invalid');const p=$('e-'+f);p.hidden=true;p.textContent=''});
    list.forEach(c=>{form[c.f].setAttribute('aria-invalid','true');const p=$('e-'+c.f);if(p.hidden){p.textContent=c.hint;p.hidden=false}});
  }
  const ck=list=>`<ul class="cl-checks">${list.map(c=>{const s=c.ok===true?['ok','✓','aprovado']:c.ok===false?['bad','✗','falhou']:['na','–','não conferido'];
    return `<li class="${s[0]}"><span class="ck" aria-hidden="true">${s[1]}</span>${c.label}<span class="vx-sr">: ${s[2]}</span>${c.ok===false?`<small>${c.msg}</small>`:c.ok===null?'<small>e-mail inválido</small>':''}</li>`}).join('')}</ul>`;

  function lock(v){busy=v;[send,$('fill'),$('bad'),$('dup'),$('clear')].forEach(b=>b.disabled=v)}
  function toFlow(){
    const box=$('flow').getBoundingClientRect(),top=parseFloat(getComputedStyle(panel).scrollMarginTop)||0;
    if(box.top<top||box.bottom>innerHeight)panel.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  }

  form.addEventListener('submit',async e=>{e.preventDefault();if(busy||flow.running)return;
    const v=Object.fromEntries(new FormData(form)),list=checks(v),bad=list.filter(c=>c.ok===false);
    lock(true);tip.textContent='';fieldErrors([]);result.hidden=true;mark([]);state.textContent='processando…';toFlow();
    const entry={id:'in',text:`formulário do site · origem ${v.origem}`};
    if(bad.length){
      await flow.run([entry,{id:'val',text:`falhou: ${bad[0].msg}${bad.length>1?` (+${bad.length-1})`:''}`,error:true}]);
      fieldErrors(bad);
      result.innerHTML=`<div class="row"><span class="tag bad">Barrado</span><span>${bad.length} de 4 conferências ${bad.length===1?'falhou':'falharam'}. Nada foi para o CRM.</span></div>${ck(list)}`;
      result.hidden=false;state.textContent='bloqueado na validação';lock(false);
      form[bad[0].f].focus({preventScroll:true});toFlow();return;
    }
    const s=score(v),who=nextSeller(),name=v.nome.trim(),interest=v.interesse.toLowerCase();
    await flow.run([entry,{id:'val',text:'4 de 4 conferências ok'},{id:'reg',text:`contato criado no CRM · prioridade ${s.pri[0]}`},{id:'enc',text:`${who} · aviso enviado (simulado)`}]);
    leads.unshift({n:name,email:v.email.toLowerCase(),t:v.tel,i:v.interesse,o:v.origem,sc:s.sc,p:s.pri,calc:s.calc,who,at:Date.now()});
    leads=leads.slice(0,20);K.save('leads',leads);render(true);mark([...s.keys,who]);
    result.innerHTML=`<div class="row"><span class="tag ${s.pri[1]}">${s.pri[0]} · ${s.sc}</span><span><b>${esc(name)}</b> registrado no CRM · responsável <b>${who}</b></span></div>
      ${ck(list)}<p class="cl-ok">Formato e duplicidade conferidos.</p>
      <dl class="cl-why"><dt>Prioridade</dt><dd>${esc(s.calc)}</dd><dt>Responsável</dt><dd>${who}, a próxima do rodízio Lívia → Rui → Paula</dd></dl>
      <div class="cl-alert"><small>Aviso enviado para ${who} · simulação</small>Novo lead: <b>${esc(name)}</b> quer ${esc(interest)} · prioridade ${s.pri[0].toLowerCase()}</div>`;
    result.hidden=false;form.reset();state.textContent='concluído';lock(false);
  });

  function render(fresh){
    $('crmCount').textContent=`${leads.length} ${leads.length===1?'contato':'contatos'}`;
    $('crm').innerHTML=leads.length?leads.map((l,i)=>`<li class="${fresh&&i===0?'new':''}"><b>${esc(l.n)}</b><span class="tag ${l.p[1]}">${l.p[0]} · ${l.sc}</span><small>${esc(l.email)} · ${esc(l.i)} · origem ${esc(l.o)}</small><span class="cl-av">Aviso enviado para ${esc(l.who)} · simulação</span></li>`).join(''):'<li class="cl-empty">Nenhum contato ainda.</li>';
  }

  /* ---------- Exemplos: só preenchem; o envio continua manual ---------- */
  function filled(msg){fieldErrors([]);tip.textContent=msg||''}
  $('fill').addEventListener('click',()=>{const n=NAMES[Math.floor(Math.random()*NAMES.length)],u=n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(' ','.');
    form.nome.value=n;form.email.value=`${u}${Math.floor(Math.random()*90+10)}@exemplo.com`;form.tel.value='(00) 9'+Math.floor(1000+Math.random()*8999)+'-'+Math.floor(1000+Math.random()*8999);
    form.interesse.selectedIndex=Math.floor(Math.random()*4);form.budget.selectedIndex=Math.floor(Math.random()*3);form.origem.selectedIndex=Math.floor(Math.random()*4);filled()});
  $('bad').addEventListener('click',()=>{form.nome.value='Lu';form.email.value='lu@exemplo';form.tel.value='(00) 9123';filled()});
  $('dup').addEventListener('click',()=>{
    if(!leads.length){filled('O CRM ainda está vazio: envie um contato válido primeiro (use “Preencher exemplo”) e depois teste o repetido.');return}
    const l=leads[0];form.nome.value=l.n;form.email.value=l.email;form.tel.value=l.t||'(00) 91234-5678';
    filled(`Preenchido com ${l.n}, que já está no CRM. Envie para ver a checagem de duplicidade.`)});
  $('clear').addEventListener('click',()=>{leads=[];K.drop('leads');render();hints();mark([]);fieldErrors([]);tip.textContent='';result.hidden=true;state.textContent='aguardando envio'});
  hints();render();
})();
