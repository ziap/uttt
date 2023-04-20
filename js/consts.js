export const SMALL_OVER = 3 ** 9
export const SMALL_WIN_X = SMALL_OVER + 1
export const SMALL_WIN_O = SMALL_OVER + 2
export const SMALL_TIE = SMALL_OVER + 3

export const WIN_TRIPLETS = new Uint8Array([
  0, 1, 2,
  3, 4, 5,
  6, 7, 8,
  0, 3, 6,
  1, 4, 7,
  2, 5, 8,
  0, 4, 8,
  2, 4, 6
])

export const MOVE_TABLES = [
  new Uint32Array(9 * SMALL_OVER),
  new Uint32Array(9 * SMALL_OVER)
]

class SmallBoard extends Uint8Array {
  constructor() { super(9) }

  encode() {
    for (let i = 0; i < WIN_TRIPLETS.length; i += 3) {
      const cell = this[WIN_TRIPLETS[i]]
      if (!cell) continue

      if (cell != this[WIN_TRIPLETS[i + 1]]) continue
      if (cell != this[WIN_TRIPLETS[i + 2]]) continue

      return SMALL_OVER + cell

    }

    let tie = 1
    let newBoard = 0
    for (let i = 0; i < 9; i++) {
      if (this[i] == 0) tie = 0
      newBoard *= 3
      newBoard += this[i]
    }
    return newBoard + SMALL_TIE * tie
  }
}

const arr = new SmallBoard()
for (let i = 0; i < SMALL_OVER; i++) {
  let board = i

  for (let j = 0; j < 9; j++) {
    arr[8 - j] = board % 3
    board = Math.floor(board / 3)
  }

  for (let j = 0; j < 9; j++) {
    if (arr[8 - j]) continue
    for (let k = 0; k < 2; k++) {
      arr[8 - j] = k + 1
      MOVE_TABLES[k][9 * i + j] = arr.encode()
    }
    arr[8 - j] = 0
  }
}
