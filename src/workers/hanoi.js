import { hanoi } from '@wasm/games';

onmessage = (event) => {
  const moves = hanoi(event.data.n);

  postMessage(moves);
};
