#include "node.h"

node_t node_new(i8 grid, i8 cell, node_t* parent) {
  return (node_t) {
    .move = {
      .grid = grid,
      .cell = cell,
    },

    .expanded = false,
    .children_count = 0,
    .children = NULL,
    .parent = parent,

    .simulation_done = 0,
    .simulation_won = 0,
  };
}

void nodes_init(nodes_t *stack) { stack->size = 0; }

node_t *nodes_push(nodes_t *stack, i8 grid, i8 cell, node_t *parent) {
  assert(stack->size < NODES_CAP, "ERROR: Stack overflow");
  node_t *item = stack->data + (stack->size++);
  *item = node_new(grid, cell, parent);

  return item;
}
