// ===================== ATO III · O ECLIPSE — REINO DE GELHEIM =====================
// Primeira região fora de Valdren. O roteiro completo está em HISTORIA.md.
// Regra das lojas: cada ato traz equipamentos que nunca apareceram antes, mais fortes que os do ato anterior.

REGIOES.gelheim={nome:'Reino de Gelheim',fundo:pergaminhoGelo};

// ---------- Forja de Gelheim: só equipamentos inéditos, forjados no gelo eterno ----------
Object.assign(ITENS,{
lamina_inverno:{n:'Lâmina do Inverno Eterno',slot:'arma',atk:9,preco:980,txt:'+9 Ataque',loja:'gelheim',para:['E']},
arco_boreal:{n:'Arco da Aurora Boreal',slot:'arma',atk:8,spd:2,preco:960,txt:'+8 Ataque, +2 Velocidade',loja:'gelheim',para:['V']},
cetro_estelar:{n:'Cetro Estelar',slot:'arma',mag:10,mp:10,preco:1000,txt:'+10 Magia, +10 MP',loja:'gelheim',para:['F']},
adagas_geada:{n:'Adagas de Geada',slot:'arma',atk:8,spd:3,preco:960,txt:'+8 Ataque, +3 Velocidade',loja:'gelheim',para:['B']},
baculo_oraculo:{n:'Báculo do Oráculo',slot:'arma',mag:10,mp:12,preco:1000,txt:'+10 Magia, +12 MP',loja:'gelheim',para:['O']},
lanca_dragao:{n:'Lança do Dragão Branco',slot:'arma',atk:9,spd:1,preco:980,txt:'+9 Ataque, +1 Velocidade',loja:'gelheim',para:['J']},
placas_gelo:{n:'Armadura de Gelo Eterno',slot:'armadura',hp:32,preco:900,txt:'+32 HP',loja:'gelheim',para:['E','J']},
manto_estelar:{n:'Manto Estelar',slot:'armadura',hp:16,mp:16,preco:860,txt:'+16 HP, +16 MP',loja:'gelheim',para:['F','O']},
couraca_lobo_branco:{n:'Couraça de Lobo Branco',slot:'armadura',hp:22,spd:1,preco:820,txt:'+22 HP, +1 Velocidade',loja:'gelheim',para:['V','B']},
pelica_gelheim:{n:'Peliça de Gelheim',slot:'armadura',hp:18,preco:620,txt:'+18 HP',loja:'gelheim'},
anel_sabio:{n:'Anel do Sábio',slot:'acessorio',xpPct:50,preco:1600,txt:'+50% de XP para quem usa (batalhas e missões)',loja:'gelheim'},
anel_boreal:{n:'Anel da Aurora Boreal',slot:'acessorio',mag:3,mp:12,preco:680,txt:'+3 Magia, +12 MP',loja:'gelheim'},
amuleto_uivo:{n:'Amuleto do Uivo',slot:'acessorio',hp:6,spd:4,preco:640,txt:'+6 HP, +4 Velocidade',loja:'gelheim'},
botas_raquete:{n:'Botas de Raquete',slot:'acessorio',mov:1,jmp:1,preco:760,txt:'+1 Movimento, +1 Salto',loja:'gelheim'},
runa_gelo:{n:'Runa de Gelo Eterno',slot:'acessorio',atk:3,hp:8,preco:700,txt:'+3 Ataque, +8 HP',loja:'gelheim'},
// Baús de Gelheim
cristal_gelo:{n:'Cristal de Gelo',slot:'acessorio',mag:3,mp:6,txt:'+3 Magia, +6 MP'},
luvas_pele:{n:'Luvas de Pele de Urso',slot:'acessorio',atk:2,hp:6,txt:'+2 Ataque, +6 HP'},
// Raros dos chefes de Gelheim
machado_jarl:{n:'Machado do Jarl',slot:'arma',atk:11,hp:6,txt:'+11 Ataque, +6 HP',raro:true,para:['K','L']},
coroa_inverno:{n:'Coroa do Inverno',slot:'acessorio',hp:12,mag:5,mp:12,spd:2,txt:'+12 HP, +5 Magia, +12 MP, +2 Velocidade',raro:true}});
Object.assign(VALOR_VENDA,{cristal_gelo:220,luvas_pele:200,machado_jarl:700,coroa_inverno:750});
LOJAS.gelheim={nome:'Ferreiro Torvald',spr:'N',fala:'Aço forjado no frio eterno de Gelheim. Nada do que vendo existe ao sul das montanhas.'};
const LOOT_GELHEIM=['cristal_gelo','luvas_pele','pocao','pocao','pocao'];

