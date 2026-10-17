// ===================== ABERTURA =====================
// História contada em cenas desenhadas no canvas. Cada cena é só dados:
// texto, cores do céu (topo e horizonte), altura e cor do sol, e o tipo de cenário.
// Qualquer tecla ou clique pula para o título; no título, abre o menu.
const INTRO=[
{txt:'Por trezentos anos, o sol nunca se pôs sobre o reino de Valdren.',ceu:['#3f86c8','#f7dc96'],sol:250,cor:'#fff3c4',cena:'reino'},
{txt:'Até a noite em que a Coroa da Aurora foi roubada… e o sol parou no horizonte.',ceu:['#2a1f4a','#e0834f'],sol:470,cor:'#ffb86b',cena:'roubo'},
{txt:'Num crepúsculo sem fim, as colheitas morrem e os salteadores de Garra saqueiam as estradas.',ceu:['#1a1030','#b0402a'],sol:555,cor:'#ff7a4a',cena:'saque'},
{txt:'Da última vila de pé, partem três heróis. Ninguém espera que voltem.',ceu:['#211838','#d0704a'],sol:585,cor:'#ffa060',cena:'herois'},
{txt:'',ceu:['#140e26','#e0834f'],sol:600,cor:'#ffb060',cena:'titulo'}];
const CENA_T=6.5,CHAO=560;
let IN=null;

function intro(){parar();if(IN)IN.fechar();ovl.hidden=false;if(typeof tocar=='function')tocar('titulo');
ovl.innerHTML='<canvas id="ic" aria-label="Abertura: a história de Crepúsculo dos Reinos"></canvas><div class="pular" id="pl">Clique ou aperte qualquer tecla para pular ▸</div>';
const c=$('ic');IN={c,x:c.getContext('2d'),t0:performance.now(),ult:performance.now(),boom:false,
brasas:[...Array(70)].map(()=>({x:Math.random()*1280,y:Math.random()*720,v:18+Math.random()*45,r:1+Math.random()*2.5,f:Math.random()*6}))};
const ultima=CENA_T*(INTRO.length-1);
const avanca=e=>{if(e.type=='keydown'&&e.repeat)return;if((performance.now()-IN.t0)/1000<ultima)IN.t0=performance.now()-ultima*1000;else{IN.fechar();title()}};
IN.fechar=()=>{removeEventListener('keydown',avanca);ovl.removeEventListener('pointerdown',avanca);IN=null};
addEventListener('keydown',avanca);ovl.addEventListener('pointerdown',avanca);
requestAnimationFrame(quadro)}

const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mixc=(a,b,m)=>rgb(a).map((v,i)=>Math.round(v+(rgb(b)[i]-v)*m));
const rgba=(c,al=1)=>`rgba(${c.join(',')},${al})`;
function forma(x,pts,cor){x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath();x.fillStyle=cor;x.fill()}

