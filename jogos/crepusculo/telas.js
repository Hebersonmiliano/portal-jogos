// ===================== TELAS: INÍCIO, GRUPO E LOJA =====================
// Itens do jogo. slot: 'arma', 'armadura', 'acessorio' ou 'consumivel'.
// Bônus (atk, hp, mp, mag, mov, spd, jmp) somam aos atributos de quem equipar. mag = Magia: aumenta o dano do Fogo e a cura.
// loja: onde é vendido ('vila' = Brumafria, 'castelo' = Arsenal de Valdren). Sem loja: só aparece em baús.
// para: classes que podem equipar (vale a classe atual ou a de origem). Sem para: qualquer classe. raro: só chefes deixam cair.
const ITENS={
// Vila de Brumafria
lamina:{n:'Lâmina de Aço',slot:'arma',atk:2,preco:120,txt:'+2 Ataque',loja:'vila',para:['K','L']},
runica:{n:'Lâmina Rúnica',slot:'arma',atk:4,preco:320,txt:'+4 Ataque',loja:'vila',para:['K','L']},
arco_teixo:{n:'Arco de Teixo',slot:'arma',atk:3,preco:180,txt:'+3 Ataque',loja:'vila',para:['A']},
cajado:{n:'Cajado de Carvalho',slot:'arma',mag:3,mp:3,preco:150,txt:'+3 Magia, +3 MP',loja:'vila',para:['M','C']},
couro:{n:'Couraça de Couro',slot:'armadura',hp:6,preco:100,txt:'+6 HP',loja:'vila'},
malha:{n:'Cota de Malha',slot:'armadura',hp:12,preco:260,txt:'+12 HP',loja:'vila',para:['K','A','L','R']},
tunica:{n:'Túnica de Linho',slot:'armadura',hp:4,mp:5,preco:120,txt:'+4 HP, +5 MP',loja:'vila',para:['M','C']},
botas:{n:'Botas Ligeiras',slot:'acessorio',mov:1,preco:240,txt:'+1 Movimento',loja:'vila'},
amuleto:{n:'Amuleto do Vento',slot:'acessorio',spd:3,preco:180,txt:'+3 Velocidade',loja:'vila'},
anel:{n:'Anel de Éter',slot:'acessorio',mp:6,preco:150,txt:'+6 MP',loja:'vila'},
// Anéis de ouro (ouroPct: soma para o grupo na batalha, até +60%) e de experiência (xpPct: só quem usa)
anel_fortuna:{n:'Anel da Fortuna',slot:'acessorio',ouroPct:15,preco:600,txt:'+15% de ouro nas batalhas (soma com outros, até +60%)',loja:'vila'},
anel_aprendiz:{n:'Anel do Aprendiz',slot:'acessorio',xpPct:25,preco:500,txt:'+25% de XP para quem usa (batalhas e missões)',loja:'vila'},
broche:{n:'Broche da Chama',slot:'acessorio',mag:2,mp:4,preco:200,txt:'+2 Magia, +4 MP',loja:'vila',para:['M','C']},
pocao:{n:'Poção',slot:'consumivel',cura:25,preco:40,txt:'Cura 25 HP de um aliado ao lado, na batalha',loja:'vila',lojas:['gelheim']},
// Arsenal do Castelo de Valdren: equipamentos das classes avançadas
espada_sagrada:{n:'Espada Sagrada',slot:'arma',atk:6,preco:520,txt:'+6 Ataque',loja:'castelo',para:['P']},
arco_elfico:{n:'Arco Élfico',slot:'arma',atk:5,spd:1,preco:500,txt:'+5 Ataque, +1 Velocidade',loja:'castelo',para:['T']},
cetro_rubro:{n:'Cetro Rubro',slot:'arma',mag:6,mp:6,preco:540,txt:'+6 Magia, +6 MP',loja:'castelo',para:['X']},
adagas_gemeas:{n:'Adagas Gêmeas',slot:'arma',atk:5,spd:2,preco:500,txt:'+5 Ataque, +2 Velocidade',loja:'castelo',para:['S']},
baculo_aurora:{n:'Báculo da Aurora',slot:'arma',mag:7,mp:8,preco:540,txt:'+7 Magia, +8 MP',loja:'castelo',para:['Z']},
placas:{n:'Armadura de Placas',slot:'armadura',hp:22,preco:480,txt:'+22 HP',loja:'castelo',para:['P']},
manto_arcano:{n:'Manto Arcano',slot:'armadura',hp:10,mp:10,preco:460,txt:'+10 HP, +10 MP',loja:'castelo',para:['X','Z']},
lanca_cavalaria:{n:'Lança de Cavalaria',slot:'arma',atk:5,preco:480,txt:'+5 Ataque',loja:'castelo',para:['R']},
couraca_sombra:{n:'Couraça das Sombras',slot:'armadura',hp:14,spd:1,preco:440,txt:'+14 HP, +1 Velocidade',loja:'castelo',para:['T','S']},
// Só em baús de inimigos
luvas:{n:'Luvas de Couro Batido',slot:'acessorio',atk:1,hp:4,txt:'+1 Ataque, +4 HP'},
anel_lobo:{n:'Anel do Lobo',slot:'acessorio',spd:2,txt:'+2 Velocidade'},
botas_salto:{n:'Botas de Salto',slot:'acessorio',jmp:1,txt:'+1 Salto'},
amuleto_brasa:{n:'Amuleto de Brasa',slot:'acessorio',hp:6,mag:2,txt:'+6 HP, +2 Magia'},
gibao:{n:'Gibão Reforçado',slot:'armadura',hp:9,txt:'+9 HP'},
// Tesouro da mina: não se equipa, só se vende
gema:{n:'Gema de Brasaferro',slot:'tesouro',txt:'Tesouro da mina: vende por 120 de ouro'},
// Raros: só os chefes deixam cair
machado_garra:{n:'Machado de Garra',slot:'arma',atk:7,txt:'+7 Ataque',raro:true,para:['K','L']},
cajado_cinzas:{n:'Cajado das Cinzas',slot:'arma',mag:8,mp:8,txt:'+8 Magia, +8 MP',raro:true,para:['M','C']},
anel_almas:{n:'Anel das Almas',slot:'acessorio',hp:6,mag:3,mp:10,txt:'+6 HP, +3 Magia, +10 MP',raro:true},
tiara_lago:{n:'Tiara do Lago',slot:'acessorio',hp:8,mag:4,mp:8,txt:'+8 HP, +4 Magia, +8 MP',raro:true},
lamina_negra:{n:'Lâmina Negra de Vorn',slot:'arma',atk:8,spd:1,txt:'+8 Ataque, +1 Velocidade',raro:true,para:['K','L']}};
// Baús: sorteio entre estes itens (poção aparece duas vezes para ser mais comum).
const LOOT=['luvas','anel_lobo','botas_salto','amuleto_brasa','gibao','pocao','pocao'];
// Lojas: quem atende e o que diz.
const LOJAS={vila:{nome:'Mercador Bram',spr:'N',fala:'Tempos sombrios, viajantes. Ouro na mão, e eu lhes dou aço.'},
castelo:{nome:'Armeira Isolda',spr:'P',fala:'Bem-vindos ao Arsenal de Valdren. Armas dignas de quem já domina sua arte.'}};
// TAM_GRUPO: heróis escolhidos na nova jornada. MAX_ELENCO: máximo de heróis no elenco (recrutados na taverna).
const TAM_GRUPO=5,MAX_ELENCO=10,PRECO_RECRUTA=250;
const SLOTS=[['arma','Arma'],['armadura','Armadura'],['acessorio','Acessório']];
// Evolução: XP para subir de nível, nível máximo e a classe avançada que cada classe libera.
const XP_NIVEL=100,NV_MAX=50;
// Linhas de evolução (EVOL) e habilidades (HAB) ficam em habilidades.js.
const evolDe=h=>EVOL[h.base]||[[h.base,1]];
// Classes que o herói já percorreu até a atual: ele pode usar os equipamentos de todas elas.
const linha=h=>{const ev=evolDe(h),i=ev.findIndex(([k])=>k==h.k);return ev.slice(0,i<0?1:i+1).map(([k])=>k)};
// Dificuldade: multiplica a vida (hp) e o ataque (atk) dos inimigos e o ouro ganho. Escolhida no menu inicial.
const DIF={facil:{n:'Fácil',hp:.75,atk:.8,ouro:1},normal:{n:'Normal',hp:1,atk:1,ouro:1},dificil:{n:'Difícil',hp:1.3,atk:1.2,ouro:1.5}},ORDEM_DIF=['facil','normal','dificil'];
let DIF_MEM=null;
// Tamanho da letra: escolhido no menu inicial e salvo no navegador. z = ampliação dos textos e painéis.
const FONTES={p:{n:'Pequena',z:1},m:{n:'Média',z:1.15},g:{n:'Grande',z:1.3},xg:{n:'Extra grande',z:1.5}},ORDEM_FONTE=['p','m','g','xg'];
let FONTE='m';try{const f=localStorage.getItem('cdr.fonte');if(FONTES[f])FONTE=f}catch(e){}
function aplicaFonte(){document.documentElement.style.setProperty('--fz',FONTES[FONTE].z);if(typeof fit=='function')requestAnimationFrame(fit)}
function proxFonte(){FONTE=ORDEM_FONTE[(ORDEM_FONTE.indexOf(FONTE)+1)%ORDEM_FONTE.length];try{localStorage.setItem('cdr.fonte',FONTE)}catch(e){}aplicaFonte()}
aplicaFonte();
// Velocidade da batalha: multiplica as pausas das animações (andar, turno dos inimigos).
const VELOCIDADES={normal:{n:'Normal',f:1},rapida:{n:'Rápida',f:.6},turbo:{n:'Muito rápida',f:.3}},ORDEM_VEL=['normal','rapida','turbo'];
let VELOC='normal';try{const v=localStorage.getItem('cdr.vel');if(VELOCIDADES[v])VELOC=v}catch(e){}
function proxVel(){VELOC=ORDEM_VEL[(ORDEM_VEL.indexOf(VELOC)+1)%ORDEM_VEL.length];try{localStorage.setItem('cdr.vel',VELOC)}catch(e){}}
// ---------- Tela de Opções ----------
function opcoes(voltar=title){parar();if(typeof IN!='undefined'&&IN)IN.fechar();MP=null;ovl.hidden=false;
const linhas=[
['Dificuldade',()=>DIF[dif()].n,proxDif,'Muda a vida e o ataque dos inimigos e o ouro ganho.'],
['Velocidade da batalha',()=>VELOCIDADES[VELOC].n,proxVel,'Deixa as animações e o turno dos inimigos mais rápidos.'],
['Tamanho da letra',()=>FONTES[FONTE].n,proxFonte,'Amplia textos, botões e painéis.'],
['Som',()=>on?'Ligado':'Desligado',()=>$('bz').onclick(),'Liga ou desliga todos os sons e a música.'],
['Volume da música',()=>{const v=typeof nomeVol=='function'?nomeVol():'—';return v[0].toUpperCase()+v.slice(1)},()=>{if(typeof proxVol=='function')proxVol()},'Volume da trilha sonora (com o som ligado).'],
['Tela cheia',()=>document.fullscreenElement?'Ligada':'Desligada',()=>$('bf').onclick(),'Usa o monitor inteiro.']];
const R=()=>{ovl.innerHTML=`<div class="sc painel opcoes"><h2>Opções</h2><div class="op-lista">${linhas.map(([n,v,,d],i)=>`<div class="op"><div><b>${n}</b><small>${d}</small></div><button data-op="${i}">${v()}</button></div>`).join('')}</div>
<div class="acts"><button id="opv" class="on">Voltar</button></div></div>`;
ovl.querySelectorAll('[data-op]').forEach(b=>b.onclick=()=>{linhas[+b.dataset.op][2]();setTimeout(R,linhas[+b.dataset.op][0]=='Tela cheia'?300:0)});$('opv').onclick=()=>voltar()};R()}
const dif=()=>{if(DIF_MEM)return DIF_MEM;try{const d=localStorage.getItem('cdr.dif');if(DIF[d])return DIF_MEM=d}catch(e){}return'normal'};
function proxDif(){DIF_MEM=ORDEM_DIF[(ORDEM_DIF.indexOf(dif())+1)%ORDEM_DIF.length];try{localStorage.setItem('cdr.dif',DIF_MEM)}catch(e){}}

