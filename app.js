// Firebase Configuration - Using a public demo database for testing
// For production, replace with your own Firebase project
const firebaseConfig = {
    apiKey: "AIzaSyBpKhK7F8F8F8F8F8F8F8F8F8F8F8F8F8F",
    authDomain: "quiz-demo-12345.firebaseapp.com",
    databaseURL: "https://quiz-demo-12345-default-rtdb.firebaseio.com",
    projectId: "quiz-demo-12345",
    storageBucket: "quiz-demo-12345.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789012345"
};

// Try to initialize Firebase, fallback to localStorage if it fails
let database;
let useLocalStorage = false;

try {
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.warn('Firebase initialization failed, using localStorage fallback:', error);
    useLocalStorage = true;
}

// Game Constants
const GAME_PIN = "483921";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "ibmbob2024";
const QUESTION_TIME = 20;
const MAX_POINTS = 1000;

// IBM Quiz Questions with Fun Facts
const questions = [
    {
        question: "What does IBM stand for?",
        answers: ["International Business Machines", "Internet Business Management", "Integrated Business Models", "International Banking Machines"],
        correct: 0,
        funFact: "IBM was founded in 1911 and has been a pioneer in computing technology for over a century!"
    },
    {
        question: "In what year was IBM founded?",
        answers: ["1911", "1924", "1935", "1945"],
        correct: 0,
        funFact: "IBM started as the Computing-Tabulating-Recording Company (CTR) and was renamed IBM in 1924."
    },
    {
        question: "What is IBM Watson primarily known for?",
        answers: ["Artificial Intelligence", "Cloud Storage", "Quantum Computing", "Blockchain"],
        correct: 0,
        funFact: "IBM Watson famously won Jeopardy! in 2011, defeating two of the show's greatest champions!"
    },
    {
        question: "Which IBM mainframe series is known for enterprise computing?",
        answers: ["IBM PC", "IBM Z", "IBM ThinkPad", "IBM AS/400"],
        correct: 1,
        funFact: "IBM Z mainframes process 87% of all credit card transactions and 8 trillion payments per year!"
    },
    {
        question: "What is IBM's quantum computer called?",
        answers: ["IBM Watson", "IBM Q", "IBM Deep Blue", "IBM Summit"],
        correct: 1,
        funFact: "IBM Q systems are among the most advanced quantum computers, with over 100 qubits in development!"
    },
    {
        question: "Which chess champion did IBM's Deep Blue defeat in 1997?",
        answers: ["Bobby Fischer", "Garry Kasparov", "Magnus Carlsen", "Anatoly Karpov"],
        correct: 1,
        funFact: "Deep Blue's victory was a historic moment, marking the first time a computer defeated a reigning world chess champion!"
    },
    {
        question: "What is IBM's cloud platform called?",
        answers: ["IBM Azure", "IBM Cloud", "IBM Web Services", "IBM SkyNet"],
        correct: 1,
        funFact: "IBM Cloud offers over 170 products and services including AI, IoT, blockchain, and quantum computing!"
    },
    {
        question: "What is IBM's nickname in the tech industry?",
        answers: ["Big Blue", "Tech Giant", "Blue Machine", "The Corporation"],
        correct: 0,
        funFact: "IBM earned the nickname 'Big Blue' from its blue logo and dominant presence in the computer industry!"
    },
    {
        question: "Which IBM technology helps businesses automate processes?",
        answers: ["IBM Watson", "IBM RPA", "IBM Automation", "All of the above"],
        correct: 3,
        funFact: "IBM's automation technologies help businesses save millions by streamlining repetitive tasks and workflows!"
    },
    {
        question: "What was IBM's original name?",
        answers: ["Computing-Tabulating-Recording Company", "International Computing Corp", "Business Machines Inc", "Tabulating Machine Company"],
        correct: 0,
        funFact: "CTR was formed through a merger of three companies and later became IBM under Thomas J. Watson's leadership!"
    }
];

