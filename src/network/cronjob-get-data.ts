import { Injectable } from '@nestjs/common'
import { NestSchedule, Cron } from 'nest-schedule'
import { NetworkService } from './network.service'
import * as snmp from 'snmp-native'
import { getOs, getUpTime, getCpu, getMemory, getTemperature, getInbound, getOutbound,
  getInterfaceStatus, getInterface } from './utils/get-data.utils'
import { DEVICE_IP, DEVICE_NAME } from 'src/const/app.const'

@Injectable()
export class CronjobGetData extends NestSchedule {
  constructor(
    private readonly networkService: NetworkService
  ) {
    super()
  }

  @Cron('10 * * * *')
  async cronjob() {
    // const deviceIp = ['192.168.10.2']
    // const deviceName = ['test']
    // deviceIp.forEach(async (ip, index) => {
    //   await this.getDeviceData(ip, deviceName[index])
    // })
    DEVICE_IP.forEach(async (ip, index) => {
      await this.getDeviceData(ip, DEVICE_NAME[index])
    })
  }

  private async getDeviceData(deviceIp: string, deviceName: string): Promise<void> {
    const device = new snmp.Session({ host: deviceIp, community: 'public' })
    const result = await Promise.all([
      getOs(device),
      getUpTime(device),
      getCpu(device),
      getMemory(device),
      getTemperature(device),
      getInbound(device),
      getOutbound(device),
      getInterfaceStatus(device),
      getInterface(device)
    ])
    const deviceDataPayload = {
      ip: deviceIp,
      os: result[0],
      upTime: result[1],
      cpu: result[2],
      memory: result[3],
      temperature: result[4]
    }
    await Promise.all([
      this.networkService.setDeviceData(deviceName, deviceDataPayload),
      this.setInterface(deviceName, {
        interfaceName: result[8].interfacePort,
        interfaceOid: result[8].interfaceOid,
        interfaceStatus: result[7],
        inbounds: result[5],
        outbounds: result[6]
      }),
      this.setTraffic(deviceName, result[5], result[6])
    ])
  }

  private async setInterface(deviceName: string, interfaceData: any): Promise<void> {
    const { interfaceName, interfaceOid, interfaceStatus, inbounds, outbounds } = interfaceData
    interfaceName.forEach(async (nameValue: string, index: number) => {
      const name = nameValue.replace(/\//g, '-')
      const interfaceDataPayload = {
        oid: interfaceOid[index],
        status: interfaceStatus[index],
        inbound: inbounds[index],
        outbound: outbounds[index]
      }
      await this.networkService.setDeviceInterface(deviceName, name, interfaceDataPayload)
    })
  }

  private async setTraffic(deviceName: string, inbound: any, outbound: any): Promise<void> {
    let inboundTotal = 0
    let outboundTotal = 0
    inbound.forEach((value, index) => {
      inboundTotal += value
      outboundTotal += outbound[index]
    })
    await Promise.all([
      this.networkService.setDeviceTraffic(deviceName, inboundTotal, outboundTotal),
      this.setSpeed(deviceName, inboundTotal, outboundTotal)
    ])
  }

  private async setSpeed(deviceName: string, inbound: any, outbound: any): Promise<void> {
    const speed = inbound + outbound
    await this.networkService.setDeviceSpeed(deviceName, speed)
  }
}
