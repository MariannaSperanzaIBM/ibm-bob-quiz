const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Game state
let gameState = {
    players: [],
    currentPlayerIndex: 0,
    currentQuestionIndex: 0,
    gameStarted: false,
    adminConnected: false,
    currentQuestionAnswers: [],
    selectedGame: 1
};

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Send current game state to new connection
    socket.emit('gameState', gameState);

    // Handle role selection
    socket.on('selectRole', (role) => {
        console.log(`Client ${socket.id} selected role: ${role}`);
        
        if (role === 'admin') {
            if (gameState.adminConnected) {
                socket.emit('error', 'An administrator is already connected');
                return;
            }
            gameState.adminConnected = true;
            socket.isAdmin = true;
            socket.emit('roleConfirmed', 'admin');
        } else if (role === 'player') {
            socket.isAdmin = false;
            socket.emit('roleConfirmed', 'player');
        }
        
        // Broadcast updated game state
        io.emit('gameState', gameState);
    });

    // Handle player joining
    socket.on('joinQuiz', (playerName) => {
        console.log(`Player joining: ${playerName}`);
        
        // Check if name is already taken
        if (gameState.players.some(p => p.name === playerName)) {
            socket.emit('error', 'This name is already taken!');
            return;
        }

        const player = {
            id: socket.id,
            name: playerName,
            score: 0,
            correctAnswers: 0,
            currentQuestion: 0,
            answers: []
        };

        gameState.players.push(player);
        socket.playerName = playerName;

        console.log(`Player ${playerName} joined. Total players: ${gameState.players.length}`);

        // Broadcast updated player list to all clients
        io.emit('playerJoined', {
            player: player,
            players: gameState.players
        });
        
        io.emit('gameState', gameState);
    });

    // Handle admin booting a player
    socket.on('bootPlayer', (playerId) => {
        if (!socket.isAdmin) {
            socket.emit('error', 'Only admin can boot players');
            return;
        }

        if (gameState.gameStarted) {
            socket.emit('error', 'Cannot boot players after game has started');
            return;
        }

        const playerIndex = gameState.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
            const playerName = gameState.players[playerIndex].name;
            gameState.players.splice(playerIndex, 1);
            
            console.log(`Admin booted player: ${playerName}`);
            
            // Notify the booted player
            io.to(playerId).emit('booted', {
                message: 'You have been removed from the game by the administrator'
            });
            
            // Broadcast updated player list to all clients
            io.emit('playerLeft', {
                playerName: playerName,
                players: gameState.players
            });
            
            io.emit('gameState', gameState);
        }
    });

    // Handle game selection
    socket.on('selectGame', (gameNumber) => {
        if (!socket.isAdmin) {
            socket.emit('error', 'Only admin can select game');
            return;
        }

        console.log(`Admin selected Game ${gameNumber}`);
        gameState.selectedGame = gameNumber;

        // Broadcast game selection to all clients
        io.emit('gameSelected', { gameNumber: gameNumber });
        io.emit('gameState', gameState);
    });

    // Handle admin starting quiz
    socket.on('startQuiz', (data) => {
        const gameNumber = data?.gameNumber || gameState.selectedGame;
        if (!socket.isAdmin) {
            socket.emit('error', 'Only admin can start the quiz');
            return;
        }

        if (gameState.players.length === 0) {
            socket.emit('error', 'At least one player must join!');
            return;
        }

        console.log(`Admin starting quiz with Game ${gameNumber}`);

        gameState.gameStarted = true;
        gameState.selectedGame = gameNumber;
        gameState.currentQuestionIndex = 0;
        gameState.currentQuestionAnswers = [];

        // Reset all players
        gameState.players.forEach(player => {
            player.score = 0;
            player.correctAnswers = 0;
            player.answers = [];
            player.currentQuestion = 0;
        });

        // Broadcast quiz start to ALL players simultaneously
        io.emit('quizStarted', {
            questionIndex: 0,
            totalPlayers: gameState.players.length,
            gameNumber: gameNumber
        });
        
        io.emit('gameState', gameState);

        // Emit initial player progress to admin
        io.emit('playerProgress', {
            players: gameState.players,
            currentQuestionIndex: gameState.currentQuestionIndex,
            currentQuestionAnswers: gameState.currentQuestionAnswers
        });
    });

    // Handle answer submission
    socket.on('submitAnswer', (data) => {
        const { selectedIndex, timeElapsed, questionIndex, isCorrect, points } = data;
        const player = gameState.players.find(p => p.id === socket.id);

        if (!player) {
            socket.emit('error', 'Player not found');
            return;
        }

        console.log(`${player.name} submitted answer for question ${questionIndex}`);

        // Update player score
        if (isCorrect) {
            player.score += points;
            player.correctAnswers++;
        } else {
            player.score = Math.max(0, player.score + points); // points is negative for wrong answers
        }

        // Update player's current question
        player.currentQuestion = questionIndex;

        // Store answer data
        const answerData = {
            playerName: player.name,
            questionIndex: questionIndex,
            selectedIndex: selectedIndex,
            timeElapsed: timeElapsed,
            playerId: socket.id,
            isCorrect: isCorrect,
            points: points
        };

        player.answers.push(answerData);
        gameState.currentQuestionAnswers.push(answerData);

        // Broadcast answer count and player progress to all clients
        io.emit('answerSubmitted', {
            playerName: player.name,
            questionIndex: questionIndex,
            answeredCount: gameState.currentQuestionAnswers.length,
            totalPlayers: gameState.players.length
        });

        // Emit updated player progress to admin
        io.emit('playerProgress', {
            players: gameState.players,
            currentQuestionIndex: gameState.currentQuestionIndex,
            currentQuestionAnswers: gameState.currentQuestionAnswers
        });

        // Check if all players have answered
        if (gameState.currentQuestionAnswers.length >= gameState.players.length) {
            console.log('All players answered, showing results');
            
            // Show results after a short delay
            setTimeout(() => {
                io.emit('showQuestionResults', {
                    questionIndex: gameState.currentQuestionIndex,
                    answers: gameState.currentQuestionAnswers,
                    players: gameState.players
                });
            }, 1000);
        }

        io.emit('gameState', gameState);
    });

    // Handle continue to next question (admin only)
    socket.on('continueToNext', () => {
        if (!socket.isAdmin) {
            socket.emit('error', 'Only admin can continue to next question');
            return;
        }

        gameState.currentQuestionIndex++;
        gameState.currentQuestionAnswers = [];

        if (gameState.currentQuestionIndex >= 5) {
            // Quiz complete, show final results
            io.emit('quizComplete', {
                players: gameState.players
            });
        } else {
            // Show next question to all players
            io.emit('showNextQuestion', {
                questionIndex: gameState.currentQuestionIndex,
                totalPlayers: gameState.players.length
            });
        }
        
        io.emit('gameState', gameState);
        
        // Emit updated player progress to admin AFTER state is updated
        if (gameState.currentQuestionIndex < 5) {
            io.emit('playerProgress', {
                players: gameState.players,
                currentQuestionIndex: gameState.currentQuestionIndex,
                currentQuestionAnswers: gameState.currentQuestionAnswers
            });
        }
    });

    // Handle reset
    socket.on('resetQuiz', () => {
        console.log('Resetting quiz');
        
        gameState = {
            players: [],
            currentPlayerIndex: 0,
            currentQuestionIndex: 0,
            gameStarted: false,
            adminConnected: false,
            currentQuestionAnswers: [],
            selectedGame: 1
        };

        io.emit('quizReset');
        io.emit('gameState', gameState);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        if (socket.isAdmin) {
            gameState.adminConnected = false;
            console.log('Admin disconnected');
        }

        // Remove player if they were in the game
        const playerIndex = gameState.players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
            const playerName = gameState.players[playerIndex].name;
            gameState.players.splice(playerIndex, 1);
            console.log(`Player ${playerName} removed. Remaining players: ${gameState.players.length}`);
            
            io.emit('playerLeft', {
                playerName: playerName,
                players: gameState.players
            });
        }

        io.emit('gameState', gameState);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Open this URL in multiple browser windows/devices to test multiplayer functionality');
});

// Made with Bob