// Emoji pool for random avatars
const emojis = ["😀", "😎", "🤓", "😊", "🥳", "🤩", "😺", "🦊", "🐼", "🦁", "🐯", "🐸", "🦄", "🐙", "🦋", "🌟", "⚡", "🔥", "💎", "🎯"];

// Local State
let currentUser = null;
let isAdmin = false;
let myEmoji = null;
let timerInterval = null;
let questionStartTime = null;
let hasAnswered = false;
let updateInterval = null;

// LocalStorage fallback functions
const LocalDB = {
    get(path) {
        const data = localStorage.getItem('quiz_' + path);
        return data ? JSON.parse(data) : null;
    },
    set(path, value) {
        localStorage.setItem('quiz_' + path, JSON.stringify(value));
        this.triggerUpdate();
    },
    update(path, updates) {
        const current = this.get(path) || {};
        this.set(path, { ...current, ...updates });
    },
    remove(path) {
        localStorage.removeItem('quiz_' + path);
        this.triggerUpdate();
    },
    listeners: [],
    on(path, callback) {
        this.listeners.push({ path, callback });
    },
    triggerUpdate() {
        // Simulate real-time updates
        setTimeout(() => {
            this.listeners.forEach(({ path, callback }) => {
                const data = this.get(path);
                callback({ val: () => data });
            });
        }, 50);
    }
};

// Database wrapper that works with both Firebase and localStorage
const DB = {
    ref(path) {
        if (useLocalStorage) {
            return {
                set: (value) => LocalDB.set(path, value),
                update: (updates) => LocalDB.update(path, updates),
                once: (event, callback) => {
                    const data = LocalDB.get(path);
                    callback({ val: () => data });
                    return Promise.resolve({ val: () => data });
                },
                on: (event, callback) => LocalDB.on(path, callback),
                child: (childPath) => DB.ref(path + '/' + childPath),
                remove: () => LocalDB.remove(path),
                transaction: (updateFn) => {
                    const current = LocalDB.get(path);
                    const updated = updateFn(current);
                    if (updated !== undefined) {
                        LocalDB.set(path, updated);
                    }
                },
                onDisconnect: () => ({ remove: () => {} })
            };
        } else {
            return database.ref(path);
        }
    }
};

// Initialize game state
function initializeGame() {
    DB.ref('game').set({
        phase: 'lobby',
        currentQuestion: 0,
        questionStartTime: null,
        totalPlayers: 0,
        responsesCount: 0
    });
}

// Admin Login
function adminLogin() {
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value.trim();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isAdmin = true;
        currentUser = 'admin';
        showScreen('admin-panel-screen');
        initializeGame();
        listenToPlayers();
        listenToGameState();
    } else {
        alert('Invalid credentials!');
    }
}

function showAdminLogin() {
    showScreen('admin-login-screen');
}

function showPlayerJoin() {
    showScreen('player-join-screen');
    listenToPlayers();
}

function logout() {
    if (currentUser && !isAdmin) {
        DB.ref('players/' + currentUser).remove();
    }
    currentUser = null;
    isAdmin = false;
    showScreen('admin-login-screen');
}

// Player Join
function joinGame() {
    const name = document.getElementById('player-name-input').value.trim();
    
    if (!name) {
        alert('Please enter your name!');
        return;
    }

    if (name.length > 20) {
        alert('Name must be 20 characters or less!');
        return;
    }

    // Check if name is taken
    DB.ref('players').once('value', (snapshot) => {
        const players = snapshot.val() || {};
        const nameExists = Object.values(players).some(p => p.name === name);
        
        if (nameExists) {
            alert('This name is already taken!');
            return;
        }

        // Generate random emoji
        myEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        // Create player
        const playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        currentUser = playerId;
        
        DB.ref('players/' + playerId).set({
            name: name,
            emoji: myEmoji,
            score: 0,
            answers: {},
            joinedAt: Date.now()
        });

        // Update total players count
        DB.ref('game/totalPlayers').transaction((current) => (current || 0) + 1);

        showScreen('waiting-screen');
        listenToGameState();
        
        // Handle disconnect (only works with Firebase)
        if (!useLocalStorage) {
            DB.ref('players/' + playerId).onDisconnect().remove();
            DB.ref('game/totalPlayers').onDisconnect().transaction((current) => Math.max(0, (current || 1) - 1));
        }
    });
}