// ---------- Heróis ----------
function criaHerois(ks){const c=camp()||novaCamp(),cn={};
c.herois=ks.map(k=>{cn[k]=(cn[k]||0)+1;return{nome:NM[k][cn[k]-1],k,base:k,nv:1,xp:0,eq:{arma:null,armadura:null,acessorio:null}}});
c.grupo=[...ks];salvaCamp();PARTY=[...ks]}
function garanteHerois(){const c=camp();if(!c)return;
if(c.ouro==null)c.ouro=150;if(!c.bolsa)c.bolsa={pocao:2,itens:{}};
if(!c.herois||!c.herois.length)criaHerois(c.grupo||PARTY);
for(const k of['L','C','K','A','M']){if(c.herois.length>=TAM_GRUPO)break;c.herois.push(novoHeroi(k,1))}
salvaCamp();PARTY=c.herois.map(h=>h.k)}
function novoHeroi(k,nv){const n=(camp().herois||[]).filter(h=>h.base==k).length;
return{nome:NM[k][n]||CL[k].n+' '+(n+1),k,base:k,nv,xp:0,eq:{arma:null,armadura:null,acessorio:null}}}
const podeUsar=(h,it)=>!it.para||it.para.some(k=>linha(h).includes(k));
const nomesClasses=it=>it.para?it.para.map(k=>CL[k].n).join(', '):'Todos';
function addItem(id){const c=camp();if(!c)return;if(id=='pocao')c.bolsa.pocao++;else c.bolsa.itens[id]=(c.bolsa.itens[id]||0)+1;salvaCamp()}
function stats(h){const c=CL[h.k],n=h.nv-1,s={hp:c.hp+n*(h.base=='K'?4:3),mp:c.mp?c.mp+n:0,atk:c.atk+Math.floor(n/2),mov:c.mov,jmp:c.jmp,spd:c.spd+Math.floor(n/4),mag:0};
const fz=typeof nivelPredio=='function'?nivelPredio('ferreiro'):0;
for(const[sl]of SLOTS){const it=ITENS[h.eq[sl]];if(!it)continue;for(const a of['hp','mp','atk','mag','mov','spd','jmp'])if(it[a])s[a]+=it[a];
if(fz&&sl=='arma'){if(it.atk)s.atk+=fz;if(it.mag)s.mag+=fz}if(fz&&sl=='armadura')s.hp+=3*fz}
// Torre do Mago: bônus para quem tem habilidade de magia (magos, clérigos, paladinos e as classes avançadas deles).
const tm=typeof nivelPredio=='function'?nivelPredio('torre'):0;if(tm&&SK[h.k]){s.mag+=2*tm;s.mp+=3*tm}return s}
// Soma de um bônus percentual (ouroPct, xpPct) nos equipamentos de um herói.
const bonusEq=(h,campo)=>SLOTS.reduce((s,[sl])=>s+((ITENS[h.eq[sl]]||{})[campo]||0),0);
const MAX_OURO_PCT=60;
const pocoes=()=>{const c=typeof camp=='function'&&camp();return c&&c.bolsa?c.bolsa.pocao:0};
const heroisAtuais=()=>{const c=typeof camp=='function'&&camp();return c&&c.herois&&c.herois.length?c.herois:null};
function pocao(a,t){const c=camp();c.bolsa.pocao--;salvaCamp();setF(a,t.x,t.y);sfx('heal');const v=Math.min(ITENS.pocao.cura,t.mhp-t.hp);
t.hp+=v;pop(t,'+'+v,'#4cd37e');msg(`${a.name} usa uma Poção em ${t.name}: +${v}.`)}

