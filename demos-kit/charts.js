/* =========================================================
   Vortyx · Charts — gráficos SVG leves para as demos
   VxCharts.line(el,{labels,series:[{name,values,color,dash}]})
   VxCharts.bars(el,{labels,values,color,format})
   VxCharts.donut(el,{items:[{label,value,color}],center})
   Sem dependências. Redesenha ao redimensionar.
   ========================================================= */
(function(){
  const NS='http://www.w3.org/2000/svg';
  const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmtDef=v=>Number(v).toLocaleString('pt-BR');
  function nice(max){if(max<=0)return 1;const p=Math.pow(10,Math.floor(Math.log10(max)));const n=max/p;return(n<=1?1:n<=2?2:n<=5?5:10)*p}
  function mk(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e}
  function frame(el){el.innerHTML='';const w=Math.max(240,el.clientWidth||320),h=Math.max(150,el.clientHeight||200);const s=mk('svg',{viewBox:`0 0 ${w} ${h}`,width:'100%',height:'100%',role:'img','aria-label':el.dataset.label||'Gráfico com dados fictícios'},el);return {s,w,h}}
  function tip(el){let t=el.querySelector('.vxc-tip');if(!t){t=document.createElement('div');t.className='vxc-tip';el.appendChild(t)}return t}
  const reg=new Set();
  function watch(el,draw){draw();if(window.ResizeObserver){if(el._vxro)el._vxro.disconnect();el._vxro=new ResizeObserver(()=>{cancelAnimationFrame(el._vxraf);el._vxraf=requestAnimationFrame(draw)});el._vxro.observe(el)}}

  function line(el,o){
    const fmt=o.format||fmtDef;
    watch(el,()=>{
      const {s,w,h}=frame(el);el.style.position='relative';
      const L=46,R=12,T=12,B=26,iw=w-L-R,ih=h-T-B;
      const all=o.series.flatMap(x=>x.values);const max=nice(Math.max(...all)*1.08);
      for(let i=0;i<=4;i++){const y=T+ih-ih*i/4;mk('line',{x1:L,x2:w-R,y1:y,y2:y,class:'vxc-grid'},s);mk('text',{x:L-8,y:y+4,'text-anchor':'end',class:'vxc-ax'},s).textContent=fmt(max*i/4)}
      const n=o.labels.length,step=n>1?iw/(n-1):0,every=Math.ceil(n/Math.max(2,Math.floor(iw/56)));
      o.labels.forEach((lb,i)=>{if(i%every===0||i===n-1)mk('text',{x:L+step*i,y:h-8,'text-anchor':'middle',class:'vxc-ax'},s).textContent=lb});
      o.series.forEach((se,si)=>{
        const pts=se.values.map((v,i)=>[L+step*i,T+ih-ih*v/max]);
        const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
        if(si===0){const g=mk('linearGradient',{id:'g'+el.id+si,x1:0,x2:0,y1:0,y2:1},mk('defs',{},s));mk('stop',{offset:'0','stop-color':se.color,'stop-opacity':.28},g);mk('stop',{offset:'1','stop-color':se.color,'stop-opacity':0},g);
          mk('path',{d:d+` L${pts[pts.length-1][0]} ${T+ih} L${L} ${T+ih} Z`,fill:`url(#g${el.id}${si})`},s)}
        const p=mk('path',{d,fill:'none',stroke:se.color,'stroke-width':2,'stroke-linejoin':'round','stroke-linecap':'round',class:'vxc-line'},s);
        if(se.dash)p.setAttribute('stroke-dasharray','5 4');
        const len=!se.dash&&!RM&&p.getTotalLength?p.getTotalLength():0;if(len){p.style.strokeDasharray=len;p.style.strokeDashoffset=len;requestAnimationFrame(()=>requestAnimationFrame(()=>{p.style.transition='stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)';p.style.strokeDashoffset=0}))}
        const last=pts[pts.length-1];mk('circle',{cx:last[0],cy:last[1],r:4,fill:se.color,stroke:'#05070F','stroke-width':2},s);
      });
      const t=tip(el),hit=mk('rect',{x:L,y:T,width:iw,height:ih,fill:'transparent'},s),cur=mk('line',{y1:T,y2:T+ih,class:'vxc-cur',opacity:0},s);
      const mv=e=>{const r=s.getBoundingClientRect(),x=(e.clientX-r.left)*(w/r.width);const i=Math.max(0,Math.min(n-1,Math.round((x-L)/(step||1))));cur.setAttribute('x1',L+step*i);cur.setAttribute('x2',L+step*i);cur.setAttribute('opacity',1);
        t.innerHTML=`<b>${o.labels[i]}</b>`+o.series.map(se=>`<span><i style="background:${se.color}"></i>${se.name}: ${fmt(se.values[i])}</span>`).join('');t.style.left=Math.min(r.width-150,Math.max(0,(L+step*i)*(r.width/w)+10))+'px';t.classList.add('on')};
      hit.addEventListener('pointermove',mv);hit.addEventListener('pointerleave',()=>{t.classList.remove('on');cur.setAttribute('opacity',0)});
    });
  }

  function bars(el,o){
    const fmt=o.format||fmtDef;
    watch(el,()=>{
      const {s,w,h}=frame(el);el.style.position='relative';
      const L=46,R=10,T=12,B=26,iw=w-L-R,ih=h-T-B;const max=nice(Math.max(...o.values,1)*1.08);
      for(let i=0;i<=4;i++){const y=T+ih-ih*i/4;mk('line',{x1:L,x2:w-R,y1:y,y2:y,class:'vxc-grid'},s);mk('text',{x:L-8,y:y+4,'text-anchor':'end',class:'vxc-ax'},s).textContent=fmt(max*i/4)}
      const n=o.values.length,bw=iw/n,gap=Math.min(10,bw*.3),every=Math.ceil(n/Math.max(2,Math.floor(iw/44)));const t=tip(el);
      o.values.forEach((v,i)=>{const bh=ih*v/max,x=L+bw*i+gap/2,y=T+ih-bh;
        const r=mk('rect',{x,y,width:Math.max(2,bw-gap),height:Math.max(0,bh),rx:Math.min(6,(bw-gap)/3),fill:(o.highlight===i?o.hcolor:o.color)||o.color,class:'vxc-bar'},s);
        if(!RM){r.style.transformBox='fill-box';r.style.transformOrigin='50% 100%';r.style.transform='scaleY(0)';
          requestAnimationFrame(()=>requestAnimationFrame(()=>{r.style.transition=`transform .8s cubic-bezier(.16,1,.3,1) ${i*25}ms`;r.style.transform='scaleY(1)'}))}
        if(i%every===0||i===n-1){const mx=Math.max(3,Math.floor(bw/6.6)),lb=String(o.labels[i]);mk('text',{x:x+(bw-gap)/2,y:h-8,'text-anchor':'middle',class:'vxc-ax'},s).textContent=lb.length>mx?lb.slice(0,mx-1)+'…':lb}
        r.addEventListener('pointerenter',()=>{const R2=s.getBoundingClientRect();t.innerHTML=`<b>${o.labels[i]}</b><span>${fmt(v)}</span>`;t.style.left=Math.min(R2.width-130,(x*(R2.width/w)))+'px';t.classList.add('on')});
        r.addEventListener('pointerleave',()=>t.classList.remove('on'));
      });
    });
  }

  function donut(el,o){
    watch(el,()=>{
      const {s,w,h}=frame(el);const cx=w/2,cy=h/2,R=Math.min(w,h)/2-8,r=R*.64;
      const tot=o.items.reduce((a,b)=>a+b.value,0)||1;let a0=-Math.PI/2;
      o.items.forEach(it=>{const a1=a0+2*Math.PI*it.value/tot;const big=a1-a0>Math.PI?1:0;
        const p=(a,rr)=>[cx+rr*Math.cos(a),cy+rr*Math.sin(a)];const [x0,y0]=p(a0,R),[x1,y1]=p(a1-0.0001,R),[x2,y2]=p(a1-0.0001,r),[x3,y3]=p(a0,r);
        const path=mk('path',{d:`M${x0} ${y0} A${R} ${R} 0 ${big} 1 ${x1} ${y1} L${x2} ${y2} A${r} ${r} 0 ${big} 0 ${x3} ${y3} Z`,fill:it.color,class:'vxc-arc'},s);
        mk('title',{},path).textContent=`${it.label}: ${Math.round(it.value/tot*100)}%`;a0=a1});
      if(o.center){mk('text',{x:cx,y:cy-2,'text-anchor':'middle',class:'vxc-c1'},s).textContent=o.center[0];mk('text',{x:cx,y:cy+16,'text-anchor':'middle',class:'vxc-c2'},s).textContent=o.center[1]}
    });
  }
  window.VxCharts={line,bars,donut};
})();
