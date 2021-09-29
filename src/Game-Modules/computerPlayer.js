//new idea is to have a stack of targets to track
//the normal mode of operation at this point is to try and sink a ship
//however if the hitArray still has unsunk ship targets, we should add those to the stack
//the first thing we should do is check to see if the hit array is empty.
//then, if it is empty, check the target stack.
//if the target stack is empty, randomly fire until you find a hit
//then add that to the hitArray. create surrounding squares.
//then check the surrounding squares. Once you find a hit, there are two options.
//1.1 keep going until you get a sunk ship. Now, however, you'll need to check to make sure all of the
//      other targets in the hit array are sunk.
// -- 1.2 if any targets are not sunk, you want to now add those to the targetArray
// -- 1.3 if they are all sunk, you're good, clear the hit array
// 2.1 keep going until the surrounding squares on an axis are not possible to hit. If this is the case, you've got some
//parallel ships.
// -- 2.2 you push everything in the hitAray to the stack.

//after both 1 and two, you want to clear the hit array.
//at the beginning of every call to the computer player, it will check first-- is there anything in the hitArray?
//--if there is only one thing in the hit array, we need to look at the surrounding areas.
//--if there are two or more things in the hit array, we have a ship that we are trying to attack
//--if there is nothing in the hit array, we check the target stack
//--if there is something in the target stack && it is not sunk, repeat the cycle.
//--if there is something in the target stack && it is sunk, remove it from the target stack and repeat the previous step
//--if there is nothing in the target stack, then we randomly fire.
import { setCheckerBoardCoords } from "./checkerBoard";
let targetStack = [];
let hitArray = []; //tracks hit targets
let surroundingSquares = []; //tracks the surrounding squares for a hit target
let move; // move response to be set and returned
let orientation; // to set an orientation once the computer finds two parallel hit squares
let difficulty; // to set the difficulty level of the computer player

const sunkShip = () => {
  // fires after a ship has been sunk
  hitArray = [];
  surroundingSquares = [];
  orientation = false;
};

const generateSurroundingSquares = (row, col) => {
  surroundingSquares.push(
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1]
  );
};
export const checkSurroundingSquares = (row, col, game) => {
  //checks the squares around a given target to see if they can be attacked
  const board = game.getBoard();
  //check if it is at the edge of the board
  const left = col > 0 ? board[row][col - 1] : false;
  const right = col < 9 ? board[row][col + 1] : false;
  const top = row > 0 ? board[row - 1][col] : false;
  const bottom = row < 9 ? board[row + 1][col] : false;
  const checkArray = [left, right, top, bottom];
  let sum = 0;
  checkArray.forEach((square) => {
    const hasBeenMissed = square === 1;
    const hasBeenHit = Array.isArray(square) && square[1] === "X";

    if (square === false || hasBeenMissed || hasBeenHit) sum++;
  });

  return { checkArray, sum }; //if sum is 4, there are no surrounding available squares to fire
};


const randomFire = (game) => {
  //fires at randomly generated position
  const row = Math.floor(Math.random() * 10);
  const col = Math.floor(Math.random() * 10);

  const enclosed = checkSurroundingSquares(row, col, game).sum === 4;
  if (enclosed) {
    randomFire(game);
  } else {
    try {
      const res = game.fire(row, col);
      move = { res: res, board: game.getBoard() };
      if (res === "SUNK") {
        sunkShip();
      }
      if (Array.isArray(res)) {
        //it's a hit, add to hitArray and note surrounding squares
        hitArray.push([row, col]);
        generateSurroundingSquares(row, col);
      }
    } catch {
      //if error is returned, try again
      randomFire(game);
    }
  }
};
const randomFireParity = (game) => {
  //fires at the board in a checkerboard pattern, but selects which square to fire at randomly
  const checkerBoardCoords = setCheckerBoardCoords(game)
  const row = Math.floor(Math.random() * 10);
  const col = Math.floor(Math.random() * 5);
  const target = checkerBoardCoords[row][col]
  console.log(target)
  try {
    const res = game.fire(target[0], target[1]);
    move = { res: res, board: game.getBoard() };
    if (res === "SUNK") {
      sunkShip();
    }
    if (Array.isArray(res)) {
      //it's a hit, add to hitArray and note surrounding squares
      hitArray.push([target[0], target[1]]);
      generateSurroundingSquares(target[0], target[1]);
    }
  } catch {
    //if error is returned, try again
    randomFireParity(game);
  }
};

const findTarget = (game) =>{
  if(difficulty==="easy") randomFire(game)
  if(difficulty ==="hard") randomFireParity(game)
}

const honeIn = (game) => {
  //searches for the ship in the surrounding squares of the initial hit

  const canFire =
    //first, check the surrounding squares to make sure that it is possible to hit.
    checkSurroundingSquares(hitArray[0][0], hitArray[0][1], game).sum !== 4;
  if (!canFire) {
    hitArray = [];
    surroundingSquares = [];
    if (targetStack[0]) {
      manageTargetStack(game);
    } else findTarget(game);
  } else {
    //can fire at atleast one of the surrounding squares
    const randomIndex = Math.floor(Math.random() * surroundingSquares.length);
    const target = surroundingSquares[randomIndex];

    try {
      const board = game.getBoard();
      const res = game.fire(target[0], target[1]);
      move = { res: res, board: game.getBoard() };
      if (res === "SUNK") {
        if (board[hitArray[0][0]][hitArray[0][1]][2] === "SUNK") {
          //1st check to make sure that the initial target is sunk.
          // if SUNK, ship is only two squares long and we aren't looking for anything else
          sunkShip();
        } else {
          return;
          //hitArray length is still 1, we return the move and next time computerPlayer is called, it will still call honeIn()
        }
      }
      if (Array.isArray(res)) {
        //hit a ship, now push the coordinates to the hitArray and
        //compare to see what the orientation of the ship is
        surroundingSquares = [];
        if (hitArray[0][0] === target[0]) {
          //row is the same
          orientation = "horizontal";
          if (target[1] > hitArray[0][1]) {
            //make sure hitArray is in ascending column order
            hitArray.push(target);
          } else hitArray.unshift(target);
        } else if (hitArray[0][1] === target[1]) {
          //col is the same
          orientation = "vertical";
          if (target[0] > hitArray[0][0]) {
            //make sure hit array is in ascending row order
            hitArray.push(target);
          } else hitArray.unshift(target);
        }
      }
    } catch {
      //encountered error with firing at a surrounding square. Try again.
      honeIn(game);
    }
  }
};

