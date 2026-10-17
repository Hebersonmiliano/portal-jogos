// ===================== CONQUISTAS =====================
// Valem para o jogo todo (não para um save só), como na Steam: ficam em cdr.conquistas.
// Contadores (baús, vitórias...) ficam em cdr.estat. secreta: o nome e a descrição só aparecem depois de desbloquear.
const CONQUISTAS={
primeira_vitoria:{n:'Primeiro Passo',d:'Vença a sua primeira batalha.',i:'⚔️'},
ato1:{n:'Fim da Fronteira',d:'Complete o Ato I: vença o Desfiladeiro do Ocaso.',i:'🏔️'},
ato2:{n:'O Trono é Nosso',d:'Conquiste o Castelo de Valdren.',i:'🏰'},
gelheim:{n:'Coração de Gelo',d:'Recupere o Fragmento da Aurora de Gelheim.',i:'❄️'},
areth:{n:'Sol Libertado',d:'Recupere o Fragmento da Aurora de Areth.',i:'☀️'},
mare:{n:'Senhor das Marés',d:'Recupere o Fragmento da Aurora de Maré-Alta.',i:'🌊'},
final_devolver:{n:'A Coroa Volta ao Trono',d:'Devolva a Coroa da Aurora a Valdren.',i:'👑',secreta:true},
final_destruir:{n:'Luz para Todos',d:'Destrua a Coroa da Aurora e liberte a luz.',i:'✨',secreta:true},
dois_finais:{n:'Os Dois Caminhos',d:'Veja os dois finais da saga.',i:'⚖️',secreta:true},
dificil_final:{n:'Lenda Viva',d:'Vença a batalha final no Difícil.',i:'🔥'},
tres_estrelas:{n:'Perfeição',d:'Ganhe 3 estrelas numa batalha.',i:'⭐'},
todas_estrelas:{n:'Constelação',d:'Ganhe 3 estrelas em todas as 15 fases.',i:'🌟'},
sem_baixas:{n:'Ninguém Fica para Trás',d:'Vença uma batalha da história sem ninguém do grupo cair.',i:'🛡️'},
sombras:{n:'Maior que a Própria Sombra',d:'Vença o Salão das Sombras sem ninguém do grupo cair.',i:'🪞'},
kraken_bravo:{n:'Contra Todos os Tentáculos',d:'Derrote o Kraken Abissal com os quatro tentáculos ainda vivos.',i:'🐙'},
nv5:{n:'Nova Vocação',d:'Libere uma classe do nível 5.',i:'🎓'},
nv12:{n:'Terceira Forma',d:'Libere uma classe do nível 12.',i:'🔷'},
nv30:{n:'Veterano',d:'Libere uma classe do nível 30.',i:'🔶'},
nv50:{n:'Ápice',d:'Chegue ao nível 50 com um herói.',i:'💎'},
elenco_cheio:{n:'Companhia Completa',d:'Tenha 10 heróis no elenco.',i:'👥'},
milionario:{n:'Tesouro Real',d:'Junte 10.000 de ouro.',i:'💰'},
castelo_completo:{n:'Fortaleza Perfeita',d:'Leve todos os prédios do castelo ao nível máximo.',i:'🏗️'},
mina:{n:'Mais Fundo',d:'Melhore a Mina de Brasaferro.',i:'⛏️'},
baus:{n:'Caçador de Tesouros',d:'Abra 50 baús.',i:'🧰',meta:50,cont:'baus'},
raros:{n:'Colecionador',d:'Consiga 5 itens raros dos chefes.',i:'🟣',meta:5,cont:'raros'},
vitorias100:{n:'Centenário',d:'Vença 100 batalhas.',i:'🏆',meta:100,cont:'vitorias'},
aurora:{n:'Asas de Fogo',d:'Invoque Aurora, a Fênix Solar.',i:'🔥'},
costas:{n:'Golpe Traiçoeiro',d:'Derrote um inimigo com um ataque pelas costas.',i:'🗡️'},
combo:{n:'Tempestade de Fogo',d:'Atinja 4 inimigos com uma só magia ou habilidade em área.',i:'💥'},
patinador:{n:'Patinador',d:'Escorregue no gelo de Gelheim.',i:'⛸️'}};

