// Quiz questions about IBM Bob
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

// Game state
let players = [];
let currentPlayerIndex = 0;
let currentQuestionIndex = 0;
let questionStartTime = 0;
let timerInterval = null;
let userRole = null;
let questionResults = [];
let currentQuestionAnswers = [];

// Role selection
function selectRole(role) {
    if (role === 'role') {
        // Back to role selection
        userRole = null;
        showScreen('role-screen');
        return;
    }
    
    userRole = role;
    if (role === 'admin') {
        showScreen('admin-screen');
        updateAdminPanel();
    } else {
        showScreen('welcome-screen');
    }
}

// Admin functions
function updateAdminPanel() {
    const list = document.getElementById('admin-participants');
    const count = document.getElementById('admin-participant-count');
    
    list.innerHTML = '';
    count.textContent = players.length;
    
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player.name;
        list.appendChild(li);
    });
    
    const startBtn = document.getElementById('admin-start-btn');
    startBtn.disabled = players.length === 0;
}

function adminStartQuiz() {
    if (players.length === 0) {
        alert('At least one player must join!');
        return;
    }
    
    currentPlayerIndex = 0;
    currentQuestionIndex = 0;
    questionResults = [];
    
    // Reset all players
    players.forEach(player => {
        player.score = 0;
        player.correctAnswers = 0;
        player.currentQuestion = 0;
        player.answers = [];
    });
    
    document.getElementById('current-player-section').style.display = 'block';
    showNextQuestion();
}

// Join quiz
function joinQuiz() {
    const nameInput = document.getElementById('player-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Please enter your name!');
        return;
    }
    
    if (players.some(p => p.name === name)) {
        alert('This name is already taken!');
        return;
    }
    
    players.push({
        name: name,
        score: 0,
        correctAnswers: 0,
        currentQuestion: 0,
        answers: []
    });
    
    updateParticipantsList();
    updateAdminPanel();
    nameInput.value = '';
}

function updateParticipantsList() {
    const list = document.getElementById('participants');
    list.innerHTML = '';
    
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player.name;
        list.appendChild(li);
    });
}


function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showNextQuestion() {
    const player = players[currentPlayerIndex];
    
    if (player.currentQuestion >= questions.length) {
        // This player is done, show question results
        showQuestionResults();
        return;
    }
    
    const question = questions[player.currentQuestion];
    
    // Clear previous question answers
    currentQuestionAnswers = [];
    
    // Update UI
    showScreen('quiz-screen');
    document.getElementById('current-player').textContent = player.name;
    document.getElementById('question-number').textContent = player.currentQuestion + 1;
    document.getElementById('current-score').textContent = player.score;
    document.getElementById('question-text').textContent = question.question;
    
    // Update admin panel
    if (document.getElementById('admin-current-player')) {
        document.getElementById('admin-current-player').textContent = player.name;
        document.getElementById('admin-question-num').textContent = player.currentQuestion + 1;
    }
    
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
        document.getElementById('timer').textContent = elapsed.toFixed(1);
    }, 100);
}

