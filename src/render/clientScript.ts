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

/**
 * Opt-in (QuestionPoll template): handles option selection, auto-advance, progress,
 * sidebar rail sync, file uploads, refine notes, and decision submission.
 * Self-contained submit logic (same POST /decision + clipboard fallback pattern).
 */
export const QUESTION_POLL_SCRIPT = `(function(){
  var answers=new Map();
  var attachments=new Map();
  var refined=new Set();
  var questions=document.querySelectorAll('[data-question]');
  var total=questions.length;
  var progressFill=document.querySelector('[data-progress-fill]');
  var dots=document.querySelectorAll('[data-dot]');

  /* --- Helpers --- */
  function answered(){return document.querySelectorAll('[data-question].answered').length;}
  function updateProgress(){if(progressFill)progressFill.style.width=(answered()/total*100)+'%';}
  function nextUnanswered(after){
    var found=false;
    for(var i=0;i<questions.length;i++){
      if(questions[i]===after){found=true;continue;}
      if(found&&!questions[i].classList.contains('answered'))return questions[i];
    }return null;
  }
  function scrollTo(el){if(el)el.scrollIntoView({behavior:'smooth',block:'center'});}
  function checkComplete(){
    var done=true;
    questions.forEach(function(q){if(!q.classList.contains('answered')&&!refined.has(q.getAttribute('data-question')))done=false;});
    if(done){var bar=document.getElementById('sui-bar');if(bar)bar.classList.remove('hidden');}
  }

  /* --- 1. Option selection (click delegation) --- */
  document.addEventListener('click',function(e){
    var opt=e.target.closest&&e.target.closest('[data-option]');
    if(!opt)return;
    var group=opt.closest('[data-question]');if(!group)return;
    var qId=group.getAttribute('data-question');
    var siblings=group.querySelectorAll('[data-option]');
    siblings.forEach(function(s){
      s.setAttribute('aria-checked','false');
      s.classList.remove('selected','bg-emerald-50','dark:bg-emerald-900/20','ring-emerald-500');
      s.classList.remove('opacity-50');
      var ck=s.querySelector('[data-check]');if(ck)ck.classList.add('invisible');
    });
    opt.setAttribute('aria-checked','true');
    opt.classList.add('selected','bg-emerald-50','dark:bg-emerald-900/20','ring-emerald-500');
    var ck=opt.querySelector('[data-check]');if(ck)ck.classList.remove('invisible');
    siblings.forEach(function(s){if(s!==opt)s.classList.add('opacity-50');});
    group.classList.add('answered');

    var qText=group.querySelector('[data-question-text]');
    var chosenText=opt.querySelector('[data-option-text]');
    answers.set(qId,{
      questionId:qId,
      picked:opt.getAttribute('data-option'),
      questionText:qText?qText.textContent:'',
      chosenText:chosenText?chosenText.textContent:''
    });

    /* 3. Smooth scroll to next unanswered after 600ms — question stays open */
    setTimeout(function(){
      var next=nextUnanswered(group);
      if(next)scrollTo(next);
      updateProgress();
      checkComplete();
    },600);
  });

  /* --- 5. Sidebar rail sync on scroll --- */
  var ticking=false;
  window.addEventListener('scroll',function(){
    if(ticking)return;ticking=true;
    requestAnimationFrame(function(){
      ticking=false;
      var mid=window.innerHeight/2;
      var active=null;
      questions.forEach(function(q){
        var r=q.getBoundingClientRect();
        if(r.top<mid&&r.bottom>mid)active=q.getAttribute('data-question');
      });
      dots.forEach(function(d){
        d.classList.toggle('active',d.getAttribute('data-dot')===active);
      });
    });
  });

  /* Dot click → scroll + expand */
  document.addEventListener('click',function(e){
    var dot=e.target.closest&&e.target.closest('[data-dot]');
    if(!dot)return;
    var id=dot.getAttribute('data-dot');
    var target=document.querySelector('[data-question="'+id+'"]');
    if(target){target.classList.remove('collapsed');scrollTo(target);}
  });

  /* --- 6. Expand collapsed questions --- */
  document.addEventListener('click',function(e){
    var summary=e.target.closest&&e.target.closest('[data-question].collapsed [data-summary]');
    if(summary){var q=summary.closest('[data-question]');if(q)q.classList.remove('collapsed');}
  });

  /* --- 7. "+ Other / Refine" link --- */
  document.addEventListener('click',function(e){
    var link=e.target.closest&&e.target.closest('[data-action="show-other"]');
    if(!link)return;
    var group=link.closest('[data-question]');if(!group)return;
    var inp=group.querySelector('[data-other-input]');
    if(inp)inp.classList.toggle('hidden');
  });

  /* --- 8. Refine button --- */
  document.addEventListener('click',function(e){
    var btn=e.target.closest&&e.target.closest('[data-action="refine"]');
    if(!btn)return;
    var group=btn.closest('[data-question]');if(!group)return;
    var qId=group.getAttribute('data-question');
    group.classList.add('refine','answered');
    refined.add(qId);
    var existing=group.querySelector('[data-refine-area]');
    if(!existing){
      var ta=document.createElement('textarea');
      ta.setAttribute('data-refine-area','');
      ta.className='w-full mt-2 p-2 border rounded text-sm';
      ta.placeholder='Add a note…';
      btn.parentNode.insertBefore(ta,btn.nextSibling);
    }
    updateProgress();checkComplete();
  });

  /* --- 9. File upload / drag-and-drop --- */
  document.querySelectorAll('[data-dropzone]').forEach(function(zone){
    var qId=zone.closest('[data-question]').getAttribute('data-question');
    zone.addEventListener('dragover',function(ev){ev.preventDefault();zone.classList.add('ring-2','ring-emerald-400');});
    zone.addEventListener('dragleave',function(){zone.classList.remove('ring-2','ring-emerald-400');});
    zone.addEventListener('drop',function(ev){
      ev.preventDefault();zone.classList.remove('ring-2','ring-emerald-400');
      handleFiles(ev.dataTransfer.files,zone,qId);
    });
    var inp=zone.querySelector('input[type="file"]');
    if(inp)inp.addEventListener('change',function(){handleFiles(inp.files,zone,qId);});
  });

  function handleFiles(files,zone,qId){
    var list=attachments.get(qId)||[];
    Array.from(files).forEach(function(f){
      if(f.size<500*1024){
        var reader=new FileReader();
        reader.onload=function(){
          list.push({name:f.name,type:f.type,data:reader.result});
          attachments.set(qId,list);
          showThumb(zone,f,reader.result);
        };
        reader.readAsDataURL(f);
      }else{
        var wrap=document.createElement('div');
        wrap.className='flex items-center gap-2 mt-1';
        wrap.innerHTML='<span class="text-xs">'+f.name+' (too large) — path:</span><input type="text" class="border rounded px-1 text-xs flex-1" data-path-input />';
        zone.appendChild(wrap);
        var pi=wrap.querySelector('[data-path-input]');
        pi.addEventListener('change',function(){
          list.push({name:f.name,path:pi.value});
          attachments.set(qId,list);
        });
      }
    });
  }

  function showThumb(zone,file,dataUrl){
    var chip=document.createElement('div');
    chip.className='inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs';
    if(file.type.startsWith('image/')){
      chip.innerHTML='<img src="'+dataUrl+'" class="w-6 h-6 rounded object-cover" /> '+file.name;
    }else{
      chip.textContent=file.name;
    }
    zone.appendChild(chip);
  }

  /* --- 11. Decision collection + submit --- */
  function collect(){
    var ans=[];var skipped=[];
    questions.forEach(function(q){
      var qId=q.getAttribute('data-question');
      if(answers.has(qId)){
        var entry=Object.assign({},answers.get(qId));
        var otherInp=q.querySelector('[data-other-input] textarea, [data-other-input] input');
        if(otherInp&&otherInp.value){entry.text=otherInp.value;entry.picked='other';}
        var codeEl=q.querySelector('[data-other-input] [data-code-input]');
        if(codeEl&&codeEl.value)entry.code=codeEl.value;
        if(attachments.has(qId))entry.attachments=attachments.get(qId);
        ans.push(entry);
      }else if(refined.has(qId)){
        var ra=q.querySelector('[data-refine-area]');
        ans.push({questionId:qId,picked:'refine',questionText:(q.querySelector('[data-question-text]')||{}).textContent||'',text:ra?ra.value:''});
      }else{
        skipped.push(qId);
      }
    });
    var notes=document.getElementById('sui-notes');
    return {answers:ans,skipped:skipped,refined:Array.from(refined),notes:notes?notes.value:'',completed:skipped.length===0};
  }

  function done(msg){var b=document.getElementById('sui-bar');if(b)b.innerHTML='<div class="mx-auto max-w-5xl font-semibold text-emerald-500 py-1">'+msg+'</div>';}

  async function submit(approved){
    var payload=collect();payload.approved=approved;
    try{
      var r=await fetch('/decision',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      if(!r.ok)throw 0;
      done('Sent — close this tab and return to your terminal.');
    }catch(_){
      var token=btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      try{await navigator.clipboard.writeText(token);done('No server — copied, paste it back in your terminal.');}
      catch(__){var p=document.getElementById('sui-token');if(p){p.textContent=token;p.classList.remove('hidden');}}
    }
  }

  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-action]');if(!b)return;
    var a=b.getAttribute('data-action');
    if(a==='approve')submit(true);
    else if(a==='adjust')submit(false);
    else if(a==='copy'){
      var token=btoa(unescape(encodeURIComponent(JSON.stringify(collect()))));
      navigator.clipboard.writeText(token).then(function(){done('Copied!');}).catch(function(){});
    }
  });

  /* --- 13. Keyboard support for radiogroups --- */
  document.addEventListener('keydown',function(e){
    var opt=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('[data-option]');
    if(!opt)return;
    var group=opt.closest('[role="radiogroup"],[data-question]');if(!group)return;
    var opts=Array.from(group.querySelectorAll('[data-option]'));
    var idx=opts.indexOf(opt);
    if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();var next=opts[(idx+1)%opts.length];next.focus();}
    else if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();var prev=opts[(idx-1+opts.length)%opts.length];prev.focus();}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();opt.click();}
  });
})();`;

