const wasm = await WebAssembly.instantiateStreaming(fetch('./wasm/state.wasm'))
const { exports } = wasm.instance
const boards = new Uint32Array(exports.memory.buffer, exports.boards(), 10)

const stateSlice = new Uint8Array(
  exports.memory.buffer,
  exports.state_ptr(),
  exports.state_size()
)

const state = {
  boards,
  get lastMove() { return exports.last_move() },
  get currentPlayer() { return exports.player() },
  get result() { return exports.result() },

  move(grid, cell) { exports.move(grid, cell) },
  reset() { exports.reset() }
}

exports.init()

export {state, stateSlice}
