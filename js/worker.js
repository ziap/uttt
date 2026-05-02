/// <reference lib="webworker" />

/**
 * @import { SearchMessage } from "./shared";
 */

addEventListener('message', async ({ data }) => {
  /** @type {WebAssembly.Memory} */
  let memory
  const decoder = new TextDecoder()

  const env = {
    /**
     * @param {number} ptr
     * @param {number} size
     */
    log_error(ptr, size) {
      const memArr = new Uint8Array(memory.buffer, ptr, size)
      console.error(decoder.decode(memArr))
    },
    /**
     * @param {number} x
     */
    dump(x) { console.log(x) },
    /**
     * @param {number} ptr
     * @param {number} size
     */
    export_children(ptr, size) {
      const cloned = new Uint8Array(memory.buffer, ptr, size).slice()
      postMessage(cloned.buffer, [cloned.buffer])
    }
  }

  /**
   * @typedef WorkerExport
   * @prop {WebAssembly.Memory} memory
   * @prop {() => number} state_ptr
   * @prop {(seed: BigInt, strength: number) => void} ai_search
   * @prop {() => void} init
   */

  const module = /** @type{WebAssembly.Module} */(data)
  const instance = await WebAssembly.instantiate(module, { env })
  const exports = /** @type {WorkerExport} */ (instance.exports)

  memory = exports.memory

  exports.init()

  addEventListener('message', (/** @type {MessageEvent<SearchMessage>} */ e) => {
    const state = new Uint8Array(memory.buffer, exports.state_ptr())
    state.set(new Uint8Array(e.data.buf))

    const seed = new BigUint64Array(1)
    crypto.getRandomValues(seed)

    exports.ai_search(seed[0], e.data.strength)
  })

  postMessage('ready')
}, { once: true })
