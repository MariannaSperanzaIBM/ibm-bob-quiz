const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000';
const NUM_PLAYERS = 10; // Smaller number for quick demo

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

console.log('\n🚀 Quick Load Test - 10 Players\n');

let players = [];
let admin = null;
let currentQuestionIndex = 0;

// Create admin
const adminSocket = io(SERVER_URL, { transports: ['websocket'] });

adminSocket.on('connect', () => {
    console.log('✓ Admin connected');
    adminSocket.emit('selectRole', 'admin');
});

adminSocket.on('roleConfirmed', async (role) => {
    if (role === 'admin') {
        console.log('✓ Admin role confirmed\n');
        
        // Wait a bit then connect players
        setTimeout(() => {
            console.log(`Connecting ${NUM_PLAYERS} players...\n`);
            
            for (let i = 1; i <= NUM_PLAYERS; i++) {
                const socket = io(SERVER_URL, { transports: ['websocket'] });
                const name = `TestPlayer${i}`;
                let questionStartTime = 0;
                
                socket.on('connect', () => {
                    console.log(`  ✓ ${name} connected`);
                    socket.emit('selectRole', 'player');
                });
                
                socket.on('roleConfirmed', () => {
                    socket.emit('joinQuiz', name);
                });
                
                socket.on('playerJoined', (data) => {
                    if (data.player && data.player.name === name) {
                        console.log(`  ✓ ${name} joined quiz`);
                    }
                });
                
                socket.on('quizStarted', (data) => {
                    questionStartTime = Date.now();
                    setTimeout(() => {
                        submitAnswer(socket, name, data.questionIndex, questionStartTime);
                    }, Math.random() * 2000);
                });
                
                socket.on('showNextQuestion', (data) => {
                    questionStartTime = Date.now();
                    setTimeout(() => {
                        submitAnswer(socket, name, data.questionIndex, questionStartTime);
                    }, Math.random() * 2000);
                });
                
                players.push({ socket, name });
            }
            
            // Start quiz after all players connect
            setTimeout(() => {
                console.log('\n📊 All players connected!');
                console.log(`Total: ${players.length} players\n`);
                console.log('Starting quiz...\n');
                adminSocket.emit('startQuiz');
            }, 3000);
            
        }, 1000);
    }
});

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
    
    console.log(`  ${playerName} answered: ${selectedIndex} (${isCorrect ? 'correct' : 'wrong'})`);
}

adminSocket.on('showQuestionResults', (data) => {
    console.log(`\n✅ Question ${data.questionIndex + 1} completed!`);
    console.log(`Top 3:`);
    data.players.slice(0, 3).forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name}: ${p.score} points`);
    });
    console.log('');
    
    // Continue to next question
    setTimeout(() => {
        adminSocket.emit('continueToNext');
    }, 2000);
});

adminSocket.on('quizComplete', (results) => {
    console.log('\n🏆 QUIZ COMPLETE!\n');
    console.log('Final Results:');
    results.players.slice(0, 5).forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name}: ${p.score} points (${p.correctAnswers} correct)`);
    });
    
    console.log('\n✅ Test completed successfully!');
    console.log(`   ${players.length} players participated`);
    
    // Cleanup
    setTimeout(() => {
        players.forEach(p => p.socket.disconnect());
        adminSocket.disconnect();
        process.exit(0);
    }, 2000);
});

// Timeout
setTimeout(() => {
    console.log('\n⏱️  Test timeout');
    process.exit(1);
}, 60000);

// Made with Bob
