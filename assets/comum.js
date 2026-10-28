// Funções compartilhadas entre a vitrine e a página do jogo.

const DIAS_NOVO = 7;

const Guardado = {
  ler(chave) {
    try { return JSON.parse(localStorage.getItem(chave)) || []; } catch { return []; }
  },
  gravar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch {}
  },
};

function favoritos() { return Guardado.ler("portal.favoritos"); }
function ehFavorito(id) { return favoritos().includes(id); }
function alternarFavorito(id) {
  const f = favoritos();
  const i = f.indexOf(id);
  i >= 0 ? f.splice(i, 1) : f.unshift(id);
  Guardado.gravar("portal.favoritos", f);
  return i < 0;
}

function recentes() { return Guardado.ler("portal.recentes"); }
function marcarJogado(id) {
  const r = recentes().filter((x) => x !== id);
  r.unshift(id);
  Guardado.gravar("portal.recentes", r.slice(0, 8));
}

function ehNovo(jogo) {
  if (!jogo.lancamento || jogo.status !== "disponivel") return false;
  const dias = (Date.now() - new Date(jogo.lancamento + "T00:00:00")) / 86400000;
  return dias >= 0 && dias <= DIAS_NOVO;
}

// Verdadeiro quando o jogo já foi lançado há mais de DIAS_NOVO dias mas ganhou uma
// atualização (entrada em "novidades") recente — mostra "Atualizado" em vez de "Novo".
function ehAtualizado(jogo) {
  if (ehNovo(jogo) || jogo.status !== "disponivel") return false;
  const ultima = (jogo.novidades || [])[0];
  if (!ultima || !ultima.data) return false;
  const dias = (Date.now() - new Date(ultima.data + "T00:00:00")) / 86400000;
  return dias >= 0 && dias <= DIAS_NOVO;
}

function jogoPorId(id) { return window.JOGOS.find((j) => j.id === id); }
// Frase curta do jogo: usa "chamada" do catálogo ou a primeira frase da descrição.
function resumoJogo(jogo) {
  if (jogo.chamada) return jogo.chamada;
  const d = (jogo.descricao || "").trim(), m = d.match(/^.{20,170}?[.!?](\s|$)/);
  return m ? m[0].trim() : d.slice(0, 150) + (d.length > 150 ? "…" : "");
}

function el(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto != null) e.textContent = texto;
  return e;
}

// Capa: usa a imagem se existir; senão gera uma a partir da cor e do ícone.
function criarCapa(jogo) {
  const capa = el("div", "capa");
  capa.style.setProperty("--cor", jogo.cor || "#5566aa");
  if (jogo.capa) {
    const img = el("img");
    img.src = jogo.capa;
    img.alt = "";
    img.loading = "lazy";
    capa.append(img);
  } else {
    capa.classList.add("capa-auto");
    capa.append(el("span", "capa-icone", jogo.icone || "🎮"), el("span", "capa-titulo", jogo.titulo));
  }
  const selos = el("div", "selos");
  if (jogo.status === "em-breve") selos.append(el("span", "selo selo-breve", "Em breve"));
  else if (ehNovo(jogo)) selos.append(el("span", "selo selo-novo", "Novo"));
  else if (ehAtualizado(jogo)) selos.append(el("span", "selo selo-atualizado", "Atualizado" + (jogo.versaoJogo ? " v" + jogo.versaoJogo : "")));
  if ((jogo.tags || []).includes("completo")) selos.append(el("span", "selo selo-completo", "Completo"));
  if (jogo.mobile) selos.append(el("span", "selo selo-mobile", "📱 Celular"));
  capa.append(selos);
  if (jogo.id === "faisca") {
    capa.classList.add("capa-faisca");
    const retrato = el("img", "faisca-mini");
    retrato.src = "assets/faisca/personagem.png";
    retrato.alt = "Faísca com capuz azul, olhos luminosos e lenço amarelo";
    retrato.loading = "lazy";
    capa.append(retrato);
  }
  if (jogo.vitrineIndustrial) {
    capa.classList.add("capa-security");
    const robo = el("img", "security-mini-robo");
    robo.src = jogo.vitrineIndustrial.personagem;
    robo.alt = jogo.vitrineIndustrial.personagemAlt;
    robo.loading = "lazy";
    robo.decoding = "async";
    capa.append(robo, el("span", "security-capa-titulo", "SECURITY\nTEST"));
  }
  if (jogo.apresentacao) {
    capa.classList.add("capa-investigacao");
    const elenco = el("div", "elenco-mini");
    elenco.setAttribute("aria-hidden", "true");
    jogo.apresentacao.personagens.forEach((p) => {
      const img = el("img");
      img.src = p.imagem;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      elenco.append(img);
    });
    capa.append(elenco, el("span", "capa-capitulo", "UM CASO. VÁRIAS VERSÕES."));
  }
  return capa;
}

