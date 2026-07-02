// Client-side scripts inlined into the rendered document. They are constant infra
// strings (never skill data), injected by the Shell. Kept tiny and dependency-free.

/** Always-on: the header ◐ button toggles light/dark by flipping `.dark` on <html>. */
export const THEME_TOGGLE = `document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-action="theme"]');if(b)document.documentElement.classList.toggle('dark');});`;

/**
 * Opt-in (interactive plans only): collects the decision from the DOM and posts it to
 * the local serve-plan server; falls back to clipboard when no server is present, so a
 * non-TTY / headless caller always has a path. Wired via click delegation on [data-action].
 */
export const CLIENT_SCRIPT = `(function(){
  function collect(approved){
    var flips=[],revisit=[];
    document.querySelectorAll('[data-pick]').forEach(function(el){
      if(el.getAttribute('data-flipped')==='true')flips.push(el.getAttribute('data-id'));
      if(el.getAttribute('data-revisit')==='true')revisit.push(el.getAttribute('data-id'));
    });
    var n=document.getElementById('sui-notes');
    return {approved:approved,flips:flips,revisit:revisit,notes:n?n.value:''};
  }
  function done(msg){var b=document.getElementById('sui-bar');if(b)b.innerHTML='<div class="mx-auto max-w-5xl font-semibold text-emerald-500 py-1">'+msg+'</div>';}
  async function copy(msg){
    var token=btoa(unescape(encodeURIComponent(JSON.stringify(collect(true)))));
    try{await navigator.clipboard.writeText(token);done(msg||'Copied — paste back in your terminal.');}
    catch(_){var p=document.getElementById('sui-token');if(p){p.textContent=token;p.classList.remove('hidden');}}
  }
  async function submit(approved){
    try{var r=await fetch('/decision',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(collect(approved))});if(!r.ok)throw 0;done('Sent — close this tab and return to your terminal.');}
    catch(_){copy('No server — copied, paste it back in your terminal.');}
  }
  function q(id){return document.querySelector('[data-id="'+CSS.escape(id)+'"]');}
  function toggle(id,attr,cls){var el=q(id);if(!el)return;var v=el.getAttribute(attr)==='true';el.setAttribute(attr,String(!v));el.classList.toggle(cls,!v);}
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-action]');if(!b)return;
    var a=b.getAttribute('data-action'),id=b.getAttribute('data-target');
    if(a==='flip')toggle(id,'data-flipped','flipped');
    else if(a==='revisit')toggle(id,'data-revisit','revisit');
    else if(a==='approve')submit(true);
    else if(a==='adjust')submit(false);
    else if(a==='copy')copy();
  });
})();`;

/**
 * Opt-in (the Library gallery only): filters component cards as you type in the search box, and
 * hides a category section once all its cards are filtered out. No deps; early-returns when there
 * is no filter box, so it is inert on every other page.
 */
export const GALLERY_FILTER = `(function(){
  var box=document.getElementById('sui-filter');if(!box)return;
  function apply(){
    var q=box.value.trim().toLowerCase();
    document.querySelectorAll('[data-sec]').forEach(function(sec){
      var any=false;
      sec.querySelectorAll('[data-card]').forEach(function(c){
        var hit=!q||c.getAttribute('data-card').indexOf(q)>=0;
        c.classList.toggle('hidden',!hit);if(hit)any=true;
      });
      sec.classList.toggle('hidden',!any);
    });
  }
  box.addEventListener('input',apply);
})();`;
