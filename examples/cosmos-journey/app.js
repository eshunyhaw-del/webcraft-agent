(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var clamp=function(x,a,b){return Math.max(a===undefined?0:a,Math.min(b===undefined?1:b,x))};
var seg=function(p,a,b){return clamp((p-a)/(b-a))};
var ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
var lerp=function(a,b,t){return a+(b-a)*t};
var root=document.documentElement;
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
root.classList.add('js');if(reduce)root.classList.add('calm');
var paused=false;

/* ---------- hero entrance fallback ---------- */
requestAnimationFrame(function(){requestAnimationFrame(function(){
  var all=$$('.e');
  var ok=all.some(function(el){return el.getAnimations&&el.getAnimations().some(function(a){return a.playState==='running'||a.playState==='finished'})});
  if(!ok)all.forEach(function(el){el.classList.add('is-in')});
  all.forEach(function(el){el.addEventListener('animationend',function(){el.classList.add('is-in')},{once:true})});
})});

/* ---------- headline word split (for blur-in reveals) ---------- */
function split(node,ctr){
  Array.prototype.slice.call(node.childNodes).forEach(function(n){
    if(n.nodeType===3){
      var frag=document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(function(t){
        if(!t)return;
        if(/^\s+$/.test(t)){frag.appendChild(document.createTextNode(' '));return}
        var s=document.createElement('span');s.className='w';s.style.setProperty('--i',ctr.i++);s.textContent=t;frag.appendChild(s);
      });
      n.parentNode.replaceChild(frag,n);
    }else if(n.nodeType===1&&!n.classList.contains('w')&&!n.classList.contains('e'))split(n,ctr);
  });
}
$$('.big').forEach(function(h){if(!h.closest('.hero'))split(h,{i:0})});

/* ---------- chapters ---------- */
var chapters=$$('.ch').map(function(el){return{
  el:el,pin:$('.ch__pin',el),media:$('[data-media]',el),beats:$$('.beat',el),vid:$('[data-vid]',el),
  dist:parseFloat(el.dataset.dist),name:el.dataset.name,p:0,vis:false}});
var quiz=$('#quiz');
var vh=innerHeight,vw=innerWidth;
var track=$('#ptrack'),mqMobile=matchMedia('(max-width:900px)');
function isCalm(){return root.classList.contains('calm')}

/* video play/pause only when near the viewport */
if('IntersectionObserver' in window){
  var vio=new IntersectionObserver(function(es){es.forEach(function(e){
    var c=chapters.filter(function(c){return c.el===e.target})[0];if(!c||!c.vid)return;
    c.near=e.isIntersecting;syncVid(c);
  })},{rootMargin:'25% 0px 25% 0px'});
  chapters.forEach(function(c){vio.observe(c.el)});
}
function syncVid(c){
  var v=c.vid;if(!v)return;
  if(c.near&&!paused&&!isCalm()){var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause();
}
chapters.forEach(function(c){if(c.vid&&c.el.id==='c0'){c.near=true}});

/* ---------- distance odometer ---------- */
var LY=9.4607e12,hud=$('#hud'),hudV=$('#hudV'),hudT=$('#hudT'),hudN=$('#hudN'),hudL=$('#hudL');
function fmtDist(km){
  if(km<1e6)return Math.round(km).toLocaleString('en-US')+' km';
  if(km<1e9)return (km/1e6).toFixed(km<1e7?2:1)+' million km';
  if(km<1e12)return (km/1e9).toFixed(2)+' billion km';
  var ly=km/LY;
  if(ly<1000)return ly.toFixed(ly<10?2:1)+' light-years';
  if(ly<1e6)return Math.round(ly).toLocaleString('en-US')+' light-years';
  if(ly<1e9)return (ly/1e6).toFixed(2)+' million light-years';
  return (ly/1e9).toFixed(2)+' billion light-years';
}
function fmtLight(km){
  var s=km/299792.458;
  if(s<60)return s.toFixed(s<10?(s<.1?3:2):1)+' seconds';
  if(s<3600)return Math.floor(s/60)+' min '+Math.round(s%60)+' s';
  if(s<86400)return (s/3600).toFixed(1)+' hours';
  var y=s/31557600;
  if(y<1000)return y.toFixed(y<10?2:1)+' years';
  if(y<1e6)return Math.round(y).toLocaleString('en-US')+' years';
  if(y<1e9)return (y/1e6).toFixed(2)+' million years';
  return (y/1e9).toFixed(2)+' billion years';
}
var lnShown=Math.log(408),lnTarget=lnShown,warp=0;

/* ---------- rail + sheet ---------- */
var rail=$('#rail'),sheet=$('#sheet');
chapters.forEach(function(c,i){
  var b=document.createElement('button');b.setAttribute('aria-label','Go to '+c.name);b.title=c.name;
  b.addEventListener('click',function(){go(c.el)});rail.appendChild(b);c.dot=b;
  var a=document.createElement('a');a.href='#'+c.el.id;a.innerHTML='<span>'+c.name+'</span>';sheet.appendChild(a);
});
(function(){var a=document.createElement('a');a.href='#quiz';a.innerHTML='<span>Quiz</span>';sheet.appendChild(a);
 var b=document.createElement('button');b.setAttribute('aria-label','Go to the quiz');b.title='Quiz';b.addEventListener('click',function(){go(quiz)});rail.appendChild(b);chapters.quizDot=b})();
function go(el){window.scrollTo({top:el.getBoundingClientRect().top+scrollY+(el.id==='quiz'?0:2),behavior:isCalm()?'auto':'smooth'})}
var mb=$('#menuBtn');
function menu(o){document.body.classList.toggle('menu-open',o);mb.setAttribute('aria-expanded',o);mb.textContent=o?'Close':'Menu'}
mb.addEventListener('click',function(){menu(!document.body.classList.contains('menu-open'))});
$$('a',sheet).forEach(function(a){a.addEventListener('click',function(){menu(false)})});
addEventListener('keydown',function(e){if(e.key==='Escape')menu(false)});

/* pause motion */
var calmBtn=$('#calmBtn');
calmBtn.addEventListener('click',function(){
  paused=!paused;calmBtn.setAttribute('aria-pressed',paused);$('.lbl',calmBtn).textContent=paused?'Resume motion':'Pause motion';$('span',calmBtn).textContent=paused?'▶':'❚❚';
  chapters.forEach(syncVid);
});

/* ---------- starfield ---------- */
var sc=$('#stars'),sx=sc.getContext('2d'),S=[],SW=0,SH=0,mxp=.5,myp=.5,velS=0,lastY=scrollY;
function sizeStars(){
  var d=Math.min(devicePixelRatio||1,2);SW=innerWidth;SH=innerHeight;sc.width=SW*d;sc.height=SH*d;sx.setTransform(d,0,0,d,0,0);
  var n=SW<700?190:430;S=[];for(var i=0;i<n;i++)S.push({x:Math.random(),y:Math.random(),z:.15+Math.random()*.85,t:Math.random()*6.28,c:Math.random()<.12?1:0});
}
sizeStars();
addEventListener('pointermove',function(e){mxp=e.clientX/innerWidth;myp=e.clientY/innerHeight},{passive:true});
function drawStars(t){
  sx.clearRect(0,0,SW,SH);
  var still=isCalm()||paused;
  var v=still?0:velS,streak=Math.min(Math.abs(v)*.9,160)*(1+warp*1.5);
  for(var i=0;i<S.length;i++){
    var s=S[i];
    if(!still){s.y-=v*s.z*.0016*(1+warp*1.2)/(SH/900);if(s.y<0)s.y+=1;if(s.y>1)s.y-=1}
    var x=s.x*SW+(mxp-.5)*s.z*-26,y=s.y*SH;
    var tw=still?1:.65+.35*Math.sin(t*.0012+s.t);
    sx.globalAlpha=(.25+s.z*.7)*tw;sx.fillStyle=s.c?'#ffd9b0':'#dce9ff';
    var len=streak*s.z;
    if(len>2){sx.strokeStyle=sx.fillStyle;sx.lineWidth=.6+s.z*1.1;sx.beginPath();sx.moveTo(x,y);sx.lineTo(x,y+(v>0?len:-len));sx.stroke()}
    else sx.fillRect(x,y,.6+s.z*1.4,.6+s.z*1.4);
  }
  sx.globalAlpha=1;
}

/* ---------- planets ---------- */
var PL=[
 {n:'Mercury',img:'mercury',alt:'False-colour mosaic of Mercury, a grey cratered world coloured blue, orange and tan to show differences in rock chemistry',cap:'False colour shows differences in surface chemistry · MESSENGER, NASA',k:'Rocky planet',d:4879,day:'59 Earth days',yr:'88 days',g:'3.7 m/s²',t:'167 °C',m:'0',w:'The smallest planet and the closest to the Sun. It has almost no air, so days burn and nights freeze.'},
 {n:'Venus',img:'venus',alt:'A colour-coded radar map of the surface of Venus shown as a globe in greens, blues and reds',cap:'Radar map, coloured by height. Thick clouds hide the real surface · Magellan, NASA',k:'Rocky planet',d:12104,day:'243 Earth days',yr:'225 days',g:'8.9 m/s²',t:'464 °C',m:'0',w:'Hotter than Mercury, because a thick carbon dioxide atmosphere traps heat. It spins backwards, and one day lasts longer than its year.'},
 {n:'Earth',img:'earth',alt:'The Earth as a blue and white globe, with North America visible under swirling clouds',cap:'Earth, composited from satellite images · NASA',k:'Rocky planet',d:12742,day:'24 hours',yr:'365.25 days',g:'9.8 m/s²',t:'15 °C',m:'1',w:'The only place we know has life, and the only planet with liquid water on its surface.'},
 {n:'Mars',img:'mars',alt:'The red planet Mars photographed by the Hubble Space Telescope, showing dark regions and a white polar cap',cap:'Hubble’s view of the Red Planet · NASA',k:'Rocky planet',d:6779,day:'24.6 hours',yr:'687 days',g:'3.7 m/s²',t:'−65 °C',m:'2',w:'A cold desert with Olympus Mons, the tallest volcano known in the solar system.'},
 {n:'Jupiter',img:'jupiter',alt:'Close-up of Jupiter’s Great Red Spot, a huge orange storm among cream and white cloud bands',cap:'The Great Red Spot, a storm bigger than Earth · Juno, NASA',k:'Gas giant',d:139820,day:'9.9 hours',yr:'11.9 years',g:'24.8 m/s²',t:'−110 °C',m:'90+',w:'More massive than all the other planets put together. Its Great Red Spot is a storm bigger than Earth.'},
 {n:'Saturn',img:'saturn',alt:'Saturn and its rings photographed from the Cassini spacecraft, with the planet’s shadow falling across the rings',cap:'Cassini’s portrait of Saturn · NASA',k:'Gas giant',d:116460,day:'10.7 hours',yr:'29.5 years',g:'10.4 m/s²',t:'−140 °C',m:'140+',w:'Its rings are wide enough to span the Earth–Moon gap, yet often only about ten metres thick.'},
 {n:'Uranus',img:'uranus',alt:'Uranus, a pale blue-green featureless sphere, photographed by Voyager 2',cap:'Photographed by Voyager 2 · NASA',k:'Ice giant',d:50724,day:'17.2 hours',yr:'84 years',g:'8.7 m/s²',t:'−195 °C',m:'28',w:'Tipped on its side, about 98 degrees, so it rolls around the Sun like a ball.'},
 {n:'Neptune',img:'neptune',alt:'Neptune, a deep blue sphere with a dark storm, photographed by Voyager 2',cap:'Photographed by Voyager 2 · NASA',k:'Ice giant',d:49244,day:'16.1 hours',yr:'165 years',g:'11.2 m/s²',t:'−200 °C',m:'16',w:'The windiest planet, with winds past 2,000 km/h. It takes 165 years to circle the Sun once.'}
];
var slots=$('#planetSlots');
PL.forEach(function(p,i){
  var a=document.createElement('article');a.className='pl';a.setAttribute('aria-label',p.n);
  a.innerHTML='<figure class="pl__img"><img src="assets/img/'+p.img+'.jpg" alt="'+p.alt+'" loading="lazy"></figure>'+
   '<div class="pl__txt"><h3>'+p.n+'</h3><p>'+p.w+'</p><dl class="pl__stats">'+
   [['Type',p.k],['Diameter',p.d.toLocaleString('en-US')+' km'],['One day',p.day],['One year',p.yr],['Gravity',p.g],['Average temp.',p.t],['Moons',p.m]].map(function(r){return '<div><dt class="mono">'+r[0]+'</dt><dd>'+r[1]+'</dd></div>'}).join('')+'</dl></div>';
  slots.appendChild(a);
});
var BODIES=[['Mercury',.38],['Venus',.91],['The Moon',.165],['Mars',.38],['Jupiter',2.53],['Saturn',1.06],['Uranus',.89],['Neptune',1.14],['Pluto',.063],['The Sun',27.9]];
function weigh(){
  var kg=parseFloat($('#kg').value);if(!isFinite(kg)||kg<=0)kg=0;
  $('#wgrid').innerHTML=BODIES.map(function(b){var v=kg*b[1];return '<div><dt class="mono">'+b[0]+'</dt><dd>'+(v>=100?Math.round(v):v.toFixed(1))+' kg</dd></div>'}).join('');
}
$('#kg').addEventListener('input',weigh);weigh();

/* ---------- frame loop ---------- */
var moonBig=$('#moonBig'),inset=$('#inset'),zoomEl=$('.edge .zoom'),edgeEl=$('#c6');
var ticking=false,hintGone=false;
function layout(){vh=innerHeight;vw=innerWidth}
function update(){
  ticking=false;
  var y=scrollY,calm=isCalm(),cur=0,curP=0,curT=0;
  var dy=y-lastY;lastY=y;velS+=(dy-velS)*.22;
  for(var i=0;i<chapters.length;i++){
    var c=chapters[i],r=c.el.getBoundingClientRect();
    c.vis=r.bottom>-vh*.25&&r.top<vh*1.25;
    var span=Math.max(1,r.height-vh);c.p=clamp(-r.top/span);
    if(r.top<=vh*.5)cur=i;
    if(!c.vis||calm)continue;
    if(c.media){c.media.style.setProperty('--s',(1.05+c.p*.13).toFixed(4));c.media.style.setProperty('--y',(-c.p*3).toFixed(3))}
    c.beats.forEach(function(b){
      var a=parseFloat(b.dataset.a),z=parseFloat(b.dataset.b);
      var inn=a<0?1:seg(c.p,a,a+.07),out=z>1.5?1:seg(z-c.p,0,.07),op=Math.min(inn,out);
      b.style.opacity=op.toFixed(3);b.style.transform='translate3d(0,'+((1-op)*(inn<out?24:-24)).toFixed(1)+'px,0)';
      b.style.visibility=op>.015?'visible':'hidden';b.classList.toggle('live',op>.35);
    });
  }
  var cc=chapters[cur];curP=cc.p;
  /* chapter-specific choreography */
  var c1=chapters[1];
  if(moonBig&&c1.vis&&!calm){var ms=ease(seg(c1.p,.03,.34));moonBig.style.setProperty('--ms',(.28+.72*ms).toFixed(3));moonBig.style.setProperty('--mo',(seg(c1.p,.02,.18)*(1-seg(c1.p,.6,.7))).toFixed(3))}
  var c3=chapters[3];
  if(track&&c3.vis&&!calm&&!mqMobile.matches){var max=Math.max(0,track.scrollWidth-vw);track.style.transform='translate3d('+(-(seg(c3.p,.03,.97)*max)).toFixed(1)+'px,0,0)'}
  var c5=chapters[5];
  if(inset&&c5.vis&&!calm)inset.style.setProperty('--io',seg(c5.p,.6,.78).toFixed(3));
  var c6=chapters[6];
  if(zoomEl&&c6.vis&&!calm){zoomEl.style.setProperty('--zo',(seg(c6.p,.3,.46)*.92).toFixed(3));zoomEl.style.setProperty('--zs',(1+ease(seg(c6.p,.34,1))*1.7).toFixed(3))}
  /* HUD */
  var qr=quiz.getBoundingClientRect(),atQuiz=qr.top<vh*.45;
  hud.classList.toggle('on',y>vh*.35&&!atQuiz);rail.classList.toggle('on',y>vh*.35);
  var travel=cur<chapters.length-1?seg(curP,.8,1):0;
  warp=travel;
  var d0=Math.log(chapters[cur].dist),d1=Math.log(chapters[Math.min(cur+1,chapters.length-1)].dist);
  lnTarget=lerp(d0,d1,ease(travel));
  hudL.textContent=travel>.04?'Heading to '+chapters[cur+1].name:cc.name;
  chapters.forEach(function(c,i){c.dot.setAttribute('aria-current',(!atQuiz&&i===cur))});
  chapters.quizDot.setAttribute('aria-current',atQuiz);
  if(!hintGone&&cur===5&&chapters[5].p>.2)hintGone=false;
}
function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(update)}}
addEventListener('scroll',onScroll,{passive:true});
addEventListener('resize',function(){layout();sizeStars();update()});
mqMobile.addEventListener('change',function(){if(track&&mqMobile.matches)track.style.transform=''});

