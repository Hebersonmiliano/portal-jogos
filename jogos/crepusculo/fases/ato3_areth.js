// ===================== ATO III · O ECLIPSE — SULTANATO DE ARETH =====================
// Segunda região do Ato III: deserto, estruturas gigantes (Esfinge Colossal e a Pirâmide do Sol Negro)
// e cenários de fundo pintados (FUNDOS). O roteiro completo está em HISTORIA.md.

REGIOES.areth={nome:'Sultanato de Areth',fundo:pergaminhoAreia};

// ---------- Bazar de Zahra: equipamentos inéditos, para as classes do nível 20 e acessórios para todos ----------
Object.assign(ITENS,{
espada_cruzado:{n:'Espada do Cruzado',slot:'arma',atk:12,preco:1500,txt:'+12 Ataque',loja:'areth',para:['K4']},
arco_dunas:{n:'Arco das Dunas',slot:'arma',atk:11,spd:2,preco:1450,txt:'+11 Ataque, +2 Velocidade',loja:'areth',para:['A4']},
orbe_elemental:{n:'Orbe Elemental',slot:'arma',mag:13,mp:14,preco:1500,txt:'+13 Magia, +14 MP',loja:'areth',para:['M4']},
cimitarras_saque:{n:'Cimitarras do Saqueador',slot:'arma',atk:11,spd:3,preco:1450,txt:'+11 Ataque, +3 Velocidade',loja:'areth',para:['L4']},
cetro_exorcista:{n:'Cetro do Exorcista',slot:'arma',mag:13,mp:16,preco:1500,txt:'+13 Magia, +16 MP',loja:'areth',para:['C4']},
lanca_ceus:{n:'Lança dos Céus',slot:'arma',atk:12,spd:1,preco:1500,txt:'+12 Ataque, +1 Velocidade',loja:'areth',para:['R4']},
couraca_sol:{n:'Couraça do Sol',slot:'armadura',hp:40,preco:1300,txt:'+40 HP',loja:'areth',para:['K4','R4']},
manto_miragem:{n:'Manto da Miragem',slot:'armadura',hp:22,mp:22,preco:1250,txt:'+22 HP, +22 MP',loja:'areth',para:['M4','C4']},
veste_nomade:{n:'Veste Nômade',slot:'armadura',hp:30,spd:2,preco:1250,txt:'+30 HP, +2 Velocidade',loja:'areth',para:['A4','L4']},
tunica_deserto:{n:'Túnica do Deserto',slot:'armadura',hp:26,preco:900,txt:'+26 HP',loja:'areth'},
anel_prosperidade:{n:'Anel da Prosperidade',slot:'acessorio',ouroPct:30,preco:1800,txt:'+30% de ouro nas batalhas (soma com outros, até +60%)',loja:'areth'},
amuleto_escaravelho:{n:'Amuleto do Escaravelho',slot:'acessorio',atk:4,hp:12,preco:950,txt:'+4 Ataque, +12 HP',loja:'areth'},
anel_miragem:{n:'Anel da Miragem',slot:'acessorio',hp:8,spd:5,preco:900,txt:'+8 HP, +5 Velocidade',loja:'areth'},
olho_sol:{n:'Olho do Sol',slot:'acessorio',mag:5,mp:16,preco:950,txt:'+5 Magia, +16 MP',loja:'areth'},
sandalias_vento:{n:'Sandálias do Vento',slot:'acessorio',mov:1,jmp:1,spd:2,preco:1100,txt:'+1 Movimento, +1 Salto, +2 Velocidade',loja:'areth'},
// Baús de Areth
escaravelho_ouro:{n:'Escaravelho de Ouro',slot:'acessorio',atk:3,spd:2,txt:'+3 Ataque, +2 Velocidade'},
faixa_seda:{n:'Faixa de Seda',slot:'acessorio',hp:10,mp:6,txt:'+10 HP, +6 MP'},
// Raros dos chefes de Areth
laminas_samira:{n:'Lâminas de Samira',slot:'arma',atk:13,spd:2,txt:'+13 Ataque, +2 Velocidade',raro:true,para:['L']},
coroa_sol:{n:'Coroa do Sol',slot:'acessorio',atk:3,hp:16,mag:6,mp:16,txt:'+3 Ataque, +16 HP, +6 Magia, +16 MP',raro:true}});
Object.assign(VALOR_VENDA,{escaravelho_ouro:300,faixa_seda:280,laminas_samira:900,coroa_sol:1000});
LOJAS.areth={nome:'Mercadora Zahra',spr:'N',fala:'Seda, ouro e aço das caravanas do sul. Ninguém em Valdren ou Gelheim já viu o que eu vendo.'};
const LOOT_ARETH=['escaravelho_ouro','faixa_seda','pocao','pocao','pocao'];
ITENS.pocao.lojas.push('areth');

