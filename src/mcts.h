#ifndef MCTS_H
#define MCTS_H

#include "common.h"
#include "node.h"
#include "random.h"
#include "state.h"

typedef struct {
  node_t *current_node;

  rng_t rng_state;
} mcts_t;

move_t search(mcts_t*, state_t*, u64, i32);

#endif
