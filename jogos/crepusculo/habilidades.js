// ===================== CLASSES E HABILIDADES =====================
// Cada linha de evolução tem 7 classes, liberadas nos níveis 1, 5, 12, 20, 30, 40 e 50 (nível máximo).
// Cada classe ensina uma habilidade (HAB, campo de = classe que ensina). O herói usa as habilidades de todas
// as classes da sua linha até a classe atual. Magias gastam MP; técnicas de combate têm recarga (rec, em turnos
// do próprio herói) e algumas só podem ser usadas uma vez por batalha (usos). passiva: bônus permanente.
const EVOL={
K:[['K',1],['P',5],['E',12],['K4',20],['K5',30],['K6',40],['K7',50]],
A:[['A',1],['T',5],['V',12],['A4',20],['A5',30],['A6',40],['A7',50]],
M:[['M',1],['X',5],['F',12],['M4',20],['M5',30],['M6',40],['M7',50]],
L:[['L',1],['S',5],['B',12],['L4',20],['L5',30],['L6',40],['L7',50]],
C:[['C',1],['Z',5],['O',12],['C4',20],['C5',30],['C6',40],['C7',50]],
R:[['R',1],['R2',5],['J',12],['R4',20],['R5',30],['R6',40],['R7',50]]};

// Classes novas (níveis 20 a 50 e o Hussardo). Nenhum nome se repete.
Object.assign(CL,{
R2:{n:'Hussardo',base:'R',hp:50,mp:0,mov:6,jmp:1,rng:2,min:1,atk:16,spd:12},
K4:{n:'Cruzado',base:'K',hp:68,mp:18,mov:4,jmp:2,rng:1,min:1,atk:19,spd:9},
K5:{n:'Campeão',base:'K',hp:76,mp:20,mov:4,jmp:2,rng:1,min:1,atk:21,spd:10},
K6:{n:'Bastião',base:'K',hp:86,mp:22,mov:4,jmp:2,rng:1,min:1,atk:22,spd:10},
K7:{n:'Lorde Solar',base:'K',hp:96,mp:26,mov:5,jmp:2,rng:1,min:1,atk:25,spd:11},
A4:{n:'Patrulheiro',base:'A',hp:44,mp:14,mov:4,jmp:3,rng:6,min:2,atk:18,spd:13},
A5:{n:'Sentinela',base:'A',hp:50,mp:16,mov:4,jmp:3,rng:6,min:2,atk:20,spd:13},
A6:{n:'Mestre dos Ventos',base:'A',hp:56,mp:18,mov:5,jmp:3,rng:6,min:2,atk:22,spd:14},
A7:{n:'Estrela Cadente',base:'A',hp:62,mp:20,mov:5,jmp:3,rng:7,min:2,atk:25,spd:15},
M4:{n:'Elementalista',base:'M',hp:38,mp:42,mov:3,jmp:1,rng:1,min:1,atk:9,spd:9},
M5:{n:'Cronomante',base:'M',hp:44,mp:50,mov:3,jmp:1,rng:1,min:1,atk:10,spd:10},
M6:{n:'Arcanista',base:'M',hp:50,mp:58,mov:3,jmp:1,rng:1,min:1,atk:11,spd:10},
M7:{n:'Grão-Sábio',base:'M',hp:56,mp:70,mov:4,jmp:1,rng:1,min:1,atk:12,spd:11},
L4:{n:'Saqueador',base:'L',hp:42,mp:0,mov:6,jmp:3,rng:1,min:1,atk:17,spd:15},
L5:{n:'Espectro',base:'L',hp:48,mp:0,mov:6,jmp:3,rng:1,min:1,atk:19,spd:16},
L6:{n:'Ceifador',base:'L',hp:54,mp:0,mov:7,jmp:3,rng:1,min:1,atk:21,spd:17},
L7:{n:'Senhor da Noite',base:'L',hp:60,mp:0,mov:7,jmp:4,rng:1,min:1,atk:24,spd:18},
C4:{n:'Exorcista',base:'C',hp:42,mp:38,mov:3,jmp:1,rng:1,min:1,atk:8,spd:10},
C5:{n:'Bispo',base:'C',hp:48,mp:46,mov:3,jmp:1,rng:1,min:1,atk:9,spd:10},
C6:{n:'Profeta',base:'C',hp:54,mp:54,mov:3,jmp:1,rng:1,min:1,atk:10,spd:11},
C7:{n:'Santo',base:'C',hp:60,mp:66,mov:4,jmp:1,rng:1,min:1,atk:11,spd:11},
R4:{n:'Ginete dos Céus',base:'R',hp:64,mp:0,mov:6,jmp:1,rng:2,min:1,atk:20,spd:12},
R5:{n:'Dragonário',base:'R',hp:72,mp:0,mov:6,jmp:1,rng:2,min:1,atk:22,spd:13},
R6:{n:'Guardião Escamado',base:'R',hp:80,mp:0,mov:6,jmp:1,rng:2,min:1,atk:24,spd:13},
R7:{n:'Avatar do Dragão',base:'R',hp:90,mp:0,mov:7,jmp:1,rng:2,min:1,atk:27,spd:14}});
CL.X.n='Piromante';CL.J.n='Draconato';
for(const ev of Object.values(EVOL))ev.forEach(([k],i)=>CL[k].tier=i+1);

