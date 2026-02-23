# How to Add Round Animations & UI

## Overview
The ball now freezes automatically when someone scores 10 points in a round. This gives you **2 seconds** for animation, then **3 seconds** for countdown before the next round starts.

## Quick Start: Add Animation UI

### Option 1: Winner Banner (Recommended)

In `app.ts`, find the `ROUND_OVER` case and add:

```typescript
case "ROUND_OVER":
  if (!this._roundOverAnimationPlayed) {
    this._roundOverAnimationPlayed = true;
    const winner = payload.roundWinner === 0 ? "Player 1" : "Player 2";
    console.log(`${winner} wins the round!`);
    
    // Create banner display
    const banner = createScoreBoard(
      "roundWinnerBanner",
      new Vector3(COURT_WIDTH / 2, 200, COURT_DEPTH / 2),
      { width: 800, height: 200 }
    );
    
    await this._renderUI.update_text(
      banner.texture,
      `${winner} Wins!`,
      50
    );
    
    // Remove after animation duration
    setTimeout(() => {
      banner.plane.dispose();
      this._roundOverAnimationPlayed = false;
    }, this._animationDuration || 2000);
  }
  break;
```

### Option 2: Camera Effects During Round Over

```typescript
case "ROUND_OVER":
  // Zoom camera in slightly for emphasis
  if (this._camera && !this._zoomedIn) {
    this._camera.radius = 500;  // Zoom in
    this._zoomedIn = true;
    
    // Zoom back out after animation
    setTimeout(() => {
      this._camera.radius = 700;
      this._zoomedIn = false;
    }, 2000);
  }
  break;
```

### Option 3: Slow-Motion Effect

```typescript
case "ROUND_OVER":
  // The ball is already frozen by server
  // You could slow paddle movement or add camera pan
  console.log("Round animation playing...");
  break;
```

## Countdown Display

During `COUNTDOWN` state, display the round number and count down:

```typescript
case "COUNTDOWN":
  if (!this._countdownStarted) {
    this._countdownStarted = true;
    const countdown = createScoreBoard(
      "countdown",
      new Vector3(COURT_WIDTH / 2, 150, COURT_DEPTH / 2),
      { width: 600, height: 300 }
    );
    
    const startTime = Date.now();
    let lastNumber = 3;
    
    const countdownInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.ceil((3 - elapsed / 1000));
      
      if (remaining !== lastNumber && remaining > 0) {
        this._renderUI.update_text(countdown.texture, remaining.toString(), 100);
        lastNumber = remaining;
      }
      
      if (elapsed > 3000) {
        clearInterval(countdownInterval);
        countdown.plane.dispose();
        this._countdownStarted = false;
      }
    }, 100);
  }
  break;
```

## Track Round Number

Add to App class:

```typescript
private _roundOverAnimationPlayed: boolean = false;
private _countdownStarted: boolean = false;
private _zoomedIn: boolean = false;
private _animationDuration: number = 2000;
```

## Server State Flow (What happens automatically)

```
Playing → Score reaches 10 → roundOver state
                               ↓ (2 seconds)
                          countdown state  
                               ↓ (3 seconds)
                            playing (next round)
```

## Key Points

1. **Ball is frozen** - No updates during `roundOver` and `countdown`
2. **Automatic transition** - Server handles timing, client just renders
3. **Scores persist** - Scores carry over to next round
4. **Round counter** - `payload.round` tells you which round (0, 1, or 2)
5. **Ball reset** - Automatically called when round restarts

## Example: Complete Enhanced Handler

```typescript
case "ROUND_OVER":
  if (!this._roundOverAnimationPlayed) {
    this._roundOverAnimationPlayed = true;
    const winner = payload.roundWinner === 0 ? "1" : "2";
    const myWin = (front_side === payload.roundWinner);
    
    // Play sound
    if (myWin) {
      this.AudioManager.play("victory_sound"); // If you have it
    }
    
    // Show banner
    const banner = createScoreBoard(
      "banner",
      new Vector3(COURT_WIDTH / 2, 250, COURT_DEPTH / 2),
      { width: 1000, height: 300 }
    );
    
    await this._renderUI.update_text(
      banner.texture,
      myWin ? "YOU WIN!" : "YOU LOSE!",
      80
    );
    
    // Camera effect
    const originalRadius = this._camera.radius;
    this._camera.radius = 450;
    
    // Cleanup after 2 seconds
    setTimeout(() => {
      banner.plane.dispose();
      this._camera.radius = originalRadius;
      this._roundOverAnimationPlayed = false;
    }, 2000);
  }
  break;

case "COUNTDOWN":
  if (!this._countdownStarted) {
    this._countdownStarted = true;
    const roundNum = payload.round + 1;
    
    const countdown = createScoreBoard(
      "countdown_round",
      new Vector3(COURT_WIDTH / 2, 150, COURT_DEPTH / 2),
      { width: 700, height: 400 }
    );
    
    // Show "Round X" first
    await this._renderUI.update_text(countdown.texture, `Round ${roundNum}`, 100);
    
    await sleep(500);
    
    // Then countdown 3-2-1
    for (let i = 3; i >= 1; i--) {
      await this._renderUI.update_text(countdown.texture, i.toString(), 150);
      await sleep(1000);
    }
    
    countdown.plane.dispose();
    this._countdownStarted = false;
  }
  break;
```

## Testing

1. Start a game
2. One player scores 10 points
3. You should see `ROUND_OVER` message in console
4. Ball should freeze
5. After 2 seconds → `COUNTDOWN` message
6. After 3 more seconds → `GAME_UPDATE` resumes (new round)

## Debugging

Check console logs:
```javascript
// Look for these messages
"Round Over - Winner: Player 0"
"Countdown for round 1"
```

Check server logs to see state transitions happening server-side.
