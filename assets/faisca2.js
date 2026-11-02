// Divulgação do Faísca 2. As capturas não iniciam nem carregam o jogo.
function criarVitrineFaisca2(jogo, iniciar, completa = false) {
  const base = 'assets/faisca-2/';
  const imagem = (nome, alt) => {
    const img = el('img'); img.src = base + nome; img.alt = alt;
    img.loading = 'lazy'; img.decoding = 'async'; img.width = 1280; img.height = 720;
    return img;
  };
  const card = el('section', 'faisca2-card');
  card.setAttribute('aria-label', 'Conheça Faísca 2 — Castelo das Cinzas');
  const hero = el('div', 'faisca2-hero'), texto = el('div', 'faisca2-texto');
  texto.append(el('span', 'faisca2-selo', 'AÇÃO + AVENTURA · CAMPANHA JOGÁVEL'));
  texto.append(el('h2', null, 'FAÍSCA 2'), el('p', 'faisca2-subtitulo', 'CASTELO DAS CINZAS'));
  texto.append(el('p', 'faisca2-chamada', 'Um lenço. Oito desafios. Um castelo vivo.'));
  texto.append(el('p', null, 'As fogueiras estão se apagando. Entre no Castelo das Cinzas com Faísca e seu lenço amarelo, enfrente os guardiões de cada região e descubra quem está roubando o calor do mundo.'));
  const fatos = el('div', 'faisca2-fatos');
  ['8 fases conectadas', '8 chefes únicos', 'Ataques em 8 direções', 'Trilhas por fase'].forEach(t => fatos.append(el('span', null, t)));
  texto.append(fatos);
  const botao = el(iniciar ? 'button' : 'a', 'botao faisca2-jogar', iniciar ? '▶ Entrar no castelo' : 'Conhecer e jogar →');
  if (iniciar) { botao.type = 'button'; botao.onclick = iniciar; }
  else botao.href = 'jogo.html?id=faisca-2';
  texto.append(botao, el('p', 'faisca2-nota-curta', 'Grátis no navegador · Melhor no computador · Versão 0.5.0 em polimento'));
  const figura = el('figure', 'faisca2-figura');
  figura.append(imagem('capa.jpg', 'Faísca, herói de capuz azul e lenço amarelo luminoso, diante do castelo'), el('figcaption', null, 'O lenço amarelo é sua arma. A coragem é sua escolha.'));
  hero.append(texto, figura); card.append(hero);
  const mecanicas = el('div', 'faisca2-mecanicas');
  const recursos = [
    ['O lenço desperta', 'Colete três níveis do lenço. Mire em oito direções e libere chamas no nível III.'],
    ['Explore com agilidade', 'Salte, conquiste o salto duplo, esquive e atravesse passagens agachado.'],
    ['Leia os chefes', 'Cada guardião tem personalidade e decisões de combate próprias. Observe os sinais e encontre a abertura.'],
    ['Siga sua aventura', 'Descanse nos braseiros, salve no navegador e libere os próximos capítulos.']
  ];
  recursos.forEach(([titulo, texto]) => {
    const item = el('article'); item.append(el('h3', null, titulo), el('p', null, texto)); mecanicas.append(item);
  });
  card.append(mecanicas, el('h3', 'faisca2-galeria-titulo', 'Um castelo, oito identidades'));
  const fases = [
    ['Entrada do Castelo', 'O Guardião das Cinzas protege o começo da jornada. Aprenda o lenço e conquiste o salto duplo.'],
    ['Jardins das Cinzas', 'Véspera, Rainha dos Espinhos: raízes que brotam, flores carnívoras e sementes perigosas.'],
    ['Masmorras Esquecidas', 'Grilhão, o Carcereiro: prensas, correntes e túneis baixos entre as celas.'],
    ['Torre dos Ventos', 'Aéria, Duelista da Tempestade: rajadas, plataformas móveis e ataques em mergulho.'],
    ['Catedral das Chamas', 'Irmã Alba, Voz dos Sinos: badaladas e colunas de fogo exigem atenção ao ritmo.'],
    ['Laboratório das Sombras', 'Doutor Nox: poções, criaturas transformadas e válvulas para conter o ácido.'],
    ['Relógio do Abismo', 'Cronos, Regente das Horas: engrenagens, pêndulos e ataques que antecipam trajetórias.'],
    ['Trono das Cinzas', 'O Rei das Cinzas espera entre selos e espectros. Reúna o que aprendeu para o confronto final.']
  ];
  const galeria = el('div', 'faisca2-galeria');
  fases.slice(0, completa ? 8 : 3).forEach(([titulo, texto], i) => {
    const n = String(i + 1).padStart(2, '0');
    const figura = el('figure');
    const legenda = el('figcaption'); legenda.append(el('h3', null, n + ' · ' + titulo), el('p', null, texto));
    figura.append(imagem('fase-' + n + '.jpg', 'Captura do projeto Faísca 2: ' + titulo + ', cenário e chefe'), legenda);
    galeria.append(figura);
  });
  card.append(galeria);
  if (completa) {
    card.append(el('p', 'faisca2-nota', 'Cada região tem inimigos e tema musical próprios. As camadas da trilha acompanham a exploração, o perigo e a luta contra o chefe. Capturas do projeto, com cenas preparadas para apresentar as arenas. A campanha está jogável e continua recebendo polimento de animações e dificuldade.'));
    card.append(el('p', 'faisca2-nota', 'O progresso fica neste navegador e dispositivo. Use teclado ou o mapeamento de controle e amplie o jogador em Tela cheia. O jogo começa a carregar somente depois de clicar em jogar.'));
  }
  return card;
}
