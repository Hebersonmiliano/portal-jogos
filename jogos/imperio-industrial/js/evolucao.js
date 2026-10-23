'use strict';

// A evolução usa as compras existentes. Nenhuma mudança de posição invalida saves.
const FASES_FABRICA = [
  { nome: 'Garagem', detalhe: 'Uma bancada. Uma grande ideia.', cor: '#b88049' },
  { nome: 'Oficina equipada', detalhe: 'Ferramentas melhores, novas possibilidades.', cor: '#e3ad54' },
  { nome: 'Pequena fábrica', detalhe: 'Sua primeira equipe entra em ação.', cor: '#66b7ce' },
  { nome: 'Fábrica automatizada', detalhe: 'As esteiras conectam a produção.', cor: '#68c3ac' },
  { nome: 'Complexo industrial', detalhe: 'Mais espaço para crescer.', cor: '#83b7ef' },
  { nome: 'Império industrial', detalhe: 'Do trabalho manual à automação total.', cor: '#f3cb65' },
];

function faseFabrica() { return tem('automacao_total') ? 5 : nivel() - 1; }

function proximaEvolucao() {
  const fase = faseFabrica();
  if (fase === 0) return { nome: 'Estilete profissional', preco: MELHORIAS.estilete.preco, dica: 'Equipe sua oficina' };
  if (fase === 1) return { nome: 'Primeiro funcionário', preco: PRECO_FUNCIONARIO, dica: 'Forme sua equipe' };
  if (fase === 2 && !E.maquinas.length) return { nome: 'Dobradeira', preco: MAQUINAS.dobradeira.preco, dica: 'Prepare a automação' };
  if (fase === 2) return { nome: 'Esteira transportadora', preco: MELHORIAS.esteira.preco, dica: 'Conecte a produção' };
  if (fase === 3) return { nome: 'Expansão do galpão', preco: MELHORIAS.expansao.preco, dica: 'Amplie sua fábrica' };
  if (fase === 4) {
    for (const id of ['fornecedor_auto', 'transportadora']) {
      if (!tem(id)) return { nome: MELHORIAS[id].nome, preco: MELHORIAS[id].preco, dica: 'Prepare seu império' };
    }
    if (!E.maquinas.some(m => m.tipo === 'montadora')) {
      if (E.maquinas.length >= vagas()) return { nome: 'Modernizar dobradeira → montadora', preco: MAQUINAS.montadora.preco - MAQUINAS.dobradeira.preco, dica: 'Reutilize uma vaga ocupada' };
      return { nome: MAQUINAS.montadora.nome, preco: MAQUINAS.montadora.preco, dica: 'Modernize a produção' };
    }
    return { nome: MELHORIAS.automacao_total.nome, preco: MELHORIAS.automacao_total.preco, dica: 'Última evolução' };
  }
  return null;
}

let ultimaFaseHud = -1;
function atualizarEvolucaoHud() {
  const fase = faseFabrica(), proxima = proximaEvolucao();
  if (ultimaFaseHud !== fase) {
    ultimaFaseHud = fase;
    $('fase-nome').textContent = FASES_FABRICA[fase].nome;
    $('fase-numero').textContent = `0${fase + 1} / 06`;
    $('fase-etapas').innerHTML = FASES_FABRICA.map((f, i) =>
      `<span title="${f.nome}" aria-label="${f.nome}${i <= fase ? ': alcançada' : ': futura'}" class="${i <= fase ? 'atingida' : ''}"></span>`).join('');
  }
  $('fase-proxima').textContent = proxima
    ? `${proxima.dica}: ${proxima.nome} · ${reais(proxima.preco)}`
    : 'Evolução máxima alcançada. Continue expandindo sua produção!';
  $('fase-progresso').value = proxima ? Math.min(1, Math.max(0, E.dinheiro / proxima.preco)) : 1;
}

function grupoAmbiente() { const g = new THREE.Group(); cena.add(g); return g; }

