// ===================== ESTATÍSTICAS =====================
// A cada 15 s de jogo guarda uma amostra (J.hist, as 80 últimas = 20 min): o total já produzido de cada
// mercadoria, o estoque (sede + armazéns), os colonos e os soldados dos dois reinos.
// O painel mostra Produção (por minuto, entre uma amostra e a seguinte) ou Estoque, por grupo de até 4 linhas.
const STAT_S=15,STAT_MAX=80;
const STAT_GRUPOS=[['Construção',['tora','tabua','pedra']],['Comida',['peixe','trigo','farinha','pao']],['Minas',['carvao','ferro','ouro','barra']],
['Reino',['colonos','soldados','rival']]];
const STAT_NOME={colonos:'Colonos',soldados:'Seus soldados',rival:'Soldados de Morvane'};
// Cores categóricas validadas (contraste e daltonismo) sobre o fundo escuro do painel, sempre na mesma ordem
const STAT_CORES=['#3987e5','#d95926','#199e70','#c98500'];
let STAT={modo:'producao',grupo:0,hover:null,aberto:false};
function amostra(dt){J.histT=(J.histT||0)+dt;if(J.histT<STAT_S&&(J.hist||[]).length)return;J.histT=0;const h=J.hist||(J.hist=[]),e={};for(const t in ITEM)e[t]=estoqueTotal(t);
h.push({t:Math.round(J.t),f:{...J.feito},e,colonos:totalColonos(),soldados:soldadosDe(0),rival:J.rival&&!J.rival.morto?soldadosDe(1):0});if(h.length>STAT_MAX)h.shift()}
// Série de um item: [{t, v}]. Produção: diferença do total entre amostras, por minuto. Estoque: o valor guardado.
function serie(id){const h=J.hist||[],reino=id in STAT_NOME;if(reino)return h.map(a=>({t:a.t,v:a[id]||0}));
if(STAT.modo=='estoque')return h.map(a=>({t:a.t,v:a.e[id]||0}));
const s=[];for(let i=1;i<h.length;i++){const dt=h[i].t-h[i-1].t;if(dt>0)s.push({t:h[i].t,v:((h[i].f[id]||0)-(h[i-1].f[id]||0))/dt*60})}return s}
const nomeSerie=id=>STAT_NOME[id]||ITEM[id];
function abreStats(){STAT.aberto=true;$('stats').hidden=false;montaStats()}
function fechaStats(){STAT.aberto=false;$('stats').hidden=true}
function montaStats(){const reino=STAT.grupo==3;$('st-modo').innerHTML=reino?'':[['producao','Produção por minuto'],['estoque','Estoque']].map(([m,n])=>`<button data-m="${m}" class="${STAT.modo==m?'on':''}">${n}</button>`).join('');
$('st-grupos').innerHTML=STAT_GRUPOS.map(([n],i)=>`<button data-g="${i}" class="${STAT.grupo==i?'on':''}">${n}</button>`).join('');
const ids=STAT_GRUPOS[STAT.grupo][1];
$('st-legenda').innerHTML=ids.map((id,i)=>`<span><i style="background:${STAT_CORES[i]}"></i>${nomeSerie(id)}</span>`).join('');
desenhaGrafico();
// Tabela (os mesmos números do gráfico, para ler sem depender da cor)
const ultimo=id=>{const s=serie(id);return s.length?s[s.length-1].v:0},media=id=>{const s=serie(id);return s.length?s.reduce((a,b)=>a+b.v,0)/s.length:0},fmt=v=>v>=10?Math.round(v):Math.round(v*10)/10;
$('st-tabela').innerHTML=`<tr><th></th><th>${reino?'Agora':STAT.modo=='producao'?'Último (por min)':'Agora'}</th><th>Média</th></tr>`+ids.map(id=>`<tr><td>${nomeSerie(id)}</td><td>${fmt(ultimo(id))}</td><td>${fmt(media(id))}</td></tr>`).join('')}
// Gráfico de linhas: um eixo só (minutos de jogo), grade discreta, linhas de 2 px, nome no fim de cada linha
function desenhaGrafico(){const c=$('st-graf'),D=devicePixelRatio||1,W=c.clientWidth,H=c.clientHeight;if(c.width!=W*D){c.width=W*D;c.height=H*D}
const x=c.getContext('2d');x.setTransform(D,0,0,D,0,0);x.clearRect(0,0,W,H);const ids=STAT_GRUPOS[STAT.grupo][1],S=ids.map(serie),todos=S.flat();
x.font='13px "Alegreya Sans",sans-serif';x.fillStyle='#c8b8a0';
if(todos.length<2){x.textAlign='center';x.fillText('Os números aparecem depois de 30 segundos de jogo.',W/2,H/2);return}
const t0=Math.min(...todos.map(p=>p.t)),t1=Math.max(...todos.map(p=>p.t)),max=Math.max(1,...todos.map(p=>p.v)),passo=[1,2,5,10,20,50,100,200,500].find(s=>max/s<=5)||1000,topo=Math.ceil(max/passo)*passo;
const L=40,R=120,T=12,B=26,px=t=>L+(t-t0)/Math.max(1,t1-t0)*(W-L-R),py=v=>T+(1-v/topo)*(H-T-B);
// grade e eixos
x.strokeStyle='rgba(200,184,160,.14)';x.lineWidth=1;x.textAlign='right';
for(let v=0;v<=topo;v+=passo){const y=Math.round(py(v))+.5;x.beginPath();x.moveTo(L,y);x.lineTo(W-R,y);x.stroke();x.fillText(v,L-6,y+4)}
x.textAlign='center';for(let m=0;m<=Math.floor((t1-t0)/60);m+=Math.max(1,Math.ceil((t1-t0)/60/6))){const t=t1-m*60;x.fillText(m?'-'+m+' min':'agora',px(t),H-6)}
// linhas
S.forEach((s,i)=>{if(s.length<2)return;x.strokeStyle=STAT_CORES[i];x.lineWidth=2;x.lineJoin='round';x.beginPath();s.forEach((p,j)=>j?x.lineTo(px(p.t),py(p.v)):x.moveTo(px(p.t),py(p.v)));x.stroke()});
// nomes no fim das linhas, afastados para não se encostarem
const fins=S.map((s,i)=>s.length?{i,y:py(s[s.length-1].v),x:px(s[s.length-1].t)}:null).filter(Boolean).sort((a,b)=>a.y-b.y);
for(let j=1;j<fins.length;j++)if(fins[j].y-fins[j-1].y<15)fins[j].y=fins[j-1].y+15;
// Se a pilha de nomes passou do fundo do gráfico, sobe todos juntos
const sobra=fins.length?fins[fins.length-1].y-(H-B-8):0;if(sobra>0)for(const f of fins)f.y-=sobra;
x.textAlign='left';for(const f of fins){x.fillStyle=STAT_CORES[f.i];x.beginPath();x.arc(f.x,py(S[f.i][S[f.i].length-1].v),3,0,7);x.fill();x.fillStyle='#f4ece6';x.fillText(nomeSerie(ids[f.i]),f.x+8,f.y+4)}
// linha-guia e valores sob o mouse
if(STAT.hover!=null){const tm=t0+(STAT.hover-L)/(W-L-R)*(t1-t0);if(tm>=t0&&tm<=t1){const vals=S.map(s=>s.reduce((m,p)=>!m||Math.abs(p.t-tm)<Math.abs(m.t-tm)?p:m,null));const tt=vals.find(Boolean);if(tt){const gx=px(tt.t);
x.strokeStyle='rgba(244,236,230,.5)';x.beginPath();x.moveTo(gx+.5,T);x.lineTo(gx+.5,H-B);x.stroke();
vals.forEach((p,i)=>{if(!p)return;x.fillStyle='#1c1410';x.beginPath();x.arc(px(p.t),py(p.v),5,0,7);x.fill();x.fillStyle=STAT_CORES[i];x.beginPath();x.arc(px(p.t),py(p.v),3.5,0,7);x.fill()});
const linhas=[(t1-tt.t<5?'agora':'-'+Math.round((t1-tt.t)/60*10)/10+' min')].concat(vals.map((p,i)=>p?nomeSerie(ids[i])+': '+(p.v>=10?Math.round(p.v):Math.round(p.v*10)/10):'')).filter(Boolean),bw=170,bh=linhas.length*17+8,bx=Math.min(gx+10,W-bw-4);
x.fillStyle='rgba(20,12,10,.95)';x.fillRect(bx,T,bw,bh);x.strokeStyle='#c9a46a';x.strokeRect(bx+.5,T+.5,bw,bh);linhas.forEach((l,i)=>{x.fillStyle=i?'#f4ece6':'#c8b8a0';x.fillText(l,bx+8,T+17+i*17)})}}}}
function ligaStats(){$('bstats').onclick=()=>STAT.aberto?fechaStats():abreStats();$('st-fecha').onclick=fechaStats;
$('stats').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.m){STAT.modo=b.dataset.m;montaStats()}if(b.dataset.g){STAT.grupo=+b.dataset.g;montaStats()}});
const c=$('st-graf');c.addEventListener('pointermove',e=>{STAT.hover=e.clientX-c.getBoundingClientRect().left;desenhaGrafico()});c.addEventListener('pointerleave',()=>{STAT.hover=null;desenhaGrafico()});
setInterval(()=>{if(STAT.aberto)montaStats()},1000)}
