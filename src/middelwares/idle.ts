import { Middleware, Store } from '../'
import { HSB } from '../lib/hue'

const idleHue = new HSB(358.6318, 10.98, 30.19)
// idleDetector looks at the usage and price and descides if the hosehold is
// in an idle state, and let the light remain in whatever state it is.
export function newIdleDetector(store: Store): Middleware {
  return (hsb: HSB): HSB => {
    if (store.power < 500) {
      return new HSB(idleHue.h, idleHue.s, hsb.b)
    }
    return hsb
  }
}
