const WIN_TRIPLETS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]

const WIN_MASKS_X = new Uint32Array(WIN_TRIPLETS.length)
const WIN_MASKS_O = new Uint32Array(WIN_TRIPLETS.length)

for (let i = 0; i < WIN_TRIPLETS.length; ++i) {
  for (const cell of WIN_TRIPLETS[i]) {
    WIN_MASKS_X[i] |= 1 << (2 * cell)
    WIN_MASKS_O[i] |= 2 << (2 * cell)
  }
}

const LUT_SIZE = 1 << 18
export const WIN_TABLE = new Uint8Array(LUT_SIZE)

for (let board = 0; board < LUT_SIZE; ++board) {
  for (let i = 0; i < WIN_TRIPLETS.length; ++i) {
    const mask_x = WIN_MASKS_X[i]
    const mask_o = WIN_MASKS_O[i]
    if ((board | mask_x) == board && (board & mask_o) == 0) {
      WIN_TABLE[board] = 1
      break
    }
    if ((board | mask_o) == board && (board & mask_x) == 0) {
      WIN_TABLE[board] = 2
      break
    }
  }

  if (WIN_TABLE[board] == 0) {
    WIN_TABLE[board] = 3
    let tmp = board
    for (let i = 0; i < 9; ++i) {
      const cell = tmp & 3
      tmp >>= 2

      if (!cell) {
        WIN_TABLE[board] = 0
        break
      }
    }
  }
}

// TODO: Threat masks for speeding up endgame simulation
