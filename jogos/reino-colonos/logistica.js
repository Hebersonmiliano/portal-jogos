// ===================== LOGÍSTICA: BANDEIRAS, ESTRADAS E MERCADORIAS =====================
// Como no Settlers 2: cada estrada liga duas bandeiras e tem um carregador, que leva as mercadorias
// de uma ponta à outra. Cada mercadoria sabe o prédio de destino e segue o caminho mais curto pela rede.
// J.band: bandeiras (chave 'x,y'), J.est: estradas, J.pred: prédios, J.col: colonos andando pelo mapa.
const MAX_BAND=8; // mercadorias que cabem numa bandeira
let J=null,ID=1,DIST={};
const novoId=()=>ID++;
const muda=()=>{DIST={}}; // a rede de estradas mudou: esquece as distâncias guardadas

// Distância pela rede, de cada bandeira até a bandeira alvo (Dijkstra, guardado até a rede mudar).
function distAte(alvo){if(DIST[alvo])return DIST[alvo];const d=new Map([[alvo,0]]),fila=[[0,alvo]];
while(fila.length){fila.sort((a,b)=>a[0]-b[0]);const[c,f]=fila.shift();if(c>d.get(f))continue;const b=J.band.get(f);if(!b)continue;
for(const id of b.est){const e=J.est.get(id),o=e.a==f?e.b:e.a,n=c+e.len;if(!d.has(o)||n<d.get(o)){d.set(o,n);fila.push([n,o])}}}
return DIST[alvo]=d}
const ligado=(a,b)=>!!a&&!!b&&distAte(b).has(a);
const naRede=f=>ligado(f,J.sede.band);
// Próxima estrada a pegar, saindo da bandeira de, para chegar à bandeira alvo.
function proxima(de,alvo){if(de==alvo)return null;const d=distAte(alvo);if(!d.has(de))return null;let m=null,mv=1e9;
for(const id of J.band.get(de).est){const e=J.est.get(id),o=e.a==de?e.b:e.a;if(d.has(o)&&e.len+d.get(o)<mv){mv=e.len+d.get(o);m=e}}return m}
const bandDe=it=>{const p=J.pred.get(it.dest);return p?p.band:null};

// ---------- Bandeiras ----------
function erroBandeira(x,y){const q=cel(x,y);if(!q)return'Fora do mapa';if(!q.dono)return'Fora do território';if(q.t=='a')return'Não dá para pôr na água';if(bloqueia(q.obj))return'Tem '+NOME_OBJ[q.obj.k].toLowerCase()+' no caminho';
if(q.uso){if(q.uso.k!='e')return'Este lugar já está ocupado';const e=J.est.get(q.uso.id),i=e.cam.findIndex(([a,b])=>a==x&&b==y);if(i<2||i>e.len-2)return'Muito perto de outra bandeira'}
for(const[dx,dy]of D8){const n=cel(x+dx,y+dy);if(n&&n.uso&&n.uso.k=='b')return'Muito perto de outra bandeira'}return''}
// Cria a bandeira. Se cair no meio de uma estrada, a estrada vira duas (e ganha mais um carregador).
function criaBandeira(x,y){const q=cel(x,y),key=k(x,y);if(q.obj&&q.obj.k=='F')q.obj=null;
const e=q.uso&&q.uso.k=='e'?J.est.get(q.uso.id):null,u=e&&e.car;
// O burro da estrada dividida volta para a sede (a estrada nova pede outro se continuar movimentada)
if(e){e.car=null;if(u&&u.item){const b=J.band.get(u.de);if(b&&b.itens.length<MAX_BAND){u.item.res=0;b.itens.push(u.item)}else perde(u.item);u.item=null}tiraEstrada(e)}
q.uso={k:'b',key};J.band.set(key,{x,y,key,itens:[],est:new Set()});
if(e){const i=e.cam.findIndex(([a,b])=>a==x&&b==y),e1=criaEstrada(e.cam.slice(0,i+1));criaEstrada(e.cam.slice(i));
if(u){e1.car=u;u.e=e1.id;u.pega=null;vaiPara(u,...e1.cam[e1.len>>1]);u.est='vai'}}
muda();return key}
function tiraBandeira(key){const f=J.band.get(key);if(!f||key==J.sede.band)return;
for(const id of[...f.est])tiraEstrada(J.est.get(id));
for(const p of[...J.pred.values()])if(p.band==key)demole(p);
f.itens.forEach(perde);cel(f.x,f.y).uso=null;J.band.delete(key);muda()}

