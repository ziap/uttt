(async () => {
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
    assert(x, str) {
      if (!x) throw new Error(cstr(str))
    },
    dump(x) {
      console.log(x)
    }
  }

  const wasm = await WebAssembly.instantiateStreaming(fetch('../wasm/ai.wasm'), { env })
  const { exports } = wasm.instance

  memory = exports.memory

  exports.init()

  addEventListener('message', e => {
    const state = new Uint8Array(memory.buffer, exports.state_ptr())
    state.set(new Uint8Array(e.data))

    const seed = new BigUint64Array(1)
    crypto.getRandomValues(seed)
    exports.ai_search(seed[0], 64)

    const result = new Uint8Array(memory.buffer, exports.result_ptr(), 2)
    postMessage([...result])
  })
})()
