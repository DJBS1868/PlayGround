(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const W = 960, H = 570;
  const $ = id => document.getElementById(id);
  const defs = {
    scout: { name: 'Trail Scout', cost: 100, range: 145, rate: .82, damage: 1, color: '#dfa34f', accent: '#8b633d', projectile: '#fff0bd', desc: 'Quick shots · balanced' },
    mortar: { name: 'Thorn Mortar', cost: 160, range: 175, rate: 1.65, damage: 2, color: '#bb7954', accent: '#72513c', projectile: '#e8a36e', desc: 'Heavy splash damage' },
    frost: { name: 'Frost Fern', cost: 130, range: 128, rate: 1.15, damage: 0, color: '#88c4ca', accent: '#467b83', projectile: '#b7f4ed', desc: 'Slows nearby enemies' }
  };
  const waypoints = [[-35,105],[115,105],[180,138],[180,236],[290,252],[365,224],[365,130],[470,105],[555,140],[555,300],[645,348],[748,305],[748,197],[845,180],[995,238]];
  const route = [];
  function makeRoute() {
    route.length = 0;
    route.push({x:waypoints[0][0],y:waypoints[0][1]});
    for (let i=1;i<waypoints.length-1;i++) {
      const p=waypoints[i], before=waypoints[i-1], after=waypoints[i+1];
      const start={x:(before[0]+p[0])/2,y:(before[1]+p[1])/2};
      const end={x:(p[0]+after[0])/2,y:(p[1]+after[1])/2};
      if(i===1) route[0]={x:waypoints[0][0],y:waypoints[0][1]};
      for(let j=1;j<=18;j++){const t=j/18,u=1-t;route.push({x:u*u*start.x+2*u*t*p[0]+t*t*end.x,y:u*u*start.y+2*u*t*p[1]+t*t*end.y});}
    }
    route.push({x:waypoints.at(-1)[0],y:waypoints.at(-1)[1]});
  }
  makeRoute();
  const routeLengths=[0];
  for(let i=1;i<route.length;i++) routeLengths[i]=routeLengths[i-1]+Math.hypot(route[i].x-route[i-1].x,route[i].y-route[i-1].y);
  const routeLength=routeLengths.at(-1);
  let cash=420,lives=100,wave=0,running=false,paused=false,gameOver=false,speed=1;
  let enemies=[],towers=[],shots=[],particles=[],spawnLeft=0,spawnTimer=0,selectedType='scout',selectedTower=null,mouse={x:-100,y:-100},toastTimer=0,lastTime=0;
  let background=null;

  const rand=(a,b)=>a+Math.random()*(b-a);
  function makeBackground(){
    const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
    const grad=g.createLinearGradient(0,0,W,H);grad.addColorStop(0,'#d7e8ce');grad.addColorStop(.52,'#d1e4c9');grad.addColorStop(1,'#c7dfc1');g.fillStyle=grad;g.fillRect(0,0,W,H);
    // soft clearings and a fine field texture
    for(let i=0;i<42;i++){let x=rand(0,W),y=rand(0,H),r=rand(15,55);g.fillStyle=i%2?'#b9d6ad20':'#f3f2d520';g.beginPath();g.ellipse(x,y,r,rand(6,22),rand(-.4,.4),0,Math.PI*2);g.fill();}
    g.globalAlpha=.22;g.strokeStyle='#8eb38d';g.lineWidth=1;
    for(let x=14;x<W;x+=32){for(let y=16;y<H;y+=30){g.beginPath();g.moveTo(x,y);g.lineTo(x+3,y-3);g.moveTo(x+5,y+5);g.lineTo(x+8,y+2);g.stroke();}}
    g.globalAlpha=1;
    // patchy shrubs and tiny flowers, kept away from the trail for visual breathing room
    for(let i=0;i<75;i++){let x=rand(8,W-8),y=rand(30,H-8);if(distanceToRoute(x,y)<48)continue;const r=rand(3,8);g.fillStyle=['#7fab7c','#6f9c73','#96ba83','#88ae80'][i%4];g.globalAlpha=.6;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();g.globalAlpha=.8;g.fillStyle='#d9e7bc';g.beginPath();g.arc(x-r*.28,y-r*.28,r*.28,0,Math.PI*2);g.fill();}
    g.globalAlpha=1;
    // home grove at the route exit
    g.fillStyle='#5e986250';g.beginPath();g.arc(918,239,57,0,Math.PI*2);g.fill();g.fillStyle='#347b4a';g.beginPath();g.arc(916,240,39,0,Math.PI*2);g.fill();
    for(let i=0;i<9;i++){let a=i*Math.PI*2/9;g.fillStyle=i%2?'#70aa69':'#8bbb73';g.beginPath();g.ellipse(916+Math.cos(a)*25,240+Math.sin(a)*25,13,9,a,0,Math.PI*2);g.fill();}
    g.fillStyle='#e2d38c';g.beginPath();g.arc(916,240,9,0,Math.PI*2);g.fill();
    // trail edge + warm earth lane
    traceRoute(g);g.lineJoin='round';g.lineCap='round';g.strokeStyle='#a18d66';g.lineWidth=76;g.stroke();
    g.strokeStyle='#d2bd8e';g.lineWidth=68;g.stroke();
    g.strokeStyle='#decda5';g.lineWidth=60;g.stroke();
    // scattered stones along the trail edge
    for(let i=0;i<44;i++){let p=pointAt(rand(40,routeLength-50));let side=rand(34,48)*(Math.random()<.5?-1:1);let x=p.x+Math.cos(p.angle+Math.PI/2)*side,y=p.y+Math.sin(p.angle+Math.PI/2)*side;if(x<5||x>W-5||y<5||y>H-5)continue;g.fillStyle=i%2?'#a4937070':'#f3e5c570';g.beginPath();g.ellipse(x,y,rand(2,5),rand(2,3),rand(0,3),0,Math.PI*2);g.fill();}
    // path center dashed marks
    traceRoute(g);g.strokeStyle='#f0dfb774';g.lineWidth=2;g.setLineDash([6,14]);g.stroke();g.setLineDash([]);
    // map labels and discreet compass
    g.fillStyle='#527b5a';g.globalAlpha=.75;g.font='10px monospace';g.fillText('MOSSWOOD CLEARING',26,82);g.fillText('FERN HOLLOW',410,427);g.fillText('OLD ROOT PASS',774,142);g.globalAlpha=1;
    g.strokeStyle='#6b9670';g.lineWidth=1;g.beginPath();g.arc(912,65,17,0,Math.PI*2);g.stroke();g.fillStyle='#547d5d';g.font='bold 11px monospace';g.textAlign='center';g.fillText('N',912,51);g.beginPath();g.moveTo(912,57);g.lineTo(907,69);g.lineTo(912,66);g.lineTo(917,69);g.closePath();g.fill();g.textAlign='left';
    background=c;
  }
  function traceRoute(g){g.beginPath();g.moveTo(route[0].x,route[0].y);for(let i=1;i<route.length;i++)g.lineTo(route[i].x,route[i].y);}
  function pointAt(distance){let i=1;while(i<routeLengths.length-1&&routeLengths[i]<distance)i++;const a=route[i-1],b=route[i],span=routeLengths[i]-routeLengths[i-1],t=span?(distance-routeLengths[i-1])/span:0;return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,angle:Math.atan2(b.y-a.y,b.x-a.x)};}
  function distanceToRoute(x,y){let min=Infinity;for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy)));min=Math.min(min,Math.hypot(x-(a.x+t*dx),y-(a.y+t*dy)));}return min;}
  makeBackground();

  function draw(){
    ctx.clearRect(0,0,W,H);ctx.drawImage(background,0,0);
    drawDecor();
    if(selectedTower){ctx.beginPath();ctx.arc(selectedTower.x,selectedTower.y,getStats(selectedTower).range,0,Math.PI*2);ctx.fillStyle='#6da77c16';ctx.fill();ctx.strokeStyle='#4e8c665e';ctx.setLineDash([5,5]);ctx.lineWidth=1.5;ctx.stroke();ctx.setLineDash([]);}
    if(selectedType&&!selectedTower){let valid=validPlacement(mouse.x,mouse.y,false);const d=defs[selectedType];ctx.beginPath();ctx.arc(mouse.x,mouse.y,d.range,0,Math.PI*2);ctx.fillStyle=valid?'#5ea97517':'#d0695a12';ctx.fill();ctx.strokeStyle=valid?'#4b986477':'#c8615966';ctx.setLineDash([4,5]);ctx.stroke();ctx.setLineDash([]);drawTower({x:mouse.x,y:mouse.y,type:selectedType,level:1,angle:-Math.PI/2,ghost:true});}
    for(const tower of towers)drawTower(tower);
    for(const e of enemies)drawEnemy(e);
    for(const s of shots)drawShot(s);
    for(const p of particles)drawParticle(p);
    if(gameOver)drawGameOver();
  }
  function drawDecor(){
    // tiny path-side marker posts
    for(const d of [68,440,815]){const p=pointAt(d),x=p.x+Math.cos(p.angle+Math.PI/2)*43,y=p.y+Math.sin(p.angle+Math.PI/2)*43;ctx.fillStyle='#687c58';ctx.fillRect(x-2,y-5,4,10);ctx.fillStyle='#e5e1c4';ctx.fillRect(x-5,y-7,10,5);}
  }
  function getStats(t){const d=defs[t.type],l=t.level||1;return{range:d.range+(l-1)*12,rate:d.rate*Math.pow(.88,l-1),damage:d.damage+(l-1)*(t.type==='frost'?0:1)};}
  function drawTower(t){
    const d=defs[t.type],level=t.level||1,angle=t.angle||-Math.PI/2;
    if(!t.ghost){ctx.fillStyle='#25432c24';ctx.beginPath();ctx.ellipse(t.x,t.y+13,18,8,0,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle=t.ghost?'#477e6688':'#416849';ctx.beginPath();ctx.ellipse(t.x,t.y+8,17,13,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=t.ghost?'#86a77b99':'#739b69';ctx.beginPath();ctx.ellipse(t.x,t.y+3,14,10,0,0,Math.PI*2);ctx.fill();
    // base bolts
    ctx.fillStyle='#304f3a';for(let i=0;i<4;i++){let a=i*Math.PI/2;ctx.beginPath();ctx.arc(t.x+Math.cos(a)*12,t.y+8+Math.sin(a)*7,1.3,0,Math.PI*2);ctx.fill();}
    if(t.type==='scout'){
      ctx.save();ctx.translate(t.x,t.y-3);ctx.rotate(angle);ctx.fillStyle=t.ghost?'#c5a16e99':'#c19458';ctx.fillRect(-7,-7,14,12);ctx.fillStyle=d.accent;ctx.fillRect(-2,-5,18,5);ctx.fillStyle='#4d5545';ctx.fillRect(10,-4,9,3);ctx.restore();
      ctx.fillStyle=d.color;ctx.beginPath();ctx.arc(t.x,t.y-6,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle=d.accent;ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#f7e6bd';ctx.beginPath();ctx.arc(t.x+2,t.y-8,1.7,0,Math.PI*2);ctx.fill();
    }else if(t.type==='mortar'){
      ctx.save();ctx.translate(t.x,t.y-4);ctx.rotate(angle);ctx.fillStyle=t.ghost?'#a7785799':'#a66e4d';ctx.beginPath();ctx.roundRect(-9,-7,19,15,5);ctx.fill();ctx.fillStyle=d.accent;ctx.beginPath();ctx.roundRect(2,-5,17,10,4);ctx.fill();ctx.fillStyle='#594a3a';ctx.beginPath();ctx.roundRect(10,-4,15,8,3);ctx.fill();ctx.restore();
      ctx.fillStyle=d.color;ctx.beginPath();ctx.arc(t.x,t.y-5,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle=d.accent;ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#e6bb84';ctx.beginPath();ctx.arc(t.x+2,t.y-7,2,0,Math.PI*2);ctx.fill();
    }else{
      ctx.save();ctx.translate(t.x,t.y-5);ctx.rotate(angle);ctx.fillStyle=t.ghost?'#78b6bc99':'#72aeb5';ctx.beginPath();ctx.ellipse(0,0,10,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=d.accent;ctx.beginPath();ctx.roundRect(2,-3,17,6,3);ctx.fill();ctx.restore();
      ctx.fillStyle=d.color;ctx.beginPath();ctx.arc(t.x,t.y-6,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle=d.accent;ctx.lineWidth=2;ctx.stroke();ctx.strokeStyle='#e4ffff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(t.x-3,t.y-6);ctx.lineTo(t.x+3,t.y-6);ctx.moveTo(t.x,t.y-9);ctx.lineTo(t.x,t.y-3);ctx.stroke();
    }
    if(level>1&&!t.ghost){ctx.fillStyle='#f1d27c';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText('★'.repeat(Math.min(level-1,3)),t.x,t.y+24);ctx.textAlign='left';}
    if(t===selectedTower){ctx.strokeStyle='#3b8458';ctx.lineWidth=2;ctx.beginPath();ctx.arc(t.x,t.y,22,0,Math.PI*2);ctx.stroke();}
    if(t.ghost){ctx.globalAlpha=.65;ctx.strokeStyle=validPlacement(t.x,t.y,false)?'#317e52':'#bf5c4d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(t.x,t.y,21,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
  }
  function drawEnemy(e){
    const colors=['#e77863','#e8bd59','#9b8bd0','#67ae86','#e98fa6'];const color=colors[(e.wave+e.index)%colors.length];
    ctx.fillStyle='#28352b26';ctx.beginPath();ctx.ellipse(e.x,e.y+e.r*.72,e.r*.83,e.r*.32,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=color;ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff38';ctx.beginPath();ctx.arc(e.x-e.r*.28,e.y-e.r*.32,e.r*.36,0,Math.PI*2);ctx.fill();
    // little leaf-like ears and a curious face
    ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(e.x-e.r*.65,e.y-e.r*.65,e.r*.28,e.r*.5,-.7,0,Math.PI*2);ctx.ellipse(e.x+e.r*.65,e.y-e.r*.65,e.r*.28,e.r*.5,.7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff9e8';ctx.beginPath();ctx.arc(e.x-e.r*.27,e.y-e.r*.04,e.r*.19,0,Math.PI*2);ctx.arc(e.x+e.r*.27,e.y-e.r*.04,e.r*.19,0,Math.PI*2);ctx.fill();ctx.fillStyle='#34443b';ctx.beginPath();ctx.arc(e.x-e.r*.22,e.y-e.r*.02,e.r*.085,0,Math.PI*2);ctx.arc(e.x+e.r*.32,e.y-e.r*.02,e.r*.085,0,Math.PI*2);ctx.fill();
    if(e.slow>0){ctx.strokeStyle='#d7ffff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,e.r+3,0,Math.PI*2);ctx.stroke();}
    if(e.hp>1){let bw=e.r*2.2,bh=3;ctx.fillStyle='#533f3a99';ctx.fillRect(e.x-bw/2,e.y-e.r-8,bw,bh);ctx.fillStyle='#fff2ca';ctx.fillRect(e.x-bw/2,e.y-e.r-8,bw*Math.max(0,e.hp/e.maxHp),bh);}
  }
  function drawShot(s){ctx.fillStyle=s.color;ctx.beginPath();ctx.arc(s.x,s.y,s.type==='mortar'?5:3.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff9e2aa';ctx.beginPath();ctx.arc(s.x-1,s.y-1,1.5,0,Math.PI*2);ctx.fill();}
  function drawParticle(p){ctx.globalAlpha=Math.max(0,p.life/p.maxLife);if(p.kind==='ring'){ctx.strokeStyle=p.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,(1-p.life/p.maxLife)*p.radius,0,Math.PI*2);ctx.stroke();}else{ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size*(p.life/p.maxLife),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
  function drawGameOver(){ctx.fillStyle='#14261eaa';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.fillStyle='#f5f4e9';ctx.font='700 34px "DM Sans",sans-serif';ctx.fillText('THE GROVE NEEDS YOU',W/2,H/2-13);ctx.font='14px "DM Sans",sans-serif';ctx.fillStyle='#e1eadc';ctx.fillText('Your defenders held through wave '+wave+'. Reset the field and try again.',W/2,H/2+17);ctx.fillStyle='#a4d4a9';ctx.font='11px monospace';ctx.fillText('CLICK START WAVE TO REDEPLOY',W/2,H/2+48);ctx.textAlign='left';}

  function validPlacement(x,y,checkOverlap=true){if(!Number.isFinite(x)||x<30||x>W-30||y<45||y>H-25||distanceToRoute(x,y)<54)return false;if(checkOverlap&&towers.some(t=>Math.hypot(t.x-x,t.y-y)<37))return false;return true;}
  function updateHud(){ $('livesValue').textContent=lives;$('cashValue').textContent=cash;$('waveValue').textContent=wave;$('nextWaveBadge').textContent='WAVE '+String(wave+1).padStart(2,'0');$('waveBtnText').textContent=gameOver?'REDEPLOY':running?'WAVE IN PROGRESS':'START WAVE';$('waveBtn').disabled=running&&!gameOver;$('pauseBtn').disabled=!running||gameOver;$('pauseText').textContent=paused?'RESUME':'PAUSE';$('pauseGlyph').textContent=paused?'▶':'Ⅱ';$('speedText').textContent=speed+'×';$('phaseLabel').textContent=gameOver?'GROVE BREACHED':paused?'FIELD PAUSED':running?'DEFEND THE GROVE':'READY TO DEPLOY';$('phaseDot').className='phase-dot'+(paused?' paused':running?' active':'');
    $('waveMessage').textContent=gameOver?'The grove was overrun. Rebuild and hold the line.':running?(paused?'Defenders are standing by.':`${enemies.length+spawnLeft} critter${enemies.length+spawnLeft===1?'':'s'} still on the trail.`):wave?`Wave ${wave} cleared. Your defenders are ready.`:'The trail is quiet. Prepare your defenses.';
    for(const card of document.querySelectorAll('.tower-card')){const type=card.dataset.tower;card.classList.toggle('selected',type===selectedType&&!selectedTower);card.classList.toggle('unaffordable',cash<defs[type].cost);card.setAttribute('aria-pressed',String(type===selectedType&&!selectedTower));}
    if(selectedTower)updateTowerDetail();else if(selectedType){$('selectedPanel').hidden=false;$('towerDetail').hidden=true;$('selectedName').textContent=defs[selectedType].name;$('selectedRange').textContent=defs[selectedType].range;$('selectedRate').textContent=defs[selectedType].rate.toFixed(1)+'s';$('selectedDamage').textContent=defs[selectedType].damage||'slow';}else{$('selectedPanel').hidden=true;$('towerDetail').hidden=true;}
  }
  function updateTowerDetail(){const t=selectedTower,d=defs[t.type],s=getStats(t),cost=upgradeCost(t);$('selectedPanel').hidden=true;$('towerDetail').hidden=false;$('detailName').textContent=d.name;$('levelTag').textContent='LVL '+t.level;$('upgradeDescription').textContent=t.level>=4?'MAX LEVEL · field tested':t.type==='frost'?'Wider chill · stronger slow':'Sharper aim · +range & damage';$('upgradeCost').textContent=t.level>=4?'MAX LEVEL':'◈ '+cost;$('upgradeBtn').disabled=t.level>=4||cash<cost;$('sellValue').textContent='+'+Math.floor(t.invested*.7);$('selectedRange').textContent=s.range;$('selectedRate').textContent=s.rate.toFixed(1)+'s';$('selectedDamage').textContent=t.type==='frost'?'slow':s.damage;}
  function upgradeCost(t){return Math.round(defs[t.type].cost*(.8+(t.level-1)*.65));}
  function setPlacement(type){selectedTower=null;selectedType=type;updateHud();$('selectionHint').textContent='CLICK OPEN GRASS TO DEPLOY · ESC TO CANCEL';$('selectionHint').classList.add('visible');}
  function cancelSelection(){selectedTower=null;selectedType=null;$('selectionHint').classList.remove('visible');updateHud();}
  function notify(message){const el=$('toast');el.textContent=message;el.classList.add('show');toastTimer=2;}
  function pointFromEvent(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
  function findTower(x,y){for(let i=towers.length-1;i>=0;i--)if(Math.hypot(towers[i].x-x,towers[i].y-y)<23)return towers[i];return null;}
  canvas.addEventListener('pointermove',e=>{mouse=pointFromEvent(e);});
  canvas.addEventListener('pointerleave',()=>{mouse={x:-100,y:-100};});
  canvas.addEventListener('pointerdown',e=>{const p=pointFromEvent(e);if(gameOver)return;const clicked=findTower(p.x,p.y);if(clicked){selectedTower=clicked;selectedType=null;$('selectionHint').classList.remove('visible');updateHud();return;}if(selectedType){if(!validPlacement(p.x,p.y)){notify(distanceToRoute(p.x,p.y)<54?'Keep the trail clear.':'Choose an open patch of grass.');return;}const d=defs[selectedType];if(cash<d.cost){notify('Not enough field funds for that defender.');return;}cash-=d.cost;towers.push({x:p.x,y:p.y,type:selectedType,level:1,cooldown:rand(0,.35),angle:-Math.PI/2,invested:d.cost});selectedTower=towers.at(-1);selectedType=null;$('selectionHint').classList.remove('visible');updateHud();return;}selectedTower=null;updateHud();});
  document.querySelectorAll('.tower-card').forEach(card=>card.addEventListener('click',()=>setPlacement(card.dataset.tower)));
  $('cancelPlacement').addEventListener('click',cancelSelection);$('deselectTower').addEventListener('click',cancelSelection);
  $('upgradeBtn').addEventListener('click',()=>{if(!selectedTower||selectedTower.level>=4)return;const cost=upgradeCost(selectedTower);if(cash<cost){notify('Not enough field funds to upgrade.');return;}cash-=cost;selectedTower.invested+=cost;selectedTower.level++;updateHud();notify('Defender upgraded to level '+selectedTower.level+'.');});
  $('sellBtn').addEventListener('click',()=>{if(!selectedTower)return;cash+=Math.floor(selectedTower.invested*.7);towers=towers.filter(t=>t!==selectedTower);selectedTower=null;updateHud();notify('Defender sold. Funds returned.');});
  $('waveBtn').addEventListener('click',()=>{if(gameOver){cash=420;lives=100;wave=0;enemies=[];towers=[];shots=[];particles=[];gameOver=false;running=false;paused=false;selectedTower=null;selectedType='scout';updateHud();notify('Field reset. Deploy your defenses.');return;}if(running)return;wave++;running=true;paused=false;spawnLeft=7+wave*3;spawnTimer=.25;updateHud();});
  $('pauseBtn').addEventListener('click',()=>{if(!running)return;paused=!paused;updateHud();});
  $('speedBtn').addEventListener('click',()=>{speed=speed===1?2:1;$('speedText').textContent=speed+'×';});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('helpModal').hidden){closeHelp();return;}cancelSelection();}if(e.key===' '&&running){e.preventDefault();paused=!paused;updateHud();}});
  $('helpBtn').addEventListener('click',()=>$('helpModal').hidden=false);function closeHelp(){$('helpModal').hidden=true;} $('closeHelp').addEventListener('click',closeHelp);$('gotIt').addEventListener('click',closeHelp);$('helpModal').addEventListener('pointerdown',e=>{if(e.target===$('helpModal'))closeHelp();});

  function spawnEnemy(){const hp=Math.max(1,Math.floor((wave+2)/4));enemies.push({progress:0,x:route[0].x,y:route[0].y,r:10+Math.min(wave*.12,3),speed:48+Math.min(wave*1.6,24),hp,maxHp:hp,slow:0,index:7+wave*3-spawnLeft,wave});spawnLeft--;}
  function addParticle(x,y,color,kind='dot',n=5){for(let i=0;i<n;i++){const a=rand(0,Math.PI*2),v=rand(20,85);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.28,.65),maxLife:.65,size:rand(1.5,3.8),color,kind,radius:20});}}
  function popEnemy(e){cash+=1+Math.ceil(wave*.35);addParticle(e.x,e.y,['#f6d69a','#fff3d4','#9acb8b'][Math.floor(rand(0,3))],'dot',7);addParticle(e.x,e.y,'#fff5d5','ring',1);enemies=enemies.filter(a=>a!==e);}
  function hitEnemy(e,dmg){e.hp-=dmg;if(e.hp<=0)popEnemy(e);else addParticle(e.x,e.y,'#fff1c4','dot',3);}
  function fire(t,target){const stats=getStats(t);t.angle=Math.atan2(target.y-t.y,target.x-t.x);t.cooldown=stats.rate;if(t.type==='frost'){target.slow=Math.max(target.slow,1.7);hitEnemy(target,0);addParticle(target.x,target.y,'#b7f4ed','ring',1);return;}shots.push({x:t.x,y:t.y-5,target,type:t.type,speed:t.type==='mortar'?290:440,damage:stats.damage,color:defs[t.type].projectile,aoe:t.type==='mortar'?42:0});}
  function update(dt){if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').classList.remove('show');}if(!running||paused||gameOver)return;const step=dt*speed;
    if(spawnLeft>0){spawnTimer-=step;if(spawnTimer<=0){spawnEnemy();spawnTimer=Math.max(.38,.82-wave*.018);}}
    for(const e of enemies){e.slow=Math.max(0,e.slow-step);e.progress+=e.speed*(e.slow>0?.48:1)*step;const p=pointAt(Math.min(e.progress,routeLength));e.x=p.x;e.y=p.y;if(e.progress>=routeLength){lives=Math.max(0,lives-e.hp);addParticle(e.x,e.y,'#e47a67','dot',8);enemies=enemies.filter(a=>a!==e);if(lives<=0){gameOver=true;running=false;paused=false;notify('The grove has been breached.');}}}
    for(const t of towers){t.cooldown-=step;const stats=getStats(t);let target=null,best=-1;for(const e of enemies){if(Math.hypot(e.x-t.x,e.y-t.y)<=stats.range&&e.progress>best){best=e.progress;target=e;}}if(target){t.angle=Math.atan2(target.y-t.y,target.x-t.x);if(t.cooldown<=0)fire(t,target);}}
    for(const s of shots){if(!enemies.includes(s.target))continue;const dx=s.target.x-s.x,dy=s.target.y-s.y,dist=Math.hypot(dx,dy),travel=s.speed*step;if(dist<=travel+4){if(s.aoe){addParticle(s.target.x,s.target.y,s.color,'ring',1);for(const e of [...enemies])if(Math.hypot(e.x-s.target.x,e.y-s.target.y)<=s.aoe)hitEnemy(e,s.damage);}else hitEnemy(s.target,s.damage);s.hit=true;}else{s.x+=dx/dist*travel;s.y+=dy/dist*travel;}}
    shots=shots.filter(s=>!s.hit&&enemies.includes(s.target));for(const p of particles){p.life-=step;p.x+=p.vx*step;p.y+=p.vy*step;p.vx*=.96;p.vy*=.96;}particles=particles.filter(p=>p.life>0);
    if(spawnLeft<=0&&enemies.length===0){running=false;cash+=20+wave*2;notify('Wave '+wave+' cleared · bonus funds awarded.');}
    updateHud();
  }
  function frame(now){const dt=Math.min(.05,(now-lastTime)/1000||0);lastTime=now;update(dt);draw();requestAnimationFrame(frame);}
  function validResize(){/* canvas uses a fixed logical coordinate space and scales via CSS */}
  window.addEventListener('resize',validResize);updateHud();requestAnimationFrame(frame);
})();