// ---------- Cenários de fundo das batalhas (desenhados atrás do mapa) ----------
const FUNDOS={
// Céu do deserto ao entardecer, sol, pirâmides distantes e dunas
deserto(g,tk){const x0=VB.x-1600,w=VB.w+3200,top=VB.y-900,hz=VB.y+150;
const ceu=g.createLinearGradient(0,top,0,hz+300);ceu.addColorStop(0,'#e98a4a');ceu.addColorStop(.55,'#f6c46c');ceu.addColorStop(1,'#f8e4b4');g.fillStyle=ceu;g.fillRect(x0,top,w,2400);
const sx=VB.x+VB.w*.8,sy=VB.y+40,br=g.createRadialGradient(sx,sy,10,sx,sy,120);br.addColorStop(0,'rgba(255,250,220,.95)');br.addColorStop(.3,'rgba(255,230,160,.6)');br.addColorStop(1,'rgba(255,200,120,0)');
g.fillStyle=br;g.fillRect(sx-130,sy-130,260,260);g.fillStyle='#fff6d8';g.beginPath();g.arc(sx,sy,26,0,7);g.fill();
for(const[px,ph,cor]of[[VB.x+60,110,'rgba(190,120,60,.5)'],[VB.x+170,70,'rgba(205,135,70,.45)'],[VB.x+VB.w-120,90,'rgba(190,120,60,.45)']]){g.fillStyle=cor;g.beginPath();g.moveTo(px-ph,hz);g.lineTo(px,hz-ph);g.lineTo(px+ph,hz);g.closePath();g.fill()}
for(let i=0;i<3;i++){g.fillStyle=`rgba(${220-i*12},${170-i*10},${100-i*8},.55)`;g.beginPath();g.moveTo(x0,hz+20+i*30);for(let x=x0;x<=x0+w;x+=40)g.lineTo(x,hz+20+i*30+Math.sin(x/90+i*2)*12);g.lineTo(x0+w,hz+2000);g.lineTo(x0,hz+2000);g.closePath();g.fill()}
for(let n=0;n<5;n++){const bx=VB.x+((n*230+tk*.3)%(VB.w+300))-150,by=VB.y+20+n*14;g.fillStyle='rgba(60,30,10,.5)';g.fillRect(bx,by,6,1);g.fillRect(bx+2,by-1,2,1)}},
// Eclipse do Sol Negro: céu violeta e laranja, sol negro com coroa de fogo e a silhueta de uma pirâmide colossal
eclipse(g,tk){const x0=VB.x-1600,w=VB.w+3200,top=VB.y-900,hz=VB.y+170;
const ceu=g.createLinearGradient(0,top,0,hz+300);ceu.addColorStop(0,'#1a0a24');ceu.addColorStop(.55,'#5a1a3a');ceu.addColorStop(1,'#c8603a');g.fillStyle=ceu;g.fillRect(x0,top,w,2400);
for(let n=0;n<40;n++){g.fillStyle=`rgba(255,240,220,${.3+.3*Math.sin(tk/30+n)})`;g.fillRect(VB.x+((n*97)%VB.w),VB.y-60+((n*53)%120),1.5,1.5)}
const cx=VB.x+VB.w/2,cy=VB.y+10,pul=1+.06*Math.sin(tk/20);
for(let i=0;i<16;i++){const a=i/16*Math.PI*2+tk/400,r1=60,r2=(110+20*Math.sin(tk/15+i))*pul;g.strokeStyle='rgba(255,140,40,.35)';g.lineWidth=4;g.beginPath();g.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);g.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2);g.stroke()}
const co=g.createRadialGradient(cx,cy,40,cx,cy,110*pul);co.addColorStop(0,'rgba(255,170,60,.9)');co.addColorStop(.4,'rgba(255,90,30,.4)');co.addColorStop(1,'rgba(120,20,40,0)');g.fillStyle=co;g.fillRect(cx-140,cy-140,280,280);
g.fillStyle='#0c0408';g.beginPath();g.arc(cx,cy,44,0,7);g.fill();g.lineWidth=1;
g.fillStyle='rgba(40,14,24,.85)';g.beginPath();g.moveTo(cx-330,hz+40);g.lineTo(cx,hz-210);g.lineTo(cx+330,hz+40);g.closePath();g.fill();
g.strokeStyle='rgba(255,140,60,.25)';for(let i=1;i<8;i++){const yy=hz-210+i*31;g.beginPath();g.moveTo(cx-i*41,yy);g.lineTo(cx+i*41,yy);g.stroke()}
g.fillStyle='rgba(90,30,30,.7)';g.beginPath();g.moveTo(x0,hz+60);for(let x=x0;x<=x0+w;x+=40)g.lineTo(x,hz+60+Math.sin(x/80)*10);g.lineTo(x0+w,hz+2000);g.lineTo(x0,hz+2000);g.closePath();g.fill()}};

