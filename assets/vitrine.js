// Página inicial: carrossel de destaques, grade de jogos com filtros e busca, vitrines em abas e ferramentas.

const estado = { genero: "Todos", busca: "" };

function secao(titulo, jogos) {
  const s = el("section", "secao");
  if (titulo) s.append(el("h3", "secao-titulo", titulo));
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

// ---------- Carrossel de destaques ----------
function jogosDoCarrossel() {
  const ids = (window.SITE && window.SITE.carrossel) || [];
  let lista = ids.map(jogoPorId).filter((j) => j && j.status === "disponivel" && j.capa);
  if (!lista.length) lista = window.JOGOS.filter((j) => j.destaque && j.status === "disponivel" && j.capa).slice(0, 5);
  return lista;
}

function desenharDestaque() {
  const caixa = document.getElementById("destaque");
  const jogos = jogosDoCarrossel();
  caixa.replaceChildren();
  if (!jogos.length) { caixa.hidden = true; return; }
  const maisNovo = [...jogos].sort((a, b) => (b.lancamento || "").localeCompare(a.lancamento || ""))[0];
  const trilho = el("div", "carrossel-trilho");
  const pontos = el("div", "carrossel-pontos");
  const slides = jogos.map((j, i) => {
    const s = el("article", "slide");
    s.style.setProperty("--cor", j.cor || "#5566aa");
    s.setAttribute("aria-roledescription", "slide");
    s.setAttribute("aria-label", i + 1 + " de " + jogos.length + ": " + j.titulo);
    if (i) s.hidden = true;
    const fundo = el("img", "slide-fundo"); fundo.src = j.capa; fundo.alt = ""; fundo.decoding = "async"; if (i) fundo.loading = "lazy";
    const texto = el("div", "slide-texto");
    texto.append(el("span", "slide-rotulo", j === maisNovo ? "Novo lançamento" : "Em destaque"));
    texto.append(el("h2", "slide-titulo", j.titulo));
    texto.append(el("p", "slide-chamada", resumoJogo(j)));
    const gen = el("p", "slide-generos");
    j.genero.forEach((g) => gen.append(el("span", null, g)));
    if (j.mobile) gen.append(el("span", null, "📱 Celular"));
    texto.append(gen);
    const botoes = el("div", "slide-botoes");
    const jogar = el("a", "botao", "▶ Jogar agora"); jogar.href = "jogo.html?id=" + encodeURIComponent(j.id);
    botoes.append(jogar);
    if (VITRINES.some((v) => v.id === j.id)) {
      const mais = el("a", "botao botao-sec", "Conhecer o jogo"); mais.href = "#vitrines";
      mais.onclick = (e) => { e.preventDefault && e.preventDefault(); abrirVitrine(j.id, true); };
      botoes.append(mais);
    }
    texto.append(botoes);
    const arte = el("div", "slide-arte");
    const img = el("img"); img.src = j.capa; img.alt = "Imagem do jogo " + j.titulo; img.decoding = "async"; if (i) img.loading = "lazy";
    arte.append(img);
    s.append(fundo, texto, arte);
    trilho.append(s);
    const p = el("button", "carrossel-ponto" + (i ? "" : " ativo"));
    p.type = "button"; p.setAttribute("aria-label", "Mostrar " + j.titulo);
    p.onclick = () => { mostrar(i); reiniciar(); };
    pontos.append(p);
    return s;
  });
  let atual = 0, timer = null;
  function mostrar(n) {
    atual = (n + slides.length) % slides.length;
    slides.forEach((s, i) => { s.hidden = i !== atual; });
    Array.from(pontos.children).forEach((p, i) => (p.className = "carrossel-ponto" + (i === atual ? " ativo" : "")));
  }
  const calmo = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function reiniciar() {
    if (typeof setInterval !== "function" || calmo || slides.length < 2) return;
    clearInterval(timer); timer = setInterval(() => mostrar(atual + 1), 7000);
  }
  const ant = el("button", "carrossel-seta carrossel-ant", "‹"); ant.type = "button"; ant.setAttribute("aria-label", "Destaque anterior");
  const prox = el("button", "carrossel-seta carrossel-prox", "›"); prox.type = "button"; prox.setAttribute("aria-label", "Próximo destaque");
  ant.onclick = () => { mostrar(atual - 1); reiniciar(); };
  prox.onclick = () => { mostrar(atual + 1); reiniciar(); };
  caixa.append(trilho, ant, prox, pontos);
  if (slides.length < 2) { ant.hidden = prox.hidden = pontos.hidden = true; }
  caixa.addEventListener("mouseenter", () => clearInterval(timer));
  caixa.addEventListener("mouseleave", reiniciar);
  caixa.addEventListener("focusin", () => clearInterval(timer));
  reiniciar();
}

// ---------- Vitrines em abas ----------
const VITRINES = [
  { id: "lenda-da-brasa", criar: (j) => criarVitrineLenda(j) },
  { id: "cafe-com-patas", criar: (j) => criarVitrineCafe(j) },
  { id: "imperio-industrial-2", criar: (j) => criarVitrineImperio2(j) },
  { id: "ultima-transmissao", criar: (j) => { const c = el("section", "destaque destaque-investigacao"); c.append(criarHeroInvestigacao(j)); return c; } },
  { id: "imperio-industrial", criar: (j) => criarVitrineImperio(j) },
  { id: "setor-404", criar: (j) => criarCardSetor404(j) },
  { id: "faisca", criar: () => criarApresentacaoFaisca(false) },
  { id: "security-test", criar: (j) => criarCardIndustrial(j) },
];
const abasCriadas = [];
function desenharVitrines() {
  const abas = document.getElementById("abas"), paineis = document.getElementById("paineis");
  abas.replaceChildren(); paineis.replaceChildren(); abasCriadas.length = 0;
  VITRINES.forEach((v, i) => {
    const j = jogoPorId(v.id);
    if (!j || j.status !== "disponivel" || typeof v.criar !== "function") return;
    let conteudo;
    try { conteudo = v.criar(j); } catch (e) { return; }
    if (!conteudo) return;
    const n = abasCriadas.length;
    const aba = el("button", "aba" + (n ? "" : " ativa"));
    aba.type = "button"; aba.setAttribute("role", "tab"); aba.setAttribute("aria-selected", n === 0); aba.id = "aba-" + v.id;
    if (j.capa) { const t = el("img", "aba-capa"); t.src = j.capa; t.alt = ""; t.loading = "lazy"; aba.append(t); }
    aba.append(el("span", null, j.titulo));
    const painel = el("div", "painel");
    painel.setAttribute("role", "tabpanel"); painel.id = "painel-" + v.id; painel.setAttribute("aria-labelledby", aba.id);
    painel.hidden = n !== 0; painel.append(conteudo);
    aba.onclick = () => abrirVitrine(v.id, false);
    abas.append(aba); paineis.append(painel);
    abasCriadas.push({ id: v.id, aba, painel });
  });
  if (!abasCriadas.length) document.getElementById("vitrines").hidden = true;
}
function abrirVitrine(id, rolar) {
  abasCriadas.forEach((a) => {
    const on = a.id === id;
    a.aba.className = "aba" + (on ? " ativa" : ""); a.aba.setAttribute("aria-selected", on); a.painel.hidden = !on;
  });
  if (rolar) document.getElementById("vitrines").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- Grade ----------
function desenhar() {
  const conteudo = document.getElementById("conteudo");
  conteudo.replaceChildren();
  const filtrando = estado.genero !== "Todos" || estado.busca.trim();
  document.getElementById("vitrines").hidden = !!filtrando || !abasCriadas.length;

  if (!filtrando) {
    const ultimos = recentes().map(jogoPorId).filter(Boolean);
    if (ultimos.length) conteudo.append(secao("Jogados recentemente", ultimos.slice(0, 5)));
    const favs = favoritos().map(jogoPorId).filter(Boolean);
    if (favs.length) conteudo.append(secao("Seus favoritos", favs));
  }

  const lista = filtrar();
  const disponiveis = lista.filter((j) => j.status === "disponivel")
    .sort((a, b) => (b.lancamento || "").localeCompare(a.lancamento || ""));
  const breve = lista.filter((j) => j.status === "em-breve");

  if (disponiveis.length) {
    conteudo.append(secao(filtrando ? `Resultados (${disponiveis.length})` : (conteudo.children.length ? "Todos os jogos" : null), disponiveis));
  }
  if (breve.length) conteudo.append(secao("Em breve", breve));
  if (!lista.length) conteudo.append(el("p", "vazio", "Nenhum jogo encontrado. Tente outro gênero ou termo."));
}

preencherMarca();
document.title = window.SITE.nome + " — jogos grátis no navegador";
Array.from(document.querySelectorAll("[data-site-slogan]")).forEach((e) => (e.textContent = window.SITE.slogan));
document.querySelector("[data-site-slogan]").textContent = window.SITE.slogan;
document.getElementById("contador").textContent =
  window.JOGOS.filter((j) => j.status === "disponivel").length + " jogos";
document.getElementById("busca").addEventListener("input", (e) => {
  estado.busca = e.target.value;
  desenhar();
  if (e.target.value.trim()) document.getElementById("jogos").scrollIntoView && document.getElementById("jogos").scrollIntoView({ block: "start" });
});
desenharVitrines();
desenharDestaque();
desenharFiltros();
desenhar();
