#include "ai.h"

#define PAGE 65536
#define NODES_PAGE (PAGE / sizeof(node_t))

static usize capacity = 0;
static usize size = 0;

static node_t *nodes = NULL;

node_t *nodes_head(void) { return nodes + size; }

void nodes_init(void) { size = 0; }

void nodes_push(i8 grid, i8 cell, node_t *parent) {
  if (size == capacity) {
    if (!capacity) {
      nodes = (node_t *)(__builtin_wasm_memory_size(0) * PAGE);

      __builtin_wasm_memory_grow(0, 1);
      capacity = NODES_PAGE;
    }

    usize pages = capacity / NODES_PAGE;

    __builtin_wasm_memory_grow(0, pages);
    capacity += capacity;
  }

  nodes[size++] = node_new(grid, cell, parent);
}

state_t state;
mcts_t searcher;
move_t result;

void init(void) { create_table(); }
void *state_ptr(void) { return &state; }
void *result_ptr(void) { return &result; }

void ai_search(u64 seed, i32 steps) {
  result = search(&searcher, &state, seed, steps * (1 << 20));
}
