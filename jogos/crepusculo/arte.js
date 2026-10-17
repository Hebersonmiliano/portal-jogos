// ===================== ARTE: SPRITES, TERRENO E OBJETOS =====================
// Tudo é pintado pelo código em pixel art, com contorno escuro automático e luz vindo de cima à esquerda.
const SPR_W=18,SPR_H=26;
function semente(n){let s=(Math.abs(Math.floor(n))%2147483646)+1;return()=>(s=s*16807%2147483647)/2147483647}
const tom=(h,f)=>'#'+rgb(h).map(v=>Math.max(0,Math.min(255,Math.round(v*f))).toString(16).padStart(2,'0')).join('');
// Contorno: todo pixel vazio encostado num pixel pintado vira a cor do contorno.
function contorno(c,cor){const x=c.getContext('2d'),im=x.getImageData(0,0,c.width,c.height),d=im.data,W=c.width,H=c.height,marca=[];
for(let y=0;y<H;y++)for(let i=0;i<W;i++){if(d[(y*W+i)*4+3])continue;
for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=i+a,ny=y+b;if(nx>=0&&ny>=0&&nx<W&&ny<H&&d[(ny*W+nx)*4+3]>40){marca.push(i,y);break}}}
x.fillStyle=cor;for(let n=0;n<marca.length;n+=2)x.fillRect(marca[n],marca[n+1],1,1);return c}

