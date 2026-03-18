// Spillstate
let state = {
  turn: "player1",
  players: {
    player1: { name: "Spiller 1", color: "#4caf50" },
    player2: { name: "Spiller 2", color: "#f44336" }
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

const turnPlayer = document.getElementById("turn-player");
const infoBox = document.getElementById("territory-info");
const fortifyBtn = document.getElementById("fortify-btn");
const attackBtn = document.getElementById("attack-btn");
const endTurnBtn = document.getElementById("end-turn-btn");

function render() {
  const p = state.players[state.turn];
  turnPlayer.textContent = `Tur: ${p.name}`;
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
  fortifyBtn.disabled = !isOwner;
  attackBtn.disabled = isOwner; // kan ikke angripe eget land
}

document.querySelectorAll(".territory").forEach(btn => {
  btn.addEventListener("click", () => {
    state.selected = btn.dataset.id;
    render();
  });
});

fortifyBtn.addEventListener("click", () => {
  const t = state.territories[state.selected];
  t.troops += 5;
  render();
});

attackBtn.addEventListener("click", () => {
  const t = state.territories[state.selected];
  t.troops = Math.max(0, t.troops - 10);
  render();
});

endTurnBtn.addEventListener("click", () => {
  state.turn = state.turn === "player1" ? "player2" : "player1";
  state.selected = null;
  render();
});

render();
