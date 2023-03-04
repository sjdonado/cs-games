use gloo_utils::format::JsValueSerdeExt;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn hanoi(n: i32) -> JsValue {
    let mut moves = Vec::new();
    move_tower(n, 0, 2, 1, &mut moves);

    JsValue::from_serde(&moves).unwrap()
}

fn move_tower(n: i32, from: i32, to: i32, aux: i32, moves: &mut Vec<String>) {
    if n == 1 {
        moves.push(format!("{}:{}", from, to));
    } else {
        move_tower(n - 1, from, aux, to, moves);
        moves.push(format!("{}:{}", from, to));
        move_tower(n - 1, aux, to, from, moves);
    }
}
