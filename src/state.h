#ifndef STATE_H
#define STATE_H

#include "common.h"
#include "result_table.h"

typedef enum {
  PLAYER_X = 0,
  PLAYER_O,
} Player;

typedef struct {
  i8 grid;
  i8 cell;
} Move;

typedef struct {
  u32 boards[10];
  i8 last_move;

  Player player;
  Result result;
} State;

extern void State_init(State *);
extern void State_move(State *, Move);
extern void State_replace(State *, Move, u32);

#endif
