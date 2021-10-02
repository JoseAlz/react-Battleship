import { useEffect, useState } from "react";
import PlaceShipCell from "./PlaceShipCell";
const PlacementBoard = ({
  board,
  setBoard,
  game,
  orientation,
  currentShip,
  currentShipLength,
  handleNextShip,
}) => {
  const [root, setRoot] = useState([0, 0]);
  const [shipCanBePlaced, setShipCanBePlaced] = useState(true);

  const checkCoords = (row, col) => {
    //checks an individual coord to see if it is empty
    const board = game.getBoard();
    return board[row][col] === 0;
  };
  const checkCanBePlaced = (row, col, length = currentShipLength) => {
    let canBePlaced = true;
    for (let i = 0; i < length; i++) {
      let isEmpty;
      if (orientation === "horizontal") {
        isEmpty = checkCoords(row, col + i);
      } else if (orientation === "vertical") {
        if (row + i > 9) isEmpty = false;
        else isEmpty = checkCoords(row + i, col);
      }
      if (!isEmpty) canBePlaced = false;
    }
    return canBePlaced;
  };
  const handlePlaceShip = () => {
    try {
      if (orientation === "horizontal") {
        game.placeShipHorizontally(root[0], root[1], currentShip.name);
        handleNextShip();
      } else if (orientation === "vertical") {
        game.placeShipVertically(root[0], root[1], currentShip.name);
        handleNextShip();
      }
    } catch {}
  };
  useEffect(() => {
    setShipCanBePlaced(checkCanBePlaced(root[0], root[1]));
  }, [root, shipCanBePlaced, orientation]);

  const isInShip = (row, col) => {
    if (orientation === "horizontal") {
      if (
        row === root[0] &&
        col >= root[1] &&
        col <= root[1] + currentShipLength - 1
      ) {
        return true;
      }
    }
    if (orientation === "vertical") {
      if (
        col === root[1] &&
        row >= root[0] &&
        row <= root[0] + currentShipLength - 1
      ) {
        return true;
      }
    }
    return false;
  };

  let row = 0;
  return (
    <div className="board" style={{}}>
      {board.map((array) => {
        let col = 0;
        row++;
        return array.map((item) => {
          col++;
          return (
            <PlaceShipCell
              key={`${row - 1}, ${col - 1}}`}
              item={item}
              row={row}
              col={col}
              setRoot={setRoot} //moseOver => setRoot to coords
              highlightGreen={
                shipCanBePlaced && isInShip(row - 1, col - 1) ? true : false
              }
              highlightRed={
                !shipCanBePlaced && isInShip(row - 1, col - 1) ? true : false
              }
              game={game}
              setBoard={setBoard}
              ships="show"
              handlePlaceShip={handlePlaceShip}
            />
          );
        });
      })}
    </div>
  );
};

export default PlacementBoard;
