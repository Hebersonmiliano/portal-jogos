// ===================== MAPA DO REINO =====================
// Os lugares de cada ato ficam nos arquivos de fases (fases/ato1.js...), que fazem LUGARES.push(...).
// Regiões: cada lugar pertence a uma região (campo regiao); o mapa mostra uma região por vez.
const LUGARES=[],REGIOES={valdren:{nome:'Reino de Valdren'}};

// Progresso da campanha, salvo no navegador. São N_SLOTS espaços de jogo (cdr.save.1, .2, .3);
// cdr.slot guarda qual espaço está em uso. A tela de jogos salvos fica em saves.js.
const N_SLOTS=3,CAMP_ANTIGO='cdr.campanha',chaveSlot=n=>'cdr.save.'+n;let CAMP=null,MP=null,SLOT=1;
try{SLOT=Math.min(N_SLOTS,Math.max(1,+localStorage.getItem('cdr.slot')||1));
// Save da versão antiga (um espaço só): passa para o espaço 1 sem perder nada e fica uma cópia de segurança.
const velho=localStorage.getItem(CAMP_ANTIGO);if(velho&&!localStorage.getItem(chaveSlot(1))){localStorage.setItem(chaveSlot(1),velho);localStorage.setItem(CAMP_ANTIGO+'.backup',velho);localStorage.removeItem(CAMP_ANTIGO)}}catch(e){}
function leSlot(n){try{return JSON.parse(localStorage.getItem(chaveSlot(n)))}catch(e){return null}}
function usaSlot(n){SLOT=n;CAMP=null;try{localStorage.setItem('cdr.slot',n)}catch(e){}}
function camp(){if(!CAMP)CAMP=leSlot(SLOT);return CAMP}
function salvaCamp(){if(!CAMP)return;CAMP.salvo=Date.now();if(typeof confereCampanha=='function')confereCampanha(CAMP);try{localStorage.setItem(chaveSlot(SLOT),JSON.stringify(CAMP))}catch(e){}}
function novaCamp(nome){CAMP={nome:nome||'Jornada '+SLOT,venceu:[],vistos:[],aqui:'brumafria',regiao:'valdren',dia:1,grupo:[...PARTY],ouro:150,bolsa:{pocao:2,itens:{}},herois:[]};salvaCamp();return CAMP}

const lugar=id=>LUGARES.find(l=>l.id==id);
const regiaoAtual=()=>(camp()&&camp().regiao)||'valdren',daRegiao=()=>LUGARES.filter(l=>(l.regiao||'valdren')==regiaoAtual());
const venceu=l=>!!l.fase&&camp().venceu.includes(l.fase);
// requer: id de uma fase que precisa estar vencida (usado nas passagens para regiões novas).
const aberto=l=>{if(l.requer&&!(camp().venceu||[]).includes(l.requer))return false;if(l.tipo=='vila')return true;const d=lugar(l.de);return!!d&&(d.tipo=='vila'||venceu(d))};
const temFase=l=>!!l.fase&&FASES.some(f=>f.id==l.fase);
const jogavel=l=>l.tipo=='batalha'&&aberto(l)&&temFase(l);
const visivel=l=>aberto(l)||l.tipo=='castelo';
function rota(de,ate){const sobe=id=>{const r=[];for(let l=lugar(id);l;l=l.de?lugar(l.de):null)r.push(l.id);return r};
const A=sobe(de),B=sobe(ate),c=A.find(id=>B.includes(id));return[...A.slice(0,A.indexOf(c)+1),...B.slice(0,B.indexOf(c)).reverse()].map(lugar)}

// Elementos fixos do pergaminho (sorteados uma vez, sempre iguais).
const PERG=(()=>{let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647;
return{manchas:[...Array(26)].map(()=>({x:r()*1280,y:r()*720,r:40+r()*140,a:.05+r()*.1})),
serras:[...Array(26)].map((_,i)=>i<14?{x:860+r()*300,y:400+r()*170,s:.8+r()*.6}:{x:250+r()*330,y:120+r()*120,s:.7+r()*.5}),
arvores:[...Array(34)].map(()=>({x:630+r()*190,y:250+r()*160,s:.7+r()*.6}))}})();

