'use strict';

const CHAVE_CONQUISTAS = 'imperio-industrial-carreira-v1';
function novaCarreira() {
  return { versao: 1, xp: 0, desbloqueadas: {}, totais: { produzidas: 0, vendidas: 0, faturamento: 0, contratos: 0 }, tipos: {}, desafios: {} };
}
let carreiraPersistida = true;
let carreira = novaCarreira(), carreiraPronta = false, filtroConquistas = 'todas';
let timerConquistas = 0, timerToastConquista = 0;
const filaConquistas = [];

const CONQUISTAS = [
  { id: 'primeira', nome: 'A primeira de muitas', desc: 'Produza sua primeira caixa.', meta: 1, valor: () => carreira.totais.produzidas, xp: 30, icone: '📦' },
  { id: 'producao100', nome: 'Mãos à obra', desc: 'Produza 100 caixas na carreira.', meta: 100, valor: () => carreira.totais.produzidas, xp: 80, icone: '⚒' },
  { id: 'producao1000', nome: 'Ritmo industrial', desc: 'Produza 1.000 caixas na carreira.', meta: 1000, valor: () => carreira.totais.produzidas, xp: 180, icone: '⚙' },
  { id: 'producao10000', nome: 'A fábrica nunca para', desc: 'Produza 10.000 caixas na carreira.', meta: 10000, valor: () => carreira.totais.produzidas, xp: 400, icone: '🏭' },
  { id: 'venda10', nome: 'Primeiros clientes', desc: 'Venda 10 caixas.', meta: 10, valor: () => carreira.totais.vendidas, xp: 40, icone: '🤝' },
  { id: 'venda500', nome: 'Saiu para entrega', desc: 'Venda 500 caixas na carreira.', meta: 500, valor: () => carreira.totais.vendidas, xp: 140, icone: '🚚' },
  { id: 'receita1000', nome: 'Negócio de verdade', desc: 'Fature R$ 1.000 na carreira.', meta: 1000, valor: () => carreira.totais.faturamento, xp: 80, icone: '💵' },
  { id: 'receita100000', nome: 'Seis dígitos', desc: 'Fature R$ 100.000 na carreira.', meta: 100000, valor: () => carreira.totais.faturamento, xp: 500, icone: '💎' },
  { id: 'ferramenta', nome: 'Ferramenta certa', desc: 'Compre o estilete profissional.', meta: 1, valor: () => +tem('estilete'), xp: 40, icone: '🛠' },
  { id: 'maquina', nome: 'Força das máquinas', desc: 'Instale sua primeira máquina.', meta: 1, valor: () => E.maquinas.length, xp: 60, icone: '⚙' },
  { id: 'equipe', nome: 'Juntos vamos além', desc: 'Contrate seu primeiro funcionário.', meta: 1, valor: () => E.funcionarios, xp: 60, icone: '👷' },
  { id: 'equipe6', nome: 'Time completo', desc: 'Tenha seis funcionários na mesma fábrica.', meta: 6, valor: () => E.funcionarios, xp: 160, icone: '👥' },
  { id: 'esteira', nome: 'Tudo conectado', desc: 'Instale a esteira transportadora.', meta: 1, valor: () => +tem('esteira'), xp: 100, icone: '🔗' },
  { id: 'expansao', nome: 'Novos horizontes', desc: 'Expanda o galpão.', meta: 1, valor: () => +tem('expansao'), xp: 150, icone: '🏗' },
  { id: 'imperio', nome: 'Do zero ao império', desc: 'Compre a automação total.', meta: 1, valor: () => +tem('automacao_total'), xp: 300, icone: '👑' },
  { id: 'contrato1', nome: 'Palavra cumprida', desc: 'Entregue seu primeiro contrato.', meta: 1, valor: () => carreira.totais.contratos, xp: 60, icone: '📋' },
  { id: 'contrato10', nome: 'Fornecedor de confiança', desc: 'Entregue 10 contratos na carreira.', meta: 10, valor: () => carreira.totais.contratos, xp: 140, icone: '⭐' },
  { id: 'contrato50', nome: 'Parceria de ouro', desc: 'Entregue 50 contratos na carreira.', meta: 50, valor: () => carreira.totais.contratos, xp: 350, icone: '🏅' },
  { id: 'variedade', nome: 'Catálogo completo', desc: 'Fabrique ao menos uma caixa de cada um dos três produtos.', meta: 3, valor: () => Object.keys(carreira.tipos).filter(id => PRODUTOS[id]).length, xp: 180, icone: '🎨' },
  { id: 'quatro', nome: 'Potência máxima', desc: 'Instale quatro máquinas na mesma fábrica.', meta: 4, valor: () => E.maquinas.length, xp: 180, icone: '🚀' },
];

