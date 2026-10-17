// ===================== MÚSICA =====================
// Todas as músicas são compostas pelo código, em tempo real (Web Audio). Cada trilha é só dados:
// bpm: andamento · raiz: nota base (Hz) · escala: semitons a partir da raiz · acordes: grau de cada compasso (tríade)
// camadas opcionais: pad (acorde longo), baixo, arpejo e melodia (frase em [grau, duração em colcheias]; null = pausa)
// perc: padrões de 8 colcheias para bumbo, caixa, chimbal e tom · amb: som de ambiente (vento, brasas, gotas, coracao)
// compassos: só para trilhas que tocam uma vez (vitória, derrota...). Sem compassos, a trilha repete.
// Cada fase escolhe a trilha pelo campo musica (ver fases/).
const MUSICAS={
titulo:{bpm:66,raiz:146.83,escala:[0,2,3,5,7,8,10],acordes:[0,5,3,4],
 pad:{vol:.035,filtro:1100},baixo:{vol:.12,padrao:[1,0,0,0,0,0,0,0],dur:6},
 arpejo:{forma:'triangle',vol:.045,oitava:1,padrao:[0,2,4,7,4,2,0,2]},
 melodia:{forma:'sine',vol:.07,oitava:2,frase:[[4,4],[3,2],[2,2],[1,4],[0,4],[2,3],[3,1],[4,4],[5,4],[4,8]]}},
mapa:{bpm:96,raiz:174.61,escala:[0,2,4,5,7,9,11],acordes:[0,4,5,3],
 pad:{vol:.025,filtro:1400},baixo:{vol:.11,padrao:[1,0,0,0,1,0,0,0]},
 melodia:{forma:'sine',vol:.075,oitava:2,vibrato:true,frase:[[0,2],[2,2],[4,4],[5,2],[4,2],[2,4],[3,2],[4,2],[2,2],[1,2],[0,8]]},
 perc:{bumbo:[1,0,0,0,1,0,0,0],chimbal:[0,1,0,1,0,1,0,1]}},
vila:{bpm:84,raiz:130.81,escala:[0,2,4,5,7,9,11],acordes:[0,3,4,0],
 baixo:{vol:.09,padrao:[1,0,0,0,1,0,0,0],dur:3},arpejo:{forma:'triangle',vol:.05,oitava:1,padrao:[0,2,4,2,7,2,4,2]},
 melodia:{forma:'sine',vol:.05,oitava:2,frase:[[4,2],[5,2],[4,2],[2,2],[0,4],[1,2],[2,2],[1,8]]}},
vau:{bpm:108,raiz:110,escala:[0,2,3,5,7,8,10],acordes:[0,6,5,4],
 pad:{vol:.02,filtro:900},baixo:{vol:.12,padrao:[1,0,1,0,1,0,1,1]},
 melodia:{forma:'square',vol:.035,oitava:2,filtro:1800,frase:[[0,2],[0,1],[2,1],[4,2],[3,2],[2,2],[1,2],[0,4],[4,2],[5,2],[6,2],[4,6]]},
 perc:{bumbo:[1,0,0,0,1,0,0,0],caixa:[0,0,1,0,0,0,1,1],chimbal:[1,0,1,0,1,0,1,0]}},
cinzas:{bpm:72,raiz:82.41,escala:[0,1,3,5,7,8,10],acordes:[0,1,0,5],
 pad:{vol:.03,filtro:500},baixo:{vol:.13,padrao:[1,0,0,0,0,0,1,0],dur:4},
 melodia:{forma:'sine',vol:.06,oitava:3,frase:[[null,4],[4,2],[null,2],[1,4],[null,4],[0,8]]},
 perc:{tom:[1,0,0,0,0,0,0,0]},amb:'brasas'},
ocaso:{bpm:116,raiz:146.83,escala:[0,2,3,5,7,9,10],acordes:[0,6,3,0],
 pad:{vol:.025,filtro:1200},baixo:{vol:.12,padrao:[1,0,1,0,1,0,1,0]},
 melodia:{forma:'sawtooth',vol:.03,oitava:2,filtro:1500,frase:[[0,2],[4,2],[5,2],[6,2],[7,4],[6,2],[4,2],[5,4],[3,4],[4,8]]},
 perc:{bumbo:[1,0,0,0,1,0,0,0],caixa:[0,0,0,0,1,0,0,0],tom:[1,0,0,1,0,1,0,0]},amb:'vento'},
lago:{bpm:60,raiz:196,escala:[0,2,4,6,8,10],acordes:[0,1,0,4],
 pad:{forma:'sine',vol:.035,filtro:2000},
 melodia:{forma:'sine',vol:.06,oitava:2,eco:true,frase:[[0,3],[2,1],[4,4],[3,2],[1,2],[5,4],[null,4]]},amb:'gotas'},
catacumbas:{bpm:52,raiz:61.74,escala:[0,1,3,5,6,8,10],acordes:[0,0,1,0],
 pad:{vol:.05,filtro:380},
 melodia:{forma:'square',vol:.03,oitava:2,filtro:700,frase:[[null,6],[4,2],[null,4],[3,2],[null,2],[1,8]]},amb:'coracao'},
// Gelheim (Ato III): cristais de gelo no arpejo e vento constante; a fortaleza é mais tensa.
gelo:{bpm:100,raiz:164.81,escala:[0,2,3,5,7,8,10],acordes:[0,5,6,4],
 pad:{forma:'sine',vol:.03,filtro:2400},baixo:{vol:.1,padrao:[1,0,0,1,0,0,1,0],dur:2},
 arpejo:{forma:'triangle',vol:.035,oitava:2,padrao:[0,4,7,4,9,4,7,4]},
 melodia:{forma:'sine',vol:.06,oitava:2,eco:true,frase:[[4,2],[3,2],[2,4],[0,2],[2,2],[3,4],[4,2],[6,2],[5,8]]},
 perc:{bumbo:[1,0,0,0,1,0,0,0],chimbal:[0,0,1,0,0,0,1,0]},amb:'vento'},
inverno:{bpm:124,raiz:146.83,escala:[0,1,3,5,7,8,10],acordes:[0,1,5,4],
 pad:{vol:.03,filtro:900},baixo:{forma:'sawtooth',vol:.06,filtro:700,padrao:[1,0,1,1,1,0,1,1]},
 arpejo:{forma:'triangle',vol:.03,oitava:2,padrao:[0,3,7,10,7,3,0,3]},
 melodia:{forma:'square',vol:.035,oitava:2,filtro:1800,frase:[[0,2],[1,1],[0,1],[4,4],[3,2],[1,2],[0,4],[5,2],[4,2],[3,8]]},
 perc:{bumbo:[1,0,0,1,1,0,0,0],caixa:[0,0,1,0,0,0,1,0],tom:[0,0,0,0,0,1,0,1]},amb:'vento'},
// Areth (Ato III): escala do deserto com segunda aumentada; a pirâmide é marcial e sombria.
deserto:{bpm:96,raiz:146.83,escala:[0,1,4,5,7,8,10],acordes:[0,1,0,6],
 pad:{forma:'sine',vol:.03,filtro:1600},baixo:{vol:.11,padrao:[1,0,0,1,0,0,1,0],dur:2},
 arpejo:{forma:'triangle',vol:.03,oitava:1,padrao:[0,1,2,1,4,2,1,0]},
 melodia:{forma:'sine',vol:.065,oitava:2,vibrato:true,frase:[[4,2],[3,1],[2,1],[1,2],[2,2],[3,4],[2,2],[1,2],[0,8]]},
 perc:{bumbo:[1,0,0,1,0,0,1,0],tom:[0,0,1,0,0,1,0,1]},amb:'vento'},
piramide:{bpm:120,raiz:110,escala:[0,1,4,5,7,8,10],acordes:[0,1,5,4],
 pad:{forma:'square',vol:.025,filtro:900},baixo:{forma:'sawtooth',vol:.07,filtro:700,padrao:[1,0,1,0,1,1,1,0]},
 arpejo:{forma:'triangle',vol:.03,oitava:2,padrao:[0,2,4,6,4,2,1,0]},
 melodia:{forma:'square',vol:.035,oitava:2,filtro:2000,frase:[[0,2],[1,2],[4,4],[3,2],[1,2],[0,4],[5,2],[4,1],[3,1],[1,8]]},
 perc:{bumbo:[1,0,0,1,1,0,0,1],caixa:[0,0,1,0,0,0,1,0],tom:[0,1,0,0,0,1,0,0]},amb:'coracao'},
// Maré-Alta (Ato III): balanço de mar em ritmo de 3, e o Kraken com tambores fundos.
mar:{bpm:112,raiz:130.81,escala:[0,2,3,5,7,8,10],acordes:[0,5,3,6],
 pad:{forma:'sine',vol:.03,filtro:1500},baixo:{vol:.11,padrao:[1,0,0,1,0,0,1,0],dur:2},
 arpejo:{forma:'triangle',vol:.035,oitava:1,padrao:[0,2,4,2,0,2,4,2]},
 melodia:{forma:'square',vol:.035,oitava:2,filtro:1700,frase:[[0,2],[2,1],[4,1],[5,2],[4,2],[2,2],[3,2],[1,2],[0,6],[null,2]]},
 perc:{bumbo:[1,0,0,1,0,0,1,0],chimbal:[0,1,1,0,1,1,0,1]},amb:'gotas'},
kraken:{bpm:84,raiz:73.42,escala:[0,1,3,5,6,8,10],acordes:[0,1,0,5],
 pad:{vol:.045,filtro:600},baixo:{forma:'sawtooth',vol:.08,filtro:500,padrao:[1,0,0,0,1,0,1,0],dur:3},
 arpejo:{forma:'triangle',vol:.025,oitava:2,padrao:[0,1,3,1,0,1,4,1]},
 melodia:{forma:'square',vol:.035,oitava:2,filtro:1200,frase:[[0,4],[1,2],[0,2],[4,4],[3,4],[1,2],[0,2],[null,4]]},
 perc:{bumbo:[1,0,0,1,0,0,0,0],tom:[0,0,1,0,0,1,1,0]},amb:'coracao'},
// Ato IV: a Cidadela (coral sombrio e marcha) e a batalha final contra Ozrath (épica e rápida).
cidadela:{bpm:90,raiz:110,escala:[0,2,3,5,7,8,11],acordes:[0,5,3,4],
 pad:{forma:'sine',vol:.045,filtro:900},baixo:{forma:'sawtooth',vol:.06,filtro:600,padrao:[1,0,0,0,1,0,1,0],dur:3},
 arpejo:{forma:'triangle',vol:.03,oitava:2,padrao:[0,2,4,7,4,2,0,2]},
 melodia:{forma:'sine',vol:.065,oitava:2,eco:true,frase:[[4,4],[3,2],[2,2],[1,4],[2,4],[4,2],[5,2],[6,4],[4,8]]},
 perc:{bumbo:[1,0,0,0,1,0,0,0],tom:[0,0,0,1,0,0,1,0]},amb:'vento'},
eclipse:{bpm:144,raiz:110,escala:[0,1,3,5,7,8,11],acordes:[0,1,5,6],
 pad:{vol:.03,filtro:1200},baixo:{forma:'sawtooth',vol:.075,filtro:900,padrao:[1,1,1,1,1,1,1,1]},
 arpejo:{forma:'square',vol:.025,oitava:2,padrao:[0,2,4,6,7,6,4,2]},
 melodia:{forma:'square',vol:.042,oitava:2,filtro:2400,frase:[[0,1],[1,1],[4,2],[3,1],[4,1],[6,2],[7,2],[6,1],[4,1],[3,2],[1,2],[0,4]]},
 perc:{bumbo:[1,0,1,0,1,0,1,1],caixa:[0,0,1,0,0,0,1,0],chimbal:[1,1,1,1,1,1,1,1],tom:[0,0,0,0,0,0,0,1]}},
trono:{bpm:80,raiz:130.81,escala:[0,2,3,5,7,8,11],acordes:[0,5,3,4],
 pad:{forma:'square',vol:.03,filtro:1400},baixo:{vol:.13,padrao:[1,0,0,0,1,0,0,0],dur:3},
 melodia:{forma:'sine',vol:.065,oitava:2,frase:[[4,6],[3,2],[5,8],[3,6],[2,2],[6,8]]},
 perc:{bumbo:[1,0,0,0,1,0,1,0],caixa:[0,0,1,0,0,0,1,0],tom:[0,0,0,0,0,0,0,1]}},
chefe:{bpm:138,raiz:130.81,escala:[0,2,3,5,7,8,11],acordes:[0,5,6,4],
 pad:{vol:.02,filtro:1000},baixo:{forma:'sawtooth',vol:.07,filtro:800,padrao:[1,1,1,1,1,1,1,1]},
 arpejo:{forma:'square',vol:.02,oitava:2,padrao:[0,2,4,6,4,2,0,2]},
 melodia:{forma:'square',vol:.04,oitava:2,filtro:2200,frase:[[0,1],[0,1],[6,1],[0,1],[4,2],[3,2],[2,1],[3,1],[2,1],[1,1],[0,4]]},
 perc:{bumbo:[1,0,1,0,1,0,1,0],caixa:[0,0,1,0,0,0,1,0],chimbal:[1,1,1,1,1,1,1,1]}},
vitoria:{bpm:120,raiz:130.81,escala:[0,2,4,5,7,9,11],acordes:[0,3,4,0],compassos:3,
 pad:{vol:.03,filtro:1800},melodia:{forma:'square',vol:.05,oitava:2,filtro:2400,frase:[[0,1],[2,1],[4,1],[7,3],[5,1],[7,1],[9,6],[7,2],[11,8]]},
 perc:{bumbo:[1,0,0,0,1,0,0,0],caixa:[0,0,1,0,0,0,1,1]}},
derrota:{bpm:60,raiz:110,escala:[0,2,3,5,7,8,10],acordes:[0,3,4,0],compassos:3,
 pad:{vol:.03,filtro:700},melodia:{forma:'triangle',vol:.07,oitava:1,frase:[[4,4],[3,4],[2,4],[1,4],[0,8]]}},
celestial:{bpm:70,raiz:146.83,escala:[0,2,4,5,7,9,11],acordes:[0,3,4,0],compassos:4,
 pad:{forma:'sine',vol:.05,oitava:1,filtro:3000},arpejo:{forma:'sine',vol:.035,oitava:3,padrao:[0,4,7,4,0,4,7,9]},
 melodia:{forma:'sine',vol:.07,oitava:2,frase:[[0,4],[2,4],[4,4],[7,8],[6,4],[4,8]]}}};

