(async () => {
  let memory, start
  const decoder = new TextDecoder()

  const env = {
    log_error(ptr, size) {
      const memArr = new Uint8Array(memory.buffer, ptr, size)
      console.error(decoder.decode(memArr))
    },
    dump(x) { console.log(x) },
    export_children(ptr, size) {
      const cloned = new Uint8Array(memory.buffer, ptr, size).slice()
      postMessage(cloned.buffer, [cloned.buffer])
    }
  }

  const wasm = await WebAssembly.instantiateStreaming(fetch('../wasm/ai.wasm'), { env })
  const { exports } = wasm.instance

  memory = exports.memory

  exports.init()

  addEventListener('message', e => {
    const state = new Uint8Array(memory.buffer, exports.state_ptr())
    state.set(new Uint8Array(e.data.buf))

    const seed = new BigUint64Array(1)
    crypto.getRandomValues(seed)

    start = Date.now()
    exports.ai_search(seed[0], e.data.strength)
  })

  postMessage('ready')
})()
