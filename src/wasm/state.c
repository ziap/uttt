#include "state.h"
#include "../node.h"
#include "../result_table.h"

state_t state;

u32 state_size() { return sizeof(state_t); }
void *state_ptr() { return &state; }
void *boards() { return state.boards; }
i32 last_move() { return state.last_move; }
i32 player() { return state.player; }
i32 result() { return state.result; }

void init() { create_table(); state_init(&state); }
void reset() { state_init(&state); }
void move(u32 grid, u32 cell) { state_move(&state, grid, cell); }

node_t children[81 * 2];

void* children_ptr() { return children; }

void combine_children(u32 children_size) {
  usize count = children_size / sizeof(node_t);

  for (usize i = 0; i < count; ++i) {
    children[i].value += children[i + count].value;
    children[i].samples += children[i + count].samples;
  }
}

void select_child(u32 children_size) {
  node_t *selected = children;

  usize count = children_size / sizeof(node_t);
  f32 best_score = (f32)selected->value / (f32)selected->samples;

  for (usize i = 0; i < count; ++i) {
    node_t *child = children + i;

    f32 score = (f32)child->value / (f32)child->samples;

    if (score > best_score) {
      best_score = score;
      selected = child;
    }
  }
  
  move(selected->move.grid, selected->move.cell);
}
