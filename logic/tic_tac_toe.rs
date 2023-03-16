use rand::Rng;

use gloo_utils::format::JsValueSerdeExt;
use serde::Serialize;
use wasm_bindgen::prelude::*;

const BLANK: i32 = 0;
const PLAYER_X: i32 = 1;
const PLAYER_O: i32 = 2;
const TIE: i32 = 3;

const LEVEL_EASY: i32 = 0;
const LEVEL_HARD: i32 = 2;

#[derive(Serialize)]
struct Move {
    row: i32,
    col: i32,
}

fn is_full(board: &[[i32; 3]; 3]) -> bool {
    for i in 0..3 {
        for j in 0..3 {
            if board[i][j] == 0 {
                return false;
            }
        }
    }
    true
}

fn check_win(board: &[[i32; 3]; 3]) -> i32 {
    // Check rows
    for i in 0..3 {
        if board[i][0] != 0 && board[i][0] == board[i][1] && board[i][1] == board[i][2] {
            return board[i][0];
        }
    }

    // Check columns
    for j in 0..3 {
        if board[0][j] != 0 && board[0][j] == board[1][j] && board[1][j] == board[2][j] {
            return board[0][j];
        }
    }

    // Check diagonals
    if board[0][0] != 0 && board[0][0] == board[1][1] && board[1][1] == board[2][2] {
        return board[0][0];
    }
    if board[0][2] != 0 && board[0][2] == board[1][1] && board[1][1] == board[2][0] {
        return board[0][2];
    }

    // If no winner and board is not full, the game is not over yet
    if !is_full(board) {
        return BLANK;
    }

    // The game is a tie
    return TIE;
}

fn minimax(
    board: &mut [[i32; 3]; 3],
    depth: i32,
    is_max: bool,
    mut alpha: i32,
    mut beta: i32,
) -> i32 {
    let winner = check_win(board);

    if winner == PLAYER_X {
        return 10;
    }

    if winner == PLAYER_O {
        return -10;
    }

    if winner == TIE {
        return 0;
    }

    if is_max {
        let mut best = std::i32::MIN;
        for i in 0..3 {
            for j in 0..3 {
                if board[i][j] == BLANK {
                    board[i][j] = PLAYER_X;
                    best = std::cmp::max(best, minimax(board, depth + 1, !is_max, alpha, beta));
                    board[i][j] = BLANK;

                    alpha = std::cmp::max(alpha, best);
                    if beta <= alpha {
                        break;
                    }
                }
            }
        }

        return best;
    }

    let mut best = std::i32::MAX;
    for i in 0..3 {
        for j in 0..3 {
            if board[i][j] == BLANK {
                board[i][j] = PLAYER_O;
                best = std::cmp::min(best, minimax(board, depth + 1, !is_max, alpha, beta));
                board[i][j] = BLANK;

                beta = std::cmp::min(beta, best);
                if beta <= alpha {
                    break;
                }
            }
        }
    }

    return best;
}

fn find_best_move(board: &mut [[i32; 3]; 3], player: i32) -> Option<Move> {
    let mut best_val = -1;
    let mut best_move = Move { row: -1, col: -1 };

    for i in 0..3 {
        for j in 0..3 {
            if board[i][j] == BLANK {
                board[i][j] = player;
                let move_val = minimax(board, 0, false, std::i32::MIN, std::i32::MAX);
                board[i][j] = BLANK;

                if move_val > best_val {
                    best_move.row = i as i32;
                    best_move.col = j as i32;
                    best_val = move_val;
                }
            }
        }
    }

    if best_val == -1 {
        return None;
    }

    return Some(best_move);
}

fn random_move(board: &mut [[i32; 3]; 3]) -> Option<Move> {
    let mut rng = rand::thread_rng();
    let available_moves: Vec<(usize, usize)> = board
        .iter()
        .enumerate()
        .flat_map(|(i, row)| {
            row.iter()
                .enumerate()
                .filter(|(_, &val)| val == BLANK)
                .map(move |(j, _)| (i, j))
        })
        .collect();

    if available_moves.is_empty() {
        return None;
    }

    let random_index = rng.gen_range(0..available_moves.len());

    return Some(Move {
        row: available_moves[random_index].0 as i32,
        col: available_moves[random_index].1 as i32,
    });
}

fn winning_move(board: &mut [[i32; 3]; 3], player: i32) -> Option<Move> {
    for i in 0..3 {
        for j in 0..3 {
            if board[i][j] == BLANK {
                board[i][j] = player;
                let winner = check_win(board);
                board[i][j] = BLANK;

                if winner == player {
                    return Some(Move {
                        row: i as i32,
                        col: j as i32,
                    });
                }
            }
        }
    }

    return None;
}

#[wasm_bindgen]
pub fn computermove(board: JsValue, level: i32) -> JsValue {
    let mut parsed_board: [[i32; 3]; 3] = board.into_serde().unwrap();

    if level == LEVEL_EASY {
        let winning_move = winning_move(&mut parsed_board, PLAYER_X);
        if winning_move.is_some() {
            return JsValue::from_serde(&winning_move).unwrap();
        }
        return JsValue::from_serde(&random_move(&mut parsed_board)).unwrap();
    }

    if level == LEVEL_HARD {
        return JsValue::from_serde(&find_best_move(&mut parsed_board, PLAYER_X)).unwrap();
    }

    return JsValue::from_serde(&None::<Move>).unwrap();
}
