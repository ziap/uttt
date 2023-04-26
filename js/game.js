import { GetAIMove } from './ai.js'
import { state } from './state.js'

const gameRoot = document.querySelector('#container')

const mainCells = gameRoot.querySelectorAll('.main-cell')
const subCells = gameRoot.querySelectorAll('.sub-cell')
const subGrids = gameRoot.querySelectorAll('.sub-grid')

const settingButton = gameRoot.querySelector('#setting')
const restartButton = gameRoot.querySelector('#restart')
const endMessage = gameRoot.querySelector('#end-message')

const playerTurn = [true, false]

function updateHTML() {
  for (const elem of mainCells) elem.className = 'main-cell'
  for (const elem of subCells) elem.className = 'sub-cell'
  for (const elem of subGrids) elem.className = 'sub-grid'

  endMessage.className = ['', 'x', 'o', 'tie'][state.result]

  let global_board = state.boards[9]
  for (let i = 0; i < 9; ++i) {
    const cell = global_board & 3
    global_board >>= 2

    switch (cell) {
      case 0: {
        if (state.result) break
        if (state.lastMove != -1 && state.lastMove != i) break
        subGrids[i].classList.add('active');
      } break
      case 1: mainCells[i].classList.add('x'); continue
      case 2: mainCells[i].classList.add('o'); continue
      default: break
    } 

    let board = state.boards[i]
    for (let j = 0; j < 9; ++j) {
      const tile = ['', 'x', 'o', 'error'][board & 3]
      board >>= 2

      if (tile) {
        console.assert(tile != 'error')
        subCells[9 * i + j].classList.add(tile)
      }
    }
  }
}

for (let i = 0; i < 9; i++) {
  for (let j = 0; j < 9; j++) {
    subCells[9 * i + j].addEventListener('click', () => {
      if (!playerTurn[state.currentPlayer]) return

      state.move(i, j)
      updateHTML()
      AIMove()
    })
  }
}

async function AIMove() {
  if (state.result || playerTurn[state.currentPlayer]) return

  settingButton.disabled = true
  restartButton.disabled = true
  const [grid, cell] = await GetAIMove() 

  state.move(grid, cell)

  settingButton.disabled = false
  restartButton.disabled = false
  updateHTML()

  if (!playerTurn[state.currentPlayer]) AIMove()
}

restartButton.addEventListener('click', () => {
  state.reset()
  updateHTML()
  AIMove()
})

settingButton.addEventListener('click', () => alert('WIP'))
updateHTML()
