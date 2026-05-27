// Socket.IO client connection
const socket = io();

// Game 1: Original IBM questions
const game1Questions = [
    {
        question: "What does IBM stand for?",
        answers: [
            "International Business Machines",
            "Internet Business Management",
            "Integrated Business Models",
            "International Banking Machines"
        ],
        correct: 0
    },
    {
        question: "In what year was IBM founded?",
        answers: ["1911", "1924", "1935", "1945"],
        correct: 0
    },
    {
        question: "Building AI agents represents what percentage of the total work involved?",
        answers: [
            "80%",
            "50%",
            "20%",
            "40%"
        ],
        correct: 2
    },
    {
        question: "Which IBM computer famously defeated chess champion Garry Kasparov?",
        answers: ["Watson", "Deep Blue", "Summit", "Blue Gene"],
        correct: 1
    },
    {
        question: "What are the three layers of IBM's AI governance stack, in order?",
        answers: [
            "Plan, Build, Deploy",
            "Visibility, Control, Accountability",
            "Monitor, Optimize, Scale",
            "Design, Test, Launch"
        ],
        correct: 1
    }
];

// Game 2: IBM Bob & AI questions
const game2Questions = [
    {
        question: "What AI models does IBM Bob use to route tasks?",
        answers: [
            "Only IBM Granite models",
            "GPT-4 and Gemini",
            "LLaMA and Falcon",
            "Claude, Mistral, and IBM Granite"
        ],
        correct: 3
    },
    {
        question: "What game show did IBM's Watson AI win in 2011?",
        answers: [
            "Who Wants to Be a Millionaire",
            "Jeopardy!",
            "Wheel of Fortune",
            "The Price is Right"
        ],
        correct: 1
    },
    {
        question: "What Formula One team does IBM sponsor and provide AI Governance for?",
        answers: [
            "Mercedes",
            "Red Bull",
            "Ferrari",
            "McLaren"
        ],
        correct: 2
    },
    {
        question: "IBM Bob was built ___ by Bob itself.",
        answers: [
            "10%",
            "25%",
            "40%",
            "60%"
        ],
        correct: 2
    },
    {
        question: "How many internal IBM employees use Bob?",
        answers: [
            "10,000",
            "40,000",
            "80,000",
            "100,000"
        ],
        correct: 2
    }
];

// Active questions set (default to Game 1)
let questions = game1Questions;
let selectedGame = 1;

// Local state
let userRole = null;
let myPlayerName = null;
let questionStartTime = 0;
let timerInterval = null;
let currentQuestionIndex = 0;

// Socket event listeners
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('gameState', (state) => {
    console.log('Game state received:', state);
    updateUIFromGameState(state);
});

socket.on('roleConfirmed', (role) => {
    userRole = role;
    console.log('Role confirmed:', role);
    
    if (role === 'admin') {
        showScreen('admin-screen');
    } else {
        showScreen('welcome-screen');
    }
});

socket.on('playerJoined', (data) => {
    console.log('Player joined:', data.player.name);
    updateParticipantsList(data.players);
    updateAdminPanel(data.players);
});

socket.on('playerLeft', (data) => {
    console.log('Player left:', data.playerName);
    updateParticipantsList(data.players);
    updateAdminPanel(data.players);
});

socket.on('gameSelected', (data) => {
    console.log(`Game ${data.gameNumber} selected by admin`);
    
    // Update local game selection for all clients
    selectedGame = data.gameNumber;
    if (data.gameNumber === 1) {
        questions = game1Questions;
    } else {
        questions = game2Questions;
    }
    
    // Update button styling if on admin screen
    const game1Btn = document.getElementById('game1-btn');
    const game2Btn = document.getElementById('game2-btn');
    if (game1Btn && game2Btn) {
        game1Btn.classList.remove('active');
        game2Btn.classList.remove('active');
        document.getElementById(`game${data.gameNumber}-btn`).classList.add('active');
    }
});

