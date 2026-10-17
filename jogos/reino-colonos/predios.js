// ===================== PRÉDIOS E OFÍCIOS =====================
// custo: material da obra. of: ofício de quem trabalha no prédio. raio: até onde o trabalhador vai buscar.
// Oficinas: entrada (matéria-prima que o prédio pede à rede, e quanto guarda), saida, tempo (s) e acao (texto).
// terr: território que a guarita ocupada abre. campos: quantos campos de trigo a fazenda cuida.
const TIPOS={
sede:{fem:1,n:'Sede do Reino',militar:true,vagas:3,terr:10,d:'Guarda mercadorias e colonos. O território alcança 10 casas em volta. Com comida no estoque, nascem colonos novos.'},
lenhador:{n:'Lenhador',of:'lenhador',custo:{tabua:2},raio:6,d:'Corta as árvores por perto e faz toras.'},
florestal:{n:'Florestal',of:'florestal',custo:{tabua:2},raio:5,descanso:6,d:'Planta árvores novas por perto. Elas crescem em pouco mais de um minuto.'},
pedreira:{fem:1,n:'Pedreira',of:'pedreiro',custo:{tabua:2},raio:6,d:'Quebra as rochas por perto e faz pedras.'},
serraria:{fem:1,n:'Serraria',of:'serrador',custo:{tabua:2,pedra:2},entrada:{tora:4},saida:'tabua',tempo:5,acao:'Serrando',d:'Serra toras e faz tábuas.'},
pescador:{n:'Pescador',of:'pescador',custo:{tabua:2},raio:5,descanso:3,d:'Pesca na água por perto. Construa perto de um lago ou do mar.'},
fazenda:{fem:1,n:'Fazenda',of:'fazendeiro',custo:{tabua:2,pedra:2},raio:3,campos:6,d:'Semeia trigo em volta (até 6 campos) e colhe quando fica dourado. Precisa de espaço livre.'},
moinho:{n:'Moinho',of:'moleiro',custo:{tabua:2,pedra:2},entrada:{trigo:4},saida:'farinha',tempo:5,acao:'Moendo trigo',d:'Mói trigo e faz farinha.'},
padaria:{fem:1,n:'Padaria',of:'padeiro',custo:{tabua:2,pedra:2},entrada:{farinha:4},saida:'pao',tempo:6,acao:'Assando pão',d:'Assa pão com a farinha. Pão e peixe alimentam o reino.'},
mina_carvao:{fem:1,n:'Mina de carvão',of:'mineiro',custo:{tabua:4},mina:'carvao',raio:2,entrada:{pao:2,peixe:2},qualquer:true,saida:'carvao',tempo:6,acao:'Cavando carvão',d:'Construída na serra, em cima do carvão (pedrinhas pretas). Cada carvão custa uma comida.'},
mina_ferro:{fem:1,n:'Mina de ferro',of:'mineiro',custo:{tabua:4},mina:'ferro',raio:2,entrada:{pao:2,peixe:2},qualquer:true,saida:'ferro',tempo:6,acao:'Cavando ferro',d:'Construída na serra, em cima do ferro (pedrinhas cor de ferrugem). Cada minério custa uma comida.'},
mina_ouro:{fem:1,n:'Mina de ouro',of:'mineiro',custo:{tabua:4},mina:'ouro',raio:2,entrada:{pao:2,peixe:2},qualquer:true,saida:'ouro',tempo:8,acao:'Cavando ouro',d:'Construída na serra, em cima do ouro (pedrinhas douradas). O ouro fica guardado no tesouro da sede.'},
fundicao:{fem:1,n:'Fundição',of:'fundidor',custo:{tabua:2,pedra:3},entrada:{ferro:3,carvao:3},saida:'barra',tempo:6,acao:'Fundindo ferro',d:'Derrete minério de ferro com carvão e faz barras de ferro. Precisa de uma Mina de ferro e uma Mina de carvão funcionando, e as minas precisam de comida (Pescador ou Padaria).'},
armazem:{n:'Armazém',deposito:true,custo:{tabua:4,pedra:3},d:'Um depósito longe da sede: guarda o que sobra por perto e abastece os prédios em volta, e as estradas ficam mais curtas. Construa onde o reino já está longe da sede.'},
estabulo:{n:'Estábulo',of:'tratador',custo:{tabua:3,pedra:2},entrada:{trigo:2},saida:'burro',limite:3,tempo:14,acao:'Criando um burro',d:'Cria burros com trigo. Numa estrada cheia, um burro entra como segundo carregador e o transporte dobra. Mantém até 3 burros de reserva na sede.'},
ferraria:{fem:1,n:'Ferraria',of:'ferreiro',custo:{tabua:2,pedra:2},entrada:{barra:2,tabua:2},saida:'*ferramenta',tempo:7,acao:'Forjando',d:'Com uma barra de ferro e uma tábua, forja a ferramenta que estiver faltando. Sem ferramenta, os prédios novos ficam sem trabalhador.'},
guarita:{fem:1,n:'Guarita',militar:true,vagas:1,custo:{tabua:1,pedra:1},terr:8,d:'Construa perto da fronteira (os marcos azuis). Um soldado (com espada) ocupa a guarita e o território cresce 8 casas em volta dela. É assim que se chega à serra e aos minérios.'},
quartel:{n:'Quartel',militar:true,vagas:3,custo:{tabua:3,pedra:4},terr:11,d:'Prédio militar forte: 3 soldados de guarnição e território de 11 casas. Guarde a fronteira com o reino rival com quartéis.'},
armaria:{fem:1,n:'Armaria',of:'armeiro',custo:{tabua:2,pedra:2},entrada:{barra:1,carvao:1},saida:'espada',limite:6,tempo:8,acao:'Forjando espada',d:'Faz espadas com barra de ferro e carvão. Cada soldado precisa de uma espada. Mantém até 6 na sede.'}};

