# 🎯 IBM Bob Quiz - Real-Time Multiplayer Quiz Game

A real-time multiplayer quiz game about IBM, supporting simultaneous players across different devices with Socket.IO for instant synchronization.

> **📱 Mobile-Optimized** | **🚀 Easy Deployment** | **🎮 Real-Time Multiplayer**

## ✨ Features

### 🎮 Real-Time Multiplayer
- **Up to 100 simultaneous players** across different devices
- **Firebase Realtime Database** for instant synchronization (< 200ms)
- All players see questions appear at exactly the same time
- Live updates for player joins, answers, and leaderboards

### 👨‍💼 Admin Panel
- **Protected login** (username: `admin`, password: `ibmbob2024`)
- Admin controls every phase of the game
- Live response counter showing how many players have answered
- Can reveal answers, show leaderboards, and advance questions
- No question shows until admin approves it

### 🎯 Player Experience
- Join with **Game PIN: 483921**
- Random emoji avatar assigned on join
- 20-second timer per question
- 4 answer options (A/B/C/D)
- Speed bonus scoring (max 1,000 points per question)
- Instant feedback after answering
- Wait for reveal, then see leaderboard

### 📊 Questions
- **10 multiple choice questions** about IBM
- Topics: History, founding year, products (Watson, IBM Z, IBM Cloud, IBM Q)
- IBM culture and technology
- Fun facts revealed after each answer

### 🏆 Leaderboard & Winners
- Live leaderboard after every question
- Rankings and point changes displayed
- Winners podium with 1st, 2nd, 3rd place
- Complete ranked list of all players

## 🚀 Quick Start

### Option 1: Use Demo Firebase (Recommended for Testing)

The app comes pre-configured with a demo Firebase project. Simply open `index.html` in a web browser:

1. **Open the file:**
   ```bash
   cd ibm-bob-quiz
   open index.html
   ```
   Or double-click `index.html` in your file browser.

2. **For multi-device testing:**
   - Use a local web server (see below)
   - Or deploy to any web hosting service

### Option 2: Set Up Your Own Firebase Project

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Realtime Database:**
   - In your Firebase project, go to "Realtime Database"
   - Click "Create Database"
   - Start in **test mode** (for development)

3. **Get Your Config:**
   - Go to Project Settings > General
   - Scroll to "Your apps" > Web app
   - Copy the Firebase configuration

4. **Update `app.js`:**
   - Replace the `firebaseConfig` object with your config:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT.firebaseapp.com",
       databaseURL: "https://YOUR_PROJECT.firebaseio.com",
       projectId: "YOUR_PROJECT",
       storageBucket: "YOUR_PROJECT.appspot.com",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

5. **Set Database Rules (for production):**
   ```json
   {
     "rules": {
       "game": {
         ".read": true,
         ".write": true
       },
       "players": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```

## 🌐 Running with a Local Server

For multi-device testing on the same network:

### Using Python (Built-in):
```bash
cd ibm-bob-quiz
python3 -m http.server 8000
```
Then open: `http://localhost:8000`

### Using Node.js:
```bash
npm install -g http-server
cd ibm-bob-quiz
http-server -p 8000
```

### Using PHP:
```bash
cd ibm-bob-quiz
php -S localhost:8000
```

### Access from Other Devices:
1. Find your computer's IP address:
   - **Mac/Linux:** `ifconfig | grep "inet "`
   - **Windows:** `ipconfig`

2. On other devices (same WiFi network):
   - Open browser and go to: `http://YOUR_IP:8000`
   - Example: `http://192.168.1.100:8000`

## 🎮 How to Play

### For Admin:
1. Open the app in your browser
2. Login with:
   - **Username:** `admin`
   - **Password:** `ibmbob2024`
