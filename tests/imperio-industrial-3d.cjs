const fs=require('fs'),vm=require('vm'),assert=require('assert');
const base=require('path').resolve(__dirname, '../jogos/imperio-industrial') + '/';
function element(){return {style:{},classList:{add(){},remove(){},toggle(){},contains(){return true;}},appendChild(){},remove(){},firstChild:{style:{}}, getContext(){return {fillRect(){},strokeRect(){},fillText(){}};}};}
const ctx=vm.createContext({console,Math,JSON,innerWidth:1440,innerHeight:900,window:{devicePixelRatio:1,addEventListener(){},matchMedia(){return {matches:false};}},document:{createElement:element,getElementById:element},localStorage:{getItem(){return null;},setItem(){}}});
vm.runInContext(fs.readFileSync(base+'js/three.min.js','utf8'),ctx);
vm.runInContext(`THREE.WebGLRenderer=class {constructor(){this.shadowMap={};this.domElement={};}setPixelRatio(){}setSize(){}render(scene){scene.updateMatrixWorld();}};function tocar(){};function aviso(){};`,ctx);
for(const f of ['jogo','catalogo','cena','evolucao','personagens']) vm.runInContext(fs.readFileSync(base+'js/'+f+'.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
run('criarCena(document.createElement("div")); criarJogador(); sincronizarEstrutura();');
assert.equal(run('faseFabrica()'),0);
run('atualizarCena(0,.016);');
const steps=["E.melhorias.estilete=true",'E.funcionarios=1',"E.maquinas=[{tipo:'dobradeira',entrada:5,saida:0,progresso:0}]; E.melhorias.esteira=true",'E.melhorias.expansao=true',"E.maquinas.push({tipo:'montadora',entrada:4,saida:1,progresso:.5}); E.melhorias.fornecedor_auto=true; E.melhorias.transportadora=true; E.melhorias.automacao_total=true"];
steps.forEach((step,i)=>{
 run(step+';sincronizarEstrutura();atualizarCena(10,.016);');
 assert.equal(run('faseFabrica()'),i+1);
 assert.equal(run('V.ambiente.fase'),i+1);
 assert.equal(run('V.maquinas.length'),run('E.maquinas.length'));
 assert.equal(run('V.ambiente.grupos[0].visible'),i+1<2);
 console.log('OK: etapa '+(i+2)+' '+run('FASES_FABRICA[faseFabrica()].nome'));
});
assert.equal(run('proximaEvolucao()'),null);
run('E=estadoInicial();sincronizarEstrutura();atualizarCena(20,.016);');
assert.equal(run('V.ambiente.grupos[5].visible'),false);
assert.equal(run('V.ambiente.grupos[0].visible'),true);
assert.equal(run('V.maquinas.length'),0);
run('let objetos=0;cena.traverse(o=>{if(o.isMesh) objetos++;});');
console.log('OK: reinício restaura garagem; malhas na cena inicial: '+run('objetos'));