// ---------- Fase 7 ----------
FASES.push({
id:'geleira-dos-uivos',
musica:'gelo',
nome:'Fase 7 · A Geleira dos Uivos',
historia:['Com Kaedor derrotado, um mensageiro chega ao castelo: o Eclipse avança sobre o norte. Em Gelheim, o Jarl Hrodvar fechou a Geleira dos Uivos a mando de Ozrath.',
'Dizem que um fragmento da Coroa da Aurora brilha no alto da Fortaleza de Gelo. Para chegar lá, é preciso atravessar a geleira, onde o gelo faz qualquer viajante escorregar.'],
objetivo:'Derrote o Jarl Hrodvar.',
vitoria:'lider',
dica:'Quem termina o movimento no gelo (azul) desliza uma casa a mais na mesma direção. Os inimigos de Gelheim conhecem o gelo e não escorregam.',
mapa:{
alt:['322222223',
     '221111122',
     '211000112',
     '100111001',
     '000111000',
     '000000000',
     '100000001',
     '110000011',
     '211000112'],
ter:['rnnnnnnnr',
     'nnniiinnn',
     'nniiiiinn',
     'niinnniin',
     'iiinnniii',
     'niiiiiiin',
     'nniiiiinn',
     'nnntttnnn',
     'rnnntnnnr'],
obj:['N.......N',
     '.........',
     '.G.....G.',
     '.........',
     '.........',
     '.........',
     'N.......N',
     '.........',
     '.N.....N.']},
grupo:[[3,8],[4,8],[5,8],[3,7],[4,7],[5,7]],
inimigos:[
{k:'U',x:1,y:4,nome:'Lobo do Gelo'},
{k:'U',x:7,y:4,nome:'Lobo do Gelo 2'},
{k:'U',x:4,y:4,nome:'Lobo Alfa',hp:56,atk:20},
{k:'I',x:2,y:1,nome:'Guerreiro de Gelheim',alerta:3},
{k:'I',x:6,y:1,nome:'Guerreiro de Gelheim 2',alerta:3},
{k:'Y',x:4,y:0,nome:'Xamã do Gelo',alerta:5},
{k:'I',x:4,y:1,nome:'Jarl Hrodvar',lider:true,hp:150,atk:24,alerta:4,drop:'machado_jarl'}],
aleatorios:[{k:'U',nome:'Lobo do Gelo'},{k:'I',nome:'Guerreiro de Gelheim'},{k:'Y',nome:'Xamã do Gelo'},{k:'U',nome:'Lobo Alfa'}],
loot:LOOT_GELHEIM,
falas:{
inicio:[['Jarl Hrodvar','Sulistas na minha geleira? O Arauto prometeu que ninguém viria até aqui.'],
['heroi0','Viemos atrás do fragmento da Coroa da Aurora. Saia do caminho, Jarl.'],
['Jarl Hrodvar','Então vão congelar procurando. Lobos, ao ataque!']],
'acorda:Jarl Hrodvar':[['Jarl Hrodvar','Pelo machado dos meus ancestrais! Ninguém passa pela Geleira dos Uivos!']],
'ferido:Jarl Hrodvar':[['Jarl Hrodvar','Vocês lutam como gente do norte... Será que o Arauto mentiu para mim também?']],
vitoria:[['Jarl Hrodvar','Hrimvar, o Arauto do Gelo, guarda o fragmento na Fortaleza de Gelo. Foi ele quem congelou o coração do meu povo.'],
['Jarl Hrodvar','Se vão enfrentá-lo, levem isto: o machado dos meus ancestrais. Que ele corte o gelo do Eclipse.'],
['heroi1','Para a Fortaleza de Gelo, então.']],
derrota:[['Jarl Hrodvar','O gelo não perdoa os fracos.']]},
tutorial:[['dica','Bem-vindos a Gelheim! A neve funciona como chão comum, mas o gelo (azul) é escorregadio: quem termina o movimento nele desliza uma casa a mais na mesma direção.'],
['dica','Use o deslize a seu favor para chegar mais longe, mas cuidado para não escorregar para o meio dos inimigos. Eles conhecem o gelo e não escorregam.'],
['dica','Em Gelheim fica a Forja do Ferreiro Torvald, na Aldeia de Invernia: equipamentos nunca vistos, para as classes do nível 12.']],
fim:{vitoria:'O Jarl se ajoelha na neve e os lobos recuam para as montanhas. No alto da geleira, a Fortaleza de Gelo aparece entre as nuvens.',
derrota:'O vento da geleira empurra os heróis de volta para Invernia. Os uivos continuam ecoando nas montanhas.'},
ouro:1200,
estrelas:{turnos:36}
});