Object.assign(PL,{
R2:{a:'#8a2a2a',b:'#5a3a22',g:'#ffd45a',w:'#c9a24a',h:'#8a2a2a'},
K4:{a:'#d8d8e0',b:'#a02030',g:'#ffd45a',w:'#f0f0f8',h:'#a02030'},K5:{a:'#c9a24a',b:'#7a5a20',g:'#fff2b0',w:'#ffffff',h:'#c9a24a'},
K6:{a:'#5a6a7a',b:'#2a3440',g:'#7fd0ff',w:'#c8d4e0',h:'#5a6a7a'},K7:{a:'#fff0c0',b:'#ffb020',g:'#ff7a20',w:'#fff8e0',h:'#fff0c0'},
A4:{a:'#4a6a2a',b:'#2e4418',g:'#c9a24a',w:'#6b4a2a',h:'#3a5a22'},A5:{a:'#6a4a8a',b:'#3e2a5a',g:'#e0c060',w:'#5a3a22',h:'#6a4a8a'},
A6:{a:'#bfe4f0',b:'#5a9ab8',g:'#ffffff',w:'#8a6a4a',h:'#5a9ab8'},A7:{a:'#1a2050',b:'#ffd45a',g:'#fff2b0',w:'#ffd45a',h:'#1a2050'},
M4:{a:'#2a8a7a',b:'#1a5a50',g:'#ff8a3a',w:'#cfa86a',h:'#2a8a7a',c:'#2a8a7a'},M5:{a:'#8a7a2a',b:'#5a4a10',g:'#c8f0ff',w:'#e0c890',h:'#5a4a10',c:'#5a4a10'},
M6:{a:'#6a1a8a',b:'#400a5a',g:'#ff5af0',w:'#cfa86a',h:'#400a5a',c:'#400a5a'},M7:{a:'#f0f0f0',b:'#c0c0c8',g:'#ffd45a',w:'#ffd45a',h:'#e0e0e8',c:'#e0e0e8'},
L4:{a:'#6a4a2a',b:'#3e2a14',g:'#ffd45a',w:'#d8dde6',h:'#4a3018'},L5:{a:'#2a4a3a',b:'#14261c',g:'#7ad06a',w:'#c8ffd8',h:'#1a3a2a'},
L6:{a:'#18181e',b:'#000000',g:'#c0c0d0',w:'#e8e8f0',h:'#26262e'},L7:{a:'#2a0a3a',b:'#14001e',g:'#ff3a6a',w:'#ffd45a',h:'#4a0a2a'},
C4:{a:'#e0e8f0',b:'#5a7a9a',g:'#7fd0ff',w:'#e0b040',h:'#5a7a9a'},C5:{a:'#8a1a2a',b:'#5a0a14',g:'#ffd45a',w:'#ffd45a',h:'#8a1a2a'},
C6:{a:'#f4e8c8',b:'#b89a5a',g:'#7fd0ff',w:'#b89a5a',h:'#f4e8c8'},C7:{a:'#ffffff',b:'#ffd45a',g:'#ffd45a',w:'#fff2b0',h:'#ffffff'},
R4:{a:'#5a8ab8',b:'#e8e8f0',g:'#ffd45a',w:'#c9a24a',h:'#5a8ab8'},R5:{a:'#a03a1a',b:'#5a2a10',g:'#ffb020',w:'#c9a24a',h:'#a03a1a'},
R6:{a:'#2a5a3a',b:'#1a3a24',g:'#9ae0a0',w:'#c9a24a',h:'#2a5a3a'},R7:{a:'#ffd45a',b:'#a0601a',g:'#ff5a2a',w:'#fff2b0',h:'#ffd45a'}});