function mapa(){parar();if(typeof tocar=='function')tocar('mapa');if(typeof IN!='undefined'&&IN)IN.fechar();if(!camp())novaCamp();garanteHerois();const c=camp();ovl.hidden=false;
ovl.innerHTML=`<canvas id="mc" aria-label="Mapa do reino de Valdren"></canvas><div class="mbar"><span class="ouro">Ouro: ${c.ouro}</span><button id="mt">Missões e mina</button><button id="mg">Grupo</button><button id="mm">Menu</button></div>`;
$('mm').onclick=()=>{MP=null;title()};$('mg').onclick=()=>{MP=null;grupo(mapa)};$('mt').onclick=()=>{MP=null;missoes(mapa)};
const novos=LUGARES.filter(l=>aberto(l)&&!c.vistos.includes(l.id)).map(l=>l.id);c.vistos.push(...novos);salvaCamp();
const p=lugar(c.aqui)||lugar('brumafria');
MP={c:$('mc'),t0:performance.now(),ult:performance.now(),hov:null,msg:'',msgT:0,novos,tok:{x:p.x,y:p.y},rota:null,parado:0};
MP.c.onpointermove=e=>{MP.hov=acha(e);MP.parado=0};
MP.c.onpointerdown=e=>{MP.parado=0;const l=acha(e);if(l)escolhe(l)};
requestAnimationFrame(desenhaMapa)}

function acha(e){const r=MP.c.getBoundingClientRect(),vx=(e.clientX-r.left-MP.ox)/MP.k,vy=(e.clientY-r.top-MP.oy)/MP.k;
return daRegiao().find(l=>visivel(l)&&Math.hypot(l.x-vx,l.y-vy)<34)||null}

function escolhe(l){if(MP.rota)return;const c=camp();
if(jogavel(l)||l.tipo=='vila'||((l.tipo=='castelo'||l.tipo=='mina'||l.tipo=='passagem')&&aberto(l))){const pts=rota(c.aqui,l.id);if(pts.length<2){chega(l);return}MP.rota={pts,i:1,dest:l};return}
MP.msgT=3.5;MP.msg=l.tipo=='castelo'&&!aberto(l)?'O destino final. Vença as batalhas do caminho para chegar até ele.':'Em breve: esta parte da jornada ainda está sendo preparada.'}

function chega(l){const c=camp();c.aqui=l.id;salvaCamp();MP.rota=null;
// Passagem: viaja para outra região (cada região tem o seu mapa) e chega no lugar l.chegada de lá.
if(l.tipo=='passagem'){c.regiao=l.para;c.aqui=l.chegada;salvaCamp();MP=null;mapa();return}
if(l.tipo=='mina'){MP=null;missoes(mapa);return}
if(l.tipo=='castelo'&&camp().castelo){MP=null;base();return}
if(l.tipo=='vila'||l.tipo=='castelo'){MP=null;loja(l.loja||(l.tipo=='vila'?'vila':'castelo'));return}
MP=null;fase(FASES.findIndex(f=>f.id==l.fase));brief()}

addEventListener('keydown',e=>{if(!MP||!document.contains(MP.c))return;MP.parado=0;
if(e.key=='Escape'){MP=null;title()}
else if(e.key=='Enter'){const l=daRegiao().find(l=>jogavel(l)&&!venceu(l))||daRegiao().find(jogavel);if(l)escolhe(l)}});

