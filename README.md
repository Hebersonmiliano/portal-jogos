# Portal Pixel (nome provisório)

Site de jogos estático: HTML, CSS e JavaScript puros, sem instalação e sem build.
Abra `index.html` com dois cliques para testar.

## Estrutura

```
index.html            vitrine (destaque, filtros, busca, favoritos, recentes)
jogo.html             página de cada jogo (?id=...)
jogos.js              CATÁLOGO: nome do site, gêneros e lista de jogos
assets/               estilo e scripts do site
jogos/<id>/           cópia de cada jogo (index.html na raiz da pasta)
atualizar-jogos.ps1   copia os jogos das pastas de desenvolvimento para jogos/
_headers              cabeçalhos COOP/COEP (Cloudflare Pages / Netlify) para Godot
```

## Adicionar um jogo

1. Coloque o jogo em `jogos/<id>/` (ou adicione a origem em `atualizar-jogos.ps1` e rode o script).
2. Adicione uma entrada em `jogos.js` copiando uma existente.
3. Opcional: uma imagem `capa.png` (16:9, por exemplo 640×360) e o caminho dela no campo `capa`.

Campos úteis: `status: "em-breve"` mostra o jogo na seção "Em breve", sem botão de jogar;
`destaque: true` permite que ele apareça no banner; o selo "Novo" aparece sozinho nos 30 dias após `lancamento`.

## Card de SECURITY TEST

O campo `vitrineIndustrial` no catálogo apresenta o robô original, uma chamada e três textos sobre o desafio. O card aparece na página inicial conforme a busca e o gênero selecionados, e na página do jogo antes de iniciar. O botão do card inicia o mesmo jogador existente. O cartão da grade também mostra o robô e um resumo. Os textos são de apresentação; não são avaliações de visitantes.

Os estilos ficam em `assets/security-test.css`; `assets/security-test/` contém o sprite do robô e o fundo industrial, copiados dos recursos originais do projeto Godot. Esses arquivos de apresentação ficam fora da pasta da exportação para serem preservados quando ela for atualizada.

## Do Zero ao Império Industrial 2

A sequência fica em `jogos/imperio-industrial-2/` (cópia de distribuição do repositório `Do-Zero-ao-Imp-rio-Industrial-2`: `index.html`, `style.css` e `js/`, com o Three.js local). A apresentação usa o campo `vitrineImperio2` no catálogo, `assets/imperio-industrial-2.js` e `.css`, e sete capturas reais do jogo em `assets/imperio-industrial-2/`. Aparece na página do jogo (completa, com cenas, recursos e botão de jogar) e na vitrine da página inicial (resumida). Para atualizar, copie os três itens do repositório do jogo, aumente `versao` no catálogo e acrescente a versão em `novidades`.

Verificação: `node tests/imperio-industrial-2.cjs`.

## Godot (FoxAventura)

`SECURITY TEST` está integrado em `jogos/security-test/`, com a exportação Web sem threads do Godot 4.7.2. O catálogo oferece teclado, Xbox e toque, e usa uma capa capturada do jogo. A origem de desenvolvimento, na estrutura local, é `../teste-de-seguranca/builds/web/`; o atualizador copia essa exportação e conserva a capa. Para atualizar, reexporte, copie os arquivos Web, aumente `versao` no catálogo e atualize a chave de cache de `jogos.js` nas páginas.

Exporte com o preset **Web** para `jogos/foxaventura/` e renomeie o HTML gerado para `index.html`.
Se exportar **sem threads** (Godot 4.3+), ele roda em qualquer hospedagem e no celular. Com threads,
o site precisa dos cabeçalhos do arquivo `_headers`.

## Publicar

### SETOR 404

O card de apresentação aparece na vitrine e na página do SETOR 404. Usa `assets/setor404.js`, `assets/setor404.css`, o campo `cardSetor404` no catálogo e imagens em `assets/setor-404/`: retrato articulado de Maya e três capturas do renderizador do jogo. Informa missão, setores, robôs, reparos, checkpoints e requisitos de teclado sem apresentar avaliações fictícias. O botão da página reutiliza o jogador existente e recolhe a apresentação ao iniciar. Na vitrine, o card acompanha os filtros e a busca. Não modifica o destaque principal nem as regras do jogo.

`SETOR 404` está disponível em `jogo.html?id=setor-404`, com a Fase 1 em `jogos/setor-404/` e capa em `assets/setor-404/capa.png`. É um jogo HTML5 para computador com teclado, sem instalação, compilação ou controles de toque. Os recursos são carregados por caminhos relativos para funcionar no subdiretório do GitHub Pages. Música e efeitos começam apenas após clicar em **INICIAR FASE 1**.

O repositório principal do jogo permanece privado. Esta pasta é a cópia de distribuição pública necessária para jogar no portal: ela não contém credenciais nem metadados Git. O jogo conserva a movimentação, a esquiva e a Fase 1 da versão aprovada. Para atualizar, substitua somente os arquivos dessa pasta, aumente `versao` no catálogo e atualize a chave de cache de `jogos.js` nas duas páginas do portal.

Verificação: `node --test tests/apresentacao.test.cjs`. Os testes incluem catálogo, busca, filtros, início do jogador, recursos locais e integridade da cópia distribuída.

Cloudflare Pages ou Netlify: crie um projeto, aponte para esta pasta (ou para um repositório GitHub)
e não configure comando de build. O domínio próprio (.com.br) pode ser ligado depois.

## Apresentação de jogos de investigação

O campo opcional `apresentacao` de um jogo em `jogos.js` ativa um destaque com elenco, cartão com retratos e uma página com personagens, ambientes e recursos. Jogos sem esse campo seguem a apresentação original.

A apresentação de A Última Transmissão usa os retratos e cenários já presentes no jogo. Os textos não revelam os códigos, as respostas dos enigmas ou a solução do caso. Os números de ambientes, pistas e enigmas correspondem ao capítulo 2.0.0.

- `selo`, `chamada`, `resumo` e `convite`: chamada e contexto do mistério.
- `card`: texto curto exibido no cartão do catálogo.
- `recursos`: números e rótulos dos recursos jogáveis.
- `personagens`: nome, papel, imagem e uma frase sem revelar a solução.
- `galeria`: imagens, títulos e textos dos ambientes.
- `beneficios`: informações práticas sobre a experiência.

Os estilos específicos ficam em `assets/investigacao.css`. A página só cria o iframe depois do clique em jogar; os retratos e a galeria usam carregamento tardio. O botão de início da apresentação abre o mesmo jogador da página, sem criar instâncias extras.

Verificação sem dependências: `node --test tests/apresentacao.test.cjs`. Os cinco testes usam um DOM mínimo e cobrem cartão, destaque, filtros, busca, elenco, galeria, início do iframe, jogos sem apresentação e integridade dos recursos. Eles não substituem a conferência visual em um navegador real.
