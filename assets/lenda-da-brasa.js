// Vitrine de LENDA DA BRASA: herói, elenco, recursos e fotos dos lugares. Usada no destaque da página inicial e na página do jogo.
function criarVitrineLenda(jogo, iniciar) {
  const base = 'jogos/lenda-da-brasa/vitrine/';
  const img = (arquivo, alt, w, h) => { const i = el('img'); i.src = base + arquivo; i.alt = alt; i.loading = 'lazy'; i.decoding = 'async'; if (w) { i.width = w; i.height = h; } return i; };
  const card = el('section', 'lenda-card'); card.setAttribute('aria-label', 'Conheça Lenda da Brasa');
  const hero = el('div', 'lenda-hero'), texto = el('div', 'lenda-texto');
  texto.append(el('span', 'lenda-selo', 'AVENTURA CLÁSSICA DE AÇÃO · JOGO COMPLETO'));
  const titulo = el('h2', 'lenda-titulo', 'LENDA DA '); titulo.append(el('span', null, 'BRASA'));
  texto.append(titulo,
    el('p', 'lenda-chamada', 'O Rei Umbra raptou a princesa. Só uma pequena brasa pode salvá-la.'),
    el('p', 'lenda-resumo', 'Você é Lume. Atravesse os reinos da Brasa, das Marés e dos Ventos, explore castelos e santuários cheios de quebra-cabeças, conquiste 3 cristais e 8 pendentes e desça ao Coração do Abismo para a batalha final.'));
  const fatos = el('div', 'lenda-fatos');
  ['5 capítulos', '3 castelos · 8 santuários', '13 chefes', '12 itens mágicos', 'lojas e segredos'].forEach(t => fatos.append(el('span', null, t)));
  const botoes = el('div', 'lenda-botoes');
  const jogar = el(iniciar ? 'button' : 'a', 'botao lenda-jogar', '▶ Jogar Lenda da Brasa');
  if (iniciar) { jogar.type = 'button'; jogar.onclick = iniciar; } else jogar.href = 'jogo.html?id=lenda-da-brasa';
  const guia = el('a', 'botao botao-sec lenda-guia', '📖 Guia completo');
  guia.href = 'https://github.com/Hebersonmiliano/lenda-da-brasa/blob/main/GUIA.md'; guia.target = '_blank'; guia.rel = 'noopener';
  botoes.append(jogar, guia);
  texto.append(fatos, botoes, el('p', 'lenda-nota', 'Grátis · Teclado, controle ou celular · Salva sozinho'));
  const lume = el('figure', 'lenda-lume');
  lume.append(img('lume.png', 'Lume, o herói, erguendo a Espada dos Reinos', 160, 310));
  const leg = el('figcaption'); leg.append(el('strong', null, 'LUME'), el('span', null, 'A pequena brasa · Seu herói'));
  lume.append(leg); hero.append(texto, lume);

  const elenco = el('div', 'lenda-elenco');
  [['princesa.png', 'Princesa Lírian', 'PRINCESA LÍRIAN', 'Raptada pelo Rei Umbra', 96, 96],
   ['rei_umbra.png', 'Rei Umbra, de manto e coroa', 'REI UMBRA', 'Senhor da Fortaleza Sombria', 128, 128],
   ['sombra_rei.png', 'A Sombra do Rei, chefe final', 'A SOMBRA DO REI', 'O que espera no fundo do abismo', 120, 120]
  ].forEach(([a, alt, nome, papel, w, h]) => { const f = el('figure'); f.append(img(a, alt, w, h)); const c = el('figcaption'); c.append(el('strong', null, nome), el('span', null, papel)); f.append(c); elenco.append(f); });

  const recursos = el('div', 'lenda-recursos');
  [['5 REINOS PARA EXPLORAR', 'Vale de Lume, lagos, desertos, florestas, geleiras e o Reino Sombrio, com aldeias, barqueiro e águia gigante.'],
   ['MASMORRAS DE VERDADE', 'Castelos com andares, mapa, bússola, chaves, salas escuras, maré que sobe e desce e paredes secretas.'],
   ['UM ITEM PARA CADA DESAFIO', 'Bastão de Brasa, Gancho, Pena, Arco, Bombas, Lanterna, Bastão de Gelo e Martelo abrem caminhos e vencem chefes.'],
   ['BATALHA FINAL EM 3 FASES', 'Encaixe os 11 emblemas na Grande Porta e enfrente a Sombra do Rei com luz, elementos e o golpe carregado.']
  ].forEach(([h, p]) => { const a = el('article'); a.append(el('h3', null, h), el('p', null, p)); recursos.append(a); });

  const gTitulo = el('h3', 'lenda-galeria-titulo', 'LUGARES DA JORNADA');
  const galeria = el('div', 'lenda-galeria');
  [['mapa_mundi.png', 'Mapa Mundi', 'Aperte TAB e veja o nome de cada lugar dos 4 reinos.'],
   ['vale.png', 'Vale de Lume', 'Onde a aventura começa.'],
   ['castelo_brasa.png', 'Castelo da Brasa', 'Orbes, pinos e o Guardião de Cinzas.'],
   ['kraken.png', 'Castelo das Marés', 'Puxe o Kraken com o gancho.'],
   ['santuario_gelo.png', 'Santuário do Gelo', 'Congele o lago para atravessar.'],
   ['fortaleza.png', 'Fortaleza Sombria', 'O covil do Rei Umbra.'],
   ['batalha_final.png', 'Coração do Abismo', 'A luz contra a Sombra do Rei.']
  ].forEach(([a, nome, d]) => { const f = el('figure'); f.append(img(a, nome + ': ' + d, 256, 176)); const c = el('figcaption'); c.append(el('strong', null, nome), el('span', null, d)); f.append(c); galeria.append(f); });

  card.append(hero, elenco, recursos, gTitulo, galeria);
  return card;
}
