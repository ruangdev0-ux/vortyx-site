/* Pulso Academia — planos, grade, matrícula simulada e 3D (dados fictícios) */
(function(){
  const d=document,K=window.VxKit;
  const ICO={
    musc:'<path d="M6 20h4M22 20h4M10 14v12M22 14v12M13 17v6M19 17v6M13 20h6" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    func:'<path d="M16 6a3 3 0 1 1 0 .1M10 28l4-9 4 3 2 6M12 14l4 2 6-3M14 19l-6-2" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    bike:'<circle cx="9" cy="22" r="5" stroke="currentColor" stroke-width="2.4" fill="none"/><circle cx="24" cy="22" r="5" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M9 22l5-9h7l3 9M14 13l-2-4h-3M17 13l3 9" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    luta:'<path d="M9 12a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v5a5 5 0 0 1-5 5h-6l-3 4v-4a3 3 0 0 1 0-6Z" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linejoin="round"/><path d="M13 13h7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    yoga:'<circle cx="16" cy="7" r="3" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M16 11v8M6 16l10 3 10-3M10 27l6-8 6 8" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    hiit:'<path d="M18 4 8 18h8l-2 10 10-14h-8Z" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linejoin="round"/>'
  };
  const MODS=[
    {id:'musc',n:'Musculação',d:'Área completa de pesos livres e máquinas, com ficha montada pelo professor.',lv:['Todos os níveis'],c:'#D4FF3A'},
    {id:'func',n:'Funcional',d:'Circuitos em grupo para força, equilíbrio e coordenação.',lv:['Iniciante','Intermediário'],c:'#3AE0FF'},
    {id:'bike',n:'Bike indoor',d:'Aula com música e luz, intensidade guiada por zonas.',lv:['Todos os níveis'],c:'#FF4D2E'},
    {id:'luta',n:'Muay thai',d:'Técnica, condicionamento e trabalho de saco e manopla.',lv:['Iniciante','Avançado'],c:'#FFB020'},
    {id:'yoga',n:'Yoga & mobilidade',d:'Alongamento, respiração e mobilidade para recuperar.',lv:['Todos os níveis'],c:'#B78CFF'},
    {id:'hiit',n:'HIIT 30',d:'Treino intervalado de 30 minutos para quem tem pouco tempo.',lv:['Intermediário'],c:'#FF5FA2'}
  ];
  const PLANS=[
    {id:'base',n:'Base',f:'Para quem treina sozinho',m:99.9,inc:['Musculação livre','Avaliação física inicial','Treino no app'],no:['Aulas coletivas','Acesso a outras unidades']},
    {id:'total',n:'Total',f:'O mais escolhido',m:149.9,hot:1,inc:['Musculação livre','Todas as aulas coletivas','Reavaliação a cada 60 dias','Treino no app'],no:['Acesso a outras unidades']},
    {id:'black',n:'Black',f:'Para quem quer tudo',m:219.9,inc:['Tudo do plano Total','Acesso a todas as unidades','2 sessões de personal por mês','Toalha e armário']}
  ];
  const COACH=[
    {n:'Rafa Duarte',r:'Musculação e força',t:['Hipertrofia','Iniciantes'],c:['#D4FF3A','#7aa000']},
    {n:'Lia Moreno',r:'Funcional e HIIT',t:['Emagrecimento','Circuitos'],c:['#3AE0FF','#0a6b80']},
    {n:'Caio Brandt',r:'Muay thai',t:['Técnica','Condicionamento'],c:['#FFB020','#8a4b00']},
    {n:'Nina Sato',r:'Yoga e bike',t:['Mobilidade','Respiração'],c:['#B78CFF','#4b2a91']}
  ];
  const DAYS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],FULL=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
  // [hora, mod, professor, sala]; um padrão para dias úteis e outro para fim de semana
  const WEEK=[['06:30','bike','Nina Sato','Sala Bike'],['07:00','func','Lia Moreno','Estúdio 1'],['07:30','hiit','Lia Moreno','Estúdio 2'],['12:15','hiit','Lia Moreno','Estúdio 2'],['17:30','luta','Caio Brandt','Tatame'],['18:00','func','Lia Moreno','Estúdio 1'],['18:30','bike','Nina Sato','Sala Bike'],['19:00','yoga','Nina Sato','Estúdio 2'],['19:30','luta','Caio Brandt','Tatame'],['20:00','hiit','Rafa Duarte','Estúdio 1']];
  const WKND=[['08:00','func','Lia Moreno','Estúdio 1'],['09:00','bike','Nina Sato','Sala Bike'],['10:00','yoga','Nina Sato','Estúdio 2'],['10:30','luta','Caio Brandt','Tatame']];
  const sched=w=>w===0?WKND.slice(1,3):w===6?WKND:WEEK.filter((_,i)=>w%2?i!==7:i!==4&&i!==8);
  const modOf=id=>MODS.find(m=>m.id===id);

  /* modalidades */
  d.getElementById('mods').innerHTML=MODS.map((m,i)=>`<article class="pa-mod" data-reveal style="--d:${i%3}"><span class="num">${String(i+1).padStart(2,'0')}</span><svg class="ico" viewBox="0 0 32 32" aria-hidden="true">${ICO[m.id]}</svg><h3>${m.n}</h3><p>${m.d}</p><div class="lv">${m.lv.map(x=>`<span>${x}</span>`).join('')}</div></article>`).join('');

  /* planos */
  let per='m';const plans=d.getElementById('plans');
  const price=p=>per==='m'?p.m:p.m*.8;
  function renderPlans(){plans.innerHTML=PLANS.map(p=>`<article class="pa-plan${p.hot?' hot':''}">${p.hot?'<span class="flag">Mais escolhido</span>':''}<h3>${p.n}</h3><p class="for">${p.f}</p>
    <div class="pa-price"><b>${K.brl(price(p)).replace(/\s/g,' ')}</b><span>/mês</span></div><div class="pa-price-n">${per==='a'?`Plano anual · ${K.brl(price(p)*12)} por ano`:'Sem fidelidade'}</div>
    <ul>${p.inc.map(x=>`<li>${x}</li>`).join('')}${(p.no||[]).map(x=>`<li class="no">${x}</li>`).join('')}</ul>
    <button class="pa-btn${p.hot?'':' pa-btn-o'} js-enroll" type="button" data-plan="${p.id}">Escolher ${p.n}</button></article>`).join('')}
  d.querySelector('.pa-toggle').addEventListener('click',e=>{const b=e.target.closest('[data-per]');if(!b)return;per=b.dataset.per;d.querySelectorAll('.pa-toggle button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderPlans()});
  renderPlans();

  /* grade de horários */
  const now=new Date(),today=now.getDay();let day=today,flt='todas';
  const days=d.getElementById('days'),filt=d.getElementById('modFilter'),body=d.getElementById('sched');
  days.innerHTML=[1,2,3,4,5,6,0].map(i=>`<button role="tab" type="button" data-day="${i}" aria-selected="${i===day}">${DAYS[i]}${i===today?'<small>hoje</small>':''}</button>`).join('');
  filt.innerHTML=[['todas','Todas']].concat(MODS.filter(m=>m.id!=='musc').map(m=>[m.id,m.n])).map(([id,n])=>`<button type="button" data-m="${id}" aria-pressed="${id==='todas'}">${n}</button>`).join('');
  function renderSched(){
    const mins=now.getHours()*60+now.getMinutes();
    const rows=sched(day).filter(r=>flt==='todas'||r[1]===flt);
    body.innerHTML=rows.length?rows.map(([h,m,p,s])=>{const [hh,mm]=h.split(':').map(Number),st=hh*60+mm,live=day===today&&mins>=st&&mins<st+50,mo=modOf(m);
      return `<tr class="${live?'now':''}"><td>${h}</td><td><span class="dot" style="background:${mo.c}"></span><b>${mo.n}</b>${live?'<span class="live">Agora</span>':''}</td><td>${p}</td><td>${s}</td></tr>`}).join('')
      :'<tr class="pa-empty"><td colspan="4">Sem aulas dessa modalidade neste dia. A musculação funciona no horário todo.</td></tr>';
  }
  days.addEventListener('click',e=>{const b=e.target.closest('[data-day]');if(!b)return;day=+b.dataset.day;days.querySelectorAll('button').forEach(x=>x.setAttribute('aria-selected',x===b));renderSched()});
  filt.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;flt=b.dataset.m;filt.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderSched()});
  renderSched();

  /* professores */
  d.getElementById('team').innerHTML=COACH.map((c,i)=>`<article class="pa-coach" data-reveal style="--d:${i}"><div class="ph" style="--c1:${c.c[0]};--c2:${c.c[1]}"><span class="in">${c.n.split(' ').map(x=>x[0]).join('')}</span><div class="sil" aria-hidden="true"></div></div><div class="tx"><h3>${c.n}</h3><p>${c.r}</p><div class="tg">${c.t.map(x=>`<span>${x}</span>`).join('')}</div></div></article>`).join('');
  K.reveal();

  /* matrícula (simulação) */
  const modal=d.getElementById('enroll'),form=d.getElementById('enForm'),sel=d.getElementById('enPlan'),step=d.getElementById('enStep'),done=d.getElementById('enDone');
  sel.innerHTML=PLANS.map(p=>`<option value="${p.id}">${p.n}</option>`).join('');
  let last=null;
  function open(plan){last=d.activeElement;if(plan)sel.value=plan;step.hidden=false;done.hidden=true;modal.hidden=false;d.body.style.overflow='hidden';setTimeout(()=>form.nome.focus(),40)}
  function close(){modal.hidden=true;d.body.style.overflow='';if(last)last.focus()}
  d.addEventListener('click',e=>{const b=e.target.closest('.js-enroll');if(b){open(b.dataset.plan);return}if(e.target.closest('[data-close]')||e.target===modal)close()});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close()});
  form.addEventListener('vx:submit',e=>{e.preventDefault();const v=e.detail,p=PLANS.find(x=>x.id===v.plano);
    const t=new Date();t.setDate(t.getDate()+1);
    d.getElementById('enTxt').textContent=`${v.nome}, sua aula experimental ficou para ${FULL[t.getDay()]}, ${String(t.getDate()).padStart(2,'0')}/${String(t.getMonth()+1).padStart(2,'0')}, às 18h (exemplo). Objetivo: ${v.obj.toLowerCase()} · plano de interesse: ${p.n}. Em um site real, a recepção confirmaria pelo WhatsApp.`;
    step.hidden=true;done.hidden=false;form.reset();done.querySelector('button').focus()});

  /* 3D: superfície de energia que pulsa como um batimento */
  const cv=d.getElementById('pulse');
  K.three().then(T=>{
    if(!T)return;let r;try{r=new T.WebGLRenderer({canvas:cv,antialias:false,alpha:true,powerPreference:'low-power'})}catch(e){return}
    const mob=innerWidth<900;r.setPixelRatio(Math.min(devicePixelRatio||1,mob?1.25:1.75));
    const sc=new T.Scene(),cam=new T.PerspectiveCamera(45,1,.1,100);cam.position.set(0,3.2,9);cam.lookAt(0,0,0);
    const NX=mob?70:120,NZ=mob?40:60,W=16,D=9,pos=new Float32Array(NX*NZ*3),base=[];
    let k=0;for(let z=0;z<NZ;z++)for(let x=0;x<NX;x++){const px=(x/(NX-1)-.5)*W,pz=(z/(NZ-1)-.5)*D;pos[k++]=px;pos[k++]=0;pos[k++]=pz;base.push(px,pz)}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));
    const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{c:{value:new T.Color(0xD4FF3A)}},
      vertexShader:'varying float h;void main(){h=position.y;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=(2.2+h*3.)*(9./-mv.z);gl_Position=projectionMatrix*mv;}',
      fragmentShader:'uniform vec3 c;varying float h;void main(){vec2 p=gl_PointCoord-.5;if(dot(p,p)>.25)discard;gl_FragColor=vec4(mix(c*.35,c,clamp(h*1.4+.3,0.,1.)),clamp(.35+h,.25,1.));}'});
    const pts=new T.Points(geo,mat);pts.position.x=2.5;sc.add(pts);
    // linha de ECG
    const LN=200,lp=new Float32Array(LN*3),lg=new T.BufferGeometry();lg.setAttribute('position',new T.BufferAttribute(lp,3));
    const line=new T.Line(lg,new T.LineBasicMaterial({color:0xD4FF3A,transparent:true,opacity:.85}));line.position.set(2.5,1.4,-1.5);sc.add(line);
    const ecg=u=>{u=((u%1)+1)%1;if(u<.40)return 0;if(u<.43)return (u-.40)*10;if(u<.46)return .3-(u-.43)*40;if(u<.50)return -.9+(u-.46)*55;if(u<.53)return 1.3-(u-.50)*48;if(u<.56)return -.14+(u-.53)*4.6;return 0};
    function size(){const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;r.setSize(w,h,false);cam.aspect=w/h;cam.position.z=w<700?12:9;cam.updateProjectionMatrix()}
    size();addEventListener('resize',size);
    const m={x:0,tx:0};addEventListener('pointermove',e=>{m.tx=e.clientX/innerWidth-.5},{passive:true});
    let t=0;
    K.loop(cv,dt=>{t+=dt;const beat=Math.pow(Math.max(0,Math.sin(t*2.4)),12);
      const a=geo.attributes.position.array;
      for(let i=0,j=0;i<a.length;i+=3,j+=2){const x=base[j],z=base[j+1],dd=Math.hypot(x-2,z),ring=Math.sin(dd*1.4-t*3.2)*Math.exp(-dd*.22);
        a[i+1]=ring*.45+beat*Math.exp(-dd*dd*.08)*1.1+Math.sin(x*.5+t*.6)*.08}
      geo.attributes.position.needsUpdate=true;
      for(let i=0;i<LN;i++){const u=i/(LN-1);lp[i*3]=(u-.5)*12;lp[i*3+1]=ecg(u*2-t*.5)*.9;lp[i*3+2]=0}
      lg.attributes.position.needsUpdate=true;
      m.x+=(m.tx-m.x)*.04;pts.rotation.y=m.x*.25;line.rotation.y=m.x*.25;
      r.render(sc,cam)},{onSlow:l=>{if(l===1){r.setPixelRatio(1);size()}}});
    cv.classList.add('ready');
  });
})();
