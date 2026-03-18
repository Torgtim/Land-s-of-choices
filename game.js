// =======================================
//   ELVERIKET – GAME ENGINE (DEL 1)
// =======================================

// -------------------------------
//   SPILLSTATE
// -------------------------------

let state = {
  turn: "player1",
  timer: 60,
  interval: null,

  players: {
    player1: { name: "Spiller 1", color: "#4caf50", money: 50 },
    player2: { name: "Spiller 2", color: "#f44336", money: 50 }
  },

  territories: {
    nordflod: { name: "Nordflod", owner: "player1", troops: 140, tanks: 12, fly: 4 },
    vestlund: { name: "Vestlund", owner: "player2", troops: 90, tanks: 3, fly: 0 },
    midtriket: { name: "Midtriket", owner: "player1", troops: 200, tanks: 20, fly: 10 },
    ostheim: { name: "Østheim", owner: "player2", troops: 120, tanks: 5, fly: 2 },
    sorskogen: { name: "Sørskogen", owner: "player1", troops: 110, tanks: 4, fly: 1 },
    dypmyr: { name: "Dypmyr", owner: "player2", troops: 80, tanks: 2, fly: 0 },
    kilemark: { name: "Kilemark", owner: "player1", troops: 150, tanks: 6, fly: 2 },
    sandhavn: { name: "Sandhavn", owner: "player2", troops: 100, tanks: 8, fly: 6 }
  },

  selected: null,
  pendingAttack: null // lagrer angrepsvalg før counter
};

// -------------------------------
//   DOM ELEMENTS
// -------------------------------

const turnPlayer = document.getElementById("turn-player");
const infoBox = document.getElementById("territory-info");

const fortifyBtn = document.getElementById("fortify-btn");
const endTurnBtn = document.getElementById("end-turn-btn");

const attackOptions = document.getElementById("attack-options");
const counterOptions = document.getElementById("counter-options");

const atkTroops = document.getElementById("atk-troops");
const atkTanks = document.getElementById("atk-tanks");
const atkFly = document.getElementById("atk-fly");

const ctrTroops = document.getElementById("ctr-troops");
const ctrTanks = document.getElementById("ctr-tanks");
const ctrFly = document.getElementById("ctr-fly");

// -------------------------------
//   RENDER FUNKSJON
// -------------------------------

function render() {
  const p = state.players[state.turn];
  turnPlayer.textContent = `Tur: ${p.name} – 💰 ${p.money} – Tid: ${state.timer}s`;
  turnPlayer.style.color = p.color;

  attackOptions.style.display = "none";
  counterOptions.style.display = "none";

  if (!state.selected) {
    infoBox.textContent = "Velg et land";
    fortifyBtn.disabled = true;
    return;
  }

  const t = state.territories[state.selected];

  infoBox.innerHTML = `
    <strong>${t.name}</strong><br>
    Eier: ${state.players[t.owner].name}<br>
    Tropper: ${t.troops}<br>
    Tanks: ${t.tanks}<br>
    Fly: ${t.fly}
  `;

  const isOwner = t.owner === state.turn;

  // Forsterk kun egne land
  fortifyBtn.disabled = !isOwner || state.players[state.turn].money < 10;

  // Angrep kun fiendens land
  if (!isOwner) {
    attackOptions.style.display = "block";
  }
}

// -------------------------------
//   TERRITORIEVALG
// -------------------------------

document.querySelectorAll(".territory").forEach(btn => {
  btn.addEventListener("click", () => {
    state.selected = btn.dataset.id;
    state.pendingAttack = null;
    render();
  });
});

// =======================================
//   ELVERIKET – GAME ENGINE (DEL 2)
// =======================================

// -------------------------------
//   ENHETSVERDIER
// -------------------------------

const unitStats = {
  troops: { damage: 10, cost: 5 },
  tanks: { damage: 25, cost: 10 },
  fly: { damage: 20, cost: 15 }
};

// -------------------------------
//   COUNTER-LOGIKK
// -------------------------------
//
// Tanks counter fly
// Fly counter troops
// Troops counter tanks
//
// Returnerer:
//   "counter" → forsvarer vinner
//   "attacker" → angriper vinner
//   "equal" → samme type
//

