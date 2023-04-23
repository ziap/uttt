import { WIN_TABLE } from './consts.js'

/**
 * @param {number} n
 */
function popcnt(n) {
  n = n - ((n >> 1) & 0x55555555)
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333)
  return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24
}

export default class State {
  constructor() {
    this.boards = new Uint32Array(10)
    this.lastMove = -1
    this.currentPlayer = 0
    this.winner = 0
  }

  reset() {
    this.boards.fill(0)
    this.lastMove = -1
    this.currentPlayer = 0
    this.winner = 0
  }

  clone() {
    const other = new State

    other.boards.set(this.boards)
    other.lastMove = this.lastMove
    other.currentPlayer = this.currentPlayer
    other.winner = this.winner

    return other
  }

  /**
   * @param {number} grid - The local board to play in
   * @param {number} cell - the cell inside that local board to mark
   */
  move(grid, cell) {
    if (this.lastMove != -1 && this.lastMove != grid) return

    const new_board = this.boards[grid] | (1 << (2 * cell + this.currentPlayer))
    if (new_board == this.boards[grid]) return
    this.boards[grid] = new_board
    
    const sub_over = WIN_TABLE[new_board]
    if (sub_over) {
      this.boards[9] |= sub_over << (grid << 1)
      this.winner = WIN_TABLE[this.boards[9]]
    }

    this.currentPlayer = 1 - this.currentPlayer
    this.lastMove = (this.boards[9] & (3 << (cell << 1))) ? -1 : cell
  }

  allMoves() {
    const result = []
    if (this.lastMove == -1) {
      const global_board = this.boards[9]
      let global_mask = (~(global_board | (global_board >> 1))) & 0x15555

      while (global_mask) {
        const grid = global_mask & -global_mask
        global_mask ^= grid

        const grid_idx = popcnt(grid - 1) >> 1
        const board = this.boards[grid_idx]
        let mask = (~(board | (board >> 1))) & 0x15555

        while (mask) {
          const move = mask & -mask
          mask ^= move

          result.push([grid_idx, popcnt(move - 1) >> 1])
        }
      }
    } else {
      const board = this.boards[this.lastMove]
      let mask = (~(board | (board >> 1))) & 0x15555

      while (mask) {
        const move = mask & -mask
        mask ^= move

        result.push([this.lastMove, popcnt(move - 1) >> 1])
      }
    }

    return result
  }

  randomMove() {
    let grid = this.lastMove
    if (grid == -1) {
      const board = this.boards[9]
      let mask = (~(board | (board >> 1))) & 0x15555

      const idx = Math.floor(Math.random() * popcnt(mask))
      for (let i = 0; i < idx; ++i) mask &= (mask - 1)
      mask &= -mask
      
      grid = popcnt(mask - 1) >> 1
    }

    let board = this.boards[grid]
    let mask = (~(board | (board >> 1))) & 0x15555

    const idx = Math.floor(Math.random() * popcnt(mask))
    for (let i = 0; i < idx; ++i) mask &= (mask - 1)
    mask &= -mask

    board |= (mask << this.currentPlayer)
    this.boards[grid] = board

    const sub_over = WIN_TABLE[board]
    if (sub_over) {
      if (sub_over) {
        this.boards[9] |= sub_over << (grid << 1)
        this.winner = WIN_TABLE[this.boards[9]]
      }
    }

    this.currentPlayer = 1 - this.currentPlayer
    this.lastMove = (this.boards[9] & (3 * mask)) ? -1 : (popcnt(mask - 1) >> 1)
  }
}