socket.on('quizStarted', (data) => {
    console.log('Quiz started - all players answer simultaneously');
    
    // Sync game selection
    if (data.gameNumber) {
        selectedGame = data.gameNumber;
        if (data.gameNumber === 1) {
            questions = game1Questions;
        } else {
            questions = game2Questions;
        }
    }
    
    if (userRole === 'admin') {
        const questionNumEl = document.getElementById('admin-question-num');
        if (questionNumEl) {
            questionNumEl.textContent = `${data.questionIndex + 1}/5`;
        }
        const answersCountEl = document.getElementById('admin-answers-count');
        if (answersCountEl) {
            answersCountEl.textContent = `0/${data.totalPlayers}`;
        }
    }
    
    // All players see the question at the same time
    if (userRole === 'player') {
        showQuestionScreen(data.questionIndex);
    }
});

socket.on('showNextQuestion', (data) => {
    console.log('Next question:', data.questionIndex + 1);
    
    if (userRole === 'admin') {
        const questionNumEl = document.getElementById('admin-question-num');
        if (questionNumEl) {
            questionNumEl.textContent = `${data.questionIndex + 1}/5`;
        }
        const answersCountEl = document.getElementById('admin-answers-count');
        if (answersCountEl) {
            answersCountEl.textContent = `0/${data.totalPlayers}`;
        }
    }
    
    // All players see the next question at the same time
    if (userRole === 'player') {
        showQuestionScreen(data.questionIndex);
    }
});

socket.on('answerSubmitted', (data) => {
    console.log(`${data.playerName} answered (${data.answeredCount}/${data.totalPlayers})`);
    
    // Update admin panel
    if (userRole === 'admin') {
        const answersCountEl = document.getElementById('admin-answers-count');
        if (answersCountEl) {
            answersCountEl.textContent = `${data.answeredCount}/${data.totalPlayers}`;
        }
    }
    
    // Update waiting message for players who already answered
    const waitingMsg = document.querySelector('.waiting-message');
    if (waitingMsg && waitingMsg.style.display !== 'none') {
        waitingMsg.textContent = `Waiting for other players... (${data.answeredCount}/${data.totalPlayers} answered)`;
    }
});

socket.on('playerProgress', (data) => {
    console.log('Player progress update received:', data);
    console.log('Current user role:', userRole);
    if (userRole === 'admin') {
        console.log('Updating player progress table...');
        updatePlayerProgressTable(data);
    }
});

socket.on('showQuestionResults', (data) => {
    console.log('Showing question results');
    displayQuestionResults(data);
    
    // Hide continue button for players, show only for admin
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        if (userRole === 'admin') {
            continueBtn.style.display = 'block';
        } else {
            continueBtn.style.display = 'none';
        }
    }
});

socket.on('quizComplete', (data) => {
    console.log('Quiz complete');
    showFinalResults(data.players);
});

socket.on('quizReset', () => {
    console.log('Quiz reset');
    
    // Show restart prompt for existing players
    if (userRole === 'player' && myPlayerName) {
        const shouldRestart = confirm('The quiz has been restarted by the administrator. Would you like to rejoin?');
        if (shouldRestart) {
            resetLocalState();
            showScreen('role-screen');
        } else {
            resetLocalState();
            showScreen('role-screen');
        }
    } else {
        resetLocalState();
        showScreen('role-screen');
    }
});

socket.on('booted', (data) => {
    alert(data.message);
    resetLocalState();
    showScreen('role-screen');
});

socket.on('error', (message) => {
    alert(message);
});

// UI Functions
function selectRole(role) {
    if (role === 'role') {
        userRole = null;
        myPlayerName = null;
        showScreen('role-screen');
        return;
    }
    
    socket.emit('selectRole', role);
}

function selectGame(gameNumber) {
    selectedGame = gameNumber;
    
    // Update active button styling
    document.getElementById('game1-btn').classList.remove('active');
    document.getElementById('game2-btn').classList.remove('active');
    document.getElementById(`game${gameNumber}-btn`).classList.add('active');
    
    // Switch questions array
    if (gameNumber === 1) {
        questions = game1Questions;
    } else {
        questions = game2Questions;
    }
    
    console.log(`Game ${gameNumber} selected`);
    
    // Emit game selection to server
    socket.emit('selectGame', gameNumber);
}