Object.assign(DS,{
X:'Piromante: mestre do fogo. O Inferno atinge uma área a até 4 casas, com mais dano.',
J:'Draconato: com asas de dragão, passa por cima de obstáculos, alturas e inimigos, e ataca a até 2 casas com a lança.',
R2:'Hussardo: cavalaria de elite. A lança alcança até 3 casas.',
K4:'Cruzado: o Grito de Guerra obriga os inimigos próximos a atacá-lo.',K5:'Campeão: o Juízo Final lança um raio de luz em linha reta.',
K6:'Bastião: aliados ao lado dele recebem sempre 20% menos dano.',K7:'Lorde Solar: a Égide Solar protege todo o grupo por um turno.',
A4:'Patrulheiro: o Tiro Perfurante atravessa e atinge 2 inimigos em linha.',A5:'Sentinela: ganha +1 de alcance quando está em terreno alto.',
A6:'Mestre dos Ventos: a Flecha Relâmpago faz o alvo perder o próximo turno.',A7:'Estrela Cadente: o Tiro Celeste atinge todos os inimigos em uma linha do mapa.',
M4:'Elementalista: o Toque Gélido causa dano e deixa o alvo lento.',M5:'Cronomante: Parar o Tempo faz um inimigo perder o próximo turno.',
M6:'Arcanista: o Raio Arcano causa dano muito alto num alvo só.',M7:'Grão-Sábio: a Supernova explode numa área imensa, uma vez por batalha.',
L4:'Saqueador: rouba ouro ou itens dos inimigos.',L5:'Espectro: a Lâmina Venenosa faz o alvo perder vida por 3 turnos.',
L6:'Ceifador: o Manto de Sombras o deixa invisível por um turno.',L7:'Senhor da Noite: a Execução elimina inimigos muito feridos.',
C4:'Exorcista: Purificar remove veneno, lentidão e paralisia dos aliados.',C5:'Bispo: Reviver levanta um aliado caído, uma vez por batalha.',
C6:'Profeta: a Proteção Divina deixa um aliado sem receber dano por um turno.',C7:'Santo: o Milagre cura todo o grupo e levanta os caídos, uma vez por batalha.',
R4:'Ginete dos Céus: o Salto do Dragão cai sobre o alvo e atinge quem está ao redor.',R5:'Dragonário: o Sopro de Dragão queima tudo em linha reta.',
R6:'Guardião Escamado: escamas de dragão reduzem em 25% o dano de magia.',R7:'Avatar do Dragão: a Fúria do Dragão ataca todos os inimigos a até 2 casas.'});

