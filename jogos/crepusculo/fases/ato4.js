// ===================== ATO IV · A ÚLTIMA LUZ =====================
// A Cidadela do Eclipse flutua no vazio, presa por correntes colossais. Três batalhas finais e a escolha
// que muda o desfecho: devolver a Coroa da Aurora a Valdren ou destruí-la. Roteiro em HISTORIA.md.

REGIOES.eclipse={nome:'A Cidadela do Eclipse',fundo:pergaminhoEclipse};

// ---------- Forja dos Quatro: Isolda, Torvald, Zahra e Brannoc juntos, com o melhor que já fizeram ----------
Object.assign(ITENS,{
lamina_bastiao:{n:'Lâmina do Bastião',slot:'arma',atk:18,preco:3000,txt:'+18 Ataque',loja:'eclipse',para:['K6']},
arco_sete_ventos:{n:'Arco dos Sete Ventos',slot:'arma',atk:17,spd:3,preco:2950,txt:'+17 Ataque, +3 Velocidade',loja:'eclipse',para:['A6']},
grimorio_arcano:{n:'Grimório Arcano',slot:'arma',mag:19,mp:24,preco:3000,txt:'+19 Magia, +24 MP',loja:'eclipse',para:['M6']},
foice_ceifador:{n:'Foice do Ceifador',slot:'arma',atk:17,spd:3,preco:2950,txt:'+17 Ataque, +3 Velocidade',loja:'eclipse',para:['L6']},
cajado_profeta:{n:'Cajado do Profeta',slot:'arma',mag:19,mp:26,preco:3000,txt:'+19 Magia, +26 MP',loja:'eclipse',para:['C6']},
lanca_escamas:{n:'Lança de Escamas',slot:'arma',atk:18,spd:1,preco:3000,txt:'+18 Ataque, +1 Velocidade',loja:'eclipse',para:['R6']},
egide_aurora:{n:'Égide da Aurora',slot:'armadura',hp:60,preco:2600,txt:'+60 HP',loja:'eclipse',para:['K6','R6']},
veste_astral:{n:'Veste Astral',slot:'armadura',hp:36,mp:36,preco:2500,txt:'+36 HP, +36 MP',loja:'eclipse',para:['M6','C6']},
manto_noturno:{n:'Manto Noturno',slot:'armadura',hp:44,spd:3,preco:2500,txt:'+44 HP, +3 Velocidade',loja:'eclipse',para:['A6','L6']},
couraca_crepusculo:{n:'Couraça do Crepúsculo',slot:'armadura',hp:40,preco:1900,txt:'+40 HP',loja:'eclipse'},
anel_eclipse:{n:'Anel do Eclipse',slot:'acessorio',atk:6,mag:6,preco:2000,txt:'+6 Ataque, +6 Magia',loja:'eclipse'},
coracao_aurora:{n:'Coração da Aurora',slot:'acessorio',hp:30,mp:20,preco:2100,txt:'+30 HP, +20 MP',loja:'eclipse'},
asas_luz:{n:'Asas de Luz',slot:'acessorio',mov:1,jmp:2,spd:3,preco:2400,txt:'+1 Movimento, +2 Salto, +3 Velocidade',loja:'eclipse'},
olho_vazio:{n:'Olho do Vazio',slot:'acessorio',hp:10,spd:6,preco:1900,txt:'+10 HP, +6 Velocidade',loja:'eclipse'},
// Baús do Ato IV
estilhaco_eclipse:{n:'Estilhaço do Eclipse',slot:'acessorio',atk:5,mag:5,txt:'+5 Ataque, +5 Magia'},
po_estelar:{n:'Pó Estelar',slot:'acessorio',hp:16,mp:12,txt:'+16 HP, +12 MP'},
// Raros dos chefes do Ato IV
correntes_vorgath:{n:'Correntes de Vorgath',slot:'arma',atk:18,hp:10,txt:'+18 Ataque, +10 HP',raro:true,para:['K','R']},
cetro_ozrath:{n:'Cetro de Ozrath',slot:'arma',atk:6,mag:20,mp:30,txt:'+6 Ataque, +20 Magia, +30 MP',raro:true,para:['M','C']}});
Object.assign(VALOR_VENDA,{estilhaco_eclipse:500,po_estelar:480,correntes_vorgath:1500,cetro_ozrath:1600});
LOJAS.eclipse={nome:'Forja dos Quatro',spr:'P',fala:'Isolda, Torvald, Zahra e Brannoc, juntos pela primeira vez. Isto é o melhor que já forjamos. Façam valer.'};
const LOOT_ECLIPSE=['estilhaco_eclipse','po_estelar','pocao','pocao','pocao'];
ITENS.pocao.lojas.push('eclipse');

