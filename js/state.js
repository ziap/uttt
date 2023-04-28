let memory
const decoder = new TextDecoder()

function cstr(ptr) {
  const mem_arr = new Uint8Array(memory.buffer, ptr)

  let len = 0;
  while (mem_arr[len]) ++len

  const bytes = mem_arr.slice(0, len)
  return decoder.decode(bytes);
}

const env = {
  assert(x, str) { if (!x) throw new Error(cstr(str)) },
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
  reset() { exports.reset() }
}

exports.init()

export {state, stateBuffer}