function joinQuiz() {
    const nameInput = document.getElementById('player-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Please enter your name!');
        return;
    }
    
    myPlayerName = name;
    socket.emit('joinQuiz', name);
    
    // Hide join form and show waiting message
    document.querySelector('.join-form').style.display = 'none';
    const waitingMsg = document.querySelector('.waiting-message');
    if (waitingMsg) {
        waitingMsg.textContent = 'Waiting for administrator to start the quiz...';
        waitingMsg.style.display = 'block';
    }
}

function adminStartQuiz() {
    socket.emit('startQuiz', { gameNumber: selectedGame });
    
    // Show restart button and hide start button
    const startBtn = document.getElementById('admin-start-btn');
    const restartBtn = document.getElementById('admin-restart-btn');
    if (startBtn) startBtn.style.display = 'none';
    if (restartBtn) restartBtn.style.display = 'block';
}

function adminRestartQuiz() {
    if (confirm('Are you sure you want to restart the quiz? All progress will be lost.')) {
        socket.emit('resetQuiz');
        
        // Show start button and hide restart button
        const startBtn = document.getElementById('admin-start-btn');
        const restartBtn = document.getElementById('admin-restart-btn');
        if (startBtn) startBtn.style.display = 'block';
        if (restartBtn) restartBtn.style.display = 'none';
    }
}

function updateParticipantsList(players) {
    const list = document.getElementById('participants');
    if (!list) return;
    
    list.innerHTML = '';
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player.name;
        list.appendChild(li);
    });
}

function updateAdminPanel(players) {
    const list = document.getElementById('admin-participants');
    const count = document.getElementById('admin-participant-count');
    
    if (!list || !count) return;
    
    list.innerHTML = '';
    count.textContent = players.length;
    
    players.forEach(player => {
        const li = document.createElement('li');
        li.className = 'player-item';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = player.name;
        nameSpan.className = 'player-name';
        
        const bootBtn = document.createElement('button');
        bootBtn.textContent = '🚫 Boot';
        bootBtn.className = 'btn-boot';
        bootBtn.onclick = () => bootPlayer(player.id, player.name);
        
        li.appendChild(nameSpan);
        li.appendChild(bootBtn);
        list.appendChild(li);
    });
    
    const startBtn = document.getElementById('admin-start-btn');
    if (startBtn) {
        startBtn.disabled = players.length === 0;
    }
}

function bootPlayer(playerId, playerName) {
    if (confirm(`Are you sure you want to remove ${playerName} from the game?`)) {
        socket.emit('bootPlayer', playerId);
    }
}

function updatePlayerProgressTable(data) {
    console.log('updatePlayerProgressTable called with data:', data);
    const progressSection = document.getElementById('player-progress-section');
    const tbody = document.getElementById('player-progress-body');
    
    console.log('progressSection:', progressSection);
    console.log('tbody:', tbody);
    
    if (!progressSection || !tbody) {
        console.error('Progress section or tbody not found!');
        return;
    }
    
    // Show the progress section if game has started
    if (data.players.length > 0 && data.currentQuestionIndex >= 0) {
        console.log('Showing progress section');
        progressSection.style.display = 'block';
    } else {
        console.log('Hiding progress section');
        progressSection.style.display = 'none';
        return;
    }
    
    tbody.innerHTML = '';
    
    console.log('Building table for', data.players.length, 'players');
    console.log('Current question index:', data.currentQuestionIndex);
    console.log('Current question answers:', data.currentQuestionAnswers);
    
    data.players.forEach(player => {
        const row = document.createElement('tr');
        
        // Determine if player has answered current question
        const hasAnsweredCurrent = data.currentQuestionAnswers.some(
            answer => answer.playerId === player.id
        );
        
        console.log(`Player ${player.name}: hasAnswered=${hasAnsweredCurrent}`);
        
        // Determine status
        let status = '';
        let statusClass = '';
        
        if (hasAnsweredCurrent) {
            status = '✅ Answered';
            statusClass = 'status-answered';
        } else {
            status = '⏳ Waiting...';
            statusClass = 'status-waiting';
        }
        
        // Current question display
        const currentQ = data.currentQuestionIndex + 1;
        
        row.innerHTML = `
            <td><strong>${player.name}</strong></td>
            <td>Question ${currentQ}/5</td>
            <td class="${statusClass}">${status}</td>
            <td>${player.score}</td>
            <td>${player.correctAnswers}/5</td>
        `;
        
        tbody.appendChild(row);
    });
    
    console.log('Table updated successfully');
}

