// Apresentação usa capturas reais e os sprites do próprio jogo.
function criarVitrineCafe(jogo, iniciar) {
  const base = "assets/cafe-com-patas/";
  const card = el("section", "cafe-vitrine");
  card.setAttribute("aria-label", "Conheça Café com Patas");
  const hero = el("div", "cafe-hero");
  const texto = el("div", "cafe-texto");
  texto.append(el("span", "cafe-selo", "MUNDO SENAI · PROGRAMAÇÃO DE JOGOS DIGITAIS"), el("h2", null, "Um café. Muitas patas."), el("p", "cafe-resumo", "Vista o avental da raposa barista: prepare receitas, combine pedidos e receba a vizinhança em uma cafeteria em pixel art."));
  const fatos = el("div", "cafe-fatos");
  ["3 minutos", "8 clientes", "2 itens na bandeja"].forEach(t => fatos.append(el("span", null, t)));
  const acoes = el("div", "cafe-acoes");
  const jogar = el(iniciar ? "button" : "a", "botao cafe-jogar", "▶ Abrir a cafeteria");
  if (iniciar) { jogar.type = "button"; jogar.onclick = iniciar; }
  else jogar.href = "jogo.html?id=" + encodeURIComponent(jogo.id);
  const guia = el("a", "botao botao-sec", "Guia ilustrado"); guia.href = jogo.guia;
  acoes.append(jogar, guia);
  texto.append(fatos, acoes, el("p", "cafe-nota", "Computador com teclado · Música com graves na versão 1.3"));
  const foto = el("img", "cafe-capa"); foto.src = jogo.capa; foto.alt = "Raposa barista e três mesas com clientes sentados no Café com Patas"; foto.loading = "lazy";
  hero.append(texto, foto); card.append(hero);
  const cenas = el("div", "cafe-cenas");
  [
    ["preparo", "Cada receita, um lugar", "Café na cafeteira, bolo na vitrine e suco na geladeira. Aproxime-se e pressione E."],
    ["bandeja", "Dois produtos na viagem", "Prepare em sequência e leve os dois itens. A bandeja ajuda a reduzir as viagens entre as mesas."],
    ["entrega", "Sirva em volta da mesa", "Use E de qualquer lado livre da mesa. Entregas parciais mostram o que ainda falta no pedido."],
  ].forEach(([arquivo,titulo,resumo]) => {
    const cena = el("article"); const img = el("img"); img.src = base + arquivo + ".png"; img.alt = titulo + " no jogo"; img.loading = "lazy";
    cena.append(img, el("h3", null, titulo), el("p", null, resumo)); cenas.append(cena);
  });
  card.append(cenas);
  const elenco = el("div", "cafe-elenco");
  [["raposa","A barista","A personagem que você controla."],["gato","Gato","44 segundos para um pedido simples."],["coelho","Coelho","52 segundos para um pedido simples."],["capivara","Capivara","64 segundos para um pedido simples."]].forEach(([arquivo,nome,resumo]) => {
    const figura = el("figure"); const img = el("img"); img.src = base + arquivo + ".png"; img.alt = nome; img.loading = "lazy";
    const legenda = el("figcaption"); legenda.append(el("strong",null,nome),el("p",null,resumo)); figura.append(img,legenda); elenco.append(figura);
  });
  card.append(elenco,el("p","cafe-equipe","Emilly Lima · Ana Júlia Rodrigues · Prof. Heberson Miliano — 2º ano técnico de Programação de Jogos Digitais. Pedidos duplos recebem mais 24 segundos. Capturas com estados preparados para ilustrar a jogabilidade."));
  return card;
}