// ---------- Fase 8 ----------
FASES.push({
id:'fortaleza-de-gelo',
musica:'inverno',
nome:'Fase 8 · A Fortaleza de Gelo',
historia:['No alto de Gelheim, a Fortaleza de Gelo brilha sob uma nevasca que nunca para. Lá dentro, Hrimvar, o Arauto do Gelo, guarda o primeiro fragmento da Coroa da Aurora.',
'A nevasca esconde tudo a mais de 3 casas dos heróis. Hrimvar serve a Ozrath e quer congelar Gelheim para sempre.'],
objetivo:'Derrote Hrimvar, o Arauto do Gelo.',
vitoria:'lider',
dica:'A nevasca esconde os inimigos a mais de 3 casas dos heróis. O chão da fortaleza é quase todo de gelo: planeje bem onde parar. Cabem 6 heróis na formação.',
neblina:3,
neve:true,
// fragmento: ao vencer a história, o grupo recupera um Fragmento da Aurora (a Espada Celestial carrega mais rápido)
fragmento:'gelo',
mapa:{
alt:['3322222233',
     '3222112223',
     '2211111122',
     '1111001111',
     '1100000011',
     '1000000001',
     '0000000000',
     '0000000000',
     '0000000000',
     '0000000000'],
ter:['rriiiiiirr',
     'riiinniiir',
     'riinnnniir',
     'nnnniinnnn',
     'nniiiiiinn',
     'nniinniinn',
     'nnnniinnnn',
     'nniiiiiinn',
     'nnnnttnnnn',
     'nnnnttnnnn'],
obj:['..G....G..',
     '..........',
     '.P......P.',
     '..........',
     'N........N',
     '..........',
     '..........',
     '.G......G.',
     '..........',
     'N........N']},
grupo:[[4,9],[5,9],[3,9],[6,9],[4,8],[5,8]],
inimigos:[
{k:'U',x:1,y:5,nome:'Lobo do Gelo',hp:52},
{k:'U',x:8,y:5,nome:'Lobo do Gelo 2',hp:52},
{k:'I',x:3,y:2,nome:'Guarda de Gelo',hp:74,atk:20,alerta:3},
{k:'I',x:6,y:2,nome:'Guarda de Gelo 2',hp:74,atk:20,alerta:3},
{k:'V',x:8,y:1,nome:'Caçador de Gelheim',hp:54,mp:6,atk:17,alerta:4},
{k:'Y',x:5,y:1,nome:'Xamã do Gelo',hp:54,alerta:4},
{k:'Y',x:4,y:0,nome:'Hrimvar',lider:true,hp:160,mp:42,atk:14,mag:4,alerta:4,drop:'coroa_inverno'}],
aleatorios:[{k:'U',nome:'Lobo do Gelo'},{k:'I',nome:'Guarda de Gelo'},{k:'V',nome:'Caçador de Gelheim'},{k:'Y',nome:'Xamã do Gelo'}],
loot:LOOT_GELHEIM,
falas:{
inicio:[['Hrimvar','Então foram vocês que derrubaram o fantoche de Valdren. Ozrath me avisou.'],
['heroi0','Viemos buscar o fragmento da Coroa da Aurora, Arauto.'],
['Hrimvar','Esta luz pertence ao Eclipse. A nevasca vai enterrar vocês antes de chegarem ao trono de gelo.']],
'acorda:Hrimvar':[['Hrimvar','Nevasca, cubra tudo! Que nenhum deles veja o próximo passo!']],
'ferido:Hrimvar':[['Hrimvar','Impossível... o fragmento está reagindo à espada deles!']],
vitoria:[['Hrimvar','O fragmento... brilha de novo. Ozrath vai sentir isso do outro lado do mundo.'],
['Hrimvar','Vocês libertaram uma luz, mas a Coroa foi partida. No deserto de Areth e no mar de Maré-Alta, os outros Arautos esperam.'],
['heroi0','O primeiro Fragmento da Aurora! A Espada Celestial brilha mais forte.'],
['heroi2','Gelheim está livre. Próximo destino: onde quer que o Eclipse esteja.']],
derrota:[['Hrimvar','Mais estátuas de gelo para a minha fortaleza.']]},
tutorial:[['dica','A nevasca funciona como a neblina do Lago: só se vê a até 3 casas de um herói. Avance juntos.'],
['dica','Hrimvar recupera o Fragmento da Aurora se cair: vencendo, a Espada Celestial passa a carregar 20% mais rápido.']],
fim:{vitoria:'A nevasca para pela primeira vez em anos. O Fragmento da Aurora se une à Espada Celestial, e o sol de Gelheim aparece por um instante entre as montanhas.',
derrota:'A nevasca engole a fortaleza. Os heróis descem a montanha às pressas, com o frio nos ossos.'},
ouro:1500,
estrelas:{turnos:44}
});

