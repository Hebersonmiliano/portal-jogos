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

Exporte com o preset **Web** para `jogos/foxaventura/` e renomeie o HTML gerado para `index.html`.
Se exportar **sem threads** (Godot 4.3+), ele roda em qualquer hospedagem e no celular. Com threads,
o site precisa dos cabeçalhos do arquivo `_headers`.

## Publicar

Cloudflare Pages ou Netlify: crie um projeto, aponte para esta pasta (ou para um repositório GitHub)
e não configure comando de build. O domínio próprio (.com.br) pode ser ligado depois.
