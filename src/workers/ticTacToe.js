import { next_move } from '@wasm/games';

onmessage = (event) => {
  const { board, player } = event.data;
  console.log(board, player);
  const nextMove = next_move(board, player);

  postMessage(nextMove);
};
