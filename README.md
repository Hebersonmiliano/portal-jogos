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

## Godot (FoxAventura)

`SECURITY TEST` está integrado em `jogos/security-test/`, com a exportação Web sem threads do Godot 4.7.2. O catálogo oferece teclado, Xbox e toque, e usa uma capa capturada do jogo. A origem de desenvolvimento, na estrutura local, é `../teste-de-seguranca/builds/web/`; o atualizador copia essa exportação e conserva a capa. Para atualizar, reexporte, copie os arquivos Web, aumente `versao` no catálogo e atualize a chave de cache de `jogos.js` nas páginas.

Exporte com o preset **Web** para `jogos/foxaventura/` e renomeie o HTML gerado para `index.html`.
Se exportar **sem threads** (Godot 4.3+), ele roda em qualquer hospedagem e no celular. Com threads,
o site precisa dos cabeçalhos do arquivo `_headers`.

## Publicar

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
