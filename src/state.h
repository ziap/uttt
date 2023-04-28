#ifndef STATE_H
#define STATE_H

#include "common.h"
#include "result_table.h"

typedef enum {
  PLAYER_X,
  PLAYER_O,
} player_t;

typedef struct {
  u32 boards[10];

  i8 last_move;

  player_t player;
  result_t result;
} state_t;

extern void state_init(state_t *);
extern void state_move(state_t *, u8, u8);
extern void state_replace(state_t *, u8, u8, u32);

#endif
