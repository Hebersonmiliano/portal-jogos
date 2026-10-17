const TO=new Set(),st=setTimeout;window.setTimeout=(f,t)=>{const i=st(()=>{TO.delete(i);f()},t);TO.add(i);return i};
const parar=()=>{TO.forEach(clearTimeout);TO.clear()};
// Fator da velocidade da batalha (tela de Opções); 1 = normal.
const vel=()=>typeof VELOC!='undefined'&&typeof VELOCIDADES!='undefined'?VELOCIDADES[VELOC].f:1;
const cv=document.getElementById('c'),g=cv.getContext('2d'),$=i=>document.getElementById(i);
// Área do mapa em coordenadas do jogo; o canvas se ajusta ao tamanho da tela e mantém essa área inteira visível.
const VB={x:80,y:-70,w:560,h:420};let K=1,TX=0,TY=0,DPR=1;
function fit(){const r=cv.getBoundingClientRect();if(!r.width||!r.height)return;DPR=window.devicePixelRatio||1;cv.width=Math.round(r.width*DPR);cv.height=Math.round(r.height*DPR);
K=Math.min(r.width/VB.w,r.height/VB.h);TX=(r.width-VB.w*K)/2-VB.x*K;TY=(r.height-VB.h*K)/2-VB.y*K}

// ===================== TERRENOS =====================
// c: cor do topo da casa por altura (0, 1, 2, 3). bloq: ninguém pode pisar. dano: queima quem termina o turno ali. custo: movimento gasto para entrar (padrão 1).
const TER={
g:{n:'Grama',c:['#5f8f52','#78a35f','#93b36a','#a8c27a']},
t:{n:'Trilha',c:['#9a7b52','#a8885c','#b59566','#c2a270']},
p:{n:'Ponte',c:['#8a6038','#94683e','#9e7044'],flutua:true},
v:{n:'Vau raso',c:['#6aa6cf']},
a:{n:'Água funda',c:['#2f6fa8','#3474ae','#3979b4','#3e7eba'],bloq:true,agua:true},
r:{n:'Rocha',c:['#7d8494','#8a91a0','#979eac','#a4abb8'],bloq:true},
e:{n:'Lajes de pedra',c:['#a29c8c','#aea898','#bab4a4','#c6c0b0']},
c:{n:'Cinzas',c:['#6e6a66','#7a7672','#86827e','#928e8a']},
b:{n:'Brasas',c:['#7a3a24','#843f26','#8e4428'],dano:6},
u:{n:'Tapete real',c:['#8a1f2a','#962530','#a02a36','#aa303c','#b4363e']},
k:{n:'Piso da cripta',c:['#5a5664','#646070','#6e6a7a','#78748a']},
w:{n:'Água rasa',c:['#5a9ac0','#6aa6cf','#78b0d6'],custo:2,agua:true},
s:{n:'Areia',c:['#d8c28a','#e0cc96','#e8d6a2']},
m:{n:'Pedra da serra',c:['#8e8676','#9a9282','#a69e8e','#b2aa9a','#beb6a6','#cac2b2']},
// Gelheim (Ato III). gelo: um herói que termina o movimento no gelo desliza uma casa a mais na mesma direção.
n:{n:'Neve',c:['#dfe7ef','#e6edf3','#edf2f7','#f3f7fa','#f8fafc']},
i:{n:'Gelo',c:['#9fd0ea','#a9d6ee','#b3dcf2','#bde2f5','#c7e8f8'],gelo:true},
// Areth (Ato III). afunda: quem termina o turno na areia movediça fica imobilizado no próximo turno.
y:{n:'Arenito',c:['#c8a466','#d0ad70','#d8b67a','#dfbf84','#e6c88e','#edd198','#f3daa2']},
q:{n:'Areia movediça',c:['#b8925a','#c09a62','#c8a26a'],custo:2,afunda:true},
// Maré-Alta (Ato III). flutua: navios e pontes não são cobertos pela maré.
d:{n:'Convés',c:['#7a5232','#845a38','#8e623e','#986a44'],flutua:true},
// Ato IV. vazio: não existe chão (a casa nem é desenhada). racha: desaba quando a fase manda (desaba).
z:{n:'Vazio',c:['#0a0614'],bloq:true,vazio:true},
h:{n:'Obsidiana',c:['#3a2a4a','#44325a','#4e3a66','#584272','#624a7e','#6c528a']},
j:{n:'Ponte de correntes',c:['#6a6a7a','#74748a','#7e7e96','#8888a2'],flutua:true},
f:{n:'Pedra rachada',c:['#5a3a4a','#644254','#6e4a5e','#78526a'],racha:true},
l:{n:'Piso espelhado',c:['#9a9ab8','#a4a4c4','#aeaed0','#b8b8dc','#c2c2e8']}};

