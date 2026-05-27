# 🚀 Quick Setup Guide - IBM Bob Quiz

## Fastest Way to Get Started (< 2 minutes)

### Step 1: Open the App
Simply open `index.html` in any modern web browser:

```bash
cd ibm-bob-quiz
open index.html
```

Or double-click `index.html` in your file browser.

**That's it!** The app comes pre-configured with a demo Firebase project.

---

## For Multi-Device Testing

To test with multiple devices on the same network, you need a local web server:

### Option A: Python (Easiest - Built into Mac/Linux)
```bash
cd ibm-bob-quiz
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

### Option B: Node.js
```bash
npm install -g http-server
cd ibm-bob-quiz
http-server -p 8000
```

### Option C: PHP
```bash
cd ibm-bob-quiz
php -S localhost:8000
```

### Connect Other Devices:
1. Find your computer's IP address:
   - **Mac:** Open Terminal and run: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows:** Open Command Prompt and run: `ipconfig`
   - Look for something like `192.168.1.100`

2. On other devices (phones, tablets, other computers):
   - Make sure they're on the **same WiFi network**
   - Open a browser and go to: `http://YOUR_IP:8000`
   - Example: `http://192.168.1.100:8000`

---

## Testing the Game

### Test as Admin:
1. Open the app
2. Login with:
   - Username: `admin`
   - Password: `ibmbob2024`
3. You'll see the admin panel

### Test as Player:
1. Open the app in another browser tab/window or device
2. Click "Join as Player"
3. Enter any name
4. You'll join the lobby

### Run a Full Game:
1. Open admin in one tab
2. Open 2-3 player tabs
3. Join players with different names
4. As admin, click "Start Game"
5. As admin, click "Show Question"
6. Players answer the question
7. As admin, click "Reveal Answer"
8. As admin, click "Show Leaderboard"
9. Repeat for all 10 questions!

---

## Setting Up Your Own Firebase (Optional)

If you want to use your own Firebase project instead of the demo:

### 1. Create Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com/)
- Click "Add project"
- Enter a project name
- Disable Google Analytics (optional)
- Click "Create project"

### 2. Enable Realtime Database
- In your project, click "Realtime Database" in the left menu
- Click "Create Database"
- Choose a location (e.g., us-central1)
- Start in **test mode** (for development)
- Click "Enable"

### 3. Get Your Configuration
- Click the gear icon ⚙️ next to "Project Overview"
- Click "Project settings"
- Scroll down to "Your apps"
- Click the web icon `</>`
- Register your app (give it a nickname)
- Copy the `firebaseConfig` object

### 4. Update app.js
Open `app.js` and replace the `firebaseConfig` at the top:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

### 5. Set Database Rules (Important for Production!)
In Firebase Console > Realtime Database > Rules, use:

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

**Note:** These rules allow anyone to read/write. For production, implement proper authentication.

---

## Troubleshooting

### "Firebase is not defined" error
- Make sure you have internet connection
- The Firebase SDK loads from CDN
- Check browser console for network errors

### Players can't see each other
- Verify all devices are on the same WiFi
- Check firewall isn't blocking connections
- Try disabling firewall temporarily

### Timer not syncing
- Firebase handles time synchronization automatically
- Ensure stable internet connection
- Refresh the page if issues persist

### Admin can't login
- Username: `admin` (lowercase)
- Password: `ibmbob2024` (no spaces)
- Check for typos

### Game PIN not working
- The PIN is: `483921`
- It's displayed on the player join screen
- PIN is just for show - players can join directly

---

## Customization Quick Tips

### Change Admin Password
In `app.js`, line 18:
```javascript
const ADMIN_PASSWORD = "ibmbob2024"; // Change this
```

### Change Game PIN
In `app.js`, line 16:
```javascript
const GAME_PIN = "483921"; // Change this
```

### Change Question Timer
In `app.js`, line 19:
```javascript
const QUESTION_TIME = 20; // Seconds per question
```

### Add More Questions
In `app.js`, add to the `questions` array (starting around line 23):
```javascript
{
    question: "Your question here?",
    answers: ["A", "B", "C", "D"],
    correct: 0, // Index: 0=A, 1=B, 2=C, 3=D
    funFact: "Fun fact about the answer!"
}
```

---

## Deployment (Make it Public)

### GitHub Pages (Free)
1. Create a GitHub account
2. Create a new repository
3. Upload `index.html` and `app.js`
4. Go to Settings > Pages
5. Select main branch
6. Your app is live at `https://username.github.io/repo-name`

### Netlify (Free, Easiest)
1. Go to [netlify.com](https://netlify.com)
2. Sign up (free)
3. Drag and drop the `ibm-bob-quiz` folder
4. Your app is live instantly!
5. You get a URL like `https://random-name.netlify.app`

---

## System Requirements

- **Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Internet:** Required for Firebase
- **Devices:** Works on desktop, tablet, and mobile
- **Network:** All devices must have internet access

---

## Need Help?

1. Check the main [README.md](README.md) for detailed documentation
2. Check browser console (F12) for error messages
3. Verify Firebase configuration is correct
4. Ensure internet connection is stable

---

**Ready to play? Open `index.html` and start quizzing! 🎯**