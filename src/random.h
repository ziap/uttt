#ifndef RANDOM_H
#define RANDOM_H

#include "common.h"

typedef u64 rng_t;

extern u32 rand_u32(rng_t*);
extern rng_t rng_new(u64);

#endif
