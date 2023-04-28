#ifndef COMMON_H
#define COMMON_H

#define export __attribute__((visibility("default")))
#define len(x) (sizeof(x) / sizeof(x[0]))

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#define memset __builtin_memset
#define memcpy __builtin_memcpy

#define popcnt __builtin_popcount
#define ctz __builtin_ctz
#define clz __builtin_clz
#define sqrtf __builtin_sqrtf

// This is actually floor(log2(x)) / log2(e) which is not exactly ln(x) but
// good enough for our use case.
#define fastln(x) ((f32)(31 - clz(x)) * 0.6931471805599453f)

typedef uint8_t u8;
typedef uint16_t u16;
typedef uint32_t u32;
typedef uint64_t u64;

typedef int8_t i8;
typedef int16_t i16;
typedef int32_t i32;
typedef int64_t i64;

typedef size_t usize;

typedef float f32;
typedef double f64;

extern void assert(bool, const char*);
extern void dump(f32);

#endif
