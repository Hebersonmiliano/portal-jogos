// Apresentação de Do Zero ao Império Industrial com capturas reais do jogo.
const cachePreviasImperio = new Map();
const filaPreviasImperio = [];
let gerandoPreviaImperio = false;

function definirImagemImperio(img, src) {
  if (!src) return;
  if (!src.includes('previa.html?fase=')) { img.src = src; return; }
  img.dataset.fonteImperio = src;
  const gerar = () => {
    if (!cachePreviasImperio.has(src)) {
      cachePreviasImperio.set(src, new Promise(resolve => filaPreviasImperio.push({ src, resolve })));
      processarPreviasImperio();
    }
    cachePreviasImperio.get(src).then(imagem => {
      if (img.dataset.fonteImperio !== src) return;
      if (imagem) { img.src = imagem; img.hidden = false; }
      else { img.alt = 'Prévia 3D indisponível neste navegador. O jogo requer WebGL.'; }
    });
  };
  // Uma renderização por vez, somente quando a imagem entra na área visível.
  if (typeof requestAnimationFrame !== 'function') return;
  if (typeof IntersectionObserver === 'function') {
    const observador = new IntersectionObserver(entradas => {
      if (entradas.some(e => e.isIntersecting)) { observador.disconnect(); gerar(); }
    }, { rootMargin: '200px' });
    observador.observe(img);
  } else gerar();
}

function processarPreviasImperio() {
  if (gerandoPreviaImperio || !filaPreviasImperio.length) return;
  gerandoPreviaImperio = true;
  const job = filaPreviasImperio.shift();
  const quadro = document.createElement('iframe');
  quadro.title = 'Gerando imagem da evolução da fábrica'; quadro.setAttribute('aria-hidden', 'true'); quadro.tabIndex = -1;
  quadro.style.cssText = 'position:fixed;left:-20000px;top:0;width:1280px;height:720px;opacity:0;pointer-events:none;border:0';
  let timer;
  const terminar = imagem => {
    clearTimeout(timer); window.removeEventListener('message', receber); quadro.remove();
    job.resolve(imagem); gerandoPreviaImperio = false; processarPreviasImperio();
  };
  const receber = evento => {
    if (evento.source !== quadro.contentWindow || (location.protocol !== 'file:' && evento.origin !== location.origin) || evento.data?.tipo !== 'imperio:previa') return;
    const imagem = evento.data.imagem;
    terminar(typeof imagem === 'string' && imagem.startsWith('data:image/png;base64,') && imagem.length < 12000000 ? imagem : null);
  };
  window.addEventListener('message', receber);
  timer = setTimeout(() => terminar(null), 12000);
  quadro.src = job.src; document.body.append(quadro);
}

function imagemImperio(src, alt, prioridade = false) {
  const img = el('img'); img.alt = alt;
  img.width = 1920; img.height = 1080;
  img.loading = prioridade ? 'eager' : 'lazy'; img.decoding = 'async';
  definirImagemImperio(img, src);
  return img;
}

function abrirFotoImperio(jogo, indice) {
  const fases = jogo.vitrineImperio.fases;
  const dialogo = el('dialog', 'imperio-lightbox');
  dialogo.setAttribute('aria-label', 'Imagens das evoluções da fábrica');
  const fechar = el('button', 'imperio-fechar', 'Fechar ×'); fechar.type = 'button';
  const figura = el('figure'), legenda = el('figcaption');
  const img = imagemImperio('', '', true);
  figura.append(img, legenda);
  const nav = el('div', 'imperio-foto-nav');
  const anterior = el('button', null, '← Anterior'), proxima = el('button', null, 'Próxima →');
  anterior.type = proxima.type = 'button';
  const pintar = () => {
    const fase = fases[indice]; definirImagemImperio(img, fase.imagem);
    img.alt = `Captura do jogo: ${fase.titulo}`;
    legenda.textContent = `${indice + 1} / ${fases.length} · ${fase.titulo} — ${fase.texto}`;
  };
  const mover = delta => { indice = (indice + delta + fases.length) % fases.length; pintar(); };
  anterior.onclick = () => mover(-1); proxima.onclick = () => mover(1);
  fechar.onclick = () => dialogo.close();
  dialogo.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); mover(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); mover(-1); }
  });
  dialogo.addEventListener('close', () => dialogo.remove(), { once: true });
  nav.append(anterior, proxima); dialogo.append(fechar, figura, nav);
  document.body.append(dialogo); pintar(); dialogo.showModal(); fechar.focus();
}

