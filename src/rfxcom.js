#!/usr/bin/env node

const rfxcom = require('rfxcom');
const rfxtrx = new rfxcom.RfxCom('/dev/ttyUSB0', { debug: true });

rfxtrx.on('receive', function(evt) {
	logEvt(evt);
});

function logEvt(evt) {
	console.log(Buffer.from(evt).toString('hex'));
	plugBPowerOffCallback();
}

var ok = false;

rfxtrx.initialise(function() {
	console.log('Device initialised\n');
	ok = true;
});

const plug = new rfxcom.Lighting2(rfxtrx, rfxcom.lighting2.AC);
const PLUG_A_ID = '0x01F4BF8E/1';
const PLUG_B_ID = '0x01F4BF8E/2';
const PLUG_C_ID = '0x01F4BF8E/3';

function plugBPowerOffCallback() {
	if (ok) {
		console.log('\n------plugBPowerOffCallback');
		setTimeout(() => {
			plug.switchOn(PLUG_B_ID);
			setTimeout(() => {
				plug.switchOff(PLUG_B_ID);
			}, 5000);
		}, 3000);
	}
}
