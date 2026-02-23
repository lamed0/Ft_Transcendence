// IMPORT AND VARS

// import { JsxEmit } from 'typescript';

import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import CONSTANTS from './utils/constant.js';
import { keysPress,  InitPaddlesPos, InitPaddles2Pos, ballInitPos, arr} from './utils/constant.js';
import {Game} from './game.js'; 
const { PORT } = CONSTANTS;
import { fileURLToPath } from 'url';
import { clearInterval } from 'timers';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the HTTP server
const server = http.createServer((req, res) => {
  // get the file path from req.url, or '/public/index.html' if req.url is '/'
  const filePath = ( req.url === '/' ) ? '/public/index.html' : "/public" + req.url;

  // determine the contentType by the file extension
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  if (extname === '.js') contentType = 'text/javascript';
  else if (extname === '.css') contentType = 'text/css';

  // pipe the proper file to the res object
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(`${__dirname}/${filePath}`, 'utf8').pipe(res);
});
let activeMatches = new Map();
//switch the connection from http to websocket
const wsserver = new WebSocketServer({server: server});
//vars for input
let input_ky;
//listen for new connection
wsserver.on('connection', (socket)=>{
  socket.isAlive = true;
  socket.on('pong', ()=>{
    socket.isAlive = true;
  });
  
  const playerId = uuidv4();
  socket.id = playerId;
  socket.gameId = null;
  
  console.log(`Player ${playerId} connected. Ready to start solo game.`);
  
  // Send ready state to client
  socket.send(JSON.stringify({
    id: playerId,
    state: 'READY_TO_START'
  }));
  //respond to messages sent by the clients
  socket.on('message', (data) => {
    const message = JSON.parse(data);
    switch (message.type){
      case 'START_GAME':
        // Start solo game immediately
        if (!socket.gameId) {
          let gameId = uuidv4();
          socket.gameId = gameId;
          
          // Create game-specific input array for both paddles
          const gameInputs = [
            { ArrowDown: false, ArrowUp: false, Wkey: false, Skey: false },
            { ArrowDown: false, ArrowUp: false, Wkey: false, Skey: false }
          ];
          
          const initialGameState = {
            player: socket,
            inputs: gameInputs,
            interval: null,
            g_logic: null,
            lastCountdownNumber: null,
            lastBroadcastState: null
          };
          activeMatches.set(gameId, initialGameState);
          
          console.log(`Solo Game ${gameId} created for player ${socket.id}`);
          
          // Notify player and start game
          socket.send(JSON.stringify({
            id: socket.id,
            state: 'ASSIGN_ID',
            side: 0,
            gameId: gameId
          }));
          
          // Initial game state with padddles and ball
          broadcastToGame(gameId, {
            state: 'OPPONENT_JOINED',
            ball: ballInitPos,
            P1: InitPaddlesPos,
            P2: InitPaddles2Pos
          });
        }
        break;
      case 'REQUEST_GAME_STATE':
        // Send the current game state to the requesting client
        const game = activeMatches.get(socket.gameId);
        if(game && !game.g_logic){
          game.g_logic = new Game(game.inputs);
          game.interval =  setInterval(()=>{broadcastToGame(socket.gameId);
          }, 1000 / 60);
        }
        break;
      case 'INPUT':
        // In solo mode, update input for both paddles based on keys pressed
        if (socket.gameId) {
          const game = activeMatches.get(socket.gameId);
          if (game) {
            const keys = message.keys;
            // Player 1 (left paddle): W and S keys
            game.inputs[0].Wkey = keys.w || false;
            game.inputs[0].Skey = keys.s || false;
            
            // Player 2 (right paddle): Arrow Up and Arrow Down keys
            game.inputs[1].ArrowUp = keys.arrowup || false;
            game.inputs[1].ArrowDown = keys.arrowdown || false;
          }
        }
        break;
    }
    // players[playerId].keys = keys;
    // console.log(`Received input from player ${playerId}: Key = ${key}, Pressed = ${is_p}`);
  });

  //handle disconnection
  socket.on('close', function close() {
    if (socket.gameId) {
      const game = activeMatches.get(socket.gameId);
      if (game) {
        clearInterval(game.interval);
        activeMatches.delete(socket.gameId);
        console.log(`Player ${socket.id} disconnected from solo game ${socket.gameId}`);
      }
    }
  });
})

