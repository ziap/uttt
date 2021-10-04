import { endMessage, mainCells, subCells, subGrids } from './elements.js'

const SMALL_VICTORY_X = 3 ** 9 + 1
const SMALL_VICTORY_O = 3 ** 9 + 2
const SMALL_TIE_SHIFT = 3 ** 9 + 3

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

export default class State {
    constructor() {
        this.boards = [0, 0, 0, 0, 0, 0, 0, 0, 0]
        this.lastMove = -1
        this.currentPlayer = 0
    }

    static moveTable = (() => {
        function encodeBoard(board) {
            for (const win of WIN_TRIPLETS)
                if (board[win[0]] > 0 && board[win[0]] == board[win[1]] && board[win[0]] == board[win[2]])
                    return 3 ** 9 + board[win[0]]

            let tie = true
            let newBoard = 0
            for (let i = 0; i < 9; i++) {
                if (board[i] == 0) tie = false
                newBoard *= 3
                newBoard += board[i]
            }
            return newBoard + SMALL_TIE_SHIFT * ~~tie
        }

        const result = new Array(3 ** 9)
        for (let i = 0; i < 3 ** 9; i++) {
            result[i] = {}

            let board = i

            const arr = []

            for (let j = 0; j < 9; j++) {
                arr.unshift(board % 3)
                board = ~~(board / 3)
            }

            for (let j = 0; j < 9; j++) {
                if (arr[8 - j] > 0) continue
                result[i][j] = new Array(2)
                for (let k = 0; k < 2; k++) {
                    arr[8 - j] = k + 1
                    result[i][j][k] = encodeBoard(arr)
                }
                arr[8 - j] = 0
            }
        }
        return result
    })()

    checkWinner() {
        for (const win of WIN_TRIPLETS) {
            const cell = this.boards[win[0]]
            if (cell != SMALL_VICTORY_X && cell != SMALL_VICTORY_O) continue
            if (cell == this.boards[win[1]] && cell == this.boards[win[2]]) return Math.max(0, cell - 3 ** 9)
        }

        let winner = 3
        for (const board of this.boards) if (board < 3 ** 9) winner = 0
        return winner
    }

    updateHTML() {
        for (const elem of mainCells) elem.className = 'main-cell'
        for (const elem of subCells) elem.className = 'sub-cell'
        for (const elem of subGrids) elem.className = 'sub-grid'

        const winner = this.checkWinner()
        const gameOver = winner > 0

        endMessage.className = ['', 'x', 'o', 'tie'][winner]

        for (let i = 0; i < 9; i++) {
            let board = this.boards[i]

            if (board == SMALL_VICTORY_X) mainCells[i].classList.add('x')
            else if (board == SMALL_VICTORY_O) mainCells[i].classList.add('o')
            else {
                if (!gameOver && board < SMALL_TIE_SHIFT && (this.lastMove == -1 || this.lastMove == i))
                    subGrids[i].classList.add('active')
                if (board >= SMALL_TIE_SHIFT) board -= SMALL_TIE_SHIFT
                for (let j = 0; j < 9; j++) {
                    const tile = ['', 'x', 'o'][board % 3]
                    if (tile) subCells[9 * i + j].classList.add(tile)
                    board = ~~(board / 3)
                }
            }
        }
    }

    move(grid, cell) {
        if (this.lastMove == -1 || this.lastMove == grid) {
            const moved = State.moveTable[this.boards[grid]][cell][this.currentPlayer]
            if (moved) {
                this.boards[grid] = moved
                this.currentPlayer = ~~!this.currentPlayer
                if (this.boards[cell] < 3 ** 9) this.lastMove = cell
                else this.lastMove = -1
                this.updateHTML()
            }
        }
    }
}