// tipo: como a habilidade é usada. Sem alvo: escudo, egide, mira, manto, provoca, milagre, furia.
// alvo 'rng' = o alcance de ataque da própria unidade. fis: dano físico (soma metade do Ataque); senão soma a Magia.
const HAB={
golpe_firme:{n:'Golpe Firme',de:'K',tipo:'empurra',rec:2,txt:'Ataque que empurra o inimigo 1 casa para trás'},
toque_sagrado:{n:'Toque Sagrado',de:'P',tipo:'cura',mp:4,cura:12,alc:1,txt:'Cura um aliado ao lado'},
escudo_luz:{n:'Escudo de Luz',de:'E',tipo:'escudo',mp:6,txt:'Ele e os aliados ao lado recebem metade do dano até o próximo turno dele'},
grito_guerra:{n:'Grito de Guerra',de:'K4',tipo:'provoca',rec:3,raio:3,txt:'Inimigos a até 3 casas são obrigados a atacá-lo'},
juizo_final:{n:'Juízo Final',de:'K5',tipo:'linha',alc:3,dano:20,fis:true,rec:3,verbo:'invoca o',txt:'Raio de luz em 3 casas em linha reta'},
muralha_viva:{n:'Muralha Viva',de:'K6',passiva:{muralha:true},txt:'Aliados ao lado dele recebem 20% menos dano'},
egide_solar:{n:'Égide Solar',de:'K7',tipo:'egide',usos:1,txt:'Todo o grupo recebe metade do dano por 1 turno (1 vez por batalha)'},
mira:{n:'Mira',de:'A',tipo:'mira',rec:3,txt:'O próximo ataque causa +50% de dano'},
flecha_imobilizante:{n:'Flecha Imobilizante',de:'T',tipo:'alvo',alc:'rng',mult:.8,st:'preso',dur:1,rec:2,txt:'O alvo não pode se mover no próximo turno'},
chuva_flechas:{n:'Chuva de Flechas',de:'V',tipo:'fogo',mp:6,dano:10,alc:5,fis:true,verbo:'dispara',txt:'Dano físico em área a até 5 casas'},
tiro_perfurante:{n:'Tiro Perfurante',de:'A4',tipo:'linha',alc:6,max:2,dano:8,fis:true,rec:2,verbo:'dispara o',txt:'Atravessa e atinge 2 inimigos em linha'},
olho_aguia:{n:'Olho de Águia',de:'A5',passiva:{olho:true},txt:'+1 de alcance em terreno alto (altura 2 ou mais)'},
flecha_relampago:{n:'Flecha Relâmpago',de:'A6',tipo:'alvo',alc:'rng',mult:1.3,st:'atordoado',dur:1,rec:4,semChefe:true,txt:'Dano alto; o alvo perde o próximo turno (chefes resistem)'},
tiro_celeste:{n:'Tiro Celeste',de:'A7',tipo:'linha',alc:99,dano:16,fis:true,usos:1,verbo:'dispara o',txt:'Atinge todos os inimigos numa linha do mapa (1 vez por batalha)'},
fogo:{n:'Fogo',de:'M',tipo:'fogo',mp:5,dano:16,alc:3,txt:'Dano em área (raio 1) a até 3 casas'},
inferno:{n:'Inferno',de:'X',tipo:'fogo',mp:6,dano:22,alc:4,txt:'Área mais forte, a até 4 casas'},
meteoro:{n:'Meteoro',de:'F',tipo:'fogo',mp:9,dano:28,alc:5,raio:2,txt:'Área enorme (raio 2) a até 5 casas'},
toque_gelido:{n:'Toque Gélido',de:'M4',tipo:'alvo',mp:7,alc:4,dano:24,st:'lento',dur:2,txt:'Dano e −2 de Movimento por 2 turnos'},
parar_tempo:{n:'Parar o Tempo',de:'M5',tipo:'alvo',mp:12,alc:4,dano:0,st:'atordoado',dur:1,semChefe:true,txt:'Um inimigo perde o próximo turno (chefes resistem)'},
raio_arcano:{n:'Raio Arcano',de:'M6',tipo:'alvo',mp:10,alc:5,dano:46,txt:'Dano muito alto num alvo só, a até 5 casas'},
supernova:{n:'Supernova',de:'M7',tipo:'fogo',mp:20,dano:44,alc:6,raio:3,usos:1,txt:'Explosão de raio 3 (1 vez por batalha)'},
costas_ladino:{n:'Golpe pelas Costas',de:'L',passiva:{costas:2},txt:'Dano dobrado pelas costas'},
sombra_veloz:{n:'Sombra Veloz',de:'S',passiva:{costas:2.2},txt:'Dano 2,2 vezes maior pelas costas'},
golpe_duplo:{n:'Golpe Duplo',de:'B',passiva:{duplo:true},txt:'Ataca duas vezes (o 2º golpe com 60%)'},
roubar:{n:'Roubar',de:'L4',tipo:'roubar',rec:2,txt:'Toma ouro ou um item de um inimigo ao lado'},
lamina_venenosa:{n:'Lâmina Venenosa',de:'L5',tipo:'alvo',alc:1,mult:1,st:'veneno',dur:3,rec:3,txt:'Ataque que envenena: o alvo perde vida por 3 turnos'},
manto_sombras:{n:'Manto de Sombras',de:'L6',tipo:'manto',rec:4,txt:'Fica invisível até o próximo turno: os inimigos não podem mirá-lo'},
execucao:{n:'Execução',de:'L7',tipo:'execucao',rec:3,txt:'Elimina um inimigo ao lado com menos de 25% da vida (chefes: dano triplo)'},
cura:{n:'Cura',de:'C',tipo:'cura',mp:4,cura:14,alc:3,txt:'Cura um aliado a até 3 casas'},
cura_maior:{n:'Cura Maior',de:'Z',tipo:'cura',mp:5,cura:24,alc:4,txt:'Cura forte a até 4 casas'},
bencao:{n:'Bênção',de:'O',tipo:'bencao',mp:8,cura:22,alc:4,raio:1,txt:'Cura todos os aliados de uma área'},
purificar:{n:'Purificar',de:'C4',tipo:'purifica',mp:4,cura:10,alc:3,raio:1,txt:'Remove veneno, lentidão e paralisia dos aliados de uma área'},
reviver:{n:'Reviver',de:'C5',tipo:'reviver',mp:12,alc:3,usos:1,txt:'Levanta um aliado caído com 30% da vida (1 vez por batalha)'},
protecao_divina:{n:'Proteção Divina',de:'C6',tipo:'protecao',mp:10,alc:4,txt:'Um aliado não recebe dano até o próximo turno de quem lançou'},
milagre:{n:'Milagre',de:'C7',tipo:'milagre',mp:24,usos:1,txt:'Cura metade da vida de todo o grupo e levanta os caídos (1 vez por batalha)'},
investida:{n:'Investida',de:'R',tipo:'investida',rec:2,txt:'Corre em linha reta até um inimigo e ataca: +3 de dano por casa percorrida'},
lanca_longa:{n:'Lança Longa',de:'R2',passiva:{rng:3},txt:'Alcance de ataque 3'},
asas_dragao:{n:'Asas de Dragão',de:'J',passiva:{voa:true},txt:'Passa por cima de obstáculos, alturas e inimigos'},
salto_dragao:{n:'Salto do Dragão',de:'R4',tipo:'salto',alc:4,rec:3,txt:'Salta sobre um inimigo a até 4 casas e atinge quem está ao redor'},
sopro_dragao:{n:'Sopro de Dragão',de:'R5',tipo:'linha',alc:3,dano:24,fis:true,rec:3,verbo:'cospe o',txt:'Fogo em 3 casas em linha reta'},
escamas:{n:'Escamas',de:'R6',passiva:{escamas:true},txt:'−25% de dano de magia'},
furia_dragao:{n:'Fúria do Dragão',de:'R7',tipo:'furia',raio:2,rec:4,txt:'Ataca todos os inimigos a até 2 casas'}};
const SEM_ALVO=['escudo','egide','mira','manto','provoca','milagre','furia'],CURAS=['cura','bencao','purifica','reviver','protecao'];
const ST_ICONE={veneno:'☠',preso:'⛓',atordoado:'💫',lento:'❄'},ST_NOME={veneno:'envenenado',preso:'imobilizado',atordoado:'atordoado',lento:'lento'};

