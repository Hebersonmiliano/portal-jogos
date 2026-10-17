// ===================== MILITAR: SOLDADOS, GUARNIÇÕES, PATENTES E COMBATE =====================
// Prédios militares (TIPOS[...].militar: sede, guarita, quartel) guardam soldados em p.guar ([{r: patente}]).
// Um prédio militar com soldados alcança território. Para tomar um prédio inimigo, os atacantes vão até
// a porta e duelam um de cada vez com os defensores; com a guarnição vazia, o primeiro que chegar ocupa.
// Tomar a sede inimiga vence a partida; perder a sua é a derrota.
const PATENTES=['Recruta','Cabo','Sargento','Capitão'],MAX_PAT=3,TEMPO_DUELO=2.4,ALCANCE_ATAQUE=16,PROMO_S=20;
const militar=p=>!!p&&!!TIPOS[p.tipo].militar,donoDe=x=>x.dono||0;
const sedeDe=d=>d?J.rival&&J.pred.get(J.rival.sede):J.sede;
const forca=g=>g.reduce((a,s)=>a+1+s.r,0);
const estrelas=r=>'★'.repeat(r+1);
// Prédio sob ataque (duelo na porta ou inimigos a caminho dele): não recebe reforços até o ataque acabar
const sobAtaque=p=>!!p.luta||J.col.some(u=>u.of=='soldado'&&u.alvo==p.id&&donoDe(u)!=donoDe(p));
// Gente do reino do jogador: livres na sede, andando pelo mapa (sem os burros) e soldados nas guarnições
function totalColonos(){let n=J.sede.pop;for(const u of J.col)if(!u.dono&&u.of!='burro')n++;for(const p of J.pred.values())if(!p.dono&&p.guar)n+=p.guar.length;return n}
function soldadosDe(d){let n=0;for(const p of J.pred.values())if(donoDe(p)==d&&p.guar)n+=p.guar.length;for(const u of J.col)if(u.of=='soldado'&&donoDe(u)==d)n++;if(d&&J.rival)n+=J.rival.reserva.length;return n}

// ---------- Soldados andando ----------
// Estados: vai (para a guarnição do prédio u.p), ataca (até o prédio u.alvo) e cerco (na porta, esperando o duelo).
function soldado(u,dt){const d=donoDe(u);
if(u.est=='vai'){const p=J.pred.get(u.p);if(!p||donoDe(p)!=d||p.obra){retorna(u);return}if(anda(u,dt))entraGuarnicao(p,u);return}
const a=J.pred.get(u.alvo);if(!a||donoDe(a)==d){retorna(u);return}
if(u.est=='ataca'){if(anda(u,dt))u.est='cerco';return}
if(u.est=='cerco'){u.trab=!!(a.luta&&a.luta.u==u.id);if(a.luta)return;
if(!a.guar||!a.guar.length){captura(a,u);return}a.luta={u:u.id,t:TEMPO_DUELO};u.trab=true}}
function tiraUnidade(u){const i=J.col.indexOf(u);if(i>=0)J.col.splice(i,1)}
function entraGuarnicao(p,u){tiraUnidade(u);const vagas=TIPOS[p.tipo].vagas;
if(p.guar.length<vagas){p.guar.push({r:u.r||0});if(p.guar.length==1&&p!=sedeDe(donoDe(p))){territorio();if(!p.dono){aviso(TIPOS[p.tipo].n+' ocupad'+(TIPOS[p.tipo].fem?'a':'o')+' por um soldado: o território cresceu!');toca('sino',.6)}}return}
// Sem vaga: na sede do jogador ele vira colono livre de novo (a espada volta ao estoque); no rival, volta à reserva
if(!donoDe(p)){J.sede.pop++;J.sede.estoque.espada=(J.sede.estoque.espada||0)+1}else if(J.rival)J.rival.reserva.push(u.r||0)}
// Volta para o prédio de onde saiu (se ainda for dele e tiver vaga) ou para a própria sede
function retorna(u){const d=donoDe(u),o=J.pred.get(u.orig),alvo=o&&donoDe(o)==d&&!o.obra&&o.guar&&o.guar.length<TIPOS[o.tipo].vagas?o:sedeDe(d);
if(!alvo){tiraUnidade(u);return}Object.assign(u,{est:'vai',p:alvo.id,alvo:null,trab:false});vaiPara(u,alvo.x,alvo.y)}
// Soldado que sai de um prédio demolido: anda até a sede do jogador
function desaloja(p,s){const u={id:novoId(),of:'soldado',r:s.r,x:p.x,y:p.y,cam:[],v:1.9,est:'vai',p:J.sede.id,dx:1,dy:1,passo:0,t:0,hv:1};vaiPara(u,J.sede.x,J.sede.y);J.col.push(u)}

