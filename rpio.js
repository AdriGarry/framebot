// const Gpio = require('onoff').Gpio;

const rpio = require('rpio');
//		{ "id": "eye", "pin": 14, "direction": "out" },

// "id": "ok",
// "pin": 20,
// "direction": "in",
// "edge": "rising",
// "options": { "persistentWatch": true, "debounceTimeout": 500 }

const led = { EYE: 8 };
rpio.open(led.EYE, rpio.OUTPUT, rpio.LOW);

/*
 * The sleep functions block, but rarely in these simple programs does
 * one care about that.  Use a setInterval()/setTimeout() loop instead
 * if it matters.
 */
for (var i = 0; i < 5; i++) {
	/* On for 1 second */
	rpio.write(led.EYE, rpio.HIGH);
	rpio.sleep(1);

	/* Off for half a second (500ms) */
	rpio.write(led.EYE, rpio.LOW);
	rpio.msleep(500);
}
