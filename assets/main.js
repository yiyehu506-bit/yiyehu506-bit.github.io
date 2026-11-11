(function(){
  'use strict';
  var root=document.documentElement;
  root.classList.add('js');
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer=window.matchMedia&&window.matchMedia('(pointer: fine)').matches;
  function $(s,c){return (c||document).querySelector(s);}
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}

  /* ---------- theme ---------- */
  var toggle=$('#themeToggle');
  toggle.addEventListener('click',function(){
    var next=root.getAttribute('data-theme')==='light'?'dark':'light';
    root.setAttribute('data-theme',next);
    try{localStorage.setItem('jone-theme',next);}catch(e){}
  });

  /* ---------- scroll: progress, parallax, nav, timeline ---------- */
  var bar=$('#progress span'),nav=$('#nav'),layers=$$('[data-parallax]'),tl=$('#timeline'),tlFill=$('#tlFill'),tlItems=$$('.tl-item');
  var sections=$$('main section[id]'),links=$$('.nav-links a');
  var ticking=false;
  function onScroll(){
    var scrollY=window.pageYOffset;
    var max=document.documentElement.scrollHeight-window.innerHeight;
    bar.style.transform='scaleX('+(max>0?scrollY/max:0)+')';
    nav.classList.toggle('scrolled',scrollY>30);
    if(!reduce)layers.forEach(function(l){l.style.transform='translate3d(0,'+(scrollY*parseFloat(l.getAttribute('data-parallax'))*-1)+'px,0)';});
    var r=tl.getBoundingClientRect(),vh=window.innerHeight;
    var prog=Math.min(1,Math.max(0,(vh*.65-r.top)/r.height));
    tlFill.style.transform='scaleY('+(reduce?1:prog)+')';
    tlItems.forEach(function(it){var n=it.querySelector('.tl-node').getBoundingClientRect();it.classList.toggle('lit',n.top<vh*.65||reduce);});
    var cur='';sections.forEach(function(s){if(s.getBoundingClientRect().top<vh*.4)cur=s.id;});
    links.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+cur);});
    ticking=false;
  }
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll);}},{passive:true});
  window.addEventListener('resize',onScroll);
  onScroll();

  /* ---------- reveal + stagger + count-up ---------- */
  $$('.stagger').forEach(function(g){Array.prototype.forEach.call(g.children,function(c,i){c.style.setProperty('--i',i);});});
  var counters=$$('.count');
  counters.forEach(function(el){el.setAttribute('data-final',el.textContent);if(!reduce)el.textContent=(0).toFixed(+el.getAttribute('data-dec')||0);});
  function countUp(el){
    if(el._done)return;el._done=true;
    var to=parseFloat(el.getAttribute('data-to')),dec=+el.getAttribute('data-dec')||0,dur=1800,st=null;
    if(reduce){el.textContent=to.toFixed(dec);return;}
    function step(ts){if(!st)st=ts;var p=Math.min(1,(ts-st)/dur),e=1-Math.pow(1-p,4);el.textContent=(to*e).toFixed(dec);if(p<1)requestAnimationFrame(step);else el.textContent=to.toFixed(dec);}
    requestAnimationFrame(step);
  }
  function activate(el){
    el.classList.add('in');setTimeout(function(){el.classList.add('settled');},1600);
    $$('.count',el).forEach(countUp);
    $$('.bar span',el).forEach(function(b){b.style.width=b.getAttribute('data-w')+'%';});
  }
  var targets=$$('.reveal,.stagger');
  function sweep(){var vh=window.innerHeight;targets.forEach(function(t){if(!t.classList.contains('in')&&t.getBoundingClientRect().top<vh*0.94){activate(t);if(window.__io)window.__io.unobserve(t);}});}
  window.addEventListener('scroll',function(){clearTimeout(window.__sw);window.__sw=setTimeout(sweep,120);},{passive:true});
  if('IntersectionObserver' in window&&!reduce){
    var io=window.__io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){activate(e.target);io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    targets.forEach(function(t){io.observe(t);});
  }else targets.forEach(activate);

  /* ---------- typewriter ---------- */
  var typed=$('#typed'),words=['短剧内容运营','视频运营','数据分析','活动运营'],wi=0,ci=0,del=false;
  function type(){
    var w=words[wi];
    if(reduce){typed.textContent=w;return;}
    if(!del){ci++;typed.textContent=w.slice(0,ci);if(ci===w.length){del=true;return setTimeout(type,1800);}}
    else{ci--;typed.textContent=w.slice(0,ci);if(ci===0){del=false;wi=(wi+1)%words.length;return setTimeout(type,350);}}
    setTimeout(type,del?55:120);
  }
  setTimeout(type,600);

  /* ---------- 3D tilt + sheen ---------- */
  if(finePointer&&!reduce){
    $$('.tilt').forEach(function(el){
      el.addEventListener('pointermove',function(e){
        var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
        el.style.setProperty('--mx',(x*100)+'%');el.style.setProperty('--my',(y*100)+'%');
        var m=el.offsetWidth>500?1.2:2.4;
        el.style.transform='perspective(900px) rotateX('+((.5-y)*m)+'deg) rotateY('+((x-.5)*m)+'deg) translateY(-3px)';
      });
      el.addEventListener('pointerleave',function(){el.style.transform='';});
    });
  }

  /* ---------- magnetic buttons + ripple ---------- */
  $$('.btn').forEach(function(b){
    b.addEventListener('pointermove',function(e){
      var r=b.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
      b.style.setProperty('--mx',x+'px');b.style.setProperty('--my',y+'px');
      if(finePointer&&!reduce&&b.classList.contains('magnetic'))b.style.transform='translate('+((x-r.width/2)*.18)+'px,'+((y-r.height/2)*.25)+'px)';
    });
    b.addEventListener('pointerleave',function(){b.style.transform='';});
    b.addEventListener('click',function(e){
      var r=b.getBoundingClientRect(),s=Math.max(r.width,r.height),sp=document.createElement('span');
      sp.className='ripple';sp.style.width=sp.style.height=s+'px';
      sp.style.left=(e.clientX-r.left-s/2)+'px';sp.style.top=(e.clientY-r.top-s/2)+'px';
      b.appendChild(sp);setTimeout(function(){sp.remove();},650);
    });
  });

  /* ---------- project cards ---------- */
  function flashTarget(id){
    var t=document.getElementById(id);if(!t)return;
    t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
    t.classList.remove('flash');void t.offsetWidth;t.classList.add('flash');
  }
  $$('.project[data-target]').forEach(function(p){
    var btn=$('.p-expand',p);
    function tog(){var o=p.classList.toggle('open');btn.textContent=o?'收起详情':'展开详情';}
    btn.addEventListener('click',function(e){e.stopPropagation();tog();});
    $('.p-jump',p).addEventListener('click',function(e){e.preventDefault();e.stopPropagation();flashTarget(p.getAttribute('data-target'));});
    p.addEventListener('click',tog);
    p.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();tog();}});
  });


  /* ---------- boy figure: part glow, label, eye follow, head tilt ---------- */
  (function(){
    var svg=$('#boy');if(!svg)return;
    var stage=$('#figStage'),label=$('#partLabel'),ltxt=$('span',label),parts=$$('.part',svg),pupils=$$('.pupil',svg),head=$('.head',svg),current=null;
    function place(p){
      var sr=stage.getBoundingClientRect(),pr=p.getBoundingClientRect();
      var cx=pr.left+pr.width/2-sr.left,cy=pr.top+pr.height/2-sr.top,right=cx<sr.width*.5?false:true;
      ltxt.textContent=p.getAttribute('data-part');
      label.classList.toggle('left',!right);
      label.style.top=(cy-14)+'px';
      if(right){label.style.left=(pr.right-sr.left+6)+'px';label.style.right='auto';}
      else{label.style.left='auto';label.style.right=(sr.right-pr.left+6)+'px';}
      if(p.getAttribute('data-part')==='上衣'){label.classList.remove('left');label.style.right='auto';label.style.left=(pr.right-sr.left-30)+'px';}
    }
    function on(p){if(current===p)return;off();current=p;p.classList.add('on');place(p);label.classList.add('show');}
    function off(){if(current)current.classList.remove('on');current=null;label.classList.remove('show');}
    parts.forEach(function(p){
      p.addEventListener('pointerenter',function(e){if(e.pointerType!=='touch')on(p);});
      p.addEventListener('pointerleave',function(e){if(e.pointerType!=='touch'&&current===p)off();});
      var wasOn=false;
      p.addEventListener('pointerdown',function(){wasOn=(current===p);});
      p.addEventListener('click',function(e){e.stopPropagation();if(wasOn&&e.pointerType==='touch'){off();p.blur();}else on(p);wasOn=false;});
      p.addEventListener('focus',function(){on(p);});
      p.addEventListener('blur',function(){if(current===p)off();});
    });
    document.addEventListener('click',function(e){if(!svg.contains(e.target))off();});
    window.addEventListener('resize',function(){if(current)place(current);});
    if(reduce)return;
    var mx=null,my=null;
    window.addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;look();},{passive:true});
    function look(){
      if(mx===null)return;
      pupils.forEach(function(pu){
        var c=pu.parentNode.previousElementSibling.getBoundingClientRect(),ex=c.left+c.width/2,ey=c.top+c.height/2;
        var dx=mx-ex,dy=my-ey,d=Math.sqrt(dx*dx+dy*dy)||1,k=Math.min(1,d/260),s=svg.getBoundingClientRect().width/420;
        var ux=dx/d*4.2*k,uy=dy/d*3.6*k;
        pu.style.transform='translate('+ux+'px,'+uy+'px)';
      });
      var r=svg.getBoundingClientRect(),hx=(mx-(r.left+r.width/2))/window.innerWidth;
      if(r.bottom>0&&r.top<window.innerHeight)head.style.transform='rotate('+Math.max(-4,Math.min(4,hx*8))+'deg)';
    }
  })();

  /* ---------- copy email ---------- */
  var toast=$('#toast'),tt;
  function showToast(m){toast.textContent=m;toast.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('show');},1800);}
  $('#copyEmail').addEventListener('click',function(){
    var mail='onej76483@gmail.com';
    function fallback(){var ta=document.createElement('textarea');ta.value=mail;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');showToast('已复制邮箱：'+mail);}catch(e){showToast(mail);}ta.remove();}
    if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(mail).then(function(){showToast('已复制邮箱：'+mail);},fallback);else fallback();
  });
})();