// ---------- Estradas ----------
// cam: casas da estrada, da primeira à última bandeira. len: passos de uma ponta à outra.
function criaEstrada(cam){const e={id:novoId(),a:k(...cam[0]),b:k(...cam[cam.length-1]),cam,len:cam.length-1,car:null};
for(let i=1;i<cam.length-1;i++){const q=cel(...cam[i]);q.uso={k:'e',id:e.id};if(q.obj&&q.obj.k=='F')q.obj=null}
J.est.set(e.id,e);J.band.get(e.a).est.add(e.id);J.band.get(e.b).est.add(e.id);muda();return e}
function tiraEstrada(e){if(!e)return;for(let i=1;i<e.cam.length-1;i++)cel(...e.cam[i]).uso=null;J.est.delete(e.id);
for(const f of[e.a,e.b]){const b=J.band.get(f);if(b){b.est.delete(e.id);for(const it of b.itens)if(it.res==e.id)it.res=0}}
for(const u of[e.car,e.burro])if(u){if(u.item){const b=J.band.get(e.a)||J.band.get(e.b);if(b&&b.itens.length<MAX_BAND){u.item.res=0;b.itens.push(u.item)}else perde(u.item);u.item=null}voltaSede(u)}muda()}
// Casas de uma estrada entre os índices i0 e i1 (sem a de partida).
function trecho(e,i0,i1){const r=[],s=i1>i0?1:-1;for(let i=i0+s;s>0?i<=i1:i>=i1;i+=s)r.push(e.cam[i]);return r}

