#ifndef RANDOM_H
#define RANDOM_H

#include "common.h"

typedef u64 RNG;

extern u32 RNG_u32(RNG*);
extern RNG RNG_new(u64);

#endif
