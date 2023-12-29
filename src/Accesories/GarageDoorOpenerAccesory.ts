import {CharacteristicValue, PlatformAccessory, Service} from 'homebridge';
import {SuplaPlatform} from '../platform';

import {SuplaChannelContext} from '../Heplers/SuplaChannelContext';

export class GarageDoorOpenerAccesory {
  private service: Service;
  private state = this.platform.Characteristic.CurrentDoorState.CLOSED;

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
              this.platform.log.info(`Door ${this.context.channelCaption} state changed to ${message.toString()}`);
              this.state = message.toString() === 'true'
                ? this.platform.Characteristic.CurrentDoorState.CLOSED : this.platform.Characteristic.CurrentDoorState.OPEN;
              this.service.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.state);
            }
          });
        }, 3000);
  }

  async handleCurrentDoorStateGet(): Promise<CharacteristicValue> {
    return this.state;
  }

  async handleTargetDoorStateGet(): Promise<CharacteristicValue> {
    return this.state;
  }

  async handleTargetDoorStateSet() {
    if (this.state === this.platform.Characteristic.CurrentDoorState.CLOSED) {
      this.platform.MqttClient.client.publish(
        `${this.context.topic}/execute_action`,
        'open');
    } else {
      this.platform.MqttClient.client.publish(
        `${this.context.topic}/execute_action`,
        'close');
    }
    setTimeout(() => {
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.state);
    }, 300);
  }

  async handleObstructionDetectedGet(): Promise<CharacteristicValue> {
    return 0;
  }

}