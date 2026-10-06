/* Linha & Luz — estilos da sala e formulário simulado */
(function(){
  const d=document,room=d.getElementById('room'),sty=d.querySelector('.ll-styles');
  sty.addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(!b)return;room.dataset.style=b.dataset.s;sty.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b))});
  const form=d.getElementById('lead'),ok=d.getElementById('ok'),amb=d.getElementById('amb');
  form.addEventListener('vx:submit',e=>{e.preventDefault();
    const list=[...form.querySelectorAll('[name=amb]:checked')].map(x=>x.value.toLowerCase());
    if(!list.length){amb.classList.add('err');window.VxKit.toast('Escolha pelo menos um ambiente.');amb.querySelector('input').focus();return}
    const v=e.detail,txt=list.length>1?list.slice(0,-1).join(', ')+' e '+list.slice(-1):list[0];
    d.getElementById('okTxt').textContent=`Obrigado, ${v.nome}! Recebemos o pedido para ${txt}, formato ${v.formato.toLowerCase()}, em ${v.cidade}. Em uma página real, o estúdio responderia com o orçamento por e-mail ou WhatsApp.`;
    form.hidden=true;ok.hidden=false;ok.focus()});
  amb.addEventListener('change',()=>amb.classList.remove('err'));
  d.getElementById('again').addEventListener('click',()=>{form.reset();ok.hidden=true;form.hidden=false});
})();
