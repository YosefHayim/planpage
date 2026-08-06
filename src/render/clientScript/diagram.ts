// Client-side island for interactive Mermaid diagram boards.
// Constant infra (never skill data). Requires window.mermaid (Shell module sets it).

/**
 * Diagram boards (`[data-diagram-board]`): type presets, classic/sketch look, apply/re-render,
 * drag nodes on the SVG, queue source edits + questions for the agent feedback batch.
 * Early-returns when no boards exist. Editable boards only when data-diagram-editable="true".
 */
export const DIAGRAM_SCRIPT = `(function(){
  var boards=document.querySelectorAll('[data-diagram-board]');
  if(!boards.length)return;

  var PRESETS={
    flowchart:{label:'Flowchart',source:'flowchart LR\\n  plan[Plan] --> review[Review]\\n  review --> ship[Ship]\\n  review --> revise[Revise]\\n  revise --> plan'},
    sequence:{label:'Sequence',source:'sequenceDiagram\\n  participant U as User\\n  participant A as Agent\\n  participant P as planpage\\n  U->>A: request plan\\n  A->>P: render + serve\\n  U->>P: edit / annotate / send\\n  P-->>A: feedback JSON'},
    class:{label:'Class',source:'classDiagram\\n  class Decision {\\n    +boolean approved\\n    +edits[]\\n    +diagrams[]\\n  }\\n  class Flow {\\n    +source\\n    +look\\n  }\\n  Decision <-- Flow : feedback'},
    state:{label:'State',source:'stateDiagram-v2\\n  [*] --> Draft\\n  Draft --> Review: serve\\n  Review --> Draft: feedback\\n  Review --> Done: approved\\n  Done --> [*]'},
    er:{label:'ER',source:'erDiagram\\n  PLAN ||--o{ STEP : has\\n  PLAN ||--o{ RISK : has\\n  STEP {\\n    string label\\n    string status\\n  }\\n  RISK {\\n    string severity\\n  }'},
    mindmap:{label:'Mindmap',source:'mindmap\\n  root((planpage))\\n    Render\\n      Preact\\n      Shiki\\n    Feedback\\n      Edit\\n      Annotate\\n      Diagrams\\n    Serve\\n      decision.json'},
    pie:{label:'Pie',source:'pie title Work split\\n  "Render" : 40\\n  "Feedback UX" : 35\\n  "CLI" : 25'},
    timeline:{label:'Timeline',source:'timeline\\n  title Plan gate\\n  section Write\\n    Shape JSON : agent\\n  section Review\\n    Edit / annotate : human\\n    Send to Agent : human\\n  section Act\\n    Apply batch : agent'}
  };

  function withInit(source,look,theme){
    if(/%%\\s*\\{\\s*init/i.test(source))return source;
    var init={};
    if(look==='handDrawn')init.look='handDrawn';
    if(theme)init.theme=theme;
    var keys=Object.keys(init);
    if(!keys.length)return source;
    return '%%{init: '+JSON.stringify(init)+'}%%\\n'+source;
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

  function enableDrag(board){
    var svg=board.querySelector('[data-diagram-stage] svg');
    if(!svg)return;
    var nodes=svg.querySelectorAll('g.node, g.actor, g.pieTitleText, .node');
    nodes.forEach(function(node){
      if(node.getAttribute('data-pp-drag')==='1')return;
      node.setAttribute('data-pp-drag','1');
      node.style.cursor='grab';
      var drag=null;
      node.addEventListener('pointerdown',function(e){
        if(board.getAttribute('data-diagram-editable')!=='true')return;
        e.stopPropagation();
        e.preventDefault();
        node.style.cursor='grabbing';
        var t=node.getAttribute('transform')||'';
        var m=/translate\\(([-\\d.]+)[,\\s]+([-\\d.]+)/.exec(t);
        var ox=m?parseFloat(m[1]):0, oy=m?parseFloat(m[2]):0;
        drag={x:e.clientX,y:e.clientY,ox:ox,oy:oy};
        node.setPointerCapture&&node.setPointerCapture(e.pointerId);
      });
      node.addEventListener('pointermove',function(e){
        if(!drag)return;
        var dx=e.clientX-drag.x, dy=e.clientY-drag.y;
        var nx=drag.ox+dx, ny=drag.oy+dy;
        var t=node.getAttribute('transform')||'';
        if(/translate\\(/.test(t)){
          node.setAttribute('transform',t.replace(/translate\\(([-\\d.]+)[,\\s]+([-\\d.]+)\\s*\\)/,'translate('+nx+', '+ny+')'));
        }else{
          node.setAttribute('transform','translate('+nx+', '+ny+') '+(t||''));
        }
      });
      function end(e){
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

  function rerender(board){
    var pre=board.querySelector('[data-diagram-render]');
    var ta=board.querySelector('[data-diagram-source]');
    if(!pre)return Promise.resolve();
    var look=board.getAttribute('data-diagram-look')||'classic';
    var theme=board.getAttribute('data-diagram-theme')||'';
    var src=ta?ta.value:board.getAttribute('data-diagram-original')||'';
    var body=withInit(src.trim(),look,theme||undefined);
    pre.removeAttribute('data-processed');
    // Clear previous SVG siblings mermaid may have left
    pre.textContent=body;
    var stage=board.querySelector('[data-diagram-stage]');
    if(stage){
      Array.prototype.slice.call(stage.querySelectorAll('svg')).forEach(function(s){
        if(s.parentNode===stage)s.parentNode.removeChild(s);
      });
    }
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

  function queueBoard(board){
    var ta=board.querySelector('[data-diagram-source]');
    var qInput=board.querySelector('[data-diagram-question]');
    var original=board.getAttribute('data-diagram-original')||'';
    var edited=ta?ta.value.trim():original;
    var q=qInput&&qInput.value.trim();
    var pack=ensureQueue(board);
    if(q){pack.questions.push(q);if(qInput)qInput.value='';}
    board._ppFeedback={
      id:board.getAttribute('data-diagram-id')||'diagram',
      title:board.getAttribute('data-diagram-title')||'diagram',
      look:board.getAttribute('data-diagram-look')||'classic',
      original:original,
      edited:edited,
      nodesMoved:!!pack.moved,
      questions:pack.questions.slice()
    };
    board.setAttribute('data-diagram-queued','true');
    // Also mirror into a global list the postback collect() reads
    if(!window.__ppDiagrams)window.__ppDiagrams={};
    window.__ppDiagrams[board._ppFeedback.id]=board._ppFeedback;
    status(board,'Queued — Send to Agent from the sidebar (or this is ready for collect)');
    // Dispatch so postback can refresh count if present
    document.dispatchEvent(new CustomEvent('pp-diagram-queued',{detail:board._ppFeedback}));
  }

  function originalOf(board){
    var hid=board.querySelector('[data-diagram-original-field]');
    if(hid&&hid.value)return hid.value;
    var ta=board.querySelector('[data-diagram-source]');
    return ta?ta.defaultValue||ta.value:'';
  }

  boards.forEach(function(board){
    var editable=board.getAttribute('data-diagram-editable')==='true';
    board.setAttribute('data-diagram-original',originalOf(board));
    // Initial drag enable after mermaid paints
    setTimeout(function(){enableDrag(board);},600);
    setTimeout(function(){enableDrag(board);},1500);

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
        rerender(board);
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
    if(applyBtn)applyBtn.addEventListener('click',function(){rerender(board);status(board,'Re-rendered');});
    if(ta){
      ta.addEventListener('keydown',function(e){
        if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();rerender(board);}
      });
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

  // Expose collector for postback
  window.__ppCollectDiagrams=function(){
    var out=[];
    var map=window.__ppDiagrams||{};
    Object.keys(map).forEach(function(k){out.push(map[k]);});
    // Also include dirty boards not explicitly queued
    document.querySelectorAll('[data-diagram-board][data-diagram-editable="true"]').forEach(function(board){
      var id=board.getAttribute('data-diagram-id')||'diagram';
      if(map[id])return;
      var ta=board.querySelector('[data-diagram-source]');
      var original=board.getAttribute('data-diagram-original')||'';
      var edited=ta?ta.value.trim():original;
      var pack=board._ppQ||{questions:[],moved:false};
      if(edited!==original||pack.moved||(pack.questions&&pack.questions.length)){
        out.push({
          id:id,
          title:board.getAttribute('data-diagram-title')||id,
          look:board.getAttribute('data-diagram-look')||'classic',
          original:original,
          edited:edited,
          nodesMoved:!!pack.moved,
          questions:pack.questions?pack.questions.slice():[]
        });
      }
    });
    return out;
  };
})();`;
