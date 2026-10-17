// ===================== REINO RIVAL (IA) =====================
// O Reino de Morvane nasce do outro lado do mapa e cresce sozinho. A economia dele é resumida (os prédios
// rendem tábuas, pedras, ouro e soldados com o tempo, sem estradas nem carregadores), mas os prédios e os
// soldados são de verdade no mapa: dá para vê-los, atacá-los e tomá-los.
// J.rival: {sede, estoque {tabua, pedra}, ouro, reserva (patentes dos soldados livres), plano, tObra, tAtaque, treino, morto}
const COR_RIVAL='#c0392b',NOME_RIVAL='Reino de Morvane';
// graca: segundos de jogo sem ataques no começo (15 min). sedeLivre: antes disso (25 min) a sede do jogador
// não é atacada, só os prédios militares. obra: intervalo entre obras. ataque: intervalo entre ataques.
const IA={graca:900,sedeLivre:1500,obra:40,ataque:50,tempoMaterial:4,maxReserva:30};
// Dificuldade (escolhida no Novo mapa, J.dif): muda a trégua, o ritmo de obras e ataques, o treino de soldados,
// a renda do rival e quantos soldados a mais ele manda em cada ataque.
const DIFS={facil:{n:'Fácil',graca:1500,sedeLivre:2400,obra:55,ataque:70,treino:.6,renda:.75,extra:0},
normal:{n:'Normal',treino:1,renda:1,extra:0},
dificil:{n:'Difícil',graca:600,sedeLivre:1000,obra:30,ataque:40,treino:1.4,renda:1.3,extra:1}};
const ia=()=>({...IA,...DIFS[J.dif||'normal']});
// Ordem do que o rival constrói (repete o fim depois da primeira volta)
const PLANO_IA=['lenhador','serraria','guarita','pedreira','fazenda','guarita','armaria','lenhador','quartel','pescador','guarita','quartel','pedreira','guarita'];

// Escolhe o lugar da sede rival: terra firme, longe do jogador, com espaço em volta
function criaRival(){const S=J.sede;let m=null,mv=-1;
for(let y=4;y<N-4;y++)for(let x=4;x<N-4;x++){const d=Math.hypot(x-S.x,y-S.y);if(d<17||d>28)continue;let terra=0;
for(let j=-4;j<=4;j++)for(let i=-4;i<=4;i++){const q=cel(x+i,y+j);if(q&&q.t!='a'&&q.t!='m'&&!q.uso)terra++}if(terra<55)continue;const sc=terra+d*2;if(sc>mv){mv=sc;m=[x,y]}}
if(!m)return null;const[x,y]=m;
for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++){const q=cel(x+i,y+j);if(q&&Math.hypot(i,j)<=3.2&&!q.uso){q.t='g';q.h=1;q.obj=null;q.min=null}}
const p=predioRival('sede',x,y);p.obra=null;p.guar=[{r:0},{r:0},{r:1}];
J.rival={sede:p.id,nasceu:J.t,estoque:{tabua:20,pedra:14},ouro:0,reserva:[0,0],plano:0,tObra:12,tAtaque:0,treino:0,morto:false};territorio();return p}
// Tempo desde que o rival nasceu (num save antigo ele nasce ao carregar, e a trégua conta dali)
const idadeRival=()=>J.t-(J.rival&&J.rival.nasceu||0);
// Prédio do rival: sem bandeira nem estrada (band null). A obra já tem o material e só leva tempo.
function predioRival(tipo,x,y){const T=TIPOS[tipo],q=cel(x,y),total=T.custo?Object.values(T.custo).reduce((a,b)=>a+b,0):0;q.obj=null;
const p={id:novoId(),tipo,x,y,band:null,dono:1,obra:T.custo?{tem:{...T.custo},feito:0,total}:null,estoque:{},vindo:{},trab:null,obreiro:null,status:''};
if(T.militar)p.guar=[];q.uso={k:'p',id:p.id};J.pred.set(p.id,p);return p}
// Lugar para uma obra rival: dentro do território dele, livre e sem prédio vizinho.
// Militar: o mais perto possível da sede do jogador, a 5 casas ou mais de outro militar dele (para avançar). Comum: perto da sede rival.
function lugarRival(tipo){const R=J.rival,S=J.pred.get(R.sede),T=TIPOS[tipo],mil=[...J.pred.values()].filter(p=>p.dono==1&&militar(p));let m=null,mv=1e9;
for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){const q=cel(x,y);if(!q.inim||q.uso||q.t!='g'&&q.t!='s'||bloqueia(q.obj))continue;const f=cel(x+1,y+1);if(!f||f.t=='a'||f.uso)continue;
if(D8.some(([a,b])=>{const n=cel(x+a,y+b);return n&&n.uso&&n.uso.k=='p'}))continue;let sc;
if(T.militar){const dm=Math.min(...mil.map(p=>Math.hypot(p.x-x,p.y-y)));if(dm<5)continue;sc=Math.hypot(x-J.sede.x,y-J.sede.y)}
else sc=Math.hypot(x-S.x,y-S.y)+Math.random()*2;if(sc<mv){mv=sc;m=[x,y]}}return m}

