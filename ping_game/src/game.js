//global vars and classes

import {arr} from "./utils/constant.js"

const PADDLE_SPEED = 0.4;
const MAXBOUNCEANGLE = 50;
let BALL_SPEED = 0.06;

//functions sections

function getRandomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

    };

    update(dt){
        //update the ball position
        this.x += this.vx * dt * BALL_SPEED;
        this.y += this.vy * dt * BALL_SPEED;



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
    reset(){
        this.x  = this.COURT_WIDTH / 2;
        this.y  = this.COURT_DEPTH / 2;
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
    };
    update(dt, direction){
        this.y = this.y + direction * PADDLE_SPEED * dt;
        this.y = Math.max(0, this.y);
        this.y = Math.min(this.y, this.COURT_DEPTH - this.height);
    };
};
//important notes: 
// optmize the code by removein duplicate values
export class Game{
    constructor() {
        this.COURT_DEPTH = 554;
        this.COURT_WIDTH = 1107;
        this.Player1 = new Paddle(-this.COURT_DEPTH + this.COURT_DEPTH + 20 , 0 + 100/2, 20, 100, this.COURT_WIDTH, this.COURT_DEPTH);
        this.Player2 = new Paddle(this.COURT_DEPTH + this.COURT_DEPTH - 20 ,  this.COURT_DEPTH - 100 - 10, 20, 100, this.COURT_WIDTH, this.COURT_DEPTH);
        this.scoreP1 = 0;
        this.scoreP2 = 0;
        // Fix: Pass COURT_WIDTH first, then COURT_DEPTH
        this.ball = new ball(this.COURT_WIDTH/2, this.COURT_DEPTH/2, this.COURT_WIDTH, this.COURT_DEPTH, {score: this.scoreP1}, {score: this.scoreP2});
        
    };
    //update input and scence
    update(deltaTime){  
        this.scoreP1 = this.ball.scoreP1;
        this.scoreP2 = this.ball.scoreP2;  
        // Convert to a more reasonable scale (divide by 1000 to get seconds, then multiply by desired speed)
        let scaledDeltaTime = deltaTime * 0.8; // Adjust this multiplier as needed
        // if(isNaN(scaledDeltaTime) || scaledDeltaTime < 0)
        //     scaledDeltaTime = 1/60;
        // if(keysPress.Enter)
        //     this.ball.reset();
        if(arr[1].ArrowDown || arr[1].ArrowUp){
            this.Player2.update(scaledDeltaTime, arr[1].ArrowDown ? 1 : -1)
        }
        if(arr[0].Wkey || arr[0].Skey){
            this.Player1.update(scaledDeltaTime, arr[0].Skey ? 1 : -1);
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
            
        }

        if (this.ball.collide(this.Player2)){
            // Move ball away from paddle to prevent sticking
            this.ball.x = this.Player2.x - this.ball.radius;
            
            // Calculate bounce angle based on where the ball hits the paddle
            let relativeIntersectY = (this.Player2.y + (this.Player2.height / 2)) - this.ball.y;
            let normalizedRelativeIntersectionY = relativeIntersectY / (this.Player2.height / 2);
            
            // Convert angle to radians and clamp the normalized value
            normalizedRelativeIntersectionY = Math.max(-1, Math.min(1, normalizedRelativeIntersectionY));
            let bounceAngle = normalizedRelativeIntersectionY * (MAXBOUNCEANGLE * Math.PI / 180);
            
            // Set new velocity with consistent speed
            let speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy) * 1.01; // Slightly increase speed
            this.ball.vx = -Math.abs(speed * Math.cos(bounceAngle)); // Always negative (moving left)
            this.ball.vy = speed * -Math.sin(bounceAngle);
        }

        this.ball.update(scaledDeltaTime);

        //calculate the score and reset the ball
        if(this.scoreP1 >= 10 || this.scoreP2 >= 10){
            this.ball.scoreP1 = 0;
            this.ball.scoreP2 = 0;
            // this.ball.reset();
        }
    };

};