// ---------- Mercadorias ----------
// Muda o destino de uma mercadoria, mantendo a conta do que está a caminho de cada prédio (vindo).
function destina(it,pid){const v=J.pred.get(it.dest);if(v&&v!=J.sede)v.vindo[it.tipo]=(v.vindo[it.tipo]||0)-1;it.dest=pid;const n=J.pred.get(pid);if(n&&n!=J.sede)n.vindo[it.tipo]=(n.vindo[it.tipo]||0)+1}
function perde(it){destina(it,0)}
function entrega(p,it){if(p.obra)p.obra.tem[it.tipo]=(p.obra.tem[it.tipo]||0)+1;else p.estoque[it.tipo]=(p.estoque[it.tipo]||0)+1;if(p!=J.sede)p.vindo[it.tipo]--}
const novoItem=(tipo,dest)=>{const it={id:novoId(),tipo,dest:0,res:0};destina(it,dest);return it};
// ---------- Depósitos ----------
// A sede e os armazéns prontos guardam mercadorias. O que sobra vai para o depósito mais perto,
// e quem precisa recebe do depósito mais perto que tiver. Colonos e ferramentas ficam só na sede.
const ehDeposito=p=>!!p&&(p==J.sede||TIPOS[p.tipo].deposito&&!p.obra);
const depositos=()=>[...J.pred.values()].filter(ehDeposito);
const estoqueTotal=t=>depositos().reduce((a,p)=>a+(p.estoque[t]||0),0);
// Gasta n do tipo t tirando dos depósitos (usado pelos nascimentos)
function gastaDeposito(t,n){for(const p of depositos()){const v=Math.min(n,p.estoque[t]||0);p.estoque[t]=(p.estoque[t]||0)-v;n-=v;if(!n)break}return n==0}
function depositoPerto(f){let m=J.sede,mv=1e9;for(const p of depositos()){const d=distAte(p.band).get(f);if(d!=null&&d<mv){mv=d;m=p}}return m}
// Quanto falta chegar a um prédio: material da obra ou matéria-prima (a serraria guarda até 4 toras).
// Prédio com a produção parada não pede matéria-prima (mas a obra continua recebendo material).
function falta(p,t){if(ehDeposito(p)||p.dono)return 0;if(!p.obra&&p.parado)return 0;if(p.obra)return((TIPOS[p.tipo].custo[t]||0)-(p.obra.tem[t]||0)-(p.vindo[t]||0));const en=TIPOS[p.tipo].entrada;return en?(en[t]||0)-(p.estoque[t]||0)-(p.vindo[t]||0):0}
// Para onde vai o que acabou de ser produzido: entre os prédios ligados que precisam disso, o que tem menos
// guardado (as minas contam toda a comida); no empate, o que foi atendido há mais tempo e depois o mais perto.
// Assim duas minas dividem a comida, em vez de a mais perto ficar com tudo. A prioridade (p.prio: -1, 0, 1)
// vem antes de tudo. Ninguém precisa: vai para o depósito mais perto (ferramentas e burros, sempre para a sede).
// a vem antes de b? (compara posição por posição; a primeira diferença decide)
const antes=(a,b)=>{for(let i=0;i<a.length;i++)if(a[i]!=b[i])return a[i]<b[i];return false};
function guardado(p,t){const T=TIPOS[p.tipo],ts=T.qualquer?Object.keys(T.entrada):[t];return ts.reduce((a,x)=>a+(p.estoque[x]||0)+(p.vindo[x]||0),0)}
function escolheDestino(t,f){let m=null,mv=null;for(const p of J.pred.values())if(falta(p,t)>0){const dd=distAte(p.band).get(f);if(dd==null)continue;
const v=[-(p.prio||0),guardado(p,t),p.servido||0,dd];if(!mv||antes(v,mv)){mv=v;m=p}}
if(m){m.servido=J.t;return m.id}return(FERRAMENTAS.includes(t)||t=='burro'?J.sede:depositoPerto(f)).id}
function produz(p,t){const f=J.band.get(p.band);f.itens.push(novoItem(t,escolheDestino(t,p.band)));J.feito[t]=(J.feito[t]||0)+1}
// Abastece um prédio com um item do tipo t: primeiro o que já está na rede indo para um depósito;
// senão, sai do depósito mais perto que tiver (e com lugar na bandeira).
function abastece(p,t){const d=distAte(p.band);let m=null,mv=1e9;
for(const f of J.band.values()){const df=d.get(f.key);if(df==null||df>=mv)continue;for(const it of f.itens)if(it.tipo==t&&ehDeposito(J.pred.get(it.dest))){m=it;mv=df;break}}
if(m){destina(m,p.id);return true}
let dp=null,dv=1e9;for(const q of depositos()){const dd=d.get(q.band);if(dd!=null&&dd<dv&&(q.estoque[t]||0)>0&&J.band.get(q.band).itens.length<MAX_BAND){dv=dd;dp=q}}
if(dp){dp.estoque[t]--;J.band.get(dp.band).itens.push(novoItem(t,p.id));return true}return false}
// Roda a cada 0,4 s: entrega o que já chegou, manda para um depósito o que ficou sem destino e abastece:
// primeiro a prioridade alta, depois as obras, depois as oficinas.
function distribui(){
for(const f of J.band.values())for(const it of[...f.itens]){const p=J.pred.get(it.dest);
if(p&&p.band==f.key){f.itens.splice(f.itens.indexOf(it),1);entrega(p,it);continue}
if(!p||!ligado(f.key,p.band))destina(it,depositoPerto(f.key).id)}
const fila=[...J.pred.values()].filter(p=>!ehDeposito(p)&&naRede(p.band)).sort((a,b)=>(b.prio||0)-(a.prio||0)||(b.obra?1:0)-(a.obra?1:0)||a.id-b.id);
for(const p of fila)for(const t in ITEM){let n=falta(p,t);while(n-->0)if(!abastece(p,t))break}
// Movimento de cada estrada: quantas mercadorias esperam por ela nas pontas. Muito tempo cheia: pede um burro.
for(const e of J.est.values())e.fila=0;
for(const f of J.band.values())for(const it of f.itens){const bd=bandDe(it),e=bd&&proxima(f.key,bd);if(e)e.fila++}
for(const e of J.est.values())e.ocup=e.fila>=3?(e.ocup||0)+1:Math.max(0,(e.ocup||0)-1)}

