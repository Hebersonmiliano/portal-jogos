// ===================== MISSÕES DE TREINAMENTO E MINA DE OURO =====================
// O tempo passa por batalhas: cada batalha concluída (vitória ou derrota) conta 1 dia
// para quem está em missão ou na mina. Quem está ocupado não entra na formação.
// Cada herói guarda a tarefa em h.tarefa: {tipo:'missao', id, resta} ou {tipo:'mina'}.
const VAGAS_MISSAO=3,VAGAS_MINA=2,VAGAS_MINA_MELHORADA=3,PRECO_MELHORIA_MINA=600;
const MISSOES={
patrulha:{n:'Patrulha',dias:1,xp:35,ouro:30,txt:'Ronda pelas estradas perto da vila.'},
escolta:{n:'Escolta de caravana',dias:2,xp:80,ouro:90,txt:'Proteger os mercadores até o Vau do Salgueiro.'},
cacada:{n:'Caçada',dias:3,xp:130,ouro:170,txt:'Caçar lobos e feras nas colinas.'}};
// Mina: ouro por dia = (OURO_MINA + 5 a cada 2 níveis) × bônus. Cavaleiros e Paladinos rendem +25%; a melhoria dá +20%.
const OURO_MINA=35,BONUS_FORCA=1.25,BONUS_MELHORIA=1.2,CHANCE_GEMA=.1;

const ocupado=h=>!!h.tarefa;
const vagasMina=c=>(c.mina&&c.mina.melhorada?VAGAS_MINA_MELHORADA:VAGAS_MINA)+(typeof nivelPredio=='function'&&nivelPredio('trabalhadores')>1?1:0);
const naMina=c=>c.herois.filter(h=>h.tarefa&&h.tarefa.tipo=='mina').length;
const emMissao=c=>c.herois.filter(h=>h.tarefa&&h.tarefa.tipo=='missao').length;
const ouroMina=(h,c)=>Math.round((OURO_MINA+5*Math.floor(h.nv/2))*(h.base=='K'?BONUS_FORCA:1)*(c.mina&&c.mina.melhorada?BONUS_MELHORIA:1));
// Treino não leva ninguém acima do herói mais forte menos 1.
const limiteTreino=c=>Math.max(1,Math.max(...c.herois.map(h=>h.nv))-1);
function descreveTarefa(h){if(!h.tarefa)return'';if(h.tarefa.tipo=='mina')return'Na mina';
const m=MISSOES[h.tarefa.id];return`Em missão: ${m.n} (falta${h.tarefa.resta>1?'m':''} ${h.tarefa.resta} batalha${h.tarefa.resta>1?'s':''})`}

// Avança 1 dia: chamado uma vez no fim de cada batalha. Devolve as linhas do relatório.
// lutaram: índices dos heróis que entraram na batalha (para o Campo de Treino do castelo).
function avancaDia(lutaram=[]){const c=camp();if(!c||!c.herois)return[];const ls=[],lim=limiteTreino(c);let ouroMinaTotal=0,gemas=0;
for(const h of c.herois){const t=h.tarefa;if(!t)continue;
if(t.tipo=='mina'){ouroMinaTotal+=ouroMina(h,c);if(Math.random()<CHANCE_GEMA){addItem('gema');gemas++}continue}
if(--t.resta>0)continue;const m=MISSOES[t.id];h.tarefa=null;c.ouro+=m.ouro;let xp=h.nv>=lim?0:Math.round(m.xp*(1+(typeof bonusEq=='function'?bonusEq(h,'xpPct'):0)/100));const antes=h.nv;h.xp+=xp;
while(h.xp>=XP_NIVEL&&h.nv<lim){h.xp-=XP_NIVEL;h.nv++}if(h.nv>=lim)h.xp=Math.min(h.xp,XP_NIVEL-1);
ls.push(`${m.n} concluída: ${h.nome} ${xp?`+${xp} XP`:'(já no limite de treino)'}${h.nv>antes?` · <b>nível ${h.nv}!</b>`:''}, +${m.ouro} de ouro. Voltou para o grupo.`)}
if(ouroMinaTotal){c.ouro+=ouroMinaTotal;ls.push(`Mina de Brasaferro: +${ouroMinaTotal} de ouro${gemas?` e <b>${gemas} Gema${gemas>1?'s':''}</b>`:''}.`)}
ls.push(...predios(c,lutaram,lim));salvaCamp();return ls}
// Prédios da base no castelo, uma vez por batalha.
function predios(c,lutaram,lim){if(typeof nivelPredio!='function'||!c.castelo)return[];const ls=[],tr=nivelPredio('treino'),tb=nivelPredio('trabalhadores'),cp=nivelPredio('capela');
if(tb){c.ouro+=OURO_CASTELO[tb];ls.push(`Trabalhadores do castelo: +${OURO_CASTELO[tb]} de ouro.`)}
if(cp&&c.bolsa.pocao<MAX_POCAO_CAPELA){c.bolsa.pocao++;ls.push(`Capela: +1 Poção (${c.bolsa.pocao} na bolsa).`)}
if(tr){const nomes=[];c.herois.forEach((h,i)=>{if(h.tarefa||lutaram.includes(i)||h.nv>=lim)return;const antes=h.nv;h.xp+=XP_TREINO[tr];
while(h.xp>=XP_NIVEL&&h.nv<lim){h.xp-=XP_NIVEL;h.nv++}if(h.nv>=lim)h.xp=Math.min(h.xp,XP_NIVEL-1);nomes.push(h.nome+(h.nv>antes?` (<b>nível ${h.nv}!</b>)`:''))});
if(nomes.length)ls.push(`Campo de Treino (+${XP_TREINO[tr]} XP): ${nomes.join(', ')}.`)}
return ls}

