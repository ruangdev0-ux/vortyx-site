/* Mini CRM — funil kanban com arrastar, contatos e anotações (localStorage) */
(function(){
  const d=document,K=window.VxKit,KEY='crm';
  const ST=[{id:'novo',n:'Novo',c:'#8A90AA'},{id:'contato',n:'Em contato',c:'#19A7E3'},{id:'proposta',n:'Proposta',c:'#7462F5'},{id:'fechado',n:'Fechado',c:'#1FB46E'},{id:'perdido',n:'Perdido',c:'#E5485F'}];
  const day=n=>{const x=new Date();x.setDate(x.getDate()-n);return x.toISOString()};
  const SEED=()=>[
    {id:1,n:'Carla Nunes',e:'Nunes Odontologia',v:4800,s:'novo',next:'Ligar para entender a demanda',notes:[]},
    {id:2,n:'Bruno Teixeira',e:'Teixeira Auto Peças',v:12000,s:'contato',next:'Enviar portfólio',notes:[{t:'Quer catálogo online com pedidos.',at:day(2)}]},
    {id:3,n:'Aline Prado',e:'Prado Arquitetura',v:7500,s:'proposta',next:'Reunião de revisão na quinta',notes:[{t:'Proposta enviada.',at:day(1)}]},
    {id:4,n:'Fábio Lemos',e:'Lemos Contabilidade',v:3600,s:'fechado',next:'Reunião de início do projeto',notes:[]},
    {id:5,n:'Joana Ribeiro',e:'Doce Ribeiro',v:2900,s:'contato',next:'Aguardar retorno',notes:[]},
    {id:6,n:'Otávio Reis',e:'Reis Transportes',v:18500,s:'proposta',next:'Ajustar escopo',notes:[]},
    {id:7,n:'Marina Costa',e:'Studio Costa',v:5200,s:'novo',next:'Responder mensagem',notes:[]},
    {id:8,n:'Paulo Mendes',e:'Mendes Imóveis',v:9800,s:'perdido',next:'—',notes:[{t:'Optou por adiar o projeto.',at:day(5)}]},
    {id:9,n:'Rita Alves',e:'Alves Pet',v:4100,s:'fechado',next:'Enviar contrato',notes:[]}];
  let data=K.store(KEY,null)||SEED(),q='';
  const save=()=>K.save(KEY,data);
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const stOf=id=>ST.find(s=>s.id===id);
  const match=c=>!q||(c.n+' '+c.e).toLowerCase().includes(q);

  const board=d.getElementById('board');
  function render(){
    const vis=data.filter(match);
    board.innerHTML=ST.map((s,si)=>{const cs=vis.filter(c=>c.s===s.id),tot=cs.reduce((a,c)=>a+c.v,0);
      return `<div class="crm-col" data-st="${s.id}"><h2><i style="background:${s.c}"></i>${s.n}<small>${cs.length}</small><em>${K.brl(tot)}</em></h2><div class="crm-cards">${cs.length?cs.map(c=>`<article class="crm-card" data-id="${c.id}"><button type="button" class="open" data-open="${c.id}" aria-label="Abrir ${esc(c.n)}">⋯</button><b>${esc(c.n)}</b><span>${esc(c.e)}</span><div class="v"><span>${K.brl(c.v)}</span><span class="mv"><button type="button" data-mv="-1" aria-label="Mover ${esc(c.n)} para a etapa anterior" ${si===0?'disabled':''}>←</button><button type="button" data-mv="1" aria-label="Mover ${esc(c.n)} para a próxima etapa" ${si===ST.length-1?'disabled':''}>→</button></span></div></article>`).join(''):'<div class="crm-empty">Solte aqui</div>'}</div></div>`}).join('');
    const open=data.filter(c=>c.s!=='fechado'&&c.s!=='perdido'),won=data.filter(c=>c.s==='fechado'),lost=data.filter(c=>c.s==='perdido');
    const conv=won.length+lost.length?Math.round(won.length/(won.length+lost.length)*100):0;
    d.getElementById('kpis').innerHTML=`<div><span>Contatos</span><b>${data.length}</b><small>no funil</small></div><div><span>Em negociação</span><b>${K.brl(open.reduce((a,c)=>a+c.v,0)).replace(',00','')}</b><small>${open.length} oportunidades</small></div><div><span>Fechados</span><b>${K.brl(won.reduce((a,c)=>a+c.v,0)).replace(',00','')}</b><small>${won.length} negócios</small></div><div><span>Taxa de conversão</span><b>${conv}%</b><small>fechados ÷ finalizados</small></div>`;
    d.getElementById('count').textContent=`${vis.length} de ${data.length}`;
    d.getElementById('rows').innerHTML=vis.map(c=>{const s=stOf(c.s);return `<tr data-open="${c.id}" tabindex="0"><td><b>${esc(c.n)}</b><small>${esc(c.e)}</small></td><td><span class="st"><i style="background:${s.c}"></i>${s.n}</span></td><td class="mono">${K.brl(c.v)}</td><td>${esc(c.next||'—')}</td></tr>`}).join('')||'<tr><td colspan="4" class="muted">Nenhum contato encontrado.</td></tr>';
  }
  function move(id,dir){const c=data.find(x=>x.id===id),i=ST.findIndex(s=>s.id===c.s),n=Math.max(0,Math.min(ST.length-1,i+dir));if(n===i)return;setStage(c,ST[n].id)}
  function setStage(c,s){if(c.s===s)return;c.notes.unshift({t:`Movido de “${stOf(c.s).n}” para “${stOf(s).n}”.`,at:new Date().toISOString()});c.s=s;save();render();K.toast(`${c.n} → <b>${stOf(s).n}</b>`)}

  board.addEventListener('click',e=>{const m=e.target.closest('[data-mv]');if(m){const id=+m.closest('.crm-card').dataset.id;move(id,+m.dataset.mv);const card=board.querySelector(`[data-id="${id}"] [data-mv="${m.dataset.mv}"]`);if(card&&!card.disabled)card.focus();return}
    const o=e.target.closest('[data-open]');if(o)openDrawer(+o.dataset.open)});
  d.getElementById('rows').addEventListener('click',e=>{const r=e.target.closest('[data-open]');if(r)openDrawer(+r.dataset.open)});
  d.getElementById('rows').addEventListener('keydown',e=>{if(e.key==='Enter'){const r=e.target.closest('[data-open]');if(r)openDrawer(+r.dataset.open)}});

  /* arrastar com mouse ou caneta (pointer events) */
  let drag=null;
  board.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return; // no toque, o dedo rola; as setas movem os cartões
    const card=e.target.closest('.crm-card');if(!card||e.target.closest('button')||e.button>0)return;
    drag={card,id:+card.dataset.id,x:e.clientX,y:e.clientY,started:false,ghost:null,over:null}});
  addEventListener('pointermove',e=>{if(!drag)return;
    if(!drag.started){if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<6)return;drag.started=true;const r=drag.card.getBoundingClientRect();drag.dx=drag.x-r.left;drag.dy=drag.y-r.top;
      drag.ghost=drag.card.cloneNode(true);drag.ghost.classList.add('crm-ghost');drag.ghost.style.width=r.width+'px';d.body.appendChild(drag.ghost);drag.card.classList.add('drag')}
    drag.ghost.style.left=(e.clientX-drag.dx)+'px';drag.ghost.style.top=(e.clientY-drag.dy)+'px';
    const col=d.elementFromPoint(e.clientX,e.clientY)?.closest('.crm-col');
    if(drag.over&&drag.over!==col)drag.over.classList.remove('over');if(col){col.classList.add('over');drag.over=col}else drag.over=null});
  const end=()=>{if(!drag)return;const {started,ghost,over,id,card}=drag;drag=null;
    if(!started)return;ghost.remove();card.classList.remove('drag');if(over){over.classList.remove('over');setStage(data.find(c=>c.id===id),over.dataset.st)}};
  addEventListener('pointerup',end);addEventListener('pointercancel',end);

  /* busca */
  d.getElementById('q').addEventListener('input',e=>{q=e.target.value.trim().toLowerCase();render()});

  /* gaveta de contato */
  const drawer=d.getElementById('drawer'),form=d.getElementById('cform'),sel=d.getElementById('stageSel'),notesW=d.getElementById('notesWrap'),del=d.getElementById('del');
  sel.innerHTML=ST.map(s=>`<option value="${s.id}">${s.n}</option>`).join('');
  let editing=null,last=null;
  function openDrawer(id){last=d.activeElement;editing=id?data.find(c=>c.id===id):null;form.reset();
    d.getElementById('dTitle').textContent=editing?editing.n:'Novo contato';
    if(editing){form.n.value=editing.n;form.e.value=editing.e;form.v.value=editing.v;form.s.value=editing.s;form.next.value=editing.next||''}
    notesW.hidden=del.hidden=!editing;renderNotes();drawer.hidden=false;d.body.style.overflow='hidden';setTimeout(()=>form.n.focus(),40)}
  function closeDrawer(){drawer.hidden=true;d.body.style.overflow='';if(last&&last.isConnected)last.focus()}
  function renderNotes(){d.getElementById('notes').innerHTML=editing&&editing.notes.length?editing.notes.map(n=>`<li>${esc(n.t)}<small>${new Date(n.at).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</small></li>`).join(''):'<li class="muted">Sem anotações.</li>'}
  d.getElementById('add').addEventListener('click',()=>openDrawer(null));
  drawer.addEventListener('click',e=>{if(e.target===drawer||e.target.closest('[data-close]'))closeDrawer()});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!drawer.hidden)closeDrawer()});
  d.getElementById('addNote').addEventListener('click',()=>{const i=d.getElementById('note');if(!i.value.trim()||!editing)return;editing.notes.unshift({t:i.value.trim(),at:new Date().toISOString()});i.value='';save();renderNotes()});
  form.addEventListener('submit',e=>{e.preventDefault();if(!form.checkValidity()){form.reportValidity();return}
    const v={n:form.n.value.trim(),e:form.e.value.trim(),v:Math.max(0,+form.v.value||0),next:form.next.value.trim()};
    if(editing){if(editing.s!==form.s.value)editing.notes.unshift({t:`Etapa alterada para “${stOf(form.s.value).n}”.`,at:new Date().toISOString()});Object.assign(editing,v,{s:form.s.value})}
    else data.unshift(Object.assign(v,{id:Math.max(0,...data.map(c=>c.id))+1,s:form.s.value,notes:[{t:'Contato criado.',at:new Date().toISOString()}]}));
    save();render();closeDrawer();K.toast(editing?'Contato atualizado.':'Contato criado.')});
  del.addEventListener('click',()=>{if(!editing)return;data=data.filter(c=>c!==editing);save();render();closeDrawer();K.toast('Contato excluído (só neste navegador).')});
  d.getElementById('reset').addEventListener('click',()=>{data=SEED();save();render();K.toast('Dados de exemplo restaurados.')});
  render();
})();
