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

  if (jogo.novidades && jogo.novidades.length) {
    const secao = document.getElementById("novidades");
    const lista = document.getElementById("novidades-lista");
    secao.hidden = false;
    jogo.novidades.forEach((n, i) => {
      const bloco = el("article", "novidade" + (i === 0 ? " novidade-atual" : ""));
      const cab = el("div", "novidade-cabecalho");
      cab.append(el("span", "novidade-versao", "v" + n.versao));
      if (n.data) cab.append(el("span", "novidade-data", new Date(n.data + "T00:00:00").toLocaleDateString("pt-BR")));
      const ul = el("ul");
      (n.itens || []).forEach((item) => ul.append(el("li", null, item)));
      bloco.append(cab, ul);
      lista.append(bloco);
    });
  }

  const palco = document.getElementById("palco");
  // Jogos com tela mais "quadrada" (ex.: 256x208) pedem um palco do mesmo formato, para não sobrar faixa preta.
  if (jogo.proporcao) { palco.style.aspectRatio = jogo.proporcao; palco.style.maxHeight = "86vh"; palco.style.width = "min(100%, calc(86vh * (" + jogo.proporcao + ")))"; palco.style.marginInline = "auto"; }
  window.addEventListener('message', evento => {
    const quadro = palco.querySelector('iframe');
    if (jogo.id === 'imperio-industrial' && quadro && evento.source === quadro.contentWindow && evento.data?.tipo === 'imperio-industrial:sair' && (location.protocol === 'file:' || evento.origin === location.origin)) {
      location.assign('index.html');
    }
  });
  if (jogo.status === "disponivel") {
    const iniciar = el("button", "botao botao-grande", "▶ Jogar");
    iniciar.type = "button";
    const capa = criarCapa(jogo);
    capa.append(iniciar);
    palco.replaceChildren(capa);
    if (jogo.cardSetor404) {
      const card=document.getElementById('apresentacao-setor404');card.hidden=false;
      card.append(criarCardSetor404(jogo,()=>iniciar.click()));
    }
    if (jogo.vitrineLenda) {
      const apresentacao = document.getElementById("apresentacao-lenda");
      apresentacao.hidden = false;
      apresentacao.append(criarVitrineLenda(jogo, () => iniciar.click()));
    }
    if (jogo.id === "faisca") {
      const apresentacao = document.getElementById("apresentacao-faisca");
      apresentacao.hidden = false;
      apresentacao.append(criarApresentacaoFaisca(true, () => iniciar.click()));
    }
    if (jogo.vitrineImperio2) {
      const apresentacao = document.getElementById("apresentacao-imperio2");
      apresentacao.hidden = false;
      apresentacao.append(criarVitrineImperio2(jogo, () => iniciar.click(), true));
    }
    if (jogo.vitrineImperio) {
      const apresentacao = document.getElementById("apresentacao-imperio");
      apresentacao.hidden = false;
      apresentacao.append(criarVitrineImperio(jogo, () => iniciar.click(), true));
    }
    // O jogo só carrega quando a pessoa clica, para a página abrir rápido.
    iniciar.onclick = () => {
      const quadro = el("iframe");
      // "versao" no catálogo força o navegador a baixar a versão nova do jogo (sem cache antigo).
      quadro.src = jogo.versao ? jogo.url + "?v=" + encodeURIComponent(jogo.versao) : jogo.url;
      quadro.title = jogo.titulo;
      quadro.allow = "fullscreen; autoplay; gamepad";
      quadro.allowFullscreen = true;
      palco.replaceChildren(quadro);
      if (jogo.cardSetor404) {
        document.getElementById('apresentacao-setor404').hidden=true;
        palco.scrollIntoView({block:'start',behavior:'auto'});
      }
      if (jogo.vitrineLenda) {
        document.getElementById("apresentacao-lenda").hidden = true;
        palco.scrollIntoView({ block: "start", behavior: "auto" });
      }
      if (jogo.id === "faisca") {
        document.getElementById("apresentacao-faisca").hidden = true;
        palco.scrollIntoView({ block: "start", behavior: "auto" });
      }
      if (jogo.vitrineImperio2) {
        document.getElementById("apresentacao-imperio2").hidden = true;
        palco.scrollIntoView({ block: "start", behavior: "auto" });
      }
      if (jogo.vitrineImperio) {
        document.getElementById("apresentacao-imperio").hidden = true;
        palco.scrollIntoView({ block: "start", behavior: "auto" });
      }
      quadro.focus();
      marcarJogado(jogo.id);
      if (typeof contarEvento === "function") contarEvento("jogar/" + jogo.id, "Jogou: " + jogo.titulo);
      document.getElementById("tela-cheia").disabled = false;
      if (jogo.apresentacao) {
        document.getElementById("apresentacao").hidden = true;
        palco.classList.add("palco-investigacao-ativo");
        palco.scrollIntoView({ block: "start", behavior: "auto" });
      }
      if (jogo.vitrineIndustrial) {
        document.getElementById("apresentacao-industrial").hidden = true;
        palco.scrollIntoView({ block: "start", behavior: "auto" });
      }
    };
    if (jogo.apresentacao) {
      const apresentacao = document.getElementById("apresentacao");
      apresentacao.hidden = false;
      apresentacao.append(criarHeroInvestigacao(jogo, () => iniciar.click()));
      preencherApresentacaoInvestigacao(jogo);
    }
    if (jogo.vitrineIndustrial) {
      const card = document.getElementById("apresentacao-industrial");
      card.hidden = false;
      card.append(criarCardIndustrial(jogo, () => iniciar.click()));
    }
  } else {
    const capa = criarCapa(jogo);
    capa.append(el("p", "aviso-breve", "Este jogo está em produção. Volte em breve!"));
    palco.replaceChildren(capa);
  }

  document.getElementById("tela-cheia").onclick = () => {
    const quadro = palco.querySelector("iframe");
    if (quadro && quadro.requestFullscreen) quadro.requestFullscreen();
  };

  // Compartilhar: usa o link curto j/<id>/, que mostra a prévia com imagem no WhatsApp.
  const botaoComp = document.getElementById("compartilhar");
  if (botaoComp) {
    const base = (window.SITE.url || "").replace(/\/?$/, "/");
    const link = base + "j/" + encodeURIComponent(jogo.id) + "/";
    const texto = jogo.titulo + " — " + (typeof resumoJogo === "function" ? resumoJogo(jogo) : "") + " Jogue grátis:";
    botaoComp.onclick = async () => {
      if (typeof contarEvento === "function") contarEvento("compartilhar/" + jogo.id, "Compartilhou: " + jogo.titulo);
      const nav = typeof navigator !== "undefined" ? navigator : {};
      try {
        if (nav.share) { await nav.share({ title: jogo.titulo, text: texto, url: link }); return; }
        await nav.clipboard.writeText(link);
        botaoComp.textContent = "✓ Link copiado";
      } catch (e) {
        if (e && e.name === "AbortError") return;
        window.open("https://wa.me/?text=" + encodeURIComponent(texto + " " + link), "_blank", "noopener");
      }
      setTimeout(() => (botaoComp.textContent = "↗ Compartilhar"), 2200);
    };
  }
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

