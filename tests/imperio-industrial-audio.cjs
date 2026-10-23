const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const base=path.resolve(__dirname,'../jogos/imperio-industrial');
let plays=0,tones=0,contexts=0,block=false;const events={},elements=new Map();
class Music{constructor(src){this.src=src;this.paused=true;this.volume=0;} addEventListener(){}play(){plays++;if(block)return Promise.reject(Error('blocked'));this.paused=false;return Promise.resolve();}pause(){this.paused=true;}load(){}}
class AudioContext{constructor(){contexts++;this.state='suspended';this.currentTime=0;this.destination={};}resume(){this.state='running';return Promise.resolve();}suspend(){this.state='suspended';return Promise.resolve();}createOscillator(){tones++;return {frequency:{value:0},connect(){},start(){},stop(){},disconnect(){}};}createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}}
const ctx=vm.createContext({console,Math,JSON,Promise,Audio:Music,window:{AudioContext},document:{hidden:false,addEventListener:(k,f)=>{events[k]=f;}},localStorage:{getItem(){return null;},setItem(){}},$:id=>{if(!elements.has(id))elements.set(id,{textContent:'',setAttribute(){},addEventListener(){}});return elements.get(id);},salvar(){}});
vm.runInContext(fs.readFileSync(path.join(base,'js/jogo.js'),'utf8'),ctx);vm.runInContext('let pausado=false;',ctx);
vm.runInContext(fs.readFileSync(path.join(base,'js/audio.js'),'utf8'),ctx);const run=s=>vm.runInContext(s,ctx);
(async()=>{
 assert.equal(contexts,0);events.pointerdown({isTrusted:false});assert.equal(contexts,0);
 events.pointerdown({isTrusted:true});await new Promise(r=>setImmediate(r));
 assert.equal(contexts,1);assert.equal(plays,1);assert.equal(run('motorAudio.musica.loop'),true);assert.equal(run('motorAudio.musica.volume'),.35);
 run("tocar('venda');");assert.equal(tones,1);
 run('E.musica=false;atualizarAudio();');assert.equal(run('motorAudio.musica.paused'),true);run("tocar('pegar');");assert.equal(tones,2);
 run('E.efeitos=false;');run("tocar('pegar');");assert.equal(tones,2);
 run('E.musica=true;pausado=true;ativarAudio();');await new Promise(r=>setImmediate(r));assert.ok(Math.abs(run('motorAudio.musica.volume')-.105)<.00001);
 run('document.hidden=true;');events.visibilitychange();assert.equal(run('motorAudio.musica.paused'),true);assert.equal(run('motorAudio.contexto.state'),'suspended');
 run('document.hidden=false;');block=true;events.visibilitychange();await new Promise(r=>setImmediate(r));assert.equal(run('motorAudio.autorizado'),false);
 block=false;events.keydown({isTrusted:true});await new Promise(r=>setImmediate(r));assert.equal(run('motorAudio.musica.paused'),false);
 run('E.som=false;atualizarAudio();');assert.equal(run('motorAudio.musica.paused'),true);
 const wav=fs.readFileSync(path.join(base,'audio/fabrica-loop.wav'));assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.readUInt32LE(24),22050);assert.ok(wav.length>1500000);
 console.log('OK: trilha WAV de 35s, início por gesto, loop, efeitos, volumes separados, pausa suave, aba oculta, bloqueio/repetição de autoplay e mute geral.');
})().catch(e=>{console.error(e);process.exitCode=1;});
