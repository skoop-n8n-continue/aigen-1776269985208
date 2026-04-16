/**
 * Skoop Tennis Match Simulation Engine
 * Optimized for Digital Signage
 */

const state = {
    players: [
        {
            name: "C. ALCARAZ",
            country: "ESP",
            sets: 0,
            games: [0],
            points: 0,
            stats: { aces: 0, winners: 0, fsrv: 0, fsrvTotal: 0, ue: 0 }
        },
        {
            name: "J. SINNER",
            country: "ITA",
            sets: 0,
            games: [0],
            points: 0,
            stats: { aces: 0, winners: 0, fsrv: 0, fsrvTotal: 0, ue: 0 }
        }
    ],
    serverIndex: 0,
    setIndex: 0,
    matchTime: 0,
    events: ["Match Started"]
};

const pointValues = [0, 15, 30, 40, "AD"];

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}

function updateUI() {
    // Header
    document.getElementById('match-time').textContent = formatTime(state.matchTime);

    // Scoreboard
    state.players.forEach((player, i) => {
        const pNum = i + 1;
        document.getElementById(`p${pNum}-sets`).textContent = player.sets;
        document.getElementById(`p${pNum}-points`).textContent = typeof player.points === 'number' ? pointValues[player.points] : player.points;
        document.getElementById(`p${pNum}-serve`).textContent = state.serverIndex === i ? '🎾' : '';

        const gamesContainer = document.getElementById(`p${pNum}-games`);
        gamesContainer.innerHTML = player.games.map((g, idx) => {
            const isCurrent = idx === state.setIndex;
            return `<span class="game-score ${isCurrent ? 'current' : 'past'}">${g}</span>`;
        }).join('');

        // Stats
        document.getElementById(`p${pNum}-aces`).textContent = player.stats.aces;
        document.getElementById(`p${pNum}-winners`).textContent = player.stats.winners;
        document.getElementById(`p${pNum}-ue`).textContent = player.stats.ue;

        const fsrvPerc = player.stats.fsrvTotal === 0 ? 0 : Math.round((player.stats.fsrv / player.stats.fsrvTotal) * 100);
        document.getElementById(`p${pNum}-fsrv`).textContent = `${fsrvPerc}%`;

        // Bars
        const otherPlayer = state.players[1 - i];
        const aceTotal = player.stats.aces + otherPlayer.stats.aces;
        document.getElementById(`p1-aces-bar`).style.width = aceTotal === 0 ? '50%' : `${(state.players[0].stats.aces / aceTotal) * 100}%`;
        document.getElementById(`p2-aces-bar`).style.width = aceTotal === 0 ? '50%' : `${(state.players[1].stats.aces / aceTotal) * 100}%`;

        const winnerTotal = player.stats.winners + otherPlayer.stats.winners;
        document.getElementById(`p1-winners-bar`).style.width = winnerTotal === 0 ? '50%' : `${(state.players[0].stats.winners / winnerTotal) * 100}%`;
        document.getElementById(`p2-winners-bar`).style.width = winnerTotal === 0 ? '50%' : `${(state.players[1].stats.winners / winnerTotal) * 100}%`;

        const ueTotal = player.stats.ue + otherPlayer.stats.ue;
        document.getElementById(`p1-ue-bar`).style.width = ueTotal === 0 ? '50%' : `${(state.players[0].stats.ue / ueTotal) * 100}%`;
        document.getElementById(`p2-ue-bar`).style.width = ueTotal === 0 ? '50%' : `${(state.players[1].stats.ue / ueTotal) * 100}%`;

        const fsrvP1 = state.players[0].stats.fsrvTotal === 0 ? 0 : (state.players[0].stats.fsrv / state.players[0].stats.fsrvTotal);
        const fsrvP2 = state.players[1].stats.fsrvTotal === 0 ? 0 : (state.players[1].stats.fsrv / state.players[1].stats.fsrvTotal);
        const fsrvTotal = fsrvP1 + fsrvP2;
        document.getElementById(`p1-fsrv-bar`).style.width = fsrvTotal === 0 ? '50%' : `${(fsrvP1 / fsrvTotal) * 100}%`;
        document.getElementById(`p2-fsrv-bar`).style.width = fsrvTotal === 0 ? '50%' : `${(fsrvP2 / fsrvTotal) * 100}%`;
    });

    // Events
    const logContainer = document.getElementById('event-log');
    logContainer.innerHTML = state.events.slice(-5).reverse().map(e => `<div class="event-item">${e}</div>`).join('');
}

function addEvent(msg) {
    state.events.push(msg);
}

function simulatePoint() {
    state.matchTime += 15; // Simulate time passing

    const winnerIndex = Math.random() > 0.5 ? 0 : 1;
    const loserIndex = 1 - winnerIndex;
    const winner = state.players[winnerIndex];
    const loser = state.players[loserIndex];

    // Determine type of point
    const rand = Math.random();
    if (rand < 0.1) {
        winner.stats.aces++;
        winner.stats.winners++;
        addEvent(`Ace by ${winner.name}`);
    } else if (rand < 0.3) {
        winner.stats.winners++;
        addEvent(`Winner by ${winner.name}`);
    } else if (rand < 0.5) {
        loser.stats.ue++;
        addEvent(`Unforced error by ${loser.name}`);
    } else {
        addEvent(`Point for ${winner.name}`);
    }

    // Serve stats (server is winner or loser)
    const server = state.players[state.serverIndex];
    server.stats.fsrvTotal++;
    if (Math.random() > 0.3) server.stats.fsrv++;

    // Scoring logic
    if (winner.points === 3 && loser.points < 3) {
        // Winner wins game
        winGame(winnerIndex);
    } else if (winner.points === 3 && loser.points === 3) {
        // Deuce to Ad
        winner.points = "AD";
    } else if (winner.points === "AD") {
        // Ad to game
        winGame(winnerIndex);
    } else if (loser.points === "AD") {
        // Opponent Ad back to Deuce
        loser.points = 3;
    } else {
        winner.points++;
    }

    updateUI();
}

function winGame(playerIndex) {
    state.players[0].points = 0;
    state.players[1].points = 0;
    state.players[playerIndex].games[state.setIndex]++;

    addEvent(`Game ${state.players[playerIndex].name}`);

    const games1 = state.players[0].games[state.setIndex];
    const games2 = state.players[1].games[state.setIndex];

    // Win Set logic
    if ((games1 >= 6 || games2 >= 6) && Math.abs(games1 - games2) >= 2) {
        winSet(playerIndex);
    } else if (games1 === 6 && games2 === 6) {
        // Tiebreak simulation (simplified: next point wins set)
        winSet(playerIndex);
    }

    // Swap server
    state.serverIndex = 1 - state.serverIndex;
}

function winSet(playerIndex) {
    state.players[playerIndex].sets++;
    addEvent(`Set ${state.players[playerIndex].name}`);

    if (state.players[playerIndex].sets === 2) {
        addEvent(`MATCH POINT: ${state.players[playerIndex].name}`);
        // In reality, match would end, but for signage we'll just reset after a bit
        setTimeout(() => location.reload(), 10000);
    } else {
        state.setIndex++;
        state.players[0].games.push(0);
        state.players[1].games.push(0);
    }
}

// Initialize and start
updateUI();
setInterval(simulatePoint, 5000); // Point every 5 seconds
setInterval(() => {
    state.matchTime++;
    document.getElementById('match-time').textContent = formatTime(state.matchTime);
}, 1000);