// ---------- Lugares ----------
// O Passo do Norte abre depois do Salão do Trono e leva ao mapa de Gelheim.
LUGARES.push({id:'passo-norte',regiao:'valdren',nome:'Passo do Norte',tipo:'passagem',para:'gelheim',chegada:'invernia',de:'trono',x:1180,y:80,sub:'Estrada para as montanhas'},
{id:'invernia',regiao:'gelheim',nome:'Aldeia de Invernia',tipo:'vila',loja:'gelheim',x:330,y:520,sub:'Aldeia dos caçadores do norte'},
{id:'passo-sul',regiao:'gelheim',nome:'Passo do Sul',tipo:'passagem',para:'valdren',chegada:'passo-norte',de:'invernia',x:170,y:640,sub:'Estrada de volta'},
{id:'geleira',regiao:'gelheim',nome:'Geleira dos Uivos',tipo:'batalha',fase:'geleira-dos-uivos',de:'invernia',x:640,y:420},
{id:'fortaleza',regiao:'gelheim',nome:'Fortaleza de Gelo',tipo:'batalha',fase:'fortaleza-de-gelo',de:'geleira',x:930,y:210});

// ---------- Mapa de Gelheim: pergaminho frio, com montanhas, geleira e o Mar Gelado ----------
const PGELO=(()=>{let s=11;const r=()=>(s=(s*16807)%2147483647)/2147483647;
return{manchas:[...Array(22)].map(()=>({x:r()*1280,y:r()*720,r:40+r()*140,a:.05+r()*.08})),
picos:[...Array(30)].map((_,i)=>i<18?{x:700+r()*520,y:90+r()*160,s:.8+r()*.8}:{x:80+r()*360,y:120+r()*180,s:.7+r()*.6}),
pinhos:[...Array(30)].map(()=>({x:200+r()*360,y:300+r()*170,s:.7+r()*.5}))}})();
function pergaminhoGelo(x,t){x.fillStyle='#d6dcd8';x.fillRect(0,0,1280,720);
for(const m of PGELO.manchas){const g=x.createRadialGradient(m.x,m.y,4,m.x,m.y,m.r);g.addColorStop(0,`rgba(70,95,120,${m.a})`);g.addColorStop(1,'rgba(70,95,120,0)');x.fillStyle=g;x.fillRect(m.x-m.r,m.y-m.r,m.r*2,m.r*2)}
x.strokeStyle='rgba(50,70,90,.14)';x.lineWidth=1;for(let n=0;n<16;n++){const a=n*Math.PI/8;x.beginPath();x.moveTo(1120,560);x.lineTo(1120+Math.cos(a)*1600,560+Math.sin(a)*1600);x.stroke()}
// Mar Gelado, ao sul, com blocos de gelo flutuando
x.fillStyle='rgba(120,150,170,.38)';x.beginPath();x.moveTo(520,720);x.bezierCurveTo(640,650,820,640,960,670);x.bezierCurveTo(1080,700,1180,640,1280,600);x.lineTo(1280,720);x.closePath();x.fill();
x.strokeStyle='rgba(40,60,80,.5)';x.lineWidth=2;x.stroke();
for(let n=0;n<9;n++){const fx=640+n*70,fy=690-(n%3)*12+Math.sin(t*.6+n)*2;x.fillStyle='rgba(240,248,252,.7)';x.fillRect(fx,fy,18,6)}
// A geleira: uma faixa de gelo descendo das montanhas
x.fillStyle='rgba(170,215,235,.45)';x.beginPath();x.moveTo(860,170);x.bezierCurveTo(780,280,700,360,620,470);x.lineTo(680,480);x.bezierCurveTo(760,380,840,300,930,200);x.closePath();x.fill();
x.strokeStyle='rgba(60,100,130,.45)';x.lineWidth=1.5;x.stroke();
// Montanhas com neve
for(const m of PGELO.picos){const s=30*m.s;x.fillStyle='rgba(90,105,120,.5)';x.beginPath();x.moveTo(m.x-s,m.y);x.lineTo(m.x,m.y-s*1.2);x.lineTo(m.x+s,m.y);x.closePath();x.fill();
x.strokeStyle='rgba(40,50,64,.7)';x.lineWidth=1.5;x.stroke();x.fillStyle='rgba(250,252,255,.85)';x.beginPath();x.moveTo(m.x-s*.35,m.y-s*.78);x.lineTo(m.x,m.y-s*1.2);x.lineTo(m.x+s*.35,m.y-s*.78);x.closePath();x.fill()}
// Pinheiros
for(const a of PGELO.pinhos){const s=10*a.s;x.fillStyle='rgba(50,80,70,.6)';x.beginPath();x.moveTo(a.x-s*.7,a.y);x.lineTo(a.x,a.y-s*2);x.lineTo(a.x+s*.7,a.y);x.closePath();x.fill();x.fillStyle='rgba(250,252,255,.7)';x.fillRect(a.x-1,a.y-s*2,2,3)}
// Neve caindo sobre o mapa
for(let n=0;n<60;n++){const sx=(n*131+t*18*(1+n%3))%1280,sy=(n*73+t*30*(1+n%2))%720;x.fillStyle='rgba(255,255,255,.55)';x.fillRect(sx,sy,2,2)}
x.save();x.translate(1120,560);for(let n=0;n<8;n++){x.rotate(Math.PI/4);x.fillStyle=n%2?'rgba(90,120,150,.55)':'rgba(40,60,90,.65)';x.beginPath();x.moveTo(0,0);x.lineTo(8,0);x.lineTo(0,n%2?-38:-58);x.lineTo(-8,0);x.closePath();x.fill()}x.restore();
x.fillStyle='rgba(40,60,90,.7)';x.font='700 16px Georgia,serif';x.textAlign='center';x.fillText('N',1120,488);
x.fillStyle='rgba(40,60,90,.42)';x.font='italic 700 54px "Alegreya SC",Georgia,serif';x.fillText('G e l h e i m',560,110);
x.font='italic 22px "Alegreya Sans",Georgia,serif';x.fillText('Mar Gelado',900,700);x.fillText('Montes Uivantes',1000,300);x.fillText('Bosque dos Pinheiros',380,290)}
