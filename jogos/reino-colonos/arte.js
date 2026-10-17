// ===================== ARTE: TERRENO, OBJETOS, PRÉDIOS E COLONOS =====================
// Tudo é pintado pelo código em pixel art, com contorno escuro automático e luz vindo de cima à esquerda.
// O terreno, as árvores e o contorno vêm do motor de arte do Crepúsculo dos Reinos.
const S=14; // altura de um degrau de terreno, em pixels
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
function semente(n){let s=(Math.abs(Math.floor(n))%2147483646)+1;return()=>(s=s*16807%2147483647)/2147483647}
const tom=(h,f)=>'#'+rgb(h).map(v=>Math.max(0,Math.min(255,Math.round(v*f))).toString(16).padStart(2,'0')).join('');
// Contorno: todo pixel vazio encostado num pixel pintado vira a cor do contorno.
function contorno(c,cor){const x=c.getContext('2d'),im=x.getImageData(0,0,c.width,c.height),d=im.data,W=c.width,H=c.height,marca=[];
for(let y=0;y<H;y++)for(let i=0;i<W;i++){if(d[(y*W+i)*4+3])continue;
for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=i+a,ny=y+b;if(nx>=0&&ny>=0&&nx<W&&ny<H&&d[(ny*W+nx)*4+3]>40){marca.push(i,y);break}}}
x.fillStyle=cor;for(let n=0;n<marca.length;n+=2)x.fillRect(marca[n],marca[n+1],1,1);return c}
function bolha(x,cx,cy,rad,cor){x.fillStyle=cor;for(let yy=-rad;yy<=rad;yy++){const w=Math.floor(Math.sqrt(rad*rad-yy*yy));x.fillRect(Math.round(cx-w),Math.round(cy+yy),w*2+1,1)}}
const tela=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
// Polígono convexo pintado coluna a coluna, sem borrar as bordas (fica pixel art de verdade).
function polP(x,pts,cor){x.fillStyle=cor;const xs=pts.map(p=>p[0]),x0=Math.floor(Math.min(...xs)),x1=Math.ceil(Math.max(...xs));
for(let c=x0;c<x1;c++){const cx=c+.5;let lo=1e9,hi=-1e9;for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length];if((p[0]-cx)*(q[0]-cx)>0)continue;
const t=(cx-p[0])/(q[0]-p[0]),y=p[1]+(q[1]-p[1])*t;lo=Math.min(lo,y);hi=Math.max(hi,y)}
if(hi>lo)x.fillRect(c,Math.round(lo),1,Math.round(hi)-Math.round(lo))}}
// Linha na inclinação isométrica (2 para 1). sobe: true vai para cima à direita.
function lin21(x,x0,y0,n,cor,sobe){x.fillStyle=cor;for(let i=0;i<n;i++)x.fillRect(Math.round(x0+i),Math.round(y0+(sobe?-1:1)*Math.floor(i/2)),1,1)}

// ---------- Terreno com textura ----------
// c: cor do topo por altura (0 a 3).
const TER={
g:{n:'Grama',c:['#5f8f52','#78a35f','#93b36a','#a8c27a']},
s:{n:'Areia',c:['#d8c28a','#e0cc96','#e8d6a2','#eedcaa']},
a:{n:'Água',c:['#2f6fa8','#3474ae','#3979b4','#3e7eba'],agua:true},
m:{n:'Pedra da serra',c:['#8e8676','#9a9282','#a69e8e','#b2aa9a']}};
const TXC={},LADOS={terra:['#8a6a44','#6b5034'],pedra:['#9c9888','#77736a'],agua:['#3e6f8f','#2c5470'],areia:['#c4a066','#a4824c']};
const ladoDe=id=>id=='a'?'agua':id=='s'?'areia':id=='m'?'pedra':'terra';
// Cada casa vira um bloco pintado: topo com textura e laterais de terra ou pedra em camadas. v varia o desenho entre casas.
function bloco(id,h,v){const k=id+h+'_'+v;if(TXC[k])return TXC[k];const T=TER[id],dp=h*S+10,c=tela(64,33+dp);
const x=c.getContext('2d'),r=semente(h*977+v*131+id.charCodeAt(0)*31+7),cor=T.c[Math.min(h,T.c.length-1)],[l1,l2]=LADOS[ladoDe(id)];
const forma=pts=>{x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath()};
const TOPO=[[32,0],[64,16],[32,32],[0,16]],ESQ=[[0,16],[32,32],[32,32+dp],[0,16+dp]],DIR=[[64,16],[32,32],[32,32+dp],[64,16+dp]];
for(const[F2,base,lado]of[[ESQ,l1,-1],[DIR,l2,1]]){x.save();forma(F2);x.fillStyle=base;x.fill();x.clip();
for(let n=0;n<dp*2;n++){const px=r()*32,ox=lado<0?px:32+px,oy=(lado<0?16+px*.5:32-px*.5)+r()*dp;x.fillStyle=r()<.5?'rgba(255,240,210,.16)':'rgba(30,20,10,.22)';x.fillRect(Math.floor(ox),Math.floor(oy),2+Math.floor(r()*3),2)}
for(let s=6;s<dp;s+=7){x.strokeStyle='rgba(30,20,10,.22)';x.beginPath();x.moveTo(lado<0?0:64,16+s);x.lineTo(32,32+s);x.stroke()}
// Grama escorrendo pela borda
if(id=='g'){x.fillStyle=tom(cor,.72);x.beginPath();x.moveTo(lado<0?0:64,16);x.lineTo(32,32);x.lineTo(32,35);x.lineTo(lado<0?0:64,19);x.closePath();x.fill();
for(let n=0;n<6;n++){const px=r()*30+1,ox=lado<0?px:32+px,oy=(lado<0?16+px*.5:32-px*.5)+2;x.fillRect(Math.floor(ox),Math.floor(oy),1,2+Math.floor(r()*4))}}
x.restore()}
x.save();forma(TOPO);x.fillStyle=cor;x.fill();x.clip();
for(let n=0;n<130;n++){x.fillStyle=r()<.5?'rgba(255,255,230,.14)':'rgba(20,30,10,.16)';x.fillRect(Math.floor(r()*64),Math.floor(r()*32),1+Math.floor(r()*2),1)}
const P2=(u,w)=>[32+u*32-w*32,u*16+w*16];
if(id=='g'){for(let n=0;n<16;n++){const[a,b]=P2(r(),r());x.fillStyle=tom(cor,.6);x.fillRect(Math.floor(a),Math.floor(b),1,2);x.fillStyle=tom(cor,1.25);x.fillRect(Math.floor(a),Math.floor(b)-1,1,1)}}
if(id=='m'){for(let n=0;n<22;n++){const[a,b]=P2(r(),r());x.fillStyle=r()<.5?'#6e675a':'#d6cfbf';x.fillRect(Math.floor(a),Math.floor(b),2,1)}x.strokeStyle='rgba(60,55,45,.5)';for(let n=0;n<2;n++){const[a,b]=P2(r(),r());x.beginPath();x.moveTo(a,b);x.lineTo(a+4+r()*6,b+2+r()*3);x.lineTo(a+8+r()*6,b+r()*4);x.stroke()}}
if(id=='s'){for(let n=0;n<24;n++){const[a,b]=P2(r(),r());x.fillStyle=r()<.5?'#b8a070':'#f4e6be';x.fillRect(Math.floor(a),Math.floor(b),1,1)}}
if(id=='a'){for(let n=0;n<5;n++){const[a,b]=P2(r(),r());x.fillStyle='rgba(255,255,255,.12)';x.fillRect(Math.floor(a),Math.floor(b),5,1)}}
x.restore();
x.strokeStyle='rgba(20,14,10,.6)';x.lineWidth=1;for(const F2 of[ESQ,DIR,TOPO]){forma(F2);x.stroke()}
return TXC[k]=c}

