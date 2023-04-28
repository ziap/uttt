#include "state.h"

void state_init(state_t *state) {
  memset(state->boards, 0, sizeof(state->boards));

  state->last_move = -1;

  state->player = PLAYER_X;
  state->result = PLAYING;
}

void state_move(state_t *state, u8 grid, u8 cell) {
  if (state->last_move != -1 && state->last_move != grid) return;

  u32 board = state->boards[grid];
  u32 new_board = board | (1 << (cell << 1 | state->player));
  if (new_board == state->boards[grid]) return;

  state_replace(state, grid, cell, new_board);
}

void state_replace(state_t *state, u8 grid, u8 cell, u32 board) {
  state->boards[grid] = board;

  // Update global board
  result_t sub_result = RESULT_TABLE[board];
  if (sub_result) {
    state->boards[9] |= sub_result << (grid << 1);
    state->result = RESULT_TABLE[state->boards[9]];
  }

  state->player = 1 - state->player;
  state->last_move = (state->boards[9] & (3 << (cell << 1))) ? -1 : cell;
}