// ---------- Cenários de fundo ----------
Object.assign(FUNDOS,{
// O vazio: espaço violeta, nebulosa, estrelas e a Cidadela presa por correntes colossais
vazio(g,tk){const x0=VB.x-1600,w=VB.w+3200,top=VB.y-900;g.fillStyle='#07040e';g.fillRect(x0,top,w,3000);
for(const[nx,ny,r,c]of[[VB.x+VB.w*.2,VB.y+80,260,'90,30,120'],[VB.x+VB.w*.8,VB.y+220,300,'40,20,90']]){const n=g.createRadialGradient(nx,ny,10,nx,ny,r);n.addColorStop(0,`rgba(${c},.55)`);n.addColorStop(1,`rgba(${c},0)`);g.fillStyle=n;g.fillRect(nx-r,ny-r,r*2,r*2)}
for(let n=0;n<90;n++){g.fillStyle=`rgba(255,240,255,${.3+.4*Math.sin(tk/30+n*1.7)})`;g.fillRect(VB.x-200+((n*173)%(VB.w+400)),VB.y-100+((n*97)%(VB.h+200)),1.5,1.5)}
const cx=VB.x+VB.w/2,cy=VB.y-10;g.fillStyle='rgba(20,10,30,.95)';g.beginPath();g.moveTo(cx-140,cy+40);g.lineTo(cx-110,cy-30);g.lineTo(cx-80,cy-10);g.lineTo(cx-50,cy-90);g.lineTo(cx-20,cy-40);g.lineTo(cx,cy-130);g.lineTo(cx+20,cy-40);g.lineTo(cx+50,cy-90);g.lineTo(cx+80,cy-10);g.lineTo(cx+110,cy-30);g.lineTo(cx+140,cy+40);g.lineTo(cx+60,cy+90);g.lineTo(cx-60,cy+90);g.closePath();g.fill();
g.fillStyle=`rgba(255,90,200,${.5+.3*Math.sin(tk/20)})`;for(const[a,b]of[[-50,-60],[0,-95],[50,-60],[-20,10],[20,10]])g.fillRect(cx+a-2,cy+b,4,6);
g.strokeStyle='rgba(120,120,140,.6)';g.lineWidth=4;for(const s of[-1,1]){g.beginPath();g.moveTo(cx+s*120,cy+30);g.quadraticCurveTo(cx+s*260,cy+160,cx+s*420,cy+420);g.stroke()}g.lineWidth=1},
// Salão dos espelhos: estilhaços flutuando que refletem luz
espelhos(g,tk){const x0=VB.x-1600,w=VB.w+3200,top=VB.y-900;const c=g.createLinearGradient(0,top,0,VB.y+VB.h);c.addColorStop(0,'#0e0820');c.addColorStop(1,'#3a2a5a');g.fillStyle=c;g.fillRect(x0,top,w,3000);
for(let n=0;n<14;n++){const bx=VB.x+((n*137)%VB.w),by=VB.y-40+((n*61)%140)+Math.sin(tk/40+n)*8,s=10+(n%4)*8;g.save();g.translate(bx,by);g.rotate(Math.sin(tk/80+n)*.4);
const gr=g.createLinearGradient(-s,-s,s,s);gr.addColorStop(0,'rgba(220,210,255,.85)');gr.addColorStop(.5,'rgba(140,120,200,.6)');gr.addColorStop(1,'rgba(255,255,255,.9)');g.fillStyle=gr;g.beginPath();g.moveTo(0,-s);g.lineTo(s*.6,0);g.lineTo(0,s*1.2);g.lineTo(-s*.5,s*.2);g.closePath();g.fill();g.restore()}
for(let i=0;i<5;i++){g.fillStyle=`rgba(200,160,255,${.06+.04*Math.sin(tk/30+i)})`;g.fillRect(VB.x+i*VB.w/5+20,VB.y-200,40,VB.h+400)}},
// O trono do Eclipse: o eclipse colossal e, acima dele, a Coroa da Aurora refeita brilhando
trono(g,tk){const x0=VB.x-1600,w=VB.w+3200,top=VB.y-900;const c=g.createLinearGradient(0,top,0,VB.y+VB.h);c.addColorStop(0,'#05020a');c.addColorStop(.6,'#2a0a2a');c.addColorStop(1,'#5a1a2a');g.fillStyle=c;g.fillRect(x0,top,w,3000);
const cx=VB.x+VB.w/2,cy=VB.y+60,p=1+.05*Math.sin(tk/18);
for(let i=0;i<24;i++){const a=i/24*Math.PI*2+tk/300,r2=(170+30*Math.sin(tk/12+i))*p;g.strokeStyle='rgba(255,120,40,.3)';g.lineWidth=6;g.beginPath();g.moveTo(cx+Math.cos(a)*90,cy+Math.sin(a)*90);g.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2);g.stroke()}g.lineWidth=1;
const co=g.createRadialGradient(cx,cy,70,cx,cy,170*p);co.addColorStop(0,'rgba(255,180,60,.9)');co.addColorStop(.35,'rgba(255,70,40,.5)');co.addColorStop(1,'rgba(90,10,40,0)');g.fillStyle=co;g.fillRect(cx-200,cy-200,400,400);
g.fillStyle='#030104';g.beginPath();g.arc(cx,cy,78,0,7);g.fill();
const kx=cx+190,ky=VB.y+40+Math.sin(tk/25)*4,kb=g.createRadialGradient(kx,ky,4,kx,ky,60);kb.addColorStop(0,'rgba(255,240,170,.8)');kb.addColorStop(1,'rgba(255,240,170,0)');g.fillStyle=kb;g.fillRect(kx-60,ky-60,120,120);
g.fillStyle='#ffd45a';g.fillRect(kx-22,ky,44,8);for(const[a,h]of[[-22,10],[-11,16],[0,22],[11,16],[22,10]]){g.beginPath();g.moveTo(kx+a-5,ky);g.lineTo(kx+a,ky-h);g.lineTo(kx+a+5,ky);g.closePath();g.fill()}
g.fillStyle='#ff5a5a';g.fillRect(kx-2,ky-14,4,4);g.fillStyle='#7ad0ff';g.fillRect(kx-13,ky-8,3,3);g.fillStyle='#7ad06a';g.fillRect(kx+10,ky-8,3,3)}});

