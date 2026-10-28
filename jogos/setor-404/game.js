'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
ctx.imageSmoothingEnabled=false;
const bg=new Image(),mayaSource=new Image(),robotSource=new Image();
bg.src='assets/cenario.png';mayaSource.src='assets/maya-rig-source.png';robotSource.src='assets/r04.png';
const FLOOR=Phase1.FLOOR,STEP=1000/60,WALK_SPEED=1.6,RUN_SPEED=2.9,CROUCH_SPEED=0.75,DEATH_TICKS=96,DODGE_TICKS=28;
const keys=new Set(),pressed=new Set(),particles=[],dodgeTrails=[];
const maya={},camera={x:0,previous:0};
let stage=1,level=Campaign.create(stage),arsenal=Weapons.create(stage),ready=false,active=false,paused=false,won=false,mayaRig,robotRig;
Weapons.attach(level);
let creditsWasPaused=false;
let frame=0,lastTime=null,accumulator=0,toastTime=0,toastText='',fuses=0,score=0,defeated=0;
const audio=SectorAudio;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const lerp=(a,b,t)=>a+(b-a)*t;
const approach=(value,target,amount)=>value<target?Math.min(target,value+amount):Math.max(target,value-amount);
const held=(...names)=>names.some(name=>keys.has(name));
function tap(...names){let value=false;for(const name of names)if(pressed.delete(name))value=true;return value;}
function sound(name,x){if(x===undefined||Math.abs(x-maya.x-32)<480)audio.sfx(name);}
function notify(text,ticks=180){toastText=text;toastTime=ticks;}
function releaseInput(){keys.clear();pressed.clear();maya.jumpBuffer=0;maya.attackBuffer=0;}

