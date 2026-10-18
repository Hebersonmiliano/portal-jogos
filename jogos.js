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
    id: "brasa-eterna-2",
    titulo: "Brasa Eterna 2: Novos Horizontes",
    genero: ["Ação", "Aventura", "RPG"],
    tags: ["pixel art", "mundo aberto", "masmorras", "forja +7"],
    descricao:
      "A continuação de Brasa Eterna, agora em mundo aberto. Kael segue o rastro da cinza negra até a Vila Aurora: " +
      "explore masmorras, forje equipamentos até +7, use bombas, gancho e bumerangue, cace monstros raros e guarde fadas que te salvam.",
    controles: "Teclado: WASD/setas movem, J ataca e fala, K esquiva, L usa o item do atalho, R troca o item, I abre o menu. Também funciona com controle e no celular.",
    url: "jogos/brasa-eterna-2/index.html",
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
