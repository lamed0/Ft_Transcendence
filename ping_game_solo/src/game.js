//global vars and classes

import {arr, COURT_DEPTH, COURT_WIDTH, POWER_UPS_SIZE} from "./utils/constant.js"

const PADDLE_SPEED = 0.4;
const MAXBOUNCEANGLE = 50;
let BALL_SPEED = 0.07;
const Pow_t = ["FAST_PADDLE" ,"FAST_BALL", "SLOW_PADDLE", "LONG_PADDLE"];
const Pow_duration = {
    [Pow_t[0]]: 15000,
    [Pow_t[1]]: 15000,
    [Pow_t[2]]: 12000,
    [Pow_t[3]]: 13000
};
//functions sections
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function getRandomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
//implement powerups
class PowerUpManager{
    constructor(gameState){
        this.gameState = gameState;
        this.activePowUps = [];
        this.spawnPowUps = [];
        this.intervalPow = 15000;
        this.lastspawn = Date.now();
        this.idCounter = 0;

    }
    generateLocalId(prefix = '') {
        return prefix + this.idCounter++;
    }
    //activate powerup
    activatepwrup(powerup){
        //search if the powerup is already active if yes remove it and apply the new one
        const playerPaddle = this.gameState.lastHit ;

        for(let i = 0 ; i < this.activePowUps.length; i++){
            if(this.activePowUps[i].type != Pow_t[1] && playerPaddle === this.activePowUps[i].target){
                this.removePowEffect(this.activePowUps[i]);
                this.activePowUps.splice(i, 1);
                break;
            }
        }
        const effect = {
            id: powerup.id,
            type: powerup.type,
            duration: powerup.duration,
            time: Date.now()
        };
        this.applyPwrUpEffect(effect);
        console.log("type pw: " + effect.type + " target: " + effect.target);
        this.activePowUps.push(effect);

    }
    
    applyPwrUpEffect(effect){
        const {type} = effect;
        const {Player1, Player2, ball} = this.gameState;
        switch(type){
            case  Pow_t[0]:
                const playerPaddle = this.gameState.lastHit === 0 ? Player1 : Player2;
                playerPaddle.PADDLE_SPEED *= 1.5;
                effect.target = this.gameState.lastHit === 0 ? 0 : 1;
                break;
            case Pow_t[1]:
                ball.BALL_SPEED = 0.1;
                break; 
            case Pow_t[2]:
                const opponent_paddle = this.gameState.lastHit === 1 ? Player1 : Player2;
                opponent_paddle.PADDLE_SPEED = 0.2; 
                effect.target = this.gameState.lastHit === 1 ? 0 : 1;
                break;
            case Pow_t[3]:
                const PPaddle = this.gameState.lastHit === 0 ? Player1 : Player2;
                PPaddle.OGheight = PPaddle.height;
                PPaddle.height *= 1.5;
                effect.target = this.gameState.lastHit === 0 ? 0 : 1;
                break;
        }

    }
    
    
    removePowEffect(effect){
        const {type} = effect;
        const {Player1, Player2, ball} = this.gameState;
        switch(type){
            case  Pow_t[0]:
                const playerPaddle = effect.target === 0 ? Player1 : Player2;
                playerPaddle.PADDLE_SPEED = PADDLE_SPEED;
                break;
            case Pow_t[1]:
                ball.BALL_SPEED = BALL_SPEED;
                break; 
            case Pow_t[2]:
                const opponent_paddle = effect.target === 0 ? Player1 : Player2;
                opponent_paddle.PADDLE_SPEED = PADDLE_SPEED; 
                break;
            case Pow_t[3]:
                const PPaddle = effect.target === 0 ? Player1 : Player2;
                PPaddle.height = PPaddle.OGheight ;
                break;
        }
    }
    
