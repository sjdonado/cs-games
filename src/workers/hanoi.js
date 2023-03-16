import { get_moves } from '@wasm/games';

onmessage = (event) => {
  const moves = get_moves(event.data.n);

  postMessage(moves);
};