// ---------- Personagens (estilo chibi) ----------
// fr: 0 parado, 1 passo. back: de costas. As cores vêm de PL (aliados), EN (inimigos) e LD (líder) no game.js.
// Paleta das cópias sombrias (Salão das Sombras)
const SOMBRA={a:'#2a1a3a',b:'#140a20',h:'#1a0e28',g:'#b05aff',w:'#5a3a7a',s:'#5a4a6a',p:'#1a1024',c:'#1a0e28'};
function spr(u,back,fr=0){const id=u.k+u.team+(back?'b':'f')+(u.lider?'L':'')+(u.sombra?'S':'')+fr;if(SC[id])return SC[id];
const b=(CL[u.k]&&CL[u.k].base)||u.k,P={s:'#f1c9a0',e:'#2a1c18',p:'#4a3a2a',w:'#8a5a2b',g:'#e0b040',h:'#6b4a2a',...PL[u.k],...(u.team?EN[u.k]||EN[b]:{}),...(u.lider&&!(CL[u.k]&&CL[u.k].grande)?LD:{}),...(u.sombra?SOMBRA:{})};
const c=document.createElement('canvas');c.width=SPR_W;c.height=SPR_H;const x=c.getContext('2d');
const R=(px,py,w,h,cor)=>{x.fillStyle=cor;x.fillRect(px,py,w,h)},esc=k=>tom(P[k],.7),luz=k=>tom(P[k],1.2);
if(b=='OE'){const o=fr?1:0;R(4,6+o,10,10,P.a);R(3,8+o,12,6,P.a);R(5,6+o,4,2,tom(P.a,1.4));R(5,8+o,8,6,P.s);R(7,9+o,4,4,P.g);R(8,10+o,2,2,'#000');R(6,8+o,2,1,'#fff');
for(let i=0;i<4;i++)R(5+i*2+((i+o)%2),17+o+i%2,1,3+i%2,tom(P.a,.8));return SC[id]=contorno(c,'#0a0412')}
if(b=='EV'){R(3,4,12,14,P.a);R(2,6,14,10,P.a);R(4,3,10,1,P.b);R(1,6,1,10,P.b);R(16,6,1,10,P.b);R(4,18,10,1,P.b);R(2,4,2,2,P.s);R(14,4,2,2,P.s);R(2,16,2,2,P.s);R(14,16,2,2,P.s);
R(0,10,1,2,P.g);R(17,10,1,2,P.g);R(8,1,2,2,P.g);R(8,19,2,2,P.g);R(6,9,6,4,P.e);R(8,9,2,4,P.s);R(8,10,2,2,'#000');R(7,9,1,1,'#fff');for(let i=0;i<4;i++)R(5+i*2,20+i%2,1,4+i%2,P.b);return SC[id]=contorno(c,'#000')}
if(b=='TT'){const o=fr?1:0,cor=P.a,esc2=tom(P.a,.65),lz=tom(P.a,1.3);for(let i=0;i<20;i++){const w=Math.max(2,6-Math.floor(i/4)),xx=8+Math.round(Math.sin((i+o*2)/3.2)*4);R(xx-Math.floor(w/2),24-i,w,1,cor);R(xx-Math.floor(w/2),24-i,1,1,lz);R(xx+Math.ceil(w/2)-1,24-i,1,1,esc2);if(i%3==1&&w>3)R(xx,24-i,1,1,P.g)}
R(2,22,14,4,tom(P.a,.5));return SC[id]=contorno(c,'#140a1a')}
if(b=='KR'){const o=fr?1:0;R(3,2,12,12,P.a);R(2,5,14,8,P.a);R(4,2,6,3,tom(P.a,1.3));R(13,4,3,9,tom(P.a,.7));R(5,8,3,3,P.g);R(10,8,3,3,P.g);R(6,9,1,1,'#000');R(11,9,1,1,'#000');
for(let t=0;t<5;t++){const x0=2+t*3;for(let i=0;i<10;i++)R(x0+Math.round(Math.sin((i+t+o*2)/2.2)),14+i,2,1,i%3==2?P.s:tom(P.a,.85))}R(4,13,10,2,tom(P.a,.6));
if(!back){R(6,12,6,1,P.e)}return SC[id]=contorno(c,'#0c0612')}
if(b=='D'){const pe=fr?1:0;R(0,8,4,12,P.b);R(14,8,4,12,P.b);R(1,9,2,10,tom(P.b,1.4));R(15,9,2,10,tom(P.b,1.4));
R(5,20-pe,3,4,tom(P.a,.7));R(10,20,3,4,tom(P.a,.7));R(4,23-pe,4,1,'#1a0608');R(10,23,4,1,'#1a0608');
R(3,12,12,9,P.a);R(3,12,12,1,tom(P.a,1.4));R(12,12,3,9,tom(P.a,.7));R(6,14,6,3,P.g);R(8,15,2,1,'#fff2b0');
R(1,13,2,6,P.a);R(15,13,2,6,tom(P.a,.7));R(1,19,2,2,P.s);R(15,19,2,2,P.s);
R(4,3,10,9,P.s);R(11,4,3,8,tom(P.s,.75));R(3,0,2,5,'#e8d8b0');R(2,0,1,2,'#e8d8b0');R(13,0,2,5,'#e8d8b0');R(15,0,1,2,'#e8d8b0');
if(!back){R(6,7,2,1,P.e);R(10,7,2,1,P.e);R(6,10,6,1,'#1a0608');R(7,10,1,2,'#fff2b0');R(10,10,1,2,'#fff2b0')}else R(4,3,10,9,P.h);
return SC[id]=contorno(c,'#0a0204')}
if(b=='R'){const pe=fr?1:0,cav='#8a5a2b',ce='#5e3a1a';R(3,21-pe,2,3,ce);R(6,21,2,3,ce);R(11,21-pe,2,3,ce);R(14,21,2,3,ce);R(2,15,14,6,cav);R(2,15,14,1,tom(cav,1.25));R(2,20,14,1,ce);
R(14,10,3,7,cav);R(15,9,3,3,cav);R(17,10,1,2,ce);R(13,9,2,6,'#2a1c10');R(1,15,2,4,'#2a1c10');R(6,14,6,2,P.b);
R(7,12,3,4,P.p);R(6,5,6,7,P.a);R(6,5,1,7,tom(P.a,1.2));R(10,5,2,7,tom(P.a,.75));R(6,10,6,1,P.g);R(6,0,6,5,P.s);R(6,0,6,2,P.a);R(8,0,2,1,P.g);
if(!back){R(7,2,1,1,P.e);R(10,2,1,1,P.e)}else R(6,0,6,5,P.a);R(4,0,1,18,P.w);R(4,0,1,2,'#dfe4ec');R(3,1,3,1,'#dfe4ec');
// Cavaleiro Dragão: elmo com chifres e asas de dragão na sela
const tr3=(CL[u.k]&&CL[u.k].tier)||0;if(tr3>=3){R(5,0,1,2,'#e8d8b0');R(12,0,1,2,'#e8d8b0');R(0,13,3,3,P.a);R(15,13,3,3,P.a);R(0,13,3,1,tom(P.a,1.3))}
if(tr3>=5){R(6,10,6,1,P.g);R(2,15,14,1,P.g)}if(tr3>=6){R(8,7,2,2,'#7ff0ff')}if(tr3>=7){R(6,0,1,1,'#ffd45a');R(8,0,2,1,'#ffd45a');R(11,0,1,1,'#ffd45a')}
return SC[id]=contorno(c,'#1a1420')}
if(b=='W'){const pe=fr?1:0,a=P.a,es=tom(P.a,.68),lz=tom(P.a,1.25);
R(4,21-pe,2,3,es);R(7,21,2,3,es);R(11,21-pe,2,3,es);R(14,21,2,3,es);R(4,15,12,6,a);R(4,15,12,1,lz);R(4,20,12,1,es);R(15,13,2,3,a);R(16,11,2,2,lz);
R(1,12,6,6,a);R(1,12,6,1,lz);R(0,15,3,2,a);R(0,16,1,1,'#1a1420');R(2,10,2,2,a);R(5,10,2,2,es);R(5,16,4,2,tom(P.a,.85));
if(!back){R(2,13,1,1,P.g);R(4,13,1,1,P.g)}return SC[id]=contorno(c,'#120e18')}
if(b=='H'){const asa=tom(P.b,.8),pe=fr?1:0;R(0,8-pe,5,10,P.b);R(0,8-pe,5,1,tom(P.b,1.3));for(let i=0;i<4;i++)R(i,18-pe+i%2,1,2,asa);R(13,8-pe,5,10,P.b);R(13,8-pe,5,1,tom(P.b,1.3));for(let i=0;i<4;i++)R(14+i,18-pe+i%2,1,2,asa);
R(6,13,6,7,P.a);R(6,13,1,7,tom(P.a,1.2));R(10,13,2,7,tom(P.a,.75));R(7,20,1,3,'#c9a24a');R(10,20,1,3,'#c9a24a');R(6,23,2,1,'#8a6a2a');R(10,23,2,1,'#8a6a2a');
R(5,5,8,7,P.s);R(11,6,2,6,tom(P.s,.86));R(4,2,10,4,P.h);R(3,4,2,6,P.h);R(13,4,2,6,P.h);R(5,1,3,2,P.h);R(10,1,3,2,P.h);
if(!back){R(6,8,2,1,P.g);R(10,8,2,1,P.g)}else R(5,5,8,7,P.h);return SC[id]=contorno(c,'#1a1420')}
const tunica=b=='M'||b=='C';
// Capa atrás do corpo (ladinos e o líder inimigo)
const tier=(CL[u.k]&&CL[u.k].tier)||0;
if(b=='L'||b=='S'||u.lider||tier>=4){R(4,12,10,10,u.lider?'#7a1f1f':esc('h'));R(4,21,10,1,tom(u.lider?'#7a1f1f':P.h,.5))}
// Aljava nas costas do arqueiro
if(b=='A'){R(3,9,2,7,P.w);R(3,8,1,1,'#e8e0d0');R(4,7,1,1,'#e8e0d0')}
// Pernas e botas (com passo alternado)
if(!tunica){const pe=fr?1:0;R(6,20-pe,2,3,esc('a'));R(10,20+pe-pe,2,3,esc('a'));R(6,22-pe,2,2,P.p);R(10,22,2,2,P.p);R(7,23-pe,1,1,tom(P.p,.7));R(11,23,1,1,tom(P.p,.7))}
// Tronco
R(5,13,8,7,P.a);R(5,13,1,7,luz('a'));R(11,13,2,7,esc('a'));R(5,13,8,1,P.g);R(5,18,8,1,P.b||esc('a'));R(8,18,2,1,P.g);
if(tunica){R(4,18,10,4,P.a);R(3,21,12,2,P.a);R(11,18,3,5,esc('a'));R(3,22,12,1,P.g);R(6,23,2,1,P.p);R(10,23,2,1,P.p)}
if(b=='N'){R(6,14,6,6,'#d8cfb8');R(6,14,6,1,'#b8ae94')}
// Braços e mãos
R(3,13,2,5,P.a);R(3,13,1,5,luz('a'));R(13,13,2,5,esc('a'));R(3,18,2,2,P.s);R(13,18,2,2,P.s);
if(b=='K'||b=='P'){R(2,12,4,2,P.g);R(12,12,4,2,tom(P.g,.8))}
// Cabeça: rosto
R(5,6,8,6,P.s);R(11,7,2,5,tom(P.s,.86));R(5,11,8,1,tom(P.s,.9));
if(!back){R(6,8,1,2,P.e);R(10,8,1,2,P.e);R(6,8,1,1,'#ffffff');R(5,10,1,1,'#e8a090');R(12,10,1,1,'#e8a090')}
// Cabeça: elmo, capuz, chapéu ou mitra de cada classe
if(b=='K'||b=='P'){R(4,2,10,5,P.a);R(5,1,8,1,P.a);R(4,2,2,4,luz('a'));R(12,2,2,10,esc('a'));R(4,6,2,6,P.a);R(4,6,10,1,esc('a'));R(8,0,2,2,u.team?'#c0392b':P.g);R(7,3,4,1,P.g);if(back)R(5,6,8,6,P.a)}
else if(b=='M'||b=='X'){R(2,6,14,2,P.h||P.a);R(2,7,14,1,tom(P.h||P.a,.7));R(5,4,8,2,P.h||P.a);R(6,2,6,2,P.h||P.a);R(7,0,4,2,P.h||P.a);R(11,0,2,1,P.h||P.a);R(5,5,8,1,P.g);R(4,8,1,3,'#c9a46a');R(13,8,1,3,'#c9a46a');if(back)R(5,6,8,6,'#c9a46a')}
else if(b=='L'||b=='S'){R(4,2,10,5,'#3a2a2a');R(4,3,10,2,P.g);R(13,4,3,1,P.g);R(14,5,2,1,tom(P.g,.7));R(4,6,1,5,'#3a2a2a');R(13,6,1,5,'#3a2a2a');R(5,10,8,2,P.g);R(5,11,8,1,tom(P.g,.7));if(back)R(5,6,8,6,'#3a2a2a')}
else if(b=='C'||b=='Z'){R(5,0,8,6,P.h);R(6,0,6,1,luz('h'));R(4,5,10,2,P.h);R(8,1,2,4,P.g);R(7,2,4,1,P.g);R(4,7,1,4,'#d9c08f');R(13,7,1,4,'#d9c08f');if(back)R(5,6,8,6,P.h)}
else{R(4,2,10,5,P.h);R(5,1,8,1,P.h);R(4,2,2,4,luz('h'));R(12,2,2,10,esc('h'));R(4,6,2,6,P.h);R(12,1,2,2,P.h);if(back)R(5,6,8,6,P.h)}
// Armas
if(b=='K'||b=='P'){R(15,8,1,10,'#dfe4ec');R(16,8,1,9,'#a9b0bc');R(14,17,3,1,P.g);R(15,18,1,2,P.w);R(1,13,4,6,P.b||P.a);R(1,13,1,6,luz('b'));R(2,15,2,2,P.g)}
else if(b=='A'||b=='T'){R(15,9,1,13,P.w);R(14,8,1,1,P.w);R(14,22,1,1,P.w);R(16,10,1,11,'#efe6d2')}
else if(b=='M'||b=='X'){R(15,5,1,18,P.w);R(14,2,3,3,u.k=='X'?'#ff9a4a':'#9fd8ff');R(15,2,1,1,'#ffffff')}
else if(b=='L'||b=='S'){R(15,14,1,5,'#dfe4ec');R(14,19,3,1,P.g);R(15,20,1,1,P.w)}
else if(b=='C'||b=='Z'){R(15,5,1,18,P.w);R(14,6,3,1,P.g);R(15,4,1,4,P.g)}
// Terceira classe (nível 12): detalhes próprios por cima da forma da classe de origem
if(u.k=='E'){R(7,0,4,1,'#ffe27a');R(8,0,2,2,'#ffffff');R(0,12,5,8,P.b);R(0,12,1,8,tom(P.b,1.3));R(1,14,3,3,'#ffe27a')}
else if(u.k=='V'){R(3,8,2,9,P.w);R(2,7,1,2,'#bfe8ff');R(3,6,1,2,'#bfe8ff');R(16,10,1,11,'#bfe8ff');R(5,13,8,1,'#7fd0ff')}
else if(u.k=='F'){R(14,1,3,3,'#b8e0ff');R(15,0,1,1,'#ffffff');R(13,2,1,1,'#ffffff');R(8,3,2,1,'#fff6c0');R(6,5,1,1,'#fff6c0');R(11,4,1,1,'#fff6c0')}
else if(u.k=='B'){R(5,10,8,2,'#8a4ae0');R(5,11,8,1,'#5a2aa0');R(1,14,1,5,'#c8b8ff');R(0,19,3,1,P.g)}
else if(u.k=='O'){R(5,0,8,1,'#ffe27a');R(4,1,1,1,'#ffe27a');R(13,1,1,1,'#ffe27a');R(14,3,3,3,'#fff2b0');R(15,4,1,1,'#ffffff')}
// Classes dos níveis 20 a 50: ombreiras douradas (30+), joia no peito (40+) e coroa (50)
if(tier>=5){R(2,12,4,2,P.g);R(12,12,4,2,tom(P.g,.8))}if(tier>=6){R(8,15,2,2,'#7ff0ff');R(8,15,1,1,'#ffffff')}
if(tier>=7){R(5,0,8,1,'#ffd45a');R(5,0,1,1,'#fff2b0');R(8,0,2,1,'#ff5a5a');R(12,0,1,1,'#fff2b0')}
return SC[id]=contorno(c,'#1a1420')}