// As fases ficam em fases/ato1.js (e nos próximos atos), carregadas antes deste arquivo.
const CL={K:{n:'Cavaleiro',e:'⚔️',hp:42,mp:0,mov:4,jmp:1,rng:1,min:1,atk:13,spd:8,c:'#aab4c4'},
A:{n:'Arqueiro',e:'🏹',hp:28,mp:0,mov:3,jmp:2,rng:4,min:2,atk:11,spd:10,c:'#5fb36a'},
M:{n:'Mago',e:'🔮',hp:22,mp:15,mov:3,jmp:1,rng:1,min:1,atk:6,spd:7,c:'#9a6ad6'},
L:{n:'Ladino',e:'🗡️',hp:26,mp:0,mov:5,jmp:2,rng:1,min:1,atk:10,spd:12,c:'#4a4a5a',costas:2},
C:{n:'Clérigo',e:'✨',hp:24,mp:12,mov:3,jmp:1,rng:1,min:1,atk:5,spd:8,c:'#f0ece0'},
// Classes avançadas: liberadas no nível 5 (ver telas.js). base = classe de origem.
P:{n:'Paladino',base:'K',hp:50,mp:10,mov:4,jmp:1,rng:1,min:1,atk:14,spd:8},
T:{n:'Atirador',base:'A',hp:32,mp:0,mov:3,jmp:2,rng:5,min:2,atk:13,spd:11},
X:{n:'Arquimago',base:'M',hp:26,mp:24,mov:3,jmp:1,rng:1,min:1,atk:7,spd:8},
S:{n:'Assassino',base:'L',hp:30,mp:0,mov:5,jmp:3,rng:1,min:1,atk:13,spd:13,costas:2.2},
Z:{n:'Sacerdote',base:'C',hp:30,mp:20,mov:3,jmp:1,rng:1,min:1,atk:6,spd:9},
// Terceira evolução: liberada no nível 12 (Ato III). duplo: ataca duas vezes (o 2º golpe com 60%).
E:{n:'Templário',base:'K',hp:60,mp:16,mov:4,jmp:2,rng:1,min:1,atk:17,spd:9},
V:{n:'Caçador de Tempestade',base:'A',hp:38,mp:12,mov:4,jmp:3,rng:6,min:2,atk:16,spd:12},
F:{n:'Feiticeiro Estelar',base:'M',hp:32,mp:34,mov:3,jmp:1,rng:1,min:1,atk:8,spd:9},
B:{n:'Lâmina Sombria',base:'L',hp:36,mp:0,mov:6,jmp:3,rng:1,min:1,atk:15,spd:15,costas:2.2,duplo:true},
O:{n:'Oráculo',base:'C',hp:36,mp:30,mov:3,jmp:1,rng:1,min:1,atk:7,spd:10},
J:{n:'Cavaleiro Dragão',base:'R',hp:56,mp:0,mov:6,jmp:1,rng:2,min:1,atk:18,spd:12,voa:true},
// Criaturas (só inimigos)
W:{n:'Lobo',hp:24,mp:0,mov:5,jmp:2,rng:1,min:1,atk:9,spd:13},
// voa: passa por cima de obstáculos e ignora diferenças de altura (mas não pousa em casas bloqueadas)
H:{n:'Harpia',hp:30,mp:0,mov:5,jmp:9,rng:1,min:1,atk:11,spd:12,voa:true},
G:{n:'Afogado',hp:34,mp:0,mov:3,jmp:2,rng:1,min:1,atk:12,spd:9,nada:true},
// reergue: ao cair vira ossos e se ergue de novo uma vez (só o Fogo destrói de vez)
Q:{n:'Esqueleto',hp:32,mp:0,mov:4,jmp:2,rng:1,min:1,atk:13,spd:10,reergue:true},
R:{n:'Lanceiro Montado',hp:44,mp:0,mov:6,jmp:1,rng:2,min:1,atk:14,spd:11},
D:{n:'Rei Demoníaco',hp:150,mp:40,mov:4,jmp:3,rng:1,min:1,atk:22,spd:11,grande:true},
// Inimigos de Gelheim (base: forma do desenho)
U:{n:'Lobo do Gelo',base:'W',hp:46,mp:0,mov:5,jmp:2,rng:1,min:1,atk:18,spd:14},
I:{n:'Guerreiro de Gelheim',base:'K',hp:72,mp:0,mov:4,jmp:2,rng:1,min:1,atk:21,spd:9},
Y:{n:'Xamã do Gelo',base:'M',hp:48,mp:30,mov:3,jmp:1,rng:1,min:1,atk:10,spd:9},
// Inimigos de Areth. Cs: o Colosso do Sol Negro (forma gigante do chefe da Pirâmide).
Ch:{n:'Chacal do Deserto',base:'W',hp:60,mp:0,mov:5,jmp:2,rng:1,min:1,atk:22,spd:15},
Gs:{n:'Guerreiro de Areth',base:'K',hp:88,mp:0,mov:4,jmp:2,rng:1,min:1,atk:25,spd:10},
As:{n:'Arqueiro do Sol',base:'A',hp:62,mp:0,mov:4,jmp:3,rng:5,min:2,atk:23,spd:12},
Ms:{n:'Mago das Areias',base:'M',hp:58,mp:36,mov:3,jmp:1,rng:1,min:1,atk:12,spd:10},
Ls:{n:'Lâmina do Deserto',base:'L',hp:70,mp:0,mov:5,jmp:3,rng:1,min:1,atk:26,spd:15,costas:2},
// Inimigos de Maré-Alta. nada: atravessa a água. TT: tentáculo (não anda). KR: Kraken Abissal (protecao: recebe metade do dano enquanto houver tentáculos vivos).
// Ato IV. Oz1/Oz2/Oz3: as três formas de Ozrath (transforma dentro de transforma). OE: Olho do Vazio.
Ce:{n:'Cavaleiro do Eclipse',base:'K',hp:130,mp:0,mov:4,jmp:2,rng:1,min:1,atk:33,spd:12},
Av:{n:'Atirador do Vazio',base:'A',hp:96,mp:0,mov:4,jmp:3,rng:5,min:2,atk:31,spd:13},
Fe:{n:'Feiticeiro do Eclipse',base:'M',hp:96,mp:50,mov:3,jmp:1,rng:1,min:1,atk:16,spd:11},
Bv:{n:'Besta do Vazio',base:'W',hp:100,mp:0,mov:5,jmp:9,rng:1,min:1,atk:31,spd:15,voa:true},
OE:{n:'Olho do Vazio',base:'OE',hp:100,mp:0,mov:2,jmp:9,rng:3,min:1,atk:28,spd:12,voa:true},
Oz1:{n:'Ozrath',base:'M',hp:240,mp:80,mov:3,jmp:2,rng:1,min:1,atk:20,spd:13},
Oz2:{n:'Ozrath, o Arauto Supremo',base:'D',hp:320,mp:60,mov:4,jmp:4,rng:1,min:1,atk:38,spd:13,grande:true,escala:1.7},
Oz3:{n:'O Eclipse Vivo',base:'EV',hp:380,mp:80,mov:0,jmp:0,rng:4,min:1,atk:34,spd:12,grande:true,escala:2.5,voa:true,protecao:'OE'},
Pf:{n:'Pirata Fantasma',base:'K',hp:100,mp:0,mov:4,jmp:2,rng:1,min:1,atk:27,spd:11},
Ar:{n:'Arpoador',base:'A',hp:70,mp:0,mov:4,jmp:2,rng:4,min:2,atk:25,spd:12},
Bm:{n:'Bruxa do Mar',base:'M',hp:70,mp:40,mov:3,jmp:1,rng:1,min:1,atk:13,spd:10},
Ma:{n:'Marujo Afogado',base:'G',hp:80,mp:0,mov:4,jmp:2,rng:1,min:1,atk:24,spd:12,nada:true},
TT:{n:'Tentáculo',base:'TT',hp:80,mp:0,mov:0,jmp:0,rng:2,min:1,atk:24,spd:10,nada:true},
KR:{n:'Kraken Abissal',base:'KR',hp:260,mp:40,mov:0,jmp:0,rng:3,min:1,atk:32,spd:11,nada:true,grande:true,escala:2.1,protecao:'TT'},
Cs:{n:'Colosso do Sol Negro',base:'D',hp:220,mp:30,mov:3,jmp:5,rng:1,min:1,atk:30,spd:11,grande:true,escala:1.9}};
// Habilidades por classe. tipo 'fogo': dano em área (dano, alcance; raio da área, padrão 1); 'cura': recupera HP (cura, alcance).
// fis: dano físico (soma metade do Ataque em vez da Magia, não acende braseiros). 'bencao': cura em área. 'escudo': protege quem usa e os aliados ao lado.
const SK={M:{n:'Fogo',mp:5,tipo:'fogo',dano:16,alc:3},X:{n:'Inferno',mp:6,tipo:'fogo',dano:22,alc:4},
C:{n:'Cura',mp:4,tipo:'cura',cura:14,alc:3},Z:{n:'Cura Maior',mp:5,tipo:'cura',cura:24,alc:4},P:{n:'Cura',mp:4,tipo:'cura',cura:12,alc:1},D:{n:'Chama Infernal',mp:8,tipo:'fogo',dano:24,alc:3},
E:{n:'Escudo de Luz',mp:6,tipo:'escudo'},V:{n:'Chuva de Flechas',mp:6,tipo:'fogo',dano:10,alc:5,fis:true,verbo:'dispara'},
F:{n:'Meteoro',mp:9,tipo:'fogo',dano:28,alc:5,raio:2},Y:{n:'Nevasca',mp:6,tipo:'fogo',dano:18,alc:4},Ms:{n:'Redemoinho de Areia',mp:7,tipo:'fogo',dano:24,alc:4},Bm:{n:'Onda Negra',mp:7,tipo:'fogo',dano:26,alc:4},Fe:{n:'Raio do Vazio',mp:8,tipo:'fogo',dano:32,alc:4},Oz1:{n:'Chama Negra',mp:8,tipo:'fogo',dano:34,alc:4},
Oz2:{n:'Inferno do Eclipse',mp:10,tipo:'fogo',dano:38,alc:3},Oz3:{n:'Eclipse Total',mp:12,tipo:'fogo',dano:36,alc:5,raio:2},KR:{n:'Maremoto',mp:10,tipo:'fogo',dano:30,alc:4},Cs:{n:'Chama Solar',mp:10,tipo:'fogo',dano:30,alc:3},O:{n:'Bênção',mp:8,tipo:'bencao',cura:22,alc:4,raio:1}};
const OX=360,OY=84,S=14,key=(x,y)=>x+','+y,DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
let LIVRE=false,BAUS=[],COLETADOS=[];
let F,N,FI=0,U=[],cur=null,ph,moved,acted,orig,log=[],fl=[],hov=null,over=false,tg=0,tk=0;
// MARE: nível da maré (fase com mare). Casas mais baixas que o nível viram água rasa; duas abaixo, água funda.
let MARE=0,QUEDA=false,AVISO_QUEDA=false;const terId=(x,y)=>{const id=F.mapa.ter[y][x],T=TER[id],h=+F.mapa.alt[y][x];if(T.racha&&QUEDA)return'z';if(MARE&&h<MARE&&!T.bloq&&!T.flutua)return h<MARE-1?'a':'w';return id};
const alt=(x,y)=>+F.mapa.alt[y][x],tr=(x,y)=>TER[terId(x,y)],inb=(x,y)=>x>=0&&y>=0&&x<N&&y<N;
const ob=(x,y)=>F.mapa.obj?OBJ[F.mapa.obj[y][x]]:null,livre=(x,y)=>!tr(x,y).bloq&&!(ob(x,y)||{}).bloq;
function fase(i){FI=i;F=FASES[i];N=F.mapa.alt.length;VB.x=OX-32*N-16;VB.w=64*N+32;VB.h=OY+(2*N-2)*16+126;fit()}
const mk=(k,team,x,y,name,o={})=>{const u={k,team,x,y,name,...CL[k],f:team?[0,1]:[0,-1],ct:0,...o};u.mhp=u.hp;u.mmp=u.mp;if(!team&&typeof prepHab=='function')prepHab(u);return u};
// Batalha livre: depois de vencer a história da fase, os inimigos são sorteados de F.aleatorios
// nas mesmas posições, com força de acordo com o nível médio do grupo.
function sorteiaInimigos(hs){const nv=hs?hs.reduce((s,h)=>s+h.nv,0)/hs.length:1,cont={};
return F.inimigos.map(({x,y})=>{const t=F.aleatorios[Math.floor(Math.random()*F.aleatorios.length)],c=CL[t.k];cont[t.nome]=(cont[t.nome]||0)+1;
return{k:t.k,x,y,nome:t.nome+(cont[t.nome]>1?' '+cont[t.nome]:''),hp:Math.round(c.hp*(1+.08*(nv-1))),atk:c.atk+Math.floor((nv-1)/2),alerta:Math.random()<.5?3:0}})}
function start(){parar();fase(FI);const cn={};
const hs=heroisAtuais(),cp=typeof camp=='function'&&camp();FORM=null;
ACESAS=new Set();if(F.mapa.obj)F.mapa.obj.forEach((l,j)=>[...l].forEach((ch,i)=>{if(ch=='Y')ACESAS.add(key(i,j))}));LIVRE=!!(F.aleatorios&&cp&&cp.venceu&&cp.venceu.includes(F.id));BAUS=[];COLETADOS=[];
const inimigos=LIVRE?sorteiaInimigos(hs):F.inimigos,objetivo=LIVRE?'Batalha livre: derrote todos os inimigos.':F.objetivo;
U=[...(hs?hs.map((h,i)=>[h,i]).filter(([h])=>!h.tarefa).slice(0,F.grupo.length).map(([h,i],j)=>heroiU(h,i,F.grupo[j])):PARTY.map((k,i)=>{cn[k]=(cn[k]||0)+1;return mk(k,0,F.grupo[i][0],F.grupo[i][1],NM[k][cn[k]-1])})),...inimigos.map(({k,x,y,nome,...o})=>{const u=mk(k,1,x,y,nome,o),D=DIF[dif()];u.hp=u.mhp=Math.round(u.hp*D.hp);u.atk=Math.max(1,Math.round(u.atk*D.atk));return u})];
log=[];fl=[];over=false;hov=null;tg=0;cur=null;SEM_VER=0;FEIXE=null;TEMP_ANT=false;MARE=0;QUEDA=false;AVISO_QUEDA=false;ovl.hidden=true;
$('sub').textContent=F.nome+' — '+objetivo;msg('Objetivo: '+objetivo);FILA=[];DLG=null;$('dlg').hidden=true;if(typeof mostraEspada=='function'){CARGA=0;INVOCADA=false;INVOC=null;mostraEspada()}
if(typeof tocar=='function')tocar(F.musica||'vau');
let fs=falasDe('inicio');if(F.tutorial&&!LIVRE&&!melhor('tut.'+F.id)){fs=[...fs,...F.tutorial];grava('tut.'+F.id,1)}dialogo(fs,hs?formacao:comeca)}
const heroiU=(h,i,[x,y])=>mk(h.k,0,x,y,h.nome,{...stats(h),hi:i});
function comeca(){FORM=null;if(F.espelho&&typeof criaSombras=='function')criaSombras();U.forEach((u,i)=>u.ct=(u.team?0:40)+i*4);next()}
// ---------- Formação (antes da batalha) ----------
// O jogador escolhe quem luta (até o número de casas em F.grupo) e em que casa da zona azul cada herói começa.
let FORM=null;
function zona(){const z=new Map(),inim=new Set(F.inimigos.map(e=>key(e.x,e.y)));
const pode=(x,y)=>inb(x,y)&&livre(x,y)&&!inim.has(key(x,y));
for(const[x,y]of F.grupo){if(pode(x,y))z.set(key(x,y),[x,y]);for(const[a,b]of DIRS)if(pode(x+a,y+b))z.set(key(x+a,y+b),[x+a,y+b])}return z}
function formacao(){FORM={sel:null,z:zona()};ph='form';cur=null;sfx('pas');rForm()}
const emCampo=i=>U.find(u=>!u.team&&u.hi===i);
function rForm(){if(!FORM)return;const hs=heroisAtuais(),max=F.grupo.length,n=U.filter(u=>!u.team).length;
for(const b of['bm','ba','bs','bp','bu','bw'])$(b).disabled=true;
$('ord').innerHTML=`<span class="ol">Formação · ${n}/${max} heróis em campo</span>`;
$('inf').innerHTML=`<b>Formação</b> · escolha até ${max} heróis<br><small class="mu">Clique num herói da lista e depois numa casa azul. Clique em outro herói no mapa para trocar de lugar.</small>
<div class="elenco">${hs.map((h,i)=>h.tarefa?`<button disabled title="${descreveTarefa(h)}">${h.nome} · ${h.tarefa.tipo=='mina'?'na mina':'em missão'}</button>`:`<button data-fh="${i}" class="${FORM.sel===i?'on ':''}${emCampo(i)?'campo':''}">${h.nome} · ${CL[h.k].n} Nv ${h.nv}${emCampo(i)?' ✔':''}</button>`).join('')}</div>
<div class="acts-form"><button id="fx"${FORM.sel!=null&&emCampo(FORM.sel)?'':' disabled'}>Tirar da luta</button><button id="fc" class="on"${n?'':' disabled'}>Começar batalha! (Enter)</button></div>`;
$('lg').innerHTML='Monte a formação: quem fica na frente recebe os primeiros golpes. Arqueiros e magos rendem mais atrás e no alto.';
$('inf').querySelectorAll('[data-fh]').forEach(b=>b.onclick=()=>{FORM.sel=+b.dataset.fh;rForm()});
$('fx').onclick=()=>{const u=emCampo(FORM.sel);if(u){U.splice(U.indexOf(u),1);rForm()}};$('fc').onclick=fimForm}
function fimForm(){if(!FORM||!U.some(u=>!u.team))return;FORM=null;ph='idle';sfx('heal');comeca()}
function cliqueForm(t){if(!t)return;const k=key(t[0],t[1]),u=at(t[0],t[1]),hs=heroisAtuais();
if(!FORM.z.has(k)){if(u&&!u.team){FORM.sel=u.hi;rForm()}return}
if(FORM.sel==null){if(u&&!u.team)FORM.sel=u.hi;rForm();return}
const s=emCampo(FORM.sel);
if(s){if(u&&u!==s&&!u.team){[u.x,u.y,s.x,s.y]=[s.x,s.y,u.x,u.y]}else if(!u){s.x=t[0];s.y=t[1]}}
else{if(u&&!u.team){U.splice(U.indexOf(u),1)}else if(U.filter(x=>!x.team).length>=F.grupo.length){msg('A formação já está cheia: tire alguém da luta primeiro.');rForm();return}
U.push(heroiU(hs[FORM.sel],FORM.sel,t))}
sfx('pas');rForm()}
const at=(x,y)=>U.find(u=>u.hp>0&&u.x===x&&u.y===y);
// Câmera giratória: ROT vai de 0 a 3 (quartos de volta). O mapa não muda; só a posição de cada casa na tela.
let ROT=0,GIRO=null;
const rot=(x,y)=>ROT==0?[x,y]:ROT==1?[N-1-y,x]:ROT==2?[N-1-x,N-1-y]:[y,N-1-x];
const desrot=(a,b)=>ROT==0?[a,b]:ROT==1?[b,N-1-a]:ROT==2?[N-1-a,N-1-b]:[N-1-b,a];
const rotDir=([dx,dy])=>ROT==0?[dx,dy]:ROT==1?[-dy,dx]:ROT==2?[-dx,-dy]:[dy,-dx];
const prof=(x,y)=>{const[a,b]=rot(x,y);return a+b};
const P=(x,y)=>{const[a,b]=rot(x,y);return[OX+(a-b)*32,OY+(a+b)*16-alt(x,y)*S]};
function girar(d){if(GIRO)return;GIRO={d,t:0,feito:false};sfx('pas')}
// Objetos altos ficam transparentes quando escondem um personagem ou a casa sob o mouse.
const ALTURA_OBJ={T:[30,80],M:[25,78],P:[12,55],E:[16,42],N:[25,82],L:[30,80],O:[12,92],S:[64,136,4],V:[30,148,3],H:[60,196,4],C:[16,28],Q:[12,216,3],W:[60,166,4]};
// Terceiro valor (estruturas gigantes): só fica transparente por quem está até essa profundidade atrás dela.
function tapa(oc,x,y,cx,cy){const m=ALTURA_OBJ[oc];if(!m)return false;const[w,h,pz]=m,z=prof(x,y),cobre=(px,py,pw,ph)=>px+pw>cx-w&&px-pw<cx+w&&py>cy+2-h&&py-ph<cy+2;
for(const u of U)if(u.hp>0&&prof(u.x,u.y)<z&&(!pz||z-prof(u.x,u.y)<=pz)){const[ux,uy]=P(u.x,u.y);if(cobre(ux,uy,20,60))return true}
if(hov&&prof(hov[0],hov[1])<z){const[hx,hy]=P(hov[0],hov[1]);if(cobre(hx,hy,24,10))return true}return false}
const dist=(a,b,c,d)=>Math.abs(a-c)+Math.abs(b-d);
function setF(u,tx,ty){const dx=tx-u.x,dy=ty-u.y;if(!dx&&!dy)return;u.f=Math.abs(dx)>=Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)]}
// Alcance de movimento. Cada casa custa 1 (ou o custo do terreno, como água rasa = 2); quem voa paga sempre 1.
function reach(u){const d=new Map([[key(u.x,u.y),0]]),par=new Map(),q=[[u.x,u.y,0]];
while(q.length){q.sort((a,b)=>a[2]-b[2]);const[x,y,dd]=q.shift();if(dd>d.get(key(x,y)))continue;
for(const[a,b]of DIRS){const nx=x+a,ny=y+b,k=key(nx,ny);
if(!inb(nx,ny)||(!u.voa&&(!pisavel(u,nx,ny)||Math.abs(alt(nx,ny)-alt(x,y))>u.jmp)))continue;
const o=at(nx,ny);if(o&&o.team!==u.team&&!u.voa)continue;
const nd=dd+(u.voa?1:(tr(nx,ny).custo||1));if(nd>u.mov-(u.lentoAgora?2:0)||(d.has(k)&&d.get(k)<=nd))continue;d.set(k,nd);par.set(k,key(x,y));q.push([nx,ny,nd])}}
const r=new Map([...d].filter(([k])=>{const[x,y]=k.split(',').map(Number),o=at(x,y);return(!o||o===u)&&(pisavel(u,x,y)||o===u)}));r.par=par;return r}
const pisavel=(u,x,y)=>livre(x,y)||(!!u.nada&&!!tr(x,y).agua&&!(ob(x,y)||{}).bloq);
// Neblina e submersos: inimigos escondidos não aparecem, não entram na ordem de turnos e não podem ser alvo.
let ACESAS=new Set();
const iluminado=(x,y)=>{if(!F.escuridao)return true;if(U.some(h=>!h.team&&h.hp>0&&dist(h.x,h.y,x,y)<=F.escuridao))return true;
for(const k of ACESAS){const[a,b]=k.split(',').map(Number);if(dist(a,b,x,y)<=2)return true}return false};
const longe=(x,y)=>(!!F.neblina&&!U.some(h=>!h.team&&h.hp>0&&dist(h.x,h.y,x,y)<=F.neblina))||!iluminado(x,y);
// Braseiros (objeto X): acendem quando um herói termina o movimento ao lado ou quando o Fogo os atinge.
function acende(x,y,r){if(!F.mapa.obj)return;for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=key(i,j);
if(F.mapa.obj[j][i]=='X'&&!ACESAS.has(k)&&dist(i,j,x,y)<=r){ACESAS.add(k);sfx('fire');msg('Um braseiro se acende e ilumina a cripta.')}}}
const visto=u=>!u.team||u.revelado||(!u.submerso&&!longe(u.x,u.y));
function flow(u,Pl){const d=new Map(),q=[];Pl.forEach(p=>{d.set(key(p.x,p.y),0);q.push([p.x,p.y])});
while(q.length){const[x,y]=q.shift(),dd=d.get(key(x,y));for(const[a,b]of DIRS){const nx=x+a,ny=y+b,k=key(nx,ny);
if(!inb(nx,ny)||d.has(k)||(!u.voa&&(!pisavel(u,nx,ny)||Math.abs(alt(nx,ny)-alt(x,y))>u.jmp)))continue;d.set(k,dd+1);q.push([nx,ny])}}return d}
function walk(u,x,y,par,cb){const p=[];for(let k=key(x,y);k!=key(u.x,u.y);k=par.get(k))p.unshift(k.split(',').map(Number));
if(p.length&&!u.team&&!u.voa&&tr(x,y).gelo){const[ax,ay]=p.length>1?p[p.length-2]:[u.x,u.y],nx=2*x-ax,ny=2*y-ay;
if(inb(nx,ny)&&livre(nx,ny)&&!at(nx,ny)&&alt(nx,ny)<=alt(x,y)){p.push([nx,ny]);p.desliza=true}}
u.andando=true;const step=i=>{if(p.desliza&&i==p.length-1){msg(`${u.name} escorrega no gelo!`);if(typeof conquista=='function')conquista('patinador')}if(i>=p.length){u.andando=false;if(!u.team){if(typeof pegaBau=='function')pegaBau(u);acende(u.x,u.y,1)}return cb()}const[nx,ny]=p[i];setF(u,nx,ny);u.x=nx;u.y=ny;sfx('pas');ui(true);setTimeout(()=>step(i+1),140*vel())};step(0)}
function msg(t){log.unshift(t);log=log.slice(0,6)}
function calc(a,t,b){let d=b+Math.max(-4,(alt(a.x,a.y)-alt(t.x,t.y))*2);const back=!t.defesa&&t.f[0]*Math.sign(a.x-t.x)+t.f[1]*Math.sign(a.y-t.y)<0;
if(back)d*=a.costas||1.5;return{d:Math.max(1,Math.round(d)),back}}
function pop(t,s,c){const[px,py]=P(t.x,t.y);fl.push({t:s,x:px,y:py-50,a:0,c})}
function hit(a,t,b,fogo,fixo){if(t.imune){t.hit=true;pop(t,'Imune','#ffe27a');msg(`${t.name} está sob Proteção Divina e não sofre dano.`);return}
let{d,back}=fixo?{d:Math.max(1,Math.round(b)),back:false}:calc(a,t,b);if(t.escudo||t.defesa)d=Math.max(1,Math.round(d/2));
if(t.escamas&&fogo)d=Math.max(1,Math.round(d*.75));if(t.protecao&&U.some(o=>o.hp>0&&o.k==t.protecao&&o.team==t.team))d=Math.max(1,Math.round(d/2));if(U.some(o=>o!==t&&o.hp>0&&o.team==t.team&&o.muralha&&dist(o.x,o.y,t.x,t.y)==1))d=Math.max(1,Math.round(d*.8));t.hp-=d;t.hit=true;
if(typeof carrega=='function'&&!fixo){if(!a.team&&t.team)carrega(d*ESPADA.dano);else if(a.team&&!t.team)carrega(d*ESPADA.sofre)}
if(t.hp<=0&&t.transforma&&!t.transformou){transforma(t,d);return}
if(t.hp<=0&&t.reergue&&!t.reergueu&&!fogo){t.reergueu=true;t.ossos=6;if(!a.team)a.kills=(a.kills||0)+1;sfx('hit');pop(t,'-'+d,'#ff5a52');msg(`${t.name} desmorona... mas os ossos ainda se mexem.`);return}
if(t.hp<=0&&t.team&&!t.caiu){t.caiu=true;if(typeof conquista=='function'&&!a.team){if(back)conquista('costas');if(t.k=='KR'&&U.filter(o=>o.k=='TT'&&o.hp>0).length>=4)conquista('kraken_bravo')}if(!a.team)a.kills=(a.kills||0)+1;if(typeof soltaBau=='function')soltaBau(t)}if(t.hp>0&&t.hp<t.mhp/2&&!t.ferido){t.ferido=true;evento('ferido:'+t.name)}sfx(back?'crit':'hit');pop(t,'-'+d,back?'#ffb02e':'#ff5a52');
msg(`${a.name} atinge ${t.name}: ${d}${back?' (costas!)':''}${t.hp<=0?' — derrotado':''}.`)}
function atk(a,x,y){const t=at(x,y);setF(a,x,y);sfx(a.rng>1?'arrow':'sword');let b=a.atk;if(a.mira){b*=1.5;a.mira=false;msg(a.name+' acerta o tiro mirado!')}hit(a,t,b);
if(a.duplo&&t.hp>0){msg(a.name+' golpeia de novo!');hit(a,t,a.atk*.6)}}
// Defender: usa a ação do turno (pode mover antes). Até o próximo turno da unidade: metade do dano,
// sem bônus de ataque pelas costas e +10% do MP máximo na hora. Não se soma ao Escudo de Luz.
function defender(u){u.defesa=true;const mp=u.mmp?Math.min(u.mmp-u.mp,Math.max(1,Math.round(u.mmp*.1))):0;u.mp+=mp;sfx('heal');pop(u,mp?'🛡 +'+mp+' MP':'🛡','#9ad0ff');msg(`${u.name} se defende${mp?` e recupera ${mp} MP`:''}.`)}
const area=(x,y,r=1)=>U.filter(u=>u.hp>0&&dist(u.x,u.y,x,y)<=r);
const danoSk=(a,sk)=>sk.dano+(sk.fis?Math.floor(a.atk/2):(a.mag||0));
function fire(a,x,y,sk=SK[a.k]){a.mp-=sk.mp||0;setF(a,x,y);sfx(sk.fis?'arrow':'fire');msg(`${a.name} ${sk.verbo||'conjura'} ${sk.n}.`);if(!sk.fis)acende(x,y,sk.raio||1);{const ar=area(x,y,sk.raio||1);if(!a.team&&typeof conquista=='function'&&ar.filter(u=>u.team).length>=4)conquista('combo');ar.forEach(u=>hit(a,u,danoSk(a,sk),!sk.fis))}}
// Bênção: cura todos os aliados na área. Escudo de Luz: dano recebido pela metade até o próximo turno de quem usou.
function bencao(a,x,y,sk=SK[a.k]){a.mp-=sk.mp||0;setF(a,x,y);sfx('heal');msg(`${a.name} lança a ${sk.n}.`);
for(const t of area(x,y,sk.raio).filter(o=>o.team==a.team)){const v=Math.min(sk.cura+(a.mag||0),t.mhp-t.hp);if(v<=0)continue;t.hp+=v;if(typeof carrega=='function'&&!a.team)carrega(v*ESPADA.cura);pop(t,'+'+v,'#4cd37e')}}
function escudo(a,sk=SK[a.k]){a.mp-=sk.mp||0;sfx('heal');const qs=area(a.x,a.y,1).filter(o=>o.team==a.team);qs.forEach(o=>o.escudo=a);
msg(`${a.name} ergue o Escudo de Luz: ${qs.length>1?qs.length+' aliados protegidos':'protegido'} até o próximo turno.`)}
const cura=(t,a,sk=SK[a.k])=>Math.min(sk.cura+(a.mag||0),t.mhp-t.hp);
function heal(a,t,sk=SK[a.k]){a.mp-=sk.mp||0;setF(a,t.x,t.y);sfx('heal');const v=cura(t,a,sk);t.hp+=v;if(typeof carrega=='function'&&!a.team)carrega(v*ESPADA.cura);pop(t,'+'+v,'#4cd37e');msg(`${a.name} cura ${t.name}: +${v}.`)}
// Chefe em duas etapas: ao cair pela primeira vez, vira a criatura de t.transforma, com vida cheia.
function transforma(t,d){const n=t.transforma,D=DIF[dif()];t.transformou=!n.transforma;pop(t,'-'+d,'#ff5a52');
Object.assign(t,CL[n.k],{k:n.k,name:n.nome,atk:Math.max(1,Math.round(n.atk*D.atk)),mp:n.mp,mov:n.mov,jmp:n.jmp,spd:n.spd});
t.hp=t.mhp=Math.round(n.hp*D.hp);t.mmp=t.mp;t.ferido=false;t.alerta=0;PISCA={t0:performance.now(),cor:'150,40,200'};sfx('crit');sfx('fire');
t.transforma=n.transforma||null;msg(`${t.name} surge das trevas!`);evento(F.falas&&F.falas['transforma:'+n.k]?'transforma:'+n.k:'transforma');if(typeof tocar=='function')tocar('chefe')}
// Efeitos de tela: PISCA (clarão rápido) e CENA (explosão final + Baú Celestial).
let PISCA=null,CENA=null;
function explosao(cb){const L=U.find(u=>u.lider),[x,y]=P(L.x,L.y);CENA={t0:performance.now(),x,y:y-30,cb};
// Garantia: termina a cena mesmo se a aba ficar em segundo plano (sem quadros de animação).
setTimeout(()=>{if(CENA&&CENA.cb===cb){CENA=null;cb()}},6600);
if(on&&AC){const q=AC.currentTime;tone(50,q,2,'sawtooth',.35);noise(q,1.6,.5,600);tone(880,q+2.2,1.2,'sine',.15);tone(1320,q+2.5,1.4,'sine',.12)}}
function chk(){if(over)return true;const p=U.some(u=>!u.team&&u.hp>0),L=U.find(u=>u.lider),e=F.vitoria=='lider'&&L?L.hp>0:U.some(u=>u.team&&u.hp>0);
if(p&&e)return false;over=true;ph='over';if(typeof tocar=='function')tocar(p?((F.final||F.escolhaFinal)&&!LIVRE?'celestial':'vitoria'):'derrota');sfx(p?'win':'lose');msg(p?'Vitória!':'Derrota...');ui();const fala=()=>dialogo(falasDe(p?'vitoria':'derrota'),()=>fim(p));setTimeout(p&&F.final&&!LIVRE?()=>explosao(fala):fala,p&&F.final&&!LIVRE?400:1600);return true}
// Inimigos escondidos (neblina, escuridão, submersos ou dormindo longe) não podem deixar a batalha sem fim:
// se nenhum inimigo vivo está à vista e já caiu pelo menos metade deles, ou se passaram 3 turnos de heróis
// sem ver nenhum, os que restam saem do esconderijo, ficam visíveis e vêm lutar.
let SEM_VER=0;
// Tempestade de areia (fase com tempestade): vem e vai a cada 6 turnos de heróis; tira 2 de alcance dos ataques à distância.
let TEMP_ANT=false;const tempestade=()=>!!(F&&F.tempestade)&&Math.floor(tg/6)%2==1;
// Raio do Sol Negro (fase com feixe): uma fileira ou coluna fica marcada em vermelho e, 6 turnos de heróis depois,
// é atingida pelo raio (o chefe não sofre dano). Depois uma nova linha é marcada, sempre onde há algum herói.
let FEIXE=null;
// Plataformas que desabam (fase com desaba): em desaba.aviso turnos de heróis as pedras rachadas piscam;
// em desaba.em elas caem no vazio. Quem estiver em cima perde 25% da vida e se agarra na borda mais próxima.
function quedaTurno(){if(!AVISO_QUEDA&&tg>=F.desaba.aviso){AVISO_QUEDA=true;sfx('crit');msg('As pedras rachadas tremem: logo vão cair no vazio! Saiam delas!')}
if(QUEDA||tg<F.desaba.em)return;QUEDA=true;PISCA={t0:performance.now(),cor:'120,40,160'};sfx('crit');msg('A plataforma desaba no vazio!');const vazio={name:'A queda',team:2};
for(const u of U.filter(u=>u.hp>0&&!u.voa&&tr(u.x,u.y).vazio)){hit(vazio,u,Math.round(u.mhp*.25),false,true);if(u.hp<=0)continue;
let m=null,md=1e9;for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(!livre(x,y)||at(x,y))continue;const d=dist(x,y,u.x,u.y);if(d<md){md=d;m=[x,y]}}if(m){u.x=m[0];u.y=m[1];msg(`${u.name} se agarra na borda!`)}}}
// Maré (fase com mare): sobe 1 nível a cada mare.cada turnos de heróis, até mare.max.
function subeMare(){const n=Math.min(F.mare.max,Math.floor(tg/F.mare.cada));if(n==MARE)return;MARE=n;sfx('heal');
msg(n==1?'A maré começa a subir: as casas mais baixas viram água rasa!':'A maré sobe mais: casas baixas viram água funda, e a correnteza arrasta quem estiver nela!')}
// Correnteza: quem começa o turno em água funda (sem nadar nem voar) perde vida. Devolve false se cair.
function correnteza(b){if(!F.mare||b.nada||b.voa||!tr(b.x,b.y).bloq)return true;const d=Math.max(4,Math.round(b.mhp*.12));b.hp-=d;pop(b,'-'+d,'#6ab0ff');
msg(`${b.name} é arrastado pela correnteza: ${d}${b.hp<=0?' — derrotado':''}.`);if(b.hp<=0){if(b.team&&!b.caiu){b.caiu=true;if(typeof soltaBau=='function')soltaBau(b)}return false}return true}
function novoFeixe(){const hs=U.filter(u=>!u.team&&u.hp>0);if(!hs.length)return;const h=hs[Math.floor(Math.random()*hs.length)],eixo=Math.random()<.5?'x':'y';
FEIXE={eixo,linha:eixo=='x'?h.x:h.y,em:tg+6};msg(`${F.feixe.nome||'O Sol Negro'} mira a ${eixo=='x'?'coluna':'fileira'} marcada em vermelho. Saiam dela!`)}
function feixeTurno(){if(over)return;if(!FEIXE)return novoFeixe();if(tg<FEIXE.em)return;const{eixo,linha}=FEIXE,sol={name:'O Raio do Sol Negro',team:2};
PISCA={t0:performance.now(),cor:'255,120,40'};sfx('crit');msg(`O raio ${F.feixe.de||'do Sol Negro'} desce sobre a linha marcada!`);
for(const u of U.filter(u=>u.hp>0&&!u.lider&&(eixo=='x'?u.x:u.y)==linha))hit(sol,u,F.feixe.dano,true,true);novoFeixe()}
function revelaUltimos(heroi){const t=U.filter(u=>u.team),r=t.filter(u=>u.hp>0);if(!r.length)return;if(r.some(visto)){SEM_VER=0;return}
if(heroi)SEM_VER++;if(r.length*2>t.length&&SEM_VER<3)return;SEM_VER=0;
r.forEach(u=>{u.revelado=true;u.alerta=0;u.submerso=false});sfx('crit');
msg(r.length>1?`Os últimos ${r.length} inimigos saem do esconderijo!`:`${r[0].name} sai do esconderijo: é o último inimigo!`)}
function next(){if(chk())return;if(FILA.length){const l=FILA.splice(0);return dialogo(l,next)}
for(const o of U)if(o.ossos>0&&--o.ossos==0){if(at(o.x,o.y))o.ossos=1;else{o.hp=Math.round(o.mhp/2);o.ct=0;sfx('crit');msg(`${o.name} se ergue de novo!`)}}let b;for(;;){b=U.filter(u=>u.hp>0&&u.ct>=100).sort((a,c)=>c.ct-a.ct)[0];if(b)break;U.forEach(u=>u.hp>0&&(u.ct+=u.spd))}
if(typeof inicioTurno=='function'&&!inicioTurno(b)){b.ct-=100;ph='busy';ui();setTimeout(next,700*vel());return}
if(!b.team)revelaUltimos(true);cur=b;moved=acted=false;if(b.presoAgora){moved=true;msg(b.name+' está imobilizado e não pode se mover.')}orig={x:b.x,y:b.y,f:b.f};ph=b.team?'enemy':'idle';if(!b.team){tg++;if(F.tempestade){const t=tempestade();if(t!==TEMP_ANT){TEMP_ANT=t;msg(t?'Uma tempestade de areia chega: ataques à distância perdem 2 de alcance!':'A tempestade de areia passa.')}}if(F.feixe)feixeTurno();if(F.mare)subeMare();if(F.desaba)quedaTurno();
// Ninguém dorme para sempre: depois de 40 turnos de heróis, os inimigos que ainda esperam acordam e vêm lutar.
if(tg==40&&U.some(u=>u.team&&u.hp>0&&u.alerta)){U.forEach(u=>{if(u.team&&u.alerta){u.alerta=0;u.submerso=false}});msg('Os inimigos perdem a paciência e avançam!')}}msg('Turno de '+b.name+'.');ui();if(b.team)setTimeout(ai,700*vel())}
function end(){const T=tr(cur.x,cur.y);if(T.dano&&cur.hp>0){cur.hp-=T.dano;pop(cur,'-'+T.dano,'#ff8a3a');sfx('fire');msg(`${cur.name} se queima nas brasas: ${T.dano}${cur.hp<=0?' — derrotado':''}.`)}
if(T.afunda&&cur.hp>0&&!cur.voa&&typeof aplicaSt=='function'){msg(`${cur.name} afunda na areia movediça!`);aplicaSt(cur,'preso',1)}
cur.ct-=100;ph='idle';next()}
function after(){if(chk())return;if(moved&&acted){ph='dir';msg('Escolha para onde '+cur.name+' vai olhar.')}else ph='idle';ui()}
function olhar(u,Pl){let m=1e9,t=null;for(const p of Pl){const d=dist(u.x,u.y,p.x,p.y);if(d<m){m=d;t=p}}if(t)setF(u,t.x,t.y)}
function ai(){const u=cur;if(acted)return end();let Pl=U.filter(p=>!p.team&&p.hp>0&&!p.manto);
if(u.provocado&&u.provocado.hp>0&&!u.provocado.manto)Pl=[u.provocado];if(!Pl.length)Pl=U.filter(p=>!p.team&&p.hp>0);
if(!u.alerta&&u.lider&&u.hp<u.mhp*.35&&Math.random()<.35){defender(u);ui();setTimeout(()=>{if(!chk())end()},700*vel());return}
if(u.alerta&&(u.hit||Pl.some(p=>dist(p.x,p.y,u.x,u.y)<=u.alerta))){u.alerta=0;if(u.submerso){u.submerso=false;sfx('heal');msg(u.name+' emerge da água!')}else msg(u.name+' entra na luta!');evento('acorda:'+u.name)}
const fixo=u.alerta||moved,r=fixo?new Map([[key(u.x,u.y),0]]):reach(u),par=r.par||new Map(),sk=SK[u.k]&&u.mp>=SK[u.k].mp?SK[u.k]:null;let best=null;
const put=(s,x,y,a,t)=>{if(!best||s>best.s)best={s,x,y,a,t}};
for(const[k,dd]of r){const[x,y]=k.split(',').map(Number),me={...u,x,y};
if(sk&&sk.tipo=='cura')for(const o of U)if(o.team&&o.hp>0&&o.hp<o.mhp*.6&&dist(x,y,o.x,o.y)<=sk.alc)put(50+o.mhp-o.hp-dd,x,y,'cura',o);
for(const p of Pl){const d=dist(x,y,p.x,p.y);
if(d>=u.min&&d<=(typeof alcance=='function'?alcance(me):u.rng)){const c=calc(me,p,u.atk);put(c.d*2+(c.d>=p.hp?40:0)+(c.back?10:0)+alt(x,y)*2-dd*.5-(tr(x,y).dano?12:0)-(tr(x,y).afunda?8:0),x,y,'atk',p)}
if(sk&&sk.tipo=='fogo'&&d>=1&&d<=sk.alc){let s=0;for(const o of U){if(o.hp<=0)continue;const ox=o===u?x:o.x,oy=o===u?y:o.y;if(dist(ox,oy,p.x,p.y)>1)continue;
if(o.team)s-=60;else{const c=calc(me,o,sk.dano);s+=c.d*2+(c.d>=o.hp?40:0)}}if(s>0)put(s+alt(x,y)*2-dd*.5,x,y,'fogo',p)}}}
const done=()=>{ui();setTimeout(()=>{if(!chk())end()},700*vel())};
if(best){walk(u,best.x,best.y,par,()=>{moved=true;ui();setTimeout(()=>{acted=true;
if(best.a=='cura')heal(u,best.t);else if(best.a=='fogo')fire(u,best.t.x,best.t.y);else atk(u,best.t.x,best.t.y);done()},400*vel())});return}
if(!fixo){const fd=flow(u,Pl),R=sk&&sk.tipo=='fogo'?sk.alc:(typeof alcance=='function'?alcance(u):u.rng),Mi=sk&&sk.tipo=='fogo'?1:u.min;let bt=[u.x,u.y],bc=1e9;
for(const[k,dd]of r){const[x,y]=k.split(',').map(Number),f=fd.get(k),c=(f==null?50+Math.min(...Pl.map(p=>dist(x,y,p.x,p.y))):f<Mi?(Mi-f)*2:Math.max(0,f-R))-alt(x,y)*.1+dd*.01+(tr(x,y).dano?3:0);if(c<bc){bc=c;bt=[x,y]}}
walk(u,bt[0],bt[1],par,()=>{moved=true;olhar(u,Pl);done()});return}
olhar(u,Pl);done()}
function pick(e){const r=cv.getBoundingClientRect(),px=(e.clientX-r.left-TX)/K,py=(e.clientY-r.top-TY)/K;
for(let s=2*N-2;s>=0;s--)for(let a=Math.min(s,N-1);a>=Math.max(0,s-N+1);a--){const[x,y]=desrot(a,s-a),[cx,cy]=P(x,y);if(Math.abs(px-cx)/32+Math.abs(py-cy)/16<=1)return[x,y]}return null}
cv.onpointermove=e=>{hov=pick(e);ui(true)};
cv.onpointerleave=()=>{hov=null;ui(true)};
// No celular não existe "passar o mouse": o primeiro toque numa casa mostra a prévia e o segundo confirma.
let TOQUE=false;cv.addEventListener('pointerdown',e=>{TOQUE=e.pointerType!='mouse'});
cv.onclick=e=>{if(DLG)return avancaFala();if(FORM)return cliqueForm(pick(e));const t=pick(e);if(!t||!cur||over||cur.team)return;
if(TOQUE&&['move','atk','skill','item','dir'].includes(ph)&&(!hov||hov[0]!=t[0]||hov[1]!=t[1])){hov=t;ui(true);return}const[x,y]=t,u=at(x,y),d=dist(x,y,cur.x,cur.y);
if(ph=='move'){const r=reach(cur);if(d&&r.has(key(x,y))){ph='busy';ui();walk(cur,x,y,r.par,()=>{moved=true;after()})}}
else if(ph=='atk'){if(u&&u.team&&visto(u)&&d>=cur.min&&d<=alcance(cur)){atk(cur,x,y);acted=true;after()}}
else if(ph=='skill')cliqueHab(x,y);
else if(ph=='item'){if(u&&!u.team&&u.hp<u.mhp&&d<=1&&pocoes()>0){pocao(cur,u);acted=true;after()}}
else if(ph=='dir'){if(d==1){setF(cur,x,y);end()}else if(d==0)end()}};
const mine=()=>cur&&!cur.team&&!over&&ph!='busy'&&!DLG;
const mode=m=>{if(mine())ph=ph==m?'idle':m;ui()};
$('bd').onclick=()=>{if(!mine()||acted)return;defender(cur);acted=true;after()};
$('bm').onclick=()=>mode('move');$('ba').onclick=()=>mode('atk');$('bp').onclick=()=>mode('item');
$('bu').onclick=()=>{if(mine()&&moved&&!acted){Object.assign(cur,orig);moved=false;ph='idle';msg(cur.name+' volta à posição inicial.');ui()}};
$('bw').onclick=()=>{if(!mine())return;if(ph=='dir')return end();ph='dir';msg('Escolha para onde '+cur.name+' vai olhar.');ui()};
$('br').onclick=()=>{if(F)start()};
$('rl').onclick=()=>girar(-1);$('rr').onclick=()=>girar(1);
document.addEventListener('keydown',e=>{if(!ovl.hidden||DLG||e.repeat)return;if(FORM&&e.key=='Enter'){fimForm();return}const k=e.key.toLowerCase();if(k=='q')girar(-1);else if(k=='e')girar(1)});
document.addEventListener('keydown',e=>{if(!mine()||!ovl.hidden)return;
if((e.key=='d'||e.key=='D')&&!acted){$('bd').onclick();return}
if(e.key=='Escape'&&!(moved&&acted))ph='idle';else if(e.key=='Enter'&&ph=='dir')return end();else return;ui()});
function ordem(n){const s=U.filter(u=>u.hp>0).map(u=>({u,ct:u.ct-(u===cur?100:0)})),o=[cur];
while(o.length<n){const b=s.filter(e=>e.ct>=100).sort((a,c)=>c.ct-a.ct)[0];if(b){o.push(b.u);b.ct-=100}else s.forEach(e=>e.ct+=e.u.spd)}return o}
function previa(){if(!hov||!mine())return'';const[x,y]=hov,t=at(x,y),d=dist(x,y,cur.x,cur.y);
if(ph=='atk'&&t&&t.team&&visto(t)&&d>=cur.min&&d<=alcance(cur)){const c=calc(cur,t,cur.atk);return`Dano previsto: <b>${c.d}</b>${c.back?' (costas!)':''}${c.d>=t.hp?' — derrota o alvo':''}`}
if(ph=='skill'&&cur.sk&&HAB[cur.sk])return previaHab(cur,HAB[cur.sk],x,y);
if(ph=='item'&&t&&!t.team&&d<=1)return t.hp<t.mhp?`Poção cura: <b>+${Math.min(ITENS.pocao.cura,t.mhp-t.hp)}</b>`:`${t.name} já está com a vida cheia.`;
if(ph=='dir'&&d==1)return'Clique para virar para este lado e encerrar o turno.';return''}
function ui(light){if(!cur)return;const en=!mine();
$('bm').disabled=en||moved;$('ba').disabled=en||acted;if(!light&&typeof botoesHab=='function')botoesHab(en);$('bd').disabled=en||acted;const np=pocoes();$('bp').disabled=en||acted||!np;$('bp').textContent=`Poção (${np})`;$('bp').className=ph=='item'?'on':'';
$('bu').disabled=en||!moved||acted;if(typeof mostraEspada=='function')mostraEspada();$('bw').disabled=en;$('bw').textContent=ph=='dir'?'Confirmar direção':'Encerrar turno';
$('bm').className=ph=='move'?'on':'';$('ba').className=ph=='atk'?'on':'';$('bw').className=ph=='dir'?'on':'';
const hu=hov&&at(hov[0],hov[1]),u=(hu&&visto(hu)?hu:null)||cur,pv=previa();
const sts=typeof estados=='function'?estados(u).map(k=>ST_ICONE[k]+' '+ST_NOME[k]):[];if(u.manto)sts.push('👁 invisível');if(u.imune)sts.push('✨ protegido');if(u.mira)sts.push('🎯 mirando');if(u.provocado)sts.push('❗ provocado');
let s=`<b>${u.name}</b>${u.lider?' 👑':''}${u.defesa?' · 🛡 em defesa':''} · ${u.n} (${u.team?'inimigo':'aliado'})<br>HP ${Math.max(0,u.hp)}/${u.mhp}${u.mmp?' · MP '+u.mp+'/'+u.mmp:''} · Mov ${u.mov} · Salto ${u.jmp}${sts.length?'<br>'+sts.join(' · '):''}`;
if(hov){const T=tr(hov[0],hov[1]),o=ob(hov[0],hov[1]);s+=`<br><span class="mu">Terreno: ${T.n}${o?' · '+o.n:''}, altura ${alt(hov[0],hov[1])}${livre(hov[0],hov[1])?'':' (intransponível)'}${T.dano?` (queima ${T.dano})`:''}</span>`}
if(pv)s+=`<div class="pv">${pv}</div>`;$('inf').innerHTML=s;
if(!light){$('lg').innerHTML=log.join('<br>');
$('ord').innerHTML=`<span class="ol">Turno ${tg} · Próximos:</span>`+(over?'':ordem(7).map((o,i)=>`<span class="ch ${o.team?'en':'al'}${i?'':' now'}">${visto(o)?(o.lider?'👑 ':'')+o.name:'???'}</span>`).join(''))}}
function desenhaCena(e){const{x,y}=CENA;
if(e<1.6){for(let i=0;i<3;i++){const r=e*240+i*45;g.strokeStyle=`rgba(255,${160+i*30},60,${Math.max(0,1-e/1.6)})`;g.lineWidth=8-i*2;g.beginPath();g.ellipse(x,y,r,r*.55,0,0,7);g.stroke()}
const nucleo=g.createRadialGradient(x,y,4,x,y,40+e*120);nucleo.addColorStop(0,'rgba(255,255,230,.95)');nucleo.addColorStop(.4,'rgba(255,170,60,.7)');nucleo.addColorStop(1,'rgba(255,80,20,0)');g.fillStyle=nucleo;g.fillRect(x-400,y-400,800,800);
for(let n=0;n<48;n++){const a=n*2.39,v=80+(n*37)%140,px=x+Math.cos(a)*v*e,py=y+Math.sin(a)*v*e*.6+60*e*e;g.fillStyle=n%3?'#ffb04a':'#fff2b0';g.fillRect(px,py,3,3)}}
const branco=e<1.2?Math.max(0,(e-.8)/.4):e<2?1-(e-1.2)/.8:0;if(branco>0){g.fillStyle=`rgba(255,255,255,${branco})`;g.fillRect(-3000,-3000,6000,6000)}
if(e>1.6){const al=Math.min(1,(e-1.6)/.6),desce=Math.min(1,(e-1.8)/1.4),q=1-Math.pow(1-desce,3),cy=y-260+260*q;
const feixe=g.createLinearGradient(0,y-500,0,y+20);feixe.addColorStop(0,`rgba(255,240,170,0)`);feixe.addColorStop(1,`rgba(255,236,150,${.55*al})`);g.fillStyle=feixe;g.fillRect(x-38,y-500,76,520);
if(desce>=1){for(let n=0;n<12;n++){const a=n*Math.PI/6+e*.8;g.strokeStyle=`rgba(255,230,140,${.35+.2*Math.sin(e*4+n)})`;g.lineWidth=3;g.beginPath();g.moveTo(x,y-10);g.lineTo(x+Math.cos(a)*90,y-10+Math.sin(a)*50);g.stroke()}}
for(let n=0;n<16;n++){const a=n*.9+e*2,r=26+(n%4)*10;g.fillStyle=`rgba(255,255,220,${al*(.5+.5*Math.sin(e*6+n))})`;g.fillRect(x+Math.cos(a)*r,cy-14+Math.sin(a)*r*.5,2,2)}
g.save();g.translate(x,cy);g.scale(2,2);desenhaBau(g,0,0,'celeste',tk);g.restore();
if(e>3.3){g.globalAlpha=Math.min(1,(e-3.3)/.6);g.font='700 26px "Alegreya SC",Georgia,serif';g.textAlign='center';g.lineWidth=6;g.strokeStyle='#2a1a08';g.strokeText('Baú Celestial',x,y-80);g.fillStyle='#ffe7a8';g.fillText('Baú Celestial',x,y-80);
g.font='18px "Alegreya Sans",Georgia,sans-serif';g.strokeText('Espada Celestial obtida!',x,y-56);g.fillStyle='#fff';g.fillText('Espada Celestial obtida!',x,y-56);g.globalAlpha=1}}}
function poly(p,c){g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=c;g.fill();g.strokeStyle='rgba(0,0,0,.22)';g.stroke()}
function deco(id,cx,cy,x,y){if(id=='b'){const al=.25+.2*Math.sin(tk/9+x*2+y);g.fillStyle=`rgba(255,120,40,${al})`;g.beginPath();g.ellipse(cx,cy,22,10,0,0,7);g.fill();return}if(id=='a'||id=='v'||id=='w'){const o=Math.sin(tk/25+x*1.3+y)*8;g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=2;g.beginPath();g.moveTo(cx-12+o,cy-2);g.lineTo(cx+2+o,cy-2);g.moveTo(cx-2-o,cy+5);g.lineTo(cx+10-o,cy+5);g.stroke();g.lineWidth=1}
else if(id=='p'){g.save();if(ROT%2){g.translate(cx,0);g.scale(-1,1);g.translate(-cx,0)}g.strokeStyle='rgba(40,25,10,.5)';for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(cx-16+i*8,cy-8+i*4);g.lineTo(cx+16+i*8,cy+8+i*4);g.stroke()}g.restore()}
else if(id=='r'){poly([[cx-16,cy+4],[cx-12,cy-12],[cx+2,cy-20],[cx+15,cy-8],[cx+13,cy+5],[cx,cy+9]],'#6b7180');poly([[cx-12,cy-12],[cx+2,cy-20],[cx+4,cy-8],[cx-6,cy-4]],'#8f96a4')}}
function desenha(){tk++;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);g.setTransform(DPR*K,0,0,DPR*K,DPR*TX,DPR*TY);g.imageSmoothingEnabled=false;if(!F)return;
if(F.fundo&&typeof FUNDOS!='undefined'&&FUNDOS[F.fundo])FUNDOS[F.fundo](g,tk);
const agora=performance.now(),eP=PISCA?(agora-PISCA.t0)/1000:9,eC=CENA?(agora-CENA.t0)/1000:9,treme=(eP<.8?6*(1-eP/.8):0)+(eC<1.5?10*Math.min(1,eC/.4):0);
if(treme)g.translate((Math.random()-.5)*treme,(Math.random()-.5)*treme);
if(GIRO){GIRO.t+=1/14;if(GIRO.t>=.5&&!GIRO.feito){ROT=(ROT+GIRO.d+4)%4;GIRO.feito=true}const sx=Math.max(.03,Math.abs(Math.cos(Math.min(1,GIRO.t)*Math.PI)));
g.translate(OX,190);g.scale(sx,1);g.translate(-OX,-190);if(GIRO.t>=1)GIRO=null}
const ov=new Map(),me=mine();
if(F.desaba&&AVISO_QUEDA&&!QUEDA&&!over)for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(TER[F.mapa.ter[y][x]].racha)ov.set(key(x,y),`rgba(255,40,80,${.3+.2*Math.sin(tk/5)})`);
if(FEIXE&&!over)for(let i=0;i<N;i++)ov.set(FEIXE.eixo=='x'?key(FEIXE.linha,i):key(i,FEIXE.linha),`rgba(255,70,30,${.28+.14*Math.sin(tk/6)})`);
if(FORM){FORM.z.forEach((_,k)=>ov.set(k,'rgba(91,176,234,.5)'));const s=FORM.sel!=null&&emCampo(FORM.sel);if(s)ov.set(key(s.x,s.y),'rgba(255,212,90,.7)')}
if(me){if(ph=='move')reach(cur).forEach((_,k)=>ov.set(k,'rgba(47,134,196,.6)'));
if(ph=='skill'&&cur.sk&&HAB[cur.sk]){const h=HAB[cur.sk],cu=CURAS.includes(h.tipo);for(const k of faixa(cur,h))ov.set(k,cu?'rgba(76,211,126,.55)':'rgba(240,150,40,.6)');
if(hov&&ov.has(key(...hov))){const r=h.tipo=='fogo'?h.raio||1:h.tipo=='bencao'||h.tipo=='purifica'?h.raio:0;if(r)for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(dist(x,y,hov[0],hov[1])<=r)ov.set(key(x,y),cu?'rgba(140,240,170,.8)':'rgba(255,210,60,.8)');
if(h.tipo=='linha')for(const[x,y]of linhaTiles(cur,hov[0],hov[1],h.alc))ov.set(key(x,y),'rgba(255,210,60,.8)')}}
else if(ph=='atk'||ph=='item'){const cu=ph=='item',R=cu?1:alcance(cur),Mi=cu?0:cur.min;
for(let y=0;y<N;y++)for(let x=0;x<N;x++){const d=dist(x,y,cur.x,cur.y);if(d>=Mi&&d<=R)ov.set(key(x,y),cu?'rgba(76,211,126,.55)':'rgba(196,64,58,.6)')}}
if(ph=='dir')for(const[a,b]of DIRS)if(inb(cur.x+a,cur.y+b))ov.set(key(cur.x+a,cur.y+b),'rgba(255,212,90,.55)')}
for(let s=0;s<=2*N-2;s++)for(let a=Math.max(0,s-N+1);a<=Math.min(s,N-1);a++){const[x,y]=desrot(a,s-a),h=alt(x,y),id=terId(x,y),T=TER[id],[cx,cy]=P(x,y),dp=h*S+10;if(T.vazio)continue;
g.drawImage(bloco(id,h,(x*7+y*13)%4),cx-32,cy-16);
const top=[cx,cy-16],tp=[top,[cx+32,cy],[cx,cy+16],[cx-32,cy]];
const o=ov.get(key(x,y));if(o)poly(tp,o);deco(id,cx,cy,x,y);
if(hov&&hov[0]==x&&hov[1]==y){g.beginPath();tp.forEach(([a,b],i)=>i?g.lineTo(a,b):g.moveTo(a,b));g.closePath();g.lineWidth=3;g.strokeStyle='#ffd45a';g.stroke();g.lineWidth=1}
const oc=F.mapa.obj&&F.mapa.obj[y][x];if(oc&&oc!='.'){if(tapa(oc,x,y,cx,cy))g.globalAlpha='SVHQW'.includes(oc)?.62:.38;desenhaObj(g,oc,cx,cy,(x*5+y*3)%3,ACESAS.has(key(x,y)));g.globalAlpha=1}
const bz=BAUS.find(b=>b.x==x&&b.y==y);if(bz&&typeof desenhaBau=='function')desenhaBau(g,cx,cy,bz.raro,tk);
const u=at(x,y),nevoa=longe(x,y);if(u&&visto(u))unit(u,cx,cy);
else if(u&&u.submerso&&!nevoa){for(let n=0;n<3;n++){const ph2=(tk/30+n/3)%1;g.strokeStyle=`rgba(230,245,255,${1-ph2})`;g.lineWidth=1.5;g.beginPath();g.arc(cx-8+n*8,cy-2-ph2*10,2+n%2,0,7);g.stroke()}}
if(!u){const os=U.find(o=>o.ossos>0&&o.x==x&&o.y==y);if(os&&!nevoa){g.fillStyle='#e8e4d4';for(const[a,b,w]of[[-8,-4,10],[0,-2,8],[-4,-7,6],[3,-6,3]])g.fillRect(cx+a,cy+b,w,2);g.fillRect(cx-2,cy-10,4,4)}}
if(nevoa&&!over)poly(tp,F.escuridao?'rgba(8,6,16,.72)':F.neve?'rgba(70,90,120,.42)':'rgba(214,222,230,.45)')}
fl=fl.filter(f=>f.a<60);fl.forEach(f=>{f.a++;g.globalAlpha=1-f.a/60;g.fillStyle=f.c;g.font='bold 22px sans-serif';g.textAlign='center';g.fillText(f.t,f.x,f.y-f.a*.7);g.globalAlpha=1});
if(PISCA){if(eP<1){g.fillStyle=`rgba(${PISCA.cor},${.7*(1-eP)})`;g.fillRect(-3000,-3000,6000,6000)}else PISCA=null}
if(typeof INVOC!='undefined'&&INVOC)desenhaInvocacao((agora-INVOC.t0)/1000);
if(CENA){desenhaCena(eC);if(eC>6.2){const cb=CENA.cb;CENA=null;cb()}return}
if(F.tempestade&&tempestade()){const nv=g.createLinearGradient(0,VB.y,0,VB.y+VB.h);nv.addColorStop(0,'rgba(150,95,40,.45)');nv.addColorStop(1,'rgba(190,130,60,.3)');g.fillStyle=nv;g.fillRect(-3000,-3000,6000,6000);
for(let n=0;n<220;n++){const v=1+n%5,sx=VB.x-40+((n*151+tk*4*v)%(VB.w+80)),sy=VB.y+((n*97)%VB.h)+Math.sin(tk/15+n)*10;g.fillStyle=n%3?`rgba(120,75,30,${.35+.08*v})`:'rgba(240,210,150,.6)';g.fillRect(sx,sy,10+v*5,v>3?3:2)}}
if(F.neve)for(let n=0;n<70;n++){const v=1+n%3,sx=VB.x+((n*137+tk*.5*v+Math.sin(tk/40+n)*12)%VB.w+VB.w)%VB.w,sy=VB.y+(n*89+tk*v)%VB.h;g.fillStyle=`rgba(255,255,255,${.45+.15*v})`;g.fillRect(sx,sy,v,v)}
if(over){g.fillStyle='rgba(0,0,0,.55)';g.fillRect(-3000,150,6000,90);g.fillStyle='#fff';g.font='bold 30px Georgia,serif';g.textAlign='center';g.fillText(log[0],VB.x+VB.w/2,205)}}
// O laço de desenho nunca pode parar: se um quadro falhar, o erro vai para o console e o próximo quadro tenta de novo
// (antes, um único erro deixava a batalha com a tela branca até recarregar a página).
let ERRO_DESENHO='';
function draw(){try{desenha()}catch(e){g.globalAlpha=1;if(e.message!=ERRO_DESENHO){ERRO_DESENHO=e.message;console.error(e)}}requestAnimationFrame(draw)}
// Larga a batalha atual (sem vitória nem derrota): usado ao abrir outra fase e ao voltar ao mapa pelo menu.
function largaBatalha(){parar();U=[];BAUS=[];FORM=null;cur=null;over=false;hov=null;DLG=null;$('dlg').hidden=true;PISCA=null;CENA=null;if(typeof INVOC!='undefined')INVOC=null}
const PL={K:{a:'#9aa6b8',b:'#6b778a',g:'#e0b040',w:'#d8dde6',h:'#9aa6b8'},A:{a:'#3f8f55',b:'#2b6a3d',g:'#c9a24a',w:'#8a5a2b',h:'#2f7a47'},M:{a:'#7b52c9',b:'#573a96',g:'#f0c850',w:'#cfa86a',h:'#6a43b8',c:'#6a43b8'},L:{a:'#4a4a5a',b:'#2e2e3a',g:'#c0392b',w:'#c8ccd4',h:'#3a3a4a'},C:{a:'#f0ece0',b:'#cfc8b4',g:'#e0b040',w:'#e0b040',h:'#f0ece0'},
P:{a:'#e8e4d8',b:'#b8b09a',g:'#e0b040',w:'#f0d070',h:'#e8e4d8'},T:{a:'#2f6b47',b:'#1e4a30',g:'#d4a24a',w:'#6b4a2a',h:'#8a2a2a'},X:{a:'#2c3f8f',b:'#1d2a66',g:'#f0c850',w:'#cfa86a',h:'#1d2a66',c:'#1d2a66'},
S:{a:'#26222e',b:'#14111a',g:'#c0392b',w:'#d8dde6',h:'#5a1a24'},Z:{a:'#f4f1ea',b:'#9ab4d8',g:'#5b8fd6',w:'#e0b040',h:'#9ab4d8'},R:{a:'#4a6fa8',b:'#8a5a2b',g:'#ffd45a',w:'#c9a24a',h:'#4a6fa8'},
E:{a:'#f2ead2',b:'#c9a24a',g:'#ffd45a',w:'#fff2b0',h:'#f2ead2'},V:{a:'#2a5a7a',b:'#1a3a52',g:'#7fd0ff',w:'#5a3a22',h:'#2a5a7a'},F:{a:'#1e1e4a',b:'#121230',g:'#b8e0ff',w:'#cfa86a',h:'#1e1e4a',c:'#1e1e4a'},
B:{a:'#1a1424',b:'#0c0a12',g:'#8a4ae0',w:'#d8dde6',h:'#3a1a5a'},O:{a:'#fff8e8',b:'#e0b040',g:'#ffd45a',w:'#ffe27a',h:'#fff8e8'},J:{a:'#2a6a5a',b:'#5a3a22',g:'#e0b040',w:'#c9a24a',h:'#2a6a5a'},N:{a:'#8a5a2b',b:'#5e3a1a',g:'#e0b040',w:'#c8ccd4',h:'#6b4a2a'}},
EN={K:{a:'#b05050',b:'#7d2d2d',h:'#b05050'},A:{a:'#a8553a',b:'#7a3a28',h:'#8a3f2a'},M:{a:'#a03a5a',b:'#722a42',h:'#8a2a4a',c:'#8a2a4a'},L:{a:'#7a3a3a',b:'#4e2424',h:'#5e2e2e'},C:{a:'#c8a0a0',b:'#9a7070',h:'#c8a0a0'},W:{a:'#4a4458',b:'#2e2a38',h:'#4a4458',g:'#ff5a3a'},H:{a:'#7a5a8a',b:'#5a3e70',h:'#2a2040',g:'#ffd040'},D:{a:'#5a1020',b:'#2a0810',h:'#1a0608',g:'#ffb020',s:'#8a2a2a',e:'#ffe040'},Q:{a:'#d8d4c4',b:'#8a8270',h:'#cfcab8',s:'#e8e4d4',e:'#ff3030',g:'#8a8270',p:'#bdb8a6'},G:{a:'#4a6a66',b:'#2e4a46',h:'#3a5a3a',g:'#8ab86a',s:'#9ab8a0'},Z:{a:'#3a6a8a',b:'#24485e',h:'#bfe4f0',g:'#e0f4ff',w:'#9ad0e0'},
U:{a:'#dfe8f0',b:'#a8b8c8',h:'#dfe8f0',g:'#3ab8ff'},I:{a:'#5a7a9a',b:'#3a5470',h:'#c8d4e0',g:'#d8e8f4',w:'#c8d8e8'},Y:{a:'#3a6a9a',b:'#24486e',h:'#e8f4ff',g:'#9ae0ff',c:'#e8f4ff',w:'#cfe8f8'},
V:{a:'#4a6a7a',b:'#2e4a5a',h:'#c8d8e4',g:'#9ae0ff',w:'#6b4a2a'},
Ch:{a:'#c89a5a',b:'#8a6a3a',h:'#c89a5a',g:'#ffd040'},Gs:{a:'#c8a060',b:'#8a5a2a',h:'#f0e8d8',g:'#ffd45a',w:'#e0e0e8'},As:{a:'#b8763a',b:'#7a4a20',h:'#f0e0c0',g:'#ffd45a',w:'#6b4a2a'},
Ms:{a:'#3a5a9a',b:'#24386e',h:'#d8b060',g:'#ffd45a',c:'#d8b060',w:'#cfa86a'},Ls:{a:'#7a2a3a',b:'#4a1420',h:'#e0c080',g:'#ffd45a',w:'#e8e8f0'},
Cs:{a:'#2a2018',b:'#c9a24a',h:'#1a1208',g:'#ff9a2a',s:'#c9a24a',e:'#ff5a1a'},
Pf:{a:'#5a7a7a',b:'#2e4a4a',h:'#1a2a2a',g:'#9af0d0',w:'#c8d8d0',s:'#b8d8cc'},Ar:{a:'#3a5a6a',b:'#24384a',h:'#c83a3a',g:'#e0c060',w:'#8a6a4a'},
Bm:{a:'#1a5a5a',b:'#0e3a3a',h:'#2a7a6a',g:'#9af0d0',c:'#2a7a6a',w:'#cfa86a'},Ma:{a:'#3a5a6a',b:'#1e3a46',h:'#2a4a3a',g:'#9af0d0',s:'#8ab0a8'},
TT:{a:'#6a3a7a',b:'#3e1e4a',g:'#e8c8f0'},Ce:{a:'#2a1e3a',b:'#160e22',h:'#2a1e3a',g:'#b05aff',w:'#c8b8e8'},Av:{a:'#3a2a4a',b:'#20142e',h:'#5a2a6a',g:'#b05aff',w:'#4a3a5a'},
Fe:{a:'#3a1a4a',b:'#200a2e',h:'#1a0a24',g:'#ff5ac8',c:'#1a0a24',w:'#8a6aa8'},Bv:{a:'#2a1a3a',b:'#140a20',h:'#2a1a3a',g:'#ff3a8a'},OE:{a:'#3a1a5a',b:'#1a0a2e',g:'#ff3a6a',s:'#f0e8ff'},
Oz1:{a:'#1a1024',b:'#0a0612',h:'#2a1838',g:'#ffb030',c:'#2a1838',w:'#c8a060',s:'#d8c8e0'},Oz2:{a:'#1a0a24',b:'#3a1a5a',h:'#0a0412',g:'#ff3aa0',s:'#5a3a7a',e:'#ffd040'},
Oz3:{a:'#06030a',b:'#ff8a20',g:'#ffd040',s:'#ff5a1a',e:'#ffffff'},KR:{a:'#4a2a5a',b:'#2a1438',g:'#ffd040',s:'#8a5a9a',e:'#ff4a2a'}},
LD={a:'#3a3440',b:'#211d26',h:'#3a3440',g:'#d4a017'},SC={};
function unit(u,cx,cy){let f=u.f;if(u===cur&&ph=='dir'&&hov&&dist(hov[0],hov[1],u.x,u.y)==1)f=[hov[0]-u.x,hov[1]-u.y];
g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(cx,cy+2,20,9,0,0,7);g.fill();
g.strokeStyle=u.team?'#e8645e':'#5bb0ea';g.lineWidth=3;g.beginPath();g.ellipse(cx,cy+2,20,9,0,0,7);g.stroke();g.lineWidth=1;
if(u.defesa&&u.hp>0){const sx=cx+16,sy=cy-58;g.fillStyle='#1a1420';g.beginPath();g.moveTo(sx-8,sy-1);g.lineTo(sx+8,sy-1);g.lineTo(sx+8,sy+7);g.lineTo(sx,sy+13);g.lineTo(sx-8,sy+7);g.closePath();g.fill();
g.fillStyle='#7cc4ff';g.beginPath();g.moveTo(sx-6,sy+1);g.lineTo(sx+6,sy+1);g.lineTo(sx+6,sy+6);g.lineTo(sx,sy+11);g.lineTo(sx-6,sy+6);g.closePath();g.fill();g.fillStyle='#e8f4ff';g.fillRect(sx-1,sy+2,2,7)}
if(u.escudo&&u.hp>0){g.strokeStyle=`rgba(255,226,122,${.6+.3*Math.sin(tk/8)})`;g.lineWidth=2;g.beginPath();g.ellipse(cx,cy-18,22,30,0,0,7);g.stroke();g.lineWidth=1}
f=rotDir(f);const fx=(f[0]-f[1])*14,fy=(f[0]+f[1])*7;g.fillStyle='#fff';g.beginPath();g.arc(cx+fx,cy+2+fy,4,0,7);g.fill();
const bk=(f[0]+f[1])<0,fr=u.andando?Math.floor(tk/6)%2:0,resp=u.andando?0:Math.round(Math.sin(tk/16+u.x*1.7)*.8);
if(CL[u.k]&&CL[u.k].tier>=7&&!u.team){const au=g.createRadialGradient(cx,cy-30,6,cx,cy-30,44);au.addColorStop(0,`rgba(255,220,120,${.35+.15*Math.sin(tk/12)})`);au.addColorStop(1,'rgba(255,220,120,0)');g.fillStyle=au;g.fillRect(cx-46,cy-76,92,92)}
if(u.imune){g.strokeStyle=`rgba(255,246,190,${.7+.3*Math.sin(tk/6)})`;g.lineWidth=3;g.beginPath();g.ellipse(cx,cy-20,20,32,0,0,7);g.stroke();g.lineWidth=1}
g.imageSmoothingEnabled=false;g.save();if(u.manto)g.globalAlpha=.4;g.translate(cx,cy+2);if(f[0]-f[1]>0)g.scale(-1,1);if(u.grande){const e=u.escala||1.4;g.scale(e,e)}g.drawImage(spr(u,bk,fr),-22,-62+resp,44,64);g.restore();
{const ic=(typeof estados=='function'?estados(u).map(k=>ST_ICONE[k]):[]).concat(u.mira?['🎯']:[],u.provocado?['❗']:[]).join('');if(ic){g.font='12px sans-serif';g.textAlign='center';g.fillText(ic,cx,cy-72)}}
g.fillStyle='#333';g.fillRect(cx-15,cy-68,30,5);g.fillStyle=u.team?'#e8645e':'#4cc36e';g.fillRect(cx-15,cy-68,30*Math.max(0,u.hp)/u.mhp,5);
if(u.lider){g.font='14px sans-serif';g.textAlign='center';g.fillText('👑',cx+22,cy-62)}
if(u.alerta){g.fillStyle='#e8ebf2';g.font='bold 12px sans-serif';g.textAlign='center';g.fillText('z',cx-24,cy-56+Math.sin(tk/15)*2)}
if(u===cur&&!over){const b=Math.sin(tk/10)*3;g.fillStyle='#ffd45a';g.beginPath();g.moveTo(cx-6,cy-84+b);g.lineTo(cx+6,cy-84+b);g.lineTo(cx,cy-75+b);g.fill()}}
// O som começa sempre ligado (quem quiser desliga nas Opções).
let AC=null,on=true,mus=null,bar=0,nt=0;const B=.6,CH=[[110,[440,523,659]],[87.3,[349,440,523]],[130.8,[392,523,659]],[98,[392,494,587]]];
function tone(f,t0,d,type,v){const o=AC.createOscillator(),gn=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t0);gn.gain.setValueAtTime(v,t0);gn.gain.exponentialRampToValueAtTime(.001,t0+d);o.connect(gn).connect(AC.destination);o.start(t0);o.stop(t0+d)}
function noise(t0,d,v,fr){const b=AC.createBuffer(1,Math.floor(AC.sampleRate*d),AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;const s=AC.createBufferSource(),f=AC.createBiquadFilter(),gn=AC.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=fr;gn.gain.setValueAtTime(v,t0);gn.gain.exponentialRampToValueAtTime(.001,t0+d);s.connect(f).connect(gn).connect(AC.destination);s.start(t0)}
function sfx(k){if(!on||!AC)return;const t=AC.currentTime;
if(k=='pas')tone(160,t,.06,'square',.06);
else if(k=='sword'){noise(t,.15,.25,5000);tone(300,t,.1,'sawtooth',.1)}
else if(k=='arrow'){tone(900,t,.18,'triangle',.1);noise(t+.12,.08,.2,3000)}
else if(k=='hit'){noise(t+.02,.12,.3,1500);tone(120,t+.02,.12,'square',.15)}
else if(k=='crit'){noise(t,.2,.4,2500);tone(90,t,.25,'sawtooth',.2);tone(600,t,.1,'square',.1)}
else if(k=='fire'){noise(t,.7,.4,900);tone(70,t,.6,'sawtooth',.2)}
else if(k=='heal'){[660,880,1100].forEach((f,i)=>tone(f,t+i*.08,.2,'sine',.12))}
else if(k=='win'){[523,659,784,1047].forEach((f,i)=>tone(f,t+i*.15,.3,'square',.12))}
else if(k=='lose'){[392,330,262,196].forEach((f,i)=>tone(f,t+i*.25,.4,'triangle',.15))}}
$('bz').onclick=()=>{if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();on=!on;$('bz').textContent=on?'Som: ligado':'Som: desligado';$('bz').className=on?'on':'';
if(on){AC.resume();if(typeof tocar=='function'&&MUS.desejada)tocar(MUS.desejada,true)}else if(typeof paraMusica=='function')paraMusica()};
$('bz').textContent='Som: ligado';$('bz').className='on';
// Os navegadores só deixam tocar som depois do primeiro clique, toque ou tecla: nesse momento o áudio é liberado
// e a música da tela atual começa sozinha.
function liberaSom(){if(!on)return;if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();const ok=()=>{if(typeof tocar=='function'&&MUS.desejada)tocar(MUS.desejada)};
if(AC.state!='running')AC.resume().then(ok).catch(()=>{});else ok();if(AC.state=='running')['pointerdown','keydown','touchstart'].forEach(ev=>removeEventListener(ev,liberaSom,true))}
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,liberaSom,true));
let PARTY=['K','A','M','L','C'];const NM={K:['Aldric','Bran','Cael','Doran','Edric'],A:['Lira','Sena','Tarn','Wren','Yara'],M:['Mirel','Orla','Zeph','Isar','Nima'],L:['Nyx','Rex','Vale','Kai','Suri'],C:['Elara','Ines','Sol','Tess','Alva'],R:['Galen','Tora','Brisa','Ulric','Mara']},ovl=$('ov'),
DS={K:'Linha de frente. Resistente e golpeia de perto.',A:'Ataca de longe (alcance 2 a 4) e rende mais em terreno alto.',M:'Frágil, mas o Fogo atinge uma área inteira.',L:'Veloz e ágil. Atacando pelas costas, causa o dobro de dano.',C:'Cura aliados feridos em até 3 casas (4 MP). Ataque fraco.',
P:'Cavaleiro sagrado: mais vida e uma Cura de toque em aliados ao lado (4 MP).',T:'Arqueiro de elite: alcance 2 a 5 e ataque mais forte.',X:'Mestre do fogo: Inferno atinge uma área a até 4 casas, com mais dano (6 MP).',
S:'Sombra veloz: ataque pelas costas causa 2,2 vezes o dano.',R:'Cavaleiro montado: anda 6 casas e ataca a até 2 casas com a lança. Pouco salto.',Z:'Cura Maior: +24 HP em aliados a até 4 casas (5 MP).',
E:'Templário: muita vida e o Escudo de Luz (6 MP), que corta pela metade o dano recebido por ele e pelos aliados ao lado até o próximo turno dele.',
V:'Caçador de Tempestade: alcance 2 a 6 e a Chuva de Flechas (6 MP), que atinge uma área a até 5 casas.',
F:'Feiticeiro Estelar: o Meteoro (9 MP) cai a até 5 casas e atinge uma área enorme, de raio 2.',
B:'Lâmina Sombria: anda 6 casas e ataca duas vezes (o segundo golpe com 60% da força). Pelas costas, ainda mais dano.',
O:'Oráculo: a Bênção (8 MP) cura todos os aliados numa área a até 4 casas.',
J:'Cavaleiro Dragão: salta por cima de obstáculos, alturas e inimigos, e ataca a até 2 casas com a lança.'};
const melhor=id=>{try{return+localStorage.getItem('cdr.'+id)||0}catch(e){return 0}},grava=(id,v)=>{try{localStorage.setItem('cdr.'+id,v)}catch(e){}};
const est=n=>`<span class="stars">${'★'.repeat(n)}${'☆'.repeat(3-n)}</span>`;
function pv(k,s){const c=document.createElement('canvas');c.width=SPR_W;c.height=SPR_H;c.style.cssText=`width:${Math.round(SPR_W*s*2/3)}px;height:${Math.round(SPR_H*s*2/3)}px;image-rendering:pixelated`;c.getContext('2d').drawImage(spr({k,team:0},false),0,0);return c}
function retomar(){ovl.hidden=true;if(cur.team)setTimeout(ai,500);else if(ph=='busy'){moved=true;after()}}
function sel(){if(typeof tocar=='function')tocar('titulo');let pt=[...PARTY];const R=()=>{ovl.innerHTML=`<div class="sc"><h2>Monte seu grupo</h2><p>Escolha ${TAM_GRUPO} combatentes. Você pode repetir classes.</p><div class="cards" id="cd"></div><div class="slots" id="sl"></div><div class="acts"><button id="vb">Voltar</button><button id="ib" class="on">Continuar</button></div></div>`;
for(const k of['K','A','M','L','C']){const c=CL[k],b=document.createElement('button');b.className='card';b.append(pv(k,6));b.insertAdjacentHTML('beforeend',`<b>${c.n}</b><span>${DS[k]}</span><small>HP ${c.hp} · Mov ${c.mov} · Salto ${c.jmp} · Alc ${c.min==c.rng?c.rng:c.min+'-'+c.rng}</small>`);b.onclick=()=>{if(pt.length<TAM_GRUPO){pt.push(k);R()}};$('cd').append(b)}
for(let i=0;i<TAM_GRUPO;i++){const s=document.createElement('button');s.className='slot';if(pt[i])s.append(pv(pt[i],4));else s.textContent='Vazio';s.title=pt[i]?'Remover do grupo':'';s.onclick=()=>{pt.splice(i,1);R()};$('sl').append(s)}
$('ib').disabled=pt.length<TAM_GRUPO;$('vb').onclick=title;$('ib').onclick=()=>{criaHerois(pt);mapa()}};R()}
function brief(){largaBatalha();fase(FI);ovl.hidden=false;if(typeof tocar=='function')tocar(F.musica||'mapa');const m=melhor(F.id),cp=camp(),livre=!!(F.aleatorios&&cp&&cp.venceu.includes(F.id));
ovl.innerHTML=`<div class="sc brief"><h2>${F.nome}</h2>${livre?'<p>Vocês já venceram esta batalha. Novos inimigos ocuparam a região: lutem para treinar, ganhar ouro e encontrar baús.</p>':F.historia.map(t=>`<p>${t}</p>`).join('')}<div class="obj"><b>Objetivo:</b> ${livre?'Batalha livre: derrote todos os inimigos (metade do ouro da história).':F.objetivo}<br><small>${F.dica}</small></div><p class="stat">Dificuldade: <b>${DIF[dif()].n}</b> (muda no menu inicial)</p>${m?`<p class="stat">Seu melhor resultado: ${est(m)}</p>`:''}<div class="acts"><button id="vm">Mapa</button><button id="vb">Grupo</button><button id="lt" class="on">Lutar!</button></div></div>`;
$('vm').onclick=mapa;$('vb').onclick=()=>grupo(brief);$('lt').onclick=start}
function fim(v){const al=U.filter(u=>!u.team),vi=al.filter(u=>u.hp>0).length,n=v?1+(vi==al.length)+(tg<=F.estrelas.turnos):0,cp=camp()||novaCamp();
if(n>melhor(F.id))grava(F.id,n);cp.dia++;if(v&&!LIVRE&&F.conquista){cp.castelo=true;cp.espada=true}if(v&&!LIVRE&&F.fragmento){cp.fragmentos=cp.fragmentos||[];if(!cp.fragmentos.includes(F.fragmento))cp.fragmentos.push(F.fragmento)}if(v&&!cp.venceu.includes(F.id))cp.venceu.push(F.id);const rec=recompensa(v,n,al);salvaCamp();if(typeof confereBatalha=='function')confereBatalha(v,n,vi,al.length);ovl.hidden=false;
ovl.innerHTML=`<div class="sc brief"><h2>${v?'Vitória!':'Derrota'}</h2><p>${LIVRE?(v?'A região está segura por enquanto. Os baús ficaram com vocês.':'Os inimigos levaram a melhor desta vez.'):v?F.fim.vitoria:F.fim.derrota}</p>${v?`<div class="big">${est(n)}</div><p class="stat">★ Vencer · ★ Ninguém do grupo cair · ★ Vencer em até ${F.estrelas.turnos} turnos</p>`:''}<p class="stat">Turnos do grupo: ${tg} · Aliados de pé: ${vi}/${al.length}</p>${rec}<div class="acts"><button id="mn">Menu</button><button id="rj"${v?'':' class="on"'}>${v?'Jogar de novo':'Tentar de novo'}</button><button id="mp"${v?' class="on"':''}>${v?'Voltar ao mapa':'Mapa'}</button></div></div>`;
$('mn').onclick=title;$('rj').onclick=start;$('mp').onclick=mapa;
if(v&&!LIVRE&&F.escolhaFinal&&typeof finalDaSaga=='function'){$('mp').textContent='A escolha final ➜';$('mp').onclick=finalDaSaga;$('rj').hidden=true}}
$('bt').onclick=title;
$('bf').hidden=!document.fullscreenEnabled;
$('bf').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{})};
document.addEventListener('fullscreenchange',()=>{$('bf').textContent=document.fullscreenElement?'Sair da tela cheia':'Tela cheia'});
new ResizeObserver(fit).observe(cv);fit();
garanteHerois();
fase(0);draw();intro();
