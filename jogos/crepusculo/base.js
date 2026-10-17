// ===================== BASE NO CASTELO DE VALDREN =====================
// Depois de conquistar o castelo (fase 6), ele vira a base do grupo: bandeira, prédios e recrutamento.
// Cada prédio tem níveis; o custo de cada nível está em custos (ouro e gemas da mina).
const PREDIOS={
alojamentos:{n:'Alojamentos',txt:n=>`Elenco máximo: ${10+5*n} heróis`,prox:n=>`Elenco máximo passa para ${15+5*n}`,custos:[{ouro:800},{ouro:1600,gema:2}]},
ferreiro:{n:'Ferreiro',txt:n=>n?`Armas: +${n} Ataque e Magia · Armaduras: +${3*n} HP`:'Ainda sem ferreiro',prox:n=>`Armas +${n+1} Ataque e Magia, armaduras +${3*(n+1)} HP`,custos:[{ouro:700},{ouro:1400,gema:2}]},
cavalaria:{n:'Cavalaria',txt:n=>n?'Lanceiros Montados podem ser recrutados aqui':'Estábulos vazios',prox:()=>'Libera a classe Lanceiro Montado',custos:[{ouro:900}]},
// Os efeitos destes quatro ficam em trabalho.js (avancaDia), telas.js (stats e recompensa) e trabalho.js (vagasMina).
treino:{n:'Campo de Treino',txt:n=>n?`Heróis que ficam de fora da batalha ganham +${XP_TREINO[n]} XP`:'Escudeiros sem campo para treinar',prox:n=>`Quem fica de fora ganha +${XP_TREINO[n+1]} XP por batalha`,custos:[{ouro:600},{ouro:1200,gema:1}]},
trabalhadores:{n:'Trabalhadores',txt:n=>n?`O castelo rende +${OURO_CASTELO[n]} de ouro por batalha${n>1?' · +1 vaga na mina':''}`:'Oficinas fechadas',prox:n=>`+${OURO_CASTELO[n+1]} de ouro por batalha${n+1>1?' e +1 vaga na mina':''}`,custos:[{ouro:500},{ouro:1100,gema:1}]},
capela:{n:'Capela',txt:n=>n?`+1 Poção grátis por batalha (até ${MAX_POCAO_CAPELA} na bolsa)${n>1?' · quem cai na luta ganha o XP inteiro':''}`:'Ninguém para cuidar dos feridos',prox:n=>n?'Quem cai na luta ganha o XP inteiro':`+1 Poção grátis por batalha (até ${MAX_POCAO_CAPELA})`,custos:[{ouro:600},{ouro:1300,gema:2}]},
torre:{n:'Torre do Mago',txt:n=>n?`Magos, clérigos e paladinos: +${2*n} Magia e +${3*n} MP`:'Torre em ruínas',prox:n=>`+${2*(n+1)} Magia e +${3*(n+1)} MP para quem usa magia`,custos:[{ouro:800},{ouro:1600,gema:2}]}};
const XP_TREINO=[0,20,40],OURO_CASTELO=[0,40,90],MAX_POCAO_CAPELA=10;
const EM_BREVE=[];
const CORES_BANDEIRA=['#2f6fd6','#c4403a','#2f9a5a','#7b52c9','#e0aa48','#2a2a3a'],CORES_EMBLEMA=['#ffd45a','#f4f4f4','#1a1a1a','#ff8a3a'];
const PRECO_LANCEIRO=300;
const nivelPredio=id=>{const c=typeof camp=='function'&&camp();return c&&c.base?c.base[id]||0:0};
const maxElenco=()=>MAX_ELENCO+5*nivelPredio('alojamentos');
const custoTxt=c=>`${c.ouro} de ouro${c.gema?` + ${c.gema} Gema${c.gema>1?'s':''}`:''}`;
function base(){parar();if(typeof tocar=='function')tocar('vila');garanteHerois();MP=null;const c=camp();if(!c.base)c.base={};if(!c.bandeira)c.bandeira={cor:'#2f6fd6',emblema:'#ffd45a'};ovl.hidden=false;
const gemas=()=>c.bolsa.itens.gema||0;
const R=fala=>{const b=c.bandeira;
ovl.innerHTML=`<div class="sc painel loja base"><div class="npc"><div class="ret"></div><div><h2>Castelo de Valdren · Base do Grupo</h2><p class="fala">“${fala}”</p></div></div>
<p class="stat">Ouro: <b>${c.ouro}</b> · Gemas: <b>${gemas()}</b> · Elenco: <b>${c.herois.length}/${maxElenco()}</b></p>
<div class="bandeira-ed"><div class="flamula" style="background:${b.cor}"><i style="background:${b.emblema}"></i></div>
<div><b>Bandeira do grupo</b><div class="cores">${CORES_BANDEIRA.map(k=>`<button class="cor${k==b.cor?' on':''}" data-cor="${k}" style="background:${k}" title="Cor da bandeira"></button>`).join('')}</div>
<div class="cores">${CORES_EMBLEMA.map(k=>`<button class="cor${k==b.emblema?' on':''}" data-emb="${k}" style="background:${k}" title="Cor do emblema"></button>`).join('')}</div></div></div>
<div class="predios">${Object.entries(PREDIOS).map(([id,p])=>{const n=c.base[id]||0,max=p.custos.length,cu=p.custos[n],pode=cu&&c.ouro>=cu.ouro&&gemas()>=(cu.gema||0);
return`<div class="predio"><h3>${p.n} <small>${'★'.repeat(n)}${'☆'.repeat(max-n)}</small></h3><p>${p.txt(n)}</p>${n<max?`<p class="mu">Próximo: ${p.prox(n)}</p><button data-pr="${id}"${pode?'':' disabled'}>${n?'Melhorar':'Construir'} (${custoTxt(cu)})</button>`:'<p class="mu">Nível máximo</p>'}
${id=='cavalaria'&&n?`<button data-lanc="1"${c.ouro>=PRECO_LANCEIRO&&c.herois.length<maxElenco()?'':' disabled'}>Recrutar Lanceiro Montado (${PRECO_LANCEIRO} de ouro)</button>`:''}</div>`}).join('')}
${EM_BREVE.map(n=>`<div class="predio bloq"><h3>🔒 ${n}</h3><p class="mu">Em breve</p></div>`).join('')}</div>
<div class="acts"><button id="bsa">Arsenal</button><button id="bsm">Missões e mina</button><button id="bsg">Grupo</button><button id="bsv" class="on">Voltar ao mapa</button></div></div>`;
ovl.querySelector('.npc .ret').append(pv('P',5));
ovl.querySelectorAll('[data-cor]').forEach(x=>x.onclick=()=>{c.bandeira.cor=x.dataset.cor;salvaCamp();R('Uma bela bandeira. Que todos os reinos a reconheçam.')});
ovl.querySelectorAll('[data-emb]').forEach(x=>x.onclick=()=>{c.bandeira.emblema=x.dataset.emb;salvaCamp();R('O emblema foi bordado de novo.')});
ovl.querySelectorAll('[data-pr]').forEach(x=>x.onclick=()=>{const id=x.dataset.pr,n=c.base[id]||0,cu=PREDIOS[id].custos[n];if(!cu||c.ouro<cu.ouro||gemas()<(cu.gema||0))return;
c.ouro-=cu.ouro;if(cu.gema)c.bolsa.itens.gema-=cu.gema;c.base[id]=n+1;salvaCamp();sfx('heal');R(`${PREDIOS[id].n} ${n?'melhorado':'construído'}! ${PREDIOS[id].txt(n+1)}.`)});
const l=ovl.querySelector('[data-lanc]');if(l)l.onclick=()=>{if(c.ouro<PRECO_LANCEIRO||c.herois.length>=maxElenco())return;c.ouro-=PRECO_LANCEIRO;const h=novoHeroi('R',Math.max(1,Math.round(c.herois.reduce((s,h)=>s+h.nv,0)/c.herois.length)-1));c.herois.push(h);salvaCamp();PARTY=c.herois.map(x=>x.k);sfx('heal');R(`${h.nome} chega a galope e se junta ao elenco!`)};
$('bsa').onclick=()=>loja('castelo');$('bsm').onclick=()=>missoes(base);$('bsg').onclick=()=>grupo(base);$('bsv').onclick=mapa};
R('O castelo é de vocês agora. Digam o que construir, e eu cuido do resto.')}
