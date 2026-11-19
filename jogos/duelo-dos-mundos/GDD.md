# GDD — Portal Pixel: Duelo dos Mundos

**Versão do documento:** 1.0

**Versão do jogo:** 0.1.0

**Data:** 10 de novembro de 2026

**Autor e propriedade intelectual:** Heberson Miliano / Portal Pixel

## 1. Visão executiva

`Portal Pixel: Duelo dos Mundos` é um jogo de cartas estratégico para navegador que reúne personagens, criaturas, lugares e objetos dos jogos publicados no Portal Pixel. O produto funciona como jogo independente e como eixo de integração do catálogo: cada novo lançamento pode originar uma coleção temática.

O jogador escolhe um baralho, administra energia crescente, invoca até três personagens e usa técnicas, relíquias e cenários para reduzir de 20 para zero a vida do portal adversário. A experiência prioriza partidas curtas, leitura simples, visual expressivo e expansão por dados.

### Pilares

1. **Universo compartilhado:** todos os jogos do portal podem coexistir sem perder sua identidade.
2. **Fácil de aprender, interessante de dominar:** poucas regras fundamentais e combinações progressivas.
3. **Coleção viva:** lançamentos do Portal Pixel geram cartas e motivos para retornar.
4. **Nativo do navegador:** carregamento direto, suporte a toque, salvamento local e nenhuma instalação.
5. **Justo e acessível:** sem vantagens pagas; a coleção pode ser desbloqueada jogando.

## 2. Público e posicionamento

- Público principal: jogadores de 10 anos ou mais que gostam de estratégia, RPG, pixel art e colecionáveis.
- Público secundário: alunos e visitantes que já conhecem algum jogo do Portal Pixel.
- Sessão desejada: 5 a 8 minutos por duelo; 15 a 30 minutos por visita.
- Plataforma inicial: navegadores modernos em computador e celular.
- Modelo: gratuito, sem compra obrigatória; apoio ao Portal Pixel permanece voluntário.

## 3. Fantasia e narrativa

Uma instabilidade no Núcleo dos Portais fez mundos independentes ocuparem o mesmo espaço. O Castelo das Cinzas, o Setor 404 e futuros reinos disputam Fragmentos de Convergência. Duelistas utilizam Ecos — manifestações seguras dos habitantes e artefatos de cada mundo — para estabilizar os portais.

O jogador não captura personagens reais do cânone: invoca Ecos. Isso permite confrontos entre heróis sem quebrar as histórias originais. Cada expansão apresenta um pequeno capítulo sobre a chegada daquele mundo à Convergência.

## 4. Loop principal

1. Escolher um baralho ou editar uma lista.
2. Entrar em um duelo.
3. Comprar carta e recuperar energia.
4. Invocar personagem ou usar carta de ação.
5. Atacar unidades ou o portal rival.
6. Encerrar o turno e reagir à estratégia adversária.
7. Ganhar XP, progresso de missão e cartas cosméticas/colecionáveis.
8. Ajustar o baralho e jogar novamente.

## 5. Regras do duelo

### Estado inicial

- 20 pontos de vida por portal.
- Baralho construído: 24 cartas na versão inicial; meta futura de 30.
- Mão inicial: 4 cartas.
- Limite de mão: 8 cartas.
- Campo: 3 espaços de personagem por jogador.
- Energia inicial: 1; máximo aumenta em 1 por turno, até 10.
- Uma carta comprada no início de cada turno.
- O primeiro jogador não recebe vantagem adicional de compra.

### Fluxo do turno

1. Início: aumentar/restaurar energia, comprar uma carta e resolver efeitos de início.
2. Ação: jogar cartas, ativar habilidades e ordenar ataques em qualquer ordem permitida.
3. Encerramento: resolver efeitos finais e passar a prioridade.

Personagens recém-invocados não atacam no mesmo turno, salvo quando possuírem a palavra-chave `Investida`. Cada personagem ataca uma vez por turno. Se houver personagem adversário, o ataque é direcionado a ele; sem defensor, atinge o portal.

### Vitória e casos especiais

- Vitória principal: reduzir a vida do portal adversário a zero.
- Vitória alternativa futura: adversário tenta comprar sem cartas no baralho.
- Empate: efeitos simultâneos reduzem ambos os portais a zero.
- Desconexão não se aplica ao modo local; no multiplayer futuro haverá janela de reconexão.

## 6. Tipos de carta

| Tipo | Permanência | Função |
|---|---|---|
| Herói | Campo | Personagem central com habilidade marcante |
| Aliado/Criatura/Máquina | Campo | Pressão, defesa e sinergia |
| Técnica | Imediata | Dano, cura, compra ou manipulação |
| Equipamento/Relíquia | Futura: anexada | Modifica personagem ou regra |
| Cenário | Futura: zona própria | Efeito contínuo para todo o campo |