function placeMaya(x){
  Object.assign(maya,{x,y:FLOOR-91,px:x,py:FLOOR-91,ph:91,w:64,h:91,vx:0,vy:0,
    ground:true,face:1,hp:6,energy:5,regen:0,attack:0,attackLock:0,attackBuffer:0,secondary:0,secondaryKind:null,secondaryFace:1,
    dodge:0,dodgeCool:0,dodgeTime:DODGE_TICKS,previousDodge:DODGE_TICKS,dodgeFace:1,dodgeEntry:null,dodgeAirUsed:false,
    invuln:80,hurt:0,coyote:7,jumpBuffer:0,
    phase:0.25,previousPhase:0.25,blend:0,previousBlend:0,
    crouch:0,previousCrouch:0,run:0,previousRun:0,takeoff:0,jumpFlight:false,landing:0,landingStrength:0,
    dead:false,deathTime:0,previousDeath:0});
}
function reset(nextStage=stage,continuing=false){
  stage=clamp(Number(nextStage)||1,1,5);level=Campaign.create(stage);arsenal=continuing?arsenal:Weapons.create(stage);Weapons.attach(level);frame=0;fuses=0;score=0;defeated=0;particles.length=0;
  placeMaya(125);dodgeTrails.length=0;camera.x=0;camera.previous=0;
  begin();notify(stage===1?'OFICINA • J: chave sem consumo de energia | Shift: correr | K: esquivar':'FASE '+stage+' • Encontre a bancada: E recolhe a ferramenta | L usa | Q troca | R: pulso na fase 5',480);
}
function begin(){
  releaseInput();active=true;won=false;paused=false;lastTime=null;accumulator=0;
  document.querySelector('#start').hidden=true;document.querySelector('#result').hidden=true;
  document.querySelector('#pause-overlay').hidden=true;document.querySelector('#pause').textContent='PAUSAR';
  document.querySelector('#stage-heading').textContent='FASE '+stage+' / '+level.title;
  document.querySelector('#credits-overlay').hidden=true;
  audio.setPaused(false);audio.setIntensity(0);audio.unlock();updateSoundButton();
}
function respawn(){
  placeMaya(level.checkpoint);dodgeTrails.length=0;particles.length=0;
  for(const e of level.enemies){if(!e.alive)continue;e.x=e.home;e.px=e.home;e.hp=e.maxHP;e.mode='patrol';e.timer=0;e.vx=0;e.stun=0;}
  for(const s of level.stations)s.charge=0;
  level.projectiles.length=0;Weapons.clear(level);if(level.boss&&level.boss.alive){level.boss.hp=level.boss.maxHP;level.boss.mode='idle';level.boss.timer=0;level.boss.stun=0;}
  camera.x=clamp(maya.x-420,0,Phase1.WIDTH-1280);camera.previous=camera.x;
  begin();notify('CHECKPOINT • Energia e vida restauradas.');
}
function setPaused(value){
  if(!active||won)return;
  paused=value;releaseInput();lastTime=null;accumulator=0;
  document.querySelector('#pause-overlay').hidden=!paused;
  document.querySelector('#pause').textContent=paused?'RETOMAR':'PAUSAR';
  audio.setPaused(paused);if(!paused&&!maya.dead)audio.unlock();
}
function updateSoundButton(){
  const button=document.querySelector('#sound');button.textContent=audio.isEnabled()?'SOM: LIGADO':'SOM: DESLIGADO';
  button.setAttribute('aria-pressed',String(audio.isEnabled()));
}
document.querySelector('#play').onclick=()=>{if(ready)reset();};
document.querySelector('#restart').onclick=()=>{if(ready)reset();};
document.querySelector('#retry').onclick=()=>{if(ready)respawn();};
document.querySelector('#again').onclick=()=>{if(ready)reset(won&&stage<5?stage+1:won?1:stage,won&&stage<5);};
for(const number of [1,2,3,4,5])document.querySelector('#stage'+number).onclick=()=>{if(ready)reset(number);};
function showCredits(final=false){
  creditsWasPaused=paused;if(active&&!paused)setPaused(true);
  document.querySelector('#credits-message').textContent=final?'Campanha concluída! Maya recuperou o controle da fábrica.':'Um projeto de jogo de ação com temática industrial.';
  document.querySelector('#credits-close').textContent=final?'VOLTAR AO RESULTADO':'VOLTAR AO JOGO';
  document.querySelector('#credits-overlay').hidden=false;document.querySelector('#credits-close').focus?.();
}
document.querySelector('#credits-open').onclick=()=>{if(ready)showCredits();};
document.querySelector('#credits-close').onclick=()=>{document.querySelector('#credits-overlay').hidden=true;if(active&&!creditsWasPaused)setPaused(false);};
document.querySelector('#pause').onclick=()=>setPaused(!paused);
document.querySelector('#resume').onclick=()=>setPaused(false);
document.querySelector('#sound').onclick=()=>{audio.setEnabled(!audio.isEnabled());if(active&&!paused&&!maya.dead)audio.unlock();updateSoundButton();};
document.querySelector('#volume').oninput=event=>audio.setVolume(Number(event.target.value)/100);
const controlled=new Set(['a','d','w','s','j','x','k','e','l','q','r','shift',' ','arrowleft','arrowright','arrowup','arrowdown','p','escape','m']);
addEventListener('keydown',event=>{
  const key=event.key.toLowerCase();if(!controlled.has(key)||!ready)return;
  if(event.target&&event.target.tagName==='INPUT')return;
  if(!document.querySelector('#credits-overlay').hidden){if(key==='escape')document.querySelector('#credits-close').onclick();event.preventDefault();return;}
  if(key==='p'||key==='escape'){if(!event.repeat)setPaused(!paused);event.preventDefault();return;}
  if(key==='m'){if(!event.repeat)document.querySelector('#sound').onclick();event.preventDefault();return;}
  if(active&&!paused&&!won)event.preventDefault();
  if(!keys.has(key)&&!event.repeat)pressed.add(key);keys.add(key);
});
addEventListener('keyup',event=>{
  const key=event.key.toLowerCase();keys.delete(key);
  if(active&&!paused&&!won&&!maya.dead&&['w',' ','arrowup'].includes(key)&&!held('w',' ','arrowup')&&maya.vy<-3)maya.vy*=0.5;
});
addEventListener('blur',()=>{releaseInput();if(active&&!won)setPaused(true);else audio.setPaused(true);});
addEventListener('focus',()=>{lastTime=null;accumulator=0;if(!paused&&active)audio.setPaused(false);});
document.addEventListener('visibilitychange',()=>{
  releaseInput();lastTime=null;accumulator=0;
  if(document.hidden){if(active&&!won)setPaused(true);else audio.setPaused(true);}
});

