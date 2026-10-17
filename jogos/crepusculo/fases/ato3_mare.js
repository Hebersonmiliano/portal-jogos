// ===================== ATO III · O ECLIPSE — ARQUIPÉLAGO DE MARÉ-ALTA =====================
// Última região do Ato III: batalhas entre navios, a maré que sobe e cobre o mapa, o Farol Afogado
// e o Kraken Abissal. Ao vencer, o grupo reúne os três Fragmentos da Aurora. Roteiro em HISTORIA.md.

REGIOES.mare={nome:'Arquipélago de Maré-Alta',fundo:pergaminhoMar};

// ---------- Armazém do Porto: equipamentos inéditos, para as classes do nível 30 e peças para todos ----------
Object.assign(ITENS,{
espada_campeao:{n:'Espada do Campeão',slot:'arma',atk:15,preco:2100,txt:'+15 Ataque',loja:'mare',para:['K5']},
arco_tritao:{n:'Arco do Tritão',slot:'arma',atk:14,spd:2,preco:2050,txt:'+14 Ataque, +2 Velocidade',loja:'mare',para:['A5']},
cetro_mares:{n:'Cetro das Marés',slot:'arma',mag:16,mp:18,preco:2100,txt:'+16 Magia, +18 MP',loja:'mare',para:['M5']},
adagas_coral:{n:'Adagas de Coral Negro',slot:'arma',atk:14,spd:3,preco:2050,txt:'+14 Ataque, +3 Velocidade',loja:'mare',para:['L5']},
baculo_bispo:{n:'Báculo Episcopal',slot:'arma',mag:16,mp:20,preco:2100,txt:'+16 Magia, +20 MP',loja:'mare',para:['C5']},
lanca_dragonaria:{n:'Lança Dragonária',slot:'arma',atk:15,spd:1,preco:2100,txt:'+15 Ataque, +1 Velocidade',loja:'mare',para:['R5']},
couraca_abissal:{n:'Couraça Abissal',slot:'armadura',hp:48,preco:1800,txt:'+48 HP',loja:'mare',para:['K5','R5']},
manto_mares:{n:'Manto das Marés',slot:'armadura',hp:28,mp:28,preco:1750,txt:'+28 HP, +28 MP',loja:'mare',para:['M5','C5']},
casaco_corsario:{n:'Casaco de Corsário',slot:'armadura',hp:36,spd:2,preco:1750,txt:'+36 HP, +2 Velocidade',loja:'mare',para:['A5','L5']},
colete_marujo:{n:'Colete de Marujo',slot:'armadura',hp:32,preco:1200,txt:'+32 HP',loja:'mare'},
perola_negra:{n:'Pérola Negra',slot:'acessorio',mag:6,mp:20,preco:1300,txt:'+6 Magia, +20 MP',loja:'mare'},
anel_almirante:{n:'Anel do Almirante',slot:'acessorio',atk:5,hp:14,preco:1300,txt:'+5 Ataque, +14 HP',loja:'mare'},
bussola_estelar:{n:'Bússola Estelar',slot:'acessorio',mov:1,spd:3,preco:1400,txt:'+1 Movimento, +3 Velocidade',loja:'mare'},
amuleto_coral:{n:'Amuleto de Coral',slot:'acessorio',hp:20,spd:2,preco:1200,txt:'+20 HP, +2 Velocidade',loja:'mare'},
// Baús de Maré-Alta
concha_brilhante:{n:'Concha Brilhante',slot:'acessorio',mag:4,mp:8,txt:'+4 Magia, +8 MP'},
dente_tubarao:{n:'Dente de Tubarão',slot:'acessorio',atk:4,spd:1,txt:'+4 Ataque, +1 Velocidade'},
// Raros dos chefes de Maré-Alta
sabre_corvo:{n:'Sabre do Capitão Corvo',slot:'arma',atk:15,spd:2,txt:'+15 Ataque, +2 Velocidade',raro:true,para:['K','L']},
tridente_nerissa:{n:'Tridente de Nerissa',slot:'arma',atk:4,mag:16,mp:20,txt:'+4 Ataque, +16 Magia, +20 MP',raro:true,para:['M','C']}});
Object.assign(VALOR_VENDA,{concha_brilhante:380,dente_tubarao:380,sabre_corvo:1100,tridente_nerissa:1200});
LOJAS.mare={nome:'Almirante Brannoc',spr:'N',fala:'Tudo o que chega pelo mar passa pelo meu armazém. E o que eu tenho, nenhum outro porto do mundo tem.'};
const LOOT_MARE=['concha_brilhante','dente_tubarao','pocao','pocao','pocao'];
ITENS.pocao.lojas.push('mare');