// ---------- Árvores, arbustos, flores e rochas ----------
const OBC={};
function objImg(ch,v){const k=ch+v;if(OBC[k])return OBC[k];const c=tela(60,84),x=c.getContext('2d'),r=semente(v*97+ch.charCodeAt(0)*13+3);
const R=(a,b,w,h,cor)=>{x.fillStyle=cor;x.fillRect(a,b,w,h)};
if(ch=='T'){R(27,50,7,30,'#6b4a2a');R(27,50,2,30,'#8a6440');R(31,50,3,30,'#4e3420');R(23,77,15,3,'#5a3c22');R(21,50,7,3,'#6b4a2a');R(33,46,8,3,'#5e4026');
const bs=[...Array(9)].map(()=>({x:30+(r()-.5)*28,y:30+(r()-.5)*22,r:10+Math.floor(r()*6)}));
for(const q of bs)bolha(x,q.x,q.y,q.r,'#2f6b2a');for(const q of bs)bolha(x,q.x-2,q.y-3,q.r-3,'#4c9a3a');for(const q of bs)bolha(x,q.x-4,q.y-5,Math.max(2,q.r-8),'#7cc24e');
for(let n=0;n<14;n++)R(Math.floor(12+r()*36),Math.floor(10+r()*36),1,1,'#b6e07a')}
else if(ch=='B'){c.width=34;c.height=20;for(const[a,b,rr]of[[10,12,6],[18,10,7],[25,12,6]])bolha(x,a,b,rr,'#2f6b2a');for(const[a,b,rr]of[[9,10,4],[17,8,5],[24,10,4]])bolha(x,a,b,rr,'#4c9a3a');
for(let n=0;n<5;n++)R(Math.floor(6+r()*22),Math.floor(5+r()*8),1,1,'#9ad46a')}
return OBC[k]=contorno(c,'#1b1410')}
// Rocha da pedreira: q é quantas pedras ainda dá para tirar (cada pedra a menos, a pilha encolhe).
const ROC={};
function rochaImg(q,v){const k=q+'_'+v;if(ROC[k])return ROC[k];const c=tela(44,34),x=c.getContext('2d'),r=semente(v*71+5);
const pd=[[22,23,9],[12,25,6],[32,25,6],[17,16,6],[28,16,5],[22,10,4]].slice(0,Math.max(1,q)).sort((a,b)=>a[1]-b[1]);
for(const[a,b,rr]of pd){bolha(x,a,b,rr,'#6e6a62');bolha(x,a-1,b-2,rr-2,'#9a968a');bolha(x,a-2,b-3,Math.max(1,rr-5),'#c4c0b4')}
for(let n=0;n<10;n++){x.fillStyle='rgba(60,55,45,.6)';x.fillRect(Math.floor(6+r()*32),Math.floor(8+r()*22),1,1)}
return ROC[k]=contorno(c,'#1b1410')}
function flores(g,cx,cy){const r=semente(cx*7+cy*13);for(let n=0;n<7;n++){const a=Math.round(cx+(r()-.5)*36),b=Math.round(cy+(r()-.5)*14);g.fillStyle=r()<.5?'#f2a6c6':'#f7e27a';g.fillRect(a,b,3,3);g.fillStyle='#fff8e0';g.fillRect(a,b,1,1)}}

