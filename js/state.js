import { WIN_TABLE } from './consts.js'

// TODO: Use bitboard for move generation instead of LUT
export default class State {
  constructor() {
    this.boards = new Uint32Array(10)
    this.lastMove = -1
    this.currentPlayer = 0
    this.winner = 0
  }

  /**
   * @param {number} grid
   * @param {number} cell
   */
  move(grid, cell) {
    if (this.lastMove != -1 && this.lastMove != grid) return

    const new_board = this.boards[grid] | (1 << (2 * cell + this.currentPlayer))
    if (new_board == this.boards[grid]) return
    this.boards[grid] = new_board
    
    const sub_over = WIN_TABLE[new_board]
    if (sub_over) {
      this.boards[9] |= sub_over << (2 * grid)
      this.winner = WIN_TABLE[this.boards[9]]
    }

    this.currentPlayer = 1 - this.currentPlayer
    this.lastMove = (this.boards[9] & (3 << (2 * cell))) ? -1 : cell
  }

  reset() {
    this.boards.fill(0)
    this.lastMove = -1
    this.currentPlayer = 0
    this.winner = 0
  }
}
