// Apresentação de Missão HTML5: capturas reais do jogo, trilhas, números e histórico de atualizações.
// Usada na página do jogo (com o botão que inicia a partida) e na vitrine da página inicial.
function criarVitrineMissao(jogo, iniciar) {
  const base = "assets/missao-html5/";
  const card = el("section", "mis-vitrine");
  card.setAttribute("aria-label", "Conheça Missão HTML5");

  // Chamada principal
  const hero = el("div", "mis-hero");
  const texto = el("div", "mis-texto");
  texto.append(
    el("span", "mis-selo", "JOGO EDUCATIVO · DESENVOLVIMENTO DE SISTEMAS"),
    el("h2", null, "Aprenda a web fase por fase."),
    el("p", "mis-resumo", "Um jogo de perguntas para revisar HTML5, CSS e JavaScript. Cada fase sorteia 5 questões, cada resposta vem com explicação e só passa quem acerta todas."),
  );
  const fatos = el("div", "mis-fatos");
  ["3 trilhas", "12 fases", "108 questões", "Certificado por trilha"].forEach((t) => fatos.append(el("span", null, t)));
  const acoes = el("div", "mis-acoes");
  const jogar = el(iniciar ? "button" : "a", "botao mis-jogar", "▶ Começar a missão");
  if (iniciar) { jogar.type = "button"; jogar.onclick = iniciar; }
  else jogar.href = "jogo.html?id=" + encodeURIComponent(jogo.id);
  acoes.append(jogar);
  if (jogo.guia) { const gdd = el("a", "botao botao-sec", "📖 Documentação (GDD)"); gdd.href = jogo.guia; acoes.append(gdd); }
  texto.append(fatos, acoes, el("p", "mis-nota", "Computador e celular · Versão " + (jogo.versao || "") + " · Progresso salvo no navegador"));
  const capa = el("img", "mis-capa");
  capa.src = base + "capa.jpg"; capa.alt = "Capa de Missão HTML5 com uma questão do jogo ao fundo"; capa.loading = "lazy";
  hero.append(texto, capa);
  card.append(hero);

  // Números
  const numeros = el("div", "mis-numeros");
  [
    ["🎯", "5 por fase", "Questões sorteadas de um banco de 8 a 10. Cada partida é diferente."],
    ["❤️", "3 vidas", "A questão errada volta para o fim da fila. Sem vidas, a fase recomeça."],
    ["⏱️", "40 segundos", "Cronômetro por questão, com bônus de rapidez. O professor pode desligar."],
    ["🏅", "5 patentes", "O XP leva o aluno de Estagiário até Arquiteto Web."],
  ].forEach(([icone, titulo, resumo]) => {
    const n = el("article");
    n.append(el("span", "mis-icone", icone), el("h3", null, titulo), el("p", null, resumo));
    numeros.append(n);
  });
  card.append(numeros);

  // Capturas
  card.append(el("h3", "mis-subtitulo", "Como é o jogo"));
  const cenas = el("div", "mis-cenas");
  [
    ["mapa", "Mapa de fases", "Três trilhas em abas. As fases abrem uma depois da outra e guardam estrelas e XP.", "Mapa com as seis fases de HTML5, três concluídas"],
    ["questao", "Complete o código", "Além das perguntas diretas, há questões de completar o código e de achar o erro.", "Questão de completar o código com quatro alternativas e cronômetro"],
    ["explicacao", "Toda resposta explica", "Certa ou errada, a resposta mostra o porquê. Acertos seguidos viram sequência.", "Resposta correta com explicação e sequência de três acertos"],
    ["ranking", "Ranking da turma", "Cada aluno que joga no computador entra na tabela, com patente, fases, estrelas e XP.", "Tabela do ranking com cinco alunos"],
    ["javascript", "Trilhas de CSS e JavaScript", "O mesmo formato continua o conteúdo do curso, com leitura de código.", "Questão da trilha de JavaScript com um trecho de código"],
    ["certificado", "Certificado", "Ao concluir uma trilha, o aluno recebe o certificado com o aproveitamento para imprimir.", "Certificado de conclusão da trilha HTML5"],
  ].forEach(([arquivo, titulo, resumo, alt]) => {
    const cena = el("article");
    const img = el("img"); img.src = base + arquivo + ".jpg"; img.alt = alt; img.loading = "lazy";
    cena.append(img, el("h4", null, titulo), el("p", null, resumo));
    cenas.append(cena);
  });
  card.append(cenas);

  // Trilhas
  card.append(el("h3", "mis-subtitulo", "O que o aluno estuda"));
  const trilhas = el("div", "mis-trilhas");
  [
    ["🧱 HTML5", "6 fases · 60 questões", ["Estrutura da página", "Texto e listas", "Links e mídia", "Tags semânticas", "Formulários", "Desafio final"]],
    ["🎨 CSS", "3 fases · 24 questões", ["Seletores e sintaxe", "Texto e modelo de caixa", "Layout e responsivo"]],
    ["⚡ JavaScript", "3 fases · 24 questões", ["Variáveis e tipos", "Decisão e repetição", "Funções, listas e página"]],
  ].forEach(([nome, total, fases]) => {
    const t = el("article");
    const ol = el("ol"); fases.forEach((f) => ol.append(el("li", null, f)));
    t.append(el("h4", null, nome), el("p", "mis-total", total), ol);
    trilhas.append(t);
  });
  card.append(trilhas);

  // Histórico de atualizações (vem do campo "novidades" do catálogo)
  if (jogo.novidades && jogo.novidades.length) {
    card.append(el("h3", "mis-subtitulo", "Atualizações"));
    const linha = el("div", "mis-linha");
    jogo.novidades.forEach((n, i) => {
      const item = el("article", i === 0 ? "mis-atual" : null);
      const cab = el("div", "mis-linha-cab");
      cab.append(el("strong", null, "v" + n.versao));
      if (n.titulo) cab.append(el("span", null, n.titulo));
      const ul = el("ul"); (n.itens || []).forEach((t) => ul.append(el("li", null, t)));
      item.append(cab, ul);
      linha.append(item);
    });
    card.append(linha);
  }

  card.append(el("p", "mis-creditos", "Feito pelo Prof. Heberson Miliano para o curso técnico em Desenvolvimento de Sistemas. As capturas usam um aluno e um ranking de exemplo."));
  return card;
}