// ---------- Duelos ----------
// Um duelo por prédio: 2,4 s de luta e um dos dois cai. Chance de vencer: (1 + patente), e o defensor
// tem 15% de vantagem por lutar em casa. O defensor é sempre o de patente mais alta.
function combate(dt){for(const p of J.pred.values()){const L=p.luta;if(!L)continue;L.t-=dt;if(L.t>0)continue;p.luta=null;
const u=J.col.find(x=>x.id==L.u);if(!u||!p.guar||!p.guar.length)continue;let di=0;p.guar.forEach((s,i)=>{if(s.r>p.guar[di].r)di=i});
const def=p.guar[di],pa=1+(u.r||0),pd=(1+def.r)*1.15;
if(Math.random()<pa/(pa+pd)){p.guar.splice(di,1);fx({k:'morte',x:p.x+.6,y:p.y+.6,dono:donoDe(p),r:def.r})}
else{tiraUnidade(u);u.trab=false;fx({k:'morte',x:u.x,y:u.y,dono:donoDe(u),r:u.r||0})}
// Prédio sem ninguém: perde o território na hora (a casa fica sem dono até alguém ocupar)
if(!p.guar.length&&p!=sedeDe(donoDe(p)))territorio()}}

// ---------- Ataque ----------
// Soldados disponíveis para atacar o alvo: dos prédios militares do reino d a até ALCANCE_ATAQUE casas,
// deixando 1 em cada prédio (2 na sede).
function fontesAtaque(alvo,d){const L=[];for(const p of J.pred.values()){if(donoDe(p)!=d||!militar(p)||p.obra||p.luta)continue;
const dist=Math.hypot(p.x-alvo.x,p.y-alvo.y);if(dist>ALCANCE_ATAQUE)continue;const n=p.guar.length-(p.tipo=='sede'?2:1);if(n>0)L.push([p,n,dist])}return L.sort((a,b)=>a[2]-b[2])}
const contaAtacantes=(alvo,d)=>fontesAtaque(alvo,d).reduce((a,f)=>a+f[1],0);
// Manda até n soldados (os de patente mais alta primeiro). Devolve quantos saíram.
function ataca(alvo,n,d){let env=0;for(const[p,k]of fontesAtaque(alvo,d)){p.guar.sort((a,b)=>b.r-a.r);
for(let i=0;i<k&&env<n;i++){const cam=caminho(p.x,p.y,alvo.x,alvo.y,andavelPara(alvo.x,alvo.y),true);if(!cam)break;const s=p.guar.shift();
J.col.push({id:novoId(),of:'soldado',dono:d||undefined,r:s.r,x:p.x,y:p.y,cam,v:1.9,est:'ataca',alvo:alvo.id,orig:p.id,dx:1,dy:1,passo:0,t:0,hv:1});env++}if(env>=n)break}return env}