function updateAdminCurrentPlayer(player, questionIndex) {
    const currentPlayerEl = document.getElementById('admin-current-player');
    const questionNumEl = document.getElementById('admin-question-num');
    
    if (currentPlayerEl) {
        currentPlayerEl.textContent = player.name;
    }
    if (questionNumEl) {
        questionNumEl.textContent = questionIndex + 1;
    }
}

function showQuestionScreen(questionIndex) {
    currentQuestionIndex = questionIndex;
    const question = questions[questionIndex];
    
    showScreen('quiz-screen');
    
    document.getElementById('current-player').textContent = myPlayerName;
    document.getElementById('question-number').textContent = questionIndex + 1;
    document.getElementById('question-text').textContent = question.question;
    
    // Create answer buttons
    const answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = '';
    
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = answer;
        button.onclick = () => selectAnswer(index);
        answersDiv.appendChild(button);
    });
    
    // Start timer
    questionStartTime = Date.now();
    startTimer();
}

function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        const elapsed = (Date.now() - questionStartTime) / 1000;
        const timerEl = document.getElementById('timer');
        if (timerEl) {
            timerEl.textContent = elapsed.toFixed(1);
        }
    }, 100);
}

function selectAnswer(selectedIndex) {
    clearInterval(timerInterval);
    
    const question = questions[currentQuestionIndex];
    const timeElapsed = (Date.now() - questionStartTime) / 1000;
    
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach(btn => btn.disabled = true);
    
    let points = 0;
    let isCorrect = false;
    
    if (selectedIndex === question.correct) {
        answerButtons[selectedIndex].classList.add('correct');
        isCorrect = true;
        
        let speedBonus = Math.max(0, 50 - (timeElapsed * 5));
        points = Math.round(100 + speedBonus);
        
        showFeedback(`Correct! +${points} points (${timeElapsed.toFixed(1)}s)`, 'correct');
    } else {
        answerButtons[selectedIndex].classList.add('wrong');
        answerButtons[question.correct].classList.add('correct');
        
        points = -25;
        showFeedback(`Wrong! -25 points`, 'wrong');
    }
    
    // Submit answer to server and show waiting screen
    setTimeout(() => {
        socket.emit('submitAnswer', {
            selectedIndex: selectedIndex,
            timeElapsed: timeElapsed,
            questionIndex: currentQuestionIndex,
            isCorrect: isCorrect,
            points: points
        });
        
        // Show waiting screen
        showScreen('welcome-screen');
        const waitingMsg = document.querySelector('.waiting-message');
        if (waitingMsg) {
            waitingMsg.textContent = 'Waiting for other players to answer...';
            waitingMsg.style.display = 'block';
        }
        const joinForm = document.querySelector('.join-form');
        if (joinForm) {
            joinForm.style.display = 'none';
        }
    }, 2000);
}

function showFeedback(message, type) {
    const feedback = document.createElement('div');
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;
    document.querySelector('.question-container').appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 2000);
}

