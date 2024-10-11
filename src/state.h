#ifndef STATE_H
#define STATE_H

#include "common.h"
#include "result_table.h"

typedef enum {
  PLAYER_X,
  PLAYER_O,
} Player;

typedef struct {
  u32 boards[10];

  i8 last_move;

  Player player;
  Result result;
} State;

extern void State_init(State *);
extern void State_move(State *, u8, u8);
extern void State_replace(State *, u8, u8, u32);

#endif
