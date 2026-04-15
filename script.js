document.addEventListener('DOMContentLoaded', () => {
    // Game State
    const state = {
        runs: 184,
        wickets: 3,
        overs: 24,
        balls: 2,
        batter1: { name: 'Virat Kohli', runs: 82, balls: 54 },
        batter2: { name: 'Hardik Pandya', runs: 12, balls: 8 },
        bowler: { name: 'Pat Cummins', runs: 42, wickets: 1, overs: 5, balls: 2 },
        recentBalls: ['1', '4', '0', 'W', '1', '6'],
        crr: 7.60
    };

    // DOM Elements
    const elements = {
        score: document.getElementById('score'),
        overs: document.getElementById('overs'),
        crr: document.getElementById('crr'),
        batter1Runs: document.getElementById('batter1-runs'),
        batter1Balls: document.getElementById('batter1-balls'),
        batter2Runs: document.getElementById('batter2-runs'),
        batter2Balls: document.getElementById('batter2-balls'),
        bowlerStats: document.getElementById('bowler-stats'),
        bowlerOvers: document.getElementById('bowler-overs'),
        recentBalls: document.getElementById('recent-balls'),
        newsTicker: document.getElementById('news-ticker')
    };

    function updateUI() {
        elements.score.textContent = `${state.runs}/${state.wickets}`;
        elements.overs.textContent = `(${state.overs}.${state.balls})`;
        elements.crr.textContent = state.crr.toFixed(2);

        elements.batter1Runs.textContent = `${state.batter1.runs}*`;
        elements.batter1Balls.textContent = `(${state.batter1.balls})`;

        elements.batter2Runs.textContent = `${state.batter2.runs}`;
        elements.batter2Balls.textContent = `(${state.batter2.balls})`;

        elements.bowlerStats.textContent = `${state.bowler.wickets}-${state.bowler.runs}`;
        elements.bowlerOvers.textContent = `(${state.bowler.overs}.${state.bowler.balls})`;

        // Update Timeline
        elements.recentBalls.innerHTML = '';
        state.recentBalls.forEach(ball => {
            const ballEl = document.createElement('div');
            ballEl.className = 'ball';
            if (ball === 'W') ballEl.classList.add('wicket');
            if (ball === '4') ballEl.classList.add('boundary');
            if (ball === '6') ballEl.classList.add('six');
            ballEl.textContent = ball;
            elements.recentBalls.appendChild(ballEl);
        });
    }

    function simulateBall() {
        // Random outcome
        const outcomes = ['0', '1', '2', '4', '6', 'W', '1', '0', '1'];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

        // Update balls
        state.balls++;
        state.bowler.balls++;
        if (state.balls > 5) {
            state.balls = 0;
            state.overs++;
        }
        if (state.bowler.balls > 5) {
            state.bowler.balls = 0;
            state.bowler.overs++;
        }

        // Update outcome
        if (outcome === 'W') {
            state.wickets++;
            state.bowler.wickets++;
            // Reset "out" batter
            state.batter1.runs = 0;
            state.batter1.balls = 0;
        } else {
            const runs = parseInt(outcome) || 0;
            state.runs += runs;
            state.batter1.runs += runs;
            state.batter1.balls++;
            state.bowler.runs += runs;
        }

        // Update Timeline
        state.recentBalls.push(outcome);
        if (state.recentBalls.length > 8) {
            state.recentBalls.shift();
        }

        // Update CRR
        const totalBalls = state.overs * 6 + state.balls;
        if (totalBalls > 0) {
            state.crr = (state.runs / totalBalls) * 6;
        }

        updateUI();

        // Add excitement to news ticker if it's a boundary
        if (outcome === '4' || outcome === '6') {
            addNews(`SHOCKWAVE! ${state.batter1.name} hits a massive ${outcome}! The crowd is going wild!`);
        }
    }

    function addNews(text) {
        const span = document.createElement('span');
        span.textContent = text;
        elements.newsTicker.prepend(span);
        // Limit ticker items
        if (elements.newsTicker.children.length > 10) {
            elements.newsTicker.lastElementChild.remove();
        }
    }

    // Initial Render
    updateUI();

    // Simulation Loop (Every 4 seconds a ball is bowled)
    setInterval(simulateBall, 4000);
});
