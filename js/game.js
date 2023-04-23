import State from './state.js'

export default class Game {
  constructor() {
      const game_root = document.querySelector('#container')

    this.mainCells = game_root.querySelectorAll('.main-cell')
    this.subCells = game_root.querySelectorAll('.sub-cell')
    this.subGrids = game_root.querySelectorAll('.sub-grid')

    this.settingButton = game_root.querySelector('#setting')
    this.restartButton = game_root.querySelector('#restart')
    this.endMessage = game_root.querySelector('#end-message')

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

    this.endMessage.className = ['', 'x', 'o', 'tie'][this.state.winner]

    let global_board = this.state.boards[9]
    for (let i = 0; i < 9; ++i) {
      const cell = global_board & 3
      global_board >>= 2

      switch (cell) {
        case 0: {
          if (this.state.winner) break
          if (this.state.lastMove != -1 && this.state.lastMove != i) break
          this.subGrids[i].classList.add('active');
        } break
        case 1: this.mainCells[i].classList.add('x'); continue
        case 2: this.mainCells[i].classList.add('o'); continue
        default: break
      } 

      let board = this.state.boards[i]
      for (let j = 0; j < 9; ++j) {
        const tile = ['', 'x', 'o', 'error'][board & 3]
        board >>= 2

        if (tile) {
          console.assert(tile != 'error')
          this.subCells[9 * i + j].classList.add(tile)
        }
      }
    }
  }
}