function desenhaMapa(now){if(!MP||!document.contains(MP.c))return;
const{c}=MP,x=c.getContext('2d'),W=innerWidth,H=innerHeight,D=devicePixelRatio||1,t=Math.max(0,(now-MP.t0)/1000),dt=Math.min(.05,Math.max(0,(now-MP.ult)/1000));MP.ult=now;
if(c.width!=Math.round(W*D)||c.height!=Math.round(H*D)){c.width=Math.round(W*D);c.height=Math.round(H*D)}
const k=Math.min(W/1280,H/720);MP.k=k;MP.ox=(W-1280*k)/2;MP.oy=(H-720*k)/2;
x.setTransform(D,0,0,D,0,0);x.fillStyle='#0b0812';x.fillRect(0,0,W,H);
x.setTransform(D*k,0,0,D*k,D*MP.ox,D*MP.oy);x.imageSmoothingEnabled=false;
// Modo feira: 60 s sem ninguém mexer no mapa, a abertura volta a rodar.
MP.parado+=dt;if(MP.parado>60&&!MP.rota){MP=null;intro();return}
(REGIOES[regiaoAtual()].fundo||pergaminho)(x,t);
const cam=camp(),revela=id=>MP.novos.includes(id)?Math.min(1,Math.max(0,(t-.6)/1.6)):1;
// Névoa sobre o que ainda não foi descoberto
for(const l of daRegiao())if(!aberto(l)||MP.novos.includes(l.id)){const al=(l.tipo=='castelo'&&!aberto(l)?.55:.9)*(1-(aberto(l)?revela(l.id):0));
if(al>0)for(let n=0;n<6;n++){const fx=l.x+Math.cos(n*1.7+t*.15)*70,fy=l.y+Math.sin(n*2.3+t*.12)*45,g=x.createRadialGradient(fx,fy,10,fx,fy,120);
g.addColorStop(0,`rgba(236,228,214,${al*.75})`);g.addColorStop(1,'rgba(236,228,214,0)');x.fillStyle=g;x.fillRect(fx-130,fy-130,260,260)}}
// Caminhos a tinta (o caminho novo se desenha sozinho)
x.setLineDash([10,9]);x.lineCap='round';
for(const l of daRegiao()){if(!l.de||!aberto(l))continue;const d=lugar(l.de),q=revela(l.id),ex=d.x+(l.x-d.x)*q,ey=d.y+(l.y-d.y)*q;
x.strokeStyle='rgba(60,36,16,.75)';x.lineWidth=4;x.beginPath();x.moveTo(d.x,d.y);x.quadraticCurveTo((d.x+ex)/2,(d.y+ey)/2-30*q,ex,ey);x.stroke()}
x.setLineDash([]);
// Lugares
for(const l of daRegiao()){if(!visivel(l))continue;const q=aberto(l)?revela(l.id):1;x.globalAlpha=q;marco(x,l,t);x.globalAlpha=1}
// Heróis andando
if(MP.rota){const r=MP.rota,alvo=r.pts[r.i],dx=alvo.x-MP.tok.x,dy=alvo.y-MP.tok.y,dist=Math.hypot(dx,dy),passo=240*dt;
if(dist<=passo){MP.tok.x=alvo.x;MP.tok.y=alvo.y;r.i++;if(r.i>=r.pts.length){chega(r.dest);if(!MP)return}}
else{MP.tok.x+=dx/dist*passo;MP.tok.y+=dy/dist*passo}}
const bob=MP.rota?Math.abs(Math.sin(t*10))*5:Math.sin(t*2)*2,img=spr({k:PARTY[0]||'K',team:0},false);
x.fillStyle='rgba(40,25,10,.35)';x.beginPath();x.ellipse(MP.tok.x,MP.tok.y-6,16,5,0,0,7);x.fill();
x.drawImage(img,MP.tok.x-18,MP.tok.y-50-bob,36,52);
// Vinheta, como uma lamparina sobre o pergaminho
const v=x.createRadialGradient(640,360,260,640,360,780);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(8,4,14,.88)');x.fillStyle=v;x.fillRect(0,0,1280,720);
// Textos
x.textBaseline='alphabetic';x.font='700 30px "Alegreya SC",Georgia,serif';x.textAlign='left';
sombra(x,`Dia ${cam.dia} do Crepúsculo Eterno`,28,48,'#f4ece6');x.font='italic 20px "Alegreya Sans",Georgia,serif';sombra(x,REGIOES[regiaoAtual()].nome,30,76,'#e8dcc8');
const foco=MP.hov||lugar(cam.aqui);if(foco){x.textAlign='right';x.font='700 34px "Alegreya SC",Georgia,serif';sombra(x,foco.nome,1252,660,'#f7d9a8');
x.font='20px "Alegreya Sans",Georgia,sans-serif';sombra(x,status(foco),1252,692,'#e8dcc8')}
x.textAlign='left';x.font='18px "Alegreya Sans",Georgia,sans-serif';sombra(x,'Clique numa batalha para lutar, ou na vila e no castelo para comprar',28,692,'#cfc6dc');
if(MP.msgT>0){MP.msgT-=dt;x.globalAlpha=Math.min(1,MP.msgT);x.fillStyle='rgba(20,12,30,.85)';x.fillRect(240,560,800,52);x.textAlign='center';x.font='20px "Alegreya Sans",Georgia,sans-serif';x.fillStyle='#f4e6d0';x.fillText(MP.msg,640,593);x.globalAlpha=1}
requestAnimationFrame(desenhaMapa)}