function counterResult(attacker, defender) {
  if (attacker === defender) return "equal";

  if (
    (attacker === "tanks" && defender === "fly") ||
    (attacker === "fly" && defender === "troops") ||
    (attacker === "troops" && defender === "tanks")
  ) {
    return "counter";
  }

  return "attacker";
}

// -------------------------------
//   START ANGRIP
// -------------------------------

function startAttack(unitType) {
  const attacker = state.players[state.turn];
  const t = state.territories[state.selected];

  // Sjekk om angriper har enheten
  if (t[unitType] <= 0) {
    alert("Du har ikke nok enheter av denne typen!");
    return;
  }

  // Sjekk penger
  if (attacker.money < unitStats[unitType].cost) {
    alert("Du har ikke nok penger!");
    return;
  }

  // Trekk penger
  attacker.money -= unitStats[unitType].cost;

  // Lagre angrepet
  state.pendingAttack = {
    attackerUnit: unitType,
    target: state.selected,
    attackerPlayer: state.turn
  };

  // Vis counter-knapper
  attackOptions.style.display = "none";
  counterOptions.style.display = "block";

  render();
}

// -------------------------------
//   FULLFØR COUNTER
// -------------------------------

function resolveCounter(defenderUnit) {
  const atk = state.pendingAttack;
  const attacker = state.players[atk.attackerPlayer];
  const defenderPlayer = state.players[state.territories[atk.target].owner];
  const territory = state.territories[atk.target];

  const result = counterResult(atk.attackerUnit, defenderUnit);

  let damage = unitStats[atk.attackerUnit].damage;

  if (result === "counter") {
    // Forsvarer vinner → angriper gjør 0 skade
    damage = 0;
    alert("Forsvareren vant counteren! Ingen skade gjort.");
  }

  if (result === "attacker") {
    // Angriper vinner → bonus skade
    damage += 5;
    alert("Angriperen vant counteren! Bonus skade!");
  }

  if (result === "equal") {
    alert("Samme enhetstype! Normal skade.");
  }

  // Påfør skade
  territory.troops = Math.max(0, territory.troops - damage);

  // Belønning hvis angriper gjorde skade
  if (damage > 0) {
    attacker.money += 10;
  }

  // Erobring
  if (territory.troops === 0) {
    territory.owner = atk.attackerPlayer;
    territory.troops = 30; // starttropp
    alert(`${territory.name} ble erobret!`);
  }

  // Reset
  state.pendingAttack = null;
  counterOptions.style.display = "none";

  render();
}

// =======================================
//   ELVERIKET – GAME ENGINE (DEL 3)
// =======================================

// -------------------------------
//   FORSTERKING
// -------------------------------

fortifyBtn.addEventListener("click", () => {
  const t = state.territories[state.selected];
  const p = state.players[state.turn];

  if (p.money < 10) {
    alert("Du har ikke nok penger!");
    return;
  }

  t.troops += 5;
  p.money -= 10;

  render();
});

// -------------------------------
//   ANGRIP-KNAPPER
// -------------------------------

atkTroops.addEventListener("click", () => startAttack("troops"));
atkTanks.addEventListener("click", () => startAttack("tanks"));
atkFly.addEventListener("click", () => startAttack("fly"));

// -------------------------------
//   COUNTER-KNAPPER
// -------------------------------

ctrTroops.addEventListener("click", () => resolveCounter("troops"));
ctrTanks.addEventListener("click", () => resolveCounter("tanks"));
ctrFly.addEventListener("click", () => resolveCounter("fly"));

// -------------------------------
//   TURBYTTE
// -------------------------------

function endTurn() {
  state.turn = state.turn === "player1" ? "player2" : "player1";
  state.selected = null;
  state.pendingAttack = null;

  startTurnTimer();
  render();
}

endTurnBtn.addEventListener("click", endTurn);

// -------------------------------
//   TIMER
// -------------------------------

function startTurnTimer() {
  if (state.interval) clearInterval(state.interval);

  state.timer = 60;

  state.interval = setInterval(() => {
    state.timer--;
    render();

    if (state.timer <= 0) {
      alert("Tiden er ute! Turen går videre.");
      endTurn();
    }
  }, 1000);
}

// -------------------------------
//   START SPILLET
// -------------------------------

startTurnTimer();
render();
