// Página inicial: destaques, filtros por gênero, busca, favoritos e recentes.

const estado = { genero: "Todos", busca: "" };

function secao(titulo, jogos) {
  const s = el("section", "secao");
  s.append(el("h2", null, titulo));
  const grade = el("div", "grade");
  jogos.forEach((j) => grade.append(criarCartao(j)));
  s.append(grade);
  return s;
}

function filtrar() {
  const termo = estado.busca.trim().toLowerCase();
  return window.JOGOS.filter((j) => {
    if (estado.genero !== "Todos" && !j.genero.includes(estado.genero)) return false;
    if (!termo) return true;
    const texto = [j.titulo, j.descricao, ...j.genero, ...(j.tags || [])].join(" ").toLowerCase();
    return texto.includes(termo);
  });
}

function desenharFiltros() {
  const usados = new Set(window.JOGOS.flatMap((j) => j.genero));
  const generos = ["Todos", ...window.GENEROS.filter((g) => usados.has(g))];
  const caixa = document.getElementById("filtros");
  caixa.replaceChildren();
  generos.forEach((g) => {
    const b = el("button", "chip" + (g === estado.genero ? " ativo" : ""), g);
    b.type = "button";
    b.setAttribute("aria-pressed", g === estado.genero);
    b.onclick = () => { estado.genero = g; desenharFiltros(); desenhar(); };
    caixa.append(b);
  });
}

function desenharDestaque() {
  const jogo = window.JOGOS.find((j) => j.destaque && j.status === "disponivel");
  const caixa = document.getElementById("destaque");
  if (!jogo) { caixa.hidden = true; return; }
  caixa.replaceChildren();
  if (jogo.apresentacao) {
    caixa.classList.add("destaque-investigacao");
    caixa.append(criarHeroInvestigacao(jogo));
    return;
  }
  caixa.style.setProperty("--cor", jogo.cor);
  const texto = el("div", "destaque-texto");
  texto.append(el("span", "destaque-rotulo", ehNovo(jogo) ? "Novo lançamento" : "Em destaque"));
  texto.append(el("h2", null, jogo.titulo));
  texto.append(el("p", null, jogo.descricao));
  const botao = el("a", "botao", "▶ Jogar agora");
  botao.href = "jogo.html?id=" + encodeURIComponent(jogo.id);
  texto.append(botao);
  caixa.append(texto, el("div", "destaque-icone", jogo.icone || "🎮"));
}

function desenhar() {
  const conteudo = document.getElementById("conteudo");
  conteudo.replaceChildren();
  const filtrando = estado.genero !== "Todos" || estado.busca.trim();

  if (!filtrando) {
    const ultimos = recentes().map(jogoPorId).filter(Boolean);
    if (ultimos.length) conteudo.append(secao("Jogados recentemente", ultimos));
    const favs = favoritos().map(jogoPorId).filter(Boolean);
    if (favs.length) conteudo.append(secao("Seus favoritos", favs));
  }

  const lista = filtrar();
  const disponiveis = lista.filter((j) => j.status === "disponivel")
    .sort((a, b) => (b.lancamento || "").localeCompare(a.lancamento || ""));
  const breve = lista.filter((j) => j.status === "em-breve");

  if (disponiveis.length) {
    conteudo.append(secao(filtrando ? `Resultados (${disponiveis.length})` : "Todos os jogos", disponiveis));
  }
  if (breve.length) conteudo.append(secao("Em breve", breve));
  if (!lista.length) conteudo.append(el("p", "vazio", "Nenhum jogo encontrado. Tente outro gênero ou termo."));
}

preencherMarca();
document.title = window.SITE.nome;
document.querySelector("[data-site-slogan]").textContent = window.SITE.slogan;
document.getElementById("contador").textContent =
  window.JOGOS.filter((j) => j.status === "disponivel").length + " jogos";
document.getElementById("busca").addEventListener("input", (e) => {
  estado.busca = e.target.value;
  desenhar();
});
desenharDestaque();
desenharFiltros();
desenhar();
