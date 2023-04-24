#include "random.h"

#define MUL 6364136223846793005ULL
#define INC 1442695040888963407ULL

u32 rand_u32(rng_t *state) {
  rng_t oldstate = *state;
  *state = oldstate * MUL + INC;

  u32 xorshifted = ((oldstate >> 18u) ^ oldstate) >> 27u;
  u32 rot = oldstate >> 59u;
  return (xorshifted >> rot) | (xorshifted << ((-rot) & 31));
}

rng_t rng_new(u64 seed) {
  rng_t state = 0;
  rand_u32(&state);
  
  state += seed;
  rand_u32(&state);

  return state;
}
