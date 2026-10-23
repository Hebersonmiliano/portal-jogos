(function(global) {
  'use strict';
  const WIDTH=3840, FLOOR=318;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function create() {
    const enemy=(id,x,min,max,elite=false)=>({id,x,px:x,home:x,min,max,dir:-1,face:-1,
      hp:elite?5:3,maxHP:elite?5:3,elite,mode:'patrol',timer:0,phase:0,previousPhase:0,
      vx:0,didHit:false,alive:true,deathTime:0});
    return {
      width:WIDTH,checkpoint:125,gateOpen:false,
      enemies:[enemy('R-04 / 01',650,560,850),enemy('R-04 / 02',1480,1270,1620),
        enemy('R-04 / 03',2010,1920,2240),enemy('R-04 / 04',2770,2600,2910),
        enemy('SUPERVISOR R-04',3290,3110,3500,true)],
      stations:[{x:980,done:false,charge:0,name:'OFICINA'},
        {x:2220,done:false,charge:0,name:'MONTAGEM'},{x:3480,done:false,charge:0,name:'CENTRAL'}],
      platforms:[{x:355,y:270,w:155},{x:1310,y:265,w:170},{x:1490,y:216,w:155},
        {x:2600,y:267,w:155},{x:2790,y:219,w:180}],
      pickups:[{x:435,y:253,type:'parts',taken:false},{x:1570,y:199,type:'energy',taken:false},
        {x:2470,y:FLOOR-16,type:'health',taken:false},{x:2880,y:202,type:'parts',taken:false}],
      hazards:[{x:1745,w:85,offset:0},{x:3000,w:70,offset:90}],
      exit:3720
    };
  }
  function setMode(e,mode){if(e.mode!==mode){e.mode=mode;e.timer=0;e.didHit=false;}}
  function stepEnemy(e,hero,enemies,onHit,onCue,stride=40) {
    e.px=e.x;e.previousPhase=e.phase;
    if(!e.alive){e.timer++;return;}
    e.timer++;
    const dx=hero.x+32-e.x,nearHeight=Math.abs(hero.y+hero.h-FLOOR)<70;
    const aggro=Math.abs(dx)<(e.elite?340:280)&&nearHeight&&hero.hp>0;
    e.vx=0;
    if(e.mode==='hurt'){if(e.timer>=13)setMode(e,aggro?'chase':'patrol');return;}
    if(e.mode==='windup'){
      if(e.timer===(e.elite?32:36)){setMode(e,'attack');onCue('robotAttack',e.x);}return;
    }
    if(e.mode==='attack'){
      if(e.timer<7)e.vx=e.face*(e.elite?1.1:0.65);
      if(e.timer===7&&!e.didHit){e.didHit=true;const target=hero.x+32-e.x;
        if(Math.sign(target||e.face)===e.face&&Math.abs(target)<(e.elite?98:88)&&nearHeight)onHit(e);}
      if(e.timer>=15)setMode(e,'recover');
    }else if(e.mode==='recover'){
      if(e.timer>=(e.elite?38:45))setMode(e,aggro?'chase':'patrol');
    }else {
      if(aggro){setMode(e,'chase');e.face=Math.sign(dx)||e.face;
        if(Math.abs(dx)<(e.elite?88:78)){setMode(e,'windup');onCue('alert',e.x);}
        else e.vx=e.face*(e.elite?0.9:0.72);
      }else {
        setMode(e,'patrol');
        if(e.x<=e.min+1)e.dir=1;if(e.x>=e.max-1)e.dir=-1;
        e.face=e.dir;e.vx=e.dir*0.42;
      }
    }
    let next=clamp(e.x+e.vx,e.min,e.max);
    for(const other of enemies){if(other===e||!other.alive)continue;
      if(Math.abs(next-other.x)<64&&Math.sign(other.x-e.x)===Math.sign(e.vx))next=e.x;}
    e.x=next;e.phase+=(e.x-e.px)/stride;
  }
  function damage(e,face) {
    if(!e.alive)return false;
    e.hp--;e.x=clamp(e.x+face*8,e.min,e.max);e.px=e.x;
    if(e.hp<=0){e.alive=false;e.mode='dead';e.timer=0;return true;}
    e.mode='hurt';e.timer=0;return false;
  }
  function landing(level,left,right,previousBottom,bottom,vy) {
    if(vy<0)return null;
    let surface=bottom>=FLOOR?FLOOR:null;
    for(const p of level.platforms){
      if(right>p.x&&left<p.x+p.w&&previousBottom<=p.y+0.75&&bottom>=p.y)
        surface=surface===null?p.y:Math.min(surface,p.y);
    }
    return surface;
  }
  function hazardMode(h,frame){const t=(frame+h.offset)%210;return t<120?'off':t<150?'warning':t<195?'on':'off';}
  function panel(g,x,y,w,h,color='#0b1925'){
    g.fillStyle='#02080e';g.fillRect(x-2,y-2,w+4,h+4);g.fillStyle=color;g.fillRect(x,y,w,h);
    g.strokeStyle='#657580';g.strokeRect(x+0.5,y+0.5,w-1,h-1);
  }
  function drawWorld(g,bg,level,frame) {
    for(let i=0;i<3;i++){
      g.drawImage(bg,i*1280,0,1280,426);
      g.fillStyle=i===1?'#07233016':i===2?'#351d0e18':'#00000000';g.fillRect(i*1280,0,1280,426);
      const label=i===0?'01 / OFICINA':i===1?'02 / MONTAGEM':'03 / CENTRAL';
      panel(g,125+i*1280,93,235,32);g.font='bold 15px monospace';g.fillStyle='#f6b83a';g.fillText(label,140+i*1280,115);
    }
    // The background's door bays are sealed service rooms; the last one is the exit.
    for(const x of [1155,2435]){panel(g,x-19,151,117,22);g.fillStyle='#88a4b4';g.font='11px monospace';g.fillText('ACESSO TÉCNICO',x-13,167);}
    for(const p of level.platforms){
      g.fillStyle='#12222f';g.fillRect(p.x,p.y,p.w,12);g.fillStyle='#71838d';g.fillRect(p.x,p.y,p.w,3);
      g.fillStyle='#b27a1f';for(let x=p.x+4;x<p.x+p.w-4;x+=20)g.fillRect(x,p.y+4,9,4);
      g.strokeStyle='#344a58';g.lineWidth=2;g.beginPath();g.moveTo(p.x+5,p.y+12);g.lineTo(p.x+5,FLOOR);
      g.moveTo(p.x+p.w-5,p.y+12);g.lineTo(p.x+p.w-5,FLOOR);g.stroke();
      g.fillStyle='#b89748';g.fillRect(p.x,p.y-2,p.w,2);
    }
    for(const h of level.hazards){
      const mode=hazardMode(h,frame);g.fillStyle='#07121b';g.fillRect(h.x,FLOOR-4,h.w,9);
      for(let i=0;i<h.w;i+=12){g.fillStyle=mode==='on'?'#39e5ff':mode==='warning'?'#ffb62a':'#465d68';g.fillRect(h.x+i+2,FLOOR-3,5,3);}
      if(mode==='on'){
        g.strokeStyle='#80f5ff';g.lineWidth=2;g.beginPath();g.moveTo(h.x,FLOOR-5);
        for(let i=0;i<=h.w;i+=7)g.lineTo(h.x+i,FLOOR-5-((i+frame*3)%17));g.stroke();
      }
    }
    const door=level.exit;
    panel(g,door-44,191,94,126,'#17232d');
    g.fillStyle=level.gateOpen?'#2bd7c5':'#c17b23';g.fillRect(door-42,189,90,5);
    g.fillStyle='#243846';const gap=level.gateOpen?37:0;
    g.fillRect(door-40-gap,201,40,111);g.fillRect(door+gap,201,40,111);
    g.fillStyle='#081017';g.fillRect(door-1-gap,208,3,91);g.fillRect(door+gap,208,3,91);
    panel(g,door-72,156,144,25);g.fillStyle=level.gateOpen?'#74ffcf':'#f6bd49';g.font='bold 13px monospace';g.fillText(level.gateOpen?'SAÍDA LIBERADA':'SAÍDA / FASE 1',door-61,174);
  }
  function drawStation(g,s,frame) {
    const y=FLOOR-66;panel(g,s.x-22,y,44,62,'#122733');
    g.fillStyle=s.done?'#2fe1aa':'#2bb9e7';g.fillRect(s.x-14,y+9,28,21);
    g.fillStyle='#08202e';g.fillRect(s.x-11,y+12,22,3);g.fillRect(s.x-11,y+19,15,2);
    g.fillStyle=s.done?'#2ff7b0':'#e4a020';g.fillRect(s.x-17,y+41,7,6);g.fillRect(s.x+9,y+41,7,6);
    g.fillStyle='#70929e';g.fillRect(s.x-11,y+39,21,2);
    if(!s.done){g.fillStyle='#071622';g.fillRect(s.x-25,y-17,50,6);g.fillStyle='#20def5';g.fillRect(s.x-24,y-16,48*s.charge/60,4);}
    g.fillStyle=s.done?'#73ffc5':'#ffd16b';g.font='11px monospace';g.fillText(s.done?'ONLINE':'SEGURE E',s.x-24,y-24);
  }
  function drawPickup(g,p,frame) {
    if(p.taken)return;const y=p.y+Math.sin(frame*0.055+p.x)*2;
    g.save();g.translate(p.x,y);g.fillStyle='#0c1620';g.fillRect(-8,-10,16,20);
    if(p.type==='fuse'){g.fillStyle='#a5d2df';g.fillRect(-5,-9,10,3);g.fillRect(-5,6,10,3);g.fillStyle='#28e0ff';g.fillRect(-4,-5,8,10);g.fillStyle='#d3fcff';g.fillRect(-1,-4,2,8);}
    else if(p.type==='health'){g.fillStyle='#e8ebe0';g.fillRect(-7,-7,14,14);g.fillStyle='#e7564f';g.fillRect(-2,-5,4,10);g.fillRect(-5,-2,10,4);}
    else if(p.type==='energy'){g.fillStyle='#35e4f6';g.fillRect(-5,-7,10,14);g.fillStyle='#f9e272';g.fillRect(-1,-5,3,5);g.fillRect(-3,0,3,5);}
    else{g.fillStyle='#ffd05a';g.fillRect(-6,-6,12,12);g.fillStyle='#766135';g.fillRect(-2,-2,4,4);}
    g.restore();
  }
  global.Phase1={WIDTH,FLOOR,create,stepEnemy,damage,landing,hazardMode,drawWorld,drawStation,drawPickup};
})(typeof window!=='undefined'?window:globalThis);
