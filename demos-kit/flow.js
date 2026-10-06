/* =========================================================
   Vortyx · Flow — visualização de fluxos (automações e IA)
   Nós ligados por conectores, com um "pacote" percorrendo
   cada etapa. Layout em linha no desktop e em coluna no celular.
   Uso:
     const f=VxFlow(el,[{id:'a',label:'Cliente',icon:'user'},...]);
     await f.run([{id:'a',text:'Mensagem recebida'},...]);
   ========================================================= */
(function(){
  const ICONS={
    user:'<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />',
    filter:'<path d="M4 5h16l-6 7v6l-4 2v-8Z"/>',
    tag:'<path d="M3 12V4h8l9 9-8 8Z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    team:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M14 20a5 5 0 0 1 7-4.5"/>',
    reply:'<path d="M4 5h16v11H9l-5 4Z"/><path d="M8 10h8M8 13h5"/>',
    form:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    db:'<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
    bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4Z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    api:'<path d="m8 7-5 5 5 5M16 7l5 5-5 5M13 5l-2 14"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    chart:'<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-8"/>',
    inbox:'<path d="M3 13h5l1 3h6l1-3h5"/><path d="M5 5h14l2 8v6H3v-6Z"/>',
    spark:'<path d="M12 3l1.8 4.6L18 9.5l-4.2 1.9L12 16l-1.8-4.6L6 9.5l4.2-1.9Z"/><path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z"/>',
    route:'<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H15a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.5"/>'
  };
  function svg(name){return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||ICONS.gear}</svg>`}
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait=ms=>new Promise(r=>setTimeout(r,reduce?0:ms));

  function VxFlow(el,nodes,opts){
    opts=opts||{};
    el.classList.add('vxf');
    el.innerHTML=nodes.map((n,i)=>(i?`<div class="vxf-link" data-i="${i}" aria-hidden="true"><i></i></div>`:'')+
      `<div class="vxf-node" data-id="${n.id}"><span class="vxf-ico">${svg(n.icon)}</span><span class="vxf-l">${n.label}</span><span class="vxf-t" aria-live="polite"></span></div>`).join('');
    const nodeEl=id=>el.querySelector(`.vxf-node[data-id="${id}"]`);
    const links=[...el.querySelectorAll('.vxf-link')];
    let running=false;
    function reset(){
      el.querySelectorAll('.vxf-node').forEach(n=>{n.classList.remove('on','done','err');n.querySelector('.vxf-t').textContent=''});
      links.forEach(l=>l.classList.remove('go','done'));
    }
    async function run(steps){
      if(running)return false;running=true;reset();
      for(let i=0;i<steps.length;i++){
        const s=steps[i],n=nodeEl(s.id);if(!n)continue;
        if(i>0){const l=links[nodes.findIndex(x=>x.id===s.id)-1];if(l){l.classList.add('go');await wait(opts.linkMs||650);l.classList.remove('go');l.classList.add('done')}}
        n.classList.add('on');n.querySelector('.vxf-t').textContent=s.text||'';
        if(opts.onStep)opts.onStep(s,i);
        await wait(s.ms||opts.stepMs||520);
        n.classList.remove('on');n.classList.add(s.error?'err':'done');
        if(s.error)break;
      }
      running=false;return true;
    }
    return {run,reset,get running(){return running}};
  }
  window.VxFlow=VxFlow;
})();
