/* Navalha Norte — interações (dados fictícios) */
(function(){
  const d=document,K=window.VxKit;
  const SERVICES={
    cabelo:[{id:'c1',n:'Corte clássico',t:45,p:55,desc:'Tesoura e máquina, acabamento com navalha.'},{id:'c2',n:'Corte degradê',t:50,p:60,desc:'Transição suave, do zero ao comprimento que você quiser.'},{id:'c3',n:'Corte + lavagem',t:60,p:70,desc:'Lavagem com massagem e finalização.'},{id:'c4',n:'Pigmentação',t:40,p:45,desc:'Uniformiza falhas no cabelo ou na barba.'}],
    barba:[{id:'b1',n:'Barba com toalha quente',t:35,p:45,desc:'Toalha quente, óleo e navalha.'},{id:'b2',n:'Barba desenhada',t:30,p:40,desc:'Contorno definido e alinhado ao rosto.'},{id:'b3',n:'Pezinho e acabamento',t:15,p:20,desc:'Manutenção rápida entre um corte e outro.'}],
    combos:[{id:'k1',n:'Corte + barba',t:80,p:95,desc:'O clássico completo, com toalha quente.'},{id:'k2',n:'Dia do noivo',t:150,p:220,desc:'Corte, barba, sobrancelha e preparação.'},{id:'k3',n:'Pai e filho',t:90,p:100,desc:'Dois cortes na mesma cadeira de horário.'}]
  };
  const ALL=Object.values(SERVICES).flat();
  const TEAM=[{id:'r',n:'Rafa Moura',role:'Degradê e navalhado',bio:'Especialista em transições limpas e cortes modernos.',c:'linear-gradient(135deg,#E2C18E,#8a6a3c)',i:'RM'},
    {id:'c',n:'Caio Benedetti',role:'Barba e toalha quente',bio:'Cuida da barba como ritual: calma, precisão e acabamento.',c:'linear-gradient(135deg,#c26d5f,#7A2E2A)',i:'CB'},
    {id:'l',n:'Léo Tavares',role:'Clássicos na tesoura',bio:'Cortes clássicos e atendimento sem pressa.',c:'linear-gradient(135deg,#9fb0c9,#3b4a66)',i:'LT'}];
  // 0=dom ... 6=sáb  [abre, fecha] em horas; null = fechado
  const HOURS=[[9,13],null,[9,20],[9,20],[9,20],[9,20],[8,18]];
  const DAYS=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

  /* menu mobile */
  const burger=d.getElementById('burger'),nav=d.getElementById('nav');
  burger.addEventListener('click',()=>{const o=burger.getAttribute('aria-expanded')!=='true';burger.setAttribute('aria-expanded',o);nav.classList.toggle('open',o)});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{burger.setAttribute('aria-expanded','false');nav.classList.remove('open')}));

  /* serviços */
  const menu=d.getElementById('menu');
  function renderMenu(cat){
    menu.innerHTML=SERVICES[cat].map((s,i)=>`<li style="--i:${i}"><h3>${s.n}</h3><span class="p">${K.brl(s.p)}</span><p>${s.desc}</p><small>${s.t} min</small><button type="button" data-svc="${s.id}">Agendar este →</button></li>`).join('');
  }
  d.querySelectorAll('.nn-tabs button').forEach(b=>b.addEventListener('click',()=>{d.querySelectorAll('.nn-tabs button').forEach(x=>x.setAttribute('aria-selected',x===b));renderMenu(b.dataset.tab)}));
  renderMenu('cabelo');
  menu.addEventListener('click',e=>{const b=e.target.closest('[data-svc]');if(b)openBook({svc:b.dataset.svc})});

  /* equipe */
  d.getElementById('team').innerHTML=TEAM.map((t,i)=>`<article class="nn-card" data-reveal style="--d:${i}"><div class="nn-ava" style="background:${t.c}">${t.i}</div><h3>${t.n}</h3><p class="role">${t.role}</p><p>${t.bio}</p><button class="nn-btn nn-btn-g nn-btn-s" type="button" data-pro="${t.id}">Agendar com ${t.n.split(' ')[0]}</button></article>`).join('');
  d.getElementById('team').addEventListener('click',e=>{const b=e.target.closest('[data-pro]');if(b)openBook({pro:b.dataset.pro})});
  K.reveal(d.getElementById('team'));

  /* horários + aberto agora */
  const now=new Date(),today=now.getDay();
  d.getElementById('hours').innerHTML=[2,3,4,5,6,0,1].map(i=>`<li class="${i===today?'today':''}"><b>${DAYS[i]}</b><span>${HOURS[i]?`${HOURS[i][0]}h às ${HOURS[i][1]}h`:'Fechado'}</span></li>`).join('');
  const h=HOURS[today],hr=now.getHours()+now.getMinutes()/60;
  d.getElementById('openNow').textContent=h&&hr>=h[0]&&hr<h[1]?'Aberto':'Fechado';

  /* agendamento simulado */
  const modal=d.getElementById('book'),steps=[...modal.querySelectorAll('.nn-step')],dots=[...d.querySelectorAll('#steps li')],back=d.getElementById('back');
  let st={},step=0,lastFocus=null;
  function go(n){step=n;steps.forEach(s=>s.hidden=+s.dataset.step!==n);dots.forEach((li,i)=>{li.classList.toggle('on',i===n);li.classList.toggle('ok',i<n)});back.hidden=n===0||n===4;
    if(n===0)renderSvc();if(n===1)renderPro();if(n===2)renderDays();if(n===3)renderSum();
    const f=steps[n].querySelector('button,input');if(f)setTimeout(()=>f.focus({preventScroll:true}),30)}
  function renderSvc(){d.getElementById('optSvc').innerHTML=ALL.map(s=>`<button class="nn-opt" type="button" data-v="${s.id}" aria-pressed="${st.svc===s.id}"><span style="color:inherit;font-weight:400"><b>${s.n}</b><small>${s.t} min</small></span><span>${K.brl(s.p)}</span></button>`).join('')}
  function renderPro(){d.getElementById('optPro').innerHTML=[{id:'*',n:'Primeiro disponível',role:'Qualquer barbeiro'}].concat(TEAM).map(t=>`<button class="nn-opt" type="button" data-v="${t.id}" aria-pressed="${st.pro===t.id}"><span style="color:inherit;font-weight:400"><b>${t.n}</b><small>${t.role}</small></span><span>→</span></button>`).join('')}
  const rnd=K.rng(7);const busy={};const dkey=dt=>`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
  function renderDays(){
    const box=d.getElementById('optDay');let html='';
    for(let i=0;i<8;i++){const dt=new Date();dt.setDate(dt.getDate()+i);const w=dt.getDay(),key=dkey(dt);
      html+=`<button class="nn-day" type="button" data-v="${key}" ${HOURS[w]?'':'disabled'} aria-pressed="${st.day===key}"><span>${i===0?'Hoje':DAYS[w].slice(0,3)}</span><b>${dt.getDate()}</b><span>${HOURS[w]?'':'fechado'}</span></button>`}
    box.innerHTML=html;renderSlots();
  }
  function renderSlots(){
    const box=d.getElementById('optSlot');if(!st.day){box.innerHTML='<p class="nn-note">Escolha um dia para ver os horários.</p>';return}
    const dt=new Date(st.day+'T12:00:00'),hh=HOURS[dt.getDay()];let html='';const isToday=st.day===dkey(new Date());
    for(let m=hh[0]*60;m<hh[1]*60;m+=30){const label=`${String(Math.floor(m/60)).padStart(2,'0')}:${m%60?'30':'00'}`;const k=st.day+label;if(busy[k]===undefined)busy[k]=rnd()<.33;
      const past=isToday&&m<=now.getHours()*60+now.getMinutes();html+=`<button class="nn-slot" type="button" data-v="${label}" ${busy[k]||past?'disabled':''} aria-pressed="${st.slot===label}">${label}</button>`}
    box.innerHTML=html;
  }
  function renderSum(){const s=ALL.find(x=>x.id===st.svc),p=TEAM.find(x=>x.id===st.pro);const [y,mo,da]=st.day.split('-');
    d.getElementById('sum').innerHTML=`<dt>Serviço</dt><dd>${s.n} · ${K.brl(s.p)}</dd><dt>Barbeiro</dt><dd>${p?p.n:'Primeiro disponível'}</dd><dt>Data</dt><dd>${da}/${mo} às ${st.slot}</dd><dt>Duração</dt><dd>${s.t} min</dd>`}
  modal.addEventListener('click',e=>{
    if(e.target===modal||e.target.closest('[data-close]')){close();return}
    const b=e.target.closest('[data-v]');if(!b||b.disabled)return;
    if(step===0){st.svc=b.dataset.v;go(st.pro?2:1)}
    else if(step===1){st.pro=b.dataset.v;go(2)}
    else if(step===2){if(b.classList.contains('nn-day')){st.day=b.dataset.v;st.slot=null;renderDays()}else{st.slot=b.dataset.v;go(3)}}
  });
  back.addEventListener('click',()=>go(Math.max(0,step-1)));
  d.getElementById('bookForm').addEventListener('vx:submit',e=>{e.preventDefault();const s=ALL.find(x=>x.id===st.svc);const [y,mo,da]=st.day.split('-');
    d.getElementById('doneTxt').textContent=`${e.detail.nome}, seu ${s.n.toLowerCase()} ficou para ${da}/${mo} às ${st.slot}. Em um site real, a confirmação chegaria por WhatsApp ou e-mail.`;go(4)});
  function openBook(pre){lastFocus=d.activeElement;st=Object.assign({},pre||{});modal.hidden=false;d.body.style.overflow='hidden';go(st.svc?(st.pro?2:1):0)}
  function close(){modal.hidden=true;d.body.style.overflow='';d.getElementById('bookForm').reset();if(lastFocus)lastFocus.focus()}
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close()});
  d.querySelectorAll('.js-book').forEach(b=>b.addEventListener('click',()=>openBook()));

  /* 3D: poste de barbearia */
  const cv=d.getElementById('pole');
  K.three().then(T=>{
    if(!T)return;const mob=innerWidth<900;let r;try{r=new T.WebGLRenderer({canvas:cv,antialias:!mob,alpha:true,powerPreference:'low-power'})}catch(e){return}
    r.setPixelRatio(Math.min(devicePixelRatio||1,mob?1.25:1.75));const seg=mob?40:64;
    const sc=new T.Scene(),cam=new T.PerspectiveCamera(32,1,.1,50);cam.position.set(0,0,9);
    const g=new T.Group();sc.add(g);
    const stripe=new T.ShaderMaterial({uniforms:{t:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform float t;varying vec2 vUv;void main(){float s=fract(vUv.x*3.+vUv.y*2.2-t*.35);vec3 bone=vec3(.93,.9,.85),ox=vec3(.48,.18,.16),nv=vec3(.11,.16,.27);vec3 c=s<.33?bone:(s<.66?ox:nv);float sh=.55+.45*sin(vUv.x*6.2831);gl_FragColor=vec4(c*sh,1.);}'});
    const pole=new T.Mesh(new T.CylinderGeometry(.55,.55,4.2,seg,1,true),stripe);g.add(pole);
    const glass=new T.Mesh(new T.CylinderGeometry(.68,.68,4.3,seg,1,true),new T.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.12,roughness:.08,metalness:0,side:T.DoubleSide,depthWrite:false}));g.add(glass);
    const brass=new T.MeshStandardMaterial({color:0xC9A26B,metalness:.9,roughness:.28});
    [-1,1].forEach(s=>{const cap=new T.Mesh(new T.CylinderGeometry(.82,.82,.32,48),brass);cap.position.y=s*2.32;g.add(cap);
      const knob=new T.Mesh(new T.SphereGeometry(.42,32,16,0,Math.PI*2,0,Math.PI/2),brass);knob.position.y=s*2.48;if(s<0)knob.rotation.x=Math.PI;g.add(knob)});
    const ring=new T.Mesh(new T.TorusGeometry(2.1,.012,8,160),new T.MeshBasicMaterial({color:0xC9A26B,transparent:true,opacity:.35}));ring.rotation.x=1.25;g.add(ring);
    sc.add(new T.AmbientLight(0xffffff,.45));const kl=new T.PointLight(0xffe2b5,1.4,30);kl.position.set(3,3,5);sc.add(kl);const rl=new T.PointLight(0x7A2E2A,1.2,30);rl.position.set(-4,-2,3);sc.add(rl);
    const m={x:0,y:0,tx:0,ty:0};if(matchMedia('(pointer:fine)').matches)addEventListener('pointermove',e=>{m.tx=e.clientX/innerWidth-.5;m.ty=e.clientY/innerHeight-.5},{passive:true});
    const size=()=>{const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()};size();addEventListener('resize',size);
    let t=0;K.loop(cv,dt=>{t+=dt;stripe.uniforms.t.value=t;m.x+=(m.tx-m.x)*.05;m.y+=(m.ty-m.y)*.05;g.rotation.y=t*.25+m.x*.6;g.rotation.z=-.18+m.x*.1;g.rotation.x=m.y*.25;g.position.y=Math.sin(t*.8)*.06;ring.rotation.z=t*.2;r.render(sc,cam)},{onSlow:l=>{if(l===1){r.setPixelRatio(1);size()}}});
    cv.classList.add('ready');
  });
})();
