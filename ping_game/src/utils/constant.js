
const CONSTANTS = { PORT: 5000 };

export const keysPress = {
    ArrowUp: false,
    ArrowDown: false,
    Wkey: false,
    Skey: false,
    Enter: false
}
export const arr = [];
arr.push({...keysPress});
arr.push({...keysPress});
export const COURT_DEPTH = 1107;
export const COURT_WIDTH = 554;
//fix the wrong values of COURT_DEPTH and COURT_WIDTH after

const COURT_DEPTH_fix = 554;
const COURT_WIDTH_fix = 1107;

// export const PADDLE_SPEED = 300; // pixels per second
export default CONSTANTS;


export const InitPaddlesPos = {x: -COURT_DEPTH_fix + COURT_DEPTH_fix + 20 , y: 0 + 100/2};
export const InitPaddles2Pos = {x: COURT_DEPTH_fix + COURT_DEPTH_fix - 20 , y:  COURT_DEPTH_fix - 100 - 10};
export const ballInitPos = {x: COURT_WIDTH_fix/2, y: COURT_DEPTH_fix/2};

// export const PowerUps = {
//     'LongPaddle':{ 'Position': {x, y}, 'IsActiveOnScreen': false,'Duration': 10,'Timer': 0}
// }