function linhaDe(k){const b=(CL[k]&&CL[k].base)||k,ev=EVOL[b];if(!ev)return[];const i=ev.findIndex(([c])=>c==k);return i<0?[]:ev.slice(0,i+1).map(([c])=>c)}
const habsDe=k=>{const ls=linhaDe(k);return Object.keys(HAB).filter(id=>ls.includes(HAB[id].de))};
const ativas=u=>(u.habs||[]).filter(id=>!HAB[id].passiva);
// Aplica as passivas e prepara recargas e estados de um herói que entra na batalha.
function prepHab(u){u.habs=habsDe(u.k);u.rec={};u.usos={};u.st={};
for(const id of u.habs){const p=HAB[id].passiva;if(!p)continue;if(p.costas)u.costas=Math.max(u.costas||1,p.costas);if(p.rng)u.rng=Math.max(u.rng,p.rng);
for(const f of['duplo','voa','olho','muralha','escamas'])if(p[f])u[f]=true}return u}
// Alcance de ataque: +1 com Olho de Águia no alto; −2 para ataques à distância durante a tempestade de areia.
const alcance=u=>Math.max(u.min,u.rng+(u.olho&&alt(u.x,u.y)>=2?1:0)-(u.rng>1&&typeof tempestade=='function'&&tempestade()?2:0));
function podeHab(u,id){const h=HAB[id];if(!h||h.passiva)return false;if((h.mp||0)>u.mp)return false;if(u.rec&&u.rec[id]>0)return false;
if(h.usos&&((u.usos&&u.usos[id])||0)>=h.usos)return false;if((h.tipo=='investida'||h.tipo=='salto')&&moved)return false;return true}
function rotuloHab(u,id){const h=HAB[id],r=u.rec&&u.rec[id];return h.n+(r>0?` (espera ${r})`:h.mp?` (${h.mp} MP)`:h.usos?((u.usos[id]||0)>=h.usos?' (usada)':' (1×)'):'')}
const inimigoDe=(a,t)=>t&&t.hp>0&&t.team!==a.team&&(a.team||visto(t));
function aplicaSt(t,st,dur,h){if(t.hp<=0)return;if(h&&h.semChefe&&t.lider){msg(`${t.name} resiste ao efeito.`);return}
t.st=t.st||{};t.st[st]=Math.max(t.st[st]||0,dur);pop(t,ST_ICONE[st],'#d8c8ff');msg(`${t.name} está ${ST_NOME[st]}.`)}
const estados=u=>u.st?Object.keys(ST_ICONE).filter(k=>u.st[k]>0):[];

// Casas da linha reta de a na direção de (x,y), até alc casas; para em casas bloqueadas.
function linhaTiles(a,x,y,alc){if(x!=a.x&&y!=a.y||(x==a.x&&y==a.y))return[];const dx=Math.sign(x-a.x),dy=Math.sign(y-a.y),r=[];
for(let i=1;i<=Math.min(alc,N);i++){const nx=a.x+dx*i,ny=a.y+dy*i;if(!inb(nx,ny)||!livre(nx,ny))break;r.push([nx,ny])}return r}
// Investida: inimigo em linha reta com caminho livre; devolve a casa onde o lanceiro para (ao lado do alvo).
function investidaAte(a,x,y){const t=at(x,y);if(!inimigoDe(a,t)||(x!=a.x&&y!=a.y))return null;const dx=Math.sign(x-a.x),dy=Math.sign(y-a.y),n=dist(x,y,a.x,a.y);
if(n<2||n>a.mov+1)return null;let px=a.x,py=a.y;for(let i=1;i<n;i++){const nx=a.x+dx*i,ny=a.y+dy*i;if(!livre(nx,ny)||at(nx,ny)||Math.abs(alt(nx,ny)-alt(px,py))>a.jmp)return null;px=nx;py=ny}return[px,py,n-1]}
// Salto do Dragão: casa livre ao lado do alvo, a mais perto de quem salta.
function pousoDe(a,t){let m=null,md=1e9;for(const[dx,dy]of DIRS){const nx=t.x+dx,ny=t.y+dy;if(!inb(nx,ny)||!livre(nx,ny)||at(nx,ny))continue;const d=dist(nx,ny,a.x,a.y);if(d<md){md=d;m=[nx,ny]}}return m}
const caidoEm=(a,x,y)=>U.find(o=>o.team==a.team&&o.hp<=0&&o.x==x&&o.y==y&&!o.caiuDeVez);

