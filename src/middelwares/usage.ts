import { Middleware, Store } from '../index'
import * as hue from '../lib/hue'
import * as smappee from '../lib/smappee'

// Usage middleware, transforms the saturation based on the current
// usage, in real time.
export function newUsageMiddleware(store: Store): Middleware {
  return (hsb: hue.HSB): hue.HSB => {
    hsb.s = hue.getUsageSaturation(store.power)
    return hsb
  }
}

export function startUsageUpdate(store: Store) {
  updateUsage(store)
}

async function updateUsage(store: Store) {
  try {
    await smappee.login()
    store.power = await smappee.activePower()
  } catch (err) {
    console.error(err)
  }

  setTimeout(() => {
    updateUsage(store)
  }, 3 * 1000)
}
