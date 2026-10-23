'use strict';
// Renderiza uma única imagem de demonstração. Não carrega, salva ou simula partidas.
const fasePrevia = Math.min(6, Math.max(1, Number(new URLSearchParams(location.search).get('fase')) || 1));
try {
  E = estadoInicial();
  if (fasePrevia >= 2) Object.assign(E.melhorias, { estilete: true, carrinho: true });
  if (fasePrevia >= 3) {
    E.funcionarios = 3; E.melhorias.bancada_pro = true;
    E.maquinas.push({ tipo: 'dobradeira', entrada: 12, saida: 3, progresso: .4 });
  }
  if (fasePrevia >= 4) { E.melhorias.esteira = true; E.maquinas.push({ tipo: 'dobradeira', entrada: 8, saida: 2, progresso: .7 }); }
  if (fasePrevia >= 5) {
    E.melhorias.expansao = true; E.funcionarios = 6;
    E.maquinas.push({ tipo: 'montadora', entrada: 14, saida: 3, progresso: .5 }, { tipo: 'montadora', entrada: 10, saida: 2, progresso: .3 });
  }
  if (fasePrevia >= 6) Object.assign(E.melhorias, { automacao_total: true, fornecedor_auto: true, transportadora: true });
  E.papelao = fasePrevia > 1 ? 40 : 10; E.estoque = fasePrevia > 1 ? 24 : 3;
  E.bancada.entrada = 6; E.bancada.saida = 3;
  criarCena(document.getElementById('palco')); criarJogador(); sincronizarEstrutura(); sincronizarFuncionarios();
  const posicoes = [[-3.9, -3.7], [-7, 4.9], [6.6, -6], [-3, 4.9], [2.4, 4.9], [11.7, -2]];
  funcionarios.forEach((f, i) => {
    f.x = posicoes[i][0]; f.z = posicoes[i][1]; f.estado = 'descansando'; f.alvo = { x: f.x, z: f.z };
  });
  atualizarJogador(0, 0); atualizarFuncionarios(0, 0); atualizarCena(0, 0);
  const imagem = renderer.domElement.toDataURL('image/png');
  if (parent !== window) parent.postMessage({ tipo: 'imperio:previa', fase: fasePrevia, imagem }, location.protocol === 'file:' ? '*' : location.origin);
} catch (_) {
  if (parent !== window) parent.postMessage({ tipo: 'imperio:previa', fase: fasePrevia, erro: true }, location.protocol === 'file:' ? '*' : location.origin);
  document.body.textContent = 'Não foi possível abrir a prévia 3D neste navegador.';
} finally {
  if (renderer) { renderer.dispose(); renderer.forceContextLoss(); }
}