function displayQuestionResults(data) {
    const question = questions[data.questionIndex];
    
    showScreen('question-results-screen');
    
    document.getElementById('completed-question-text').textContent = question.question;
    document.getElementById('correct-answer-text').textContent = question.answers[question.correct];
    
    // Calculate scores and build results
    const playersWithScores = data.players.map(player => {
        const answer = data.answers.find(a => a.playerName === player.name);
        
        if (answer) {
            const isCorrect = answer.selectedIndex === question.correct;
            let points = 0;
            
            if (isCorrect) {
                let speedBonus = Math.max(0, 50 - (answer.timeElapsed * 5));
                points = Math.round(100 + speedBonus);
                player.score += points;
                player.correctAnswers++;
            } else {
                points = -25;
                player.score = Math.max(0, player.score - 25);
            }
            
            return {
                ...player,
                lastAnswer: question.answers[answer.selectedIndex],
                lastTimeElapsed: answer.timeElapsed,
                lastPoints: points,
                lastIsCorrect: isCorrect
            };
        }
        
        return player;
    });
    
    // Sort by score
    playersWithScores.sort((a, b) => b.score - a.score);
    
    // Build table
    const tbody = document.getElementById('question-results-body');
    tbody.innerHTML = '';
    
    playersWithScores.forEach((player, index) => {
        const row = document.createElement('tr');
        row.className = player.lastIsCorrect ? 'correct-row' : 'wrong-row';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.lastAnswer || '-'}</td>
            <td>${player.lastTimeElapsed ? player.lastTimeElapsed.toFixed(1) + 's' : '-'}</td>
            <td class="${player.lastPoints > 0 ? 'positive' : 'negative'}">${player.lastPoints > 0 ? '+' : ''}${player.lastPoints || '0'}</td>
            <td><strong>${player.score}</strong></td>
        `;
        tbody.appendChild(row);
    });
    
    // Update next player info
    const nextInfo = document.getElementById('next-player-info');
    const continueBtn = document.getElementById('continue-btn');
    
    if (data.questionIndex >= 4) {
        nextInfo.textContent = 'Quiz Complete!';
        continueBtn.textContent = 'View Final Results';
    } else {
        nextInfo.textContent = `Next: Question ${data.questionIndex + 2}`;
        continueBtn.textContent = 'Continue';
    }
}

function continueToNextQuestion() {
    socket.emit('continueToNext');
}

function showFinalResults(players) {
    players.sort((a, b) => b.score - a.score);
    
    showScreen('results-screen');
    
    if (players.length >= 1) {
        document.getElementById('first-name').textContent = players[0].name;
        document.getElementById('first-score').textContent = `${players[0].score} pts`;
    }
    
    if (players.length >= 2) {
        document.getElementById('second-name').textContent = players[1].name;
        document.getElementById('second-score').textContent = `${players[1].score} pts`;
    }
    
    if (players.length >= 3) {
        document.getElementById('third-name').textContent = players[2].name;
        document.getElementById('third-score').textContent = `${players[2].score} pts`;
    }
    
    const tbody = document.getElementById('results-body');
    tbody.innerHTML = '';
    
    players.forEach((player, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.score}</td>
            <td>${player.correctAnswers}/5</td>
        `;
        tbody.appendChild(row);
    });
    
    // Hide reset button for players, show only for admin
    const resetSection = document.querySelector('.reset-section');
    if (resetSection) {
        if (userRole === 'admin') {
            resetSection.style.display = 'block';
        } else {
            resetSection.style.display = 'none';
        }
    }
}

function resetQuiz() {
    socket.emit('resetQuiz');
}

function resetLocalState() {
    userRole = null;
    myPlayerName = null;
    currentQuestionIndex = 0;
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    const nameInput = document.getElementById('player-name');
    if (nameInput) nameInput.value = '';
    
    const participantsList = document.getElementById('participants');
    if (participantsList) participantsList.innerHTML = '';
    
    const adminParticipants = document.getElementById('admin-participants');
    if (adminParticipants) adminParticipants.innerHTML = '';
    
    const currentPlayerSection = document.getElementById('current-player-section');
    if (currentPlayerSection) currentPlayerSection.style.display = 'none';
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

function updateUIFromGameState(state) {
    if (state.players) {
        updateParticipantsList(state.players);
        updateAdminPanel(state.players);
    }
}

// Allow Enter key to join
document.addEventListener('DOMContentLoaded', () => {
    const playerNameInput = document.getElementById('player-name');
    if (playerNameInput) {
        playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                joinQuiz();
            }
        });
    }
});

// Made with Bob
