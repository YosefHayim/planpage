// Freehand whiteboard island — pen / shapes / sticky / export PNG for agent feedback.
// Uses rough.js (window.rough) when available for an Excalidraw-like sketch stroke.

/**
 * Whiteboard boards (`[data-whiteboard]`): freehand + rough shapes, stickies, undo/clear,
 * queue PNG + note via window.__ppWhiteboards for the post-back collect.
 */
export const WHITEBOARD_SCRIPT = `(function(){
  var boards=document.querySelectorAll('[data-whiteboard]');
  if(!boards.length)return;
  if(!window.__ppWhiteboards)window.__ppWhiteboards={};

  function status(board,msg){
    var el=board.querySelector('[data-wb-status]');
    if(!el)return;
    el.textContent=msg;el.classList.remove('hidden');
    setTimeout(function(){el.classList.add('hidden');},2600);
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
    var strokes=[]; // {kind, color, points?, x,y,w,h, text?}
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

    function drawStroke(s,preview){
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
        // arrow head
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
      function poly(st){
        if(!st.points||st.points.length<2)return;
        ctx.beginPath();
        ctx.moveTo(st.points[0].x,st.points[0].y);
        for(var j=1;j<st.points.length;j++)ctx.lineTo(st.points[j].x,st.points[j].y);
        ctx.stroke();
      }
    }

    function hexAlpha(hex,a){
      var h=hex.replace('#','');
      if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      var r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
      return 'rgba('+r+','+g+','+b+','+a+')';
    }

    function redraw(){
      bg();
      strokes.forEach(function(s){drawStroke(s,false);});
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
      });
    }

    function setColor(c){
      color=c;
      board.querySelectorAll('[data-wb-color]').forEach(function(b){
        b.classList.toggle('pp-wb-swatch-on',b.getAttribute('data-wb-color')===c);
      });
    }

    function addSticky(x,y){
      if(!stickies)return;
      var note=document.createElement('div');
      note.className='pp-wb-sticky';
      note.contentEditable=editable?'true':'false';
      note.style.left=x+'px';
      note.style.top=y+'px';
      note.textContent='Note…';
      note.style.pointerEvents='auto';
      // drag sticky
      var drag=null;
      note.addEventListener('pointerdown',function(e){
        if(e.target!==note)return;
        drag={x:e.clientX,y:e.clientY,l:note.offsetLeft,t:note.offsetTop};
        note.setPointerCapture&&note.setPointerCapture(e.pointerId);
      });
      note.addEventListener('pointermove',function(e){
        if(!drag)return;
        note.style.left=(drag.l+e.clientX-drag.x)+'px';
        note.style.top=(drag.t+e.clientY-drag.y)+'px';
      });
      note.addEventListener('pointerup',function(){drag=null;});
      stickies.appendChild(note);
      note.focus();
    }

    function onDown(e){
      if(!editable)return;
      e.preventDefault();
      var p=pos(e);
      if(tool==='sticky'){addSticky(p.x,p.y);return;}
      drawing=true;
      start=p;
      points=[p];
      snapshot=ctx.getImageData(0,0,canvas.width,canvas.height);
    }
    function onMove(e){
      if(!drawing||!editable)return;
      e.preventDefault();
      var p=pos(e);
      if(tool==='pen'||tool==='highlight'||tool==='eraser'){
        points.push(p);
        if(snapshot)ctx.putImageData(snapshot,0,0);
        drawStroke({kind:tool,color:color,points:points},true);
      }else{
        if(snapshot)ctx.putImageData(snapshot,0,0);
        drawStroke({kind:tool,color:color,x:start.x,y:start.y,w:p.x-start.x,h:p.y-start.y},true);
      }
    }
    function onUp(e){
      if(!drawing)return;
      drawing=false;
      var p=e?pos(e):points[points.length-1];
      if(tool==='pen'||tool==='highlight'||tool==='eraser'){
        if(points.length>1)strokes.push({kind:tool,color:color,points:points.slice()});
      }else if(start&&p){
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

    board._ppExport=function(){
      // composite stickies onto export via html2canvas-less path: just canvas PNG + sticky texts
      var stickyNotes=[];
      if(stickies){
        stickies.querySelectorAll('.pp-wb-sticky').forEach(function(n){
          stickyNotes.push({text:(n.textContent||'').trim(),x:n.offsetLeft,y:n.offsetTop});
        });
      }
      return {
        id:board.getAttribute('data-wb-id')||'whiteboard',
        title:board.getAttribute('data-wb-title')||'Whiteboard',
        pngDataUrl:canvas.toDataURL('image/png'),
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
    payload.note=noteEl?noteEl.value.trim():'';
    if(payload.strokeCount===0&&!(payload.stickies&&payload.stickies.length)&&!payload.note){
      status(board,'Draw something (or add a note) first');
      return;
    }
    window.__ppWhiteboards[payload.id]=payload;
    status(board,'Queued sketch — Send to Agent from the sidebar');
    document.dispatchEvent(new CustomEvent('pp-wb-queued',{detail:payload}));
  },true);

  window.__ppCollectWhiteboards=function(){
    var out=[], map=window.__ppWhiteboards||{};
    Object.keys(map).forEach(function(k){out.push(map[k]);});
    return out;
  };
})();`;
