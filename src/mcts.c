// Monte Carlo tree search algorithm
// See: <https://en.wikipedia.org/wiki/Monte_Carlo_tree_search>
#include "mcts.h"

static void mcts_init(mcts_t *searcher, u64 seed) {
  nodes_init();

  searcher->current_node = nodes_head();
  searcher->rng_state = rng_new(seed);
  nodes_push(-1, -1, NULL);
}

// Upper Confidence bounds applied to Trees (UCT)
static f32 uct(node_t *node, f32 t) {
  const f32 c = 1.4142135623730951f; // sqrt2
  f32 n = node->samples;
  f32 w = node->value;

  f32 uct = (w / n) + c * sqrtf(t / n);

  return uct;
}

static node_t *select_child(node_t *node) {
  node_t *best_child = node->children;
  if (!best_child->samples) return best_child;

  f32 t = fastln(node->samples);
  f32 best_uct = uct(best_child, t);

  for (usize i = 1; i < node->children_count; ++i) {
    node_t *child = node->children + i;
    if (!child->samples) return child;

    f32 child_uct = uct(child, t);
    if (child_uct > best_uct) {
      best_uct = child_uct;
      best_child = child;
    }
  }

  return best_child;
}

// Iterate over a board and add all possible moves to the tree
static void expand_board(node_t *node, u32 grid_idx, u32 board) {
  u32 mask = (~(board | (board >> 1))) & 0x15555u;

  while (mask) {
    u32 cell = mask & -mask;
    mask ^= cell;

    u32 cell_idx = ctz(cell) >> 1;

    node->children_count++;
    nodes_push(grid_idx, cell_idx, node);
  }
}

static void expand_node(node_t *node, state_t *state) {
  node->children = nodes_head();
  u32 grid_idx = state->last_move;

  // Also iterate over all local boards when the player can move anywhere
  if (grid_idx == -1) {
    u32 global_board = state->boards[9];
    u32 global_mask = (~(global_board | (global_board >> 1))) & 0x15555u;

    while (global_mask) {
      u32 grid = global_mask & -global_mask;
      global_mask ^= grid;

      grid_idx = ctz(grid) >> 1;
      expand_board(node, grid_idx, state->boards[grid_idx]);
    }
  } else expand_board(node, grid_idx, state->boards[grid_idx]);
}

// Picking a random empty cell
static u32 random_move_mask(u32 board, rng_t *rng) {
  // Create a bitmask representing all empty cells
  u32 mask = (~(board | (board >> 1))) & 0x15555u;

  // Remove a random amount of bits from the left
  u32 idx = rand_u32(rng) % popcnt(mask);
  for (usize i = 0; i < idx; ++i) mask &= (mask - 1);

  // Select the leftmost bit after removal
  return mask & -mask;
}

static result_t playout(state_t *state, rng_t *rng, i32 *steps) {
  while (!state->result) {
    u32 grid = state->last_move;
    
    // Select a random local board when the player can move anywhere
    if (grid == -1) {
      u32 mask = random_move_mask(state->boards[9], rng);

      grid = ctz(mask) >> 1;
    }

    u32 board = state->boards[grid];
    u32 mask = random_move_mask(board, rng);

    board |= (mask << state->player);
    state_replace(state, grid, ctz(mask) >> 1, board);

    *steps = *steps - 1;
  }

  return state->result;
}

static void mcts_search(mcts_t *searcher, state_t state, i32 *steps) {
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

    if (result != TIE) {
      if (current_player == result - 1) searcher->current_node->value++;
      else searcher->current_node->value--;
    }

    current_player = 1 - current_player;
    node_t *parent = searcher->current_node->parent;
    
    if (!parent) break;
    searcher->current_node = parent;
  }
}

move_t search(mcts_t *mcts, state_t *state, u64 seed, i32 steps) {
  mcts_init(mcts, seed);

  // Dynamic time allocation based on tree-traversal and simulation steps
  while (steps > 0) mcts_search(mcts, *state, &steps);

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

  show_result(mcts->current_node->samples, best_score);
  return selected->move;
}

// NOTE: Currently the AI is not very random. It may be because the bias
// produced by choosing the first child with the best UCT value is propagated
// over a large number of simulations. This must be addressed to reduce the
// predictability of the AI.