function placa3D(texto, x, y, z, largura, pai, fundo = '#17384b', tinta = '#ffdc8e') {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 96;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = fundo; ctx.fillRect(0, 0, 512, 96);
  ctx.strokeStyle = tinta; ctx.lineWidth = 5; ctx.strokeRect(5, 5, 502, 86);
  ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = tinta; ctx.fillText(texto, 256, 48, 480);
  const textura = new THREE.CanvasTexture(canvas);
  textura.encoding = THREE.sRGBEncoding;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(largura, largura * 96 / 512), new THREE.MeshBasicMaterial({ map: textura }));
  mesh.position.set(x, y, z); pai.add(mesh);
  if (V.ambiente) V.ambiente.placas.push({ mesh, fase: V.ambiente.grupos.indexOf(pai) });
  return mesh;
}

function construirAmbienteEvolutivo() {
  V.ambiente = { fase: -1, grupos: [], placas: [], tempo: 0 };
  const a = V.ambiente;
  // Um terreno contínuo mantém as rotas e colisões dos saves anteriores.
  bloco(40, 0.25, 27, '#3e6659', 2, -0.45, 0);
  bloco(28.8, 0.24, 18.8, '#77796f', 0, -0.24, 0);
  const pisoMaterial = new THREE.MeshStandardMaterial({ color: '#a9957a', roughness: .95 });
  a.piso = bloco(28.4, 0.04, 18.4, pisoMaterial, 0, -0.04, 0);
  // Juntas do concreto e passagem amarela, sempre no plano do piso.
  for (let x = -12; x <= 12; x += 4) bloco(.025, .008, 18, '#887d6b', x, .005, 0);
  for (let z = -6; z <= 6; z += 4) bloco(28, .008, .025, '#887d6b', 0, .005, z);
  for (let x = -12; x <= 10; x += 1.8) bloco(1.1, .015, .1, '#edc66b', x, .012, .6);
  // Paredes com tijolos no início; revestimento industrial nas fases avançadas.
  a.paredeMaterial = new THREE.MeshStandardMaterial({ color: '#b39b7d', roughness: .9 });
  bloco(28.8, 4.8, .35, a.paredeMaterial, 0, 0, -9.5);
  bloco(.35, 4.8, 18.8, a.paredeMaterial, -14.5, 0, 0);
  bloco(28.8, .18, .3, '#6c6255', 0, 0, 9.4);
  const tijolos = grupoAmbiente(); a.tijolos = tijolos;
  for (let y = .4; y < 4.7; y += .55) {
    bloco(28.5, .025, .02, '#91816b', 0, y, -9.31, tijolos);
    for (let x = -13.6 + (Math.round(y / .55) % 2) * .8; x < 14; x += 1.6)
      bloco(.025, .53, .02, '#91816b', x, y, -9.3, tijolos);
  }
  for (const x of [-13.7, -8.8, -1.8, 4.8, 13.7]) {
    bloco(.22, 4.9, .28, '#465867', x, 0, -9.22);
    bloco(1.25, .12, .3, '#f8d899', x, 4.4, -9.1);
  }
  for (const x of [-10, -4, 3, 10]) {
    bloco(3.8, 1.25, .08, '#344e5b', x, 2.8, -9.26);
    bloco(3.5, 1, .04, luzMaterial('#b3d8db'), x, 2.92, -9.18);
    bloco(.09, 1.15, .06, '#344e5b', x, 2.85, -9.12);
    bloco(3.6, .07, .08, '#344e5b', x, 3.38, -9.1);
  }
  // Decoração fora da área jogável: não cria obstáculos nas rotas.
  bloco(6.6, .12, 40, '#414e55', 17.7, -.15, -2);
  for (let z = -20; z < 18; z += 2.4) bloco(.13, .015, 1.1, '#d6d6c0', 19.7, 0, z);
  for (const x of [-16, -10, -3, 5, 13]) {
    bloco(.25, 1.3, .25, '#765d42', x, -.1, -11.4);
    bloco(1.7, 1.8, 1.7, '#52765d', x, 1, -11.4);
    bloco(1.3, .9, 1.3, '#648968', x + .2, 2.3, -11.3);
  }
  // Fase 1: madeira e ferramentas do trabalho manual.
  const garagem = grupoAmbiente(); a.grupos.push(garagem);
  for (const x of [-13.2, -12.5, -11.8]) bloco(.12, 1.2, .14, '#79583b', x, .2, -8.85, garagem);
  bloco(2.6, 1.8, .12, '#986f43', -5.2, 1.6, -9.16, garagem);
  for (let i = 0; i < 7; i++) {
    bloco(.05, .05, .06, '#dbb57e', -6.2 + i * .34, 1.85, -9.05, garagem);
    bloco(.06, .5 + i % 2 * .15, .08, '#434f54', -6.2 + i * .34, 2, -9.02, garagem);
  }
  for (const z of [-8, -4, 0, 4, 8]) bloco(.26, 5, .26, '#73583e', -14.2, 0, z, garagem);
  for (const x of [-11, 0, 11]) bloco(5, .17, .8, '#78634c', x, 4.8, -9, garagem);
  // Fase 2: bancada equipada e armários.
  const oficina = grupoAmbiente(); a.grupos.push(oficina);
  bloco(4.5, .28, .2, '#ebad4e', -5, 1, -6, oficina);
  for (let i = 0; i < 3; i++) {
    bloco(.7, .8, .5, '#2d6d83', -6.4 + i * 1.2, .05, -5.55, oficina);
    bloco(.4, .06, .03, '#d7c8a0', -6.4 + i * 1.2, .6, -5.27, oficina);
  }
  placa3D('OFICINA • PRODUZIR PARA CRESCER', -4.7, 4.1, -9.02, 6, oficina);
  // Fase 3: estrutura de aço e prateleiras.
  const fabrica = grupoAmbiente(); a.grupos.push(fabrica);
  for (const z of [-8, 1, 8]) {
    bloco(.25, 4.7, .25, '#355f76', -14.2, 0, z, fabrica);
    bloco(1.4, .2, .25, '#355f76', -13.6, 4.5, z, fabrica);
  }
  for (const x of [5.5, 10.5]) {
    bloco(.13, 3.4, 1.4, '#e4a141', x, 0, -7.8, fabrica);
    bloco(.28, 1, .2, '#f0c966', x, 0, -6.98, fabrica);
  }
  placa3D('EQUIPE • PRODUÇÃO • QUALIDADE', 3, 4.3, -9.02, 5, fabrica, '#23576b', '#d5f0ed');
  // Fase 4: proteção e sinalização da linha automatizada.
  const automacao = grupoAmbiente(); a.grupos.push(automacao);
  for (const z of [-7.5, 0, 7.8]) {
    bloco(.2, 1, .2, '#eda93a', -13.7, 0, z, automacao);
    bloco(.13, .13, 2.1, '#eda93a', -13.7, .8, z, automacao);
  }
  for (let x = -8; x <= 8; x += 2) {
    bloco(1.1, .03, .11, '#f4d25f', x, .02, 7, automacao);
    bloco(.12, .48, .12, '#455a63', x, 0, 6.35, automacao);
  }
  placa3D('LINHA AUTOMATIZADA', -4, 4.1, -9.0, 6, automacao, '#173e46', '#86e0b7');
  // Fase 5: estrutura ampliada e empilhadeira na doca.
  const complexo = grupoAmbiente(); a.grupos.push(complexo);
  for (const x of [-14, 0, 14]) {
    bloco(.3, 5.1, .3, '#22495f', x, 0, -9.05, complexo);
  }
  bloco(28, .22, .35, '#22495f', 0, 5, -9, complexo);
  for (const z of [-8.6, 8.8]) bloco(13.5, .025, .12, '#efb744', 6.5, .02, z, complexo);
  a.empilhadeira = construirEmpilhadeira(complexo);
  placa3D('COMPLEXO INDUSTRIAL', 7, 4.1, -9.0, 7, complexo);
  // Fase 6: central de controle sem bloquear as estações.
  const imperio = grupoAmbiente(); a.grupos.push(imperio);
  bloco(3.4, .9, .7, '#16364b', -.2, 0, -8.3, imperio);
  for (const x of [-1.25, -.2, .85]) {
    bloco(.85, .65, .08, '#1a2e3a', x, 1, -8.5, imperio);
    bloco(.7, .46, .025, luzMaterial('#62d8d6'), x, 1.09, -8.44, imperio);
    for (let j = 0; j < 3; j++) bloco(.4 + j * .05, .025, .02, '#1c677d', x, 1.2 + j * .1, -8.41, imperio);
  }
  placa3D('IMPÉRIO INDUSTRIAL', 0, 4.5, -9.0, 8, imperio);
  a.farol = bloco(.18, .25, .18, luzMaterial('#84ecb2'), 13.7, 5.2, -9, imperio);
  a.placaFase = rotulo(-4, 5.5, -9.2, { classe: 'identidade-fabrica', texto: () => 'GARAGEM', visivel: () => faseFabrica() === 0 });
}

