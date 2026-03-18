// =======================================
//   ELVERIKET – GAME ENGINE
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
    nordflod: { name: "Nordflod", owner: "player1", troops: 140, tanks: 12, fly: 4, defenseBonus: 0.2 },
    vestlund: { name: "Vestlund", owner: "player2", troops: 90, tanks: 3, fly: 0, defenseBonus: 0.3 },
    midtriket: { name: "Midtriket", owner: "player1", troops: 200, tanks: 20, fly: 10, defenseBonus: 0.1 },
    ostheim: { name: "Østheim", owner: "player2", troops: 120, tanks: 5, fly: 2, defenseBonus: 0.2 },
    sorskogen: { name: "Sørskogen", owner: "player1", troops: 110, tanks: 4, fly: 1, defenseBonus: 0.15 },
    dypmyr: { name: "Dypmyr", owner: "player2", troops: 80, tanks: 2, fly: 0, defenseBonus: 0.25 },
    kilemark: { name: "Kilemark", owner: "player1", troops: 150, tanks: 6, fly: 2, defenseBonus: 0.1 },
    sandhavn: { name: "Sandhavn", owner: "player2", troops: 100, tanks: 8, fly: 6, defenseBonus: 0.05 }
  },

  selected: null,
  pendingAttack: null
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

const logBox = document.getElementById("log");
const buyTroopsBtn = document.getElementById("buy-troops");
const buyTanksBtn = document.getElementById("buy-tanks");
const buyFlyBtn = document.getElementById("buy-fly");

// -------------------------------
//   LOGG
// -------------------------------

function addLog(message) {
  const p = document.createElement("p");
  p.textContent = message;
  logBox.prepend(p);
}

// -------------------------------
//   RENDER
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

  fortifyBtn.disabled = !isOwner || state.players[state.turn].money < 10;

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

  if (t[unitType] <= 0) {
    alert("Du har ikke nok enheter av denne typen!");
    return;
  }

  if (attacker.money < unitStats[unitType].cost) {
    alert("Du har ikke nok penger!");
    return;
  }

  attacker.money -= unitStats[unitType].cost;

  state.pendingAttack = {
    attackerUnit: unitType,
    target: state.selected,
    attackerPlayer: state.turn
  };

  attackOptions.style.display = "none";
  counterOptions.style.display = "block";

  render();
}

// -------------------------------
//   FULLFØR COUNTER
// -------------------------------

function resolveCounter(defenderUnit) {
  const atk = state.pendingAttack;
  if (!atk) return;

  const attacker = state.players[atk.attackerPlayer];
  const territory = state.territories[atk.target];
  const defenderPlayer = state.players[territory.owner];

  const result = counterResult(atk.attackerUnit, defenderUnit);

  let damage = unitStats[atk.attackerUnit].damage;

  if (result === "counter") {
    damage = 0;
    addLog(`${defenderPlayer.name} vant counteren med ${defenderUnit}. Ingen skade.`);
    alert("Forsvareren vant counteren! Ingen skade gjort.");
  }

  if (result === "attacker") {
    damage += 5;
    addLog(`${attacker.name} vant counteren med ${atk.attackerUnit}. Bonus skade!`);
    alert("Angriperen vant counteren! Bonus skade!");
  }

  if (result === "equal") {
    addLog(`Samme enhetstype i kamp: normal skade.`);
    alert("Samme enhetstype! Normal skade.");
  }

  let rawDamage = damage;
  const defenseBonus = territory.defenseBonus || 0;
  damage = Math.round(damage * (1 - defenseBonus));

  territory.troops = Math.max(0, territory.troops - damage);

  addLog(`${attacker.name} angriper ${territory.name} med ${atk.attackerUnit} (${rawDamage} → ${damage} dmg).`);

  if (damage > 0) {
    attacker.money += 10;
    addLog(`${attacker.name} tjente 10💰 for vellykket angrep.`);
  }

  if (territory.troops === 0) {
    territory.owner = atk.attackerPlayer;
    territory.troops = 30;
    addLog(`${territory.name} ble erobret av ${attacker.name}!`);
    alert(`${territory.name} ble erobret!`);
  }

  state.pendingAttack = null;
  counterOptions.style.display = "none";

  render();
}

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

  addLog(`${p.name} forsterket ${t.name} med +5 tropper.`);
  render();
});

// -------------------------------
//   BUTIKK
// -------------------------------

function buyUnit(type) {
  const p = state.players[state.turn];
  const selectedId = state.selected;
  if (!selectedId) {
    alert("Velg et land du eier først!");
    return;
  }
  const t = state.territories[selectedId];
  if (t.owner !== state.turn) {
    alert("Du kan bare kjøpe enheter til egne land!");
    return;
  }

  if (type === "troops") {
    if (p.money < 10) return alert("Ikke nok penger!");
    p.money -= 10;
    t.troops += 10;
    addLog(`${p.name} kjøpte 10 tropper til ${t.name}.`);
  }

  if (type === "tanks") {
    if (p.money < 25) return alert("Ikke nok penger!");
    p.money -= 25;
    t.tanks += 1;
    addLog(`${p.name} kjøpte 1 tank til ${t.name}.`);
  }

  if (type === "fly") {
    if (p.money < 40) return alert("Ikke nok penger!");
    p.money -= 40;
    t.fly += 1;
    addLog(`${p.name} kjøpte 1 fly til ${t.name}.`);
  }

  render();
}

buyTroopsBtn.addEventListener("click", () => buyUnit("troops"));
buyTanksBtn.addEventListener("click", () => buyUnit("tanks"));
buyFlyBtn.addEventListener("click", () => buyUnit("fly"));

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
