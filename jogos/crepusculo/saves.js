// ===================== JOGOS SALVOS =====================
// Três espaços de jogo com nome (cdr.save.1..3, ver mapa.js). Cada espaço guarda uma jornada inteira;
// trocar de espaço não apaga nada. Apagar ou sobrescrever sempre pede confirmação.
// Exportar baixa o save como arquivo .json (cópia de segurança ou levar para outro computador); importar faz o caminho inverso.
const resumoSave=(c,n)=>{if(!c||!c.herois||!c.herois.length)return null;const nv=c.herois.reduce((s,h)=>s+h.nv,0)/c.herois.length;
return{nome:c.nome||'Jornada '+n,herois:c.herois.length,nv:nv.toFixed(1),ouro:c.ouro,dia:c.dia||1,fases:(c.venceu||[]).length,lider:c.herois[0].k,
quando:c.salvo?new Date(c.salvo).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'—'}};
const escHtml=t=>String(t).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
function gravaSlot(n,c){try{if(c)localStorage.setItem(chaveSlot(n),JSON.stringify(c));else localStorage.removeItem(chaveSlot(n))}catch(e){return false}if(n==SLOT)CAMP=c;return true}
// Trocar de jornada larga qualquer batalha em andamento (ela pertence ao save anterior).
const largaTudo=()=>{if(typeof largaBatalha=='function')largaBatalha()};

