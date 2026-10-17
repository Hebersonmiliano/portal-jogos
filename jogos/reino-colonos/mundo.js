// ===================== MUNDO: MAPA, TERRITÓRIO E CAMINHOS =====================
// O mapa é uma grade N×N de casas. Cada casa: t (terreno de TER), h (altura 0 a 3), obj (árvore, rocha...),
// uso (o que o jogador pôs ali: bandeira 'b', estrada 'e' ou prédio 'p'), dono (território do jogador)
// e inim (território do reino rival). N muda ao carregar um save feito com outro tamanho de mapa.
let N=48;const k=(x,y)=>x+','+y,inb=(x,y)=>x>=0&&y>=0&&x<N&&y<N;
const D8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
let M=[];
const cel=(x,y)=>inb(x,y)?M[y][x]:null;
// Árvores, rochas e arbustos impedem construir e passar. Flores não.
const bloqueia=o=>!!o&&o.k!='F';
const NOME_OBJ={T:'Árvore',R:'Rocha',B:'Arbusto',F:'Flores',W:'Campo de trigo'};

// Ruído suave: valores sorteados numa grade espaçada, interpolados entre si.
function ruido(r,passo){const G=Math.ceil(N/passo)+2,v=[...Array(G*G)].map(()=>r()),sm=t=>t*t*(3-2*t);
return(x,y)=>{const gx=x/passo,gy=y/passo,i=Math.floor(gx),j=Math.floor(gy),fx=sm(gx-i),fy=sm(gy-j),a=v[j*G+i],b=v[j*G+i+1],c=v[(j+1)*G+i],d=v[(j+1)*G+i+1];
return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy}}

function geraMundo(seed){const r=semente(seed),n1=ruido(r,9),n2=ruido(r,4),nm=ruido(r,6),c=N>>1;
// Elevação: ruído com as bordas mais baixas (o mar fica em volta). A serra tem um ruído próprio, para
// se espalhar pelo mapa em vez de juntar no centro. Os limites saem por percentil, então todo mapa tem
// a mesma proporção: 22% água, 3% areia, 15% colinas e uns 9% de serra.
const ns=ruido(r,7),E=[],SE=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++){const dc=Math.hypot(x-c,y-c)/c;E.push(n1(x,y)*.7+n2(x,y)*.3-dc*dc*.35);SE.push(ns(x,y))}
const pc=(A,f)=>{const o=[...A].sort((a,b)=>a-b);return o[Math.floor(f*(o.length-1))]},[ea,es,eh]=[pc(E,.22),pc(E,.25),pc(E,.8)],[em,ex]=[pc(SE,.88),pc(SE,.96)];
M=[];for(let y=0;y<N;y++){const l=[];for(let x=0;x<N;x++){const e=E[y*N+x],se=SE[y*N+x];
let t='g',h=1;if(e<ea){t='a';h=0}else if(e<es)t='s';else if(se>=em&&Math.hypot(x-c,y-c)>4){t='m';h=se>=ex?3:2}else if(e>=eh)h=2;
l.push({t,h,obj:null,uso:null,dono:false,v:Math.floor(r()*4)})}M.push(l)}
// Garante uma floresta e um morro de pedras perto da sede, para o começo nunca travar
const mancha=(mx,my,rad,f)=>{const R=Math.ceil(rad);for(let y=my-R;y<=my+R;y++)for(let x=mx-R;x<=mx+R;x++){const d=Math.hypot(x-mx,y-my);if(inb(x,y)&&d<=rad)f(M[y][x],d)}};
const fx=c+6+Math.floor(r()*2),fy=c-5,px=c-6,py=c+5;
mancha(fx,fy,4,q=>{if(q.t=='a'){q.t='g';q.h=1}});mancha(px,py,3,(q,d)=>{q.t=d<2.6?'m':'g';q.h=d<2.6?2:1});
// Alturas sem degraus de mais de 1 entre vizinhos
for(let p=0;p<3;p++)for(let y=0;y<N;y++)for(let x=0;x<N;x++){const q=M[y][x];for(const[dx,dy]of D8){const n=cel(x+dx,y+dy);if(n&&q.h>n.h+1)q.h=n.h+1}if(q.t=='m'&&q.h<2)q.t='g'}
// Objetos: florestas onde o ruído nm é alto, árvores soltas, arbustos, flores e rochas na serra
for(let y=0;y<N;y++)for(let x=0;x<N;x++){const q=M[y][x],m=nm(x,y),v=Math.floor(r()*3);
if(q.t=='g'){if(m>.6&&r()<.7||r()<.025)q.obj={k:'T',cresce:1,v};else if(r()<.02)q.obj={k:'B',v};else if(r()<.05)q.obj={k:'F'}}
else if(q.t=='m'&&r()<.3)q.obj={k:'R',q:3+Math.floor(r()*4),v}}
mancha(fx,fy,4,(q,d)=>{if(q.t=='g'&&r()<.8-d*.08)q.obj={k:'T',cresce:1,v:Math.floor(r()*3)}});
mancha(px,py,2,(q,d)=>{if(d<1.5)q.obj={k:'R',q:6,v:Math.floor(r()*3)}});
// Clareira plana em volta da sede
mancha(c,c,3.2,q=>{q.t='g';q.h=1;q.obj=null});
distribuiMinerios(r);
// O morro perto da sede sempre tem carvão de um lado e ferro do outro, com casas livres de rocha para as minas.
// É o único minério já conhecido (desc) no começo; o resto da serra só um geólogo descobre.
mancha(px,py,3,(q,d)=>{if(q.t=='m'){q.min={k:'carvao',q:8};q.desc=1;if(d>=1.5&&q.obj&&q.obj.k=='R')q.obj=null}});
for(let y=py-3;y<=py+3;y++)for(let x=px-3;x<=px+3;x++){const q=cel(x,y);if(q&&q.t=='m'&&x+y>px+py)q.min={k:'ferro',q:8}}}
// Minérios dentro da serra: carvão (mais comum), ferro e ouro (mais raro), em veios que seguem um ruído.
// Cada casa de serra guarda min = {k: tipo, q: quanto ainda dá para tirar}.
const NOME_MIN={carvao:'carvão',ferro:'ferro',ouro:'ouro'};
function distribuiMinerios(r){const nc=ruido(r,5),nf=ruido(r,5),no=ruido(r,6);
for(let y=0;y<N;y++)for(let x=0;x<N;x++){const q=M[y][x];if(q.t!='m'||r()<.25)continue;
const v=[['carvao',nc(x,y)],['ferro',nf(x,y)*1.04],['ouro',no(x,y)*.8]].sort((a,b)=>b[1]-a[1])[0];q.min={k:v[0],q:5+Math.floor(r()*6)}}}

