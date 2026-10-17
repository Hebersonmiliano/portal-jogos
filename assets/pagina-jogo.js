// Página de um jogo: jogo embutido, tela cheia, informações e jogos parecidos.

const id = new URLSearchParams(location.search).get("id");
const jogo = jogoPorId(id);
preencherMarca();

if (!jogo) {
  document.getElementById("principal").replaceChildren(
    el("p", "vazio", "Jogo não encontrado."),
  );
} else {
  document.title = `${jogo.titulo} · ${window.SITE.nome}`;
  document.documentElement.style.setProperty("--cor", jogo.cor);
  document.getElementById("titulo").textContent = jogo.titulo;
  document.getElementById("generos").textContent = jogo.genero.join(" · ");
  document.getElementById("descricao").textContent = jogo.descricao;
  document.getElementById("controles").textContent = jogo.controles || "—";
  document.getElementById("engine").textContent = jogo.engine || "—";
  document.getElementById("celular").textContent = jogo.mobile ? "Sim" : "Melhor no computador";
  document.getElementById("lancamento").textContent = jogo.lancamento
    ? new Date(jogo.lancamento + "T00:00:00").toLocaleDateString("pt-BR")
    : "Em breve";

  const tags = document.getElementById("tags");
  (jogo.tags || []).forEach((t) => tags.append(el("span", "tag", t)));

  const palco = document.getElementById("palco");
  if (jogo.status === "disponivel") {
    const iniciar = el("button", "botao botao-grande", "▶ Jogar");
    iniciar.type = "button";
    const capa = criarCapa(jogo);
    capa.append(iniciar);
    palco.replaceChildren(capa);
    // O jogo só carrega quando a pessoa clica, para a página abrir rápido.
    iniciar.onclick = () => {
      const quadro = el("iframe");
      quadro.src = jogo.url;
      quadro.title = jogo.titulo;
      quadro.allow = "fullscreen; autoplay; gamepad";
      quadro.allowFullscreen = true;
      palco.replaceChildren(quadro);
      quadro.focus();
      marcarJogado(jogo.id);
      document.getElementById("tela-cheia").disabled = false;
    };
  } else {
    const capa = criarCapa(jogo);
    capa.append(el("p", "aviso-breve", "Este jogo está em produção. Volte em breve!"));
    palco.replaceChildren(capa);
  }

  document.getElementById("tela-cheia").onclick = () => {
    const quadro = palco.querySelector("iframe");
    if (quadro && quadro.requestFullscreen) quadro.requestFullscreen();
  };

  const botaoFav = document.getElementById("favorito");
  const pintarFav = () => {
    const sim = ehFavorito(jogo.id);
    botaoFav.textContent = sim ? "★ Favorito" : "☆ Favoritar";
    botaoFav.setAttribute("aria-pressed", sim);
  };
  botaoFav.onclick = () => { alternarFavorito(jogo.id); pintarFav(); };
  pintarFav();

  const parecidos = window.JOGOS
    .filter((j) => j.id !== jogo.id && j.genero.some((g) => jogo.genero.includes(g)))
    .slice(0, 4);
  const grade = document.getElementById("parecidos");
  if (parecidos.length) parecidos.forEach((j) => grade.append(criarCartao(j)));
  else grade.closest("section").hidden = true;
}
