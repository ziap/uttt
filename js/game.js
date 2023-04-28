import { GetAIMove } from './ai.js'
import { state } from './state.js'

const gameRoot = document.querySelector('#container')

const mainCells = gameRoot.querySelectorAll('.main-cell')
const subCells = gameRoot.querySelectorAll('.sub-cell')
const subGrids = gameRoot.querySelectorAll('.sub-grid')

const settingsButton = gameRoot.querySelector('#settings')
const restartButton = gameRoot.querySelector('#restart')
const endMessage = gameRoot.querySelector('#end-message')

let playerTurn = [true, false]
let AIStrength = 32

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

  // TODO: Properly cancel AI move when clicking restart of settings
  settingsButton.disabled = true
  restartButton.disabled = true
  const [grid, cell] = await GetAIMove(AIStrength) 

  state.move(grid, cell)

  settingsButton.disabled = false
  restartButton.disabled = false
  updateHTML()

  if (!playerTurn[state.currentPlayer]) AIMove()
}

restartButton.addEventListener('click', () => {
  state.reset()
  updateHTML()
  AIMove()
})

const settingsRoot = document.querySelector('#settings-container')
const settingsPlayerX = settingsRoot.querySelector('#settings-player-x')
const settingsPlayerO = settingsRoot.querySelector('#settings-player-o')
const settingsAI = settingsRoot.querySelector('#settings-ai')
const settingsAIDisplay = settingsRoot.querySelector('#settings-ai-display')
const settingsSubmit = settingsRoot.querySelector('#settings-submit')
const settingsReturn = settingsRoot.querySelector('#settings-return')

settingsButton.addEventListener('click', () => {
  settingsPlayerX.value = playerTurn[0] ? 'human' : 'ai'
  settingsPlayerO.value = playerTurn[1] ? 'human' : 'ai'
  
  settingsAI.value = AIStrength
  settingsAIDisplay.textContent = AIStrength

  settingsRoot.hidden = false
})

settingsSubmit.addEventListener('click', () => {
  playerTurn[0] = settingsPlayerX.value == 'human'
  playerTurn[1] = settingsPlayerO.value == 'human'

  AIStrength = parseInt(settingsAI.value)
  settingsRoot.hidden = true

  state.reset()
  updateHTML()
  AIMove()
})

settingsAI.addEventListener('input', (e) => settingsAIDisplay.textContent = e.target.value)

settingsReturn.addEventListener('click', () => settingsRoot.hidden = true)

updateHTML()