// Casas que podem ser escolhidas (para pintar no mapa).
function faixa(a,h){const r=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++){const d=dist(x,y,a.x,a.y);let ok=false;
switch(h.tipo){case'cura':case'protecao':case'bencao':case'purifica':case'reviver':ok=d<=h.alc;break;
case'fogo':ok=d>=1&&d<=h.alc;break;case'alvo':ok=h.alc=='rng'?d>=a.min&&d<=alcance(a):d>=1&&d<=h.alc;break;
case'empurra':case'roubar':case'execucao':ok=d==1;break;case'linha':ok=(x==a.x||y==a.y)&&d>=1&&d<=h.alc;break;
case'investida':ok=!!investidaAte(a,x,y);break;case'salto':{const t=at(x,y);ok=d<=h.alc&&inimigoDe(a,t)&&!!pousoDe(a,t);break}}
if(ok)r.push(key(x,y))}return r}

// paga: gasta o MP e marca recarga/usos. extra: só recarga/usos (para as funções que já gastam o MP sozinhas).
function extra(a,id){const h=HAB[id];if(h.rec)a.rec[id]=h.rec;if(h.usos)a.usos[id]=(a.usos[id]||0)+1}
function paga(a,id){a.mp-=HAB[id].mp||0;extra(a,id)}
// Usa a habilidade id em (x,y). fim() é chamado quando terminar. Devolve false se o alvo não serve.
function usaHab(a,id,x,y,fim){const h=HAB[id],t=at(x,y),d=dist(x,y,a.x,a.y),dentro=faixa(a,h).includes(key(x,y)),aliado=t&&t.team==a.team;
const ok=()=>{paga(a,id);fim();return true};
switch(h.tipo){
case'cura':if(!dentro||!aliado||t.hp>=t.mhp)return false;heal(a,t,h);extra(a,id);fim();return true;
case'bencao':if(!dentro)return false;bencao(a,x,y,h);extra(a,id);fim();return true;
case'fogo':if(!dentro)return false;fire(a,x,y,h);extra(a,id);fim();return true;
case'escudo':escudo(a,h);extra(a,id);fim();return true;
case'alvo':if(!dentro||!inimigoDe(a,t))return false;setF(a,x,y);sfx(h.mult?'arrow':'fire');msg(`${a.name} usa ${h.n}.`);
if(h.mult)hit(a,t,a.atk*h.mult);else if(h.dano)hit(a,t,danoSk(a,h),!h.fis);if(h.st&&t.hp>0)aplicaSt(t,h.st,h.dur,h);return ok();
case'empurra':{if(!dentro||!inimigoDe(a,t))return false;setF(a,x,y);sfx('sword');msg(`${a.name} usa ${h.n}.`);hit(a,t,a.atk);
if(t.hp>0){const nx=t.x+(t.x-a.x),ny=t.y+(t.y-a.y);if(inb(nx,ny)&&livre(nx,ny)&&!at(nx,ny)&&alt(nx,ny)-alt(t.x,t.y)<=1){t.x=nx;t.y=ny;msg(`${t.name} é empurrado para trás.`)}
else{const e=Math.max(1,Math.round(a.atk*.2));t.hp-=e;pop(t,'-'+e,'#ff5a52');msg(`${t.name} bate no obstáculo: ${e}${t.hp<=0?' — derrotado':''}.`);if(t.hp<=0&&t.team&&!t.caiu){t.caiu=true;a.kills=(a.kills||0)+1;if(typeof soltaBau=='function')soltaBau(t)}}}return ok()}
case'provoca':{const qs=U.filter(o=>o.team!==a.team&&o.hp>0&&dist(o.x,o.y,a.x,a.y)<=h.raio);qs.forEach(o=>o.provocado=a);sfx('crit');
msg(qs.length?`${a.name} solta o Grito de Guerra: ${qs.length} inimigo${qs.length>1?'s vêm':' vem'} atrás dele!`:`${a.name} grita, mas não há inimigos por perto.`);return ok()}
case'linha':{const ts=linhaTiles(a,x,y,h.alc);if(!ts.length)return false;setF(a,x,y);sfx(h.fis?'arrow':'fire');msg(`${a.name} ${h.verbo||'usa o'} ${h.n}.`);let n=0;
for(const[tx,ty]of ts){const o=at(tx,ty);if(!inimigoDe(a,o))continue;hit(a,o,danoSk(a,h),!h.fis);if(h.max&&++n>=h.max)break}return ok()}
case'egide':U.filter(o=>o.team==a.team&&o.hp>0).forEach(o=>o.escudo=a);sfx('heal');msg(`${a.name} ergue a Égide Solar: todo o grupo está protegido.`);return ok();
case'mira':a.mira=true;sfx('pas');msg(`${a.name} mira com cuidado: o próximo ataque causa +50% de dano.`);return ok();
case'manto':a.manto=true;sfx('pas');msg(`${a.name} some nas sombras.`);return ok();
case'roubar':{if(!dentro||!inimigoDe(a,t))return false;setF(a,x,y);if(t.roubado){msg(`${t.name} não tem mais nada para roubar.`);return ok()}t.roubado=true;sfx('pas');
const c=typeof camp=='function'&&camp(),lt=(F.loot||(typeof LOOT!='undefined'?LOOT:[])).filter(i=>i!='pocao');
if(lt.length&&Math.random()<.4&&typeof addItem=='function'){const it=lt[Math.floor(Math.random()*lt.length)];addItem(it);msg(`${a.name} rouba ${ITENS[it].n} de ${t.name}!`);pop(t,'Roubado!','#ffd45a')}
else{const o=20+Math.floor(Math.random()*41);if(c){c.ouro+=o;if(typeof salvaCamp=='function')salvaCamp()}msg(`${a.name} rouba ${o} de ouro de ${t.name}!`);pop(t,`+${o} ouro`,'#ffd45a')}return ok()}
case'execucao':{if(!dentro||!inimigoDe(a,t))return false;setF(a,x,y);sfx('crit');
if(t.hp<=t.mhp*.25){if(t.lider){msg(`${a.name} executa um golpe mortal!`);hit(a,t,a.atk*3)}else{msg(`${a.name} executa ${t.name}!`);hit(a,t,t.hp+999,false,true)}}else hit(a,t,a.atk);return ok()}
case'purifica':{if(!dentro)return false;setF(a,x,y);sfx('heal');msg(`${a.name} lança ${h.n}.`);for(const o of area(x,y,h.raio).filter(o=>o.team==a.team)){o.st={};const v=Math.min(h.cura+(a.mag||0),o.mhp-o.hp);o.hp+=v;pop(o,v?'+'+v:'✔','#4cd37e')}return ok()}
case'reviver':{const c=caidoEm(a,x,y);if(!dentro||!c||at(x,y))return false;c.hp=Math.max(1,Math.round(c.mhp*.3));c.st={};c.ct=0;sfx('heal');pop(c,'+'+c.hp,'#4cd37e');msg(`${a.name} revive ${c.name}!`);return ok()}
case'protecao':if(!dentro||!aliado)return false;t.imune=a;sfx('heal');pop(t,'✨','#ffe27a');msg(`${t.name} está sob Proteção Divina.`);return ok();
case'milagre':{for(const o of U.filter(o=>o.team==a.team)){if(o.hp>0){const v=Math.min(Math.round(o.mhp/2),o.mhp-o.hp);o.hp+=v;o.st={};if(v)pop(o,'+'+v,'#4cd37e')}
else if(!o.caiuDeVez&&!at(o.x,o.y)){o.hp=Math.round(o.mhp/2);o.st={};o.ct=0;pop(o,'+'+o.hp,'#4cd37e')}}sfx('heal');msg(`${a.name} realiza um Milagre!`);return ok()}
case'furia':{const qs=U.filter(o=>inimigoDe(a,o)&&dist(o.x,o.y,a.x,a.y)<=h.raio);sfx('crit');msg(`${a.name} libera a Fúria do Dragão!`);qs.forEach(o=>hit(a,o,a.atk*.9));return ok()}
case'investida':{const p=investidaAte(a,x,y);if(!p)return false;const[px,py,n]=p,par=new Map();let k0=key(a.x,a.y);const dx=Math.sign(x-a.x),dy=Math.sign(y-a.y);
for(let i=1;i<=n;i++){const k=key(a.x+dx*i,a.y+dy*i);par.set(k,k0);k0=k}paga(a,id);ph='busy';msg(`${a.name} avança numa Investida!`);
walk(a,px,py,par,()=>{setF(a,x,y);sfx('sword');hit(a,t,a.atk+3*n);fim()});return true}
case'salto':{if(!dentro)return false;const p=pousoDe(a,t);if(!p)return false;paga(a,id);a.x=p[0];a.y=p[1];setF(a,t.x,t.y);sfx('crit');msg(`${a.name} salta do alto sobre ${t.name}!`);
hit(a,t,a.atk*1.2);U.filter(o=>o!==t&&inimigoDe(a,o)&&dist(o.x,o.y,a.x,a.y)<=1).forEach(o=>hit(a,o,a.atk*.5));fim();return true}}
return false}

