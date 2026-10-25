// ============================================================
//  CATÁLOGO DO SITE — o único arquivo que você precisa editar
//  para adicionar um jogo novo:
//    1. copie a pasta do jogo para  jogos/<id>/
//    2. adicione um bloco { ... } na lista JOGOS abaixo
//    3. rode  python3 ferramentas/previas/gerar.py  (cria a prévia de WhatsApp)
// ============================================================

window.SITE = {
  nome: "Portal Pixel",               // nome provisório
  slogan: "Jogos independentes, direto no navegador",
  autor: "Heberson Miliano",
  url: "https://hebersonmiliano.github.io/portal-jogos/", // endereço público (usado nas prévias de WhatsApp)
  // Contador de visitas anônimo: crie uma conta grátis em goatcounter.com e coloque o código aqui
  // (ex.: "portalpixel" para portalpixel.goatcounter.com). Vazio = desligado.
  estatisticas: { goatcounter: "" },
  // Jogos que aparecem no carrossel do topo, nesta ordem.
  carrossel: ["lenda-da-brasa", "ultima-transmissao", "setor-404", "faisca", "imperio-industrial", "security-test"],
  // Doações: preencha a chave Pix (de preferência uma chave ALEATÓRIA ou e-mail, nunca CPF)
  // e o botão "❤ Apoiar" aparece no site. Deixe vazio para esconder.
  doacao: {
    pix: "hebersonmiliano@gmail.com", // chave Pix (e-mail)
    nome: "HEBERSON MILIANO",   // nome do recebedor (até 25 letras, sem acento)
    cidade: "",                 // cidade do recebedor (até 15 letras)
    link: "",                   // opcional: link do Ko-fi, Apoia.se etc.
  },
};

// Gêneros fixos (poucos e estáveis). Use "tags" para o resto.
window.GENEROS = [
  "Ação", "Aventura", "Plataforma", "RPG", "Estratégia",
  "Puzzle", "Simulação", "Arcade", "Educativo",
];