// Recompensas no fim da batalha: ouro para o grupo e XP para cada herói.
function recompensa(v,n,al){const c=camp();if(!c||!c.herois)return'';const base=LIVRE?Math.round((F.ouro||200)/2):(F.ouro||200),pctOuro=Math.min(MAX_OURO_PCT,al.reduce((s,u)=>s+(c.herois[u.hi]?bonusEq(c.herois[u.hi],'ouroPct'):0),0)),ouro=Math.round((v?base+n*50:40)*DIF[dif()].ouro*(1+pctOuro/100));c.ouro+=ouro;const ls=[];
const perdidos=BAUS.length;BAUS.length=0;
const dia=typeof avancaDia=='function'?avancaDia(al.map(u=>u.hi)):[];
const baus=COLETADOS.map(b=>b.raro?`<b class="novo">${ITENS[b.item].n} (raro!)</b>`:ITENS[b.item].n);
for(const u of al){const h=c.herois[u.hi];if(!h)continue;let xp=(v?60:25)+(u.kills||0)*20;const pxp=bonusEq(h,'xpPct');if(u.hp<=0&&!(typeof nivelPredio=='function'&&nivelPredio('capela')>1))xp=Math.round(xp/2);
if(pxp)xp=Math.round(xp*(1+pxp/100));const antes=h.nv;h.xp+=xp;while(h.xp>=XP_NIVEL&&h.nv<NV_MAX){h.xp-=XP_NIVEL;h.nv++}if(h.nv>=NV_MAX)h.xp=0;if(typeof conquista=='function')for(const[nv,id]of[[5,'nv5'],[12,'nv12'],[30,'nv30'],[50,'nv50']])if(h.nv>=nv)conquista(id);
let l=`${h.nome}: +${xp} XP${pxp?` (+${pxp}% pelo anel)`:''}`;if(h.nv>antes)l+=` · <b>subiu para o nível ${h.nv}!</b>`;
for(const[k,nv]of evolDe(h))if(nv>1&&antes<nv&&h.nv>=nv)l+=` · <b class="novo">Nova classe liberada: ${CL[k].n}!</b>`;ls.push(l)}
return`<div class="recomp">${v&&F.fragmento&&!LIVRE?'<p><b class="novo">✦ Fragmento da Aurora recuperado! A Espada Celestial agora carrega 20% mais rápido.</b></p>':''}${v&&F.conquista&&!LIVRE?'<p><b class="novo">⚔ Espada Celestial obtida! 🏰 O Castelo de Valdren agora é a base do grupo!</b></p>':''}<p><b>+${ouro} de ouro</b>${pctOuro?` (+${pctOuro}% pelos anéis)`:''} (total: ${c.ouro})</p>${baus.length?`<p>Baús abertos: ${baus.join(', ')}</p>`:''}${perdidos?`<p class="perdido">${perdidos} baú${perdidos>1?'s ficaram':' ficou'} para trás e se perdeu.</p>`:''}${ls.map(l=>`<p>${l}</p>`).join('')}${dia.length?`<p><b>Enquanto isso:</b></p>${dia.map(l=>`<p>${l}</p>`).join('')}`:''}</div>`}