// ---------- Fase 9 ----------
FASES.push({
id:'dunas-de-areth',
musica:'deserto',
fundo:'deserto',
nome:'Fase 9 · O Mar de Dunas',
historia:['Com o fragmento de Gelheim, a Espada Celestial passa a apontar para o sul: o calor do Sultanato de Areth. Lá, a Ordem do Eclipse ergueu uma pirâmide que apaga o sol ao meio-dia.',
'Para atravessar o Mar de Dunas, é preciso passar pela Esfinge Colossal, guardada pelas Lâminas do Deserto da capitã Samira. Tempestades de areia varrem as dunas, e a areia movediça engole os descuidados.'],
objetivo:'Derrote a capitã Samira.',
vitoria:'lider',
dica:'A tempestade de areia vem e vai: enquanto ela sopra, ataques à distância perdem 2 de alcance. Quem termina o turno na areia movediça (mais escura) fica preso no próximo turno.',
tempestade:true,
mapa:{
alt:['2211111122',
     '2111001112',
     '1110000111',
     '1000110001',
     '0000110000',
     '0001111000',
     '0000110000',
     '1000000001',
     '1100000011',
     '2100000012'],
ter:['sssyyyysss',
     'ssyyyyyyss',
     'sssqssqsss',
     'ssssyyssss',
     'sqssyysqss',
     'sssyyyysss',
     'ssssyyssss',
     'sqssssssqs',
     'ssssttssss',
     'ssssttssss'],
// S: Esfinge Colossal (ocupa 2×2: '#' marca o resto do corpo). O: obelisco. L: palmeira.
obj:['L........L',
     '..........',
     '..........',
     '..........',
     '....##....',
     '...O#S.O..',
     '..........',
     'L........L',
     '..........',
     '..........']},
grupo:[[4,9],[5,9],[3,9],[6,9],[4,8],[5,8]],
inimigos:[
{k:'Ch',x:2,y:6,nome:'Chacal do Deserto',atk:24},
{k:'Ch',x:7,y:6,nome:'Chacal do Deserto 2',atk:24},
{k:'Gs',x:3,y:1,nome:'Guerreiro de Areth',hp:98,alerta:3},
{k:'Gs',x:6,y:1,nome:'Guerreiro de Areth 2',hp:98,alerta:3},
{k:'As',x:0,y:1,nome:'Arqueiro do Sol',alerta:4},
{k:'As',x:9,y:1,nome:'Arqueiro do Sol 2',alerta:4},
{k:'Ms',x:4,y:0,nome:'Mago das Areias',alerta:5},
{k:'Ls',x:5,y:0,nome:'Samira',lider:true,hp:195,atk:28,alerta:4,drop:'laminas_samira'}],
aleatorios:[{k:'Ch',nome:'Chacal do Deserto'},{k:'Gs',nome:'Guerreiro de Areth'},{k:'As',nome:'Arqueiro do Sol'},{k:'Ms',nome:'Mago das Areias'},{k:'Ls',nome:'Lâmina do Deserto'}],
loot:LOOT_ARETH,
falas:{
inicio:[['Samira','Estrangeiros no Mar de Dunas? A Esfinge não deixa ninguém passar sem a permissão do Sultão.'],
['heroi0','O Sultão serve ao Eclipse. Viemos libertar o fragmento da Coroa da Aurora.'],
['Samira','O Arauto do Sol Negro nos prometeu chuva e colheitas. Lâminas, ao ataque!']],
'acorda:Samira':[['Samira','As Lâminas do Deserto não recuam diante de ninguém!']],
'ferido:Samira':[['Samira','Chuva e colheitas... e até hoje só vimos o sol se apagar. Será que fomos enganados?']],
vitoria:[['Samira','Vocês venceram com honra. O Arauto Azhar nos traiu: a pirâmide dele está secando os oásis.'],
['Samira','Ele guarda o fragmento no topo da Pirâmide do Sol Negro. Ao meio-dia, o raio do Sol Negro queima tudo o que estiver na linha dele.'],
['heroi2','Então vamos subir a pirâmide.']],
derrota:[['Samira','O deserto guarda os ossos de quem o desafia.']]},
tutorial:[['dica','Bem-vindos a Areth! Atrás de vocês fica o Oásis de Zahra, com o Bazar e equipamentos para as classes do nível 20.'],
['dica','A tempestade de areia vem e vai a cada rodada: enquanto ela sopra, arqueiros e atiradores perdem 2 de alcance. Magias não são afetadas.'],
['dica','A areia movediça é a areia mais escura. Quem terminar o turno nela fica preso no próximo turno. A Esfinge Colossal bloqueia o centro: contornem pelos lados.']],
fim:{vitoria:'Samira entrega sua espada e as Lâminas do Deserto abrem caminho. No horizonte, a Pirâmide do Sol Negro corta o céu como uma lâmina escura.',
derrota:'A tempestade engole as dunas. Os heróis recuam para o Oásis de Zahra com areia até nos ossos.'},
ouro:1700,
estrelas:{turnos:42}
});

