import { state, stateBuffer } from "./state.js";

const workerCount = Math.max(navigator.hardwareConcurrency, 1)

function createWorkers() {
  const workers = new Array(workerCount)
  for (let i = 0; i < workerCount; ++i) {
    const worker = new Worker('./js/worker.js')

    workers[i] = new Promise(resolve => {
      worker.addEventListener('message', e => {
        const msg = e.data
        if (msg != 'ready') throw new Error(`Expected 'ready', got ${msg}`)

        resolve(worker)
      }, { once: true })
    })
  }

  return Promise.all(workers)
}

export async function registerAI(callback) {
  let workers = await createWorkers()
  let working = 0

  function workerCallback(e) {
    if (working == workers.length) state.setChildren(e.data)
    else state.addChildren(e.data)

    working--

    if (!working) {
      state.bestMove(e.data.byteLength)
      callback()
    }
  }

  for (const worker of workers) {
    worker.addEventListener('message', workerCallback)
  }

  function invokeAI(strength) {
    working = workers.length

    for (const worker of workers) {
      const arr = stateBuffer.slice()

      const buf = arr.buffer
      worker.postMessage({ strength, buf }, [buf])
    }
  }

  async function stopAI() {
    if (!working) return

    for (const worker of workers) worker.terminate()
    workers = await createWorkers()

    for (const worker of workers) {
      worker.addEventListener("message", workerCallback)
    }

    working = 0
  }

  return { invokeAI, stopAI }
}
