// ===================== JOGO: LAÇO, CÂMERA, DESENHO E CONTROLES =====================
const cv=document.getElementById('cv'),g=cv.getContext('2d'),$=id=>document.getElementById(id);
let CAM={x:0,y:0,z:2},FER='sel',HOV=null,SEL=null,VEL=1,PREV=null,INI=null;
const ZOOMS=[1,1.5,2,3,4],TECLAS=new Set();
// Centro do topo da casa (x, y) na tela do mundo, já com a altura.
const P=(x,y,h)=>[(x-y)*32,(x+y)*16-(h==null?cel(x,y).h:h)*S];

// ---------- Ferramentas ----------
const FERR=[['sel','Ver','Clique em algo para ver o que é'],['band','Bandeira','Põe uma bandeira. Numa estrada longa, divide a estrada e ganha mais um carregador.'],
['estr','Estrada','Clique numa bandeira (ou num prédio) e depois onde a estrada termina. Se ali não houver bandeira, ela é criada.'],
['demol','Demolir','Remove um prédio, uma bandeira ou uma estrada.']];
// Prédios em abas: teclas 1 a 4 são as ferramentas básicas, 5 a 8 os prédios da aba aberta, Tab troca de aba.
const CATEG=[['Construção',['lenhador','florestal','pedreira','serraria','armazem']],['Comida',['pescador','fazenda','moinho','padaria','estabulo']],
['Minas',['geologo','mina_carvao','mina_ferro','mina_ouro','fundicao','ferraria']],['Militar',['guarita','quartel','armaria']]];
// Ferramentas de aba que não são prédios
const FERR_X=[['geologo','Geólogo','Clique numa bandeira perto da serra: um geólogo (com martelo) examina a serra em volta e finca plaquinhas com o minério que achar. Mina só se constrói em minério conhecido.']];
const infoFerr=f=>FERR.find(a=>a[0]==f)||FERR_X.find(a=>a[0]==f);
const TECLAS_ABA=['5','6','7','8','9','0'];
let CAT=0;
function escolhe(f){FER=f;INI=null;PREV=null;if(f!='sel')SEL=null;document.querySelectorAll('#ferr .linha button').forEach(b=>b.classList.toggle('on',b.dataset.f==f));mostraInfo()}
function cancela(){if(INI){INI=null;PREV=null}else escolhe('sel')}

// ---------- Novo jogo ----------
function novoJogo(seed){J={band:new Map(),est:new Map(),pred:new Map(),col:[],sede:null,t:0,feito:{},obj:0};ID=1;DIST={};geraMundo(seed);
const c=N>>1,s=criaPredio('sede',c,c);s.estoque={tabua:24,pedra:16,tora:0,burro:2,espada:2,...FERR_INICIAL};s.pop=30;s.guar=[{r:0},{r:0}];J.sede=s;territorio();criaRival();
if(typeof fechaFim=='function')fechaFim();
const[px,py]=P(c,c);CAM.x=px;CAM.y=py+40;escolhe('sel');
aviso('Bem-vindo! Construa um Lenhador perto da floresta e ligue a bandeira dele à sede com uma estrada.')}

// ---------- Laço ----------
let ult=performance.now(),acc=0;
function atualiza(dt){J.t+=dt;acc+=dt;if(acc>=.4){acc=0;distribui();pedeColonos();objetivos()}cresce(dt);nascimentos(dt);
combate(dt);promove(dt);iaRival(dt);amostra(dt);for(const u of[...J.col])atualizaColono(u,dt)}
function quadro(now){try{const dt=Math.min(.1,(now-ult)/1000);ult=now;for(let i=0;i<VEL;i++)atualiza(dt);panTeclas(dt);desenha(now/1000)}catch(e){console.error(e)}requestAnimationFrame(quadro)}
let hudT=0;

// ---------- Dia e noite ----------
// Um dia inteiro dura 4 minutos de jogo (segue J.t, então para na pausa). hora 0 = meio da madrugada.
const DIA_S=240,horaDoDia=()=>((J.t+DIA_S*.3)%DIA_S)/DIA_S;
// luz: 1 de dia, 0 de noite. Amanhece entre 0,2 e 0,3 da hora e anoitece entre 0,75 e 0,85.
function luzDoDia(){const h=horaDoDia(),sm=x=>x*x*(3-2*x);return h<.2||h>.85?0:h<.3?sm((h-.2)/.1):h>.75?sm(1-(h-.75)/.1):1}
const diaAtual=()=>Math.floor((J.t+DIA_S*.3)/DIA_S)+1;

