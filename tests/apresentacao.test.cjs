'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),test=require('node:test'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function fixture(page='index.html',game='ultima-transmissao'){
 class Node{
  constructor(tag='div'){this.tagName=tag;this.children=[];this.parent=null;this.attrs={};this.dataset={};this.className='';this.style={setProperty(){}};this.handlers={};this._text='';this.hidden=false;this.disabled=false;this.classList={add:(...names)=>{this.className+=' '+names.join(' ');}};}
  append(...nodes){for(const n of nodes){this.children.push(n);n.parent=this;}}
  replaceChildren(...nodes){this.children=[];this.append(...nodes);}
  set textContent(t){this._text=String(t);this.children=[];}
  get textContent(){return this._text+this.children.map(n=>n.textContent).join(' ');}
  setAttribute(k,v){this.attrs[k]=String(v);}
  addEventListener(k,fn){this.handlers[k]=fn;}
  querySelector(tag){for(const n of this.children){if(n.tagName===tag)return n;const found=n.querySelector(tag);if(found)return found;}return null;}
  closest(tag){let n=this;while(n){if(n.tagName===tag)return n;n=n.parent;}return new Node(tag);}
  click(){this.onclick?.({preventDefault(){}});}
  focus(){}
  scrollIntoView(){this.scrolled=true;}
  requestFullscreen(){this.fullscreen=true;}
 }
 const html=fs.readFileSync(path.join(root,page),'utf8'),nodes=new Map();
 for(const match of html.matchAll(/id="([^"]+)"/g))nodes.set(match[1],new Node());
 const selectors=new Map(),storage=new Map();
 const document={getElementById:id=>{if(!nodes.has(id))throw Error('ID ausente: '+id);return nodes.get(id);},querySelector:s=>{if(!selectors.has(s))selectors.set(s,new Node());return selectors.get(s);},querySelectorAll:()=>[],createElement:tag=>new Node(tag),documentElement:new Node('html')};
 const context=vm.createContext({window:{addEventListener(){}},document,location:{search:'?id='+game},URLSearchParams,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},console});
 for(const script of ['jogos.js','assets/faisca.js','assets/imperio-industrial.js','assets/comum.js','assets/setor404.js'])vm.runInContext(fs.readFileSync(path.join(root,script),'utf8'),context,{filename:script});
 return {context,document,run:file=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file}),storage};
}
function descendants(node,tag){return node.children.flatMap(n=>[...(n.tagName===tag?[n]:[]),...descendants(n,tag)]);}

test('card SETOR 404 mostra Maya, três imagens e inicia o jogador existente',()=>{
 const f=fixture('jogo.html','setor-404');f.run('assets/pagina-jogo.js');
 const wrapper=f.document.getElementById('apresentacao-setor404');assert.equal(wrapper.hidden,false);
 assert.match(wrapper.textContent,/A fábrica parou/);assert.match(wrapper.textContent,/3 setores industriais/);
 assert.equal(descendants(wrapper,'img').length,4);
 for(const img of descendants(wrapper,'img')){assert.ok(fs.existsSync(path.join(root,img.src)),img.src);assert.ok(img.alt);assert.equal(img.loading,'lazy');}
 const palco=f.document.getElementById('palco');assert.equal(descendants(palco,'iframe').length,0);
 wrapper.querySelector('button').click();assert.equal(wrapper.hidden,true);assert.equal(descendants(palco,'iframe').length,1);assert.equal(palco.scrolled,true);
 const h=fixture();h.run('assets/vitrine.js');assert.match(h.document.getElementById('conteudo').textContent,/A fábrica parou/);
 h.document.getElementById('busca').handlers.input({target:{value:'Última Transmissão'}});assert.ok(!h.document.getElementById('conteudo').textContent.includes('A fábrica parou'));
 for(const file of ['index.html','jogo.html']){const html=fs.readFileSync(path.join(root,file),'utf8');assert.match(html,/assets\/setor404\.css/);assert.match(html,/assets\/setor404\.js/);}
});

test('SETOR 404 aparece na busca e no filtro de ação, sem trocar o destaque existente',()=>{
 const f=fixture(),game=f.context.window.JOGOS.find(g=>g.id==='setor-404');
 assert.equal(game.status,'disponivel');assert.equal(game.mobile,false);assert.equal(game.destaque,false);
 assert.equal(f.context.window.JOGOS.filter(g=>g.id==='setor-404').length,1);
 const card=f.context.criarCartao(game);assert.equal(card.href,'jogo.html?id=setor-404');assert.equal(card.querySelector('img').src,game.capa);
 f.run('assets/vitrine.js');assert.match(f.document.getElementById('destaque').textContent,/Miguel Santos/);
 f.document.getElementById('busca').handlers.input({target:{value:'setor 404'}});
 assert.match(f.document.getElementById('conteudo').textContent,/SETOR 404/);
 f.document.getElementById('filtros').children.find(n=>n.textContent==='Ação').click();
 assert.match(f.document.getElementById('conteudo').textContent,/SETOR 404/);
});

