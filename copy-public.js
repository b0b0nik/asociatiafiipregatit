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
})();
