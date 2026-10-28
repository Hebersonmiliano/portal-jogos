// Apresentação do SETOR 404. Reutiliza o jogador do portal, sem abrir outro iframe.
function criarCardSetor404(jogo, iniciar) {
  const card=el('section','setor-card');card.setAttribute('aria-label','Conheça SETOR 404');
  const hero=el('div','setor-hero'),texto=el('div','setor-texto');
  texto.append(el('span','setor-selo','SEMANA DA INDÚSTRIA · SENAI · 5 FASES'));
  const titulo=el('h2','setor-titulo','SETOR ');titulo.append(el('span',null,'404'));
  texto.append(titulo,el('p','setor-chamada','A fábrica parou. Você é a solução.'),
    el('p','setor-resumo','Vista o macacão de Maya Ferreira, técnica de manutenção. Enfrente robôs corrompidos, recupere fusíveis e devolva a energia à fábrica — um setor de cada vez.'));
  const fatos=el('div','setor-fatos');
  ['5 fases industriais','5 ferramentas','4 chefes industriais'].forEach(t=>fatos.append(el('span',null,t)));
  const jogar=el(iniciar?'button':'a','botao setor-jogar','▶ Jogar SETOR 404');
  if(iniciar){jogar.type='button';jogar.onclick=iniciar;}else jogar.href='jogo.html?id=setor-404';
  texto.append(fatos,jogar,el('p','setor-nota','Grátis · Computador com teclado · Sem instalação'));
  const maya=el('figure','setor-maya'),retrato=el('img');
  retrato.src='assets/setor-404/maya.png';retrato.alt='Maya Ferreira com macacão amarelo, óculos de proteção e ferramenta industrial';retrato.loading='lazy';retrato.decoding='async';retrato.width=320;retrato.height=420;
  const legenda=el('figcaption');legenda.append(el('strong',null,'MAYA FERREIRA'),el('span',null,'Técnica de manutenção · Sua personagem'));
  maya.append(retrato,legenda);hero.append(texto,maya);
  const recursos=el('div','setor-recursos');
  [['FERRAMENTAS QUE EVOLUEM','Chave fixa, lançador de rebites, arco elétrico e marreta hidráulica. Escolha uma secundária e desbloqueie o pulso especial na Fase 5.'],['DA MANUTENÇÃO AO CONTROLE','Restaure a energia, recupere a montagem, isole circuitos, resfrie a fundição e enfrente o Regente Industrial.'],['UM PROJETO EM EQUIPE','Desenvolvimento: Thamyris Lopes e Maria Luiza. Orientação: Prof. Heberson. Apresentação para a Semana da Indústria no SENAI.']].forEach(([h,p])=>{const a=el('article');a.append(el('h3',null,h),el('p',null,p));recursos.append(a);});
  const galeria=el('div','setor-galeria');
  [['oficina.png','Fase 1 — Manutenção','Chave industrial: sempre disponível.'],['montagem.png','Fase 2 — Montagem','Encontre o lançador de rebites.'],['central.png','Fase 3 — Núcleo 404','Desbloqueie o arco elétrico.'],['fundicao.png','Fase 4 — Fundição','Rompa obstáculos com a marreta.'],['controle.png','Fase 5 — Controle Central','Pulso especial e o confronto final.']].forEach(([arquivo,nome,descricao])=>{
    const figura=el('figure'),img=el('img');img.src='assets/setor-404/'+arquivo;img.alt='Imagem do jogo — '+nome;img.loading='lazy';img.decoding='async';img.width=1280;img.height=426;
    const caption=el('figcaption');caption.append(el('strong',null,nome),el('span',null,descricao));figura.append(img,caption);galeria.append(figura);
  });
  card.append(hero,recursos,el('h3','setor-galeria-titulo','POR DENTRO DAS 5 FASES'),galeria,
    el('p','setor-rodape','Projeto educacional com temática industrial para apresentação no SENAI. Versão para teclado; sem controles de toque. O progresso é mantido durante a partida, não após recarregar a página.'));
  return card;
}
