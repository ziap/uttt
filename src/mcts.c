#include "mcts.h"

void mcts_init(mcts_t *searcher, u64 seed) {
  nodes_init();

  searcher->current_node = nodes_head();
  searcher->rng_state = rng_new(seed);
  nodes_push(-1, -1, NULL);
}

f32 uct(node_t *node) {
  const f32 c = 1.4142135623730951f; // sqrt2
  f32 n = node->samples;
  f32 w = node->value;
  f32 t = node->parent ? log(node->parent->samples) : 0;

  f32 uct = (w / n) + c * sqrtf(t / n);

  return uct;
}

node_t *select_child(node_t *node) {
  node_t *best_child = node->children;
  if (!best_child->samples) return best_child;

  f32 best_uct = uct(best_child);

  for (usize i = 1; i < node->children_count; ++i) {
    node_t *child = node->children + i;
    if (!child->samples) return child;

    f32 child_uct = uct(child);
    if (child_uct > best_uct) {
      best_uct = child_uct;
      best_child = child;
    }
  }

  return best_child;
}

void expand_node(node_t *node, state_t *state) {
  node->children = nodes_head();

  if (state->last_move == -1) {
    u32 global_board = state->boards[9];
    u32 global_mask = (~(global_board | (global_board >> 1))) & 0x15555u;

    while (global_mask) {
      u32 grid = global_mask & -global_mask;
      global_mask ^= grid;

      u32 grid_idx = ctz(grid) >> 1;
      u32 board = state->boards[grid_idx];
      u32 mask = (~(board | (board >> 1))) & 0x15555u;

      while (mask) {
        u32 cell = mask & -mask;
        mask ^= cell;

        u32 cell_idx = ctz(cell) >> 1;

        node->children_count++;
        nodes_push(grid_idx, cell_idx, node);
      }
    }
  } else {
    u32 board = state->boards[state->last_move];
    u32 mask = (~(board | (board >> 1))) & 0x15555u;

    while (mask) {
      u32 cell = mask & -mask;
      mask ^= cell;

      u32 cell_idx = ctz(cell) >> 1;

      node->children_count++;
      nodes_push(state->last_move, cell_idx, node);
    }
  }
}

result_t playout(state_t *state, rng_t *rng, i32 *steps) {
  while (!state->result) {
    u32 grid = state->last_move;
    if (grid == -1) {
      u32 board = state->boards[9];
      u32 mask = (~(board | (board >> 1))) & 0x15555u;

      u32 idx = rand_u32(rng) % popcnt(mask);
      for (usize i = 0; i < idx; ++i) mask &= (mask - 1);
      mask &= -mask;

      grid = ctz(mask) >> 1;
    }

    u32 board = state->boards[grid];
    u32 mask = (~(board | (board >> 1))) & 0x15555u;

    u32 idx = rand_u32(rng) % popcnt(mask);
    for (usize i = 0; i < idx; ++i) mask &= (mask - 1);
    mask &= -mask;

    board |= (mask << state->player);
    state->boards[grid] = board;

    result_t sub_result = RESULT_TABLE[board];
    if (sub_result) {
      state->boards[9] |= sub_result << (grid << 1);
      state->result = RESULT_TABLE[state->boards[9]];
    }

    u32 cell = ctz(mask) >> 1;

    state->player = 1 - state->player;
    state->last_move = (state->boards[9] & (3 << (cell << 1))) ? -1 : cell;
    *steps = *steps - 1;
  }

  return state->result;
}

void mcts_search(mcts_t *searcher, state_t state, i32 *steps) {
  // Selection
  while (searcher->current_node->children_count && !state.result) {
    node_t *child = select_child(searcher->current_node);

    searcher->current_node = child;
    state_move(&state, child->move.grid, child->move.cell);
    *steps = *steps - 1;
  }

  // Expansion
  if (searcher->current_node->samples && !state.result) {
    expand_node(searcher->current_node, &state);
    
    node_t *child = searcher->current_node->children;
    searcher->current_node = child;
    state_move(&state, child->move.grid, child->move.cell);
    *steps = *steps - 1;
  }

  // Simulation
  player_t current_player = 1 - state.player;
  result_t result = playout(&state, &searcher->rng_state, steps);

  // Back-propagation
  for (;;) {
    searcher->current_node->samples++;

    if (current_player == result - 1) {
      searcher->current_node->value++; 
    }

    current_player = 1 - current_player;
    node_t *parent = searcher->current_node->parent;
    
    if (!parent) break;
    searcher->current_node = parent;
  }
}

move_t search(mcts_t *mcts, state_t *state, u64 seed, i32 steps) {
  mcts_init(mcts, seed);

  while (steps > 0) mcts_search(mcts, *state, &steps);

  assert(mcts->current_node->children_count, "ERROR: No moves available");

  node_t *selected = mcts->current_node->children;
  f32 best_score = (f32)selected->value / (f32)selected->samples;

  for (usize i = 0; i < mcts->current_node->children_count; ++i) {
    node_t *child = mcts->current_node->children + i;

    f32 score = (f32)child->value / (f32)child->samples;

    if (score > best_score) {
      best_score = score;
      selected = child;
    }
  }
  dump((f32)selected->value / (f32)selected->samples);

  return selected->move;
}