window.JOGOS = [
  {
    id: "setor-404",
    chamada: "A fábrica parou. Você é a solução. Enfrente robôs corrompidos e devolva a energia, um setor de cada vez.",
    cardSetor404: true,
    titulo: "SETOR 404",
    genero: ["Ação", "RPG", "Plataforma"],
    tags: ["pixel art", "indústria", "manutenção", "Maya Ferreira", "SENAI", "fase 1"],
    descricao: "A fábrica parou. Assuma o papel de Maya Ferreira, técnica de manutenção, enfrente cinco robôs corrompidos e recupere os fusíveis. Reative os três painéis da Oficina, Montagem e Central de Energia para liberar a saída. Fase 1 jogável, com checkpoints e trilha industrial.",
    controles: "Computador com teclado: A/D ou setas andam; S agacha; S+A/D anda agachada; Shift+A/D corre; W/Espaço/cima pula; J/X ataca com a chave; K esquiva; segure E por 1 segundo para reparar um painel seguro com fusível. P/Esc pausa; M alterna o áudio. Clique em INICIAR FASE 1 para começar. O progresso dura apenas durante a partida; recarregar reinicia a fase.",
    url: "jogos/setor-404/index.html",
    versao: "1.1.0-energia",
    capa: "assets/setor-404/capa.png",
    cor: "#ffb42c",
    icone: "🔧",
    engine: "HTML5 · Canvas 2D",
    mobile: false,
    status: "disponivel",
    lancamento: "2026-10-23",
    destaque: false,
  },
  {
    id: "faisca",
    chamada: "Pequeno herói. Saltos ousados. Um mundo de armadilhas em 20 fases de precisão.",
    titulo: "FAÍSCA",
    genero: ["Plataforma", "Ação"],
    tags: ["cartoon", "armadilhas", "20 fases", "difícil", "controle"],
    descricao: "Corra, salte e use o dash para sobreviver a 20 fases de armadilhas. Três espaços de salvamento e ranking local. Versão em desenvolvimento: 20 cenários já receberam o novo visual cartoon.",
    controles: "Teclado: A/D ou setas movem; Espaço/W/cima pula; Shift/X usa dash; R reinicia; Esc pausa; M alterna áudio. Pulo na parede: solte e pressione pulo ao tocar a lateral. Controle: analógico/direcional move, A pula, X/RB usa dash, Y reinicia, Start pausa e B volta nos menus. Progresso e ranking ficam neste navegador. Recomendado para computador com teclado ou controle.",
    url: "jogos/faisca/index.html",
    versao: "0.20.1",
    capa: "assets/faisca/capa.png",
    cor: "#ffb641",
    icone: "⚡",
    engine: "Godot",
    mobile: false,
    status: "disponivel",
    lancamento: "2026-10-23",
    destaque: false,
  },
  {
    id: "ultima-transmissao",
    chamada: "Um pedido de socorro. Três versões. Uma verdade. Investigue o desaparecimento do jornalista Miguel.",
    titulo: "A Última Transmissão",
    genero: ["Aventura", "Puzzle"],
    tags: ["investigação", "mistério", "pistas", "suspense"],
    descricao: "Explore a recepção, o estúdio e o arquivo da Rádio Aurora. Reúna oito pistas, restaure uma gravação, confronte depoimentos e resgate Miguel. Reconstrua a noite para apresentar uma conclusão baseada em provas.",
    controles: "Clique ou toque nos objetos para examinar as pistas. Consulte os depoimentos no caderno e conecte as provas para concluir o caso. Música ativada ao iniciar; use o botão para silenciar.",
    url: "jogos/ultima-transmissao/index.html",
    versao: "2.0.0",
    apresentacao: {
      selo: "MISTÉRIOS DE AURORA · CAPÍTULO 01",
      chamada: "Um pedido de socorro. Três versões. Uma verdade.",
      resumo: "Às 23h47, a Rádio Aurora transmite um pedido de socorro e sai do ar. O jornalista Miguel desapareceu. Entre na rádio, examine os detalhes e descubra em quem confiar.",
      card: "O jornalista desapareceu. As versões não batem. Você consegue reconstruir aquela noite?",
      convite: "Entre na rádio. A próxima pista está esperando por você.",
      recursos: [
        { valor: "3", rotulo: "ambientes ilustrados" },
        { valor: "8", rotulo: "pistas para conectar" },
        { valor: "3", rotulo: "enigmas para resolver" },
      ],
      beneficios: ["Caso com começo e desfecho", "Escolha as provas nos depoimentos", "Música e som de conquista", "Salve e continue depois", "Jogue no PC ou celular", "Dicas sem perder pontos"],
      personagens: [
        { nome: "Miguel Santos", papel: "O jornalista", imagem: "jogos/ultima-transmissao/assets/miguel.png", frase: "Ele preparava uma denúncia. Agora ninguém sabe onde está." },
        { nome: "Clara Nunes", papel: "A produtora", imagem: "jogos/ultima-transmissao/assets/clara.png", frase: "Ela chegou depois da transmissão. O que Miguel tentou lhe contar?" },
        { nome: "Theo Martins", papel: "O técnico de som", imagem: "jogos/ultima-transmissao/assets/theo.png", frase: "Ele conhece cada canal da rádio. O silêncio também deixa registros." },
        { nome: "Raul Vieira", papel: "O diretor", imagem: "jogos/ultima-transmissao/assets/raul.png", frase: "Ele diz que já tinha ido embora. Até onde sua versão se sustenta?" },
      ],
      galeria: [
        { imagem: "jogos/ultima-transmissao/assets/recepcao.png", titulo: "A recepção", texto: "Um telefone, uma gaveta e detalhes que quase passam despercebidos." },
        { imagem: "jogos/ultima-transmissao/assets/estudio.png", titulo: "O estúdio", texto: "Entre na cabine e descubra o que ficou escondido na gravação." },
        { imagem: "jogos/ultima-transmissao/assets/arquivo.png", titulo: "O arquivo", texto: "Desça ao subsolo. Ainda há uma porta entre você e a verdade." },
      ],
    },
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
    id: "security-test",
    chamada: "A fábrica promete segurança. Desconfie. 14 fases de lógica e reflexo com um pequeno robô.",
    titulo: "SECURITY TEST",
    genero: ["Plataforma", "Puzzle"],
    tags: ["pixel art", "indústria", "armadilhas", "14 fases", "Xbox", "Mundo SENAI"],
    descricao: "Uma fábrica tentando impedir sua saída. Controle o robô, resolva puzzles industriais e sobreviva a 14 fases com prensas, sensores e armadilhas traiçoeiras. Dificuldade extrema com caminhos possíveis de vencer.",
    controles: "Teclado: A/D ou setas movem; Espaço/W/cima pula; Shift caminha; R reinicia; Esc abre o menu. Xbox: analógico/direcional move, A pula, LB caminha, X reinicia e Start abre o menu. Celular: setas, A e LB na tela; segure A para saltar mais alto. Use tela cheia para ampliar o jogo.",
    url: "jogos/security-test/index.html",
    versao: "1.0.0",
    capa: "assets/security-test/fabrica.png",
    vitrineIndustrial: {
      selo: "MUNDO SENAI · PLATAFORMA + PUZZLE",
      chamada: "A fábrica promete segurança. Desconfie.",
      resumo: "Um pequeno robô, 14 fases e uma fábrica cheia de más intenções. Leia o cenário, resolva o puzzle e descubra em qual placa você não deveria ter confiado.",
      personagem: "assets/security-test/robo.png",
      personagemAlt: "Robô amarelo de SECURITY TEST, com visor azul, em pixel art",
      personagemLegenda: "Pequeno no tamanho. Grande na vontade de sair daqui.",
      comentarios: [
        { titulo: "O perigo tem lógica", texto: "Botões, sensores e prensas escondem a pegadinha. Observe o que muda antes de dar o próximo passo." },
        { titulo: "Morreu? Aprendeu.", texto: "O reinício é rápido. Cada tentativa ajuda a encontrar o tempo certo e a saída da fase." },
        { titulo: "Extremo, mas possível", texto: "São 14 desafios com solução. Combine precisão nos saltos e raciocínio para vencer a fábrica." },
      ],
    },
    cor: "#edbd58",
    icone: "🤖",
    engine: "Godot 4.7.2 · Web",
    mobile: true,
    status: "disponivel",
    lancamento: "2026-10-22",
    destaque: false,
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
    chamada: "Uma bancada. Cem reais. Um império para construir, da garagem à automação total.",
    titulo: "Do Zero ao Império Industrial",
    genero: ["Simulação", "Estratégia"],
    tags: ["3D", "fábrica", "economia", "automação", "contratos", "6 evoluções", "conquistas", "prestígio"],
    descricao: "Com R$ 100, uma bancada e vontade de crescer, você começa uma fábrica de caixas de papelão. Produza, venda e reinvista: melhore ferramentas, forme sua equipe e conecte máquinas por esteiras. Escolha entre caixas simples, reforçadas e personalizadas, aceite contratos e transforme sua garagem em um império industrial. Desbloqueie 20 conquistas, ganhe XP e continue a carreira com desafios recorrentes.",
    controles: "WASD/setas movem; E interage e, segurado na bancada, fabrica; Q recolhe caixas; L abre a loja; Esc pausa. No celular, use os botões de toque. Controle Xbox/PlayStation e similares com mapeamento padrão: analógico/direcional move; A/× interage; X/□ recolhe; Y/△ abre a loja; View/Select abre produção; Start/Menu pausa. No menu, escolha Controles ou Salvar e sair do jogo. Produção e contratos permite escolher produtos e clientes. O progresso salva neste navegador; Reiniciar do zero começa uma nova partida após confirmação.",
    url: "jogos/imperio-industrial/index.html",
    versao: "2.3.2-missao8",
    capa: "assets/imperio-industrial/fase-1.png",
    vitrineImperio: {
      chamada: "Uma bancada. Cem reais. Um império para construir.",
      resumo: "Cada caixa vendida financia o próximo passo. Faça o trabalho com as próprias mãos, contrate quem vai crescer com você e transforme uma pequena oficina em uma indústria automatizada.",
      fases: [
        { titulo: "Garagem", imagem: "jogos/imperio-industrial/previa.html?fase=1", texto: "Tudo começa com R$ 100 e uma bancada. Compre papelão, monte suas primeiras caixas e faça a primeira venda." },
        { titulo: "Oficina equipada", imagem: "jogos/imperio-industrial/previa.html?fase=2", texto: "O resultado do seu trabalho vira investimento. Ferramentas e carrinho ajudam a produzir e transportar mais." },
        { titulo: "Pequena fábrica", imagem: "jogos/imperio-industrial/previa.html?fase=3", texto: "Você já não trabalha sozinho. Funcionários transportam materiais e montam caixas enquanto as primeiras máquinas entram em ação." },
        { titulo: "Fábrica automatizada", imagem: "jogos/imperio-industrial/previa.html?fase=4", texto: "As esteiras conectam a produção. O desafio passa a ser manter a linha abastecida e cumprir as entregas." },
        { titulo: "Complexo industrial", imagem: "jogos/imperio-industrial/previa.html?fase=5", texto: "A expansão abre espaço para quatro máquinas, seis funcionários e um estoque maior. Sua fábrica ganha outra escala." },
        { titulo: "Império industrial", imagem: "jogos/imperio-industrial/previa.html?fase=6", texto: "Fornecedor, produção e expedição automatizados: a pequena bancada virou uma indústria com central de controle. Continue produzindo e escolhendo contratos." },
      ],
    },
    cor: "#e8b65f",
    icone: "🏭",
    engine: "Three.js · WebGL 3D",
    mobile: true,
    status: "disponivel",
    lancamento: "2026-10-19",
    destaque: true,
  },
  {
    id: "lenda-da-brasa",
    chamada: "O Rei Umbra raptou a princesa. Só uma pequena brasa pode salvá-la: 5 capítulos, 3 castelos, 8 santuários e 13 chefes.",
    titulo: "Lenda da Brasa",
    genero: ["Ação", "Aventura", "RPG"],
    tags: ["pixel art", "aventura clássica", "masmorras", "quebra-cabeças", "completo"],
    descricao:
      "Aventura clássica de ação em pixel art. O Rei Umbra raptou a Princesa Lírian: atravesse os reinos da Brasa, das Marés e dos Ventos, " +
      "explore castelos com vários andares, mapa e bússola, conquiste os 3 cristais da Espada dos Reinos e enfrente os 8 santuários dos Pendentes Celestiais, " +
      "com arco, bombas, lanterna, bastão de gelo e martelo. No fim, invada a Fortaleza Sombria, vença o Rei Umbra e desça ao Coração do Abismo " +
      "para a batalha final contra a Sombra do Rei. Gaste suas brasas em lojas, ferreira, garrafas de poção e fada, " +
      "viagens de águia e altares. Jogo completo, com créditos.",
    controles: "Teclado: WASD/setas movem (8 direções), J/Espaço ataca e fala (segure no abismo para o golpe de luz), K/X usa o item, I abre os itens, Enter pausa, TAB abre o mapa do castelo, M liga/desliga o som, F tela cheia, H mostra os controles. Controle: A ataca, B/X usa o item, Y itens, Start pausa, Select mapa. Também funciona no celular. 3 espaços de salvamento neste navegador.",
    url: "jogos/lenda-da-brasa/index.html",
    proporcao: "256 / 208",
    versao: "2026-10-25-mapamundi",   // mude sempre que atualizar o jogo
    versaoJogo: "1.4",
    capa: "jogos/lenda-da-brasa/capa.png",
    cor: "#e0402a",
    icone: "🗡️",
    engine: "HTML5 · Canvas 2D",
    mobile: true,
    status: "disponivel",
    lancamento: "2026-10-25",
    destaque: true,
    destaqueTopo: true,   // ocupa o destaque do topo da página inicial
    vitrineLenda: true,   // card com herói, elenco e fotos dos lugares
    novidades: [
      { versao: "1.4", data: "2026-10-25", itens: [
        "Novo Mapa Mundi: aperte TAB ao ar livre (ou escolha no menu de pausa) para ver os 4 reinos com o nome de cada vila, castelo e santuário, e onde você está agora.",
      ] },
      { versao: "1.3", data: "2026-10-25", itens: [
        "A Flor Devoradora agora abre a boca e solta uma rajada de vento que suga tudo — jogue uma bomba perto dela para a rajada puxá-la para dentro.",
        "A tela de título mostra a versão do jogo e avisa quando há novidade.",
      ] },
      { versao: "1.2", data: "2026-10-25", itens: [
        "Lojas: Mercador Pipo e Ferreira Brígida, com garrafas, poções, escudo, túnica e botas.",
        "Pedras da Águia para viagem rápida, Altares de Oferenda e mercadores escondidos.",
        "Os créditos agora convidam a apoiar o criador.",
      ] },
      { versao: "1.1", data: "2026-10-25", itens: [
        "Tela cheia de verdade: o jogo ocupa o monitor inteiro.",
      ] },
      { versao: "1.0", data: "2026-10-25", itens: [
        "Jogo completo: Fortaleza Sombria, Rei Umbra, Coração do Abismo e a batalha final contra a Sombra do Rei.",
      ] },
    ],
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
    tags: ["pixel art", "aventura clássica", "elementos", "dois finais"],
    descricao:
      "Aventura clássica de ação em pixel art. Kael e a Faísca atravessam cinco capítulos " +
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
      "RPG tático em turnos, no estilo dos clássicos de estratégia. Monte seu exército, evolua classes " +
      "e atravesse reinos em uma saga sobre a Coroa e os Fragmentos da Aurora.",
    controles: "Mouse: clique nas unidades para mover, atacar e usar habilidades.",
    url: "jogos/crepusculo/index.html",
    capa: "jogos/crepusculo/capa.png", // vazio = capa automática
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
    capa: "jogos/reino-colonos/capa.png",
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
