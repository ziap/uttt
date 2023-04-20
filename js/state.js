import { SMALL_OVER, SMALL_TIE, MOVE_TABLES, WIN_TRIPLETS } from "./consts.js"

// TODO: Implement this in WASM
export default class State {
  constructor() {
    this.boards = new Uint16Array(9)
    this.lastMove = -1
    this.currentPlayer = 0
  }

  checkWinner() {
    for (let i = 0; i < WIN_TRIPLETS.length; i += 3) {
      const cell = this.boards[WIN_TRIPLETS[i]]

      if (cell < SMALL_OVER || cell >= SMALL_TIE) continue
      if (cell != this.boards[WIN_TRIPLETS[i + 1]]) continue
      if (cell != this.boards[WIN_TRIPLETS[i + 2]]) continue

      return cell - SMALL_OVER
    }

    let winner = 3
    for (const board of this.boards) if (board < SMALL_OVER) winner = 0
    return winner
  }

  /**
   * @param {number} grid
   * @param {number} cell
   */
  move(grid, cell) {
    if (this.lastMove != -1 && this.lastMove != grid) return

    const moved = MOVE_TABLES[this.currentPlayer][9 * this.boards[grid] + cell]
    if (!moved) return

    this.boards[grid] = moved
    this.currentPlayer = 1 - this.currentPlayer

    if (this.boards[cell] < SMALL_OVER) this.lastMove = cell
    else this.lastMove = -1
  }

  reset() {
    this.boards.fill(0)
    this.lastMove = -1
    this.currentPlayer = 0
  }
}
