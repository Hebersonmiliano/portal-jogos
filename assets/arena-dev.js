// Apresentação de Arena Dev: GIF de um duelo, capturas reais do jogo, categorias e histórico de atualizações.
// Usada na página do jogo (com o botão que inicia a partida) e na vitrine da página inicial.
function criarVitrineArena(jogo, iniciar) {
  const base = "assets/arena-dev/";
  const card = el("section", "arena-vitrine");
  card.setAttribute("aria-label", "Conheça Arena Dev");

  // Chamada principal com o GIF do duelo
  const hero = el("div", "arena-hero");
  const texto = el("div", "arena-texto");
  texto.append(
    el("span", "arena-selo", "TORNEIO · DESENVOLVIMENTO DE SISTEMAS"),
    el("h2", null, "Quem acerta primeiro, marca o ponto."),
    el("p", "arena-resumo", "Duelos de cálculo contra adversários do computador numa chave eliminatória: quartas, semifinal e final. Binário, lógica booleana, precedência de operadores e mais, com ranking dos melhores alunos da escola."),
  );
  const fatos = el("div", "arena-fatos");
  ["8 competidores", "3 fases", "6 categorias", "Ranking da escola"].forEach((t) => fatos.append(el("span", null, t)));
  const acoes = el("div", "arena-acoes");
  const jogar = el(iniciar ? "button" : "a", "botao arena-jogar", "▶ Entrar na arena");
  if (iniciar) { jogar.type = "button"; jogar.onclick = iniciar; }
  else jogar.href = "jogo.html?id=" + encodeURIComponent(jogo.id);
  acoes.append(jogar);
  texto.append(fatos, acoes, el("p", "arena-nota", "Computador e celular · Versão " + (jogo.versao || "") + " · Sem instalar nada"));
  const midia = el("figure", "arena-midia");
  const gif = el("img", "arena-gif");
  gif.src = base + "duelo.gif"; gif.alt = "Animação de um duelo: a aluna acerta a conversão de binário e a questão de lógica antes do adversário"; gif.loading = "lazy";
  midia.append(gif, el("figcaption", null, "Um duelo de verdade: o cronômetro corre, o adversário erra e a aluna marca o ponto."));
  hero.append(texto, midia);
  card.append(hero);

  // Números
  const numeros = el("div", "arena-numeros");
  [
    ["⚔️", "Duelo", "Os dois recebem a mesma pergunta. Quem acerta primeiro marca; quem erra fica travado."],
    ["🏆", "Chave de 8", "Quartas, semifinal e final contra adversários com velocidade e precisão diferentes."],
    ["🔥", "Combos", "Respostas rápidas e acertos seguidos multiplicam os pontos."],
    ["📊", "Ranking", "A melhor pontuação entra no ranking da escola e da turma."],
  ].forEach(([icone, titulo, resumo]) => {
    const n = el("article");
    n.append(el("span", "arena-icone", icone), el("h3", null, titulo), el("p", null, resumo));
    numeros.append(n);
  });
  card.append(numeros);

  // Capturas
  card.append(el("h3", "arena-subtitulo", "Como é o jogo"));
  const cenas = el("div", "arena-cenas");
  [
    ["chaveamento", "Chaveamento", "Oito competidores e três partidas até o título. Os outros duelos são decididos a cada fase.", "Chave do torneio com a aluna na final"],
    ["duelo", "A final", "Placar até 5 pontos. Aqui o adversário errou a precedência e a vez é da aluna.", "Duelo da final com uma expressão de precedência de operadores e o adversário marcado como errou"],
    ["binario", "Binário e hexadecimal", "Conversões entre bases com alternativas que imitam os erros mais comuns.", "Pergunta de conversão de binário de 8 bits para decimal"],
    ["campeao", "Campeão", "No fim, pontos, aproveitamento e tempo médio, e a pontuação vai para o ranking.", "Tela de campeão com pontos, aproveitamento e tempo médio"],
    ["ranking", "Ranking da escola", "Abas Escola, Minha turma e Este aparelho, para o Torneio e para o Treino.", "Ranking da escola com seis alunos de duas turmas"],
    ["dois-jogadores", "2 jogadores", "Dois alunos no mesmo computador: teclas 1 a 4 contra 7, 8, 9 e 0.", "Modo de dois jogadores com tela dividida em duas grades de respostas"],
  ].forEach(([arquivo, titulo, resumo, alt]) => {
    const cena = el("article");
    const img = el("img"); img.src = base + arquivo + ".jpg"; img.alt = alt; img.loading = "lazy";
    cena.append(img, el("h4", null, titulo), el("p", null, resumo));
    cenas.append(cena);
  });
  card.append(cenas);

  // Categorias
  card.append(el("h3", "arena-subtitulo", "O que cai na arena"));
  const cats = el("div", "arena-cats");
  [
    ["➕ Aritmética", "42 + 97 · 12 × 7 · 25% de 160"],
    ["🧮 Precedência de operadores", "3 + 4 * 2 · (5 + 7) % 4"],
    ["💾 Binário e hexadecimal", "1010₂ → 10 · 0x3A → 58"],
    ["⚡ Potências de 2", "2 ** 10 · valores em 8 bits"],
    ["🔀 Lógica booleana", "!(true || false) && true"],
    ["➗ Resto e divisão inteira", "17 % 5 · Math.floor(47 / 6)"],
  ].forEach(([nome, exemplo]) => {
    const c = el("article");
    c.append(el("h4", null, nome), el("code", null, exemplo));
    cats.append(c);
  });
  card.append(cats, el("p", "arena-dica", "Três níveis: a dificuldade sobe nas quartas, na semifinal e na final. O professor escolhe as categorias nas Configurações."));

  // Atualizações (campo "novidades" do catálogo)
  if (jogo.novidades && jogo.novidades.length) {
    card.append(el("h3", "arena-subtitulo", "Atualizações"));
    const linha = el("div", "arena-linha");
    jogo.novidades.forEach((n, i) => {
      const item = el("article", i === 0 ? "arena-atual" : null);
      item.append(el("strong", null, "v" + n.versao));
      const ul = el("ul"); (n.itens || []).forEach((t) => ul.append(el("li", null, t)));
      item.append(ul);
      linha.append(item);
    });
    card.append(linha);
  }

  card.append(el("p", "arena-creditos", "Feito pelo Prof. Heberson Miliano para o curso técnico em Desenvolvimento de Sistemas. As capturas usam alunos e um ranking de exemplo."));
  return card;
}
