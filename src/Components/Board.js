import Cell from "./Cell";

const Board = ({game, board, setBoard, turn, handleChangeTurn}) => {
    let row = -1;
    return ( 
        <div className="board" style={{}}>
            {board.map((array) => {
              let col = -1;
              row++;
              let remainder = row % 2
              return array.map((item) => {
                col++;
               
                return (
                  <Cell
                    color = {(col-remainder) %2===0 ? "white" : ""}
                    key={`${row }, ${col }}`}
                    item={item}
                    row={row}
                    col={col}
                    game={game}
                    setBoard={setBoard}
                    opponent="p2"
                    turn={turn}
                    handleChangeTurn={handleChangeTurn}
                    ships="show"
                  />
                );
              });
            })}
          </div>
     );
}
 
export default Board;