const leJSON=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}},gravaJSON=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let CONQ=leJSON('cdr.conquistas',{}),ESTAT=leJSON('cdr.estat',{});
const temConquista=id=>!!CONQ[id];
function conquista(id){if(!CONQUISTAS[id]||CONQ[id])return;CONQ[id]=Date.now();gravaJSON('cdr.conquistas',CONQ);avisoConquista(id)}
// Soma um contador e desbloqueia as conquistas que dependem dele.
function conta(nome,v=1){ESTAT[nome]=(ESTAT[nome]||0)+v;gravaJSON('cdr.estat',ESTAT);for(const[id,c]of Object.entries(CONQUISTAS))if(c.cont==nome&&ESTAT[nome]>=c.meta)conquista(id)}

// Aviso que desce do alto da tela, um de cada vez.
const FILA_AVISO=[];let avisando=false;
function avisoConquista(id){FILA_AVISO.push(id);if(!avisando)proximoAviso()}
function proximoAviso(){const id=FILA_AVISO.shift();if(!id){avisando=false;return}avisando=true;const c=CONQUISTAS[id],el=document.createElement('div');el.className='aviso-conq';
el.innerHTML=`<span class="ac-i">${c.i}</span><div><small>Conquista desbloqueada!</small><b>${c.n}</b></div>`;document.body.append(el);
if(typeof vinheta=='function')vinheta('aurora');else if(typeof sfx=='function')sfx('win');
// st é o setTimeout original (game.js): o aviso não some quando o jogo troca de tela e limpa os próprios temporizadores.
st(()=>el.classList.add('on'),30);st(()=>{el.classList.remove('on');st(()=>{el.remove();proximoAviso()},500)},3500)}

// Verificações que dependem do estado da campanha (chamadas ao salvar).
function confereCampanha(c){if(!c)return;if(c.ouro>=10000)conquista('milionario');if((c.herois||[]).length>=10)conquista('elenco_cheio');if(c.mina&&c.mina.melhorada)conquista('mina');
if(c.base&&typeof PREDIOS!='undefined'&&Object.entries(PREDIOS).every(([id,p])=>(c.base[id]||0)>=p.custos.length))conquista('castelo_completo')}
// Fim de batalha: vitórias, estrelas, finais de ato e desafios.
const CONQ_FASE={'desfiladeiro-do-ocaso':'ato1','salao-do-trono':'ato2','fortaleza-de-gelo':'gelheim','piramide-do-sol-negro':'areth','farol-afogado':'mare'};
function confereBatalha(v,n,vi,total){if(!v)return;conquista('primeira_vitoria');conta('vitorias');if(n>=3)conquista('tres_estrelas');
if(!LIVRE){if(CONQ_FASE[F.id])conquista(CONQ_FASE[F.id]);if(vi==total)conquista('sem_baixas');if(F.id=='salao-das-sombras'&&vi==total)conquista('sombras');if(F.escolhaFinal&&dif()=='dificil')conquista('dificil_final')}
if(FASES.every(f=>melhor(f.id)>=3))conquista('todas_estrelas')}
function confereFinal(id){conquista('final_'+id);const f=ESTAT.finais||{};f[id]=1;ESTAT.finais=f;gravaJSON('cdr.estat',ESTAT);if(f.devolver&&f.destruir)conquista('dois_finais')}

// ---------- Tela de Conquistas ----------
function telaConquistas(voltar=title){parar();if(typeof IN!='undefined'&&IN)IN.fechar();MP=null;ovl.hidden=false;const ids=Object.keys(CONQUISTAS),feitas=ids.filter(temConquista).length;
ovl.innerHTML=`<div class="sc painel conquistas"><h2>Conquistas</h2><p class="stat">${feitas} de ${ids.length} desbloqueadas</p><div class="xp barra-conq"><i style="width:${feitas/ids.length*100}%"></i></div>
<div class="lista-conq">${ids.map(id=>{const c=CONQUISTAS[id],ok=temConquista(id),oculta=c.secreta&&!ok,prog=c.cont&&!ok?` <small>(${Math.min(ESTAT[c.cont]||0,c.meta)}/${c.meta})</small>`:'';
return`<div class="conq${ok?' ok':''}"><span class="ci">${oculta?'❔':c.i}</span><div><b>${oculta?'Conquista secreta':c.n}</b><p>${oculta?'Continue a jornada para descobrir.':c.d}${prog}</p>${ok?`<small>Desbloqueada em ${new Date(CONQ[id]).toLocaleDateString('pt-BR')}</small>`:''}</div></div>`}).join('')}</div>
<div class="acts"><button id="cqv" class="on">Voltar</button></div></div>`;$('cqv').onclick=()=>voltar()}
