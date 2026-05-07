import { state, stateBuffer } from './state.js';
/**
 * @import { SearchMessage } from "./shared";
 */

const workerCount = Math.max(navigator.hardwareConcurrency, 1)

/**
 * @returns {Promise<Worker[]>}
 */
async function createWorkers() {
  /** @type {Promise<Worker>[]} */
  const workers = new Array(workerCount)
  const module = await WebAssembly.compileStreaming(fetch('./wasm/ai.wasm'))
  for (let i = 0; i < workerCount; ++i) {
    const worker = new Worker('./js/worker.js')
    worker.postMessage(module)

    workers[i] = new Promise(resolve => {
      worker.addEventListener('message', ({ data: msg }) => {
        if (msg != 'ready') throw new Error(`Expected 'ready', got ${msg}`)

        resolve(worker)
      }, { once: true })
    })
  }

  return Promise.all(workers)
}

/**
 * @param {() => void} callback
 */
export async function registerAI(callback) {
  let workers = await createWorkers()
  let working = 0

  /**
   * @param {MessageEvent<ArrayBuffer>} e
   */
  function workerCallback({ data }) {
    if (working == workers.length) state.setChildren(data)
    else state.addChildren(data)

    working--

    if (!working) {
      state.bestMove(data.byteLength)
      callback()
    }
  }

  for (const worker of workers) {
    worker.addEventListener('message', workerCallback)
  }

  /**
   * @param {number} strength
   */
  function invokeAI(strength) {
    working = workers.length

    for (const worker of workers) {
      const arr = stateBuffer.slice()

      const buf = arr.buffer

      /** @type {SearchMessage} */
      const msg = { buf, strength }
      worker.postMessage(msg, [buf])
    }
  }

  async function stopAI() {
    if (!working) return

    for (const worker of workers) worker.terminate()
    workers = await createWorkers()

    for (const worker of workers) {
      worker.addEventListener('message', workerCallback)
    }

    working = 0
  }

  return { invokeAI, stopAI }
}
