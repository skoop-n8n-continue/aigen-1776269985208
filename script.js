/**
 * Skoop Cricket Match Simulation Engine
 * Optimized for Digital Signage
 */

const state = {
    battingTeam: "TITANS",
    bowlingTeam: "DRAGONS",
    runs: 0,
    wickets: 0,
    overs: 0,
    ballsInOver: 0,
    maxOvers: 20,
    target: null,
    isFirstInnings: true,
    matchStatus: "TITANS WON THE TOSS AND CHOSE TO BAT",
    last6Balls: [],
    partnership: { runs: 0, balls: 0 },
    batters: [
        { name: "A. Sharma", runs: 0, balls: 0, fours: 0, sixes: 0, active: true },
        { name: "J. Root", runs: 0, balls: 0, fours: 0, sixes: 0, active: true }
    ],
    bowler: { name: "M. Starc", overs: 0, maidens: 0, runs: 0, wickets: 0 },
    commentary: [
        "Welcome to the Skoop Cricket Premier League!",
        "The players are taking their positions.",
        "Beautiful evening for a cricket match."
    ]
};

const teams = {
    TITANS: ["A. Sharma", "J. Root", "V. Kohli", "B. Stokes", "G. Maxwell", "R. Pant", "R. Jadeja", "P. Cummins", "R. Khan", "J. Bumrah", "M. Shami"],
    DRAGONS: ["Q. de Kock", "D. Warner", "S. Smith", "K. Williamson", "N. Pooran", "H. Pandya", "A. Russell", "M. Starc", "K. Rabada", "T. Boult", "A. Zampa"]
};

function updateUI() {
    document.getElementById('batting-team').textContent = state.battingTeam;
    document.getElementById('bowling-team').textContent = state.bowlingTeam;
    document.getElementById('runs').textContent = state.runs;
    document.getElementById('wickets').textContent = state.wickets;
    document.getElementById('overs').textContent = `${state.overs}.${state.ballsInOver}`;

    const crr = state.overs === 0 && state.ballsInOver === 0 ? "0.00" : (state.runs / (state.overs + state.ballsInOver / 6)).toFixed(2);
    document.getElementById('crr').textContent = crr;

    if (!state.isFirstInnings) {
        document.getElementById('target-container').style.display = 'flex';
        document.getElementById('target-display').style.opacity = '1';
        document.getElementById('target-value').textContent = state.target;

        const remainingBalls = (state.maxOvers * 6) - (state.overs * 6 + state.ballsInOver);
        const runsNeeded = state.target - state.runs;
        const rrr = remainingBalls <= 0 ? "0.00" : ((runsNeeded / remainingBalls) * 6).toFixed(2);
        document.getElementById('rrr').textContent = rrr;
    }

    document.getElementById('match-status').textContent = state.matchStatus;
    document.getElementById('partnership-value').textContent = `${state.partnership.runs} (${state.partnership.balls})`;

    // Update Batting Stats
    const battingList = document.getElementById('batting-stats');
    battingList.innerHTML = `
        <div class="stat-row header">
            <div class="name">BATTER</div>
            <div>R</div>
            <div>B</div>
            <div>4s</div>
            <div>6s</div>
            <div>SR</div>
        </div>
    ` + state.batters.map(b => `
        <div class="stat-row">
            <div class="name ${b.active ? 'highlight' : ''}">${b.name}${b.active ? '*' : ''}</div>
            <div class="highlight">${b.runs}</div>
            <div>${b.balls}</div>
            <div>${b.fours}</div>
            <div>${b.sixes}</div>
            <div>${b.balls === 0 ? '0.0' : ((b.runs / b.balls) * 100).toFixed(1)}</div>
        </div>
    `).join('');

    // Update Bowling Stats
    const bowlingList = document.getElementById('bowling-stats');
    bowlingList.innerHTML = `
        <div class="stat-row header bowl-row">
            <div class="name">BOWLER</div>
            <div>O</div>
            <div>M</div>
            <div>R</div>
            <div>W</div>
            <div>ECON</div>
        </div>
        <div class="stat-row bowl-row">
            <div class="name highlight">${state.bowler.name}</div>
            <div>${state.bowler.overs}</div>
            <div>${state.bowler.maidens}</div>
            <div class="highlight">${state.bowler.runs}</div>
            <div class="highlight">${state.bowler.wickets}</div>
            <div>${state.bowler.overs === 0 ? '0.00' : (state.bowler.runs / state.bowler.overs).toFixed(2)}</div>
        </div>
    `;

    // Update Timeline
    const timeline = document.getElementById('ball-timeline');
    timeline.innerHTML = state.last6Balls.map(b => {
        let cls = '';
        if (b === 'W') cls = 'wicket';
        else if (b === 4) cls = 'boundary-4';
        else if (b === 6) cls = 'boundary-6';
        else if (b === 'Wd' || b === 'Nb') cls = 'wide';
        return `<div class="ball ${cls}">${b}</div>`;
    }).join('');

    // Update Ticker
    const ticker = document.getElementById('commentary-ticker');
    ticker.textContent = state.commentary.join(' • ');
    ticker.style.animation = 'none';
    ticker.offsetHeight; // trigger reflow
    ticker.style.animation = `ticker ${state.commentary.join(' • ').length * 0.2}s linear infinite`;
}

