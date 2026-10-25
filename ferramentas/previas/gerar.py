#!/usr/bin/env python3
"""Gera as prévias de compartilhamento (WhatsApp, Instagram, Facebook, Telegram).

Para cada jogo do catálogo (jogos.js) cria:
  - previas/<id>.jpg        imagem 1200x630 com capa, título e frase do jogo
  - j/<id>/index.html       página curta com as tags Open Graph, que leva para jogo.html?id=<id>
E também previas/portal.jpg, a imagem da página inicial.

Uso:  python3 ferramentas/previas/gerar.py      (precisa de Node.js e Pillow)
"""
import hashlib, html, json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FONTES = os.path.join(os.path.dirname(__file__), 'fontes')
W, H = 1200, 630

def catalogo():
    js = ("const vm=require('vm'),fs=require('fs');const c={window:{}};vm.createContext(c);"
          "vm.runInContext(fs.readFileSync(process.argv[1],'utf8'),c);"
          "process.stdout.write(JSON.stringify({site:c.window.SITE,jogos:c.window.JOGOS}))")
    out = subprocess.run(['node', '-e', js, os.path.join(RAIZ, 'jogos.js')], capture_output=True, text=True, check=True).stdout
    return json.loads(out)

def fonte(nome, tam): return ImageFont.truetype(os.path.join(FONTES, nome), tam)
PIXEL = lambda t: fonte('press-start-2p-latin-400-normal.ttf', t)
FORTE = lambda t: fonte('nunito-latin-800-normal.ttf', t)
TEXTO = lambda t: fonte('nunito-latin-400-normal.ttf', t)

def hexrgb(h, a=255):
    h = (h or '#5566aa').lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (a,)

def quebra(d, texto, f, largura, max_linhas):
    linhas, atual = [], ''
    for p in texto.split():
        teste = (atual + ' ' + p).strip()
        if d.textlength(teste, font=f) <= largura: atual = teste
        else:
            if atual: linhas.append(atual)
            atual = p
    if atual: linhas.append(atual)
    if len(linhas) > max_linhas:
        linhas = linhas[:max_linhas]
        while d.textlength(linhas[-1] + '…', font=f) > largura and ' ' in linhas[-1]: linhas[-1] = linhas[-1].rsplit(' ', 1)[0]
        linhas[-1] += '…'
    return linhas

def capa_img(jogo):
    c = jogo.get('capa')
    if c and os.path.exists(os.path.join(RAIZ, c)): return Image.open(os.path.join(RAIZ, c)).convert('RGB')
    return None

def preencher(img, w, h):
    r = max(w / img.width, h / img.height)
    im = img.resize((max(1, round(img.width * r)), max(1, round(img.height * r))), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))

def fundo(cor, img):
    base = Image.new('RGBA', (W, H), hexrgb('#0f1020'))
    if img:
        f = preencher(img, W, H).filter(ImageFilter.GaussianBlur(22)).convert('RGBA')
        base.alpha_composite(f)
    grad = Image.new('RGBA', (W, H))
    g = ImageDraw.Draw(grad)
    c = hexrgb(cor)
    for x in range(W):
        t = x / W
        a = int(235 - 120 * t)
        g.line([(x, 0), (x, H)], fill=(int(10 + c[0] * .12 * t), int(10 + c[1] * .12 * t), int(26 + c[2] * .15 * t), a))
    base.alpha_composite(grad)
    return base

def marca(base, d, site):
    ic = Image.open(os.path.join(RAIZ, 'assets', 'marca', 'icone-32.png')).convert('RGBA').resize((48, 48), Image.NEAREST)
    base.alpha_composite(ic, (60, 50))
    d.text((122, 62), site.get('nome', 'Portal Pixel').upper(), font=PIXEL(20), fill=(255, 255, 255, 255))

def selo_jogar(d, x, y, texto='▶  JOGUE GRÁTIS NO NAVEGADOR'):
    f = FORTE(26); tw = d.textlength(texto.replace('▶', '').strip(), font=f) + 52
    d.rounded_rectangle([x, y + 5, x + tw, y + 63], 30, fill=(179, 134, 0, 255))
    d.rounded_rectangle([x, y, x + tw, y + 58], 30, fill=(255, 204, 51, 255))
    d.polygon([(x + 24, y + 18), (x + 24, y + 40), (x + 42, y + 29)], fill=(26, 20, 0, 255))
    d.text((x + 52, y + 13), texto.replace('▶', '').strip(), font=f, fill=(26, 20, 0, 255))

def imagem_jogo(jogo, site):
    img = capa_img(jogo)
    base = fundo(jogo.get('cor'), img); d = ImageDraw.Draw(base)
    marca(base, d, site)
    # capa nítida à direita
    if img:
        cw, ch = 520, 340
        c = preencher(img, cw, ch).convert('RGBA')
        m = Image.new('L', (cw, ch), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, cw - 1, ch - 1], 18, fill=255)
        sombra = Image.new('RGBA', (cw + 40, ch + 40), (0, 0, 0, 0)); ImageDraw.Draw(sombra).rounded_rectangle([20, 26, cw + 20, ch + 26], 22, fill=(0, 0, 0, 150))
        base.alpha_composite(sombra.filter(ImageFilter.GaussianBlur(12)), (W - cw - 80, 145))
        base.paste(c, (W - cw - 60, 145), m)
        ImageDraw.Draw(base).rounded_rectangle([W - cw - 60, 145, W - 61, 145 + ch - 1], 18, outline=(255, 255, 255, 60), width=2)
        larg = 520
    else:
        ic = Image.open(os.path.join(RAIZ, 'assets', 'marca', 'icone-32.png')).convert('RGBA').resize((288, 288), Image.NEAREST)
        base.alpha_composite(ic, (W - 400, 150))
        larg = 640
    d = ImageDraw.Draw(base)
    y = 150
    for l in quebra(d, jogo['titulo'], FORTE(60), larg, 2):
        d.text((60, y), l, font=FORTE(60), fill=(255, 255, 255, 255)); y += 70
    y += 12
    chamada = jogo.get('chamada') or jogo.get('descricao', '')
    for l in quebra(d, chamada, TEXTO(28), larg, 4 if y < 260 else 3):
        d.text((60, y), l, font=TEXTO(28), fill=(222, 220, 255, 255)); y += 38
    gen = ' · '.join(jogo.get('genero', []))
    d.text((60, H - 150), gen.upper(), font=FORTE(20), fill=(255, 204, 51, 255))
    selo_jogar(d, 60, H - 112, '▶  JOGUE GRÁTIS NO NAVEGADOR' if jogo.get('status') == 'disponivel' else '▶  EM BREVE NO PORTAL')
    return base.convert('RGB')