// ---------- Tela "Missões e Mina" ----------
function missoes(voltar=mapa){parar();if(typeof tocar=='function')tocar('vila');garanteHerois();MP=null;const c=camp();if(!c.mina)c.mina={melhorada:false};ovl.hidden=false;
const R=fala=>{const livres=c.herois.filter(h=>!ocupado(h)).length,lim=limiteTreino(c);
ovl.innerHTML=`<div class="sc painel"><h2>Missões e Mina</h2><p class="fala-c">${fala}</p>
<p class="stat">Ouro: <b>${c.ouro}</b> · Missões: <b>${emMissao(c)}/${VAGAS_MISSAO}</b> · Mina: <b>${naMina(c)}/${vagasMina(c)}</b> · Prontos para lutar: <b>${livres}</b> · Limite de treino: nível <b>${lim}</b></p>
<div class="tabela"><table class="itens"><tr><th></th><th>Herói</th><th>Situação</th><th>Atribuir</th></tr>
${c.herois.map((h,i)=>`<tr><td class="mini" data-r="${i}"></td><td>${h.nome}<br><small>${CL[h.k].n} · Nv ${h.nv}</small></td><td>${ocupado(h)?descreveTarefa(h):'Pronto para lutar'}${h.tarefa&&h.tarefa.tipo=='mina'?` · ${ouroMina(h,c)} ouro/dia`:''}</td>
<td>${ocupado(h)?`<button data-volta="${i}">Chamar de volta</button>`:`<select data-at="${i}"><option value="">—</option>${Object.entries(MISSOES).map(([id,m])=>`<option value="${id}">${m.n}: ${m.dias} batalha${m.dias>1?'s':''}, +${m.xp} XP, +${m.ouro} ouro</option>`).join('')}<option value="mina">Mina: ${ouroMina(h,c)} ouro por batalha</option></select>`}</td></tr>`).join('')}</table></div>
<div class="obj"><b>Como funciona:</b> cada batalha concluída conta 1 dia. Heróis em missão voltam sozinhos quando ela termina; na mina, rendem ouro a cada batalha até você chamá-los de volta. Quem está ocupado não entra na formação. Chamar de volta antes do fim cancela a missão sem recompensa.
${c.mina.melhorada?'<br><b>Mina melhorada:</b> 3 vagas e +20% de ouro.':`<br><button id="mmel"${c.ouro<PRECO_MELHORIA_MINA?' disabled':''}>Melhorar a mina (${PRECO_MELHORIA_MINA} de ouro): 3ª vaga e +20% de ouro</button>`}</div>
<div class="acts"><button id="mvt" class="on">Voltar</button></div></div>`;
ovl.querySelectorAll('[data-r]').forEach(td=>td.append(pv(c.herois[+td.dataset.r].k,2)));
ovl.querySelectorAll('[data-at]').forEach(s=>s.onchange=()=>{const h=c.herois[+s.dataset.at],v=s.value;if(!v)return;
if(c.herois.filter(x=>!ocupado(x)).length<=1){R('Alguém precisa ficar no grupo para lutar.');return}
if(v=='mina'){if(naMina(c)>=vagasMina(c)){R('A mina já está cheia.');return}h.tarefa={tipo:'mina'};salvaCamp();sfx('pas');R(`${h.nome} desceu para a Mina de Brasaferro.`);return}
if(emMissao(c)>=VAGAS_MISSAO){R('Todas as vagas de missão estão ocupadas.');return}
h.tarefa={tipo:'missao',id:v,resta:MISSOES[v].dias};salvaCamp();sfx('pas');R(`${h.nome} partiu em: ${MISSOES[v].n}.`)});
ovl.querySelectorAll('[data-volta]').forEach(b=>b.onclick=()=>{const h=c.herois[+b.dataset.volta];h.tarefa=null;salvaCamp();R(`${h.nome} voltou para o grupo.`)});
if($('mmel'))$('mmel').onclick=()=>{if(c.ouro<PRECO_MELHORIA_MINA)return;c.ouro-=PRECO_MELHORIA_MINA;c.mina.melhorada=true;salvaCamp();sfx('heal');R('A mina foi ampliada: agora cabem 3 mineiros e o rendimento subiu 20%.')};
$('mvt').onclick=()=>voltar()};
R('Mande quem não vai lutar treinar em missões ou minerar ouro.')}
