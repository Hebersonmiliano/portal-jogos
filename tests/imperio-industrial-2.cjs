// Império Industrial 2 no portal: catálogo, arquivos do jogo, imagens das cenas e página de compartilhamento.
// Rodar: node tests/imperio-industrial-2.cjs
const fs = require('fs'), vm = require('vm'), assert = require('assert'), path = require('path');
const raiz = path.resolve(__dirname, '..');
const c = { window: {} }; vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(raiz, 'jogos.js'), 'utf8'), c);
const jogo = c.window.JOGOS.find((j) => j.id === 'imperio-industrial-2');
assert(jogo, 'entrada no catálogo');
assert.equal(jogo.status, 'disponivel');
assert(c.window.SITE.carrossel.includes('imperio-industrial-2'), 'no carrossel');
assert(fs.existsSync(path.join(raiz, jogo.url)), 'index.html do jogo');
for (const f of ['style.css', 'js/main.js', 'js/audio/musica.js', 'js/visual/ambiente.js', 'js/vendor/three.module.js', 'js/vendor/three.core.js']) {
  assert(fs.existsSync(path.join(raiz, 'jogos/imperio-industrial-2', f)), f);
}
const html = fs.readFileSync(path.join(raiz, jogo.url), 'utf8');
assert(html.includes('./js/vendor/three.module.js') && html.includes('src="js/main.js"'), 'caminhos relativos para o GitHub Pages');
assert(fs.existsSync(path.join(raiz, jogo.capa)), 'capa');
const v = jogo.vitrineImperio2;
assert(v.cenas.length >= 6 && v.recursos.length >= 6 && v.fatos.length >= 4);
for (const cena of v.cenas) {
  assert(cena.titulo && cena.texto, 'cena com título e texto');
  assert(fs.existsSync(path.join(raiz, cena.imagem)), cena.imagem);
}
assert(fs.existsSync(path.join(raiz, 'j/imperio-industrial-2/index.html')), 'página de compartilhamento');
assert(fs.existsSync(path.join(raiz, 'previas/imperio-industrial-2.jpg')), 'prévia 1200x630');
for (const p of ['index.html', 'jogo.html']) {
  const s = fs.readFileSync(path.join(raiz, p), 'utf8');
  assert(s.includes('assets/imperio-industrial-2.js') && s.includes('assets/imperio-industrial-2.css'), p + ' carrega a apresentação');
}
assert(fs.readFileSync(path.join(raiz, 'jogo.html'), 'utf8').includes('id="apresentacao-imperio2"'));
console.log('PASS: Império Industrial 2 no catálogo, com jogo, 7 cenas, recursos, capa e prévia de compartilhamento.');