def imagem_portal(cat):
    site, jogos = cat['site'], [j for j in cat['jogos'] if j.get('status') == 'disponivel' and capa_img(j)]
    ids = site.get('carrossel') or []
    jogos.sort(key=lambda j: (ids.index(j['id']) if j['id'] in ids else 99))
    base = fundo('#5b4fd6', capa_img(jogos[0]) if jogos else None); d = ImageDraw.Draw(base)
    ic = Image.open(os.path.join(RAIZ, 'assets', 'marca', 'icone-32.png')).convert('RGBA').resize((96, 96), Image.NEAREST)
    base.alpha_composite(ic, (60, 70))
    d.text((180, 92), site.get('nome', 'Portal Pixel').upper(), font=PIXEL(38), fill=(255, 255, 255, 255))
    d.text((182, 146), site.get('slogan', ''), font=TEXTO(28), fill=(222, 220, 255, 255))
    # mosaico de capas
    x0, y0, cw, ch, gap = 60, 230, 255, 160, 18
    for i, j in enumerate(jogos[:8]):
        c = preencher(capa_img(j), cw, ch).convert('RGBA')
        m = Image.new('L', (cw, ch), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, cw - 1, ch - 1], 12, fill=255)
        x, y = x0 + (i % 4) * (cw + gap), y0 + (i // 4) * (ch + gap)
        base.paste(c, (x, y), m)
    d = ImageDraw.Draw(base)
    n = len([j for j in cat['jogos'] if j.get('status') == 'disponivel'])
    d.text((60, H - 52), f'{n} jogos grátis · sem instalação · computador e celular', font=FORTE(24), fill=(255, 204, 51, 255))
    return base.convert('RGB')

def salvar_png(img, caminho):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    img.save(caminho, 'JPEG', quality=86, optimize=True, progressive=True)
    return hashlib.md5(open(caminho, 'rb').read()).hexdigest()[:8]

def pagina(jogo, site, versao):
    e = lambda s: html.escape(s or '', quote=True)
    base = site['url'].rstrip('/') + '/'
    titulo = f"{jogo['titulo']} — {site.get('nome', 'Portal Pixel')}"
    desc = (jogo.get('chamada') or jogo.get('descricao', ''))[:200] + ' Jogue grátis no navegador.'
    destino = '../../jogo.html?id=' + jogo['id']
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(titulo)}</title>
  <meta name="description" content="{e(desc)}">
  <link rel="canonical" href="{e(base)}jogo.html?id={e(jogo['id'])}">
  <link rel="icon" type="image/svg+xml" href="../../assets/marca/icone.svg">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="{e(site.get('nome', 'Portal Pixel'))}">
  <meta property="og:title" content="{e(titulo)}">
  <meta property="og:description" content="{e(desc)}">
  <meta property="og:url" content="{e(base)}j/{e(jogo['id'])}/">
  <meta property="og:image" content="{e(base)}previas/{e(jogo['id'])}.jpg?v={versao}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{e(jogo['titulo'])}: imagem do jogo">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{e(titulo)}">
  <meta name="twitter:description" content="{e(desc)}">
  <meta name="twitter:image" content="{e(base)}previas/{e(jogo['id'])}.jpg?v={versao}">
  <meta http-equiv="refresh" content="0; url={e(destino)}">
  <script>location.replace({json.dumps(destino)} + location.hash);</script>
</head>
<body style="background:#0f1020;color:#ecebff;font:16px system-ui,sans-serif;padding:24px">
  <p>Abrindo <a style="color:#ffcc33" href="{e(destino)}">{e(jogo['titulo'])}</a>…</p>
</body>
</html>
'''

def main():
    cat = catalogo(); site = cat['site']
    if not site.get('url'): sys.exit('Defina SITE.url em jogos.js')
    versoes = {}
    for j in cat['jogos']:
        v = salvar_png(imagem_jogo(j, site), os.path.join(RAIZ, 'previas', j['id'] + '.jpg'))
        os.makedirs(os.path.join(RAIZ, 'j', j['id']), exist_ok=True)
        open(os.path.join(RAIZ, 'j', j['id'], 'index.html'), 'w', encoding='utf-8').write(pagina(j, site, v))
        versoes[j['id']] = v
    vp = salvar_png(imagem_portal(cat), os.path.join(RAIZ, 'previas', 'portal.jpg'))
    json.dump({'portal': vp, **versoes}, open(os.path.join(RAIZ, 'previas', 'versoes.json'), 'w'), indent=1)
    print('prévias geradas:', len(versoes), 'jogos + portal')

if __name__ == '__main__':
    main()
