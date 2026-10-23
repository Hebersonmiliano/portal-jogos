const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const base=path.resolve(__dirname,'../jogos/imperio-industrial/js');
const ctx=vm.createContext({console,Math,JSON,localStorage:{getItem(){return null;},setItem(){}},addEventListener(){},document:{querySelectorAll:()=>[],querySelector:()=>({addEventListener(){}}),addEventListener(){}}});
for(const f of ['jogo.js','catalogo.js'])vm.runInContext(fs.readFileSync(path.join(base,f),'utf8'),ctx);
const cena=fs.readFileSync(path.join(base,'cena.js'),'utf8');vm.runInContext(cena.slice(0,cena.indexOf('let renderer')),ctx);
vm.runInContext(fs.readFileSync(path.join(base,'personagens.js'),'utf8'),ctx);
vm.runInContext('function aviso(){}function novoItemEsteira(){}function mostrarVitoria(){}function tocar(){}function flutuar(){}let pausado=false;',ctx);
vm.runInContext(fs.readFileSync(path.join(base,'principal.js'),'utf8').replace(/iniciar\(\);\s*$/,''),ctx);
const run=s=>vm.runInContext(s,ctx);
run("E.melhorias.expansao=true;E.maquinas=VAGAS.map(()=>({tipo:'dobradeira',entrada:0,saida:0,progresso:0}));");
const objetos=JSON.parse(run('JSON.stringify({...ESTACOES,...Object.fromEntries(VAGAS.map((v,i)=>["m"+i,{...v,...TAM_VAGA}]))})'));
let contatos=0;
for(const [id,o] of Object.entries(objetos)){
 const lados=[[o.x-o.w/2-.35,o.z],[o.x+o.w/2+.35,o.z],[o.x,o.z-o.d/2-.35],[o.x,o.z+o.d/2+.35]];
 for(const dx of [-1,1])for(const dz of [-1,1])lados.push([o.x+dx*(o.w/2+.35/Math.SQRT2),o.z+dz*(o.d/2+.35/Math.SQRT2)]);
 for(const [x,z] of lados){
  if(!run(`${x}>=LIMITES.x0+.35 && ${x}<=LIMITES.x1-.35 && ${z}>=LIMITES.z0+.35 && ${z}<=LIMITES.z1-.35`))continue;
  run(`jogador.x=${x};jogador.z=${z};resolverColisao(jogador,.35);`);
  assert.ok(run(`distanciaDaEstacao('${id}')`)<=.351,'contato '+id);
  assert.equal(run('estacaoProxima()'),id,'seleção junto à borda de '+id);contatos++;
 }
}
// Antigo ponto distante e extremidade direita: entregar sem se alinhar a um ponto.
run("jogador.x=-2.45;jogador.z=-5.2;E.cargaTipo='papelao';E.cargaQtd=3;");
assert.equal(run('estacaoProxima()'),'bancada');assert.equal(run("acaoEm('bancada').acao"),'abastecer');
run("executar('abastecer','bancada');");assert.equal(run('E.bancada.entrada'),3);assert.equal(run('E.cargaQtd'),0);
// Não interage com o centro do corredor nem alcança objetos do outro lado do galpão.
run('jogador.x=0;jogador.z=0;');assert.equal(run('estacaoProxima()'),'');assert.equal(run("distanciaDaEstacao('invalido')"),Infinity);
run('E.maquinas=[];');assert.equal(run("distanciaDaEstacao('m0')"),Infinity);
console.log(`OK: ${contatos} contatos em bordas/cantos dos 7 objetos e 4 máquinas, entrega na ponta da bancada, distância limitada e máquina ausente.`);