function construirEmpilhadeira(pai) {
  const g = new THREE.Group(); g.position.set(15.8, 0, 6.2); g.rotation.y = -.25; pai.add(g);
  bloco(1.4, .7, 2, '#e3a139', 0, .3, 0, g);
  bloco(1.2, .5, .6, '#e3a139', 0, 1, .65, g);
  bloco(.65, .5, .6, '#263843', 0, .9, -.05, g);
  for (const x of [-.6, .6]) {
    bloco(.1, 1.5, .1, '#243e4b', x, 1, .45, g);
    bloco(.1, 2.4, .1, '#334b56', x, 0, -1, g);
    bloco(.14, .1, 1.15, '#334b56', x, .22, -1.5, g);
    for (const z of [-.6, .65]) bloco(.22, .5, .5, '#253039', x * 1.2, .05, z, g);
  }
  bloco(1.5, .12, 1.3, '#263d49', 0, 2.4, .2, g);
  caixa(0, .32, -1.6, g);
  return g;
}

function sincronizarAmbiente() {
  const a = V.ambiente;
  if (!a) return;
  const fase = faseFabrica(), mudou = a.fase !== -1 && fase > a.fase;
  a.grupos.forEach((g, i) => { g.visible = i === 0 ? fase < 2 : fase >= i; });
  // Cada etapa tem sua própria placa, sem sobrepor os nomes anteriores.
  a.placas.forEach(p => { p.mesh.visible = p.fase === fase; });
  a.piso.material.color.set(fase < 2 ? '#ad9776' : fase < 4 ? '#a1ada9' : '#b8c6c5').convertSRGBToLinear();
  a.paredeMaterial.color.set(fase < 2 ? '#b69b78' : '#aec0c0').convertSRGBToLinear();
  a.tijolos.visible = fase < 3;
  a.fase = fase;
  if (mudou) mensagem(`Sua fábrica evoluiu: ${FASES_FABRICA[fase].nome}! ${FASES_FABRICA[fase].detalhe}`, 'bom');
}

function atualizarAmbiente(t, dt) {
  const a = V.ambiente;
  if (!a) return;
  // Uma animação de baixa complexidade, sem novos cálculos de física.
  a.tempo += dt;
  if (a.empilhadeira && a.fase >= 4) {
    a.empilhadeira.position.z = 6.2 + Math.sin(a.tempo * .35) * .7;
  }
  if (a.farol && a.fase === 5) a.farol.material.emissiveIntensity = .65 + Math.sin(a.tempo * 2) * .25;
}