/* continuous loop for odometer smoothing + stars */
function loop(t){
  velS*=.9;
  lnShown+=(lnTarget-lnShown)*.14;
  var km=Math.exp(lnShown);hudV.textContent=fmtDist(km);hudT.textContent='Light needs '+fmtLight(km);
  drawStars(t);
  requestAnimationFrame(loop);
}
update();requestAnimationFrame(loop);
setTimeout(function(){chapters[0].vid&&chapters[0].vid.play&&chapters[0].vid.play().catch(function(){})},50);

/* ---------- galaxy particles ---------- */
(function(){
  var cv=$('#gx'),ctx=cv.getContext('2d');if(!ctx)return;
  var small=matchMedia('(max-width:760px)').matches,N=small?4800:15000;
  var W=0,H=0,DPR=1,cx=0,cy=0,R=0,live=false,t0=performance.now(),mx=-9999,my=-9999,on=false;
  var TH=new Float32Array(N),RR=new Float32Array(N),OM=new Float32Array(N),CL=new Uint8Array(N),SZ=new Float32Array(N);
  var DX=new Float32Array(N),DY=new Float32Array(N),VX=new Float32Array(N),VY=new Float32Array(N),PX=new Float32Array(N),PY=new Float32Array(N);
  function g(){return (Math.random()+Math.random()+Math.random()+Math.random()-2)/2}
  for(var i=0;i<N;i++){
    var bulge=Math.random()<.22,r,th;
    if(bulge){r=Math.abs(g())*.17+.012;th=Math.random()*6.2832;CL[i]=0;SZ[i]=Math.random()<.12?2.6:1.5}
    else{r=.1+Math.pow(Math.random(),.72)*.9;th=(i%2)*Math.PI+3.2*Math.log(r/.1)+g()*.3;r+=g()*.03;CL[i]=Math.random()<.16?2:1;SZ[i]=Math.random()<.07?2.6:1.4}
    TH[i]=th;RR[i]=r;OM[i]=.035/(.25+Math.abs(r));
  }
  var TILT=.42,SQ=.56,CT=Math.cos(TILT),ST=Math.sin(TILT);
  function size(){
    var b=cv.getBoundingClientRect();DPR=Math.min(devicePixelRatio||1,small?1.5:2);
    W=Math.max(1,b.width);H=Math.max(1,b.height);cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);
    cx=W*(W<760?.5:.62);cy=H*.5;R=Math.min(W*(W<760?.5:.4),H*.84);
  }
  function frame(now){
    var still=isCalm()||paused,t=still?0:(now-t0)/1000;
    ctx.clearRect(0,0,W,H);
    var rad=small?70:120,rad2=rad*rad;
    for(var i=0;i<N;i++){
      var a=TH[i]+OM[i]*t,ex=Math.cos(a)*RR[i]*R,ey=Math.sin(a)*RR[i]*R*SQ;
      var x=cx+ex*CT-ey*ST,y=cy+ex*ST+ey*CT;
      if(!still){
        var px=x+DX[i],py=y+DY[i];
        if(on){var ddx=px-mx,ddy=py-my,d2=ddx*ddx+ddy*ddy;if(d2<rad2&&d2>1){var d=Math.sqrt(d2),f=Math.pow(1-d/rad,2)*2.4;VX[i]+=ddx/d*f;VY[i]+=ddy/d*f}}
        VX[i]+=-DX[i]*.018;VY[i]+=-DY[i]*.018;VX[i]*=.92;VY[i]*=.92;DX[i]+=VX[i];DY[i]+=VY[i];x+=DX[i];y+=DY[i];
      }
      PX[i]=x;PY[i]=y;
    }
    var cols=['#ffd9a8','#cfe4ff','#6f7f99'],al=[.62,.55,.34];
    ctx.globalCompositeOperation='lighter';
    for(var c=0;c<3;c++){ctx.fillStyle=cols[c];ctx.globalAlpha=al[c];for(var j=0;j<N;j++){if(CL[j]===c)ctx.fillRect(PX[j],PY[j],SZ[j],SZ[j])}}
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    var rs=.52,as=3.2*Math.log(rs/.1)+Math.PI/2+(.035/(.25+rs))*t;
    var ex2=Math.cos(as)*rs*R,ey2=Math.sin(as)*rs*R*SQ,sx2=cx+ex2*CT-ey2*ST,sy2=cy+ex2*ST+ey2*CT;
    ctx.strokeStyle='#ffc27a';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(sx2,sy2,9,0,6.2832);ctx.stroke();
    ctx.fillStyle='#ffc27a';ctx.beginPath();ctx.arc(sx2,sy2,2.4,0,6.2832);ctx.fill();
    ctx.font='500 10.5px "JetBrains Mono",monospace';ctx.fillStyle='rgba(255,194,122,.95)';ctx.textBaseline='middle';
    var lab='YOU ARE HERE',lw=ctx.measureText(lab).width,lx=sx2+16;if(lx+lw>W-8)lx=sx2-16-lw;ctx.fillText(lab,lx,sy2);
  }
  function loopG(now){if(!live)return;frame(now);requestAnimationFrame(loopG)}
  function pos(e){var b=cv.getBoundingClientRect();mx=e.clientX-b.left;my=e.clientY-b.top;on=true;var h=$('#gxhint');if(h&&!hintGone){hintGone=true;h.style.opacity='0';h.style.transition='opacity .6s'}}
  cv.addEventListener('pointermove',pos);cv.addEventListener('pointerdown',pos);
  cv.addEventListener('pointerleave',function(){on=false});
  size();frame(performance.now());
  addEventListener('resize',function(){size();frame(performance.now())});
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v&&!live){live=true;requestAnimationFrame(loopG)}else if(!v)live=false},{threshold:0}).observe(cv);
  }
})();