// ---------- Baús ----------
// Todo inimigo derrotado deixa um baú no chão: é preciso andar até ele, e os que ficarem para trás se perdem.
// Chefes da história deixam o item raro do campo drop, que vai direto para a bolsa.
function soltaBau(t){if(typeof ITENS=='undefined')return;const lt=F.loot||LOOT,item=!LIVRE&&t.drop?t.drop:lt[Math.floor(Math.random()*lt.length)],raro=!!ITENS[item].raro;
if(raro){addItem(item);if(typeof conta=='function')conta('raros');COLETADOS.push({item,raro});msg(`${t.name} deixou cair ${ITENS[item].n} (raro)! Guardado na bolsa.`);return}
BAUS.push({x:t.x,y:t.y,item,raro});msg(`${t.name} deixou cair um baú! Ande até ele para abrir.`)}
function pegaBau(u){const i=BAUS.findIndex(b=>b.x==u.x&&b.y==u.y);if(i<0)return;const b=BAUS.splice(i,1)[0];if(typeof conta=='function')conta('baus');addItem(b.item);COLETADOS.push(b);
sfx('heal');pop(u,ITENS[b.item].n,b.raro?'#d58bff':'#ffd45a');msg(`${u.name} abriu o baú: ${ITENS[b.item].n}${b.raro?' (raro!)':''}.`)}

