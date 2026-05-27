# 🧪 Testing Guide - IBM Bob Quiz

## Quick Test (Single Computer)

The app now works in **LOCAL MODE** using localStorage, so you can test immediately without Firebase setup!

### Step 1: Refresh Your Browser
If you already have the app open, **refresh the page** (Cmd+R or F5)

### Step 2: Test Admin
1. You should see the admin login screen
2. Login with:
   - Username: `admin`
   - Password: `ibmbob2024`
3. You'll see the admin panel with 0 players

### Step 3: Test Players
1. Open a **new browser tab** (Cmd+T)
2. Go to the same URL (or open `index.html` again)
3. Click **"Join as Player"**
4. Enter a name (e.g., "Alice")
5. Click **"Join Game"**
6. You should see the waiting room

### Step 4: Add More Players
1. Open another tab
2. Join as "Bob"
3. Open another tab
4. Join as "Charlie"
5. Switch back to the admin tab - you should see all 3 players!

### Step 5: Run the Game
1. In admin tab, click **"Start Game"**
2. Click **"Show Question"**
3. Switch to player tabs and answer the question
4. Back in admin, click **"Reveal Answer"**
5. Click **"Show Leaderboard"**
6. Click **"Show Question"** for the next question
7. Repeat for all 10 questions!

## Expected Behavior

### ✅ What Should Work:
- Admin login
- Players joining with unique names
- Random emoji avatars
- Player list updates in real-time (when you switch tabs)
- Questions appearing for all players
- 20-second countdown timer
- Answer submission
- Score calculation
- Leaderboards
- Winners podium

### ⚠️ Local Mode Limitations:
- Updates only sync when you switch tabs (not instant like Firebase)
- Only works on the same computer
- Data clears when you close all tabs

### 🚀 For Real Multi-Device Testing:
Set up Firebase (see README.md) to get:
- Real-time sync across devices (< 200ms)
- Multiple devices on different networks
- Persistent data
- Up to 100 simultaneous players

## Troubleshooting

### "Name already taken" error
- Each player needs a unique name
- Try: Alice, Bob, Charlie, Dave, etc.

### Players not appearing
- Refresh the admin tab
- Make sure you clicked "Join Game"
- Check browser console (F12) for errors

### Timer not working
- Refresh the page
- Make sure JavaScript is enabled
- Check browser console for errors

### Can't login as admin
- Username: `admin` (lowercase, no spaces)
- Password: `ibmbob2024` (no spaces)

## Browser Console

Open the browser console (F12 or Cmd+Option+I) to see:
- Connection status
- Whether Firebase or localStorage is being used
- Any errors

You should see:
```
🔄 Running in LOCAL MODE - Open multiple tabs to test multiplayer
💡 For real-time sync across devices, set up Firebase (see README.md)
```

## Testing Checklist

- [ ] Admin can login
- [ ] Players can join with names
- [ ] Players get random emojis
- [ ] Admin sees player count
- [ ] Admin can start game
- [ ] Questions appear for players
- [ ] Timer counts down from 20
- [ ] Players can select answers
- [ ] Correct answers show green
- [ ] Wrong answers show red
- [ ] Scores calculate correctly
- [ ] Leaderboard shows rankings
- [ ] Winners podium displays top 3
- [ ] All 10 questions work
- [ ] Play again resets the game

## Tips

1. **Use different browser windows** instead of tabs for easier testing
2. **Arrange windows side-by-side** to see updates
3. **Use incognito/private windows** for additional players
4. **Check the console** if something doesn't work
5. **Refresh all tabs** if things get out of sync

## Next Steps

Once local testing works:
1. Set up Firebase for real multi-device testing
2. Deploy to a hosting service
3. Share the URL with friends to play!

---

**Happy Testing! 🎯**