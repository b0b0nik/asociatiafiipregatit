(function(){
  'use strict';
  const style=document.createElement('style');
  style.textContent='.afp-copy-btn{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;margin-left:5px;padding:3px 5px;min-width:24px;min-height:24px;border:0;border-radius:5px;color:inherit;background:transparent;opacity:.7;cursor:pointer}.afp-copy-btn:hover,.afp-copy-btn:focus-visible{background:rgba(140,140,140,.14);opacity:1}.afp-copy-btn i{font-size:15px}.afp-copy-btn[data-copied="true"]{color:#ff7a1f}';
  document.head.appendChild(style);
  document.addEventListener('click',async function(event){
    const target=event.target;
    const button=target instanceof Element?target.closest('button[data-afp-copy]'):null;
    if(!button)return;
    const value=button.getAttribute('data-afp-copy');
    try{
      await navigator.clipboard.writeText(value);
      button.setAttribute('data-copied','true');
      button.title='Copiat!';
      setTimeout(function(){button.removeAttribute('data-copied');button.title='Copiază';},1600);
    }catch(error){button.title='Selectează textul și alege Copiază';}
  });

  const details = [
    {pattern:/contact@asociatiafiipregatit\.ro/gi, type:"email"},
    {pattern:/0745[ .-]?482[ .-]?705/g, type:"phone"},
    {pattern:/RO(?:18|61)\s*RZBR\s*0000\s*0600\s*3067\s*428[24]/g, type:"iban"},
    {pattern:/\bRZBRROBU\b/g, type:"swift"},
    {pattern:/\b51220175\b/g, type:"cif"},
    {pattern:/Str\. Lemnarilor nr\. 25A, Brașov, jud\. Brașov, România/g, type:"address"}
  ];
  function getValue(display, type) {
    return type==="phone" ? "0745482705" :
      type==="iban" ? display.replace(/\s/g,"") : display;
  }
  function makeButton(value, label) {
    const b=document.createElement("button");
    b.type="button";
    b.className="afp-copy-btn";
    b.setAttribute("data-afp-public","");
    b.setAttribute("data-afp-copy",value);
    b.setAttribute("aria-label","Copiază "+label);
    b.setAttribute("title","Copiază");
    b.innerHTML='<i class="ti ti-copy" aria-hidden="true"></i>';
    return b;
  }
  function enhanceText(node) {
    const src=node.nodeValue;
    const hits=[];
    details.forEach(function(d){
      d.pattern.lastIndex=0;
      for(const m of src.matchAll(d.pattern)){
        hits.push({start:m.index,end:m.index+m[0].length,display:m[0],type:d.type});
      }
    });
    hits.sort((a,b)=>a.start-b.start || b.end-a.end);
    if(!hits.length)return;
    const frag=document.createDocumentFragment();
    let end=0;
    hits.forEach(function(h){
      if(h.start<end)return;
      if(h.start>end)frag.appendChild(document.createTextNode(src.slice(end,h.start)));
      const value=getValue(h.display,h.type);
      const label=h.type==="iban"?"IBAN":h.type==="cif"?"CIF":h.type;
      const el=document.createElement(h.type==="email"||h.type==="phone"?"a":"span");
      el.setAttribute("data-afp-public","");
      el.style.cssText="user-select:text;-webkit-user-select:text;-webkit-touch-callout:default";
      el.textContent=h.display;
      if(h.type==="email")el.href="mailto:"+value;
      if(h.type==="phone")el.href="tel:+40745482705";
      frag.appendChild(el);
      frag.appendChild(makeButton(value,label));
      end=h.end;
    });
    if(end<src.length)frag.appendChild(document.createTextNode(src.slice(end)));
    node.replaceWith(frag);
  }
  function enhanceExistingLinks() {
    document.querySelectorAll('footer a[href^="mailto:"],footer a[href^="tel:"],footer a[href^="https://wa.me/"]').forEach(function(a){
      if(a.closest(".card") || a.nextElementSibling?.matches(".afp-copy-btn"))return;
      const value=a.href.startsWith("mailto:")?"contact@asociatiafiipregatit.ro":"0745482705";
      if(!a.textContent.includes("@") && !/0745/.test(a.textContent))return;
      a.setAttribute("data-afp-public","");
      a.after(makeButton(value,value.includes("@")?"e-mail":"telefon"));
    });
  }
  function enhancePublicInformation() {
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{
      acceptNode:function(n) {
        const el=n.parentElement;
        if(!el || el.closest("script,style,noscript,a,button,textarea,input,select,option,svg,canvas,#preview,#finalDocument,[contenteditable]"))return NodeFilter.FILTER_REJECT;
        return details.some(function(d){
          d.pattern.lastIndex=0;
          return d.pattern.test(n.nodeValue);
        })?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
      }
    });
    const found=[];
    while(walker.nextNode())found.push(walker.currentNode);
    found.forEach(enhanceText);
    enhanceExistingLinks();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",enhancePublicInformation,{once:true});
  else enhancePublicInformation();

})();
