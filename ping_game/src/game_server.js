// IMPORT AND VARS

// import { JsxEmit } from 'typescript';

import http from 'http';
import https from 'https';
import { WebSocketServer, WebSocket } from 'ws';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import CONSTANTS from './utils/constant.js';
import { keysPress,  InitPaddlesPos, InitPaddles2Pos, ballInitPos, arr} from './utils/constant.js';
import {Game} from './game.js'; 
const { PORT } = CONSTANTS;
let matchData = null;
import { fileURLToPath } from 'url';
import { clearInterval } from 'timers';
import { score } from './client_game.js';
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
let waitingPlayers = [];
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
  //wait until data is sent by the client to the server to assign the player to a game
  console.log("debug match data ", socket.matchData);
  //generate an id and add to waiting queue
  const playerId = uuidv4();
  socket.id = playerId;
  socket.gameId = null;
  socket.side = null;
  socket.hasMatchData = false;  // Track if this player has sent matchData
  socket.userId = null;  // Will be set when matchData arrives
  socket.userLevel = null;  // Will be set when matchData arrives
  socket.sessionId = null;  // Will be set when matchData arrives
  
  // Add to waiting queue
  waitingPlayers.push(socket);
  console.log(`Player ${playerId} connected. Waiting players: ${waitingPlayers.length}`);
  
  // Send waiting state to client
  socket.send(JSON.stringify({
    id: playerId,
    state: 'WAITING_FOR_OPPONENT'
  }));
  //respond to messages sent by the clients
  socket.on('message', (data) => {
    const message = JSON.parse(data);
    // console.log("arr " + socket.id + ": ", arr);
    switch (message.type){
      case 'DATA':
        // Handle game state request or other data messages
        // Store match data on the socket for later retrieval
        socket.matchData = message.data;
        matchData = message.data;
        socket.sessionId = message.data.sessionId;
        socket.hasMatchData = true;  // Mark this player as having sent matchData
        
        // Identify which player this socket represents by comparing players array with opponentId
        const players = message.data.players;
        const opponentId = message.data.opponentId;
        
        // Find the current player (the one that is NOT the opponent)
        const currentPlayer = players.find(p => p.id !== opponentId);
        
        if (currentPlayer) {
          socket.userId = currentPlayer.id;
          socket.userLevel = currentPlayer.level;
          console.log(`Socket ${socket.id} identified as user ${socket.userId} (${currentPlayer.username}) with level ${socket.userLevel}`);
        } else {
          console.warn(`Could not identify current player from matchData for socket ${socket.id}`);
        }
        
        console.log("Received match data from player", socket.id, ": ", JSON.stringify(matchData, null, 2));
        
        // If this socket already has a game, store matchData on the game too
        if (socket.gameId) {
          const game = activeMatches.get(socket.gameId);
          if (game) {
            game.matchData = message.data;
            console.log("Stored matchData on game object");
          }
        } else {
          // If player is still waiting, try to match now that they have matchData
          console.log("Player is waiting. Attempting to match...");
          tryMatchPlayers();
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
        //Process input to see if someone is cheating
        if (socket.gameId) {
          const game = activeMatches.get(socket.gameId);
          if (game) {
            updatekeys(message.keys, socket.side, game.inputs);
          }
        }
        break;
    }
    // players[playerId].keys = keys;
    // console.log(`Received input from player ${playerId}: Key = ${key}, Pressed = ${is_p}`);
  });
  
  // Function to try matching players
  function tryMatchPlayers() {
    // Find players that both have matchData
    const playersWithData = waitingPlayers.filter(p => p.hasMatchData);
    
    if (playersWithData.length >= 2) {
      // Take first 2 players
      const player1 = playersWithData[0];
      const player2 = playersWithData[1];
      
      // Remove from waiting queue
      waitingPlayers = waitingPlayers.filter(p => p !== player1 && p !== player2);
      
      // Create new game
      let gameId = uuidv4();
      player1.gameId = gameId;
      player2.gameId = gameId;
      player1.side = 0;
      player2.side = 1;
      
      // Create game-specific input array
      const gameInputs = [
        { ArrowDown: false, ArrowUp: false, Wkey: false, Skey: false },
        { ArrowDown: false, ArrowUp: false, Wkey: false, Skey: false }
      ];
      
      const initialGameState = {
        players: { [player1.id]: player1, [player2.id]: player2 },
        playerIds: [player1.id, player2.id],
        inputs: gameInputs,
        interval: null,
        g_logic: null,
        lastCountdownNumber: null,
        lastBroadcastState: null,
        matchData: null,
        socketMap: {} // Map socket IDs to user data for score calculation
      };
      activeMatches.set(gameId, initialGameState);
      
      console.log(`Game ${gameId} created with players ${player1.id} and ${player2.id} (both have matchData)`);
      
      // Notify both players
      player1.send(JSON.stringify({
        id: player1.id,
        state: 'ASSIGN_ID',
        side: 0,
        gameId: gameId
      }));
      
      player2.send(JSON.stringify({
        id: player2.id,
        state: 'ASSIGN_ID',
        side: 1,
        gameId: gameId
      }));
      
      broadcastToGame(gameId, {
        state: 'OPPONENT_JOINED',
        ball: ballInitPos,
        P1: InitPaddlesPos,
        P2: InitPaddles2Pos
      });
    }
  }
  //handle disconnection
  socket.on('close', function close() {
    // Remove from waiting queue if still waiting
    const waitingIndex = waitingPlayers.indexOf(socket);
    if (waitingIndex > -1) {
      waitingPlayers.splice(waitingIndex, 1);
      console.log(`Player ${socket.id} disconnected from waiting queue`);
      return;
    }
    
    // Handle game disconnection
    if (socket.gameId) {
      const game = activeMatches.get(socket.gameId);
      if (game) {
        // Notify opponent before removing the match
        broadcastToGame(socket.gameId, {state: 'OPPONENT_LEFT'});
        clearInterval(game.interval);
        activeMatches.delete(socket.gameId);
        console.log(`Player ${socket.id} disconnected from game ${socket.gameId}`);
      }
    }
  });
})