// ---------- Tela inicial ----------
let TL=null;
function title(){parar();if(typeof tocar=='function')tocar('titulo');if(typeof IN!='undefined'&&IN)IN.fechar();MP=null;const vivo=cur&&!over,cj=heroisAtuais()?camp():null;ovl.hidden=false;
const ops=[];if(vivo)ops.push(['Continuar batalha',retomar]);if(vivo&&cj)ops.push(['Voltar ao mapa (abandonar batalha)',()=>{largaBatalha();garanteHerois();mapa()}]);if(cj&&!vivo)ops.push([`Continuar jornada · ${escHtml(cj.nome||'Jornada '+SLOT)}`,()=>{garanteHerois();mapa()}]);
ops.push(['Nova jornada',()=>saves('novo')],['Jogos salvos',()=>saves()],['Conquistas',()=>telaConquistas()],['Opções',()=>opcoes()],['Ver a história',intro]);
ovl.innerHTML=`<canvas id="tc" aria-hidden="true"></canvas><div class="tela-inicio"><h1 class="logo">Crepúsculo dos Reinos</h1><div class="filete"><span>Uma história de tática por turnos</span></div><ul class="tmenu" role="menu">${ops.map(o=>`<li><button role="menuitem">${o[0]}</button></li>`).join('')}</ul><p class="copy">© 2026 · Crepúsculo dos Reinos</p></div>`;
let escolhido=0;const bs=[...ovl.querySelectorAll('.tmenu button')],marca=i=>{escolhido=i;bs.forEach((b,j)=>b.classList.toggle('sel',j==i))};
const t0=performance.now(),ativa=i=>{if(performance.now()-t0>350)ops[i][1](bs[i])};
bs.forEach((b,i)=>{b.onmouseenter=()=>marca(i);b.onfocus=()=>marca(i);b.onclick=()=>ativa(i)});marca(0);
TL={c:$('tc'),t0,qual:()=>escolhido,marca,n:bs.length,ativa};requestAnimationFrame(desenhaTitulo);
// Modo feira: sem ninguém mexer no menu por 40 s, a abertura volta a rodar.
if(!vivo)setTimeout(()=>{if(TL&&document.contains(TL.c))intro()},40000)}
addEventListener('keydown',e=>{if(!TL||!document.contains(TL.c))return;
if(e.key=='ArrowDown'||e.key=='ArrowUp'){e.preventDefault();TL.marca((TL.qual()+(e.key=='ArrowDown'?1:TL.n-1))%TL.n)}
else if(e.key=='Enter'||e.key==' '){e.preventDefault();TL.ativa(TL.qual())}});
function desenhaTitulo(now){if(!TL||!document.contains(TL.c))return;const c=TL.c,x=c.getContext('2d'),W=innerWidth,H=innerHeight,D=devicePixelRatio||1,t=Math.max(0,(now-TL.t0)/1000);
if(c.width!=Math.round(W*D)||c.height!=Math.round(H*D)){c.width=Math.round(W*D);c.height=Math.round(H*D)}
const k=Math.max(W/1280,H/720);x.setTransform(D*k,0,0,D*k,D*(W-1280*k)/2,D*(H-720*k)/2);
pergaminho(x,t);x.fillStyle='rgba(14,8,24,.64)';x.fillRect(0,0,1280,720);
for(let n=0;n<50;n++){const bx=(n*211+Math.sin(t*.7+n)*30)%1280,by=720-((t*28*(1+n%5*.3)+n*97)%760);
x.fillStyle=`rgba(255,${150+n%3*30},80,${.35+.3*Math.sin(t*3+n)})`;x.fillRect(bx,by,2,2)}
const v=x.createRadialGradient(640,360,200,640,360,760);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.85)');x.fillStyle=v;x.fillRect(0,0,1280,720);
requestAnimationFrame(desenhaTitulo)}

