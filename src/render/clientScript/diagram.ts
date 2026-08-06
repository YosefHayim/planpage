// Client-side island for interactive Mermaid diagram boards.
// Constant infra (never skill data). Requires window.mermaid (Shell module sets it).

/**
 * Diagram boards (`[data-diagram-board]`): type presets, classic/sketch look, apply/re-render,
 * drag nodes on the SVG, queue source edits + questions for the agent feedback batch.
 * Early-returns when no boards exist. Editable boards only when data-diagram-editable="true".
 *
 * Keep PRESETS sources in sync with FLOW_PRESETS in components/Flow.tsx (tested).
 */
export const DIAGRAM_SCRIPT = `(function(){
  var boards=document.querySelectorAll('[data-diagram-board]');
  if(!boards.length)return;

  // Mirrors FLOW_PRESETS — residual test asserts each kind's source appears here.
  var PRESETS={
    flowchart:{label:'Flowchart',source:'flowchart LR\\n  plan[Plan] --> review[Review]\\n  review --> ship[Ship]\\n  review --> revise[Revise]\\n  revise --> plan'},
    sequence:{label:'Sequence',source:'sequenceDiagram\\n  participant U as User\\n  participant A as Agent\\n  participant P as planpage\\n  U->>A: request plan\\n  A->>P: render + serve\\n  U->>P: edit / annotate / send\\n  P-->>A: feedback JSON'},
    class:{label:'Class',source:'classDiagram\\n  class Decision {\\n    +boolean approved\\n    +edits[]\\n    +annotations[]\\n    +diagrams[]\\n  }\\n  class Flow {\\n    +source\\n    +look\\n    +editable\\n  }\\n  Decision <-- Flow : feedback'},
    state:{label:'State',source:'stateDiagram-v2\\n  [*] --> Draft\\n  Draft --> Review: serve\\n  Review --> Draft: feedback\\n  Review --> Done: approved\\n  Done --> [*]'},
    er:{label:'ER',source:'erDiagram\\n  PLAN ||--o{ STEP : has\\n  PLAN ||--o{ RISK : has\\n  STEP {\\n    string label\\n    string status\\n  }\\n  RISK {\\n    string severity\\n  }'},
    mindmap:{label:'Mindmap',source:'mindmap\\n  root((planpage))\\n    Render\\n      Preact\\n      Shiki\\n    Feedback\\n      Edit\\n      Annotate\\n      Diagrams\\n    Serve\\n      decision.json'},
    pie:{label:'Pie',source:'pie title Work split\\n  "Render" : 40\\n  "Feedback UX" : 35\\n  "CLI" : 25'},
    timeline:{label:'Timeline',source:'timeline\\n  title Plan gate\\n  section Write\\n    Shape JSON : agent\\n  section Review\\n    Edit / annotate : human\\n    Send to Agent : human\\n  section Act\\n    Apply batch : agent'}
  };

  function stripInit(source){
    return String(source||'').replace(/^\\s*%%\\s*\\{\\s*init[\\s\\S]*?\\}%%\\s*/i,'').replace(/^\\n+/,'');
  }

  function withInit(source,look,theme){
    var needsLook=look==='handDrawn';
    var needsTheme=!!theme;
    if(!needsLook&&!needsTheme)return source;
    var body=stripInit(source);
    var init={};
    if(needsLook)init.look='handDrawn';
    if(theme)init.theme=theme;
    return '%%{init: '+JSON.stringify(init)+'}%%\\n'+body;
  }

  function status(board,msg){
    var el=board.querySelector('[data-diagram-status]');
    if(!el)return;
    el.textContent=msg;
    el.classList.remove('hidden');
    setTimeout(function(){el.classList.add('hidden');},2400);
  }

  function ensureQueue(board){
    if(!board._ppQ)board._ppQ={questions:[],moved:false};
    return board._ppQ;
  }

  /** Prefer hidden original field (textarea); never let re-render clobber the agent baseline. */
  function originalOf(board){
    var hid=board.querySelector('[data-diagram-original-field]');
    if(hid){
      var v=typeof hid.value==='string'?hid.value: '';
      if(!v&&hid.textContent)v=hid.textContent;
      if(v)return v;
    }
    // Frozen at first paint — attribute set once in wire()
    var attr=board.getAttribute('data-diagram-original');
    if(attr)return attr;
    var ta=board.querySelector('[data-diagram-source]');
    return ta?(ta.defaultValue||ta.value||''):'';
  }

  function enableDrag(board){
    if(board.getAttribute('data-diagram-editable')!=='true')return;
    var stage=board.querySelector('[data-diagram-stage]');
    if(!stage)return;
    var svg=stage.querySelector('svg');
    if(!svg)return;
    var nodes=svg.querySelectorAll('g.node, g.actor, g.cluster, .node, .actor');
    nodes.forEach(function(node){
      if(node.getAttribute('data-pp-drag')==='1')return;
      node.setAttribute('data-pp-drag','1');
      node.style.cursor='grab';
      var drag=null;
      node.addEventListener('pointerdown',function(e){
        if(board.getAttribute('data-diagram-editable')!=='true')return;
        // Ignore if the user is selecting text in the source editor
        if(e.target&&e.target.closest&&e.target.closest('[data-diagram-source]'))return;
        e.stopPropagation();
        e.preventDefault();
        node.style.cursor='grabbing';
        var t=node.getAttribute('transform')||'';
        var m=/translate\\(([-\\d.]+)[,\\s]+([-\\d.]+)/.exec(t);
        var ox=m?parseFloat(m[1]):0, oy=m?parseFloat(m[2]):0;
        drag={x:e.clientX,y:e.clientY,ox:ox,oy:oy};
        if(node.setPointerCapture)try{node.setPointerCapture(e.pointerId);}catch(_e){}
      });
      node.addEventListener('pointermove',function(e){
        if(!drag)return;
        var dx=e.clientX-drag.x, dy=e.clientY-drag.y;
        var nx=drag.ox+dx, ny=drag.oy+dy;
        var t=node.getAttribute('transform')||'';
        if(/translate\\(/.test(t)){
          node.setAttribute('transform',t.replace(/translate\\(([-\\d.]+)[,\\s]+([-\\d.]+)\\s*\\)/,'translate('+nx+', '+ny+')'));
        }else{
          node.setAttribute('transform','translate('+nx+', '+ny+') '+(t||'').trim());
        }
      });
      function end(){
        if(!drag)return;
        drag=null;
        node.style.cursor='grab';
        ensureQueue(board).moved=true;
        board.setAttribute('data-diagram-dirty','true');
        status(board,'Node moved — queue for agent when ready');
      }
      node.addEventListener('pointerup',end);
      node.addEventListener('pointercancel',end);
    });
  }

  function clearStageSvgs(board){
    var stage=board.querySelector('[data-diagram-stage]');
    var pre=board.querySelector('[data-diagram-render]');
    if(!stage)return;
    Array.prototype.slice.call(stage.querySelectorAll('svg')).forEach(function(s){
      // Mermaid may leave the SVG as a sibling of the pre, or replace inside stage
      if(s===pre)return;
      if(s.parentNode)s.parentNode.removeChild(s);
    });
  }

  function rerender(board){
    var pre=board.querySelector('[data-diagram-render]');
    var ta=board.querySelector('[data-diagram-source]');
    if(!pre)return Promise.resolve();
    var look=board.getAttribute('data-diagram-look')||'classic';
    var theme=board.getAttribute('data-diagram-theme')||'';
    // Edited source lives in the textarea; non-editable boards re-use frozen original
    var src=ta?ta.value:originalOf(board);
    src=String(src||'').trim();
    if(!src){
      status(board,'Source is empty — paste Mermaid, then Apply');
      return Promise.resolve();
    }
    var body=withInit(src,look,theme||undefined);
    pre.removeAttribute('data-processed');
    pre.removeAttribute('data-mermaid-processed');
    // Replace body text so Mermaid re-parses; clear leftover SVGs from prior run
    pre.textContent=body;
    clearStageSvgs(board);
    var run=function(){
      if(!window.mermaid||!window.mermaid.run)return Promise.resolve();
      return window.mermaid.run({nodes:[pre]}).then(function(){
        enableDrag(board);
        board.setAttribute('data-diagram-dirty','true');
      }).catch(function(err){
        status(board,'Mermaid error — check source');
        console.warn('planpage diagram',err);
      });
    };
    if(window.mermaid)return run();
    // Module may still be loading
    return new Promise(function(resolve){
      var n=0;
      var t=setInterval(function(){
        n++;
        if(window.mermaid||n>40){clearInterval(t);run().then(resolve);}
      },50);
    });
  }

  function feedbackPayload(board){
    var ta=board.querySelector('[data-diagram-source]');
    var original=originalOf(board);
    var edited=ta?String(ta.value||'').trim():original;
    var pack=ensureQueue(board);
    return {
      id:board.getAttribute('data-diagram-id')||'diagram',
      title:board.getAttribute('data-diagram-title')||'diagram',
      look:board.getAttribute('data-diagram-look')||'classic',
      original:original,
      edited:edited,
      nodesMoved:!!pack.moved,
      questions:pack.questions?pack.questions.slice():[]
    };
  }

  function queueBoard(board){
    var qInput=board.querySelector('[data-diagram-question]');
    var pack=ensureQueue(board);
    var q=qInput&&qInput.value.trim();
    if(q){pack.questions.push(q);if(qInput)qInput.value='';}
    var payload=feedbackPayload(board);
    board._ppFeedback=payload;
    board.setAttribute('data-diagram-queued','true');
    if(!window.__ppDiagrams)window.__ppDiagrams={};
    window.__ppDiagrams[payload.id]=payload;
    status(board,'Queued — Send to Agent from the sidebar (or this is ready for collect)');
    document.dispatchEvent(new CustomEvent('pp-diagram-queued',{detail:payload}));
  }

  function boardChanged(board){
    var ta=board.querySelector('[data-diagram-source]');
    var original=originalOf(board);
    var edited=ta?String(ta.value||'').trim():original;
    var pack=board._ppQ||{questions:[],moved:false};
    var look=board.getAttribute('data-diagram-look')||'classic';
    var origLook=board.getAttribute('data-diagram-original-look')||'classic';
    if(edited!==original)return true;
    if(pack.moved)return true;
    if(pack.questions&&pack.questions.length)return true;
    if(look!==origLook)return true;
    if(board.getAttribute('data-diagram-dirty')==='true'&&edited!==original)return true;
    return false;
  }

  boards.forEach(function(board){
    var editable=board.getAttribute('data-diagram-editable')==='true';
    // Freeze original once from the hidden field — never rewrite after user edits
    if(!board.getAttribute('data-diagram-original')){
      board.setAttribute('data-diagram-original',originalOf(board));
    }
    if(!board.getAttribute('data-diagram-original-look')){
      board.setAttribute('data-diagram-original-look',board.getAttribute('data-diagram-look')||'classic');
    }
    // Initial drag enable after mermaid paints (editable only)
    if(editable){
      setTimeout(function(){enableDrag(board);},600);
      setTimeout(function(){enableDrag(board);},1500);
    }

    if(!editable)return;

    var preset=board.querySelector('[data-diagram-preset]');
    var lookBtn=board.querySelector('[data-diagram-look-toggle]');
    var applyBtn=board.querySelector('[data-diagram-apply]');
    var ta=board.querySelector('[data-diagram-source]');

    if(preset){
      preset.addEventListener('change',function(){
        var kind=preset.value;
        var p=PRESETS[kind];
        if(!p||!ta)return;
        ta.value=p.source;
        rerender(board).then(function(){status(board,'Loaded '+ (p.label||kind) +' preset');});
      });
    }
    if(lookBtn){
      lookBtn.addEventListener('click',function(){
        var cur=board.getAttribute('data-diagram-look')||'classic';
        var next=cur==='handDrawn'?'classic':'handDrawn';
        board.setAttribute('data-diagram-look',next);
        lookBtn.textContent=next==='handDrawn'?'Sketch':'Classic';
        rerender(board);
      });
    }
    function applyNow(){
      rerender(board).then(function(){status(board,'Re-rendered');});
    }
    if(applyBtn)applyBtn.addEventListener('click',function(){applyNow();});
    if(ta){
      ta.addEventListener('keydown',function(e){
        if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();applyNow();}
      });
      // Label says "Apply (or blur)" — re-render when the source field loses focus and changed
      ta.addEventListener('blur',function(){
        var prev=board.getAttribute('data-diagram-last-applied')||'';
        var cur=String(ta.value||'').trim();
        if(cur&&cur!==prev){
          board.setAttribute('data-diagram-last-applied',cur);
          applyNow();
        }
      });
      board.setAttribute('data-diagram-last-applied',String(ta.value||'').trim());
    }
  });

  document.addEventListener('click',function(e){
    var btn=e.target.closest&&e.target.closest('[data-action="diagram-queue"]');
    if(!btn)return;
    e.preventDefault();
    e.stopPropagation();
    var board=btn.closest('[data-diagram-board]');
    if(board)queueBoard(board);
  },true);

  // Expose collector for postback — keys match FeedbackDiagram in contracts/decision.ts
  window.__ppCollectDiagrams=function(){
    var out=[];
    var map=window.__ppDiagrams||{};
    Object.keys(map).forEach(function(k){out.push(map[k]);});
    // Also include dirty / changed boards not explicitly queued
    document.querySelectorAll('[data-diagram-board][data-diagram-editable="true"]').forEach(function(board){
      var id=board.getAttribute('data-diagram-id')||'diagram';
      if(map[id])return;
      if(!boardChanged(board))return;
      out.push(feedbackPayload(board));
    });
    return out;
  };
})();`;
