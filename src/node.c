#include "node.h"

node_t node_new(i8 grid, i8 cell, node_t* parent) {
  return (node_t) {
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
