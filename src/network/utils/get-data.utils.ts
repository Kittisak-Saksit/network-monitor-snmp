import { Observable } from 'rxjs'

export async function getOs(device: any): Promise<unknown> {
  const result = new Observable(observer => {
    device.get({ oid: [1, 3, 6, 1, 2, 1, 1, 1, 0] }, (err, varbinds) => {
      observer.next(varbinds[0].value)
      observer.complete()
    })
  })

  return result.toPromise()
}

export async function getUpTime(device: any): Promise<unknown> {
  const result = new Observable(observer => {
    device.get({ oid: [1, 3, 6, 1, 2, 1, 1, 3, 0] }, (err, varbinds) => {
      let sec = Math.floor(varbinds[0].value / 100)
      const hour = Math.floor(sec / 3600)
      sec = sec - ( hour * 3600 )
      const min = Math.floor(sec / 60)
      sec = sec - (min * 60)
      observer.next(`${hour} hours ${min} min ${sec} sec`)
      observer.complete()
    })
  })

  return result.toPromise()
}

export async function getCpu(device: any): Promise<unknown> {
  const result = new Observable(observer => {
    device.get({ oid: [1, 3, 6, 1, 4, 1, 9, 9, 109, 1, 1, 1, 1, 5, 1] }, (err, varbinds) => {
      observer.next(varbinds[0].value)
      observer.complete()
    })
  })

  return result.toPromise()
}

export async function getMemory(device: any): Promise<unknown> {
  const result = new Observable(observer => {
    device.get({ oid: [1, 3, 6, 1, 4, 1, 9, 9, 48, 1, 1, 1, 5, 1] }, (err, varbinds) => {
      observer.next(Math.round(varbinds[0].value / 1048576))
      observer.complete()
    })
  })

  return result.toPromise()
}

export async function getTemperature(device: any): Promise<unknown> {
  const result = new Observable(observer => {
    device.getSubtree({ oid: [1, 3, 6, 1, 4, 1, 9, 9, 13, 1, 3, 1, 3] }, (err, varbinds) => {
      const value = (varbinds.length === 0) ? 'novalue' : varbinds[0].value
      observer.next(value)
      observer.complete()
    })
  })

  return result.toPromise()
}

export async function getInbound(device: any): Promise<unknown> {
  const result = new Observable(observer => {
    const inbound = []
    device.getSubtree({ oid: [1, 3, 6, 1, 2, 1, 2, 2, 1, 10] }, (err, varbinds) => {
      for (const varbind of varbinds) {
        inbound.push(Math.round(varbind.value / 1048576))
      }
      observer.next(inbound)
      observer.complete()
    })
  })

  return result.toPromise()
}

export async function getOutbound(device: any): Promise<unknown> {
  const result = new Observable(observer => {
    const outbound = []
    device.getSubtree({ oid: [1, 3, 6, 1, 2, 1, 2, 2, 1, 16] }, (err, varbinds) => {
      for (const varbind of varbinds) {
        outbound.push(Math.round(varbind.value / 1048576))
      }
      observer.next(outbound)
      observer.complete()
    })
  })

  return result.toPromise()
}

export async function getInterfaceStatus(device: any): Promise<unknown> {
  const result = new Observable(observer => {
    const interfaceStatus = []
    device.getSubtree({ oid: [1, 3, 6, 1, 2, 1, 2, 2, 1, 8] }, (err, varbinds) => {
      for (const varbind of varbinds) {
        const status = (varbind.value === 1) ? 'up' : 'down'
        interfaceStatus.push(status)
      }
      observer.next(interfaceStatus)
      observer.complete()
    })
  })

  return result.toPromise()
}

export async function getInterface(device: any): Promise<unknown> {
  const result = new Observable(observer => {
    const interfacePort = []
    const interfaceOid = []
    device.getSubtree({ oid: [1, 3, 6, 1, 2, 1, 2, 2, 1, 2] }, (err, varbinds) => {
      for (const varbind of varbinds) {
        interfaceOid.push(varbind.oid)
        interfacePort.push(varbind.value)
      }
      observer.next({ interfaceOid, interfacePort })
      observer.complete()
    })
  })

  return result.toPromise()
}
