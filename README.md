<p align="center">

<img src="https://github.com/homebridge/branding/raw/latest/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>

<span align="center">

# Homebridge Supla Plugin

[![npm](https://img.shields.io/npm/v/homebridge-supla-plugin.svg)](https://www.npmjs.com/package/homebridge-supla-plugin) [![npm](https://img.shields.io/npm/dt/homebridge-supla-plugin.svg)](https://www.npmjs.com/package/homebridge-supla-plugin)

</span>

This is an accessory plugin for Supla devices. It allows you to control your Supla devices with HomeKit and Siri.

### How it works

This plugin uses the mqtt protocol to communicate with the Supla server. It subscribes to the topics of the devices you want to control and publishes the commands you send to the devices.


### How to use

1. Install the plugin
```shell
$ npm i homebridge-supla-plugin
```
2. Configure the plugin. You can find your MQTT credentials in the [Supla Cloud](https://cloud.supla.org/).
3. Restart Homebridge
4. Plugin will automatically discover your devices and add them to HomeKit

