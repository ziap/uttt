let memory
const decoder = new TextDecoder()

const env = {
  log_error(ptr, size) {
    const memArr = new Uint8Array(memory.buffer, ptr, size)
    console.error(decoder.decode(memArr))
  },
  dump(x) { console.log(x) },
}

const wasm = await WebAssembly.instantiateStreaming(fetch('./wasm/state.wasm'), { env })
const { exports } = wasm.instance

memory = exports.memory

const boards = new Uint32Array(memory.buffer, exports.boards(), 10)
const stateBuffer = new Uint8Array(memory.buffer, exports.state_ptr(), exports.state_size())

const state = {
  boards,
  get lastMove() { return exports.last_move() },
  get currentPlayer() { return exports.player() },
  get result() { return exports.result() },

  move(grid, cell) { exports.move(grid, cell) },
  set_children(buffer) {
    const arr = new Uint8Array(buffer)
    const slice = new Uint8Array(memory.buffer, exports.children_ptr(), arr.length)
    slice.set(arr)
  },
  add_children(buffer) {
    const arr = new Uint8Array(buffer)
    const slice = new Uint8Array(memory.buffer, exports.children_ptr() + arr.length, arr.length)
    slice.set(arr)

    exports.combine_children(arr.length)
  },
  best_move(length) { exports.select_child(length) },
  reset() { exports.reset() }
}

exports.init()

export { state, stateBuffer }