function criarCartao(jogo) {
  const a = el("a", "cartao");
  a.href = "jogo.html?id=" + encodeURIComponent(jogo.id);
  a.append(criarCapa(jogo));
  const info = el("div", "cartao-info");
  info.append(el("h3", null, jogo.titulo));
  info.append(el("p", "cartao-generos", jogo.genero.join(" · ")));
  if (jogo.id === "faisca") info.append(el("p", "faisca-resumo", "20 fases de precisão. Salte, use o dash e encontre o intervalo entre as armadilhas."));
  if (jogo.vitrineIndustrial) {
    a.classList.add("cartao-security");
    info.append(el("p", "security-cartao-resumo", "14 fases. Armadilhas industriais. Um robô tentando escapar."), el("span", "security-cartao-convite", "Aceitar o desafio →"));
  }
  if (jogo.apresentacao) {
    a.classList.add("cartao-investigacao");
    info.append(el("p", "cartao-chamada", jogo.apresentacao.card));
    const fatos = el("p", "cartao-fatos");
    jogo.apresentacao.recursos.forEach((r) => fatos.append(el("span", null, r.valor + " " + r.rotulo.split(" ")[0])));
    info.append(fatos, el("span", "cartao-convite", "Investigar o caso →"));
  }
  if (jogo.vitrineImperio2) {
    a.classList.add("cartao-imp2");
    info.append(el("p", "imp2-mini-resumo", "A sequência: contratos com prazo, linha automática, manutenção, energia, dia e noite."), el("span", "imp2-mini-convite", "Abrir a oficina →"));
  }
  if (jogo.vitrineImperio) {
    a.classList.add("cartao-imperio");
    info.append(el("p", "imperio-mini-resumo", "Da garagem à automação total: 6 evoluções, 3 produtos e contratos para escolher."), el("span", "imperio-mini-convite", "Construa seu império →"));
  }
  if (info.children.length <= 2) info.append(el("p", "cartao-resumo", resumoJogo(jogo)));
  if (jogo.status === "disponivel") a.children[0].append(el("span", "capa-jogar", "▶ Jogar"));
  a.append(info);
  return a;
}

// Apresentação opcional: jogos sem esses dados mantêm o cartão e o destaque originais.
function criarElenco(jogo, completo = false) {
  const grupo = el("div", completo ? "elenco-completo" : "elenco-destaque");
  jogo.apresentacao.personagens.forEach((p) => {
    const figura = el("figure", "retrato-personagem");
    const img = el("img");
    img.src = p.imagem;
    img.alt = "Retrato de " + p.nome;
    img.loading = "lazy";
    img.decoding = "async";
    const legenda = el("figcaption");
    legenda.append(el("small", null, p.papel), el("strong", null, p.nome));
    if (completo) legenda.append(el("p", null, p.frase));
    figura.append(img, legenda);
    grupo.append(figura);
  });
  return grupo;
}