const DESAFIOS_CARREIRA = {
  producao: { nome: 'Produção em alta', campo: 'produzidas', base: 50, xp: 60, unidade: 'caixas produzidas' },
  vendas: { nome: 'Clientes satisfeitos', campo: 'vendidas', base: 40, xp: 60, unidade: 'caixas vendidas' },
  contratos: { nome: 'Agenda de entregas', campo: 'contratos', base: 3, xp: 100, unidade: 'contratos entregues' },
};

function salvarConquistas() {
  if (!carreiraPronta) return true;
  try { localStorage.setItem(CHAVE_CONQUISTAS, JSON.stringify(carreira)); carreiraPersistida = true; return true; } catch (_) { carreiraPersistida = false; return false; }
}

function inicializarConquistas() {
  carreira = novaCarreira();
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_CONQUISTAS) || 'null');
    if (dados?.versao === 1) {
      carreira.xp = Number.isFinite(dados.xp) ? Math.max(0, dados.xp) : 0;
      for (const campo of ['desbloqueadas', 'tipos', 'desafios']) {
        if (dados[campo] && typeof dados[campo] === 'object' && !Array.isArray(dados[campo])) carreira[campo] = dados[campo];
      }
      for (const campo in carreira.totais) if (Number.isFinite(dados.totais?.[campo])) carreira.totais[campo] = Math.max(0, dados.totais[campo]);
    }
  } catch (_) { /* Armazenamento indisponível: a carreira funciona nesta sessão. */ }
  // Reconhece marcos de partidas antigas sem somar os mesmos números a cada carga.
  for (const [campo, origem] of [['produzidas', 'produzidas'], ['vendidas', 'vendidas'], ['faturamento', 'faturamento'], ['contratos', 'contratosEntregues']]) {
    carreira.totais[campo] = Math.max(carreira.totais[campo], E[origem] || 0);
  }
  carreiraPronta = true;
  const total = avaliarConquistas(false);
  if (total) enfileirarConquista('Marcos reconhecidos', `${total} conquista(s) da sua partida foram adicionadas à carreira.`);
  salvarConquistas();
}

function nivelPrestigio() {
  const nivel = Math.floor(Math.sqrt(carreira.xp / 100)) + 1;
  const inicio = 100 * (nivel - 1) ** 2, fim = 100 * nivel ** 2;
  const titulo = nivel < 3 ? 'Aprendiz' : nivel < 5 ? 'Empreendedor' : nivel < 8 ? 'Gestor industrial' : nivel < 12 ? 'Diretor' : 'Magnata';
  return { nivel, titulo, inicio, fim, progresso: (carreira.xp - inicio) / (fim - inicio) };
}

function enfileirarConquista(titulo, texto) { filaConquistas.push({ titulo, texto }); }
function avaliarConquistas(notificar = true) {
  if (!carreiraPronta) return 0;
  let novas = 0;
  for (const c of CONQUISTAS) {
    if (!carreira.desbloqueadas[c.id] && c.valor() >= c.meta) {
      carreira.desbloqueadas[c.id] = new Date().toISOString(); carreira.xp += c.xp; novas++;
      if (notificar) enfileirarConquista(`${c.icone} ${c.nome}`, `Conquista desbloqueada · +${c.xp} XP · G abre a coleção`);
    }
  }
  if (novas) salvarConquistas();
  return novas;
}

function verificarConquistas(dt) {
  timerConquistas += dt;
  if (timerConquistas >= .5) { timerConquistas = 0; avaliarConquistas(); }
}

ouvir('caixa', () => {
  if (!carreiraPronta) return;
  carreira.totais.produzidas++; carreira.tipos[E.produto || 'simples'] = true;
});
ouvir('venda', (qtd, valor) => {
  if (!carreiraPronta) return;
  carreira.totais.vendidas += qtd; carreira.totais.faturamento += valor;
});
ouvir('contrato-entregue', () => { if (carreiraPronta) carreira.totais.contratos++; });

function progressoDesafio(id) {
  const d = DESAFIOS_CARREIRA[id];
  if (!d) return null;
  const etapa = Math.max(0, Math.floor(Number(carreira.desafios[id]) || 0));
  const inicio = d.base * etapa * (etapa + 1) / 2;
  const meta = d.base * (etapa + 1), atual = Math.max(0, carreira.totais[d.campo] - inicio);
  return { etapa, meta, atual, pronto: atual >= meta, xp: d.xp + etapa * 10 };
}

function resgatarDesafio(id) {
  const p = progressoDesafio(id);
  if (!p?.pronto) return false;
  carreira.desafios[id] = p.etapa + 1; carreira.xp += p.xp;
  salvarConquistas();
  enfileirarConquista('Desafio concluído!', `${DESAFIOS_CARREIRA[id].nome} · +${p.xp} XP. Uma nova meta está disponível.`);
  return true;
}