// Listen to players
function listenToPlayers() {
    DB.ref('players').on('value', (snapshot) => {
        const players = snapshot.val() || {};
        const playerArray = Object.entries(players).map(([id, data]) => ({
            id,
            ...data
        }));

        updatePlayerGrid(playerArray);
        
        if (isAdmin) {
            document.getElementById('admin-player-count').textContent = playerArray.length;
            updateAdminPlayerList(playerArray);
        } else {
            document.getElementById('player-count').textContent = playerArray.length;
        }
    });
}

function updatePlayerGrid(players) {
    const grid = document.getElementById('player-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    players.forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.innerHTML = `
            <div class="player-emoji">${player.emoji}</div>
            <div class="player-name">${player.name}</div>
        `;
        grid.appendChild(card);
    });
}

function updateAdminPlayerList(players) {
    const list = document.getElementById('admin-player-list');
    if (!list) return;
    
    list.innerHTML = '';
    players.forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.innerHTML = `
            <div class="player-emoji">${player.emoji}</div>
            <div class="player-name">${player.name}</div>
            <div style="color: #00ff88; font-weight: 600;">${player.score} pts</div>
        `;
        list.appendChild(card);
    });
}

// Listen to game state
function listenToGameState() {
    DB.ref('game').on('value', (snapshot) => {
        const game = snapshot.val();
        if (!game) return;

        if (isAdmin) {
            document.getElementById('admin-question-num').textContent = 
                game.phase === 'lobby' ? '-' : `${game.currentQuestion + 1}/10`;
            document.getElementById('admin-response-count').textContent = game.responsesCount || 0;
            
            updateAdminControls(game.phase);
        } else {
            handlePlayerPhase(game);
        }
    });
}

function updateAdminControls(phase) {
    document.getElementById('start-game-btn').style.display = phase === 'lobby' ? 'block' : 'none';
    document.getElementById('next-question-btn').style.display = 
        (phase === 'lobby' || phase === 'leaderboard') && phase !== 'winners' ? 'block' : 'none';
    document.getElementById('reveal-answer-btn').style.display = phase === 'question' ? 'block' : 'none';
    document.getElementById('show-leaderboard-btn').style.display = phase === 'reveal' ? 'block' : 'none';
}

function handlePlayerPhase(game) {
    if (game.phase === 'lobby') {
        showScreen('waiting-screen');
        document.getElementById('waiting-message').textContent = 'Waiting for game to start...';
    } else if (game.phase === 'question') {
        showQuestionToPlayer(game.currentQuestion, game.questionStartTime);
    } else if (game.phase === 'reveal') {
        showRevealToPlayer(game.currentQuestion);
    } else if (game.phase === 'leaderboard') {
        showLeaderboardToPlayer();
    } else if (game.phase === 'winners') {
        showWinnersToPlayer();
    }
}

// Admin: Start Game
function startGame() {
    DB.ref('players').once('value', (snapshot) => {
        const players = snapshot.val();
        if (!players || Object.keys(players).length === 0) {
            alert('At least one player must join!');
            return;
        }

        DB.ref('game').update({
            phase: 'question',
            currentQuestion: 0,
            questionStartTime: Date.now(),
            responsesCount: 0
        });

        // Reset all player scores
        Object.keys(players).forEach(playerId => {
            DB.ref('players/' + playerId).update({
                score: 0,
                answers: {}
            });
        });
    });
}

// Admin: Show Next Question
function showNextQuestion() {
    DB.ref('game').once('value', (snapshot) => {
        const game = snapshot.val();
        const nextQuestion = game.currentQuestion + 1;

        if (nextQuestion >= questions.length) {
            // Game over, show winners
            DB.ref('game').update({
                phase: 'winners'
            });
        } else {
            DB.ref('game').update({
                phase: 'question',
                currentQuestion: nextQuestion,
                questionStartTime: Date.now(),
                responsesCount: 0
            });
        }
    });
}

// Admin: Reveal Answer
function revealAnswer() {
    DB.ref('game').update({
        phase: 'reveal'
    });
}

// Admin: Show Leaderboard
function showLeaderboard() {
    DB.ref('game').update({
        phase: 'leaderboard'
    });
}

// Player: Show Question
function showQuestionToPlayer(questionIndex, startTime) {
    if (hasAnswered) return;
    
    const question = questions[questionIndex];
    showScreen('question-screen');

    // Update header
    DB.ref('players/' + currentUser).once('value', (snapshot) => {
        const player = snapshot.val();
        if (player) {
            document.getElementById('my-emoji').textContent = player.emoji;
            document.getElementById('my-name').textContent = player.name;
        }
    });

    document.getElementById('current-q-num').textContent = questionIndex + 1;
    document.getElementById('question-text').textContent = question.question;

    // Create answer buttons
    const grid = document.getElementById('answers-grid');
    grid.innerHTML = '';
    const labels = ['A', 'B', 'C', 'D'];
    const classes = ['option-a', 'option-b', 'option-c', 'option-d'];

    question.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = `answer-btn ${classes[index]}`;
        btn.innerHTML = `
            <div class="answer-label">${labels[index]}</div>
            ${answer}
        `;
        btn.onclick = () => submitAnswer(questionIndex, index);
        grid.appendChild(btn);
    });

    // Start timer
    questionStartTime = startTime;
    hasAnswered = false;
    startQuestionTimer();
}

function startQuestionTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const elapsed = (Date.now() - questionStartTime) / 1000;
        const remaining = Math.max(0, QUESTION_TIME - elapsed);
        
        document.getElementById('timer-display').textContent = Math.ceil(remaining);

        if (remaining <= 0) {
            clearInterval(timerInterval);
            if (!hasAnswered) {
                // Auto-submit no answer
                submitAnswer(null, -1);
            }
        }
    }, 100);
}

function submitAnswer(questionIndex, answerIndex) {
    if (hasAnswered) return;
    hasAnswered = true;

    clearInterval(timerInterval);

    const timeElapsed = (Date.now() - questionStartTime) / 1000;
    const question = questions[questionIndex];
    const isCorrect = answerIndex === question.correct;

    // Calculate score
    let points = 0;
    if (isCorrect && timeElapsed <= QUESTION_TIME) {
        // Speed bonus: faster = more points
        const speedFactor = 1 - (timeElapsed / QUESTION_TIME);
        points = Math.round(MAX_POINTS * speedFactor);
    }

    // Update player data
    DB.ref('players/' + currentUser).transaction((player) => {
        if (player) {
            player.score = (player.score || 0) + points;
            player.answers = player.answers || {};
            player.answers[questionIndex] = {
                answer: answerIndex,
                time: timeElapsed,
                points: points,
                correct: isCorrect
            };
        }
        return player;
    });

    // Increment response count
    DB.ref('game/responsesCount').transaction((current) => (current || 0) + 1);

    // Show feedback
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === question.correct) {
            btn.classList.add('correct');
        } else if (idx === answerIndex && !isCorrect) {
            btn.classList.add('wrong');
        }
    });

    showScreen('waiting-screen');
    document.getElementById('waiting-message').textContent = 
        isCorrect ? `✅ Correct! +${points} points` : '❌ Wrong answer';
}

// Show Reveal Screen
function showRevealToPlayer(questionIndex) {
    const question = questions[questionIndex];
    showScreen('reveal-screen');

    document.getElementById('reveal-question').textContent = question.question;
    document.getElementById('reveal-answer').textContent = question.answers[question.correct];
    document.getElementById('fun-fact-text').textContent = question.funFact;

    // Show response count
    DB.ref('game').once('value', (snapshot) => {
        const game = snapshot.val();
        DB.ref('players').once('value', (playersSnapshot) => {
            const totalPlayers = Object.keys(playersSnapshot.val() || {}).length;
            document.getElementById('reveal-response-count').textContent = 
                `${game.responsesCount || 0}/${totalPlayers}`;
        });
    });

    hasAnswered = false;
}

// Show Leaderboard
function showLeaderboardToPlayer() {
    showScreen('leaderboard-screen');
    
    DB.ref('players').once('value', (snapshot) => {
        const players = snapshot.val() || {};
        const playerArray = Object.entries(players).map(([id, data]) => ({
            id,
            ...data
        })).sort((a, b) => b.score - a.score);

        const list = document.getElementById('leaderboard-list');
        list.innerHTML = '';

        playerArray.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            let rankClass = '';
            if (index === 0) rankClass = 'first';
            else if (index === 1) rankClass = 'second';
            else if (index === 2) rankClass = 'third';

            item.innerHTML = `
                <div class="rank ${rankClass}">#${index + 1}</div>
                <div class="player-emoji" style="font-size: 2em;">${player.emoji}</div>
                <div class="player-info">
                    <div style="font-size: 1.2em; font-weight: 700;">${player.name}</div>
                </div>
                <div class="score">${player.score}</div>
            `;
            list.appendChild(item);
        });
    });
}

// Show Winners
function showWinnersToPlayer() {
    showScreen('winners-screen');
    
    DB.ref('players').once('value', (snapshot) => {
        const players = snapshot.val() || {};
        const playerArray = Object.entries(players).map(([id, data]) => ({
            id,
            ...data
        })).sort((a, b) => b.score - a.score);

        // Top 3
        if (playerArray[0]) {
            document.getElementById('first-emoji').textContent = playerArray[0].emoji;
            document.getElementById('first-name').textContent = playerArray[0].name;
            document.getElementById('first-score').textContent = playerArray[0].score + ' pts';
        }
        if (playerArray[1]) {
            document.getElementById('second-emoji').textContent = playerArray[1].emoji;
            document.getElementById('second-name').textContent = playerArray[1].name;
            document.getElementById('second-score').textContent = playerArray[1].score + ' pts';
        }
        if (playerArray[2]) {
            document.getElementById('third-emoji').textContent = playerArray[2].emoji;
            document.getElementById('third-name').textContent = playerArray[2].name;
            document.getElementById('third-score').textContent = playerArray[2].score + ' pts';
        }

        // Full list
        const list = document.getElementById('final-leaderboard-list');
        list.innerHTML = '';

        playerArray.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            let rankClass = '';
            if (index === 0) rankClass = 'first';
            else if (index === 1) rankClass = 'second';
            else if (index === 2) rankClass = 'third';

            item.innerHTML = `
                <div class="rank ${rankClass}">#${index + 1}</div>
                <div class="player-emoji" style="font-size: 2em;">${player.emoji}</div>
                <div class="player-info">
                    <div style="font-size: 1.2em; font-weight: 700;">${player.name}</div>
                </div>
                <div class="score">${player.score}</div>
            `;
            list.appendChild(item);
        });
    });
}

// Reset Game
function resetGame() {
    if (isAdmin) {
        DB.ref('players').remove();
        initializeGame();
        showScreen('admin-panel-screen');
    } else {
        if (currentUser) {
            DB.ref('players/' + currentUser).remove();
        }
        currentUser = null;
        showScreen('player-join-screen');
    }
}

// Utility: Show Screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Handle Enter key
document.addEventListener('DOMContentLoaded', () => {
    const adminPassword = document.getElementById('admin-password');
    if (adminPassword) {
        adminPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') adminLogin();
        });
    }
    
    const playerNameInput = document.getElementById('player-name-input');
    if (playerNameInput) {
        playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') joinGame();
        });
    }

    // Show connection status
    if (useLocalStorage) {
        console.log('🔄 Running in LOCAL MODE - Open multiple tabs to test multiplayer');
        console.log('💡 For real-time sync across devices, set up Firebase (see README.md)');
    } else {
        console.log('✅ Firebase connected - Real-time multiplayer enabled');
    }
});

// Made with Bob