// ---------- Ferramentas ----------
// Como no Settlers 2: um colono livre só vira trabalhador de um ofício se a sede tiver a ferramenta dele.
// A ferramenta sai do estoque quando ele sai da sede e volta junto quando ele volta.
const FERRAMENTA={soldado:'espada',lenhador:'machado',pedreiro:'picareta',mineiro:'picareta',florestal:'pa',fazendeiro:'foice',pescador:'vara',construtor:'martelo',fundidor:'martelo',ferreiro:'martelo',serrador:'serrote',geologo:'martelo'};
const FERRAMENTAS=['machado','picareta','pa','foice','vara','martelo','serrote'];
const FERR_INICIAL={machado:3,picareta:4,pa:2,foice:2,vara:2,martelo:6,serrote:2};
const RESERVA_FERR=2; // sem pedido, a ferraria mantém pelo menos 2 de cada na sede
// Quantos prédios (e obras) estão parados esperando cada ferramenta
function faltaFerramentas(){const S=J.sede,d={};for(const p of J.pred.values()){if(p==S||!naRede(p.band))continue;
const of=p.obra?(!p.obreiro&&'construtor'):(!p.trab&&TIPOS[p.tipo].of),f=of&&FERRAMENTA[of];if(f&&!(S.estoque[f]>0))d[f]=(d[f]||0)+1}return d}
// Ferramenta que a ferraria deve forjar agora: a mais pedida; sem pedidos, a que estiver abaixo da reserva. null: nada a fazer.
function ferramentaNecessaria(){const d=faltaFerramentas(),tem=f=>(J.sede.estoque[f]||0)+contaNaRede(f);
let m=null,mv=0;for(const f of FERRAMENTAS){const v=(d[f]||0)-tem(f);if(v>mv){mv=v;m=f}}if(m)return m;
let b=null,bv=RESERVA_FERR;for(const f of FERRAMENTAS){const v=tem(f);if(v<bv){bv=v;b=f}}return b}
function contaNaRede(t){let n=0;for(const f of J.band.values())for(const it of f.itens)if(it.tipo==t)n++;for(const u of J.col)if(u.item&&u.item.tipo==t)n++;return n}
// Minério que uma mina ainda alcança (casa de serra a até raio casas, com min do tipo certo).
// conhecido: só conta o que um geólogo já achou (q.desc) — vale para escolher onde construir.
function achaMinerio(x0,y0,kd,R,conhecido){let m=null,mv=1e9;for(let y=y0-R;y<=y0+R;y++)for(let x=x0-R;x<=x0+R;x++){const q=cel(x,y),d=Math.hypot(x-x0,y-y0);if(q&&q.min&&q.min.k==kd&&q.min.q>0&&(!conhecido||q.desc)&&d<=R+.3&&d<mv){mv=d;m={x,y}}}return m}
const TEMPO_MATERIAL=2.5; // segundos de trabalho do construtor por material entregue

