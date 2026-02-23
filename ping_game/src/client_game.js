
//vars
// import {keysPress} from "./utils/constant.js"
// import {WebSocket} from 'ws';
let beforeUnloadAdded = false; 
let wsClient = null;
let front_side = null;
let Paddle1_export = null, Paddle2_export= null, Ball_export= null, PwrState = null;
let is_joining = false;
let side = null;
let score = [0,0];
let payload = null;
export {score, front_side, payload};
export {Ball_export as ball, Paddle1_export as Player1, Paddle2_export as Player2, wsClient, PwrState};
export function waiting_player(){
    return new Promise((resolve) =>{
        const verify = ()=>{
            if (is_joining)
            {
                console.log('connection is success');
                resolve();
            }
            else{
                setTimeout(verify, 100);
                console.log("is waiting for new player");
            }
        };
        verify();
    });
}
//show key sent by the client to the server

export function setupNetwork() {
    return new Promise((resolve, reject) => {
        // If a WebSocket connection exists already, close it
    if (wsClient) {
        wsClient.onerror = wsClient.onopen = wsClient.onclose = null;
        wsClient.close();
    }

    const keys = {
    w: { element: document.getElementById('key-w'), status: document.getElementById('status-w') },
    s: { element: document.getElementById('key-s'), status: document.getElementById('status-s') }
    };

    let is_pressed;
    let client_id;
    let g_state = 'ASSIGN_ID';
    const inputState = {
        w: false,
        a: false,
        s: false,
        d: false,
        shift: false,
        arrowup: false,
        arrowdown: false,
    };



    // 1. Initialize WebSocket
    // console.log("setupNetwork called");

    wsClient = new WebSocket('ws://localhost:5001'); // Adjust to your server URL
    if(!wsClient)
        alert('Check connection with the server');
    console.log("WebSocket connection established");
    wsClient.onerror = (error) =>{
        // console.log("Error when connecting to the websocket");
        alert('Error when connecting to the websocket');
        reject(error);
    }
    wsClient.onopen = () =>{
        // console.log("WebSocket connection established");
        const urlParams = new URLSearchParams(window.location.search);
        const matchDataRaw = urlParams.get("match_data");
        const matchData = JSON.parse(matchDataRaw);
        // console.log("DATA are sent to the server: ");
        // console.log(matchData);
        const msg = {type: 'DATA', 
            data: matchData
        }
        wsClient.send(JSON.stringify(msg));
        resolve();
    }
    wsClient.onclose = (event)=>{
        // console.log('WebSocket closed:', event.code, event.reason);
        is_joining = false;
        // Optionally update UI to show disconnection
        updateWaitingUI(false);
    }
    wsClient.onmessage = (event) => {
        //splic the logic for new server Json messages
        const message = JSON.parse(event.data);
        // if(message.state)
        //     console.log(message.state);
        // console.log("state " + message.state)

        // console.log("state " + message.state);
        switch (message.state) {
            case 'ASSIGN_ID':
                // State 1: Initialization
                // console.log("id " + message.id)
                handleHandshake(message.id, message.side);
                break;
            case 'OPPONENT_LEFT':
                // State 4: Opponent Left
                // console.log("Opponent has left the game");
                updateWaitingUI(false);
                is_joining = false;
                break;
            case 'OPPONENT_JOINED':
                // State 2: Waiting/Transition
                // console.log("DEBUG:  Opponent has joined the game");
                updatescenepos(message.ball, message.P1, message.P2);
                updateWaitingUI(true);
                is_joining = true;
                break;

            case 'GAME_UPDATE':
                // State 3: Active Gameplay
                updategame(message.ball , message.paddleY, message.score, message.powups, message.PaddelH);
                break;
            case 'ROUND_OVER':
                // State: Round Over - Animation phase
                payload = message;
                score = message.score;
                // console.log("********************* " + JSON.stringify(message));
                // console.log("Round Over - Winner: Player " + (message.roundWinner === 1 ? "1" : "2"));
                break;
            case 'COUNTDOWN':
                // State: Countdown before next round
                payload = message;
                // console.log("Countdown for round " + message.round);
                break;
            case 'MATCH_OVER':
                // State: Match is completely over
                payload = message;
                score = message.score;
                // console.log("Match Over!");
                break;
            case 'GAME_OVER':
                // State 6: Game Over
                // console.log("Game Over state received");
                // Trigger game over UI or reset logic here
                break;
        }

            //

        };


    function hideout_bk(state){
        if (state === true){
        // Hide the waiting screen
            document.getElementById('waiting-room').style.display = 'none';
        // Show the game
        // document.getElementById('game-container').style.display = 'block';

        console.log("Game Started!");
        }
        else{
            document.getElementById('waiting-room').style.display = 'flex';
            // document.getElementById('game-container').style.display = 'none';
            console.log("Waiting for opponent...");
        }
    }
    //Event listeners for key press down and up and send data to the server
    document.addEventListener('keydown', function(event) {
        if (!wsClient || wsClient.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket not ready, skipping input');
            return;
        }
        const key = event.key.toLowerCase();
        if (inputState.hasOwnProperty(key) ){
            inputState[key] = true;
        }
        if(!is_pressed){
            const msg = {type: 'INPUT', 
                keys: inputState
            }
            wsClient.send(JSON.stringify(msg));
        }
        is_pressed = true;
    });

    document.addEventListener('keyup', function(event) {
        if (!wsClient || wsClient.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket not ready, skipping input');
            return;
        }
        const display = document.getElementById('key-sent');
        const key = event.key.toLowerCase();
        if (inputState.hasOwnProperty(key)) {
            inputState[key] = false;
        }
        const msg = {type: 'INPUT', 
            keys: inputState
        }
        wsClient.send(JSON.stringify(msg));

        is_pressed = false;
    });
    //Utils functions
    function handleHandshake(id, side){
        client_id = id;
        front_side = side;
    }
    function updateWaitingUI(bool){
        if (bool === true)
            hideout_bk(true);
        else
            hideout_bk(false);
    }
    function updatescenepos(b , Player1, Player2){
        Paddle1_export = Player1; 
        Paddle2_export = Player2;
        Ball_export = b;
    }
    function updategame(b , paddleY, score_update, powups, PaddelH){
        if (Paddle1_export && Paddle2_export) {
            Paddle1_export.y = paddleY.P1; 
            Paddle2_export.y = paddleY.P2;
            Paddle1_export.height = PaddelH.P1;
            Paddle2_export.height = PaddelH.P2;
            Ball_export = b;
            score = score_update;
            PwrState = powups;
        }
        else {
                console.warn('Paddles not initialized yet');}
    }
    if (!beforeUnloadAdded) {
        window.addEventListener('beforeunload', () => {
        if (wsClient && wsClient.readyState === WebSocket.OPEN)
            wsClient.close(1000, "Work complete"); // Friendly close
        });
        beforeUnloadAdded = true;
    } 
    });
}