// ---------- Fase 13 ----------
// Três plataformas no vazio: a dos heróis (embaixo), a do meio (com pedras rachadas que caem) e a dos portões.
const PORTOES_ALT=(x,y)=>y<=2&&x>=2&&x<=8?3:y==3&&x==5?2:y>=4&&y<=6&&x>=1&&x<=9?2:y==7&&(x==2||x==8)?1:y>=8&&x>=2&&x<=8?1:0;
const QUADRO=f=>[...Array(11)].map((_,y)=>[...Array(11)].map((_,x)=>f(x,y)).join(''));
FASES.push({
id:'portoes-do-eclipse',
musica:'cidadela',
fundo:'vazio',
nome:'Fase 13 · Os Portões do Eclipse',
historia:['Com os três Fragmentos da Aurora, a Coroa renasce nas mãos dos heróis. No mesmo instante, o céu se rasga: a Cidadela do Eclipse aparece flutuando no vazio, presa ao mundo por correntes colossais.',
'Para chegar a Ozrath, é preciso atravessar os Portões, guardados pelo General Vorgath, o Portador das Correntes. As plataformas de pedra estão rachadas e podem cair no vazio a qualquer momento.'],
objetivo:'Derrote o General Vorgath.',
vitoria:'lider',
dica:'O vazio não tem chão: só as Bestas do Vazio voam por cima dele. As pedras rachadas da plataforma do meio vão piscar em vermelho e depois cair: quem estiver em cima perde 25% da vida.',
desaba:{aviso:12,em:18},
mapa:{
alt:QUADRO(PORTOES_ALT),
ter:QUADRO((x,y)=>{const h=PORTOES_ALT(x,y);if(!h)return'z';if((y==7&&(x==2||x==8))||(y==3&&x==5))return'j';if(y==5&&x>=3&&x<=7)return'f';return'h'}),
// Q: correntes colossais. P: colunas. Y: braseiros acesos.
obj:QUADRO((x,y)=>(x==1&&y==4)||(x==9&&y==4)?'Q':(x==2&&y==0)||(x==8&&y==0)?'P':(x==3&&y==8)||(x==7&&y==8)?'Q':'.')},
grupo:[[4,9],[5,9],[6,9],[4,10],[5,10],[6,10]],
inimigos:[
{k:'Bv',x:1,y:6,nome:'Besta do Vazio'},
{k:'Bv',x:9,y:6,nome:'Besta do Vazio 2'},
{k:'Ce',x:4,y:4,nome:'Cavaleiro do Eclipse',alerta:3},
{k:'Ce',x:6,y:4,nome:'Cavaleiro do Eclipse 2',alerta:3},
{k:'Av',x:3,y:1,nome:'Atirador do Vazio',alerta:4},
{k:'Av',x:7,y:1,nome:'Atirador do Vazio 2',alerta:4},
{k:'Fe',x:5,y:0,nome:'Feiticeiro do Eclipse',alerta:5},
{k:'Ce',x:5,y:1,nome:'General Vorgath',lider:true,hp:300,atk:36,alerta:4,drop:'correntes_vorgath'}],
aleatorios:[{k:'Ce',nome:'Cavaleiro do Eclipse'},{k:'Av',nome:'Atirador do Vazio'},{k:'Fe',nome:'Feiticeiro do Eclipse'},{k:'Bv',nome:'Besta do Vazio'}],
loot:LOOT_ECLIPSE,
falas:{
inicio:[['General Vorgath','Então os ladrões de fragmentos trouxeram a Coroa até a porta do mestre. Que gentileza.'],
['heroi0','Saia do caminho, Vorgath. Isto termina hoje.'],
['General Vorgath','Estas correntes prendem a Cidadela ao mundo. Eu as carrego há mil anos. Vocês não vão passar.']],
'acorda:General Vorgath':[['General Vorgath','Correntes, apertem! Que o vazio engula cada um deles!']],
'ferido:General Vorgath':[['General Vorgath','Mil anos de guarda... e são vocês que vão me libertar?']],
vitoria:[['General Vorgath','As correntes... se soltam. Estou livre, enfim. Ozrath espera no Salão das Sombras, atrás dos espelhos.'],
['General Vorgath','Cuidado: lá dentro, vocês vão lutar contra o pior inimigo de todos. Vocês mesmos.'],
['heroi1','Atrás dos espelhos, então.']],
derrota:[['General Vorgath','O vazio não devolve ninguém.']]},
tutorial:[['dica','Bem-vindos ao Ato IV! No Acampamento da Aurora, os quatro ferreiros do mundo se uniram na Forja dos Quatro: lá estão os melhores equipamentos do jogo.'],
['dica','As pedras rachadas (mais avermelhadas) da plataforma do meio vão piscar e depois cair no vazio. Atravessem rápido ou esperem elas caírem.'],
['dica','As Bestas do Vazio voam por cima do nada e podem atacar por qualquer lado. Protejam magos e arqueiros.']],
fim:{vitoria:'Vorgath cai de joelhos e as correntes colossais se partem com um estrondo. Os Portões do Eclipse se abrem para um salão cheio de espelhos.',
derrota:'A plataforma treme e os heróis recuam pelas pontes de correntes. Os Portões continuam fechados.'},
ouro:3200,
estrelas:{turnos:46}
});

