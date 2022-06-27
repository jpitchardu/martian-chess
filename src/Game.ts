import _ from "lodash";

const COLS = ["a", "b", "c", "d"] as const;
const ROWS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

export type Row = typeof ROWS[number];
export type Col = typeof COLS[number];

export type Direction = "h" | "v" | "d";

export type Vertice = {
  row: Row;
  col: Col;
  edges: Edge[];
  piece?: Piece;
};

export type Edge = {
  source: Vertice;
  target: Vertice;
  direction: Direction;
};

export type Board = { [key in Row]: { [key in Col]: Vertice } };

export type Piece = {
  row: Row;
  col: Col;
  value: number;
  allowedMovements: Direction[];
  movementLength: number;
};

export const generateBoard = () => {
  const board = addEdges(getAllVertices());

  const initialPieces = getInitialPieces();

  initialPieces.forEach((piece) => (board[piece.row][piece.col].piece = piece));

  return board;
};

export const getAllVertices = () => {
  const board: any = {};

  ROWS.forEach((row) => {
    board[row] = {};
    COLS.forEach(
      (col) => (board[row][col] = { row: row, col: col, edges: [] })
    );
  });

  return board;
};

export const addEdges = (board: any) => {
  ROWS.forEach((row) => {
    COLS.forEach((col) => {
      const vertice = board[row][col];
      const edges = getPossibleEdges(vertice, board);
      board[row][col].edges = edges;
    });
  });

  return board;
};

export const getPossibleEdges = (vertice: Vertice, board: any) => {
  const indexOfRow = ROWS.indexOf(vertice.row);
  const indexOfCol = COLS.indexOf(vertice.col);

  const possibleRows = _.compact([
    ROWS[indexOfRow - 1],
    ROWS[indexOfRow + 1],
    vertice.row,
  ]);

  const possibleCols = _.compact([
    COLS[indexOfCol - 1],
    COLS[indexOfCol + 1],
    vertice.col,
  ]);

  const possibleEdges = possibleRows.reduce((acc, row) => {
    possibleCols.forEach((col) => {
      if (row === vertice.row && col === vertice.col) return acc;

      acc.push({
        source: vertice,
        target: board[row][col],
        direction: getEdgeDirection(row, col, vertice),
      });
    });
    return acc;
  }, [] as Edge[]);

  return possibleEdges;
};

export const getEdgeDirection = (
  edgeRow: Row,
  edgeCol: Col,
  vertice: Vertice
) => {
  const indexOfRow = ROWS.indexOf(vertice.row);
  const indexOfEdgeRow = ROWS.indexOf(edgeRow);
  const rowDirection = indexOfEdgeRow - indexOfRow;

  if (rowDirection === 0) return "h";

  const indexOfCol = COLS.indexOf(vertice.col);
  const indexOfEdgeCol = COLS.indexOf(edgeCol);
  const colDirection = indexOfEdgeCol - indexOfCol;

  if (colDirection === 0) return "v";

  return "d";
};

export const getPossiblePaths = ({
  piece,
  row,
  col,
  edges,
}: Vertice): Edge[] => {
  if (!piece) return [];

  const paths = edges
    .filter((edge) => piece.allowedMovements.includes(edge.direction))
    .filter((edge) => edge.target.piece === undefined);

  const nextPaths = paths.flatMap((path) => {
    const xDifference = COLS.indexOf(path.target.col) - COLS.indexOf(col);

    const yDifference = ROWS.indexOf(path.target.row) - ROWS.indexOf(row);

    return getPossiblePathsWithDifferences(
      path.target,
      piece.allowedMovements,
      piece.movementLength - 1,
      xDifference,
      yDifference
    );
  });

  return [...paths, ...nextPaths];
};