function puff(x,y,count=5,color='#dca044'){
  for(let i=0;i<count;i++)particles.push({x,y,vx:(Math.random()-0.5)*2.4,vy:-Math.random()*2-0.3,
    life:1,size:1+Math.random()*2,color});
}
function hurtMaya(sourceX,damage=1){
  if(maya.invuln>0||dodgeProtected()||!active||maya.dead)return;
  maya.hp=Math.max(0,maya.hp-damage);maya.invuln=75;maya.hurt=12;maya.attack=0;maya.secondary=0;
  maya.dodge=0;maya.dodgeTime=DODGE_TICKS;maya.previousDodge=DODGE_TICKS;dodgeTrails.length=0;
  maya.vx=maya.x+32<sourceX?-2.8:2.8;maya.vy=-2.6;maya.ground=false;maya.jumpFlight=false;sound('hurt');
  if(maya.hp<=0){
    maya.dead=true;maya.deathTime=0;maya.previousDeath=0;maya.invuln=0;maya.dodge=0;
    Weapons.clear(level);
    releaseInput();audio.stop();audio.sfx('death');toastTime=0;
  }
}
function dodgeProtected(){return maya.dodge>0&&maya.dodgeTime>=4&&maya.dodgeTime<=18;}
function mayaState(t=1){
  return {phase:lerp(maya.previousPhase,maya.phase,t),blend:lerp(maya.previousBlend,maya.blend,t),
    secondary:maya.secondary,secondaryKind:maya.secondaryKind,equipped:arsenal.selected,
    face:maya.face,ground:maya.ground,attack:maya.attack,dodge:maya.dodge,
    dodgeProgress:lerp(maya.previousDodge,maya.dodgeTime,t)/DODGE_TICKS,dodgeEntry:maya.dodgeEntry,
    crouch:lerp(maya.previousCrouch,maya.crouch,t),run:lerp(maya.previousRun,maya.run,t),vy:maya.vy,
    takeoff:maya.takeoff,jumpFlight:maya.jumpFlight,landing:maya.landing,landingStrength:maya.landingStrength,
    dead:maya.dead,deathProgress:lerp(maya.previousDeath,maya.deathTime,t)/DEATH_TICKS};
}
function strike(){
  sound('attack');
  const bossHit=Weapons.hitBoss(level,maya,'wrench',1,106,notify,sound);
  if(bossHit==='hit'||bossHit==='dead')puff(level.boss.x,FLOOR-45,12,'#ffdf8b');
  for(const e of level.enemies){
    const dx=e.x-(maya.x+32),dy=Math.abs(maya.y+maya.h-FLOOR);
    if(!e.alive||Math.sign(dx||maya.face)!==maya.face||Math.abs(dx)>105||dy>48)continue;
    hitEnemy(e,1,'wrench');
  }
}
function hitEnemy(e,damage=1,kind='wrench',face=maya.face){
  if(!e.alive)return false;
  if(e.armor>0){if(kind!=='hammer'){sound('robotHurt',e.x);notify('ROBÔ BLINDADO • Q: escolha a marreta | L: golpe pesado.',100);return false;}e.armor=0;}
  let dead=false;for(let i=0;i<damage&&e.alive;i++)dead=Phase1.damage(e,face);
  puff(e.x,FLOOR-35,7,'#ffc75c');sound(dead?'explosion':'robotHurt',e.x);
  if(dead){defeated++;score+=e.elite?150:50;level.pickups.push({x:e.x,y:FLOOR-16,type:'fuse',taken:false});if(e.elite)level.pickups.push({x:e.x+22,y:FLOOR-16,type:'health',taken:false});notify('ROBÔ DESATIVADO • Fusível disponível.',130);}
  return true;
}
function muzzle(){const p=MayaRig.muzzle(mayaState());return{x:maya.x+32+maya.face*p.x,y:maya.y+maya.h+p.y};}
function updateMaya(){
  maya.px=maya.x;maya.py=maya.y;maya.ph=maya.h;maya.previousPhase=maya.phase;maya.previousBlend=maya.blend;
  maya.previousCrouch=maya.crouch;maya.previousRun=maya.run;
  maya.previousDodge=maya.dodgeTime;
  const oldGait=MayaRig.gait(maya.crouch,maya.run);
  if(tap('w',' ','arrowup'))maya.jumpBuffer=8;
  if(tap('j','x'))maya.attackBuffer=8;
  const dodgePressed=tap('k');
  const direction=Number(held('d','arrowright'))-Number(held('a','arrowleft'));
  if(maya.ground)maya.coyote=7;
  const repairIntent=held('e')&&level.stations.some(s=>!s.done&&Math.abs(s.x-maya.x-32)<63&&fuses>0);
  const crouchIntent=held('s','arrowdown')&&maya.ground&&maya.hurt<=0&&maya.jumpBuffer<=0;
  const runIntent=held('shift')&&direction!==0&&!crouchIntent&&!repairIntent&&maya.attack<=0&&maya.hurt<=0;
  maya.crouch=approach(maya.crouch,crouchIntent?1:0,0.2);
  maya.run=approach(maya.run,runIntent?1:0,0.1);
  if(maya.ground&&maya.dodge<=0)maya.dodgeAirUsed=false;
  if(dodgePressed&&maya.dodge<=0&&maya.dodgeCool<=0&&maya.energy>0&&maya.hurt<=0&&(!maya.dodgeAirUsed||maya.ground)){
    maya.dodgeEntry=MayaRig.pose({...mayaState(),dodge:0,attack:0});
    maya.dodge=DODGE_TICKS;maya.dodgeTime=0;maya.previousDodge=0;maya.dodgeCool=56;
    maya.dodgeFace=direction||maya.face;maya.face=maya.dodgeFace;maya.dodgeAirUsed=true;
    maya.attack=0;maya.secondary=0;maya.attackBuffer=0;maya.jumpBuffer=0;maya.takeoff=0;maya.landing=0;
    maya.energy--;maya.regen=0;sound('dodge');
  }
  if(maya.dodge>0)maya.dodgeTime=Math.min(DODGE_TICKS,maya.dodgeTime+1);
  // The collider follows the low pose without moving the feet or bypassing gravity.
  const feet=maya.y+maya.h,low=maya.dodge>0?MayaRig.dodge(maya.dodgeTime/DODGE_TICKS).compression:0;
  maya.h=lerp(lerp(91,66,maya.crouch),58,low);maya.y=feet-maya.h;
  if(maya.hurt<=0&&maya.dodge<=0){
    const speed=lerp(lerp(WALK_SPEED,RUN_SPEED,maya.run),CROUCH_SPEED,maya.crouch);
    const target=repairIntent?0:direction*speed*(maya.attack>0?0.7:1);
    const acceleration=direction?(maya.ground?lerp(0.2,0.25,maya.run):0.13):(maya.ground?0.24:0.035);
    maya.vx=approach(maya.vx,target,acceleration);
    if(Math.abs(maya.vx)>0.06)maya.face=Math.sign(maya.vx);else if(direction)maya.face=direction;
  }else if(maya.hurt>0)maya.vx*=0.92;
  if(maya.jumpBuffer>0&&maya.coyote>0&&maya.dodge<=0&&maya.hurt<=0){
    maya.vy=-7.8;maya.ground=false;maya.coyote=0;maya.jumpBuffer=0;maya.takeoff=5;maya.jumpFlight=true;maya.landing=0;puff(maya.x+32,maya.y+maya.h,4);sound('jump');
  }
  if(maya.attackBuffer>0&&maya.attackLock<=0&&maya.dodge<=0&&maya.hurt<=0&&maya.secondary<=0){
    maya.attack=30;maya.attackLock=32;maya.attackBuffer=0;
  }
  if(tap('q'))Weapons.cycle(arsenal,maya,notify);
  if(tap('l'))Weapons.use(level,arsenal,maya,muzzle,hitEnemy,notify,sound);
  if(tap('r'))Weapons.pulse(level,arsenal,maya,notify,sound);
  if(maya.secondary>0)maya.face=maya.secondaryFace;
  if(maya.dodge>0){
    const t=maya.dodgeTime/DODGE_TICKS,recovery=clamp((t-0.82)/0.18,0,1);
    const speed=lerp(MayaRig.dodge(t).speed,Math.abs(direction)*lerp(lerp(WALK_SPEED,RUN_SPEED,maya.run),CROUCH_SPEED,maya.crouch),recovery);
    maya.face=maya.dodgeFace;maya.vx=maya.dodgeFace*speed;
  }
  maya.vy=Math.min(10,maya.vy+0.43);
  const oldBottom=maya.y+maya.h;
  const maxX=level.gateOpen?Phase1.WIDTH-maya.w-18:level.exit-60;
  maya.x=clamp(maya.x+maya.vx,18,maxX);maya.y+=maya.vy;
  const surface=Phase1.landing(level,maya.x+20,maya.x+44,oldBottom,maya.y+maya.h,maya.vy);
  if(surface!==null){
    if(!maya.ground&&maya.vy>1.5){maya.landing=10;maya.landingStrength=clamp(maya.vy/10,0.25,1);puff(maya.x+32,surface,4);}
    maya.y=surface-maya.h;maya.vy=0;maya.ground=true;maya.jumpFlight=false;
  }else maya.ground=false;
  const dx=maya.x-maya.px,walking=maya.ground&&maya.dodge<=0&&maya.hurt<=0;
  if(maya.dodge>0&&Math.abs(dx)>1.2){
    const elapsed=maya.dodgeTime;
    if(elapsed>=4&&elapsed<=22&&elapsed%3===1){
      dodgeTrails.push({x:maya.x+32,feet:maya.y+maya.h,state:{...mayaState(),tint:'#59d9e7'},life:12});
      if(dodgeTrails.length>5)dodgeTrails.shift();
    }
    if(maya.ground&&elapsed%4===0){
      for(let i=0;i<3;i++)particles.push({x:maya.x+32-maya.face*14,y:maya.y+maya.h-2,
        vx:-maya.face*(0.5+Math.random()*1.8),vy:-0.2-Math.random()*0.8,life:0.65,size:1+Math.random()*2,color:i===0?'#80ebee':'#c6a46b'});
    }
  }
  if(walking)maya.phase=MayaRig.advance(maya.phase,dx,oldGait,MayaRig.gait(maya.crouch,maya.run));
  maya.blend=approach(maya.blend,walking&&Math.abs(dx)>0.035?1:0,0.12);
  if(maya.attack===18)strike();
  maya.regen++;if(maya.regen>=95){maya.energy=Math.min(5,maya.energy+1);maya.regen=0;}
  for(const key of ['attack','attackLock','attackBuffer','dodge','dodgeCool','invuln','hurt','coyote','jumpBuffer','takeoff','landing'])maya[key]=Math.max(0,maya[key]-1);
}
function updateDeath(){
  maya.px=maya.x;maya.py=maya.y;maya.ph=maya.h;maya.previousDeath=maya.deathTime;
  maya.previousPhase=maya.phase;maya.previousBlend=maya.blend;
  maya.previousCrouch=maya.crouch;maya.previousRun=maya.run;
  const oldBottom=maya.y+maya.h;maya.vx*=0.86;maya.vy=Math.min(10,maya.vy+0.43);
  maya.x=clamp(maya.x+maya.vx,18,Phase1.WIDTH-maya.w-18);maya.y+=maya.vy;
  const surface=Phase1.landing(level,maya.x+20,maya.x+44,oldBottom,maya.y+maya.h,maya.vy);
  if(surface!==null){maya.y=surface-maya.h;maya.vy=0;maya.ground=true;}else maya.ground=false;
  maya.deathTime=Math.min(DEATH_TICKS,maya.deathTime+1);
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.065;p.life-=0.04;if(p.life<=0)particles.splice(i,1);}
  if(maya.deathTime>=DEATH_TICKS&&maya.ground){active=false;showResult(false);}
}
function updateObjectives(){
  Weapons.acquire(level,arsenal,maya,held('e'),notify,sound);
  for(const p of level.pickups){
    if(p.taken||Math.abs(p.x-maya.x-32)>34||Math.abs(maya.y+maya.h-p.y-14)>38)continue;
    p.taken=true;sound('pickup');
    if(p.type==='fuse'){fuses++;score+=10;notify('FUSÍVEL RECUPERADO • Leve-o a um painel e segure E.',150);}
    if(p.type==='health'){maya.hp=Math.min(6,maya.hp+2);notify('KIT DE MANUTENÇÃO • Vida restaurada.',130);}
    if(p.type==='energy'){maya.energy=5;notify('CÉLULA DE ENERGIA • Ferramenta recarregada.',130);}
    if(p.type==='parts'){score+=100;notify('PEÇAS RECUPERADAS • +100 pontos',130);}
  }
  for(const s of level.stations){
    if(s.done)continue;
    const nearby=Math.abs(s.x-maya.x-32)<64&&maya.ground&&Math.abs(maya.y+maya.h-FLOOR)<2;
    const danger=level.enemies.some(e=>e.alive&&Math.abs(e.x-s.x)<135);
    if(nearby&&held('e')&&fuses>0&&!danger&&maya.hurt<=0&&maya.attack<=0&&maya.dodge<=0){
      s.charge++;
      if(s.charge>=60){
        s.done=true;fuses--;score+=200;level.checkpoint=s.x+70;
        maya.hp=Math.min(6,maya.hp+2);maya.energy=5;sound('repair');
        notify(s.name+' ONLINE • Checkpoint ativado.',230);
        if(level.stations.every(panel=>panel.done))notify(level.boss&&level.boss.alive?'CIRCUITOS RECUPERADOS • Enfrente o chefe e ataque quando o núcleo estiver exposto.':'ENERGIA RESTAURADA • Alcance a saída à direita.',360);
      }
    }else{s.charge=Math.max(0,s.charge-3);
      if(nearby&&tap('e'))notify(danger?'ÁREA EM RISCO • Desative o robô antes do reparo.':fuses===0?'FALTA UM FUSÍVEL • Recupere-o dos robôs.':'SEGURE E POR 1 SEGUNDO PARA REPARAR.',130);}
  }
  level.gateOpen=Campaign.gateReady(level);
  if(level.gateOpen&&maya.x+32>level.exit){won=true;active=false;releaseInput();audio.stop();audio.sfx('victory');showResult(true);}
}
function update(){
  if(!active||paused||won)return;
  frame++;camera.previous=camera.x;if(toastTime>0)toastTime--;
  for(let i=dodgeTrails.length-1;i>=0;i--)if(--dodgeTrails[i].life<=0)dodgeTrails.splice(i,1);
  if(maya.dead){updateDeath();return;}
  Campaign.preUpdate(level,maya,frame);
  updateMaya();
  Weapons.update(level,arsenal,maya,hitEnemy,notify,sound);
  if(level.boss&&level.boss.rewardPending){score+=500;level.boss.rewardPending=false;}
  for(const e of level.enemies){
    if(!active||maya.dead)break;
    Campaign.stepEnemy(level,e,maya,level.enemies,enemy=>{
      if(Math.abs(maya.y+maya.h-FLOOR)<46)hurtMaya(enemy.x);
    },(name,x)=>{if(name!=='alert')sound(name,x);},R04Rig.STRIDE);
  }
  if(!active||maya.dead)return;
  for(const h of level.hazards){
    const heightHit=h.duck?maya.y<FLOOR-72&&maya.y+maya.h>FLOOR-80:Math.abs(maya.y+maya.h-FLOOR)<16;
    if(Phase1.hazardMode(h,frame)==='on'&&maya.x+44>h.x&&maya.x+20<h.x+h.w&&heightHit)hurtMaya(h.x+h.w/2);
  }
  Campaign.stepWorld(level,maya,frame,hurtMaya,sound);
  if(!active||maya.dead)return;
  updateObjectives();
  const target=clamp(maya.x+32-480+maya.vx*30,0,Phase1.WIDTH-1280);
  camera.x=lerp(camera.x,target,0.085);
  const fighting=level.enemies.some(e=>e.alive&&Math.abs(e.x-maya.x-32)<270&&['chase','windup','attack'].includes(e.mode));
  audio.setIntensity(fighting?0.85:0.15);
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.065;p.life-=0.04;if(p.life<=0)particles.splice(i,1);}
}

