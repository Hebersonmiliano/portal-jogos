/* Fictional maintenance tools. All combat resources and timers live in the current run. */
(function(global){
 'use strict';
 const F=318,ORDER=['rivet','arc','hammer'];
 const NAMES={rivet:'LANÇADOR DE REBITES',arc:'ARCO ELÉTRICO',hammer:'MARRETA HIDRÁULICA',emp:'PULSO ELETROMAGNÉTICO'};
 function create(stage=1){const unlocked=ORDER.slice(0,Math.max(0,Math.min(3,stage-2)));return {unlocked,selected:unlocked.at(-1)||null,ammo:stage>=3?18:0,cooldown:0,pulse:false,pulseCooldown:0};}
 function attach(l){l.armory=l.stage>1?{x:820,kind:['rivet','arc','hammer','emp'][l.stage-2],collected:false}:null;l.supplies=l.stage>1?[1200,1900,3070].map(x=>({x,taken:false})):[];l.bolts=[];l.weaponFx=[];}
 function acquire(l,a,m,holdingE,notify,sound){
  const c=l.armory;
  if(c&&!c.collected&&Math.abs(m.x+32-c.x)<48&&m.ground&&holdingE&&m.hurt<=0&&m.attack<=0&&m.dodge<=0&&m.secondary<=0){
   c.collected=true;if(c.kind==='emp')a.pulse=true;else{if(!a.unlocked.includes(c.kind))a.unlocked.push(c.kind);a.selected=c.kind;}
   if(c.kind==='rivet')a.ammo=Math.min(48,a.ammo+18);
   sound('pickup');notify(NAMES[c.kind]+' OBTIDO • '+(c.kind==='emp'?'R: pulso | 3 de energia | recarga 8 s':'L: usar | Q: trocar | J: chave sempre disponível'),360);
  }
  for(const box of l.supplies)if(!box.taken&&a.unlocked.includes('rivet')&&Math.abs(m.x+32-box.x)<30&&Math.abs(m.y+m.h-F)<28){box.taken=true;a.ammo=Math.min(48,a.ammo+8);sound('pickup');notify('REBITES +8 • Munição: '+a.ammo,100);}
 }
 function cycle(a,m,notify){if(m.secondary>0)return;if(!a.unlocked.length){notify('Encontre a bancada de ferramentas na Fase 2.',130);return;}a.selected=a.unlocked[(a.unlocked.indexOf(a.selected)+1)%a.unlocked.length];notify('SECUNDÁRIA: '+NAMES[a.selected]+' • L para usar',120);}
 function ready(m,a){return m.hp>0&&!m.dead&&m.attack<=0&&m.dodge<=0&&m.hurt<=0&&m.secondary<=0&&a.cooldown<=0;}
 function obstruction(l,x1,x2){return [...(l.barriers||[]).filter(b=>!b.broken),...(l.locks||[]).filter(b=>!l.stations[b.station].done)].filter(b=>Math.min(x1,x2)<=b.x+18&&Math.max(x1,x2)>=b.x).sort((a,b)=>Math.abs(a.x-x1)-Math.abs(b.x-x1))[0];}
 function use(l,a,m,muzzle,hitEnemy,notify,sound){
  if(!ready(m,a))return false;const kind=a.selected;
  if(!kind||!a.unlocked.includes(kind)){notify('E: recolha a ferramenta na bancada marcada.',130);return false;}
  if(kind==='rivet'&&a.ammo<=0){notify('SEM REBITES • Use J ou recolha uma caixa de munição.',120);return false;}
  if(kind!=='rivet'&&m.energy<2){notify('ENERGIA INSUFICIENTE • Use J enquanto ela recarrega.',120);return false;}
  if(kind==='hammer'&&!m.ground){notify('MARRETA • Pouse antes de preparar o golpe.',90);return false;}
  m.secondary=kind==='hammer'?48:18;m.secondaryKind=kind;m.secondaryFace=m.face;
  a.cooldown=kind==='hammer'?54:kind==='arc'?38:24;
  if(kind==='rivet'){a.ammo--;const p=muzzle(),wall=obstruction(l,m.x+32,p.x);if(wall)l.weaponFx.push({type:'impact',x:wall.x,y:p.y,life:8,total:8});else l.bolts.push({x:p.x,y:p.y,previousX:p.x,vx:m.face*9,life:55,face:m.face});l.weaponFx.push({type:'flash',x:p.x,y:p.y,life:6,total:6});sound('rivet');}
  else{m.energy-=2;m.regen=0;if(kind==='arc'){
    const p=muzzle(),targets=l.enemies.filter(e=>e.alive&&(Math.sign(e.x-p.x)||m.face)===m.face&&Math.abs(e.x-p.x)<175&&Math.abs(F-43-p.y)<62&&!obstruction(l,m.x+32,e.x)).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x));
    let x=p.x+m.face*145,y=p.y;
    if(targets.length){const e=targets[0];x=e.x;y=F-43;const hit=hitEnemy(e,1,'arc');if(hit&&e.alive)e.stun=Math.max(e.stun||0,65);}
    else if(l.boss&&l.boss.alive&&Math.sign(l.boss.x-p.x)===m.face&&Math.abs(l.boss.x-p.x)<175&&Math.abs(F-48-p.y)<62&&!obstruction(l,m.x+32,l.boss.x)){x=l.boss.x;y=F-48;hitBoss(l,m,'arc',1,175,notify,sound);l.boss.stun=Math.max(l.boss.stun||0,15);}
    const wall=obstruction(l,m.x+32,x);if(wall)x=wall.x;
    l.weaponFx.push({type:'arc',x:p.x,y:p.y,toX:x,toY:y,life:12,total:12});sound('arc');
   }else sound('hammer');}
  return true;
 }
 function hitBoss(l,m,kind,damage,range,notify,sound){
  const b=l.boss;if(!b||!b.alive||Math.abs(b.x-m.x-32)>range||Math.sign(b.x-m.x-32||m.face)!==m.face||Math.abs(m.y+m.h-F)>62)return null;
  if(!Campaign.vulnerable(l)){sound('robotHurt');notify('ESCUDO • Repare os painéis e ataque na recuperação.',100);return 'shield';}
  if(b.armor>0){if(kind!=='hammer'){notify('BLINDAGEM • Use a marreta hidráulica (Q / L).',120);return 'armor';}b.armor--;notify('BLINDAGEM ROMPIDA • Continue atacando.',110);}
  b.hp=Math.max(0,b.hp-damage);b.hits=8;
  if(b.hp<=0){b.alive=false;b.mode='dead';b.rewardPending=true;sound('explosion');notify(b.name+' DESATIVADO • Alcance a saída.',230);return 'dead';}
  sound('robotHurt');return 'hit';
 }
 function pulse(l,a,m,notify,sound){
  if(!a.pulse){notify('O módulo de pulso é obtido na Fase 5.',110);return false;}
  if(a.pulseCooldown>0){notify('PULSO RECARREGANDO • '+Math.ceil(a.pulseCooldown/60)+' s',90);return false;}
  if(m.dead||m.hp<=0||m.hurt>0||m.dodge>0||m.energy<3){notify('O pulso precisa de 3 de energia e Maya disponível.',110);return false;}
  m.energy-=3;m.regen=0;a.pulseCooldown=480;
  for(const e of l.enemies)if(e.alive&&Math.hypot(e.x-m.x-32,F-45-(m.y+m.h-40))<190)e.stun=Math.max(e.stun||0,120);
  if(l.boss&&l.boss.alive&&Math.abs(l.boss.x-m.x-32)<190)l.boss.stun=Math.max(l.boss.stun||0,30);
  l.projectiles=l.projectiles.filter(p=>Math.hypot(p.x-m.x-32,p.y-(m.y+m.h-40))>190);
  l.weaponFx.push({type:'pulse',x:m.x+32,y:m.y+m.h-40,life:26,total:26});sound('emp');notify('PULSO • Robôs próximos interrompidos. Chefes resistem por mais tempo.',130);return true;
 }
 function update(l,a,m,hitEnemy,notify,sound){
  a.cooldown=Math.max(0,a.cooldown-1);a.pulseCooldown=Math.max(0,a.pulseCooldown-1);
  if(m.secondary>0){m.secondary--;if(m.secondaryKind==='hammer'&&m.secondary===20){
   for(const e of l.enemies)if(e.alive&&Math.sign(e.x-m.x-32||m.face)===m.face&&Math.abs(e.x-m.x-32)<110&&Math.abs(m.y+m.h-F)<45){hitEnemy(e,2,'hammer');if(e.alive)e.stun=Math.max(e.stun||0,20);}
   hitBoss(l,m,'hammer',2,110,notify,sound);
   for(const barrier of l.barriers||[])if(!barrier.broken&&Math.sign(barrier.x-m.x-32||m.face)===m.face&&Math.abs(barrier.x-m.x-32)<110){barrier.broken=true;sound('explosion');notify('OBSTÁCULO REMOVIDO • Passagem liberada.',140);}
   l.weaponFx.push({type:'impact',x:m.x+32+m.face*65,y:m.y+m.h-10,life:15,total:15});
  }}
  for(let i=l.bolts.length-1;i>=0;i--){const p=l.bolts[i];p.previousX=p.x;p.x+=p.vx;p.life--;
   let blocked=false;
   for(const wall of [...(l.barriers||[]).filter(b=>!b.broken),...(l.locks||[]).filter(b=>!l.stations[b.station].done)])if(Math.min(p.previousX,p.x)<=wall.x+14&&Math.max(p.previousX,p.x)>=wall.x&&p.y>150)blocked=true;
   if(!blocked){const e=l.enemies.find(e=>e.alive&&Math.abs(e.x-p.x)<30&&p.y>F-88&&p.y<F);if(e){hitEnemy(e,1,'rivet',p.face);blocked=true;}
    else if(l.boss&&l.boss.alive&&Math.abs(l.boss.x-p.x)<43&&p.y>F-100&&p.y<F){const owner={x:p.x-32,face:p.face,y:F-91,h:91};hitBoss(l,owner,'rivet',1,60,notify,sound);blocked=true;}}
   if(blocked){l.weaponFx.push({type:'impact',x:p.x,y:p.y,life:8,total:8});}if(blocked||p.life<=0||p.x<0||p.x>3840)l.bolts.splice(i,1);
  }
  for(let i=l.weaponFx.length-1;i>=0;i--)if(--l.weaponFx[i].life<=0)l.weaponFx.splice(i,1);
 }
 function clear(l){l.bolts.length=0;l.weaponFx.length=0;}
 function draw(g,l,frame){
  const c=l.armory;if(c&&!c.collected){g.fillStyle='#102434';g.fillRect(c.x-30,F-48,60,46);g.strokeStyle='#ffbf45';g.lineWidth=1;g.strokeRect(c.x-30.5,F-48.5,61,47);g.fillStyle='#ffbd46';g.fillRect(c.x-19,F-33,38,13);g.fillStyle='#2ae1f0';g.fillRect(c.x-4,F-40,8,26);g.font='bold 10px monospace';g.fillStyle='#ffe2a7';g.fillText('E: '+NAMES[c.kind],c.x-65,F-68);}
  for(const box of l.supplies)if(!box.taken){g.fillStyle='#1d3540';g.fillRect(box.x-9,F-19,18,18);g.fillStyle='#e6bf57';g.fillRect(box.x-6,F-15,3,10);g.fillRect(box.x+3,F-15,3,10);}
  for(const p of l.bolts){g.fillStyle='#f5c95e';g.fillRect(p.x-7,p.y-2,14,4);g.fillStyle='#dbf9ff';g.fillRect(p.x+p.face*5-2,p.y-3,4,6);}
  for(const e of l.enemies)if(e.alive&&e.stun>0){g.font='10px monospace';g.fillStyle='#87efff';g.fillText('INTERROMPIDO',e.x-36,F-100);}
  for(const f of l.weaponFx){g.save();g.globalAlpha=f.life/f.total;
   if(f.type==='arc'){g.strokeStyle='#8ef5ff';g.lineWidth=2;g.beginPath();g.moveTo(f.x,f.y);for(let i=1;i<=8;i++){const t=i/8;g.lineTo(f.x+(f.toX-f.x)*t,f.y+(f.toY-f.y)*t+(i===8?0:(i%2?5:-5)));}g.stroke();}
   else if(f.type==='pulse'){g.strokeStyle='#75f7e1';g.lineWidth=3;g.beginPath();g.arc(f.x,f.y,190*(1-f.life/f.total),0,Math.PI*2);g.stroke();}
   else{g.fillStyle=f.type==='flash'?'#fff0a2':'#ffbf55';for(let i=0;i<6;i++){const r=(1-f.life/f.total)*14;g.fillRect(f.x+Math.cos(i)*r,f.y+Math.sin(i)*r,3,3);}}
   g.restore();
  }
 }
 function status(a){return (a.selected?NAMES[a.selected]:'SEM SECUNDÁRIA')+' | REBITES '+a.ammo+' | '+(a.pulse?'PULSO '+(a.pulseCooldown?Math.ceil(a.pulseCooldown/60)+'s':'PRONTO'):'PULSO: FASE 5');}
 function hud(g,a){g.fillStyle='#06141deb';g.fillRect(12,340,850,33);g.fillStyle='#ffce70';g.font='bold 11px monospace';g.fillText('J: CHAVE ∞  |  L: USAR SECUNDÁRIA  |  Q: TROCAR  |  R: PULSO',23,353);g.fillStyle='#a9e3e8';g.font='10px monospace';g.fillText(status(a),23,367);}
 global.Weapons={ORDER,NAMES,create,attach,acquire,cycle,use,pulse,update,clear,draw,hud,status,hitBoss};
})(typeof window!=='undefined'?window:globalThis);
