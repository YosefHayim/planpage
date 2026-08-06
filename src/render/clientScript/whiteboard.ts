// Freehand whiteboard island — pen / shapes / sticky / export PNG for agent feedback.
// Uses rough.js (window.rough) when available for an Excalidraw-like sketch stroke.

/**
 * Whiteboard boards (`[data-whiteboard]`): freehand + rough shapes, stickies, undo/clear,
 * queue PNG + note via window.__ppWhiteboards for the post-back collect.
 *
 * Queue rejects fully empty boards (no strokes, no sticky text, no note). Placeholder
 * stickies ("Note…") are dropped. Stickies are composited into the exported PNG and
 * listed in `stickies[]` for the agent. Zero-size shape strokes are ignored.
 */
export const WHITEBOARD_SCRIPT = `(function(){
  var boards=document.querySelectorAll('[data-whiteboard]');
  if(!boards.length)return;
  if(!window.__ppWhiteboards)window.__ppWhiteboards={};
  var STICKY_PLACEHOLDER='Note\\u2026';

  function status(board,msg){
    var el=board.querySelector('[data-wb-status]');
    if(!el)return;
    el.textContent=msg;el.classList.remove('hidden');
    setTimeout(function(){el.classList.add('hidden');},2600);
  }

  function isPlaceholderSticky(text){
    if(!text)return true;
    var t=String(text).trim();
    if(!t)return true;
    // Default sticky seed (ellipsis or three dots)
    return t==='Note\\u2026'||t==='Note...';
  }

  function collectStickies(stickies){
    var out=[];
    if(!stickies)return out;
    stickies.querySelectorAll('.pp-wb-sticky').forEach(function(n){
      var text=(n.textContent||'').trim();
      if(isPlaceholderSticky(text))return;
      out.push({
        text:text,
        x:Math.round(n.offsetLeft)||0,
        y:Math.round(n.offsetTop)||0
      });
    });
    return out;
  }

  function hasContent(strokeCount,stickyNotes,note){
    return strokeCount>0||(stickyNotes&&stickyNotes.length>0)||!!(note&&String(note).trim());
  }

  function setup(board){
    if(board.getAttribute('data-wb-ready')==='1')return;
    board.setAttribute('data-wb-ready','1');
    var editable=board.getAttribute('data-wb-editable')==='true';
    var canvas=board.querySelector('[data-wb-canvas]');
    var stage=board.querySelector('[data-wb-stage]');
    var stickies=board.querySelector('[data-wb-stickies]');
    if(!canvas||!stage)return;
    var ctx=canvas.getContext('2d');
    if(!ctx)return;

    var tool='pen';
    var color='#1e293b';
    var drawing=false;
    var start=null;
    var points=[];
    var strokes=[]; // {kind, color, points?, x,y,w,h}
    var snapshot=null;
    var dpr=Math.max(1,window.devicePixelRatio||1);

    function resize(){
      var r=stage.getBoundingClientRect();
      var w=Math.max(1,Math.floor(r.width));
      var h=Math.max(1,Math.floor(r.height));
      canvas.width=Math.floor(w*dpr);
      canvas.height=Math.floor(h*dpr);
      canvas.style.width=w+'px';
      canvas.style.height=h+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      redraw();
    }

    function bg(){
      var dark=document.documentElement.classList.contains('dark');
      ctx.fillStyle=dark?'#1a1a1a':'#faf9f6';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      // subtle grid like excalidraw paper
      ctx.strokeStyle=dark?'rgba(255,255,255,0.04)':'rgba(15,23,42,0.06)';
      ctx.lineWidth=1;
      var step=24;
      var w=canvas.width/dpr, h=canvas.height/dpr;
      ctx.beginPath();
      for(var x=0;x<=w;x+=step){ctx.moveTo(x,0);ctx.lineTo(x,h);}
      for(var y=0;y<=h;y+=step){ctx.moveTo(0,y);ctx.lineTo(w,y);}
      ctx.stroke();
    }

    function roughGen(){
      return window.rough&&window.rough.canvas?window.rough.canvas(canvas):null;
    }

    function poly(st){
      if(!st.points||st.points.length<2)return;
      ctx.beginPath();
      ctx.moveTo(st.points[0].x,st.points[0].y);
      for(var j=1;j<st.points.length;j++)ctx.lineTo(st.points[j].x,st.points[j].y);
      ctx.stroke();
    }

    function drawStroke(s){
      var rc=roughGen();
      ctx.save();
      if(s.kind==='pen'||s.kind==='highlight'){
        ctx.strokeStyle=s.kind==='highlight'?hexAlpha(s.color,0.35):s.color;
        ctx.lineWidth=s.kind==='highlight'?14:2.2;
        ctx.lineCap='round';ctx.lineJoin='round';
        ctx.globalCompositeOperation=s.kind==='highlight'?'multiply':'source-over';
        if(rc&&s.points&&s.points.length>1&&s.kind==='pen'){
          try{
            var path='M '+s.points[0].x+' '+s.points[0].y;
            for(var i=1;i<s.points.length;i++)path+=' L '+s.points[i].x+' '+s.points[i].y;
            rc.path(path,{stroke:s.color,strokeWidth:1.8,roughness:1.4,bowing:0.8});
          }catch(_){poly(s);}
        }else poly(s);
      }else if(s.kind==='rect'){
        if(rc)rc.rectangle(s.x,s.y,s.w,s.h,{stroke:s.color,strokeWidth:1.6,roughness:1.6,fill:'',fillStyle:'solid'});
        else{ctx.strokeStyle=s.color;ctx.lineWidth=2;ctx.strokeRect(s.x,s.y,s.w,s.h);}
      }else if(s.kind==='ellipse'){
        if(rc)rc.ellipse(s.x+s.w/2,s.y+s.h/2,Math.abs(s.w),Math.abs(s.h),{stroke:s.color,strokeWidth:1.6,roughness:1.6});
        else{
          ctx.strokeStyle=s.color;ctx.lineWidth=2;ctx.beginPath();
          ctx.ellipse(s.x+s.w/2,s.y+s.h/2,Math.abs(s.w)/2,Math.abs(s.h)/2,0,0,Math.PI*2);ctx.stroke();
        }
      }else if(s.kind==='arrow'){
        var x1=s.x,y1=s.y,x2=s.x+s.w,y2=s.y+s.h;
        if(rc)rc.line(x1,y1,x2,y2,{stroke:s.color,strokeWidth:1.8,roughness:1.3});
        else{ctx.strokeStyle=s.color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
        var ang=Math.atan2(y2-y1,x2-x1);
        var ah=10;
        ctx.fillStyle=s.color;
        ctx.beginPath();
        ctx.moveTo(x2,y2);
        ctx.lineTo(x2-ah*Math.cos(ang-0.4),y2-ah*Math.sin(ang-0.4));
        ctx.lineTo(x2-ah*Math.cos(ang+0.4),y2-ah*Math.sin(ang+0.4));
        ctx.closePath();ctx.fill();
      }else if(s.kind==='eraser'&&s.points){
        ctx.globalCompositeOperation='destination-out';
        ctx.strokeStyle='rgba(0,0,0,1)';
        ctx.lineWidth=22;ctx.lineCap='round';ctx.lineJoin='round';
        poly(s);
      }
      ctx.restore();
    }

    function hexAlpha(hex,a){
      var h=String(hex||'').replace('#','');
      if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      if(h.length!==6||/[^0-9a-fA-F]/.test(h))return 'rgba(30,41,59,'+a+')';
      var r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
      return 'rgba('+r+','+g+','+b+','+a+')';
    }

    function redraw(){
      bg();
      strokes.forEach(function(s){drawStroke(s);});
    }

    function pos(e){
      var r=canvas.getBoundingClientRect();
      var p=e.touches&&e.touches[0]?e.touches[0]:e;
      return {x:p.clientX-r.left,y:p.clientY-r.top};
    }

    function setTool(t){
      tool=t;
      board.querySelectorAll('[data-wb-tool]').forEach(function(b){
        var on=b.getAttribute('data-wb-tool')===t;
        b.classList.toggle('pp-wb-tool-on',on);
        b.setAttribute('aria-pressed',on?'true':'false');
      });
    }

    function setColor(c){
      color=c;
      board.querySelectorAll('[data-wb-color]').forEach(function(b){
        var on=b.getAttribute('data-wb-color')===c;
        b.classList.toggle('pp-wb-swatch-on',on);
        b.setAttribute('aria-pressed',on?'true':'false');
      });
    }

    function addSticky(x,y){
      if(!stickies)return;
      var note=document.createElement('div');
      note.className='pp-wb-sticky';
      note.contentEditable=editable?'true':'false';
      note.setAttribute('role','note');
      note.style.left=Math.max(0,x)+'px';
      note.style.top=Math.max(0,y)+'px';
      note.textContent=STICKY_PLACEHOLDER;
      note.style.pointerEvents='auto';
      var drag=null;
      note.addEventListener('pointerdown',function(e){
        // Only start drag from the note chrome itself (not when selecting text mid-edit)
        if(e.target!==note)return;
        if(document.activeElement===note)return;
        drag={x:e.clientX,y:e.clientY,l:note.offsetLeft,t:note.offsetTop};
        note.setPointerCapture&&note.setPointerCapture(e.pointerId);
      });
      note.addEventListener('pointermove',function(e){
        if(!drag)return;
        note.style.left=Math.max(0,drag.l+e.clientX-drag.x)+'px';
        note.style.top=Math.max(0,drag.t+e.clientY-drag.y)+'px';
      });
      note.addEventListener('pointerup',function(){drag=null;});
      note.addEventListener('pointercancel',function(){drag=null;});
      stickies.appendChild(note);
      note.focus();
      // Select seed text so typing replaces the placeholder
      try{
        var range=document.createRange();
        range.selectNodeContents(note);
        var sel=window.getSelection();
        if(sel){sel.removeAllRanges();sel.addRange(range);}
      }catch(_){}
    }

    function meaningfulShape(w,h){
      return Math.abs(w)>=2||Math.abs(h)>=2;
    }

    function onDown(e){
      if(!editable)return;
      e.preventDefault();
      var p=pos(e);
      if(tool==='sticky'){addSticky(p.x,p.y);return;}
      drawing=true;
      start=p;
      points=[p];
      try{snapshot=ctx.getImageData(0,0,canvas.width,canvas.height);}catch(_){snapshot=null;}
      if(canvas.setPointerCapture&&e.pointerId!=null){
        try{canvas.setPointerCapture(e.pointerId);}catch(_){}
      }
    }
    function onMove(e){
      if(!drawing||!editable)return;
      e.preventDefault();
      var p=pos(e);
      if(tool==='pen'||tool==='highlight'||tool==='eraser'){
        points.push(p);
        if(snapshot)ctx.putImageData(snapshot,0,0);
        drawStroke({kind:tool,color:color,points:points});
      }else{
        if(snapshot)ctx.putImageData(snapshot,0,0);
        drawStroke({kind:tool,color:color,x:start.x,y:start.y,w:p.x-start.x,h:p.y-start.y});
      }
    }
    function onUp(e){
      if(!drawing)return;
      drawing=false;
      var p=e?pos(e):points[points.length-1];
      if(tool==='pen'||tool==='highlight'||tool==='eraser'){
        if(points.length>1)strokes.push({kind:tool,color:color,points:points.slice()});
      }else if(start&&p&&meaningfulShape(p.x-start.x,p.y-start.y)){
        strokes.push({kind:tool,color:color,x:start.x,y:start.y,w:p.x-start.x,h:p.y-start.y});
      }
      points=[];start=null;snapshot=null;
      redraw();
    }

    canvas.addEventListener('pointerdown',onDown);
    canvas.addEventListener('pointermove',onMove);
    canvas.addEventListener('pointerup',onUp);
    canvas.addEventListener('pointercancel',onUp);
    canvas.addEventListener('pointerleave',function(e){if(drawing)onUp(e);});

    board.addEventListener('click',function(e){
      var t=e.target.closest&&e.target.closest('[data-wb-tool]');
      if(t){setTool(t.getAttribute('data-wb-tool'));return;}
      var c=e.target.closest&&e.target.closest('[data-wb-color]');
      if(c){setColor(c.getAttribute('data-wb-color'));return;}
      if(e.target.closest&&e.target.closest('[data-wb-undo]')){
        strokes.pop();redraw();return;
      }
      if(e.target.closest&&e.target.closest('[data-wb-clear]')){
        strokes=[];if(stickies)stickies.innerHTML='';redraw();return;
      }
    });

    function paintStickiesOnto(ectx,stickyNotes,scale){
      stickyNotes.forEach(function(s){
        var x=s.x*scale, y=s.y*scale;
        var pad=8*scale;
        var maxW=140*scale;
        ectx.save();
        ectx.fillStyle='#fef08a';
        ectx.strokeStyle='rgba(15,23,42,0.12)';
        ectx.lineWidth=1*scale;
        ectx.font=(12*scale)+'px system-ui,sans-serif';
        // Word-wrap to estimate box height
        var lines=[], words=String(s.text).split(/\\s+/), line='';
        words.forEach(function(w){
          var trial=line?line+' '+w:w;
          if(ectx.measureText(trial).width>maxW-pad*2&&line){lines.push(line);line=w;}
          else line=trial;
        });
        if(line)lines.push(line);
        if(!lines.length)lines=[''];
        var lineH=16*scale;
        var boxH=Math.max(48*scale,pad*2+lines.length*lineH);
        var boxW=maxW;
        ectx.fillRect(x,y,boxW,boxH);
        ectx.strokeRect(x,y,boxW,boxH);
        ectx.fillStyle='#1e293b';
        ectx.textBaseline='top';
        lines.forEach(function(ln,i){ectx.fillText(ln,x+pad,y+pad+i*lineH,maxW-pad*2);});
        ectx.restore();
      });
    }

    board._ppExport=function(){
      var stickyNotes=collectStickies(stickies);
      var pngDataUrl='';
      try{
        if(stickyNotes.length){
          // Composite stickies into export so the agent sees them on the PNG too
          var off=document.createElement('canvas');
          off.width=canvas.width;off.height=canvas.height;
          var ectx=off.getContext('2d');
          if(ectx){
            ectx.drawImage(canvas,0,0);
            paintStickiesOnto(ectx,stickyNotes,dpr);
            pngDataUrl=off.toDataURL('image/png');
          }else{
            pngDataUrl=canvas.toDataURL('image/png');
          }
        }else{
          pngDataUrl=canvas.toDataURL('image/png');
        }
      }catch(_){
        try{pngDataUrl=canvas.toDataURL('image/png');}catch(__){pngDataUrl='';}
      }
      return {
        id:board.getAttribute('data-wb-id')||'whiteboard',
        title:board.getAttribute('data-wb-title')||'Whiteboard',
        pngDataUrl:pngDataUrl,
        strokeCount:strokes.length,
        stickies:stickyNotes
      };
    };

    setTool('pen');
    setColor(color);
    resize();
    if(typeof ResizeObserver!=='undefined')new ResizeObserver(resize).observe(stage);
    else window.addEventListener('resize',resize);
  }

  boards.forEach(setup);

  document.addEventListener('click',function(e){
    var btn=e.target.closest&&e.target.closest('[data-action="wb-queue"]');
    if(!btn)return;
    e.preventDefault();e.stopPropagation();
    var board=btn.closest('[data-whiteboard]');
    if(!board||!board._ppExport)return;
    var payload=board._ppExport();
    var noteEl=board.querySelector('[data-wb-note]');
    payload.note=noteEl?String(noteEl.value||'').trim():'';
    // Empty board: no strokes, no real stickies, no note — refuse to queue noise
    if(!hasContent(payload.strokeCount,payload.stickies,payload.note)){
      status(board,'Draw something, add a sticky, or write a note first');
      return;
    }
    // PNG failed (rare: canvas/security) — still allow note/sticky-only queue
    if(!payload.pngDataUrl){
      if(!payload.note&&!(payload.stickies&&payload.stickies.length)){
        status(board,'Could not export sketch — try again');
        return;
      }
      payload.pngDataUrl='';
    }
    window.__ppWhiteboards[payload.id]=payload;
    var parts=[];
    if(payload.strokeCount)parts.push(payload.strokeCount+' stroke'+(payload.strokeCount===1?'':'s'));
    if(payload.stickies&&payload.stickies.length)parts.push(payload.stickies.length+' sticky');
    if(payload.note)parts.push('note');
    status(board,'Queued'+(parts.length?' ('+parts.join(' · ')+')':'')+' — Send to Agent from the sidebar');
    document.dispatchEvent(new CustomEvent('pp-wb-queued',{detail:payload}));
  },true);

  window.__ppCollectWhiteboards=function(){
    var out=[], map=window.__ppWhiteboards||{};
    Object.keys(map).forEach(function(k){out.push(map[k]);});
    return out;
  };
})();`;
