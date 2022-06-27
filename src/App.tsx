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
  board: Game.Board;
  movePiece: (row: Game.Row, col: Game.Col, piece: Game.Piece) => void;
  highlightCells: (vertices: { row: Game.Row; col: Game.Col }[]) => void;
};

const GameContext = React.createContext<{
  highlightedCells: {
    row: Game.Row;
    col: Game.Col;
  }[];
  highlightCells: (vertices: { row: Game.Row; col: Game.Col }[]) => void;
}>({
  highlightedCells: [],
  highlightCells: () => {},
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
  const highlightCells = () => {
    const paths = Game.getPossiblePaths(vertice);

    const cells = _.uniq(
      paths
        .flatMap(({ source, target }) => [source, target])
        .filter(({ row, col }) => row !== vertice.row || col !== vertice.col)
        .map((c) => ({ row: c.row, col: c.col }))
    );

    game.highlightCells(cells);
  };

  const isCellHighlighted = game.highlightedCells.some(
    (c) => c.row === vertice.row && c.col === vertice.col
  );

  const className = [
    "Cell",
    colorClass,
    isCellHighlighted ? "Highlighted-Cell" : "",
  ].join(" ");

  return (
    <div className={className} onClick={highlightCells}>
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
      />
    </div>
  );
};

const Board = ({ board }: { board: Game.Board }) => {
  const rows = Object.keys(board) as Game.Row[];
  const numberOfRows = rows.length;

  const [highlightedCells, setHighlightedCells] = React.useState<
    {
      row: Game.Row;
      col: Game.Col;
    }[]
  >([]);

  return (
    <GameContext.Provider
      value={{ highlightedCells, highlightCells: setHighlightedCells }}
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
  const board = Game.generateBoard();

  return (
    <div className="App">
      <div className="Container">
        <Board board={board} />
      </div>
    </div>
  );
}

export default App;