// ---------- Fase 10 ----------
// A Pirâmide do Sol Negro: degraus de 0 a 5 a partir do topo (5,3). Gerada por código para manter os degraus certinhos.
const PIR=(x,y)=>{const d=Math.max(Math.abs(x-5),Math.abs(y-3));return d<=4?5-d:0};
const GRADE=f=>[...Array(11)].map((_,y)=>[...Array(11)].map((_,x)=>f(x,y)).join(''));
FASES.push({
id:'piramide-do-sol-negro',
musica:'piramide',
fundo:'eclipse',
nome:'Fase 10 · A Pirâmide do Sol Negro',
historia:['No coração de Areth, a Pirâmide do Sol Negro se ergue sobre as dunas. No topo, o Arauto Azhar ergue o segundo fragmento da Coroa da Aurora e apaga o sol todos os dias ao meio-dia.',
'A cada rodada, o raio do Sol Negro marca uma fileira ou coluna da pirâmide e depois a atinge. Subam os degraus, fujam da linha vermelha e derrubem o Arauto.'],
objetivo:'Derrote Azhar, o Arauto do Sol Negro.',
vitoria:'lider',
dica:'A linha marcada em vermelho será atingida pelo raio do Sol Negro: saiam dela antes que caia. Cada degrau da pirâmide é uma casa mais alta. Cabem 6 heróis.',
feixe:{dano:26},
fragmento:'sol',
mapa:{
alt:GRADE(PIR),
ter:GRADE((x,y)=>PIR(x,y)||(x==5&&y==3)?'y':(y>=9&&x>=4&&x<=6)?'t':[[1,9],[9,9],[0,6],[10,6]].some(([a,b])=>a==x&&b==y)?'q':'s'),
obj:GRADE((x,y)=>[[2,8],[8,8]].some(([a,b])=>a==x&&b==y)?'O':[[0,10],[10,10],[0,3],[10,3]].some(([a,b])=>a==x&&b==y)?'L':'.')},
grupo:[[4,10],[5,10],[6,10],[4,9],[5,9],[6,9]],
inimigos:[
{k:'Ch',x:1,y:7,nome:'Chacal do Deserto'},
{k:'Ch',x:9,y:7,nome:'Chacal do Deserto 2'},
{k:'Gs',x:4,y:5,nome:'Guarda da Pirâmide',hp:92,alerta:3},
{k:'Gs',x:6,y:5,nome:'Guarda da Pirâmide 2',hp:92,alerta:3},
{k:'As',x:3,y:2,nome:'Arqueiro do Sol',alerta:4},
{k:'As',x:7,y:2,nome:'Arqueiro do Sol 2',alerta:4},
{k:'Ms',x:5,y:1,nome:'Mago das Areias',alerta:4},
{k:'Ms',x:5,y:3,nome:'Azhar',lider:true,hp:170,mp:50,atk:14,mag:6,alerta:4,drop:'coroa_sol',transforma:{k:'Cs',nome:'Colosso do Sol Negro',hp:230,mp:30,atk:30,mov:3,jmp:5,spd:11}}],
aleatorios:[{k:'Ch',nome:'Chacal do Deserto'},{k:'Gs',nome:'Guarda da Pirâmide'},{k:'As',nome:'Arqueiro do Sol'},{k:'Ms',nome:'Mago das Areias'},{k:'Ls',nome:'Lâmina do Deserto'}],
loot:LOOT_ARETH,
falas:{
inicio:[['Azhar','Hrimvar caiu, e Samira me traiu. Mas aqui, sob o Sol Negro, eu sou eterno.'],
['heroi0','Devolva o fragmento, Azhar. O povo de Areth está morrendo de sede.'],
['Azhar','Olhem para o céu: o Sol Negro escolhe quem queima. Que comece o meio-dia!']],
'acorda:Azhar':[['Azhar','Subam, se puderem. Cada degrau vai custar caro.']],
transforma:[['Azhar','O fragmento... me dê o seu poder! Pirâmide, desperte!'],
['Colosso do Sol Negro','EU SOU O SOL QUE NÃO NASCE! QUEIMEM!'],
['heroi1','Ele virou um colosso de pedra e fogo!']],
'ferido:Colosso do Sol Negro':[['Colosso do Sol Negro','A pedra racha... o fragmento está me rejeitando!']],
vitoria:[['Azhar','(Das ruínas do colosso) O segundo fragmento... volta para a luz. Ozrath não vai perdoar isso.'],
['Azhar','O último Arauto espera no Arquipélago de Maré-Alta. Lá, o mar inteiro obedece ao Eclipse.'],
['heroi0','Dois Fragmentos da Aurora! A Espada Celestial nunca brilhou tanto.'],
['heroi2','Areth vai ver o sol nascer de novo. Falta só um fragmento.']],
derrota:[['Azhar','O Sol Negro não se apaga.']]},
tutorial:[['dica','A pirâmide tem degraus de uma casa de altura: todos conseguem subir. Lá de cima, arqueiros e magos causam mais dano.'],
['dica','A linha vermelha é o alvo do raio do Sol Negro. Algumas rodadas depois, o raio cai nela e fere todos que estiverem lá: saiam a tempo!'],
['dica','Cuidado: Azhar esconde um poder colossal. Guardem habilidades fortes para depois que ele cair pela primeira vez.']],
fim:{vitoria:'O Colosso desaba em pedra e areia, e o Sol Negro se desfaz. O segundo Fragmento da Aurora se une à Espada Celestial, e o sol volta a brilhar sobre Areth.',
derrota:'O raio do Sol Negro varre os degraus. Os heróis descem a pirâmide queimados, mas vivos.'},
ouro:2000,
estrelas:{turnos:48}
});