// ---------- Efeitos visuais ----------
// FX: árvore caindo e peixe pulando (só na tela, não vão para o save). AVES: bandos de pássaros voando de dia.
let FX=[],AVES=[],ULT_Q=0;const SOMT=new WeakMap();
function efeito(e){e.t0=performance.now()/1000;e.dur=e.k=='queda'?1.6:e.k=='fogo'?4:e.k=='morte'?1.4:1;FX.push(e)}
// Som posicionado: mais alto perto do centro da tela e com zoom maior; esquerda/direita conforme o lugar.
function somEm(tipo,cx,cy,vol=1){if(typeof som!='function')return;const W=cv.clientWidth,H=cv.clientHeight,sx=(cx-CAM.x)*CAM.z,sy=(cy-CAM.y)*CAM.z,d=Math.hypot(sx,sy)/(Math.max(W,H)*.6);
som(tipo,vol*Math.max(0,1-d)*Math.min(1,CAM.z/2)*.8,sx/(W/2))}
// Toca o som de trabalho de algo (colono ou prédio) no máximo uma vez a cada iv segundos
function somDe(dono,tipo,iv,cx,cy,t,vol){if(t-(SOMT.get(dono)||0)<iv)return;SOMT.set(dono,t);somEm(tipo,cx,cy,vol)}
function desenhaEfeito(e,cx,cy,t){const p=(t-e.t0)/e.dur;
if(e.k=='queda'){if(!e.som){e.som=1;somEm('queda',cx,cy)}const a=Math.min(1,(t-e.t0)/.9),im=objImg('T',e.v),s=.85;g.save();g.globalAlpha=p<.7?1:Math.max(0,1-(p-.7)/.3);g.translate(cx,cy+2);g.rotate(e.lado*a*a*1.45);
g.drawImage(im,Math.round(-30*s),Math.round(-80*s),Math.round(60*s),Math.round(84*s));g.restore();
if(a>=1&&p<.85){g.fillStyle=`rgba(200,180,140,${.5*(1-p)})`;for(let i=0;i<6;i++)g.fillRect(Math.round(cx+e.lado*(20+i*5)+Math.sin(i*3)*3),Math.round(cy-2-((t*30+i*7)%8)),3,2)}}
// Soldado que caiu no duelo: tomba e some
else if(e.k=='morte'){if(!e.som){e.som=1;somEm('espada',cx,cy)}g.save();g.globalAlpha=Math.max(0,1-p);g.translate(cx,cy);g.rotate(Math.min(1,p*3)*Math.PI/2*(e.dono?-1:1));g.drawImage(colonoSpr(e.dono?'soldado_r':'soldado',false,0),-9,-25);g.restore()}
// Prédio pegando fogo (ficou no território inimigo)
else if(e.k=='fogo'){if(!e.som){e.som=1;somEm('queda',cx,cy,.6)}for(let i=0;i<14;i++){const ph=(t*1.4+i/14)%1,fx0=Math.round(cx-22+(i*7)%44+Math.sin(t*3+i)*2),fy0=Math.round(cy-4-ph*40);
g.fillStyle=ph<.3?'#fff2b0':ph<.6?'#ffb030':'#e8541e';g.globalAlpha=Math.max(0,1-p)*(1-ph);g.fillRect(fx0,fy0,3,4)}
g.fillStyle='rgba(50,44,40,.5)';g.globalAlpha=Math.max(0,1-p);for(let i=0;i<5;i++){const ph=(t*.5+i/5)%1;g.fillRect(Math.round(cx-10+i*5+ph*8),Math.round(cy-40-ph*30),5,5)}g.globalAlpha=1}
else if(e.k=='peixe'){if(!e.som){e.som=1;somEm('respingo',cx,cy,.6)}const x=Math.round(cx-10+20*p),y=Math.round(cy-2-Math.sin(Math.PI*p)*16);
if(p<.95){g.fillStyle='#1a2a38';g.fillRect(x-3,y-1,7,4);g.fillStyle='#9ac0d8';g.fillRect(x-2,y,5,2);g.fillStyle='#d8eef8';g.fillRect(x-2,y,3,1);g.fillStyle='#6a90a8';g.fillRect(p<.5?x-4:x+3,y,1,2)}
for(const[q0,ox]of[[0,-10],[.85,10]])if(p>q0&&p<q0+.35){const r=(p-q0)/.35;g.strokeStyle=`rgba(230,245,255,${.8*(1-r)})`;g.lineWidth=1;g.beginPath();g.ellipse(cx+ox,cy,3+r*9,1.5+r*4,0,0,7);g.stroke()}}}
function desenhaAves(t,dt,v){if(luzDoDia()>.6&&AVES.length<2&&Math.random()<dt*.12){const dir=Math.random()<.5?1:-1;
AVES.push({x:dir>0?v.x0:v.x1,y:v.y0+(v.y1-v.y0)*(.1+Math.random()*.5),vx:dir*(38+Math.random()*20),vy:(Math.random()-.5)*8,n:3+Math.floor(Math.random()*4),f:Math.random()*6})}
for(const a of AVES){a.x+=a.vx*dt;a.y+=a.vy*dt;for(let i=0;i<a.n;i++){const bx=Math.round(a.x-Math.sign(a.vx)*(Math.ceil(i/2)*9)),by=Math.round(a.y+(i%2?1:-1)*Math.ceil(i/2)*5),up=Math.floor(t*8+a.f+i)%2;
g.fillStyle='#2a2630';if(up){g.fillRect(bx-3,by-2,2,1);g.fillRect(bx+2,by-2,2,1);g.fillRect(bx-1,by-1,3,1)}else{g.fillRect(bx-3,by,2,1);g.fillRect(bx+2,by,2,1);g.fillRect(bx-1,by-1,3,1)}}}
AVES=AVES.filter(a=>a.x>v.x0-60&&a.x<v.x1+60)}
// Luz das janelas, fornos e lanternas à noite (somadas por cima do escuro). n: quanto é noite (0 a 1).
// [dx, dy, raio, cor] a partir do centro da casa do prédio
const LUZES={sede:[[-10,-12,28],[18,-40,18]],quartel:[[-8,-6,22],[16,-40,14]],armaria:[[8,-10,18]],ferraria:[[-14,-4,22,'255,120,40'],[8,-10,16]],fundicao:[[-23,1,30,'255,120,40'],[6,-10,16]],padaria:[[8,-12,20],[27,3,20,'255,130,50']],
mina_carvao:[[-22,4,18]],mina_ferro:[[-22,4,18]],mina_ouro:[[-22,4,18]],moinho:[[-2,-16,16]],guarita:[[0,-30,16]]};
let CHAM=[],LANT=[];
function brilho(x,y,r,cor,a){const gr=g.createRadialGradient(x,y,1,x,y,r);gr.addColorStop(0,`rgba(${cor},${a})`);gr.addColorStop(1,`rgba(${cor},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}
function desenhaLuzes(n,t,vis){g.globalCompositeOperation='lighter';
for(const p of J.pred.values()){if(p.obra||p!=J.sede&&!p.trab)continue;const[cx,cy]=P(p.x,p.y);if(!vis(cx,cy))continue;
for(const[dx,dy,r,cor]of LUZES[p.tipo]||[[9,-10,20]])brilho(cx+dx,cy+dy,r*(1+.06*Math.sin(t*7+p.id)),cor||'255,190,90',.5*n)}
for(const[x,y]of LANT)brilho(x,y,12,'255,200,110',.35*n);
g.globalCompositeOperation='source-over';
// De noite a fumaça das chaminés aparece clara contra o céu escuro
for(const[x,y,esc]of CHAM)for(let i=0;i<3;i++){const ph=(t*.4+i/3)%1;g.fillStyle=esc?`rgba(150,145,140,${.4*n*(1-ph)})`:`rgba(220,225,240,${.4*n*(1-ph)})`;g.fillRect(Math.round(x+ph*8+Math.sin(t+i)*2),Math.round(y-ph*22),4,4)}}

// ---------- Desenho ----------
function desenha(t){const D=devicePixelRatio||1,W=cv.clientWidth,H=cv.clientHeight;if(cv.width!=Math.round(W*D)||cv.height!=Math.round(H*D)){cv.width=Math.round(W*D);cv.height=Math.round(H*D)}
const dtq=Math.min(.1,Math.max(0,t-(ULT_Q||t)));ULT_Q=t;CHAM=[];LANT=[];const agua=[];
g.setTransform(1,0,0,1,0,0);g.fillStyle='#10202e';g.fillRect(0,0,cv.width,cv.height);
const z=CAM.z,ox=W/2-CAM.x*z,oy=H/2-CAM.y*z;g.setTransform(D*z,0,0,D*z,D*ox,D*oy);g.imageSmoothingEnabled=false;
const vx0=-ox/z-90,vx1=(W-ox)/z+90,vy0=-oy/z-140,vy1=(H-oy)/z+90,vis=(cx,cy)=>cx>vx0&&cx<vx1&&cy>vy0&&cy<vy1;
const ehPredio=!!TIPOS[FER]&&FER!='sede';
// Terreno, de trás para frente (os blocos mais altos cobrem os de trás)
for(let s=0;s<=2*N-2;s++)for(let x=Math.max(0,s-N+1);x<=Math.min(s,N-1);x++){const y=s-x,q=M[y][x],[cx,cy]=P(x,y);if(!vis(cx,cy))continue;
g.drawImage(bloco(q.t,q.h,q.v),cx-32,cy-16);
if(q.min&&q.desc&&!q.obj&&!q.uso)marcaMinerio(g,q.min,cx,cy);
if(q.obj&&q.obj.k=='W')g.drawImage(campoImg(q.obj.cresce<1?Math.min(2,Math.floor(q.obj.cresce*3)):3),cx-32,cy-17);
if(q.t=='a'){agua.push([x,y]);const ph=(t*.25+x*.37+y*.61)%1;g.fillStyle=`rgba(220,240,255,${.35*Math.sin(ph*Math.PI)})`;g.fillRect(Math.round(cx-12+ph*16),Math.round(cy-4+(x*7+y*3)%3*3),5,1)}
if(q.inim)losango(cx,cy,1,'rgba(150,20,20,.2)');
else if(!q.dono){losango(cx,cy,1,'rgba(10,8,24,.45)');
// Com uma ferramenta de mina: o minério certo fora da fronteira fica marcado em laranja (é para lá que o reino deve crescer)
if(ehPredio&&TIPOS[FER].mina&&q.min&&q.desc&&q.min.k==TIPOS[FER].mina)losango(cx,cy,.36,'rgba(255,150,60,.8)')}
else if(ehPredio&&!erroPredio(x,y,FER))losango(cx,cy,.42,'rgba(140,240,120,.55)');
else if(FER=='band'&&!erroBandeira(x,y))losango(cx,cy,.28,'rgba(255,220,90,.7)')}
// Estradas de terra batida
g.lineCap='round';g.lineJoin='round';
for(const e of J.est.values()){if(!e.cam.some(([x,y])=>vis(...P(x,y))))continue;caminhoTela(e.cam);
g.strokeStyle='#5e4228';g.lineWidth=9;g.stroke();g.strokeStyle='#b09060';g.lineWidth=6;g.stroke();g.strokeStyle='rgba(255,240,200,.22)';g.lineWidth=2;g.stroke()}
// Prévia da estrada
if(FER=='estr'&&INI&&PREV){const f=J.band.get(INI);caminhoTela([[f.x,f.y],...PREV.cam]);g.setLineDash([6,5]);g.strokeStyle=PREV.ok?'rgba(255,220,90,.95)':'rgba(240,80,70,.9)';g.lineWidth=3;g.stroke();g.setLineDash([])}
// Contorno da casa sob o mouse
if(HOV){const[cx,cy]=P(...HOV);g.beginPath();[[cx,cy-16],[cx+32,cy],[cx,cy+16],[cx-32,cy]].forEach(([a,b],i)=>i?g.lineTo(a,b):g.moveTo(a,b));g.closePath();g.lineWidth=2;g.strokeStyle=FER=='demol'?'#ff6a5a':'#ffd45a';g.stroke()}
// Tudo o que fica em pé: ordenado pela profundidade (x + y)
const L=[];
for(let y=0;y<N;y++)for(let x=0;x<N;x++){const q=M[y][x],[cx,cy]=P(x,y);if(!vis(cx,cy))continue;
if(q.obj&&q.obj.k!='W'){const o=q.obj;L.push([x+y,()=>{if(o.k=='T'){const e=o.cresce<1?.25+.6*o.cresce:.85,im=objImg('T',o.v||0);g.drawImage(im,Math.round(cx-30*e),Math.round(cy+2-80*e),Math.round(60*e),Math.round(84*e))}
else if(o.k=='B')g.drawImage(objImg('B',o.v||0),cx-17,cy-13);else if(o.k=='R')g.drawImage(rochaImg(o.q,o.v||0),cx-22,cy-28);else flores(g,cx,cy)}])}
if(q.placa&&!q.uso)L.push([x+y+.02,()=>placa(g,cx+10,cy+2,q.min)]);
if(q.dono&&D8.slice(0,4).some(([dx,dy])=>{const n=cel(x+dx,y+dy);return!n||!n.dono}))L.push([x+y-.01,()=>marco(cx,cy)]);
else if(q.inim&&D8.slice(0,4).some(([dx,dy])=>{const n=cel(x+dx,y+dy);return!n||!n.inim}))L.push([x+y-.01,()=>marco(cx,cy,COR_RIVAL)])}
for(const f of J.band.values()){const[cx,cy]=P(f.x,f.y);if(vis(cx,cy))L.push([f.x+f.y+.1,()=>desenhaBandeira(f,cx,cy,t)])}
for(const p of J.pred.values()){const[cx,cy]=P(p.x,p.y);if(vis(cx,cy))L.push([p.x+p.y+.2,()=>desenhaPredio(p,cx,cy,t)])}
for(const u of J.col)if(!u.dentro){const q=cel(Math.round(u.x),Math.round(u.y));u.hv+=((q?q.h:1)-u.hv)*.2;const[cx,cy]=P(u.x,u.y,u.hv);
const naObra=u.of=='construtor'&&u.est=='obra';if(vis(cx,cy))L.push([u.x+u.y+(naObra?.5:.3),()=>desenhaColono(u,cx+(naObra?14:0),cy+(naObra?6:0),t)])}
// Peixes pulando de vez em quando numa água à vista
if(agua.length&&Math.random()<dtq*.7){const[ax,ay]=agua[Math.floor(Math.random()*agua.length)];efeito({k:'peixe',x:ax,y:ay})}
for(const e of FX){const[cx,cy]=P(e.x,e.y);if(vis(cx,cy))L.push([e.x+e.y+.05,()=>desenhaEfeito(e,cx,cy,t)])}
L.sort((a,b)=>a[0]-b[0]);for(const[,f]of L)f();FX=FX.filter(e=>t-e.t0<e.dur);
desenhaAves(t,dtq,{x0:vx0,x1:vx1,y0:vy0,y1:vy1});
// Entardecer alaranjado e noite azulada por cima de tudo; depois as luzes acesas
const luz=luzDoDia();if(luz<1){const tarde=Math.sin(Math.PI*luz);g.setTransform(1,0,0,1,0,0);
if(tarde>.01){g.fillStyle=`rgba(255,130,50,${.13*tarde})`;g.fillRect(0,0,cv.width,cv.height)}g.fillStyle=`rgba(14,18,52,${.62*(1-luz)})`;g.fillRect(0,0,cv.width,cv.height);
g.setTransform(D*z,0,0,D*z,D*ox,D*oy);desenhaLuzes(1-luz,t,vis)}
if(typeof tocar=='function')tocar(luz>.35?'dia':'noite');
if(t-hudT>.25){hudT=t;hud()}}
function losango(cx,cy,e,cor){g.beginPath();g.moveTo(cx,cy-16*e);g.lineTo(cx+32*e,cy);g.lineTo(cx,cy+16*e);g.lineTo(cx-32*e,cy);g.closePath();g.fillStyle=cor;g.fill()}
function caminhoTela(cam){g.beginPath();cam.forEach(([x,y],i)=>{const[a,b]=P(x,y);i?g.lineTo(a,b):g.moveTo(a,b)})}
// Marco da fronteira do território
function marco(cx,cy,cor){g.fillStyle='#1a1410';g.fillRect(cx-2,cy-9,4,10);g.fillStyle='#8a8678';g.fillRect(cx-1,cy-8,2,8);g.fillStyle=cor||COR_REINO;g.fillRect(cx-1,cy-8,2,3)}
function desenhaBandeira(f,cx,cy,t){const pos=[[-11,3],[11,3],[-16,-1],[16,-1],[-6,7],[6,7],[-20,3],[20,3]];f.itens.forEach((it,i)=>desenhaItem(g,it.tipo,cx+pos[i][0],cy+pos[i][1]));
g.fillStyle='#1a1008';g.fillRect(cx-2,cy-24,3,25);g.fillStyle='#6b4a2a';g.fillRect(cx-1,cy-23,1,23);
const cor=naRede(f.key)?COR_REINO:'#8a8a96';for(let c=0;c<9;c++){const o=Math.round(Math.sin(t*5-c*.7));g.fillStyle=c==0?tom(cor,.8):cor;g.fillRect(cx+c,cy-23+o,1,6);g.fillStyle=tom(cor,1.35);g.fillRect(cx+c,cy-23+o,1,1)}}
function desenhaPredio(p,cx,cy,t){g.fillStyle='rgba(20,14,10,.28)';g.beginPath();g.ellipse(cx+2,cy+2,30,12,0,0,7);g.fill();
const corP=p.dono?COR_RIVAL:COR_REINO;
// Prédio do rival: bandeirinha vermelha na porta (ele não tem bandeira de estrada)
if(p.dono){g.fillStyle='#1a1008';g.fillRect(cx+29,cy-6,3,18);g.fillStyle='#6b4a2a';g.fillRect(cx+30,cy-5,1,16);for(let c=0;c<8;c++){const o=Math.round(Math.sin(t*5-c*.7));g.fillStyle=COR_RIVAL;g.fillRect(cx+31+c,cy-5+o,1,5)}}
if(p.obra){const o=p.obra,et=Math.min(3,Math.floor(o.feito/o.total*4));g.drawImage(predioImg(p.tipo,et,corP),cx-48,cy-84);
// Material que chegou e ainda não foi usado fica empilhado ao lado
let sobra=Object.values(o.tem).reduce((a,b)=>a+b,0)-o.feito;const ts=[];for(const tp in o.tem)for(let i=0;i<o.tem[tp];i++)ts.push(tp);ts.slice(ts.length-sobra).forEach((tp,i)=>desenhaItem(g,tp,cx-26+(i%2)*10,cy+6-Math.floor(i/2)*4))}
else{g.drawImage(predioImg(p.tipo,null,corP),cx-48,cy-84);
// Guarnição: um escudinho por soldado em cima dos prédios militares
if(p.guar&&p.guar.length){const n=p.guar.length,y0=cy-(p.tipo=='sede'?96:p.tipo=='guarita'?72:p.tipo=='quartel'?82:60);for(let i=0;i<n;i++){const sx=Math.round(cx-n*4+i*8);g.fillStyle='#1a1410';g.fillRect(sx-1,y0-1,7,8);g.fillStyle=corP;g.fillRect(sx,y0,5,5);g.fillRect(sx+1,y0+5,3,1);g.fillStyle='#ffd45a';for(let r=0;r<p.guar[i].r;r++)g.fillRect(sx+1+r,y0+1,1,1)}}
// Duelo na porta: o defensor sai e enfrenta o atacante
if(p.luta){const d=colonoSpr(p.dono?'soldado_r':'soldado',false,Math.floor(t*6)%2);g.drawImage(d,cx+6,cy-12);if(Math.floor(t*6)%2){g.fillStyle='#fff2b0';g.fillRect(cx+2+Math.floor(Math.random()*6),cy-18+Math.floor(Math.random()*6),1,1)}somDe(p,'espada',.45,cx,cy,t,.7)}
const ofic=p.trab&&p.trab.est=='oficina';
if(p.tipo=='serraria'&&ofic&&Math.floor(t*8)%2){g.fillStyle='#f4e6be';for(let i=0;i<3;i++)g.fillRect(cx+16+Math.floor(Math.random()*8),cy-4-Math.floor(Math.random()*8),1,1)}
// Fundição trabalhando: fumaça escura e grossa na chaminé alta e faíscas saindo da fornalha
if(p.tipo=='fundicao'&&ofic){for(let i=0;i<4;i++){const ph=(t*.35+i/4)%1;g.fillStyle=`rgba(60,56,54,${.6*(1-ph)})`;const s=3+Math.round(ph*4);g.fillRect(Math.round(cx+12+ph*10+Math.sin(t*1.3+i)*2),Math.round(cy-48-ph*30),s,s)}
for(let i=0;i<4;i++){const ph=(t*1.7+i/4)%1;g.fillStyle=ph<.5?'#ffd04a':'#ff7a2a';g.fillRect(Math.round(cx-24+Math.sin(i*2.3+t)*4),Math.round(cy-2-ph*14),1,1)}}
// Mina trabalhando: poeira saindo da boca
if(TIPOS[p.tipo].mina&&ofic){for(let i=0;i<3;i++){const ph=(t*.6+i/3)%1;g.fillStyle=`rgba(170,160,145,${.45*(1-ph)})`;g.fillRect(Math.round(cx-24-ph*6+Math.sin(t+i)*2),Math.round(cy+2-ph*10),3,3)}}
// Sons das oficinas e minas
if(p.tipo=='ferraria'&&ofic){for(let i=0;i<3;i++){const ph=(t*2+i/3)%1;g.fillStyle=ph<.5?'#ffd04a':'#ff7a2a';g.fillRect(Math.round(cx-15+Math.sin(i*2.1+t*3)*4),Math.round(cy-6-ph*10),1,1)}}
const SOM_P={serraria:['serra',1.4],fundicao:['forja',2.2],moinho:['moinho',2.6],ferraria:['martelo',.9]};const sp=TIPOS[p.tipo].mina?['picareta',1.1,.45]:SOM_P[p.tipo];if(ofic&&sp)somDe(p,sp[0],sp[1],cx,cy,t,sp[2]||.7);
// Pás do moinho: giram rápido enquanto o moleiro mói, devagar com o vento quando para
if(p.tipo=='moinho'){const gira=p.trab&&p.trab.est=='oficina';g.save();g.translate(cx-6,cy-26);g.rotate(J.t*(gira?2.4:.3));
for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.fillStyle='#3a2414';g.fillRect(0,-1,25,3);g.fillStyle='#e8e0cc';g.fillRect(8,2,16,6);g.fillStyle='#b8ae98';g.fillRect(8,7,16,1)}
g.restore();g.fillStyle='#3a2414';g.fillRect(cx-8,cy-28,5,5);g.fillStyle='#8a6a44';g.fillRect(cx-7,cy-27,3,3)}
if(p.tipo=='fundicao'&&p.trab)CHAM.push([cx+12,cy-48,1]);
if(p.tipo=='sede'||p.tipo!='moinho'&&p.tipo!='fundicao'&&p.trab&&p.trab.dentro){const ch=p.tipo=='sede'?[cx+30,cy-46]:p.tipo=='padaria'?[cx+3,cy-37]:p.tipo=='ferraria'?[cx+5,cy-37]:[cx+10,cy-30];CHAM.push(ch);for(let i=0;i<3;i++){const ph=(t*.4+i/3)%1;g.fillStyle=`rgba(230,230,235,${.5*(1-ph)})`;g.fillRect(Math.round(ch[0]+ph*8+Math.sin(t+i)*2),Math.round(ch[1]-ph*22),3,3)}}}
// Alerta "!" em cima do prédio parado há mais de 6 s: clique nele para ver o motivo
if(problema(p)){if(!ALERTA.has(p))ALERTA.set(p,t);if(t-ALERTA.get(p)>6)desenhaAlerta(cx,cy-(p.tipo=='sede'?100:p.tipo=='guarita'||p.tipo=='moinho'?78:62),t)}else ALERTA.delete(p);
if(SEL&&SEL[0]==p.x&&SEL[1]==p.y){g.strokeStyle='#ffd45a';g.lineWidth=1.5;g.beginPath();g.ellipse(cx,cy,34,15,0,0,7);g.stroke()}}
const ALERTA=new WeakMap();
function problema(p){if(p==J.sede||p.dono)return false;if(!naRede(p.band))return true;if(p.obra)return!p.obreiro;if(p.guar)return!p.guar.length;if(!TIPOS[p.tipo].of)return false;
return!p.trab||/^(Esperando (?!o trigo)|Sem |Falta|A mina|Não consegue|A bandeira)/.test(p.status||'')}
function desenhaAlerta(x,y,t){y=Math.round(y+Math.sin(t*4)*1.5);const R=(a,b,w,h,c)=>{g.fillStyle=c;g.fillRect(x+a,y+b,w,h)};
R(-5,-12,11,13,'#1a1410');R(-4,-11,9,11,'#e8645e');R(-4,-11,9,1,'#ff9a8a');R(-1,1,3,2,'#1a1410');R(0,1,1,1,'#e8645e');R(-1,-9,3,5,'#fff');R(-1,-3,3,2,'#fff')}
const SOM_OF={lenhador:['machado',.55,.8],pedreiro:['picareta',.6,.7],construtor:['martelo',.45,.6],florestal:['pa',1.1,.6],fazendeiro:['foice',.9,.5],pescador:['pesca',2.6,.5]};
function desenhaColono(u,cx,cy,t){const sx=(u.dx-u.dy),sy=(u.dx+u.dy),back=sy<-.01,vira=sx<-.01,fr=u.trab?Math.floor(t*5)%2:u.mov?Math.floor(u.passo*7)%2:0,bob=u.trab?Math.abs(Math.sin(t*10))*2:0;
// Burro: desenhado de lado, com a carga no lombo
if(u.of=='burro'){cx=Math.round(cx);cy=Math.round(cy);const im=burroSpr(u.mov?Math.floor(u.passo*6)%2:0);g.fillStyle='rgba(20,14,10,.3)';g.fillRect(cx-9,cy-1,18,3);
if(vira){g.save();g.translate(cx,0);g.scale(-1,1);g.drawImage(im,-11,cy-15);g.restore()}else g.drawImage(im,cx-11,cy-15);if(u.item)desenhaItem(g,u.item.tipo,cx-1,cy-10);return}
const im=colonoSpr(u.of=='soldado'&&u.dono?'soldado_r':u.of,back,fr);
cx=Math.round(cx);cy=Math.round(cy);g.fillStyle='rgba(20,14,10,.3)';g.fillRect(cx-6,cy-1,12,2);g.fillRect(cx-4,cy-2,8,4);
if(vira){g.save();g.translate(cx,0);g.scale(-1,1);g.drawImage(im,-9,cy-25-bob);g.restore()}else g.drawImage(im,cx-9,cy-25-bob);
const it=u.item?u.item.tipo:u.leva;if(it)desenhaItem(g,it,cx,u.item?cy-25:cy-10);
// Patente do soldado: estrelinhas em cima da cabeça
if(u.of=='soldado'&&u.r){g.fillStyle='#1a1410';g.fillRect(cx-u.r*2-1,cy-30,u.r*4+1,3);g.fillStyle='#ffd45a';for(let i=0;i<u.r;i++)g.fillRect(cx-u.r*2+i*4,cy-29,3,1)}
LANT.push([cx+(vira?-5:5),cy-12]);
// Som do trabalho: machado, picareta, martelo, pá, foice e linha na água
const st=SOM_OF[u.of];if(u.trab&&st)somDe(u,st[0],st[1],cx,cy,t,st[2]);
// Lascas de madeira e faíscas de pedra durante o trabalho
if(u.trab&&Math.floor(t*6)%2){g.fillStyle=u.of=='pedreiro'?'#fff2b0':u.of=='lenhador'?'#e0bc80':'#c8a070';for(let i=0;i<3;i++)g.fillRect(cx+(vira?-12:8)+Math.floor(Math.random()*6),cy-14-Math.floor(Math.random()*8),1,1)}}

// ---------- Interface ----------
function icone(f){const c=tela(44,40),x=c.getContext('2d');x.imageSmoothingEnabled=false;
if(TIPOS[f]){const im=predioImg(f);x.drawImage(im,4,30,88,80,0,0,44,40)}
else if(f=='band'){x.fillStyle='#1a1008';x.fillRect(18,6,3,30);x.fillStyle='#6b4a2a';x.fillRect(19,7,1,28);x.fillStyle=COR_REINO;x.fillRect(21,7,12,8);x.fillStyle=tom(COR_REINO,1.35);x.fillRect(21,7,12,2);x.fillStyle='#ffd45a';x.fillRect(25,10,3,2)}
else if(f=='estr'){polP(x,[[2,26],[22,16],[42,26],[22,36]],'#5e4228');polP(x,[[6,26],[22,18],[38,26],[22,34]],'#b09060');for(let i=0;i<4;i++){x.fillStyle='#8a6a44';x.fillRect(10+i*7,24+(i%2)*2,2,1)}}
else if(f=='sel'){polP(x,[[14,6],[14,30],[31,22]],'#f4ece6');for(let i=0;i<10;i++){x.fillRect(20+Math.floor(i/2),22+i,3,1)}contorno(c,'#1a1410')}
else if(f=='geologo'){x.drawImage(colonoSpr('geologo',false,0),4,2,36,52);x.fillStyle='#1a1008';x.fillRect(33,16,3,22);x.fillStyle='#8a6440';x.fillRect(34,17,1,20);
x.fillStyle='#1a1008';x.fillRect(27,10,15,10);x.fillStyle='#c8a070';x.fillRect(28,11,13,8);x.fillStyle='#d8a830';x.fillRect(31,13,6,4);x.fillStyle='#fff0a0';x.fillRect(31,13,2,1)}
else if(f=='demol'){x.fillStyle='#8a5a2b';for(let i=0;i<24;i++)x.fillRect(10+i,32-i,2,2);x.fillStyle='#a0a4ac';polP(x,[[24,6],[38,12],[36,16],[22,10]],'#a0a4ac');x.fillStyle='#e8645e';for(let i=0;i<14;i++){x.fillRect(4+i,4+i,2,2);x.fillRect(17-i,4+i,2,2)}contorno(c,'#1a1410')}
return c}
const ICONES={};
function botao(f,at){const T=TIPOS[f],n=T?T.n:infoFerr(f)[1],b=document.createElement('button');b.dataset.f=f;b.title=n+' (tecla '+at+')';b.classList.toggle('on',f==FER);
const ic=ICONES[f]||(ICONES[f]=icone(f)),c=tela(44,40);c.getContext('2d').drawImage(ic,0,0);b.appendChild(c);
const s=document.createElement('span');s.textContent=n;b.appendChild(s);const kb=document.createElement('kbd');kb.textContent=at;b.appendChild(kb);
b.onclick=()=>escolhe(f);b.onmouseenter=()=>mostraInfo(f);b.onmouseleave=()=>mostraInfo();return b}
function montaFerramentas(){const nav=$('ferr'),ab=document.createElement('div'),lin=document.createElement('div'),sep=document.createElement('i');nav.innerHTML='';ab.className='abas';lin.className='linha';sep.className='sep';
CATEG.forEach(([n],i)=>{const b=document.createElement('button');b.textContent=n;b.classList.toggle('on',i==CAT);b.onclick=()=>{CAT=i;montaFerramentas()};ab.appendChild(b)});
FERR.forEach(([f],i)=>lin.appendChild(botao(f,String(i+1))));lin.appendChild(sep);CATEG[CAT][1].forEach((f,i)=>lin.appendChild(botao(f,TECLAS_ABA[i])));nav.append(ab,lin)}
const custoTxt=c=>Object.entries(c).map(([t,n])=>nItem(t,n)).join(' + ');
const nItem=(t,n)=>n+' '+(n==1?ITEM[t].toLowerCase():PLURAL[t]);
function hud(){const S=J.sede,col=J.col.length;
$('estoque').innerHTML=`<span class="rec relogio" title="Cada dia dura 4 minutos de jogo">${luzDoDia()>.35?'☀':'☾'} <b>Dia ${diaAtual()}</b></span>`+Object.keys(ITEM).filter(t=>!FERRAMENTAS.includes(t)).map(t=>`<span class="rec" title="${ITEM[t]} na sede e nos armazéns"><canvas data-i="${t}" width="14" height="10"></canvas><b>${estoqueTotal(t)}</b></span>`).join('')+
// Ferramentas agrupadas num só número; o detalhe aparece ao passar o mouse
`<span class="rec" title="Ferramentas na sede: ${FERRAMENTAS.map(f=>nItem(f,S.estoque[f]||0)).join(', ')}"><canvas data-i="martelo" width="14" height="10"></canvas><b>${FERRAMENTAS.reduce((a,f)=>a+(S.estoque[f]||0),0)}</b></span>`+
`<span class="rec" title="Colonos livres na sede / trabalhando / soldados"><b>${S.pop}</b> livres · <b>${J.col.filter(u=>!u.dono&&u.of!='burro'&&u.of!='soldado').length}</b> trabalhando · <b>${soldadosDe(0)}</b> soldados</span>`;
document.querySelectorAll('#estoque canvas').forEach(c=>{const x=c.getContext('2d');desenhaItem(x,c.dataset.i,7,8)});
// O topo pode quebrar em duas linhas em telas menores: o painel do lado desce junto
$('lado').style.top=($('topo').offsetHeight+18)+'px';
mostraInfo(MOSTRA)}
let MOSTRA=null;
function mostraInfo(f){MOSTRA=f||null;const el=$('info');if(!J)return;
const ferr=f||(FER!='sel'?FER:null);
if(ferr&&!SEL){const T=TIPOS[ferr],it=infoFerr(ferr);el.innerHTML=T?`<h3>${T.n}</h3><p>${T.d}</p><p class="custo">Custo: ${custoTxt(T.custo)}</p><p class="dica">Os lugares verdes no mapa aceitam o prédio. A bandeira da porta fica logo abaixo dele. Segure Shift para pôr vários seguidos.</p>${T.mina?`<p class="dica">Laranja: tem ${NOME_MIN[T.mina]} fora do território. Construa uma Guarita perto da fronteira (aba Militar) para alcançar.</p>`:''}`:`<h3>${it[1]}</h3><p>${it[2]}</p>`+(ferr=='estr'&&INI?'<p class="dica">Agora clique onde a estrada termina. Botão direito ou Esc cancela.</p>':'');return}
el.innerHTML=SEL?descreve(...SEL):'<p class="dica">Arraste com o mouse (ou use WASD) para mover o mapa e a roda para dar zoom. Escolha uma ferramenta abaixo.</p>'}
function descreve(x,y){const q=cel(x,y),u=q.uso;let h='';
if(u&&u.k=='p'){const p=J.pred.get(u.id),T=TIPOS[p.tipo];h=`<h3>${T.n}</h3>`;
const guarTxt=()=>p.guar.length?p.guar.map(s=>PATENTES[s.r]+' '+estrelas(s.r)).join(', '):'ninguém';
// Prédio do reino rival: guarnição e o botão de atacar (com quantos soldados dá para mandar)
if(p.dono){h=`<h3>${T.n} <small>· ${NOME_RIVAL}</small></h3>`;if(p.obra){h+='<p>Em obra.</p>';return h}
if(!p.guar){h+='<p>Prédio do reino rival. Tome um prédio militar perto para que este pegue fogo.</p>';return h}
const disp=contaAtacantes(p,0);h+=`<p>Guarnição: ${guarTxt()} (força ${forca(p.guar)}).</p>`;
h+=disp?`<div class="ataque"><p>Você pode mandar até ${disp} soldado${disp>1?'s':''} dos seus prédios militares a até ${ALCANCE_ATAQUE} casas.</p><div class="ctrl"><span>Atacar com:</span>${[1,2,3,5,disp].filter((n,i,a)=>n<=disp&&a.indexOf(n)==i).map(n=>`<button data-acao="ataca" data-v="${n}">${n==disp&&n>1?'todos ('+n+')':n}</button>`).join('')}</div></div>`
:`<p class="dica">Para atacar, tenha soldados de sobra (mais de 1 por prédio, 2 na sede) num prédio militar seu a até ${ALCANCE_ATAQUE} casas daqui.</p>`;
if(p.tipo=='sede')h+='<p class="dica">Tomar a sede do rival vence a partida.</p>';return h}
if(p.guar&&!p.obra&&p!=J.sede){h+=`<p>${T.d}</p><p>Guarnição: ${p.guar.length}/${T.vagas} · ${guarTxt()}.</p>`;const vindo=J.col.filter(x=>x.of=='soldado'&&!x.dono&&x.est=='vai'&&x.p==p.id).length;
if(vindo)h+=`<p>${vindo} soldado${vindo>1?'s':''} a caminho.</p>`;else if(p.guar.length<T.vagas&&!(J.sede.estoque.espada>0))h+=`<p class="aviso">⚠ Faltam espadas na sede para mandar soldados. Construa uma Armaria (aba Militar).</p>`;
if(p!=J.sede&&!naRede(p.band))h+='<p class="aviso">⚠ Sem estrada até a sede: os soldados não chegam.</p>';
h+=`<p class="dica">Com ouro na sede, um soldado sobe de patente a cada ${PROMO_S} s (Recruta → Cabo → Sargento → Capitão).</p>`;if(p==J.sede)h+=`<p>Colonos livres: ${p.pop}. Estoque de espadas: ${p.estoque.espada||0}.</p>`;return h}
if(p.tipo=='armazem'&&!p.obra){const tem=Object.keys(ITEM).filter(t=>p.estoque[t]>0);h+=`<p>${T.d}</p><p>Guardado aqui: ${tem.length?tem.map(t=>nItem(t,p.estoque[t])).join(', '):'nada ainda'}.</p>`}
else if(p==J.sede)h+=`<p>${T.d}</p><p>Guarnição: ${p.guar.length}/${T.vagas} · ${guarTxt()}. Espadas: ${p.estoque.espada||0}.</p><p>Estoque: ${Object.keys(ITEM).filter(t=>!FERRAMENTAS.includes(t)).map(t=>nItem(t,p.estoque[t]||0)).join(', ')}.</p><p>Ferramentas: ${FERRAMENTAS.map(f=>nItem(f,p.estoque[f]||0)).join(', ')}.</p><p>Colonos livres: ${p.pop}. Nascidos da comida: ${J.nascidos||0}.</p>`;
else if(p.obra){const o=p.obra;h+=`<p>Em obra: ${Object.entries(T.custo).map(([t,n])=>`${ITEM[t]} ${o.tem[t]||0}/${n}`).join(' · ')}</p><div class="barra"><i style="width:${Math.round(o.feito/o.total*100)}%"></i></div>`;
h+=`<p class="dica">${!naRede(p.band)?'⚠ Sem estrada até a sede: o material não chega.':p.obreiro?p.obreiro.est=='vai'?'O construtor está a caminho.':p.obreiro.trab?'O construtor está trabalhando.':'O construtor espera o material.':'Esperando um construtor.'}</p>`;
if(naRede(p.band)&&!p.obreiro){const a=avisoFerramenta('construtor');if(a)h+=a}}
else{h+=`<p>${T.d}</p><p>${p.trab?p.trab.est=='vai'?'O '+OFICIO[T.of].n.toLowerCase()+' está a caminho.':p.status:naRede(p.band)?'Esperando um '+OFICIO[T.of].n.toLowerCase()+'.':'⚠ Sem estrada até a sede.'}</p>`;
if(!p.trab&&naRede(p.band)){const a=avisoFerramenta(T.of);if(a)h+=a}
if(T.entrada)for(const[t,n]of Object.entries(T.entrada))h+=`<p>Guardado: ${p.estoque[t]||0}/${n} ${PLURAL[t]}</p>`;
const pq=porQueParou(p);if(pq)h+=`<p class="aviso">⚠ ${pq}</p>`;
if(T.mina){let s=0;for(let j=-T.raio;j<=T.raio;j++)for(let i=-T.raio;i<=T.raio;i++){const m=cel(p.x+i,p.y+j);if(m&&m.min&&m.min.k==T.mina&&Math.hypot(i,j)<=T.raio+.3)s+=m.min.q}h+=`<p>Ainda dá para tirar: ${s} de ${NOME_MIN[T.mina]}.</p>`}}
// Prioridade e parar/retomar (prédios que recebem mercadorias ou produzem)
if(p!=J.sede&&p.tipo!='armazem'){const pr=p.prio||0;h+=`<div class="ctrl"><span>Prioridade:</span>${[[-1,'baixa'],[0,'normal'],[1,'alta']].map(([v,n])=>`<button data-acao="prio" data-v="${v}" class="${pr==v?'on':''}">${n}</button>`).join('')}</div>`;
if(!p.obra&&T.of&&p.tipo!='guarita')h+=`<div class="ctrl"><button data-acao="parar">${p.parado?'▶ Retomar produção':'⏸ Parar produção'}</button></div>`}}
else if(u&&u.k=='b'){const f=J.band.get(u.key);h=`<h3>Bandeira</h3><p>${f.itens.length?f.itens.length+' mercadoria(s) esperando: '+f.itens.map(i=>ITEM[i.tipo]).join(', '):'Nenhuma mercadoria esperando.'}</p><p class="dica">${naRede(f.key)?'Ligada à sede.':'⚠ Não está ligada à sede.'}</p>`}
else if(u&&u.k=='e'){const e=J.est.get(u.id),c=e.car;h=`<h3>Estrada</h3><p>${e.len} passos de uma bandeira à outra.</p><p>${!c?'Esperando um carregador.':c.est=='vai'?'O carregador está a caminho.':c.item?'O carregador leva: '+ITEM[c.item.tipo]+'.':'O carregador espera mercadorias.'}</p>${e.burro?'<p>🫏 Um burro ajuda nesta estrada.</p>':(e.ocup||0)>=10?'<p class="aviso">⚠ Estrada cheia: '+(estoqueTotal('burro')>0?'um burro está vindo ajudar.':'faltam burros na sede (construa um Estábulo, aba Comida).')+'</p>':''}<p class="dica">Estradas longas ficam mais rápidas com uma bandeira no meio.</p>`}
else{h=`<h3>${TER[q.t].n}</h3>`;const o=q.obj;if(o)h+=`<p>${NOME_OBJ[o.k]}${o.cresce<1?' crescendo ('+Math.round(o.cresce*100)+'%)':''}${o.k=='R'?' · ainda dá '+nItem('pedra',o.q):''}</p>`;if(q.min&&q.desc)h+=`<p>Minério de ${NOME_MIN[q.min.k]} aqui: ainda dá ${q.min.q}.</p>`;else if(q.t=='m')h+=`<p class="dica">${q.desc?'O geólogo não achou minério aqui.':'Ninguém sabe o que tem aqui dentro. Mande um Geólogo (aba Minas).'}</p>`;if(!q.dono)h+='<p class="dica">Fora do território. Construa uma guarita perto da fronteira para crescer.</p>'}
return h}
// Objetivos do começo de jogo (guiam o jogador pela cadeia de produção)
const OBJETIVOS=[
['Construa um Lenhador perto da floresta e ligue a bandeira dele à sede com uma estrada.',()=>pronto('lenhador')],
['Construa uma Serraria: ela transforma toras em tábuas.',()=>pronto('serraria')],
['Construa uma Pedreira perto das rochas cinzentas.',()=>pronto('pedreira')],
['Construa um Florestal para a floresta nunca acabar.',()=>pronto('florestal')],
['Produza 10 tábuas na serraria.',()=>(J.feito.tabua||0)>=10],
['Construa uma Guarita perto da fronteira para o reino crescer.',()=>[...J.pred.values()].some(p=>p.tipo=='guarita'&&!p.dono&&p.guar&&p.guar.length)],
['Construa um Pescador perto da água.',()=>pronto('pescador')],
['Construa uma Fazenda e um Moinho para ter farinha.',()=>pronto('fazenda')&&pronto('moinho')],
['Construa uma Padaria e asse 5 pães.',()=>(J.feito.pao||0)>=5],
['Alimente o reino: 5 colonos novos nascidos da comida.',()=>(J.nascidos||0)>=5],
['Construa uma Mina de carvão e uma Mina de ferro na serra (aba Minas).',()=>pronto('mina_carvao')&&pronto('mina_ferro')],
['Construa uma Fundição e faça 5 barras de ferro.',()=>(J.feito.barra||0)>=5],
['Encontre ouro: construa uma Mina de ouro e junte 5 ouros.',()=>(J.feito.ouro||0)>=5],
['Construa uma Ferraria (aba Minas) e forje 5 ferramentas.',()=>FERRAMENTAS.reduce((a,f)=>a+(J.feito[f]||0),0)>=5],
['Mande um Geólogo (aba Minas) a uma bandeira perto da serra.',()=>(J.geol||0)>0],
['Construa um Armazém longe da sede (aba Construção).',()=>pronto('armazem')],
['Ponha um burro para ajudar numa estrada cheia (Estábulo, aba Comida).',()=>[...J.est.values()].some(e=>e.burro)],
['Construa uma Armaria (aba Militar) e faça 3 espadas.',()=>(J.feito.espada||0)>=3],
['Construa um Quartel na fronteira com o '+NOME_RIVAL+'.',()=>[...J.pred.values()].some(p=>p.tipo=='quartel'&&!p.dono&&p.guar&&p.guar.length)],
['Promova um soldado com ouro.',()=>(J.promovidos||0)>0],
['Tome um prédio militar do '+NOME_RIVAL+' (clique nele e em Atacar).',()=>(J.conquistas||0)>0],
['Tome a sede do '+NOME_RIVAL+' e vença!',()=>J.fim=='vitoria']];
// ---------- Vitória e derrota ----------
function mostraFim(tipo){const v=tipo=='vitoria';$('fim-tit').textContent=v?'Vitória!':'Derrota';
$('fim-txt').textContent=v?'Você tomou a sede do '+NOME_RIVAL+'. O mapa inteiro é seu: continue construindo ou comece um mapa novo.':'O '+NOME_RIVAL+' tomou a sua sede. Comece um mapa novo para tentar de novo.';
$('fim').hidden=false;toca(v?'vitoria':'derrota',.9);if(!v)veloc(0)}
function fechaFim(){$('fim').hidden=true}
// Aviso de ferramenta faltando para um ofício (ou vazio se a sede tem, ou se o ofício não usa)
function avisoFerramenta(of){const f=FERRAMENTA[of];if(!f||J.sede.estoque[f]>0)return'';
return`<p class="aviso">⚠ Falta ${ITEM[f].toLowerCase()} na sede para o ${OFICIO[of].n.toLowerCase()}. ${pronto('ferraria')?'A Ferraria vai forjar.':'Construa uma Ferraria (aba Minas): ela faz ferramentas com barras de ferro e tábuas.'}</p>`}
function objetivos(){while(J.obj<OBJETIVOS.length&&OBJETIVOS[J.obj][1]()){J.obj++;aviso(J.obj<OBJETIVOS.length?'Objetivo cumprido! Próximo: '+OBJETIVOS[J.obj][0]:'Todos os objetivos cumpridos. O reino é seu!')}
// Mostra só o último cumprido, o atual e os dois seguintes
$('obj').innerHTML=`<h3>Objetivos <small>${Math.min(J.obj,OBJETIVOS.length)}/${OBJETIVOS.length}</small></h3><ol start="${Math.max(1,J.obj)}">`+OBJETIVOS.map(([t],i)=>[t,i]).slice(Math.max(0,J.obj-1),J.obj+3).map(([t,i])=>`<li class="${i<J.obj?'ok':i==J.obj?'agora':''}">${t}</li>`).join('')+'</ol>'}
let avT=0;function aviso(t){const el=$('msg');el.textContent=t;el.classList.add('on');clearTimeout(avT);avT=setTimeout(()=>el.classList.remove('on'),4500)}

// ---------- Controles ----------
// Casa sob o ponto da tela (a da frente, quando os blocos altos se sobrepõem).
function pega(sx,sy){const r=cv.getBoundingClientRect(),W=cv.clientWidth,H=cv.clientHeight,wx=(sx-r.left-W/2)/CAM.z+CAM.x,wy=(sy-r.top-H/2)/CAM.z+CAM.y,wh=wy+S;
const fx=Math.floor((wx/32+wh/16)/2),fy=Math.floor((wh/16-wx/32)/2);let m=null,md=-1;
for(let j=-2;j<=4;j++)for(let i=-2;i<=4;i++){const x=fx+i,y=fy+j;if(!inb(x,y))continue;const[cx,cy]=P(x,y);if(Math.abs(wx-cx)/32+Math.abs(wy-cy)/16<=1&&x+y>md){md=x+y;m=[x,y]}}return m}
// Bandeira de onde a estrada sai, ou onde ela chega: a própria bandeira ou a bandeira da porta de um prédio.
function bandeiraEm(x,y){const u=cel(x,y).uso;return u&&u.k=='b'?u.key:u&&u.k=='p'?J.pred.get(u.id).band:null}
function previa(){PREV=null;if(FER!='estr'||!INI||!HOV)return;const f=J.band.get(INI),fb=bandeiraEm(...HOV),[ex,ey]=fb?fb.split(',').map(Number):HOV;if(fb==INI)return;
const ok=(x,y,px,py)=>{const q=cel(x,y),p=cel(px,py);if(Math.abs(q.h-p.h)>1||q.t=='a'||!q.dono)return false;if(x==ex&&y==ey)return true;return!q.uso&&!bloqueia(q.obj)};
const cam=caminho(f.x,f.y,ex,ey,ok,false,false);if(!cam){PREV={cam:[[ex,ey]],ok:false,erro:'Não há caminho livre até aqui.'};return}
const erro=cam.length<2?'A estrada é curta demais: as bandeiras precisam ficar mais longe.':!fb&&erroBandeira(ex,ey)?'Não dá para terminar aqui: '+erroBandeira(ex,ey).toLowerCase()+'.':'';PREV={cam,ok:!erro,erro}}
// shift: continua com a mesma ferramenta (vários prédios ou geólogos seguidos)
function clica(x,y,shift){const q=cel(x,y);
if(FER=='sel'){SEL=[x,y];mostraInfo();return}
if(FER=='band'){const e=erroBandeira(x,y);if(e){aviso(e+'.');toca('erro',.5)}else{criaBandeira(x,y);toca('estrada',.6)}return}
if(FER=='estr'){const fb=bandeiraEm(x,y);if(!INI){if(fb){INI=fb;previa();mostraInfo()}else aviso('Comece a estrada numa bandeira ou num prédio.');return}
if(fb==INI){INI=null;PREV=null;return}previa();if(!PREV||!PREV.ok){aviso(PREV&&PREV.erro||'Não dá para fazer a estrada até aqui.');toca('erro',.5);return}
const f=J.band.get(INI),cam=[[f.x,f.y],...PREV.cam],[ex,ey]=cam[cam.length-1];let fim=bandeiraEm(ex,ey);if(!fim)fim=criaBandeira(ex,ey);
criaEstrada(cam);toca('estrada',.7);INI=naRede(fim)&&fb?null:fim;PREV=null;if(!INI)escolhe('sel');return}
if(FER=='geologo'){const fb=bandeiraEm(x,y);if(!fb){aviso('Clique numa bandeira perto da serra.');toca('erro',.5);return}const e=enviaGeologo(fb);
if(e){aviso(e+'.');toca('erro',.5)}else{aviso('Um geólogo saiu da sede para examinar a serra.');toca('construir',.6);if(!shift)escolhe('sel')}return}
if(FER=='demol'){const u=q.uso;if(!u)return;if(u.k=='p'){const p=J.pred.get(u.id);if(p.dono){aviso('Este prédio é do '+NOME_RIVAL+': para tirá-lo de lá, ataque.');toca('erro',.5)}else if(p==J.sede)aviso('A sede não pode ser demolida.');else{demole(p);aviso(TIPOS[p.tipo].n+(TIPOS[p.tipo].fem?' demolida.':' demolido.'))}}
else if(u.k=='b'){if(u.key==J.sede.band)aviso('A bandeira da sede não pode ser removida.');else tiraBandeira(u.key)}else tiraEstrada(J.est.get(u.id));return}
if(TIPOS[FER]){const e=erroPredio(x,y,FER);if(e){aviso(e+(e=='Fora do território'?': construa uma Guarita perto da fronteira (aba Militar) para o reino crescer.':'.'));toca('erro',.5);return}const p=criaPredio(FER,x,y);toca('construir',.7);
// Como no Settlers: logo depois de pôr o prédio, já começa a estrada a partir da bandeira dele
if(!naRede(p.band)&&!shift){escolhe('estr');INI=p.band;mostraInfo();aviso('Agora ligue a bandeira do '+TIPOS[p.tipo].n+' à rede de estradas.')}}}
let arr=null;
cv.addEventListener('pointerdown',e=>{arr={x:e.clientX,y:e.clientY,cx:CAM.x,cy:CAM.y,b:e.button,mov:false};cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointermove',e=>{if(arr){const dx=e.clientX-arr.x,dy=e.clientY-arr.y;if(Math.hypot(dx,dy)>6)arr.mov=true;if(arr.mov){CAM.x=arr.cx-dx/CAM.z;CAM.y=arr.cy-dy/CAM.z}}
const h=pega(e.clientX,e.clientY);if(String(h)!=String(HOV)){HOV=h;previa()}});
cv.addEventListener('pointerup',e=>{const a=arr;arr=null;if(!a||a.mov)return;if(a.b==2){cancela();return}if(a.b==0&&HOV)clica(...HOV,e.shiftKey)});
// Botões do painel (prioridade, parar): o painel é redesenhado a cada 0,25 s, então o clique é pego no pointerdown
$('info').addEventListener('pointerdown',e=>{const b=e.target.closest('button[data-acao]');if(!b||!SEL)return;const u=cel(...SEL).uso;if(!u||u.k!='p')return;const p=J.pred.get(u.id);
if(b.dataset.acao=='ataca'){const n=ataca(p,+b.dataset.v,0);aviso(n?'⚔ '+n+' soldado'+(n>1?'s saíram':' saiu')+' para atacar '+(TIPOS[p.tipo].fem?'a ':'o ')+TIPOS[p.tipo].n+' do '+NOME_RIVAL+'!':'Nenhum soldado conseguiu chegar até lá.');toca(n?'corneta':'erro',.7);mostraInfo();return}
if(b.dataset.acao=='prio')p.prio=+b.dataset.v;else if(b.dataset.acao=='parar'){p.parado=!p.parado;if(!p.parado)p.status='Trabalhando'}toca('estrada',.5);mostraInfo()});
cv.addEventListener('pointerleave',()=>{HOV=null;PREV=null});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('wheel',e=>{e.preventDefault();const i=ZOOMS.indexOf(CAM.z),n=ZOOMS[Math.max(0,Math.min(ZOOMS.length-1,i+(e.deltaY<0?1:-1)))];if(n==CAM.z)return;
const r=cv.getBoundingClientRect(),mx=e.clientX-r.left-cv.clientWidth/2,my=e.clientY-r.top-cv.clientHeight/2;CAM.x+=mx/CAM.z-mx/n;CAM.y+=my/CAM.z-my/n;CAM.z=n},{passive:false});
addEventListener('keydown',e=>{const kk=e.key.toLowerCase();TECLAS.add(kk);
const n=/^[1-4]$/.test(kk)?+kk:0,ia=TECLAS_ABA.indexOf(kk),ca=CATEG[CAT][1];
if(kk=='escape')cancela();else if(kk=='tab'){e.preventDefault();CAT=(CAT+1)%CATEG.length;montaFerramentas()}
else if(n)escolhe(FERR[n-1][0]);else if(ia>=0&&ca[ia])escolhe(ca[ia]);else if(kk==' '){e.preventDefault();veloc(VEL?0:1)}});
addEventListener('keyup',e=>TECLAS.delete(e.key.toLowerCase()));addEventListener('blur',()=>TECLAS.clear());
function panTeclas(dt){const v=700*dt/CAM.z,T=TECLAS;if(T.has('a')||T.has('arrowleft'))CAM.x-=v;if(T.has('d')||T.has('arrowright'))CAM.x+=v;if(T.has('w')||T.has('arrowup'))CAM.y-=v;if(T.has('s')||T.has('arrowdown'))CAM.y+=v}
function veloc(v){VEL=v;document.querySelectorAll('#tempo button').forEach(b=>b.classList.toggle('on',+b.dataset.v==v))}
document.querySelectorAll('#tempo button').forEach(b=>b.onclick=()=>veloc(+b.dataset.v));
$('novo').onclick=()=>{if(confirm('Começar um mapa novo? O reino atual se perde.')){novoJogo(Date.now());salva()}};
$('salvar').onclick=()=>aviso(salva()?'Reino salvo.':'Não deu para salvar neste navegador.');
$('som').textContent=nomeModo();$('som').onclick=()=>{$('som').textContent=trocaModo()};
$('fim-cont').onclick=fechaFim;$('fim-novo').onclick=()=>{novoJogo(Date.now());salva();veloc(1)};ligaStats();

// Começo: continua o reino salvo, se houver. O jogo se salva sozinho a cada 20 s e ao fechar a página.
montaFerramentas();
if(temSave()&&carrega()){escolhe('sel');aviso('Bem-vindo de volta! Seu reino foi carregado.')}else novoJogo(20261016);
veloc(1);objetivos();hud();requestAnimationFrame(quadro);
setInterval(salva,20000);addEventListener('pagehide',salva);addEventListener('visibilitychange',()=>{if(document.hidden)salva()});