function erroPredio(x,y,tipo){const q=cel(x,y),f=cel(x+1,y+1),T=TIPOS[tipo]||{};if(!q||!f)return'Fora do mapa';if(!q.dono)return'Fora do território';
if(T.mina){if(q.t!='m')return'Mina só dá para construir na serra';if(!achaMinerio(x,y,T.mina,T.raio,true))return'Não há '+NOME_MIN[T.mina]+' conhecido aqui perto (mande um Geólogo, aba Minas)'}
else if(q.t!='g'&&q.t!='s')return'Só dá para construir em terra firme';
if(tipo=='pescador'&&!achaAgua({x,y},T.raio))return'Não há água aqui perto';if(bloqueia(q.obj))return'Tem '+NOME_OBJ[q.obj.k].toLowerCase()+' no caminho';if(q.uso)return'Este lugar já está ocupado';
if(Math.abs(q.h-f.h)>1)return'O terreno é íngreme demais';
for(const[dx,dy]of D8){const n=cel(x+dx,y+dy);if(n&&n.uso&&n.uso.k=='p')return'Muito perto de outro prédio'}
if(!(f.uso&&f.uso.k=='b')){const e=erroBandeira(x+1,y+1);if(e)return'Sem lugar para a bandeira da porta ('+e.toLowerCase()+')'}return''}
// A bandeira da porta fica na casa da frente (x+1, y+1), logo abaixo do prédio na tela.
function criaPredio(tipo,x,y){const fk=J.band.has(k(x+1,y+1))?k(x+1,y+1):criaBandeira(x+1,y+1),q=cel(x,y);q.obj=null;
const T=TIPOS[tipo],p={id:novoId(),tipo,x,y,band:fk,obra:T.custo?{tem:{},feito:0,total:Object.values(T.custo).reduce((a,b)=>a+b,0)}:null,estoque:{},vindo:{},trab:null,obreiro:null,status:''};
if(T.militar)p.guar=[]; // guarnição: os soldados dentro do prédio, cada um {r: patente}
q.uso={k:'p',id:p.id};J.pred.set(p.id,p);return p}
// Demolir um prédio militar manda os soldados de volta para a sede (com a espada) e o território encolhe.
function demole(p){if(p==J.sede||p.dono)return;J.pred.delete(p.id);cel(p.x,p.y).uso=null;for(const u of[p.trab,p.obreiro])if(u){u.x=p.x;u.y=p.y;voltaSede(u)}
for(const f of J.band.values())for(const it of f.itens)if(it.dest==p.id)it.dest=J.sede.id;
for(const u of J.col)if(u.item&&u.item.dest==p.id)u.item.dest=J.sede.id;
if(p.guar&&p.guar.length){for(const s of p.guar)desaloja(p,s);p.guar=[];territorio()}}
const pronto=t=>[...J.pred.values()].some(p=>p.tipo==t&&!p.obra);
// Quem produz cada mercadoria (para explicar ao jogador o que falta construir)
const PRODUTOR={tora:'lenhador',tabua:'serraria',pedra:'pedreira',peixe:'pescador',trigo:'fazenda',farinha:'moinho',pao:'padaria',carvao:'mina_carvao',ferro:'mina_ferro',ouro:'mina_ouro',barra:'fundicao'};
const ABA_DE=t=>{for(const[n,l]of CATEG)if(l.includes(t))return n;return''};
// Por que um prédio parado não trabalha: diz o que construir, ou como está o prédio que devia abastecê-lo.
function porQueParou(p){const T=TIPOS[p.tipo];if(p.obra||!T.entrada||!/^Esperando/.test(p.status||''))return'';
const precisa=T.qualquer?[COMIDA]:Object.keys(T.entrada).filter(t=>!(p.estoque[t]>0)).map(t=>[t]),dicas=[];
for(const op of precisa){if(op.some(t=>estoqueTotal(t)>0||(p.vindo[t]||0)>0))continue;const prod=op.map(t=>PRODUTOR[t]);
const feitos=[...J.pred.values()].filter(q=>prod.includes(q.tipo));
if(!feitos.length)dicas.push('Falta construir '+prod.map(t=>TIPOS[t].fem?'uma '+TIPOS[t].n:'um '+TIPOS[t].n).join(' ou ')+' (aba '+ABA_DE(prod[0])+').');
else for(const q of feitos)dicas.push(TIPOS[q.tipo].n+': '+(q.obra?'ainda em obra':!naRede(q.band)?'sem estrada até a sede':(q.status||'esperando o trabalhador')).toLowerCase()+'.')}
return dicas.join(' ')}