const pushToTargetStack = (game) => {
  //pushes any unsunk targets from hitArray to stack
  const board = game.getBoard();
  hitArray.forEach((target) => {
    const row = target[0];
    const col = target[1];
    if (board[row][col][2] !== "SUNK") {
      targetStack.push(target);
    }
  });
};

const sinkShip = (game) => {
  if (orientation === "horizontal") {
    const rowVal = hitArray[0][0];
    const lowTargetColumnValue = hitArray[0][1] - 1;
    const highTargetColumnValue = hitArray[hitArray.length - 1][1] + 1;
    try {
      //try to fire at left side of ship first
      const res = game.fire(rowVal, lowTargetColumnValue);
      move = { res: res, board: game.getBoard() };
      if (res === "SUNK") {
        pushToTargetStack(game); // push any unsunk targets from hitArray to stack
        sunkShip(); //clear hitArray
      }
      if (Array.isArray(res)) {
        //hit a target, unshift coords to hitArray(left side)
        hitArray.unshift([rowVal, lowTargetColumnValue]);
      }

      return;
    } catch {
      //can't fire to left side of ship, try right side
      try {
        const res = game.fire(rowVal, highTargetColumnValue);
        move = { res: res, board: game.getBoard() };
        if (res === "SUNK") {
          pushToTargetStack(game); // push any unsunk targets from hitArray to stack
          sunkShip(); //clear hitArray
        }
        if (Array.isArray(res)) {
          //hit a target, push coords to hitArray (right side)
          hitArray.push([rowVal, highTargetColumnValue]);
        }

        return;
      } catch {
        //can't fire to left or right, but haven't sunk a ship. Parallel vertical ships
        console.log("parallel ships, trying new tactic");
        pushToTargetStack(game); // push any unsunk targets from hitArray to stack
        sunkShip(); //clear hitArray
        manageTargetStack(game); //begin attacking targets in stack
      }
    }
  } else if (orientation === "vertical") {
    const colValue = hitArray[0][1];
    const lowTargetRowValue = hitArray[0][0] - 1;
    const highTargetRowValue = hitArray[hitArray.length - 1][0] + 1;

    try {
      //try top side of ship first
      const res = game.fire(lowTargetRowValue, colValue);
      move = { res: res, board: game.getBoard() };
      if (res === "SUNK") {
        pushToTargetStack(game); // push any unsunk targets from hitArray to stack
        sunkShip(); //clear hitArray
        return;
      }
      if (Array.isArray(res)) {
        //hit a ship, unshift to array (top side)
        hitArray.unshift([lowTargetRowValue, colValue]);
      }
    } catch {
      try {
        //can't fire at top side, try bottom side
        const res = game.fire(highTargetRowValue, colValue);
        move = { res: res, board: game.getBoard() };
        if (res === "SUNK") {
          pushToTargetStack(game); // push any unsunk targets from hitArray to stack
          sunkShip(); //clear hitArray
        }
        if (Array.isArray(res)) {
          //hit a ship, unshift to array (bottom side)
          hitArray.push([highTargetRowValue, colValue]);
        }
      } catch {
        //can't fire to top or bottom, but haven't sunk a ship. Parallel horizontal ships
        console.log("parallel ships, trying new tactic");
        pushToTargetStack(game); // push any unsunk targets from hitArray to stack
        sunkShip(); //clear hitArray
        manageTargetStack(game); //begin attacking targets in stack
      }
    }
  }
};

const manageTargetStack = (game) => {
  //Only way we get here should be if the hitArray is empty & targetStack is not empty
  //This function takes a target from the stack and sends it to hit array if appropriate.

  const board = game.getBoard();
  const shiftTarget = targetStack.shift(); //[row, col]
  if (board[shiftTarget[0]][shiftTarget[1]][2] !== "SUNK") {
    //doesn't belong to a sunk ship, we can target with hitArray and hone in on target
    hitArray.push(shiftTarget);
    generateSurroundingSquares(shiftTarget[0], shiftTarget[1]);
    honeIn(game);
  } else {
    if (targetStack.length !== 0) {
      //check the next item in the stack
      manageTargetStack(game);
    } else {
      findTarget(game);
    }
  }
};

const computerPlayer = (game, mode) => {
  difficulty = mode
  if (move && move.res === "SUNK") {
    console.log(game.getBoard());
  }
  if (hitArray.length === 0) {
    // not currently attacking any ship
    if (targetStack.length === 0) {
      //no previous hit targets to add to attack
      findTarget(game)
      return move;
    } else if (targetStack.length !== 0) {
      manageTargetStack(game);
      return move;
    }
  }
  if (hitArray.length === 1) {
    // we have a target and are trying to find the rest of the ship
    honeIn(game);
    return move;
  }
  if (hitArray.length > 1) {
    //found the ship, keep attacking
    sinkShip(game);
    return move;
  }
};

export default computerPlayer;
