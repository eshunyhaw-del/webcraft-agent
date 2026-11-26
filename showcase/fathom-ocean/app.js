(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var clamp=function(x,a,b){return Math.max(a===undefined?0:a,Math.min(b===undefined?1:b,x))};
var seg=function(p,a,b){return clamp((p-a)/(b-a))};
var ease=function(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2};
var root=document.documentElement;
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
root.classList.add('js');if(reduce)root.classList.add('calm');
var paused=false;
function isCalm(){return root.classList.contains('calm')}

/* ---------- hero entrance (never leave text hidden) ---------- */
$$('.e').forEach(function(el){el.addEventListener('animationend',function(){el.classList.add('is-in')},{once:true})});
setTimeout(function(){$$('.e').forEach(function(el){el.classList.add('is-in')})},3200);

/* ---------- headline word reveal ---------- */
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
    }else if(n.nodeType===1&&!n.classList.contains('w'))split(n,ctr);
  });
}
$$('.big').forEach(function(h){if(!h.closest('.hero'))split(h,{i:0})});

/* ---------- chapters ---------- */
var chapters=$$('.ch').map(function(el){return{
  el:el,media:$('[data-media]',el),beats:$$('.beat',el).map(function(b){return{el:b,a:parseFloat(b.dataset.a),b:parseFloat(b.dataset.b),on:false}}),
  vid:$('[data-vid]',el),depth:parseFloat(el.dataset.depth),name:el.dataset.name,near:false}});
chapters[0].near=true;
function syncVid(c){
  var v=c.vid;if(!v)return;
  if(c.near&&!paused&&!isCalm()){var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause();
}
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    var c=chapters.filter(function(c){return c.el===e.target})[0];if(!c)return;
    c.near=e.isIntersecting;syncVid(c);
  })},{rootMargin:'30% 0px 30% 0px'});
  chapters.forEach(function(c){io.observe(c.el)});
}else{chapters.forEach(function(c){c.near=true;syncVid(c)})}

/* ---------- depth readout ---------- */
var hud=$('#hud'),hudD=$('#hudD'),hudP=$('#hudP'),hudL=$('#hudL'),hudZ=$('#hudZ'),rail=$('#rail');
function fmt(n){return Math.round(n).toLocaleString('en-US')}
function zone(d){return d<200?'Sunlit zone':d<1000?'Twilight zone':d<4000?'Midnight zone':d<6000?'Abyssal zone':'Hadal zone'}
function light(d){return d<10?'Full daylight':d<100?'Bright, turning blue':d<200?'Dim and blue':d<1000?'Faint glow':'None'}
function atm(d){return 1+d/10.1}
function sign(d){return d<1000?fmt(atm(d)):fmt(atm(d))}
var lnShown=0,lnTarget=0;
function depthAt(){
  /* depth rises from the previous stop's depth to this stop's depth while its chapter scrolls */
  var vh=innerHeight,cur=-1,p=0;
  for(var i=1;i<chapters.length;i++){
    var r=chapters[i].el.getBoundingClientRect();
    if(r.top<=vh*.5&&r.bottom>vh*.5){cur=i;p=clamp(-r.top/(r.height-vh));break}
  }
  if(cur<0){var last=chapters[chapters.length-1].el.getBoundingClientRect();return {d:last.bottom<=vh*.5?chapters[chapters.length-1].depth:0,live:false}}
  var d0=chapters[cur-1].depth,d1=chapters[cur].depth,t=ease(seg(p,.06,.9));
  return {d:Math.exp(Math.log(1+d0)+(Math.log(1+d1)-Math.log(1+d0))*t)-1,live:true};
}

/* rail */
chapters.forEach(function(c,i){
  var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Go to '+c.name);b.title=c.name;
  b.addEventListener('click',function(){go(c.el)});rail.appendChild(b);c.dot=b;
});
function go(el){window.scrollTo({top:el.getBoundingClientRect().top+scrollY+2,behavior:isCalm()?'auto':'smooth'})}

/* menu + pause */
var mb=$('#menuBtn');
function menu(o){document.body.classList.toggle('menu-open',o);mb.setAttribute('aria-expanded',o);mb.textContent=o?'Close':'Menu'}
mb.addEventListener('click',function(){menu(!document.body.classList.contains('menu-open'))});
$$('#sheet a').forEach(function(a){a.addEventListener('click',function(){menu(false)})});
addEventListener('keydown',function(e){if(e.key==='Escape')menu(false)});
var calmBtn=$('#calmBtn');
calmBtn.addEventListener('click',function(){
  paused=!paused;calmBtn.setAttribute('aria-pressed',paused);$('.lbl',calmBtn).textContent=paused?'Resume motion':'Pause motion';
  chapters.forEach(syncVid);
});