/**
 * Opt-in (any page with a CodeExplorer): switches the open file and flips a file's before/after
 * pane. Scoped to the nearest [data-explorer] so multiple explorers coexist; early-returns when
 * none are present, so it is inert everywhere else. Code is already highlighted at render time —
 * this only toggles visibility.
 */
export const CODE_EXPLORER_SCRIPT = `(function(){
  if(!document.querySelector('[data-explorer]'))return;
  function setFile(root,path){
    root.querySelectorAll('[data-file]').forEach(function(pane){pane.classList.toggle('hidden',pane.getAttribute('data-file')!==path);});
    root.querySelectorAll('[data-file-open]').forEach(function(btn){
      var on=btn.getAttribute('data-file-open')===path;
      btn.classList.toggle('bg-white',on);btn.classList.toggle('font-medium',on);btn.classList.toggle('text-indigo-600',on);
      btn.classList.toggle('dark:bg-slate-800',on);btn.classList.toggle('dark:text-white',on);
      btn.classList.toggle('text-slate-600',!on);btn.classList.toggle('dark:text-slate-300',!on);
    });
  }
  function setVariant(pane,want){
    pane.querySelectorAll('[data-variant]').forEach(function(v){v.classList.toggle('hidden',v.getAttribute('data-variant')!==want);});
    pane.querySelectorAll('[data-variant-btn]').forEach(function(b){
      var on=b.getAttribute('data-variant-btn')===want;
      b.classList.toggle('bg-emerald-500',on);b.classList.toggle('text-white',on);b.classList.toggle('font-medium',on);b.classList.toggle('text-slate-500',!on);
    });
  }
  document.addEventListener('click',function(e){
    var open=e.target.closest&&e.target.closest('[data-file-open]');
    if(open){var root=open.closest('[data-explorer]');if(root)setFile(root,open.getAttribute('data-file-open'));return;}
    var vb=e.target.closest&&e.target.closest('[data-variant-btn]');
    if(vb){var pane=vb.closest('[data-file]');if(pane)setVariant(pane,vb.getAttribute('data-variant-btn'));}
  });
})();`;