// Broadcast to specific game
async function broadcastToGame(gameId, msg) {
  const game = activeMatches.get(gameId);
  if (!game) return;
  
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
          round: game.g_logic.round,
          roundWinsP1: game.g_logic.roundWinsP1,
          roundWinsP2: game.g_logic.roundWinsP2
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
          score: [game.g_logic.scoreP1, game.g_logic.scoreP2],
          roundWinsP1: game.g_logic.roundWinsP1,
          roundWinsP2: game.g_logic.roundWinsP2
        };
      } else {
        // Skip broadcasting if number hasn't changed
        return;
      }
    }
    else if (game.g_logic.roundState === "matchOver") {
      // Only send once when match is over
      if (game.lastBroadcastState !== "matchOver") {
        game.lastBroadcastState = "matchOver";
        broadcastMsg = {
          state: "MATCH_OVER",
          score: [game.g_logic.scoreP1, game.g_logic.scoreP2],
          round: game.g_logic.round + 1,
          roundWinner: (game.g_logic.scoreP1 > game.g_logic.scoreP2) ? 1 : 2,
          roundWinsP1: game.g_logic.roundWinsP1,
          roundWinsP2: game.g_logic.roundWinsP2,
          matchWinner: (game.g_logic.roundWinsP1 >= 2) ? 1 : 2
        };
        clearInterval(game.interval);
        // activeMatches.delete(socket.gameId);

      //update level
      try{
        console.log("INTERNAL_TOKEN:", process.env.INTERNAL_TOKEN);
        
        // Use matchData from the game object
        const gameMatchData = game.matchData || matchData;
        
        if (!gameMatchData) {
          console.error('No match data found for game', gameId);
          throw new Error('Match data is missing');
        }
        
        console.log("Match data:", JSON.stringify(gameMatchData, null, 2));
        
        const players = gameMatchData.players;
        
        if (!players || !Array.isArray(players) || players.length < 2) {
          console.error('Invalid players array:', players);
          throw new Error('Players array is invalid or missing');
        }
        
        console.log("Player 1 ID:", players[0].id, "Player 2 ID:", players[1].id);
        
        // Submit game results - use nginx reverse proxy with HTTPS (like curl --insecure)
        const submitGameResults = async () => {
          // Use the public API endpoint through nginx reverse proxy with HTTPS
          const url = new URL('https://nginx/api/public/game/results/submit');
          
          console.log("Submitting to:", url.href);
          
          // Get player info from sockets
          const player1Socket = game.players[Object.keys(game.players)[0]];
          const player2Socket = game.players[Object.keys(game.players)[1]];
          
          const player1Id = player1Socket.userId;
          const player2Id = player2Socket.userId;
          const player1Level = player1Socket.userLevel;
          const player2Level = player2Socket.userLevel;
          
          console.log(`Player 1 (socket): ID=${player1Id}, Level=${player1Level}`);
          console.log(`Player 2 (socket): ID=${player2Id}, Level=${player2Level}`);
          console.log(`Game scores: P1=${game.g_logic.scoreP1}, P2=${game.g_logic.scoreP2}`);
          
          // Calculate ELO changes
          const calculateELOChange = (playerLevel, opponentLevel, didWin) => {
            const K = 32;
            const expectedScore = 1 / (1 + Math.pow(10, (opponentLevel - playerLevel) / 400));
            const actualScore = didWin ? 1 : 0;
            return Math.round(K * (actualScore - expectedScore));
          };
          
          const p1Wins = game.g_logic.scoreP1 > game.g_logic.scoreP2;
          const p1EloChange = calculateELOChange(player1Level, player2Level, p1Wins);
          const p2EloChange = calculateELOChange(player2Level, player1Level, !p1Wins);
          
          const p1NewLevel = Math.max(0, player1Level + p1EloChange);
          const p2NewLevel = Math.max(0, player2Level + p2EloChange);
          
          const p1PointsEarned = player1Socket.side === 0 ? game.g_logic.roundWinsP1 : game.g_logic.roundWinsP2;
          const p2PointsEarned = player2Socket.side === 0 ? game.g_logic.roundWinsP1 : game.g_logic.roundWinsP2;
          
          const data = {
            results: [
              { sessionId: gameMatchData.sessionId, userId: player1Id, score: p1PointsEarned, level: p1NewLevel },
              { sessionId: gameMatchData.sessionId, userId: player2Id, score: p2PointsEarned, level: p2NewLevel }
            ]
          };

          try {
            console.log("Fetch request data:", JSON.stringify(data, null, 2));
            
            // Use https.request instead of fetch to properly handle self-signed certs
            const requestData = JSON.stringify(data);
            
            const options = {
              hostname: url.hostname,
              path: url.pathname + url.search,
              method: 'POST',
              rejectUnauthorized: false, // Ignore self-signed cert (like curl --insecure)
              headers: {
                'Content-Type': 'application/json',
                'x-internal-token': process.env.INTERNAL_TOKEN,
                'Content-Length': Buffer.byteLength(requestData)
              }
            };
            
            const result = await new Promise((resolve, reject) => {
              const req = https.request(options, (res) => {
                console.log("Response status:", res.statusCode);
                let responseData = '';
                
                res.on('data', (chunk) => {
                  responseData += chunk;
                });
                
                res.on('end', () => {
                  if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                      const parsed = JSON.parse(responseData);
                      console.log('Game results submitted successfully:', parsed);
                      resolve(parsed);
                    } catch (e) {
                      console.log('Game results submitted successfully (non-JSON response)');
                      resolve(responseData);
                    }
                  } else {
                    const errorMsg = `HTTP ${res.statusCode}: ${responseData}`;
                    console.error(`HTTP Error: ${errorMsg}`);
                    reject(new Error(errorMsg));
                  }
                });
              });
              
              req.on('error', (error) => {
                console.error('Request error:', error.message);
                reject(error);
              });
              
              // Send the data
              req.write(requestData);
              req.end();
            });
            
            return result;
          } catch (error) {
            console.error('Fetch error details:', error.message);
            console.error('Full error:', error);
          }
        };

        submitGameResults();
      } catch (error) {
        console.error('Error updating levels:', error.message);
        console.error('Full error:', error);
      }
      
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
    
    // Send to all players in this game
    Object.values(game.players).forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(broadcastMsg));
      }
    });
  }
  else if (msg) {
    // Send custom message to all players in this game
    Object.values(game.players).forEach((client) => {
      console.log("Broadcasting message to client " + client.id + ": ", msg);
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(msg));
        if (msg.state === 'OPPONENT_JOINED' || msg.state === 'OPPONENT_LEFT') {
          console.log("client id: " + client.id);
        }
      }
    });
  }
}

