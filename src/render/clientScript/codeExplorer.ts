// Client-side island script inlined into the rendered document.
// Constant infra (never skill data), injected by the Shell. Tiny, dependency-free.

/**
 * Opt-in (any page with a CodeExplorer): switches the open file, flips a file's before/after
 * pane, and drag-resizes the tree/editor split. Scoped to the nearest [data-explorer].
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

  /* Drag-resize tree / editor split */
  var drag=null;
  document.addEventListener('pointerdown',function(e){
    var split=e.target.closest&&e.target.closest('[data-explorer-split]');
    if(!split)return;
    var root=split.closest('[data-explorer]');
    var tree=root&&root.querySelector('[data-explorer-tree]');
    if(!root||!tree)return;
    e.preventDefault();
    drag={root:root,tree:tree,startX:e.clientX,startW:tree.getBoundingClientRect().width};
    split.setPointerCapture&&split.setPointerCapture(e.pointerId);
    document.body.classList.add('pp-resizing');
  });
  document.addEventListener('pointermove',function(e){
    if(!drag)return;
    var dx=e.clientX-drag.startX;
    var next=Math.min(Math.max(drag.startW+dx,8*16),28*16);
    drag.root.style.setProperty('--pp-tree',next+'px');
    drag.tree.style.width=next+'px';
  });
  function endDrag(){
    if(!drag)return;
    drag=null;
    document.body.classList.remove('pp-resizing');
  }
  document.addEventListener('pointerup',endDrag);
  document.addEventListener('pointercancel',endDrag);
  document.addEventListener('keydown',function(e){
    var split=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('[data-explorer-split]');
    if(!split)return;
    if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
    var root=split.closest('[data-explorer]');
    var tree=root&&root.querySelector('[data-explorer-tree]');
    if(!root||!tree)return;
    e.preventDefault();
    var cur=tree.getBoundingClientRect().width;
    var next=Math.min(Math.max(cur+(e.key==='ArrowRight'?16:-16),8*16),28*16);
    root.style.setProperty('--pp-tree',next+'px');
    tree.style.width=next+'px';
  });
})();`;