// ---------- Lugares ----------
// A Rota das Caravanas (Valdren) abre depois da Fortaleza de Gelo e leva ao mapa de Areth.
LUGARES.push({id:'caravana',regiao:'valdren',nome:'Rota das Caravanas',tipo:'passagem',para:'areth',chegada:'zahra',de:'brumafria',requer:'fortaleza-de-gelo',x:470,y:660,sub:'Estrada para o sul'},
{id:'zahra',regiao:'areth',nome:'Oásis de Zahra',tipo:'vila',loja:'areth',x:260,y:470,sub:'O último oásis com água'},
{id:'rota-norte',regiao:'areth',nome:'Rota do Norte',tipo:'passagem',para:'valdren',chegada:'caravana',de:'zahra',x:140,y:150,sub:'Caravanas de volta'},
{id:'dunas',regiao:'areth',nome:'Mar de Dunas',tipo:'batalha',fase:'dunas-de-areth',de:'zahra',x:600,y:420},
{id:'piramide',regiao:'areth',nome:'Pirâmide do Sol Negro',tipo:'batalha',fase:'piramide-do-sol-negro',de:'dunas',x:960,y:300});

// ---------- Mapa de Areth: pergaminho dourado com dunas, oásis e a pirâmide ----------
const PAREIA=(()=>{let s=19;const r=()=>(s=(s*16807)%2147483647)/2147483647;
return{manchas:[...Array(22)].map(()=>({x:r()*1280,y:r()*720,r:40+r()*140,a:.05+r()*.08})),
dunas:[...Array(26)].map(()=>({x:r()*1280,y:200+r()*480,w:60+r()*90})),
palmas:[...Array(8)].map(()=>({x:200+r()*120,y:400+r()*120}))}})();
function pergaminhoAreia(x,t){x.fillStyle='#e6c88e';x.fillRect(0,0,1280,720);
for(const m of PAREIA.manchas){const g=x.createRadialGradient(m.x,m.y,4,m.x,m.y,m.r);g.addColorStop(0,`rgba(150,90,30,${m.a})`);g.addColorStop(1,'rgba(150,90,30,0)');x.fillStyle=g;x.fillRect(m.x-m.r,m.y-m.r,m.r*2,m.r*2)}
x.strokeStyle='rgba(110,70,25,.15)';x.lineWidth=1;for(let n=0;n<16;n++){const a=n*Math.PI/8;x.beginPath();x.moveTo(1120,140);x.lineTo(1120+Math.cos(a)*1600,140+Math.sin(a)*1600);x.stroke()}
for(const d of PAREIA.dunas){x.strokeStyle='rgba(140,90,40,.35)';x.lineWidth=2;x.beginPath();x.moveTo(d.x-d.w/2,d.y);x.quadraticCurveTo(d.x,d.y-18,d.x+d.w/2,d.y);x.stroke()}
// Oásis
x.fillStyle='rgba(70,130,140,.5)';x.beginPath();x.ellipse(250,520,70,28,0,0,7);x.fill();x.strokeStyle='rgba(60,40,20,.5)';x.stroke();
for(const p of PAREIA.palmas){x.strokeStyle='rgba(80,60,30,.7)';x.lineWidth=2;x.beginPath();x.moveTo(p.x,p.y);x.lineTo(p.x+3,p.y-16);x.stroke();x.fillStyle='rgba(60,110,50,.7)';x.beginPath();x.arc(p.x+3,p.y-18,6,0,7);x.fill()}
// A pirâmide e a esfinge desenhadas no mapa
x.fillStyle='rgba(120,70,30,.55)';x.beginPath();x.moveTo(890,330);x.lineTo(960,215);x.lineTo(1030,330);x.closePath();x.fill();x.strokeStyle='rgba(60,30,10,.7)';x.lineWidth=2;x.stroke();
x.strokeStyle='rgba(60,30,10,.35)';for(let i=1;i<6;i++){const yy=215+i*19;x.beginPath();x.moveTo(960-i*12,yy);x.lineTo(960+i*12,yy);x.stroke()}
x.fillStyle='rgba(120,80,40,.5)';x.fillRect(560,440,60,14);x.fillRect(560,424,18,20);
const cx=1120,cy=140;x.save();x.translate(cx,cy);for(let n=0;n<8;n++){x.rotate(Math.PI/4);x.fillStyle=n%2?'rgba(150,100,40,.55)':'rgba(90,55,20,.65)';x.beginPath();x.moveTo(0,0);x.lineTo(8,0);x.lineTo(0,n%2?-38:-58);x.lineTo(-8,0);x.closePath();x.fill()}x.restore();
x.fillStyle='rgba(90,55,20,.7)';x.font='700 16px Georgia,serif';x.textAlign='center';x.fillText('N',cx,68);
x.fillStyle='rgba(90,55,20,.42)';x.font='italic 700 54px "Alegreya SC",Georgia,serif';x.fillText('A r e t h',640,110);
x.font='italic 22px "Alegreya Sans",Georgia,serif';x.fillText('Grande Deserto',820,610);x.fillText('Vale dos Reis',1000,480)}
