import { subCells, restartButton, settingButton } from './elements.js'
import State from './state.js'

export default class Game {
    constructor() {
        this.state = new State()

        this.playerTurn = [true, true]

        this.state.updateHTML()

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                subCells[9 * i + j].addEventListener('click', () => this.Press(i, j))
            }
        }

        restartButton.addEventListener('click', () => {
            this.state = new State()
            this.state.updateHTML()
        })

        settingButton.addEventListener('click', () => alert('WIP'))
    }

    Press(grid, cell) {
        if (this.playerTurn[this.state.currentPlayer]) this.state.move(grid, cell)
    }
}
