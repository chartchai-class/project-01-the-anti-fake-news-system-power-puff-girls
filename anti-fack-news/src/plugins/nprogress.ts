import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

let active = 0
let startTimer: number | undefined
let safetyTimer: number | undefined

const DEBOUNCE_MS = 80       
const MIN_MS = 220           
const SAFETY_MS = 10000       

function start() {
  if (active === 0) {
    startTimer = window.setTimeout(() => NProgress.start(), DEBOUNCE_MS)
    safetyTimer = window.setTimeout(() => {
      active = 0
      clearTimeout(startTimer); startTimer = undefined
      NProgress.done(true)
    }, SAFETY_MS)
  }
  active++
}

function done() {
  active = Math.max(0, active - 1)
  if (active === 0) {
    const end = () => {
      clearTimeout(startTimer); startTimer = undefined
      clearTimeout(safetyTimer); safetyTimer = undefined
      NProgress.done()
    }
    setTimeout(end, Math.max(0, MIN_MS - DEBOUNCE_MS))
  }
}
async function track<T>(fn: () => Promise<T>): Promise<T> {
  start()
  try { return await fn() } finally { done() }
}
function pulse(ms = MIN_MS) {
  start()
  setTimeout(done, ms)
}

export const NP = { start, done, track, pulse }