function updatekeys(keys, side, gameInputs){
  if(!keys) return;
  gameInputs[side].ArrowDown = keys.arrowdown;
  gameInputs[side].ArrowUp = keys.arrowup;
  gameInputs[side].Wkey = keys.w;
  gameInputs[side].Skey = keys.s;
}

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


//calculate elo score

function proba(playerLEVEL1, playerLEVEL2) {
    // Calculate and return the expected score
    return 1 / (1 + Math.pow(10, (playerLEVEL1 - playerLEVEL2) / 400));
}

// Function to calculate Elo rating
// K is a constant.
// outcome determines the outcome: 1 for Player A win, 0 for Player B win, 0.5 for draw.
function levelCalc(P1Levelinit, P2Levelinit, K, result) {
    // Calculate the Winning Probability of Player B
    let P2Proba = probability(P1Levelinit, P2Levelinit);

    // Calculate the Winning Probability of Player A
    let P1Proba = probability(P2Levelinit, P1Levelinit);

    // Update the Elo Ratings
    P1Levelinit = P1Levelinit + K * (result - P1Proba);
    P2Levelinit = P2Levelinit + K * ((1 - result) - P2Proba);

    // Print updated ratings
    console.log("Updated Ratings:-");
    console.log(`P1Levelinit = ${P1Levelinit} P2Levelinit = ${P2Levelinit}`);
}