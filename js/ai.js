import { state, stateBuffer } from "./state.js";

function createWorker() {
  const worker = new Worker('./js/worker.js')

  return new Promise(resolve => worker.addEventListener('message', e => {
    const msg = e.data
    if (msg != 'ready') throw new Error(`Expected 'ready', got ${msg}`)

    resolve(worker)
  }, { once: true }))
}

function createWorkers(count) {
  let workers = [createWorker()]
  for (let i = 1; i < count; ++i) workers.push(createWorker())

  return Promise.all(workers)
}

const workerCount = navigator.hardwareConcurrency

let workers = await createWorkers(workerCount)
let working = false

export async function invokeAI(strength) {
  const start = performance.now()
  let promises = []

  for (const worker of workers) {
    promises.push(new Promise(resolve => {
      worker.addEventListener('message', e => {
        resolve(e.data)
      }, { once: true })
    }))
  }

  working = true
  for (const worker of workers) {
    const arr = new Uint8Array(stateBuffer.length)
    arr.set(stateBuffer)

    const buf = arr.buffer
    worker.postMessage({ strength, buf }, [buf])
  }

  const results = await Promise.all(promises)
  working = false

  state.set_children(results[0])
  for (let i = 1; i < promises.length; ++i) state.add_children(promises[i])

  state.best_move(results[0].byteLength)
  console.log(`Search time: ${performance.now() - start}`)
}

export async function stopAI() {
  if (!working) return

  for (const worker of workers) worker.terminate()
  workers = await createWorkers(workerCount)

  working = false
}
