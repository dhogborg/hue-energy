import fetch, { RequestInit } from 'node-fetch'

import { config } from '../config'

let baseUrl = `http://${config.smappeeIP}/gateway/apipublic`

export async function login() {
  return await post(baseUrl + '/logon', config.smapeePassword)
}

// activePower returns the current power usage in watts
export async function activePower(): Promise<number> {
  const result = await post<{ key: string; value: string }[]>(
    baseUrl + '/instantaneous',
    'loadInstantaneous'
  )

  const powers = result
    .filter((node) => {
      return node.key.match('ActivePower')
    })
    .map((node) => parseInt(node.value) / 1000)

  return powers.reduce((prevValue, value) => {
    return prevValue + value
  })
}

async function post<T>(url: string, body: any) {
  const init: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    body: body,
  }

  return doRequest<T>(url, init)
}

async function doRequest<T>(url: string, init: RequestInit): Promise<T> {
  try {
    let response = await fetch(url, init)
    if (response.status != 200) {
      throw new Error(`${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    return result
  } catch (err) {
    console.log(err)
    throw new Error('Request error: ' + err)
  }
}
