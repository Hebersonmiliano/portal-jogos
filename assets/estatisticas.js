// Contador de visitas anônimo (GoatCounter: sem cookies, sem anúncios).
// Configure em jogos.js → window.SITE.estatisticas.goatcounter com o código da sua conta.
// Sem código, nada é enviado.
(function () {
  const codigo = ((window.SITE || {}).estatisticas || {}).goatcounter;
  window.contarEvento = function () {};
  if (!codigo || location.protocol === "file:") return;
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return; // respeita "não rastrear"
  const params = new URLSearchParams(location.search);
  // Página de cada jogo vira um caminho próprio: /jogo/<id>
  window.goatcounter = {
    path: function (p) {
      if (/jogo\.html$/.test(location.pathname) && params.get("id")) return "/jogo/" + params.get("id");
      return location.pathname.replace(/\/index\.html$/, "/");
    },
  };
  window.contarEvento = function (nome, titulo) {
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: nome, title: titulo || nome, event: true }); } catch (e) {}
  };
  const s = document.createElement("script");
  s.async = true; s.src = "https://gc.zgo.at/count.js";
  s.dataset.goatcounter = "https://" + codigo + ".goatcounter.com/count";
  document.head.append(s);
})();