// ---------- Grupo: status, classes e equipamento ----------
function grupo(voltar=mapa){parar();if(typeof tocar=='function')tocar('vila');garanteHerois();MP=null;const c=camp();ovl.hidden=false;
const R=()=>{ovl.innerHTML=`<div class="sc painel"><h2>Grupo</h2><p class="stat">Ouro: <b>${c.ouro}</b> · Poções: <b>${c.bolsa.pocao}</b></p><div class="fichas">${c.herois.map((h,i)=>ficha(h,i,c)).join('')}</div><div class="acts"><button id="gv" class="on">Voltar</button></div></div>`;
c.herois.forEach((h,i)=>{const f=ovl.querySelector(`[data-h="${i}"]`);f.querySelector('.ret').append(pv(h.k,5));
f.querySelectorAll('[data-cl]').forEach(b=>b.onclick=()=>{h.k=b.dataset.cl;for(const[sl]of SLOTS){const it=ITENS[h.eq[sl]];if(it&&!podeUsar(h,it))equipa(h,sl,null)}salvaCamp();PARTY=c.herois.map(x=>x.k);sfx('heal');R()});
f.querySelectorAll('select').forEach(s=>s.onchange=()=>{equipa(h,s.dataset.sl,s.value||null);R()})});
$('gv').onclick=()=>voltar()};R()}
function ficha(h,i,c){const s=stats(h),xp=h.nv>=NV_MAX?100:h.xp/XP_NIVEL*100;
const cls=evolDe(h).map(([k,nv])=>{const livre=h.nv>=nv,atual=k==h.k;
return`<button class="cl${atual?' on':''}" data-cl="${k}"${livre&&!atual?'':' disabled'}>${livre?'':'🔒 '}${CL[k].n}${livre?'':` · Nv ${nv}`}</button>`}).join('');
const eq=SLOTS.map(([sl,nm])=>{const ops=Object.entries(ITENS).filter(([id,it])=>it.slot==sl&&podeUsar(h,it)&&(h.eq[sl]==id||(c.bolsa.itens[id]||0)>0));
return`<label>${nm}<select data-sl="${sl}"><option value="">— vazio —</option>${ops.map(([id,it])=>`<option value="${id}"${h.eq[sl]==id?' selected':''}>${it.n} (${it.txt})</option>`).join('')}</select></label>`}).join('');
return`<div class="ficha" data-h="${i}"><div class="ret"></div><div class="fdados"><h3>${h.nome}</h3><p>${CL[h.k].n} · Nível ${h.nv}${h.tarefa?` · <b class="tarefa">${descreveTarefa(h)}</b>`:''}</p>
<div class="xp" title="Experiência"><i style="width:${xp}%"></i></div><small>${h.nv>=NV_MAX?'Nível máximo':`XP ${h.xp} / ${XP_NIVEL}`}</small>
<div class="atr"><span>HP <b>${s.hp}</b></span><span>MP <b>${s.mp}</b></span><span>Ataque <b>${s.atk}</b></span><span>Mov <b>${s.mov}</b></span><span>Salto <b>${s.jmp}</b></span><span>Vel <b>${s.spd}</b></span><span>Magia <b>${s.mag}</b></span></div>
<p class="desc">${DS[h.k]}</p>${typeof HAB!='undefined'?`<p class="habs">${evolDe(h).map(([k,nv])=>{const ids=Object.keys(HAB).filter(id=>HAB[id].de==k),tem=linha(h).includes(k);return ids.map(id=>`<span class="hab${tem?' tem':''}" title="${HAB[id].txt}">${tem?'✔':'🔒'} ${HAB[id].n}${tem?'':` <small>(${CL[k].n}, Nv ${nv})</small>`}</span>`).join('')}).join('')}</p>`:''}<div class="cls">${cls}</div><div class="eqs">${eq}</div></div></div>`}
function equipa(h,sl,id){const b=camp().bolsa.itens,velho=h.eq[sl];if(velho==id)return;if(velho)b[velho]=(b[velho]||0)+1;if(id)b[id]--;h.eq[sl]=id;salvaCamp()}

