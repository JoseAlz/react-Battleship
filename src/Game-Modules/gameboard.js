import ship from "./ship";

const gameboard = () => {
  let board = [];
  const getBoard = () => board;

  for (let i = 0; i < 10; i++) {
    //nested loop fills board with a 10x10 2d array of 0's to represent empty squares
    let boardArray = [];
    for (let j = 0; j < 10; j++) {
      boardArray.push(0);
    }
    board.push(boardArray);
  }

  const ships = {
    //ship objects to be placed on board
/*     s2a: ship(2, "s2a"),
    s2b: ship(2, "s2b"), 
    s3a: ship(3, "s3a"),
    s3b: ship(3, "s3b"), 
    s4: ship(4, "s4"),*/
    s5: ship(5, "s5"),
  };

  const shipPlacements = { s2a: [], s2b: [], s3a: [], s3b: [], s4: [], s5: [] };
  const removeShip =(shipName) =>{
    shipPlacements[shipName].forEach(coord=>{
      board[coord[0]][coord[1]] = 0
    })
    shipPlacements[shipName] = []
  }
  const getShipPlacements = ()=>shipPlacements
  const getShips = () => ships;

  const isGameOver = () => {
    const keys = Object.keys(ships);
    let count = 0;
    keys.forEach((key) => {
      if (ships[key].isSunk()) count++;
    });
    return count === keys.length ? true : false;
  };

  const placeShipHorizontally = (row, col, shipName) => {
    const ship = ships[shipName];
    if (col > 10 - ship.shipArray.length) {
      //check to see if ship can fit from starting coords
      throw new Error("ship cannot be placed here");
    }
    for (let i = 0; i < ship.shipArray.length; i++) {
      //check to see if ship will intersect with another ship
      if (board[row][col + i] !== 0) {
        throw new Error("ship cannot be placed here");
      }
    }
    for (let i = 0; i < ship.shipArray.length; i++) {
      //insert an array into the board with the ship name and index
      board[row][col + i] = [ship.name, i, false, "horizontal"];
      shipPlacements[shipName].push([row, col + i]);
      
    }
  };

  const placeShipVertically = (row, col, shipName) => {
    const ship = ships[shipName];
    if (row > 10 - ship.shipArray.length) {
      //check to see if ship can fit from starting coords
      throw new Error("ship cannot be placed here");
    }
    for (let i = 0; i < ship.shipArray.length; i++) {
      //check to see if ship will intersect with another ship
      if (board[row + i][col] !== 0)
        throw new Error("ship cannot be placed here");
    }
    for (let i = 0; i < ship.shipArray.length; i++) {
      //insert an array into the board with the ship name and index
      board[row + i][col] = [ship.name, i, false, "vertical"];
      shipPlacements[shipName].push([row + i, col]);
    }
  };

  const placeShipRandomly = (shipName) => {
    const orientation = Math.floor(Math.random() * 2); //0= horizontal, 1 = vertical
    if (orientation === 0) {
      const rowPos = Math.floor(Math.random() * 10);
      const colPos = Math.floor(
        Math.random() * (10 - ships[shipName].shipArray.length)
      );
      try {
        placeShipHorizontally(rowPos, colPos, shipName);
      } catch {
        //recursively calls function again until it finds a place to put the ship
        placeShipRandomly(shipName);
      }
    } else if (orientation === 1) {
      const rowPos = Math.floor(
        Math.random() * (10 - ships[shipName].shipArray.length)
      );
      const colPos = Math.floor(Math.random() * 10);
      try {
        placeShipVertically(rowPos, colPos, shipName);
      } catch {
        placeShipRandomly(shipName);
      }
    }
  };
  const placeShipsRandomly = () => {
    const keys = Object.keys(ships);
    keys.forEach((shipName) => placeShipRandomly(shipName));
  };

  const fire = (row, col) => {
    if (row < 0 || row > 9 || col < 0 || col > 9) {
      throw new Error("index out of range");
    }
    let target = board[row][col];

    if (!target) {
      //target is 0 then miss
      board[row][col] = 1;
      return "MISS";
    }
    if ((Array.isArray(target) && target[1] === "X") || target === 1) {
      //target is 1 or X then a hit or miss has been registered here
      throw new Error("you already tried this spot");
    }

    if (Array.isArray(target)) {
      //Array that points to a ship object, its a hit. Change target[1] from index reference to "X"
      //to symbolize a hit
      const shipName = target[0];
      ships[shipName].hitPosition(target[1]); //register hit in ship object
      board[row][col][1] = "X"; //register hit on the board

      if (ships[shipName].isSunk()) {//adds "SUNK" data to each part of the ship on the board 
        shipPlacements[shipName].forEach((coord) => {
          board[coord[0]][coord[1]][2] = "SUNK";
        });
      }

      return ships[target[0]].isSunk() ? "SUNK" : ships[target[0]].shipArray;
    }
  };

  return {
    getBoard,
    placeShipHorizontally,
    placeShipVertically,
    placeShipsRandomly,
    removeShip, 
    getShipPlacements,
    fire,
    getShips,
    isGameOver,
  };
};

export default gameboard;