export const getPossiblePathsWithDifferences = (
  vertice: Vertice,
  allowedDirections: Direction[],
  length: number,
  xDiff: number,
  yDiff: number
): Edge[] => {
  if (!length) return [];

  const paths = vertice.edges.filter((edge) => {
    if (!allowedDirections.includes(edge.direction)) return false;

    const xDifference =
      COLS.indexOf(edge.target.col) - COLS.indexOf(vertice.col);

    const yDifference =
      ROWS.indexOf(edge.target.row) - ROWS.indexOf(vertice.row);

    if (xDiff !== xDifference || yDiff !== yDifference) return false;

    return true;
  }, [] as Edge[]);

  const nextPaths = paths.flatMap((path) =>
    getPossiblePathsWithDifferences(
      path.target,
      [path.direction],
      length - 1,
      xDiff,
      yDiff
    )
  );

  return [...paths, ...nextPaths];
};

export const getPathCoordinates = (edge: Edge) => {
  return `${edge.source.row}, ${edge.source.col} - ${edge.target.row}, ${edge.target.col} -> ${edge.direction}`;
};

export const getInitialPieces = () => {
  return [...getUpsidePieces(), ...getDownsidePieces()];
};

const getDownsidePieces = () => {
  const startingRow: Row = ROWS[ROWS.length - 1];
  const startingCol: Col = COLS[COLS.length - 1];

  const pieces: Piece[] = [];

  const rowIdx = ROWS.indexOf(startingRow);
  const possibleRows = [startingRow, ROWS[rowIdx - 1], ROWS[rowIdx - 2]];

  const colIdk = COLS.indexOf(startingCol);
  const possibleCols = [startingCol, COLS[colIdk - 1], COLS[colIdk - 2]];

  possibleRows.forEach((row) => {
    const rowDiff = ROWS.indexOf(startingRow) - ROWS.indexOf(row);

    possibleCols.forEach((col) => {
      const colDiff = COLS.indexOf(startingCol) - COLS.indexOf(col);

      const totalDiff = rowDiff + colDiff;

      const value = getValueFromDiff(totalDiff);
      const allowedMovements = getAllowedMovesFromValue(value);
      const movementLength = getMovementLengthFromValue(value);

      pieces.push({
        row,
        col,
        value,
        allowedMovements,
        movementLength,
      });
    });
  });

  return pieces;
};

const getUpsidePieces = () => {
  const startingRow: Row = ROWS[0];
  const startingCol: Col = COLS[0];

  const pieces: Piece[] = [];

  const rowIdx = ROWS.indexOf(startingRow);
  const possibleRows = [startingRow, ROWS[rowIdx + 1], ROWS[rowIdx + 2]];

  const colIdk = COLS.indexOf(startingCol);
  const possibleCols = [startingCol, COLS[colIdk + 1], COLS[colIdk + 2]];

  possibleRows.forEach((row) => {
    const rowDiff = ROWS.indexOf(row) - ROWS.indexOf(startingRow);

    possibleCols.forEach((col) => {
      const colDiff = COLS.indexOf(col) - COLS.indexOf(startingCol);

      const totalDiff = rowDiff + colDiff;

      const value = getValueFromDiff(totalDiff);
      const allowedMovements = getAllowedMovesFromValue(value);
      const movementLength = getMovementLengthFromValue(value);

      pieces.push({
        row,
        col,
        value,
        allowedMovements,
        movementLength,
      });
    });
  });

  return pieces;
};

const getValueFromDiff = (diff: number) => {
  if (diff === 1) return 3;
  if (diff === 2) return 2;
  if (diff >= 3) return 1;
  return 3;
};

const getAllowedMovesFromValue = (value: number): Direction[] => {
  if (value === 3) return ["h", "v", "d"];
  if (value === 2) return ["h", "v"];
  if (value === 1) return ["d"];
  return [];
};

const getMovementLengthFromValue = (value: number) => {
  if (value === 2) return 2;
  if (value === 1) return 1;
  return 7; // Just the biggest number possible
};

export const movePieceToCoordinates = (
  piece: Piece,
  { row, col }: { row: Row; col: Col },
  board: Board
) => {
  board[row][col].piece = piece;
  board[piece.row][piece.col].piece = undefined;

  return { ...board };
};
