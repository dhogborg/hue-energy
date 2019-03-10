import { HueApi, lightState } from 'node-hue-api'

import { config } from './config'
import { HSB } from './lib/hue'
import * as tibber from './lib/tibber'
import * as middelwares from './middelwares'
import { startPriceUpdate } from './middelwares/price'
import { startUsageUpdate } from './middelwares/usage'

const api = new HueApi(config.hueHost, config.hueUser)

export type Middleware = (hsb: HSB) => HSB
export interface Store {
  power?: number
  priceData?: {
    range: tibber.PriceData[]
    current: tibber.PriceData
  }
}
const store: Store = {}

class HueEnergy {
  middlewareStack: Middleware[]

  constructor() {
    this.middlewareStack = []
  }

  use(middleware: Middleware): void {
    this.middlewareStack.push(middleware)
  }

  async update() {
    let hsb = await this.getLightState()
    this.middlewareStack.forEach((m) => {
      hsb = m(hsb)
    })

    this.updateLightState(hsb)
  }

  async getLightState(): Promise<HSB> {
    const light = await api.getLightStatus(config.targetLight)
    const hsb = new HSB(0, 0, 0)
    hsb.setPhilipsHSB(light.state.hue, light.state.sat, light.state.bri)
    return hsb
  }

  updateLightState(hsb: HSB) {
    console.log(
      'Setting light state to hsb:',
      Math.floor(hsb.h),
      Math.floor(hsb.s),
      Math.floor(hsb.b)
    )
    let state = lightState
      .create()
      .hsb(hsb.h, hsb.s, hsb.b)
      .bri(hsb.getPhilipsHSB().b)

    api.setLightState(config.targetLight, state)
  }
}

export const hueEnergy = new HueEnergy()

startUsageUpdate(store)
startPriceUpdate(store)

hueEnergy.use(middelwares.newPriceMiddleware(store))
hueEnergy.use(middelwares.newUsageMiddleware(store))
hueEnergy.use(middelwares.newIdleDetector(store))