/* ---------- life of a star ---------- */
var NEB='<defs><filter id="bl" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="11"/></filter></defs><g filter="url(#bl)"><circle cx="84" cy="96" r="46" fill="#5b8fc7" opacity=".6"/><circle cx="122" cy="110" r="40" fill="#c9784f" opacity=".42"/><circle cx="104" cy="74" r="32" fill="#7fb7e6" opacity=".42"/></g>';
var PATHS={
 sun:[
  {n:'A cloud of gas and dust',t:'Space is not empty. Cold clouds of mostly hydrogen drift between the stars. Gravity slowly pulls a dense patch of one together. These are the Pillars of Creation, towers of gas where stars are forming.',d:'Takes: millions of years',img:'pillars',a:'The Pillars of Creation, towers of gas and dust where stars form · Hubble, NASA',s:NEB},
  {n:'A protostar switches on',t:'The clump collapses and heats up. It glows from the energy of its own squeezing, but it is not yet fusing hydrogen. Young stars are being born along the edge of this gas cliff.',d:'Takes: up to a few million years',img:'cliffs',a:'The Cosmic Cliffs, the edge of a stellar nursery · Webb, NASA',s:''},
  {n:'Main sequence: the long, steady years',t:'Hydrogen fuses into helium in the core, releasing the energy we see as sunlight. This is our Sun, and it is about halfway through this stage.',d:'Takes: about 10 billion years for the Sun',img:'sun',a:'Our Sun, in ultraviolet light · Solar Dynamics Observatory, NASA',s:''},
  {n:'Red giant',t:'When the core runs out of hydrogen, the outer layers swell and cool to a deep red. The Sun will do this in roughly 5 billion years.',d:'Takes: about a billion years',a:'An illustration of a swollen red star',s:'<circle cx="100" cy="100" r="82" fill="#e5562f"/><circle cx="100" cy="100" r="22" fill="#ffb36b" opacity=".85"/>'},
  {n:'A planetary nebula',t:'The star puffs its outer layers away into a glowing shell. The name is misleading: it has nothing to do with planets.',d:'Takes: tens of thousands of years',a:'An illustration of a glowing shell of gas',s:'<circle cx="100" cy="100" r="68" fill="none" stroke="#8cc8ff" stroke-width="16" opacity=".45"/><circle cx="100" cy="100" r="52" fill="none" stroke="#ffc27a" stroke-width="3" opacity=".5"/><circle cx="100" cy="100" r="5" fill="#fff"/>'},
  {n:'White dwarf',t:'What is left is the hot core: about as big as Earth, but with roughly the Sun’s mass. It cools over trillions of years, far longer than the universe has existed.',d:'Lasts: longer than the universe is old',a:'An illustration of a small, hot, dense remnant',s:'<circle cx="100" cy="100" r="9" fill="#fff"/><circle cx="100" cy="100" r="16" fill="none" stroke="#fff" stroke-width="1" opacity=".25"/>'}
 ],
 big:[
  {n:'A cloud of gas and dust',t:'Massive stars begin the same way: in a vast cloud. Only the biggest, densest clumps become heavy enough.',d:'Takes: millions of years',img:'pillars',a:'The Pillars of Creation · Hubble, NASA',s:NEB},
  {n:'A protostar switches on',t:'A heavier clump collapses faster and gets far hotter. The newborn star blasts gas away around it.',d:'Takes: far less than for the Sun',img:'cliffs',a:'The Cosmic Cliffs · Webb, NASA',s:''},
  {n:'Main sequence: fast and bright',t:'Heavy stars burn blue-white and hot. They squander their fuel at a ferocious rate, so they shine brilliantly for a short time.',d:'Takes: only a few million years',a:'An illustration of a hot blue-white star',s:'<circle cx="100" cy="100" r="50" fill="#9fc7ff"/><circle cx="100" cy="100" r="64" fill="none" stroke="#9fc7ff" stroke-width="1" opacity=".3"/>'},
  {n:'Red supergiant',t:'The star swells enormously and fuses heavier and heavier elements in layers, until the core is mostly iron. Iron cannot release energy by fusing.',d:'Takes: about a million years',a:'An illustration of an enormous red star',s:'<circle cx="100" cy="100" r="92" fill="#d9442a"/><circle cx="100" cy="100" r="34" fill="#ff9a4a" opacity=".8"/>'},
  {n:'Supernova',t:'With no fuel to hold it up, the core collapses in a fraction of a second. The rebound blasts the star apart. This is the Crab Nebula: the debris of a star seen exploding in the year 1054.',d:'Lasts: weeks of brilliance, remnants for millennia',img:'crab',a:'The Crab Nebula, remains of a supernova · NASA',s:''},
  {n:'A neutron star or a black hole',t:'What the core leaves behind depends on its mass. A lighter core becomes a neutron star, about 20 km wide yet heavier than the Sun. The heaviest become black holes.',d:'Lasts: effectively forever',a:'An illustration of a neutron star, left, and a black hole, right',s:'<g transform="translate(-34 0)"><circle cx="100" cy="100" r="7" fill="#8cc8ff"/><path d="M100 30v50M100 120v50" stroke="#8cc8ff" stroke-width="1.5" opacity=".6"/></g><g transform="translate(46 0)"><circle cx="100" cy="100" r="22" fill="#000" stroke="#fff" stroke-width="1.5"/><ellipse cx="100" cy="100" rx="42" ry="9" fill="none" stroke="#ffc27a" stroke-width="2" opacity=".8"/></g>'}
 ]
};
var path='sun',sti=0;
function renderSteps(){var st=$('#steps');st.innerHTML='';PATHS[path].forEach(function(s,i){var li=document.createElement('li'),b=document.createElement('button');b.innerHTML='<i></i><span>'+s.n+'</span>';b.addEventListener('click',function(){setStage(i)});li.appendChild(b);st.appendChild(li)})}
function setStage(i){
  var L=PATHS[path];sti=clamp(i,0,L.length-1);var s=L[sti];
  $$('#steps button').forEach(function(b,j){if(j===sti)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
  var im=$('#artImg'),sv=$('#art');
  if(s.img){im.hidden=false;im.src='assets/img/'+s.img+'.jpg';im.alt=s.a;sv.style.display='none'}
  else{im.hidden=true;sv.style.display='';sv.innerHTML=s.s;sv.setAttribute('aria-label',s.a)}
  $('#stName').textContent=s.n;$('#stText').textContent=s.t;$('#stDur').textContent=s.d;
  $('#stPrev').disabled=sti===0;$('#stNext').disabled=sti===L.length-1;
}
function setPath(p){path=p;$('#pathSun').setAttribute('aria-pressed',p==='sun');$('#pathBig').setAttribute('aria-pressed',p==='big');renderSteps();setStage(0)}
$('#pathSun').addEventListener('click',function(){setPath('sun')});$('#pathBig').addEventListener('click',function(){setPath('big')});
$('#stPrev').addEventListener('click',function(){setStage(sti-1)});$('#stNext').addEventListener('click',function(){setStage(sti+1)});
renderSteps();setStage(0);

/* ---------- the Moon ---------- */
var SYN=29.530588853,REF=Date.UTC(2000,0,6,18,14);
function moonAge(ms){var d=(ms-REF)/86400000;return ((d%SYN)+SYN)%SYN}
function phaseName(a){var f=a/SYN;if(f<.0339||f>=.9661)return'New Moon';if(f<.2161)return'Waxing crescent';if(f<.2839)return'First quarter';if(f<.4661)return'Waxing gibbous';if(f<.5339)return'Full Moon';if(f<.7161)return'Waning gibbous';if(f<.7839)return'Last quarter';return'Waning crescent'}
function moonPath(f){
  var k=Math.cos(2*Math.PI*f),r=84,c=100,rx=Math.abs(k)*r,waxing=f<.5;
  if(Math.abs(k)>.9995&&k>0)return'';
  var s1=waxing?1:0,s2=waxing?(k>0?0:1):(k>0?1:0);
  return 'M'+c+' '+(c-r)+' A'+r+' '+r+' 0 0 '+s1+' '+c+' '+(c+r)+' A'+rx.toFixed(2)+' '+r+' 0 0 '+s2+' '+c+' '+(c-r)+'Z';
}
function fmtDays(d){var n=Math.round(d);return n<=0?'today':n===1?'in 1 day':'in '+n+' days'}
function moon(){
  var v=$('#mDate').value,dt=v?new Date(v+'T20:00:00'):new Date();
  var a=moonAge(dt.getTime()),f=a/SYN,ill=(1-Math.cos(2*Math.PI*f))/2,nm=phaseName(a);
  $('#moonSvg').innerHTML='<defs><clipPath id="mc"><circle cx="100" cy="100" r="84"/></clipPath></defs><circle cx="100" cy="100" r="84" fill="#0d0e10" stroke="rgba(255,255,255,.18)"/><path d="'+moonPath(f)+'" fill="#e9e6dc" clip-path="url(#mc)"/>'+(f>.4661&&f<.5339?'<circle cx="100" cy="100" r="84" fill="#e9e6dc"/>':'');
  $('#moonSvg').setAttribute('aria-label',nm+', about '+Math.round(ill*100)+' percent lit');
  $('#mName').textContent=nm;$('#mMeta').textContent='About '+Math.round(ill*100)+'% of the Moon is lit. This uses the average lunar cycle, so it can be a day off.';
  $('#nNew').textContent=fmtDays((SYN-a)%SYN);$('#nFull').textContent=fmtDays(((SYN/2-a)%SYN+SYN)%SYN);
}
(function(){var d=new Date(),p=function(n){return String(n).padStart(2,'0')};$('#mDate').value=d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())})();
$('#mDate').addEventListener('input',moon);
$('#south').addEventListener('change',function(e){$('#moonTool').classList.toggle('south',e.target.checked)});
moon();

/* ---------- quiz ---------- */
var Q=[
 {q:'How long does sunlight take to reach Earth?',o:['About 8 seconds','About 8 minutes','About 8 hours','It arrives instantly'],a:1,w:'Light travels at about 300,000 km every second, and the Sun is 150 million km away. That is roughly 8 minutes 20 seconds. You always see the Sun as it was a little while ago.'},
 {q:'Which planet is the hottest?',o:['Mercury','Venus','Mars','Jupiter'],a:1,w:'Venus. Mercury is nearer the Sun, but Venus’s thick carbon dioxide atmosphere traps heat and holds the surface near 464 °C, hot enough to melt lead.'},
 {q:'What will our Sun turn into after its red giant stage?',o:['A black hole','A neutron star','A white dwarf','A supernova'],a:2,w:'The Sun is too light to explode or collapse into a black hole. It will shed its outer layers and leave a white dwarf, which then cools for a very long time.'},
 {q:'Which star is the nearest to us after the Sun?',o:['Sirius','Proxima Centauri','Polaris','Betelgeuse'],a:1,w:'Proxima Centauri, about 4.2 light-years away. It is a small red star and far too faint to see without a telescope.'},
 {q:'About how old is the universe?',o:['4.6 billion years','13.8 billion years','100 million years','1 trillion years'],a:1,w:'About 13.8 billion years. The Earth is much younger, around 4.5 billion years old, so the universe was already more than two-thirds of its present age when our planet formed.'}
];
var qi=0,score=0,answered=false,box=$('#quizBox');
function renderQ(){
  if(qi>=Q.length){
    var msg=score===5?'Perfect. You could teach this.':score>=3?'Solid. A few things to revisit above.':'A good start. Scroll back up and take the journey again.';
    box.innerHTML='<p class="quiz__top mono"><span>Finished</span><span>'+Q.length+' / '+Q.length+'</span></p><div class="quiz__bar"><i style="width:100%"></i></div><p class="score">'+score+'<span style="color:var(--f40)">/'+Q.length+'</span></p><h3 style="margin-top:20px">'+msg+'</h3><div class="quiz__nav"><button class="btn btn--solid" id="qAgain">Try again</button><a class="btn btn--ghost" href="#c0">Fly the journey again</a></div>';
    $('#qAgain').addEventListener('click',function(){qi=0;score=0;renderQ()});return;
  }
  var it=Q[qi];answered=false;
  box.innerHTML='<p class="quiz__top mono"><span>Question '+(qi+1)+' of '+Q.length+'</span><span>Score '+score+'</span></p><div class="quiz__bar"><i style="width:'+(qi/Q.length*100)+'%"></i></div><h3>'+it.q+'</h3><div class="opts" role="group" aria-label="Answers">'+
   it.o.map(function(t,i){return '<button class="opt" data-i="'+i+'"><span class="k">'+'ABCD'[i]+'</span>'+t+'</button>'}).join('')+'</div><p class="why" id="why"></p><div class="quiz__nav"><button class="btn btn--solid" id="qNext" disabled>'+(qi===Q.length-1?'See my score':'Next question')+'</button></div>';
  $$('.opt',box).forEach(function(b){b.addEventListener('click',function(){
    if(answered)return;answered=true;var i=+b.dataset.i;
    $$('.opt',box).forEach(function(o,j){o.disabled=true;if(j===it.a)o.classList.add('right');else if(j===i)o.classList.add('wrong')});
    if(i===it.a)score++;$('#why').textContent=(i===it.a?'Correct. ':'Not quite. ')+it.w;$('#qNext').disabled=false;$('#qNext').focus({preventScroll:true});
  })});
  $('#qNext').addEventListener('click',function(){qi++;renderQ()});
}
renderQ();

/* ---------- glossary ---------- */
var GL=[
 ['Astronomical unit (AU)','The average distance from Earth to the Sun, about 150 million kilometres. Used as a yardstick inside the solar system.'],
 ['Black hole','A region where gravity is so strong that nothing, not even light, can escape once it passes the boundary.'],
 ['Dark energy','The name for whatever is making the expansion of the universe speed up. It appears to make up about 68% of everything.'],
 ['Dark matter','Invisible matter that we detect only through its gravity. It appears to make up about 27% of the universe.'],
 ['Event horizon','The boundary around a black hole beyond which nothing can return.'],
 ['Exoplanet','A planet that orbits a star other than our Sun. More than 5,000 have been found.'],
 ['Galaxy','A huge system of stars, gas, dust and dark matter held together by gravity. Ours is the Milky Way.'],
 ['Light-year','The distance light travels in one year: about 9.46 trillion kilometres. It measures distance, not time.'],
 ['Nebula','A cloud of gas and dust in space. Some are stellar nurseries, others are the remains of dead stars.'],
 ['Neutron star','The collapsed core of a massive star, about 20 km wide but heavier than the Sun.'],
 ['Orbit','The curved path one object takes around another because of gravity.'],
 ['Redshift','Light stretched to longer, redder wavelengths because its source is moving away from us. It is key evidence that the universe is expanding.'],
 ['Supernova','The explosion of a massive star at the end of its life. For a few weeks it can outshine a whole galaxy.'],
 ['White dwarf','The hot, dense, Earth-sized core left behind by a star like the Sun once it has shed its outer layers.']
];
function renderGl(q){
  q=(q||'').toLowerCase().trim();
  var r=GL.filter(function(g){return !q||g[0].toLowerCase().indexOf(q)>-1||g[1].toLowerCase().indexOf(q)>-1});
  $('#gl').innerHTML=r.length?r.map(function(g){return '<div class="term"><dt>'+g[0]+'</dt><dd>'+g[1]+'</dd></div>'}).join(''):'<p class="none">No term matches “'+q.replace(/[<>&]/g,'')+'”. Try a shorter word.</p>';
}
$('#gq').addEventListener('input',function(e){renderGl(e.target.value)});renderGl('');

/* ---------- credits (from the asset manifest) ---------- */
(function(){
  var m=window.__MANIFEST||[],seen={},ul=$('#creditList');
  m.forEach(function(x){if(seen[x.nasa_id])return;seen[x.nasa_id]=1;
    var li=document.createElement('li'),a=document.createElement('a');a.href=x.page;a.rel='noopener';a.textContent=x.title.replace(/\s+/g,' ');
    li.appendChild(a);li.appendChild(document.createTextNode(' · '+x.type+' · '+(x.credit&&x.credit!=='NASA'?x.credit:'NASA'+(x.center&&x.center!=='HQ'?' ('+x.center+')':''))));ul.appendChild(li)});
})();
})();
