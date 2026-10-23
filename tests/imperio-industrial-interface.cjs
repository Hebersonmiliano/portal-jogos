const fs = require('fs'), vm = require('vm'), assert = require('assert');
const base = require('path').resolve(__dirname, '../jogos/imperio-industrial') + '/';
const elements = new Map(), events = {};
function el(id) {
  if (!elements.has(id)) {
    const classes = new Set(['menu','modal','loja'].includes(id) ? ['oculto'] : []);
    elements.set(id, {dataset: {}, style: {}, setAttribute(){}, textContent: '', classList: {
      contains: x => classes.has(x), add: x => classes.add(x), remove: x => classes.delete(x),
      toggle(x, force) { const on = force === undefined ? !classes.has(x) : force; on ? classes.add(x) : classes.delete(x); return on; }
    }, listeners: {}, addEventListener(k,fn) {this.listeners[k]=fn;}, setPointerCapture(){}, appendChild(){} });
  }
  return elements.get(id);
}
const keys = ['KeyW','KeyA','KeyS','KeyD','Interagir'].map(k => { const b=el(k); b.dataset.tecla=k; return b; });
const context = vm.createContext({ console, Math, JSON, setTimeout, clearTimeout, performance: {now:()=>0}, localStorage: {setItem(){},getItem(){return null;}},
  window: {}, location: {}, addEventListener:(k,fn)=>events[k]=fn,
  document: {getElementById:el, querySelectorAll:()=>keys, querySelector:()=>el('coletar'), addEventListener:(k,fn)=>events[k]=fn},
});
vm.runInContext('const teclas = {}; const jogador = {x:0,z:0}; const ESTACOES = {}; function novoItemEsteira(){} function pontoDe(){return {x:0,z:0};}',context);
for (const f of ['js/jogo.js','js/catalogo.js','js/evolucao.js','js/interface.js','js/audio.js','js/principal.js']) {
  let code=fs.readFileSync(base+f,'utf8');
  if(f.endsWith('principal.js')) code=code.replace(/iniciar\(\);\s*$/, '');
  vm.runInContext(code,context);
}
const run = code => vm.runInContext(code,context);
run("E.bancada.saida = 2; E.bancada.entrada = 3; estacaoProxima = () => 'bancada'; coletarProximo();");
assert.equal(run('E.cargaQtd'),2); assert.equal(run('E.bancada.entrada'),3);
run("E.cargaQtd=1; E.cargaTipo='papelao'; E.bancada.saida=1; coletarProximo();");
assert.equal(run('E.bancada.saida'),1);
run("E=estadoInicial();");
keys[0].listeners.pointerdown({pointerId:1,preventDefault(){}});
assert.equal(run('teclas.KeyW'),true);
keys[0].listeners.pointercancel({pointerId:1}); assert.equal(run('teclas.KeyW'),false);
keys[4].listeners.pointerdown({pointerId:2,preventDefault(){}});
assert.equal(run('teclas.Interagir && ePressionado'),true);
events.blur(); assert.equal(run('pausado'),true); assert.equal(run('teclas.Interagir'),false);
events.blur(); assert.equal(run('pausado'),true);
run('fecharJanela(); E.papelao=10; atualizarHud();');
assert.match(el('hud-guia').textContent,/PALETE/);
run("E.cargaTipo='caixa'; E.cargaQtd=3; atualizarHud();");
assert.match(el('hud-carga').textContent,/3\/3 caixas/);
assert.match(el('hud-guia').textContent,/EXPEDIÇÃO/);
console.log('OK: coleta antecipada, carga protegida, toque, cancelamento, pausa e orientações.');
const buttons = [];
context.document.createElement = () => ({textContent:'',onclick:null});
el('modal-botoes').appendChild = b => buttons.push(b);
run('E.dinheiro=9999; E.funcionarios=3; pausado=false; confirmarNovoJogo();');
assert.equal(run('pausado'),true);
buttons[0].onclick();
assert.equal(run('pausado'),false);
assert.equal(run('E.dinheiro'),9999);
buttons.length=0;
run('alternarPausa(); confirmarNovoJogo();'); buttons[0].onclick();
assert.equal(run('pausado'),true);
assert.equal(el('menu').classList.contains('oculto'),false);
let saved, reloaded=false;
context.localStorage.setItem = (key,value) => {saved=JSON.parse(value);};
context.location.reload = () => {reloaded=true;};
buttons.length=0; run('confirmarNovoJogo();'); buttons[1].onclick();
assert.equal(saved.dinheiro,100); assert.equal(saved.funcionarios,0);
assert.equal(saved.missao,0); assert.equal(saved.maquinas.length,0);
assert.deepEqual(saved.melhorias,{}); assert.equal(reloaded,true);
console.log('OK: cancelar preserva progresso e pausa; confirmar salva partida inicial e recarrega.');