// ---------- Lojas (Vila de Brumafria e Arsenal do Castelo de Valdren) ----------
const possui=id=>(camp().bolsa.itens[id]||0)+camp().herois.filter(h=>Object.values(h.eq).includes(id)).length;
// Venda: a loja paga metade do preço. Itens sem preço (baús e raros) têm um valor próprio em VALOR_VENDA.
const VALOR_VENDA={gema:120,luvas:90,anel_lobo:110,botas_salto:120,amuleto_brasa:130,gibao:100,machado_garra:400,cajado_cinzas:400,lamina_negra:450,tiara_lago:450,anel_almas:450};
const precoVenda=id=>Math.floor(ITENS[id].preco?ITENS[id].preco/2:VALOR_VENDA[id]||50);
function loja(tipo='vila',aba='comprar'){parar();if(typeof tocar=='function')tocar('vila');garanteHerois();MP=null;const c=camp(),L=LOJAS[tipo],venda=Object.entries(ITENS).filter(([,it])=>it.loja==tipo||(it.lojas||[]).includes(tipo));ovl.hidden=false;let confirma=null;
const naBolsa=()=>[...(c.bolsa.pocao>0?[['pocao',c.bolsa.pocao]]:[]),...Object.entries(c.bolsa.itens).filter(([,n])=>n>0)];
const R=fala=>{const linhas=aba=='comprar'
?venda.map(([id,it])=>`<tr><td>${it.n}</td><td>${it.txt}</td><td>${nomesClasses(it)}</td><td>${it.preco}</td><td>${id=='pocao'?c.bolsa.pocao:possui(id)}</td><td><button data-c="${id}"${c.ouro<it.preco?' disabled':''}>Comprar</button></td></tr>`).join('')
:naBolsa().map(([id,n])=>{const it=ITENS[id];return`<tr><td>${it.n}${it.raro?' <b class="raro">(raro)</b>':''}</td><td>${it.txt}</td><td>${nomesClasses(it)}</td><td>${precoVenda(id)}</td><td>${n}</td><td><button data-v="${id}">${confirma==id?'Confirmar venda':'Vender'}</button></td></tr>`}).join('')||'<tr><td colspan="6">Nada na bolsa para vender. Itens equipados não aparecem aqui: tire-os na tela do Grupo.</td></tr>';
ovl.innerHTML=`<div class="sc painel loja"><div class="npc"><div class="ret"></div><div><h2>${L.nome}</h2><p class="fala">“${fala}”</p></div></div><p class="stat">Seu ouro: <b>${c.ouro}</b></p>
<div class="abas"><button id="abc" class="${aba=='comprar'?'on':''}">Comprar</button><button id="abv" class="${aba=='vender'?'on':''}">Vender</button></div>
<div class="tabela"><table class="itens"><tr><th>Item</th><th>Efeito</th><th>Para</th><th>${aba=='comprar'?'Preço':'Paga'}</th><th>Possui</th><th></th></tr>${linhas}</table></div>
<div class="acts">${tipo=='vila'?'<button id="ltv">Taverna (recrutar)</button><button id="lqm">Missões e mina</button>':''}<button id="lgr">Grupo (equipar)</button><button id="lvm" class="on">Voltar ao mapa</button></div></div>`;
ovl.querySelector('.npc .ret').append(pv(L.spr,5));
$('abc').onclick=()=>{aba='comprar';confirma=null;R('O que vai levar?')};$('abv').onclick=()=>{aba='vender';confirma=null;R('Pago metade do preço de loja. Negócio justo em tempos difíceis.')};
ovl.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{const id=b.dataset.c,it=ITENS[id];if(c.ouro<it.preco)return;c.ouro-=it.preco;
addItem(id);sfx('heal');
R(id=='pocao'?'Uma poção nunca é demais nestas estradas.':`Boa escolha! ${it.n} está na sua bolsa. Equipe na tela do Grupo.`)});
ovl.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{const id=b.dataset.v,it=ITENS[id];
if(it.raro&&confirma!=id){confirma=id;R(`${it.n} é raro e não se encontra em loja nenhuma. Tem certeza? Clique de novo para confirmar.`);return}
confirma=null;if(id=='pocao'){if(c.bolsa.pocao<1)return;c.bolsa.pocao--}else{if(!(c.bolsa.itens[id]>0))return;c.bolsa.itens[id]--}
const v=precoVenda(id);c.ouro+=v;salvaCamp();sfx('pas');R(`Fechado: ${it.n} por ${v} de ouro.`)});
$('lgr').onclick=()=>grupo(()=>loja(tipo,aba));$('lvm').onclick=mapa;if(tipo=='vila'){$('ltv').onclick=taverna;$('lqm').onclick=()=>missoes(()=>loja('vila'))}};
R(aba=='vender'?'Pago metade do preço de loja. Negócio justo em tempos difíceis.':L.fala)}