// ---------- Fase 14 ----------
// Salão das Sombras: no começo da batalha, cada herói ganha uma cópia sombria do outro lado do salão.
FASES.push({
id:'salao-das-sombras',
musica:'cidadela',
fundo:'espelhos',
nome:'Fase 14 · O Salão das Sombras',
historia:['Atrás dos Portões, um salão de espelhos sem fim. No centro, o Espelho Colossal de Ozrath reflete não o que os heróis são, mas o que eles temem ser.',
'Quando a batalha começa, cada herói ganha uma sombra: uma cópia com as mesmas armas, a mesma força e a mesma vontade de vencer.'],
objetivo:'Derrote todas as sombras e os guardiões.',
dica:'Cada herói que entra na luta cria uma Sombra do outro lado do salão, quase tão forte quanto ele. Pensem bem em quem levar: a sua formação também vira a formação do inimigo.',
espelho:true,
mapa:{
alt:QUADRO((x,y)=>x>=4&&x<=6&&y>=3&&y<=6?2:1),
ter:QUADRO((x,y)=>x>=4&&x<=6&&y>=3&&y<=6?'h':'l'),
// W: o Espelho Colossal (ocupa 2×2; '#' marca o resto). G: estilhaços de cristal.
obj:QUADRO((x,y)=>x==6&&y==5?'W':(x==5&&y==4)||(x==6&&y==4)||(x==5&&y==5)?'#':(x==1&&y==3)||(x==9&&y==7)||(x==1&&y==7)||(x==9&&y==3)?'G':'.')},
grupo:[[4,9],[5,9],[6,9],[4,10],[5,10],[6,10]],
inimigos:[
{k:'Fe',x:2,y:5,nome:'Guardião do Espelho',hp:110,alerta:3},
{k:'Fe',x:8,y:5,nome:'Guardião do Espelho 2',hp:110,alerta:3}],
aleatorios:[{k:'Fe',nome:'Guardião do Espelho'},{k:'Av',nome:'Atirador do Vazio'}],
loot:LOOT_ECLIPSE,
falas:{
inicio:[['Ozrath','(A voz vem de todos os espelhos) Vocês derrotaram meus Arautos, um por um. Mas e quando o inimigo for igual a vocês?'],
['heroi0','Sombras ou não, nós vamos passar.'],
['Ozrath','Então lutem. Contra o próprio reflexo.']],
vitoria:[['heroi2','As sombras... se desfizeram. Éramos nós mesmos, e mesmo assim vencemos.'],
['Ozrath','(O Espelho Colossal racha de ponta a ponta) Impressionante. Venham, então. O Trono do Eclipse espera. E tragam a Coroa.'],
['heroi1','Está na hora.']],
derrota:[['Ozrath','Vencidos pelo próprio reflexo. Que poético.']]},
tutorial:[['dica','Neste salão, cada herói que entrar na batalha ganha uma Sombra do outro lado, com quase a mesma força, as mesmas armas e o mesmo jeito de lutar.'],
['dica','Dica: as Sombras não usam as habilidades especiais dos heróis. Usem as suas!']],
fim:{vitoria:'O Espelho Colossal se parte em mil estilhaços. Atrás dele, uma escadaria de luz sobe até o Trono do Eclipse.',
derrota:'As Sombras vencem, e os heróis acordam do lado de fora dos espelhos, sem saber o que era real.'},
ouro:3500,
estrelas:{turnos:40}
});
// Cria as Sombras: cópias dos heróis em campo, espelhadas do outro lado do mapa.
function criaSombras(){const D=DIF[dif()];for(const h of U.filter(u=>!u.team&&u.hp>0)){let x=h.x,y=N-1-h.y;
if(!livre(x,y)||at(x,y)){let m=null,md=1e9;for(let yy=0;yy<N;yy++)for(let xx=0;xx<N;xx++){if(!livre(xx,yy)||at(xx,yy))continue;const d=dist(xx,yy,x,y);if(d<md){md=d;m=[xx,yy]}}if(!m)continue;[x,y]=m}
const s=mk(h.k,1,x,y,'Sombra de '+h.name,{hp:Math.round(h.mhp*.85*D.hp),atk:Math.max(1,Math.round(h.atk*.9*D.atk)),mp:h.mmp,mag:h.mag||0,mov:h.mov,jmp:h.jmp,spd:h.spd,rng:h.rng,min:h.min,costas:h.costas,duplo:h.duplo,voa:h.voa,sombra:true});
s.mhp=s.hp;s.ct=40;U.push(s)}msg('Do outro lado do salão, as Sombras dos heróis tomam forma!');sfx('crit')}