function previaHab(a,h,x,y){if(!faixa(a,h).includes(key(x,y)))return'';const t=at(x,y);
if(h.tipo=='fogo'){const ar=area(x,y,h.raio||1);return ar.length?h.n+' atinge: '+ar.map(o=>`${o.team==a.team?'⚠ ':''}${o.name} <b>−${calc(a,o,danoSk(a,h)).d}</b>`).join(', '):h.n+' não atinge ninguém aqui.'}
if(h.tipo=='bencao'){const ar=area(x,y,h.raio).filter(o=>o.team==a.team&&o.hp<o.mhp);return ar.length?h.n+' cura: '+ar.map(o=>`${o.name} <b>+${Math.min(h.cura+(a.mag||0),o.mhp-o.hp)}</b>`).join(', '):'Ninguém ferido nesta área.'}
if(h.tipo=='cura'&&t&&t.team==a.team)return t.hp<t.mhp?`Cura prevista: <b>+${cura(t,a,h)}</b>`:`${t.name} já está com a vida cheia.`;
if(h.tipo=='alvo'&&inimigoDe(a,t))return`${h.n}: ${h.mult?`dano <b>${calc(a,t,a.atk*h.mult).d}</b>`:h.dano?`dano <b>${calc(a,t,danoSk(a,h)).d}</b>`:''}${h.st?` · deixa ${ST_NOME[h.st]}`:''}`;
if(h.tipo=='linha'){const ns=linhaTiles(a,x,y,h.alc).map(([tx,ty])=>at(tx,ty)).filter(o=>inimigoDe(a,o));return ns.length?`${h.n} atinge: ${(h.max?ns.slice(0,h.max):ns).map(o=>o.name).join(', ')}`:`${h.n}: nenhum inimigo nesta linha.`}
if(h.tipo=='execucao'&&inimigoDe(a,t))return t.hp<=t.mhp*.25?(t.lider?'Golpe mortal: dano triplo!':`Execução: derrota ${t.name}!`):`${t.name} ainda está forte demais: ataque normal.`;
if(h.tipo=='investida'){const p=investidaAte(a,x,y);return p?`Investida: dano <b>${calc({...a,x:p[0],y:p[1]},t,a.atk+3*p[2]).d}</b>`:''}
if(h.tipo=='reviver'){const c=caidoEm(a,x,y);return c?`Reviver ${c.name}`:'Escolha um aliado caído.'}
return h.txt}

