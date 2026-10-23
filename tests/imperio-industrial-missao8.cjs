const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const base=path.resolve(__dirname,'../jogos/imperio-industrial/js'),rows=new Map();let saved=null;
function node(){const fields={};return {textContent:'',disabled:false,classList:{toggle(){}},querySelector:key=>fields[key]||(fields[key]=node())};}
const ctx=vm.createContext({console,Math,JSON,document:{addEventListener(){},getElementById:id=>{if(!rows.has(id))rows.set(id,node());return rows.get(id);}},localStorage:{getItem:()=>saved,setItem:(k,v)=>saved=v},setTimeout,clearTimeout});
for(const f of ['jogo.js','catalogo.js','evolucao.js','interface.js'])vm.runInContext(fs.readFileSync(path.join(base,f),'utf8'),ctx);
vm.runInContext('tocar=()=>{};',ctx);const run=s=>vm.runInContext(s,ctx);
run('atualizarLoja();');assert.match(rows.get('item-automacao_total').querySelector('.item-preco').textContent,/15\.000/);
assert.match(rows.get('item-automacao_total').querySelector('.item-status').textContent,/Montadora automática/);
run("E.melhorias={expansao:true,esteira:true,fornecedor_auto:true,transportadora:true};E.maquinas=[{tipo:'montadora',entrada:4,saida:3,progresso:.5}];");
assert.equal(run("requisitoFaltando('automacao_total')"),'');
run('atualizarLoja();');assert.equal(rows.get('item-automacao_total').querySelector('button').disabled,true);assert.match(rows.get('item-automacao_total').querySelector('.item-status').textContent,/Faltam/);
// Lê montadora já comprada em um save e não bloqueia por vagas cheias.
run('salvar(); E=estadoInicial();carregar();');assert.equal(run("requisitoFaltando('automacao_total')"),'');
run("E.maquinas=Array.from({length:4},()=>({tipo:'dobradeira',entrada:15,saida:6,progresso:.7}));E.dinheiro=3000;");
assert.equal(run("itensLoja().find(i=>i.id==='montadora').motivo"),'Sem vaga livre');
assert.equal(run("proximaEvolucao().preco"),2750);
assert.equal(run("comprar('modernizar_dobradeira')"),true);assert.equal(run('E.maquinas.length'),4);
assert.equal(run('E.maquinas[0].tipo'),'montadora');assert.equal(run('E.maquinas[0].entrada'),15);assert.equal(run('E.maquinas[0].saida'),6);assert.equal(run('E.maquinas[0].progresso'),0);assert.equal(run('E.dinheiro'),250);
assert.equal(run("requisitoFaltando('automacao_total')"),'');
run('E.dinheiro=15000;E.missao=7;');assert.equal(run("comprar('automacao_total')"),true);
run('checarMissao();');assert.equal(run('E.missao'),8);assert.equal(run('E.dinheiro'),0);
run('E=estadoInicial();E.dinheiro=10000;');assert.equal(run("comprar('modernizar_dobradeira')"),false);assert.equal(run('E.dinheiro'),10000);
console.log('OK: preço sempre visível, requisitos explícitos, montadora do save reconhecida, upgrade com quatro vagas ocupadas sem perder material e missão 8 concluída.');
