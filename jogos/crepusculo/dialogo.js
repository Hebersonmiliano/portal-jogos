// ===================== DIÁLOGOS =====================
// As falas ficam em cada fase, no campo falas: { evento: [[quem, texto], ...] }.
// Eventos: 'inicio', 'vitoria', 'derrota', 'acorda:<nome>' (inimigo entra na luta), 'ferido:<nome>' (fica com menos da metade do HP).
// quem: 'heroi0', 'heroi1', 'heroi2' (heróis do grupo), o nome de uma unidade da batalha, ou 'dica' (caixa de ajuda).
// tutorial (opcional): falas extras mostradas só na primeira vez que alguém joga a fase.
let FILA=[],DLG=null;
const falasDe=ev=>(F&&!LIVRE&&F.falas&&F.falas[ev])||[];
function evento(ev){const l=falasDe(ev);if(l.length)FILA.push(...l)}
function quemFala(q){if(q=='dica')return null;const m=/^heroi(\d)$/.exec(q);
if(m){const i=+m[1];return U.find(u=>u.hi===i)||U.filter(u=>!u.team)[i]||null}return U.find(u=>u.name==q)||null}
function dialogo(lista,depois){if(window.SEM_DIALOGO||!lista.length){depois();return}
DLG={lista,i:0,depois,txt:'',pos:0};$('dlg').hidden=false;if(typeof abafa=='function')abafa(true);mostraFala();ui()}
function mostraFala(){const[q,t]=DLG.lista[DLG.i],u=quemFala(q),c=$('dret'),x=c.getContext('2d');
x.clearRect(0,0,c.width,c.height);x.imageSmoothingEnabled=false;x.fillStyle=u?(u.team?'#5a2430':'#24405a'):'#5a4a24';x.fillRect(0,0,c.width,c.height);
if(u)x.drawImage(spr(u,false),0,0,SPR_W,14,-4,4,80,62);else{x.font='40px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(q=='dica'?'💡':'🌑',36,38)}
$('dnm').textContent=q=='dica'?'Dica':u?u.name:q;$('dnm').className=u&&u.team?'en':'';
DLG.txt=t;DLG.pos=0;if(u&&u.team&&typeof vinheta=='function')vinheta('tensao');digita()}
function digita(){if(!DLG)return;DLG.pos=Math.min(DLG.txt.length,DLG.pos+2);$('dtx').textContent=DLG.txt.slice(0,DLG.pos);
if(DLG.pos<DLG.txt.length)setTimeout(digita,30)}
function avancaFala(){if(!DLG)return;if(DLG.pos<DLG.txt.length){DLG.pos=DLG.txt.length;$('dtx').textContent=DLG.txt;return}
DLG.i++;if(DLG.i<DLG.lista.length){mostraFala();return}const d=DLG.depois;DLG=null;$('dlg').hidden=true;if(typeof abafa=='function')abafa(false);d()}
document.getElementById('dlg').onclick=avancaFala;
addEventListener('keydown',e=>{if(!DLG||!ovl.hidden)return;if(e.key=='Enter'||e.key==' '||e.key=='Escape'){e.preventDefault();avancaFala()}});
