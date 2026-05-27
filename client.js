// Socket.IO client connection
const socket = io();

// Quiz questions about IBM
const questions = [
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
        question: "What was IBM's original name?",
        answers: [
            "Computing-Tabulating-Recording Company",
            "International Computing Corporation",
            "Business Machines Inc",
            "Tabulating Machine Company"
        ],
        correct: 0
    },
    {
        question: "Which IBM computer famously defeated chess champion Garry Kasparov?",
        answers: ["Watson", "Deep Blue", "Summit", "Blue Gene"],
        correct: 1
    },
    {
        question: "What is IBM's nickname often used in the tech industry?",
        answers: ["Big Blue", "Tech Giant", "Blue Machine", "The Corporation"],
        correct: 0
    }
];

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

socket.on('quizStarted', (data) => {
    console.log('Quiz started - all players answer simultaneously');
    
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
    socket.emit('startQuiz');
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
        li.textContent = player.name;
        list.appendChild(li);
    });
    
    const startBtn = document.getElementById('admin-start-btn');
    if (startBtn) {
        startBtn.disabled = players.length === 0;
    }
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