    getState(){
        return {
        spawned: this.spawnPowUps,
        active: this.activePowUps.map(e => ({
            id: e.id,
            type: e.type,
            timeLeft: e.duration - (Date.now() - e.time),
            targetPaddle: e.target
        }))
        };
    
    }
    //spawn a powup
    spawnPowUp(){
        const NewPwrUP = {
            id: this.generateLocalId("Pid"),
            type: Pow_t[getRandomInteger(0, 3)],
            position: {
                x: (Math.random() - 0.5) * (COURT_WIDTH - 70), // Adjust to your table size
                y: 0.5,
                z: (Math.random() - 0.5) * (COURT_DEPTH - 200)
            }
        };
        NewPwrUP.duration = Pow_duration[NewPwrUP.type];
        this.spawnPowUps.push(NewPwrUP);

    }
    updateActivePwrUps(deltaTime){
        for(let i = 0 ; i < this.activePowUps.length; i++){
            const now = Date.now();
            const calcDuration = now - this.activePowUps[i].time;
            if(calcDuration > this.activePowUps[i].duration){
                this.removePowEffect(this.activePowUps[i]);
                this.activePowUps.splice(i, 1);
            }
        }
    }
    //check collision wiht pwrups
    checkcollision(){

        for(let i = 0 ; i < this.spawnPowUps.length; i++){
            
            if(this.collide(this.gameState.ball, this.spawnPowUps[i])){
                this.activatepwrup(this.spawnPowUps[i]);
                this.spawnPowUps.splice(i, 1);
            }
        }
    }
    //spawn power ups if time is meet and check collision for new powerups and update time for the active powerups
    update(deltaTime){
        //spawn powup
        if(Date.now() - this.lastspawn >= this.intervalPow){
            this.lastspawn = Date.now();
            this.spawnPowUp();
        }
        //check collision
        this.checkcollision();
    
        //update active powerups
        this.updateActivePwrUps();
    }
    collide(ball, powerup) {
        // Shift powerup position to match ball's coordinate system
        const powerupX = powerup.position.x + COURT_WIDTH / 2;
        const powerupY = powerup.position.z + COURT_DEPTH / 2;

        // Rectangle bounds (centered)
        const rectLeft   = powerupX - POWER_UPS_SIZE / 2;
        const rectRight  = powerupX + POWER_UPS_SIZE / 2;
        const rectTop    = powerupY - POWER_UPS_SIZE / 2;
        const rectBottom = powerupY + POWER_UPS_SIZE / 2;

        // Find closest point on rectangle to ball center
        const closestX = Math.max(rectLeft, Math.min(ball.y, rectRight));
        const closestY = Math.max(rectTop, Math.min(ball.x, rectBottom));

        const distanceX = ball.y - closestX;
        const distanceY = ball.x - closestY;

        return (distanceX * distanceX + distanceY * distanceY) < (ball.radius * ball.radius);
    }
}
class ball {    
    constructor(x, y, courtWidth, courtDepth, objP1, objP2){
        this.COURT_DEPTH = courtDepth;
        this.COURT_WIDTH = courtWidth;
        this.x = x;
        this.y = y;
        this.radius = 12.5; // Add missing radius property
        this.vx = Math.floor(Math.random() * 2) == 1 ? 5 : -5;
        this.vy = Math.floor(Math.random() * 2) == 1 ? 2 : -2;
        this.scoreP1 = objP1.score;
        this.scoreP2 = objP2.score;
        this.BALL_SPEED = BALL_SPEED;

    };

