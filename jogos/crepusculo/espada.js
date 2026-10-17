// ===================== ESPADA CELESTIAL E INVOCAÇÃO =====================
// Depois do Salão do Trono, a Espada Celestial acompanha o grupo em toda batalha.
// A barra enche com dano causado, dano recebido e curas. Cheia, o herói da vez pode invocar
// Aurora, a Fênix Solar, que atinge todos os inimigos do mapa. Uma invocação por batalha.
const ESPADA={dano:.35,sofre:.25,cura:.3,base:30,porNivel:4,chefe:.5};
let CARGA=0,INVOCADA=false,INVOC=null;
const temEspada=()=>{const c=typeof camp=='function'&&camp();return!!(c&&c.espada)};
function carrega(v){if(!temEspada()||INVOCADA||over||INVOC)return;CARGA=Math.min(100,CARGA+v*(1+.2*fragmentos()));mostraEspada()}
// Cada Fragmento da Aurora recuperado (Ato III) faz a Espada Celestial carregar 20% mais rápido.
function fragmentos(){const c=typeof camp=='function'&&camp();return c&&c.fragmentos?c.fragmentos.length:0}
function mostraEspada(){const e=$('espada'),b=$('bi');if(!e)return;const tem=temEspada();e.hidden=!tem;b.hidden=!tem;if(!tem)return;
$('efill').style.height=CARGA+'%';e.classList.toggle('cheia',CARGA>=100&&!INVOCADA);e.title=INVOCADA?'Aurora já foi invocada nesta batalha':`Espada Celestial: ${Math.floor(CARGA)}%`;
b.disabled=!mine()||acted||CARGA<100||INVOCADA;b.className=CARGA>=100&&!INVOCADA?'on':''}
function invocar(){if(!mine()||acted||CARGA<100||INVOCADA)return;INVOCADA=true;CARGA=0;ph='busy';if(typeof conquista=='function')conquista('aurora');INVOC={t0:performance.now(),feito:false};
msg(`${cur.name} ergue a Espada Celestial e invoca Aurora, a Fênix Solar!`);mostraEspada();ui();
if(typeof vinheta=='function')vinheta('aurora');if(on&&AC)noise(AC.currentTime+1.2,.8,.3,2500);
setTimeout(()=>{if(INVOC&&!INVOC.feito)aplicaInvocacao()},1400);setTimeout(terminaInvocacao,3200)}
// Dano: base + por nível médio do grupo; chefes recebem metade. A luz também destrói esqueletos de vez.
function aplicaInvocacao(){if(!INVOC||INVOC.feito)return;INVOC.feito=true;const hs=heroisAtuais(),nv=hs?hs.reduce((s,h)=>s+h.nv,0)/hs.length:1,
dano=ESPADA.base+ESPADA.porNivel*nv;for(const t of U.filter(u=>u.team&&u.hp>0))hit(cur,t,Math.round(t.lider?dano*ESPADA.chefe:dano),true,true);sfx('crit')}
function terminaInvocacao(){if(!INVOC)return;aplicaInvocacao();INVOC=null;acted=true;after()}
function desenhaInvocacao(e){const meio=VB.x+VB.w/2;g.fillStyle=`rgba(10,6,24,${Math.min(.55,e*.8)})`;g.fillRect(-3000,-3000,6000,6000);
const px=VB.x-120+(VB.w+240)*Math.min(1,e/1.6),py=40+Math.sin(e*5)*10,asa=Math.sin(e*14)*18;
if(e<1.7){const rastro=g.createLinearGradient(px-260,0,px,0);rastro.addColorStop(0,'rgba(255,200,80,0)');rastro.addColorStop(1,'rgba(255,220,120,.7)');g.fillStyle=rastro;g.fillRect(px-260,py-6,260,12);
g.fillStyle='#ffcf4a';g.beginPath();g.moveTo(px-20,py);g.lineTo(px-60,py-30-asa);g.lineTo(px-6,py-8);g.lineTo(px-60,py+30+asa);g.closePath();g.fill();
g.fillStyle='#fff2b0';g.beginPath();g.ellipse(px,py,22,9,0,0,7);g.fill();g.beginPath();g.moveTo(px+18,py-4);g.lineTo(px+34,py);g.lineTo(px+18,py+4);g.fill();
for(let n=0;n<20;n++){g.fillStyle=`rgba(255,240,180,${Math.random()})`;g.fillRect(px-Math.random()*220,py+(Math.random()-.5)*50,2,2)}}
if(e>1.1&&e<2.8){const al=Math.min(1,(e-1.1)/.3)*(1-Math.max(0,(e-2.2)/.6));for(const t of U.filter(u=>u.team&&(u.hp>0||INVOC&&INVOC.feito))){const[x,y]=P(t.x,t.y);
const luz=g.createLinearGradient(0,y-300,0,y);luz.addColorStop(0,'rgba(255,240,170,0)');luz.addColorStop(1,`rgba(255,236,150,${.8*al})`);g.fillStyle=luz;g.fillRect(x-16,y-300,32,300);
g.strokeStyle=`rgba(255,230,140,${al})`;g.lineWidth=3;g.beginPath();g.ellipse(x,y,20+(e-1.1)*30,9+(e-1.1)*14,0,0,7);g.stroke()}}
g.globalAlpha=Math.min(1,e*2)*(e<2.6?1:Math.max(0,1-(e-2.6)/.4));g.font='700 28px "Alegreya SC",Georgia,serif';g.textAlign='center';g.lineWidth=6;g.strokeStyle='#2a1a08';
g.strokeText('Aurora, a Fênix Solar!',meio,VB.y+VB.h-40);g.fillStyle='#ffe7a8';g.fillText('Aurora, a Fênix Solar!',meio,VB.y+VB.h-40);g.globalAlpha=1}
$('bi').onclick=invocar;
