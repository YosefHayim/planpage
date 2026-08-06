// Client-side island script inlined into the rendered document.
// Constant infra (never skill data), injected by the Shell. Tiny, dependency-free.

/**
 * Opt-in interactive plans: queue-then-send feedback (lavish-style).
 * - Annotate mode: click a plan element → note card → queue (does not send).
 * - Edit mode: click a plan element → contenteditable; blur queues the diff.
 * - PickBlock flip/revisit queue as pills in the sidebar.
 * - Screenshots attach via #pp-shot-input (max 5, ~1.5 MB each).
 * - Free text lives in #pp-notes; only **Send to Agent** POSTs the batch.
 * Falls back to clipboard when no server is present (never-hang).
 */
export const CLIENT_SCRIPT = `(function(){
  var mode='annotate';
  var edits={};
  var annotations={};
  var screenshots={};
  var seq=0;
  var card=null;
  var activeEl=null;
  var MAX_SHOTS=5;
  var MAX_SHOT_BYTES=1500000;

  function $(id){return document.getElementById(id);}
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function clip(s,n){s=String(s||'').replace(/\\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s;}
  function textOf(el){return (el.innerText||el.textContent||'').replace(/\\s+/g,' ').trim();}

  function isPollPage(){return !!document.querySelector('[data-question]');}
  function isChrome(el){
    if(!el||!el.closest)return true;
    if(el.closest('#pp-bar,#pp-anno-card,[data-action]'))return true;
    if(el.closest('button,a,input,textarea,select,label,summary'))return true;
    if(el.closest('[data-question],[data-option],[data-quiz-card],[data-refine-area]'))return true;
    if(el.closest('[data-diagram-board]'))return true;
    if(el.closest('[data-whiteboard]'))return true;
    if(el.closest('[data-carousel]'))return true;
    return false;
  }

  function targetFrom(el){
    if(!el||!el.closest||isChrome(el))return null;
    var main=document.querySelector('main');
    if(!main||!main.contains(el))return null;
    var t=el.closest('[data-id],[data-pp-target],h1,h2,h3,h4,p,li,td,th,blockquote,figcaption');
    if(!t||!main.contains(t)||isChrome(t))return null;
    if(t.closest('pre,code,.code,[data-hl]'))return null;
    return t;
  }

  function ensureId(el){
    var id=el.getAttribute('data-pp-id')||el.getAttribute('data-id');
    if(id)return id;
    id='pp-t-'+(++seq);
    el.setAttribute('data-pp-id',id);
    return id;
  }

  function labelOf(el){
    var section=el.closest('section');
    var h=section&&section.querySelector('h2');
    var bit=clip(textOf(el),48)||el.tagName.toLowerCase();
    if(h)return clip(textOf(h),24)+' · '+bit;
    return bit;
  }

  function setMode(next){
    mode=next==='edit'?'edit':'annotate';
    document.documentElement.setAttribute('data-pp-mode',mode);
    document.querySelectorAll('.pp-mode').forEach(function(b){
      var on=b.getAttribute('data-mode')===mode;
      b.classList.toggle('pp-mode-on',on);
      b.setAttribute('aria-pressed',on?'true':'false');
    });
    document.querySelectorAll('[contenteditable="true"]').forEach(function(el){
      el.removeAttribute('contenteditable');
      el.classList.remove('pp-editing');
    });
    closeCard();
  }

  function diagramList(){
    if(typeof window.__ppCollectDiagrams==='function')return window.__ppCollectDiagrams()||[];
    return [];
  }
  function whiteboardList(){
    if(typeof window.__ppCollectWhiteboards==='function')return window.__ppCollectWhiteboards()||[];
    return [];
  }
  function queueCount(){
    return Object.keys(edits).length+Object.keys(annotations).length+Object.keys(screenshots).length+diagramList().length+whiteboardList().length+flips().length+revisit().length;
  }

  function flips(){
    var out=[];
    document.querySelectorAll('[data-pick][data-flipped="true"]').forEach(function(el){
      var id=el.getAttribute('data-id');if(id)out.push(id);
    });
    return out;
  }
  function revisit(){
    var out=[];
    document.querySelectorAll('[data-pick][data-revisit="true"]').forEach(function(el){
      var id=el.getAttribute('data-id');if(id)out.push(id);
    });
    return out;
  }

  function flashStatus(msg,ok){
    var s=$('pp-status');if(!s)return;
    s.textContent=msg;
    s.classList.remove('hidden');
    s.classList.toggle('text-emerald-500',!!ok);
    s.classList.toggle('text-amber-500',!ok);
    setTimeout(function(){s.classList.add('hidden');},2800);
  }

  function renderShots(){
    var box=$('pp-shots');if(!box)return;
    var ids=Object.keys(screenshots);
    if(!ids.length){
      box.innerHTML='';
      box.setAttribute('data-empty','true');
      return;
    }
    box.setAttribute('data-empty','false');
    box.innerHTML=ids.map(function(id){
      var sh=screenshots[id];
      return '<div class="pp-shot-thumb" title="'+esc(sh.name)+'">'+
        '<img src="'+esc(sh.dataUrl)+'" alt="'+esc(sh.name)+'"/>'+
        '<button type="button" data-action="drop" data-kind="shot" data-qid="'+esc(id)+'" class="pp-shot-x" aria-label="Remove screenshot">×</button>'+
      '</div>';
    }).join('');
  }

  function renderQueue(){
    var box=$('pp-queue');if(!box)return;
    var html='';
    Object.keys(edits).forEach(function(id){
      var e=edits[id];
      html+='<div class="pp-pill" data-kind="edit" data-qid="'+esc(id)+'">'+
        '<div class="pp-pill-top"><span class="pp-pill-kind">edit</span><button type="button" data-action="drop" data-kind="edit" data-qid="'+esc(id)+'" class="pp-pill-x" aria-label="Remove">×</button></div>'+
        '<div class="pp-pill-label">'+esc(e.label)+'</div>'+
        '<div class="pp-pill-diff"><span class="pp-from">'+esc(clip(e.original,80))+'</span><span class="pp-arrow">→</span><span class="pp-to">'+esc(clip(e.edited,80))+'</span></div>'+
      '</div>';
    });
    Object.keys(annotations).forEach(function(id){
      var a=annotations[id];
      html+='<div class="pp-pill" data-kind="anno" data-qid="'+esc(id)+'">'+
        '<div class="pp-pill-top"><span class="pp-pill-kind">note</span><button type="button" data-action="drop" data-kind="anno" data-qid="'+esc(id)+'" class="pp-pill-x" aria-label="Remove">×</button></div>'+
        '<div class="pp-pill-label">'+esc(a.label)+'</div>'+
        (a.selectedText?'<div class="pp-pill-sel">"'+esc(clip(a.selectedText,60))+'"</div>':'')+
        '<div class="pp-pill-note">'+esc(a.note)+'</div>'+
      '</div>';
    });
    Object.keys(screenshots).forEach(function(id){
      var sh=screenshots[id];
      html+='<div class="pp-pill" data-kind="shot" data-qid="'+esc(id)+'">'+
        '<div class="pp-pill-top"><span class="pp-pill-kind">shot</span><button type="button" data-action="drop" data-kind="shot" data-qid="'+esc(id)+'" class="pp-pill-x" aria-label="Remove">×</button></div>'+
        '<div class="pp-pill-label">'+esc(sh.name)+'</div>'+
        '<img class="pp-pill-img" src="'+esc(sh.dataUrl)+'" alt=""/>'+
      '</div>';
    });
    diagramList().forEach(function(d){
      html+='<div class="pp-pill" data-kind="diagram">'+
        '<div class="pp-pill-top"><span class="pp-pill-kind">diagram</span></div>'+
        '<div class="pp-pill-label">'+esc(d.title||d.id)+'</div>'+
        (d.edited&&d.edited!==d.original?'<div class="pp-pill-note">source updated'+(d.nodesMoved?' · nodes moved':'')+'</div>':'')+
        (d.nodesMoved&&d.edited===d.original?'<div class="pp-pill-note">nodes moved</div>':'')+
        (d.questions&&d.questions.length?'<div class="pp-pill-note">'+esc(d.questions.join(' · '))+'</div>':'')+
      '</div>';
    });
    whiteboardList().forEach(function(w){
      html+='<div class="pp-pill" data-kind="sketch">'+
        '<div class="pp-pill-top"><span class="pp-pill-kind">sketch</span></div>'+
        '<div class="pp-pill-label">'+esc(w.title||w.id)+'</div>'+
        (w.pngDataUrl?'<img class="pp-pill-img" src="'+esc(w.pngDataUrl)+'" alt="sketch"/>':'')+
        (w.note?'<div class="pp-pill-note">'+esc(w.note)+'</div>':'')+
      '</div>';
    });
    flips().forEach(function(id){
      html+='<div class="pp-pill" data-kind="flip"><div class="pp-pill-top"><span class="pp-pill-kind">flip</span></div><div class="pp-pill-label">'+esc(id)+'</div></div>';
    });
    revisit().forEach(function(id){
      html+='<div class="pp-pill" data-kind="revisit"><div class="pp-pill-top"><span class="pp-pill-kind">revisit</span></div><div class="pp-pill-label">'+esc(id)+'</div></div>';
    });
    if(!html){
      box.innerHTML='<p class="pp-queue-empty px-1 text-xs text-slate-400">No feedback yet. Click the plan to annotate, switch to Edit to change text, or attach a screenshot below.</p>';
      box.setAttribute('data-empty','true');
    }else{
      box.innerHTML=html;
      box.setAttribute('data-empty','false');
    }
    renderShots();
    var send=document.querySelector('[data-action="send"]');
    if(send){
      var n=queueCount();
      var notes=$('pp-notes');
      var hasNotes=notes&&notes.value.trim();
      send.textContent=n||hasNotes?('Send to Agent'+(n?' ('+n+')':'')):'Send to Agent';
    }
  }

  function collect(){
    var notesEl=$('pp-notes');
    var notes=notesEl?notesEl.value:'';
    var editList=Object.keys(edits).map(function(k){return edits[k];});
    var annoList=Object.keys(annotations).map(function(k){return annotations[k];});
    var shotList=Object.keys(screenshots).map(function(k){return screenshots[k];});
    var diagList=diagramList();
    var wbList=whiteboardList();
    var f=flips(),r=revisit();
    var empty=!editList.length&&!annoList.length&&!shotList.length&&!diagList.length&&!wbList.length&&!f.length&&!r.length&&!String(notes).trim();
    return {
      approved:empty,
      flips:f,
      revisit:r,
      notes:notes,
      edits:editList,
      annotations:annoList,
      screenshots:shotList,
      diagrams:diagList,
      whiteboards:wbList
    };
  }

  function done(msg){
    var s=$('pp-status');
    if(s){s.textContent=msg;s.classList.remove('hidden');s.classList.add('text-emerald-500');s.classList.remove('text-amber-500');}
    var send=document.querySelector('[data-action="send"]');
    if(send){send.disabled=true;send.classList.add('opacity-50');}
  }

  async function copy(msg){
    var token=btoa(unescape(encodeURIComponent(JSON.stringify(collect()))));
    try{await navigator.clipboard.writeText(token);done(msg||'Copied — paste back in your terminal.');}
    catch(_){var p=$('pp-token');if(p){p.textContent=token;p.classList.remove('hidden');}}
  }

  async function submit(){
    var payload=collect();
    if(payload.approved){
      flashStatus('Nothing to send — edit, annotate, attach a shot, or write a note first.',false);
      return;
    }
    try{
      var r=await fetch('/decision',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      if(!r.ok)throw 0;
      done('Sent — return to your terminal.');
    }catch(_){
      copy('No server — copied, paste it back in your terminal.');
    }
  }

  function closeCard(){
    if(card&&card.parentNode)card.parentNode.removeChild(card);
    card=null;
    if(activeEl){activeEl.classList.remove('pp-target-on');activeEl=null;}
  }

  function openCard(el,clientX,clientY){
    closeCard();
    activeEl=el;
    el.classList.add('pp-target-on');
    var id=ensureId(el);
    var sel=(window.getSelection&&window.getSelection().toString()||'').trim();
    card=document.createElement('div');
    card.id='pp-anno-card';
    card.className='pp-anno-card';
    card.innerHTML=
      '<div class="pp-anno-head">What\\'s wrong?</div>'+
      '<div class="pp-anno-label">'+esc(labelOf(el))+'</div>'+
      (sel?'<div class="pp-anno-sel">"'+esc(clip(sel,100))+'"</div>':'')+
      '<textarea class="pp-anno-input" rows="3" placeholder="Describe the issue…"></textarea>'+
      '<div class="pp-anno-actions">'+
        '<button type="button" data-action="anno-cancel" class="pp-anno-btn">Cancel</button>'+
        '<button type="button" data-action="anno-queue" class="pp-anno-btn pp-anno-primary">Queue note</button>'+
      '</div>';
    document.body.appendChild(card);
    var rect=el.getBoundingClientRect();
    var top=Math.min(window.innerHeight-220,Math.max(8,clientY||rect.bottom+8));
    var left=Math.min(window.innerWidth-320,Math.max(8,clientX||rect.left));
    card.style.top=top+'px';
    card.style.left=left+'px';
    card._targetId=id;
    card._label=labelOf(el);
    card._selected=sel;
    var ta=card.querySelector('textarea');
    if(ta)ta.focus();
  }

  function queueAnnotation(){
    if(!card)return;
    var ta=card.querySelector('textarea');
    var note=ta?ta.value.trim():'';
    if(!note){if(ta)ta.focus();return;}
    var id=card._targetId;
    annotations[id]={id:id,label:card._label,selectedText:card._selected||undefined,note:note};
    if(activeEl)activeEl.classList.add('pp-annotated');
    closeCard();
    renderQueue();
  }

  function beginEdit(el){
    if(el.getAttribute('contenteditable')==='true')return;
    if(!el.getAttribute('data-pp-original'))el.setAttribute('data-pp-original',textOf(el));
    ensureId(el);
    el.setAttribute('contenteditable','true');
    el.classList.add('pp-editing');
    el.focus();
    var range=document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    var sel=window.getSelection();
    if(sel){sel.removeAllRanges();sel.addRange(range);}
  }

  function endEdit(el){
    if(!el||el.getAttribute('contenteditable')!=='true')return;
    el.removeAttribute('contenteditable');
    el.classList.remove('pp-editing');
    var original=el.getAttribute('data-pp-original')||'';
    var edited=textOf(el);
    var id=ensureId(el);
    if(edited!==original){
      edits[id]={id:id,label:labelOf(el),original:original,edited:edited};
      el.classList.add('pp-edited');
    }else{
      delete edits[id];
      el.classList.remove('pp-edited');
    }
    renderQueue();
  }

  function toggle(id,attr,cls){
    var el=document.querySelector('[data-id="'+CSS.escape(id)+'"]');
    if(!el)return;
    var v=el.getAttribute(attr)==='true';
    el.setAttribute(attr,String(!v));
    el.classList.toggle(cls,!v);
    renderQueue();
  }

  function addShotFile(file){
    if(!file||!/^image\\//.test(file.type||'')){
      flashStatus('Only image files can be attached.',false);
      return;
    }
    if(Object.keys(screenshots).length>=MAX_SHOTS){
      flashStatus('Max '+MAX_SHOTS+' screenshots.',false);
      return;
    }
    if(file.size>MAX_SHOT_BYTES){
      flashStatus(file.name+' is too large (max ~1.5 MB).',false);
      return;
    }
    var reader=new FileReader();
    reader.onload=function(){
      var dataUrl=String(reader.result||'');
      if(dataUrl.indexOf('data:image')!==0){
        flashStatus('Could not read image.',false);
        return;
      }
      var id='shot-'+(++seq);
      screenshots[id]={id:id,name:file.name||('screenshot-'+id+'.png'),mime:file.type||'image/png',dataUrl:dataUrl};
      renderQueue();
    };
    reader.onerror=function(){flashStatus('Could not read '+file.name,false);};
    reader.readAsDataURL(file);
  }

  function onShotPick(input){
    var files=input&&input.files?Array.prototype.slice.call(input.files):[];
    files.forEach(addShotFile);
    if(input)input.value='';
  }

  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-action]');
    if(b){
      var a=b.getAttribute('data-action');
      var id=b.getAttribute('data-target');
      if(a==='mode'){setMode(b.getAttribute('data-mode'));return;}
      if(a==='send'){if(!isPollPage())submit();return;}
      if(a==='copy'){if(!isPollPage())copy();return;}
      if(a==='flip'){toggle(id,'data-flipped','flipped');return;}
      if(a==='revisit'){toggle(id,'data-revisit','revisit');return;}
      if(a==='anno-cancel'){closeCard();return;}
      if(a==='anno-queue'){queueAnnotation();return;}
      if(a==='drop'){
        var qid=b.getAttribute('data-qid');
        var kind=b.getAttribute('data-kind');
        if(kind==='edit')delete edits[qid];
        if(kind==='anno')delete annotations[qid];
        if(kind==='shot')delete screenshots[qid];
        renderQueue();
        return;
      }
      return;
    }
    if(card&&!e.target.closest('#pp-anno-card')){closeCard();return;}
    var t=targetFrom(e.target);
    if(!t)return;
    if(mode==='edit'){
      e.preventDefault();
      beginEdit(t);
      return;
    }
    e.preventDefault();
    openCard(t,e.clientX,e.clientY);
  },true);

  document.addEventListener('change',function(e){
    var t=e.target;
    if(t&&t.id==='pp-shot-input')onShotPick(t);
  });

  document.addEventListener('paste',function(e){
    if(!e.clipboardData)return;
    var items=e.clipboardData.items;
    if(!items)return;
    for(var i=0;i<items.length;i++){
      if(items[i].type&&items[i].type.indexOf('image')===0){
        var f=items[i].getAsFile();
        if(f){e.preventDefault();addShotFile(f);}
      }
    }
  });

  document.addEventListener('focusout',function(e){
    var el=e.target;
    if(el&&el.getAttribute&&el.getAttribute('contenteditable')==='true'){
      setTimeout(function(){if(document.activeElement!==el)endEdit(el);},0);
    }
  });

  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){closeCard();return;}
    if((e.key==='Enter'&&e.metaKey)||(e.key==='Enter'&&e.ctrlKey)){
      if(card){e.preventDefault();queueAnnotation();return;}
      var ae=document.activeElement;
      if(ae&&ae.id==='pp-notes'){e.preventDefault();submit();}
    }
  });

  var notes=$('pp-notes');
  if(notes)notes.addEventListener('input',function(){renderQueue();});
  document.addEventListener('pp-diagram-queued',function(){renderQueue();});
  document.addEventListener('pp-wb-queued',function(){renderQueue();});

  setMode('annotate');
  renderQueue();
})();`;
