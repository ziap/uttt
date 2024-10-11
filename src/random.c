#include "random.h"

#define MUL 6364136223846793005ULL
#define INC 1442695040888963407ULL

// 32-bit PCG with 64-bit state
// See: <https://www.pcg-random.org>
u32 RNG_u32(RNG *state) {
  RNG oldstate = *state;
  *state = oldstate * MUL + INC;

  u32 xorshifted = ((oldstate >> 18u) ^ oldstate) >> 27u;
  u32 rot = oldstate >> 59u;
  return (xorshifted >> rot) | (xorshifted << ((-rot) & 31));
}

RNG RNG_new(u64 seed) {
  RNG state = 0;
  RNG_u32(&state);
  
  state += seed;
  RNG_u32(&state);

  return state;
}
