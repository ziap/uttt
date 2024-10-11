#ifndef NODE_H
#define NODE_H

#include "common.h"
#include "state.h"

typedef struct {
  u8 grid;
  u8 cell;
} Move;

typedef struct Node Node;

struct Node {
  Move move;

  // TODO: Switch to relative pointer
  // alignment 8 bytes -> 4 bytes
  // size 40 bytes -> 24 bytes
  u32 children_count;
  Node *children;
  Node *parent;

  i32 value;
  u32 samples;
};

typedef struct {
  Node *nodes;
  u32 capacity;
  u32 size;
} NodeArena;

extern Node Node_new(i8, i8, Node*);

extern Node *NodeArena_head(NodeArena);
extern void NodeArena_init(NodeArena*);
extern bool NodeArena_push(NodeArena*, Node);

#endif
