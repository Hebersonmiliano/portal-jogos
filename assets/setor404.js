// Apresentação do SETOR 404. Reutiliza o jogador do portal, sem abrir outro iframe.
function criarCardSetor404(jogo, iniciar) {
  const card=el('section','setor-card');card.setAttribute('aria-label','Conheça SETOR 404');
  const hero=el('div','setor-hero'),texto=el('div','setor-texto');
  texto.append(el('span','setor-selo','AÇÃO INDUSTRIAL · CAMPANHA COM 3 FASES'));
  const titulo=el('h2','setor-titulo','SETOR ');titulo.append(el('span',null,'404'));
  texto.append(titulo,el('p','setor-chamada','A fábrica parou. Você é a solução.'),
    el('p','setor-resumo','Vista o macacão de Maya Ferreira, técnica de manutenção. Enfrente robôs corrompidos, recupere fusíveis e devolva a energia à fábrica — um setor de cada vez.'));
  const fatos=el('div','setor-fatos');
  ['3 fases industriais','2 chefes industriais','9 painéis para reativar'].forEach(t=>fatos.append(el('span',null,t)));
  const jogar=el(iniciar?'button':'a','botao setor-jogar','▶ Jogar SETOR 404');
  if(iniciar){jogar.type='button';jogar.onclick=iniciar;}else jogar.href='jogo.html?id=setor-404';
  texto.append(fatos,jogar,el('p','setor-nota','Grátis · Computador com teclado · Sem instalação'));
  const maya=el('figure','setor-maya'),retrato=el('img');
  retrato.src='assets/setor-404/maya.png';retrato.alt='Maya Ferreira com macacão amarelo, óculos de proteção e ferramenta industrial';retrato.loading='lazy';retrato.decoding='async';retrato.width=320;retrato.height=420;
  const legenda=el('figcaption');legenda.append(el('strong',null,'MAYA FERREIRA'),el('span',null,'Técnica de manutenção · Sua personagem'));
  maya.append(retrato,legenda);hero.append(texto,maya);
  const recursos=el('div','setor-recursos');
  [['MANUTENÇÃO EM AÇÃO','Recupere fusíveis e segure E nos painéis. A Fase 1 preserva os movimentos aprovados da Maya.'],['LINHA FORA DE CONTROLE','Esteiras, prensas sinalizadas e soldadores. Repare os módulos e enfrente o Braço MX-02.'],['NÚCLEO 404','Isole circuitos para abrir portas e remover o escudo da Sentinela 404. Ataque quando o núcleo estiver exposto.']].forEach(([h,p])=>{const a=el('article');a.append(el('h3',null,h),el('p',null,p));recursos.append(a);});
  const galeria=el('div','setor-galeria');
  [['oficina.png','Fase 1 — Manutenção','Restaure a energia e ative os checkpoints.'],['montagem.png','Fase 2 — Montagem','Esteiras, prensas e o Braço MX-02.'],['central.png','Fase 3 — Núcleo 404','Isole circuitos e enfrente a Sentinela 404.']].forEach(([arquivo,nome,descricao])=>{
    const figura=el('figure'),img=el('img');img.src='assets/setor-404/'+arquivo;img.alt='Imagem do jogo — '+nome;img.loading='lazy';img.decoding='async';img.width=1280;img.height=426;
    const caption=el('figcaption');caption.append(el('strong',null,nome),el('span',null,descricao));figura.append(img,caption);galeria.append(figura);
  });
  card.append(hero,recursos,el('h3','setor-galeria-titulo','POR DENTRO DAS 3 FASES'),galeria,
    el('p','setor-rodape','Projeto educacional com temática industrial para apresentação no SENAI. Versão para teclado; sem controles de toque. O progresso é mantido durante a partida, não após recarregar a página.'));
  return card;
}