function saves(modo='ver',aviso=''){parar();if(typeof tocar=='function')tocar('titulo');if(typeof IN!='undefined'&&IN)IN.fechar();MP=null;ovl.hidden=false;
const novo=modo=='novo',ids=[];for(let n=1;n<=N_SLOTS;n++)ids.push(n);
ovl.innerHTML=`<div class="sc painel saves"><h2>${novo?'Nova jornada':'Jogos salvos'}</h2>
<p class="stat">${novo?'Escolha o espaço da nova jornada. Os outros espaços continuam guardados.':'Cada espaço guarda uma jornada inteira. Trocar de espaço não apaga nada.'}</p>
${aviso?`<p class="aviso">${aviso}</p>`:''}
<div class="predios">${ids.map(n=>{const r=resumoSave(leSlot(n),n),at=n==SLOT&&r;
return`<div class="predio slot-save${at?' ativo':''}"><h3>Espaço ${n}${at?' <small>· em uso</small>':''}</h3>${r?`<div class="slot-info"><div class="ret" data-pv="${r.lider}"></div><div>
<p><b>${escHtml(r.nome)}</b></p><p>${r.herois} heróis · nível médio ${r.nv}</p><p>Ouro ${r.ouro} · Dia ${r.dia} · ${r.fases} batalha${r.fases==1?'':'s'} vencida${r.fases==1?'':'s'}</p><p class="mu">Salvo em ${r.quando}</p></div></div>
${novo?`<button data-novo="${n}">Começar aqui (apaga este jogo)</button>`:`<button class="on" data-jogar="${n}">Jogar</button> <button data-nome="${n}">Renomear</button> <button data-exp="${n}">Exportar</button> <button data-apaga="${n}">Apagar</button>`}`
:`<p class="mu">Vazio</p><button${novo?' class="on"':''} data-novo="${n}">Nova jornada aqui</button>`}
<button data-imp="${n}">Importar arquivo</button></div>`}).join('')}</div>
<p class="mu dica-save">Dica: use <b>Exportar</b> para guardar uma cópia do jogo num arquivo. Com <b>Importar</b> você continua a jornada em outro computador ou navegador.</p>
<div class="acts"><button id="svv">Voltar</button>${novo?'':'<button id="svn">Nova jornada</button>'}</div>
<input type="file" id="svf" accept=".json,application/json" hidden></div>`;
ovl.querySelectorAll('[data-pv]').forEach(x=>x.append(pv(x.dataset.pv,3)));
const q=(a,f)=>ovl.querySelectorAll(`[data-${a}]`).forEach(b=>b.onclick=()=>f(+b.dataset[a]));
q('jogar',n=>{largaTudo();usaSlot(n);garanteHerois();mapa()});
q('novo',n=>{const r=resumoSave(leSlot(n),n),cria=()=>pedeTexto('Nome da nova jornada','Jornada '+n,nome=>{largaTudo();usaSlot(n);novaCamp(nome);sel()},()=>saves(modo));
if(r)confirma(`Começar uma nova jornada no espaço ${n}? O jogo “${escHtml(r.nome)}” (${r.herois} heróis, nível médio ${r.nv}) será apagado.`,'Apagar e começar',cria,()=>saves(modo));else cria()});
q('nome',n=>{const c=leSlot(n);pedeTexto('Novo nome da jornada',c.nome||'Jornada '+n,nome=>{c.nome=nome;gravaSlot(n,c);saves('ver','Nome alterado.')},()=>saves())});
q('exp',n=>{const c=leSlot(n),a=document.createElement('a'),nome=(c.nome||'jornada').normalize('NFD').replace(/[^\w-]+/g,'-').replace(/^-|-$/g,'').toLowerCase()||'jornada';
a.href=URL.createObjectURL(new Blob([JSON.stringify({jogo:'crepusculo-dos-reinos',versao:1,exportado:Date.now(),camp:c},null,1)],{type:'application/json'}));
a.download=`crepusculo-${nome}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);saves('ver',`Arquivo crepusculo-${nome}.json baixado. Guarde-o em lugar seguro.`)});
q('apaga',n=>{const r=resumoSave(leSlot(n),n);confirma(`Apagar o jogo “${escHtml(r.nome)}” do espaço ${n}? Isso não pode ser desfeito. Se quiser, exporte antes uma cópia.`,'Apagar',()=>{if(n==SLOT)largaTudo();gravaSlot(n,null);saves('ver','Jogo apagado.')},()=>saves())});
const f=$('svf');q('imp',n=>{f.dataset.n=n;f.value='';f.click()});
f.onchange=()=>{const n=+f.dataset.n,arq=f.files[0];if(!arq)return;arq.text().then(txt=>{let c;try{const o=JSON.parse(txt);c=o&&o.camp||o}catch(e){}
if(!c||!Array.isArray(c.herois)||!Array.isArray(c.venceu)||typeof c.ouro!='number')return saves(modo,'Esse arquivo não é um jogo salvo do Crepúsculo dos Reinos.');
const r=resumoSave(leSlot(n),n),poe=()=>{if(n==SLOT)largaTudo();gravaSlot(n,c);saves('ver',`Jogo “${escHtml(c.nome||'Jornada')}” importado no espaço ${n}.`)};
if(r)confirma(`Importar no espaço ${n}? O jogo “${escHtml(r.nome)}” que está lá será substituído.`,'Substituir',poe,()=>saves(modo));else poe()})};
$('svv').onclick=title;const sn=$('svn');if(sn)sn.onclick=()=>saves('novo')}

// Caixas simples no estilo do jogo (no lugar de confirm/prompt do navegador).
function confirma(txt,rotulo,sim,nao){ovl.innerHTML=`<div class="sc painel caixa"><h2>Tem certeza?</h2><p>${txt}</p><div class="acts"><button id="cxn" class="on">Cancelar</button><button id="cxs" class="perigo">${rotulo}</button></div></div>`;
$('cxn').onclick=nao;$('cxs').onclick=sim;$('cxn').focus()}
function pedeTexto(titulo,valor,ok,nao){ovl.innerHTML=`<div class="sc painel caixa"><h2>${titulo}</h2><p><input id="cxi" maxlength="24" value="${escHtml(valor)}"></p><div class="acts"><button id="cxn">Cancelar</button><button id="cxs" class="on">Confirmar</button></div></div>`;
const i=$('cxi'),vai=()=>ok(i.value.trim()||valor);$('cxn').onclick=nao;$('cxs').onclick=vai;i.onkeydown=e=>{e.stopPropagation();if(e.key=='Enter')vai();if(e.key=='Escape')nao()};i.focus();i.select()}
