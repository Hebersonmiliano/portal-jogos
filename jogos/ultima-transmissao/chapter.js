/* Conteúdo do caso. O motor e a interface não dependem dos nomes desta história. */
(function(root){
 'use strict';
 const chapter={
  id:'aurora-01',version:2,title:'A Última Transmissão',subtitle:'O silêncio da meia-noite',
  initialRoom:'recepcao',storageKey:'ultima-transmissao-caso-01-v2',legacyKey:'ultima-transmissao-caso-01-v1',
  intro:'Às 23h47, a Rádio Aurora transmitiu um pedido de socorro. Depois, silêncio. Miguel, um jornalista prestes a revelar uma denúncia, desapareceu.',
  arrival:'00:18',rank:'Investigador de Aurora',
  legacyPuzzleClues:{mixer:'tape'},
  objectives:[
   {clue:'phone',text:'Ouça o recado no telefone da recepção.'},
   {clue:'drawer',text:'Encontre a cópia guardada na gaveta de Miguel.'},
   {puzzle:'mixer',text:'Explore o estúdio e restaure a fita de segurança.'},
   {clue:'access',text:'Consulte o terminal de segurança do estúdio.'},
   {puzzle:'rescue',text:'Vá ao arquivo e abra a porta do depósito.'},
   {clue:'envelope',text:'Recolha o envelope que Miguel preservou.'}
  ],
  objectivePending:'Complete o painel de provas e confronte os depoimentos.',
  objectiveReady:'Você tem as peças. Apresente sua reconstrução dos fatos.',
  objectiveSolved:'Caso encerrado. Uma nova frequência está chamando.',
  finalHint:{text:'Confira os depoimentos e apresente as três provas diretas no painel de conclusão.',answer:'Responsável: Raul. Motivo: desvio de dinheiro. Local: depósito do arquivo. Provas: mensagem, histórico de segurança e cópia da denúncia.'},
  narrative:{
   rescueTitle:'A voz do outro lado.',
   rescueLines:['“Eu ouvi vocês! O Raul me deixou no depósito. Disse que voltaria depois do programa, mas a porta não abriu mais.”','“Pegue o envelope da mesa. Os documentos originais estão ali. Eu sabia que ele tentaria impedir a denúncia.”'],
   endingTitle:'A verdade voltou ao ar.',
   endingLines:['Raul usou a própria credencial para isolar Miguel no depósito. Depois, inseriu uma gravação antiga para levar todos a procurar no estúdio.','A denúncia e as notas originais demonstram o motivo: esconder o dinheiro desviado na venda dos transmissores. A polícia recebe as provas, e Miguel está seguro.','Às 06h00, Clara abre o microfone. Dessa vez, a cidade ouve a história inteira.'],
   hookTitle:'Mas alguém ainda está ouvindo.',
   hookLines:['Quando você se prepara para sair, o rádio volta a chiar. Nenhum canal está selecionado.','Uma mensagem aparece no visor: “{name}, encontramos seu nome no arquivo de 1987. Não sintonize a frequência 13.”','Abaixo, um endereço. E a data de amanhã.'],
   hookNote:'Fim do capítulo 1 · O caso de Miguel foi resolvido. O novo mistério continua em um próximo capítulo, ainda em preparação.'
  },
  rooms:{
   recepcao:{name:'Recepção',number:'01',image:'assets/recepcao.png',alt:'Recepção da rádio com telefone, livro de visitas, relógio, gravador e gaveteiro.',title:'Há algo errado neste silêncio.',description:'Chuva na janela. Café frio. Uma mensagem que ninguém ouviu.',hotspots:[
    {id:'log',label:'Livro de visitas',x:53,y:50,mobileX:53,mobileY:67,type:'clue'},
    {id:'phone',label:'Secretária eletrônica',x:46,y:46,mobileX:40,mobileY:36,type:'clue'},
    {id:'clock',label:'Relógio e manutenção',x:57,y:12,mobileY:16,type:'clue'},
    {id:'drawer',label:'Gaveta de Miguel',x:94,y:57,mobileX:92,mobileY:72,type:'drawer'},
    {id:'recorder',label:'Fita de segurança',x:68,y:49,type:'note',text:'A fita reserva existe, mas a reprodução está sem os canais de voz e ambiente. Theo pode ajudar. Leve a investigação ao estúdio e examine o esquema da mesa de som.'},
    {id:'to-studio',label:'Entrar no estúdio',x:77,y:39,mobileX:78,mobileY:20,type:'room',target:'estudio'}
   ]},
   estudio:{name:'Estúdio',number:'02',image:'assets/estudio.png',alt:'Estúdio da Rádio Aurora com mesa de som, gravador de rolos, cabine vazia e terminal de segurança.',title:'O silêncio também deixa rastros.',description:'O microfone está fechado. A gravação de segurança continua aqui.',hotspots:[
    {id:'manual',label:'Esquema dos canais',x:32,y:63,type:'clue'},
    {id:'mixer',label:'Restaurar a gravação',x:49,y:63,type:'puzzle',target:'mixer'},
    {id:'access',label:'Terminal de segurança',x:93,y:53,type:'clue'},
    {id:'reels',label:'Gravador de rolos',x:8,y:41,type:'note',text:'A gravação de segurança possui canais separados. Ajuste a mesa conforme o esquema técnico para recuperar os onze segundos que ficaram mudos na transmissão.'},
    {id:'booth',label:'Cabine de locução',x:53,y:37,mobileY:33,type:'note',text:'A cabine está vazia. Não há marcas de luta. O microfone estava desligado quando o pedido de socorro entrou no ar — uma peça importante para avaliar a versão de Theo.'}
   ]},
   arquivo:{name:'Arquivo',number:'03',image:'assets/arquivo.png',alt:'Arquivo do subsolo com estantes, envelope na mesa e porta de segurança com painel de emergência.',title:'Uma porta entre você e a verdade.',description:'O painel ainda responde. Do outro lado, alguém bate três vezes.',unlock:['access'],hotspots:[
    {id:'rescue',label:'Painel da porta de segurança',x:87,y:38,type:'puzzle',target:'rescue'},
    {id:'envelope',label:'Envelope de Miguel',x:36,y:59,type:'clue'},
    {id:'shelves',label:'Caixas do projeto Aurora',x:20,y:35,type:'note',text:'Caixas antigas têm o mesmo símbolo: um círculo atravessado pelo número 13. Quase todos os documentos foram retirados. O nome do projeto aparece também no envelope da mesa.'}
   ]}
  },
  clues:{
   log:{name:'Livro de visitas',room:'recepcao',sub:'23h41 · Raul voltou à rádio',copy:'A tinta ainda está recente. Duas entradas foram registradas pouco antes do pedido de socorro.',document:['23h41 — Raul Vieira, direção.','23h42 — Miguel Santos, jornalista.','Autorização: R. Vieira.','Nenhuma saída registrada.'],note:'A assinatura de Raul registra sua presença depois do horário em que ele afirma ter saído.',points:75},
   phone:{name:'Mensagem de Miguel',room:'recepcao',sub:'23h44 · O encontro no arquivo',person:'miguel',source:'MENSAGEM GRAVADA · TRANSCRIÇÃO',copy:'Miguel deixou uma mensagem na secretária eletrônica da recepção. Ele esperava que Clara chegasse para o programa.',document:['“Clara, se você chegar, estou no arquivo do subsolo. O Raul pediu para conversarmos longe do estúdio.”','“A cópia da denúncia ficou na minha gaveta. A senha é o horário da transmissão, sem os dois-pontos.”'],note:'Miguel foi ao arquivo a pedido de Raul, às 23h44. O pedido de socorro entrou no ar às 23h47.',points:75},
   clock:{name:'Registro do apagão',room:'recepcao',sub:'00h00 · A luz caiu depois',copy:'O relógio elétrico parou à meia-noite. A folha de manutenção confirma a falha.',document:['00h00 — Falha de alimentação.','00h03 — Alimentação restaurada.','O relógio aguarda ajuste manual.'],note:'O apagão aconteceu treze minutos depois da transmissão. Não pode explicar o silêncio às 23h47.',points:75},
   drawer:{name:'Cópia da denúncia',room:'recepcao',sub:'O motivo para impedir o programa',person:'miguel',source:'BILHETE ASSINADO',code:'2347',copy:'Há cópias de notas fiscais e um bilhete de Miguel. As notas documentam a venda de equipamentos da rádio.',document:['“As notas foram adulteradas. O dinheiro da venda caiu na conta particular de Raul Vieira.”','“Vou apresentar os documentos ao vivo à meia-noite. Se ele tentar me impedir, esta é a cópia. — Miguel”'],note:'A denúncia ameaça revelar o desvio de dinheiro de Raul. É um motivo verificável, não apenas uma desavença pessoal.',points:75},
   manual:{name:'Esquema da mesa de som',room:'estudio',sub:'Canais separados · Cópia de segurança',copy:'Um cartão técnico está preso à mesa. Não é preciso conhecer equipamentos de rádio: o esquema indica os níveis de reprodução.',document:['PARA OUVIR A CÓPIA RESERVA:','VOZ → nível 4','AMBIENTE → nível 2','TRILHA → nível 0','A transmissão foi silenciada; a fita reserva mantém o áudio original.'],note:'Ajuste Voz em 4, Ambiente em 2 e Trilha em 0 na mesa de som.',points:75},
   tape:{name:'Onze segundos recuperados',room:'estudio',sub:'23h47 · Um socorro que já existia',requiresPuzzle:'mixer',copy:'Os canais revelam o trecho escondido na cópia de segurança. A mesma fala consta no catálogo de uma radionovela de 2019.',document:['23h47 — “Socorro… tem alguém aqui…”','Reserva restaurada: “Inserção agendada: DIREÇÃO.”','Catálogo de 2019 / “Sem Saída”: mesma fala, tosse e trovão.','O microfone da cabine permaneceu fechado.'],note:'O socorro foi uma gravação antiga, inserida pelo terminal da direção para atrair a atenção ao estúdio.',points:75},
   access:{name:'Histórico de segurança',room:'estudio',sub:'23h45 · A credencial de Raul',copy:'O terminal mostra os comandos recentes e o procedimento local para abrir a porta do depósito no arquivo.',document:['23h43 — Arquivo / entrada interna.','23h45 — Depósito do arquivo / travamento remoto.','Credencial: RV-01 · Raul Vieira.','Travamento remoto: permissão exclusiva da DIREÇÃO.','EMERGÊNCIA LOCAL: alimentar painel → selecionar circuito local → liberar trava.'],note:'A credencial exclusiva de Raul trancou o depósito às 23h45. O acesso à escada do arquivo está liberado.',points:75},
   envelope:{name:'Originais preservados',room:'arquivo',sub:'Uma denúncia e um nome de projeto',person:'miguel',source:'DOCUMENTOS ENTREGUES APÓS O RESGATE',requiresPuzzle:'rescue',copy:'Miguel pede que você recolha o envelope. Dentro estão os originais que correspondem às cópias da gaveta e um cartão antigo.',document:['Notas originais: os valores confirmam as alterações feitas nas cópias de Raul.','Miguel: “Ele me deixou no depósito e disse que conversaria comigo depois do programa.”','No cartão: PROJETO AURORA / FREQUÊNCIA 13.'],note:'Os originais e o relato de Miguel confirmam o caso. O cartão parece apontar para um segredo mais antigo da rádio.',points:75}
  },
  people:{
   clara:{name:'Clara Nunes',role:'PRODUTORA',portrait:'assets/clara.png',initial:'“Cheguei às 23h50. Ouvi o pedido de socorro no carro. Miguel ia apresentar uma denúncia à meia-noite.”',questions:[{id:'message',question:'Miguel deixou algum recado?',answer:'“Ele ligava para a recepção quando eu me atrasava. Procure na secretária eletrônica. Ele queria garantir que a denúncia não sumisse.”'},{id:'arrival',question:'Por que você chegou depois do pedido?',answer:'“Meu turno começava à meia-noite. O programa seria ao vivo, mas eu não estava no prédio às 23h47.”'}],connection:{proofs:['phone','log'],response:'“É isso. Eu ainda não tinha chegado, e Raul já estava com Miguel. O recado não era um pedido de socorro; era um aviso de onde encontrá-lo.”',label:'O encontro confirmado'},fallback:'Clara lê o registro, mas ele não contradiz o horário em que ela chegou. Procure evidências sobre quem estava com Miguel antes da transmissão.'},
   theo:{name:'Theo Martins',role:'TÉCNICO DE SOM',portrait:'assets/theo.png',initial:'“Às 23h47 a cabine estava vazia. O áudio entrou pela rede, não pelo microfone. Eu estava na técnica.”',questions:[{id:'power',question:'Foi o apagão que cortou o som?',answer:'“A energia caiu só à meia-noite. Temos fita reserva. O esquema de reprodução fica junto à mesa: voz, ambiente e trilha.”'},{id:'door',question:'Você consegue abrir o depósito?',answer:'“O travamento remoto é exclusivo da direção. O terminal do estúdio tem o histórico e a sequência de liberação local. Nada de forçar a porta.”'}],connection:{proofs:['tape','clock'],response:'“O apagão veio depois. E essa tosse é da radionovela! Alguém programou o áudio antigo. O relatório da fita mostra a origem: o terminal da direção.”',label:'A falsa transmissão explicada'},fallback:'Theo compara a pista com seu relato. Ela ainda não prova como o áudio entrou no ar. Compare a gravação restaurada com o horário do apagão.'},
   raul:{name:'Raul Vieira',role:'DIRETOR DA RÁDIO',portrait:'assets/raul.png',tensePortrait:'assets/raul-confrontado.png',initial:'“Fui embora às dez da noite. Não vi Miguel. Essa história de denúncia é um mal-entendido.”',questions:[{id:'card',question:'Quem estava com sua credencial?',answer:'“Meu cartão ficou comigo a noite inteira. Só ele permite trancar o depósito à distância.”'},{id:'sales',question:'O que Miguel iria apresentar?',answer:'“Uma interpretação errada de algumas notas fiscais. Eu queria esclarecer isso, só isso.”'}],connection:{proofs:['log','access'],response:'“Eu… voltei para uma reunião. Deixei Miguel no depósito. Só queria impedir que ele fosse ao ar antes de conversarmos. O painel de emergência abre por dentro do arquivo.”',label:'A versão de Raul desmentida'},fallback:'Raul insiste na versão inicial. Para confrontá-lo, demonstre que ele voltou à rádio e que sua credencial comandou a trava.'},
   miguel:{name:'Miguel Santos',role:'JORNALISTA',portrait:'assets/miguel.png'}
  },
  puzzles:{
   mixer:{title:'Restaurar a gravação',type:'levels',room:'estudio',requires:['manual'],solution:[4,2,0],labels:['Voz','Ambiente','Trilha'],rewardClue:'tape',points:150},
   timeline:{title:'Reconstruir a noite',type:'order',requires:['phone','access','tape','clock'],solution:['meeting','lock','broadcast','blackout'],events:[{id:'broadcast',text:'O pedido de socorro é transmitido',detail:'Relatório da gravação de segurança'},{id:'blackout',text:'A alimentação elétrica falha',detail:'Registro de manutenção'},{id:'meeting',text:'Miguel deixa o recado sobre o encontro',detail:'Secretária eletrônica'},{id:'lock',text:'A credencial RV-01 trava o depósito',detail:'Histórico de segurança'}],points:150},
   rescue:{title:'Abrir o depósito',type:'sequence',room:'arquivo',requires:['access'],solution:['power','local','release'],steps:[{id:'release',label:'Liberar trava'},{id:'power',label:'Alimentar painel'},{id:'remote',label:'Acionar controle remoto'},{id:'local',label:'Selecionar circuito local'}],points:150}
  },
  conclusion:{suspect:'raul',motive:'fraud',place:'archive',proofs:['phone','access','drawer'],requiredPuzzles:['mixer','timeline','rescue'],requiredConnection:'raul',requiredPeople:['clara','theo','raul'],points:200,motives:[{id:'audience',text:'Criar uma encenação para ganhar audiência'},{id:'fraud',text:'Impedir a denúncia sobre o desvio de dinheiro'},{id:'revenge',text:'Vingar uma demissão'}],places:[{id:'studio',text:'Cabine de locução'},{id:'archive',text:'Depósito do arquivo'},{id:'street',text:'Rua atrás da rádio'}]},
  hints:[
   {clue:'phone',text:'Comece pelo telefone claro no centro da mesa. Leia e registre a mensagem de Miguel.',answer:'O telefone registra que Miguel foi ao arquivo a pedido de Raul, às 23h44.'},
   {clue:'drawer',text:'A mensagem menciona uma gaveta. O código é o horário do pedido de socorro, sem separação.',answer:'O pedido entrou no ar às 23h47. O código da gaveta é 2347.'},
   {clue:'manual',text:'Entre no estúdio e examine o esquema junto à mesa de som.',answer:'Registre o esquema: Voz 4, Ambiente 2, Trilha 0.'},
   {puzzle:'mixer',text:'A mesa usa os três níveis indicados no esquema. Ajuste os canais e restaure a fita reserva.',answer:'Voz = 4, Ambiente = 2, Trilha = 0. A gravação recuperada fica no caderno.'},
   {clue:'access',text:'O terminal à direita do estúdio registra quem comandou a porta do depósito.',answer:'Registre o histórico de segurança. Isso libera o caminho para o arquivo.'},
   {clue:'clock',text:'O relógio na recepção tem um registro de manutenção. Compare o horário com a transmissão.',answer:'O apagão foi às 00h00, depois do socorro às 23h47.'},
   {clue:'log',text:'O livro aberto na recepção registra quem voltou à rádio.',answer:'Raul assinou às 23h41, contrariando sua afirmação de que saiu às 22h.'},
   {puzzle:'rescue',text:'Vá ao arquivo. Siga a sequência de emergência descrita no histórico de segurança.',answer:'Alimentar painel → selecionar circuito local → liberar trava. Miguel está no depósito.'},
   {clue:'envelope',text:'Após abrir a porta, examine o envelope na mesa do arquivo.',answer:'Registre os documentos que Miguel preservou no envelope.'},
   {puzzle:'timeline',text:'No painel de provas, organize os quatro acontecimentos usando os horários registrados.',answer:'Recado de Miguel (23h44) → trava (23h45) → transmissão (23h47) → apagão (00h00).'},
   {connection:'raul',text:'Ouça os três depoimentos. Apresente a Raul o registro de sua volta e o comando da porta.',answer:'No confronto de Raul, escolha Livro de visitas e Histórico de segurança.'}
  ]
 };
 if(typeof module!=='undefined'&&module.exports)module.exports=chapter;else root.InvestigationChapter=chapter;
})(typeof window!=='undefined'?window:globalThis);
