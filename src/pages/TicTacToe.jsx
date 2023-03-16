import { onMount } from 'solid-js';

import { p5 as P5 } from 'p5js-wrapper';

import { computermove } from '@wasm/games';

const PLAYER = {
  Blank: 0,
  X: 1,
  O: 2,
};

const LEVELS = {
  Easy: 0,
  Hard: 2,
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
      () => Array.from({ length: BOARD_SIZE }, () => PLAYER.Blank),
    ),
    winner: PLAYER.Blank,
    moveCount: 0,
    refresh: true,
    level: LEVELS.Easy,
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
    p5.clear();

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

  function drawMove(p5, x, y, player) {
    if (player === PLAYER.Blank) {
      return;
    }

    const centerPoint = draw.centers[x][y];

    if (player === PLAYER.O) {
      p5.ellipse(centerPoint.x, centerPoint.y, draw.paddingX, draw.paddingY);
    }

    if (player === PLAYER.X) {
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
    drawTable(p5);

    p5.strokeWeight(8.0);
    game.board.forEach((row, x) => {
      row.forEach((player, y) => drawMove(p5, x, y, player));
    });
  }

  function checkWinner(x, y, player) {
    const rows = [];
    const columns = [];
    const diag = [];
    const antiDiag = [];

    for (let i = 0; i < BOARD_SIZE; i += 1) {
      // check col
      if (game.board[x][i] === player) {
        rows.push(draw.centers[x][i]);
      }
      // check row
      if (game.board[i][y] === player) {
        columns.push(draw.centers[i][y]);
      }
      // check diag
      if (x === y && game.board[i][i] === player) {
        diag.push(draw.centers[i][i]);
      }
      // check anti diag
      if (x + y === BOARD_SIZE - 1 && game.board[i][BOARD_SIZE - i - 1] === player) {
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
      game.winner = player;
    }
  }

  function reset(p5) {
    Object.assign(game, {
      board: Array.from(
        { length: BOARD_SIZE },
        () => Array.from({ length: BOARD_SIZE }, () => PLAYER.Blank),
      ),
      winner: PLAYER.Blank,
      moveCount: 0,
      refresh: true,
    });

    drawTable(p5);
  }

  async function makeMove(i, j) {
    game.board[i][j] = PLAYER.O;
    game.moveCount += 1;

    const nextMove = computermove(game.board, game.level);
    if (nextMove) {
      game.board[nextMove.row][nextMove.col] = PLAYER.X;
      game.moveCount += 1;

      checkWinner(nextMove.row, nextMove.col, PLAYER.X);
    }

    checkWinner(i, j, PLAYER.O);
  }

  onMount(async () => {
    new P5((p5) => {
      p5.setup = () => {
        const canvas = p5.createCanvas(1000, 650);
        canvas.parent('tic-tac-toe');

        const levelSelect = p5.createSelect();
        levelSelect.parent('buttons-container');
        levelSelect.option('Easy');
        levelSelect.option('Hard');

        const resetBtn = p5.createButton('Reset');
        resetBtn.parent('buttons-container');

        resetBtn.elt.addEventListener('click', () => {
          reset(p5);
        });

        levelSelect.elt.addEventListener('change', () => {
          const level = levelSelect.value();
          if (level === 'Easy') {
            game.level = LEVELS.Easy;
          }

          if (level === 'Hard') {
            game.level = LEVELS.Hard;
          }

          reset(p5);
        });

        drawTable(p5);
      };

      p5.mouseClicked = async () => {
        if (game.winner !== PLAYER.Blank) {
          return;
        }
        for (let i = 0; i < BOARD_SIZE; i += 1) {
          for (let j = 0; j < BOARD_SIZE; j += 1) {
            if (
              p5.mouseX > draw.centers[i][j].x - draw.paddingX
              && p5.mouseX < draw.centers[i][j].x + draw.paddingX
              && p5.mouseY > draw.centers[i][j].y - draw.paddingY
              && p5.mouseY < draw.centers[i][j].y + draw.paddingY
              && game.board[i][j] === PLAYER.Blank
            ) {
              makeMove(i, j);
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

        if (game.winner !== PLAYER.Blank) {
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
    <div id="tic-tac-toe" class="game-container">
      <div id="tic-tac-toe-navbar" class="game-navbar">
        <span class="title">Tic Tac Toe</span>
        <div id="buttons-container" class="buttons-container" />
      </div>
    </div>
  );
}

export default TicTacToe;
