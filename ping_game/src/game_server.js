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
//switch the connection from http to websocket
const wsserver = new WebSocketServer({server: server});
//vars for input
let input_ky;
let players = {};
//listen for new connection
wsserver.on('connection', (socket)=>{
  socket.isAlive = true;
  socket.on('pong', ()=>{
    socket.isAlive = true;
  });
  if(Object.keys(players).length > 1){
    console.log("Connection refused: server full");
    socket.close();
    return;
  }
  //generate an id(just for now) and sent it to the client
  const playerId = uuidv4();
  socket.id = playerId;
  players[playerId] = {key: ""};
  players[playerId].side = (Object.keys(players).length == 1) ? 0 : 1;
  console.log("New clients is connected clts nb: " + Object.keys(players).length + " and side " + players[playerId].side);
  const msg = {
    id: playerId,
    state: 'ASSIGN_ID',
    side: players[playerId].side
  }
  socket.send(JSON.stringify(msg));
  if(Object.keys(players).length === 2){
    let gameId = uuidv4();
      wsserver.clients.forEach((c) => {
      if (c.id) c.gameId = gameId;
    });
    const initialGameState = {
    pg : players, 
    interval: null,
    g_logic: null
    };
    activeMatches.set(gameId, initialGameState);
    // initialGameState.g_logic = new Game();
    broadcast({state: 'OPPONENT_JOINED', ball: ballInitPos, 
                                         P1: InitPaddlesPos,
                                         P2: InitPaddles2Pos});
         
    // initialGameState.interval =  setInterval(()=>{broadcast();
    // }, 1000 / 60);
  }
  //respond to messages sent by the clients
  socket.on('message', (data) => {
    const message = JSON.parse(data);
    // console.log("arr " + socket.id + ": ", arr);
    switch (message.type){
      case 'REQUEST_GAME_STATE':
        // Send the current game state to the requesting client
        const game = activeMatches.get(socket.gameId);
        if(game && !game.g_logic){
          game.g_logic = new Game();
          game.interval =  setInterval(()=>{broadcast();
          }, 1000 / 60);
        }
        break;
      case 'INPUT':
        //Process input to see if someone is cheating
        // activeMatches.get(socket.gameId)?.interval);
        // console.log(message.keys);
        updatekeys(message.keys, players[socket.id].side);
        break;
    }
    // players[playerId].keys = keys;
    // console.log(`Received input from player ${playerId}: Key = ${key}, Pressed = ${is_p}`);

  })
  //handle disconnection
  socket.on('close', function close() {
    clearInterval(activeMatches.get(socket.gameId)?.interval);
    activeMatches.delete(socket.gameId);
    delete players[socket.id];
    // clearInterval(pp);
    console.log('disconnected clts nb: ' + Object.keys(players).length);
    broadcast({state: 'OPPONENT_LEFT'});
  });
})

function broadcast(msg) {
  wsserver.clients.forEach((client) => {
    // let client_id = client.id;
    // const data_c = players[client_id];

    if(client.readyState === WebSocket.OPEN)
    {
      if (msg){
        if (msg.state === 'OPPONENT_JOINED' || msg.state === 'OPPONENT_LEFT'){
          client.send(JSON.stringify(msg));
          console.log("client id: " + client.id);    
        }
      }
      else{
        const game = activeMatches.get(client.gameId);
        if (!game || !game.g_logic) return;

        const msg = {
          state: "GAME_UPDATE",
          ball: { x:game.g_logic.ball.x, y: game.g_logic.ball.y},
          paddleY: {P1: game.g_logic.Player1.y, P2:game.g_logic.Player2.y},
          score: [game.g_logic.scoreP1, game.g_logic.scoreP2],
          timestamp:  Date.now()
        }
        game.g_logic.update(1000/60);
        client.send(JSON.stringify(msg));
      }
    }
  });
}

function updatekeys(keys, side){
  if(!keys) return;
  arr[side].ArrowDown = keys.arrowdown;
  arr[side].ArrowUp = keys.arrowup;
  arr[side].Wkey = keys.w;
  arr[side].Skey = keys.s;
}
const pp = setInterval(() => {
  wsserver.clients.forEach((client) =>{
    if(!client.isAlive)
      return client.terminate();
    client.isAlive = false;
    client.ping();
  });
}, 10000);
// Start the server listening on localhost:8080
server.listen(PORT, () => {
  console.log(`Listening on: http://localhost:${server.address().port}`);
});


