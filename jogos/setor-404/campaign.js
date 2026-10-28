/* Campaign content: independent world rules, bosses and rendering. Maya's rig is unchanged. */
(function(global){
 'use strict';
 const F=318,W=3840,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const titles=['MANUTENÇÃO','LINHA FORA DE CONTROLE','NÚCLEO 404','FUNDIÇÃO','CONTROLE CENTRAL'];
 function create(stage=1){
  const l=Phase1.create();l.stage=stage;l.title=titles[stage-1];l.projectiles=[];
  l.belts=[];l.presses=[];l.locks=[];l.barriers=[];l.boss=null;
  if(stage===1)return l;
  l.enemies=l.enemies.slice(0,4);
  l.enemies.forEach((e,i)=>{Object.assign(e,{x:[620,1440,2070,2630][i],min:[500,1300,1950,2520][i],max:[810,1620,2250,2740][i],hp:3,maxHP:3,elite:false});e.px=e.home=e.x;e.kind=(i===1||stage>=3&&stage!==4&&i===3)?'welder':'guard';e.id=e.kind==='welder'?(stage===2?'SOLDADOR S-02':'VIGIA N-03'):'R-04';e.armor=stage>=4&&i>=2?1:0;});
  l.stations=[{x:980,name:stage===2?'ALIMENTAÇÃO MX':'CIRCUITO A',done:false,charge:0},{x:2240,name:stage===2?'SINCRONISMO':'CIRCUITO B',done:false,charge:0},{x:2870,name:stage===2?'CONTROLE MX':'CIRCUITO C',done:false,charge:0}];
  l.pickups=[{x:430,y:250,type:'parts',taken:false},{x:1570,y:205,type:'energy',taken:false},{x:2470,y:302,type:'health',taken:false},{x:3090,y:302,type:'energy',taken:false},{x:3160,y:302,type:'health',taken:false}];
  l.platforms=[{x:350,y:267,w:150},{x:1350,y:265,w:150},{x:1505,y:222,w:150},{x:2460,y:267,w:145},{x:2660,y:220,w:150}];
  l.hazards=stage===2?[{x:1800,w:65,offset:0}]:[{x:1670,w:115,offset:0,duck:true},{x:2380,w:70,offset:65},{x:3030,w:80,offset:110,duck:true}];
  if(stage===2){l.belts=[{x:370,w:400,speed:0.65},{x:1630,w:400,speed:-0.7}];l.presses=[{x:1120,w:74,offset:0},{x:2390,w:80,offset:100}];l.platforms[1].moveX=42;}
  else{l.locks=[{x:1240,station:0},{x:2500,station:1}];l.platforms[1].moveY=21;l.platforms[3].moveY=24;}
  if(stage===4){l.locks=[];l.barriers=[{x:1240,broken:false},{x:2500,broken:false}];l.hazards=[{x:1660,w:110,offset:0},{x:2420,w:95,offset:80}];l.belts=[{x:360,w:380,speed:0.45}];l.stations.forEach((s,i)=>s.name=['REFRIGERAÇÃO','PRESSÃO TÉRMICA','CONTROLE DA FORJA'][i]);}
  if(stage===5){l.stations.forEach((s,i)=>s.name=['ACESSO CENTRAL','CONTROLE DE REDE','COMANDO FINAL'][i]);l.hazards.push({x:1950,w:100,offset:40,duck:true});}
  l.platforms.forEach(p=>{p.baseX=p.x;p.baseY=p.y;p.previousX=p.x;p.previousY=p.y;});
  l.boss={x:3380,hp:stage===2?8:10,maxHP:stage===2?8:10,alive:true,mode:'idle',timer:0,target:3380,stage,name:stage===2?'BRAÇO MX-02':'SENTINELA 404',hits:0};
  if(stage===4)Object.assign(l.boss,{name:'FORJADOR H-04',hp:12,maxHP:12,armor:2});
  if(stage===5)Object.assign(l.boss,{name:'REGENTE INDUSTRIAL',hp:14,maxHP:14,armor:0});
  return l;
 }
 function count(l){return l.stations.filter(s=>s.done).length;}
 function vulnerable(l){return l.boss&&l.boss.alive&&count(l)>=(l.stage===2||l.stage===4?2:3)&&l.boss.mode==='recover';}
 function damageBoss(l,hero){
  const b=l.boss;if(!b||!b.alive||Math.abs(hero.x+32-b.x)>106||Math.sign(b.x-hero.x-32||hero.face)!==hero.face||Math.abs(hero.y+hero.h-F)>48)return null;
  if(!vulnerable(l))return 'shield';
  if(b.armor>0)return 'armor';
  b.hp--;b.hits=8;if(b.hp<=0){b.alive=false;b.mode='dead';return 'dead';}return 'hit';
 }
 function preUpdate(l,hero,frame){
  if(l.stage===1)return;
  l.previousHeroX=hero.x;
  for(const p of l.platforms){
   p.previousX=p.x;p.previousY=p.y;
   p.x=p.baseX+(p.moveX||0)*Math.sin(frame/48);p.y=p.baseY+(p.moveY||0)*Math.sin(frame/58);
   if(hero.ground&&Math.abs(hero.y+hero.h-p.previousY)<1&&hero.x+44>p.previousX&&hero.x+20<p.previousX+p.w){hero.x+=p.x-p.previousX;hero.y+=p.y-p.previousY;}
  }
 }
 function shot(l,x,y,targetX,targetY,speed=3.8){const dx=targetX-x,dy=targetY-y,d=Math.max(1,Math.hypot(dx,dy));l.projectiles.push({x,y,vx:dx/d*speed,vy:dy/d*speed,life:150});}
 function stepEnemy(l,e,hero,enemies,onHit,onCue,stride){
  if(e.alive&&e.stun>0){e.stun--;e.px=e.x;e.previousPhase=e.phase;e.vx=0;return;}
  if(e.kind!=='welder'||!e.alive||e.mode==='hurt'){Phase1.stepEnemy(e,hero,enemies,onHit,onCue,stride);return;}
  e.px=e.x;e.previousPhase=e.phase;e.vx=0;e.timer++;
  const dx=hero.x+32-e.x;e.face=Math.sign(dx)||e.face;
  if(e.mode==='windup'){
   if(e.timer>=48){shot(l,e.x+e.face*25,F-77,e.x+e.face*500,F-77);onCue('robotAttack',e.x);e.mode='recover';e.timer=0;}
  }else if(e.mode==='recover'){if(e.timer>=65){e.mode='patrol';e.timer=0;}}
  else if(Math.abs(dx)<440&&hero.hp>0){e.mode='windup';e.timer=0;}
  else{e.timer--;Phase1.stepEnemy(e,hero,enemies,onHit,onCue,stride);}
 }
 function stepWorld(l,hero,frame,hurt,sound){
  if(l.stage===1)return;
  const beforeX=l.previousHeroX===undefined?hero.x:l.previousHeroX;
  if(hero.ground&&Math.abs(hero.y+hero.h-F)<1)for(const belt of l.belts)if(hero.x+32>belt.x&&hero.x+32<belt.x+belt.w)hero.x=clamp(hero.x+belt.speed,18,l.exit-60);
  for(const lock of l.locks)if(!l.stations[lock.station].done){if(beforeX+44<=lock.x&&hero.x+44>lock.x)hero.x=lock.x-44;else if(beforeX+20>=lock.x+14&&hero.x+20<lock.x+14)hero.x=lock.x-6;}
  for(const wall of l.barriers)if(!wall.broken){if(beforeX+44<=wall.x&&hero.x+44>wall.x)hero.x=wall.x-44;else if(beforeX+20>=wall.x+18&&hero.x+20<wall.x+18)hero.x=wall.x-2;}
  for(const p of l.presses)if(pressMode(p,frame)==='on'&&hero.x+44>p.x&&hero.x+20<p.x+p.w)hurt(p.x+p.w/2);
  for(let i=l.projectiles.length-1;i>=0;i--){const p=l.projectiles[i];p.x+=p.vx;p.y+=p.vy;p.life--;
   const hit=p.x+5>hero.x+20&&p.x-5<hero.x+44&&p.y+5>hero.y&&p.y-5<hero.y+hero.h;
   if(hit)hurt(p.x);if(hit||p.life<=0||p.x<0||p.x>W)l.projectiles.splice(i,1);
  }
  const b=l.boss;if(!b||!b.alive)return;b.hits=Math.max(0,b.hits-1);
  if(b.stun>0){b.stun--;return;}
  if(Math.abs(hero.x+32-b.x)>520||hero.hp<=0){b.mode='idle';b.timer=0;return;}
  b.timer++;
  if(b.mode==='idle'){b.mode='windup';b.timer=0;b.target=clamp(hero.x+32,b.x-210,b.x+210);sound('robotAttack',b.x);}
  else if(b.mode==='windup'){
   if((l.stage===3||l.stage===5)&&b.timer===24){shot(l,b.x,F-77,hero.x+32,F-77,4);if(b.hp<=(l.stage===5?6:4))shot(l,b.x,F-40,hero.x+32,F-40,3.2);}
   if(b.timer>=((l.stage===3||l.stage===5)&&b.hp<=6?42:58)){b.mode='attack';b.timer=0;}
  }else if(b.mode==='attack'){
   if(b.timer===6&&Math.abs(hero.x+32-b.target)<62&&hero.y+hero.h>F-52)hurt(b.target);
   if(b.timer>=18){b.mode='recover';b.timer=0;}
  }else if(b.mode==='recover'&&b.timer>=(l.stage===2?120:b.hp<=4?90:115)){b.mode='idle';b.timer=0;}
 }
 function pressMode(p,frame){const t=(frame+p.offset)%240;return t<140?'off':t<185?'warning':t<214?'on':'off';}
 function gateReady(l){return count(l)===3&&(!l.boss||!l.boss.alive)&&(!l.armory||l.armory.collected);}
 function box(g,x,y,w,h,c){g.fillStyle='#030910';g.fillRect(x-2,y-2,w+4,h+4);g.fillStyle=c;g.fillRect(x,y,w,h);g.strokeStyle='#526d7d';g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1);}
 function drawWorld(g,bg,l,frame,robotRig){
  if(l.stage===1){Phase1.drawWorld(g,bg,l,frame);return;}
  const core=l.stage===3||l.stage===5,foundry=l.stage===4,accent=foundry?'#ff9e57':l.stage===5?'#88ffb9':core?'#71e9ed':'#ffc466';
  g.fillStyle=foundry?'#25140f':core?'#081022':'#171d23';g.fillRect(0,0,W,426);
  for(let s=0;s<3;s++){
   const base=s*1280;g.save();g.globalAlpha=core?.18:.32;g.drawImage(bg,base,0,1280,426);g.restore();
   if(core){
    for(let j=0;j<9;j++){const x=base+55+j*137;box(g,x,156,92,154,'#111d35');for(let row=0;row<9;row++){g.fillStyle='#253454';g.fillRect(x+9,165+row*15,74,9);g.fillStyle=l.stations[s].done?'#57fbc0':(frame+row*19+j*23)%110<50?'#8a6be6':'#328fbb';g.fillRect(x+65,168+row*15,9,3);}}
   }else if(foundry){
    for(let j=0;j<5;j++){const x=base+65+j*240;box(g,x,170,173,135,'#46251b');g.fillStyle='#100f16';g.fillRect(x+13,185,147,93);g.fillStyle=l.stations[s].done?'#7b5235':'#ef6a2f';g.fillRect(x+18,230,137,43);for(let k=0;k<6;k++){g.fillStyle='#ffc26c';g.fillRect(x+24+k*22,229+Math.sin(frame*.06+k)*3,12,3);}g.fillStyle='#776255';g.fillRect(x+62,108,48,62);}
   }else{
    for(let j=0;j<6;j++){const x=base+80+j*205;g.strokeStyle='#516171';g.lineWidth=9;g.beginPath();g.moveTo(x,160);g.lineTo(x+45,195);g.lineTo(x+25,230);g.stroke();box(g,x-16,148,30,27,'#ae7838');g.fillStyle=accent;g.fillRect(x+17,227,18,8);}
   }
   const areas=l.stage===4?['FORNOS','RESFRIAMENTO','FORJADOR H-04']:l.stage===5?['REDE CENTRAL','ISOLAMENTO','REGENTE']:core?['ACESSO RESTRITO','CIRCUITOS','SENTINELA 404']:['ESTEIRAS','PRENSAS','BRAÇO MX-02'];
   box(g,base+125,93,310,34,core?'#151c36':'#28251d');g.fillStyle=accent;g.font='bold 14px monospace';g.fillText('0'+(s+1)+' / '+areas[s],base+138,115);
   g.font='11px monospace';g.fillStyle=l.stations[s].done?'#70ffce':'#e5b45b';g.fillText(l.stations[s].done?'CONTROLE RESTAURADO':'REATIVE O PAINEL DESTE SETOR',base+138,143);
  }
  g.fillStyle=core?'#283a53':'#545b60';g.fillRect(0,F,W,8);g.fillStyle='#090f17';g.fillRect(0,F+8,W,100);
  for(let x=0;x<W;x+=32){g.fillStyle=accent;g.fillRect(x,F+3,14,2);g.fillStyle='#152332';g.fillRect(x,F+17,23,8);}
  for(const p of l.platforms){box(g,p.x,p.y,p.w,12,core?'#22516c':'#735632');g.fillStyle=accent;g.fillRect(p.x,p.y,p.w,3);}
  for(const b of l.belts){g.fillStyle='#1a232b';g.fillRect(b.x,F-3,b.w,12);for(let j=0;j<b.w;j+=18){const x=((j+frame*b.speed*2)%b.w+b.w)%b.w;g.fillStyle='#b6babe';g.fillRect(b.x+x,F-2,8,3);}g.font='10px monospace';g.fillStyle=accent;g.fillText(b.speed>0?'ESTEIRA >>>':'<<< ESTEIRA',b.x+5,F+30);}
  for(const p of l.presses){const mode=pressMode(p,frame),y=mode==='on'?F-12:190;g.fillStyle='#5a6772';g.fillRect(p.x+p.w/2-7,100,14,y-100);box(g,p.x,y,p.w,13,'#a0713e');g.fillStyle=mode==='warning'?'#ffd45d':mode==='on'?'#ff5c50':'#5eb4ab';g.fillRect(p.x,y,p.w,4);if(mode!=='off'){g.fillStyle=mode==='warning'?'#ffbf3333':'#ed4c4544';g.fillRect(p.x,y+13,p.w,F-y-13);g.font='10px monospace';g.fillStyle='#ffe6a5';g.fillText(mode==='warning'?'PRENSA: SAIA!':'PERIGO',p.x-4,176);}}
  for(const lock of l.locks){const open=l.stations[lock.station].done;g.fillStyle=open?'#54edbd':'#ad72ef';g.fillRect(lock.x,152,14,open?10:166);g.font='10px monospace';g.fillText(open?'ISOLADO':'CIRCUITO '+(lock.station+1),lock.x-25,143);}
  for(const wall of l.barriers)if(!wall.broken){box(g,wall.x,175,18,143,'#76624e');g.fillStyle='#ffb947';for(let y=180;y<F;y+=18)g.fillRect(wall.x,y,18,5);g.font='10px monospace';g.fillText('L: MARRETA',wall.x-37,162);}
  for(const h of l.hazards){const mode=Phase1.hazardMode(h,frame),y=h.duck?F-77:F-7;g.fillStyle=mode==='on'?'#ed70f4':mode==='warning'?'#ffd16a':'#38526c';g.fillRect(h.x,y,h.w,mode==='on'?5:2);if(h.duck){g.font='10px monospace';g.fillText('S: AGACHE',h.x,y-11);}}
  for(const p of l.projectiles){g.fillStyle=core?'#ee8aff':'#ffb14c';g.fillRect(p.x-5,p.y-4,10,8);g.fillStyle='#fff3d1';g.fillRect(p.x-2,p.y-2,4,4);}
  for(const e of l.enemies)if(e.alive&&e.kind==='welder'&&e.mode==='windup'){g.strokeStyle='#ffb64f88';g.lineWidth=1;g.beginPath();g.moveTo(e.x,F-77);g.lineTo(e.x+e.face*320,F-77);g.stroke();g.font='10px monospace';g.fillStyle='#ffd677';g.fillText('DISPARO • AGACHE',e.x-50,F-103);}
  drawBoss(g,l,frame,robotRig);
  box(g,l.exit-45,190,90,126,'#172a38');g.fillStyle=l.gateOpen?'#55f2bc':'#916d39';g.fillRect(l.exit-40,195,80,6);g.font='11px monospace';g.fillText(l.gateOpen?'SAÍDA LIVRE':'SAÍDA BLOQUEADA',l.exit-55,179);
 }
 function drawBoss(g,l,frame,robotRig){
    const b=l.boss;if(!b)return;const core=l.stage>=3,v=vulnerable(l),color=!b.alive?'#50dfb0':v?'#ffd776':l.stage===4?'#ff9458':l.stage===5?'#87f6b7':core?'#bb8bf5':'#e3a14a';
  if(core&&robotRig){
   g.save();g.translate(b.x,F);g.scale(1.5,1.5);robotRig.render(g,0,0,{face:-1,phase:frame*.01,moving:false,mode:b.alive?(b.mode==='idle'?'patrol':b.mode):'dead',progress:b.alive?clamp(b.timer/(b.mode==='recover'?115:b.mode==='attack'?18:58),0,1):1,hit:b.hits>0});g.restore();
  }else{box(g,b.x-43,F-85,86,85,'#233144');g.fillStyle=color;g.fillRect(b.x-28,F-67,56,44);g.fillStyle='#101c29';g.fillRect(b.x-13,F-58,26,26);}
  g.fillStyle=b.hits?'#fff':color;g.fillRect(b.x-7,F-52,14,14);
  if(b.alive){
   if(core){g.strokeStyle=color;g.lineWidth=3;g.beginPath();g.arc(b.x,F-48,48,frame*.02,frame*.02+Math.PI*1.6);g.stroke();}
   else{const endX=b.mode==='idle'?b.x-70:b.target,endY=b.mode==='attack'?F-10:b.mode==='windup'?F-120:F-140;g.strokeStyle='#101923';g.lineWidth=22;g.beginPath();g.moveTo(b.x,F-65);g.lineTo(b.x-55,F-175);g.lineTo(endX,endY);g.stroke();g.strokeStyle=color;g.lineWidth=12;g.stroke();for(const [x,y] of [[b.x,F-65],[b.x-55,F-175],[endX,endY]]){g.fillStyle='#ccd3cb';g.fillRect(x-7,y-7,14,14);g.fillStyle='#304557';g.fillRect(x-3,y-3,6,6);}g.fillStyle='#bac7c7';g.fillRect(endX-22,endY-8,44,17);}
   if(b.mode==='windup'||b.mode==='attack'){g.fillStyle=b.mode==='windup'?'#ffbf3a77':'#ff4a4aa0';g.fillRect(b.target-60,F-4,120,6);g.strokeStyle=color;g.lineWidth=1;g.strokeRect(b.target-60,F-58,120,56);}
  }
  box(g,b.x-142,86,284,43,'#0c1522');g.font='bold 12px monospace';g.fillStyle=color;g.fillText(b.name+(b.alive?'':' • DESATIVADO'),b.x-132,102);
  if(core&&b.alive){g.font='10px monospace';g.fillStyle=color;g.fillText(l.stage===4?'BLINDAGEM: '+(b.armor||0)+' • MARRETA HIDRÁULICA':count(l)<3?'ETAPA 1 / ESCUDO':b.hp>4?'ETAPA 2 / SUPERAQUECIMENTO':'ETAPA 3 / NÚCLEO INSTÁVEL',b.x-138,159);}
  g.fillStyle='#423344';g.fillRect(b.x-130,110,260,7);g.fillStyle=color;g.fillRect(b.x-130,110,260*b.hp/b.maxHP,7);
  g.font='10px monospace';g.fillStyle='#e0d8eb';const text=!b.alive?'CONTROLE RECUPERADO':b.armor>0&&v?'BLINDAGEM • L: MARRETA':v?'NÚCLEO EXPOSTO • ATAQUE':count(l)<(l.stage===2||l.stage===4?2:3)?'REATIVE OS PAINÉIS PARA REMOVER O ESCUDO':b.mode==='recover'?'RECUPERAÇÃO':'ESQUIVE / PULE • AGUARDE ABERTURA';g.fillText(text,b.x-138,144);
 }
 global.Campaign={create,titles,count,vulnerable,damageBoss,preUpdate,stepEnemy,stepWorld,gateReady,pressMode,drawWorld};
})(typeof window!=='undefined'?window:globalThis);