3. Wait for players to join (you'll see them appear in real-time)
4. Click **"Start Game"** when ready
5. Click **"Show Question"** to display each question
6. Monitor the response counter
7. Click **"Reveal Answer"** to show the correct answer and fun fact
8. Click **"Show Leaderboard"** to display rankings
9. Repeat for all 10 questions
10. Final winners screen appears automatically

### For Players:
1. Open the app on any device
2. Click **"Join as Player"**
3. Enter the Game PIN: **483921**
4. Enter your name (max 20 characters)
5. Click **"Join Game"**
6. Wait in the lobby (you'll see other players joining)
7. When the game starts, answer each question within 20 seconds
8. Faster correct answers = more points (max 1,000 per question)
9. See your result after answering
10. View the leaderboard after each question
11. See the final winners podium at the end!

## 📝 Game Flow

```
Admin Login / Player Join
         ↓
    Lobby (Waiting)
         ↓
   Question 1 (20s timer)
         ↓
  Answer Reveal + Fun Fact
         ↓
     Leaderboard
         ↓
   Question 2 (20s timer)
         ↓
        ...
         ↓
   Question 10 (20s timer)
         ↓
  Answer Reveal + Fun Fact
         ↓
     Leaderboard
         ↓
   Winners Podium 🏆
```

## 🎯 Scoring System

- **Correct Answer:** Up to 1,000 points based on speed
  - Answer in 0-1 second: ~950-1,000 points
  - Answer in 10 seconds: ~500 points
  - Answer in 20 seconds: ~0-50 points
- **Wrong Answer:** 0 points
- **No Answer:** 0 points

Formula: `points = 1000 × (1 - timeElapsed / 20)`

## 🔧 Technical Details

### Architecture
- **Frontend:** Pure HTML, CSS, JavaScript (no build tools required)
- **Backend:** Firebase Realtime Database
- **Real-time Sync:** Firebase SDK with WebSocket connections
- **Latency:** < 200ms for all updates

### Firebase Database Structure
```
/game
  - phase: "lobby" | "question" | "reveal" | "leaderboard" | "winners"
  - currentQuestion: 0-9
  - questionStartTime: timestamp
  - totalPlayers: number
  - responsesCount: number

/players
  /{playerId}
    - name: string
    - emoji: string
    - score: number
    - answers: {
        0: { answer: number, time: number, points: number, correct: boolean }
        1: { ... }
      }
    - joinedAt: timestamp
```

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎨 Customization

### Change Questions
Edit the `questions` array in `app.js`:
```javascript
const questions = [
    {
        question: "Your question here?",
        answers: ["Option A", "Option B", "Option C", "Option D"],
        correct: 0, // Index of correct answer (0-3)
        funFact: "Interesting fact about the answer!"
    },
    // Add more questions...
];
```

### Change Game PIN
Edit in `app.js`:
```javascript
const GAME_PIN = "483921"; // Change to any 6-digit number
```

### Change Admin Credentials
Edit in `app.js`:
```javascript
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "ibmbob2024";
```

### Change Timer Duration
Edit in `app.js`:
```javascript
const QUESTION_TIME = 20; // Seconds per question
```

### Change Max Points
Edit in `app.js`:
```javascript
const MAX_POINTS = 1000; // Maximum points per question
```

## 🐛 Troubleshooting

### Players can't connect
- Ensure all devices are on the same WiFi network
- Check firewall settings
- Verify the correct IP address is being used

### Firebase errors
- Check that Firebase config is correct
- Verify Realtime Database is enabled
- Check database rules allow read/write access

### Timer not syncing
- Firebase automatically syncs timestamps
- Ensure stable internet connection
- Check browser console for errors

### Players not appearing
- Check Firebase console to verify data is being written
- Verify database rules allow writes
- Check browser console for errors

## 🚀 Deploy Your Game Online

Want people to play on their phones from anywhere? See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete instructions!

### Quick Deploy (3 Easy Options):

1. **Render** (Recommended - Free & Easy)
   - Push to GitHub
   - Connect to Render
   - Get your live URL in 5 minutes!

2. **Railway** (Fast & Free)
   - Push to GitHub
   - Deploy with one click
   - Instant live URL

3. **Glitch** (No Git Required)
   - Upload files directly
   - Live instantly

**📖 Full deployment guide:** [DEPLOYMENT.md](DEPLOYMENT.md)

### Quick Setup Script:
```bash
cd ibm-bob-quiz
./deploy-setup.sh
```
This will prepare your project for deployment to any platform!

## 📄 Files

- `index.html` - Main HTML structure with embedded CSS
- `app.js` - All game logic and Firebase integration
- `README.md` - This file

## 🎉 Features Checklist

✅ Firebase Realtime Database integration  
✅ Admin login with credentials  
✅ Game PIN (483921) for players  
✅ Random emoji avatars  
✅ Up to 100 simultaneous players  
✅ Real-time synchronization (< 200ms)  
✅ 20-second countdown timer  
✅ 4 answer options (A/B/C/D)  
✅ Speed-based scoring (max 1,000 pts)  
✅ 10 IBM questions with fun facts  
✅ Live response counter  
✅ Answer reveal with fun facts  
✅ Animated leaderboards  
✅ Winners podium (1st, 2nd, 3rd)  
✅ Dark-themed UI  
✅ Responsive design  
✅ Admin controls every phase  

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Verify Firebase configuration
3. Check browser console for errors
4. Ensure all devices have internet access

## 🎓 Learning Resources

- [Firebase Realtime Database Docs](https://firebase.google.com/docs/database)
- [Firebase Web SDK Guide](https://firebase.google.com/docs/web/setup)
- [JavaScript Async/Await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)

## 📜 License

MIT License - Feel free to use and modify!

---

**Made with ❤️ by Bob**

Enjoy your IBM Quiz Challenge! 🎯🏆