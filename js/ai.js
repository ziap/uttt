import { stateBuffer } from "./state.js";

async function createWorker() {
  const worker = new Worker('./js/worker.js')

  await new Promise(resolve => worker.addEventListener('message', e => {
    const msg = e.data
    if (msg != 'ready') throw new Error(`Expected 'ready', got ${msg}`)

    resolve()
  }, { once: true }))

  return worker
}

let worker = await createWorker()
let working = false

// TODO: Root parallelism
export function GetAIMove(strength) {
  const arr = new Uint8Array(stateBuffer.length)
  arr.set(stateBuffer)

  const buf = arr.buffer
  worker.postMessage({strength, buf}, [buf])

  working = true
  return new Promise(resolve => {
    worker.addEventListener('message', e => {
      resolve(e.data)
      working = false
    }, {once: true})
  })
}

export async function StopAI() {
  if (!working) return

  worker.terminate()
  worker = await createWorker()

  working = false
}