// ---------- Carregadores ----------
// Estados: vai (saindo da sede até a estrada), espera (no meio da estrada), busca (vai até a mercadoria),
// leva (carrega até a outra ponta) e volta (retorna ao meio da estrada).
function pegaAqui(u,e,ponta){const f=J.band.get(ponta);if(!f)return false;
for(const it of f.itens){if(it.res)continue;const bd=bandDe(it);if(bd&&proxima(ponta,bd)===e){it.res=e.id;u.pega=it;u.de=ponta;const ia=ponta==e.a?0:e.len;u.cam=trecho(e,u.i,ia);u.i=ia;u.est='busca';return true}}return false}
function carregador(u,dt){const e=J.est.get(u.e);if(!e){voltaSede(u);return}const meio=e.len>>1;
if(u.est=='vai'){if(anda(u,dt)){u.i=meio;u.est='espera'}return}
if(u.est=='espera'){if(!pegaAqui(u,e,e.a))pegaAqui(u,e,e.b);return}
if(u.est=='volta'){if(anda(u,dt))u.est='espera';return}
if(u.est=='busca'){if(!anda(u,dt))return;const f=J.band.get(u.de),i=f?f.itens.indexOf(u.pega):-1;
if(i<0){u.pega=null;u.cam=trecho(e,u.i,meio);u.i=meio;u.est='volta';return}
f.itens.splice(i,1);u.item=u.pega;u.pega=null;u.para=u.de==e.a?e.b:e.a;const ib=u.para==e.a?0:e.len;u.cam=trecho(e,u.i,ib);u.i=ib;u.est='leva';return}
if(u.est=='leva'){if(!anda(u,dt))return;const it=u.item,f=J.band.get(u.para),p=J.pred.get(it.dest);
if(p&&p.band==u.para)entrega(p,it);else if(f.itens.length<MAX_BAND){it.res=0;f.itens.push(it)}
else{// Bandeira cheia: se alguém ali espera para seguir por esta mesma estrada, troca (deixa o que trouxe e leva o outro).
// Sem a troca, duas bandeiras cheias esperando uma pela outra travam a estrada para sempre.
const o=f.itens.find(x=>!x.res&&proxima(u.para,bandDe(x)||u.para)===e);if(!o)return;
f.itens.splice(f.itens.indexOf(o),1);it.res=0;f.itens.push(it);u.item=o;u.de=u.para;u.para=u.de==e.a?e.b:e.a;const ib=u.para==e.a?0:e.len;u.cam=trecho(e,u.i,ib);u.i=ib;return}
u.item=null;if(!pegaAqui(u,e,u.para)){u.cam=trecho(e,u.i,meio);u.i=meio;u.est='volta'}}}