// ---------- Cenários de fundo ----------
Object.assign(FUNDOS,{
// Mar em tempestade: céu de chumbo, relâmpagos, ondas gigantes e a silhueta de uma serpente marinha
tempestade(g,tk){const x0=VB.x-1600,w=VB.w+3200,top=VB.y-900,hz=VB.y+150,raio=(tk%240)<6;
const ceu=g.createLinearGradient(0,top,0,hz+300);ceu.addColorStop(0,raio?'#9aa8c0':'#1a2230');ceu.addColorStop(.6,raio?'#c0c8d8':'#3a4a5a');ceu.addColorStop(1,'#5a6e7a');g.fillStyle=ceu;g.fillRect(x0,top,w,2400);
for(let i=0;i<6;i++){g.fillStyle=`rgba(20,26,36,${.35+i*.05})`;g.beginPath();g.ellipse(VB.x+((i*190+tk*.2)%(VB.w+400))-200,VB.y-40+i*12,160,40,0,0,7);g.fill()}
if(raio){g.strokeStyle='#f4f8ff';g.lineWidth=3;g.beginPath();let lx=VB.x+VB.w*.3,ly=VB.y-80;g.moveTo(lx,ly);for(let i=0;i<6;i++){lx+=(i%2?-1:1)*18;ly+=26;g.lineTo(lx,ly)}g.stroke();g.lineWidth=1}
const sx=VB.x+VB.w*.75,sy=hz-30;g.strokeStyle='rgba(20,30,40,.75)';g.lineWidth=18;for(let i=0;i<3;i++){g.beginPath();g.arc(sx-80+i*70,sy+20,30,Math.PI,0);g.stroke()}g.beginPath();g.moveTo(sx+150,sy+20);g.quadraticCurveTo(sx+170,sy-60,sx+200,sy-50);g.stroke();g.lineWidth=1;
for(let i=0;i<4;i++){g.fillStyle=`rgba(${40+i*10},${70+i*12},${90+i*12},.8)`;g.beginPath();g.moveTo(x0,hz+i*24);for(let x=x0;x<=x0+w;x+=30)g.lineTo(x,hz+i*24+Math.sin(x/70+tk/25+i)*(14-i*2));g.lineTo(x0+w,hz+2000);g.lineTo(x0,hz+2000);g.closePath();g.fill()}},
// Noite no mar: lua gigante, estrelas, reflexo prateado e tentáculos colossais saindo da água
lua(g,tk){const x0=VB.x-1600,w=VB.w+3200,top=VB.y-900,hz=VB.y+160;
const ceu=g.createLinearGradient(0,top,0,hz+300);ceu.addColorStop(0,'#05081a');ceu.addColorStop(.6,'#142048');ceu.addColorStop(1,'#2a3a6a');g.fillStyle=ceu;g.fillRect(x0,top,w,2400);
for(let n=0;n<60;n++){g.fillStyle=`rgba(255,255,255,${.4+.4*Math.sin(tk/25+n)})`;g.fillRect(VB.x+((n*137)%VB.w),VB.y-80+((n*71)%200),1.5,1.5)}
const mx=VB.x+VB.w*.22,my=VB.y+20,br=g.createRadialGradient(mx,my,30,mx,my,180);br.addColorStop(0,'rgba(220,230,255,.5)');br.addColorStop(1,'rgba(220,230,255,0)');g.fillStyle=br;g.fillRect(mx-190,my-190,380,380);
g.fillStyle='#e8ecf8';g.beginPath();g.arc(mx,my,70,0,7);g.fill();g.fillStyle='rgba(170,180,210,.6)';for(const[a,b,r]of[[-20,-12,12],[18,10,16],[-8,26,9],[30,-24,7]]){g.beginPath();g.arc(mx+a,my+b,r,0,7);g.fill()}
for(const[tx,s]of[[VB.x+VB.w*.62,1],[VB.x+VB.w*.88,.7]]){const b=Math.sin(tk/30+tx)*8;g.strokeStyle='rgba(30,14,40,.85)';g.lineWidth=16*s;g.beginPath();g.moveTo(tx,hz+30);g.bezierCurveTo(tx-40*s,hz-80*s,tx+50*s+b,hz-150*s,tx+10*s+b,hz-210*s);g.stroke()}g.lineWidth=1;
g.fillStyle='#1a2850';g.fillRect(x0,hz,w,2000);for(let i=0;i<30;i++){g.fillStyle=`rgba(220,230,255,${.25+.2*Math.sin(tk/12+i)})`;g.fillRect(mx-30+((i*13)%60)-i*2,hz+6+i*6,20+((i*7)%30),2)}}});

