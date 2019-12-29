#!/usr/bin/env node

console.log('rfxcom.js');

var rfxcom = require('rfxcom');
var rfxtrx = new rfxcom.RfxCom('/dev/ttyUSB0', { debug: true }),
	transmitter = new rfxcom.Transmitter(rfxtrx, null);

rfxtrx.on('receive', function(evt) {
	console.log('=>received:');
	console.log(evt);
	console.log(evt.toString());
	console.log(Buffer.from(evt).toString('hex'));
});

rfxtrx.initialise(function() {
	console.log('Device initialised');
});

// const ON_HEX = '0b11000001f4bf8e02010f60'; //ON:  00 00 01 F4 BF 8E 02 01 0F 60
//const OFF_HEX = '0b11000101f4bf8e02000060'; //OFF: 00 01 01 F4 BF 8E 02 00 00 60
const ON_HEX = [0x0b, 0x11, 0x00, 0x00, 0x01, 0xf4, 0xbf, 0x8e, 0x02, 0x01, 0x0f, 0x60];
const OFF_HEX = [0x0b, 0x11, 0x00, 0x01, 0x01, 0xf4, 0xbf, 0x8e, 0x02, 0x00, 0x00, 0x50];

setTimeout(() => {
	// let lighting2 = new rfxcom.Lighting2(rfxtrx, rfxcom.lighting1.CHACON);
	// lighting2.switchOn('0b11000001f4bf8e02010f60/1');
	//lighting2.switchOff('0x19AC8AA/1');
}, 5000);

var bool = true;
setInterval(() => {
	if (bool) sendRaw(ON_HEX);
	else sendRaw(OFF_HEX);
	bool = !bool;
}, 5000);

function sendRaw(raw) {
	console.log('sending:', raw);
	// raw = Buffer.from(raw);
	transmitter.sendRaw(0x7f, 0x62, raw);
}
