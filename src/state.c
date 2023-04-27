#include "state.h"

void state_init(state_t *state) {
  memset(state->boards, 0, sizeof(state->boards));

  state->last_move = -1;

  state->player = PLAYER_X;
  state->result = PLAYING;
}

void state_move(state_t *state, u8 grid, u8 cell) {
  if (state->last_move != -1 && state->last_move != grid) return;

  u32 new_board = state->boards[grid] | (1 << (2 * cell + state->player));

  if (new_board == state->boards[grid]) return;
  state->boards[grid] = new_board;
  
  // Update global board
  result_t sub_result = RESULT_TABLE[new_board];
  if (sub_result) {
    state->boards[9] |= sub_result << (grid << 1);
    state->result = RESULT_TABLE[state->boards[9]];
  }

  state->player = 1 - state->player;
  state->last_move = (state->boards[9] & (3 << (cell << 1))) ? -1 : cell;
}
