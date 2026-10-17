// ===================== SOM: MÚSICA E EFEITOS =====================
// Tudo gerado pelo código em tempo real (Web Audio), no mesmo esquema do Crepúsculo dos Reinos.
// O navegador só libera o som depois do primeiro clique ou tecla: até lá nada toca.
// Botão Som no topo: ligado (música e efeitos), só efeitos ou desligado. Fica salvo em rdc.som.
let AC=null,MESTRE=null,MUSG=null,SFXG=null;
const MODOS_SOM=[['tudo','Som: ligado'],['efeitos','Som: só efeitos'],['nada','Som: desligado']];
let MODO_SOM='tudo';try{const m=localStorage.getItem('rdc.som');if(MODOS_SOM.some(a=>a[0]==m))MODO_SOM=m}catch(e){}
const nomeModo=()=>MODOS_SOM.find(a=>a[0]==MODO_SOM)[1];
function iniciaSom(){if(AC){if(AC.state=='suspended')AC.resume();return}try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return}
MESTRE=AC.createGain();MESTRE.connect(AC.destination);MUSG=AC.createGain();MUSG.connect(MESTRE);SFXG=AC.createGain();SFXG.connect(MESTRE);aplicaModo();setInterval(agenda,100)}
function aplicaModo(){if(!AC)return;const t=AC.currentTime;MUSG.gain.setTargetAtTime(MODO_SOM=='tudo'?.8:0,t,.3);SFXG.gain.setTargetAtTime(MODO_SOM=='nada'?0:1,t,.1)}
function trocaModo(){const i=MODOS_SOM.findIndex(a=>a[0]==MODO_SOM);MODO_SOM=MODOS_SOM[(i+1)%MODOS_SOM.length][0];try{localStorage.setItem('rdc.som',MODO_SOM)}catch(e){}iniciaSom();aplicaModo();return nomeModo()}

// ---------- Música ----------
// Mesmo formato das trilhas do Crepúsculo: bpm, raiz (Hz), escala (semitons), acordes (grau por compasso),
// camadas pad, baixo, arpejo e melodia ([grau, colcheias]; null = pausa) e amb (som de ambiente).
const MUSICAS={
dia:{bpm:92,raiz:196,escala:[0,2,4,5,7,9,11],acordes:[0,3,4,0,5,3,4,4],
 pad:{forma:'sine',vol:.03,filtro:1600},baixo:{vol:.08,padrao:[1,0,0,0,1,0,0,0],dur:3},
 arpejo:{forma:'triangle',vol:.035,oitava:1,padrao:[0,2,4,2,7,4,2,4]},
 melodia:{forma:'sine',vol:.045,oitava:2,vibrato:true,frase:[[4,2],[5,1],[4,1],[2,2],[0,2],[1,2],[2,2],[4,4],[null,2],[5,2],[4,2],[2,2],[1,4],[0,6],[null,2]]},amb:'passaros'},
noite:{bpm:64,raiz:146.83,escala:[0,2,3,5,7,8,10],acordes:[0,5,3,4],
 pad:{forma:'sine',vol:.035,filtro:900},arpejo:{forma:'triangle',vol:.025,oitava:1,padrao:[0,null,4,null,2,null,4,null]},
 melodia:{forma:'sine',vol:.04,oitava:2,eco:true,frase:[[4,4],[2,4],[3,2],[1,2],[0,8],[null,4]]},amb:'grilos'}};
