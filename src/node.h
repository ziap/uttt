#ifndef NODE_H
#define NODE_H

#include "common.h"
#include "state.h"

typedef struct {
  u8 grid;
  u8 cell;
} move_t;

typedef struct node_t node_t;

struct node_t {
  move_t move;

  bool expanded;
  usize children_count;
  node_t *children[81];
  node_t *parent;

  u32 simulation_done;
  u32 simulation_won;
};

extern node_t node_new(i8, i8, node_t*);

#define NODES_CAP (1 << 22)

typedef struct {
  node_t data[NODES_CAP];

  size_t size;
} nodes_t;

extern void nodes_init(nodes_t *);
extern node_t *nodes_push(nodes_t *, i8, i8, node_t*);

#endif
