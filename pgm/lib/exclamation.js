#!/usr/bin/env node
// Module de gestion des leds

var spawn = require('child_process').spawn;
var Gpio = require('onoff').Gpio;
var leds = require('./leds.js');
var tts = require('./tts.js');

var exclamation2Rappels = function(){
	console.log('Exclamation [2 recall]!');
	leds.blinkEye((Math.floor(Math.random()*5) + 1)*100, 2);
	var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/exclamation.sh']);
	var rdm = Math.floor(Math.random()*60) + 10;
	console.log('Next sounds: ' + rdm + ' sec & ' + Math.floor(rdm*10/60) + ' min');
	setTimeout(function(){ eye.write(0); }, 2000);
	setTimeout(function(){
		console.log('Exclamation recall 1');
		leds.blinkEye((Math.floor(Math.random()*5) + 1)*100, 2);
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/exclamation.sh']);
		setTimeout(function(){ eye.write(0); }, 2000);
	}, rdm * 3 * 1000);
	setTimeout(function(){
		console.log('Exclamation recall 2');
		leds.blinkEye((Math.floor(Math.random()*5) + 1)*100, 2);
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/exclamation.sh']);
		setTimeout(function(){ eye.write(0); }, 2000);
	}, rdm * 10 * 1000);
};
exports.exclamation2Rappels = exclamation2Rappels;

/** Fonction Exclamtion en boucle 1 min */
var exclamationLoop = function(){
	console.log('Exclamation LOOP !!');
	setTimeout(function(){
		tts.speak('','');
	}, 2000);
	var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/exclamation.sh', 'LOOP']);
};
exports.exclamationLoop = exclamationLoop;

var exclamationRdmDelayLoop = function(){ // Methode a Supprimer ???
	console.log('Exclamation Loop With Random Delay !');
	var exclRdmLp;
	var rdmDelay;
	(function loop() {
		setTimeout(function() {
			rdmDelay = Math.floor(Math.random() * 120); //400
			console.log('[rdmDelay] Next Exclamation -> '
				+ Math.round((rdmDelay/60)*10)/10 + ' min (' + rdmDelay + ' sec)');
			leds.blinkEye((Math.floor(Math.random()*5) + 1)*100, 2);
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/exclamation.sh']);
			if(etat.readSync() == 1){
				console.log('exclamationRdmDelayLoop... LET\'S GO ON !!!');
				loop();
			}
			else{
				console.log('Not Going ON');
			}
		}, rdmDelay * 1000);
	}());	
};
exports.exclamationRdmDelayLoop = exclamationRdmDelayLoop;
