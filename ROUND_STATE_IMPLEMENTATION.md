# Round State Implementation Guide

## Overview
The game now has a proper round state machine that stops the ball when a round completes, waits for animation time, shows a countdown, then starts the next round.

## State Machine

The game cycles through these states:

1. **`playing`** - Normal gameplay, ball is moving, collisions are active
2. **`roundOver`** - Round has ended (someone scored 10 points), ball is frozen, animation plays
3. **`countdown`** - Waiting between rounds, showing countdown UI (3-2-1)
4. **`matchOver`** - All 3 rounds are complete, match is finished

## Server Changes (game.js)

### Constructor Updates
```javascript
this.roundState = "playing";
this.roundOverTime = null;
this.animationDuration = 2000;    // 2 seconds for animation
this.countdownDuration = 3000;    // 3 seconds for countdown
this.roundWinner = null;
```

### Update Method Logic
- Only updates game logic when `roundState === "playing"`
- When someone scores 10 points:
  - Freezes ball velocity (`vx = 0`, `vy = 0`)
  - Sets `roundState = "roundOver"`
  - Records timestamp for animation duration
- After animation duration elapses:
  - Transitions to `countdown` state
- After countdown elapses:
  - Resets ball with `ball.reset()`
  - Increments round counter
  - Returns to `playing` state
- If round reaches 3:
  - Sets `roundState = "matchOver"`

## Server Broadcast Updates (game_server.js)

The server now sends different messages based on round state:

### ROUND_OVER Message
```javascript
{
  state: "ROUND_OVER",
  roundWinner: 0 or 1,
  scores: [P1_score, P2_score],
  round: current_round
}
```

### COUNTDOWN Message
```javascript
{
  state: "COUNTDOWN",
  round: next_round_number,
  scores: [P1_score, P2_score]
}
```

### MATCH_OVER Message
```javascript
{
  state: "MATCH_OVER"
}
```

### Normal GAME_UPDATE Message (enhanced)
```javascript
{
  state: "GAME_UPDATE",
  ball: { x, y },
  paddleY: { P1, P2 },
  PaddelH: { P1, P2 },
  score: [P1, P2],
  roundState: "playing",  // NEW field
  powups: {...},
  timestamp: Date.now()
}
```

## Client Changes (client_game.js)

Added handlers for new round state messages:

```javascript
case 'ROUND_OVER':
  payload = message;
  console.log("Round Over - Winner: Player " + (message.roundWinner === 0 ? "1" : "2"));
  break;
case 'COUNTDOWN':
  payload = message;
  console.log("Countdown for round " + message.round);
  break;
case 'MATCH_OVER':
  payload = message;
  console.log("Match Over!");
  break;
```

The `payload` object is exported and used by the client to trigger UI animations.

## Client Rendering Changes (app.ts)

Updated the render loop to handle round states:

```typescript
if(payload && payload.state) {
  switch(payload.state) {
    case "ROUND_OVER":
      // Show animation (winner banner, effects, etc.)
      break;
    case "COUNTDOWN":
      // Show 3-2-1 countdown on screen
      break;
    case "MATCH_OVER":
      // End game state
      break;
  }
}
```

## Timeline

For default timings:
1. **Round ends** (someone scores 10) → Ball freezes
2. **Animation plays** (2 seconds) → Show winner banner, effects, etc.
3. **Countdown** (3 seconds) → Show 3-2-1 with round number
4. **Game resumes** → Ball resets, new round starts

## Customization

You can adjust these values in `game.js` constructor:

```javascript
this.animationDuration = 2000;    // Milliseconds
this.countdownDuration = 3000;    // Milliseconds
```

## UI Animation Opportunities

In `app.ts`, you can enhance the animations during `ROUND_OVER` state:

- Display winner banner
- Play victory/defeat sound
- Camera zoom or effects
- Pause paddle movement
- Any visual celebration effects

Similarly for `COUNTDOWN`:
- Show round number
- Display 3-2-1 countdown with the existing scoreboard system
- Flash screen or effects
- Play anticipation sound

## Important Notes

- Ball velocity is frozen when entering `roundOver` state
- Scores persist across rounds
- Paddle heights and velocities are restored when new round starts (powered by reset ball function)
- The system is server-authoritative, clients only render what server sends
