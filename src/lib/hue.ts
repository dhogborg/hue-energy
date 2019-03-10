import { PriceData } from './tibber'

// 1 - 0.3
// 0 - 150°
// > 0.3 = 250
// < 1.75 = 310

export class HSB {
  constructor(public h: number, public s: number, public b: number) {}

  set(h: number, s: number, b: number) {
    this.h = h
    this.s = s
    this.b = b
  }

  setPhilipsHSB(h: number, s: number, b: number) {
    this.h = h / (65535 / 360)
    this.s = s / (255 / 100)
    this.b = b / (255 / 100)
  }

  getPhilipsHSB(): PhilipsHSB {
    const h = this.h * (65535 / 360)
    const s = this.s * (255 / 100)
    const b = this.b * (255 / 100)

    return new PhilipsHSB(h, s, b)
  }
}

export class PhilipsHSB {
  constructor(public h: number, public s: number, public b: number) {}
}

export function getPriceHsl(price: number, range: PriceData[]): HSB {
  if (price >= 1.75) return new HSB(310, 100, 30) // Magenta
  if (price <= 0.3) return new HSB(250, 100, 30) // Blue

  const hueStart = 150
  const hueEnd = 0

  let priceMin = 99999
  let priceMax = 0
  range.forEach((p) => {
    if (p.total > priceMax) priceMax = p.total
    if (p.total < priceMin) priceMin = p.total
  })

  // Going up to red for lower prices than 0.9 SEk is silly.
  // This caps the color scale so that it's green up to a resonable level.
  if (priceMax < 0.9) {
    priceMax = 0.9
  }

  const span = priceMax - priceMin
  // degrees hue per unit of price, depends on the price range
  const degPerUnit = (hueStart - hueEnd) / span
  const normalizedPrice = price - priceMin
  const degrees = normalizedPrice * degPerUnit

  let hue = Math.floor(hueStart - degrees)

  // Cap the hue to the limits
  if (hue > hueStart) hue = hueStart
  if (hue < hueEnd) hue = hueEnd

  return new HSB(hue, 100, 30)
}

// returns saturation of light on a linear scale up to 11 kW (100% saturation)
export function getUsageSaturation(power: number): number {
  let sat = (power / 11000) * 100
  if (sat > 100) {
    sat = 100
  }
  return sat
}