function iaRival(dt){const R=J.rival;if(!R||R.morto||J.fim)return;const C=ia();const S=J.pred.get(R.sede);if(!S){R.morto=true;return}
const meus=[...J.pred.values()].filter(p=>p.dono==1),n=t=>meus.filter(p=>p.tipo==t&&!p.obra).length;
// Economia resumida: renda base da sede + o que cada prédio pronto rende
R.estoque.tabua+=dt*C.renda*(1/20+n('serraria')/14);R.estoque.pedra+=dt*C.renda*(1/30+n('pedreira')/16);R.ouro+=dt*C.renda*(1/200+n('mina_ouro')/60);
R.treino+=dt*C.treino*(1/70+n('armaria')/35)*(n('fazenda')+n('pescador')?1.3:1);if(R.treino>=1){R.treino-=1;if(R.reserva.length<C.maxReserva)R.reserva.push(0)}
// Obras andam sozinhas
for(const p of meus)if(p.obra){p.obra.feito=Math.min(p.obra.total,p.obra.feito+dt/C.tempoMaterial);if(p.obra.feito>=p.obra.total)p.obra=null}
// Guarnições: soldados da reserva saem a pé da sede rival até os prédios militares com vaga
for(const p of meus)if(militar(p)&&!p.obra&&p!=S&&R.reserva.length&&!sobAtaque(p)){const vindo=J.col.filter(u=>u.dono==1&&u.est=='vai'&&u.p==p.id).length;if(p.guar.length+vindo>=TIPOS[p.tipo].vagas)continue;
const cam=caminho(S.x,S.y,p.x,p.y,andavelPara(p.x,p.y));if(!cam)continue;J.col.push({id:novoId(),of:'soldado',dono:1,r:R.reserva.shift(),x:S.x,y:S.y,cam,v:1.9,est:'vai',p:p.id,dx:1,dy:1,passo:0,t:0,hv:1})}
if(!sobAtaque(S))while(S.guar.length<TIPOS.sede.vagas&&R.reserva.length)S.guar.push({r:R.reserva.shift()});
// Uma obra por vez, seguindo o plano (até 32 prédios, 10 deles militares)
R.tObra-=dt;if(R.tObra<=0&&!meus.some(p=>p.obra)&&meus.length<32){R.tObra=C.obra;const tipo=PLANO_IA[R.plano<PLANO_IA.length?R.plano:6+(R.plano-6)%(PLANO_IA.length-6)],c=TIPOS[tipo].custo;
if(TIPOS[tipo].militar&&meus.filter(militar).length>=10)R.plano++;
else if(R.estoque.tabua>=(c.tabua||0)&&R.estoque.pedra>=(c.pedra||0)){const l=lugarRival(tipo);R.plano++;if(l){R.estoque.tabua-=c.tabua||0;R.estoque.pedra-=c.pedra||0;const p=predioRival(tipo,...l);
if(TIPOS[tipo].militar&&Math.min(...[...J.pred.values()].filter(q=>!q.dono&&militar(q)).map(q=>Math.hypot(q.x-p.x,q.y-p.y)))<=ALCANCE_ATAQUE)aviso('O '+NOME_RIVAL+' está construindo '+(TIPOS[tipo].fem?'uma ':'um ')+TIPOS[tipo].n+' perto da sua fronteira.')}}}
// Ataques, depois da trégua do começo
R.tAtaque-=dt;if(idadeRival()>C.graca&&R.tAtaque<=0){R.tAtaque=C.ataque;planejaAtaque()}}
// Ataca o prédio militar do jogador mais fraco ao alcance, se puder mandar mais soldados do que ele tem de defensores
function planejaAtaque(){const C=ia();let m=null,mv=1e9;for(const p of J.pred.values()){if(p.dono||!militar(p)||p.obra||p==J.sede&&idadeRival()<C.sedeLivre)continue;const disp=contaAtacantes(p,1);if(disp<=p.guar.length)continue;
const sc=forca(p.guar)-disp*.5;if(sc<mv){mv=sc;m=p}}if(!m)return;
const env=ataca(m,Math.min(contaAtacantes(m,1),m.guar.length+1+C.extra),1);
if(env){aviso('⚔ O '+NOME_RIVAL+' está atacando '+(m==J.sede?'a sua Sede':(TIPOS[m.tipo].fem?'a sua ':'o seu ')+TIPOS[m.tipo].n)+' com '+env+' soldado'+(env>1?'s':'')+'!');toca('corneta',.8)}}
