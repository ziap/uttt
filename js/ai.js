import { state, stateBuffer } from "./state.js";

function createWorkers(count) {
  const workers_promise = new Array(count)
  for (let i = 0; i < count; ++i) {
    const worker = new Worker('./js/worker.js')

    workers_promise[i] = new Promise(resolve => {
      worker.addEventListener('message', e => {
        const msg = e.data
        if (msg != 'ready') throw new Error(`Expected 'ready', got ${msg}`)

        resolve(worker)
      }, { once: true })
    })
  }

  return Promise.all(workers_promise)
}

const workerCount = Math.max(navigator.hardwareConcurrency, 1)

export async function registerAI(callback) {
  let workers = await createWorkers(workerCount)
  let working = 0

  function workerCallback(e) {
    if (working == workers.length) state.set_children(e.data)
    else state.add_children(e.data)

    working--

    if (!working) {
      state.best_move(e.data.byteLength)
      callback()
    }
  }

  for (const worker of workers) {
    worker.addEventListener('message', workerCallback)
  }

  function invokeAI(strength) {
    working = workers.length

    for (const worker of workers) {
      const arr = new Uint8Array(stateBuffer.length)
      arr.set(stateBuffer)

      const buf = arr.buffer
      worker.postMessage({ strength, buf }, [buf])
    }
  }

  async function stopAI() {
    if (!working) return

    for (const worker of workers) worker.terminate()
    workers = await createWorkers(workerCount)

    for (const worker of workers) {
      worker.addEventListener("message", workerCallback)
    }

    working = 0
  }

  return { invokeAI, stopAI }
}