function preencherApresentacaoInvestigacao(jogo) {
  const p = jogo.apresentacao, destino = document.getElementById("conteudo-investigacao");
  destino.hidden = false;
  const personagens = el("section", "investigacao-personagens");
  personagens.append(el("span", "investigacao-selo", "CONHEÇA AS PESSOAS POR TRÁS DO SILÊNCIO"), el("h2", null, "Cada rosto tem uma versão."), el("p", "investigacao-introducao", "Ouça os depoimentos, escolha as provas e faça as perguntas certas. Um detalhe pode mudar sua interpretação."), criarElenco(jogo, true));
  const galeria = el("section", "investigacao-galeria");
  galeria.append(el("span", "investigacao-selo", "TRÊS AMBIENTES. UMA NOITE PARA RECONSTRUIR."), el("h2", null, "Entre nos lugares onde tudo aconteceu."));
  const cenas = el("div", "investigacao-cenas");
  p.galeria.forEach((cena) => {
    const figura = el("figure"), imagem = el("img");
    imagem.src = cena.imagem;
    imagem.alt = cena.titulo + ": " + cena.texto;
    imagem.loading = "lazy";
    imagem.decoding = "async";
    const legenda = el("figcaption");
    legenda.append(el("h3", null, cena.titulo), el("p", null, cena.texto));
    figura.append(imagem, legenda);
    cenas.append(figura);
  });
  galeria.append(cenas);
  const experiencia = el("section", "investigacao-experiencia");
  experiencia.append(el("h2", null, "Mais do que encontrar objetos."), el("p", null, "Restaure uma gravação, reconstrua a ordem dos acontecimentos e ajude a encontrar Miguel. Suas conclusões precisam fazer sentido com as provas."));
  const lista = el("ul");
  p.beneficios.forEach((texto) => lista.append(el("li", null, "✓ " + texto)));
  experiencia.append(lista);
  const jogar = el("a", "botao investigacao-jogar", "▶ Quero investigar");
  jogar.href = "#palco";
  jogar.onclick = (e) => {
    e.preventDefault();
    const iniciar = document.getElementById("palco").querySelector("button");
    if (iniciar) iniciar.click();
    else document.getElementById("palco").scrollIntoView({ block: "start", behavior: "auto" });
  };
  experiencia.append(jogar);
  destino.append(personagens, galeria, experiencia);
}