// ---------- Conquista ----------
function captura(a,u){const d=donoDe(u),antigo=donoDe(a);tiraUnidade(u);
if(a.tipo=='sede'){fimDeJogo(d==0?'vitoria':'derrota');if(d==0)destroiRival();return}
// O prédio tomado do jogador sai da rede (bandeira e estradas) e o que vinha para ele vai para a sede
if(antigo==0){if(a.band){const b=a.band;a.band=null;tiraBandeira(b)}for(const f of J.band.values())for(const it of f.itens)if(it.dest==a.id)it.dest=J.sede.id}
a.dono=d||undefined;a.guar=[{r:u.r||0}];a.luta=null;a.vindo={};a.estoque={};a.prio=0;a.parado=false;
// Tomado pelo jogador: ganha uma bandeira na porta, se der, para ligar à rede
if(d==0){const fx0=a.x+1,fy0=a.y+1,q=cel(fx0,fy0);if(q&&!q.uso&&q.t!='a'&&!bloqueia(q.obj)&&!D8.some(([i,j])=>{const n=cel(fx0+i,fy0+j);return n&&n.uso&&n.uso.k=='b'}))a.band=criaBandeira(fx0,fy0)}
territorio();limpaFronteira();
for(const x of[...J.col])if(x.of=='soldado'&&x.alvo==a.id&&donoDe(x)==d)retorna(x);
if(d==0){aviso('Vitória! Você tomou '+(TIPOS[a.tipo].fem?'a ':'o ')+TIPOS[a.tipo].n+' do '+NOME_RIVAL+'.');toca('sino',.8);J.conquistas=(J.conquistas||0)+1}
else{aviso('⚔ O '+NOME_RIVAL+' tomou '+(TIPOS[a.tipo].fem?'a sua ':'o seu ')+TIPOS[a.tipo].n+'!');toca('corneta',.8)}}
// Depois de uma conquista: o que ficou no território do outro reino pega fogo (prédios comuns, bandeiras e estradas)
function limpaFronteira(){for(const p of[...J.pred.values()]){if(militar(p))continue;const q=cel(p.x,p.y),d=donoDe(p);if(d==0?q.dono:q.inim)continue;
fx({k:'fogo',x:p.x,y:p.y});if(d==0){aviso(TIPOS[p.tipo].n+' pegou fogo: ficou no território inimigo.');demole(p)}else{J.pred.delete(p.id);q.uso=null}}
for(const e of[...J.est.values()])if(e.cam.some(([x,y])=>cel(x,y).inim))tiraEstrada(e);
for(const f of[...J.band.values()])if(f.key!=J.sede.band&&cel(f.x,f.y).inim)tiraBandeira(f.key)}
function destroiRival(){for(const p of[...J.pred.values()])if(p.dono){fx({k:'fogo',x:p.x,y:p.y});J.pred.delete(p.id);cel(p.x,p.y).uso=null}
for(const u of[...J.col])if(u.dono)tiraUnidade(u);if(J.rival)J.rival.morto=true;territorio()}

// ---------- Patentes ----------
// A cada 20 s, 1 ouro (da sede ou dos armazéns) promove o soldado de patente mais baixa. O rival faz o mesmo com o ouro dele.
function promove(dt){J.promoT=(J.promoT||0)+dt;if(J.promoT<PROMO_S)return;J.promoT=0;
if(estoqueTotal('ouro')>0){const s=menorPatente(0);if(s){s.r++;gastaDeposito('ouro',1);J.promovidos=(J.promovidos||0)+1;if(J.promovidos==1)aviso('Um soldado foi promovido a '+PATENTES[s.r]+' com ouro! Patente alta vence mais duelos.')}}
const R=J.rival;if(R&&!R.morto&&R.ouro>=1){const s=menorPatente(1);if(s){s.r++;R.ouro--}}}
function menorPatente(d){let m=null;for(const p of J.pred.values())if(donoDe(p)==d&&p.guar)for(const s of p.guar)if(s.r<MAX_PAT&&(!m||s.r<m.r))m=s;return m}

// ---------- Fim de jogo ----------
function fimDeJogo(tipo){if(J.fim)return;J.fim=tipo;if(typeof mostraFim=='function')mostraFim(tipo)}
