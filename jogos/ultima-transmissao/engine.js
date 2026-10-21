/* Motor de investigação: estado, progressão e validação. Sem DOM ou áudio. */
(function(root){
 'use strict';
 const unique=a=>[...new Set(a)];
 const sameSet=(a,b)=>a.length===b.length&&unique(a).length===a.length&&a.every(x=>b.includes(x));
 function validateChapter(c){
  if(!c||!c.id||!c.rooms[c.initialRoom])throw Error('Capítulo sem sala inicial válida.');
  for(const [id,clue] of Object.entries(c.clues)){
   if(!c.rooms[clue.room])throw Error('Sala inválida na pista '+id);
   if(clue.requiresPuzzle&&!c.puzzles[clue.requiresPuzzle])throw Error('Enigma inválido na pista '+id);
  }
  for(const room of Object.values(c.rooms)){
   if((room.unlock||[]).some(id=>!c.clues[id]))throw Error('Sala com pré-requisito inexistente.');
   for(const h of room.hotspots){
   if(!Number.isFinite(h.x)||h.x<0||h.x>100||!Number.isFinite(h.y)||h.y<0||h.y>100)throw Error('Posição inválida: '+h.id);
   if((h.type==='clue'||h.type==='drawer')&&!c.clues[h.id])throw Error('Pista inexistente: '+h.id);
   if(h.type==='puzzle'&&!c.puzzles[h.target])throw Error('Enigma inexistente: '+h.target);
   if(h.type==='room'&&!c.rooms[h.target])throw Error('Destino inexistente: '+h.target);
   }
  }
  for(const [id,p] of Object.entries(c.puzzles)){
   if(!p.solution||!p.solution.length)throw Error('Enigma sem solução: '+id);
   if((p.requires||[]).some(x=>!c.clues[x]))throw Error('Pré-requisito inválido: '+id);
   if(p.rewardClue&&!c.clues[p.rewardClue])throw Error('Recompensa inválida: '+id);
   if(p.room&&!c.rooms[p.room])throw Error('Local de enigma inválido: '+id);
  }
  if(!c.people[c.conclusion.suspect]||c.conclusion.proofs.some(x=>!c.clues[x]))throw Error('Conclusão inválida.');
  if(c.conclusion.requiredPuzzles.some(id=>!c.puzzles[id]))throw Error('Enigma de conclusão inexistente.');
  if(!c.people[c.conclusion.requiredConnection]?.connection)throw Error('Confronto principal inexistente.');
  if(c.conclusion.requiredPeople.some(id=>!c.people[id]?.questions))throw Error('Depoimento de conclusão inexistente.');
  for(const [id,p] of Object.entries(c.people))if(p.questions&&(!p.connection||p.connection.proofs.length!==2||unique(p.connection.proofs).length!==2||p.connection.proofs.some(x=>!c.clues[x])))throw Error('Confronto inválido: '+id);
  for(const item of [...c.objectives,...c.hints]){
   if(item.clue&&!c.clues[item.clue])throw Error('Orientação com pista inexistente.');
   if(item.puzzle&&!c.puzzles[item.puzzle])throw Error('Orientação com enigma inexistente.');
   if(item.connection&&!c.people[item.connection]?.connection)throw Error('Orientação com confronto inexistente.');
  }
  return true;
 }
 function createEngine(chapter,saved){
  validateChapter(chapter);
  const c=chapter,base=()=>({schemaVersion:2,chapterId:c.id,started:false,playerName:'Investigador',room:c.initialRoom,clues:[],unlocked:[],asked:[],connections:[],puzzles:{},solved:false,hints:0,migrated:false});
  const ids=Object.keys(c.clues),personIds=Object.keys(c.people).filter(id=>c.people[id].questions);
  let state=base();
  function normalize(raw){
   const s=base();
   if(!raw||typeof raw!=='object'||Array.isArray(raw))return s;
   if(raw.chapterId&&raw.chapterId!==c.id)return s;
   s.started=raw.started===true;
   s.playerName=typeof raw.playerName==='string'?raw.playerName.replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,24)||'Investigador':'Investigador';
   s.clues=unique(Array.isArray(raw.clues)?raw.clues.filter(id=>ids.includes(id)):[]);
   s.unlocked=unique([...(Array.isArray(raw.unlocked)?raw.unlocked:[]),...s.clues].filter(id=>c.clues[id]?.code));
   s.asked=unique(Array.isArray(raw.asked)?raw.asked.filter(id=>personIds.includes(id)):[]);
   s.connections=unique(Array.isArray(raw.connections)?raw.connections.filter(id=>personIds.includes(id)):[]);
   s.hints=Number.isSafeInteger(raw.hints)?Math.max(0,Math.min(999,raw.hints)):0;
   s.migrated=raw.schemaVersion!==2||raw.migrated===true;
   const primary=c.conclusion.requiredConnection;
   if(s.migrated&&raw.confronted&&c.people[primary].connection.proofs.every(x=>s.clues.includes(x)))s.connections.push(primary);
   for(const [id,p] of Object.entries(c.puzzles)){
    const legacyComplete=s.migrated&&c.legacyPuzzleClues?.[id]&&s.clues.includes(c.legacyPuzzleClues[id]);
    const prerequisites=(p.requires||[]).every(x=>s.clues.includes(x));
    if((raw.puzzles?.[id]===true&&prerequisites)||legacyComplete)s.puzzles[id]=true;
   }
   s.clues=s.clues.filter(id=>!c.clues[id].requiresPuzzle||s.puzzles[c.clues[id].requiresPuzzle]);
   // A fita já encontrada na primeira versão não precisa ser restaurada de novo.
   for(const [id,p] of Object.entries(c.puzzles))if(s.puzzles[id]&&p.rewardClue&&!s.clues.includes(p.rewardClue))s.clues.push(p.rewardClue);
   s.connections=unique(s.connections).filter(id=>c.people[id].connection.proofs.every(x=>s.clues.includes(x)));
   if(c.rooms[raw.room]&&(c.rooms[raw.room].unlock||[]).every(x=>s.clues.includes(x)))s.room=raw.room;
   s.solved=raw.solved===true&&ready(s).length===0;
   return s;
  }
  function snapshot(){return JSON.parse(JSON.stringify(state));}
  function has(id){return state.clues.includes(id);}
  function ready(s=state){
   const missing=[];
   if(ids.some(id=>!s.clues.includes(id)))missing.push('Registrar as '+ids.length+' pistas dos três ambientes');
   if(c.conclusion.requiredPeople.some(id=>!s.asked.includes(id)))missing.push('Ouvir os '+c.conclusion.requiredPeople.length+' depoimentos');
   if(!s.connections.includes(c.conclusion.requiredConnection))missing.push('Confrontar a versão do diretor com duas provas');
   for(const id of c.conclusion.requiredPuzzles)if(!s.puzzles[id])missing.push(c.puzzles[id].title);
   return missing;
  }
  function visit(room){
   if(!c.rooms[room])return {ok:false,reason:'Este local não existe.'};
   if(!(c.rooms[room].unlock||[]).every(has))return {ok:false,reason:'Para acessar '+c.rooms[room].name+', registre: '+c.rooms[room].unlock.filter(x=>!has(x)).map(x=>c.clues[x].name).join(', ')+'.'};
   state.room=room;return {ok:true};
  }
  function collect(id){
   const clue=c.clues[id];
   if(!clue)return {ok:false,reason:'Pista desconhecida.'};
   if(clue.code&&!state.unlocked.includes(id))return {ok:false,reason:'A gaveta ainda está trancada.'};
   if(!has(id)&&state.room!==clue.room)return {ok:false,reason:'Esta pista está em '+c.rooms[clue.room].name+'.'};
   if(clue.requiresPuzzle&&!state.puzzles[clue.requiresPuzzle])return {ok:false,reason:'Primeiro: '+c.puzzles[clue.requiresPuzzle].title+'.'};
   if((c.rooms[clue.room].unlock||[]).some(x=>!has(x)))return {ok:false,reason:'Este local ainda não está acessível.'};
   const fresh=!has(id);if(fresh)state.clues.push(id);return {ok:true,fresh};
  }
  function solvePuzzle(id,answer){
   const p=c.puzzles[id];if(!p)return {ok:false,reason:'Enigma desconhecido.'};
   if(state.puzzles[id])return {ok:true,fresh:false};
   if(!(p.requires||[]).every(has))return {ok:false,reason:'Antes, registre: '+(p.requires||[]).filter(x=>!has(x)).map(x=>c.clues[x].name).join(', ')+'.'};
   if(p.room&&state.room!==p.room)return {ok:false,reason:'Este mecanismo fica em '+c.rooms[p.room].name+'.'};
   if(!Array.isArray(answer)||answer.length!==p.solution.length||!answer.every((x,i)=>x===p.solution[i]))return {ok:false,reason:'A sequência ainda não corresponde aos registros. Você pode tentar novamente; nenhuma pista foi perdida.'};
   state.puzzles[id]=true;if(p.rewardClue&&!has(p.rewardClue))state.clues.push(p.rewardClue);
   return {ok:true,fresh:true};
  }
  function interview(id){if(!personIds.includes(id))return {ok:false};const fresh=!state.asked.includes(id);if(fresh)state.asked.push(id);return {ok:true,fresh};}
  function confront(id,proofs){
   const p=c.people[id];if(!p?.connection)return {ok:false,reason:'Depoimento indisponível.'};
   if(!Array.isArray(proofs)||proofs.length!==2||unique(proofs).length!==2||proofs.some(x=>!has(x)))return {ok:false,reason:'Escolha duas pistas diferentes que você já registrou.'};
   if(!sameSet(proofs,p.connection.proofs))return {ok:false,reason:p.fallback};
   const fresh=!state.connections.includes(id);if(fresh)state.connections.push(id);
   return {ok:true,fresh,reason:p.connection.response};
  }
  function conclude(answer){
   const missing=ready();if(missing.length)return {ok:false,reason:'Ainda há etapas a investigar.',missing};
   const a=c.conclusion;
   if(!answer||answer.suspect!==a.suspect||answer.motive!==a.motive||answer.place!==a.place)return {ok:false,reason:'A hipótese ainda não explica autoria, motivo e localização. Compare a mensagem, a credencial e as notas fiscais.'};
   if(!Array.isArray(answer.proofs)||!sameSet(answer.proofs,a.proofs))return {ok:false,reason:'Selecione três provas diretas: onde Miguel foi, quem comandou a trava e por que queria impedir o programa.'};
   const fresh=!state.solved;state.solved=true;return {ok:true,fresh};
  }
  function achievements(){return [
   {label:'Olhar atento',detail:state.clues.length+'/'+ids.length+' pistas',points:state.clues.reduce((n,id)=>n+(c.clues[id].points||0),0)},
   {label:'Todos os lados',detail:state.asked.length+'/'+personIds.length+' depoimentos',points:state.asked.length*50},
   {label:'Versão desmentida',detail:state.connections.includes(c.conclusion.requiredConnection)?'Contradição demonstrada':'Confronto pendente',points:state.connections.includes(c.conclusion.requiredConnection)?100:0},
   {label:'Mente investigativa',detail:Object.keys(state.puzzles).length+'/'+Object.keys(c.puzzles).length+' enigmas',points:Object.keys(state.puzzles).reduce((n,id)=>n+(c.puzzles[id].points||0),0)},
   {label:'Caso resolvido',detail:state.solved?'Conclusão fundamentada':'Conclusão pendente',points:state.solved?c.conclusion.points:0}
  ];}
  function hint(){state.hints++;const h=c.hints.find(h=>h.clue?!has(h.clue):h.puzzle?!state.puzzles[h.puzzle]:!state.connections.includes(h.connection));return h||c.finalHint;}
  function objective(){
   if(state.solved)return c.objectiveSolved;
   const objective=c.objectives.find(o=>o.clue?!has(o.clue):!state.puzzles[o.puzzle]);
   if(objective)return objective.text;
   return ready().length?c.objectivePending:c.objectiveReady;
  }
  state=normalize(saved);
  return {snapshot,has,ready,visit,collect,solvePuzzle,interview,confront,conclude,achievements,hint,objective,
   unlockClue(id,code){const clue=c.clues[id];if(!clue?.code||state.room!==clue.room)return {ok:false,reason:'Mecanismo indisponível neste local.'};if(String(code).trim()!==clue.code)return {ok:false,reason:'O cadeado não abriu. Consulte a mensagem do telefone e o horário da transmissão.'};if(!state.unlocked.includes(id))state.unlocked.push(id);return {ok:true};},
   start(name){state.started=true;if(typeof name==='string')state.playerName=normalize({playerName:name,schemaVersion:2}).playerName;return snapshot();},
   reset(){state=base();},restore(raw){if(!raw||raw.chapterId!==c.id||raw.schemaVersion!==2)return {ok:false,reason:'Arquivo de progresso incompatível com este capítulo.'};state=normalize(raw);return {ok:true};},
   total(){return achievements().reduce((n,a)=>n+a.points,0);},
   export(){return JSON.stringify({format:'investigation-save',chapterId:c.id,schemaVersion:2,state:snapshot()},null,2);}
  };
 }
 const api={createEngine,validateChapter};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.InvestigationEngine=api;
})(typeof window!=='undefined'?window:globalThis);
