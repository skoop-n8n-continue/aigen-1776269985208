const teamA = {
    name: "TITANS",
    score: 18,
    sets: 2,
    serving: true,
    stats: [
        { name: "J. Miller", kills: 14, blocks: 3, aces: 2 },
        { name: "A. Chen", kills: 11, blocks: 5, aces: 1 }
    ]
};

const teamB = {
    name: "DRAGONS",
    score: 15,
    sets: 1,
    serving: false,
    stats: [
        { name: "S. Rossi", kills: 16, blocks: 2, aces: 3 },
        { name: "M. Taylor", kills: 9, blocks: 4, aces: 1 }
    ]
};

const tickerMessages = [
    "High intensity match at the National Arena!",
    "Dragons mounting a comeback in the 4th set...",
    "Titans leading 2 sets to 1.",
    "J. Miller dominating the net for the Titans.",
    "Spectacular save by Dragons libero!",
    "Next point could be crucial for this set."
];

function updateUI() {
    document.getElementById('score-a').textContent = teamA.score;
    document.getElementById('score-b').textContent = teamB.score;

    document.getElementById('serve-a').textContent = teamA.serving ? '●' : '';
    document.getElementById('serve-b').textContent = teamB.serving ? '●' : '';

    const statsGrid = document.getElementById('stats-grid');
    statsGrid.innerHTML = '';

    const allStats = [
        ...teamA.stats.map(s => ({ ...s, team: 'Titans' })),
        ...teamB.stats.map(s => ({ ...s, team: 'Dragons' }))
    ];

    allStats.forEach(stat => {
        const div = document.createElement('div');
        div.className = 'stat-item';
        div.innerHTML = `
            <div>
                <div class="stat-player">${stat.name}</div>
                <div class="stat-label">${stat.team}</div>
            </div>
            <div class="stat-value">${stat.kills} <span style="font-size:12px; opacity:0.6">KILLS</span></div>
        `;
        statsGrid.appendChild(div);
    });
}

function simulateMatch() {
    // Randomly award point
    const winner = Math.random() > 0.45 ? teamA : teamB;
    winner.score++;

    // Switch serve if necessary
    if (!winner.serving) {
        teamA.serving = !teamA.serving;
        teamB.serving = !teamB.serving;
    }

    // Update stats randomly
    if (Math.random() > 0.7) {
        const player = winner.stats[Math.floor(Math.random() * winner.stats.length)];
        player.kills++;
    }

    // Check for set win
    if (winner.score >= 25 && (winner.score - (winner === teamA ? teamB.score : teamA.score) >= 2)) {
        winner.sets++;
        teamA.score = 0;
        teamB.score = 0;
    }

    updateUI();
}

// Initial update
updateUI();

// Run simulation every 5 seconds
setInterval(simulateMatch, 5000);

// Rotate ticker text every 15 seconds
let tickerIndex = 0;
setInterval(() => {
    tickerIndex = (tickerIndex + 1) % tickerMessages.length;
    document.getElementById('ticker-text').textContent = tickerMessages[tickerIndex];
}, 15000);
