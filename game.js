// =========================
//   SPILLSTATE
// =========================

let state = {
  turn: "player1",
  timer: 60,
  interval: null,

  players: {
    player1: { name: "Spiller 1", color: "#4caf50", money: 100 },
    player2: { name: "Spiller 2", color: "#f44336", money: 100 }
  },

  territories: {
    nordflod: { name: "Nordflod", owner: "player1", troops: 140, tanks: 12 },
    vestlund: { name: "Vestlund", owner: "player2", troops: 90, tanks: 3 },
    midtriket: { name: "Midtriket", owner: "player1", troops: 200, tanks: 20 },
    ostheim: { name: "Østheim", owner: "player2", troops: 120, tanks: 5 },
    sorskogen: { name: "Sørskogen", owner: "player1", troops: 110, tanks: 4 },
    dypmyr: { name: "Dypmyr", owner: "player2", troops: 80, tanks: 2 },
    kilemark: { name: "Kilemark", owner: "player1", troops: 150, tanks: 6 },
    sandhavn: { name: "Sandhavn", owner: "player2", troops: 100, tanks: 8 }
  },

  selected: null
};

// =========================
//   DOM ELEMENTS
// =========================

const turnPlayer = document.getElementById("turn-player");
const infoBox = document.getElementById("territory-info");
const fortifyBtn = document.getElementById("fortify-btn");
const attackBtn = document.getElementById("attack-btn");
const endTurnBtn = document.getElementById("end-turn-btn");

// =========================
//   RENDER FUNKSJON
// =========================

function render() {
  const p = state.players[state.turn];
  turnPlayer.textContent = `Tur: ${p.name} – Penger: ${p.money}💰 – Tid: ${state.timer}s`;
  turnPlayer.style.color = p.color;

  if (!state.selected) {
    infoBox.textContent = "Velg et land";
    fortifyBtn.disabled = true;
    attackBtn.disabled = true;
    return;
  }

  const t = state.territories[state.selected];
  infoBox.innerHTML = `
    <strong>${t.name}</strong><br>
    Eier: ${state.players[t.owner].name}<br>
    Tropper: ${t.troops}<br>
    Tanks: ${t.tanks}
  `;

  const isOwner = t.owner === state.turn;

  fortifyBtn.disabled = !isOwner || state.players[state.turn].money < 10;
  attackBtn.disabled = isOwner;
}

// =========================
//   TERRITORIEVALG
// =========================

document.querySelectorAll(".territory").forEach(btn => {
  btn.addEventListener("click", () => {
    state.selected = btn.dataset.id;
    render();
  });
});

// =========================
//   FORSTERKING
// =========================

fortifyBtn.addEventListener("click", () => {
  const player = state.players[state.turn];
  if (player.money < 10) return;

  const t = state.territories[state.selected];
  t.troops += 5;
  player.money -= 10;

  render();
});

// =========================
//   ANGREP + COUNTER
// =========================

attackBtn.addEventListener("click", () => {
  const attacker = state.players[state.turn];
  const t = state.territories[state.selected];

  // 50% sjanse for counter
  const counter = Math.random() < 0.5;

  if (counter) {
    // Counter: angriper mister penger
    attacker.money = Math.max(0, attacker.money - 10);
    alert("Angrepet ble counteret! Du mistet 10 penger.");
  } else {
    // Angrep lykkes
    t.troops = Math.max(0, t.troops - 20);
    attacker.money += 15;

    // Erobring hvis tropper = 0
    if (t.troops === 0) {
      t.owner = state.turn;
      t.troops = 30; // starttropp etter erobring
      alert(`${t.name} er erobret!`);
    }
  }

  render();
});

// =========================
//   TURBYTTE + TIMER
// =========================

function startTurnTimer() {
  if (state.interval) clearInterval(state.interval);

  state.timer = 60;

  state.interval = setInterval(() => {
    state.timer--;
    render();

    if (state.timer <= 0) {
      endTurn();
    }
  }, 1000);
}

function endTurn() {
  state.turn = state.turn === "player1" ? "player2" : "player1";
  state.selected = null;
  startTurnTimer();
  render();
}

endTurnBtn.addEventListener("click", endTurn);

// Start første tur
startTurnTimer();
render();
