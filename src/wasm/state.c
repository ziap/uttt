#include "state.h"
#include "../result_table.h"

state_t state;

u32 state_size(void) { return sizeof(state_t); }
void *state_ptr(void) { return &state; }
void *boards(void) { return state.boards; }
i32 last_move(void) { return state.last_move; }
i32 player(void) { return state.player; }
i32 result(void) { return state.result; }

void init(void) { create_table(); state_init(&state); }
void reset(void) { state_init(&state); }
void move(u32 grid, u32 cell) { state_move(&state, grid, cell); }