// ---------- Fase 11 ----------
FASES.push({
id:'frota-fantasma',
musica:'mar',
fundo:'tempestade',
nome:'Fase 11 · A Frota Fantasma',
historia:['Com dois fragmentos reunidos, a Espada Celestial aponta para o oeste, além do Mar do Poente: o Arquipélago de Maré-Alta, onde o mar inteiro obedece ao Eclipse.',
'O navio do grupo é cercado pela Frota Fantasma do Capitão Corvo. Os dois navios ficam presos a uma ilha de areia, e a maré não para de subir.'],
objetivo:'Derrote o Capitão Corvo.',
vitoria:'lider',
dica:'A maré sobe a cada 2 rodadas: a ilha vira água rasa e depois água funda. Quem começa o turno em água funda é arrastado pela correnteza. Os Marujos Afogados nadam.',
mare:{cada:12,max:3},
mapa:{
alt:['00222222200',
     '02333333320',
     '02333333320',
     '00222222200',
     '00000100000',
     '00011111000',
     '00011111000',
     '00000100000',
     '00222222200',
     '02222222220',
     '00222222200'],
ter:['aadddddddaa',
     'addddddddda',
     'addddddddda',
     'aadddddddaa',
     'aaaaapaaaaa',
     'aawsspsswaa',
     'aawsrpsswaa',
     'aaaaapaaaaa',
     'aadddddddaa',
     'addddddddda',
     'aadddddddaa'],
// V: mastro com vela. C: canhão.
obj:['...........',
     '...V...V...',
     '.C.......C.',
     '...........',
     '...........',
     '...........',
     '...........',
     '...........',
     '..C.....C..',
     '...V...V...',
     '...........']},
grupo:[[4,9],[5,9],[6,9],[4,8],[5,8],[6,8]],
inimigos:[
{k:'Ma',x:0,y:5,nome:'Marujo Afogado'},
{k:'Ma',x:10,y:5,nome:'Marujo Afogado 2'},
{k:'Pf',x:4,y:2,nome:'Pirata Fantasma',alerta:3},
{k:'Pf',x:6,y:2,nome:'Pirata Fantasma 2',alerta:3},
{k:'Ar',x:2,y:1,nome:'Arpoador',alerta:4},
{k:'Ar',x:8,y:1,nome:'Arpoador 2',alerta:4},
{k:'Bm',x:5,y:0,nome:'Bruxa do Mar',alerta:5},
{k:'Pf',x:5,y:1,nome:'Capitão Corvo',lider:true,hp:230,atk:30,alerta:4,drop:'sabre_corvo'}],
aleatorios:[{k:'Ma',nome:'Marujo Afogado'},{k:'Pf',nome:'Pirata Fantasma'},{k:'Ar',nome:'Arpoador'},{k:'Bm',nome:'Bruxa do Mar'}],
loot:LOOT_MARE,
falas:{
inicio:[['Capitão Corvo','Ha! Os famosos caçadores de fragmentos. A Arauta Nerissa paga bem pelas suas cabeças.'],
['heroi0','Saia do caminho, Corvo. Nerissa está afogando o arquipélago inteiro.'],
['Capitão Corvo','Um navio fantasma não tem nada a perder. Abordagem, marujos! E rezem para a maré não subir rápido.']],
'acorda:Capitão Corvo':[['Capitão Corvo','Todos ao convés! Ninguém sai vivo do meu mar!']],
'ferido:Capitão Corvo':[['Capitão Corvo','Esses aí não afundam fácil... Nerissa disse que seria um saque tranquilo!']],
vitoria:[['Capitão Corvo','Chega, chega! Eu me rendo. Nerissa vive no Farol Afogado, no centro do arquipélago.'],
['Capitão Corvo','Dizem que ela fez um pacto com a criatura que dorme no fundo do mar. Boa sorte. Vão precisar.'],
['heroi1','Para o Farol Afogado. O último fragmento está lá.']],
derrota:[['Capitão Corvo','Mais almas para a minha tripulação.']]},
tutorial:[['dica','Bem-vindos a Maré-Alta! No Porto fica o Armazém do Almirante Brannoc, com equipamentos para as classes do nível 30.'],
['dica','A maré sobe a cada 2 rodadas: primeiro a ilha do meio vira água rasa (anda devagar), depois água funda. Os navios e a passarela de madeira nunca afundam.'],
['dica','Quem começar o turno em água funda é arrastado pela correnteza e perde vida. Os Marujos Afogados nadam e podem atacar pelos lados dos navios!']],
fim:{vitoria:'O Capitão Corvo baixa a bandeira negra e a Frota Fantasma se desfaz na névoa. No horizonte, a luz do Farol Afogado pisca como um olho.',
derrota:'A maré engole a ilha e a abordagem falha. O navio do grupo foge para o porto, com o casco furado.'},
ouro:2300,
estrelas:{turnos:46}
});

