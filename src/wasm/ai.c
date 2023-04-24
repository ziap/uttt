#include "ai.h"

state_t state;
mcts_t searcher;
move_t result;

void init(void) { create_table(); }
void *state_ptr(void) { return &state; }
void *result_ptr(void) { return &result; }

void ai_search(u64 seed, u32 simulation_count) {
  result = search(&searcher, &state, seed, simulation_count);
}
