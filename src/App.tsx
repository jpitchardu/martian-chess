import _ from "lodash";
import React, { useContext } from "react";
import "./App.css";

import Rover from "./Rover_Small.png";
import Alien from "./Alien_Small.png";
import UFO from "./UFO_Small.png";

import * as Game from "./Game";

type GameContextType = {
  highlightedCells: {
    row: Game.Row;
    col: Game.Col;
  }[];
  selectPiece: (vertice: Game.Vertice) => void;
  selectNewPosition: (vertice: Game.Vertice) => void;
};

const GameContext = React.createContext<GameContextType>({
  highlightedCells: [],
  selectPiece: (vertice: Game.Vertice) => {},
  selectNewPosition: (vertice: Game.Vertice) => {},
});

const Row = ({
  alternateColors,
  row,
}: {
  alternateColors?: boolean;
  row: { [k in Game.Col]: Game.Vertice };
}) => {
  const cols = Object.keys(row) as Game.Col[];

  const colorClasses = alternateColors
    ? ["Black-Cell", "White-Cell"]
    : ["White-Cell", "Black-Cell"];

  return (
    <div className="Row">
      {cols.map((col, index) => (
        <Cell
          colorClass={colorClasses[index % 2]}
          key={col}
          vertice={row[col]}
        />
      ))}
    </div>
  );
};

const Cell = ({
  colorClass,
  vertice,
}: {
  colorClass: string;
  vertice: Game.Vertice;
}) => {
  const game = useContext(GameContext);

  const isCellHighlighted = game.highlightedCells.some(
    (c) => c.row === vertice.row && c.col === vertice.col
  );

  const onClick = () => {
    if (isCellHighlighted) return game.selectNewPosition(vertice);

    return game.selectPiece(vertice);
  };

  const className = [
    "Cell",
    colorClass,
    isCellHighlighted ? "Highlighted-Cell" : "",
  ].join(" ");

  return (
    <div className={className} onClick={onClick}>
      {vertice.piece && (
        <Piece piece={vertice.piece} isTopPlayer={+vertice.row <= 4} />
      )}
    </div>
  );
};

const Piece = ({
  piece,
  isTopPlayer,
}: {
  piece: Game.Piece;
  isTopPlayer: boolean;
}) => {
  return (
    <div className="Space">
      <img
        className={isTopPlayer ? "Top-Player" : ""}
        src={piece.value === 1 ? Rover : piece.value === 2 ? Alien : UFO}
        alt="Piece"
      />
    </div>
  );
};

const Board = () => {
  const [board, setBoard] = React.useState(Game.generateBoard());

  const rows = Object.keys(board) as Game.Row[];
  const numberOfRows = rows.length;

  const [highlightedCells, setHighlightedCells] = React.useState<
    {
      row: Game.Row;
      col: Game.Col;
    }[]
  >([]);

  const [selectedPiece, setSelectedPiece] = React.useState<Game.Piece | null>();

  const selectNewPosition = ({ row, col }: Game.Vertice) => {
    if (!highlightedCells.some((c) => c.row === row && c.col === col)) {
      console.log("Trying to move to an invalid position");
      return;
    }

    if (!selectedPiece) {
      console.log("Trying to move without selecting a piece");
      return;
    }

    const newBoard = Game.movePieceToCoordinates(
      selectedPiece,
      { row, col },
      board
    );
    setBoard(newBoard);
  };

  const selectPiece = (vertice: Game.Vertice) => {
    if (!vertice.piece) {
      console.log("There is no piece here");
      return;
    }

    const paths = Game.getPossiblePaths(vertice);

    const cells = _.uniq(
      paths
        .flatMap(({ source, target }) => [source, target])
        .filter(({ row, col }) => row !== vertice.row || col !== vertice.col)
        .map((c) => ({ row: c.row, col: c.col }))
    );

    setSelectedPiece(vertice.piece);
    setHighlightedCells(cells);
  };

  return (
    <GameContext.Provider
      value={{ highlightedCells, selectPiece, selectNewPosition }}
    >
      <div className="Board">
        {rows.map((row, index) => (
          <>
            <Row key={row} alternateColors={index % 2 === 0} row={board[row]} />
            {index + 1 === numberOfRows / 2 && (
              <div className="Divider" key={"divider"}></div>
            )}
          </>
        ))}
      </div>
    </GameContext.Provider>
  );
};

function App() {
  return (
    <div className="App">
      <div className="Container">
        <Board />
      </div>
    </div>
  );
}

export default App;
