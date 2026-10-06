/* Clique Certo — prévia de aula, módulos e inscrição simulada */
(function(){
  const d=document;
  const TIPS={none:'Foto centralizada e luz chapada: funciona, mas não chama atenção.',thirds:'Regra dos terços: o assunto sai do centro e a foto ganha respiro e direção.',light:'Luz lateral: sombras suaves dão volume e textura ao objeto.'};
  const scene=d.getElementById('scene'),tri=d.querySelector('.cc-try'),tip=d.getElementById('tip');
  tri.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;scene.dataset.mode=b.dataset.m;tip.textContent=TIPS[b.dataset.m];tri.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b))});

  const MODS=[
    ['Comece pela câmera','Configurações que fazem diferença',['Limpe a lente (sério)','Foco e exposição com um toque','Grade, HDR e modo retrato']],
    ['Luz natural','Janela, sombra e horário',['Onde a luz está?','Luz dura e luz suave','Rebatedor caseiro']],
    ['Enquadramento','Composição sem complicação',['Regra dos terços','Linhas e perspectiva','Fundo limpo']],
    ['Produtos','Fotos para vender online',['Mesa de fundo infinito','Detalhes e escala','Sequência para catálogo']],
    ['Pessoas e viagens','Retratos naturais e paisagens',['Direção leve','Retratos com luz de janela','Paisagem com profundidade']],
    ['Edição rápida','Um fluxo em apps gratuitos',['Ajustes básicos','Cor consistente','Exportar para redes']]
  ];
  d.getElementById('mods').innerHTML=MODS.map((m,i)=>`<details class="cc-mod"${i===0?' open':''}><summary><span class="n">${String(i+1).padStart(2,'0')}</span><div><h3>${m[0]}</h3><small>${m[1]} · ${m[2].length+2} aulas</small></div><span class="arr" aria-hidden="true">▾</span></summary><ol>${m[2].map(x=>`<li>${x}</li>`).join('')}<li>Exercício prático</li><li>Revisão do módulo</li></ol></details>`).join('');

  const modal=d.getElementById('checkout'),form=d.getElementById('co'),fWrap=d.getElementById('coForm'),okW=d.getElementById('coOk');let last=null;
  function open(){last=d.activeElement;fWrap.hidden=false;okW.hidden=true;modal.hidden=false;d.body.style.overflow='hidden';setTimeout(()=>form.nome.focus(),40)}
  function close(){modal.hidden=true;d.body.style.overflow='';if(last)last.focus()}
  d.getElementById('buy').addEventListener('click',open);
  modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-close]'))close()});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close()});
  form.addEventListener('vx:submit',e=>{e.preventDefault();const v=e.detail;
    d.getElementById('coTxt').textContent=`Tudo certo, ${v.nome}! Em uma página real, o acesso ao curso chegaria em ${v.email}. Aqui nada foi enviado nem cobrado.`;
    form.reset();fWrap.hidden=true;okW.hidden=false;okW.querySelector('button').focus()});
})();