/* ---------- marine snow ---------- */
var sc=$('#snow'),sx=sc.getContext('2d'),P=[],SW=0,SH=0,velS=0,lastY=scrollY,depthNow=0;
function sizeSnow(){
  var d=Math.min(devicePixelRatio||1,2);SW=innerWidth;SH=innerHeight;sc.width=SW*d;sc.height=SH*d;sx.setTransform(d,0,0,d,0,0);
  var n=SW<700?60:140;P=[];for(var i=0;i<n;i++)P.push({x:Math.random(),y:Math.random(),z:.2+Math.random()*.8,t:Math.random()*6.28});
}
sizeSnow();
function drawSnow(t){
  sx.clearRect(0,0,SW,SH);
  var still=isCalm()||paused;if(still)return;
  var depthF=clamp(Math.log(1+depthNow)/Math.log(11000));
  var a0=.1+depthF*.4;
  var v=velS,streak=Math.min(Math.abs(v)*.4,34);
  for(var i=0;i<P.length;i++){
    var s=P[i];
    s.y-=(v*s.z*.0012+.00012*s.z);s.x+=Math.sin(t*.0004+s.t)*.00008;
    if(s.y<0)s.y+=1;if(s.y>1)s.y-=1;if(s.x<0)s.x+=1;if(s.x>1)s.x-=1;
    var x=s.x*SW,y=s.y*SH;
    sx.globalAlpha=a0*(.4+s.z*.6);sx.fillStyle='#e8f1ef';sx.strokeStyle='#e8f1ef';
    var len=streak*s.z;
    if(len>3){sx.lineWidth=.5+s.z;sx.beginPath();sx.moveTo(x,y);sx.lineTo(x,y+(v>0?len:-len));sx.stroke()}
    else sx.fillRect(x,y,.8+s.z*1.6,.8+s.z*1.6);
  }
  sx.globalAlpha=1;
}

/* ---------- main scroll loop ---------- */
var ticking=false,vh=innerHeight;
function update(){
  ticking=false;vh=innerHeight;
  var calm=isCalm();
  var cur=0;
  chapters.forEach(function(c,i){
    var r=c.el.getBoundingClientRect();
    var vis=r.bottom>-vh*.2&&r.top<vh*1.2;
    if(r.top<=vh*.5&&r.bottom>vh*.5)cur=i;
    if(!vis||calm){return}
    var p=clamp(-r.top/Math.max(1,r.height-vh));
    if(c.media){c.media.style.setProperty('--s',(1.06+p*.1).toFixed(4));c.media.style.setProperty('--y',(-p*3).toFixed(3))}
    c.beats.forEach(function(b){
      var inn=b.a<0?1:seg(p,b.a,b.a+.07),out=b.b>1.5?1:seg(b.b-p,0,.07),op=Math.min(inn,out);
      b.el.style.opacity=op.toFixed(3);b.el.style.visibility=op<.01?'hidden':'visible';
      b.el.style.transform='translateY('+((1-op)*(inn<out?18:-12)).toFixed(1)+'px)';
      var live=op>.35;if(live!==b.on){b.on=live;b.el.classList.toggle('live',live)}
    });
  });
  if(calm){chapters.forEach(function(c){c.beats.forEach(function(b){b.el.style.opacity='';b.el.style.visibility='';b.el.style.transform=''})})}
  var dd=depthAt();lnTarget=dd.d;
  var first=chapters[1].el.getBoundingClientRect(),end=chapters[chapters.length-1].el.getBoundingClientRect();
  var inJourney=first.top<vh*.6&&end.bottom>vh*.35&&!calm;
  hud.classList.toggle('on',inJourney);rail.classList.toggle('on',(chapters[0].el.getBoundingClientRect().bottom>0||true)&&first.top<vh&&end.bottom>vh*.4);
  chapters.forEach(function(c,i){c.dot.setAttribute('aria-current',i===cur)});
}
function readout(){
  depthNow+=(lnTarget-depthNow)*.15;if(Math.abs(lnTarget-depthNow)<.5)depthNow=lnTarget;
  hudD.textContent=fmt(depthNow)+' m';hudP.textContent=fmt(atm(depthNow))+' atm';hudL.textContent=light(depthNow);hudZ.textContent=zone(depthNow);
}
function frame(t){
  var y=scrollY;velS+=(clamp(y-lastY,-80,80)-velS)*.2;velS*=.9;lastY=y;
  readout();drawSnow(t);requestAnimationFrame(frame);
}
function sched(){if(!ticking){ticking=true;requestAnimationFrame(update)}}
addEventListener('scroll',sched,{passive:true});
addEventListener('resize',function(){sizeSnow();sched()});
update();requestAnimationFrame(frame);

