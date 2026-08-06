// Client-side island script inlined into the rendered document.
// Constant infra (never skill data), injected by the Shell. Tiny, dependency-free.

/**
 * Opt-in slideshow Carousel: prev/next arrows, dots, swipe sync, autoplay (unless reduced motion).
 * Marquee mode is pure CSS and ignored.
 *
 * IMPORTANT: only scrolls the carousel viewport (`scrollLeft`). Never call scrollIntoView —
 * that scrolls the document and made the gallery jump/smooth-scroll to the top on resize
 * and every autoplay tick.
 */
export const CAROUSEL_SCRIPT = `(function(){
  if(!document.querySelector('[data-carousel]'))return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-carousel][data-mode="slideshow"]').forEach(function(root){
    var view=root.querySelector('[data-carousel-viewport]');if(!view)return;
    var slides=Array.prototype.slice.call(root.querySelectorAll('[data-slide]'));
    var dots=Array.prototype.slice.call(root.querySelectorAll('[data-carousel-dot]'));
    var n=slides.length;if(n<2)return;
    var index=0,timer=null,locked=false,lastW=0;
    var interval=parseInt(root.getAttribute('data-interval'),10)||4000;

    function paint(){
      dots.forEach(function(d,i){
        var on=i===index;
        d.classList.toggle('bg-indigo-500',on);
        d.classList.toggle('w-4',on);
        d.classList.toggle('bg-slate-300',!on);
        d.classList.toggle('dark:bg-slate-600',!on);
        d.setAttribute('aria-current',on?'true':'false');
      });
      slides.forEach(function(s,i){s.setAttribute('aria-hidden',i===index?'false':'true');});
    }

    /** Scroll only the strip — never the page. */
    function goto(i,smooth){
      index=(i%n+n)%n;
      var slide=slides[index];
      if(!slide)return;
      locked=true;
      var left=slide.offsetLeft;
      if(smooth!==false&&typeof view.scrollTo==='function'){
        view.scrollTo({left:left,behavior:'smooth'});
      }else{
        view.scrollLeft=left;
      }
      paint();
      setTimeout(function(){locked=false;},smooth===false?0:350);
    }

    function next(){goto(index+1);}
    function prev(){goto(index-1);}
    function start(){if(reduce||timer)return;timer=setInterval(next,interval);}
    function stop(){if(timer){clearInterval(timer);timer=null;}}
    function bump(fn){return function(e){if(e){e.preventDefault();e.stopPropagation();}stop();fn();start();};}

    var prevBtn=root.querySelector('[data-carousel-prev]');
    var nextBtn=root.querySelector('[data-carousel-next]');
    if(prevBtn)prevBtn.addEventListener('click',bump(prev));
    if(nextBtn)nextBtn.addEventListener('click',bump(next));
    dots.forEach(function(d,i){d.addEventListener('click',bump(function(){goto(i);}));});

    root.addEventListener('mouseenter',stop);
    root.addEventListener('mouseleave',start);
    root.addEventListener('focusin',stop);
    root.addEventListener('focusout',start);

    root.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'){e.preventDefault();stop();next();start();}
      else if(e.key==='ArrowLeft'){e.preventDefault();stop();prev();start();}
    });

    var ticking=false;
    view.addEventListener('scroll',function(){
      if(locked||ticking)return;
      ticking=true;
      requestAnimationFrame(function(){
        ticking=false;
        var mid=view.scrollLeft+view.clientWidth/2;
        var best=0,bestDist=Infinity;
        slides.forEach(function(s,i){
          var c=s.offsetLeft+s.offsetWidth/2;
          var dist=Math.abs(c-mid);
          if(dist<bestDist){bestDist=dist;best=i;}
        });
        if(best!==index){index=best;paint();}
      });
    },{passive:true});

    // Size slides to the viewport; only re-snap when width actually changes (layout thrash
    // from mermaid/images used to call scrollIntoView and yank the page to the top).
    function sizeSlides(){
      var w=view.clientWidth;
      if(!w||w===lastW)return;
      lastW=w;
      slides.forEach(function(s){s.style.flex='0 0 '+w+'px';s.style.width=w+'px';s.style.minWidth=w+'px';});
      goto(index,false);
    }
    sizeSlides();
    var roTimer=null;
    if(typeof ResizeObserver!=='undefined'){
      new ResizeObserver(function(){
        if(roTimer)clearTimeout(roTimer);
        roTimer=setTimeout(sizeSlides,80);
      }).observe(view);
    }else{
      window.addEventListener('resize',function(){
        if(roTimer)clearTimeout(roTimer);
        roTimer=setTimeout(sizeSlides,80);
      });
    }

    paint();
    start();
  });
})();`;