// ---------- Mercadorias ----------
const ITEM={tora:'Tora',tabua:'Tábua',pedra:'Pedra',peixe:'Peixe',trigo:'Trigo',farinha:'Farinha',pao:'Pão',carvao:'Carvão',ferro:'Minério de ferro',ouro:'Ouro',barra:'Barra de ferro',
machado:'Machado',picareta:'Picareta',pa:'Pá',foice:'Foice',vara:'Vara de pesca',martelo:'Martelo',serrote:'Serrote',burro:'Burro',espada:'Espada'};
const PLURAL={tora:'toras',tabua:'tábuas',pedra:'pedras',peixe:'peixes',trigo:'trigo',farinha:'farinha',pao:'pães',carvao:'carvão',ferro:'minério de ferro',ouro:'ouro',barra:'barras de ferro',
machado:'machados',picareta:'picaretas',pa:'pás',foice:'foices',vara:'varas de pesca',martelo:'martelos',serrote:'serrotes',burro:'burros',espada:'espadas'};
// Cor de cada minério: no chão da serra, no carrinho da mina e na mercadoria
const COR_MIN={carvao:['#2a2a32','#5a5a66'],ferro:['#8a4a32','#c8805a'],ouro:['#d8a830','#fff0a0']};
// Pedrinhas de minério aparecendo no topo da casa de serra (quantas, conforme o que sobra)
// (só aparece onde o minério já é conhecido, q.desc: ver jogo.js)
function marcaMinerio(g,m,cx,cy){const[c1,c2]=COR_MIN[m.k],r=semente(cx*3+cy*7),n=Math.min(5,Math.ceil(m.q/2));for(let i=0;i<n;i++){const a=Math.round(cx+(r()-.5)*30),b=Math.round(cy+(r()-.5)*12);
g.fillStyle='#1a1410';g.fillRect(a-1,b-1,5,4);g.fillStyle=c1;g.fillRect(a,b,3,2);g.fillStyle=c2;g.fillRect(a,b,1,1)}}
function desenhaItem(g,t,x,y){x=Math.round(x);y=Math.round(y);const R=(a,b,w,h,c)=>{g.fillStyle=c;g.fillRect(x+a,y+b,w,h)};
if(t=='tora'){R(-5,-4,11,5,'#1a1008');R(-4,-3,8,3,'#8a5a2b');R(-4,-3,8,1,'#a8743a');R(4,-3,1,3,'#e0bc80');R(3,-3,1,1,'#c89a5a')}
else if(t=='tabua'){R(-6,-3,12,4,'#1a1008');R(-5,-2,10,2,'#d8b878');R(-5,-2,10,1,'#efd49a');R(-1,-2,1,2,'#a8884e')}
else if(t=='pedra'){R(-4,-5,8,6,'#1a1410');R(-3,-4,6,4,'#9a968a');R(-3,-4,4,1,'#c4c0b4');R(1,-1,2,1,'#6e6a60')}
else if(t=='peixe'){R(-6,-4,12,5,'#1a1410');R(-5,-3,8,3,'#8ab0c8');R(-5,-3,8,1,'#c8e0ee');R(3,-4,2,5,'#6a90a8');R(-4,-2,1,1,'#1a1410')}
else if(t=='trigo'){R(-3,-7,7,8,'#1a1008');R(-2,-6,5,6,'#e0b848');R(-2,-6,5,2,'#f4d878');R(-2,-3,5,1,'#a8843a')}
else if(t=='farinha'){R(-4,-6,8,7,'#1a1410');R(-3,-5,6,5,'#f0ece0');R(-3,-5,6,1,'#ffffff');R(-1,-6,2,1,'#c8b898');R(-3,-1,6,1,'#c8c0b0')}
else if(t=='pao'){R(-5,-4,10,5,'#1a1008');R(-4,-3,8,3,'#c8803a');R(-4,-3,8,1,'#e8a858');R(-2,-3,1,1,'#f4d098');R(1,-3,1,1,'#f4d098')}
else if(COR_MIN[t]){const[c1,c2]=COR_MIN[t];R(-5,-5,10,6,'#1a1410');R(-4,-4,8,4,c1);R(-4,-4,3,1,c2);R(1,-3,2,1,c2);R(-2,-1,2,1,c2)}
else if(t=='barra'){R(-6,-4,12,5,'#1a1410');R(-5,-3,10,3,'#8a8e9a');R(-4,-3,8,1,'#d8dce4');R(-5,-1,10,1,'#5a5e6a')}
// Burro indo do estábulo para a sede (cabecinha com orelhas)
else if(t=='burro'){R(-5,-6,10,8,'#1a1410');R(-4,-3,7,4,'#8a8278');R(-4,-3,7,1,'#a8a096');R(-3,-5,1,2,'#8a8278');R(0,-5,1,2,'#8a8278');R(2,-1,2,1,'#2a2420');R(-3,-2,1,1,'#1a1410')}
else if(t=='espada'){R(-1,-7,3,12,'#1a1410');R(0,-6,1,8,'#dfe4ec');R(-3,2,7,2,'#1a1410');R(-2,2,5,1,'#d4a24a');R(-1,4,3,3,'#1a1410');R(0,4,1,2,'#8a5a2b')}
// Ferramentas: cabo de madeira e a parte de metal
else{const C='#1a1008',M='#c8ccd4',W='#8a5a2b';
if(t=='machado'){R(-6,-1,10,3,C);R(-5,0,8,1,W);R(2,-5,5,7,C);R(3,-4,3,5,M);R(3,-4,1,5,'#eef0f4')}
else if(t=='picareta'){R(-1,-3,3,8,C);R(0,-2,1,6,W);R(-6,-5,13,3,C);R(-5,-4,11,1,'#a0a4ac');R(-6,-3,1,2,C);R(6,-3,1,2,C)}
else if(t=='pa'){R(-1,-6,3,8,C);R(0,-5,1,6,W);R(-3,1,7,5,C);R(-2,2,5,3,'#a0a4ac');R(-2,2,5,1,M)}
else if(t=='foice'){R(-5,-1,11,3,C);R(-4,0,9,1,W);R(-6,-6,3,6,C);R(-5,-5,1,4,M);R(-6,-7,8,2,C);R(-5,-6,6,1,M)}
else if(t=='vara'){for(let i=0;i<11;i++)R(-6+i,2-Math.floor(i/2),2,2,C);for(let i=0;i<11;i++)R(-5+i,2-Math.floor(i/2),1,1,W);R(5,-4,1,6,'#dfe4ec')}
else if(t=='martelo'){R(-1,-2,3,8,C);R(0,-1,1,6,W);R(-4,-5,9,4,C);R(-3,-4,7,2,'#8a8a96');R(-3,-4,7,1,M)}
else if(t=='serrote'){R(-6,-3,10,5,C);R(-5,-2,8,2,M);for(let i=0;i<4;i++)R(-5+i*2,0,1,1,'#8a8e98');R(3,-4,4,6,C);R(4,-3,2,4,W)}}}
// Campo de trigo sobre a casa: st 0 a 2 crescendo (verde), 3 maduro (dourado). Âncora: (32, 17) é o centro da casa.
const CMP={};
function campoImg(st){if(CMP[st])return CMP[st];const c=tela(64,40),x=c.getContext('2d'),r=semente(st*31+9),P2=(u,w)=>[32+u*26-w*26,4+u*13+w*13];
polP(x,[[32,4],[58,17],[32,30],[6,17]],'#7a5a34');polP(x,[[32,6],[54,17],[32,28],[10,17]],'#8a6a40');
const alt=[1,3,5,7][st],cor=['#5a8a3a','#6fa040','#9ab848','#d8b040'][st];
for(let i=1;i<8;i++)for(let j=1;j<10;j++){const[a,b]=P2(i/8,j/10),px=Math.round(a+(r()-.5)),py=Math.round(b);x.fillStyle=tom(cor,.75);x.fillRect(px,py-alt,1,alt);x.fillStyle=cor;x.fillRect(px,py-alt,1,Math.max(1,alt-2));
if(st==3){x.fillStyle='#f4d878';x.fillRect(px,py-alt-1,1,2)}}
return CMP[st]=c}

