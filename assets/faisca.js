// Apresentação editorial do FAÍSCA. Usa imagens reais do projeto e não carrega o jogo.
function criarApresentacaoFaisca(completa = false, iniciar) {
  const card = el("section", "faisca-vitrine");
  card.setAttribute("aria-label", "Conheça FAÍSCA");
  const hero = el("div", "faisca-hero");
  const texto = el("div", "faisca-texto");
  texto.append(el("span", "faisca-selo", "PLATAFORMA DE PRECISÃO · DIFICULDADE EXTREMA"), el("h2", null, "FAÍSCA"), el("p", "faisca-chamada", "Pequeno herói. Saltos ousados. Um mundo de armadilhas."), el("p", null, "Conheça Faísca: capuz azul, olhos de energia e um lenço amarelo sempre em movimento. Agilidade e precisão são suas ferramentas para atravessar 20 fases curtas e alcançar cada saída."));
  const fatos = el("div", "faisca-fatos");
  ["20 fases", "Salto + dash", "3 salvamentos", "Ranking local"].forEach(t => fatos.append(el("span", null, t)));
  texto.append(fatos);
  const botao = el(iniciar ? "button" : "a", "botao", iniciar ? "▶ Jogar FAÍSCA" : "Conhecer e jogar →");
  if (iniciar) { botao.type = "button"; botao.onclick = iniciar; }
  else botao.href = "jogo.html?id=faisca";
  texto.append(botao);
  const figura = el("figure", "faisca-personagem");
  const img = el("img"); img.src = "assets/faisca/personagem.png"; img.alt = "Faísca em poses de corrida, salto e dash, com capuz azul e lenço amarelo"; img.loading = "lazy"; img.decoding = "async";
  figura.append(img, el("figcaption", null, "O personagem Faísca · arte e poses do projeto"));
  hero.append(texto, figura); card.append(hero);
  const mecanicas = el("div", "faisca-mecanicas");
  const itens = [
    ["01 · Salte com precisão", "Ajuste o salto para alcançar plataformas estreitas. O posicionamento vale tanto quanto a velocidade."],
    ["02 · Use o dash", "Ganhe um impulso para atravessar vãos. Ao pousar, o dash fica disponível novamente."],
    ["03 · Leia o perigo", "Observe serras, prensas e barreiras temporizadas. Espere a abertura e atravesse no momento certo."],
    ["04 · Tente outra vez", "Reinicie rapidamente após errar. Ao alcançar a saída, a próxima fase começa sem avisos."]
  ];
  itens.slice(0, completa ? 4 : 3).forEach(([titulo, corpo]) => { const item=el("article"); item.append(el("h3", null, titulo), el("p", null, corpo)); mecanicas.append(item); });
  card.append(mecanicas);
  const galeria=el("div", "faisca-galeria");
  const cenas=[
    ["01", "Ruínas na selva", "Vegetação, cachoeiras animadas e os primeiros desafios de salto."],
    ["04", "Templo do deserto", "Arenito, poeira e blocos que descem em ciclos."],
    ["10", "Vulcão", "Basalto, lava e apoios pequenos para planejar cada salto."],
    ["12", "Torre do Relógio", "Engrenagens, bronze e prensas para atravessar com precisão."],
    ["13", "Laboratório de Gravidade", "Gravidade reduzida e esferas de energia mudam o ritmo dos saltos."],
    ["15", "Fortaleza em Guerra", "Muralhas, tochas e bandeiras animadas. Cruze as prensas e serras entre os apoios de pedra."],
    ["14", "Floresta Carnívora", "Flores perigosas, esporos e cipós que alternam sua atividade."]
  ];
  cenas.slice(0, completa ? 7 : 3).forEach(([n,titulo,corpo]) => {
    const f=el("figure"); const foto=el("img"); foto.src="assets/faisca/fase-"+n+".png"; foto.alt="Captura da fase "+n+" — "+titulo; foto.loading="lazy"; foto.decoding="async"; foto.width=1280; foto.height=720;
    const legenda=el("figcaption"); legenda.append(el("h3",null,n+" · "+titulo),el("p",null,corpo)); f.append(foto,legenda); galeria.append(f);
  });
  card.append(el("h3", "faisca-galeria-titulo", "Um cenário diferente a cada fase"),galeria);
  card.append(el("p", "faisca-nota", "Imagens capturadas no jogo. Campanha com 20 fases; 15 cenários já receberam o visual cartoon. Versão em desenvolvimento. Jogue no computador com teclado ou controle. Os três espaços de salvamento e o ranking ficam apenas neste navegador; não há ranking online."));
  return card;
}