// ---------- Fase 15 ----------
// Plataforma redonda no vazio, em degraus até o trono no centro.
const RAIO=(x,y)=>Math.hypot(x-5,y-5);
const TRONO_ALT=(x,y)=>{const r=RAIO(x,y);return r>5.3?0:r<=1.5?4:r<=3.2?3:2};
FASES.push({
id:'trono-do-eclipse',
musica:'eclipse',
fundo:'trono',
nome:'Fase 15 · O Trono do Eclipse',
historia:['No topo da Cidadela, sob um eclipse do tamanho do céu, Ozrath espera no Trono do Eclipse. A Coroa da Aurora, refeita, brilha nas mãos dos heróis e chama pelo sol.',
'Esta é a última batalha. Ozrath não vai cair uma vez só: ele guarda três formas, e a última é o próprio Eclipse.'],
objetivo:'Derrote Ozrath em todas as suas formas.',
vitoria:'lider',
dica:'Ozrath tem três formas. Na última, O Eclipse Vivo recebe só metade do dano enquanto houver Olhos do Vazio. O raio do Eclipse marca linhas em vermelho: saiam delas a tempo.',
feixe:{dano:30,nome:'O Eclipse',de:'do Eclipse'},
escolhaFinal:true,
mapa:{
alt:QUADRO(TRONO_ALT),
ter:QUADRO((x,y)=>{const h=TRONO_ALT(x,y);return!h?'z':h==4?'u':'h'}),
obj:QUADRO((x,y)=>(x==2&&y==2)||(x==8&&y==2)||(x==2&&y==8)||(x==8&&y==8)?'P':(x==1&&y==5)||(x==9&&y==5)?'Q':'.')},
grupo:[[4,10],[5,10],[6,10],[4,9],[5,9],[6,9]],
inimigos:[
{k:'OE',x:3,y:3,nome:'Olho do Vazio',alerta:3},
{k:'OE',x:7,y:3,nome:'Olho do Vazio 2',alerta:3},
{k:'OE',x:3,y:7,nome:'Olho do Vazio 3'},
{k:'OE',x:7,y:7,nome:'Olho do Vazio 4'},
{k:'Ce',x:4,y:6,nome:'Guarda do Trono',alerta:3},
{k:'Ce',x:6,y:6,nome:'Guarda do Trono 2',alerta:3},
{k:'Fe',x:5,y:2,nome:'Feiticeiro do Eclipse',alerta:4},
{k:'Oz1',x:5,y:4,nome:'Ozrath',lider:true,mag:8,alerta:4,drop:'cetro_ozrath',
 transforma:{k:'Oz2',nome:'Ozrath, o Arauto Supremo',hp:320,mp:60,atk:38,mov:4,jmp:4,spd:13,
  transforma:{k:'Oz3',nome:'O Eclipse Vivo',hp:380,mp:80,atk:34,mov:0,jmp:0,spd:12}}}],
aleatorios:[{k:'Ce',nome:'Cavaleiro do Eclipse'},{k:'Av',nome:'Atirador do Vazio'},{k:'Fe',nome:'Feiticeiro do Eclipse'},{k:'OE',nome:'Olho do Vazio'},{k:'Bv',nome:'Besta do Vazio'}],
loot:LOOT_ECLIPSE,
falas:{
inicio:[['Ozrath','Finalmente. Os que juntaram os fragmentos, os que refizeram a Coroa... e os que vão me entregá-la.'],
['heroi0','A Coroa da Aurora não é sua, Ozrath. Nem de ninguém que queira apagar o sol.'],
['Ozrath','Eu fui o primeiro guardião da Coroa, há mil anos. Vi reis lutarem por ela, roubarem, matarem. A luz nunca foi de todos. Então eu escolhi a escuridão.'],
['heroi2','Então hoje a escolha muda.']],
'acorda:Ozrath':[['Ozrath','Olhos do Vazio, abram-se! Que o Eclipse veja tudo!']],
'transforma:Oz2':[['Ozrath','Vocês são fortes... mas eu carrego o Eclipse dentro de mim!'],
['Ozrath, o Arauto Supremo','CURVEM-SE DIANTE DA NOITE ETERNA!'],
['heroi1','Ele ainda tem mais poder!']],
'transforma:Oz3':[['Ozrath, o Arauto Supremo','Se eu não posso ter a luz... ENTÃO EU SEREI O ECLIPSE!'],
['O Eclipse Vivo','...'],
['heroi0','Os Olhos do Vazio protegem o Eclipse! Derrubem os Olhos primeiro!']],
'ferido:O Eclipse Vivo':[['heroi2','A Coroa está brilhando mais forte! O Eclipse está rachando!']],
vitoria:[['Ozrath','(Uma luz fraca onde estava o Eclipse) Mil anos... e a luz volta. Talvez eu estivesse errado. Ou talvez vocês ainda não tenham escolhido.'],
['Ozrath','A Coroa está nas suas mãos agora. Devolvam-na a um trono... ou libertem a luz de vez. A escolha é de vocês.'],
['heroi0','Acabou. O Eclipse acabou.']],
derrota:[['Ozrath','A noite é eterna. E vocês fazem parte dela agora.']]},
tutorial:[['dica','A batalha final! Ozrath tem três formas: cada vez que cai, volta mais forte. Guardem poções, MP e habilidades de 1 vez por batalha para o fim.'],
['dica','O raio do Eclipse marca uma linha em vermelho e, uma rodada depois, a atinge. Na última forma, os Olhos do Vazio protegem o Eclipse: enquanto houver Olhos, ele recebe metade do dano.']],
fim:{vitoria:'O Eclipse se desfaz em luz. Pela primeira vez em anos, o sol aparece sobre todos os reinos ao mesmo tempo. Nas mãos dos heróis, a Coroa da Aurora espera uma decisão.',
derrota:'O Eclipse cobre o trono e a Coroa perde o brilho. Os heróis recuam, mas a luz ainda não se apagou de todo.'},
ouro:5000,
estrelas:{turnos:56}
});