// ---------- Prédios ----------
// Casa isométrica: paredes da esquerda (luz) e da direita (sombra) e telhado de duas águas.
// a, b: meia largura e meia profundidade da base (a = 2b, ambos pares); H: altura da parede; rh: altura do telhado.
function casa(x,ox,oy,o){const{a,b,H,rh}=o,L=[ox-a,oy],F=[ox,oy+b],D=[ox+a,oy],B=[ox,oy-b],up=(p,h)=>[p[0],p[1]-h];
const pe=o.parede,ps=tom(pe,.72),te=o.teto;
polP(x,[L,F,up(F,H),up(L,H)],pe);polP(x,[F,D,up(D,H),up(F,H)],ps);
// Textura das paredes: tábuas (madeira) ou blocos (pedra)
if(o.pedra){const r=semente(a*13+H);for(let h=4;h<H;h+=5){lin21(x,L[0],L[1]-h,a,tom(pe,.82));lin21(x,F[0],F[1]-h,a,tom(ps,.82),true)}
for(let n=0;n<a;n++){x.fillStyle=r()<.5?tom(pe,1.12):tom(pe,.88);const i=Math.floor(r()*a);x.fillRect(L[0]+i,L[1]+Math.floor(i/2)-2-Math.floor(r()*(H-3)),2,1)}}
else for(let h=3;h<H;h+=3){lin21(x,L[0],L[1]-h,a,tom(pe,.84));lin21(x,F[0],F[1]-h,a,tom(ps,.84),true)}
lin21(x,L[0],L[1]-H,a,tom(pe,1.2));
// Porta na parede da esquerda e janela na da direita
if(o.porta!==false){const c0=ox-Math.round(a*.55),w=6,ph=Math.min(11,H-2);for(let c=c0;c<c0+w;c++){const by=oy+Math.floor((c-(ox-a))/2);x.fillStyle=c==c0||c==c0+w-1?'#2a1a10':'#4a2e18';x.fillRect(c,by-ph,1,ph)}
x.fillStyle='#d4a24a';x.fillRect(c0+4,oy+Math.floor((c0+4-(ox-a))/2)-ph/2|0,1,1)}
if(o.janela!==false&&H>=12){const c0=ox+Math.round(a*.45);for(let c=c0;c<c0+5;c++){const by=oy+b-Math.floor((c-ox)/2);x.fillStyle=c==c0+1?'#ffe8a0':'#2a2438';x.fillRect(c,by-H+4,1,5)}}
if(!rh)return;
// Telhado: a cumeeira corre paralela à parede da esquerda
const Lt=up(L,H),Ft=up(F,H),Dt=up(D,H),Bt=up(B,H),Ra=[(B[0]+L[0])/2,(B[1]+L[1])/2-H-rh],Rb=[(D[0]+F[0])/2,(D[1]+F[1])/2-H-rh];
polP(x,[Ft,Dt,Rb],tom(pe,.82));
polP(x,[Bt,Dt,Rb,Ra],tom(te,.62));
const be=2,Le=[Lt[0]-be,Lt[1]+1],Fe=[Ft[0],Ft[1]+be];polP(x,[Le,Fe,Rb,Ra],te);
// Fileiras de telhas e cumeeira clara
for(let s=1;s<5;s++){const t=s/5,p=[Le[0]+(Ra[0]-Le[0])*t,Le[1]+(Ra[1]-Le[1])*t];lin21(x,p[0],p[1],a+be,tom(te,.78))}
lin21(x,Ra[0],Ra[1],a,tom(te,1.3));lin21(x,Le[0],Le[1],a+be,tom(te,.6))}
// Torre de base quadrada com telhado em pirâmide
function torre(x,ox,oy,o){casa(x,ox,oy,{...o,rh:0});const{a,b,H,rh}=o,Lt=[ox-a,oy-H],Ft=[ox,oy+b-H],Dt=[ox+a,oy-H],ap=[ox,oy-H-rh];
if(o.ameia){for(let c=ox-a;c<ox+a;c+=4){const by=c<ox?oy-H+Math.floor((c-(ox-a))/2):oy+b-H-Math.floor((c-ox)/2);x.fillStyle=c<ox?o.parede:tom(o.parede,.72);x.fillRect(c,by-4,2,4)}return}
polP(x,[[Lt[0]-2,Lt[1]+1],[Ft[0],Ft[1]+2],ap],o.teto);polP(x,[[Ft[0],Ft[1]+2],[Dt[0]+2,Dt[1]+1],ap],tom(o.teto,.7));lin21(x,Lt[0]-2,Lt[1]+1,a+2,tom(o.teto,.6))}
function bandeirola(x,px,py,cor){x.fillStyle='#3a2414';x.fillRect(px,py,1,14);x.fillStyle=cor;x.fillRect(px+1,py,7,5);x.fillStyle=tom(cor,1.3);x.fillRect(px+1,py,7,1);x.fillStyle='#ffd45a';x.fillRect(px+3,py+2,2,1)}
function pilhaToras(x,px,py,n){for(let i=0;i<n;i++){const a=px+(i%3)*5-(i>2?-2:0),b=py-Math.floor(i/3)*4;x.fillStyle='#8a5a2b';x.fillRect(a,b,5,3);x.fillStyle='#e0bc80';x.fillRect(a,b,2,3);x.fillStyle='#a8743a';x.fillRect(a,b,1,1)}}
function pilhaPedras(x,px,py,n){for(let i=0;i<n;i++){const a=px+(i%3)*5,b=py-Math.floor(i/3)*4;x.fillStyle='#8e8a7c';x.fillRect(a,b,5,4);x.fillStyle='#bab4a4';x.fillRect(a,b,4,1)}}
const COR_REINO='#2f6fd6';
const PRC={};
// obra: etapa da construção (0 a 3) ou null para o prédio pronto. Âncora: (48, 84) é o centro da casa.
function predioImg(tipo,obra,cor){cor=cor||COR_REINO;const kk=tipo+(obra==null?'':'_o'+obra)+cor;if(PRC[kk])return PRC[kk];const c=tela(96,104),x=c.getContext('2d'),ox=48,oy=84;
const R=(a,b,w,h,cor)=>{x.fillStyle=cor;x.fillRect(a,b,w,h)};
if(obra!=null){const a=20,b=10,p=(obra+1)/4,H=Math.round(14*p);polP(x,[[ox-a-2,oy],[ox,oy+b+1],[ox+a+2,oy],[ox,oy-b-1]],'#a8885c');
if(H>1)casa(x,ox,oy,{a,b,H,rh:0,parede:'#c8a070',porta:false,janela:false});
for(const[px,py]of[[ox-a,oy],[ox,oy+b],[ox+a,oy],[ox,oy-b]]){R(px-1,py-18,2,18,'#6b4a2a');R(px-1,py-18,1,18,'#8a6440')}
lin21(x,ox-a,oy-16,a,'#7a5232');lin21(x,ox,oy+b-16,a,'#5e4026',true);
return PRC[kk]=contorno(c,'#1a1410')}
if(tipo=='sede'){torre(x,ox+18,oy-14,{a:10,b:5,H:42,rh:16,parede:'#b4ae9c',teto:'#a8402e',pedra:true,porta:false});bandeirola(x,ox+18,oy-88,cor);
casa(x,ox-4,oy+2,{a:28,b:14,H:22,rh:14,parede:'#c4bca8',teto:'#a8402e',pedra:true});
torre(x,ox-30,oy+4,{a:6,b:3,H:30,rh:0,parede:'#b4ae9c',pedra:true,porta:false,janela:false,ameia:true})}
else if(tipo=='lenhador'){casa(x,ox,oy,{a:20,b:10,H:14,rh:12,parede:'#8a5a2b',teto:'#c8a050'});pilhaToras(x,ox-30,oy+4,5);
R(ox+20,oy+4,7,4,'#6b4a2a');R(ox+20,oy+4,7,1,'#c89a5a');R(ox+23,oy-2,1,6,'#5a3c22');R(ox+21,oy-3,4,2,'#c8ccd4')}
else if(tipo=='florestal'){casa(x,ox,oy,{a:20,b:10,H:14,rh:12,parede:'#9a6a3a',teto:'#4c8a3a'});
R(ox-28,oy-2,6,5,'#8a5a2b');R(ox-28,oy-2,6,1,'#a8743a');bolha(x,ox-25,oy-9,5,'#2f6b2a');bolha(x,ox-26,oy-10,3,'#4c9a3a');bolha(x,ox+26,oy+2,3,'#4c9a3a');R(ox+26,oy+4,1,4,'#6b4a2a')}
else if(tipo=='pedreira'){casa(x,ox,oy,{a:20,b:10,H:14,rh:10,parede:'#a9a594',teto:'#7a5a3a',pedra:true});pilhaPedras(x,ox+16,oy+8,5);
R(ox-28,oy+2,1,8,'#6b4a2a');R(ox-30,oy+1,5,2,'#a0a4ac')}
else if(tipo=='serraria'){casa(x,ox,oy,{a:24,b:12,H:16,rh:12,parede:'#7a5232',teto:'#8a3a2a'});pilhaToras(x,ox-34,oy+4,6);
const sx=ox+14,sy=oy-12;bolha(x,sx,sy,6,'#6e6a7a');bolha(x,sx-1,sy-1,4,'#b4b8c4');R(sx-1,sy-1,2,2,'#4a4a58');for(let i=0;i<8;i++){const an=i*Math.PI/4;R(Math.round(sx+Math.cos(an)*7),Math.round(sy+Math.sin(an)*7),1,1,'#dfe4ec')}
pilhaToras(x,ox+22,oy+10,0);R(ox+20,oy+8,10,2,'#d8b878');R(ox+20,oy+6,10,2,'#efd49a')}
else if(tipo=='guarita'){torre(x,ox,oy,{a:12,b:6,H:34,rh:14,parede:'#b4ae9c',teto:'#a8402e',pedra:true});bandeirola(x,ox,oy-68,cor)}
else if(tipo=='pescador'){casa(x,ox,oy,{a:20,b:10,H:12,rh:10,parede:'#7a6a5a',teto:'#3a6aa8'});
// Varal com peixes secando e um barril
R(ox+20,oy-14,1,16,'#5a3c22');R(ox+31,oy-9,1,14,'#5a3c22');for(let i=0;i<11;i++)R(ox+20+i,oy-14+Math.floor(i/2),1,1,'#3a2414');
for(const i of[2,5,8])R(ox+20+i,oy-13+Math.floor(i/2),2,4,'#8ab0c8');R(ox-31,oy-2,7,8,'#7a5232');R(ox-31,oy,7,1,'#4a3020');R(ox-31,oy+4,7,1,'#4a3020');R(ox-31,oy-2,7,1,'#a07848')}
else if(tipo=='fazenda'){casa(x,ox,oy,{a:24,b:12,H:16,rh:14,parede:'#a8402e',teto:'#5a4a3a'});
bolha(x,ox-31,oy+1,4,'#c8a038');bolha(x,ox-31,oy,3,'#e0b848');bolha(x,ox-24,oy+5,4,'#c8a038');bolha(x,ox-24,oy+4,3,'#e0b848');R(ox+27,oy-10,1,14,'#6b4a2a');R(ox+25,oy-11,5,1,'#a0a4ac');R(ox+25,oy-13,1,2,'#a0a4ac');R(ox+29,oy-13,1,2,'#a0a4ac')}
else if(tipo=='moinho'){torre(x,ox,oy,{a:12,b:6,H:34,rh:14,parede:'#e0d8c4',teto:'#7a5232',pedra:true});
for(const[a,b]of[[ox+15,oy+2],[ox+20,oy+5],[ox+17,oy-2]]){R(a,b,5,5,'#f0ece0');R(a,b,5,1,'#ffffff');R(a+1,b-1,3,1,'#c8b898')}}
else if(tipo=='padaria'){casa(x,ox,oy,{a:20,b:10,H:14,rh:12,parede:'#e0cfa8',teto:'#a8402e'});R(ox+2,oy-34,4,10,'#8e8a7c');R(ox+2,oy-34,4,1,'#b4b0a0');
// Forno de barro ao lado, com o fogo aceso
bolha(x,ox+27,oy+1,6,'#a8705a');bolha(x,ox+26,oy,4,'#c88a6a');R(ox+24,oy+2,5,4,'#2a1a10');R(ox+25,oy+4,3,2,'#ff9a3a');R(ox+26,oy+4,1,1,'#ffe08a')}
else if(tipo.startsWith('mina_')){const[c1,c2]=COR_MIN[tipo.slice(5)];
// Boca da mina escorada com madeira, cabana do mineiro e o carrinho cheio do minério
polP(x,[[ox-30,oy-2],[ox-14,oy-10],[ox-14,oy+8],[ox-30,oy+16]],'#4a4238');polP(x,[[ox-27,oy+1],[ox-17,oy-4],[ox-17,oy+8],[ox-27,oy+13]],'#0e0a08');
R(ox-28,oy-2,2,17,'#6b4a2a');R(ox-18,oy-7,2,16,'#5a3c22');for(let i=0;i<12;i++)R(ox-29+i,oy-3-Math.floor(i/2),1,2,'#7a5232');
casa(x,ox+6,oy-2,{a:16,b:8,H:12,rh:10,parede:'#7a5232',teto:'#5a5a64'});
R(ox-12,oy+10,12,6,'#5a5a64');R(ox-12,oy+10,12,1,'#8a8a96');R(ox-10,oy+16,3,3,'#2a2a30');R(ox-4,oy+16,3,3,'#2a2a30');
for(let i=0;i<5;i++)R(ox-11+i*2,oy+7+(i%2),3,3,c1);R(ox-9,oy+7,1,1,c2);R(ox-5,oy+8,1,1,c2);
bandeirola(x,ox+18,oy-30,c1=='#2a2a32'?'#5a5a66':c1)}
else if(tipo=='armazem'){casa(x,ox,oy,{a:28,b:14,H:20,rh:14,parede:'#9a7048',teto:'#6a5a4a'});
// Base de pedra, porta larga de celeiro, caixotes e barris do lado de fora
for(let c=ox-28;c<ox+28;c++){const by=c<ox?oy+Math.floor((c-(ox-28))/2):oy+14-Math.floor((c-ox)/2);x.fillStyle=c<ox?'#a9a594':'#7e7a6c';x.fillRect(c,by-4,1,4)}
for(let c=ox-20;c<ox-8;c++){const by=oy+Math.floor((c-(ox-28))/2);x.fillStyle=c==ox-20||c==ox-9?'#3a2414':(c-ox)%3?'#6b4426':'#5a3820';x.fillRect(c,by-15,1,15)}
R(ox+18,oy+2,7,6,'#8a5a2b');R(ox+18,oy+2,7,1,'#a8743a');R(ox+21,oy+2,1,6,'#5a3c22');R(ox+26,oy+6,6,6,'#8a5a2b');R(ox+26,oy+6,6,1,'#a8743a');
R(ox-34,oy+3,5,7,'#7a5232');R(ox-34,oy+5,5,1,'#4a3020');R(ox-34,oy+8,5,1,'#4a3020');R(ox-28,oy+6,5,7,'#7a5232');R(ox-28,oy+8,5,1,'#4a3020');R(ox-28,oy+11,5,1,'#4a3020');bandeirola(x,ox+2,oy-50,cor)}
else if(tipo=='estabulo'){casa(x,ox,oy,{a:24,b:12,H:14,rh:12,parede:'#8a5a2b',teto:'#c8a050'});
// Cercado com um burro e um monte de feno
for(let i=0;i<9;i++){R(ox+14+i*2,oy+4-i,1,6,'#6b4a2a')}for(let i=0;i<18;i++)R(ox+14+i,oy+5-Math.floor(i/2),1,1,'#8a6440');
R(ox+20,oy-2,7,4,'#8a8278');R(ox+26,oy-5,3,4,'#8a8278');R(ox+27,oy-7,1,2,'#8a8278');R(ox+21,oy+2,1,3,'#5a524a');R(ox+25,oy+2,1,3,'#5a524a');
bolha(x,ox-30,oy+2,5,'#c8a038');bolha(x,ox-30,oy+1,4,'#e0b848')}
else if(tipo=='quartel'){torre(x,ox+16,oy-10,{a:8,b:4,H:40,rh:12,parede:'#a9a594',teto:'#a8402e',pedra:true,porta:false,janela:false});bandeirola(x,ox+16,oy-74,cor);
torre(x,ox-2,oy+2,{a:22,b:11,H:20,parede:'#b4ae9c',pedra:true,ameia:true});
// Escudo do reino na parede e lanças encostadas
R(ox-14,oy-8,5,6,cor);R(ox-14,oy-8,5,1,tom(cor,1.3));R(ox-12,oy-6,1,2,'#ffd45a');for(const i of[0,3])R(ox+22+i,oy-8,1,16,'#6b4a2a'),R(ox+21+i,oy-10,3,2,'#dfe4ec')}
else if(tipo=='armaria'){casa(x,ox,oy,{a:20,b:10,H:14,rh:12,parede:'#7e7466',teto:'#5a2a2a',pedra:true});R(ox+4,oy-34,5,11,'#6e6a62');R(ox+4,oy-34,5,1,'#9a968a');
// Suporte com espadas e um escudo redondo
R(ox+21,oy-12,1,16,'#5a3c22');R(ox+30,oy-8,1,13,'#5a3c22');R(ox+21,oy-12,10,1,'#5a3c22');for(const i of[2,5,8]){R(ox+21+i,oy-11,1,9,'#dfe4ec');R(ox+20+i,oy-3,3,1,'#d4a24a')}
bolha(x,ox-26,oy-2,5,'#8a5a2b');bolha(x,ox-26,oy-2,3,'#a0a4ac');R(ox-27,oy-3,2,2,'#d4a24a')}
else if(tipo=='ferraria'){casa(x,ox,oy,{a:20,b:10,H:14,rh:12,parede:'#8a7a6a',teto:'#4a4a54',pedra:true});R(ox+4,oy-34,5,11,'#6e6a62');R(ox+4,oy-34,5,1,'#9a968a');
// Bigorna na frente, forja acesa e as ferramentas penduradas
R(ox-30,oy+2,10,3,'#4a4a54');R(ox-28,oy-1,6,3,'#5a5a64');R(ox-31,oy-1,3,2,'#5a5a64');R(ox-28,oy-1,6,1,'#9a9aa6');R(ox-27,oy+5,4,3,'#3a3a44');
R(ox-17,oy-7,5,5,'#2a1a10');R(ox-16,oy-6,3,3,'#ff7a2a');R(ox-16,oy-6,2,1,'#ffd04a');
R(ox+22,oy-10,1,14,'#5a3c22');R(ox+30,oy-6,1,12,'#5a3c22');R(ox+22,oy-10,9,1,'#5a3c22');R(ox+24,oy-9,1,5,'#c8ccd4');R(ox+27,oy-8,2,4,'#a0a4ac')}
else if(tipo=='fundicao'){casa(x,ox,oy,{a:22,b:11,H:16,rh:10,parede:'#8e8678',teto:'#4a4a54',pedra:true});
// Chaminé alta e a fornalha acesa na parede
R(ox+10,oy-46,7,22,'#6e6a62');R(ox+10,oy-46,7,2,'#9a968a');R(ox+15,oy-46,2,22,'#4e4a44');
R(ox-28,oy-4,10,10,'#5a5248');R(ox-26,oy-2,6,6,'#ff7a2a');R(ox-25,oy-1,4,3,'#ffd04a');R(ox-26,oy+6,8,2,'#3a342e');
pilhaPedras(x,ox+16,oy+10,0);R(ox+17,oy+6,10,3,'#8a8e9a');R(ox+18,oy+6,8,1,'#d8dce4');R(ox+19,oy+3,10,3,'#8a8e9a');R(ox+20,oy+3,8,1,'#d8dce4')}
return PRC[kk]=contorno(c,'#1a1410')}

