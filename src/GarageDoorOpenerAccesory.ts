import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SuplaPlatform } from './platform';
import { DoorState, SuplaDirectLinkRequestHandler } from './SuplaDirectLinkRequestHandler';
import { SuplaDeviceContext } from './SuplaDeviceContext';

export class GarageDoorOpenerAccesory {
  private service: Service;

  constructor(
        private readonly platform: SuplaPlatform,
        private readonly accessory: PlatformAccessory,
        private readonly context: SuplaDeviceContext,
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
  }

  async handleCurrentDoorStateGet(): Promise<CharacteristicValue> {
    const host = this.platform.config.host;
    const id = this.context.directLinkId;
    const password = this.context.password;
    const doorState = await SuplaDirectLinkRequestHandler.getDoorState(host, id, password);
    const state = doorState === DoorState.OPEN
      ? this.platform.Characteristic.TargetDoorState.OPEN : this.platform.Characteristic.TargetDoorState.CLOSED;
    return state;
  }

  async handleTargetDoorStateGet(): Promise<CharacteristicValue> {
    const host = this.platform.config.host;
    const id = this.context.directLinkId;
    const password = this.context.password;
    const doorState = await SuplaDirectLinkRequestHandler.getDoorState(host, id, password);
    const state = doorState === DoorState.OPEN
      ? this.platform.Characteristic.TargetDoorState.OPEN : this.platform.Characteristic.TargetDoorState.CLOSED;
    return state;
  }

  async handleTargetDoorStateSet(value: CharacteristicValue) {
    const host = this.platform.config.host;
    const id = this.context.directLinkId;
    const password = this.context.password;
    SuplaDirectLinkRequestHandler.setDoorState(host, id, password);
    setTimeout(() => {
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentDoorState,
        this.service.getCharacteristic(this.platform.Characteristic.TargetDoorState).value);
    }, 1000);
  }

  async handleObstructionDetectedGet(): Promise<CharacteristicValue> {
    const state = 0;
    return state;
  }

}