// ---------- A escolha final e o epílogo ----------
const FINAIS={
devolver:{t:'A Coroa volta ao trono',cor:'#ffd45a',
p:['Os heróis atravessam o mundo de volta e colocam a Coroa da Aurora no trono de Valdren. Quando ela toca a pedra, o sol nasce de verdade, pela primeira vez em anos.',
'A luz se espalha de reino em reino: o gelo de Gelheim brilha, as areias de Areth voltam a dourar, o mar de Maré-Alta reflete o céu. Por todo lado, há festa.',
'Valdren jura proteger a Coroa para sempre, e os heróis viram lenda. Mas, nas sombras de um palácio distante, alguém já olha para o trono com cobiça...',
'A paz voltou. Quanto tempo ela vai durar depende de quem guardar a luz.']},
destruir:{t:'A luz é libertada',cor:'#7ad0ff',
p:['No alto da Cidadela, os heróis erguem a Espada Celestial e partem a Coroa da Aurora ao meio. Por um instante, tudo fica em silêncio.',
'Então a luz se espalha em mil fragmentos e cai como chuva sobre o mundo. Cada reino recebe um pedaço do sol: azul em Gelheim, dourado em Areth, prateado em Maré-Alta, branco em Valdren.',
'Nenhum reino depende mais de um único objeto. Nenhum tirano pode roubar a luz de novo, porque agora ela pertence a todos.',
'A Cidadela do Eclipse se desfaz no céu. O mundo é diferente, mais livre e mais incerto. Mas é de todos.']}};
function finalDaSaga(){parar();if(typeof tocar=='function')tocar('celestial');const c=camp();ovl.hidden=false;
ovl.innerHTML=`<div class="sc brief escolha"><h2>A escolha final</h2><p>O Eclipse caiu. A Coroa da Aurora brilha nas mãos dos heróis, quente como o sol. O que eles vão fazer com ela?</p>
<div class="opcoes-final"><button data-f="devolver"><b>👑 Devolver a Coroa a Valdren</b><span>O sol volta como antes, protegido por um trono.</span></button>
<button data-f="destruir"><b>⚔ Destruir a Coroa</b><span>A luz se espalha e passa a ser de todos os reinos.</span></button></div></div>`;
ovl.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{c.final=b.dataset.f;salvaCamp();if(typeof confereFinal=='function')confereFinal(b.dataset.f);sfx('win');epilogo(b.dataset.f)})}
function epilogo(id){const f=FINAIS[id],nomes=(camp().herois||[]).map(h=>h.nome);
ovl.innerHTML=`<div class="epilogo"><div class="ep-ceu" style="--cor:${f.cor}"></div><div class="ep-texto"><h2>${f.t}</h2>${f.p.map(t=>`<p class="ep-p">${t}</p>`).join('')}</div>
<div class="creditos"><div class="rolo"><h1 class="logo">Crepúsculo dos Reinos</h1><p class="ct">Fim da saga</p>
<p><b>Os heróis</b><br>${nomes.join(' · ')}</p><p><b>Criação e direção</b><br>Hebersonmiliano</p><p><b>Desenvolvido com</b><br>Claude Code</p>
<p><b>Obrigado por jogar!</b></p><p class="ct">A jornada continua: as batalhas livres esperam por vocês.<br>E dizem que, sob o mundo, um Abismo Sem Fim aguarda os mais corajosos...</p></div></div>
<div class="acts ep-acts"><button id="epm" class="on">Continuar a jornada</button></div></div>`;$('epm').onclick=mapa;
// O céu clareia, os parágrafos aparecem um por um e depois os créditos sobem.
setTimeout(()=>ovl.querySelector('.ep-ceu').classList.add('claro'),100);ovl.querySelectorAll('.ep-p').forEach((p,i)=>setTimeout(()=>p.classList.add('on'),1000+i*3000));
setTimeout(()=>{const r=ovl.querySelector('.rolo');if(r)r.classList.add('sobe')},1000+f.p.length*3000)}

