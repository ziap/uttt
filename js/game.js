import State from './state.js'
import { SMALL_WIN_X, SMALL_WIN_O, SMALL_TIE } from './consts.js'

export default class Game {
  /**
   * @param {Element} element
   */
  constructor(element) {
    this.mainCells = element.querySelectorAll('.main-cell')
    this.subCells = element.querySelectorAll('.sub-cell')
    this.subGrids = element.querySelectorAll('.sub-grid')

    this.settingButton = element.querySelector('#setting')
    this.restartButton = element.querySelector('#restart')
    this.endMessage = element.querySelector('#end-message')
    this.playerTurn = [true, true]

    this.state = new State()
    this.updateHTML()

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        this.subCells[9 * i + j].addEventListener('click', () => {
          if (!this.playerTurn[this.state.currentPlayer]) return

          this.state.move(i, j)
          this.updateHTML()
        })
      }
    }

    this.restartButton.addEventListener('click', () => {
      this.state.reset()
      this.updateHTML()
    })

    this.settingButton.addEventListener('click', () => alert('WIP'))
  }

  updateHTML() {
    for (const elem of this.mainCells) elem.className = 'main-cell'
    for (const elem of this.subCells) elem.className = 'sub-cell'
    for (const elem of this.subGrids) elem.className = 'sub-grid'

    const winner = this.state.checkWinner()
    const gameOver = winner > 0

    this.endMessage.className = ['', 'x', 'o', 'tie'][winner]

    for (let i = 0; i < 9; i++) {
      let board = this.state.boards[i]

      switch (board) {
        case SMALL_WIN_X: this.mainCells[i].classList.add('x'); continue;
        case SMALL_WIN_O: this.mainCells[i].classList.add('o'); continue;
        default: break;
      }

      if (!gameOver && board < SMALL_TIE) {
        if (this.state.lastMove == -1 || this.state.lastMove == i) {
          this.subGrids[i].classList.add('active')
        }
      }

      board %= SMALL_TIE

      for (let j = 0; j < 9; j++) {
        const tile = ['', 'x', 'o'][board % 3]
        board = Math.floor(board / 3)

        if (tile) this.subCells[9 * i + j].classList.add(tile)
      }
    }
  }
}