function criarFatosInvestigacao(jogo) {
  const fatos = el("div", "investigacao-fatos");
  jogo.apresentacao.recursos.forEach((r) => {
    const fato = el("div");
    fato.append(el("strong", null, r.valor), el("span", null, r.rotulo));
    fatos.append(fato);
  });
  return fatos;
}

function criarHeroInvestigacao(jogo, iniciar) {
  const p = jogo.apresentacao, hero = el("div", "investigacao-hero");
  const fundo = el("img", "investigacao-fundo");
  fundo.src = jogo.capa;
  fundo.alt = "";
  fundo.decoding = "async";
  const texto = el("div", "investigacao-texto");
  texto.append(el("span", "investigacao-selo", p.selo), el("h2", null, iniciar ? p.chamada : jogo.titulo), el("p", "investigacao-chamada", iniciar ? p.convite : p.chamada), el("p", "investigacao-resumo", p.resumo), criarFatosInvestigacao(jogo));
  const botao = el(iniciar ? "button" : "a", "botao investigacao-jogar", "▶ Começar a investigação");
  if (iniciar) { botao.type = "button"; botao.onclick = iniciar; }
  else botao.href = "jogo.html?id=" + encodeURIComponent(jogo.id);
  texto.append(botao, el("p", "investigacao-nota", "Grátis · Sem instalação · Sem limite de tempo"));
  hero.append(fundo, texto, criarElenco(jogo));
  return hero;
}

function criarCardIndustrial(jogo, iniciar) {
  const dados = jogo.vitrineIndustrial;
  const card = el("section", "security-card");
  card.setAttribute("aria-label", "Conheça SECURITY TEST");
  const hero = el("div", "security-hero");
  const fundo = el("img", "security-fundo");
  fundo.src = jogo.capa;
  fundo.alt = "";
  fundo.loading = "lazy";
  fundo.decoding = "async";
  const texto = el("div", "security-texto");
  const titulo = el("h2", "security-titulo", "SECURITY ");
  titulo.append(el("span", null, "TEST"));
  texto.append(el("span", "security-selo", dados.selo), titulo,
    el("p", "security-chamada", dados.chamada), el("p", "security-resumo", dados.resumo));
  const fatos = el("div", "security-fatos");
  ["14 fases", "Pixel art", "Dificuldade extrema"].forEach((fato) => fatos.append(el("span", null, fato)));
  const jogar = el(iniciar ? "button" : "a", "botao security-jogar", "▶ Jogar SECURITY TEST");
  if (iniciar) { jogar.type = "button"; jogar.onclick = iniciar; }
  else jogar.href = "jogo.html?id=" + encodeURIComponent(jogo.id);
  texto.append(fatos, jogar, el("p", "security-dispositivos", "Teclado · Controle Xbox · Celular"));
  const personagem = el("figure", "security-personagem");
  const robo = el("img");
  robo.src = dados.personagem;
  robo.alt = dados.personagemAlt;
  robo.loading = "lazy";
  robo.decoding = "async";
  robo.width = 96;
  robo.height = 96;
  const legenda = el("figcaption");
  legenda.append(el("span", null, "CONHEÇA O ROBÔ"), el("p", null, dados.personagemLegenda));
  personagem.append(robo, legenda);
  hero.append(fundo, texto, personagem);
  const comentarios = el("div", "security-comentarios");
  dados.comentarios.forEach((comentario) => {
    const nota = el("article");
    nota.append(el("h3", null, comentario.titulo), el("p", null, comentario.texto));
    comentarios.append(nota);
  });
  card.append(hero, comentarios);
  return card;
}

function preencherMarca() {
  document.querySelectorAll("[data-site-nome]").forEach((e) => (e.textContent = window.SITE.nome));
  document.querySelectorAll("[data-site-autor]").forEach((e) => (e.textContent = window.SITE.autor));
  document.querySelectorAll("[data-ano]").forEach((e) => (e.textContent = new Date().getFullYear()));
}
