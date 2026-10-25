// Doações via Pix (e Ko-fi opcional). Configure em jogos.js → window.SITE.doacao.
// Sem chave Pix e sem link, nada aparece no site.
(function () {
  const cfg = (window.SITE && window.SITE.doacao) || {};
  const temPix = !!(cfg.pix && cfg.pix.trim()), temLink = !!(cfg.link && cfg.link.trim());
  if (!temPix && !temLink) return;

  // ---- BR Code (Pix estático, padrão do Banco Central) ----
  const tira = (s, max) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9 ]/g, '').toUpperCase().slice(0, max).trim();
  const campo = (id, valor) => id + String(valor.length).padStart(2, '0') + valor;
  function crc16(txt) { let crc = 0xFFFF; for (let i = 0; i < txt.length; i++) { crc ^= txt.charCodeAt(i) << 8; for (let j = 0; j < 8; j++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF; } return crc.toString(16).toUpperCase().padStart(4, '0'); }
  function brcode() {
    const conta = campo('00', 'br.gov.bcb.pix') + campo('01', cfg.pix.trim()) + (cfg.descricao ? campo('02', tira(cfg.descricao, 40)) : '');
    let p = campo('00', '01') + campo('26', conta) + campo('52', '0000') + campo('53', '986') + campo('58', 'BR') +
      campo('59', tira(cfg.nome || 'PORTAL PIXEL', 25) || 'PORTAL PIXEL') + campo('60', tira(cfg.cidade || 'BRASIL', 15) || 'BRASIL') + campo('62', campo('05', '***')) + '6304';
    return p + crc16(p);
  }
  window.__pixBrcode = temPix ? brcode : null;

  const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  let caixa = null;
  function abrir() {
    if (typeof window.contarEvento === "function") window.contarEvento("apoiar/abriu", "Abriu a janela de apoio");
    if (!caixa) {
      caixa = mk('dialog', 'apoio-dialogo'); caixa.setAttribute('aria-label', 'Apoiar o ' + (window.SITE.nome || 'site'));
      const fechar = mk('button', 'apoio-fechar', '✕'); fechar.type = 'button'; fechar.setAttribute('aria-label', 'Fechar'); fechar.onclick = () => caixa.close();
      caixa.append(fechar, mk('h2', null, '❤ Apoie o ' + (window.SITE.nome || 'site')),
        mk('p', 'apoio-texto', cfg.mensagem || 'Os jogos são grátis. Se você gostou, qualquer valor ajuda a manter o site no ar e a criar jogos novos. Obrigado!'));
      if (temPix) {
        const codigo = brcode(), qr = qrcode(0, 'M'); qr.addData(codigo); qr.make();
        const fig = mk('div', 'apoio-qr'); fig.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 3, scalable: true });
        const svg = fig.querySelector('svg'); if (svg) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'QR Code do Pix'); }
        const rot = mk('p', 'apoio-rotulo', 'Abra o app do seu banco, escolha Pix e leia o QR Code — ou use o Pix copia e cola:');
        const linha = mk('div', 'apoio-copia'), campoTxt = mk('input'); campoTxt.readOnly = true; campoTxt.value = codigo; campoTxt.setAttribute('aria-label', 'Pix copia e cola');
        const copiar = mk('button', 'botao apoio-copiar', 'Copiar'); copiar.type = 'button';
        copiar.onclick = async () => { if (typeof window.contarEvento === 'function') window.contarEvento('apoiar/copiou-pix', 'Copiou o Pix'); try { await navigator.clipboard.writeText(codigo); } catch (e) { campoTxt.select(); document.execCommand && document.execCommand('copy'); } copiar.textContent = 'Copiado! ✓'; setTimeout(() => (copiar.textContent = 'Copiar'), 2200); };
        linha.append(campoTxt, copiar);
        caixa.append(fig, rot, linha, mk('p', 'apoio-nome', 'Recebedor: ' + (cfg.nome || window.SITE.autor || '')));
      }
      if (temLink) { const a = mk('a', 'botao botao-sec apoio-link', cfg.linkTexto || 'Apoiar pelo Ko-fi (cartão/PayPal)'); a.href = cfg.link; a.target = '_blank'; a.rel = 'noopener'; caixa.append(a); }
      caixa.addEventListener('click', e => { if (e.target === caixa) caixa.close(); });
      document.body.append(caixa);
    }
    if (caixa.showModal) caixa.showModal(); else caixa.setAttribute('open', '');
  }
  window.abrirApoio = abrir;

  function montar() {
    // botão no topo de todas as páginas
    const topo = document.querySelector('.topo');
    if (topo) { const b = mk('button', 'apoio-topo', '❤ Apoiar'); b.type = 'button'; b.onclick = abrir; topo.append(b); }
    // página do jogo: ao lado de Favoritar e Tela cheia
    const acoes = document.querySelector('.acoes');
    if (acoes) { const b = mk('button', 'botao botao-sec apoio-acao', '❤ Apoiar'); b.type = 'button'; b.onclick = abrir; acoes.prepend(b); }
    // faixa na página inicial e na página do jogo, antes do rodapé
    const pagina = document.querySelector('main.pagina');
    if (pagina) {
      const faixa = mk('section', 'apoio-faixa'); faixa.setAttribute('aria-label', 'Apoie o site');
      const t = mk('div', 'apoio-faixa-texto');
      t.append(mk('strong', null, 'Gostou dos jogos?'), mk('span', null, 'Eles são grátis. Com qualquer valor no Pix você ajuda a manter o ' + (window.SITE.nome || 'site') + ' e a criar jogos novos.'));
      const b = mk('button', 'botao apoio-faixa-botao', '❤ Apoiar com Pix'); b.type = 'button'; b.onclick = abrir; if (!temPix) b.textContent = '❤ Apoiar';
      faixa.append(mk('div', 'apoio-coracao', '❤'), t, b); pagina.append(faixa);
    }
    if (location.hash === '#apoiar') abrir();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
})();