// ---------- Lugares ----------
// O Portal do Eclipse (Valdren) abre depois do Farol Afogado e leva à Cidadela.
LUGARES.push({id:'portal',regiao:'valdren',nome:'Portal do Eclipse',tipo:'passagem',para:'eclipse',chegada:'acampamento',de:'trono',requer:'farol-afogado',x:870,y:110,sub:'A passagem para a Cidadela'},
{id:'acampamento',regiao:'eclipse',nome:'Acampamento da Aurora',tipo:'vila',loja:'eclipse',x:300,y:580,sub:'O último acampamento antes da Cidadela'},
{id:'portal-volta',regiao:'eclipse',nome:'Portal de Volta',tipo:'passagem',para:'valdren',chegada:'portal',de:'acampamento',x:120,y:450,sub:'De volta a Valdren'},
{id:'portoes',regiao:'eclipse',nome:'Portões do Eclipse',tipo:'batalha',fase:'portoes-do-eclipse',de:'acampamento',x:560,y:450},
{id:'salao',regiao:'eclipse',nome:'Salão das Sombras',tipo:'batalha',fase:'salao-das-sombras',de:'portoes',x:800,y:330},
{id:'trono-eclipse',regiao:'eclipse',nome:'Trono do Eclipse',tipo:'batalha',fase:'trono-do-eclipse',de:'salao',x:1040,y:200});

