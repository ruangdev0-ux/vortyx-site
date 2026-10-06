/* Rota Estoque — formulário em 2 etapas, lista expansível e CTA fixo (simulação) */
(function(){
  const d=document,K=window.VxKit;
  const STEPS=[['Faça um raio-x do estoque','Contagem inicial sem complicação.'],['Separe por curva ABC','Descubra o que mais importa.'],['Defina estoque mínimo','Evite ficar sem os campeões de venda.'],
    ['Padronize nomes e códigos','Um produto, um cadastro.'],['Organize o espaço físico','Endereço para cada item.'],['Registre entradas e saídas','Rotina diária de poucos minutos.'],
    ['Faça inventário rotativo','Conte um pouco toda semana.'],['Acompanhe o giro','Veja o que está parado.'],['Negocie com fornecedores','Compre melhor com dados.'],['Escolha a ferramenta certa','Planilha ou sistema? Quando migrar.']];
  const list=d.getElementById('learn'),more=d.getElementById('more');let all=false;
  const render=()=>{list.innerHTML=STEPS.slice(0,all?10:4).map(([t,s])=>`<li><div><b>${t}</b><span>${s}</span></div></li>`).join('')};
  render();
  more.addEventListener('click',()=>{all=!all;more.setAttribute('aria-expanded',all);more.textContent=all?'Mostrar menos':'Ver os 10 passos';render()});

  const form=d.getElementById('lead'),fs=form.querySelectorAll('.re-fs'),bar=d.getElementById('bar'),lbl=d.getElementById('stepLbl'),done=d.getElementById('done');
  function go(n){fs.forEach(f=>f.hidden=+f.dataset.step!==n);bar.style.width=n===1?'50%':'100%';lbl.textContent=`Passo ${n} de 2`;const f=fs[n-1].querySelector('input');if(f)f.focus()}
  const okEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  d.getElementById('next').addEventListener('click',()=>{
    const n=form.nome,e=form.email;n.classList.toggle('bad',!n.value.trim());e.classList.toggle('bad',!okEmail(e.value));
    if(!n.value.trim()){n.focus();K.toast('Informe seu nome.');return}
    if(!okEmail(e.value)){e.focus();K.toast('Confira o e-mail.');return}
    go(2)});
  form.addEventListener('input',e=>{e.target.classList.remove('bad');const o=e.target.closest('.re-opts,.re-ck');if(o)o.classList.remove('bad')});
  d.getElementById('back').addEventListener('click',()=>go(1));
  // validação própria da etapa 2 (form usa novalidate para o fluxo em etapas)
  form.addEventListener('submit',e=>{
    const miss=[...form.querySelectorAll('.re-opts')].filter(o=>!o.querySelector(':checked'));
    miss.forEach(o=>o.classList.add('bad'));const ck=form.ok;form.querySelector('.re-ck').classList.toggle('bad',!ck.checked);
    if(miss.length||!ck.checked){e.preventDefault();e.stopImmediatePropagation();K.toast(miss.length?'Responda as duas perguntas.':'Marque a autorização para receber o guia.');return}
  },true);
  form.addEventListener('vx:submit',e=>{e.preventDefault();const v=e.detail;
    d.getElementById('doneTxt').textContent=`Obrigado, ${v.nome}! Em uma página real, o guia chegaria em ${v.email}. Perfil registrado: ${v.segmento.toLowerCase()}, ${v.itens} produtos.`;
    form.hidden=true;lbl.hidden=true;bar.parentElement.hidden=true;done.hidden=false;done.focus();sticky.classList.add('off')});
  d.getElementById('dl').addEventListener('click',()=>K.toast('<b>Simulação:</b> em uma página real, o download do PDF começaria aqui.'));
  d.getElementById('again').addEventListener('click',()=>{form.reset();form.hidden=false;lbl.hidden=false;bar.parentElement.hidden=false;done.hidden=true;go(1)});

  /* CTA fixo no celular: some quando o formulário está visível */
  const sticky=d.getElementById('sticky'),card=d.getElementById('baixar');
  if('IntersectionObserver' in window)new IntersectionObserver(es=>{sticky.classList.toggle('off',es[0].isIntersecting||!done.hidden)},{threshold:.15}).observe(card);
})();
