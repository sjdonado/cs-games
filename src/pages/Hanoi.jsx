import { onMount } from 'solid-js';

import { p5 } from 'p5js-wrapper';

import init, { hanoi } from '@wasm/games';

function Hanoi() {
  onMount(() => {
    new p5((p) => {
      const defaultValues = {
        disk: undefined,
        end: undefined,
        moveTowers: undefined,
        up: undefined,
        down: undefined,
        moves: [],
        towers: [[], [], []],
        stepsCounter: 0,
        pause: false,
      };

      const initValues = {
        positions: [50, 400, 750],
        speed: 5,
        infoLabelDefault: 'Step: 0/0',
        startIcon: '&#9654;',
        pauseIcon: '&#9208;',
      };

      function buildTowers() {
        let i = 0;
        while (i < 750) {
          p.fill(p.color(65));
          p.rect(140 + i, 130, 20, 450);
          p.rect(25 + i, 580, 250, 20);
          i += 350;
        }
      }

      function getColorByIndex(index) {
        const r = (index * 20) % 256;
        const g = (index * 30) % 256;
        const b = (index * 40) % 256;

        return `rgb(${r}, ${g}, ${b})`;
      }

      function drawDisk(disk, x, y) {
        p.fill(getColorByIndex(disk.disksNumSlider + 2));
        p.rect(x - 20, y, 240 - disk.size, 20, 20, 15);
        p.fill(50);

        p.text(
          disk.disksNumSlider,
          x - disk.size / 2 + 97.5 - (5 * Number(disk.disksNumSlider > 9)),
          y + 15,
        );
      }
      function buildDisks(disksNumSlider) {
        let i = 0;
        let j = 0;
        let width = 0;

        p.textSize(15);
        while (i < disksNumSlider) {
          window.global.towers[0].push({ disksNumSlider: i + 1, size: width });
          drawDisk(
            window.global.towers[0][window.global.towers[0].length - 1],
            50 + width / 2,
            550 - j,
          );
          j += 30;
          i += 1;
          width += 14;
        }
      }

      function addDisks(disks, width, height) {
        let i = 0;
        disks.forEach((disk) => {
          // console.log("DRAWING -> ", width + disk.size / 2 , height - i);
          drawDisk(disk, width + disk.size / 2, height - i);
          i += 30;
        });
      }

      function updateTowers() {
        let j = 0;
        for (let i = 0; i < 3; i += 1) {
          addDisks(window.global.towers[i], 50 + j, 550);
          j += 350;
        }
      }

      function clean() {
        p.clear();
        buildTowers();
        updateTowers();
      }

      function reload() {
        Object.assign(window.global, {
          ...defaultValues,
          towers: defaultValues.towers.map(() => []),
        });

        window.global.infoLabel.html(window.global.infoLabelDefault);
        window.global.startBtn.html(window.global.startIcon);

        p.clear();
        buildTowers();
        buildDisks(window.global.disksNumSlider.value());
      }

      p.setup = () => {
        p.createCanvas(1200, 650);

        const title = p.createSpan('Tower of Hanoi');
        title.addClass('title');
        title.position(25, 20);

        const disksLabel = p.createSpan('Disks');
        disksLabel.addClass('label');
        disksLabel.position(title.x + 320, title.y);

        const disksNumSlider = p.createSlider(3, 15, 3);
        disksNumSlider.position(
          disksLabel.x + disksLabel.width + 10,
          disksLabel.y,
        );

        const speedLabel = p.createSpan('Speed');
        speedLabel.addClass('label');
        speedLabel.position(
          disksNumSlider.x + disksNumSlider.width + 10,
          disksNumSlider.y,
        );

        const speedSlider = p.createSlider(1, 120, 5);
        speedSlider.position(speedLabel.x + speedLabel.width + 5, speedLabel.y);

        const startBtn = p.createButton(initValues.startIcon);
        startBtn.position(
          speedSlider.x + speedSlider.width + 20,
          speedSlider.y,
        );

        const resetBtn = p.createButton('Reset');
        resetBtn.position(startBtn.x + startBtn.width + 8, startBtn.y);

        const infoLabel = p.createSpan(initValues.infoLabelDefault);
        infoLabel.addClass('label');
        infoLabel.position(resetBtn.x + 100, resetBtn.y);

        p.createSpan('A').position(153.5, 625);
        p.createSpan('B').position(503.5, 625);
        p.createSpan('C').position(853.5, 625);

        disksNumSlider.elt.addEventListener('change', () => {
          reload();
        });

        speedSlider.elt.addEventListener('change', () => {
          window.global.speed = speedSlider.value();
        });

        startBtn.elt.addEventListener('click', async () => {
          if (window.global.moves.length === 0) {
            reload();

            await init();
            const moves = hanoi(Number(disksNumSlider.value()));
            window.global.moves = moves;

            startBtn.html(initValues.pauseIcon);
            return;
          }

          if (window.global.pause) {
            startBtn.html(initValues.pauseIcon);
          } else {
            startBtn.html(initValues.startIcon);
          }

          window.global.pause = !window.global.pause;
        });

        resetBtn.elt.addEventListener('click', () => {
          reload();
        });

        window.global = {
          startBtn,
          infoLabel,
          disksNumSlider,
          ...defaultValues,
          ...initValues,
        };

        buildTowers();
        buildDisks(disksNumSlider.value());
      };

      p.draw = () => {
        if (!window.global.pause) {
          if (
            typeof window.global.moves !== 'undefined'
            && window.global.stepsCounter < window.global.moves.length
            && typeof window.global.disk === 'undefined'
          ) {
            window.global.moveTowers = window.global.moves[window.global.stepsCounter].split(':');
            window.global.disk = window.global.towers[window.global.moveTowers[0]].pop();
            window.global.start = window.global.positions[window.global.moveTowers[0]]
              + window.global.disk.size / 2;
            window.global.end = window.global.positions[window.global.moveTowers[1]]
              + window.global.disk.size / 2;
            window.global.up = 550
              - window.global.towers[window.global.moveTowers[0]].length * 30;
            clean();
          }
          if (typeof window.global.disk !== 'undefined') {
            if (
              typeof window.global.up === 'undefined'
              && typeof window.global.down === 'undefined'
              && window.global.moveTowers[0] < window.global.moveTowers[1]
              && window.global.start < window.global.end
            ) {
              clean();
              drawDisk(window.global.disk, window.global.start, 80);
              window.global.start += window.global.speed;
              if (window.global.start >= window.global.end) window.global.down = 80;
            }
            if (
              typeof window.global.up === 'undefined'
              && typeof window.global.down === 'undefined'
              && window.global.moveTowers[0] > window.global.moveTowers[1]
              && window.global.start > window.global.end
            ) {
              clean();
              drawDisk(window.global.disk, window.global.start, 80);
              window.global.start -= window.global.speed;
              if (window.global.start <= window.global.end) window.global.down = 80;
            }
            if (typeof window.global.up !== 'undefined') {
              if (window.global.up > 80) {
                clean();
                drawDisk(
                  window.global.disk,
                  window.global.start,
                  window.global.up,
                );
                window.global.up -= window.global.speed;
              } else {
                window.global.up = undefined;
              }
            }
            if (typeof window.global.down !== 'undefined') {
              if (
                window.global.down
                <= 550
                - (window.global.towers[window.global.moveTowers[1]].length
                  * 30
                  + window.global.disk.size / 2)
              ) {
                clean();
                drawDisk(
                  window.global.disk,
                  window.global.start,
                  window.global.down,
                );
                window.global.down += window.global.speed;
              } else {
                window.global.towers[window.global.moveTowers[1]].push(
                  window.global.disk,
                );
                clean();
                window.global.stepsCounter += 1;
                window.global.disk = undefined;
                window.global.down = undefined;
              }
            }

            if (window.global.stepsCounter <= window.global.moves.length) {
              window.global.infoLabel.html(
                `Step: <sup>${window.global.stepsCounter}</sup>&frasl;<sub>${window.global.moves.length}</sub>`,
              );
            }
          }
        }
      };
    });
  });

  return <></>;
}

export default Hanoi;
