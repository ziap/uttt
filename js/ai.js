import { stateBuffer } from "./state.js";

const worker = new Worker('./js/worker.js')

export function GetAIMove(strength) {
  const arr = new Uint8Array(stateBuffer.length)
  arr.set(stateBuffer)

  const buf = arr.buffer
  worker.postMessage({strength, buf}, [buf])

  return new Promise(resolve => {
    worker.addEventListener('message', e => resolve(e.data), {once: true})
  })
}
