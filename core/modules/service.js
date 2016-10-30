#!/usr/bin/env node

// Module Service

var spawn = require('child_process').spawn;
var fs = require('fs');
var Gpio = require('onoff').Gpio;
var leds = require('./leds.js');
var request = require('request');
var utils = require('./utils.js');
var tts = require('./tts.js');
var exclamation = require('./exclamation.js');
const self = this;

module.exports = {
	weather: weather,
	timeNow: timeNow,
	date: date,
	sayOdiAge: sayOdiAge,
	setTimer: setTimer,
	timeLeftTimer: timeLeftTimer,
	stopTimer: stopTimer,
	randomAction: randomAction,
	adriExclamation: adriExclamation,
	cpuTemp: cpuTemp
}


setTimeout(function(){
	// updateVersionFromGithub();
	tts.speak({voice: 'espeak', msg:'Leonard le cafard, ou es-tu ?'}); // TODO
	tts.speak({voice: 'google', msg:'Attention a toi si je te trouve...'}); // TODO
	tts.speak({voice: 'espeak', msg:'Oui, je vais tenvoyer Bouts !'}); // TODO
	tts.speak({voice: 'google', msg:'Et tu vas passer un sale quart d\'heure !!'}); // TODO
}, 8000);



/** Function to retreive weather info */
var weatherStatus = fs.readFileSync('/home/pi/odi/data/weather.status.properties', 'UTF-8').toString().split('\n');
function weather(){
	request.get({
		// url:'http://weather.yahooapis.com/forecastrss?w=610264&u=c',
		url:'http://xml.weather.yahoo.com/forecastrss?w=610264&u=c',
		headers: {'Content-Type': 'xml'}
	},
	function (error, response, body){
		try{
			if(!error && response.statusCode == 200){
				body = body.split('\n');
				// console.log('body : ' + body);
				var weather = body[28];
				weather = weather.substring(weather.lastIndexOf('code="')+6,weather.lastIndexOf('code="')+8);
				weather = weatherStatus[weather];
				var temp = body[32];
				temp = temp.substring(temp.lastIndexOf(',')+1,temp.lastIndexOf('C'));
				var wind = body[12].toString();
				wind = Math.floor(wind.substring(wind.lastIndexOf('speed="')+7,wind.lastIndexOf('speed="')+10));
				var annonceTemp = 'Meteo Marseille : le temps est ' + weather + ' , il fait ' + temp
					+ ' degres avec ' + (isNaN(wind)?'0':wind) + ' kilometre heure de vent';
				console.log('Service Weather... ' + annonceTemp);
				// tts.speak('fr',annonceTemp);
				tts.speak({lg: 'fr', msg: annonceTemp});
			}else{
				console.log('Can\'t retreive weather informations');
				tts.speak({voice: 'espeak', lg: 'fr', msg: 'Erreur service meteo'});
				console.error('Weather request > response.statusCode : ' + response.statusCode);
				if(error){console.error('Error getting weather info  /!\\ \n' + error);}
			}
		}catch(e){
			console.error(e);
		}
	});
};

/** Function TTS time */
function timeNow(){
	console.log('Service Time...');
	var date = new Date();
	var hour = date.getHours();
	var min = date.getMinutes();
	if(min == 0){
		tts.speak({lg: 'fr', msg: 'Il est ' + hour + ' heure'});
	}else{
		var tmp = 'Il est ' + hour + ' heures et ' + min + ' minutes';
		tts.speak({lg: 'fr', msg: tmp});
	}
};

/** Function to say current date */
const days = fs.readFileSync('/home/pi/odi/data/date.days.properties', 'UTF-8').toString().split('\n');
const months = fs.readFileSync('/home/pi/odi/data/date.months.properties', 'UTF-8').toString().split('\n');
function date(){
	var date = new Date();
	var dayNb = date.getDate();
	if(dayNb == 1) dayNb = 'premier';
	var day = date.getDay();
	var day = days[day];
	var month = date.getMonth();
	var month = months[month];
	var year = date.getFullYear();
	var annonceDate = 'Nous sommes le ' + day + ' ' + dayNb + ' ' + month + ' ' + year;
	console.log('Service Date... ' + annonceDate);
	tts.speak({lg:'fr', msg:annonceDate});
};