// Som e efeitos visuais só existem com a página aberta (som.js e jogo.js); a lógica roda sem eles nos testes.
const toca=(...a)=>{if(typeof som=='function')som(...a)},fx=e=>{if(typeof efeito=='function')efeito(e)};

// ---------- Construtor ----------
// Martela 2,5 s por material que já chegou na obra. Com tudo pronto, o prédio abre e ele volta para a sede.
function construtor(u,dt){const p=J.pred.get(u.p);if(!p||!p.obra){voltaSede(u);return}
if(u.est=='vai'){if(anda(u,dt)){u.est='obra';u.t=0}return}
const o=p.obra,tem=Object.values(o.tem).reduce((a,b)=>a+b,0);u.trab=o.feito<tem;if(!u.trab)return;
u.t+=dt;if(u.t<TEMPO_MATERIAL)return;u.t=0;o.feito++;
if(o.feito>=o.total){p.obra=null;p.obreiro=null;voltaSede(u);aviso(TIPOS[p.tipo].n+(TIPOS[p.tipo].fem?' pronta!':' pronto!'));toca('sino',.6)}}

// ---------- Onde cada ofício vai trabalhar ----------
// cresce: árvores e trigo só servem maduros (cresce = 1).
function achaObj(p,kd,R){let m=null,mv=1e9;for(let y=p.y-R;y<=p.y+R;y++)for(let x=p.x-R;x<=p.x+R;x++){const q=cel(x,y);if(!q||!q.obj||q.obj.k!=kd||q.obj.res||q.obj.cresce!=null&&q.obj.cresce<1)continue;
const d=Math.hypot(x-p.x,y-p.y);if(d<=R&&d<mv){mv=d;m={x,y,o:q.obj}}}return m}
function lugarPlantio(p,R){const op=[];for(let y=p.y-R;y<=p.y+R;y++)for(let x=p.x-R;x<=p.x+R;x++){const q=cel(x,y),d=Math.hypot(x-p.x,y-p.y);if(!q||d>R+.3||d<1.5||q.t!='g'||q.uso||bloqueia(q.obj))continue;
// Não planta encostado em prédio, bandeira ou estrada, para não fechar as passagens
if(D8.some(([dx,dy])=>{const n=cel(x+dx,y+dy);return n&&n.uso&&!(n.uso.k=='p'&&n.uso.id==p.id)}))continue;op.push({x,y,o:null})}return op.length?op[Math.floor(Math.random()*op.length)]:null}
// Água boa para pescar: tem pelo menos uma margem onde o pescador consegue ficar em pé.
function achaAgua(p,R){let m=null,mv=1e9;for(let y=p.y-R;y<=p.y+R;y++)for(let x=p.x-R;x<=p.x+R;x++){const q=cel(x,y),d=Math.hypot(x-p.x,y-p.y);if(!q||q.t!='a'||d>R||d>=mv)continue;
if(D8.some(([dx,dy])=>{const n=cel(x+dx,y+dy);return n&&n.t!='a'&&!(n.obj&&n.obj.k=='R')&&!(n.uso&&n.uso.k=='p')})){mv=d;m={x,y,o:null}}}return m}
const contaCampos=(p,R)=>{let n=0;for(let y=p.y-R;y<=p.y+R;y++)for(let x=p.x-R;x<=p.x+R;x++){const q=cel(x,y);if(q&&q.obj&&q.obj.k=='W')n++}return n};
// alvo: casa aonde ir, perto (para do lado, sem pisar) e acao (o trabalho feito lá).
function procura(p,T){const R=T.raio,a=(o,perto,acao)=>o&&{...o,perto,acao};
if(p.tipo=='lenhador')return a(achaObj(p,'T',R),true,'corta');
if(p.tipo=='pedreira')return a(achaObj(p,'R',R),true,'quebra');
if(p.tipo=='florestal')return a(lugarPlantio(p,R),false,'planta');
if(p.tipo=='pescador')return a(achaAgua(p,R),true,'pesca');
if(p.tipo=='fazenda'){const m=achaObj(p,'W',R);if(m)return a(m,false,'colhe');return contaCampos(p,R)<T.campos?a(lugarPlantio(p,R),false,'semeia'):null}}
const TEMPO_TRAB={corta:4,quebra:5,planta:3,pesca:6,colhe:3,semeia:2};
const ACAO={corta:'Cortando árvores',quebra:'Quebrando pedras',planta:'Plantando árvores',pesca:'Pescando',colhe:'Colhendo trigo',semeia:'Semeando trigo'};
const FALTA={lenhador:'Sem árvores crescidas por perto',pedreira:'Sem rochas por perto',florestal:'Sem lugar para plantar',pescador:'Sem água por perto',fazenda:'Esperando o trigo amadurecer'};

