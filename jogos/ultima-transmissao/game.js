'use strict';
const $=s=>document.querySelector(s),STORE='ultima-transmissao-caso-01-v1';
const empty=()=>({clues:[],asked:[],confronted:false,solved:false,started:false});
let state=empty(),tab='clues',audio=null,soundOn=true,toastTimer;
try{const saved=JSON.parse(localStorage.getItem(STORE));if(saved&&Array.isArray(saved.clues)&&Array.isArray(saved.asked))state={...empty(),...saved};}catch{}
const clues={
 log:{name:'Livro de visitas',sub:'23h41 · Uma visita fora do expediente',x:53,y:50,icon:'01',copy:'O livro de visitas continua aberto. A mesma pessoa assinou a entrada e autorizou a presença de Miguel.',doc:'23h41 — Raul Vieira, direção.<br>23h42 — Miguel Santos, jornalista.<br>Autorização: R. Vieira.<br><br>Nenhuma saída registrada.',note:'Raul estava na rádio às 23h41. Sua primeira versão diz que saiu às 22h.'},
 phone:{name:'Recado no telefone',sub:'23h44 · A voz de Miguel',x:46,y:46,icon:'02',copy:'Há uma mensagem na secretária eletrônica, enviada por Miguel para a recepção. Parece que ele esperava encontrar alguém aqui.',doc:'“Clara, se você chegar, estou no arquivo do subsolo. O Raul pediu para conversarmos longe do estúdio. Deixei uma cópia na gaveta. A senha é o horário da transmissão, sem os dois-pontos.”',note:'Miguel foi ao arquivo a pedido de Raul. A gaveta usa o horário da transmissão como senha.'},
 tape:{name:'A transmissão adulterada',sub:'23h47 · Onze segundos de silêncio',x:68,y:49,icon:'03',copy:'O gravador mantém a fita de segurança e um pequeno catálogo de áudios. Você compara o pedido de socorro com uma vinheta antiga.',doc:'23h47 — “Socorro… tem alguém aqui…”<br>[ONZE SEGUNDOS APAGADOS]<br><br>Catálogo 2019 / radionovela “Sem Saída”:<br>mesma fala, mesma tosse, mesmo trovão.<br><br>A inserção veio do terminal da DIREÇÃO.',note:'O socorro era uma gravação antiga inserida pelo terminal da direção. A transmissão desviou a atenção do arquivo.'},
 access:{name:'Histórico de acesso',sub:'23h45 · Uma porta fechada à distância',x:68,y:31,icon:'04',copy:'O leitor ao lado do estúdio também exibe os últimos comandos da rede de segurança. O arquivo não fica nesta sala.',doc:'23h43 — ARQUIVO / entrada interna.<br>23h45 — ARQUIVO / travamento remoto.<br>Credencial: RV-01 · Raul Vieira.<br><br>Permissão para travamento remoto:<br>somente DIREÇÃO.',note:'A credencial exclusiva de Raul trancou o arquivo dois minutos antes da transmissão.'},
 drawer:{name:'A cópia da denúncia',sub:'Uma assinatura que custaria caro',x:94,y:57,icon:'05',copy:'Entre as pastas há cópias de notas fiscais e um bilhete de Miguel. Os números mostram desvio de dinheiro na venda dos transmissores da rádio.',doc:'“Clara: as notas são falsas. O dinheiro da venda caiu na conta particular de Raul Vieira. Vou ler os documentos ao vivo à meia-noite. Se ele tentar me impedir, esta é a cópia.”<br><br>— Miguel',note:'Miguel pretendia expor um desvio de Raul à meia-noite. A cópia explica o motivo para silenciá-lo.'},
 clock:{name:'O relógio parado',sub:'00h00 · Um apagão depois do pedido',x:57,y:12,icon:'06',copy:'O relógio elétrico parou exatamente à meia-noite. A folha de manutenção ao lado confirma uma queda de energia nesse horário.',doc:'REGISTRO DE ENERGIA<br>00h00 — falha de alimentação.<br>00h03 — alimentação restaurada.<br><br>O relógio aguarda ajuste manual.',note:'O apagão ocorreu treze minutos depois da transmissão; não explica o silêncio às 23h47.'}
};
const people={
 clara:{name:'Clara Nunes',role:'PRODUTORA',initial:'“Eu cheguei às 23h50. Ouvi o pedido de socorro no carro. Miguel ia apresentar uma denúncia à meia-noite.”',question:'Miguel deixou algum recado?',reply:'“Ele costumava ligar para a recepção quando eu me atrasava. A secretária eletrônica deve ter a mensagem. Ele não confiava mais no Raul.”'},
 theo:{name:'Theo Martins',role:'TÉCNICO DE SOM',initial:'“Às 23h47 o estúdio estava vazio. O áudio entrou pela rede, não pelo microfone. Eu estava na cabine técnica.”',question:'O apagão cortou a transmissão?',reply:'“Não. Faltou luz só à meia-noite. E qualquer inserção remota fica registrada na fita de segurança. Compare o áudio com o catálogo.”'},
 raul:{name:'Raul Vieira',role:'DIRETOR DA RÁDIO',initial:'“Fui embora às dez da noite. Não vi Miguel. Essa história de denúncia é um mal-entendido.”',question:'Quem controla o arquivo do subsolo?',reply:'“A equipe pode entrar, mas só a minha credencial tranca a porta à distância. Meu cartão ficou comigo a noite inteira.”'}
};
function portraitPath(id,tense=false){return `assets/${id==='raul'&&tense?'raul-confrontado':id}.png`;}
function dialogueHeader(id){const n=people[id],tense=id==='raul'&&state.confronted;return `<div class="dialogue-header ${tense?'is-confronted':''}" id="dialogue-header"><figure class="portrait-frame"><img id="speaker-photo" src="${portraitPath(id,tense)}" alt="Retrato de ${n.name}${tense?', visivelmente tenso':''}"></figure><div><span class="dialogue-role">${n.role}</span><h2>${n.name}</h2><p class="dialogue-quote">${n.initial}</p><div class="dialogue-status" id="speaker-status">${tense?'Versão confrontada · sinais de tensão':'Depoimento registrado · Rádio Aurora'}</div></div></div>`;}
function clueVisual(id){const c=clues[id];return `<figure class="clue-visual" role="img" aria-label="Detalhe de ${c.name} na recepção" style="background-size:${id==='clock'?'300%':'260%'} auto;background-position:${c.x}% ${c.y}%"><figcaption>LOCAL DA EVIDÊNCIA · ${c.icon}</figcaption></figure>`;}
function cluePerson(id){if(id==='phone'||id==='drawer')return `<div class="source-person"><img src="assets/miguel.png" alt="Retrato de Miguel Santos"><div><small>${id==='phone'?'MENSAGEM GRAVADA':'BILHETE ASSINADO'}</small><strong>Miguel Santos</strong><span>Jornalista · ${id==='phone'?'transcrição da secretária eletrônica':'autor da cópia encontrada'}</span></div></div>`;return '';}
function save(){try{localStorage.setItem(STORE,JSON.stringify(state));}catch{}}
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}
function modal(html){$('#modal-content').innerHTML=html;if(!$('#modal').open)$('#modal').showModal();}
function close(){ $('#modal').close(); }
function refresh(){
 $('#count').textContent=`${state.clues.length}/6`;$('#bar').style.width=`${state.clues.length/6*100}%`;
 $('#progress-text').textContent=state.solved?'Caso encerrado. A verdade voltou ao ar.':`${state.clues.length} de 6 pistas · ${state.asked.length} de 3 depoimentos · ${state.confronted?'contradição exposta':'contradição pendente'}`;
 $('#goal').textContent=state.solved?'Miguel foi encontrado. Sua denúncia está protegida.':state.clues.length===6?'Confronte as versões e apresente sua conclusão.':'Descubra o que aconteceu com o jornalista Miguel.';
 $('#hotspots').innerHTML=Object.entries(clues).map(([id,c])=>`<button class="hotspot ${state.clues.includes(id)?'found':''}" style="left:${c.x}%;top:${c.y}%" data-clue="${id}" aria-label="Examinar ${c.name}"><span class="label">${c.name}</span></button>`).join('');
 document.querySelectorAll('[data-clue]').forEach(b=>b.onclick=()=>inspect(b.dataset.clue));
 document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab)));
 if(tab==='clues'){
  $('#notebook').innerHTML=state.clues.length?state.clues.map(id=>{const c=clues[id];return `<button class="evidence" data-read="${id}"><span class="evidence-thumb" aria-hidden="true" style="background-position:${c.x}% ${c.y}%"></span><span><small>EVIDÊNCIA ${c.icon}</small><strong>${c.name}</strong><p>${c.sub}</p></span></button>`;}).join(''):'<div class="empty"><span class="empty-symbol">⌕</span>Seu caderno está vazio.<br>Comece pelo livro aberto sobre a mesa.<br><br>Use “Revelar pontos de interesse” para localizar os objetos.</div>';
  document.querySelectorAll('[data-read]').forEach(b=>b.onclick=()=>inspect(b.dataset.read));
 }else{
  $('#notebook').innerHTML=Object.entries(people).map(([id,n])=>`<button class="person" data-person="${id}"><img class="person-thumb" src="${portraitPath(id,id==='raul'&&state.confronted)}" alt=""><span><small>${n.role} ${state.asked.includes(id)?'· OUVIDO':''}</small><strong>${n.name}</strong><p>${id==='raul'&&state.confronted?'Sua versão foi confrontada.':'Consultar depoimento →'}</p></span></button>`).join('');
  document.querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>interview(b.dataset.person));
 }
}
function inspect(id){
 const c=clues[id];
 if(id==='drawer'&&!state.clues.includes(id)){
  modal('<small class="eyebrow">ARQUIVO PESSOAL</small><h2>A gaveta trancada</h2><p class="modal-copy">Um cadeado de quatro dígitos protege a gaveta. Há um adesivo gasto: “A verdade tem hora para ir ao ar”.</p><form id="lock"><label for="code">Código de quatro dígitos</label><input id="code" type="text" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" placeholder="0000" required><p id="lock-result" role="status"></p><button class="primary">Abrir gaveta <span>→</span></button></form>');
  $('#lock').onsubmit=e=>{e.preventDefault();if($('#code').value.trim()==='2347'){showClue(id);}else $('#lock-result').textContent='O cadeado não abriu. Talvez Miguel tenha deixado uma indicação no telefone.';};return;
 }
 showClue(id);
}
function showClue(id){const c=clues[id],found=state.clues.includes(id);modal(`<small class="eyebrow">EXAMINANDO · EVIDÊNCIA ${c.icon}</small><h2>${c.name}</h2>${clueVisual(id)}<p class="modal-copy">${c.copy}</p>${cluePerson(id)}<div class="document"><small>${c.sub}</small>${c.doc}</div>${found?`<p class="answer">${c.note}</p><span class="badge">✓ REGISTRADO NO CADERNO</span>`:'<button class="primary collect" id="collect">Registrar no caderno <span>＋</span></button>'}`);if(!found)$('#collect').onclick=()=>{state.clues.push(id);save();refresh();close();toast(`Pista registrada: ${c.name}`);};}
function interview(id){const n=people[id];if(!state.asked.includes(id)){state.asked.push(id);save();refresh();}modal(`<small class="eyebrow">DEPOIMENTO · ${n.role}</small>${dialogueHeader(id)}<div id="answers"></div><button class="question" id="ask">${n.question}</button>${id==='raul'?'<button class="question" id="confront">Confrontar a declaração de Raul</button>':''}`);$('#ask').onclick=()=>{$('#answers').innerHTML=`<p class="answer">${n.reply}</p>`;$('#ask').disabled=true;};if(id==='raul')$('#confront').onclick=()=>{if(!state.clues.includes('log')||!state.clues.includes('access')){$('#answers').innerHTML='<p class="answer">Você precisa provar que ele voltou à rádio e verificar quem controlava a porta. Examine o livro de visitas e o leitor ao lado do estúdio.</p>';return;}state.confronted=true;save();refresh();$('#speaker-photo').src=portraitPath('raul',true);$('#speaker-photo').alt='Raul Vieira, visivelmente tenso';$('#dialogue-header').classList.add('is-confronted');$('#speaker-status').textContent='Versão confrontada · sinais de tensão';$('#answers').innerHTML='<p class="answer"><b>Você:</b> Sua assinatura está no livro às 23h41. E sua credencial trancou o arquivo às 23h45. Você disse que o cartão ficou com você.</p><p class="answer"><b>Raul:</b> “Eu… voltei para uma reunião. Miguel estava nervoso. Só queria impedir que ele fosse ao ar antes de conversarmos.”</p><span class="badge">✓ CONTRADIÇÃO EXPOSTA</span>';};}
function deduction(){
 if(state.solved){ending();return;}
 if(state.clues.length<6||state.asked.length<3||!state.confronted){modal(`<small class="eyebrow">ANTES DE CONCLUIR</small><h2>Ainda há perguntas.</h2><p class="modal-copy">Uma suspeita precisa de provas. Para concluir, registre as seis pistas, ouça os três depoimentos e confronte a versão de Raul.</p><div class="answer">${state.clues.length}/6 pistas registradas<br>${state.asked.length}/3 pessoas ouvidas<br>${state.confronted?'✓':'○'} Contradição de Raul confrontada</div><button class="primary collect" id="back">Voltar à investigação <span>→</span></button>`);$('#back').onclick=close;return;}
 modal(`<small class="eyebrow">SUA RECONSTRUÇÃO DOS FATOS</small><h2>Quem tentou calar Miguel?</h2><form id="verdict"><label for="suspect">Responsável</label><select id="suspect" required><option value="">Selecione uma pessoa</option><option value="clara">Clara Nunes</option><option value="theo">Theo Martins</option><option value="raul">Raul Vieira</option></select><label for="motive">Motivo</label><select id="motive" required><option value="">Selecione um motivo</option><option value="audience">Aumentar a audiência com uma encenação</option><option value="fraud">Impedir a divulgação do desvio de dinheiro</option><option value="revenge">Vingar uma demissão</option></select><label for="place">Onde procurar Miguel?</label><select id="place" required><option value="">Selecione um local</option><option value="studio">Estúdio principal</option><option value="archive">Arquivo do subsolo</option><option value="street">Rua atrás da rádio</option></select><label>Escolha as três provas que estabelecem local, autoria e motivo</label><div class="proofs">${Object.entries(clues).map(([id,c])=>`<label><input type="checkbox" name="proof" value="${id}">${c.name}</label>`).join('')}</div><p id="verdict-result" role="status"></p><button class="primary">Apresentar conclusão <span>→</span></button></form>`);
 $('#verdict').onsubmit=e=>{e.preventDefault();const proof=[...document.querySelectorAll('input[name="proof"]:checked')].map(c=>c.value);if($('#suspect').value!=='raul'||$('#motive').value!=='fraud'||$('#place').value!=='archive'){$('#verdict-result').textContent='Sua reconstrução ainda não explica todos os fatos. Compare a mensagem de Miguel, o acesso ao arquivo e os documentos da gaveta.';return;}if(proof.length!==3||!['phone','access','drawer'].every(id=>proof.includes(id))){$('#verdict-result').textContent='Escolha três provas diretas: uma que indique onde Miguel foi, outra que identifique quem o trancou e uma que revele o motivo.';return;}state.solved=true;save();refresh();ending(true);};
}
async function celebrateSuccess(){
 if(!soundOn)return;
 try{
  if(!audio){const AC=window.AudioContext||window.webkitAudioContext;audio=new AC();}
  await audio.resume();
  if(!soundOn)return;
  if(score)score.setVolume(.22);
  window.playInvestigationSuccess(audio);
  setTimeout(()=>{if(score)score.setVolume(.7);},2600);
 }catch{}
}
function ending(celebrate=false){
 const points=state.clues.length*100+state.asked.length*50+(state.confronted?100:0)+(state.solved?150:0);
 modal(`<section class="case-success ${celebrate?'celebrating':''}"><small class="eyebrow">CASO 001 · INVESTIGAÇÃO CONCLUÍDA</small><div class="success-medal" aria-hidden="true">✦</div><h2>A verdade voltou ao ar.</h2><p class="success-rank">SELO CONQUISTADO · INVESTIGADOR DE AURORA</p><div class="success-score"><strong>${points.toLocaleString('pt-BR')}</strong><span>PONTOS DE INVESTIGAÇÃO</span></div><div class="achievement-list"><div><span>✓ Olhar atento <small>Seis pistas encontradas</small></span><b>+600</b></div><div><span>✓ Todos os lados <small>Três depoimentos ouvidos</small></span><b>+150</b></div><div><span>✓ Versão desmentida <small>Contradição confrontada</small></span><b>+100</b></div><div><span>✓ Caso resolvido <small>Conclusão sustentada por provas</small></span><b>+150</b></div></div><p class="modal-copy">A polícia abre o arquivo do subsolo e encontra Miguel vivo. Ele confirma: Raul o atraiu para uma reunião e trancou a porta remotamente para impedir a denúncia.</p><p class="answer">Às 06h00, Clara abre o microfone. Dessa vez, a cidade ouve a história inteira.</p><span class="badge">✓ MIGUEL ENCONTRADO · DENÚNCIA PRESERVADA</span><p class="reward-saved">Seu caso concluído e suas conquistas ficam registrados neste navegador quando o salvamento está disponível.</p><button class="primary collect" id="finish">Voltar à recepção <span>→</span></button></section>`);
 $('#finish').onclick=close;
 if(celebrate)celebrateSuccess();
}
$('#begin').onclick=()=>{state=empty();state.started=true;save();$('#intro').hidden=true;refresh();startMusic();};
$('#resume').hidden=!state.started;$('#resume').onclick=()=>{$('#intro').hidden=true;refresh();startMusic();};
$('#modal .close').onclick=close;$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;refresh();});
$('#reveal').onclick=()=>{const on=$('#hotspots').classList.toggle('show-points');$('#reveal').setAttribute('aria-pressed',String(on));};
$('#deduce').onclick=deduction;
$('#hint').onclick=()=>{let s;if(!state.clues.includes('phone'))s='Examine o telefone claro no centro da mesa. Miguel deixou uma mensagem.';else if(!state.clues.includes('drawer'))s='A senha da gaveta é o horário do pedido de socorro: 23h47. Digite 2347.';else if(state.clues.length<6)s='Use “Revelar pontos de interesse”. Examine também o relógio e o leitor junto à porta.';else if(state.asked.length<3)s='Abra a aba Depoimentos e ouça Clara, Theo e Raul.';else if(!state.confronted)s='No depoimento de Raul, use “Confrontar a declaração”. O livro e o leitor contradizem sua versão.';else s='A mensagem indica o local, o histórico identifica quem trancou a porta e a denúncia revela o motivo.';modal(`<small class="eyebrow">UMA ORIENTAÇÃO</small><h2>Observe mais de perto.</h2><p class="modal-copy">${s}</p>`);};
$('#restart').onclick=()=>{modal('<small class="eyebrow">RECOMEÇAR</small><h2>Voltar ao início?</h2><p class="modal-copy">As pistas e os depoimentos salvos deste caso serão reiniciados.</p><button class="primary" id="confirm-restart">Recomeçar investigação <span>↻</span></button>');$('#confirm-restart').onclick=()=>{state=empty();save();tab='clues';refresh();close();$('#resume').hidden=true;$('#intro').hidden=false;};};
let score=null;
function updateMusicButton(){
 $('#sound').textContent=soundOn?'♫ Música ligada':'♫ Música desligada';
 $('#sound').setAttribute('aria-pressed',String(soundOn));
}
async function startMusic(){
 if(!soundOn)return;
 try{
  if(!audio){const AC=window.AudioContext||window.webkitAudioContext;audio=new AC();}
  if(!score)score=window.createInvestigationScore(audio);
  await audio.resume();
 }catch{toast('Não foi possível iniciar a música. Use o botão de música para tentar novamente.');}
}
$('#sound').onclick=async()=>{
 soundOn=!soundOn;
 updateMusicButton();
 if(soundOn)await startMusic();else if(audio){try{await audio.suspend();}catch{}}
};
updateMusicButton();
refresh();