/** Function to TTS Odi's age */
var age, years, mouths, birthDay;
function sayOdiAge(){
	age = utils.getOdiAge();
	years = Math.floor(age/365);
	mouths = Math.floor((age%365)/30);
	var rdm = ['Aujourd\'hui, ', 'A ce jour, ', 'A cet instant, ', ''];
	birthDay = rdm[Math.floor(Math.random() * rdm.length)]
	birthDay += 'j\'ai ' + years + ' ans et ' + mouths + ' mois !';// et ' + days + ' jours !';
	console.log('sayOdiAge() \'' + birthDay + '\'')
	tts.speak({lg: 'fr', msg: birthDay});
};

/** Function to set timer */
var time = 0, timer = false;
function setTimer(minutes){
	if(typeof minutes !== undefined && minutes > 1){
		minutes = 60 * minutes;
	}else{
		minutes = 60;
	}
	console.log(minutes);
	time = time + minutes;
	var etat = 1;
	
	var min = Math.floor(time/60);
	var sec = time%60;
	var ttsMsg = 'Minuterie ' + ((min>0)? ((min>1)? min : ' une ') + ' minutes ' : '') + ((sec>0)? sec + ' secondes' : '');
	console.log(ttsMsg);
	tts.speak({lg: 'fr', msg: ttsMsg});
	if(!timer){
		timer = true;
		var sec = setInterval(function(){
			belly.write(etat);
			etat = 1 - etat;
			if(time < 10){
				var deploy = spawn('sh', ['/home/pi/odi/core/sh/timerSound.sh', 'almost']);
			}
			else{
				var deploy = spawn('sh', ['/home/pi/odi/core/sh/timerSound.sh']);
			}
			time--;
			if(time%120 == 0 && (time/60)>0){
				tts.speak({lg:'fr', msg:time/60 + ' minutes et compte a rebours'});
			}else if(time <= 0 && time > -5){
				clearInterval(sec);
				console.log('End Timer !');
				var deploy = spawn('sh', ['/home/pi/odi/core/sh/timerSound.sh', 'end']);
				leds.blink({
					leds: ['belly','eye', 'satellite', 'nose'],
					speed: 90,
					loop: 12
				});
				tts.speak({lg:'fr', msg:'Les raviolis sont cuits !'});
				timer = false;
				belly.write(0);
			}else if(time < -2){
				clearInterval(sec);
				console.log('Timer canceled!');
				belly.write(0);
			}
		}, 1000);
	}
}

/** Function to return minutes left on timer **/
function timeLeftTimer(){
	return time;
};

/** Function to stop timer **/
function stopTimer(){
	time = -5;
	timer = false;
	tts.speak({lg:'en', msg:'Timer canceled'});
	belly.write(0);
};

/** Functionrandom action (exclamation, random TTS, time, day, weather...) */
function randomAction(){
	utils.testConnexion(function(connexion){
		if(!connexion){
			exclamation.exclamation2Rappels();
		}else{
			var rdm = Math.floor(Math.random()*19); // 1->13
			console.log('> randomAction [rdm = ' + rdm + ']');
			switch(rdm){
				case 1:
				case 2:
				case 3:
				case 4:
					tts.speak({msg:'RANDOM'}); // Random TTS
					break;
				case 5:
				case 6:
				case 7:
					sayOdiAge();
					//tts.conversation('RANDOM');
					break;
				case 8:
					timeNow();
					break;
				case 9:
					date();
					break;
				case 10:
				case 11:
					// weather();
					adriExclamation();
					break;
				case 12:
					cpuTemp();
					break;
				default:
					exclamation.exclamation();
			}
		}
	});
};

/** Function 'Aaaadri' speech */
function adriExclamation(){
	console.log('adriExclamation()');
	tts.speak({voice: 'google', lg:'ru', msg:'hey, a3'});
};

/** Function cpu temperature TTS */
function cpuTemp(){
	temperature = utils.getCPUTemp();
	console.log('Service CPU Temperature...  ' + temperature + ' degres');
	tts.speak({lg:'fr', msg:'Mon processeur est a ' + temperature + ' degree'});
};