function quadro(now){if(!IN||!document.contains(IN.c)){if(IN)IN.fechar();return}
const{c,x}=IN,W=innerWidth,H=innerHeight,D=devicePixelRatio||1,dt=Math.min(.05,Math.max(0,(now-IN.ult)/1000));IN.ult=now;
if(c.width!=Math.round(W*D)||c.height!=Math.round(H*D)){c.width=Math.round(W*D);c.height=Math.round(H*D)}
const k=Math.max(W/1280,H/720);x.setTransform(D*k,0,0,D*k,D*(W-1280*k)/2,D*(H-720*k)/2);x.imageSmoothingEnabled=false;
const t=Math.max(0,(now-IN.t0)/1000),i=Math.min(INTRO.length-1,Math.floor(t/CENA_T)),s=INTRO[i],a=INTRO[Math.max(0,i-1)],p=t-i*CENA_T,m=i?Math.min(1,p/1.5):1;
if(s.cena=='titulo'&&!IN.boom){IN.boom=true;$('pl').textContent='Clique ou aperte qualquer tecla para jogar ▸';
if(on&&AC){const q=AC.currentTime;tone(55,q,1.6,'sine',.45);tone(110,q,1.2,'triangle',.15);noise(q,.9,.25,500)}}
// Céu, estrelas e sol
const g=x.createLinearGradient(0,0,0,CHAO);g.addColorStop(0,rgba(mixc(a.ceu[0],s.ceu[0],m)));g.addColorStop(1,rgba(mixc(a.ceu[1],s.ceu[1],m)));
x.fillStyle=g;x.fillRect(-2000,-2000,5280,4720);
const noite=Math.min(1,Math.max(0,i-1+m)*.45);
if(noite>0)for(let n=0;n<90;n++){const sx=(n*373)%1280,sy=(n*197)%380;x.fillStyle=`rgba(255,240,220,${noite*(.35+.35*Math.sin(t*2+n))})`;x.fillRect(sx,sy,2,2)}
const sy=a.sol+(s.sol-a.sol)*m,sc=mixc(a.cor,s.cor,m),brilho=x.createRadialGradient(640,sy,40,640,sy,340);
brilho.addColorStop(0,rgba(sc,.55));brilho.addColorStop(1,rgba(sc,0));x.fillStyle=brilho;x.fillRect(-2000,-2000,5280,4720);
x.beginPath();x.arc(640,sy,95,0,7);x.fillStyle=rgba(sc);x.fill();
// Montanhas ao fundo
forma(x,[[-200,CHAO],[-200,430],[60,360],[230,440],[400,330],[560,420],[760,350],[930,430],[1090,340],[1300,420],[1480,380],[1480,CHAO]],'#2e2147');
cenario(x,s.cena,p,t);
forma(x,[[-200,CHAO],[-200,520],[200,540],[420,505],[700,535],[980,500],[1480,530],[1480,920],[-200,920]],'#1b1430');
x.fillStyle='#120c22';x.fillRect(-2000,CHAO+40,5280,2000);
frente(x,s.cena,p,t);
// Brasas subindo
for(const b of IN.brasas){b.y-=b.v*dt*(s.cena=='saque'?2:1);b.x+=Math.sin(t*1.5+b.f)*12*dt;if(b.y<-10){b.y=740;b.x=Math.random()*1280}
x.fillStyle=`rgba(255,${150+Math.round(60*Math.sin(t*3+b.f))},70,${.5+.4*Math.sin(t*4+b.f)})`;x.fillRect(b.x,b.y,b.r,b.r)}
// Faixas de cinema e narração
x.fillStyle='#000';x.fillRect(-2000,-2000,5280,2080);x.fillRect(-2000,620,5280,2000);
if(s.txt){const al=Math.min(1,Math.max(0,(p-.5)/1),Math.max(0,(CENA_T-p)/.8));x.globalAlpha=al;
x.fillStyle='#f4e6d0';x.font='italic 31px "Alegreya Sans",Georgia,serif';x.textAlign='center';x.textBaseline='middle';
const linhas=quebra(x,s.txt,1100);linhas.forEach((l,n)=>x.fillText(l,640,670+(n-(linhas.length-1)/2)*36));x.globalAlpha=1}
if(s.cena=='titulo'){const al=Math.min(1,p/1.6);x.globalAlpha=al;x.textAlign='center';x.textBaseline='middle';
x.font='700 92px "Alegreya SC",Georgia,serif';x.fillStyle='#241a42';x.fillText('Crepúsculo dos Reinos',640,236);x.fillStyle='#f7d9a8';x.fillText('Crepúsculo dos Reinos',640,230);
x.font='italic 32px "Alegreya Sans",Georgia,serif';x.fillStyle='#f4e6d0';x.fillText('Antes que a última luz se apague.',640,305);
if(p>2.2){x.globalAlpha=.45+.55*Math.abs(Math.sin(t*2.2));x.font='700 26px "Alegreya Sans",Georgia,sans-serif';x.fillStyle='#ffcb54';x.fillText('CLIQUE OU APERTE QUALQUER TECLA PARA JOGAR',640,670)}
x.globalAlpha=1}
requestAnimationFrame(quadro)}

function quebra(x,txt,max){const ws=txt.split(' '),ls=[''];for(const w of ws){const tst=ls[ls.length-1]?ls[ls.length-1]+' '+w:w;if(x.measureText(tst).width>max)ls.push(w);else ls[ls.length-1]=tst}return ls}

function castelo(x,cx,base,s,cor,janelas){const r=(px,py,w,h)=>{x.fillStyle=cor;x.fillRect(cx+px*s,base-py*s-h*s,w*s,h*s)};
r(-60,0,120,70);r(-90,0,34,110);r(56,0,34,110);r(-22,0,44,150);
for(const[tx,tw,th]of[[-90,34,110],[56,34,110],[-22,44,150],[-60,120,70]])for(let n=0;n<tw;n+=12)r(tx+n,th,7,9);
forma(x,[[cx-22*s,base-150*s],[cx,base-190*s],[cx+22*s,base-150*s]],cor);
if(janelas)for(const[wx,wy]of[[-80,80],[66,80],[-8,110],[-40,40],[30,40]]){x.fillStyle=`rgba(255,214,120,${.6+.3*Math.sin(performance.now()/300+wx)})`;x.fillRect(cx+wx*s,base-wy*s,8*s,12*s)}}