function atualizarPrestigioHud() {
  if (!carreiraPronta) return;
  const n = nivelPrestigio(), prontas = Object.keys(DESAFIOS_CARREIRA).filter(id => progressoDesafio(id).pronto).length;
  $('hud-prestigio').textContent = `🏆 ${Object.keys(carreira.desbloqueadas).filter(id => CONQUISTAS.some(c => c.id === id)).length}/${CONQUISTAS.length} · Prestígio ${n.nivel} · ${carreira.xp} XP${prontas ? ` · ${prontas} recompensa(s) disponível(is)` : ''}`;
}

function atualizarNotificacoesConquistas(dt) {
  timerToastConquista -= dt;
  if (timerToastConquista > 0) return;
  const el = $('conquista-toast');
  if (!filaConquistas.length) { el.classList.add('oculto'); return; }
  const aviso = filaConquistas.shift();
  el.replaceChildren();
  const titulo = document.createElement('strong'), texto = document.createElement('span');
  titulo.textContent = aviso.titulo; texto.textContent = aviso.texto;
  el.append(titulo, texto); el.classList.remove('oculto');
  timerToastConquista = 4;
}

function mostrarConquistas(filtro = filtroConquistas) {
  salvarConquistas();
  filtroConquistas = ['todas', 'ganhas', 'faltam'].includes(filtro) ? filtro : 'todas';
  avaliarConquistas();
  $('menu').classList.add('oculto');
  const n = nivelPrestigio(), ganhas = CONQUISTAS.filter(c => carreira.desbloqueadas[c.id]).length;
  const filtros = [['todas', 'Todas'], ['ganhas', 'Desbloqueadas'], ['faltam', 'Em progresso']].map(([id, nome]) => `<button data-acao="filtro-conquistas" data-id="${id}" aria-pressed="${filtroConquistas === id}">${nome}</button>`).join('');
  const lista = CONQUISTAS.filter(c => filtroConquistas === 'todas' || (filtroConquistas === 'ganhas') === !!carreira.desbloqueadas[c.id]);
  const cards = lista.map(c => {
    const data = carreira.desbloqueadas[c.id], valor = Math.min(c.meta, c.valor());
    return `<article class="medalha ${data ? 'ganha' : ''}"><span class="medalha-icone" aria-hidden="true">${c.icone}</span><div><strong>${c.nome}</strong><p>${c.desc}</p>
      <small>${data ? `Desbloqueada · ${new Date(data).toLocaleDateString('pt-BR')}` : `${Math.floor(valor).toLocaleString('pt-BR')} / ${c.meta.toLocaleString('pt-BR')}`} · ${c.xp} XP</small>
      <progress max="${c.meta}" value="${data ? c.meta : valor}" aria-label="Progresso: ${c.nome}"></progress></div></article>`;
  }).join('');
  const desafios = Object.entries(DESAFIOS_CARREIRA).map(([id, d]) => {
    const p = progressoDesafio(id);
    return `<article class="desafio-carreira"><strong>${d.nome} · rodada ${p.etapa + 1}</strong><p>${Math.min(p.atual, p.meta).toLocaleString('pt-BR')} / ${p.meta.toLocaleString('pt-BR')} ${d.unidade}</p><progress value="${Math.min(p.atual, p.meta)}" max="${p.meta}" aria-label="${d.nome}"></progress><button data-acao="resgatar-desafio" data-id="${id}" ${p.pronto ? '' : 'disabled'}>${p.pronto ? 'Resgatar' : 'Em progresso'} · ${p.xp} XP</button></article>`;
  }).join('');
  abrirJanela('CONQUISTAS DA FÁBRICA', `<div class="colecao-conquistas"><div class="prestigio"><span class="prestigio-numero">${n.nivel}</span><div><strong>${n.titulo}</strong><p>${carreira.xp.toLocaleString('pt-BR')} XP · ${ganhas}/${CONQUISTAS.length} conquistas</p><progress value="${carreira.xp - n.inicio}" max="${n.fim - n.inicio}" aria-label="Progresso de prestígio"></progress><small>${n.fim - carreira.xp} XP para o próximo nível</small></div></div>
    ${!carreiraPersistida ? '<p role="status">Armazenamento indisponível: a carreira só está garantida nesta sessão.</p>' : ''}<p>Carreira local: medalhas e XP permanecem ao reiniciar a fábrica neste navegador. XP aumenta seu prestígio; não altera dinheiro nem velocidade. Sem integração com a Steam.</p>
    <h3>Sempre há um próximo objetivo</h3><div class="desafios-carreira">${desafios}</div><h3>Sua coleção</h3><nav class="filtros-conquistas" aria-label="Filtrar conquistas">${filtros}</nav>
    <div class="medalhas">${cards || '<p>Nenhuma conquista neste filtro ainda.</p>'}</div></div>`, [['Voltar à fábrica', fecharJanela]]);
}
