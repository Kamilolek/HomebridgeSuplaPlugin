import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SuplaPlatform } from './platform';
import { SuplaDirectLinkRequestHandler, LightState } from './SuplaDirectLinkRequestHandler';

export class LightAccesory {
  private service: Service;

  constructor(
        private readonly platform: SuplaPlatform,
        private readonly accessory: PlatformAccessory,
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
  }

  async handleOnGet(): Promise<CharacteristicValue> {
    const host = this.platform.config.host;
    const id = this.accessory.context.device.directLinkId;
    const password = this.accessory.context.device.password;
    const lightState = await SuplaDirectLinkRequestHandler.getLightState(host, id, password);
    return lightState === LightState.ON ? true : false;
  }

  async handleOnSet(value: CharacteristicValue) {
    this.platform.log.debug('Set On:', value);
    const host = this.platform.config.host;
    const id = this.accessory.context.device.directLinkId;
    const password = this.accessory.context.device.password;
    SuplaDirectLinkRequestHandler.setLightState(host, id, password);
  }
}