#ifndef RESULT_H
#define RESULT_H

typedef enum {
  PLAYING,
  X_WIN,
  O_WIN,
  TIE,
} result_t;

#define TABLE_SIZE (1 << 18)
extern result_t RESULT_TABLE[TABLE_SIZE];

extern void create_table(void);

#endif