function criarVitrineImperio(jogo, iniciar, completo = false) {
  const dados = jogo.vitrineImperio;
  const secao = el('section', 'imperio-vitrine');
  secao.setAttribute('aria-label', 'Conheça Do Zero ao Império Industrial');
  const hero = el('div', 'imperio-hero');
  const texto = el('div', 'imperio-hero-texto');
  const titulo = el('h2', 'imperio-titulo', 'Do Zero ao ');
  titulo.append(el('span', null, 'Império Industrial'));
  texto.append(el('span', 'imperio-selo', 'GESTÃO DE FÁBRICA · 3D NO NAVEGADOR'), titulo,
    el('p', 'imperio-chamada', dados.chamada), el('p', 'imperio-resumo', dados.resumo));
  const fatos = el('div', 'imperio-fatos');
  ['R$ 100 para começar', '6 evoluções visuais', '3 tipos de caixas', 'Contratos à sua escolha'].forEach(f => fatos.append(el('span', null, f)));
  const acoes = el('div', 'imperio-acoes');
  const jogar = el(iniciar ? 'button' : 'a', 'botao imperio-jogar', '▶ Construir meu império');
  if (iniciar) { jogar.type = 'button'; jogar.onclick = iniciar; }
  else jogar.href = 'jogo.html?id=' + encodeURIComponent(jogo.id);
  acoes.append(jogar);
  if (!completo) {
    const conhecer = el('a', 'imperio-conhecer', 'Conhecer a história e as fases →');
    conhecer.href = 'jogo.html?id=' + encodeURIComponent(jogo.id); acoes.append(conhecer);
  }
  texto.append(fatos, acoes, el('p', 'imperio-dispositivos', 'Computador e celular · Progresso salvo no navegador'));
  const capa = el('figure', 'imperio-hero-foto');
  const ampliar = el('button', 'imperio-ampliar'); ampliar.type = 'button';
  ampliar.setAttribute('aria-label', 'Ampliar imagem do Império Industrial');
  ampliar.append(imagemImperio(dados.fases[5].imagem, 'A fábrica no estágio final, com máquinas, esteiras, equipe e central de controle', true));
  ampliar.onclick = () => abrirFotoImperio(jogo, 5);
  capa.append(ampliar, el('figcaption', null, 'SEU OBJETIVO · DA BANCADA À AUTOMAÇÃO TOTAL'));
  hero.append(texto, capa); secao.append(hero);

  const historia = el('div', 'imperio-historia');
  historia.append(el('span', 'imperio-selo', 'A HISTÓRIA É CONSTRUÍDA POR VOCÊ'),
    el('h3', null, 'A primeira caixa é só o começo.'),
    el('p', null, 'Não há uma fortuna esperando por você: há papelão para comprar, caixas para montar e clientes para conquistar. Cada venda é uma escolha entre manter a fábrica funcionando ou investir no próximo passo. Aos poucos, o trabalho de uma pessoa se transforma no esforço de uma equipe — e depois em uma linha de produção automatizada.'));
  secao.append(historia);
  const galeria = el('div', 'imperio-galeria');
  const indices = completo ? [0, 1, 2, 3, 4, 5] : [0, 2, 5];
  indices.forEach(i => {
    const fase = dados.fases[i], card = el('figure', 'imperio-fase');
    const foto = el('button', 'imperio-ampliar'); foto.type = 'button';
    foto.setAttribute('aria-label', `Ampliar etapa ${i + 1}: ${fase.titulo}`);
    foto.append(imagemImperio(fase.imagem, `Imagem real da etapa ${i + 1}: ${fase.titulo}`));
    foto.onclick = () => abrirFotoImperio(jogo, i);
    const legenda = el('figcaption');
    legenda.append(el('small', null, `ETAPA 0${i + 1}`), el('h3', null, fase.titulo), el('p', null, fase.texto));
    card.append(foto, legenda); galeria.append(card);
  });
  secao.append(el('p', 'imperio-galeria-nota', 'Imagens geradas a partir dos cenários 3D do próprio jogo. Clique ou toque para ampliar e percorrer as seis etapas.'), galeria);
  if (completo) {
    const fim = el('div', 'imperio-final');
    fim.append(el('p', null, 'Escolha seu produto, negocie contratos e dê o próximo passo na sua fábrica.'));
    const b = el('button', 'botao imperio-jogar', '▶ Começar com R$ 100'); b.type = 'button'; b.onclick = iniciar;
    fim.append(b); secao.append(fim);
  }
  return secao;
}
