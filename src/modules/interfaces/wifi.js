#!/usr/bin/env node
'use strict';

const wifi = require('node-wifi');

const { Core, Flux, Logger, Observers, Utils } = require('./../../api');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [{ id: 'end', fn: null }];

Observers.attachFluxParseOptions('interface', 'wifi', FLUX_PARSE_OPTIONS);

// Initialize wifi module
// Absolutely necessary even to set interface to null
wifi.init({
  iface: null //'wlan0' // network interface, choose a random wifi interface if set to null
});

wifi.scan((error, networks) => {
  if (error) {
    log.error(error);
  } else {
    log.test(networks);
    /*
         networks = [
             {
               ssid: '...',
               bssid: '...',
               mac: '...', // equals to bssid (for retrocompatibility)
               channel: <number>,
               frequency: <number>, // in MHz
               signal_level: <number>, // in dB
               quality: <number>, // same as signal level but in %
               security: 'WPA WPA2' // format depending on locale for open networks in Windows
               security_flags: '...' // encryption protocols (format currently depending of the OS)
               mode: '...' // network mode like Infra (format currently depending of the OS)
             },
             ...
         ];
         */
  }
});

wifi.getCurrentConnections((error, currentConnections) => {
  if (error) {
    log.error(error);
  } else {
    log.test(currentConnections);
    /*
     // you may have several connections
     [
         {
             iface: '...', // network interface used for the connection, not available on macOS
             ssid: '...',
             bssid: '...',
             mac: '...', // equals to bssid (for retrocompatibility)
             channel: <number>,
             frequency: <number>, // in MHz
             signal_level: <number>, // in dB
             quality: <number>, // same as signal level but in %
             security: '...' //
             security_flags: '...' // encryption protocols (format currently depending of the OS)
             mode: '...' // network mode like Infra (format currently depending of the OS)
         }
     ]
     */
  }
});
