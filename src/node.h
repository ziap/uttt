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

  usize children_count;
  node_t *children;
  node_t *parent;

  u32 value;
  u32 samples;
};

extern node_t node_new(i8, i8, node_t*);

extern node_t *nodes_head(void);
extern void nodes_init(void);
extern void nodes_push(i8, i8, node_t*);

#endif
