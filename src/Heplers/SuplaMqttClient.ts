import mqtt, {MqttClient} from 'mqtt';
import {Logger} from 'homebridge';
import {SuplaMqttClientContext} from './SuplaMqttClientContext';
import {SuplaChannelContext} from './SuplaChannelContext';

export class SuplaMqttClient {
  public client: MqttClient;
  // eslint-disable-next-line max-len
  private allowedChanelFunctions = ['CONTROLLINGTHEGARAGEDOOR', 'CONTROLLINGTHEGATE', 'LIGHTSWITCH', 'CONTROLLINGTHEGATEWAYLOCK', 'RGBLIGHTING', 'DIMMER'];
  constructor(
    private readonly context : SuplaMqttClientContext,
    private readonly log : Logger) {
    const options = {
      username: context.username,
      password: context.password,
    };
    this.client = mqtt.connect(`mqtts://${context.host}:${context.port}`, options);

    this.client.setMaxListeners(20);

    this.client.on('connect', () => {
      this.log.info('MQTT client connected');
    });
  }

  public async discoverChannelsAsync() : Promise<Array<SuplaChannelContext>> {
    this.client.subscribe('#', (err) => {
      if (err) {
        this.log.error(err.message);
      }
    });
    const topics : Array<{topic : string; message : string}> = [];
    let process = true;
    this.client.on('message', (topic, message) => {
      topics.push({topic, message: message.toString()});
      // eslint-disable-next-line prefer-const
      let timer;
      clearTimeout(timer);
      timer = setTimeout(() => {
        this.client.unsubscribe('#', (err) => {
          if (err) {
            this.log.error(err.message);
          } else {
            process = false;
          }
        });
      }, 1000);
    });
    while(process) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    const channels : Array<{channelId : string; deviceId : string}> = [];
    topics.forEach((message) => {
      const matches = message.topic.match(/.*\/([0-9]*)\/channels\/([0-9]*)\/.*/);
      if (matches
        && channels.map((channel) => channel.channelId).indexOf(matches[2]) === -1) {
        channels.push({channelId: matches[2], deviceId: matches[1]});
      }
    });
    const result : Array<SuplaChannelContext> = [];
    channels.forEach((channel) => {
      const channelType = topics.find((topic) =>
        // eslint-disable-next-line max-len
        topic.topic === `supla/${this.context.username}/devices/${channel.deviceId}/channels/${channel.channelId}/type`)?.message ?? 'unknown';
      const channelFunction = topics.find((topic) =>
        // eslint-disable-next-line max-len
        topic.topic === `supla/${this.context.username}/devices/${channel.deviceId}/channels/${channel.channelId}/function`)?.message ?? 'unknown';
      const caption = topics.find((topic) =>
        // eslint-disable-next-line max-len
        topic.topic === `supla/${this.context.username}/devices/${channel.deviceId}/channels/${channel.channelId}/caption`)?.message ?? 'unknown';
      const topic = `supla/${this.context.username}/devices/${channel.deviceId}/channels/${channel.channelId}`;
      if (this.allowedChanelFunctions.indexOf(channelFunction) === -1) {
        return;
      }
      result.push(new SuplaChannelContext(topic, channelType, channelFunction, caption));
    });
    return result;
  }
}