// Começo do turno de uma unidade: acaba o que ela lançou, conta recargas e aplica os estados.
// Devolve false quando a unidade perde o turno (atordoada ou derrotada pelo veneno).
function inicioTurno(b){for(const o of U){if(o.escudo===b)o.escudo=null;if(o.imune===b)o.imune=null;if(o.provocado===b)o.provocado=null}
if(typeof correnteza=='function'&&!correnteza(b))return false;
b.defesa=false;b.manto=false;if(b.rec)for(const k in b.rec)if(b.rec[k]>0)b.rec[k]--;
const st=b.st||{};b.presoAgora=st.preso>0;if(st.preso>0)st.preso--;b.lentoAgora=st.lento>0;if(st.lento>0)st.lento--;
if(st.veneno>0){st.veneno--;const d=Math.max(3,Math.round(b.mhp*.08));b.hp-=d;pop(b,'-'+d,'#7ad06a');msg(`${b.name} sofre ${d} de veneno${b.hp<=0?' — derrotado':''}.`);
if(b.hp<=0){if(b.team&&!b.caiu){b.caiu=true;if(typeof soltaBau=='function')soltaBau(b)}return false}}
if(st.atordoado>0){st.atordoado--;pop(b,'💫','#d8c8ff');msg(`${b.name} está atordoado e perde o turno.`);return false}return true}

function escolheHab(id){if(!mine()||acted||!podeHab(cur,id))return;const h=HAB[id];
if(SEM_ALVO.includes(h.tipo)){usaHab(cur,id,cur.x,cur.y,()=>{acted=true;after()});return}
if(ph=='skill'&&cur.sk==id)ph='idle';else{cur.sk=id;ph='skill'}ui()}
function cliqueHab(x,y){const id=cur.sk;if(!id||!HAB[id])return;const tipo=HAB[id].tipo;
usaHab(cur,id,x,y,()=>{acted=true;if(tipo=='investida'||tipo=='salto')moved=true;after()})}
function botoesHab(en){const b=$('hbs');if(!b||!b.querySelectorAll)return;const ids=cur&&!cur.team?ativas(cur):[];
b.innerHTML=ids.map(id=>`<button data-hab="${id}" class="${ph=='skill'&&cur.sk==id?'on':''}"${en||acted||!podeHab(cur,id)?' disabled':''} title="${HAB[id].txt}">${rotuloHab(cur,id)}</button>`).join('');
b.querySelectorAll('[data-hab]').forEach(x=>x.onclick=()=>escolheHab(x.dataset.hab))}
// Botão escondido "bs": escolhe a primeira habilidade com alvo (usado também pelo simulador de batalhas).
$('bs').onclick=()=>{if(!mine()||acted)return;const tipo=SK[cur.k]&&SK[cur.k].tipo,ids=ativas(cur).filter(i=>!SEM_ALVO.includes(HAB[i].tipo)&&podeHab(cur,i)),id=ids.filter(i=>HAB[i].tipo==tipo).pop()||ids[0];if(id){cur.sk=id;ph='skill';ui()}};
