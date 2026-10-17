// ===================== SALVAR E CARREGAR =====================
// O reino fica salvo no navegador (localStorage, chave rdc.save): sozinho a cada 20 s, ao fechar a página
// e no botão Salvar. Quem aponta para outro objeto (carregador da estrada, trabalhador do prédio,
// mercadoria reservada) é guardado pelo id e religado ao carregar.
// Versão 2: as casas do mapa guardam também os minérios (min). Saves da versão 1 ganham minérios ao carregar.
// Versão 3: ferramentas. Saves anteriores ganham o estoque inicial de ferramentas na sede.
// Versão 4: geólogo (desc e placa nas casas), burros (estrada.burro) e armazéns. Saves anteriores ficam com
// toda a serra já conhecida (como era antes) e ganham 2 burros na sede.
// Versão 5: militar e reino rival. Guarnições (p.guar), dono de cada casa (para o território não mudar ao
// carregar), J.rival e o histórico das estatísticas. Saves anteriores: a sede ganha 2 soldados, a guarita
// ocupada vira guarnição e, se houver espaço no mapa, nasce um reino rival.
const CHAVE_SAVE='rdc.save',VERSAO_SAVE=5;
function salva(){if(!J)return false;const id=o=>o?o.id:null;
const d={v:VERSAO_SAVE,ID,cam:{x:CAM.x,y:CAM.y,z:CAM.z},sede:J.sede.id,t:J.t,feito:J.feito,obj:J.obj,comidaT:J.comidaT||0,nascidos:J.nascidos||0,
rival:J.rival||null,hist:J.hist||[],fim:J.fim||null,promoT:J.promoT||0,promovidos:J.promovidos||0,conquistas:J.conquistas||0,
mapa:M.map(l=>l.map(q=>[q.t,q.h,q.v,q.obj,q.uso,q.min||null,q.desc?1:0,q.placa?1:0,q.dono?0:q.inim?1:-1])),
band:[...J.band.values()].map(f=>({x:f.x,y:f.y,itens:f.itens})),
est:[...J.est.values()].map(e=>({id:e.id,cam:e.cam,car:id(e.car),burro:id(e.burro)})),geol:J.geol||0,
pred:[...J.pred.values()].map(p=>({...p,trab:id(p.trab),obreiro:id(p.obreiro)})),
col:J.col.map(u=>({...u,pega:id(u.pega),alvo:u.of=='soldado'?u.alvo:u.alvo&&{x:u.alvo.x,y:u.alvo.y,perto:u.alvo.perto,acao:u.alvo.acao}}))};
try{localStorage.setItem(CHAVE_SAVE,JSON.stringify(d));return true}catch(e){return false}}
function temSave(){try{return!!localStorage.getItem(CHAVE_SAVE)}catch(e){return false}}
function carrega(){let d;try{d=JSON.parse(localStorage.getItem(CHAVE_SAVE))}catch(e){return false}if(!d||d.v<1||d.v>VERSAO_SAVE)return false;
J={band:new Map(),est:new Map(),pred:new Map(),col:[],sede:null,t:d.t,feito:d.feito||{},obj:d.obj||0,comidaT:d.comidaT,nascidos:d.nascidos,
rival:d.rival||null,hist:d.hist||[],fim:d.fim||null,promoT:d.promoT||0,promovidos:d.promovidos||0,conquistas:d.conquistas||0};ID=d.ID;DIST={};N=d.mapa.length;
M=d.mapa.map(l=>l.map(([t,h,v,obj,uso,min,desc,placa,dn])=>({t,h,v,obj,uso,min,desc:d.v<4?(t=='m'?1:0):desc,placa,dono:dn===0,inim:dn===1})));if(d.v<2)distribuiMinerios(semente(d.ID*7+1));J.geol=d.geol||0;
for(const f of d.band)J.band.set(k(f.x,f.y),{x:f.x,y:f.y,key:k(f.x,f.y),itens:f.itens,est:new Set()});
const U=new Map(d.col.map(u=>[u.id,u]));
for(const e of d.est){const r={id:e.id,a:k(...e.cam[0]),b:k(...e.cam[e.cam.length-1]),cam:e.cam,len:e.cam.length-1,car:U.get(e.car)||null,burro:U.get(e.burro)||null};J.est.set(r.id,r);J.band.get(r.a).est.add(r.id);J.band.get(r.b).est.add(r.id)}
for(const p of d.pred){p.trab=U.get(p.trab)||null;p.obreiro=U.get(p.obreiro)||null;J.pred.set(p.id,p)}
for(const u of d.col){if(u.pega!=null){const f=J.band.get(u.de);u.pega=f&&f.itens.find(i=>i.id==u.pega)||null}if(u.alvo&&u.of!='soldado')u.alvo.o=cel(u.alvo.x,u.alvo.y).obj;J.col.push(u)}
J.sede=J.pred.get(d.sede);if(d.v<3)for(const f in FERR_INICIAL)J.sede.estoque[f]=(J.sede.estoque[f]||0)+FERR_INICIAL[f];if(d.v<4)J.sede.estoque.burro=(J.sede.estoque.burro||0)+2;
if(d.v<5){// Militar: sede com 2 soldados; guarita ocupada (o soldado era o trabalhador) vira guarnição; nasce o rival
J.sede.guar=[{r:0},{r:0}];J.sede.estoque.espada=(J.sede.estoque.espada||0)+2;
for(const p of J.pred.values())if(TIPOS[p.tipo].militar&&!p.guar){p.guar=[];if(p.ocupada||p.trab&&p.trab.dentro){p.guar.push({r:0});if(p.trab)tiraUnidade(p.trab)}p.trab=null;delete p.ocupada}
territorio();criaRival()}
Object.assign(CAM,d.cam);territorio();return true}