/**
 * Opt-in (Quiz template + any QuizCard): grades a graded multiple-choice card on click — reveals
 * ✓ on the correct option, ✗ on a wrong pick, unhides the explanation, locks the card, and tracks a
 * running score/progress. Posts the score back (same POST /decision + clipboard fallback). Scoped to
 * [data-quiz-card] so it is inert on every page without one. Grades a lone card too (no score/bar).
 */
export const QUIZ_SCRIPT = `(function(){
  if(!document.querySelector('[data-quiz-card]'))return;
  var cards=document.querySelectorAll('[data-quiz-card]');
  var total=cards.length;
  var results=new Map();
  var progressFill=document.querySelector('[data-progress-fill]');
  var scoreEl=document.querySelector('[data-quiz-score]');

  function answeredCount(){return document.querySelectorAll('[data-quiz-card].answered').length;}
  function correctCount(){var n=0;results.forEach(function(r){if(r.correct)n++;});return n;}
  function update(){
    if(progressFill)progressFill.style.width=(answeredCount()/total*100)+'%';
    if(scoreEl)scoreEl.textContent=String(correctCount());
    if(answeredCount()===total){var bar=document.getElementById('sui-bar');if(bar)bar.classList.remove('hidden');}
  }

  function grade(card,picked){
    if(card.classList.contains('answered'))return;
    var isCorrect=picked.getAttribute('data-correct')==='true';
    card.querySelectorAll('[data-quiz-option]').forEach(function(o){
      var right=o.getAttribute('data-correct')==='true';
      o.setAttribute('aria-checked',o===picked?'true':'false');
      if(right){o.classList.add('quiz-correct');var m=o.querySelector('.mark-correct');if(m)m.classList.remove('hidden');}
      else if(o===picked){o.classList.add('quiz-wrong');var w=o.querySelector('.mark-wrong');if(w)w.classList.remove('hidden');}
      else{o.classList.add('opacity-50');}
    });
    var expl=card.querySelector('[data-explanation]');
    if(expl){expl.classList.remove('hidden');expl.classList.add('flex');}
    card.classList.add('answered');
    results.set(card.getAttribute('data-id'),{picked:picked.getAttribute('data-id'),correct:isCorrect});
    update();
  }

  document.addEventListener('click',function(e){
    var opt=e.target.closest&&e.target.closest('[data-quiz-option]');
    if(!opt)return;
    var card=opt.closest('[data-quiz-card]');if(card)grade(card,opt);
  });

  document.addEventListener('keydown',function(e){
    var opt=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('[data-quiz-option]');
    if(!opt)return;
    var card=opt.closest('[data-quiz-card]');if(!card)return;
    var opts=Array.from(card.querySelectorAll('[data-quiz-option]'));
    var idx=opts.indexOf(opt);
    if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();opts[(idx+1)%opts.length].focus();}
    else if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();opts[(idx-1+opts.length)%opts.length].focus();}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();grade(card,opt);}
  });

  function collect(){
    var answers=[];
    cards.forEach(function(c){
      var id=c.getAttribute('data-id');var r=results.get(id);
      answers.push({questionId:id,picked:r?r.picked:null,correct:r?r.correct:false,answered:!!r});
    });
    var notes=document.getElementById('sui-notes');
    return {answers:answers,score:correctCount(),total:total,completed:answeredCount()===total,notes:notes?notes.value:''};
  }
  function done(msg){var b=document.getElementById('sui-bar');if(b)b.innerHTML='<div class="mx-auto max-w-5xl font-semibold text-emerald-500 py-1">'+msg+'</div>';}
  async function submit(approved){
    var payload=collect();payload.approved=approved;
    try{var r=await fetch('/decision',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!r.ok)throw 0;done('Sent — close this tab and return to your terminal.');}
    catch(_){var token=btoa(unescape(encodeURIComponent(JSON.stringify(payload))));try{await navigator.clipboard.writeText(token);done('No server — copied, paste it back in your terminal.');}catch(__){var p=document.getElementById('sui-token');if(p){p.textContent=token;p.classList.remove('hidden');}}}
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-action]');if(!b)return;
    var a=b.getAttribute('data-action');
    if(a==='approve')submit(true);
    else if(a==='adjust')submit(false);
    else if(a==='copy'){var token=btoa(unescape(encodeURIComponent(JSON.stringify(collect()))));navigator.clipboard.writeText(token).then(function(){done('Copied!');}).catch(function(){});}
  });
})();`;