Toda carta possui `id`, nome, mundo, tipo, custo, raridade, imagem, texto e versão. Personagens acrescentam ataque e vida. A implementação 0.1 mantém Equipamentos, Relíquias e Cenários como efeitos imediatos; a zona permanente é uma evolução prevista.

### Raridades

- Comum: base funcional do baralho.
- Incomum: efeito condicional ou sinergia.
- Rara: estratégia definidora.
- Lendária: personagem ou momento central; limite futuro de uma cópia.

Raridade representa frequência e apresentação, não poder bruto.

## 7. Coleções iniciais

### Chamas do Castelo — Faísca

Identidade: agressão, dano direto, compra rápida e efeitos de entrada. Cores laranja, ouro e violeta. Personagens principais: Faísca, Véspera, Grilhão e guardiões do Castelo das Cinzas.

### Rebelião 404 — Setor 404

Identidade: resistência, cura, máquinas e eficiência energética. Cores ciano, azul industrial e amarelo de segurança. Personagens principais: Maya, R-04, sentinelas e tecnologias da fábrica.

### Padrão de uma nova expansão

Cada novo jogo pode lançar 8 a 15 cartas:

- 1 herói principal;
- 4 a 6 personagens, criaturas ou máquinas;
- 2 a 4 técnicas;
- 1 relíquia/equipamento;
- 1 cenário;
- 1 carta lendária opcional.

A expansão precisa comunicar a mecânica do jogo original. Um jogo de investigação pode revelar e manipular cartas; um simulador industrial pode construir motores de valor; um roguelite pode trocar vida por recompensas.

## 8. Conteúdo da versão 0.1

- 24 cartas, divididas igualmente entre dois mundos.
- Dois baralhos pré-montados de 24 cartas usando duas cópias de cada carta.
- Duelo local contra IA.
- Galeria com filtros e visualização ampliada.
- Tutorial textual.
- Estatística local de vitórias.
- Layout responsivo e imagens oficiais do portal.

## 9. Progressão e metajogo

### Curto prazo

- XP por duelo concluído, com bônus pela primeira vitória diária.
- Missões: jogar três técnicas, vencer com determinado mundo, causar dano com um herói.
- Nível de duelista libera molduras, versos e emotes, nunca atributos.

### Coleção cruzada

Concluir um jogo do Portal Pixel pode conceder uma carta temática ou variante visual. O desbloqueio cruzado deve ser opcional: todas as cartas essenciais também podem ser conquistadas dentro do card game.

### Construtor de baralho futuro

- 30 cartas.
- Máximo de duas cópias; uma para lendárias.
- Pelo menos 12 personagens.
- Validação automática e curva de energia visível.
- Códigos de importação/exportação, sem dados pessoais.

## 10. IA

### Versão 0.1

A IA escolhe a carta de maior custo que pode jogar, prioriza preencher o campo e ataca o primeiro defensor disponível. É determinística o bastante para ensinar as regras e barata para executar no cliente.

### Evolução

- Fácil: decisões aleatórias entre jogadas válidas.
- Normal: pontuação por valor de campo, curva e dano letal.
- Difícil: simulação de um turno, preservação de recursos e leitura de ameaça.
- Chefes: baralhos e regras próprias, sem precisar trapacear na compra.

## 11. Interface e direção de arte

Direção: fantasia tecnológica em pixel art, com superfícies escuras, energia violeta, destaques dourados e cores próprias de cada mundo. As cartas usam moldura arredondada, arte dominante, custo circular, texto curto e estatísticas em extremos opostos.

Princípios:

- estados não dependem apenas de cor;
- alvos clicáveis têm pelo menos 44 px;
- texto essencial mantém contraste AA;
- animações respeitarão `prefers-reduced-motion` em versão posterior;
- cartas incluem texto alternativo derivado do nome;
- interface funciona em orientação vertical, embora paisagem seja recomendada durante o duelo.

## 12. Áudio

- Tema de menu que mistura chiptune e sintetizadores.
- Tema por baralho com instrumentação herdada do jogo de origem.
- Sinais curtos para compra, invocação, ataque, dano, cura e vitória.
- Controle global de som persistente.
- Nenhum áudio inicia antes da primeira interação do jogador.

## 13. Arquitetura técnica

- HTML, CSS e JavaScript sem dependências de runtime.
- Dados de cartas isolados em estrutura serializável; migração prevista para `cards.json` quando houver servidor local de desenvolvimento padronizado.
- Estado de partida em memória.
- `localStorage` para preferências, vitórias e, futuramente, coleção e baralhos.
- Imagens reutilizam arquivos oficiais do próprio repositório.
- Publicação pelo mesmo GitHub Pages do Portal Pixel.

