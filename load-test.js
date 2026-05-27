const io = require('socket.io-client');

// Configuration
const SERVER_URL = 'http://localhost:3000';
const NUM_PLAYERS = 70;
const DELAY_BETWEEN_CONNECTIONS = 50; // ms

// Quiz questions (same as client.js)
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

let connectedPlayers = [];

// Simulate a player
function createPlayer(playerNumber) {
    return new Promise((resolve) => {
        const socket = io(SERVER_URL, {
            transports: ['websocket'],
            reconnection: false
        });

        const playerName = `LoadTest${playerNumber}`;
        let questionStartTime = 0;
        
        socket.on('connect', () => {
            console.log(`✓ ${playerName} connected (${socket.id})`);
            
            // Select player role
            socket.emit('selectRole', 'player');
        });

        socket.on('roleConfirmed', (role) => {
            if (role === 'player') {
                // Join the quiz
                socket.emit('joinQuiz', playerName);
            }
        });

        socket.on('playerJoined', (data) => {
            if (data.player && data.player.name === playerName) {
                console.log(`✓ ${playerName} joined the quiz`);
                resolve({ socket, name: playerName });
            }
        });

        socket.on('quizStarted', (data) => {
            questionStartTime = Date.now();
            // Simulate answering with random delay (0-3 seconds)
            const answerDelay = Math.random() * 3000;
            setTimeout(() => {
                submitAnswer(socket, playerName, data.questionIndex, questionStartTime);
            }, answerDelay);
        });

        socket.on('showNextQuestion', (data) => {
            questionStartTime = Date.now();
            // Simulate answering with random delay (0-3 seconds)
            const answerDelay = Math.random() * 3000;
            setTimeout(() => {
                submitAnswer(socket, playerName, data.questionIndex, questionStartTime);
            }, answerDelay);
        });

        socket.on('connect_error', (error) => {
            console.error(`✗ ${playerName} connection error:`, error.message);
            resolve(null);
        });

        socket.on('disconnect', () => {
            console.log(`✗ ${playerName} disconnected`);
        });
    });
}

function submitAnswer(socket, playerName, questionIndex, startTime) {
    const question = questions[questionIndex];
    const selectedIndex = Math.floor(Math.random() * 4);
    const timeElapsed = (Date.now() - startTime) / 1000;
    const isCorrect = selectedIndex === question.correct;
    
    let points = 0;
    if (isCorrect) {
        let speedBonus = Math.max(0, 50 - (timeElapsed * 5));
        points = Math.round(100 + speedBonus);
    } else {
        points = -25;
    }
    
    socket.emit('submitAnswer', {
        selectedIndex: selectedIndex,
        timeElapsed: timeElapsed,
        questionIndex: questionIndex,
        isCorrect: isCorrect,
        points: points
    });
    
    console.log(`  ${playerName} answered: ${selectedIndex} (${isCorrect ? 'correct' : 'wrong'}, ${points} pts)`);
}

// Main test function
async function runLoadTest() {
    console.log('\n🚀 Starting Load Test for IBM Bob Quiz');
    console.log(`📊 Target: ${NUM_PLAYERS} concurrent players\n`);
    console.log('⚠️  NOTE: You need to manually start the quiz from the admin panel in your browser\n');

    // Connect players
    console.log(`Connecting ${NUM_PLAYERS} players...`);
    const startTime = Date.now();
    
    for (let i = 1; i <= NUM_PLAYERS; i++) {
        const player = await createPlayer(i);
        if (player) {
            connectedPlayers.push(player);
        }
        
        // Small delay between connections to avoid overwhelming the server
        if (i < NUM_PLAYERS) {
            await sleep(DELAY_BETWEEN_CONNECTIONS);
        }

        // Progress indicator
        if (i % 10 === 0) {
            console.log(`  Progress: ${i}/${NUM_PLAYERS} players connected`);
        }
    }

    const connectionTime = Date.now() - startTime;
    console.log(`\n✅ Connection phase complete!`);
    console.log(`   Connected: ${connectedPlayers.length}/${NUM_PLAYERS} players`);
    console.log(`   Time taken: ${(connectionTime / 1000).toFixed(2)}s`);
    console.log(`   Average: ${(connectionTime / NUM_PLAYERS).toFixed(0)}ms per player`);

    console.log('\n📋 All players are now in the lobby waiting for the quiz to start.');
    console.log('👉 Go to http://localhost:3000 in your browser');
    console.log('👉 Log in as Admin');
    console.log('👉 Click "Start Quiz" to begin the test\n');
    console.log('The test will monitor gameplay and report results...\n');

    // Monitor quiz events
    let questionsCompleted = 0;
    connectedPlayers[0].socket.on('questionStart', (data) => {
        console.log(`📝 Question ${data.questionNumber} started`);
    });

    connectedPlayers[0].socket.on('questionResults', () => {
        questionsCompleted++;
        console.log(`✅ Question ${questionsCompleted}/5 completed`);
    });

    connectedPlayers[0].socket.on('quizComplete', (results) => {
        console.log('\n🏆 QUIZ COMPLETED!');
        console.log(`   Total players: ${results.players.length}`);
        console.log(`   Top 5 players:`);
        results.players.slice(0, 5).forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.name}: ${p.score} points (${p.correctAnswers} correct)`);
        });
        
        // Cleanup
        setTimeout(() => {
            console.log('\n🧹 Cleaning up connections...');
            connectedPlayers.forEach(player => player.socket.disconnect());
            
            console.log('\n✅ Load test complete!');
            console.log(`\n📊 Summary:`);
            console.log(`   - ${connectedPlayers.length} players connected successfully`);
            console.log(`   - Connection time: ${(connectionTime / 1000).toFixed(2)}s`);
            console.log(`   - Average: ${(connectionTime / NUM_PLAYERS).toFixed(0)}ms per player`);
            console.log(`   - All ${questionsCompleted} questions completed`);
            process.exit(0);
        }, 2000);
    });

    // Keep alive - wait for manual quiz start
    console.log('⏳ Waiting for quiz to start (press Ctrl+C to cancel)...\n');
}

// Helper function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the test
runLoadTest().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});

// Made with Bob
