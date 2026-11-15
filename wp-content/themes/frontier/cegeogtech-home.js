(function(){
  "use strict";
  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  /* header + back to top + steps */
  var head=$("#head"), topBtn=$("#top"), ticking=false;
  var stepsEl=$("#steps"), stepItems=$$(".step");
  function stepsUpdate(){
    if(!stepsEl) return;
    var r=stepsEl.getBoundingClientRect(), mark=innerHeight*.6;
    stepsEl.style.setProperty("--p",Math.max(0,Math.min(1,(mark-r.top)/r.height)).toFixed(4));
    stepItems.forEach(function(s){s.classList.toggle("on",s.getBoundingClientRect().top<mark)});
  }
  function onScroll(){
    head.classList.toggle("scrolled",scrollY>10);
    topBtn.classList.toggle("show",scrollY>900);
    stepsUpdate(); ticking=false;
  }
  addEventListener("scroll",function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
  addEventListener("resize",stepsUpdate);
  topBtn.addEventListener("click",function(){scrollTo({top:0,behavior:reduce?"auto":"smooth"})});
  $("#yr").textContent=new Date().getFullYear();

  /* navigation */
  var nav=$("#nav"), toggle=$("#navToggle");
  toggle.addEventListener("click",function(e){
    var o=nav.classList.toggle("open"); toggle.setAttribute("aria-expanded",o); e.stopPropagation();
  });
  function closeAll(){
    $$("#nav>ul>li.open").forEach(function(x){x.classList.remove("open");x.firstElementChild.setAttribute("aria-expanded","false")});
  }
  $$("#nav>ul>li>button").forEach(function(b){
    b.addEventListener("click",function(e){
      var li=b.parentNode, was=li.classList.contains("open");
      closeAll();
      if(!was){li.classList.add("open");b.setAttribute("aria-expanded","true")}
      e.stopPropagation();
    });
  });
  document.addEventListener("click",function(e){ if(!e.target.closest("#nav")) closeAll() });
  addEventListener("keydown",function(e){ if(e.key==="Escape"){closeAll();nav.classList.remove("open");toggle.setAttribute("aria-expanded","false")} });

  /* hex motif */
  (function(){
    var g=$("#hexMotif"); if(!g) return;
    var R=24,w=Math.sqrt(3)*R,svgNS="http://www.w3.org/2000/svg";
    for(var row=-3;row<10;row++)for(var col=-3;col<12;col++){
      var cx=col*w+(row%2?w/2:0),cy=row*R*1.5,pts=[];
      for(var k=0;k<6;k++){var a=Math.PI/180*(60*k-30);pts.push((cx+R*Math.cos(a)).toFixed(1)+","+(cy+R*Math.sin(a)).toFixed(1))}
      var polygon=document.createElementNS(svgNS,"polygon");
      polygon.setAttribute("points",pts.join(" "));
      g.appendChild(polygon);
    }
  })();

  /* counters */
  function runCounter(el){
    var t=el.getAttribute("data-count");
    t=t==="years"?Math.max(0,new Date().getFullYear()-2011):parseInt(t,10);
    if(reduce){el.textContent=t;return}
    var s=performance.now(),d=1800,from=el.hasAttribute("data-plain")?t-60:0;
    (function f(n){var p=Math.min(1,(n-s)/d),e=1-Math.pow(1-p,4);el.textContent=Math.round(from+(t-from)*e);if(p<1)requestAnimationFrame(f)})(s);
  }
  var cs=$$("[data-count]");
  if("IntersectionObserver" in window){
    var co=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){runCounter(e.target);co.unobserve(e.target)}})},{threshold:.6});
    cs.forEach(function(c){co.observe(c)});
  } else cs.forEach(runCounter);

  /* video */
  var vid=$("#vid");
  if(vid) vid.addEventListener("click",function(){
    var id="bjckQZJY554";
    if(location.protocol.indexOf("http")===0){
      var f=document.createElement("iframe");
      f.src="https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1&rel=0";
      f.title="CeGeoGTech video";f.allow="autoplay; encrypted-media; picture-in-picture";f.allowFullscreen=true;
      vid.appendChild(f);
    } else window.open("https://www.youtube.com/watch?v="+id,"_blank","noopener");
  });

  /* hero: alkali-activated network */
  var hero=$("#hero"),cv=$("#lattice"),cx=cv.getContext("2d");
  var W=0,H=0,dpr=1,nodes=[],L=120,R=170,visible=true,t0=performance.now();
  var mouse={x:0,y:0,on:false},lastMove=-1e9,lastRead=0;
  var connEl=$("#conn"),meter=$("#meter"),bondEl=$("#bondN");
  var DUST=[130,170,146],ACT=[176,228,124];

  function init(){
    dpr=Math.min(devicePixelRatio||1,2);
    var r=hero.getBoundingClientRect();W=r.width;H=r.height;
    cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);
    var n=Math.max(55,Math.min(190,Math.round(W*H/8500)));
    L=Math.max(90,Math.min(140,W/11));R=Math.max(130,Math.min(200,W/7));
    nodes=[];
    for(var i=0;i<n;i++)nodes.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.28,vy:(Math.random()-.5)*.28,r:2+Math.random()*2.4,a:0});
    if(reduce)staticFrame();
  }
  function hex(x,y,s){
    cx.beginPath();
    for(var k=0;k<6;k++){var a=Math.PI/3*k+Math.PI/6,px=x+s*Math.cos(a),py=y+s*Math.sin(a);k?cx.lineTo(px,py):cx.moveTo(px,py)}
    cx.closePath();
  }
  function frame(now,acts){
    cx.clearRect(0,0,W,H);
    var i,j,n=nodes,len=n.length,A,d,dx,dy,sum=0,bonds=0;
    for(i=0;i<acts.length;i++){
      A=acts[i];
      var g=cx.createRadialGradient(A.x,A.y,0,A.x,A.y,R*1.2);
      g.addColorStop(0,"rgba(98,166,57,"+(.34*A.k)+")");g.addColorStop(1,"rgba(98,166,57,0)");
      cx.fillStyle=g;cx.fillRect(A.x-R*1.3,A.y-R*1.3,R*2.6,R*2.6);
    }
    for(i=0;i<len;i++){
      var p=n[i];
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<-10)p.x=W+10;else if(p.x>W+10)p.x=-10;
      if(p.y<-10)p.y=H+10;else if(p.y>H+10)p.y=-10;
      for(j=0;j<acts.length;j++){
        A=acts[j];dx=A.x-p.x;dy=A.y-p.y;d=Math.sqrt(dx*dx+dy*dy);
        if(d<R){var f=1-d/R;p.a=Math.min(1,p.a+f*.1*A.k);if(d>20){p.x+=dx/d*f*.5;p.y+=dy/d*f*.5}}
      }
      p.a*=.9955;if(p.a<.003)p.a=0;
      sum+=p.a;
    }
    cx.lineCap="round";
    for(i=0;i<len;i++){
      var a=n[i];if(a.a<.06)continue;
      for(j=i+1;j<len;j++){
        var b=n[j];if(b.a<.06)continue;
        dx=a.x-b.x;dy=a.y-b.y;d=dx*dx+dy*dy;
        if(d<L*L){
          var s=Math.min(a.a,b.a)*(1-Math.sqrt(d)/L*.6);
          cx.strokeStyle="rgba(176,228,124,"+(s*.8).toFixed(3)+")";cx.lineWidth=.8+s*1.5;
          cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke();
          if(s>.25)bonds++;
        }
      }
    }
    for(i=0;i<len;i++){
      var q=n[i],k=q.a;
      var al=.32+.68*k;
      var rr=Math.round(DUST[0]+(ACT[0]-DUST[0])*k),gg=Math.round(DUST[1]+(ACT[1]-DUST[1])*k),bb=Math.round(DUST[2]+(ACT[2]-DUST[2])*k);
      cx.fillStyle="rgba("+rr+","+gg+","+bb+","+al.toFixed(2)+")";
      if(k>.35){hex(q.x,q.y,q.r*(1.5+k*.9));cx.fill()}
      else{cx.beginPath();cx.arc(q.x,q.y,q.r*(.8+k),0,6.283);cx.fill()}
    }
    if(now-lastRead>160){
      lastRead=now;
      var conn=Math.round(Math.min(1,sum/len*3.4)*100);
      connEl.textContent=conn;meter.style.width=conn+"%";bondEl.textContent=bonds;
    }
  }
  function staticFrame(){
    var mx=W*.7,my=H*.45;
    nodes.forEach(function(p){var d=Math.hypot(p.x-mx,p.y-my);p.a=d<R*1.4?Math.max(0,1-d/(R*1.4)):0});
    frame(1e9,[{x:mx,y:my,k:.8}]);
  }
  function loop(now){
    if(visible&&!document.hidden){
      var acts=[],idle=now-lastMove>2600;
      if(mouse.on&&!idle)acts.push({x:mouse.x,y:mouse.y,k:1});
      else{
        var t=now-t0;
        acts.push({x:W*(.55+.32*Math.sin(t*.00042)),y:H*(.5+.3*Math.sin(t*.00061+1.3)),k:.85});
        acts.push({x:W*(.5+.3*Math.sin(t*.00033+3)),y:H*(.5+.3*Math.cos(t*.00047)),k:.6});
      }
      frame(now,acts);
    }
    requestAnimationFrame(loop);
  }
  function move(e){var r=cv.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;mouse.on=true;lastMove=performance.now()}
  hero.addEventListener("pointermove",move);
  hero.addEventListener("pointerdown",move);
  hero.addEventListener("pointerleave",function(){mouse.on=false});
  if("IntersectionObserver" in window)new IntersectionObserver(function(es){visible=es[0].isIntersecting}).observe(hero);
  var rt;addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(init,200)});
  init();
  if(!reduce)requestAnimationFrame(loop);
  onScroll();
})();