// ---------- Colonos ----------
// Saem da sede (que guarda os colonos livres, J.sede.pop) e voltam para ela quando o trabalho acaba.
function anda(u,dt){let p=u.v*dt;u.mov=false;while(u.cam.length&&p>0){const[tx,ty]=u.cam[0],dx=tx-u.x,dy=ty-u.y,d=Math.hypot(dx,dy);if(d>0){u.dx=dx;u.dy=dy;u.mov=true}
if(d<=p){u.x=tx;u.y=ty;u.cam.shift();p-=d}else{u.x+=dx/d*p;u.y+=dy/d*p;p=0}}if(u.mov)u.passo+=dt;return!u.cam.length}
function vaiPara(u,tx,ty,perto){u.cam=caminho(Math.round(u.x),Math.round(u.y),tx,ty,andavelPara(tx,ty),perto)||[[tx,ty]]}
// Um ofício com ferramenta (FERRAMENTA, em predios.js) só sai se a sede tiver uma; ela volta ao estoque quando ele voltar.
function novoColono(of,tx,ty){const S=J.sede,f=FERRAMENTA[of];if(S.pop<=0||f&&!(S.estoque[f]>0))return null;const cam=caminho(S.x,S.y,tx,ty,andavelPara(tx,ty));if(!cam)return null;
S.pop--;if(f)S.estoque[f]--;const u={id:novoId(),of,ferr:f||null,x:S.x,y:S.y,cam,v:1.8,est:'vai',dx:1,dy:1,passo:0,t:0,hv:1};J.col.push(u);return u}
// Burro: não é colono (não sai da população); sai do estoque de burros da sede e volta para ele.
function novoBurro(e){const S=J.sede;if(!(S.estoque.burro>0))return null;const m=e.cam[e.len>>1],cam=caminho(S.x,S.y,m[0],m[1],andavelPara(m[0],m[1]));if(!cam)return null;
S.estoque.burro--;const u={id:novoId(),of:'burro',ferr:'burro',x:S.x,y:S.y,cam,v:2.2,est:'vai',dx:1,dy:1,passo:0,t:0,hv:1,e:e.id};J.col.push(u);return u}
function voltaSede(u){if(u.alvo&&u.alvo.o)u.alvo.o.res=false;if(u.pega)u.pega.res=0;Object.assign(u,{alvo:null,pega:null,volta:true,dentro:false,trab:false,leva:null});vaiPara(u,J.sede.x,J.sede.y)}
// Pede colonos para as estradas sem carregador, as obras sem construtor e os prédios prontos sem trabalhador.
function pedeColonos(){const S=J.sede;
for(const e of J.est.values()){if(!naRede(e.a)&&!naRede(e.b))continue;
if(!e.car){const m=e.cam[e.len>>1],u=novoColono('carregador',m[0],m[1]);if(u){u.e=e.id;e.car=u}}
// Estrada cheia por uns 4 s seguidos (ocup, contado em distribui): ganha um burro como segundo carregador
else if(!e.burro&&(e.ocup||0)>=10){const u=novoBurro(e);if(u)e.burro=u}}
// Prédios militares (e a sede) pedem soldados até encher as vagas; cada soldado leva uma espada da sede
// A fronteira vem primeiro: a sede só completa a própria guarnição quando os outros prédios militares estão cheios.
const faltaSold=p=>TIPOS[p.tipo].vagas-p.guar.length-J.col.filter(u=>u.of=='soldado'&&!u.dono&&u.est=='vai'&&u.p==p.id).length;
const mil=[...J.pred.values()].filter(p=>!p.dono&&!p.obra&&p.guar&&(p==S||naRede(p.band))&&!sobAtaque(p)).sort((a,b)=>(a==S)-(b==S));
for(const p of mil){if(p==S&&mil.some(q=>q!=S&&faltaSold(q)>0))break;if(faltaSold(p)<=0)continue;const u=novoColono('soldado',p.x,p.y);if(u){u.p=p.id;u.r=0;u.est='vai';continue}
// Sem espada (ou sem colono livre): um soldado da guarnição da sede vai para lá, se a sede ficar com pelo menos 1
if(p!=S&&S.guar&&S.guar.length>1&&!sobAtaque(S)){const cam=caminho(S.x,S.y,p.x,p.y,andavelPara(p.x,p.y));if(cam){S.guar.sort((a,b)=>a.r-b.r);const s=S.guar.pop();
J.col.push({id:novoId(),of:'soldado',r:s.r,x:S.x,y:S.y,cam,v:1.9,est:'vai',p:p.id,dx:1,dy:1,passo:0,t:0,hv:1})}}}
for(const p of J.pred.values()){if(p==S||p.dono||!naRede(p.band))continue;
if(p.obra&&!p.obreiro){const u=novoColono('construtor',p.x,p.y);if(u){u.p=p.id;p.obreiro=u}}
else if(!p.obra&&!p.trab&&TIPOS[p.tipo].of){const u=novoColono(TIPOS[p.tipo].of,p.x,p.y);if(u){u.p=p.id;p.trab=u}}}}
function atualizaColono(u,dt){if(u.of=='soldado')return soldado(u,dt);
if(u.volta){if(anda(u,dt)){const S=J.sede;J.col.splice(J.col.indexOf(u),1);if(u.of!='burro')S.pop++;if(u.ferr)S.estoque[u.ferr]=(S.estoque[u.ferr]||0)+1}return}
if(u.of=='carregador'||u.of=='burro')carregador(u,dt);else if(u.of=='construtor')construtor(u,dt);else if(u.of=='geologo')geologo(u,dt);else trabalhador(u,dt)}
