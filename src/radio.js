#!/usr/bin/env node

'use strict';

console.log('nodejs radio...');

var rpi433 = require('rpi-433-v2'),
	rfSniffer = rpi433.sniffer({
		pin: 2, //Snif on GPIO 2 (or Physical PIN 13)
		debounceDelay: 500 //Wait 500ms before reading another code
	}),
	rfEmitter = rpi433.emitter({
		pin: 0, //Send through GPIO 0 (or Physical PIN 11)
		pulseLength: 350, //Send the code with a 350 pulse length
		protocol: 4 //Set the protocol.
	});

// Receive (data is like {code: xxx, pulseLength: xxx})
rfSniffer.on('data', function(data) {
	console.log('Code received: ' + data.code + ' pulse length : ' + data.pulseLength);
});

// Send
function send() {
	rfEmitter.sendCode(1234, function(error, stdout) {
		//Send 1234
		if (!error) console.log(stdout); //Should display 1234
	});
}

setInterval(function() {
	send();
}, 5000);