// Broadcast to specific game
async function broadcastToGame(gameId, msg) {
  const game = activeMatches.get(gameId);
  if (!game) return;
  
  const player = game.player;
  
  // If no message provided, update game and broadcast state
  if (!msg && game.g_logic) {
    // Update game logic once per tick
    game.g_logic.update(1000/60);
    
    // Determine what message to send based on game state
    let broadcastMsg;
    
    if (game.g_logic.roundState === "roundOver") {
      // Only send once when entering roundOver state
      if (game.lastBroadcastState !== "roundOver") {
        game.lastBroadcastState = "roundOver";
        
        broadcastMsg = {
          state: "ROUND_OVER",
          roundWinner: (game.g_logic.scoreP1 > game.g_logic.scoreP2) ? 1 : 2,
          score: [game.g_logic.scoreP1, game.g_logic.scoreP2],
          round: game.g_logic.round
        };
      } else {
        // Skip broadcasting if already sent
        return;
      }
    }
    else if (game.g_logic.roundState === "countdown") {
      const countdownNumber = game.g_logic.currentCountdownNumber;
      // console.log("Countdown number: " + countdownNumber);
      // Only send update if countdown number changed
      if (countdownNumber !== game.lastCountdownNumber) {
        game.lastCountdownNumber = countdownNumber;
        game.lastBroadcastState = "countdown";
        
        broadcastMsg = {
          state: "COUNTDOWN",
          countdownNumber: countdownNumber,
          round: game.g_logic.round + 1,
          score: [game.g_logic.scoreP1, game.g_logic.scoreP2]
        };
      } else {
        // Skip broadcasting if number hasn't changed
        return;
      }
    }
    else if (game.g_logic.roundState === "matchOver") {
      // Game is over - just notify and don't submit any results
      if (game.lastBroadcastState !== "matchOver") {
        game.lastBroadcastState = "matchOver";
        broadcastMsg = {
          state: "MATCH_OVER",
          score: [game.g_logic.scoreP1, game.g_logic.scoreP2],
          round: game.g_logic.round,
          roundWinner: (game.g_logic.scoreP1 > game.g_logic.scoreP2) ? 1 : 2
        };
        clearInterval(game.interval);
      } else {
        return;
      }
    }
    else {
      // Normal game update - reset tracking when back to playing
      if (game.g_logic.roundState === "playing") {
        game.lastBroadcastState = "playing";
        game.lastCountdownNumber = null;
      }
      
      broadcastMsg = {
        state: "GAME_UPDATE",
        ball: { x: game.g_logic.ball.x, y: game.g_logic.ball.y },
        paddleY: { P1: game.g_logic.Player1.y, P2: game.g_logic.Player2.y },
        PaddelH: { P1: game.g_logic.Player1.height, P2: game.g_logic.Player2.height },
        score: [game.g_logic.scoreP1, game.g_logic.scoreP2],
        roundState: game.g_logic.roundState,
        powups: game.g_logic.PowUps.getState(), 
        timestamp: Date.now()
      };
    }
    
    // Send to the solo player
    if (player && player.readyState === WebSocket.OPEN) {
      player.send(JSON.stringify(broadcastMsg));
    }
  }
  else if (msg) {
    // Send custom message to the solo player with full game state
    if (msg.state === 'OPPONENT_JOINED') {
      // Ensure initial broadcast has all data
      const fullMsg = {
        state: msg.state,
        ball: msg.ball,
        P1: msg.P1,
        P2: msg.P2
      };
      if (player && player.readyState === WebSocket.OPEN) {
        console.log("Broadcasting initial game state with ball and paddles");
        player.send(JSON.stringify(fullMsg));
      }
    } else {
      if (player && player.readyState === WebSocket.OPEN) {
        console.log("Broadcasting message to player " + player.id + ": ", msg);
        player.send(JSON.stringify(msg));
      }
    }
  }
}

// No longer needed in solo mode
// function updatekeys(keys, side, gameInputs){
//   if(!keys) return;
//   gameInputs[side].ArrowDown = keys.arrowdown;
//   gameInputs[side].ArrowUp = keys.arrowup;
//   gameInputs[side].Wkey = keys.w;
//   gameInputs[side].Skey = keys.s;
// }

// Legacy broadcast for compatibility
function broadcast(msg) {
  broadcastToGame(null, msg);
}
const pp = setInterval(() => {
  wsserver.clients.forEach((client) =>{
    if(!client.isAlive)
      return client.terminate();
    client.isAlive = false;
    client.ping();
  });
}, 10000);
// Start the server listening on localhost:port
server.listen(PORT, () => {
  console.log(`Listening on: http://localhost:${server.address().port}`);
});


