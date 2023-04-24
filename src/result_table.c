#include "common.h"
#include "result_table.h"

static const u8 WIN_TRIPLETS[][3] = {
  {0, 1, 2},
  {3, 4, 5},
  {6, 7, 8},
  {0, 3, 6},
  {1, 4, 7},
  {2, 5, 8},
  {0, 4, 8},
  {2, 4, 6},
};

result_t RESULT_TABLE[TABLE_SIZE] = {0};

static u32 win_mask_x[len(WIN_TRIPLETS)] = {0};
static u32 win_mask_o[len(WIN_TRIPLETS)] = {0};

void create_table(void) {
  for (usize i = 0; i < len(WIN_TRIPLETS); ++i) {
    for (const u8 *it = WIN_TRIPLETS[i]; it < WIN_TRIPLETS[i + 1]; ++it) {
      u32 cell = *it;
      win_mask_x[i] |= 1 << (cell << 1);
      win_mask_o[i] |= 2 << (cell << 1);
    }
  }

  for (u32 board = 0; board < TABLE_SIZE; ++board) {
    for (usize i = 0; i < len(WIN_TRIPLETS); ++i) {
      u32 mask_x = win_mask_x[i];
      u32 mask_o = win_mask_o[i];

      if ((board | mask_x) == board && (board & mask_o) == 0) {
        RESULT_TABLE[board] = X_WIN;
        break;
      }

      if ((board | mask_o) == board && (board & mask_x) == 0) {
        RESULT_TABLE[board] = O_WIN;
        break;
      }
    }
    
    if (RESULT_TABLE[board]) continue;
    RESULT_TABLE[board] = TIE;

    u32 tmp = board;
    for (usize i = 0; i < 9; ++i) {
      u32 cell = tmp & 3;
      tmp >>= 2;

      if (cell) continue;
      RESULT_TABLE[board] = 0;
      break;
    }
  }
}