/* ---------- pressure tool ---------- */
var dr=$('#depth'),dOut=$('#depthOut'),oZ=$('#oZone'),oP=$('#oP'),oL=$('#oL'),oW=$('#oW');
function who(d){return d<200?'Turtles, rays, tuna, sharks and coral reefs.':d<1000?'Lanternfish, squid, swordfish and deep-sea crabs.':d<4000?'Anglerfish, vampire squid, jellyfish and viperfish.':d<6000?'Sea cucumbers, sea pens, tripod fish and bristle worms.':'Tiny crustaceans called amphipods, and snailfish.'}
function tool(){
  var d=parseFloat(dr.value);
  dOut.textContent=fmt(d)+' m';oZ.textContent=zone(d);oP.textContent=fmt(atm(d))+' atm';oL.textContent=light(d);oW.textContent=who(d);
  $$('.presets button').forEach(function(b){b.setAttribute('aria-pressed',String(parseFloat(b.dataset.d)===d))});
  dr.setAttribute('aria-valuetext',fmt(d)+' metres, '+zone(d)+', '+fmt(atm(d))+' atmospheres');
}
dr.addEventListener('input',tool);
$$('.presets button').forEach(function(b){b.addEventListener('click',function(){dr.value=b.dataset.d;tool()})});
tool();

/* ---------- quiz ---------- */
var Q=[
 {q:'About how much of Earth\'s surface is covered by ocean?',o:['About 30%','About 50%','About 71%','About 90%'],a:2,e:'Roughly 71%. That is why Earth is sometimes called the blue planet.'},
 {q:'Which layer of the ocean never receives any sunlight?',o:['The sunlit zone','The twilight zone','The midnight zone','The surface film'],a:2,e:'Below about 1,000 m, in the midnight zone, there is no sunlight. Any light is made by animals.'},
 {q:'Roughly how much does pressure rise for every 10 metres you descend?',o:['It does not change','By about 1 atmosphere','By about 10 atmospheres','By about 100 atmospheres'],a:1,e:'About one extra atmosphere per 10 m. At the bottom of the Challenger Deep that adds up to over 1,000 atmospheres.'},
 {q:'What powers life around hydrothermal vents?',o:['Sunlight reaching the seafloor','Warm currents from the tropics','Chemicals, turned into food by microbes','Food falling only from the surface'],a:2,e:'Microbes make food from chemicals in the vent water. This is called chemosynthesis.'},
 {q:'What happens to coral when it is "bleached"?',o:['It turns white after losing the algae living in it','It is eaten by fish','It grows faster in warm water','It turns into sand'],a:0,e:'Heat stress makes corals expel their algae. Without them the coral turns white and starves unless conditions improve quickly.'}
];
var box=$('#quizBox'),qi=0,score=0;
function show(){
  if(qi>=Q.length){
    box.innerHTML='<div class="quiz__top mono"><span>Finished</span><span>'+Q.length+' of '+Q.length+'</span></div><div class="quiz__bar"><i style="width:100%"></i></div><p class="score">'+score+'/'+Q.length+'</p><h3>'+(score===Q.length?'A perfect dive.':score>=3?'A good descent.':'Worth another dive.')+'</h3><p class="why-a">Scroll back up through the descent to look again, then try the quiz once more.</p><button class="btn" type="button" id="again">Play again</button>';
    $('#again').addEventListener('click',function(){qi=0;score=0;show()});return;
  }
  var q=Q[qi];
  box.innerHTML='<div class="quiz__top mono"><span>Question '+(qi+1)+' of '+Q.length+'</span><span>Score '+score+'</span></div><div class="quiz__bar"><i style="width:'+(qi/Q.length*100)+'%"></i></div><h3 id="qh"></h3><div class="opts" role="group" aria-labelledby="qh"></div><p class="why-a" id="why" hidden></p>';
  $('#qh').textContent=q.q;
  q.o.forEach(function(t,i){
    var b=document.createElement('button');b.type='button';b.className='opt';b.textContent=t;
    b.addEventListener('click',function(){answer(i)});$('.opts',box).appendChild(b);
  });
}
function answer(i){
  var q=Q[qi],bs=$$('.opt',box);
  bs.forEach(function(b,k){b.disabled=true;if(k===q.a)b.classList.add('ok');else if(k===i)b.classList.add('no')});
  if(i===q.a)score++;
  var w=$('#why');w.hidden=false;w.textContent=(i===q.a?'Correct. ':'Not quite. ')+q.e;
  var n=document.createElement('button');n.type='button';n.className='btn';n.textContent=qi===Q.length-1?'See my score':'Next question';
  n.addEventListener('click',function(){qi++;show();var h=$('#qh')||$('.score',box);if(h&&h.scrollIntoView&&!isCalm())h.scrollIntoView({block:'nearest'})});
  box.appendChild(n);n.focus();
}
show();
})();