// ---------- Trabalhadores ----------
// Estados: vai (saindo da sede), casa (dentro do prédio), ir (até a árvore, rocha, água ou campo),
// trab (trabalhando lá), volta (para o prédio) e oficina (serraria, moinho e padaria trabalhando por dentro).
function trabalhador(u,dt){const p=J.pred.get(u.p);if(!p||p.obra){voltaSede(u);return}const T=TIPOS[p.tipo];
if(u.est=='vai'){if(anda(u,dt)){u.est='casa';u.dentro=true;u.t=1;p.status='Trabalhando'}return}
const cheia=J.band.get(p.band).itens.length>=MAX_BAND;
if(u.est=='casa'){u.t-=dt;if(u.t>0)return;
if(p.parado){p.status='Produção parada (clique para retomar)';u.t=1;return}
if(cheia){p.status='A bandeira da porta está cheia';u.t=1;return}
// Oficina com limite (estábulo): para quando já há reserva suficiente na sede e a caminho
if(T.limite&&estoqueTotal(T.saida)+contaNaRede(T.saida)>=T.limite){p.status='Reserva cheia: '+T.limite+' '+PLURAL[T.saida]+' na sede';u.t=3;return}
// Oficinas e minas: gastam a matéria-prima (todas as da entrada, ou qualquer uma delas nas minas) e trabalham por dentro
if(T.saida){const ent=Object.keys(T.entrada);
if(T.mina){const m=achaMinerio(p.x,p.y,T.mina,T.raio);if(!m){p.status='A mina se esgotou: acabou o '+NOME_MIN[T.mina]+' aqui';u.t=5;return}u.dep=m}
const sem=T.qualquer?!ent.some(t=>p.estoque[t]>0):ent.filter(t=>!(p.estoque[t]>0));
if(T.qualquer?sem:sem.length){p.status='Esperando '+(T.qualquer?'comida (pão ou peixe)':sem.map(t=>PLURAL[t]).join(' e '));u.t=.5;return}
// A ferraria decide a cada peça qual ferramenta forjar; sem nenhuma faltando, espera (não gasta ferro à toa)
let faz=T.saida;if(faz=='*ferramenta'){faz=ferramentaNecessaria();if(!faz){p.status='Ferramentas em dia: nenhuma faltando';u.t=3;return}}
if(T.qualquer)p.estoque[ent.find(t=>p.estoque[t]>0)]--;else ent.forEach(t=>p.estoque[t]--);
u.faz=faz;u.est='oficina';u.t=T.tempo;p.status=T.acao+(faz!=T.saida?' '+ITEM[faz].toLowerCase():'');return}
const alvo=procura(p,T);if(!alvo){p.status=FALTA[p.tipo];u.t=3;return}
const cam=caminho(p.x,p.y,alvo.x,alvo.y,andavelPara(alvo.x,alvo.y),alvo.perto);if(!cam){p.status='Não consegue chegar até lá';u.t=3;return}
if(alvo.o)alvo.o.res=true;u.alvo=alvo;u.acao=alvo.acao;u.cam=cam;u.dentro=false;u.est='ir';p.status=ACAO[alvo.acao];return}
if(u.est=='oficina'){u.t-=dt;if(u.t>0)return;
if(T.mina&&u.dep){const q=cel(u.dep.x,u.dep.y);if(q.min&&--q.min.q<=0)q.min=null;u.dep=null}
produz(p,u.faz||T.saida);u.faz=null;u.est='casa';u.t=.5;return}
if(u.est=='ir'){if(anda(u,dt)){u.est='trab';u.t=TEMPO_TRAB[u.acao];u.trab=true}return}
if(u.est=='trab'){u.t-=dt;if(u.t>0)return;u.trab=false;const a=u.alvo,q=cel(a.x,a.y),o=q.obj;u.alvo=null;
if(u.acao=='corta'){if(o&&o.k=='T'){q.obj=null;u.leva='tora';fx({k:'queda',x:a.x,y:a.y,v:o.v||0,lado:u.x-u.y<a.x-a.y?1:-1})}}
else if(u.acao=='quebra'){if(o&&o.k=='R'){o.res=false;if(--o.q<=0)q.obj=null;u.leva='pedra'}}
else if(u.acao=='colhe'){if(o&&o.k=='W'){q.obj=null;u.leva='trigo'}}
else if(u.acao=='pesca'){if(Math.random()<.8)u.leva='peixe'}
else if(!q.uso&&(!o||o.k=='F'))q.obj=u.acao=='planta'?{k:'T',cresce:.05,v:(a.x+a.y)%3}:{k:'W',cresce:0};
vaiPara(u,p.x,p.y);u.est='volta';return}
if(u.est=='volta'){if(anda(u,dt)){u.dentro=true;if(u.leva){produz(p,u.leva);u.leva=null}u.est='casa';u.t=T.descanso||2}}}