function selectAnswer(selectedIndex) {
    clearInterval(timerInterval);
    
    const player = players[currentPlayerIndex];
    const question = questions[player.currentQuestion];
    const timeElapsed = (Date.now() - questionStartTime) / 1000;
    
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach(btn => btn.disabled = true);
    
    let points = 0;
    let isCorrect = false;
    
    if (selectedIndex === question.correct) {
        // Correct answer
        answerButtons[selectedIndex].classList.add('correct');
        player.correctAnswers++;
        isCorrect = true;
        
        // Calculate score: base 100 points, bonus for speed
        let speedBonus = Math.max(0, 50 - (timeElapsed * 5));
        points = Math.round(100 + speedBonus);
        player.score += points;
        
        showFeedback(`Correct! +${points} points (${timeElapsed.toFixed(1)}s)`, 'correct');
    } else {
        // Wrong answer
        answerButtons[selectedIndex].classList.add('wrong');
        answerButtons[question.correct].classList.add('correct');
        
        // Lose 25 points for wrong answer
        points = -25;
        player.score = Math.max(0, player.score - 25);
        
        showFeedback(`Wrong! -25 points`, 'wrong');
    }
    
    // Store answer data
    const answerData = {
        playerName: player.name,
        questionIndex: player.currentQuestion,
        selectedAnswer: question.answers[selectedIndex],
        correctAnswer: question.answers[question.correct],
        isCorrect: isCorrect,
        timeElapsed: timeElapsed,
        points: points,
        totalScore: player.score
    };
    
    currentQuestionAnswers.push(answerData);
    player.answers.push(answerData);
    player.currentQuestion++;
    
    // Move to next question after delay
    setTimeout(() => {
        showNextQuestion();
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

function showQuestionResults() {
    // Store results for this question
    questionResults.push({
        questionIndex: currentQuestionIndex,
        answers: [...currentQuestionAnswers]
    });
    
    const question = questions[currentQuestionIndex];
    
    // Update question results screen
    document.getElementById('completed-question-text').textContent = question.question;
    document.getElementById('correct-answer-text').textContent = question.answers[question.correct];
    
    // Sort players by score for current standings
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    
    // Build results table
    const tbody = document.getElementById('question-results-body');
    tbody.innerHTML = '';
    
    sortedPlayers.forEach((player, index) => {
        const playerAnswer = currentQuestionAnswers.find(a => a.playerName === player.name);
        
        const row = document.createElement('tr');
        row.className = playerAnswer && playerAnswer.isCorrect ? 'correct-row' : 'wrong-row';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${playerAnswer ? playerAnswer.selectedAnswer : '-'}</td>
            <td>${playerAnswer ? playerAnswer.timeElapsed.toFixed(1) + 's' : '-'}</td>
            <td class="${playerAnswer && playerAnswer.points > 0 ? 'positive' : 'negative'}">${playerAnswer ? (playerAnswer.points > 0 ? '+' : '') + playerAnswer.points : '0'}</td>
            <td><strong>${player.score}</strong></td>
        `;
        tbody.appendChild(row);
    });
    
    // Update next player info
    currentPlayerIndex++;
    currentQuestionIndex++;
    
    if (currentPlayerIndex >= players.length) {
        if (currentQuestionIndex >= questions.length) {
            // All done
            document.getElementById('next-player-info').textContent = 'Quiz Complete!';
            document.getElementById('continue-btn').textContent = 'View Final Results';
        } else {
            // Next question, reset to first player
            currentPlayerIndex = 0;
            const nextPlayer = players[currentPlayerIndex];
            document.getElementById('next-player-info').textContent = `Next: ${nextPlayer.name} - Question ${currentQuestionIndex + 1}`;
            document.getElementById('continue-btn').textContent = 'Continue';
        }
    } else {
        const nextPlayer = players[currentPlayerIndex];
        document.getElementById('next-player-info').textContent = `Next: ${nextPlayer.name} - Question ${currentQuestionIndex + 1}`;
        document.getElementById('continue-btn').textContent = 'Continue';
    }
    
    showScreen('question-results-screen');
}

function continueToNextQuestion() {
    if (currentPlayerIndex >= players.length && currentQuestionIndex >= questions.length) {
        // Show final results
        showResults();
    } else if (currentPlayerIndex >= players.length) {
        // Next question, reset to first player
        currentPlayerIndex = 0;
        currentQuestionAnswers = [];
        showNextQuestion();
    } else {
        showNextQuestion();
    }
}

function showResults() {
    // Sort players by score
    players.sort((a, b) => b.score - a.score);
    
    // Show top 3
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
    
    // Show all results in table
    const tbody = document.getElementById('results-body');
    tbody.innerHTML = '';
    
    players.forEach((player, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.score}</td>
            <td>${player.correctAnswers}/${questions.length}</td>
        `;
        tbody.appendChild(row);
    });
    
    showScreen('results-screen');
}

function resetQuiz() {
    players = [];
    currentPlayerIndex = 0;
    currentQuestionIndex = 0;
    questionResults = [];
    currentQuestionAnswers = [];
    userRole = null;
    
    document.getElementById('participants').innerHTML = '';
    document.getElementById('player-name').value = '';
    document.getElementById('current-player-section').style.display = 'none';
    
    showScreen('role-screen');
}

// Allow Enter key to join
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('player-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            joinQuiz();
        }
    });
});

// Made with Bob
