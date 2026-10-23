/* R-04: one fixed maintenance-robot drawing, articulated for deterministic gait. */
(function (global) {
  'use strict';
  const STRIDE=28, SCALE=0.48, BASE=118, ROOT={x:143,y:111};
  const TAU=Math.PI*2,fract=n=>((n%1)+1)%1;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const ease=t=>t*t*(3-2*t);
  function foot(phase){
    const p=fract(phase),a=STRIDE/4;
    if(p<0.5)return{x:a-STRIDE*p,lift:0,stance:true};
    const u=(p-0.5)*2;
    return{x:-a-2*a*u+12*a*u*u-8*a*u*u*u,lift:5.5*Math.sin(Math.PI*u)**2,stance:false};
  }
  function knee(hip,ankle){
    const upper=10.5,lower=11,dx=ankle.x-hip.x,dy=ankle.y-hip.y;
    const distance=Math.max(0.001,Math.hypot(dx,dy)),d=clamp(distance,0.501,21.499);
    const a=(upper*upper-lower*lower+d*d)/(2*d),h=Math.sqrt(Math.max(0,upper*upper-a*a));
    return{x:hip.x+dx/distance*a-dy/distance*h,y:hip.y+dy/distance*a+dx/distance*h};
  }
  function create(source,makeCanvas){
    makeCanvas=makeCanvas||((w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;});
    function part(points,a,b){
      const x=Math.floor(Math.min(...points.map(p=>p[0]))),y=Math.floor(Math.min(...points.map(p=>p[1])));
      const w=Math.ceil(Math.max(...points.map(p=>p[0])))-x+2,h=Math.ceil(Math.max(...points.map(p=>p[1])))-y+2;
      const c=makeCanvas(w,h),g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0]-x,p[1]-y):g.moveTo(p[0]-x,p[1]-y));g.closePath();g.clip();g.drawImage(source,-x,-y);
      return{image:c,x,y,a,b};
    }
    const head=part([[98,43],[109,33],[136,26],[138,18],[163,18],[166,30],[175,29],[175,11],[182,11],[182,40],[190,44],[193,65],[181,79],[137,80],[123,76],[101,72]]);
    const body=part([[126,75],[150,74],[171,73],[183,91],[178,110],[170,121],[151,120],[134,113],[129,105],[131,91],[119,84]]);
    const cable=part([[175,43],[190,46],[200,57],[211,74],[210,82],[200,83],[195,67],[185,58],[175,57]]);
    const sawUpper=part([[124,77],[136,83],[131,101],[118,113],[103,111],[104,95],[113,83]],[128,84],[112,101]);
    const sawFore=part([[105,91],[121,98],[119,115],[105,121],[94,116],[92,104]],[112,101],[91,113]);
    const saw=part([[74,89],[98,88],[116,101],[117,122],[107,137],[86,143],[69,130],[64,111]],[91,115]);
    const clampUpper=part([[161,51],[176,49],[191,58],[199,74],[197,84],[200,91],[190,103],[175,95],[167,84],[157,78]],[176,68],[191,94]);
    const clampFore=part([[182,87],[203,86],[215,97],[215,111],[201,123],[184,128],[173,124],[177,115],[191,110],[196,104],[187,101],[177,109],[170,110]],[191,94],[184,117]);
    const thigh=part([[125,111],[143,109],[153,120],[151,134],[139,139],[128,133],[123,122]],[134,116],[140,133]);
    const shin=part([[129,128],[148,127],[154,140],[149,150],[132,150],[126,141]],[140,133],[140,146]);
    const boot=part([[129,134],[147,134],[154,144],[158,154],[117,154],[114,149],[120,142]],[140,146]);
    const pixels=makeCanvas(128,128),g=pixels.getContext('2d');g.imageSmoothingEnabled=false;
    function fixed(p,root){g.drawImage(p.image,root.x+(p.x-ROOT.x)*SCALE,root.y+(p.y-ROOT.y)*SCALE,p.image.width*SCALE,p.image.height*SCALE);}
    function bone(p,a,b){
      const sourceAngle=Math.atan2(p.b[1]-p.a[1],p.b[0]-p.a[0]),len=Math.hypot(p.b[0]-p.a[0],p.b[1]-p.a[1]);
      g.save();g.translate(a.x,a.y);g.rotate(Math.atan2(b.y-a.y,b.x-a.x)-sourceAngle);const ratio=Math.hypot(b.x-a.x,b.y-a.y)/len;g.scale(ratio,ratio);g.drawImage(p.image,p.x-p.a[0],p.y-p.a[1]);g.restore();
    }
    function leg(f,hip,orientation){
      const ankle={x:64+f.x*orientation,y:BASE-4.4-f.lift},k=knee(hip,ankle);
      bone(thigh,hip,k);bone(shin,k,ankle);g.drawImage(boot.image,ankle.x+(boot.x-140)*SCALE,ankle.y+(boot.y-146)*SCALE,boot.image.width*SCALE,boot.image.height*SCALE);
    }
    function circularSaw(center,angle,hot){
      g.save();g.translate(center.x,center.y);g.rotate(angle);
      g.drawImage(saw.image,(saw.x-91)*SCALE,(saw.y-115)*SCALE,saw.image.width*SCALE,saw.image.height*SCALE);
      if(hot){g.strokeStyle='#ffc344';g.lineWidth=1.3;g.beginPath();g.arc(0,0,12,-1.6,1.5);g.stroke();}
      g.restore();
    }
    function render(ctx,centerX,groundY,state={}){
      const mode=state.mode||'patrol',phase=fract(state.phase||0),p=clamp(state.progress||0,0,1),face=state.face===-1?-1:1;
      // Source looks left. Mirroring is separate from world-space foot targets.
      const orientation=-face,moving=(mode==='patrol'||mode==='chase')&&state.moving!==false;
      const f0=foot(phase),f1=foot(phase+0.5),support=f0.stance?f0:f1;
      if(!moving){if(!f0.stance){f0.x=support.x-4;f0.lift=0;}if(!f1.stance){f1.x=support.x+4;f1.lift=0;}}
      const bob=moving?-1.6*Math.sin(phase*TAU)**2:0;
      const root={x:64,y:BASE-23+bob};
      g.clearRect(0,0,128,128);g.save();g.translate(64,0);g.scale(orientation,1);g.translate(-64,0);
      if(mode==='dead'){
        // A short collapse keeps the base on the floor; main controls fade/removal.
        g.beginPath();g.rect(0,0,128,BASE+1);g.clip();
        g.translate(64,BASE-8);g.rotate(-ease(p)*1.25);g.translate(-64,-(BASE-8));
      }
      if(state.hit||mode==='hurt')g.globalAlpha=0.7;
      g.save();g.globalAlpha*=0.82;leg(f1,{x:root.x+2,y:root.y+1},orientation);g.restore();
      leg(f0,{x:root.x-1,y:root.y},orientation);
      fixed(body,root);fixed(cable,root);fixed(head,root);
      const rearShoulder={x:root.x+(176-ROOT.x)*SCALE,y:root.y+(68-ROOT.y)*SCALE};
      const armSway=moving?Math.sin(phase*TAU)*1.2:0;
      const rearElbow={x:rearShoulder.x+7+armSway,y:rearShoulder.y+12};
      const claw={x:rearElbow.x-4,y:rearElbow.y+10};
      bone(clampUpper,rearShoulder,rearElbow);bone(clampFore,rearElbow,claw);
      const shoulder={x:root.x+(128-ROOT.x)*SCALE,y:root.y+(84-ROOT.y)*SCALE};
      let angle=2.4,foreAngle=2.5;
      if(mode==='windup'){angle=lerp(2.4,3.9,ease(p));foreAngle=lerp(2.5,4.0,ease(p));}
      if(mode==='attack'){angle=lerp(3.9,3.15,ease(p));foreAngle=lerp(4.0,3.0,ease(p));}
      if(mode==='recover'){angle=lerp(3.15,2.4,ease(p));foreAngle=lerp(3.0,2.5,ease(p));}
      const elbow={x:shoulder.x+Math.cos(angle)*11,y:shoulder.y+Math.sin(angle)*11};
      const disc={x:elbow.x+Math.cos(foreAngle)*11,y:elbow.y+Math.sin(foreAngle)*11};
      bone(sawUpper,shoulder,elbow);bone(sawFore,elbow,disc);
      circularSaw(disc,(moving?phase*TAU*3:0)+(mode==='attack'?p*TAU*3:mode==='windup'?p*TAU:0),mode==='attack');
      const sensor={x:root.x+(110-ROOT.x)*SCALE,y:root.y+(55-ROOT.y)*SCALE};
      if(mode==='windup'||mode==='attack'||mode==='chase'){
        g.fillStyle=mode==='attack'?'#fff0bd':'#ff443a';g.beginPath();g.arc(sensor.x,sensor.y,2.2,0,TAU);g.fill();
      }
      if(mode==='windup'){
        g.fillStyle='#ffd563';g.fillRect(49,root.y-48,3,6);g.fillRect(49,root.y-40,3,2);
        g.strokeStyle='#ffae29';g.lineWidth=1;g.beginPath();g.moveTo(43,root.y-46);g.lineTo(39,root.y-50);g.moveTo(57,root.y-46);g.lineTo(61,root.y-50);g.stroke();
      }
      g.restore();ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(pixels,Math.round(centerX)-64,Math.round(groundY)-BASE);ctx.restore();
    }
    return{render};
  }
  global.R04Rig={create,foot,STRIDE};
})(typeof window!=='undefined'?window:globalThis);
