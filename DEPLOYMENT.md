# 🚀 Deployment Guide - IBM Bob Quiz

This guide will help you deploy your quiz game so people can play it on their phones from anywhere.

## 📱 Quick Deployment Options

### Option 1: Render (Recommended - FREE & Easy)

**Render** is a free hosting platform perfect for Node.js apps like this quiz game.

#### Steps:

1. **Create a GitHub Account** (if you don't have one)
   - Go to https://github.com
   - Sign up for free

2. **Push Your Code to GitHub**
   ```bash
   cd ibm-bob-quiz
   git init
   git add .
   git commit -m "Initial commit - IBM Bob Quiz"
   ```
   
   - Create a new repository on GitHub
   - Follow GitHub's instructions to push your code

3. **Deploy on Render**
   - Go to https://render.com
   - Sign up with your GitHub account (free)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: ibm-bob-quiz (or any name you want)
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free
   - Click "Create Web Service"

4. **Access Your Game**
   - Render will give you a URL like: `https://ibm-bob-quiz.onrender.com`
   - Share this URL with players!
   - They can access it from any phone or computer

⚠️ **Note**: Free Render apps sleep after 15 minutes of inactivity. First load may take 30-60 seconds.

---

### Option 2: Railway (FREE & Fast)

**Railway** offers free hosting with faster cold starts than Render.

#### Steps:

1. **Push to GitHub** (same as Option 1, steps 1-2)

2. **Deploy on Railway**
   - Go to https://railway.app
   - Sign up with GitHub (free)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects Node.js and deploys
   - Click "Generate Domain" to get your public URL

3. **Access Your Game**
   - URL will be like: `https://ibm-bob-quiz.up.railway.app`
   - Share with players!

---

### Option 3: Glitch (Easiest - No Git Required)

**Glitch** lets you deploy directly without GitHub.

#### Steps:

1. **Go to Glitch**
   - Visit https://glitch.com
   - Sign up (free)

2. **Create New Project**
   - Click "New Project" → "glitch-hello-node"
   - Delete the default files

3. **Upload Your Files**
   - Upload all files from `ibm-bob-quiz` folder
   - Or use Glitch's import from GitHub feature

4. **Access Your Game**
   - URL will be like: `https://ibm-bob-quiz.glitch.me`
   - Click "Share" to get the live link

---

### Option 4: Heroku (Requires Credit Card for Verification)

**Heroku** is reliable but requires credit card verification (still free tier available).

#### Steps:

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Or download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku App**
   ```bash
   cd ibm-bob-quiz
   heroku login
   heroku create ibm-bob-quiz
   ```

3. **Add Procfile**
   Create a file named `Procfile` (no extension):
   ```
   web: node server.js
   ```

4. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

5. **Access Your Game**
   - URL: `https://ibm-bob-quiz.herokuapp.com`

---

## 🔧 Pre-Deployment Checklist

Before deploying, make sure:

1. ✅ Your `package.json` has the correct start script:
   ```json
   "scripts": {
     "start": "node server.js"
   }
   ```

2. ✅ Your server listens on the correct port:
   ```javascript
   const PORT = process.env.PORT || 3000;
   ```

3. ✅ All dependencies are in `package.json`

4. ✅ Test locally first: `npm start`

---

## 📱 Sharing with Players

Once deployed, share your game URL:

1. **For Admin** (you):
   - Open: `https://your-app-url.com`
   - Click the small admin button (bottom left)
   - Wait for players to join
   - Start the quiz

2. **For Players** (on phones):
   - Share: `https://your-app-url.com`
   - They click "Player" button
   - Enter their name
   - Wait for you to start

---

## 🎮 Testing on Your Phone (Local Network)

Before deploying, test on your phone locally:

1. **Find Your Computer's IP Address**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```
   Look for something like `192.168.1.x`

2. **Start the Server**
   ```bash
   npm start
   ```

3. **On Your Phone**
   - Connect to the same WiFi as your computer
   - Open browser and go to: `http://192.168.1.x:3000`
   - Replace `x` with your actual IP

---

## 🆘 Troubleshooting

### App Won't Start
- Check logs on your hosting platform
- Verify `package.json` has all dependencies
- Ensure `PORT` environment variable is used

### Players Can't Connect
- Check if the URL is correct
- Verify the app is running (not sleeping)
- Check browser console for errors

### Socket.IO Issues
- Make sure WebSocket connections are allowed
- Some platforms require specific configuration for WebSockets

---

## 💡 Tips

1. **Custom Domain**: Most platforms let you add a custom domain (e.g., `quiz.yourdomain.com`)

2. **Environment Variables**: Store sensitive data in environment variables, not in code

3. **Monitoring**: Use the platform's dashboard to monitor app performance

4. **Scaling**: If you get many players, upgrade to a paid plan for better performance

---

## 🎉 You're Ready!

Choose one of the deployment options above and get your quiz game online in minutes!

**Recommended for beginners**: Start with **Render** or **Railway** - they're free, easy, and reliable.