let MUS=null;
// Troca de trilha com transição suave (a antiga some enquanto a nova entra).
function tocar(nome){if(!AC||!MUSICAS[nome]||MUS&&MUS.nome==nome)return;const t=AC.currentTime;
if(MUS){MUS.g.gain.cancelScheduledValues(t);MUS.g.gain.setTargetAtTime(.0001,t,.8);MUS.acabou=true}
const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(1,t+3);g.connect(MUSG);MUS={nome,m:MUSICAS[nome],g,i:0,nt:t+.1,mi:0,resta:0}}
function agenda(){if(!AC||!MUS)return;const lim=AC.currentTime+.6;while(MUS.nt<lim)passo(MUS)}
const freq=(m,g,oit=0)=>{const L=m.escala.length,o=Math.floor(g/L),s=m.escala[((g%L)+L)%L]+12*o;return m.raiz*Math.pow(2,s/12+oit)};
function nota(dest,f,t,d,forma,vol,filtro,ataque=.012,vibrato){const o=AC.createOscillator(),gn=AC.createGain();o.type=forma||'triangle';o.frequency.setValueAtTime(f,t);
if(vibrato){const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=5.5;lg.gain.value=f*.006;l.connect(lg).connect(o.frequency);l.start(t);l.stop(t+d+.05)}
gn.gain.setValueAtTime(.0001,t);gn.gain.linearRampToValueAtTime(vol,t+ataque);gn.gain.exponentialRampToValueAtTime(.0001,t+d);
let saida=o;if(filtro){const fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=filtro;o.connect(fl);saida=fl}saida.connect(gn).connect(dest);o.start(t);o.stop(t+d+.05)}
// Ruído filtrado (chiado): base dos sons de madeira, serra, água e fogo
function chiado(dest,t,d,vol,tipo,fr){const n=Math.max(1,Math.floor(AC.sampleRate*d)),b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;
const s=AC.createBufferSource(),f=AC.createBiquadFilter(),gn=AC.createGain();s.buffer=b;f.type=tipo;f.frequency.value=fr;gn.gain.setValueAtTime(vol,t);gn.gain.exponentialRampToValueAtTime(.0001,t+d);
s.connect(f).connect(gn).connect(dest);s.start(t)}
// Piado de pássaro: um assobio que sobe e desce rápido
function piado(dest,t,f,vol){const o=AC.createOscillator(),gn=AC.createGain();o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*1.35,t+.05);o.frequency.exponentialRampToValueAtTime(f*.9,t+.11);
gn.gain.setValueAtTime(.0001,t);gn.gain.linearRampToValueAtTime(vol,t+.01);gn.gain.exponentialRampToValueAtTime(.0001,t+.12);o.connect(gn).connect(dest);o.start(t);o.stop(t+.15)}
// Um passo = uma colcheia: toca o que cada camada tem naquele instante.
function passo(a){const m=a.m,c=60/m.bpm/2,i=a.i,k=i%8,bar=Math.floor(i/8),ac=m.acordes[bar%m.acordes.length],t=a.nt,G=a.g;
if(k==0&&m.pad)for(const d of[0,2,4])nota(G,freq(m,ac+d,m.pad.oitava||0),t,c*8*.98,m.pad.forma||'sawtooth',m.pad.vol,m.pad.filtro,.45);
if(m.baixo&&m.baixo.padrao[k])nota(G,freq(m,ac,-1),t,c*(m.baixo.dur||1.6),m.baixo.forma||'triangle',m.baixo.vol,m.baixo.filtro);
if(m.arpejo&&m.arpejo.padrao[k]!=null)nota(G,freq(m,ac+m.arpejo.padrao[k],m.arpejo.oitava||1),t,c*.9,m.arpejo.forma,m.arpejo.vol);
if(m.melodia){if(a.resta<=0){const[gr,du]=m.melodia.frase[a.mi%m.melodia.frase.length];a.mi++;a.resta=du;
if(gr!=null){const f=freq(m,gr,m.melodia.oitava||1),dd=c*du*.95,M=m.melodia;nota(G,f,t,dd,M.forma,M.vol,M.filtro,.02,M.vibrato);
if(M.eco){nota(G,f,t+c*3,dd,M.forma,M.vol*.4,M.filtro);nota(G,f,t+c*6,dd,M.forma,M.vol*.16,M.filtro)}}}a.resta--}
if(m.amb=='passaros'&&Math.random()<.1){const f=2400+Math.random()*1400,n=1+Math.floor(Math.random()*3);for(let j=0;j<n;j++)piado(G,t+j*.14+Math.random()*c,f,.025)}
if(m.amb=='grilos'&&k%2==0&&Math.random()<.7)for(let j=0;j<3;j++)nota(G,4300,t+j*.05,.03,'sine',.012,null,.003);
a.i++;a.nt+=c}

