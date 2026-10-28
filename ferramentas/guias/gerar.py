#!/usr/bin/env python3
"""Gera a página do guia de um jogo a partir do GUIA.md do repositório do jogo.

Uso:  python3 ferramentas/guias/gerar.py <caminho/do/GUIA.md> <id-do-jogo>
Saída: guias/<id>.html  (imagens "imagens/x.jpg" do Markdown viram "assets/<id>/x.jpg")
Precisa do pacote Python "markdown".
"""
import html, re, sys
from pathlib import Path
import markdown
from markdown.extensions.toc import TocExtension, slugify_unicode

RAIZ = Path(__file__).resolve().parents[2]

def main():
    origem, ident = Path(sys.argv[1]), sys.argv[2]
    texto = origem.read_text(encoding='utf-8')
    titulo = texto.splitlines()[0].lstrip('# ').strip()
    # O sumário do Markdown é substituído pelo índice lateral da página.
    texto = re.sub(r'## Sumário\n.*?\n---\n', '', texto, flags=re.S)
    texto = re.sub(r'\]\(imagens/', f'](../assets/{ident}/', texto)
    md = markdown.Markdown(extensions=['tables', TocExtension(slugify=slugify_unicode, toc_depth='2')])
    corpo = md.convert(texto)
    corpo = corpo.replace('<img ', '<img loading="lazy" decoding="async" ')
    corpo = re.sub(r'<h1[^>]*>.*?</h1>', '', corpo, count=1, flags=re.S)
    indice = ''.join(f'<li><a href="#{t["id"]}">{t["name"]}</a></li>' for t in md.toc_tokens[0]['children']) if md.toc_tokens else ''
    pagina = f'''<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(titulo)} · Portal Pixel</title>
  <meta name="description" content="Guia completo: controles, contratos, automação, qualidade, energia e estratégias.">
  <link rel="icon" type="image/svg+xml" href="../assets/marca/icone.svg">
  <meta name="theme-color" content="#0f1020">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Nunito:wght@400;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/estilo.css?v=20261025-atualizado">
  <link rel="stylesheet" href="../assets/guia.css?v=20261027">
</head>
<body class="guia-{ident}">
  <header class="topo">
    <a class="marca" href="../index.html"><img class="marca-icone" src="../assets/marca/icone.svg" alt="" width="34" height="34"><span class="marca-nome">Portal Pixel</span></a>
    <a class="voltar" href="../jogo.html?id={ident}">← Voltar ao jogo</a>
  </header>
  <main class="guia">
    <div class="guia-cabecalho">
      <span class="guia-selo">GUIA COMPLETO</span>
      <h1>{html.escape(titulo)}</h1>
      <a class="botao guia-jogar" href="../jogo.html?id={ident}">▶ Jogar agora</a>
    </div>
    <div class="guia-grade">
      <nav class="guia-indice" aria-label="Índice do guia"><strong>Índice</strong><ol>{indice}</ol></nav>
      <article class="guia-texto">{corpo}</article>
    </div>
  </main>
</body>
</html>
'''
    destino = RAIZ / 'guias' / f'{ident}.html'
    destino.write_text(pagina, encoding='utf-8')
    print(f'guia gerado: {destino.relative_to(RAIZ)}')

if __name__ == '__main__':
    main()
