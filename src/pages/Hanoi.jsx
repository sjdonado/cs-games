import { onMount } from 'solid-js';

import { p5 as P5 } from 'p5js-wrapper';

import { getColorByIndex } from '@src/utils/color';

const wasmWorker = new Worker(new URL('../workers/hanoi.js', import.meta.url), {
  type: 'module',
});

function Hanoi() {
  const draw = {
    baseMarginX: 376,
    baseWidth: 370,
    pegHeight: 600,
    baseY: 705,
    pegY: 110,
    diskY: 685,
    diskMarginY: 25,
    fillSize: 20,
    topMargin: 60,
  };

  const p5DOM = {
    startButton: undefined,
    statusLabel: undefined,
    infoLabelDefault: 'Steps: 0/0',
    startIcon: '&#9654;',
    pauseIcon: '&#9208;',
  };

  const game = {
    towers: [
      { positionX: 50, disks: [] },
      { positionX: 50 + draw.baseMarginX, disks: [] },
      { positionX: 50 + draw.baseMarginX * 2, disks: [] },
    ],
    moves: [],
    steps: 0,
    pause: false,
    speed: 5,
    numberOfDisks: 3,
    maxNumberOfDisks: 24,
    maxSpeed: 120,
  };

  const animation = {
    currentMove: undefined,
    currentDisk: undefined,
  };

  function drawTowers(p5) {
    const pegMarginX = draw.baseMarginX / 2 + 9;
    p5.fill(140);

    // A
    p5.rect(pegMarginX, draw.pegY, draw.fillSize, draw.pegHeight);
    p5.rect(25, draw.baseY, draw.baseWidth, draw.fillSize);

    // B
    p5.rect(pegMarginX + draw.baseMarginX, draw.pegY, draw.fillSize, draw.pegHeight);
    p5.rect(25 + draw.baseMarginX, draw.baseY, draw.baseWidth, draw.fillSize);

    // C
    p5.rect(pegMarginX + draw.baseMarginX * 2, draw.pegY, draw.fillSize, draw.pegHeight);
    p5.rect(25 + draw.baseMarginX * 2, draw.baseY, draw.baseWidth, draw.fillSize);

    p5.fill(50);
    p5.textSize(20);

    p5.text('A', pegMarginX + 5, draw.baseY + draw.fillSize + 3, draw.fillSize, draw.fillSize);
    p5.text('B', pegMarginX + draw.baseMarginX + 5, draw.baseY + draw.fillSize + 3, draw.fillSize, draw.fillSize);
    p5.text('C', pegMarginX + draw.baseMarginX * 2 + 5, draw.baseY + draw.fillSize + 3, draw.fillSize, draw.fillSize);
  }

  function drawDiskByCoordinates(p5, disk, x, y) {
    p5.fill(getColorByIndex(disk.index + 2));
    p5.rect(x - draw.fillSize, y, draw.baseWidth - 10 - disk.size, 20, 20, 15);
    p5.fill(50);
    p5.textSize(15);

    p5.text(
      disk.index,
      x - disk.size / 2 + 156.5 - (5 * Number(disk.index > 9)),
      y + 15,
    );
  }

  function createAndDrawDisks(p5, numberOfDisks) {
    let i = 0;
    let j = 0;
    let width = 0;

    while (i < numberOfDisks) {
      game.towers[0].disks.push({ index: i + 1, size: width });

      drawDiskByCoordinates(
        p5,
        game.towers[0].disks[game.towers[0].disks.length - 1],
        50 + width / 2,
        draw.diskY - j,
      );

      j += draw.diskMarginY;
      i += 1;
      width += 14;
    }
  }
  function addDisks(p5, disks, x, y) {
    let i = 0;
    disks.forEach((disk) => {
      drawDiskByCoordinates(p5, disk, x + disk.size / 2, y - i);
      i += draw.diskMarginY;
    });
  }

  function refreshTowers(p5) {
    // A
    addDisks(p5, game.towers[0].disks, 50, draw.diskY);
    // B
    addDisks(p5, game.towers[1].disks, 50 + draw.baseMarginX, draw.diskY);
    // C
    addDisks(p5, game.towers[2].disks, 50 + draw.baseMarginX * 2, draw.diskY);
  }

  function refreshCanvas(p5) {
    p5.clear();
    drawTowers(p5);
    refreshTowers(p5);
  }

  function reset(p5) {
    Object.assign(game, {
      towers: game.towers.map((tower) => ({ ...tower, disks: [] })),
      moves: [],
      steps: 0,
      pause: false,
    });

    Object.assign(animation, {
      currentMove: undefined,
      currentDisk: undefined,
    });

    p5.clear();

    p5DOM.statusLabel.html(p5DOM.infoLabelDefault);
    p5DOM.startButton.html(p5DOM.startIcon);

    drawTowers(p5);
    createAndDrawDisks(p5, game.numberOfDisks);
  }

  function pause() {
    p5DOM.startButton.html(game.pause ? p5DOM.pauseIcon : p5DOM.startIcon);
    game.pause = !game.pause;
  }

  const getHanoiMoves = async (n) => new Promise((resolve) => {
    wasmWorker.onmessage = (event) => resolve(event.data);
    wasmWorker.postMessage({ n });
  });

  async function start(p5) {
    reset(p5);

    p5DOM.startButton.addClass('animate-pulse');
    p5DOM.resetBtn.addClass('animate-pulse');
    p5DOM.statusLabel.html('Loading...');

    p5DOM.startButton.elt.disabled = true;
    p5DOM.resetBtn.elt.disabled = true;

    game.moves = await getHanoiMoves(game.numberOfDisks);

    p5DOM.startButton.html(p5DOM.pauseIcon);
    p5DOM.startButton.removeClass('animate-pulse');
    p5DOM.resetBtn.removeClass('animate-pulse');

    p5DOM.startButton.elt.disabled = false;
    p5DOM.resetBtn.elt.disabled = false;
  }

  onMount(async () => {
    new P5((p5) => {
      p5.setup = () => {
        const canvas = p5.createCanvas(1148, 748);
        canvas.parent('hanoi');

        const disksLabel = p5.createSpan('Disks');
        disksLabel.parent('disk-slider');

        const disksNumSlider = p5.createSlider(3, game.maxNumberOfDisks, 3);
        disksNumSlider.parent('disk-slider');

        const speedLabel = p5.createSpan('Speed');
        speedLabel.parent('speed-slider');

        const speedSlider = p5.createSlider(1, game.maxSpeed, 5);
        speedSlider.parent('speed-slider');

        const startButton = p5.createButton(p5DOM.startIcon);
        startButton.parent('buttons-container');

        const resetBtn = p5.createButton('Reset');
        resetBtn.parent('buttons-container');

        const statusLabel = p5.createSpan(p5DOM.infoLabelDefault);
        statusLabel.addClass('status-label');
        statusLabel.parent('hanoi-game-navbar');

        disksNumSlider.elt.addEventListener('change', () => {
          game.numberOfDisks = Number(disksNumSlider.value());
          reset(p5);
        });

        speedSlider.elt.addEventListener('change', () => {
          game.speed = speedSlider.value();
        });

        startButton.elt.addEventListener('click', async () => {
          if (game.moves.length === 0) {
            await start(p5);
            return;
          }
          pause();
        });

        resetBtn.elt.addEventListener('click', () => reset(p5));

        p5DOM.startButton = startButton;
        p5DOM.resetBtn = resetBtn;
        p5DOM.statusLabel = statusLabel;

        drawTowers(p5);
        createAndDrawDisks(p5, game.numberOfDisks);
      };

      p5.draw = () => {
        if (game.pause) {
          return;
        }

        // start of the disk animation
        if (!animation.currentDisk && game.steps < game.moves.length) {
          const [startIdx, endIdx] = game.moves[game.steps].split(':');

          const currentMove = {
            from: game.towers[Number(startIdx)],
            to: game.towers[Number(endIdx)],
          };

          const currentDisk = currentMove.from.disks.pop();

          animation.currentDisk = currentDisk;

          animation.currentMove = {
            ...currentMove,
            start: currentMove.from.positionX + currentDisk.size / 2,
            end: currentMove.to.positionX + currentDisk.size / 2,
            up: draw.diskY - currentMove.from.disks.length * draw.diskMarginY,
            down: null,
          };

          refreshCanvas(p5);
        }

        if (animation.currentDisk) {
          const isMovingHorizontallly = animation.currentMove.up === null
            && animation.currentMove.down === null;

          // moving from right to left or left to right
          if (isMovingHorizontallly) {
            if (animation.currentMove.start < animation.currentMove.end) {
              refreshCanvas(p5);
              drawDiskByCoordinates(
                p5,
                animation.currentDisk,
                animation.currentMove.start,
                draw.topMargin,
              );

              animation.currentMove.start += game.speed;

              if (animation.currentMove.start >= animation.currentMove.end) {
                animation.currentMove.start = animation.currentMove.end;
                animation.currentMove.down = draw.topMargin;
              }
            }

            if (animation.currentMove.start > animation.currentMove.end) {
              refreshCanvas(p5);
              drawDiskByCoordinates(
                p5,
                animation.currentDisk,
                animation.currentMove.start,
                draw.topMargin,
              );

              animation.currentMove.start -= game.speed;

              if (animation.currentMove.start <= animation.currentMove.end) {
                animation.currentMove.start = animation.currentMove.end;
                animation.currentMove.down = draw.topMargin;
              }
            }
          }

          // moving down up
          if (animation.currentMove.up !== null) {
            if (animation.currentMove.up <= draw.topMargin) {
              animation.currentMove.up = null;
              return;
            }

            if (animation.currentMove.up > draw.topMargin) {
              refreshCanvas(p5);
              drawDiskByCoordinates(
                p5,
                animation.currentDisk,
                animation.currentMove.start,
                animation.currentMove.up,
              );

              animation.currentMove.up -= game.speed;
            }
          }

          // moving up down
          if (animation.currentMove.down !== null) {
            const disksLength = animation.currentMove.to.disks.length;
            const disksHeight = disksLength * (draw.diskMarginY + draw.fillSize);

            if (animation.currentMove.down <= draw.diskY - disksHeight) {
              refreshCanvas(p5);
              drawDiskByCoordinates(
                p5,
                animation.currentDisk,
                animation.currentMove.start,
                animation.currentMove.down,
              );

              animation.currentMove.down += game.speed;
              return;
            }

            // End of disk animation
            animation.currentMove.to.disks.push(animation.currentDisk);
            game.steps += 1;
            animation.currentDisk = null;
            refreshCanvas(p5);
          }

          // End of all animations
          if (game.steps <= game.moves.length) {
            p5DOM.statusLabel.html(`Steps: <sup>${game.steps}</sup>&frasl;<sub>${game.moves.length}</sub>`);
          }
        }
      };
    });
  });

  return (
    <div id="hanoi" class="game-container">
      <div id="hanoi-game-navbar" class="game-navbar">
        <span class="title">Tower of Hanoi</span>
        <div class="sliders-container">
          <div id="disk-slider" />
          <div id="speed-slider" />
        </div>
        <div id="buttons-container" class="buttons-container" />
      </div>
    </div>
  );
}

export default Hanoi;