    async update(dt){
        //update the ball position
        this.x += this.vx * dt * this.BALL_SPEED;
        this.y += this.vy * dt * this.BALL_SPEED;



        //idea for the game add corner
        // this.vy *= 0.99;
        // this.vy = parseFloat(this.vy.toFixed(3));
        // this.vy += 0.25;
        
        // Wall collision (top and bottom)
        if (this.y - this.radius <= 0) {
            this.y = this.radius;
            this.vy = Math.abs(this.vy);
        }
        if (this.y + this.radius >= this.COURT_DEPTH) {
            this.y = this.COURT_DEPTH - this.radius;
            this.vy = -Math.abs(this.vy);
        }
        //update the score this.x + this.radius < 0 || this.x - this.radius > this.COURT_WIDTH) 
        if (this.x + this.radius < 0) {
            this.scoreP2 += 1;
        }
        else if (this.x - this.radius > this.COURT_WIDTH) {
            this.scoreP1 += 1;
        }
        // Side walls (reset ball)
        if (this.x + this.radius < 0 || this.x - this.radius > this.COURT_WIDTH) {
            this.reset();
            // console.log("Score P1: " + this.scoreP1 + " | Score P2: " + this.scoreP2);
        }

    };
    async reset(){
        this.x  = this.COURT_WIDTH / 2;
        this.y  = this.COURT_DEPTH / 2;
        this.vx = 0;
        this.vy = 0;
        await sleep(1500);
        this.vx = Math.floor(Math.random() * 2) == 1 ? 5 : -5;
        this.vy = Math.floor(Math.random() * 2) == 1 ? 2 : -2;

    };
    collide(paddle){
        // Check if ball (circle) intersects with paddle (rectangle)
        let closestX = Math.max(paddle.x, Math.min(this.x, paddle.x + paddle.width));
        let closestY = Math.max(paddle.y, Math.min(this.y, paddle.y + paddle.height));
        
        let distanceX = this.x - closestX;
        let distanceY = this.y - closestY;
        
        return (distanceX * distanceX + distanceY * distanceY) < (this.radius * this.radius);
    };
    
}
class Paddle {
    constructor(x, y, width, height, courtWidth, courtDepth){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.COURT_DEPTH = courtDepth;
        this.COURT_WIDTH = courtWidth;
        this.score = 0;
        this.PADDLE_SPEED = PADDLE_SPEED;
    };
    update(dt, direction){
        this.y = this.y + direction * this.PADDLE_SPEED * dt;
        this.y = Math.max(0, this.y);
        this.y = Math.min(this.y, this.COURT_DEPTH - this.height);
    };
};
//important notes: 
// optmize the code by removein duplicate values
export class Game{
    constructor(inputArray) {
        this.COURT_DEPTH = 554;
        this.COURT_WIDTH = 1107;
        // Player1 at left, vertically centered
        this.Player1 = new Paddle(20, (this.COURT_DEPTH - 100) / 2, 20, 100, this.COURT_WIDTH, this.COURT_DEPTH);
        // Player2 at right, vertically centered
        this.Player2 = new Paddle(this.COURT_WIDTH - 20 - 20, (this.COURT_DEPTH - 100) / 2, 20, 100, this.COURT_WIDTH, this.COURT_DEPTH);
        this.scoreP1 = 0;
        this.scoreP2 = 0;
        this.round = 0;
        this.lastHit = 0;
        // Fix: Pass COURT_WIDTH first, then COURT_DEPTH
        this.ball = new ball(this.COURT_WIDTH/2, this.COURT_DEPTH/2, this.COURT_WIDTH, this.COURT_DEPTH, {score: this.scoreP1}, {score: this.scoreP2});
        this.PowUps = new PowerUpManager(this);
        
        // Round state management
        this.roundState = "playing"; // "playing" | "roundOver" | "animating" | "countdown"
        this.roundOverTime = null;
        this.animationDuration = 3000; // 2 seconds for animation
        this.countdownDuration = 3000; // 3 seconds for countdown (3-2-1)
        this.roundWinner = null;
        this.lastCountdownNumber = null; // Track last countdown number sent
        
        // Game-specific input array
        this.inputs = inputArray || arr; // Fallback to global arr for backward compatibility
    };
    //update input and scence

