/* Captação de lead — validação, CRM e notificação (simulação local) */
(function(){
  const d=document,K=window.VxKit;
  const flow=VxFlow(d.getElementById('flow'),[{id:'frm',label:'Formulário',icon:'form'},{id:'val',label:'Validação',icon:'check'},{id:'crm',label:'CRM',icon:'db'},{id:'not',label:'Notificação',icon:'bell'}]);
  const form=d.getElementById('form'),err=d.getElementById('err'),state=d.getElementById('flowState'),send=d.getElementById('send');
  const NAMES=['Carla Nunes','Bruno Teixeira','Aline Prado','Fábio Lemos','Joana Ribeiro','Otávio Reis'];
  const SELLERS=['Lívia','Rui','Paula'];
  let leads=K.store('leads',[]),notes=[];
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const digits=s=>s.replace(/\D/g,'');
  form.tel.addEventListener('input',()=>{const v=digits(form.tel.value).slice(0,11);form.tel.value=v.length>6?`(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`:v.length>2?`(${v.slice(0,2)}) ${v.slice(2)}`:v});

  function validate(v){const e=[];
    if(v.nome.trim().length<3)e.push(['nome','nome muito curto']);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email))e.push(['email','e-mail inválido']);
    const t=digits(v.tel);if(t.length<10||t.length>11)e.push(['tel','telefone incompleto']);
    if(leads.some(l=>l.email===v.email.toLowerCase()))e.push(['email','contato já existe no CRM']);
    return e}
  function score(v){let s=40;s+=+v.budget===3?30:+v.budget===2?15:0;s+=v.origem==='Indicação'?20:v.origem==='Google'?10:5;s+=v.interesse==='Sistema sob medida'||v.interesse==='Automação'?10:0;return Math.min(99,s)}

  form.addEventListener('submit',async e=>{e.preventDefault();if(flow.running)return;
    const v=Object.fromEntries(new FormData(form));form.querySelectorAll('.input').forEach(i=>i.removeAttribute('aria-invalid'));err.hidden=true;
    const errs=validate(v);send.disabled=true;state.textContent='processando…';
    if(errs.length){
      await flow.run([{id:'frm',text:'dados recebidos'},{id:'val',text:errs[0][1],error:true}]);
      errs.forEach(([f])=>form[f].setAttribute('aria-invalid','true'));
      err.textContent='A validação barrou o envio: '+errs.map(x=>x[1]).join(', ')+'. Nada foi para o CRM.';err.hidden=false;
      state.textContent='bloqueado na validação';send.disabled=false;form[errs[0][0]].focus();return}
    const sc=score(v),pri=sc>=75?['Alta','ok']:sc>=55?['Média','warn']:['Baixa','info'],who=SELLERS[leads.length%SELLERS.length];
    await flow.run([{id:'frm',text:'dados recebidos'},{id:'val',text:'e-mail e telefone ok'},{id:'crm',text:`contato criado · score ${sc}`},{id:'not',text:`aviso para ${who}`}]);
    leads.unshift({n:v.nome.trim(),email:v.email.toLowerCase(),i:v.interesse,o:v.origem,sc,p:pri,who,at:Date.now()});leads=leads.slice(0,20);K.save('leads',leads);
    notes.unshift({t:`Novo lead para ${who}: <b>${esc(v.nome.trim())}</b> quer ${esc(v.interesse.toLowerCase())} · prioridade ${pri[0].toLowerCase()}`,at:new Date()});
    render(true);form.reset();state.textContent='concluído';send.disabled=false;
  });
  function render(fresh){
    d.getElementById('crmCount').textContent=leads.length;
    d.getElementById('crm').innerHTML=leads.length?leads.map((l,i)=>`<li class="${fresh&&i===0?'new':''}"><b>${esc(l.n)}</b><span class="tag ${l.p[1]}">${l.p[0]} · ${l.sc}</span><small>${esc(l.email)} · ${esc(l.i)} · origem ${esc(l.o)} · resp. ${l.who}</small></li>`).join(''):'<li class="cl-empty">Nenhum contato ainda.</li>';
    d.getElementById('notif').innerHTML=notes.length?notes.slice(0,6).map(n=>`<li><div>${n.t}<small>${n.at.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})} · notificação simulada</small></div></li>`).join(''):'<li class="cl-empty">As notificações aparecem aqui.</li>';
  }
  d.getElementById('fill').addEventListener('click',()=>{const n=NAMES[Math.floor(Math.random()*NAMES.length)],u=n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(' ','.');
    form.nome.value=n;form.email.value=`${u}${Math.floor(Math.random()*90+10)}@exemplo.com`;form.tel.value='(00) 9'+Math.floor(1000+Math.random()*8999)+'-'+Math.floor(1000+Math.random()*8999);
    form.interesse.selectedIndex=Math.floor(Math.random()*4);form.budget.selectedIndex=Math.floor(Math.random()*3);form.origem.selectedIndex=Math.floor(Math.random()*4)});
  d.getElementById('bad').addEventListener('click',()=>{form.nome.value='Lu';form.email.value='lu@exemplo';form.tel.value='(00) 9123';});
  d.getElementById('clear').addEventListener('click',()=>{leads=[];notes=[];K.drop('leads');render();flow.reset();state.textContent='aguardando envio'});
  render();
})();
