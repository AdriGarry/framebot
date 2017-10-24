#!/usr/bin/env node

// Module de gestion des leds

var spawn = require('child_process').spawn;
var Gpio = require('onoff').Gpio;
/*var leds = require(CORE_PATH + 'modules/leds.js');
var tts = require(CORE_PATH + 'modules/tts.js');*/

module.exports = {
	exclamation: exclamation,
	exclamation2Rappels: exclamation2Rappels,
	exclamationLoop: exclamationLoop,
	exclamationRdmDelayLoop: exclamationRdmDelayLoop,
	russia: russia,
	russiaLoop: russiaLoop
};

function exclamation(){
	console.log('Exclamation !');
	// leds.blinkEye((Math.floor(Math.random()*5) + 1)*100, 2);
	ODI.leds.blink({
		leds: ['eye'],
		speed: Math.random() * (100 - 40) + 40,
		loop: 6
	});
	spawn('sh', ['/home/pi/odi/core/sh/exclamation.sh']);
}

function exclamation2Rappels(){
	console.log('Exclamation [2 recall]!');
	// ODI.leds.blinkEye((Math.floor(Math.random()*5) + 1)*100, 2);
	ODI.leds.blink({
		leds: ['eye'],
		speed: Math.random() * (100 - 40) + 40,
		loop: 6
	});
	spawn('sh', ['/home/pi/odi/core/sh/exclamation.sh']);
	var rdm = Math.floor(Math.random()*60) + 10;
	console.log('Next sounds: ' + rdm + ' sec & ' + Math.floor(rdm*10/60) + ' min');
	setTimeout(function(){ ODI.leds.eye.write(0); }, 2000);
	setTimeout(function(){
		console.log('Exclamation recall 1');
		// leds.blinkEye((Math.floor(Math.random()*5) + 1)*100, 2);
		ODI.leds.blink({
			leds: ['eye'],
			speed: Math.random() * (100 - 40) + 40,
			loop: 6
		});
		spawn('sh', ['/home/pi/odi/core/sh/exclamation.sh']);
		setTimeout(function(){ ODI.leds.eye.write(0); }, 2000);
	}, rdm * 3 * 1000);
	setTimeout(function(){
		console.log('Exclamation recall 2');
		// leds.blinkEye((Math.floor(Math.random()*5) + 1)*100, 2);
		ODI.leds.blink({
			leds: ['eye'],
			speed: Math.random() * (100 - 40) + 40,
			loop: 6
		});
		spawn('sh', ['/home/pi/odi/core/sh/exclamation.sh']);
		setTimeout(function(){ ODI.leds.eye.write(0); }, 2000);
	}, rdm * 10 * 1000);
}

/** Fonction Exclamtion en boucle 1 min */
function exclamationLoop(){
	console.log('Exclamation LOOP !!');
	// ODI.tts.speak('en','Exclamation loop initialised');
	ODI.tts.speak({lg:'en', msg:'Exclamation loop initialised'});
	setTimeout(function(){
		spawn('sh', ['/home/pi/odi/core/sh/exclamation.sh', 'LOOP']);
	}, 5000);
}

function exclamationRdmDelayLoop(){ // Methode a Supprimer ???
	console.log('Exclamation Loop With Random Delay !');
	var exclRdmLp;
	var rdmDelay;
	(function loop() {
		setTimeout(function() {
			rdmDelay = Math.floor(Math.random() * 120); //400
			console.log('[rdmDelay] Next Exclamation -> '
				+ Math.round((rdmDelay/60)*10)/10 + ' min (' + rdmDelay + ' sec)');
			// ODI.leds.blinkEye((Math.floor(Math.random()*5) + 1)*100, 2);
			ODI.leds.blink({
				leds: ['eye'],
				speed: Math.random() * (100 - 40) + 40,
				loop: 6
			});
			spawn('sh', ['/home/pi/odi/core/sh/exclamation.sh']);
			if(etat.readSync() == 1){
				console.log('exclamationRdmDelayLoop... LET\'S GO ON !!!');
				loop();
			}
			else{
				console.log('Not Going ON');
			}
		}, rdmDelay * 1000);
	}());
}

/** Fonction Russian */
function russia(){
	console.log('Russia !');
	// ODI.leds.blinkEye((Math.floor(Math.random()*5) + 1)*100, 2);
	ODI.leds.blink({
		leds: ['eye'],
		speed: Math.random() * (100 - 40) + 40,
		loop: 6
	});
	spawn('sh', ['/home/pi/odi/core/sh/exclamation_russia.sh']);
}

/** Fonction Russian en boucle */
function russiaLoop(){
	console.log('Russia LOOP !!');
	// tts.speak('en','Russia loop initialised');
	ODI.tts.speak({lg:'en', msg:'Russia loop initialised'});
	setTimeout(function(){
		spawn('sh', ['/home/pi/odi/core/sh/exclamation_russia.sh', 'LOOP']);
	}, 5000);
}