let MUS={desejada:null,atual:null,mestre:null,timer:null,vol:1,abafa:1};
try{const v=+localStorage.getItem('cdr.vol');if(localStorage.getItem('cdr.vol')!==null)MUS.vol=v}catch(e){}
const NIVEIS_VOL=[[1,'alta'],[.6,'média'],[.3,'baixa'],[0,'desligada']];
const nomeVol=()=>(NIVEIS_VOL.find(([v])=>Math.abs(v-MUS.vol)<.01)||NIVEIS_VOL[0])[1];
function proxVol(){const i=NIVEIS_VOL.findIndex(([v])=>Math.abs(v-MUS.vol)<.01);MUS.vol=NIVEIS_VOL[(i+1)%NIVEIS_VOL.length][0];
try{localStorage.setItem('cdr.vol',MUS.vol)}catch(e){}aplicaVol()}
function garanteMestre(){if(!MUS.mestre){MUS.mestre=AC.createGain();MUS.mestre.connect(AC.destination)}aplicaVol()}
function aplicaVol(){if(MUS.mestre&&AC)MUS.mestre.gain.setTargetAtTime(MUS.vol*MUS.abafa,AC.currentTime,.25)}
// Troca de trilha com transição suave (a antiga some enquanto a nova entra).
function tocar(nome,forcar){MUS.desejada=nome;if(!on||!AC||!MUSICAS[nome])return;if(MUS.atual&&MUS.atual.nome==nome&&!forcar&&!MUS.atual.acabou)return;
garanteMestre();if(MUS.atual)some(MUS.atual);const g=AC.createGain(),t=AC.currentTime;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(1,t+1.2);g.connect(MUS.mestre);
MUS.atual={nome,m:MUSICAS[nome],g,i:0,nt:t+.08,mi:0,resta:0};if(!MUS.timer)MUS.timer=setInterval(agenda,100)}
function some(inst){const t=AC.currentTime;inst.g.gain.cancelScheduledValues(t);inst.g.gain.setTargetAtTime(.0001,t,.35);inst.acabou=true}
function paraMusica(){if(MUS.atual&&AC)some(MUS.atual);MUS.atual=null}
function abafa(sim){MUS.abafa=sim?.35:1;aplicaVol()}
function agenda(){const a=MUS.atual;if(!on||!AC||!a||a.acabou)return;const lim=AC.currentTime+.6;
while(a.nt<lim){passo(a);if(a.m.compassos&&a.i>=a.m.compassos*8){a.acabou=true;break}}}

