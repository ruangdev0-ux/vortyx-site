/* Controle de vendas — lançamentos, filtros, gráficos e CSV (dados fictícios no localStorage) */
(function(){
  const d=document,K=window.VxKit,KEY='vendas';
  const PRODS=[['Camiseta estampada',69.9],['Boné aba curva',49.9],['Moletom canguru',159.9],['Caneca personalizada',39.9],['Ecobag',34.9],['Kit adesivos',14.9]];
  const PAYS=[['pix','Pix','#FFB547'],['credito','Crédito','#FF7A45'],['debito','Débito','#19E3D6'],['dinheiro','Dinheiro','#3EE08F']];
  const CLIS=['Ana Souza','Bruno Lima','Carla Dias','Diego Rocha','Elisa Moura','Felipe Arantes','Gabi Torres','Hugo Neves','Isis Campos','João Pires','Kátia Lopes','Lucas Brito'];
  const dk=x=>`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
  const today=new Date();today.setHours(12,0,0,0);
  const back=n=>{const x=new Date(today);x.setDate(x.getDate()-n);return dk(x)};
  function seed(){const r=K.rng(20261005),out=[];let id=1;
    for(let day=59;day>=0;day--){const n=1+Math.floor(r()*4.5);for(let i=0;i<n;i++){const p=Math.floor(r()*PRODS.length),q=1+Math.floor(r()*3),pg=PAYS[Math.floor(r()*r()*4)][0],ds=r()<.15?10:0;
      out.push({id:id++,dt:back(day),cli:CLIS[Math.floor(r()*CLIS.length)],p,q,pg,ds,t:+(PRODS[p][1]*q*(1-ds/100)).toFixed(2)})}}
    return out}
  let data=K.store(KEY,null);
  // dados de exemplo muito antigos (visita anterior) são recriados para o período atual
  if(!data||!data.length||data.reduce((m,s)=>s.dt>m?s.dt:m,'')<back(6))data=seed();
  let per=7,fPg='',fQ='',fresh=null;
  const save=()=>K.save(KEY,data);
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const payOf=id=>PAYS.find(p=>p[0]===id);
  const fmtD=s=>{const [y,m,dd]=s.split('-');return `${dd}/${m}`};

  /* formulário */
  const form=d.getElementById('form'),box=d.getElementById('newSale'),nb=d.getElementById('newBtn');
  d.getElementById('prodSel').innerHTML=PRODS.map((p,i)=>`<option value="${i}">${p[0]} · ${K.brl(p[1])}</option>`).join('');
  d.getElementById('pgSel').innerHTML=PAYS.map(p=>`<option value="${p[0]}">${p[1]}</option>`).join('');
  d.getElementById('fPg').innerHTML+=PAYS.map(p=>`<option value="${p[0]}">${p[1]}</option>`).join('');
  const calc=()=>{const t=PRODS[+form.prod.value][1]*Math.max(1,+form.q.value||1)*(1-Math.min(50,Math.max(0,+form.ds.value||0))/100);d.getElementById('sum').textContent=K.brl(t);return +t.toFixed(2)};
  form.addEventListener('input',calc);
  nb.addEventListener('click',()=>{box.hidden=!box.hidden;nb.setAttribute('aria-expanded',!box.hidden);if(!box.hidden){form.dt.value=dk(today);form.dt.max=dk(today);calc();form.cli.focus()}});
  form.addEventListener('submit',e=>{e.preventDefault();if(!form.checkValidity()){form.reportValidity();return}
    const s={id:Math.max(0,...data.map(x=>x.id))+1,dt:form.dt.value,cli:form.cli.value.trim(),p:+form.prod.value,q:+form.q.value,pg:form.pg.value,ds:+form.ds.value||0,t:calc()};
    data.push(s);save();fresh=s.id;
    const age=Math.round((today-new Date(s.dt+'T12:00'))/864e5);if(age>=per)setPer(30);
    form.cli.value='';form.q.value=1;form.ds.value=0;calc();render();K.toast(`Venda de ${K.brl(s.t)} lançada (simulação).`)});

  /* filtros */
  const perEl=d.getElementById('per');
  function setPer(n){per=n;perEl.querySelectorAll('[data-p]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.p===n))}
  perEl.addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;setPer(+b.dataset.p);render()});
  d.getElementById('fPg').addEventListener('change',e=>{fPg=e.target.value;render()});
  d.getElementById('fQ').addEventListener('input',e=>{fQ=e.target.value.trim().toLowerCase();render()});

  function inRange(s,n,off){const a=back(off+n-1),b=back(off);return s.dt>=a&&s.dt<=b}
  const flt=s=>(!fPg||s.pg===fPg)&&(!fQ||(s.cli+' '+PRODS[s.p][0]).toLowerCase().includes(fQ));
  function render(){
    const cur=data.filter(s=>inRange(s,per,0)&&flt(s)),prev=data.filter(s=>inRange(s,per,per)&&flt(s));
    const sum=a=>a.reduce((x,s)=>x+s.t,0),tot=sum(cur),ptot=sum(prev),tk=cur.length?tot/cur.length:0,items=cur.reduce((x,s)=>x+s.q,0);
    const delta=ptot?Math.round((tot-ptot)/ptot*100):null;
    const lbl=per===1?'ontem':`${per} dias anteriores`;
    d.getElementById('kpis').innerHTML=`<div><span>Total vendido</span><b>${K.brl(tot)}</b><small class="${delta>0?'up':delta<0?'dn':''}">${delta===null?'sem base de comparação':`${delta>0?'▲':delta<0?'▼':'■'} ${Math.abs(delta)}% vs. ${lbl}`}</small></div>
      <div><span>Vendas</span><b>${cur.length}</b><small>no período</small></div><div><span>Ticket médio</span><b>${K.brl(tk)}</b><small>por venda</small></div><div><span>Itens</span><b>${items}</b><small>unidades</small></div>`;
    // linha por dia
    const days=Math.max(per,7),labels=[],vals=[];for(let i=days-1;i>=0;i--){const k=back(i);labels.push(fmtD(k));vals.push(+sum(data.filter(s=>s.dt===k&&flt(s))).toFixed(2))}
    d.getElementById('lineSub').textContent=`últimos ${days} dias`;
    VxCharts.line(d.getElementById('line'),{labels,series:[{name:'Vendas',values:vals,color:'#FFB547'}],format:v=>v>=1000?`${(v/1000).toFixed(1).replace('.',',')}k`:Math.round(v)});
    // rosca por pagamento
    const items2=PAYS.map(p=>({label:p[1],value:+sum(cur.filter(s=>s.pg===p[0])).toFixed(2),color:p[2]}));
    VxCharts.donut(d.getElementById('donut'),{items:items2.some(i=>i.value)?items2:[{label:'Sem vendas',value:1,color:'#3a3328'}],center:[String(cur.length),'vendas']});
    d.getElementById('legend').innerHTML=items2.map(i=>`<li><i style="background:${i.color}"></i><span>${i.label}</span><b>${tot?Math.round(i.value/tot*100):0}%</b></li>`).join('');
    // tabela
    const rows=[...cur].sort((a,b)=>b.dt.localeCompare(a.dt)||b.id-a.id);
    d.getElementById('cnt').textContent=`${rows.length} no período`;
    d.getElementById('rows').innerHTML=rows.length?rows.map(s=>`<tr class="${s.id===fresh?'new':''}"><td class="mono">${fmtD(s.dt)}</td><td>${esc(s.cli)}</td><td>${PRODS[s.p][0]}<small>${s.q} un.${s.ds?` · ${s.ds}% desc.`:''}</small></td><td>${payOf(s.pg)[1]}</td><td class="r">${K.brl(s.t)}</td><td><button class="del" type="button" data-del="${s.id}" aria-label="Excluir venda de ${esc(s.cli)}">✕</button></td></tr>`).join(''):'<tr class="cv-empty"><td colspan="6">Nenhuma venda neste período e filtro.</td></tr>';
  }
  d.getElementById('rows').addEventListener('click',e=>{const b=e.target.closest('[data-del]');if(!b)return;data=data.filter(s=>s.id!==+b.dataset.del);save();render();K.toast('Venda excluída (só neste navegador).')});

  /* exportação CSV (gerada no navegador) */
  d.getElementById('csv').addEventListener('click',()=>{const cur=data.filter(s=>inRange(s,per,0)&&flt(s));
    const lines=[['data','cliente','produto','quantidade','pagamento','desconto_%','total']].concat(cur.map(s=>[s.dt,s.cli,PRODS[s.p][0],s.q,payOf(s.pg)[1],s.ds,s.t.toFixed(2).replace('.',',')]));
    const csv='﻿'+lines.map(l=>l.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';')).join('\n');
    const a=d.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`vendas-demo-${dk(today)}.csv`;d.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
    K.toast(`CSV com ${cur.length} vendas gerado no seu navegador.`)});
  d.getElementById('reset').addEventListener('click',()=>{data=seed();save();fresh=null;render();K.toast('Dados de exemplo restaurados.')});
  render();
})();
