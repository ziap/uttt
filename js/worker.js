(async () => {
  let memoryBuffer
  const decoder = new TextDecoder()

  function cstr(ptr) {
    const mem_arr = new Uint8Array(memoryBuffer, ptr)

    let len = 0;
    while (mem_arr[len]) ++len

    const bytes = mem_arr.slice(0, len)
    return decoder.decode(bytes);
  }

  const env = {
    assert(x, str) {
      if (!x) throw new Error(cstr(str))
    },
    logf(x) {
      return Math.log(x)
    },
    dump(x) {
      console.log(x)
    }
  }

  const wasm = await WebAssembly.instantiateStreaming(fetch('../wasm/ai.wasm'), { env })
  const { exports } = wasm.instance

  memoryBuffer = exports.memory.buffer

  const state = new Uint8Array(memoryBuffer, exports.state_ptr())
  const result = new Uint8Array(memoryBuffer, exports.result_ptr(), 2)

  exports.init()

  addEventListener('message', e => {
    const slice = new Uint8Array(e.data)
    state.set(slice)

    exports.ai_search(BigInt(Date.now()), 1000000)

    postMessage([...result])
  })
})()
