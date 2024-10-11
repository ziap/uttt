#include "node.h"

Node Node_new(i8 grid, i8 cell, Node* parent) {
  return (Node) {
    .move = {
      .grid = grid,
      .cell = cell,
    },

    .children_count = 0,
    .children = NULL,
    .parent = parent,

    .samples = 0,
    .value = 0,
  };
}

Node *NodeArena_head(NodeArena arena) {
  return arena.nodes + arena.size;
}

void NodeArena_init(NodeArena *arena) {
  arena->size = 0;
}

bool NodeArena_push(NodeArena *arena, Node node) {
  if (arena->size < arena->capacity) {
    arena->nodes[arena->size++] = node;
    return true;
  }

  return false;
}
