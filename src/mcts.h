#ifndef MCTS_H
#define MCTS_H

#include "common.h"
#include "node.h"
#include "random.h"
#include "state.h"

typedef struct {
  nodes_t nodes;
  node_t *current_node;

  rng_t rng_state;
} mcts_t;

move_t search(mcts_t*, state_t*, u64, u32);

#endif