/**
 * Opt-in (any page with a slideshow Carousel): auto-advances discrete slides on a timer, wires the
 * prev/next arrows + dots, syncs dots to manual swipes, pauses on hover/focus, and loops infinitely.
 * Honours prefers-reduced-motion (no autoplay). Marquee carousels are pure CSS and ignored here.
 * Scoped to [data-carousel] so it is inert on every page without one.
 */
export const CAROUSEL_SCRIPT = `(function(){
  if(!document.querySelector('[data-carousel]'))return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-carousel][data-mode="slideshow"]').forEach(function(root){
    var view=root.querySelector('[data-carousel-viewport]');if(!view)return;
    var slides=root.querySelectorAll('[data-slide]');
    var dots=root.querySelectorAll('[data-carousel-dot]');
    var n=slides.length;if(n<2)return;
    var index=0,timer=null;
    var interval=parseInt(root.getAttribute('data-interval'),10)||4000;
    function paint(){dots.forEach(function(d,i){var on=i===index;d.classList.toggle('bg-indigo-500',on);d.classList.toggle('w-4',on);d.classList.toggle('bg-slate-300',!on);d.classList.toggle('dark:bg-slate-600',!on);});}
    function goto(i){index=(i%n+n)%n;view.scrollTo({left:index*view.clientWidth,behavior:'smooth'});paint();}
    function next(){goto(index+1);}
    function start(){if(reduce||timer)return;timer=setInterval(next,interval);}
    function stop(){if(timer){clearInterval(timer);timer=null;}}
    var prev=root.querySelector('[data-carousel-prev]'),fwd=root.querySelector('[data-carousel-next]');
    if(fwd)fwd.addEventListener('click',function(){stop();next();start();});
    if(prev)prev.addEventListener('click',function(){stop();goto(index-1);start();});
    dots.forEach(function(d,i){d.addEventListener('click',function(){stop();goto(i);start();});});
    root.addEventListener('mouseenter',stop);root.addEventListener('mouseleave',start);
    root.addEventListener('focusin',stop);root.addEventListener('focusout',start);
    var ticking=false;
    view.addEventListener('scroll',function(){if(ticking)return;ticking=true;requestAnimationFrame(function(){ticking=false;var i=Math.round(view.scrollLeft/view.clientWidth);if(i!==index){index=(i%n+n)%n;paint();}});});
    paint();start();
  });
})();`;
