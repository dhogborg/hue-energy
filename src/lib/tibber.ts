import fetch, { RequestInit } from 'node-fetch'

import { config } from '../config'

export async function getPrice() {
  let query = `
  {
    viewer {
      homes {
        currentSubscription{
          priceInfo{
            current{
              startsAt,
              total,
            },
            range(resolution: HOURLY, last: 24) {
              nodes {
                total
                startsAt
              }
            }
          }
        }
      }
    }
  }
  `
  const result = await doRequest<PriceResult>(query)
  return result.viewer.homes[0].currentSubscription.priceInfo
}

export interface PriceData {
  startsAt: string
  total: number
}

interface PriceResult {
  viewer: {
    homes: {
      currentSubscription: {
        priceInfo: {
          current: PriceData
          range: {
            nodes: PriceData[]
          }
        }
      }
    }[]
  }
}

async function doRequest<T>(query: string) {
  const init: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + config.tibberToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
    }),
  }
  try {
    let response = await fetch('https://api.tibber.com/v1-beta/gql', init)
    if (response.status != 200) {
      throw new Error(`${response.status} ${response.statusText}`)
    }

    let result: GQLResponse<T> = await response.json()
    return result.data
  } catch (err) {
    console.log(err)
    throw new Error('Query error: ' + err)
  }
}

export enum Interval {
  Hourly = 'HOURLY',
  Daily = 'DAILY',
  Monthly = 'MONTLY',
}

interface GQLResponse<T = any> {
  data: T
}
