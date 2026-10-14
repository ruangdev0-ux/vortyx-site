/* Ateliê Açúcar & Afeto — coleções, ocasiões e encomenda em etapas (dados fictícios) */
(function(){
  const d=document,K=window.VxKit;
  const $=id=>d.getElementById(id);

  /* ---------- dados ---------- */
  const PRODUCTS=[
    {id:'personalizado',n:'Bolos personalizados',s:'Bolo personalizado',d:'Decoração criada a partir da sua ideia, com massa e recheio à escolha.',img:'personalizado',w:800,h:1000,alt:'Bolo alto de cobertura branca com flores pintadas à mão em tons de laranja e verde.',days:5,flav:'bolo',
      sizes:[['15','1,5 kg','~15 fatias',219],['25','2,5 kg','~25 fatias',329],['2a','2 andares','~50 fatias',690,30],['3a','3 andares','~80 fatias',1090,30]]},
    {id:'aniversario',n:'Bolos de aniversário',s:'Bolo de aniversário',d:'Bolos de festa com acabamento delicado, no tamanho da comemoração.',img:'aniversario',w:600,h:750,alt:'Bolo pequeno de creme com bordas de bico e laços dourados, entre balões dourados.',days:3,flav:'bolo',
      sizes:[['1','1 kg','~10 fatias',169],['2','2 kg','~20 fatias',279],['3','3 kg','~30 fatias',389]]},
    {id:'doces',n:'Doces finos',s:'Doces finos',d:'Trufas, bombons e brigadeiros finos para mesas e lembranças.',img:'doces',w:600,h:750,alt:'Trufas de chocolate cobertas de cacau em um prato de cerâmica, sobre linho.',days:2,flav:'doce',
      sizes:[['25','25 unidades','caixa',96],['50','50 unidades','caixa',182],['100','100 unidades','bandeja',349]]},
    {id:'presente',n:'Caixas para presente',s:'Caixa para presente',d:'Seleção de doces em caixa pronta para presentear, com cartão escrito à mão.',img:'presente',w:600,h:750,alt:'Caixa oval de madeira clara com bombons acobreados e pétalas secas.',days:2,flav:'doce',
      sizes:[['p','Caixa P','9 doces',79],['m','Caixa M','16 doces',129],['g','Caixa G','25 doces',189]]},
    {id:'sobremesa',n:'Sobremesas',s:'Sobremesa',d:'Tortas e sobremesas individuais ou para dividir, feitas na semana.',img:'sobremesa',w:600,h:750,alt:'Torta de framboesas com creme e folhas de ouro em prato branco.',days:2,flav:'torta',
      sizes:[['ind','Individual','1 porção',34],['tp','Torta P','~8 fatias',129],['tg','Torta G','~14 fatias',198]]}
  ];
  const FLAVORS={
    bolo:[['Baunilha com frutas vermelhas',0],['Chocolate com brigadeiro belga',0],['Limão siciliano com mascarpone',0],['Doce de leite com nozes',0],['Pistache com framboesa',25]],
    doce:[['Sortidos da estação',0],['Só chocolate',0],['Chocolate e frutas',0]],
    torta:[['Framboesa com creme de baunilha',0],['Limão com merengue',0],['Chocolate e caramelo',0]]
  };
  const OCC=[
    {id:'aniversario',n:'Aniversários',t:'Do bolo para cantar parabéns aos doces da mesa, no tamanho da festa.',p:'Bolo de aniversário · doces finos',prod:'aniversario'},
    {id:'casamento',n:'Casamentos',t:'Bolo de andares e doces finos pensados junto com a decoração da celebração.',p:'Bolo personalizado de andares · doces finos',prod:'personalizado',size:'2a'},
    {id:'corporativo',n:'Eventos corporativos',t:'Caixas e doces individuais para reuniões, lançamentos e datas da empresa.',p:'Caixas para presente · doces finos',prod:'presente'},
    {id:'presente',n:'Presentes',t:'Uma caixa bonita, com cartão escrito à mão, pronta para entregar.',p:'Caixa para presente',prod:'presente'},
    {id:'especial',n:'Comemorações especiais',t:'Noivado, chá, formatura ou um jantar em casa: a encomenda se adapta.',p:'Bolo personalizado · sobremesas',prod:'personalizado'}
  ];
  const brl=K.brl,byId=id=>PRODUCTS.find(p=>p.id===id);

  /* ---------- coleções ---------- */
  $('colList').innerHTML=PRODUCTS.map((p,i)=>`<article class="aa-card${i===0?' aa-card-lg':''}" data-reveal style="--d:${i}">
    <div class="ph"><img src="img/${p.img}.webp" width="${p.w}" height="${p.h}" loading="lazy" decoding="async" alt="${p.alt}"></div>
    <div class="in"><h3>${p.n}</h3><p>${p.d}</p>
      <div class="r"><span class="pr">a partir de <b>${brl(p.sizes[0][3])}</b></span><button type="button" class="aa-mini" data-prod="${p.id}" aria-label="Encomendar ${p.n.toLowerCase()}">Encomendar</button></div></div></article>`).join('');
  K.reveal&&K.reveal($('colList'));

  /* ---------- encomenda: estado ---------- */
  const form=$('orderForm'),steps=[...form.querySelectorAll('.aa-step')],stepLis=[...$('steps').children];
  let step=0,dateTouched=false;
  $('prodOpts').innerHTML=PRODUCTS.map((p,i)=>`<label class="aa-choice"><input type="radio" name="produto" value="${p.id}" ${i===0?'checked':''}><span class="t">${p.s}</span><span class="m">a partir de ${brl(p.sizes[0][3])}</span></label>`).join('');
  $('occOpts').innerHTML=OCC.map(o=>`<label><input type="radio" name="ocasiao" value="${o.n}"><span>${o.n}</span></label>`).join('');
  const prod=()=>byId(form.produto.value);
  const size=()=>{const p=prod(),v=form.tamanho&&form.tamanho.value;return p.sizes.find(s=>s[0]===v)||p.sizes[0]};
  const flavor=()=>FLAVORS[prod().flav].find(f=>f[0]===$('flavor').value)||FLAVORS[prod().flav][0];
  const minDays=()=>size()[4]||prod().days;
  const iso=x=>`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
  const br=v=>{const [y,m,dd]=v.split('-');return `${dd}/${m}/${y}`};

  function renderSizes(keep){
    const p=prod();
    $('sizeOpts').innerHTML=p.sizes.map((s,i)=>`<label class="aa-choice"><input type="radio" name="tamanho" value="${s[0]}" ${(keep?keep===s[0]:i===0)?'checked':''}><span class="t">${s[1]}</span><span class="m">${s[2]} · ${brl(s[3])}</span></label>`).join('');
    $('flavor').innerHTML=FLAVORS[p.flav].map(f=>`<option value="${f[0]}">${f[0]}${f[1]?` (+ ${brl(f[1])})`:''}</option>`).join('');
    syncDate();
  }
  function syncDate(){
    const n=minDays(),min=new Date();min.setDate(min.getDate()+n);const m=iso(min);
    $('date').min=m;if(!dateTouched||!$('date').value||$('date').value<m)$('date').value=m;
    $('dateHelp').textContent=`Para este item, a partir de ${br(m)} (${n} dias de antecedência).`;
  }
  function total(){const f=prod().flav==='bolo'?flavor()[1]:0;return size()[3]+f}
  function summary(){
    const p=prod(),s=size(),o=form.ocasiao.value,dt=$('date').value;
    const rows=[['Produto',p.s],['Tamanho',`${s[1]} · ${s[2]}`],['Sabor',flavor()[0]],['Data',dt?br(dt):'A definir'],['Ocasião',o||'A definir'],['Receber',form.receber.value]];
    $('sumList').innerHTML=rows.map(r=>`<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('');
    $('est').textContent=brl(total());
  }
  function go(n,focus){
    step=n;steps.forEach((s,i)=>{s.hidden=i!==n});
    stepLis.forEach((li,i)=>{li.classList.toggle('on',i===n);li.classList.toggle('ok',i<n);if(i===n)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current')});
    $('back').hidden=n===0;$('next').hidden=n===3;$('send').hidden=n!==3;
    if(focus)steps[n].querySelector('legend').focus({preventScroll:false});
  }
  function valid(){
    const bad=[...steps[step].querySelectorAll('input,select,textarea')].find(el=>!el.checkValidity());
    if(bad){bad.reportValidity();bad.focus();return false}return true;
  }
  $('next').addEventListener('click',()=>{if(valid())go(step+1,true)});
  $('back').addEventListener('click',()=>go(step-1,true));
  form.addEventListener('change',e=>{
    if(e.target.name==='produto')renderSizes();
    if(e.target.name==='tamanho')syncDate();
    if(e.target.name==='data')dateTouched=true;
    if(e.target.name==='ocasiao')markOcc(OCC.find(o=>o.n===e.target.value).id,false);
    summary();
  });
  form.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'&&step<3){e.preventDefault();$('next').click()}});

  function setProduct(id,sizeId){const r=form.querySelector(`input[name="produto"][value="${id}"]`);if(!r)return;r.checked=true;renderSizes(sizeId);summary()}

  /* coleções → encomenda */
  $('colList').addEventListener('click',e=>{const b=e.target.closest('[data-prod]');if(!b)return;setProduct(b.dataset.prod);go(1);
    $('encomenda').scrollIntoView({behavior:K.reduce?'auto':'smooth'});setTimeout(()=>steps[1].querySelector('legend').focus({preventScroll:true}),K.reduce?0:500)});

  /* ---------- ocasiões ---------- */
  $('occList').innerHTML=OCC.map(o=>`<li><button type="button" class="aa-occ-b" data-occ="${o.id}" aria-pressed="false"><span class="n">${o.n}</span><span class="t">${o.t}</span><span class="p">Costuma pedir: ${o.p}</span></button></li>`).join('');
  function markOcc(id,applyProduct){
    const o=OCC.find(x=>x.id===id);
    $('occList').querySelectorAll('[data-occ]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.occ===id));
    const r=form.querySelector(`input[name="ocasiao"][value="${o.n}"]`);if(r)r.checked=true;
    if(applyProduct){setProduct(o.prod,o.size);$('occLive').textContent=`${o.n} selecionado na encomenda.`}
    $('occGo').textContent=`Encomendar para ${o.n.toLowerCase()}`;
    summary();
  }
  $('occList').addEventListener('click',e=>{const b=e.target.closest('[data-occ]');if(b)markOcc(b.dataset.occ,true)});

  /* ---------- envio simulado ---------- */
  const done=$('done');
  form.addEventListener('vx:submit',e=>{
    const v=e.detail,p=prod(),s=size();
    $('doneName').textContent=v.nome?`, ${v.nome.trim().split(' ')[0]}`:'';
    $('doneTxt').textContent=`${p.s} · ${s[1]} · ${flavor()[0]}, para ${br(v.data)}${v.ocasiao?` (${v.ocasiao.toLowerCase()})`:''}, ${v.receber.toLowerCase()}. Estimativa: ${brl(total())}.`;
    form.hidden=true;$('steps').hidden=true;done.hidden=false;done.focus();
  });
  $('again').addEventListener('click',()=>{
    form.reset();dateTouched=false;$('date').value='';renderSizes();summary();
    $('occList').querySelectorAll('[data-occ]').forEach(b=>b.setAttribute('aria-pressed','false'));$('occGo').textContent='Montar minha encomenda';$('occLive').textContent='';
    done.hidden=true;form.hidden=false;$('steps').hidden=false;go(0,true);
  });

  renderSizes();summary();go(0);

  /* cabeçalho com borda ao rolar */
  const hdr=$('hdr'),onS=()=>hdr.classList.toggle('scrolled',scrollY>8);addEventListener('scroll',onS,{passive:true});onS();
})();

/* Herói "A finalização": bolo liso + 7 grupos de lâminas recortados da própria foto.
   Termina na fotografia original intacta. Sem JS ou com movimento reduzido: só a foto. */
(function(){
  const R=document.documentElement,fig=document.querySelector('.aa-hero-ph');
  if(!fig||!R.classList.contains('aa-fx-wait'))return;
  const LAY=[[49.95,39.48,8.95],[40.75,38.08,10.95],[28.85,37.24,26.25],[36.5,29.4,19.7],[26.95,28.0,21.35],[25.0,22.28,20.65],[25.35,7.04,14.3]];// [left%, top%, width%] no quadro 4:5, de baixo para cima
  const fx=document.createElement('div');fx.className='aa-fx';fx.setAttribute('aria-hidden','true');
  fx.innerHTML=`<div class="aa-fx-stage"><div class="aa-fx-cam"><img class="aa-fx-base" alt="" src="img/hero-base-640.webp" srcset="img/hero-base-640.webp 640w, img/hero-base-1000.webp 1000w" sizes="(min-width:900px) 46vw, 100vw"><span class="aa-fx-sweep"><i></i></span>`+
    LAY.map((p,i)=>`<img class="aa-fx-l" alt="" src="img/hero-lamina-${i+1}.webp" style="left:${p[0]}%;top:${p[1]}%;width:${p[2]}%;--n:${i+1}">`).join('')+
    `<span class="aa-fx-gold" style="left:20.0%;top:6.0%;width:42.5%;height:50%"></span><span class="aa-fx-light"></span></div></div>`;
  const imgs=[...fx.querySelectorAll('img')];
  const gold=new Image();gold.src='img/hero-dourado.webp';imgs.push(gold);
  const ready=Promise.all(imgs.map(i=>i.decode?i.decode():new Promise((r,j)=>{i.onload=r;i.onerror=j})));
  const late=new Promise((_,j)=>setTimeout(()=>j('tempo'),1500));
  let btn,timer,usedBtn=false;
  function play(){
    clearTimeout(timer);R.classList.remove('aa-fx-done');fx.classList.remove('play','out');fx.style.display='';
    if(btn){btn.classList.remove('in');btn.hidden=true}
    void fx.offsetWidth;fx.classList.add('play');
    timer=setTimeout(finish,5000);
  }
  function finish(){
    R.classList.add('aa-fx-done');fx.classList.add('out');
    timer=setTimeout(()=>{fx.style.display='none';btn.hidden=false;requestAnimationFrame(()=>btn.classList.add('in'));if(usedBtn)btn.focus({preventScroll:true})},750);
  }
  Promise.race([ready,late]).then(()=>{
    fig.appendChild(fx);
    btn=document.createElement('button');btn.type='button';btn.className='aa-fx-replay';btn.hidden=true;
    btn.setAttribute('aria-label','Repetir a animação do bolo');
    btn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg><span>Repetir</span>';
    btn.addEventListener('click',()=>{usedBtn=true;play()});
    fig.appendChild(btn);
    R.classList.add('aa-fx-on');R.classList.remove('aa-fx-wait');play();
  }).catch(()=>{R.classList.remove('aa-fx-wait')});
})();

