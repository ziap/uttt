#include "mcts.h"

void mcts_init(mcts_t *searcher, u64 seed) {
  nodes_init(&searcher->nodes);

  searcher->current_node = nodes_push(&searcher->nodes, -1, -1, NULL);
  searcher->rng_state = rng_new(seed);
}

f32 uct(node_t *node) {
  const f32 c = 1.4142135623730951; // sqrt2
  f32 n = node->simulation_done;
  f32 w = node->simulation_won;
  f32 t = node->parent ? logf(node->parent->simulation_done) : 0;

  f32 uct = (w / n) + c * sqrtf(t / n);

  return uct;
}

node_t *best_children(node_t *node) {
  node_t *best_child = node->children;
  if (!best_child->simulation_done) return best_child;

  f32 best_uct = uct(best_child);

  for (usize i = 1; i < node->children_count; ++i) {
    node_t *child = node->children + i;
    if (!child->simulation_done) return child;

    f32 child_uct = uct(child);
    if (child_uct > best_uct) {
      best_uct = child_uct;
      best_child = child;
    }
  }

  return best_child;
}

void expand_node(nodes_t *nodes, node_t *node, state_t *state) {
  node->expanded = true;
  node->children_count = 0;
  node->children = nodes->data + nodes->size;

  if (state->last_move == -1) {
    u32 global_board = state->boards[9];
    u32 global_mask = (~(global_board | (global_board >> 1))) & 0x15555u;

    while (global_mask) {
      u32 grid = global_mask & -global_mask;
      global_mask ^= grid;

      u32 grid_idx = popcnt(grid - 1) >> 1;
      u32 board = state->boards[grid_idx];
      u32 mask = (~(board | (board >> 1))) & 0x15555u;

      while (mask) {
        u32 cell = mask & -mask;
        mask ^= cell;

        u32 cell_idx = popcnt(cell - 1) >> 1;

        node->children_count++;
        nodes_push(nodes, grid_idx, cell_idx, node);
      }
    }
  } else {
    u32 board = state->boards[state->last_move];
    u32 mask = (~(board | (board >> 1))) & 0x15555u;

    while (mask) {
      u32 cell = mask & -mask;
      mask ^= cell;

      u32 cell_idx = popcnt(cell - 1) >> 1;

      node->children_count++;
      nodes_push(nodes, state->last_move, cell_idx, node);
    }
  }
}

result_t playout(state_t *state, rng_t *rng) {
  while (!state->result) {
    u32 grid = state->last_move;
    if (grid == -1) {
      u32 board = state->boards[9];
      u32 mask = (~(board | (board >> 1))) & 0x15555u;

      u32 idx = rand_u32(rng) % popcnt(mask);
      for (usize i = 0; i < idx; ++i) mask &= (mask - 1);
      mask &= -mask;

      grid = popcnt(mask - 1) >> 1;
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

    u32 cell = popcnt(mask - 1) >> 1;

    state->player = 1 - state->player;
    state->last_move = (state->boards[9] & (3 << (cell << 1))) ? -1 : cell;
  }

  return state->result;
}

void mcts_search(mcts_t *searcher, state_t state) {
  // Selection
  while (searcher->current_node->expanded && !state.result) {
    node_t *child = best_children(searcher->current_node);

    searcher->current_node = child;
    state_move(&state, child->move.grid, child->move.cell);
  }

  // Expansion
  if (searcher->current_node->simulation_done && !state.result) {
    expand_node(&searcher->nodes, searcher->current_node, &state);
    
    node_t *child = searcher->current_node->children;
    searcher->current_node = child;
    state_move(&state, child->move.grid, child->move.cell);
  }

  // Simulation
  result_t result = playout(&state, &searcher->rng_state);

  // Back-propagation
  player_t current_player = 1 - state.player;
  for (;;) {
    searcher->current_node->simulation_done++;

    if (current_player == result - 1) {
      searcher->current_node->simulation_won++; 
    } else {
      searcher->current_node->simulation_won--;
    }

    current_player = 1 - current_player;
    node_t *parent = searcher->current_node->parent;
    
    if (!parent) break;
    searcher->current_node = parent;
  }
}

move_t search(mcts_t *mcts, state_t *state, u64 seed, u32 simulation_count) {
  mcts_init(mcts, seed);

  for (usize i = 0; i < simulation_count; ++i) mcts_search(mcts, *state);

  assert(mcts->current_node->children_count, "ERROR: No moves available");

  node_t *child = best_children(mcts->current_node);
  dump((f32)child->simulation_won / (f32)child->simulation_done);

  return child->move;
}