const freq=(m,g,oit=0)=>{const L=m.escala.length,o=Math.floor(g/L),s=m.escala[((g%L)+L)%L]+12*o;return m.raiz*Math.pow(2,s/12+oit)};
function nota(dest,f,t,d,forma,vol,filtro,ataque=.012,vibrato){const o=AC.createOscillator(),gn=AC.createGain();o.type=forma||'triangle';o.frequency.setValueAtTime(f,t);
if(vibrato){const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=5.5;lg.gain.value=f*.006;l.connect(lg).connect(o.frequency);l.start(t);l.stop(t+d+.05)}
gn.gain.setValueAtTime(.0001,t);gn.gain.linearRampToValueAtTime(vol,t+ataque);gn.gain.exponentialRampToValueAtTime(.0001,t+d);
let saida=o;if(filtro){const fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=filtro;o.connect(fl);saida=fl}saida.connect(gn).connect(dest);o.start(t);o.stop(t+d+.05)}
function ruido(dest,t,d,vol,tipo,fr){const n=Math.max(1,Math.floor(AC.sampleRate*d)),b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;
const s=AC.createBufferSource(),f=AC.createBiquadFilter(),gn=AC.createGain();s.buffer=b;f.type=tipo;f.frequency.value=fr;gn.gain.setValueAtTime(vol,t);gn.gain.exponentialRampToValueAtTime(.0001,t+d);
s.connect(f).connect(gn).connect(dest);s.start(t)}
function bumbo(dest,t,vol){const o=AC.createOscillator(),gn=AC.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.18);
gn.gain.setValueAtTime(vol,t);gn.gain.exponentialRampToValueAtTime(.0001,t+.22);o.connect(gn).connect(dest);o.start(t);o.stop(t+.25)}
// Um passo = uma colcheia: toca o que cada camada tem naquele instante.
function passo(a){const m=a.m,c=60/m.bpm/2,i=a.i,k=i%8,bar=Math.floor(i/8),ac=m.acordes[bar%m.acordes.length],t=a.nt,G=a.g;
if(k==0&&m.pad)for(const d of[0,2,4])nota(G,freq(m,ac+d,m.pad.oitava||0),t,c*8*.98,m.pad.forma||'sawtooth',m.pad.vol,m.pad.filtro,.45);
if(m.baixo&&m.baixo.padrao[k])nota(G,freq(m,ac,-1),t,c*(m.baixo.dur||1.6),m.baixo.forma||'triangle',m.baixo.vol,m.baixo.filtro);
if(m.arpejo&&m.arpejo.padrao[k]!=null)nota(G,freq(m,ac+m.arpejo.padrao[k],m.arpejo.oitava||1),t,c*.9,m.arpejo.forma,m.arpejo.vol);
if(m.melodia){if(a.resta<=0){const[gr,du]=m.melodia.frase[a.mi%m.melodia.frase.length];a.mi++;a.resta=du;
if(gr!=null){const f=freq(m,gr,m.melodia.oitava||1),dd=c*du*.95,M=m.melodia;nota(G,f,t,dd,M.forma,M.vol,M.filtro,.02,M.vibrato);
if(M.eco){nota(G,f,t+c*3,dd,M.forma,M.vol*.4,M.filtro);nota(G,f,t+c*6,dd,M.forma,M.vol*.16,M.filtro)}}}a.resta--}
const P2=m.perc;if(P2){if(P2.bumbo&&P2.bumbo[k])bumbo(G,t,.32);if(P2.caixa&&P2.caixa[k])ruido(G,t,.12,.13,'highpass',1500);
if(P2.chimbal&&P2.chimbal[k])ruido(G,t,.04,.05,'highpass',7000);if(P2.tom&&P2.tom[k])nota(G,90,t,.3,'sine',.22)}
if(m.amb=='vento'&&k==0&&bar%2==0)ruido(G,t,c*16,.035,'bandpass',500+Math.random()*400);
if(m.amb=='brasas'&&Math.random()<.35)ruido(G,t+Math.random()*c,.03,.06,'highpass',3000);
if(m.amb=='gotas'&&Math.random()<.2){const f=1200+Math.random()*1200;nota(G,f,t+Math.random()*c,.25,'sine',.04)}
if(m.amb=='coracao'&&k==0){bumbo(G,t,.3);bumbo(G,t+c*.6,.2)}
a.i++;a.nt+=c}
// Efeitos curtos por cima da trilha: 'tensao' (fala de inimigo) e 'aurora' (invocação).
function vinheta(tipo){if(!on||!AC)return;garanteMestre();const t=AC.currentTime,D=MUS.mestre;
if(tipo=='tensao'){nota(D,55,t,1.4,'sawtooth',.09,400,.15);nota(D,58.27,t,1.4,'sawtooth',.07,400,.15);ruido(D,t,1,.05,'lowpass',300)}
if(tipo=='aurora')[523.25,659.25,783.99,1046.5,1318.5,1568].forEach((f,i)=>{nota(D,f,t+i*.12,1.2,'sine',.09);nota(D,f*2,t+i*.12+.06,.6,'sine',.03)})}
// O jogo abre na abertura: se o som for ligado ali, começa pelo tema do título.
if(!MUS.desejada)MUS.desejada='titulo';