function status(l){if(l.tipo=='passagem')return`${l.sub} · viajar para ${REGIOES[l.para].nome}`;if(l.tipo=='vila')return l.sub+(l.loja?' · forja':' · loja e taverna');if(l.tipo=='mina'){const c=camp();return`${l.sub} · ${naMina(c)}/${vagasMina(c)} mineiros`}if(l.tipo=='castelo')return camp().castelo?'Base do grupo · arsenal real':aberto(l)?'Arsenal real: armas das classes avançadas':l.sub+' · destino final';if(!temFase(l))return'Em breve';
const m=melhor(l.fase);return venceu(l)?`Vencida ${'★'.repeat(m)}${'☆'.repeat(3-m)} · batalha livre para treinar`:'Batalha · clique para viajar'}

function sombra(x,txt,tx,ty,cor){x.fillStyle='rgba(0,0,0,.75)';x.fillText(txt,tx+2,ty+2);x.fillStyle=cor;x.fillText(txt,tx,ty)}

function marco(x,l,t){x.textAlign='center';
if(l.tipo=='castelo'){const nosso=camp()&&camp().castelo;castelo(x,l.x,l.y+28,.32,nosso?'#4a3a6e':aberto(l)?'#3a2c55':'rgba(58,44,85,.55)',nosso);
// Bandeira do grupo sobre o castelo conquistado (cores escolhidas na base)
if(nosso){const b=camp().bandeira||{cor:'#2f6fd6',emblema:'#ffd45a'},o=Math.sin(t*3)*2;x.fillStyle='#2a1c10';x.fillRect(l.x-1,l.y-58,2,26);
x.fillStyle=b.cor;x.beginPath();x.moveTo(l.x+1,l.y-58);x.lineTo(l.x+24,l.y-54+o);x.lineTo(l.x+1,l.y-46);x.closePath();x.fill();x.fillStyle=b.emblema;x.fillRect(l.x+6,l.y-55+o/2,5,5)}}
else{const cor=l.tipo=='passagem'?'#3a6aa8':l.tipo=='mina'?'#7a6a4a':l.tipo=='vila'?'#5f8f52':!temFase(l)?'#8d8578':venceu(l)?'#e0aa48':'#c4403a';
if(jogavel(l)&&!venceu(l)){x.strokeStyle=`rgba(196,64,58,${.5+.5*Math.sin(t*4)})`;x.lineWidth=3;x.beginPath();x.arc(l.x,l.y,18+4*Math.sin(t*4),0,7);x.stroke()}
x.beginPath();x.arc(l.x,l.y,12,0,7);x.fillStyle=cor;x.fill();x.lineWidth=3;x.strokeStyle='#3c2410';x.stroke();
if(l.tipo=='mina'){x.font='14px sans-serif';x.fillStyle='#f4ece6';x.fillText('⛏',l.x,l.y+5)}
if(l.tipo=='passagem'){x.fillStyle='#f4ece6';x.font='700 15px Georgia,serif';x.fillText('⇄',l.x,l.y+5)}
if(!temFase(l)&&l.tipo=='batalha'){x.fillStyle='#f4ece6';x.font='700 15px Georgia,serif';x.fillText('?',l.x,l.y+5)}}
x.font='700 19px "Alegreya SC",Georgia,serif';x.lineWidth=5;x.strokeStyle='rgba(232,214,176,.9)';x.strokeText(l.nome,l.x,l.y+38);x.fillStyle='#3a2414';x.fillText(l.nome,l.x,l.y+38);
if(venceu(l)){const m=melhor(l.fase);x.font='16px sans-serif';x.fillStyle='#a8741a';x.fillText('★'.repeat(m)+'☆'.repeat(3-m),l.x,l.y+58)}}

