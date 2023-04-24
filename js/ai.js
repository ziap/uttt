import { stateSlice } from "./state.js";

const worker = new Worker('./js/worker.js')

export function GetAIMove() {
  const arr = new Uint8Array(stateSlice.length)
  arr.set(stateSlice)

  const buf = arr.buffer
  worker.postMessage(buf, [buf])

  return new Promise(resolve => {
    worker.addEventListener('message', e => resolve(e.data), {once: true})
  })
}
