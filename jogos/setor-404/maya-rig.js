/* One fixed drawing, articulated at the hips, knees, ankles and shoulders.
 * Coordinates are in game pixels. No per-frame fit-to-bounds scaling. */
(function (global) {
  'use strict';
  const TAU = Math.PI * 2;
  const STRIDE = 64;
  const SCALE = 0.215;
  const ROOT = { x: 132, y: 414 };
  const fract = n => ((n % 1) + 1) % 1;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const smooth = t => t * t * (3 - 2 * t);

  function dodge(t) {
    t=clamp(t,0,1);
    const keys=[[0,0.6],[0.12,2.2],[0.30,4.7],[0.58,4.4],[0.80,2.1],[1,0.55]];
    let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;
    const a=keys[i],b=keys[i+1];
    return {speed:lerp(a[1],b[1],smooth((t-a[0])/(b[0]-a[0]))),
      compression:smooth(clamp(t/0.14,0,1))*(1-smooth(clamp((t-0.72)/0.28,0,1)))};
  }

  function gait(crouch = 0, run = 0) {
    const c=clamp(crouch,0,1),r=clamp(run,0,1)*(1-c);
    return {stride:STRIDE-24*c+20*r,duty:0.5+0.1*c-0.1*r,lift:8-4*c+5*r};
  }
  function foot(phase, blend = 1, config = gait()) {
    const p=fract(phase),{stride,duty,lift}=config,a=stride*duty/2;
    if(p<duty)return{x:a-stride*p,lift:0,stance:true};
    const u=(p-duty)/(1-duty),u2=u*u,u3=u2*u,tangent=-stride*(1-duty);
    const x=(2*u3-3*u2+1)*-a+(u3-2*u2+u)*tangent+(-2*u3+3*u2)*a+(u3-u2)*tangent;
    return{x,lift:lift*Math.sin(Math.PI*u)**2*blend,stance:false};
  }
  function advance(phase,dx,previous,next) {
    // Preserve the supporting foot when changing between walking, running and crouching.
    let adjusted=phase;
    const first=foot(phase,1,previous),second=foot(phase+0.5,1,previous);
    const offset=first.stance?0:second.stance?0.5:null;
    if(offset!==null){
      const support=offset===0?first:second;
      const local=clamp(next.duty/2-support.x/next.stride,0.00001,next.duty-0.00001);
      adjusted=Math.floor(phase+offset)+local-offset;
    }
    return adjusted+dx/next.stride;
  }

  function knee(hip, ankle, upper = 18, lower = 19) {
    const dx = ankle.x - hip.x, dy = ankle.y - hip.y;
    const distance = Math.max(0.001, Math.hypot(dx, dy));
    const d = clamp(distance, Math.abs(upper - lower) + 0.001, upper + lower - 0.001);
    const along = (upper * upper - lower * lower + d * d) / (2 * d);
    const height = Math.sqrt(Math.max(0, upper * upper - along * along));
    return { x: hip.x + dx / distance * along + dy / distance * height,
      y: hip.y + dy / distance * along - dx / distance * height };
  }

  function pose(state={}) {
    const phase=fract(state.phase||0),blend=clamp(state.blend||0,0,1),face=state.face||1;
    const c=clamp(state.crouch||0,0,1),run=clamp(state.run||0,0,1)*(1-c),config=gait(c,run);
    const feet=[foot(phase,blend,config),foot(phase+0.5,blend,config)];
    const support=feet.find(f=>f.stance);
    feet.forEach((f,i)=>{if(!f.stance&&support)f.x=lerp(support.x+(i===0?-6:6),f.x,blend);});
    let flight=0;
    if(run>0&&!feet[0].stance&&!feet[1].stance){
      const p=phase<0.5?(phase-config.duty)/(0.5-config.duty):(phase-0.5-config.duty)/(0.5-config.duty);
      flight=Math.sin(Math.PI*clamp(p,0,1))**2*3*run;
    }
    const root={x:0,y:lerp(-45,-41,blend)-4*Math.sin(phase*TAU)**2*blend+3*run+24*c-flight};
    const ankles=feet.map(f=>({x:f.x*face,y:-8.8-f.lift-flight,angle:0}));
    const sway=Math.cos(phase*TAU)*(0.52+0.45*run)*blend*face*(1-0.5*c);
    let torso=0.22*run+0.52*c,head=-0.12*run-0.28*c;
    const arms=[{upper:-sway,lower:-sway+0.22},{upper:sway,lower:sway+0.35}];
    let airborne=!state.ground,attacking=state.attack>0,weapon=0;
    const vy=Number(state.vy)||0;
    if(airborne){
      root.y=-43;torso=0.08+run*0.12;head=-0.08;
      const reach=state.jumpFlight===false&&vy>=0?Math.max(0.8,clamp(vy/8,0,1)):clamp((vy+0.6)/8.6,0,1);
      ankles[0]={x:lerp(10,5,reach),y:lerp(-22,-8.8,reach),angle:lerp(0.25,-0.1,reach)};
      ankles[1]={x:lerp(-11,-6,reach),y:lerp(-25,-12,reach),angle:lerp(-0.25,-0.1,reach)};
      arms[0]={upper:lerp(-0.95,0.45,reach),lower:lerp(-1.2,0.65,reach)};
      arms[1]={upper:lerp(0.8,-0.45,reach),lower:lerp(0.35,-0.2,reach)};
      if(state.takeoff>0){const t=1-state.takeoff/5;root.y+=2*(1-t);ankles[0].y=lerp(-8.8,ankles[0].y,t);ankles[1].y=lerp(-8.8,ankles[1].y,t);}
    }
    if(state.landing>0&&state.ground){const compression=Math.sin(Math.PI*(1-state.landing/10))*(state.landingStrength||0.7);root.y+=6*compression;torso+=0.16*compression;}
    if(state.dodge>0&&!state.dead){
      // A low evasive step: load the rear leg, drive, pass the knee, then plant and rise.
      // Each key specifies ankle targets; knees are solved with the same fixed-length bones.
      const t=clamp(state.dodgeProgress||0,0,1),entry=state.dodgeEntry;
      const start=entry||{root:{...root},ankles:ankles.map(a=>({...a})),arms:arms.map(a=>({...a})),torso,head};
      const frames=[
        {t:0,x:start.root.x,y:start.root.y,body:start.torso,head:start.head,
          feet:start.ankles.map(a=>[a.x,a.y,a.angle||0]),arms:start.arms.map(a=>[a.upper,a.lower])},
        {t:0.14,x:-3,y:-29,body:0.48,head:-0.28,feet:[[11,-8.8,0],[-14,-8.8,0]],arms:[[-0.7,-1.25],[0.9,0.5]]},
        {t:0.32,x:2,y:-26,body:0.86,head:-0.43,feet:[[4,-19,0.25],[-23,-11,-0.24]],arms:[[-1.05,-1.6],[1.1,0.6]]},
        {t:0.52,x:3,y:-25,body:0.93,head:-0.46,feet:[[-12,-19,-0.15],[7,-16,0.24]],arms:[[0.1,-1.3],[-0.65,-1.15]]},
        {t:0.73,x:0,y:-29,body:0.62,head:-0.32,feet:[[-16,-9.5,-0.08],[17,-8.8,0]],arms:[[0.8,0.25],[-0.8,-0.6]]},
        {t:1,x:root.x,y:root.y,body:torso,head,feet:ankles.map(a=>[a.x,a.y,a.angle||0]),arms:arms.map(a=>[a.upper,a.lower])}
      ];
      let i=0;while(i<frames.length-2&&t>frames[i+1].t)i++;
      const a=frames[i],b=frames[i+1],u=smooth(clamp((t-a.t)/(b.t-a.t),0,1));
      root.x=lerp(a.x,b.x,u);root.y=lerp(a.y,b.y,u);torso=lerp(a.body,b.body,u);head=lerp(a.head,b.head,u);
      for(let j=0;j<2;j++){
        ankles[j]={x:lerp(a.feet[j][0],b.feet[j][0],u),y:lerp(a.feet[j][1],b.feet[j][1],u),angle:lerp(a.feet[j][2],b.feet[j][2],u)};
        arms[j]={upper:lerp(a.arms[j][0],b.arms[j][0],u),lower:lerp(a.arms[j][1],b.arms[j][1],u)};
      }
      if(airborne){ankles[0].y-=4*dodge(t).compression;ankles[1].y-=4*dodge(t).compression;}
    }
    const progress=1-(state.attack||0)/30;
    if(attacking){
      if(progress<0.25){const t=smooth(progress/0.25);arms[0]={upper:lerp(0,-2.15,t),lower:lerp(0.22,-1.8,t)};weapon=lerp(0,-2.5,t);}
      else if(progress<0.58){const t=smooth((progress-0.25)/0.33);arms[0]={upper:lerp(-2.15,1.35,t),lower:lerp(-1.8,1.45,t)};weapon=lerp(-2.5,0.35,t);}
      else{const t=smooth((progress-0.58)/0.42);arms[0]={upper:lerp(1.35,0,t),lower:lerp(1.45,0.22,t)};weapon=lerp(0.35,0.95,t);}
    }
    if(state.dead){
      const t=clamp(state.deathProgress||0,0,1);
      const frames=[
        {t:0,y:root.y,x:0,body:torso,head,near:arms[0].upper,fore:arms[0].lower,far:arms[1].upper},
        {t:0.18,y:Math.max(-35,Math.min(-23,root.y+5)),x:-2,body:-0.22,head:0.18,near:-1.2,fore:-0.8,far:0.8},
        {t:0.43,y:-19,x:-3,body:0.3,head:-0.1,near:0.8,fore:1.15,far:1},
        {t:0.74,y:-15,x:-6,body:1.05,head:-0.25,near:1.3,fore:0.6,far:1.5},
        {t:1,y:-15,x:-6,body:1.35,head:-0.25,near:1.7,fore:0.4,far:1.8}
      ];
      let index=0;while(index<frames.length-2&&t>frames[index+1].t)index++;
      const a=frames[index],b=frames[index+1],u=smooth(clamp((t-a.t)/(b.t-a.t),0,1));
      root.x=lerp(a.x,b.x,u);root.y=lerp(a.y,b.y,u);torso=lerp(a.body,b.body,u);head=lerp(a.head,b.head,u);
      arms[0]={upper:lerp(a.near,b.near,u),lower:lerp(a.fore,b.fore,u)};
      arms[1]={upper:lerp(a.far,b.far,u),lower:lerp(0.5,1.2,t)};
      const fold=smooth(clamp(t/0.43,0,1));
      ankles[0]={x:lerp(ankles[0].x,8,fold),y:lerp(ankles[0].y,-8.8,fold),angle:-0.12*t};
      ankles[1]={x:lerp(ankles[1].x,1,fold),y:lerp(ankles[1].y,-8.8,fold),angle:0.1*t};
      attacking=false;airborne=false;
    }
    // Keep fixed bone lengths even when stopped at an extreme contact pose.
    ankles.forEach((a,i)=>{const hipX=root.x+(i===1?1:0),dx=a.x-hipX;
      const maxVertical=Math.sqrt(Math.max(1,36.6**2-Math.min(36,Math.abs(dx))**2));
      root.y=Math.max(root.y,a.y-maxVertical-(i===1?1:0));});
    return{root,ankles,arms,torso,head,attacking,weapon,attackProgress:progress,dead:!!state.dead,deathProgress:state.deathProgress||0};
  }

  function create(image, makeCanvas) {
    makeCanvas = makeCanvas || ((w, h) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
    });
    function part(points, a, b) {
      const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
      const x = Math.floor(Math.min(...xs)), y = Math.floor(Math.min(...ys));
      const w = Math.ceil(Math.max(...xs)) - x + 2, h = Math.ceil(Math.max(...ys)) - y + 2;
      const c = makeCanvas(w, h), g = c.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.beginPath(); points.forEach((p, i) => i ? g.lineTo(p[0] - x, p[1] - y) : g.moveTo(p[0] - x, p[1] - y));
      g.closePath(); g.clip(); g.drawImage(image, -x, -y);
      return { image: c, x, y, a, b };
    }
    const head = part([[0,150],[242,150],[242,287],[194,298],[162,310],[120,310],[84,302],[0,302]]);
    const body = part([[114,296],[148,298],[174,315],[180,359],[166,372],[166,410],[141,432],[113,440],[101,419],[109,391],[124,373],[132,352],[108,349],[96,328]]);
    const pouch = part([[84,383],[114,380],[137,393],[133,428],[116,445],[78,438],[73,417]]);
    const tool = part([[13,353],[103,296],[130,299],[144,314],[51,387],[24,388],[12,373]]);
    const thigh = part([[115,400],[151,402],[181,432],[199,451],[202,479],[175,494],[155,469],[123,452],[115,430]], [132,414], [182,478]);
    const shin = part([[169,473],[204,474],[215,506],[224,554],[212,567],[190,562],[178,537],[168,507]], [182,478], [201,558]);
    const boot = part([[190,545],[220,545],[225,557],[248,557],[265,568],[268,589],[251,599],[213,605],[184,599],[183,570]], [201,558]);
    const upperArm = part([[106,311],[134,310],[152,331],[142,350],[121,372],[105,378],[87,366],[90,344]], [123,330], [109,366]);
    const forearm = part([[90,354],[120,354],[134,377],[130,405],[110,418],[83,404],[81,378]], [109,366], [108,399]);
    const pixels = makeCanvas(192, 160), g = pixels.getContext('2d');
    g.imageSmoothingEnabled = false;

    function fixed(p, rootX, rootY, bob = 0) {
      g.drawImage(p.image, rootX + (p.x - ROOT.x) * SCALE,
        rootY + (p.y - ROOT.y) * SCALE + bob, p.image.width * SCALE, p.image.height * SCALE);
    }
    function bone(p, a, b) {
      const sourceAngle = Math.atan2(p.b[1] - p.a[1], p.b[0] - p.a[0]);
      const sourceLength = Math.hypot(p.b[0] - p.a[0], p.b[1] - p.a[1]);
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      g.save(); g.translate(a.x, a.y);
      g.rotate(Math.atan2(b.y - a.y, b.x - a.x) - sourceAngle);
      g.scale(length / sourceLength, length / sourceLength);
      g.drawImage(p.image, p.x - p.a[0], p.y - p.a[1]); g.restore();
    }
    function leg(ankle, hip) {
      const k = knee(hip, ankle);
      bone(thigh, hip, k); bone(shin, k, ankle);
      g.save();g.translate(ankle.x,ankle.y);g.rotate(ankle.angle||0);
      g.drawImage(boot.image,(boot.x-boot.a[0])*SCALE,(boot.y-boot.a[1])*SCALE,boot.image.width*SCALE,boot.image.height*SCALE);g.restore();
      return { hip, knee: k, ankle };
    }
    function arm(shoulder, angle, foreAngle) {
      const elbow = { x: shoulder.x + Math.sin(angle) * 8.3, y: shoulder.y + Math.cos(angle) * 8.3 };
      const hand = { x: elbow.x + Math.sin(foreAngle) * 7.6, y: elbow.y + Math.cos(foreAngle) * 7.6 };
      bone(upperArm, shoulder, elbow); bone(forearm, elbow, hand); return hand;
    }
    function wrench(hand, angle) {
      g.save(); g.translate(hand.x, hand.y); g.rotate(angle);
      g.fillStyle = '#14212b'; g.fillRect(-3, -4, 31, 8);
      g.fillStyle = '#849aa6'; g.fillRect(-2, -2, 28, 4);
      g.fillStyle = '#d3e1e6'; g.fillRect(1, -2, 24, 1);
      g.fillStyle = '#13ccec'; g.fillRect(8, -1, 9, 2);
      g.fillStyle = '#e7a122'; g.fillRect(0, -3, 4, 6);
      const jaw = [[23,-8],[34,-8],[40,-3],[33,-3],[31,0],[33,4],[40,4],[35,9],[23,9],[20,5],[20,-4]];
      g.fillStyle = '#15232e'; g.beginPath(); jaw.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fill();
      g.fillStyle = '#aebfc5';g.fillRect(24,-6,8,4);g.fillRect(23,-3,6,8);g.fillRect(25,4,8,3);
      g.fillStyle = '#f3b02c';g.fillRect(22,-3,2,8);g.restore();
    }

    function render(ctx,centerX,ground,state={}) {
      const p=pose(state),face=state.face||1,root=p.root;
      g.clearRect(0,0,192,160);g.save();g.translate(96,144);g.scale(face,1);
      if(state.ground){g.beginPath();g.rect(-96,-144,192,145);g.clip();}
      const rotated=(x,y)=>({x:root.x+x*Math.cos(p.torso)-y*Math.sin(p.torso),y:root.y+x*Math.sin(p.torso)+y*Math.cos(p.torso)});
      const nearShoulder=rotated(-2,-18),farShoulder=rotated(1,-18);
      g.globalAlpha=0.82;
      arm(farShoulder,p.arms[1].upper+p.torso,p.arms[1].lower+p.torso);
      leg(p.ankles[1],{x:root.x+1,y:root.y+1});g.globalAlpha=1;
      leg(p.ankles[0],root);
      g.save();g.translate(root.x,root.y);g.rotate(p.torso);
      if(!p.attacking&&!p.dead)fixed(tool,0,0);
      fixed(body,0,0);fixed(pouch,0,0);
      g.save();g.translate(2.4,-24.7);g.rotate(p.head);g.translate(-2.4,24.7);fixed(head,0,0);g.restore();g.restore();
      const hand=arm(nearShoulder,p.arms[0].upper+p.torso,p.arms[0].lower+p.torso);
      if(p.attacking){
        if(p.attackProgress>0.31&&p.attackProgress<0.65){g.strokeStyle='#ffe287';g.lineWidth=2;g.beginPath();g.arc(nearShoulder.x,nearShoulder.y,38,-1.9+p.torso,0.6+p.torso);g.stroke();}
        wrench(hand,p.weapon+p.torso);
      }
      if(p.dead&&p.deathProgress>0.2){const t=smooth(clamp((p.deathProgress-0.2)/0.55,0,1));wrench({x:lerp(hand.x,37,t),y:lerp(hand.y,-8,t)},lerp(1.5,0,t));}
      g.restore();
      if(state.tint){g.save();g.globalCompositeOperation='source-atop';g.fillStyle=state.tint;g.fillRect(0,0,192,160);g.restore();}
      ctx.save();ctx.imageSmoothingEnabled=false;
      ctx.drawImage(pixels,Math.round(centerX)-96,Math.round(ground)-144);ctx.restore();
    }
    return { render };
  }
  global.MayaRig = { create, foot, knee, gait, advance, pose, dodge, STRIDE };
})(typeof window !== 'undefined' ? window : globalThis);