// ---------- Taverna: recrutar heróis (elenco de até MAX_ELENCO) ----------
function taverna(){parar();if(typeof tocar=='function')tocar('vila');garanteHerois();const c=camp(),nvR=Math.max(1,Math.round(c.herois.reduce((s,h)=>s+h.nv,0)/c.herois.length)-1);ovl.hidden=false;
const R=fala=>{ovl.innerHTML=`<div class="sc painel loja"><div class="npc"><div class="ret"></div><div><h2>Taverna do Javali Dourado</h2><p class="fala">“${fala}”</p></div></div>
<p class="stat">Seu ouro: <b>${c.ouro}</b> · Elenco: <b>${c.herois.length}/${maxElenco()}</b> · Novos recrutas chegam no nível <b>${nvR}</b></p><div class="cards" id="tvc"></div>
<div class="acts"><button id="tvl">Voltar à loja</button><button id="tvm" class="on">Voltar ao mapa</button></div></div>`;
ovl.querySelector('.npc .ret').append(pv('N',5));
for(const k of['K','A','M','L','C']){const b=document.createElement('button');b.className='card';b.append(pv(k,6));b.disabled=c.herois.length>=maxElenco()||c.ouro<PRECO_RECRUTA;
b.insertAdjacentHTML('beforeend',`<b>${CL[k].n}</b><span>${DS[k]}</span><small>${PRECO_RECRUTA} de ouro</small>`);
b.onclick=()=>{if(c.herois.length>=maxElenco()||c.ouro<PRECO_RECRUTA)return;c.ouro-=PRECO_RECRUTA;const h=novoHeroi(k,nvR);c.herois.push(h);salvaCamp();PARTY=c.herois.map(x=>x.k);sfx('heal');
R(`${h.nome} se junta ao elenco! Escolha quem luta na formação, antes de cada batalha.`)};$('tvc').append(b)}
$('tvl').onclick=()=>loja('vila');$('tvm').onclick=mapa};
R(c.herois.length>=maxElenco()?'Seu elenco já está completo, amigo. Não cabe mais ninguém na carroça.':'Procurando braços fortes? Muita gente aqui luta por um prato de comida e um punhado de ouro.')}
