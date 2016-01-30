#!/usr/bin/env node
// Module Horloge & Alarmes

var spawn = require('child_process').spawn;
var utils = require('./utils.js');
var fip = require('./fip.js');
var jukebox = require('./jukebox.js');
var tts = require('./tts.js');

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
		}
	}.bind(this, test), 15*1000);
};
exports.setParty = setParty;

var startClock = function(quiet){
	setInterval(function(){
		console.log(quiet);
		date = new Date();
		hour = date.getHours();
		min = date.getMinutes();
		if(pastHour < hour){
			pastHour = hour;
			var cpHour = hour;
			console.log('It\'s ' + hour + ' o\'clock');
			if(hour >= 7 || quiet == false){
				utils.testConnexion(function(connexion){
					if(connexion == true){
						tts.speak('fr', 'Il est ' + hour + ' heures');
					} else {
						// console.error('Erreur test connexion /!\\');
						if(cpHour > 12){
							cpHour = hour - 12;
						} else if(cpHour == 0){
							cpHour = 12;
						}
						var oClock = setInterval(function(){
							console.log('RING BELL ' + cpHour);
							var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/clock.sh']);
							cpHour--;
							if(cpHour < 1){clearInterval(oClock);}
						}, 1100);						
					}
				});
			}
		} else if (min == 35 && (hour >= 7 || quiet == false)){
			console.log('RING BELL HALF HOUR ' + hour + ':' + min);
			var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/clock.sh', 'half']);
			if(cpHour > 12){cpHour = hour - 12};
			tts.speak('en', 'Its ' + hour + ' ' + ' and a half !');
		}
	}, 30*1000);
};
exports.startClock = startClock;

var setAlarms = function(){
	setInterval(function(){
		var date = new Date();
		var day = date.getDay();
		var hour = date.getHours();
		var min = date.getMinutes();
		var sec = date.getSeconds();
		//console.log('Alarms On');
		if(day > 0 && day < 6){
			if(hour == 7 && min == 30){
				console.log('COCORICO !!');
				var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/clock.sh', 'cocorico']);
				if(date.getSeconds() < 26){
					utils.testConnexion(function(connexion){
						setTimeout(function(){
							if(connexion == true){
									console.log('It\'s '+ hour + ':' + min 
										+ ' !!  Let\'s listen the radio :D');
									fip.playFip();
							} else {
								console.log('It\'s '+ hour + ':' + min 
									+ ' !!  Let\'s play some music :D');
								jukebox.loop();
							}
							utils.autoMute('Auto mute Morning');
						}, 3000);
					});
				}
			} else if(hour == 18 && min == 45){
				if(date.getSeconds() < 26){
					utils.testConnexion(function(connexion){
						setTimeout(function(){
							if(connexion == true){
									console.log('It\'s '+ hour + ':' + min 
										+ ' !!  Let\'s listen the radio :D');
									fip.playFip();
							} else {
								console.log('It\'s '+ hour + ':' + min 
									+ ' !!  Let\'s play some music :D');
								jukebox.loop();
							}
							utils.autoMute('Auto mute Evening Fip');
						}, 3000);
					});
				}
			}
		} else {
			if(hour == 12 && min == 0){
				console.log('COCORICO !!');
				var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/clock.sh', 'cocorico']);
				if(date.getSeconds() < 26){
					setTimeout(function(){
						console.log('It\'s '+ hour + ':' + min 
							+ ' !!  Let\'s listen the radio :D');
						fip.playFip();
						utils.autoMute();					
					}, 3000);
				}
			}
		}
		if(hour == 5 && min == 0){
			// console.log('REBOOTING RASPBERRY PI !!');
			// var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/shutdown.sh', 'reboot']);
		} else if(hour == 0 && min == 1){
			tts.speak('fr', 'Un jour de plus vient de s\'achever.');
		}
	}, 30*1000);
};
exports.setAlarms = setAlarms;

var sayTime = function(){
	var date = new Date();
	var hour = date.getHours();
	var min = date.getMinutes();
	if(min == 0){
		tts.speak('fr', 'Il est ' + hour);
	} else {
		tts.speak('fr', 'Il est ' + hour + ' heures et ' + min + ' minutes');
	}
};
exports.sayTime = sayTime;

