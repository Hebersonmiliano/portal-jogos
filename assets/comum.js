// Funções compartilhadas entre a vitrine e a página do jogo.

const DIAS_NOVO = 30;

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

function jogoPorId(id) { return window.JOGOS.find((j) => j.id === id); }

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
    capa.append(el("span", "capa-icone", jogo.icone || "🎮"));
  }
  const selos = el("div", "selos");
  if (jogo.status === "em-breve") selos.append(el("span", "selo selo-breve", "Em breve"));
  else if (ehNovo(jogo)) selos.append(el("span", "selo selo-novo", "Novo"));
  if (jogo.mobile) selos.append(el("span", "selo selo-mobile", "📱 Celular"));
  capa.append(selos);
  return capa;
}

function criarCartao(jogo) {
  const a = el("a", "cartao");
  a.href = "jogo.html?id=" + encodeURIComponent(jogo.id);
  a.append(criarCapa(jogo));
  const info = el("div", "cartao-info");
  info.append(el("h3", null, jogo.titulo));
  info.append(el("p", "cartao-generos", jogo.genero.join(" · ")));
  a.append(info);
  return a;
}

function preencherMarca() {
  document.querySelectorAll("[data-site-nome]").forEach((e) => (e.textContent = window.SITE.nome));
  document.querySelectorAll("[data-site-autor]").forEach((e) => (e.textContent = window.SITE.autor));
  document.querySelectorAll("[data-ano]").forEach((e) => (e.textContent = new Date().getFullYear()));
}