test('SETOR 404 inicia um único iframe e habilita tela cheia, favoritos e recentes',()=>{
 const f=fixture('jogo.html','setor-404');f.run('assets/pagina-jogo.js');
 const palco=f.document.getElementById('palco');assert.equal(descendants(palco,'iframe').length,0);
 assert.equal(f.document.getElementById('celular').textContent,'Melhor no computador');
 assert.match(f.document.getElementById('controles').textContent,/K esquiva/);
 palco.querySelector('button').click();assert.equal(descendants(palco,'iframe').length,1);
 assert.equal(palco.querySelector('iframe').src,'jogos/setor-404/index.html?v=1.1.0-energia');
 assert.equal(f.document.getElementById('tela-cheia').disabled,false);
 f.document.getElementById('tela-cheia').click();assert.equal(palco.querySelector('iframe').fullscreen,true);
 f.document.getElementById('favorito').click();assert.match(f.storage.get('portal.favoritos'),/setor-404/);
 assert.match(f.storage.get('portal.recentes'),/setor-404/);
});

test('SETOR 404 contém scripts, imagens, capa e nomes de arquivo corretos para hospedagem',()=>{
 const f=fixture(),game=f.context.window.JOGOS.find(g=>g.id==='setor-404'),dir=path.join(root,'jogos/setor-404');
 assert.ok(fs.existsSync(path.join(root,game.capa)));
 const html=fs.readFileSync(path.join(root,game.url),'utf8');
 for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const file=m[1].split('?')[0];assert.ok(!file.startsWith('/'),'Caminho absoluto: '+file);assert.ok(fs.existsSync(path.join(dir,file)),file);
 }
 for(const file of ['game.js','maya-rig.js','r04-rig.js','phase1-level.js','audio.js']){
  const source=fs.readFileSync(path.join(dir,file),'utf8');new vm.Script(source,{filename:file});
  assert.ok(!/(?:ghp_|github_pat_|sk-proj-|C:\\\\Users)/.test(source));
 }
 for(const m of fs.readFileSync(path.join(dir,'game.js'),'utf8').matchAll(/\.src='(assets\/[^']+)'/g))assert.ok(fs.existsSync(path.join(dir,m[1])),m[1]);
 assert.equal(fs.existsSync(path.join(dir,'.git')),false);assert.equal(fs.existsSync(path.join(dir,'.openai')),false);
});
test('FAÍSCA apresenta personagem, doze fases e inicia somente um jogador',()=>{
 const f=fixture('jogo.html','faisca'); f.run('assets/pagina-jogo.js');
 const card=f.document.getElementById('apresentacao-faisca');
 assert.equal(card.hidden,false); assert.equal(descendants(card,'figure').length,13);
 assert.match(card.textContent,/Ao pousar/); assert.match(card.textContent,/não há ranking online/);
 for(const img of descendants(card,'img')) assert.ok(fs.existsSync(path.join(root,img.src)),img.src);
 const stage=f.document.getElementById('palco'); assert.equal(descendants(stage,'iframe').length,0);
 card.querySelector('button').click(); assert.equal(card.hidden,true);
 assert.equal(descendants(stage,'iframe').length,1); assert.match(stage.querySelector('iframe').src,/faisca\/index.html/);
 const home=fixture(); home.run('assets/vitrine.js');
 assert.match(home.document.getElementById('conteudo').textContent,/Pequeno herói/);
 home.document.getElementById('busca').handlers.input({target:{value:'Última Transmissão'}});
 assert.ok(!home.document.getElementById('conteudo').textContent.includes('Pequeno herói'));
});
test('card e destaque mostram os quatro personagens e informações do capítulo',()=>{const f=fixture(),game=f.context.window.JOGOS.find(g=>g.id==='ultima-transmissao');const card=f.context.criarCartao(game);assert.ok(card.className.includes('cartao-investigacao'));assert.equal(card.href,'jogo.html?id=ultima-transmissao');assert.equal(descendants(card,'img').length,5);assert.match(card.textContent,/8 pistas/);assert.match(card.textContent,/Investigar o caso/);const hero=f.context.criarHeroInvestigacao(game);assert.equal(descendants(hero,'figure').length,4);assert.equal(descendants(hero,'a')[0].href,'jogo.html?id=ultima-transmissao');assert.match(hero.textContent,/Uma verdade/);for(const n of descendants(hero,'figure'))assert.ok(n.querySelector('img').alt.startsWith('Retrato de '));});
test('página inicial renderiza destaque, filtros, busca e cartões antigos',()=>{const f=fixture();f.run('assets/vitrine.js');assert.ok(f.document.getElementById('destaque').className.includes('destaque-investigacao'));assert.match(f.document.getElementById('destaque').textContent,/Miguel Santos/);assert.ok(f.document.getElementById('filtros').children.length>1);const old=f.context.window.JOGOS.find(g=>!g.apresentacao);const card=f.context.criarCartao(old);assert.ok(!card.className.includes('cartao-investigacao'));f.document.getElementById('busca').handlers.input({target:{value:'Última Transmissão'}});assert.match(f.document.getElementById('conteudo').textContent,/Investigar o caso/);f.document.getElementById('busca').handlers.input({target:{value:'palavra-que-nao-existe-123'}});assert.match(f.document.getElementById('conteudo').textContent,/Nenhum jogo encontrado/);});
test('página do jogo apresenta elenco e galeria e inicia um único iframe',()=>{const f=fixture('jogo.html');f.run('assets/pagina-jogo.js');const presentation=f.document.getElementById('apresentacao');assert.equal(presentation.hidden,false);const content=f.document.getElementById('conteudo-investigacao');assert.equal(descendants(content,'figure').length,7);assert.match(content.textContent,/Dicas sem perder pontos/);const stage=f.document.getElementById('palco');assert.equal(descendants(stage,'iframe').length,0);presentation.querySelector('button').click();assert.equal(presentation.hidden,true);assert.equal(descendants(stage,'iframe').length,1);assert.match(stage.querySelector('iframe').src,/ultima-transmissao\/index.html\?v=2\.0\.0/);assert.equal(f.document.getElementById('tela-cheia').disabled,false);assert.equal(stage.scrolled,true);});
test('jogos sem apresentação continuam iniciando normalmente',()=>{const f=fixture('jogo.html','horda-eterna');f.run('assets/pagina-jogo.js');assert.equal(f.document.getElementById('apresentacao').children.length,0);const stage=f.document.getElementById('palco');stage.querySelector('button').click();assert.equal(descendants(stage,'iframe').length,1);assert.match(stage.querySelector('iframe').src,/horda-eterna/);});
test('dados comerciais correspondem ao capítulo e todos os recursos existem',()=>{const f=fixture(),p=f.context.window.JOGOS.find(g=>g.id==='ultima-transmissao').apresentacao,chapter=require('../jogos/ultima-transmissao/chapter.js');assert.equal(Number(p.recursos[0].valor),Object.keys(chapter.rooms).length);assert.equal(Number(p.recursos[1].valor),Object.keys(chapter.clues).length);assert.equal(Number(p.recursos[2].valor),Object.keys(chapter.puzzles).length);for(const entry of [...p.personagens,...p.galeria])assert.ok(fs.existsSync(path.join(root,entry.imagem)),entry.imagem);assert.ok(!JSON.stringify(p).includes('2347'),'A apresentação não revela a senha');for(const file of ['index.html','jogo.html']){const html=fs.readFileSync(path.join(root,file),'utf8');for(const m of html.matchAll(/(?:href|src)="((?:assets\/|jogos\.js)[^"]*)"/g))assert.ok(fs.existsSync(path.join(root,m[1].split('?')[0])),m[1]);}for(const file of ['jogos.js','assets/comum.js','assets/vitrine.js','assets/pagina-jogo.js'])new vm.Script(fs.readFileSync(path.join(root,file),'utf8'));});


test('Império Industrial apresenta história e seis etapas, com prévias locais e início único',()=>{
 const f=fixture('jogo.html','imperio-industrial');f.run('assets/pagina-jogo.js');
 const wrapper=f.document.getElementById('apresentacao-imperio');assert.equal(wrapper.hidden,false);
 assert.match(wrapper.textContent,/primeira caixa/);assert.match(wrapper.textContent,/Império Industrial/);
 const imagens=descendants(wrapper,'img');assert.equal(imagens.length,7);
 for(const img of imagens){assert.ok(img.alt);assert.ok(fs.existsSync(path.join(root,img.dataset.fonteImperio.split('?')[0])));}
 const botoes=descendants(wrapper,'button').filter(b=>b.textContent.includes('Construir meu império'));
 assert.equal(botoes.length,1);botoes[0].click();
 assert.equal(wrapper.hidden,true);assert.equal(descendants(f.document.getElementById('palco'),'iframe').length,1);
 const h=fixture();h.run('assets/vitrine.js');assert.match(h.document.getElementById('conteudo').textContent,/Uma bancada/);
 h.document.getElementById('busca').handlers.input({target:{value:'Última Transmissão'}});
 assert.ok(!h.document.getElementById('conteudo').textContent.includes('Uma bancada'));
});