// ---------- Geólogo ----------
// Sai da sede até a bandeira escolhida e examina até 8 casas de serra a até 6 casas dela (3 s cada).
// Em cada uma finca uma plaquinha (q.placa) e o minério dali passa a ser conhecido (q.desc).
const GEO_RAIO=6,GEO_CASAS=8;
function enviaGeologo(fk){const f=J.band.get(fk);if(!naRede(fk))return'Esta bandeira não está ligada à sede';
let serra=false;for(let y=f.y-GEO_RAIO;y<=f.y+GEO_RAIO&&!serra;y++)for(let x=f.x-GEO_RAIO;x<=f.x+GEO_RAIO;x++){const q=cel(x,y);if(q&&q.t=='m'&&!q.placa&&Math.hypot(x-f.x,y-f.y)<=GEO_RAIO){serra=true;break}}
if(!serra)return'Não há serra sem plaquinha perto desta bandeira';
const u=novoColono('geologo',f.x,f.y);if(!u)return J.sede.pop<=0?'Não há colonos livres na sede':!(J.sede.estoque.martelo>0)?'Falta martelo na sede para o geólogo':'O geólogo não consegue chegar lá';
u.band=fk;u.feitos=0;return''}
function geologo(u,dt){const f=J.band.get(u.band);if(!f){voltaSede(u);return}
if(u.est=='vai'||u.est=='ir'){if(!anda(u,dt))return;if(u.est=='ir'){u.est='analisa';u.t=3;u.trab=true;return}u.est='procura'}
if(u.est=='analisa'){u.t-=dt;if(u.t>0)return;u.trab=false;const q=cel(u.alvo.x,u.alvo.y);q.desc=1;q.placa=1;u.feitos++;J.geol=(J.geol||0)+1;
if(q.min&&!u.achou){u.achou=1;aviso('O geólogo achou '+NOME_MIN[q.min.k]+'! Veja as plaquinhas na serra.')}u.alvo=null;u.est='procura'}
if(u.est=='procura'){if(u.feitos>=GEO_CASAS){voltaSede(u);return}const op=[];
for(let y=f.y-GEO_RAIO;y<=f.y+GEO_RAIO;y++)for(let x=f.x-GEO_RAIO;x<=f.x+GEO_RAIO;x++){const q=cel(x,y);if(q&&q.t=='m'&&!q.placa&&!q.uso&&Math.hypot(x-f.x,y-f.y)<=GEO_RAIO)op.push([Math.hypot(x-u.x,y-u.y)+Math.random()*1.5,x,y])}
op.sort((a,b)=>a[0]-b[0]);for(const[,x,y]of op.slice(0,5)){const cam=caminho(Math.round(u.x),Math.round(u.y),x,y,andavelPara(x,y),bloqueia(cel(x,y).obj));if(cam){u.alvo={x,y,o:null};u.cam=cam;u.est='ir';return}}
if(!u.achou)aviso('O geólogo não achou minério perto daquela bandeira.');voltaSede(u)}}

