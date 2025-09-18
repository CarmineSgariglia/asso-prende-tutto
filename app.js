/* === Tema Napoletano (solo grafica) + stessa logica di gioco === */

const suits = [
  { id:"denari",  label:"Denari",  class:"denari"  },
  { id:"coppe",   label:"Coppe",   class:"coppe"   },
  { id:"spade",   label:"Spade",   class:"spade"   },
  { id:"bastoni", label:"Bastoni", class:"bastoni" }
];

let deck=[], table=[], playerHand=[], cpuHand=[];
let playerPile=[], cpuPile=[];
let turn="player", lastCapture=null;

function createDeck(){
  const d=[];
  for(const s of suits){
    for(let v=1; v<=10; v++){
      d.push({ value:v, suit:s });
    }
  }
  return d;
}
function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
}
function deal(){
  if(deck.length>=6){
    playerHand=deck.splice(0,3);
    cpuHand=deck.splice(0,3);
  }
}

/* --- RENDER --- */
function render(){
  const cpuEl = document.getElementById("cpu");
  const playerEl = document.getElementById("player");
  const tableEl = document.getElementById("tableArea");

  cpuEl.innerHTML="";
  cpuHand.forEach((c)=>{
    const d=renderCard(c);
    d.classList.add("cpu");
    d.setAttribute("aria-hidden","true");
    cpuEl.appendChild(d);
  });

  playerEl.innerHTML="";
  playerHand.forEach((c,i)=>{
    const d=renderCard(c);
    d.onclick=()=>playCard("player",i);
    d.title="Gioca carta";
    playerEl.appendChild(d);
  });

  tableEl.innerHTML="";
  table.forEach(c=>{ tableEl.appendChild(renderCard(c)); });

  document.getElementById("cpuScore").innerText=cpuPile.length;
  document.getElementById("playerScore").innerText=playerPile.length;

  cpuEl.classList.toggle("active", turn==="cpu");
  playerEl.classList.toggle("active", turn==="player");

  document.getElementById("statusText").innerText=(turn==="player"?"Tocca a te":"Turno CPU");
}

function faceName(v){
  return (v===1?"A":v===8?"F":v===9?"C":v===10?"R":v);
}

/* SVG compatti, colorati via currentColor (classi CSS dei semi) */
function suitSVG(id){
  switch(id){
    case "denari":
      return `<svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" fill="currentColor" opacity="0.95"/>
        <circle cx="12" cy="12" r="5.5" fill="none" stroke="#fff" stroke-opacity="0.65" stroke-width="1.5"/>
      </svg>`;
    case "coppe":
      return `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 5c0 3.5 2.8 6 6 6s6-2.5 6-6H6Z" fill="currentColor"/>
        <rect x="10.4" y="11" width="3.2" height="3.5" rx="1.2" fill="currentColor"/>
        <path d="M8 20h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
    case "spade":
      return `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3c3.5 3.2 5.5 5.7 5.5 8 0 2.2-1.8 4-4 4-0.6 0-1.2-0.1-1.5-0.3V21h-2v-6.3c-0.3 0.2-0.9 0.3-1.5 0.3-2.2 0-4-1.8-4-4 0-2.3 2-4.8 5.5-8Z" fill="currentColor"/>
      </svg>`;
    case "bastoni":
      return `<svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="10.5" y="3" width="3" height="14" rx="1.4" fill="currentColor"/>
        <circle cx="12" cy="19.2" r="2.2" fill="currentColor"/>
      </svg>`;
    default:
      return "";
  }
}

function renderCard(c){
  const d=document.createElement("div");
  d.className=`card ${c.suit.class}`;
  const name = faceName(c.value);
  d.innerHTML = `
    <div>${name}</div>
    <div class="seme">${suitSVG(c.suit.id)}</div>
  `;
  return d;
}

/* --- LOGICA PRESA (immutata) --- */
function checkCapture(card){
  if(card.value===1 && table.length>0){ return [...table]; }          // Asso prende tutto
  return table.filter(c=>c.value===card.value);                       // pari numero
}
function applyMove(player,card){
  const captures=checkCapture(card);
  if(captures.length>0){
    table = table.filter(c=>!captures.includes(c));
    if(player==="player"){
      playerPile.push(card, ...captures); lastCapture="player";
      showMessage(`Hai preso ${captures.length+1} carte`);
    } else {
      cpuPile.push(card, ...captures); lastCapture="cpu";
      showMessage(`CPU ha preso ${captures.length+1} carte`);
    }
  } else {
    table.push(card);
  }
}
function playCard(player,i){
  if(turn!=="player" || player!=="player") return;
  const card=playerHand.splice(i,1)[0];
  applyMove("player",card);
  nextTurn();
}
function cpuPlay(){
  let idx=null;
  for(let i=0;i<cpuHand.length;i++){
    if(checkCapture(cpuHand[i]).length>0){ idx=i; break; }
  }
  if(idx===null) idx=Math.floor(Math.random()*cpuHand.length);
  const card=cpuHand.splice(idx,1)[0];
  applyMove("cpu",card);
  nextTurn();
}
function nextTurn(){
  if(playerHand.length===0 && cpuHand.length===0 && deck.length>0){ deal(); }
  if(playerHand.length===0 && cpuHand.length===0 && deck.length===0){
    if(table.length>0 && lastCapture){
      if(lastCapture==="player") playerPile.push(...table);
      else cpuPile.push(...table);
      table=[];
    }
    endGame(); return;
  }
  turn=(turn==="player"?"cpu":"player");
  render();
  if(turn==="cpu"){ setTimeout(cpuPlay,900); }
}
function showMessage(msg){
  document.getElementById("statusText").innerText=msg;
}
function endGame(){
  let msg="";
  if(playerPile.length>cpuPile.length) msg="Hai vinto!";
  else if(cpuPile.length>playerPile.length) msg="Ha vinto la CPU!";
  else msg="Pareggio!";
  document.getElementById("winnerText").innerText=msg;
  document.getElementById("popup").style.display="flex";
}
function resetGame(){
  deck=createDeck(); shuffle(deck);
  table=deck.splice(0,4);
  playerHand=[]; cpuHand=[];
  playerPile=[]; cpuPile=[];
  deal();
  turn="player"; lastCapture=null;
  document.getElementById("popup").style.display="none";
  render();
}
resetGame();
