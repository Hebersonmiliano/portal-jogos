/* Composição original: “Depois da meia-noite”. 64 BPM, ré menor, 16 compassos.
   Piano suave, cama harmônica e baixo. Gerada localmente, sem serviços externos. */
(function(){
 'use strict';
 function createInvestigationScore(context){
  const rate=22050,beat=60/64,length=16*4*beat,count=Math.round(length*rate);
  const buffer=context.createBuffer(2,count,rate),left=buffer.getChannelData(0),right=buffer.getChannelData(1);
  const freq=n=>440*Math.pow(2,(n-69)/12);
  function tone(midi,start,duration,volume,kind,pan=0){
   const f=freq(midi),frames=Math.floor(duration*rate),offset=Math.round(start*rate);
   const l=Math.sqrt((1-pan)/2),r=Math.sqrt((1+pan)/2);
   for(let i=0;i<frames;i++){
    const t=i/rate,phase=2*Math.PI*f*t;
    let env,wave;
    if(kind==='piano'){
     env=(1-Math.exp(-t*100))*Math.exp(-t*1.8)*Math.min(1,(duration-t)/.3);
     wave=Math.sin(phase)+.24*Math.sin(phase*2.002)*Math.exp(-t*3)+.09*Math.sin(phase*3.006)*Math.exp(-t*5);
    }else if(kind==='pad'){
     env=Math.pow(Math.sin(Math.PI*t/duration),2);
     wave=.65*Math.sin(phase)+.22*Math.sin(phase*1.003)+.12*Math.sin(phase*2);
    }else{
     env=Math.min(1,t/.12)*Math.exp(-t*.85)*Math.min(1,(duration-t)/.3);
     wave=Math.sin(phase)+.12*Math.sin(phase*2);
    }
    const sample=wave*env*volume,index=(offset+i)%count;
    left[index]+=sample*l;right[index]+=sample*r;
   }
  }
  const chords=[[50,57,60,64],[46,53,57,60],[43,50,57,58],[45,52,55,61]];
  const motifs=[
   [[0,74],[1.5,77],[3,76]],[[.5,72],[2.5,69]],
   [[0,70],[2,69],[3.5,65]],[[1,69],[2.5,73]],
   [[0,74],[2,81],[3,77]],[[.5,76],[2.5,72]],
   [[0,70],[1.5,74],[3,69]],[[.5,73],[2,76]],
   [[0,77],[1.5,76],[3,74]],[[1,72],[3,69]],
   [[0,70],[2.5,65]],[[.5,69],[2,73],[3.5,76]],
   [[0,77],[2,74]],[[1,72],[3,69]],
   [[0,70],[2,69]],[[.5,73],[2,69]]
  ];
  for(let bar=0;bar<16;bar++){
   const chord=chords[bar%4],start=bar*4*beat;
   chord.forEach((note,j)=>tone(note,start,5.8,.026,'pad',(j-1.5)*.32));
   tone(chord[0]-12,start+.02,3.1,.075,'bass',0);
   // A figura repetida une os compassos, deixando espaço para leitura.
   [0,2].forEach((b,j)=>tone(chord[1+j]+12,start+b*beat+.035,2.8,.065,'piano',-.3));
   motifs[bar].forEach(([b,n],j)=>tone(n,start+b*beat,3.7,.12-(j%2)*.025,'piano',.24));
  }
  // Reflexos curtos e cruzados dão profundidade sem encobrir a melodia.
  const dryL=left.slice(),dryR=right.slice();
  for(let i=0;i<count;i++){
   const a=(i-Math.round(.29*rate)+count)%count,b=(i-Math.round(.53*rate)+count)%count;
   left[i]=dryL[i]+dryR[a]*.23+dryL[b]*.11;
   right[i]=dryR[i]+dryL[a]*.23+dryR[b]*.11;
  }
  const source=context.createBufferSource(),gain=context.createGain();
  source.buffer=buffer;source.loop=true;gain.gain.value=.7;
  source.connect(gain).connect(context.destination);source.start();
  return {setVolume(value){gain.gain.setTargetAtTime(Math.max(0,Math.min(1,value)),context.currentTime,.15);},duration:length};
 }
 window.createInvestigationScore=createInvestigationScore;
 // Cadência curta de descoberta: ré menor resolvendo em ré maior.
 window.playInvestigationSuccess=function(context){
  const start=context.currentTime+.04;
  const notes=[[74,0,.48],[77,.16,.48],[81,.32,.6],[86,.54,1.5],[66,.56,1.6],[69,.56,1.6],[74,.56,1.8]];
  notes.forEach(([midi,offset,duration],i)=>{
   const oscillator=context.createOscillator(),gain=context.createGain();
   oscillator.type='sine';oscillator.frequency.value=440*Math.pow(2,(midi-69)/12);
   const at=start+offset;
   gain.gain.setValueAtTime(0,at);
   gain.gain.linearRampToValueAtTime(i<4?.15:.07,at+.018);
   gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
   oscillator.connect(gain).connect(context.destination);
   oscillator.start(at);oscillator.stop(at+duration+.03);
  });
 };
})();
