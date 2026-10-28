// Apresentação de Do Zero ao Império Industrial 2 com capturas reais do jogo.
// Usada na vitrine da página inicial (resumida) e na página do jogo (completa).

function abrirCenaImperio2(jogo, indice) {
  const cenas = jogo.vitrineImperio2.cenas;
  const dialogo = el('dialog', 'imp2-lightbox');
  dialogo.setAttribute('aria-label', 'Cenas de Do Zero ao Império Industrial 2');
  const fechar = el('button', 'imp2-fechar', 'Fechar ×'); fechar.type = 'button';
  const figura = el('figure'), legenda = el('figcaption'), img = el('img');
  figura.append(img, legenda);
  const nav = el('div', 'imp2-nav');
  const anterior = el('button', null, '← Anterior'), proxima = el('button', null, 'Próxima →');
  anterior.type = proxima.type = 'button';
  const pintar = () => {
    const c = cenas[indice];
    img.src = c.imagem; img.alt = `Captura do jogo: ${c.titulo}`;
    legenda.textContent = `${indice + 1} / ${cenas.length} · ${c.titulo} — ${c.texto}`;
  };
  const mover = (d) => { indice = (indice + d + cenas.length) % cenas.length; pintar(); };
  anterior.onclick = () => mover(-1); proxima.onclick = () => mover(1);
  fechar.onclick = () => dialogo.close();
  dialogo.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); mover(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); mover(-1); }
  });
  dialogo.addEventListener('close', () => dialogo.remove(), { once: true });
  nav.append(anterior, proxima); dialogo.append(fechar, figura, nav);
  document.body.append(dialogo); pintar(); dialogo.showModal(); fechar.focus();
}

function fotoImperio2(jogo, indice, classe, prioridade = false) {
  const c = jogo.vitrineImperio2.cenas[indice];
  const botao = el('button', classe); botao.type = 'button';
  botao.setAttribute('aria-label', `Ampliar cena: ${c.titulo}`);
  const img = el('img'); img.src = c.imagem; img.alt = `Captura do jogo: ${c.titulo}`;
  img.width = 1600; img.height = 900; img.loading = prioridade ? 'eager' : 'lazy'; img.decoding = 'async';
  botao.append(img);
  botao.onclick = () => abrirCenaImperio2(jogo, indice);
  return botao;
}

function criarVitrineImperio2(jogo, iniciar, completo = false) {
  const dados = jogo.vitrineImperio2;
  const secao = el('section', 'imp2');
  secao.setAttribute('aria-label', 'Conheça Do Zero ao Império Industrial 2');

  // Hero: chamada, fatos, botão de jogar e a visão geral do Distrito.
  const hero = el('div', 'imp2-hero');
  const texto = el('div', 'imp2-hero-texto');
  const titulo = el('h2', 'imp2-titulo', 'Do Zero ao ');
  titulo.append(el('span', null, 'Império Industrial 2'));
  texto.append(el('span', 'imp2-selo', 'NOVO · A SEQUÊNCIA · DISTRITO INDUSTRIAL'), titulo,
    el('p', 'imp2-chamada', dados.chamada), el('p', 'imp2-resumo', dados.resumo));
  const fatos = el('ul', 'imp2-fatos');
  dados.fatos.forEach((f) => fatos.append(el('li', null, f)));
  const acoes = el('div', 'imp2-acoes');
  const jogar = el(iniciar ? 'button' : 'a', 'botao imp2-jogar', '▶ Abrir a oficina');
  if (iniciar) { jogar.type = 'button'; jogar.onclick = iniciar; }
  else jogar.href = 'jogo.html?id=' + encodeURIComponent(jogo.id);
  acoes.append(jogar);
  if (jogo.guia) {
    const guia = el('a', 'imp2-guia', 'Guia completo de como jogar');
    guia.href = jogo.guia;
    acoes.append(guia);
  }
  if (!completo) {
    const conhecer = el('a', 'imp2-conhecer', 'Ver cenas e tudo sobre o jogo →');
    conhecer.href = 'jogo.html?id=' + encodeURIComponent(jogo.id);
    acoes.append(conhecer);
  }
  texto.append(fatos, acoes, el('p', 'imp2-dispositivos', 'Teclado e mouse ou controle de Xbox · Progresso salvo no navegador · Versão ' + jogo.versao));
  const capa = el('figure', 'imp2-hero-foto');
  capa.append(fotoImperio2(jogo, 0, 'imp2-ampliar', true), el('figcaption', null, 'O DISTRITO INDUSTRIAL · CENA REAL DO JOGO'));
  hero.append(texto, capa);
  secao.append(hero);

  // Galeria de cenas.
  const cab = el('div', 'imp2-cabecalho');
  cab.append(el('span', 'imp2-selo', 'CENAS DO JOGO'), el('h3', null, completo ? 'Um dia inteiro no Distrito' : 'Da oficina à linha automática'));
  secao.append(cab);
  const galeria = el('div', 'imp2-galeria' + (completo ? ' imp2-galeria-completa' : ''));
  const indices = completo ? dados.cenas.map((_, i) => i).slice(1) : [1, 2, 3];
  indices.forEach((i) => {
    const c = dados.cenas[i], card = el('figure', 'imp2-cena');
    const legenda = el('figcaption');
    legenda.append(el('h4', null, c.titulo), el('p', null, c.texto));
    card.append(fotoImperio2(jogo, i, 'imp2-ampliar'), legenda);
    galeria.append(card);
  });
  secao.append(galeria);

  if (completo) {
    // Tudo sobre o jogo: os sistemas em cards.
    const cab2 = el('div', 'imp2-cabecalho');
    cab2.append(el('span', 'imp2-selo', 'TUDO SOBRE O JOGO'), el('h3', null, 'O que você vai gerenciar'));
    const recursos = el('div', 'imp2-recursos');
    dados.recursos.forEach((r) => {
      const card = el('article', 'imp2-recurso');
      card.append(el('h4', null, r.titulo), el('p', null, r.texto));
      recursos.append(card);
    });
    const fim = el('div', 'imp2-final');
    const chamada = el('div');
    chamada.append(el('p', null, 'A oficina está alugada e o primeiro cliente já está esperando.'));
    if (jogo.guia) {
      const guia = el('a', 'imp2-guia', 'Primeira vez? Leia o guia completo →');
      guia.href = jogo.guia;
      chamada.append(guia);
    }
    const b = el('button', 'botao imp2-jogar', '▶ Começar com R$ 100'); b.type = 'button'; b.onclick = iniciar;
    fim.append(chamada, b);
    secao.append(cab2, recursos, fim);
  }
  return secao;
}