function pergaminho(x,t){x.fillStyle='#d8bd8a';x.fillRect(0,0,1280,720);
for(const m of PERG.manchas){const g=x.createRadialGradient(m.x,m.y,4,m.x,m.y,m.r);g.addColorStop(0,`rgba(120,80,30,${m.a})`);g.addColorStop(1,'rgba(120,80,30,0)');x.fillStyle=g;x.fillRect(m.x-m.r,m.y-m.r,m.r*2,m.r*2)}
// Linhas de rumo, como nas cartas náuticas antigas
x.strokeStyle='rgba(90,60,25,.16)';x.lineWidth=1;for(const[cx,cy]of[[150,180],[1100,560]])for(let n=0;n<16;n++){const a=n*Math.PI/8;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(a)*1600,cy+Math.sin(a)*1600);x.stroke()}
// Mar do Poente
x.fillStyle='rgba(92,110,112,.38)';x.beginPath();x.moveTo(0,330);x.bezierCurveTo(90,360,150,430,120,520);x.bezierCurveTo(100,600,170,660,330,720);x.lineTo(0,720);x.closePath();x.fill();
x.strokeStyle='rgba(60,40,20,.55)';x.lineWidth=2;x.stroke();
// Rio Salgueiro, que o vau atravessa
x.strokeStyle='rgba(80,105,110,.7)';x.lineWidth=7;x.beginPath();x.moveTo(560,0);x.bezierCurveTo(520,160,620,260,560,360);x.bezierCurveTo(500,460,470,520,390,600);x.bezierCurveTo(340,650,300,690,250,720);x.stroke();
x.strokeStyle='rgba(60,40,20,.35)';x.lineWidth=1.5;x.stroke();
// Serras e floresta
for(const m of PERG.serras){const s=26*m.s;x.fillStyle='rgba(110,80,45,.5)';x.beginPath();x.moveTo(m.x-s,m.y);x.lineTo(m.x,m.y-s*1.1);x.lineTo(m.x+s,m.y);x.closePath();x.fill();
x.strokeStyle='rgba(60,36,16,.7)';x.lineWidth=1.5;x.stroke();x.beginPath();x.moveTo(m.x,m.y-s*1.1);x.lineTo(m.x+s*.25,m.y);x.stroke()}
for(const a of PERG.arvores){const s=9*a.s;x.strokeStyle='rgba(60,36,16,.6)';x.lineWidth=1.5;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(a.x,a.y-s*1.4);x.stroke();
x.fillStyle='rgba(95,90,80,.55)';x.beginPath();x.arc(a.x,a.y-s*1.6,s,0,7);x.fill();x.stroke()}
// Rosa dos ventos
x.save();x.translate(150,180);for(let n=0;n<8;n++){x.rotate(Math.PI/4);x.fillStyle=n%2?'rgba(140,90,40,.55)':'rgba(70,45,20,.65)';x.beginPath();x.moveTo(0,0);x.lineTo(8,0);x.lineTo(0,n%2?-38:-58);x.lineTo(-8,0);x.closePath();x.fill()}x.restore();
x.fillStyle='rgba(70,45,20,.7)';x.font='700 16px Georgia,serif';x.textAlign='center';x.fillText('N',150,108);
// Nomes das regiões
x.fillStyle='rgba(70,45,20,.42)';x.font='italic 700 54px "Alegreya SC",Georgia,serif';x.fillText('V a l d r e n',700,120);
x.font='italic 22px "Alegreya Sans",Georgia,serif';x.fillText('Mar do Poente',95,450);x.fillText('Serra do Ocaso',1010,600);x.fillText('Rio Salgueiro',640,250);x.fillText('Montes Pálidos',420,105)}