function coroa(x,cx,cy,s,al){x.globalAlpha=al;const brilho=x.createRadialGradient(cx,cy,4,cx,cy,70*s);brilho.addColorStop(0,'rgba(255,220,120,.8)');brilho.addColorStop(1,'rgba(255,220,120,0)');
x.fillStyle=brilho;x.fillRect(cx-80*s,cy-80*s,160*s,160*s);
forma(x,[[cx-30*s,cy+14*s],[cx-30*s,cy-12*s],[cx-15*s,cy+2*s],[cx,cy-22*s],[cx+15*s,cy+2*s],[cx+30*s,cy-12*s],[cx+30*s,cy+14*s]],'#f2c14e');
x.fillStyle='#d13b3b';x.fillRect(cx-4*s,cy-2*s,8*s,8*s);x.globalAlpha=1}

function casa(x,hx,base,w,h,cor){x.fillStyle=cor;x.fillRect(hx,base-h,w,h);forma(x,[[hx-6,base-h],[hx+w/2,base-h-w*.55],[hx+w+6,base-h]],cor)}

function fogo(x,fx,fy,t,s){for(let n=0;n<3;n++){const r=(26+n*14)*s*(1+.12*Math.sin(t*9+n+fx)),f=x.createRadialGradient(fx,fy,2,fx,fy,r);
f.addColorStop(0,'rgba(255,230,140,.9)');f.addColorStop(.4,'rgba(255,120,40,.55)');f.addColorStop(1,'rgba(200,40,20,0)');x.fillStyle=f;x.beginPath();x.arc(fx,fy,r,0,7);x.fill()}
for(let n=0;n<5;n++){const k=((t*.35+n/5)%1),sx=fx+Math.sin(t+n*2)*18*k,sy=fy-20-k*170;x.fillStyle=`rgba(40,30,45,${.35*(1-k)})`;x.beginPath();x.arc(sx,sy,(12+k*34)*s,0,7);x.fill()}}

function boneco(x,u,bx,by,esc,virar,sombra){const img=spr(u,false);x.save();x.translate(bx,by);if(virar)x.scale(-1,1);
if(sombra){x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.ellipse(0,0,6*esc,1.6*esc,0,0,7);x.fill()}
const k=esc*12/SPR_W;x.drawImage(img,-SPR_W/2*k,-(SPR_H-2)*k,SPR_W*k,SPR_H*k);x.restore()}

// Cenário de fundo (atrás das colinas próximas)
function cenario(x,cena,p,t){
if(cena=='reino'){castelo(x,640,CHAO-20,1.15,'#3a2c55',true);for(const fx of[540,740]){x.fillStyle='#3a2c55';x.fillRect(fx,CHAO-235,3,60);x.fillStyle='#e0aa48';forma(x,[[fx+3,CHAO-235],[fx+40+Math.sin(t*3+fx)*5,CHAO-225],[fx+3,CHAO-212]],'#e0aa48')}}
if(cena=='roubo'){castelo(x,640,CHAO-20,1.15,'#22183a',false);const q=Math.min(1,p/4.5),cx=640-q*520,cy=330-Math.sin(q*Math.PI)*120-q*120;
x.strokeStyle='rgba(255,210,120,.35)';x.lineWidth=6;x.beginPath();x.moveTo(640,330);x.quadraticCurveTo(640-q*260,330-q*240,cx,cy);x.stroke();coroa(x,cx,cy,1.4-q*.6,1-q*.7)}
if(cena=='saque'){castelo(x,1010,CHAO-30,.55,'#1d1430',false)}
if(cena=='herois'||cena=='titulo'){castelo(x,cena=='titulo'?640:1050,CHAO-25,cena=='titulo'?1:.6,'#150f26',false)}}

// Primeiro plano (na frente das colinas próximas)
function frente(x,cena,p,t){
if(cena=='saque'){const casas=[[90,60,48],[190,70,56],[300,58,44],[400,74,60],[520,62,50]];
for(const[hx,w,h]of casas){casa(x,hx,CHAO+30,w,h,'#0e0918');fogo(x,hx+w/2,CHAO+30-h-10,t,1)}
const brilho=x.createRadialGradient(1010,CHAO-60,10,1010,CHAO-60,190);brilho.addColorStop(0,'rgba(255,60,40,.45)');brilho.addColorStop(1,'rgba(255,60,40,0)');x.fillStyle=brilho;x.fillRect(800,CHAO-260,420,360);
boneco(x,{k:'K',team:1},880,CHAO+26,6,false,true);boneco(x,{k:'A',team:1},1150,CHAO+24,6,true,true);boneco(x,{k:'K',team:1,lider:true},1010,CHAO+34,10,false,true);
x.font='16px sans-serif';x.textAlign='center';x.fillText('👑',1010+46,CHAO-120)}
if(cena=='herois'){const q=p/CENA_T,base=CHAO+40;[['K',0],['A',-110],['M',-210]].forEach(([k,off],n)=>{const bx=220+q*560+off,bob=Math.abs(Math.sin(t*6+n))*6;boneco(x,{k,team:0},bx,base-bob,8,true,true)})}}
