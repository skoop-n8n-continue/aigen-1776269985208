/**
 * Skoop Football Match Simulation Engine
 * Optimized for Digital Signage
 */

const matchState = {
    minutes: 72,
    seconds: 14,
    half: 2,
    homeScore: 1,
    awayScore: 1,
    isPaused: false,
    stoppageTime: 0
};

const homeTeam = {
    name: "METRO CITY",
    short: "MC",
    possession: 54,
    shots: 12,
    shotsOnTarget: 5,
    corners: 6,
    fouls: 8,
    players: [
        { name: "Marcus V.", goals: 1, rating: 8.2 },
        { name: "Julian S.", goals: 0, rating: 7.5 },
        { name: "David L.", goals: 0, rating: 7.1 }
    ]
};

const awayTeam = {
    name: "UNITED STARS",
    short: "US",
    possession: 46,
    shots: 9,
    shotsOnTarget: 4,
    corners: 4,
    fouls: 11,
    players: [
        { name: "Leo Rossi", goals: 1, rating: 7.9 },
        { name: "Kevin D.", goals: 0, rating: 7.4 },
        { name: "Alex P.", goals: 0, rating: 6.8 }
    ]
};

const liveEvents = [
    { time: "12'", type: "yellow", text: "Yellow Card: Julian S. (Metro City)" },
    { time: "28'", type: "goal", text: "GOAL! Marcus V. scores for Metro City" },
    { time: "44'", type: "goal", text: "GOAL! Leo Rossi equalizes for United Stars" },
    { time: "58'", type: "yellow", text: "Yellow Card: Alex P. (United Stars)" },
    { time: "65'", type: "substitution", text: "Substitution: Kevin D. replaced by Sam T." }
];

const newsTicker = [
    "Metro City looking for a winner in the final 20 minutes...",
    "United Stars defense holding strong under pressure.",
    "Stadium Attendance: 54,200 tonight at Skoop Arena.",
    "Next Match: Lions vs Eagles - Tomorrow 20:00 LIVE.",
    "Player of the Month nominations are now open on the app.",
    "Perfect conditions for football: 18°C, Clear Skies."
];

function formatTime(min, sec) {
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function updateScoreboard() {
    document.getElementById('home-score').textContent = matchState.homeScore;
    document.getElementById('away-score').textContent = matchState.awayScore;
    document.getElementById('match-timer').textContent = formatTime(matchState.minutes, matchState.seconds);
    document.getElementById('match-half').textContent = matchState.half === 1 ? '1ST HALF' : '2ND HALF';
}

function updateStats() {
    const statsList = document.getElementById('stats-list');
    const stats = [
        { label: 'POSSESSION', home: homeTeam.possession, away: awayTeam.possession, unit: '%' },
        { label: 'SHOTS', home: homeTeam.shots, away: awayTeam.shots, unit: '' },
        { label: 'ON TARGET', home: homeTeam.shotsOnTarget, away: awayTeam.shotsOnTarget, unit: '' },
        { label: 'CORNERS', home: homeTeam.corners, away: awayTeam.corners, unit: '' }
    ];

    statsList.innerHTML = stats.map(s => `
        <div class="stat-row">
            <div class="stat-labels">
                <span>${s.home}${s.unit}</span>
                <span>${s.label}</span>
                <span>${s.away}${s.unit}</span>
            </div>
            <div class="stat-bar-bg">
                <div class="stat-bar-home" style="width: ${(s.home / (s.home + s.away)) * 100}%"></div>
                <div class="stat-bar-away" style="width: ${(s.away / (s.home + s.away)) * 100}%"></div>
            </div>
        </div>
    `).join('');
}

function updateEvents() {
    const eventsList = document.getElementById('events-list');
    eventsList.innerHTML = liveEvents.slice(-5).reverse().map(e => `
        <div class="event-item">
            <div class="event-time">${e.time}</div>
            <div class="event-text">${e.text}</div>
        </div>
    `).join('');
}

function updatePerformance() {
    const perfList = document.getElementById('performance-list');
    const allPlayers = [
        ...homeTeam.players.map(p => ({ ...p, team: homeTeam.name })),
        ...awayTeam.players.map(p => ({ ...p, team: awayTeam.name }))
    ].sort((a, b) => b.rating - a.rating);

    perfList.innerHTML = allPlayers.slice(0, 4).map(p => `
        <div class="player-row">
            <div class="player-photo">${p.name[0]}</div>
            <div class="player-details">
                <div class="player-name">${p.name}</div>
                <div class="player-team">${p.team}</div>
            </div>
            <div class="player-stat-val">${p.rating}</div>
        </div>
    `).join('');
}

function simulateStep() {
    if (matchState.isPaused) return;

    // Advance clock
    matchState.seconds++;
    if (matchState.seconds >= 60) {
        matchState.seconds = 0;
        matchState.minutes++;
    }

    // Full match ends
    if (matchState.minutes >= 90 && matchState.half === 2) {
        matchState.isPaused = true;
        addEvent("90'", "Full Time: 1-1 Draw");
    }

    // Random events simulation (lower frequency)
    const rand = Math.random();

    // Stats fluctuation
    if (rand > 0.95) {
        homeTeam.possession = Math.max(40, Math.min(60, homeTeam.possession + (Math.random() > 0.5 ? 1 : -1)));
        awayTeam.possession = 100 - homeTeam.possession;
        updateStats();
    }

    if (rand > 0.98) {
        const team = Math.random() > 0.5 ? homeTeam : awayTeam;
        team.shots++;
        if (Math.random() > 0.6) team.shotsOnTarget++;
        updateStats();
    }

    // Rare game changing events
    if (rand > 0.998) {
        const team = Math.random() > 0.5 ? "home" : "away";
        if (team === "home") {
            matchState.homeScore++;
            addEvent(`${matchState.minutes}'`, `GOAL! Dramatic lead for ${homeTeam.name}!`);
            homeTeam.players[0].goals++;
            homeTeam.players[0].rating += 0.5;
        } else {
            matchState.awayScore++;
            addEvent(`${matchState.minutes}'`, `GOAL! ${awayTeam.name} take the lead!`);
            awayTeam.players[0].goals++;
            awayTeam.players[0].rating += 0.5;
        }
        updatePerformance();
    }

    updateScoreboard();
}

function addEvent(time, text) {
    liveEvents.push({ time, text });
    updateEvents();
}

// Initial Render
updateScoreboard();
updateStats();
updateEvents();
updatePerformance();

// Start Simulation
setInterval(simulateStep, 1000); // 1 sec real time = 1 sec game time for visual effect

// Ticker rotation
let tickerIndex = 0;
setInterval(() => {
    tickerIndex = (tickerIndex + 1) % newsTicker.length;
    document.getElementById('news-ticker').textContent = newsTicker[tickerIndex];
}, 10000);
