import { createEffect } from 'solid-js';

import { p5 } from 'p5js-wrapper';

function App() {
  createEffect(() => {
    new p5((p) => {
      let x;
      let y;

      p.setup = () => {
        p.createCanvas(800, 600);
        x = p.width / 2;
        y = p.height;
      };

      p.draw = () => {
        p.background(200);

        // Draw a circle
        p.stroke(50);
        p.fill(100);
        p.ellipse(x, y, 24, 24);

        // Jiggling randomly on the horizontal axis
        x += p.random(-1, 1);
        // Moving up at a constant speed
        y -= 1;

        // Reset to the bottom
        if (y < 0) {
          y = p.height;
        }
      };
    });
  });

  return <></>;
}

export default App;