// ---------- Terreno com textura ----------
// Cada casa vira um bloco pintado: topo com textura e laterais de terra ou pedra em camadas. v varia o desenho entre casas.
const TXC={},LADOS={cinza:['#5e5650','#463f3a'],terra:['#8a6a44','#6b5034'],pedra:['#9c9888','#77736a'],agua:['#3e6f8f','#2c5470'],madeira:['#7a5232','#5c3c22'],gelo:['#7fb0cc','#5f90ac'],neve:['#a8b4c0','#86929e'],arenito:['#b08a52','#8e6c3a'],areia:['#c4a066','#a4824c'],obsidiana:['#2a1e36','#1c1426'],ferro:['#4a4a58','#36363f'],espelho:['#6a6a8a','#50506c']};
const ladoDe=id=>id=='h'||id=='f'?'obsidiana':id=='j'?'ferro':id=='l'?'espelho':id=='d'?'madeira':id=='y'?'arenito':id=='s'||id=='q'?'areia':id=='i'?'gelo':id=='n'?'neve':id=='a'||id=='v'||id=='w'?'agua':id=='e'||id=='r'||id=='m'||id=='k'||id=='u'?'pedra':id=='p'?'madeira':id=='c'||id=='b'?'cinza':'terra';
function bloco(id,h,v){const k=id+h+'_'+v;if(TXC[k])return TXC[k];const T=TER[id],dp=h*S+10,c=document.createElement('canvas');c.width=64;c.height=33+dp;
const x=c.getContext('2d'),r=semente(h*977+v*131+id.charCodeAt(0)*31+7),cor=T.c[Math.min(h,T.c.length-1)],[l1,l2]=LADOS[ladoDe(id)];
const forma=pts=>{x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath()};
const TOPO=[[32,0],[64,16],[32,32],[0,16]],ESQ=[[0,16],[32,32],[32,32+dp],[0,16+dp]],DIR=[[64,16],[32,32],[32,32+dp],[64,16+dp]];
for(const[F2,base,lado]of[[ESQ,l1,-1],[DIR,l2,1]]){x.save();forma(F2);x.fillStyle=base;x.fill();x.clip();
// Camadas e pedras na lateral, acompanhando a inclinação da face
for(let n=0;n<dp*2;n++){const px=r()*32,ox=lado<0?px:32+px,oy=(lado<0?16+px*.5:32-px*.5)+r()*dp;x.fillStyle=r()<.5?'rgba(255,240,210,.16)':'rgba(30,20,10,.22)';x.fillRect(Math.floor(ox),Math.floor(oy),2+Math.floor(r()*3),2)}
for(let s=6;s<dp;s+=7){x.strokeStyle='rgba(30,20,10,.22)';x.beginPath();x.moveTo(lado<0?0:64,16+s);x.lineTo(32,32+s);x.stroke()}
// Grama escorrendo pela borda
if(id=='g'){x.fillStyle=tom(cor,.72);x.beginPath();x.moveTo(lado<0?0:64,16);x.lineTo(32,32);x.lineTo(32,35);x.lineTo(lado<0?0:64,19);x.closePath();x.fill();
for(let n=0;n<6;n++){const px=r()*30+1,ox=lado<0?px:32+px,oy=(lado<0?16+px*.5:32-px*.5)+2;x.fillRect(Math.floor(ox),Math.floor(oy),1,2+Math.floor(r()*4))}}
x.restore()}
// Topo
x.save();forma(TOPO);x.fillStyle=cor;x.fill();x.clip();
for(let n=0;n<130;n++){x.fillStyle=r()<.5?'rgba(255,255,230,.14)':'rgba(20,30,10,.16)';x.fillRect(Math.floor(r()*64),Math.floor(r()*32),1+Math.floor(r()*2),1)}
const P2=(u,w)=>[32+u*32-w*32,u*16+w*16];
if(id=='g'){for(let n=0;n<16;n++){const[a,b]=P2(r(),r());x.fillStyle=tom(cor,.6);x.fillRect(Math.floor(a),Math.floor(b),1,2);x.fillStyle=tom(cor,1.25);x.fillRect(Math.floor(a),Math.floor(b)-1,1,1)}
if(r()<.55)for(let n=0;n<3;n++){const[a,b]=P2(r(),r());x.fillStyle=r()<.5?'#f2a6c6':'#f7e27a';x.fillRect(Math.floor(a),Math.floor(b),2,2);x.fillStyle='#fff8e0';x.fillRect(Math.floor(a),Math.floor(b),1,1)}}
if(id=='c'||id=='b'){for(let n=0;n<26;n++){const[a,b]=P2(r(),r());x.fillStyle=r()<.5?'#3e3834':'#a8a29c';x.fillRect(Math.floor(a),Math.floor(b),2,1)}}
if(id=='b'){for(let n=0;n<10;n++){const[a,b]=P2(r(),r());x.fillStyle=r()<.5?'#ff7a2a':'#ffc04a';x.fillRect(Math.floor(a),Math.floor(b),2,2)}}
if(id=='m'){for(let n=0;n<22;n++){const[a,b]=P2(r(),r());x.fillStyle=r()<.5?'#6e675a':'#d6cfbf';x.fillRect(Math.floor(a),Math.floor(b),2,1)}x.strokeStyle='rgba(60,55,45,.5)';for(let n=0;n<2;n++){const[a,b]=P2(r(),r());x.beginPath();x.moveTo(a,b);x.lineTo(a+4+r()*6,b+2+r()*3);x.lineTo(a+8+r()*6,b+r()*4);x.stroke()}}
if(id=='s'){for(let n=0;n<24;n++){const[a,b]=P2(r(),r());x.fillStyle=r()<.5?'#b8a070':'#f4e6be';x.fillRect(Math.floor(a),Math.floor(b),1,1)}}
if(id=='u'){x.strokeStyle='#d4a24a';x.lineWidth=2;for(const q of[.12,.88]){const[a1,b1]=P2(q,0),[a2,b2]=P2(q,1);x.beginPath();x.moveTo(a1,b1);x.lineTo(a2,b2);x.stroke()}x.lineWidth=1}
if(id=='t'){for(let n=0;n<12;n++){const[a,b]=P2(r(),r());x.fillStyle=r()<.5?'#6e5a40':'#d2b88e';x.fillRect(Math.floor(a),Math.floor(b),2,1)}}
if(id=='e'||id=='k'){x.strokeStyle=id=='k'?'rgba(20,18,30,.8)':'rgba(60,55,45,.75)';for(let i=1;i<3;i++){const[a1,b1]=P2(i/3,0),[a2,b2]=P2(i/3,1),[a3,b3]=P2(0,i/3),[a4,b4]=P2(1,i/3);
x.beginPath();x.moveTo(a1,b1);x.lineTo(a2,b2);x.moveTo(a3,b3);x.lineTo(a4,b4);x.stroke()}
for(let i=0;i<3;i++)for(let j=0;j<3;j++){if(r()<.4){const q=[P2(i/3,j/3),P2((i+1)/3,j/3),P2((i+1)/3,(j+1)/3),P2(i/3,(j+1)/3)];forma(q);x.fillStyle=r()<.5?'rgba(255,255,240,.12)':'rgba(0,0,0,.1)';x.fill()}}
if(r()<.6){const[a,b]=P2(r(),r());x.fillStyle='rgba(90,140,60,.6)';x.fillRect(Math.floor(a),Math.floor(b),4,2)}}
x.restore();
// Contorno do bloco
x.strokeStyle='rgba(20,14,10,.6)';x.lineWidth=1;for(const F2 of[ESQ,DIR,TOPO]){forma(F2);x.stroke()}
return TXC[k]=c}

