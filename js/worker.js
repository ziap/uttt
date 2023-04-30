(async () => {
  let memory, start
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
    export_children(ptr, size) {
      const slice = new Uint8Array(memory.buffer, ptr, size);
      const cloned = new Uint8Array(slice)

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