function simulateBall() {
    if (state.matchStatus.includes("WIN") || state.matchStatus.includes("DRAW")) return;

    const outcomes = [0, 1, 2, 3, 4, 6, 'W', 0, 1, 1, 2, 0, 'Wd', 0, 1];
    let result = outcomes[Math.floor(Math.random() * outcomes.length)];

    // Logic adjustments for chase
    if (!state.isFirstInnings) {
        const runsNeeded = state.target - state.runs;
        if (runsNeeded < 10) outcomes.push(1, 1, 1, 0, 0); // more cautious
        if (runsNeeded > 30) outcomes.push(4, 6, 'W'); // risky
    }

    state.last6Balls.push(result);
    if (state.last6Balls.length > 6) state.last6Balls.shift();

    const activeBatter = state.batters[0]; // Simple logic: first batter is on strike

    if (result === 'W') {
        state.wickets++;
        state.bowler.wickets++;
        state.partnership = { runs: 0, balls: 0 };
        state.commentary.unshift(`OUT! ${activeBatter.name} is gone!`);

        if (state.wickets >= 10) {
            endInnings();
        } else {
            const nextBatterName = teams[state.battingTeam][state.wickets + 1] || "Tailender";
            state.batters[0] = { name: nextBatterName, runs: 0, balls: 0, fours: 0, sixes: 0, active: true };
        }
    } else if (result === 'Wd' || result === 'Nb') {
        state.runs += 1;
        state.bowler.runs += 1;
        // Ball doesn't count towards over
    } else {
        state.runs += result;
        state.bowler.runs += result;
        state.partnership.runs += result;
        state.partnership.balls += 1;
        activeBatter.runs += result;
        activeBatter.balls += 1;
        if (result === 4) activeBatter.fours++;
        if (result === 6) activeBatter.sixes++;

        state.ballsInOver++;
        if (state.ballsInOver >= 6) {
            state.overs++;
            state.ballsInOver = 0;
            state.bowler.overs++;
            if (state.overs >= state.maxOvers) {
                endInnings();
            }
        }

        // Swap strike on odd runs (simple simulation)
        if (result % 2 !== 0) {
            state.batters.reverse();
        }
    }

    if (!state.isFirstInnings && state.runs >= state.target) {
        state.matchStatus = `${state.battingTeam} WON BY ${10 - state.wickets} WICKETS`;
        state.commentary.unshift(`Victory for ${state.battingTeam}! Incredible run chase.`);
    }

    if (state.commentary.length > 10) state.commentary.pop();
    updateUI();
}

function endInnings() {
    if (state.isFirstInnings) {
        state.target = state.runs + 1;
        state.isFirstInnings = false;
        const prevBatting = state.battingTeam;
        state.battingTeam = state.bowlingTeam;
        state.bowlingTeam = prevBatting;
        state.runs = 0;
        state.wickets = 0;
        state.overs = 0;
        state.ballsInOver = 0;
        state.last6Balls = [];
        state.partnership = { runs: 0, balls: 0 };
        state.batters = [
            { name: teams[state.battingTeam][0], runs: 0, balls: 0, fours: 0, sixes: 0, active: true },
            { name: teams[state.battingTeam][1], runs: 0, balls: 0, fours: 0, sixes: 0, active: true }
        ];
        state.bowler = { name: teams[state.bowlingTeam][7], overs: 0, maidens: 0, runs: 0, wickets: 0 };
        state.matchStatus = `${state.battingTeam} NEEDS ${state.target} TO WIN`;
        state.commentary.unshift(`Innings Break. ${state.battingTeam} need ${state.target} runs to win.`);
    } else {
        if (state.runs < state.target - 1) {
            state.matchStatus = `${state.bowlingTeam} WON BY ${state.target - 1 - state.runs} RUNS`;
        } else if (state.runs === state.target - 1) {
            state.matchStatus = "MATCH TIED";
        }
    }
}

// Start simulation
updateUI();
setInterval(simulateBall, 4000); // New ball every 4 seconds
