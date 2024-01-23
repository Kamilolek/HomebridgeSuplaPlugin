import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { GarageDoorOpenerAccesory } from './Accesories/GarageDoorOpenerAccesory';
import { LightAccesory } from './Accesories/LightBulbAccesory';
import * as fs from 'fs';
import {SuplaMqttClient} from './Heplers/SuplaMqttClient';
import {RGBLightAccesory} from './Accesories/RGBLightBulbAccesory';
import {WicketAccesory} from './Accesories/WicketAccesory';
import {SuplaMqttClientContext} from './Heplers/SuplaMqttClientContext';
import {SuplaChannelContext} from './Heplers/SuplaChannelContext';
import {DimmerAccessory} from './Accesories/DimmerAccessory';


/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class SuplaPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public MqttClient!: SuplaMqttClient;

  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');

      this.discoverDevices();

      const mqttSettings = this.config as unknown as SuplaMqttClientContext;
      this.MqttClient = new SuplaMqttClient(mqttSettings, this.log);
      this.MqttClient.discoverChannelsAsync().then((channels) => {
        const configPath = this.api.user.configPath();
        const config = JSON.parse(fs.readFileSync(configPath).toString());
        config.platforms.find((platform) => platform.platform === 'SuplaPlatform').channels = JSON.stringify(channels);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        this.log.info('Channels discovered and saved to config file');
      });
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  discoverDevices() {
    let channels: Array<SuplaChannelContext> = [];
    try {
      channels = JSON.parse(this.config.channels) as Array<SuplaChannelContext>;
    } catch (e) { /* empty */ }
    this.log.info('Channels discovered:', channels.length);
    // loop over the discovered devices and register each one if it has not already been registered
    for (const channel of channels) {
      const uuid = this.api.hap.uuid.generate(channel.channelCaption);

      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

        switch (channel.channelFunction) {
          case 'CONTROLLINGTHEGARAGEDOOR':
            this.log.info('Restoring dsdssd accessory from cache:', existingAccessory.displayName);
            new GarageDoorOpenerAccesory(this, existingAccessory, channel);
            break;
          case 'CONTROLLINGTHEGATE':
            new GarageDoorOpenerAccesory(this, existingAccessory, channel);
            break;
          case 'LIGHTSWITCH':
            new LightAccesory(this, existingAccessory, channel);
            break;
          case 'CONTROLLINGTHEGATEWAYLOCK':
            new WicketAccesory(this, existingAccessory, channel);
            break;
          case 'RGBLIGHTING':
            new RGBLightAccesory(this, existingAccessory, channel);
            break;
          case 'DIMMER':
            new DimmerAccessory(this, existingAccessory, channel)
            break;
          default:
        }
      } else {
        this.log.info('Adding new accessory:', channel.channelCaption);

        const accessory = new this.api.platformAccessory(channel.channelCaption, uuid);

        accessory.context.device = channel;
        switch (channel.channelFunction) {
          case 'CONTROLLINGTHEGARAGEDOOR':
            this.log.info('Restoring dsdssd accessory from cache:', accessory.displayName);
            new GarageDoorOpenerAccesory(this, accessory, channel);
            break;
          case 'CONTROLLINGTHEGATE':
            new GarageDoorOpenerAccesory(this, accessory, channel);
            break;
          case 'LIGHTSWITCH':
            new LightAccesory(this, accessory, channel);
            break;
          case 'CONTROLLINGTHEGATEWAYLOCK':
            new WicketAccesory(this, accessory, channel);
            break;
          case 'RGBLIGHTING':
            new RGBLightAccesory(this, accessory, channel);
            break;
          case 'DIMMER':
            new DimmerAccessory(this, accessory, channel)
            break;
          default:
        }

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
    const accessoriesToRemove =
      this.accessories.filter(accessory =>
        !channels.some(channel => accessory.UUID === this.api.hap.uuid.generate(channel.channelCaption)));
    for (const accessory of accessoriesToRemove) {
      this.log.info('Removing existing accessory from cache:', accessory.displayName);
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }
}
