import * as moment from 'moment'

import { Middleware, Store } from '../'
import * as hue from '../lib/hue'
import * as tibber from '../lib/tibber'

// PriceMiddleware, transform the hue based on proce from the utility
export function newPriceMiddleware(store: Store): Middleware {
  return (hsb: hue.HSB): hue.HSB => {
    if (!store.priceData) {
      return hsb
    }

    const priceHSB = hue.getPriceHsl(store.priceData.current.total, store.priceData.range)
    hsb.h = priceHSB.h
    return hsb
  }
}

export function startPriceUpdate(store: Store) {
  updatePrice(store)
}

async function updatePrice(store: Store) {
  const price = await tibber.getPrice()
  console.log(`Current price: ${price.current.total} (${price.current.startsAt})`)

  const priceHSB = hue.getPriceHsl(price.current.total, price.range.nodes)
  console.log(`Setting price hue to ${priceHSB.h}°`)

  store.priceData = {
    range: price.range.nodes,
    current: price.current,
  }

  // wait until the next hour
  const next = moment(price.current.startsAt)
    .add(1, 'hour')
    .add(1, 'minute')
  const wait = next.diff(moment(), 'ms')

  console.log('Next price update in:', wait / (60 * 1000), 'minutes')
  setTimeout(() => {
    updatePrice(store)
  }, wait)
}