### Modelo de dados recomendado

```json
{
  "id": "faisca-guardiao-lenco",
  "set": "faisca",
  "name": "Faísca, Guardião do Lenço",
  "type": "hero",
  "cost": 4,
  "attack": 5,
  "health": 4,
  "rarity": "legendary",
  "image": "assets/faisca-2/capa.jpg",
  "effect": { "trigger": "onPlay", "action": "damageEnemyPortal", "value": 1 }
}
```

Efeitos futuros devem usar ações declarativas registradas e validadas, evitando executar código vindo dos arquivos de dados.

## 14. Analytics e privacidade

Métricas agregadas desejadas: início/fim de duelo, baralho escolhido, duração, abandono, taxa de vitória e cartas jogadas. Não coletar nome, e-mail, texto livre nem identificadores persistentes sem necessidade. Respeitar a política do portal de contagem anônima sem cookies.

## 15. Balanceamento

### Referências iniciais

- Valor básico de personagem: ataque + vida próximo de `2 × custo`, com ajustes por habilidade.
- Dano direto: aproximadamente 1 ponto por energia, com desconto situacional.
- Cura pode ser 25% a 40% mais eficiente que dano por não remover ameaça.
- Compra de carta custa aproximadamente 1,5 energia por carta além da primeira.

### Processo

1. Registrar taxa de vitória por baralho e carta.
2. Investigar resultados fora de 45%–55% em amostra suficiente.
3. Alterar uma variável por vez.
4. Versionar ajustes e explicar mudanças em linguagem simples.
5. Nunca enfraquecer uma carta apenas por popularidade sem evidência de poder.

## 16. Roadmap

### 0.1 — Protótipo público

Duelo contra IA, 24 cartas, duas coleções, galeria, tutorial e salvamento de vitórias.

### 0.2 — Polimento de combate

Seleção de alvos, animações, efeitos sonoros, palavras-chave, cenários permanentes, tutorial interativo e IA em três níveis.

### 0.3 — Progressão

Perfil local, missões, XP, desbloqueios, construtor de baralho e importação/exportação.

### 0.4 — Campanha da Convergência

Mapa de capítulos, chefes e narrativa conectando Faísca e Setor 404.

### 0.5 — Expansões

Coleções de Profundezas, Café com Patas, Império Industrial e A Última Transmissão.

### 1.0 — Lançamento

Balanceamento consolidado, acessibilidade completa, boa performance em aparelhos básicos, campanha e eventos rotativos locais.

### Pós-1.0

Multiplayer assíncrono ou em tempo real somente após definição de backend, moderação, contas, segurança e custos operacionais.

## 17. Critérios de qualidade

- Partida completa sem erros no console.
- Todos os efeitos possuem resultado visível e texto compatível.
- Nenhum baralho vence mais de 55% em teste equilibrado relevante.
- Interface utilizável a partir de 360 px de largura.
- Imagens têm fallback visual e não impedem a partida.
- Salvamento corrompido é ignorado com segurança.
- Novas cartas podem ser adicionadas sem alterar o fluxo central do turno.

## 18. Riscos e respostas

| Risco | Resposta |
|---|---|
| Complexidade cresce com expansões | Vocabulário limitado de efeitos e testes automatizados |
| Imagens pesadas | Miniaturas WebP futuras, carregamento preguiçoso e cache |
| Regras difíceis no celular | Texto curto, tutorial contextual e alvos grandes |
| Cópia excessiva de card games conhecidos | Terminologia, energia, zonas e identidade próprias |
| Desbalanceamento entre mundos | Telemetria agregada, testes e patches versionados |
| Conteúdo cruzado confuso | Cada carta exibe mundo, tipo e linguagem visual consistente |

## 19. Definição de pronto para uma expansão

- Conceito e mecânica do mundo definidos.
- Lista de cartas revisada quanto a clareza e curva.
- Artes autorizadas e otimizadas.
- Texto alternativo e créditos conferidos.
- Baralho testado contra todas as coleções existentes.
- GDD, changelog e versão atualizados.
- Testes de celular, teclado, toque e carregamento concluídos.

## 20. Créditos planejados

- Criação e direção: Heberson Miliano.
- Universo e jogos originais: Portal Pixel e autores creditados em cada projeto.
- Desenvolvimento e arte adicional: registrar por expansão.
- Imagens da versão 0.1: materiais existentes de Faísca, Faísca 2, Setor 404 e Security Test no repositório do Portal Pixel.

---

Este documento é vivo. Mudanças de regras, conteúdo e produção devem atualizar a versão do GDD e o changelog do jogo.

