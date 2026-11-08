(() => {
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d', { alpha: false });
  const $ = id => document.getElementById(id);
  const ui = { score:$('score'), lap:$('lap'), name:$('car-name'), number:$('car-number'), timer:$('timer'), kicker:$('mission-kicker'), needs:$('needs'), hint:$('hint'), hintText:$('hint-text'), toast:$('toast'), start:$('start-screen'), end:$('end-screen'), finalScore:$('final-score'), finalCopy:$('final-copy'), mobile:$('mobile-controls'), actionLabel:$('action-label'), action:$('action-button'), stick:$('stick-zone'), knob:$('stick-knob') };
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const mix = (a,b,t) => a+(b-a)*t;
  let W=innerWidth,H=innerHeight,DPR=1, score=0, lap=12, running=false, over=false, last=0, toastTimer=0, bob=0;
  const mobile = matchMedia('(hover:none),(pointer:coarse)').matches;
  const player = {x:.49,y:.81,dir:1,held:null};
  const keys = new Set();
  const touch = {x:0,y:0,active:false,id:null};
  let actionHeld=false, serviceProgress=0;
  const crew = [
    {x:.112,y:.385,color:'#c85a43',shirt:'#dd7155',name:'NORTHSTAR'},
    {x:.888,y:.385,color:'#3b9c9b',shirt:'#65c5bd',name:'BLUEFIN'}
  ];
  const cars = [
    {name:'NIGHTJAR',number:'07',color:'#f1784e',stripe:'#f2c58f'},
    {name:'VOLT',number:'22',color:'#87c7b1',stripe:'#e6e5c4'},
    {name:'NIGHTJAR',number:'07',color:'#f1784e',stripe:'#f2c58f'},
    {name:'VOLT',number:'22',color:'#87c7b1',stripe:'#e6e5c4'}
  ];
  let carIndex=0, current=null, phase='ready', phaseTime=0, visualCarX=.5, flash=0;
  const stations={tyre:{x:.265,y:.79,label:'TYRE RACK'},fuel:{x:.735,y:.79,label:'FUEL RIG'}};
  let particles=[];

  function resize(){
    const rect=canvas.getBoundingClientRect(); W=rect.width; H=rect.height; DPR=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  addEventListener('resize',resize,{passive:true});resize();
  const px=x=>x*W, py=y=>y*H, unit=Math.min(W/1000,H/650);
  function rounded(x,y,w,h,r,fill,stroke=null,lw=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke()}}
  function line(x1,y1,x2,y2,color,width=1){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
  function text(str,x,y,size,color,weight=700,align='center',font='DM Sans'){ctx.fillStyle=color;ctx.font=`${weight} ${size}px "${font}"`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(str,x,y)}
  function toast(msg){ui.toast.textContent=msg;ui.toast.classList.add('show');toastTimer=2.1}
  function beginShift(){
    ui.start.classList.add('hidden');ui.end.classList.add('hidden');score=0;lap=12;carIndex=0;over=false;running=true;phase='arrival';phaseTime=1.7;visualCarX=1.15;player.x=.49;player.y=.81;player.held=null;serviceProgress=0;particles=[];ui.score.textContent='000';ui.lap.textContent=lap;ui.hint.classList.remove('hidden');ui.mobile.classList.toggle('active',mobile);setCar(cars[carIndex]);toast('NIGHTJAR INBOUND — READY YOUR CREW');
  }
  function setCar(info){current={...info,needs:{tyre:false,fuel:false},remaining:32,initial:32,served:0};phase='arrival';phaseTime=1.55;visualCarX=1.12;serviceProgress=0;player.held=null;updateHUD()}
  function finishCar(success){
    if(!current)return;
    if(success){const bonus=Math.max(0,Math.round(current.remaining*4));score+=180+bonus;current.served=1;toast(`CLEAN STOP  +${180+bonus} PTS`);for(let i=0;i<18;i++)particles.push({x:px(.5)+(Math.random()-.5)*70,y:py(.58)+(Math.random()-.5)*24,vx:(Math.random()-.5)*100,vy:-Math.random()*110-15,t:.5+Math.random()*.7,color:i%2?'#a9d8bd':'#f3ad6f'});}
    else{score=Math.max(0,score-40);toast('CAR RELEASED — SERVICE MISSED');}
    ui.score.textContent=String(score).padStart(3,'0');current=null;phase='departure';phaseTime=1.1;serviceProgress=0;player.held=null;lap=Math.min(24,lap+3);ui.lap.textContent=lap;
  }
  function nextCar(){carIndex++;if(carIndex>=cars.length){running=false;over=true;ui.end.classList.remove('hidden');ui.finalScore.textContent=String(score).padStart(3,'0');ui.finalCopy.textContent=score>=1000?'A flawless shift. The paddock is talking about you.':'The crew made it to the flag. There is always another second to find.';ui.mobile.classList.remove('active');return}setCar(cars[carIndex]);toast(`${current.name} ON THE PIT STRAIGHT`)}
  function updateHUD(){
    if(!current){ui.needs.innerHTML='';return}
    ui.name.textContent=current.name;ui.number.textContent=current.number;ui.kicker.textContent=phase==='arrival'?'CAR INBOUND':phase==='servicing'?'SERVICE IN PROGRESS':'PIT WINDOW OPEN';
    ui.needs.innerHTML=['tyre','fuel'].map(k=>`<span class="need-chip ${current.needs[k]?'done':''}"><i class="need-dot"></i>${k==='tyre'?'TYRES':'FUEL'}${current.needs[k]?' ✓':''}</span>`).join('');
  }
  function findTarget(){
    if(!running||!current)return null;
    const dist=(x,y)=>Math.hypot((player.x-x)*W,(player.y-y)*H);
    let target=null, d=Infinity;
    if(!player.held){for(const k of ['tyre','fuel']){if(!current.needs[k]){const s=stations[k],v=dist(s.x,s.y);if(v<d){d=v;target={kind:'pickup',item:k,d}}}}}
    else if(!current.needs[player.held]){const v=dist(.5,.57);if(v<d){d=v;target={kind:'service',item:player.held,d}}}
    if(target&&target.d<=(target.kind==='pickup'?75:103))return target;
    return null;
  }
  function updateHint(target){
    if(!running){ui.hint.classList.add('hidden');return}
    ui.hint.classList.remove('hidden');let label='';
    if(!current){label='NEXT CAR ON THE WAY';ui.hint.classList.add('hidden');return}
    if(phase==='arrival'){label='CAR INBOUND — GET INTO POSITION'}
    else if(player.held){label=target?.kind==='service'?`HOLD ACTION · ${player.held==='tyre'?'CHANGE TYRES':'FUEL THE CAR'}`:`CARRYING ${player.held==='tyre'?'FRESH TYRES':'FUEL CANISTER'} · FIND THE CAR`}
    else if(target?.kind==='pickup')label=`ACTION · PICK UP ${target.item==='tyre'?'FRESH TYRES':'FUEL CANISTER'}`;
    else if(current.needs.tyre&&current.needs.fuel)label='GREAT STOP — CAR READY';
    else label=`GET ${current.needs.tyre?'FUEL':'FRESH TYRES'} FROM THE ${current.needs.tyre?'FUEL RIG':'RACK'}`;
    ui.hintText.textContent=label;
    if(mobile){ui.actionLabel.textContent=target?.kind==='service'?'HOLD':'ACTION'}
  }
  function interactStart(){
    if(!running||!current)return;const t=findTarget();
    if(t?.kind==='pickup'){
      player.held=t.item;toast(t.item==='tyre'?'FRESH SET LOADED':'FUEL CANISTER IN HAND');updateHUD();
    }
  }
  function setAction(v){if(v&&!actionHeld){actionHeld=true;interactStart()}else if(!v){actionHeld=false;serviceProgress=0;if(phase==='servicing')phase='pit'} }
  addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','e'].includes(k))e.preventDefault();keys.add(k);if((k==='e'||k===' ')&&!e.repeat)setAction(true);if(k==='enter'&&!running)beginShift()},{passive:false});
  addEventListener('keyup',e=>{const k=e.key.toLowerCase();keys.delete(k);if(k==='e'||k===' ')setAction(false)});
  addEventListener('blur',()=>{keys.clear();touch.active=false;setAction(false)});
  $('start-button').addEventListener('click',beginShift);$('restart-button').addEventListener('click',beginShift);
  ui.action.addEventListener('pointerdown',e=>{e.preventDefault();ui.action.setPointerCapture(e.pointerId);ui.action.classList.add('pressing');setAction(true)});
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>ui.action.addEventListener(ev,e=>{ui.action.classList.remove('pressing');setAction(false)}));
  ui.stick.addEventListener('pointerdown',e=>{e.preventDefault();touch.active=true;touch.id=e.pointerId;ui.stick.setPointerCapture(e.pointerId);moveStick(e)});
  ui.stick.addEventListener('pointermove',e=>{if(touch.active&&e.pointerId===touch.id)moveStick(e)});
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>ui.stick.addEventListener(ev,()=>{touch.active=false;touch.x=touch.y=0;ui.knob.style.transform='translate(-50%,-50%)'}));
  function moveStick(e){const r=ui.stick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,max=r.width*.35,len=Math.hypot(dx,dy),n=Math.min(1,len/max);touch.x=len?dx/len*n:0;touch.y=len?dy/len*n:0;ui.knob.style.transform=`translate(calc(-50% + ${touch.x*max}px),calc(-50% + ${touch.y*max}px))`}

  function drawGarage(){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1b2628');g.addColorStop(.38,'#283436');g.addColorStop(.39,'#343c3c');g.addColorStop(1,'#202a2c');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    // High pit building and its neighboring teams
    ctx.fillStyle='#192224';ctx.fillRect(0,py(.12),W,py(.34));
    const bayY=py(.16),bayH=py(.26), specs=[{x:.015,w:.225,main:false,c:'#c35b44',name:'NORTHSTAR',num:'04'},{x:.255,w:.49,main:true,c:'#d4774c',name:'LAST STOP',num:'07'},{x:.76,w:.225,main:false,c:'#419b9b',name:'BLUEFIN',num:'18'}];
    for(const b of specs){
      const x=px(b.x),w=px(b.w);rounded(x,bayY,w,bayH,5,b.main?'#394242':'#303a3b','#71807b55',1);
      ctx.fillStyle=b.main?'#4b5653':'#3e4948';ctx.fillRect(x+4,bayY+5,w-8,py(.027));
      ctx.fillStyle=b.c;ctx.fillRect(x+4,bayY+5,w-8,py(.006));
      text(b.name,x+w/2,bayY+py(.018),Math.max(7,unit*(b.main?13:9)),b.main?'#f0ede1':'#cbd2c8',900,'center','Barlow Condensed');
      text(b.num,x+w/2,bayY+py(.052),Math.max(8,unit*(b.main?27:18)),b.main?'#ef8b62':'#8c9a95',900,'center','Barlow Condensed');
      // Roll-up doors and workshop shadows
      ctx.fillStyle='#242e30';ctx.fillRect(x+5,bayY+py(.075),w-10,bayH-py(.083));
      for(let j=0;j<5;j++)line(x+6,bayY+py(.09+j*.027),x+w-6,bayY+py(.09+j*.027),'#53605d55',Math.max(1,unit));
      ctx.fillStyle=b.main?'#a87657':'#7b7160';ctx.fillRect(x+8,bayY+bayH-py(.015),w-16,py(.008));
      // wall-mounted lamps
      for(const side of [x+12,x+w-12]){ctx.beginPath();ctx.arc(side,bayY+py(.074),Math.max(2,unit*4),0,Math.PI*2);ctx.fillStyle=b.main?'#edbd79':'#d3b77f';ctx.shadowColor='#efbd78';ctx.shadowBlur=unit*8;ctx.fill();ctx.shadowBlur=0}
      if(!b.main){
        drawTinyCrew(x+w*.5,bayY+bayH*.64,b.c,unit*.7);
        rounded(x+w*.12,bayY+bayH*.77,w*.76,py(.028),3,'#21292a','#68716d',1);
      }
    }
    // Roof ledge, joists and service bay floor
    ctx.fillStyle='#11191b';ctx.fillRect(0,py(.12),W,py(.025));
    for(let i=0;i<Math.ceil(W/85);i++){ctx.fillStyle=i%2?'#293335':'#242f30';ctx.fillRect(i*85,py(.12),42,py(.014))}
    // concrete apron and worked floor
    ctx.fillStyle='#6b716c';ctx.fillRect(0,py(.42),W,py(.035));
    ctx.fillStyle='#3e4848';ctx.fillRect(0,py(.455),W,py(.27));
    // subtle concrete slabs
    for(let x=0;x<W;x+=unit*120){line(x,py(.455),x,py(.725),'#bac0b422',1)}
    for(let y=.49;y<.73;y+=.08)line(0,py(y),W,py(y),'#bac0b416',1);
    // Pit lane and boundary stripes
    ctx.fillStyle='#1b2426';ctx.fillRect(0,py(.52),W,py(.16));
    ctx.fillStyle='#e7e1ce';ctx.fillRect(0,py(.52),W,Math.max(2,unit*3));ctx.fillRect(0,py(.68),W,Math.max(2,unit*3));
    ctx.fillStyle='#c2b9a2';ctx.fillRect(0,py(.523),W,Math.max(1,unit));ctx.fillRect(0,py(.684),W,Math.max(1,unit));
    // Painted lane marks
    for(let i=0;i<8;i++){const x=((i*170+(performance.now()*.012))%(W+120))-60;ctx.fillStyle='#edf0df35';ctx.fillRect(x,py(.62),unit*48,Math.max(2,unit*3))}
    // Garage box markings
    const bx=px(.27),bw=px(.46);ctx.strokeStyle='#e7e7d942';ctx.lineWidth=Math.max(1,unit*1.5);ctx.setLineDash([unit*8,unit*5]);ctx.strokeRect(bx,py(.705),bw,py(.23));ctx.setLineDash([]);
    text('07  /  SERVICE BOX',px(.5),py(.713),Math.max(7,unit*9),'#d5d9cd77',800,'center');
    // Safety cones at box edge
    for(let i=0;i<4;i++){const x=px(.29+i*.14),y=py(.71);ctx.fillStyle='#e9764e';ctx.beginPath();ctx.moveTo(x,y-unit*8);ctx.lineTo(x-unit*4,y+unit*2);ctx.lineTo(x+unit*4,y+unit*2);ctx.closePath();ctx.fill();ctx.fillStyle='#efe7d5';ctx.fillRect(x-unit*3,y-unit*1,unit*6,unit*2)}
    // Distant moving racer silhouettes on the main circuit
    const rx=((performance.now()*.045)%(W+200))-100;drawCar(rx,py(.485),unit*116,unit*47,{color:'#d4b768',stripe:'#efe1a4',number:'31'},.8);
    drawPitCrew();
  }
  function drawTinyCrew(x,y,color,s){ctx.save();ctx.translate(x,y);ctx.scale(s||1,s||1);ctx.fillStyle='#161d1f';ctx.beginPath();ctx.ellipse(0,8,7,3,0,0,7);ctx.fill();ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(0,1,5,7,0,0,7);ctx.fill();ctx.fillStyle='#d5b39a';ctx.beginPath();ctx.arc(0,-7,4,0,7);ctx.fill();ctx.fillStyle='#282c29';ctx.fillRect(-5,-10,10,3);ctx.restore()}
  function drawPitCrew(){
    for(const c of crew){const x=px(c.x),y=py(c.y);drawTinyCrew(x,y,c.shirt,Math.max(.7,unit*.92));if(H>480){rounded(x-px(.038),y+unit*14,px(.076),unit*12,3,'#263032cc','#87918b44',1);text('CREW',x,y+unit*20,Math.max(5,unit*6),'#b2bbb2',800)}}
    // Repeated tool cabinets at edge of neighboring bays
    for(const side of [px(.035),px(.965)]){rounded(side-unit*18,py(.445),unit*36,unit*25,3,'#252d2d','#75807a66',1);for(let i=0;i<3;i++){ctx.fillStyle=['#d36d4c','#d4b679','#82a997'][i];ctx.fillRect(side-unit*13,py(.451)+i*unit*6,unit*26,unit*2)}}
  }
  function drawCar(cx,cy,w,h,car,alpha=1){
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(cx,cy);const rw=Math.max(30,w),rh=Math.max(15,h);
    // Drop shadow, tires, sculpted nose and tail
    ctx.fillStyle='#1017189c';ctx.beginPath();ctx.ellipse(0,rh*.12,rw*.53,rh*.55,0,0,7);ctx.fill();
    for(const side of [-1,1])for(const pos of [-.31,.29]){rounded(rw*pos-rw*.085,side*rh*.34,rw*.17,rh*.34,rh*.08,'#14191a','#707b77',Math.max(1,unit));ctx.fillStyle='#8c9690';ctx.fillRect(rw*pos-rw*.055,side*rh*.31,rw*.11,rh*.04)}
    ctx.fillStyle=car.color;ctx.beginPath();ctx.moveTo(-rw*.48,-rh*.16);ctx.lineTo(-rw*.36,-rh*.37);ctx.lineTo(-rw*.15,-rh*.45);ctx.lineTo(rw*.25,-rh*.4);ctx.lineTo(rw*.42,-rh*.25);ctx.lineTo(rw*.5,-rh*.12);ctx.lineTo(rw*.5,rh*.12);ctx.lineTo(rw*.42,rh*.25);ctx.lineTo(rw*.25,rh*.4);ctx.lineTo(-rw*.15,rh*.45);ctx.lineTo(-rw*.36,rh*.37);ctx.lineTo(-rw*.48,rh*.16);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#111a1b77';ctx.lineWidth=Math.max(1,unit);ctx.stroke();
    // bright livery slash
    ctx.fillStyle=car.stripe;ctx.beginPath();ctx.moveTo(-rw*.34,-rh*.29);ctx.lineTo(-rw*.21,-rh*.37);ctx.lineTo(rw*.25,-rh*.34);ctx.lineTo(rw*.08,-rh*.2);ctx.lineTo(-rw*.36,-rh*.2);ctx.closePath();ctx.fill();
    ctx.fillStyle='#182326';ctx.beginPath();ctx.moveTo(-rw*.17,-rh*.28);ctx.lineTo(rw*.15,-rh*.29);ctx.lineTo(rw*.29,-rh*.13);ctx.lineTo(rw*.3,rh*.13);ctx.lineTo(rw*.15,rh*.29);ctx.lineTo(-rw*.17,rh*.28);ctx.lineTo(-rw*.27,rh*.13);ctx.lineTo(-rw*.27,-rh*.13);ctx.closePath();ctx.fill();
    ctx.fillStyle='#91a69c';ctx.beginPath();ctx.ellipse(-rw*.03,0,rw*.14,rh*.19,0,0,7);ctx.fill();ctx.fillStyle='#1a2020';ctx.beginPath();ctx.arc(rw*.08,0,rh*.115,0,7);ctx.fill();
    ctx.fillStyle='#fff5d5';ctx.fillRect(rw*.41,-rh*.22,rw*.045,rh*.12);ctx.fillRect(rw*.41,rh*.1,rw*.045,rh*.12);ctx.fillStyle='#e95443';ctx.fillRect(-rw*.47,-rh*.18,rw*.035,rh*.11);ctx.fillRect(-rw*.47,rh*.07,rw*.035,rh*.11);
    text(car.number||'07',-rw*.03,0,Math.max(6,rh*.29),'#f4f1e4',900,'center','Barlow Condensed');
    ctx.fillStyle='#22292a';ctx.fillRect(rw*.36,-rh*.35,rw*.1,rh*.7);ctx.fillRect(-rw*.45,-rh*.35,rw*.09,rh*.7);
    ctx.restore();
  }
  function drawStation(type){
    const s=stations[type],x=px(s.x),y=py(s.y),u=unit;
    if(type==='tyre'){
      // Compact stack of soft rubber, warm sidewall highlights
      for(let row=0;row<2;row++)for(let col=0;col<2;col++){
        const tx=x+u*(col*22-11),ty=y+u*(row*19-9);ctx.beginPath();ctx.ellipse(tx,ty,u*11,u*8,0,0,7);ctx.fillStyle='#202526';ctx.fill();ctx.strokeStyle='#69736d';ctx.lineWidth=Math.max(1,u*2);ctx.stroke();ctx.beginPath();ctx.ellipse(tx,ty,u*4,u*3,0,0,7);ctx.fillStyle='#55605c';ctx.fill();ctx.strokeStyle='#171d1e';ctx.stroke();
      }
      rounded(x-u*28,y+u*12,u*56,u*12,2,'#b77954','#e7bb8e66',1);text('FRESH SET',x,y+u*18,Math.max(6,u*6),'#fff0d6',900);
      // little orange trolley
      ctx.fillStyle='#e9764e';ctx.fillRect(x-u*21,y-u*27,u*42,u*3);ctx.fillRect(x-u*19,y-u*26,u*3,u*12);ctx.fillRect(x+u*16,y-u*26,u*3,u*12);
    }else{
      // fuel drum, gauge and coiled hose
      rounded(x-u*19,y-u*26,u*38,u*46,5,'#c77345','#edbd7e',Math.max(1,u));ctx.fillStyle='#f0c083';ctx.fillRect(x-u*15,y-u*14,u*30,u*3);ctx.fillRect(x-u*15,y+u*7,u*30,u*2);text('98',x,y-u*3,Math.max(7,u*11),'#fff1d2',900,'center','Barlow Condensed');
      ctx.beginPath();ctx.arc(x+u*17,y+u*23,u*15,-Math.PI/2,Math.PI*1.3);ctx.strokeStyle='#252a29';ctx.lineWidth=Math.max(2,u*3);ctx.stroke();ctx.beginPath();ctx.arc(x+u*17,y+u*23,u*9,-Math.PI/2,Math.PI*1.3);ctx.strokeStyle='#d5ad76';ctx.lineWidth=Math.max(1,u);ctx.stroke();ctx.fillStyle='#e5c181';ctx.fillRect(x-u*7,y+u*20,u*14,u*3);
      rounded(x-u*30,y+u*24,u*60,u*12,2,'#333b38','#939b8c55',1);text('RACE FUEL',x,y+u*30,Math.max(6,u*6),'#e0e4d7',900);
    }
    // station marker, glowing ring when it is the requested supply
    const needed=current&&!current.needs[type];ctx.beginPath();ctx.arc(x,y,u*34,0,7);ctx.strokeStyle=needed?'#f0aa68aa':'#d0d5c522';ctx.lineWidth=Math.max(1,u*1.3);ctx.setLineDash([u*3,u*4]);ctx.stroke();ctx.setLineDash([]);
    text(s.label,x,y+u*48,Math.max(6,u*7),'#d0d8cebb',800);
  }
  function drawPlayer(){
    const x=px(player.x),y=py(player.y),u=unit, walking=Math.hypot(inputX,inputY)>.08;
    const sway=walking?Math.sin(bob*12)*u*2.2:0;
    // shadow and reflective trousers, high-visibility orange suit
    ctx.fillStyle='#1017198c';ctx.beginPath();ctx.ellipse(x,y+u*5,u*14,u*7,0,0,7);ctx.fill();
    ctx.save();ctx.translate(x,y+sway);ctx.rotate(player.dir<0?Math.PI:0);
    ctx.fillStyle='#263032';rounded(-u*8,-u*2,u*7,u*15,3,'#222b2c');rounded(u*1,-u*2,u*7,u*15,3,'#222b2c');
    ctx.fillStyle='#ece4d0';ctx.fillRect(-u*8,u*10,u*8,u*3);ctx.fillRect(u,u*10,u*8,u*3);
    rounded(-u*11,-u*11,u*22,u*20,6,'#dd744e','#f3ac77',Math.max(1,u));ctx.fillStyle='#f0d7a1';ctx.fillRect(-u*10,-u*3,u*20,u*3);ctx.fillStyle='#f2e8cc';ctx.fillRect(-u*10,u*3,u*20,u*2);
    ctx.fillStyle='#d8b295';ctx.beginPath();ctx.arc(0,-u*15,u*6,0,7);ctx.fill();ctx.fillStyle='#303638';ctx.beginPath();ctx.arc(0,-u*17,u*7,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(-u*7,-u*17,u*14,u*3);
    // left arm and gloves
    ctx.strokeStyle='#e0b69b';ctx.lineWidth=u*4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-u*8,-u*6);ctx.lineTo(-u*13,-u*1);ctx.stroke();ctx.fillStyle='#eee4cc';ctx.beginPath();ctx.arc(-u*14,0,u*3,0,7);ctx.fill();
    if(player.held==='tyre'){
      ctx.beginPath();ctx.ellipse(u*16,-u*5,u*8,u*10,0,0,7);ctx.fillStyle='#202526';ctx.fill();ctx.strokeStyle='#7e8980';ctx.lineWidth=u*2;ctx.stroke();ctx.beginPath();ctx.ellipse(u*16,-u*5,u*3,u*4,0,0,7);ctx.fillStyle='#59635d';ctx.fill();
    }else if(player.held==='fuel'){
      rounded(u*10,-u*11,u*9,u*16,2,'#c77345','#f0c083',1);ctx.fillStyle='#f5e1ba';ctx.fillRect(u*12,-u*6,u*5,u*2);
    }
    ctx.restore();
    if(player.held){text(player.held==='tyre'?'TYRES':'FUEL',x,y-u*29,Math.max(6,u*7),'#f5e9d1',900)}
  }
  function drawActiveCar(){
    if(!current)return;const w=Math.min(W*.43,H*.48),h=w*.39, cx=px(visualCarX),cy=py(.59);
    drawCar(cx,cy,w,h,current);
    if(phase==='servicing'&&serviceProgress>0){const bw=Math.min(116,W*.3),bh=Math.max(5,unit*6),x=cx-bw/2,y=cy-h*.72-unit*11;rounded(x,y,bw,bh,bh/2,'#131a1c','#dce5db55',1);rounded(x+2,y+2,(bw-4)*clamp(serviceProgress/1.35,0,1),bh-4,bh/2,'#f1a265');text(player.held==='tyre'?'WHEEL CHANGE':'FUELING',cx,y-unit*7,Math.max(6,unit*7),'#fff0dc',900)}
    if(phase==='pit'&&current.needs.tyre&&current.needs.fuel){ctx.beginPath();ctx.arc(cx,cy-h*.62,unit*9,0,7);ctx.fillStyle='#a9d8bd';ctx.fill();text('✓',cx,cy-h*.62,unit*12,'#15201e',900)}
  }
  function draw(){
    ctx.setTransform(DPR,0,0,DPR,0,0);drawGarage();drawStation('tyre');drawStation('fuel');
    if(current)drawActiveCar();
    drawPlayer();
    // Small service box direction tick and player marker
    if(running&&current&&phase!=='arrival'){ctx.beginPath();ctx.arc(px(.5),py(.59),unit*38,0,7);ctx.strokeStyle='#e8a77033';ctx.lineWidth=Math.max(1,unit);ctx.setLineDash([unit*2,unit*5]);ctx.stroke();ctx.setLineDash([])}
    particles=particles.filter(p=>p.t>0);for(const p of particles){ctx.globalAlpha=clamp(p.t*1.5,0,1);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,unit*3,unit*3);ctx.globalAlpha=1}
  }
  let inputX=0,inputY=0;
  function update(dt){
    bob+=dt;if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui.toast.classList.remove('show')}
    for(const p of particles){p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=95*dt}
    const kx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
    const ky=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
    inputX=touch.active?touch.x:kx;inputY=touch.active?touch.y:ky;
    const mag=Math.hypot(inputX,inputY);if(mag>1){inputX/=mag;inputY/=mag}
    if(running){
      const speed=Math.min(220,H*.34);player.x=clamp(player.x+inputX*speed*dt/W,.055,.945);player.y=clamp(player.y+inputY*speed*dt/H,.445,.945);if(Math.abs(inputX)>.05)player.dir=inputX;
      // The completed car is cleared before its departure animation finishes.
      if(phase==='departure'&&!current){phaseTime-=dt;visualCarX=mix(visualCarX,-.3,clamp(dt*3,0,1));if(phaseTime<=0)nextCar()}
      if(current){
        if(phase==='arrival'){phaseTime-=dt;visualCarX=mix(visualCarX,.5,clamp(dt*2.7,0,1));if(phaseTime<=0){phase='pit';visualCarX=.5;toast(`${current.name} IN THE BOX — ${current.number}`);updateHUD()}}
        else{
          current.remaining-=dt;
          const target=findTarget();
          if(actionHeld&&player.held&&target?.kind==='service'){
            phase='servicing';serviceProgress+=dt;
            if(serviceProgress>=1.35){const item=player.held;current.needs[item]=true;player.held=null;serviceProgress=0;phase='pit';toast(item==='tyre'?'FOUR WHEELS DONE':'FUEL TOPPED OFF');updateHUD();if(current.needs.tyre&&current.needs.fuel)finishCar(true)}
          }else if(phase==='servicing'){phase='pit';serviceProgress=0}
          if(current&&current.remaining<=0)finishCar(false);
        }
      }
      updateHUD();const t=findTarget();updateHint(t);
    }else if(!over){updateHint(null)}
    // Timer stays readable and changes color as the driver is held up
    if(current){const seconds=Math.max(0,Math.ceil(current.remaining));ui.timer.textContent=`00:${String(seconds).padStart(2,'0')}`;ui.timer.parentElement.classList.toggle('urgent',seconds<=8&&phase!=='arrival');ui.kicker.textContent=phase==='arrival'?'CAR INBOUND':phase==='servicing'?'SERVICE IN PROGRESS':'PIT WINDOW OPEN'}
  }
  function frame(now){const dt=Math.min(.04,(now-last)/1000||0);last=now;update(dt);draw();requestAnimationFrame(frame)}
  document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden)setAction(false)});
  requestAnimationFrame(frame);
})();