    update(deltaTime){  
        this.scoreP1 = this.ball.scoreP1;
        this.scoreP2 = this.ball.scoreP2; 
        
        // Stop immediately if match is over (3 rounds)
        if (this.roundState === "matchOver") {
            return;
        }
        
        if (this.roundState === "roundOver") {
            const elapsed = Date.now() - this.roundOverTime;
            if (elapsed >= 3000) {
                // Move to countdown state
                this.roundState = "countdown";
                this.roundOverTime = Date.now();
                this.lastCountdownNumber = null;
            } else {
                return;
            }
        }

        if (this.roundState === "countdown") {
            const elapsed = Date.now() - this.roundOverTime;
            if (elapsed >= this.countdownDuration) {
                // Start new round
                this.roundState = "playing";
                this.lastCountdownNumber = null;
            } else {
                // Calculate current countdown number (3, 2, 1)
                const countdownNumber = Math.ceil((this.countdownDuration - elapsed) / 1000);
                this.currentCountdownNumber = countdownNumber;
                return;
            }
        }
        
        if (this.roundState !== "playing") {
            return;
        }
        let scaledDeltaTime = deltaTime * 1.2; // Adjust this multiplier as needed
        // if(isNaN(scaledDeltaTime) || scaledDeltaTime < 0)
        //     scaledDeltaTime = 1/60;
        // if(keysPress.Enter)
        //     this.ball.reset();

        //input handling for 1st player
        if(this.inputs[1].ArrowDown || this.inputs[1].ArrowUp){
            this.Player2.update(scaledDeltaTime, this.inputs[1].ArrowDown ? 1 : -1)
        }
        else if(this.inputs[1].Wkey || this.inputs[1].Skey){
            this.Player2.update(scaledDeltaTime, this.inputs[1].Skey ? 1 : -1);
        }
        //input handling for 2nd player
        if(this.inputs[0].Wkey || this.inputs[0].Skey){
            this.Player1.update(scaledDeltaTime, this.inputs[0].Skey ? 1 : -1);
        }
        else if(this.inputs[0].ArrowDown || this.inputs[0].ArrowUp){
            this.Player1.update(scaledDeltaTime, this.inputs[0].ArrowDown ? 1 : -1);
        }
        
        if (this.ball.collide(this.Player1)){
            // Move ball away from paddle to prevent sticking
            this.ball.x = this.Player1.x + this.Player1.width + this.ball.radius;
            
            // Calculate bounce angle based on where the ball hits the paddle
            let relativeIntersectY = (this.Player1.y + (this.Player1.height / 2)) - this.ball.y;
            let normalizedRelativeIntersectionY = relativeIntersectY / (this.Player1.height / 2);
            
            // Convert angle to radians and clamp the normalized value
            normalizedRelativeIntersectionY = Math.max(-1, Math.min(1, normalizedRelativeIntersectionY));
            let bounceAngle = normalizedRelativeIntersectionY * (MAXBOUNCEANGLE * Math.PI / 180);
            
            // Set new velocity with consistent speed
            let speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy) * 1.04; // Slightly increase speed
            this.ball.vx = Math.abs(speed * Math.cos(bounceAngle)); // Always positive (moving right)
            this.ball.vy = speed * -Math.sin(bounceAngle);
            this.lastHit = 0;
        }

        if (this.ball.collide(this.Player2)){
            this.ball.x = this.Player2.x - this.ball.radius;
            
            let relativeIntersectY = (this.Player2.y + (this.Player2.height / 2)) - this.ball.y;
            let normalizedRelativeIntersectionY = relativeIntersectY / (this.Player2.height / 2);
            
            normalizedRelativeIntersectionY = Math.max(-1, Math.min(1, normalizedRelativeIntersectionY));
            let bounceAngle = normalizedRelativeIntersectionY * (MAXBOUNCEANGLE * Math.PI / 180);
            
            let speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy) * 1.01; // Slightly increase speed
            this.ball.vx = -Math.abs(speed * Math.cos(bounceAngle)); // Always negative (moving left)
            this.ball.vy = speed * -Math.sin(bounceAngle);
            this.lastHit = 1;
        }

        this.ball.update(scaledDeltaTime);
        this.PowUps.update(scaledDeltaTime);

        if(this.scoreP1 >= 10 || this.scoreP2 >= 10){
            this.ball.scoreP1 = 0;
            this.ball.scoreP2 = 0;
            this.round += 1;
            this.roundState = "roundOver";
            this.roundOverTime = Date.now();
            
        }
        //calculate the score and reset the ball
        if(this.round === 3){
            this.ball.vx = 0;
            this.ball.vy = 0;
            this.roundState = "matchOver";
            delete this.PowUps;
        }
    };

};
