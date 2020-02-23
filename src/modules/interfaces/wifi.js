#!/usr/bin/env node
'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js'),
	WIFI_NETWORK_LIST = require(Core._SECURITY + 'credentials.json').wifi;

const piWifi = require('pi-wifi');

module.exports = {
	cron: {
		base: [{ cron: '0 45 6 * * *', flux: { id: 'interface|rfxcom|send', data: { device: 'plugB', value: true } } }]
	}
};

Core.flux.interface.wifi.subscribe({
	next: flux => {
		if (flux.id == 'connect') {
			connect(flux.value);
		} else if (flux.id == 'disconnect') {
			disconnect();
		} else {
			Core.error('unmapped flux in Wifi interface', flux, false);
		}
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	keepOnline();
});

function keepOnline() {
	log.info('keepOnline');
	setInterval(() => {
		Utils.testConnection().catch(() => {
			log.warn("I'm not connected to the internet!");
			connectIfAvailable();
		});
	}, 60 * 1000);
}

function scanNetworks() {
	return new Promise((resolve, reject) => {
		piWifi.scan(function(err, networks) {
			if (err) {
				Core.error('Wifi scan error', err.message);
				reject(err);
			}
			let availableNetworksId = [];
			networks.forEach(network => {
				availableNetworksId.push(network.ssid);
			});
			log.debug('Detected networks:', availableNetworksId);
			resolve(networks);
		});
	});
}

async function connectIfAvailable() {
	let availableNetworks = await scanNetworks();
	let networkToConnect = null;
	availableNetworks.forEach(network => {
		Object.keys(WIFI_NETWORK_LIST).forEach(knownNetworkId => {
			if (WIFI_NETWORK_LIST[knownNetworkId].ssid === network.ssid) {
				networkToConnect = WIFI_NETWORK_LIST[knownNetworkId];
				return;
			}
		});
	});
	if (networkToConnect) connect(networkToConnect);
	else log.warn('No known wifi network available!');
}

function connect(wifi) {
	log.info('connecting to wifi ' + wifi.ssid + '...');
	piWifi.connect(wifi.ssid, wifi.password, function(err) {
		if (err) {
			Core.error('Wifi connection error', err.message);
			return;
		}
		log.info('Successfully connected to wifi', wifi.ssid);
	});
}

// Deprecated ?
function isConnected() {
	return new Promise((resolve, reject) => {
		let connected = false,
			result = [];
		Object.keys(WIFI_NETWORK_LIST).forEach(indice => {
			piWifi.check(WIFI_NETWORK_LIST[indice].ssid, function(err, res) {
				if (err) {
					reject(err);
				}
				result.push(res);
				if (result.connected) connected = true;
			});
		});
		if (connected) resolve(result);
		else reject(result);
	});
}
