// ============================================================
//  CATÁLOGO DO SITE — o único arquivo que você precisa editar
//  para adicionar um jogo novo:
//    1. copie a pasta do jogo para  jogos/<id>/
//    2. adicione um bloco { ... } na lista JOGOS abaixo
// ============================================================

window.SITE = {
  nome: "Portal Pixel",               // nome provisório
  slogan: "Jogos independentes, direto no navegador",
  autor: "Heberson Miliano",
};

// Gêneros fixos (poucos e estáveis). Use "tags" para o resto.
window.GENEROS = [
  "Ação", "Aventura", "Plataforma", "RPG", "Estratégia",
  "Puzzle", "Simulação", "Arcade", "Educativo",
];

window.JOGOS = [
  {
    id: "ultima-transmissao",
    titulo: "A Última Transmissão",
    genero: ["Aventura", "Puzzle"],
    tags: ["investigação", "mistério", "pistas", "suspense"],
    descricao: "Um pedido de socorro interrompe a programação da Rádio Aurora. Investigue uma recepção ilustrada, reúna seis pistas, confronte três depoimentos e apresente as provas para solucionar o desaparecimento de um jornalista.",
    controles: "Clique ou toque nos objetos para examinar as pistas. Consulte os depoimentos no caderno e conecte as provas para concluir o caso. Música ativada ao iniciar; use o botão para silenciar.",
    url: "jogos/ultima-transmissao/index.html",
    versao: "2026-10-21-retratos",
    capa: "jogos/ultima-transmissao/assets/recepcao.png",
    cor: "#d8b67a",
    icone: "🔎",
    engine: "HTML5",
    mobile: true,
    status: "disponivel",
    lancamento: "2026-10-21",
    destaque: true,
  },
  {
    id: "horda-eterna",
    titulo: "Horda Eterna",
    genero: ["Ação", "RPG"],
    tags: ["sobrevivência", "hordas", "classes", "poderes"],
    descricao: "Enfrente hordas, evolua seus poderes e sobreviva ao caos. Escolha sua classe, combine habilidades e encare chefões em uma batalha pela sobrevivência.",
    controles: "Teclado: WASD/setas para mover. Espaço usa dash. Consulte os atalhos das habilidades na tela do jogo.",
    url: "jogos/horda-eterna/index.html",
    versao: "1.0",
    capa: "",
    cor: "#7c3aed",
    icone: "🦇",
    engine: "HTML5",
    mobile: false,
    status: "disponivel",
    lancamento: "2026-10-21",
    destaque: true,
  },
  {
    id: "imperio-industrial",
    titulo: "Do Zero ao Império Industrial",
    genero: ["Simulação", "Estratégia"],
    tags: ["3D", "fábrica", "economia", "automação"],
    descricao:
      "Comece com R$ 100 e uma bancada numa pequena fábrica de caixas de papelão. Compre material, monte as caixas, " +
      "guarde no estoque e venda na expedição. Contrate funcionários, instale máquinas e esteiras e construa uma indústria totalmente automatizada.",
    controles: "Teclado: WASD/setas andam, E interage (segure na bancada para montar), L abre a loja, Esc pausa.",
    url: "jogos/imperio-industrial/index.html",
    versao: "1.1",   // mude sempre que atualizar o jogo
    capa: "jogos/imperio-industrial/capa.png",
    cor: "#d9822b",
    icone: "🏭",
    engine: "HTML5",
    mobile: false,
    status: "disponivel",
    lancamento: "2026-10-19",
    destaque: true,
  },
  {
    id: "brasa-eterna-2",
    titulo: "Brasa Eterna 2: Novos Horizontes",
    genero: ["Ação", "Aventura", "RPG"],
    tags: ["pixel art", "mundo aberto", "masmorras", "forja +7"],
    descricao:
      "A continuação de Brasa Eterna, agora em mundo aberto. Kael segue o rastro da cinza negra até a Vila Aurora: " +
      "explore masmorras, forje equipamentos até +7, use bombas, gancho e bumerangue, cace monstros raros e guarde fadas que te salvam.",
    controles: "Teclado: WASD/setas movem, J ataca e fala, K esquiva, L usa o item do atalho, R troca o item, I abre o menu. Também funciona com controle e no celular.",
    url: "jogos/brasa-eterna-2/index.html",
    versao: "2026-10-20-selva",   // mude sempre que atualizar o jogo
    capa: "jogos/brasa-eterna-2/capa.png",
    cor: "#3a6ad6",
    icone: "🌅",
    engine: "HTML5",
    mobile: true,
    status: "disponivel",
    lancamento: "2026-10-18",
    destaque: true,
  },
  {
    id: "brasa-eterna",
    titulo: "Brasa Eterna",
    genero: ["Ação", "Aventura", "RPG"],
    tags: ["pixel art", "estilo Zelda", "elementos", "dois finais"],
    descricao:
      "RPG de ação em pixel art no estilo Zelda clássico. Kael e a Faísca atravessam cinco capítulos " +
      "para recuperar as brasas da Chama Sagrada, dominar fogo, gelo, trovão e vento e enfrentar Morvane.",
    controles: "Teclado: WASD/setas movem, J ataca (segure para o disparo elemental), K esquiva, I abre os equipamentos. Também funciona com controle e no celular.",
    url: "jogos/brasa-eterna/index.html",
    versao: "1.1",   // mude sempre que atualizar o jogo
    capa: "jogos/brasa-eterna/capa.png",
    cor: "#c8501e",
    icone: "🔥",
    engine: "HTML5",
    mobile: true,
    status: "disponivel",
    lancamento: "2026-10-17",
    destaque: true,
  },
  {
    id: "crepusculo",
    titulo: "Crepúsculo dos Reinos",
    genero: ["RPG", "Estratégia"],
    tags: ["tático", "pixel art", "história longa"],
    descricao:
      "RPG tático em turnos no estilo Final Fantasy Tactics. Monte seu exército, evolua classes " +
      "e atravesse reinos em uma saga sobre a Coroa e os Fragmentos da Aurora.",
    controles: "Mouse: clique nas unidades para mover, atacar e usar habilidades.",
    url: "jogos/crepusculo/index.html",
    capa: "",                 // ex.: "jogos/crepusculo/capa.png" (vazio = capa automática)
    cor: "#7b4bb3",           // cor da capa automática
    icone: "⚔️",
    engine: "HTML5",
    mobile: false,
    status: "disponivel",     // "disponivel" | "em-breve"
    lancamento: "2026-10-16",
    destaque: true,
  },
  {
    id: "reino-colonos",
    titulo: "Reino dos Colonos",
    genero: ["Estratégia", "Simulação"],
    tags: ["construção", "economia", "isométrico"],
    descricao:
      "Construa estradas, ligue bandeiras e monte cadeias de produção: madeira, comida, minérios " +
      "e ferramentas. Expanda o território e enfrente o Reino de Morvane.",
    controles: "Mouse: escolha construções na barra de ferramentas e clique no mapa para construir.",
    url: "jogos/reino-colonos/index.html",
    capa: "",
    cor: "#3f8f4f",
    icone: "🏰",
    engine: "HTML5",
    mobile: false,
    status: "disponivel",
    lancamento: "2026-10-17",
    destaque: true,
  },
  {
    id: "foxaventura",
    titulo: "FoxAventura",
    genero: ["Plataforma", "Aventura"],
    tags: ["raposa", "9 fases", "chefões"],
    descricao:
      "Ajude a raposa a atravessar nove mundos cheios de robôs, drones e armadilhas.",
    controles: "Setas ou controle: mover · Espaço: pular.",
    url: "jogos/foxaventura/index.html",
    capa: "",
    cor: "#e07a2e",
    icone: "🦊",
    engine: "Godot",
    mobile: true,
    status: "em-breve",
    lancamento: "",
    destaque: false,
  },
];