// ---------- Fase 12 ----------
// Ilha em degraus ao redor do Farol (centro 5,4): 3 no meio, 2 em volta, 1 na borda; o cais fica embaixo.
const ILHA=(x,y)=>{if(y>=9&&x>=3&&x<=7)return 1;const d=Math.max(Math.abs(x-5),Math.abs(y-4));return y>=8||y<1?0:d<=1?3:d==2?2:d==3?1:0};
const MALHA=f=>[...Array(11)].map((_,y)=>[...Array(11)].map((_,x)=>f(x,y)).join(''));
FASES.push({
id:'farol-afogado',
musica:'kraken',
fundo:'lua',
nome:'Fase 12 · O Farol Afogado',
historia:['No centro de Maré-Alta, um farol colossal se ergue de um templo afundado. Lá, a Arauta Nerissa guarda o último fragmento da Coroa da Aurora.',
'Nerissa fez um pacto com o Kraken Abissal, que dorme sob o farol. Os tentáculos dele já cercam a ilha, e a maré sobe a cada rodada.'],
objetivo:'Derrote Nerissa, a Arauta das Marés.',
vitoria:'lider',
dica:'Os Tentáculos não se movem, mas atacam a até 2 casas. Enquanto houver tentáculos vivos, o Kraken recebe só metade do dano. A maré sobe: fiquem nos degraus mais altos.',
mare:{cada:12,max:3},
fragmento:'mar',
mapa:{
alt:MALHA(ILHA),
ter:MALHA((x,y)=>(y>=9&&x>=3&&x<=7)||(x==5&&y==8)?'p':ILHA(x,y)>=2?'e':ILHA(x,y)==1?'w':'a'),
// H: o Farol Afogado (ocupa 2×2; '#' marca o resto). P: colunas do templo.
obj:MALHA((x,y)=>x==6&&y==4?'H':(x==5&&y==3)||(x==6&&y==3)||(x==5&&y==4)?'#':(x==3&&y==3)||(x==7&&y==5)?'P':'.')},
grupo:[[4,10],[5,10],[6,10],[4,9],[5,9],[6,9]],
inimigos:[
{k:'TT',x:1,y:2,nome:'Tentáculo'},
{k:'TT',x:9,y:2,nome:'Tentáculo 2'},
{k:'TT',x:1,y:6,nome:'Tentáculo 3'},
{k:'TT',x:9,y:6,nome:'Tentáculo 4'},
{k:'Bm',x:3,y:4,nome:'Bruxa do Mar',alerta:3},
{k:'Bm',x:7,y:4,nome:'Bruxa do Mar 2',alerta:3},
{k:'Pf',x:4,y:6,nome:'Guarda do Farol',hp:100,alerta:3},
{k:'Pf',x:6,y:6,nome:'Guarda do Farol 2',hp:100,alerta:3},
{k:'Bm',x:5,y:5,nome:'Nerissa',lider:true,hp:190,mp:50,atk:15,mag:6,alerta:4,drop:'tridente_nerissa',transforma:{k:'KR',nome:'Kraken Abissal',hp:245,mp:40,atk:32,mov:0,jmp:0,spd:11}}],
aleatorios:[{k:'Ma',nome:'Marujo Afogado'},{k:'Pf',nome:'Pirata Fantasma'},{k:'Ar',nome:'Arpoador'},{k:'Bm',nome:'Bruxa do Mar'}],
loot:LOOT_MARE,
falas:{
inicio:[['Nerissa','Hrimvar congelado, Azhar em pedaços... e agora vocês vêm ao meu farol.'],
['heroi0','Nerissa, o arquipélago está se afogando. Devolva o último fragmento.'],
['Nerissa','O mar não devolve nada. E o que dorme lá embaixo está com muita fome.']],
'acorda:Nerissa':[['Nerissa','Marés, subam! Tentáculos, apertem a ilha!']],
transforma:[['Nerissa','Ozrath, cumpra o pacto! Que o abismo tome o meu lugar!'],
['Kraken Abissal','GRRROOOOOM...'],
['heroi1','O Kraken! Destruam os tentáculos, ou ele vai aguentar tudo!']],
'ferido:Kraken Abissal':[['heroi2','Está funcionando! Mais um pouco!']],
vitoria:[['Nerissa','(A voz ecoa das águas) O terceiro fragmento... está livre. O pacto se quebrou.'],
['heroi0','Os três Fragmentos da Aurora! A Coroa pode ser refeita!'],
['Ozrath','(Uma sombra cobre a lua) Então finalmente vamos nos encontrar. Venham até a Cidadela do Eclipse... e tragam a Coroa para mim.'],
['heroi2','É o fim do Ato III. Ozrath, estamos indo.']],
derrota:[['Nerissa','Bem-vindos ao fundo do mar.']]},
tutorial:[['dica','Os quatro Tentáculos ficam na água funda: não andam, mas atacam a até 2 casas. Arqueiros e magos alcançam eles da ilha.'],
['dica','Quando Nerissa cair, ela vira o Kraken Abissal. Enquanto houver tentáculos vivos, o Kraken recebe só metade do dano: derrube os tentáculos primeiro!'],
['dica','A maré sobe a cada 2 rodadas e cobre os degraus mais baixos. Lá no alto, perto do farol, é o lugar mais seguro.']],
fim:{vitoria:'O Kraken afunda para sempre e a maré baixa. O terceiro Fragmento da Aurora se une aos outros dois, e a Espada Celestial brilha como um sol. A Coroa da Aurora pode renascer... mas Ozrath espera na Cidadela do Eclipse.',
derrota:'A maré cobre a ilha e os tentáculos arrastam o navio para longe. Os heróis acordam no porto, encharcados.'},
ouro:2600,
estrelas:{turnos:50}
});

