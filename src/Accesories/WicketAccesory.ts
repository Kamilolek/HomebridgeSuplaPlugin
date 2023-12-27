import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SuplaPlatform } from '../platform';

import {SuplaChannelContext} from '../Heplers/SuplaChannelContext';

export class WicketAccesory {
  private service: Service;

  constructor(
        private readonly platform: SuplaPlatform,
        private readonly accessory: PlatformAccessory,
        private readonly context: SuplaChannelContext,
  ) {
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
          .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Supla')
          .setCharacteristic(this.platform.Characteristic.Model, 'GarageDoorOpener');

        this.service = this.accessory.getService(this.platform.Service.GarageDoorOpener)
            || this.accessory.addService(this.platform.Service.GarageDoorOpener);

        this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);

        this.service.getCharacteristic(this.platform.Characteristic.CurrentDoorState)
          .onGet(this.handleCurrentDoorStateGet.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.TargetDoorState)
          .onGet(this.handleTargetDoorStateGet.bind(this))
          .onSet(this.handleTargetDoorStateSet.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.ObstructionDetected)
          .onGet(this.handleObstructionDetectedGet.bind(this));

        setTimeout(() => {
          this.platform.MqttClient.client.subscribe(`${this.context.topic}/state/hi`);
          this.platform.MqttClient.client.on('message', (topic, message) => {
            if (topic === `${this.context.topic}/state/hi`) {
              const state = message.toString() === 'true'
                ? this.platform.Characteristic.CurrentDoorState.CLOSED : this.platform.Characteristic.CurrentDoorState.OPEN;
              this.service.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, state);
            }
          });
        }, 3000);
  }

  async handleCurrentDoorStateGet(): Promise<CharacteristicValue> {
    return this.platform.Characteristic.TargetDoorState.CLOSED;
  }

  async handleTargetDoorStateGet(): Promise<CharacteristicValue> {
    return this.platform.Characteristic.TargetDoorState.CLOSED;
  }

  async handleTargetDoorStateSet() {
    this.platform.MqttClient.client.publish(
      `${this.context.topic}/execute_action`,
      'open');
  }

  async handleObstructionDetectedGet(): Promise<CharacteristicValue> {
    const state = 0;
    return state;
  }

}