// ---------- Colonos (estilo chibi, mesmo corpo dos heróis do Crepúsculo) ----------
// a: roupa, h: chapéu, g: cinto e detalhes. chapeu: forma do chapéu. fer: ferramenta na mão.
const OFICIO={
carregador:{n:'Carregador',a:'#a0784a',h:'#d8b860',g:'#6b4a2a',chapeu:'palha'},
construtor:{n:'Construtor',a:'#b0603a',h:'#c0392b',g:'#e0b040',chapeu:'gorro',fer:'martelo'},
lenhador:{n:'Lenhador',a:'#3f7a3a',h:'#7a2a2a',g:'#c9a24a',chapeu:'capuz',fer:'machado'},
florestal:{n:'Florestal',a:'#2f5e3a',h:'#6a7a2a',g:'#c9a24a',chapeu:'aba',fer:'pa'},
pedreiro:{n:'Pedreiro',a:'#7a7a86',h:'#5a4a3a',g:'#c9a24a',chapeu:'gorro',fer:'picareta'},
serrador:{n:'Serrador',a:'#3a5a8a',h:'#6b4a2a',g:'#c9a24a',chapeu:'capuz'},
soldado:{n:'Soldado',a:'#9aa6b8',h:'#9aa6b8',g:COR_REINO,chapeu:'elmo',fer:'lanca'},
soldado_r:{n:'Soldado de Morvane',a:'#7a6a72',h:'#7a6a72',g:'#c0392b',chapeu:'elmo',fer:'lanca'},
armeiro:{n:'Armeiro',a:'#5a4038',h:'#3a2a2a',g:'#c9a24a',chapeu:'gorro',fer:'martelo'},
pescador:{n:'Pescador',a:'#3a6a8a',h:'#d8b860',g:'#6b4a2a',chapeu:'palha',fer:'vara'},
fazendeiro:{n:'Fazendeiro',a:'#8a6a2a',h:'#e0c070',g:'#5a3a22',chapeu:'palha',fer:'foice'},
moleiro:{n:'Moleiro',a:'#d8d0c0',h:'#f0ece0',g:'#8a6a44',chapeu:'gorro'},
padeiro:{n:'Padeiro',a:'#f0ece0',h:'#ffffff',g:'#c8803a',chapeu:'gorro'},
mineiro:{n:'Mineiro',a:'#6a5a4a',h:'#e0b040',g:'#4a3a2a',chapeu:'gorro',fer:'picareta'},
fundidor:{n:'Fundidor',a:'#5a3a2a',h:'#3a2a2a',g:'#c9a24a',chapeu:'capuz',fer:'martelo'},
ferreiro:{n:'Ferreiro',a:'#4a3a32',h:'#2a2a2a',g:'#c9a24a',chapeu:'gorro',fer:'martelo'},
geologo:{n:'Geólogo',a:'#5a4a7a',h:'#7a5a3a',g:'#c9a24a',chapeu:'aba',fer:'martelo'},
tratador:{n:'Tratador',a:'#7a6a3a',h:'#d8b860',g:'#5a3a22',chapeu:'palha'}};
// Burro de carga: 22×16, de lado (vira para a esquerda no desenho), com passo alternado
const BSC={};
function burroSpr(fr){if(BSC[fr])return BSC[fr];const c=tela(22,16),x=c.getContext('2d'),R=(a,b,w,h,cor)=>{x.fillStyle=cor;x.fillRect(a,b,w,h)},p=fr?1:0,co='#8a8278',es='#6a6258';
R(4,11,2,4-p,es);R(8,11,2,4,es);R(13,11,2,4-p,es);R(16,11,2,4,es);R(3,5,15,7,co);R(3,5,15,1,'#a8a096');R(3,10,15,2,es);R(5,6,9,3,'#9a7048');R(5,6,9,1,'#b08860');
R(16,2,4,5,co);R(18,5,4,3,co);R(21,6,1,1,'#2a2420');R(17,0,1,3,co);R(19,0,1,3,co);R(19,3,1,1,'#1a1410');R(1,6,2,1,es);R(0,7,1,3,'#3a3430');
return BSC[fr]=contorno(c,'#1a1410')}
// Plaquinha do geólogo: madeira com a pedra do minério achado, ou um X cinza onde não havia nada
function placa(g,cx,cy,min){const R=(a,b,w,h,c)=>{g.fillStyle=c;g.fillRect(cx+a,cy+b,w,h)};R(-1,-14,3,15,'#1a1008');R(0,-13,1,13,'#8a6440');
R(-5,-17,11,7,'#1a1008');R(-4,-16,9,5,'#c8a070');if(min){const[c1,c2]=COR_MIN[min.k];R(-2,-15,5,3,c1);R(-2,-15,2,1,c2)}else{R(-2,-15,1,1,'#7a7068');R(2,-15,1,1,'#7a7068');R(0,-14,1,1,'#7a7068');R(-2,-13,1,1,'#7a7068');R(2,-13,1,1,'#7a7068')}}
const CSC={};
function colonoSpr(of,back,fr){const id=of+(back?'b':'f')+fr;if(CSC[id])return CSC[id];const P={s:'#f1c9a0',e:'#2a1c18',p:'#4a3a2a',w:'#8a5a2b',cab:'#5a3a22',...OFICIO[of]};
const c=tela(18,26),x=c.getContext('2d'),R=(px,py,w,h,cor)=>{x.fillStyle=cor;x.fillRect(px,py,w,h)},esc=k=>tom(P[k],.7),luz=k=>tom(P[k],1.2),pe=fr?1:0;
// Pernas e botas (com passo alternado)
R(6,20-pe,2,3,esc('a'));R(10,20,2,3,esc('a'));R(6,22-pe,2,2,P.p);R(10,22,2,2,P.p);
// Tronco, braços e mãos
R(5,13,8,7,P.a);R(5,13,1,7,luz('a'));R(11,13,2,7,esc('a'));R(5,18,8,1,P.g);R(8,18,2,1,'#e0b040');
R(3,13,2,5,P.a);R(3,13,1,5,luz('a'));R(13,13,2,5,esc('a'));R(3,18,2,2,P.s);R(13,18,2,2,P.s);
if(of=='soldado'){R(2,12,4,2,P.g);R(12,12,4,2,tom(P.g,.8))}
// Cabeça
R(5,6,8,6,P.s);R(11,7,2,5,tom(P.s,.86));R(5,11,8,1,tom(P.s,.9));
if(!back){R(6,8,1,2,P.e);R(10,8,1,2,P.e);R(6,8,1,1,'#ffffff');R(5,10,1,1,'#e8a090');R(12,10,1,1,'#e8a090')}else R(5,6,8,6,P.cab);
const h=P.h;
if(P.chapeu=='palha'){R(2,5,14,2,h);R(2,6,14,1,tom(h,.75));R(5,2,8,3,h);R(5,4,8,1,'#8a5a2b');R(5,2,3,1,luz('h'))}
else if(P.chapeu=='gorro'){R(4,2,10,5,h);R(5,1,8,1,h);R(4,2,2,4,luz('h'));R(12,2,2,4,esc('h'));R(4,6,10,1,tom(h,.7));R(13,0,2,2,h)}
else if(P.chapeu=='aba'){R(3,5,12,2,h);R(3,6,12,1,tom(h,.7));R(5,1,8,4,h);R(5,1,3,1,luz('h'));R(5,4,8,1,P.g)}
else if(P.chapeu=='elmo'){R(4,2,10,5,P.a);R(5,1,8,1,P.a);R(4,2,2,4,luz('a'));R(12,2,2,10,esc('a'));R(4,6,2,6,P.a);R(4,6,10,1,esc('a'));R(8,0,2,2,P.g);if(back)R(5,6,8,6,P.a)}
else{R(4,2,10,5,h);R(5,1,8,1,h);R(4,2,2,4,luz('h'));R(12,2,2,10,esc('h'));R(4,6,2,6,h);if(back)R(5,6,8,6,h)}
// Ferramentas
const f=P.fer;
if(f=='machado'){R(15,9,1,11,P.w);R(14,8,3,4,'#c8ccd4');R(14,8,1,4,'#eef0f4')}
else if(f=='martelo'){R(15,12,1,8,P.w);R(13,10,5,3,'#7a7a86');R(13,10,5,1,'#a8acb8')}
else if(f=='pa'){R(15,6,1,13,P.w);R(14,18,3,4,'#a0a4ac');R(14,5,3,1,P.w)}
else if(f=='picareta'){R(15,9,1,11,P.w);R(12,8,7,2,'#8a8e98');R(12,9,1,2,'#8a8e98');R(18,9,1,2,'#8a8e98')}
else if(f=='lanca'){R(15,1,1,21,P.w);R(14,0,3,3,'#dfe4ec');R(1,13,4,6,P.g);R(1,13,1,6,luz('g'));R(2,15,2,2,'#ffd45a')}
else if(f=='vara'){R(15,3,1,17,P.w);R(16,1,1,3,P.w);R(17,1,1,9,'#dfe4ec')}
else if(f=='foice'){R(15,6,1,14,P.w);R(10,5,6,1,'#c8ccd4');R(9,6,2,1,'#c8ccd4');R(9,7,1,1,'#c8ccd4');R(10,4,5,1,'#eef0f4')}
return CSC[id]=contorno(c,'#1a1420')}
