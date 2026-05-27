# Load Test for IBM Bob Quiz

This load test simulates 100 concurrent players connecting to the quiz and playing through all 5 questions.

## Prerequisites

Make sure the server is running:
```bash
node server.js
```

## Running the Load Test

In a new terminal window, run:
```bash
node load-test.js
```

## What the Test Does

1. **Connects Admin** - Establishes admin connection first
2. **Connects 100 Players** - Simulates 100 players joining the quiz with 50ms delay between each
3. **Starts Quiz** - Admin starts the quiz automatically
4. **Simulates Gameplay** - Each player:
   - Receives questions
   - Answers with random delay (0-3 seconds)
   - Submits random answers
5. **Completes Quiz** - Runs through all 5 questions
6. **Reports Results** - Shows connection stats and quiz completion

## Expected Output

```
🚀 Starting Load Test for IBM Bob Quiz
📊 Target: 100 concurrent players

Step 1: Connecting admin...
✓ Admin connected
✓ Admin role confirmed

Step 2: Connecting 100 players...
✓ Player1 connected (abc123)
✓ Player1 joined the quiz
  Progress: 10/100 players connected
  Progress: 20/100 players connected
  ...
  Progress: 100/100 players connected

✅ Connection phase complete!
   Connected: 100/100 players
   Time taken: 5.23s
   Average: 52ms per player

Step 3: Waiting for connections to stabilize...

Step 4: Starting quiz...
  Player1 answered: 2
  Player2 answered: 0
  ...
  Question 1/5 completed
  Question 2/5 completed
  ...
  Question 5/5 completed

🏆 Quiz completed!
   Total players: 100
   Winner: Player42 with 450 points

🧹 Cleaning up connections...

✅ Load test complete!
```

## Performance Metrics

The test will report:
- Number of successful connections
- Connection time and average per player
- Quiz completion status
- Winner and final scores

## Troubleshooting

### Connection Errors
If you see connection errors:
- Make sure the server is running on port 3000
- Check if firewall is blocking connections
- Reduce `NUM_PLAYERS` in load-test.js if your system can't handle 100

### Timeout
If the test times out (5 minutes):
- Check server logs for errors
- Ensure server can handle the load
- Check system resources (CPU, memory)

## Customization

Edit `load-test.js` to change:
- `NUM_PLAYERS`: Number of simulated players (default: 100)
- `DELAY_BETWEEN_CONNECTIONS`: Delay between player connections in ms (default: 50)
- `SERVER_URL`: Server URL (default: http://localhost:3000)

## Notes

- The test uses WebSocket connections for real-time communication
- Each player answers randomly, so results will vary
- The test automatically cleans up all connections when complete
- Maximum test duration is 5 minutes (timeout)