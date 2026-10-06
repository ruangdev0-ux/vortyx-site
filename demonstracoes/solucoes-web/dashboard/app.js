/* Dashboard empresarial — dados fictícios gerados no navegador, filtros por unidade e período */
(function(){
  const d=document,K=window.VxKit;
  const UNITS={centro:{base:5200,var:.35,seed:11},shopping:{base:7400,var:.3,seed:23},online:{base:4300,var:.5,seed:37}};
  const CH=['Loja física','Site','WhatsApp','Marketplace'];
  const CAT=[['Vestuário','#19E3D6'],['Calçados','#7462F5'],['Acessórios','#3626FA'],['Casa','#FFC24B'],['Outros','#6E7593']];
  const PROD=['Tênis Runner','Jaqueta Corta-vento','Mochila Urbana','Camiseta Dry','Relógio Smart Lite','Kit Meias'];
  let unit=K.store('dash-unit','all'),per=K.store('dash-per',30),salt=0;
  const lastRefresh=()=>new Date();

  /* série diária por unidade: base × sazonalidade semanal × tendência × ruído (determinístico) */
  function series(u,days,offset){const U=UNITS[u],r=K.rng(U.seed*1000+salt),out=[];
    for(let i=0;i<180;i++)r();
    const today=new Date();today.setHours(12,0,0,0);
    for(let i=days+offset-1;i>=offset;i--){const dt=new Date(today);dt.setDate(dt.getDate()-i);const wd=dt.getDay(),season=[.7,.85,.9,.95,1.05,1.3,1.4][wd];
      const n=(K.rng(U.seed*7919+i*31+salt)()-.5)*2*U.var;out.push(Math.max(0,U.base*season*(1+n)*(1+(180-i)/1800)))}
    return out}
  const sumArr=(a,b)=>a.map((v,i)=>v+(b[i]||0));
  function get(days,offset){const keys=unit==='all'?Object.keys(UNITS):[unit];return keys.map(k=>series(k,days,offset)).reduce(sumArr)}
  const total=a=>a.reduce((x,y)=>x+y,0);
  const short=v=>v>=1e6?`R$ ${(v/1e6).toFixed(2).replace('.',',')} mi`:v>=1e3?`R$ ${(v/1e3).toFixed(1).replace('.',',')} mil`:K.brl(v);
  const pct=(a,b)=>b?Math.round((a-b)/b*1000)/10:0;
  function spark(vals,color){const w=200,h=36,mx=Math.max(...vals),mn=Math.min(...vals),st=w/(vals.length-1);
    const pts=vals.map((v,i)=>`${(i*st).toFixed(1)},${(h-3-(v-mn)/((mx-mn)||1)*(h-6)).toFixed(1)}`).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`}

  function render(){
    const cur=get(per,0),prev=get(per,per),rev=total(cur),prevRev=total(prev);
    const r=K.rng(per*13+(unit.length*7)+salt);
    const orders=Math.round(rev/(unit==='online'?168:142)),pOrders=Math.round(prevRev/(unit==='online'?171:139));
    const tk=rev/orders,pTk=prevRev/pOrders;
    const conv=+(2.1+r()*1.4).toFixed(1),pConv=+(conv-(r()-.4)).toFixed(1);
    const k=(lbl,val,dl,sp,col,unit)=>{const up=dl>0;return `<div class="db-kpi"><span>${lbl}</span><b>${val}</b><small class="${dl===0?'':up?'up':'dn'}">${dl>0?'▲':dl<0?'▼':'■'} ${Math.abs(dl).toString().replace('.',',')}${unit||'%'} vs. <span class="db-lg">período </span>anterior</small>${spark(sp,col)}</div>`};
    const wk=a=>{const o=[];for(let i=0;i<a.length;i+=Math.max(1,Math.floor(a.length/14)))o.push(total(a.slice(i,i+Math.max(1,Math.floor(a.length/14)))));return o};
    d.getElementById('kpis').innerHTML=k('Receita',short(rev),pct(rev,prevRev),wk(cur),'#19E3D6')+k('Pedidos',orders.toLocaleString('pt-BR'),pct(orders,pOrders),wk(cur).map(v=>v/140),'#7462F5')+k('Ticket médio',K.brl(tk),pct(tk,pTk),wk(cur).map((v,i)=>v/(i+5)),'#FFC24B')+k('Conversão do site',`${String(conv).replace('.',',')}%`,+(conv-pConv).toFixed(1),wk(prev),'#3EE08F',' p.p.');

    // receita × meta
    const today=new Date();const labels=cur.map((_,i)=>{const x=new Date(today);x.setDate(x.getDate()-(cur.length-1-i));return `${String(x.getDate()).padStart(2,'0')}/${String(x.getMonth()+1).padStart(2,'0')}`});
    let lab=labels,vals=cur;
    if(per===90){lab=[];vals=[];for(let i=0;i<cur.length;i+=7){lab.push(labels[i]);vals.push(total(cur.slice(i,i+7)))}}
    const goalDay=total(prev)/prev.length*1.08,meta=vals.map(()=>per===90?goalDay*7:goalDay);
    d.getElementById('lineSub').textContent=per===90?'por semana':'por dia';
    VxCharts.line(d.getElementById('line'),{labels:lab,series:[{name:'Receita',values:vals.map(Math.round),color:'#19E3D6'},{name:'Meta',values:meta.map(Math.round),color:'#7462F5',dash:true}],format:v=>v>=1000?`${Math.round(v/1000)}k`:Math.round(v)});

    // meta
    const goal=goalDay*per,p=Math.min(1.5,rev/goal),C=2*Math.PI*74;
    d.getElementById('goal').innerHTML=`<div class="db-ring"><svg viewBox="0 0 170 170" aria-hidden="true"><defs><linearGradient id="gGoal"><stop offset="0" stop-color="#3626FA"/><stop offset="1" stop-color="#19E3D6"/></linearGradient></defs><circle class="bg" cx="85" cy="85" r="74"/><circle class="fg" cx="85" cy="85" r="74" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg><div><b>${Math.round(p*100)}%</b><small>da meta</small></div></div><p><b>${short(rev)}</b> de ${short(goal)}</p><p>${p>=1?'Meta batida no período (dado fictício).':`Faltam ${short(goal-rev)} (dado fictício).`}</p>`;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{const fg=d.querySelector('#goal .fg');if(fg)fg.style.strokeDashoffset=C*(1-Math.min(1,p))}));

    // canais
    const sh=unit==='online'?[0,.55,.2,.25]:unit==='all'?[.48,.24,.16,.12]:[.72,.08,.15,.05];
    VxCharts.bars(d.getElementById('bars'),{labels:CH.map(c=>c.split(' ')[0]),values:sh.map(s=>Math.round(rev*s)),color:'#3626FA',highlight:sh.indexOf(Math.max(...sh)),hcolor:'#19E3D6',format:v=>v>=1000?`${Math.round(v/1000)}k`:Math.round(v)});

    // mix
    const mixR=K.rng(unit.length*101+per+salt),raw=CAT.map(()=>.4+mixR()),tr=total(raw);
    const mix=CAT.map((c,i)=>({label:c[0],value:Math.round(rev*raw[i]/tr),color:c[1]}));
    VxCharts.donut(d.getElementById('donut'),{items:mix,center:[short(rev).replace('R$ ',''),'receita']});
    d.getElementById('mix').innerHTML=mix.map(m=>`<li><i style="background:${m.color}"></i>${m.label}<b>${Math.round(m.value/rev*100)}%</b></li>`).join('');

    // top produtos
    const tR=K.rng(per*3+unit.length*17+salt),q=PROD.map(()=>Math.round((20+tR()*80)*per/30*(unit==='all'?3:1))).sort((a,b)=>b-a),mx=q[0];
    const order=[...PROD].sort(()=>tR()-.5);
    d.getElementById('top').innerHTML=order.slice(0,5).map((n,i)=>`<div><span>${i+1}</span><span>${n}</span><b>${q[i]} un.</b><i style="--w:${q[i]/mx*100}%"></i></div>`).join('');

    d.getElementById('upd').textContent=`Atualizado às ${lastRefresh().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})} · ${unit==='all'?'todas as unidades':d.querySelector(`#unit option[value="${unit}"]`).textContent} · ${per} dias`;
  }

  const unitSel=d.getElementById('unit');unitSel.value=unit;
  unitSel.addEventListener('change',()=>{unit=unitSel.value;K.save('dash-unit',unit);render()});
  const perEl=d.getElementById('per');
  const setPer=n=>{per=n;K.save('dash-per',n);perEl.querySelectorAll('[data-p]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.p===n))};
  setPer(per);
  perEl.addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;setPer(+b.dataset.p);render()});
  const rb=d.getElementById('refresh'),main=d.querySelector('.db');
  rb.addEventListener('click',()=>{rb.disabled=true;rb.classList.add('spin');main.classList.add('loading');
    setTimeout(()=>{salt++;render();rb.disabled=false;rb.classList.remove('spin');main.classList.remove('loading');K.toast('Dados atualizados (nova amostra fictícia).')},K.reduce?0:700)});
  render();
})();