function showResult(success){
  document.querySelector('#result').hidden=false;
  document.querySelector('#result-title').textContent=success?(stage===5?'FÁBRICA RECUPERADA!':'FASE '+stage+' CONCLUÍDA'):'SISTEMA CRÍTICO';
  const minutes=Math.floor(frame/3600),seconds=String(Math.floor(frame/60)%60).padStart(2,'0');
  document.querySelector('#result-info').textContent=success?
    (stage===5?'Maya recuperou o controle da fábrica. Campanha concluída! • Nesta fase: ':'Setor recuperado • ')+defeated+'/'+level.enemies.length+' robôs • '+score+' pontos • '+minutes+':'+seconds:
    'Maya precisa de manutenção. Continue do último painel ativado.';
  document.querySelector('#retry').hidden=success;
  document.querySelector('#again').textContent=success?(stage<5?'CONTINUAR PARA FASE '+(stage+1):'RECOMEÇAR CAMPANHA'):'REINICIAR FASE';
  if(success&&stage===5)showCredits(true);
}
function drawEnemy(e,alpha){
  if(!e.alive&&e.timer>50)return;
  const x=lerp(e.px,e.x,alpha);
  if(x<camera.x-130||x>camera.x+1410)return;
  const duration=e.mode==='windup'?(e.elite?32:36):e.mode==='attack'?15:e.mode==='recover'?(e.elite?38:45):e.mode==='dead'?50:13;
  ctx.save();if(!e.alive)ctx.globalAlpha=Math.max(0,1-e.timer/60);
  if(e.elite){ctx.translate(x,FLOOR);ctx.scale(1.12,1.12);ctx.translate(-x,-FLOOR);}
  robotRig.render(ctx,x,FLOOR,{phase:lerp(e.previousPhase,e.phase,alpha),face:e.face,mode:e.mode,
    progress:clamp(e.timer/duration,0,1),hit:e.mode==='hurt'&&frame%4<2,moving:Math.abs(e.x-e.px)>0.01});ctx.restore();
  if(e.alive&&(e.hp<e.maxHP||Math.abs(e.x-maya.x-32)<250)){
    ctx.fillStyle='#071019';ctx.fillRect(x-32,FLOOR-(e.elite?98:88),64,8);
    ctx.fillStyle=e.elite?'#ff9d30':'#ee3f47';ctx.fillRect(x-30,FLOOR-(e.elite?96:86),60*e.hp/e.maxHP,4);
    if(e.elite){ctx.font='10px monospace';ctx.fillStyle='#ffbd55';ctx.fillText('SUPERVISOR',x-31,FLOOR-106);}
  }
  if(e.alive&&e.armor>0){ctx.font='10px monospace';ctx.fillStyle='#ffb96b';ctx.fillText('BLINDADO',x-28,FLOOR-107);}
}
function drawHUD(){
  ctx.font='bold 14px monospace';ctx.fillStyle='#07121eec';ctx.fillRect(12,11,281,65);ctx.strokeStyle='#b8842d';ctx.strokeRect(12.5,11.5,280,64);
  ctx.fillStyle='#f4fbff';ctx.fillText('MAYA  | VIDA',23,32);
  for(let i=0;i<6;i++){ctx.fillStyle=i<maya.hp?'#ff4357':'#3c2530';ctx.fillRect(141+i*22,22,17,12);}
  ctx.fillStyle='#a3d9e7';ctx.fillText('ENERGIA',23,57);
  for(let i=0;i<5;i++){ctx.fillStyle=i<maya.energy?'#24dcf6':'#23414c';ctx.fillRect(141+i*22,47,17,8);}
  const powered=level.stations.filter(s=>s.done).length;
  ctx.fillStyle='#07121eeb';ctx.fillRect(410,11,455,65);ctx.strokeStyle='#9a762c';ctx.strokeRect(410.5,11.5,454,64);
  ctx.fillStyle='#ffc552';ctx.fillText(level.gateOpen?'OBJETIVO: ALCANCE A SAÍDA':level.armory&&!level.armory.collected?'OBJETIVO: E NA BANCADA DE FERRAMENTAS':Campaign.count(level)===3&&level.boss&&level.boss.alive?'OBJETIVO: DERROTE '+level.boss.name:'OBJETIVO: REATIVE OS 3 PAINÉIS',425,33);
  ctx.fillStyle='#b9d8e5';ctx.font='12px monospace';ctx.fillText('FUSÍVEIS: '+fuses+'   PAINÉIS: '+powered+'/3   ROBÔS: '+defeated+'/'+level.enemies.length,425,58);
  ctx.fillStyle='#07121eeb';ctx.fillRect(1022,11,245,65);ctx.strokeStyle='#516c7a';ctx.strokeRect(1022.5,11.5,244,64);
  ctx.font='bold 13px monospace';ctx.fillStyle='#b5eaf0';ctx.fillText('FASE '+stage+' • '+['MANUTENÇÃO','MONTAGEM','NÚCLEO 404','FUNDIÇÃO','CONTROLE'][stage-1],1035,33);
  ctx.fillStyle='#213c4c';ctx.fillRect(1037,51,215,4);
  for(const s of level.stations){ctx.fillStyle=s.done?'#31ebb3':'#b1893f';ctx.fillRect(1037+s.x/Phase1.WIDTH*215-3,47,6,12);}
  ctx.fillStyle='#f9fcff';ctx.fillRect(1037+(maya.x+32)/Phase1.WIDTH*215-2,49,4,8);
  if(toastTime>0){ctx.fillStyle='#07131de9';ctx.fillRect(100,385,1080,28);ctx.fillStyle='#d7f0f3';ctx.font='13px monospace';ctx.fillText(toastText,118,404);}
  Weapons.hud(ctx,arsenal);const status=Weapons.status(arsenal);if(document.querySelector('#weapon-status').textContent!==status)document.querySelector('#weapon-status').textContent=status;
}
function draw(alpha=1){
  ctx.clearRect(0,0,1280,426);
  if(!ready){ctx.fillStyle='#08131d';ctx.fillRect(0,0,1280,426);return;}
  const t=active&&!won&&!paused?alpha:1,cam=Math.round(lerp(camera.previous,camera.x,t));
  ctx.save();ctx.translate(-cam,0);Campaign.drawWorld(ctx,bg,level,frame,robotRig);
  for(const s of level.stations)Phase1.drawStation(ctx,s,frame);
  for(const p of level.pickups)if(p.x>cam-30&&p.x<cam+1310)Phase1.drawPickup(ctx,p,frame);
  for(const e of level.enemies)drawEnemy(e,t);
  Weapons.draw(ctx,level,frame);
  const x=lerp(maya.px,maya.x,t),feet=lerp(maya.py+maya.ph,maya.y+maya.h,t);
  for(const trail of dodgeTrails){ctx.save();ctx.globalAlpha=0.22*(trail.life/12)**1.5;mayaRig.render(ctx,trail.x,trail.feet,trail.state);ctx.restore();}
  if(maya.dodge>0&&Math.abs(maya.x-maya.px)>1.2){
    const strength=MayaRig.dodge(maya.dodgeTime/DODGE_TICKS).compression;
    ctx.save();ctx.globalAlpha=0.6*strength;
    for(let i=0;i<3;i++){
      ctx.fillStyle=i===1?'#dcffff':'#50c4d9';
      const length=12+i*5,tip=x+32-maya.face*(20+i*3);
      ctx.fillRect(Math.round(maya.face>0?tip-length:tip),Math.round(feet-18-i*11),length,1+i%2);
    }
    ctx.restore();
  }
  ctx.fillStyle='#02070a55';ctx.beginPath();ctx.ellipse(x+35,Math.min(FLOOR,feet),maya.dead?26:18,3,0,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.globalAlpha=!maya.dead&&maya.dodge<=0&&maya.invuln&&frame%6<3?0.45:1;
  mayaRig.render(ctx,x+32,feet,mayaState(t));ctx.restore();
  for(const p of particles){ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);}ctx.globalAlpha=1;
  ctx.restore();drawHUD();
}
function loop(time){
  if(lastTime===null)lastTime=time;accumulator+=Math.min(100,Math.max(0,time-lastTime));lastTime=time;
  while(accumulator>=STEP){update();accumulator-=STEP;}draw(accumulator/STEP);requestAnimationFrame(loop);
}
placeMaya(125);document.querySelector('#play').textContent='CARREGANDO…';
Promise.all([bg.decode(),mayaSource.decode(),robotSource.decode()]).then(()=>{
  mayaRig=MayaRig.create(mayaSource);robotRig=R04Rig.create(robotSource);ready=true;
  document.querySelector('#play').textContent='INICIAR FASE 1';updateSoundButton();requestAnimationFrame(loop);
}).catch(error=>{console.error('Falha ao carregar SETOR 404:',error);document.querySelector('#play').textContent='ARTE NÃO CARREGADA';});
