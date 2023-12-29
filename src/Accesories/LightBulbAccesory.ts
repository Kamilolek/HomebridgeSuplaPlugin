import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SuplaPlatform } from '../platform';

import {SuplaChannelContext} from '../Heplers/SuplaChannelContext';

export class LightAccesory {
  private service: Service;
  private state = false;

  constructor(
        private readonly platform: SuplaPlatform,
        private readonly accessory: PlatformAccessory,
        private readonly context: SuplaChannelContext,
  ) {
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
          .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Supla')
          .setCharacteristic(this.platform.Characteristic.Model, 'LightController');

        this.service = this.accessory.getService(this.platform.Service.Lightbulb)
            || this.accessory.addService(this.platform.Service.Lightbulb);

        this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);

        this.service.getCharacteristic(this.platform.Characteristic.On)
          .onGet(this.handleOnGet.bind(this))
          .onSet(this.handleOnSet.bind(this));

        setTimeout(() => {
          this.platform.MqttClient.client.subscribe(`${this.context.topic}/state/on`);
          this.platform.MqttClient.client.on('message', (topic, message) => {
            if (topic === `${this.accessory.context.device.topic}/state/on`){
              this.platform.log.info(`Light ${this.context.channelCaption} state changed to ${message.toString()}`);
              this.state = message.toString() === 'true';
              this.service.updateCharacteristic(this.platform.Characteristic.On, this.state);
            }
          });
        }, 3000);
  }

  async handleOnGet(): Promise<CharacteristicValue> {
    return this.state;
  }

  async handleOnSet(value: CharacteristicValue) {
    this.platform.MqttClient.client.publish(
      `${this.accessory.context.device.topic}/set/on`,
      value.toString());
    setTimeout(() => {
      this.service.updateCharacteristic(this.platform.Characteristic.On, this.state);
    }, 300);
  }
}