// ---------- Mapa da Cidadela: pergaminho escuro com a fortaleza flutuante ----------
function pergaminhoEclipse(x,t){x.fillStyle='#2a2036';x.fillRect(0,0,1280,720);
const n=x.createRadialGradient(900,220,20,900,220,520);n.addColorStop(0,'rgba(140,60,160,.45)');n.addColorStop(1,'rgba(140,60,160,0)');x.fillStyle=n;x.fillRect(0,0,1280,720);
for(let i=0;i<120;i++){x.fillStyle=`rgba(255,240,255,${.3+.4*Math.sin(t*1.5+i)})`;x.fillRect((i*173)%1280,(i*97)%720,1.5,1.5)}
x.strokeStyle='rgba(200,170,230,.12)';for(let i=0;i<16;i++){const a=i*Math.PI/8;x.beginPath();x.moveTo(480,260);x.lineTo(480+Math.cos(a)*1600,260+Math.sin(a)*1600);x.stroke()}
// A Cidadela flutuando, com correntes descendo até o chão
const cx=1040,cy=150,b=Math.sin(t)*4;x.fillStyle='rgba(15,8,24,.95)';x.beginPath();x.moveTo(cx-90,cy+30+b);x.lineTo(cx-70,cy-20+b);x.lineTo(cx-40,cy+b);x.lineTo(cx-20,cy-70+b);x.lineTo(cx,cy-30+b);x.lineTo(cx+20,cy-70+b);x.lineTo(cx+40,cy+b);x.lineTo(cx+70,cy-20+b);x.lineTo(cx+90,cy+30+b);x.lineTo(cx+30,cy+70+b);x.lineTo(cx-30,cy+70+b);x.closePath();x.fill();
x.strokeStyle='rgba(160,160,180,.6)';x.lineWidth=3;for(const s of[-1,1]){x.beginPath();x.moveTo(cx+s*70,cy+40+b);x.quadraticCurveTo(cx+s*160,cy+200,cx+s*200,cy+400);x.stroke()}x.lineWidth=1;
x.fillStyle=`rgba(255,90,200,${.5+.3*Math.sin(t*2)})`;for(const[a,c]of[[-20,-50],[20,-50],[0,0]])x.fillRect(cx+a-2,cy+c+b,4,6);
// Terreno arrasado embaixo
x.fillStyle='rgba(60,40,70,.6)';x.beginPath();x.moveTo(0,620);for(let i=0;i<=32;i++)x.lineTo(i*40,620-Math.abs(Math.sin(i*1.3))*40);x.lineTo(1280,720);x.lineTo(0,720);x.closePath();x.fill();
x.save();x.translate(480,260);for(let i=0;i<8;i++){x.rotate(Math.PI/4);x.fillStyle=i%2?'rgba(180,140,220,.55)':'rgba(120,80,160,.65)';x.beginPath();x.moveTo(0,0);x.lineTo(8,0);x.lineTo(0,i%2?-38:-58);x.lineTo(-8,0);x.closePath();x.fill()}x.restore();
x.fillStyle='rgba(220,200,240,.7)';x.font='700 16px Georgia,serif';x.textAlign='center';x.fillText('N',480,188);
x.fillStyle='rgba(220,200,240,.35)';x.font='italic 700 46px "Alegreya SC",Georgia,serif';x.fillText('A Cidadela do Eclipse',600,100);
x.font='italic 22px "Alegreya Sans",Georgia,serif';x.fillText('Terras Arrasadas',300,680);x.fillText('O Vazio',700,560)}
