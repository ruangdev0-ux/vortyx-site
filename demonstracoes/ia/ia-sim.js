/* =========================================================
   Vortyx · IA simulada — motor de regras usado nas demos de IA.
   NÃO é inteligência artificial: são listas de termos com pesos,
   em JavaScript, para ilustrar como uma classificação funcionaria.
   VxIA.score(texto, regras) → {ranking:[{id,score,hits}], best, conf}
   VxIA.mark(texto, hits) → HTML com os termos destacados
   ========================================================= */
(function(){
  const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  // regras: {id:{terms:{'termo':peso,...}}}
  function score(text,rules,fallback){
    const t=' '+norm(text).replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ')+' ';
    const ranking=Object.keys(rules).map(id=>{let s=0;const hits=[];
      for(const [term,w] of Object.entries(rules[id].terms)){const k=norm(term);
        // termo inteiro ou início de palavra (ex.: "cobr" pega "cobrança")
        const re=new RegExp(' '+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g');
        const m=t.match(re);if(m){s+=w*Math.min(2,m.length);hits.push(term)}}
      return {id,score:s,hits}}).sort((a,b)=>b.score-a.score);
    const tot=ranking.reduce((a,r)=>a+r.score,0),top=ranking[0];
    if(!top||top.score===0){return {ranking,best:fallback||null,conf:fallback?.42:0,empty:true}}
    // confiança: participação do 1º colocado, suavizada (nunca 100%)
    const share=top.score/tot,margin=(top.score-(ranking[1]?ranking[1].score:0))/top.score;
    const conf=Math.min(.94,.4+share*.3+margin*.12+Math.min(.12,top.score/50));
    return {ranking,best:top.id,conf};
  }
  // hits: lista de termos (string) ou de pares [termo, classeCSS]
  function mark(text,hits,cls){
    if(!hits.length)return esc(text);
    const keys=hits.map(h=>Array.isArray(h)?[norm(h[0]),h[1]]:[norm(h),cls||'']).sort((a,b)=>b[0].length-a[0].length);
    let out='',i=0;const n=norm(text);
    while(i<text.length){let found=null;
      if(i===0||/[^a-z0-9]/.test(n[i-1]))for(const k of keys){if(n.startsWith(k[0],i)){found=k;break}}
      if(found){let j=i+found[0].length;while(j<text.length&&/[a-z0-9]/.test(n[j]))j++;out+=`<mark class="${found[1]}">${esc(text.slice(i,j))}</mark>`;i=j}
      else{out+=esc(text[i]);i++}}
    return out;
  }
  // palavras reais do texto que casaram com os termos (para explicar a decisão)
  function words(text,terms){const n=norm(text),out=[];
    terms.forEach(t=>{const k=norm(t);let i=-1;
      while((i=n.indexOf(k,i+1))>-1){if(i===0||/[^a-z0-9]/.test(n[i-1])){let j=i+k.length;while(j<n.length&&/[a-z0-9]/.test(n[j]))j++;const w=text.slice(i,j);if(!out.includes(w))out.push(w);break}}});
    return out}
  const pct=x=>Math.round(x*100)+'%';
  window.VxIA={score,mark,words,norm,esc,pct};
})();
