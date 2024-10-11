#include "state.h"

void State_init(State *state) {
  for (usize i = 0; i < len(state->boards); ++i) state->boards[i] = 0;
  state->last_move = -1;

  state->player = PLAYER_X;
  state->result = PLAYING;
}

void State_move(State *state, u8 grid, u8 cell) {
  if (state->last_move != -1 && state->last_move != grid) return;

  u32 board = state->boards[grid];
  u32 new_board = board | (1 << (cell << 1 | state->player));
  if (new_board == state->boards[grid]) return;

  State_replace(state, grid, cell, new_board);
}

void State_replace(State *state, u8 grid, u8 cell, u32 board) {
  state->boards[grid] = board;

  // Update global board
  Result sub_result = RESULT_TABLE[board];
  if (sub_result) {
    state->boards[9] |= sub_result << (grid << 1);
    state->result = RESULT_TABLE[state->boards[9]];
  }

  state->player = 1 - state->player;
  state->last_move = (state->boards[9] & (3 << (cell << 1))) ? -1 : cell;
}
