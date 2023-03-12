import { onMount } from 'solid-js';

import { p5 as P5 } from 'p5js-wrapper';

const PLAYERS = {
  Blank: 0,
  X: 1,
  O: 2,
};

const LINE_TYPES = {
  Horizontal: 0,
  Vertical: 1,
  Diagonal: 2,
  AntiDiagonal: 3,
};

const BOARD_SIZE = 3;

function TicTacToe() {
  const draw = {
    tableFirstColumnX: 200,
    tableFirstColumnY: 10,
    tableFirstRowX: 10,
    tableFirstRowY: 200,
    paddingX: 100,
    paddingY: 100,
    winnerLinePaddingX: 60,
    winnerLinePaddingY: 60,
  };

  draw.centers = [
    [
      { x: (draw.tableFirstColumnX + draw.tableFirstRowX) / 2, y: 100 },
      { x: (draw.tableFirstColumnX + draw.tableFirstRowX) / 2 + 200, y: 100 },
      { x: (draw.tableFirstColumnX + draw.tableFirstRowX) / 2 + 400, y: 100 },
    ],
    [
      { x: (draw.tableFirstColumnX + draw.tableFirstRowX) / 2, y: 300 },
      { x: (draw.tableFirstColumnX + draw.tableFirstRowX) / 2 + 200, y: 300 },
      { x: (draw.tableFirstColumnX + draw.tableFirstRowX) / 2 + 400, y: 300 },
    ],
    [
      { x: (draw.tableFirstColumnX + draw.tableFirstRowX) / 2, y: 500 },
      { x: (draw.tableFirstColumnX + draw.tableFirstRowX) / 2 + 200, y: 500 },
      { x: (draw.tableFirstColumnX + draw.tableFirstRowX) / 2 + 400, y: 500 },
    ],
  ];

  const game = {
    board: Array.from(
      { length: BOARD_SIZE },
      () => Array.from({ length: BOARD_SIZE }, () => PLAYERS.Blank),
    ),
    winner: PLAYERS.Blank,
    moveCount: 0,
    refresh: true,
  };

  const animation = {
    winnerLine: {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      frames: 0,
      lineType: LINE_TYPES.Horizontal,
    },
  };

  function drawTable(p5) {
    p5.strokeWeight(6.0);
    p5.strokeCap(p5.ROUND);

    p5.line(
      draw.tableFirstColumnX,
      draw.tableFirstColumnY,
      draw.tableFirstColumnX,
      draw.tableFirstColumnY + 575,
    );
    p5.line(
      draw.tableFirstColumnX + 200,
      draw.tableFirstColumnY,
      draw.tableFirstColumnX + 200,
      draw.tableFirstColumnY + 575,
    );
    p5.line(
      draw.tableFirstRowX,
      draw.tableFirstRowY,
      draw.tableFirstRowX + 600,
      draw.tableFirstRowY,
    );
    p5.line(
      draw.tableFirstRowX,
      draw.tableFirstRowY + 200,
      draw.tableFirstRowX + 600,
      draw.tableFirstRowY + 200,
    );
  }

  function drawMove(p5, x, y, move) {
    if (move === PLAYERS.Blank) {
      return;
    }

    const centerPoint = draw.centers[x][y];

    if (move === PLAYERS.O) {
      p5.ellipse(centerPoint.x, centerPoint.y, draw.paddingX, draw.paddingY);
    }

    if (move === PLAYERS.X) {
      p5.line(
        centerPoint.x - draw.paddingX / 2,
        centerPoint.y - draw.paddingY / 2,
        centerPoint.x + draw.paddingX / 2,
        centerPoint.y + draw.paddingY / 2,
      );
      p5.line(
        centerPoint.x + draw.paddingX / 2,
        centerPoint.y - draw.paddingY / 2,
        centerPoint.x - draw.paddingX / 2,
        centerPoint.y + draw.paddingY / 2,
      );
    }
  }

  function drawTableMoves(p5) {
    p5.clear();
    drawTable(p5);

    p5.strokeWeight(8.0);
    game.board.forEach((row, x) => {
      row.forEach((move, y) => drawMove(p5, x, y, move));
    });
  }

  function checkWinner(x, y, move) {
    const rows = [];
    const columns = [];
    const diag = [];
    const antiDiag = [];

    for (let i = 0; i < BOARD_SIZE; i += 1) {
      // check col
      if (game.board[x][i] === move) {
        rows.push(draw.centers[x][i]);
      }
      // check row
      if (game.board[i][y] === move) {
        columns.push(draw.centers[i][y]);
      }
      // check diag
      if (x === y && game.board[i][i] === move) {
        diag.push(draw.centers[i][i]);
      }
      // check anti diag
      if (x + y === BOARD_SIZE - 1 && game.board[i][BOARD_SIZE - i - 1] === move) {
        antiDiag.push(draw.centers[i][BOARD_SIZE - i - 1]);
      }
    }

    const lines = [
      {
        lineType: LINE_TYPES.Horizontal,
        moves: rows,
      },
      {
        lineType: LINE_TYPES.Vertical,
        moves: columns,
      },
      {
        lineType: LINE_TYPES.Diagonal,
        moves: diag,
      },
      {
        lineType: LINE_TYPES.AntiDiagonal,
        moves: antiDiag,
      },
    ];

    const line = lines.find(({ moves }) => moves.length === BOARD_SIZE);

    if (line) {
      animation.winnerLine = {
        x1: line.moves[0].x,
        y1: line.moves[0].y,
        x2: line.moves[BOARD_SIZE - 1].x,
        y2: line.moves[BOARD_SIZE - 1].y,
        lineType: line.lineType,
        frames: 0,
      };
      game.winner = move;
      console.log('winner', move, animation);
    }
  }

  onMount(async () => {
    new P5((p5) => {
      p5.setup = () => {
        const canvas = p5.createCanvas(1000, 650);
        canvas.parent('tic-tac-toe');

        drawTable(p5);
      };

      p5.mouseClicked = () => {
        for (let i = 0; i < BOARD_SIZE; i += 1) {
          for (let j = 0; j < BOARD_SIZE; j += 1) {
            if (
              p5.mouseX > draw.centers[i][j].x - draw.paddingX
              && p5.mouseX < draw.centers[i][j].x + draw.paddingX
              && p5.mouseY > draw.centers[i][j].y - draw.paddingY
              && p5.mouseY < draw.centers[i][j].y + draw.paddingY
              && game.board[i][j] === PLAYERS.Blank
              && game.winner === PLAYERS.Blank
            ) {
              const move = game.moveCount % 2 === 0 ? PLAYERS.O : PLAYERS.X;
              game.board[i][j] = move;
              game.moveCount += 1;

              checkWinner(i, j, move);
            }
          }
        }
        game.refresh = true;
      };

      p5.draw = () => {
        if (game.refresh) {
          drawTableMoves(p5);
          game.refresh = false;
        }

        if (game.winner !== PLAYERS.Blank) {
          p5.strokeWeight(12.0);

          const animationFramesX1 = animation.winnerLine.x1 + animation.winnerLine.frames;
          const animationFramesY1 = animation.winnerLine.y1 + animation.winnerLine.frames;

          if (animation.winnerLine.lineType === LINE_TYPES.Horizontal
            && animationFramesX1 <= animation.winnerLine.x2 + draw.winnerLinePaddingX) {
            p5.line(
              animation.winnerLine.x1 - draw.winnerLinePaddingX,
              animation.winnerLine.y1,
              animation.winnerLine.x1 + animation.winnerLine.frames,
              animation.winnerLine.y2,
            );

            animation.winnerLine.frames += 20;
          }

          if (animation.winnerLine.lineType === LINE_TYPES.Vertical
            && animationFramesY1 <= animation.winnerLine.y2 + draw.winnerLinePaddingY) {
            p5.line(
              animation.winnerLine.x1,
              animation.winnerLine.y1 - draw.winnerLinePaddingY,
              animation.winnerLine.x2,
              animation.winnerLine.y1 + animation.winnerLine.frames,
            );

            animation.winnerLine.frames += 20;
          }

          if (animation.winnerLine.lineType === LINE_TYPES.Diagonal
            && animationFramesX1 <= animation.winnerLine.x2 + draw.winnerLinePaddingX
            && animationFramesY1 <= animation.winnerLine.y2 + draw.winnerLinePaddingY) {
            p5.line(
              animation.winnerLine.x1 - draw.winnerLinePaddingX,
              animation.winnerLine.y1 - draw.winnerLinePaddingY,
              animation.winnerLine.x1 + animation.winnerLine.frames,
              animation.winnerLine.y1 + animation.winnerLine.frames,
            );

            animation.winnerLine.frames += 40;
          }

          if (animation.winnerLine.lineType === LINE_TYPES.AntiDiagonal
            && animationFramesX1 > animation.winnerLine.x2 + draw.winnerLinePaddingX
            && animationFramesY1 <= animation.winnerLine.y2 + draw.winnerLinePaddingY) {
            p5.line(
              animation.winnerLine.x1 + draw.winnerLinePaddingX,
              animation.winnerLine.y1 - draw.winnerLinePaddingY,
              animation.winnerLine.x1 - animation.winnerLine.frames,
              animation.winnerLine.y1 + animation.winnerLine.frames,
            );

            animation.winnerLine.frames += 40;
          }
        }
      };
    });
  });

  return (
    <div id="tic-tac-toe" class="game-container" />
  );
}

export default TicTacToe;