// ---------- Lugares ----------
// O Porto do Poente (Valdren) abre depois da Pirâmide do Sol Negro e leva a Maré-Alta.
LUGARES.push({id:'porto-poente',regiao:'valdren',nome:'Porto do Poente',tipo:'passagem',para:'mare',chegada:'porto-mare',de:'brumafria',requer:'piramide-do-sol-negro',x:70,y:470,sub:'Navios para o oeste'},
{id:'porto-mare',regiao:'mare',nome:'Porto de Maré-Alta',tipo:'vila',loja:'mare',x:330,y:560,sub:'O último porto livre'},
{id:'rota-leste',regiao:'mare',nome:'Rota do Leste',tipo:'passagem',para:'valdren',chegada:'porto-poente',de:'porto-mare',x:120,y:440,sub:'Navios de volta'},
{id:'frota',regiao:'mare',nome:'Frota Fantasma',tipo:'batalha',fase:'frota-fantasma',de:'porto-mare',x:640,y:440},
{id:'farol',regiao:'mare',nome:'Farol Afogado',tipo:'batalha',fase:'farol-afogado',de:'frota',x:980,y:240});

// ---------- Mapa de Maré-Alta: carta náutica com ilhas, recifes e o farol ----------
const PMAR=(()=>{let s=23;const r=()=>(s=(s*16807)%2147483647)/2147483647;
return{manchas:[...Array(20)].map(()=>({x:r()*1280,y:r()*720,r:40+r()*140,a:.05+r()*.08})),
ilhas:[[330,560,90,46],[980,250,70,40],[640,440,40,22],[820,560,50,24],[480,250,60,30],[1150,520,44,26],[180,300,40,20]],
ondas:[...Array(40)].map(()=>({x:r()*1280,y:r()*720}))}})();
function pergaminhoMar(x,t){x.fillStyle='#cfd8d0';x.fillRect(0,0,1280,720);
for(const m of PMAR.manchas){const g=x.createRadialGradient(m.x,m.y,4,m.x,m.y,m.r);g.addColorStop(0,`rgba(40,80,90,${m.a})`);g.addColorStop(1,'rgba(40,80,90,0)');x.fillStyle=g;x.fillRect(m.x-m.r,m.y-m.r,m.r*2,m.r*2)}
x.fillStyle='rgba(90,130,150,.35)';x.fillRect(0,0,1280,720);
x.strokeStyle='rgba(30,60,70,.18)';x.lineWidth=1;for(const[cx,cy]of[[1120,120],[160,140]])for(let n=0;n<16;n++){const a=n*Math.PI/8;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(a)*1600,cy+Math.sin(a)*1600);x.stroke()}
for(const o of PMAR.ondas){const b=Math.sin(t*1.5+o.x)*3;x.strokeStyle='rgba(30,60,80,.35)';x.lineWidth=1.5;x.beginPath();x.moveTo(o.x,o.y+b);x.quadraticCurveTo(o.x+8,o.y-5+b,o.x+16,o.y+b);x.quadraticCurveTo(o.x+24,o.y+5+b,o.x+32,o.y+b);x.stroke()}
for(const[ix,iy,w,h]of PMAR.ilhas){x.fillStyle='rgba(214,190,140,.9)';x.beginPath();x.ellipse(ix,iy,w,h,0,0,7);x.fill();x.strokeStyle='rgba(60,40,20,.6)';x.lineWidth=2;x.stroke();x.fillStyle='rgba(90,130,70,.6)';x.beginPath();x.ellipse(ix-w*.2,iy-h*.2,w*.45,h*.4,0,0,7);x.fill()}
// O farol no mapa
x.fillStyle='rgba(180,60,60,.8)';x.fillRect(975,185,10,40);x.fillStyle='rgba(250,240,200,.95)';x.fillRect(973,178,14,8);
const fl=.5+.5*Math.sin(t*2);x.fillStyle=`rgba(255,240,170,${.25*fl})`;x.beginPath();x.moveTo(980,182);x.lineTo(1100,140);x.lineTo(1100,220);x.closePath();x.fill();
// Serpente marinha decorativa
x.strokeStyle='rgba(30,50,60,.6)';x.lineWidth=6;for(let i=0;i<3;i++){x.beginPath();x.arc(760+i*40,330,16,Math.PI,0);x.stroke()}x.lineWidth=1;
x.save();x.translate(1120,120);for(let n=0;n<8;n++){x.rotate(Math.PI/4);x.fillStyle=n%2?'rgba(60,100,120,.55)':'rgba(20,50,60,.65)';x.beginPath();x.moveTo(0,0);x.lineTo(8,0);x.lineTo(0,n%2?-38:-58);x.lineTo(-8,0);x.closePath();x.fill()}x.restore();
x.fillStyle='rgba(20,50,60,.7)';x.font='700 16px Georgia,serif';x.textAlign='center';x.fillText('N',1120,48);
x.fillStyle='rgba(20,50,60,.42)';x.font='italic 700 50px "Alegreya SC",Georgia,serif';x.fillText('M a r é - A l t a',620,110);
x.font='italic 22px "Alegreya Sans",Georgia,serif';x.fillText('Mar das Serpentes',800,380);x.fillText('Recifes de Coral',1050,600)}