// Território: cada prédio militar com soldados (e cada sede) alcança TIPOS[tipo].terr casas.
// Casa alcançada pelos dois reinos fica com quem já era dono (não se toma terra sem conquistar);
// se ninguém era, fica com o prédio mais perto. p.dono: 0 (ou vazio) jogador, 1 reino rival.
const raioTerr=p=>p.obra?0:p.tipo=='sede'?TIPOS.sede.terr:TIPOS[p.tipo].militar&&p.guar&&p.guar.length?TIPOS[p.tipo].terr:0;
function territorio(){const alc=new Map();
for(const p of J.pred.values()){const R=raioTerr(p);if(!R)continue;const d=p.dono||0;
for(let y=p.y-R;y<=p.y+R;y++)for(let x=p.x-R;x<=p.x+R;x++){if(!inb(x,y))continue;const dd=Math.hypot(x-p.x,y-p.y);if(dd>R+.3)continue;
const kk=y*N+x,a=alc.get(kk)||[1e9,1e9];if(dd<a[d])a[d]=dd;alc.set(kk,a)}}
for(let y=0;y<N;y++)for(let x=0;x<N;x++){const q=M[y][x],a=alc.get(y*N+x),antes=q.dono?0:q.inim?1:-1;let dono=-1;
if(a){const c0=a[0]<1e9,c1=a[1]<1e9;dono=c0&&c1?(antes>=0?antes:a[0]<=a[1]?0:1):c0?0:1}q.dono=dono==0;q.inim=dono==1}}

// Onde um colono pode pisar: fora da água, das rochas e dos prédios, sem degrau maior que 1.
// Como no Settlers, os colonos atravessam a mata (árvores só impedem estradas e construções).
function andavel(x,y,px,py){const q=cel(x,y),p=cel(px,py);return q.t!='a'&&!(q.obj&&q.obj.k=='R')&&!(q.uso&&q.uso.k=='p')&&Math.abs(q.h-p.h)<=1}
const andavelPara=(tx,ty)=>(x,y,px,py)=>(x==tx&&y==ty&&Math.abs(cel(x,y).h-cel(px,py).h)<=1)||andavel(x,y,px,py);

// A* em 8 direções. ok(x,y,px,py) diz se dá para ir de (px,py) até (x,y).
// perto: chega numa casa vizinha do alvo (para cortar uma árvore, por exemplo). quina: não corta caminho pela diagonal entre dois obstáculos.
// Devolve as casas do caminho (sem a casa de partida) ou null.
function caminho(sx,sy,tx,ty,ok,perto,quina=true){const fim=(x,y)=>perto?Math.max(Math.abs(x-tx),Math.abs(y-ty))<=1:x==tx&&y==ty;if(fim(sx,sy))return[];
const H=(x,y)=>{const dx=Math.abs(x-tx),dy=Math.abs(y-ty);return Math.max(dx,dy)+.41*Math.min(dx,dy)},g=new Float32Array(N*N).fill(1e9),de=new Int32Array(N*N).fill(-1),fe=new Uint8Array(N*N),hp=[];
const push=(f,i)=>{hp.push([f,i]);let n=hp.length-1;while(n){const p=(n-1)>>1;if(hp[p][0]<=hp[n][0])break;[hp[p],hp[n]]=[hp[n],hp[p]];n=p}};
const pop=()=>{const top=hp[0],last=hp.pop();if(hp.length){hp[0]=last;let n=0;for(;;){const a=2*n+1,b=a+1;let m=n;if(a<hp.length&&hp[a][0]<hp[m][0])m=a;if(b<hp.length&&hp[b][0]<hp[m][0])m=b;if(m==n)break;[hp[m],hp[n]]=[hp[n],hp[m]];n=m}}return top};
const s0=sy*N+sx;g[s0]=0;push(H(sx,sy),s0);
while(hp.length){const i=pop()[1];if(fe[i])continue;fe[i]=1;const x=i%N,y=(i/N)|0;
if(fim(x,y)){const out=[];for(let j=i;j!=s0;j=de[j])out.push([j%N,(j/N)|0]);return out.reverse()}
for(const[dx,dy]of D8){const nx=x+dx,ny=y+dy;if(!inb(nx,ny))continue;const ni=ny*N+nx;if(fe[ni]||!ok(nx,ny,x,y))continue;
if(quina&&dx&&dy&&(!andavel(x+dx,y,x,y)||!andavel(x,y+dy,x,y)))continue;
const c=g[i]+(dx&&dy?1.41:1);if(c<g[ni]){g[ni]=c;de[ni]=i;push(c+H(nx,ny),ni)}}}
return null}
