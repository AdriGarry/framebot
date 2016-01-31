#!/usr/bin/env node
// Module Party

var spawn = require('child_process').spawn;
var tts = require('./tts.js');
var service = require('./service.js');

var date = new Date();
var hour = date.getHours();
var pastHour = hour;
var minRing = true;

var setParty = function(test){
	console.log('LET\'S START PARTY !!  <|:-)  <|:-)  <|:-) \ntest: : ' + test);
	if(test == true){
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'test']);
			console.log('test = ' + test);
			//tts.speak('en', 'test mode');
			//tts.speak('en', 'LET\'S START PARTY IN TEST MODE!!');
	}/* else {
			tts.speak('en', 'LET\'S START PARTY !!');
	}*/
	setTimeout(function(){
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/soundsParty.sh', 'startParty']);
	}, 3000);

	setInterval(function(test){
		console.log('IT\'S PARTY TIME !!  <|:-) \ntest: : ' + test);
		var date = new Date();
		var day = date.getDay();
		var hour = date.getHours();
		var min = date.getMinutes();
		var sec = date.getSeconds();
		if(test == true){
			test = min % 10;
			console.log('/!\\ /!\\  TEST PARTY !!  /!\\ /!\\  _min = ' + test);			
		} else { test = 0; }
		if((hour == 23 && min == 0 || test == 3) && sec < 16) {
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/soundsParty.sh', '23h']);
			console.log('23h...');
		} else if((hour == 23 && min == 30 || test == 4) && sec < 16) {
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/soundsParty.sh', '23h30']);
			console.log('23h30...');
		} else if((hour == 23 && min == 59 || test == 5) && sec < 16) {
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/soundsParty.sh', 'compteARebours']);
			console.log('Compte a rebours setup');
			setTimeout(function(){
				var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/soundsParty.sh', 'compteARebours2']);
				console.log('Compte a rebours start');
			}, 2000);
		} else if((hour == 0 && min == 13|| test == 6) && sec < 16) {
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/soundsParty.sh']);
			console.log('De Par mes circuits et transistors !');
			setTimeout(function(){
				var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/soundsParty.sh', 'puisJeExprimer']);
				console.log('Puis-je m\'exprimer ?');
			}, 2000);
			setTimeout(function(){
				var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/soundsParty.sh', 'discours']);
				console.log('Discours...');
			}, 8000);
		} else if((min % 11 == 0 || test == 1) && sec < 16) {
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/soundsParty.sh']);
			console.log('B Par mes circuits et transistors !');
		} else if((min % 12 == 0 || test == 2) && sec < 16) {
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/soundsParty.sh', 'pasAssezSaoul']);
			console.log('Pas assez saoul ?!');
		} else if((min % 13 == 0) && sec < 16) {
			service.weather();
		}
	}.bind(this, test), 15*1000);
};
exports.setParty = setParty;