// ---------- Objetos sobre as casas ----------
// bloq: ninguém pode pisar. Use as letras em mapa.obj de cada fase ('.' = nada).
const OBJ={Q:{n:'Corrente colossal',bloq:true},W:{n:'Espelho Colossal',bloq:true},V:{n:'Mastro',bloq:true},H:{n:'Farol Afogado',bloq:true},C:{n:'Canhão',bloq:true},L:{n:'Palmeira',bloq:true},O:{n:'Obelisco',bloq:true},S:{n:'Esfinge Colossal',bloq:true},'#':{n:'Esfinge Colossal',bloq:true},N:{n:'Pinheiro nevado',bloq:true},G:{n:'Cristal de gelo',bloq:true},X:{n:'Braseiro',bloq:true},Y:{n:'Braseiro',bloq:true},M:{n:'Árvore morta',bloq:true},T:{n:'Árvore',bloq:true},P:{n:'Coluna em ruínas',bloq:true},E:{n:'Estátua',bloq:true},B:{n:'Arbusto'},F:{n:'Flores'}},OBC={};
function bolha(x,cx,cy,rad,cor){x.fillStyle=cor;for(let yy=-rad;yy<=rad;yy++){const w=Math.floor(Math.sqrt(rad*rad-yy*yy));x.fillRect(Math.round(cx-w),Math.round(cy+yy),w*2+1,1)}}
function objImg(ch,v){const k=ch+v;if(OBC[k])return OBC[k];const c=document.createElement('canvas'),x=c.getContext('2d'),r=semente(v*97+ch.charCodeAt(0)*13+3);
const R=(a,b,w,h,cor)=>{x.fillStyle=cor;x.fillRect(a,b,w,h)};
if(ch=='T'){c.width=60;c.height=84;R(27,50,7,30,'#6b4a2a');R(27,50,2,30,'#8a6440');R(31,50,3,30,'#4e3420');R(23,77,15,3,'#5a3c22');R(21,50,7,3,'#6b4a2a');R(33,46,8,3,'#5e4026');
const bs=[...Array(9)].map(()=>({x:30+(r()-.5)*28,y:30+(r()-.5)*22,r:10+Math.floor(r()*6)}));
for(const q of bs)bolha(x,q.x,q.y,q.r,'#2f6b2a');for(const q of bs)bolha(x,q.x-2,q.y-3,q.r-3,'#4c9a3a');for(const q of bs)bolha(x,q.x-4,q.y-5,Math.max(2,q.r-8),'#7cc24e');
for(let n=0;n<14;n++)R(Math.floor(12+r()*36),Math.floor(10+r()*36),1,1,'#b6e07a');for(let n=0;n<7;n++){const a=Math.floor(12+r()*36),b=Math.floor(12+r()*34);R(a,b,2,2,'#f7d24a');R(a,b,1,1,'#fff6c8')}}
else if(ch=='Q'){c.width=24;c.height=220;for(let y=0;y<212;y+=14){const lado=(y/14)%2;if(lado){R(9,y,6,16,'#5a5a6a');R(10,y+2,4,12,'#1a1420');R(9,y,6,2,'#8a8a9a')}else{R(4,y+3,16,8,'#6a6a7a');R(7,y+5,10,4,'#1a1420');R(4,y+3,16,2,'#9a9aaa')}}
R(2,210,20,10,'#3a2a4a');R(2,210,20,2,'#5a4a6a')}
else if(ch=='W'){c.width=120;c.height=170;R(10,150,100,18,'#3a2a4a');R(10,150,100,3,'#5a4a6a');R(14,6,92,146,'#c9a24a');R(14,6,92,3,'#ffe08a');R(20,12,80,134,'#2a1e3a');
for(let y=14;y<144;y++){const t=(y-14)/130;R(22,y,76,1,`rgb(${Math.round(150+60*t)},${Math.round(140+50*t)},${Math.round(200+30*t)})`)}for(let i=0;i<6;i++)R(26+i*12,20+i*18,30,2,'rgba(255,255,255,.55)');
R(50,0,20,10,'#c9a24a');R(56,0,8,4,'#ff5ac8');R(8,60,8,30,'#c9a24a');R(104,60,8,30,'#c9a24a');R(46,70,28,40,'rgba(40,20,60,.35)');R(54,74,12,12,'rgba(40,20,60,.45)')}
else if(ch=='V'){c.width=60;c.height=150;R(28,8,4,140,'#5a3a22');R(28,8,1,140,'#7a5232');R(12,26,36,3,'#5a3a22');R(16,82,28,3,'#5a3a22');R(24,2,12,8,'#5a3a22');R(24,2,12,2,'#7a5232');
R(13,29,34,52,'#e4dcc4');R(13,29,34,3,'#f4eedc');R(41,29,6,52,'#c8bea4');for(let i=0;i<4;i++)R(13,40+i*11,34,1,'#b8ae94');R(24,44,12,12,'#2a2a2a');R(27,47,2,2,'#e4dcc4');R(31,47,2,2,'#e4dcc4');R(27,52,6,2,'#e4dcc4');
R(18,85,24,30,'#ddd4bc');R(18,85,24,2,'#f4eedc');R(36,85,6,30,'#c8bea4');R(30,0,10,4,'#2a1a2a');R(31,1,8,2,'#7a2a3a')}
else if(ch=='H'){c.width=120;c.height=200;R(14,170,92,28,'#6e6a66');R(14,170,92,3,'#8e8a84');R(14,192,92,6,'#4e4a46');
for(let y=40;y<172;y++){const w=Math.round(20+(y-40)*.16);R(60-w,y,w*2,1,Math.floor((y-40)/22)%2?'#b83a3a':'#ece6da');R(60-w,y,3,1,'rgba(255,255,255,.35)');R(60+w-6,y,6,1,'rgba(0,0,0,.18)')}
R(36,28,48,14,'#3a3a44');R(36,28,48,2,'#5a5a66');R(40,10,40,18,'#ffe8a0');R(44,12,4,14,'#fff8d8');R(58,10,4,18,'#3a3a44');R(38,4,44,6,'#3a3a44');R(54,0,12,5,'#3a3a44');
R(52,80,16,14,'#2a2a34');R(54,82,12,10,'#ffd870');R(50,130,20,18,'#2a2a34');for(let n=0;n<14;n++)R(Math.floor(30+r()*60),Math.floor(60+r()*110),2+Math.floor(r()*4),1,'rgba(40,60,50,.5)')}
else if(ch=='C'){c.width=32;c.height=30;R(4,18,24,8,'#6b4a2a');R(4,18,24,2,'#8a6440');R(5,24,6,6,'#3a2a1a');R(21,24,6,6,'#3a2a1a');R(8,10,22,9,'#2a2a30');R(8,10,22,2,'#4a4a54');R(28,9,4,11,'#1a1a20');R(30,12,2,5,'#000')}
else if(ch=='L'){c.width=60;c.height=84;for(let i=0;i<15;i++)R(28+Math.round(Math.sin(i/4)*3),38+i*3,5,3,i%2?'#8a6a3a':'#a07a48');R(22,80,16,3,'#7a5a32');
const fs=[[16,34,8],[44,34,8],[10,42,6],[50,42,6],[30,28,8],[22,38,7],[38,38,7]];for(const[a,b,q]of fs)bolha(x,a,b,q,'#2e7a34');for(const[a,b,q]of fs)bolha(x,a-1,b-2,q-3,'#4cae46');
for(let n=0;n<9;n++)R(Math.floor(8+r()*44),Math.floor(26+r()*20),1,1,'#9ad46a');R(28,40,3,3,'#6b4a2a');R(32,41,3,3,'#5a3c22')}
else if(ch=='O'){c.width=24;c.height=96;R(3,86,18,9,'#a08050');R(3,86,18,2,'#c8a870');R(7,16,10,70,'#d8b878');R(7,16,3,70,'#ecd49a');R(14,16,3,70,'#a8884e');
R(8,10,8,6,'#ffd45a');R(10,6,4,4,'#ffd45a');R(11,2,2,4,'#fff2b0');for(let i=0;i<6;i++){R(10,24+i*10,4,2,'#8a6a3a');R(9,28+i*10,2,2,'#8a6a3a')}}
else if(ch=='S'){c.width=140;c.height=116;R(4,96,132,16,'#b89a62');R(4,96,132,3,'#d8c08a');R(4,108,132,4,'#8a7040');
R(30,58,96,38,'#d8b878');R(30,58,96,3,'#ecd49a');R(30,88,96,8,'#b8985a');R(108,48,20,48,'#d8b878');R(108,48,20,3,'#ecd49a');R(124,70,12,4,'#c8a868');
R(4,82,42,14,'#d8b878');R(4,82,42,3,'#ecd49a');for(let i=0;i<4;i++)R(8+i*9,90,2,6,'#a08050');R(30,38,32,52,'#d0b070');R(30,38,4,52,'#e2c890');
R(20,8,52,46,'#3a5aa0');for(let i=0;i<7;i++)R(20,12+i*6,52,2,'#e0b040');R(31,16,30,32,'#e0c080');R(31,16,30,3,'#f0d8a0');R(56,16,5,32,'#c8a060');
R(37,27,6,2,'#2a1a0a');R(49,27,6,2,'#2a1a0a');R(37,26,6,1,'#f8e8c0');R(45,30,3,7,'#c8a060');R(40,41,12,2,'#8a5a30');R(42,46,8,12,'#3a5aa0');R(42,48,8,2,'#e0b040');
R(43,2,6,8,'#e0b040');R(44,0,4,3,'#ffd45a');for(let n=0;n<12;n++)R(Math.floor(32+r()*90),Math.floor(60+r()*32),1+Math.floor(r()*3),1,'#8a6a3a');R(0,104,44,8,'#e0c890');R(100,100,40,8,'#e0c890')}
else if(ch=='N'){c.width=50;c.height=84;R(22,62,6,20,'#5a3c22');R(22,62,2,20,'#7a5232');R(18,79,14,3,'#4a3020');
for(let n=0;n<4;n++){const y0=8+n*14,w=8+n*7;for(let yy=0;yy<16;yy++){const ww=Math.round(w*yy/16)+2;R(25-ww,y0+yy,ww*2,1,yy%5==0?'#1f4a30':'#2a5e3c');R(25-ww,y0+yy,Math.max(1,ww-2),1,'#3a7a4e')}
R(25-w+2,y0+15,w*2-4,2,'#f4f8fb');R(25-Math.round(w*.4),y0+6,Math.round(w*.8),2,'#e8f0f6')}R(23,4,4,4,'#f4f8fb');for(let n=0;n<8;n++)R(Math.floor(8+r()*34),Math.floor(10+r()*50),1,1,'#ffffff')}
else if(ch=='G'){c.width=36;c.height=52;const sh=(x0,w,h,cor,lz)=>{for(let yy=0;yy<h;yy++){const ww=Math.max(1,Math.round(w*(1-Math.abs(yy-h*.35)/(h*.65))));R(x0-ww,50-h+yy,ww*2,1,cor);R(x0-ww,50-h+yy,1,1,lz)}};
sh(10,5,26,'#7fc4e8','#d8f2ff');sh(25,5,30,'#8fd0f0','#e8f8ff');sh(18,7,46,'#a8def6','#ffffff');R(17,12,1,26,'#e8f8ff');R(4,48,28,3,'#cfe8f8')}
else if(ch=='M'){c.width=50;c.height=80;R(22,30,7,47,'#3e3530');R(22,30,2,47,'#5a4e46');R(27,30,2,47,'#2a2420');R(18,74,15,4,'#2e2824');
const galho=(x0,y0,dx,dy,n)=>{for(let i=0;i<n;i++)R(Math.round(x0+dx*i),Math.round(y0+dy*i),2,2,'#3e3530')};
galho(22,40,-1.4,-1,10);galho(28,36,1.3,-1.1,11);galho(24,30,-.3,-1.6,14);galho(12,30,-.6,-1.2,5);galho(40,24,.8,-1.3,5);
for(let n=0;n<6;n++)R(Math.floor(16+r()*20),Math.floor(10+r()*30),1,1,'#ff8a3a')}
else if(ch=='P'){c.width=24;c.height=58;R(4,50,16,7,'#8e8a7c');R(4,50,16,1,'#b4b0a0');R(7,14,10,37,'#a9a594');R(7,14,3,37,'#c4c0ae');R(14,14,3,37,'#7e7a6c');
for(let i=0;i<4;i++)R(9+i*2,14,1,37,'rgba(60,55,45,.25)');R(5,10,14,4,'#b4b0a0');for(let i=0;i<14;i++)R(5+i,6+Math.floor(r()*4),1,4,'#b4b0a0');
R(10,24,1,6,'#4e4a40');R(11,30,1,5,'#4e4a40');for(let n=0;n<10;n++)R(Math.floor(5+r()*14),Math.floor(8+r()*40),2,1+Math.floor(r()*4),'#5f8f3a')}
else if(ch=='E'){c.width=32;c.height=46;R(5,34,22,11,'#8e8a7c');R(5,34,22,2,'#b4b0a0');R(9,18,14,16,'#a9a594');R(9,18,3,16,'#c4c0ae');R(19,18,4,16,'#7e7a6c');
R(11,7,10,10,'#a9a594');R(11,7,3,10,'#c4c0ae');R(18,7,3,10,'#7e7a6c');R(13,11,2,1,'#4e4a40');R(17,11,2,1,'#4e4a40');R(6,22,4,8,'#9a968a');R(22,22,4,8,'#7e7a6c');
for(let n=0;n<8;n++)R(Math.floor(6+r()*20),Math.floor(8+r()*34),2,2,'#5f8f3a')}
else if(ch=='B'){c.width=34;c.height=20;for(const[a,b,rr]of[[10,12,6],[18,10,7],[25,12,6]])bolha(x,a,b,rr,'#2f6b2a');for(const[a,b,rr]of[[9,10,4],[17,8,5],[24,10,4]])bolha(x,a,b,rr,'#4c9a3a');
for(let n=0;n<5;n++)R(Math.floor(6+r()*22),Math.floor(5+r()*8),1,1,'#9ad46a')}
return OBC[k]=ch=='F'?c:contorno(c,'#1b1410')}
// Baú deixado por um inimigo. Raro: roxo e dourado, com brilho pulsando. 'celeste': o Baú Celestial, branco e dourado.
const BAUC={};
function desenhaBau(g,cx,cy,raro,t){const cel=raro=='celeste';if(raro){const al=.35+.25*Math.sin(t/8);g.fillStyle=cel?`rgba(255,226,120,${al+.15})`:`rgba(200,120,255,${al})`;g.beginPath();g.ellipse(cx,cy-4,20,10,0,0,7);g.fill()}
const k=cel?'s':raro?'r':'c';if(!BAUC[k]){const c=document.createElement('canvas');c.width=22;c.height=18;const x=c.getContext('2d'),R=(a,b,w,h,cor)=>{x.fillStyle=cor;x.fillRect(a,b,w,h)};
const cor=cel?'#f4ecd0':raro?'#6a3a9a':'#8a5a2b',esc=cel?'#c9a24a':raro?'#4a2470':'#5e3a1a',ouro=cel?'#ffe066':raro?'#ffd45a':'#d4a24a';
R(2,7,18,9,cor);R(2,13,18,3,esc);R(3,3,16,5,cor);R(3,3,16,1,tom(cor,1.3));R(2,7,18,1,esc);R(5,3,2,13,ouro);R(15,3,2,13,ouro);R(10,8,2,3,ouro);R(10,9,2,1,'#2a1c10');
BAUC[k]=contorno(c,'#1a1210')}g.drawImage(BAUC[k],cx-11,cy-17)}
function desenhaObj(g,ch,cx,cy,v,aceso){if(ch=='X'||ch=='Y'){const R=(a,b,w,h,cor)=>{g.fillStyle=cor;g.fillRect(cx+a,cy+b,w,h)};
if(aceso){const t=performance.now()/120,brilho=g.createRadialGradient(cx,cy-26,4,cx,cy-26,70);brilho.addColorStop(0,'rgba(255,170,60,.45)');brilho.addColorStop(1,'rgba(255,170,60,0)');g.fillStyle=brilho;g.fillRect(cx-70,cy-96,140,140)}
R(-4,-14,8,14,'#4e4a58');R(-11,-22,22,8,'#6e6a7a');R(-11,-22,22,2,'#8e8a9a');R(-12,-23,24,1,'#1a1420');R(-7,0,14,3,'#3a3644');
if(aceso){const t=performance.now()/90;for(let n=0;n<5;n++){const h=10+6*Math.sin(t+n*1.7);R(-8+n*3,-22-h,3,h,n%2?'#ffd04a':'#ff7a2a')}R(-3,-30-4*Math.sin(t),6,4,'#fff2b0')}return}
if(ch=='F'){const r=semente(cx*7+cy*13);for(let n=0;n<7;n++){const a=cx+(r()-.5)*36,b=cy+(r()-.5)*14;g.fillStyle=r()<.5?'#f2a6c6':'#f7e27a';g.fillRect(a,b,3,3);g.fillStyle='#fff8e0';g.fillRect(a,b,1,1)}return}
if(ch=='#')return;const im=objImg(ch,v),ax={M:[25,78],T:[30,80],P:[12,55],E:[16,42],B:[17,15],N:[25,82],G:[18,50],L:[30,80],O:[12,92],S:[70,112],V:[30,148],H:[60,196],C:[16,28],Q:[12,216],W:[60,166]}[ch],e=ESCALA_OBJ[ch]||1;g.drawImage(im,cx-ax[0]*e,cy+2-ax[1]*e,im.width*e,im.height*e);
// O farol gira um facho de luz
if(ch=='H'){const a=performance.now()/900,lx=cx,ly=cy+2-ax[1]+18;g.save();g.globalCompositeOperation='lighter';for(const s of[1,-1]){const fx=lx+Math.cos(a)*s*260,fy=ly+Math.sin(a)*s*90,gr=g.createLinearGradient(lx,ly,fx,fy);gr.addColorStop(0,'rgba(255,240,170,.55)');gr.addColorStop(1,'rgba(255,240,170,0)');
g.fillStyle=gr;g.beginPath();g.moveTo(lx,ly);g.lineTo(fx-Math.sin(a)*s*30,fy+Math.cos(a)*s*14);g.lineTo(fx+Math.sin(a)*s*30,fy-Math.cos(a)*s*14);g.closePath();g.fill()}g.restore()}}
// Estruturas gigantes desenhadas maiores que o próprio desenho
const ESCALA_OBJ={S:1.35};
