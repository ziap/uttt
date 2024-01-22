(async () => {
  let memory, start
  const decoder = new TextDecoder()

  function cstr(ptr) {
    const memArr = new Uint8Array(memory.buffer, ptr)

    let len = 0;
    while (memArr[len]) ++len

    return decoder.decode(memArr.subarray(0, len))
  }

  const fullArr = new Uint8Array(memory.buffer)
  const env = {
    assert(x, str) { if (!x) throw new Error(cstr(str)) },
    dump(x) { console.log(x) },
    export_children(ptr, size) {
      const cloned = fullArr.slice(ptr, ptr + size)
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