// ---------- Efeitos ----------
// som(tipo, volume 0 a 1, pan -1 esquerda a 1 direita). O mesmo efeito não repete em menos de 80 ms.
const EFEITOS={
machado:(d,t)=>{chiado(d,t,.09,.5,'bandpass',420);nota(d,170,t,.12,'triangle',.25)},
picareta:(d,t)=>{nota(d,1900,t,.18,'square',.04,4000,.002);nota(d,2600,t,.12,'sine',.07,null,.002);chiado(d,t,.05,.22,'highpass',3000)},
martelo:(d,t)=>{nota(d,1300,t,.25,'sine',.1,null,.002);nota(d,1950,t,.15,'sine',.05,null,.002);chiado(d,t,.03,.25,'bandpass',2500)},
serra:(d,t)=>{for(let i=0;i<4;i++)chiado(d,t+i*.16,.12,.16,'bandpass',1800+i%2*500)},
pa:(d,t)=>chiado(d,t,.15,.35,'lowpass',700),
foice:(d,t)=>chiado(d,t,.16,.22,'highpass',2800),
pesca:(d,t)=>chiado(d,t,.3,.25,'lowpass',900),
respingo:(d,t)=>{chiado(d,t,.22,.2,'lowpass',1400);nota(d,700,t,.08,'sine',.03)},
queda:(d,t)=>{chiado(d,t,.5,.3,'bandpass',900);chiado(d,t+.45,.6,.55,'lowpass',380);nota(d,80,t+.45,.5,'sine',.35)},
forja:(d,t)=>{chiado(d,t,.8,.18,'lowpass',380);nota(d,1500,t+.3,.2,'sine',.04,null,.002)},
moinho:(d,t)=>nota(d,190,t,.6,'sawtooth',.03,420,.2),
sino:(d,t)=>{for(const[f,v]of[[784,.12],[1176,.06],[1568,.05],[2350,.025]])nota(d,f,t,2.2,'sine',v,null,.003)},
nasce:(d,t)=>[523.25,659.25,783.99].forEach((f,i)=>nota(d,f,t+i*.1,.8,'sine',.08,null,.005)),
construir:(d,t)=>{nota(d,330,t,.12,'triangle',.12);nota(d,440,t+.08,.15,'triangle',.1)},
estrada:(d,t)=>{chiado(d,t,.12,.18,'lowpass',900);nota(d,520,t+.05,.08,'triangle',.06)},
erro:(d,t)=>{nota(d,180,t,.2,'square',.04,800);nota(d,140,t+.1,.25,'square',.04,800)},
espada:(d,t)=>{nota(d,2200,t,.22,'square',.04,5000,.001);nota(d,3100,t,.15,'sine',.06,null,.001);chiado(d,t,.06,.3,'highpass',4000)},
corneta:(d,t)=>[[220,0],[220,.25],[293.66,.5]].forEach(([f,o])=>{nota(d,f,t+o,o<.5?.22:.7,'sawtooth',.07,1400,.03);nota(d,f*1.5,t+o,o<.5?.22:.7,'sawtooth',.03,1400,.03)}),
vitoria:(d,t)=>[523.25,659.25,783.99,1046.5].forEach((f,i)=>{nota(d,f,t+i*.15,i==3?1.4:.3,'square',.06,2400,.01);nota(d,f/2,t+i*.15,i==3?1.4:.3,'triangle',.08)}),
derrota:(d,t)=>[392,349.23,311.13,261.63].forEach((f,i)=>nota(d,f,t+i*.35,i==3?1.6:.4,'triangle',.1))};
const ULT_SOM={};
function som(tipo,vol=1,pan=0){if(!AC||MODO_SOM=='nada'||vol<=.02||!EFEITOS[tipo])return;const agora=AC.currentTime;if(agora-(ULT_SOM[tipo]||0)<.08)return;ULT_SOM[tipo]=agora;
const g=AC.createGain();g.gain.value=Math.min(1,vol);if(AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan));g.connect(p).connect(SFXG)}else g.connect(SFXG);
EFEITOS[tipo](g,agora+.01)}
addEventListener('pointerdown',iniciaSom);addEventListener('keydown',iniciaSom);
