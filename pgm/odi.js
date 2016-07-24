#!/usr/bin/env node
var os = require("os");
console.log('>> Odi started in normal mode...   :)');

var Gpio = require('onoff').Gpio;
var gpioPins = require('./lib/gpioPins.js');
var leds = require('./lib/leds.js');
leds.activity(); // Initialisation du temoin d'activite 1/2
//leds.blink({leds: ['nose'], speed: 300, loop: 3}); // Start led sequence

var spawn = require('child_process').spawn;
var odiStartupSound = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'odi', 'noLeds']);

// leds.allLedsOn();

var buttons = require('./lib/buttons.js');
// leds.allLedsOff();
var CronJob = require('cron').CronJob;
var jobs = require('./lib/jobs.js');
var utils = require('./lib/utils.js');
var service = require('./lib/service.js');
var voiceMail = require('./lib/voiceMail.js');
var tts = require('./lib/tts.js');
var _server = require('./lib/server.js');

// Sequence led de start
//leds.blinkLed(100, 300); // Sequence led de start

var mode = process.argv[2]; // Recuperation des arguments
//leds.activity(); // Initialisation du temoin d'activite 1/2

/*setTimeout(function(){
	leds.clearLeds();
	led.write(1);
	eye.write(0);
}, 500);*/
/*setInterval(function(){
	leds.blinkLed(400, 0.7);
}, 3000);*/

new CronJob('*/3 * * * * *', function(){
	// leds.blinkLed(300, 1); // Initialisation du temoin d'activite 2/2
	leds.blink({leds: ['nose'], speed: 100, loop: 1}); // Initialisation du temoin d'activite 2/2
}, null, 0, 'Europe/Paris');

_server.startUI(mode);

jobs.setBackgroundJobs(); // Demarrage des taches de fond

buttons.getEtat(function(modeValue){ // Demarrage de l'horloge
	if(modeValue){
		jobs.startClock(true);
	}else{
		jobs.startClock(false);
	}
});

jobs.setAlarms(); // Initialisation des alarmes
jobs.setAutoLifeCycle();

new CronJob('*/10 * * * * *', function(){ // Initialisation synchronisation remote
	// remote.synchro();//mode
	remote.trySynchro();
}, null, 0, 'Europe/Paris');


setTimeout(function(){
	voiceMail.checkVoiceMail();
}, 6000);

voiceMail.voiceMailFlag(); // A initialiser dans checkVoiceMail()

// ------------------------//
// ----- TEST SECTION -----//
// ------------------------//

setTimeout(function(){
	// tts.speak('fr', 'Leonard le cafard, ou es tu ?:1');
	// var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', '13Heures']);
}, 2000);

new CronJob('*/5 * * * * *', function(){
	leds.blink({
		leds: ['belly','eye', 'satellite', 'nose'],
		speed: Math.random() * (200 - 50) + 50,
		loop: 4
	});
}, null, 0, 'Europe/Paris'); // Switch true/false !



// var player = require('player');
/*var fs = require('fs');
fs.readdir('/home/pi/odi/mp3/exclamation', function(err, files){
	if(err) return;
	files.forEach(function(f) {
		console.log('Files: ' + f);
	});
});*/




//Create function to get CPU information
function cpuAverage() {
	//Initialise sum of idle and time of cores and fetch CPU info
	var totalIdle = 0, totalTick = 0;
	var cpus = os.cpus();

	//Loop through CPU cores
	for(var i = 0, len = cpus.length; i < len; i++) {
		//Select CPU core
		var cpu = cpus[i];

		//Total up the time in the cores tick
		for(type in cpu.times) {
			totalTick += cpu.times[type];
		}

		//Total up the idle time of the core
		totalIdle += cpu.times.idle;
	}

	//Return the average Idle and Tick times
	return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
}

//Grab first CPU Measure
var startMeasure = cpuAverage();

//Set delay for second Measure
setTimeout(function(){

	//Grab second Measure
	var endMeasure = cpuAverage(); 

	//Calculate the difference in idle and total time between the measures
	var idleDifference = endMeasure.idle - startMeasure.idle;
	var totalDifference = endMeasure.total - startMeasure.total;

	//Calculate the average percentage CPU usage
	var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);

	//Output result to console
	console.log(percentageCPU + "% CPU Usage.");
}, 100);