// Árvores plantadas e trigo crescem até ficarem maduros (cresce = 1). O trigo leva 1 minuto.
function cresce(dt){for(const l of M)for(const q of l){const o=q.obj;if(o&&o.cresce<1)o.cresce=Math.min(1,o.cresce+dt/(o.k=='W'?60:70))}}
// A sede transforma comida em gente: a cada 12 s, 2 comidas (peixe ou pão) viram um colono novo, até 150 no reino.
// Só usa a comida que sobra: enquanto alguma mina ligada à rede espera comida, ninguém nasce.
const COMIDA=['pao','peixe'],MAX_COLONOS=150;
function nascimentos(dt){const S=J.sede;J.comidaT=(J.comidaT||0)+dt;if(J.comidaT<12)return;J.comidaT=0;
const tem=COMIDA.reduce((a,t)=>a+estoqueTotal(t),0);if(tem<2||totalColonos()>=MAX_COLONOS)return;
if([...J.pred.values()].some(p=>!p.obra&&TIPOS[p.tipo].mina&&naRede(p.band)&&COMIDA.some(t=>falta(p,t)>0)))return;
let n=2;for(const t of COMIDA)while(n>0&&estoqueTotal(t)>0){gastaDeposito(t,1);n--}S.pop++;J.nascidos=(J.nascidos||0)+1;toca('nasce',.45);
if(J.nascidos==1)aviso('Nasceu o primeiro colono novo! Comida na sede faz o reino crescer.')}
