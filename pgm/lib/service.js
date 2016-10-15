#!/usr/bin/env node

// Module Service

var spawn = require('child_process').spawn;
var fs = require('fs');
var Gpio = require('onoff').Gpio;
var leds = require('./leds.js');
var request = require('request');
var utils = require('./utils.js');
var tts = require('./tts.js');
var self = this;

/** Fonction info meteo */
var weatherStatus = fs.readFileSync('/home/pi/odi/pgm/data/weather.status.properties', 'UTF-8').toString().split('\n');
var weather = function(){
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
				tts.speak('fr',annonceTemp);
			}else{
				console.log('Can\'t retreive weather informations');
				tts.speak('fr', 'Erreur service meteo:1');
				console.error('Weather request > response.statusCode : ' + response.statusCode);
				if(error){console.error('Error getting weather info  /!\\ \n' + error);}
			}
		}catch(e){
			console.error(e);
		}
	});
};
exports.weather = weather; 

/** Fonction info heure */
var time = function(){
	console.log('Service Time...');
	var date = new Date();
	var hour = date.getHours();
	var min = date.getMinutes();
	if(min == 0){
		tts.speak('fr', 'Il est ' + hour + ' heure');
	} else {
		tts.speak('fr', 'Il est ' + hour + ' heures et ' + min + ' minutes'); 
	}
};
exports.time = time;

/** Function to return last Odi's start/restart time */
var startTime = new Date();
exports.getStartTime = function getStartTime(){
	var hour = startTime.getHours();
	var min = startTime.getMinutes();
	return (hour > 12 ? hour-12 : hour) + '.' + (min<10?'0':'') + min + ' ' + (hour > 12  ? 'PM' : 'AM');
};

/** Function to TTS Odi's age */
var age, years, mouths, birthDay;
exports.sayOdiAge = function sayOdiAge(){
	age = utils.getOdiAge();
	years = Math.floor(age/365);
	mouths = Math.floor((age%365)/30);
	var rdm = ['Aujourd\'hui, ', 'A ce jour, ', 'A cet instant, ', ''];
	birthDay = rdm[Math.floor(Math.random() * rdm.length)]
	birthDay += 'j\'ai ' + years + ' ans et ' + mouths + ' mois !';// et ' + days + ' jours !';
	console.log('sayOdiAge() \'' + birthDay + '\'')
	tts.speak('fr', birthDay);
};

var time = 0;
var timer = false;
/** Fonction minuterie */
var setTimer = function(minutes){
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
	tts.speak('fr', ttsMsg);
	if(!timer){
		timer = true;
		var sec = setInterval(function(){
			belly.write(etat);
			etat = 1 - etat;
			if(time < 10){
				var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/timerSound.sh', 'almost']);
			}
			else{
				var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/timerSound.sh']);
			}
			time--;
			if(time%120 == 0 && (time/60)>0){
				// tts.speak('fr', 'Minuterie ' + time/60 + ' minutes');
				tts.speak('fr', time/60 + ' minutes et compte a rebours');
			}else if(time <= 0 && time > -5){
				clearInterval(sec);
				console.log('End Timer !');
				var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/timerSound.sh', 'end']);
				// leds.blinkAllLeds(100, 2.2);
				leds.blink({
					leds: ['belly','eye', 'satellite', 'nose'],
					speed: 90,
					loop: 12
				});
				tts.speak('fr', 'Les raviolis sont cuits !');
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
exports.setTimer = setTimer;

/** Function to return minutes left on timer **/
exports.timeLeftTimer = function timeLeftTimer(){
	return time;
};

/** Function to stop timer **/
exports.stopTimer = function stopTimer(){
	time = -5;
	timer = false;
	tts.speak('en', 'Timer canceled');
	belly.write(0);
};

/** Fonction info date */
var days = fs.readFileSync('/home/pi/odi/pgm/data/date.days.properties', 'UTF-8').toString().split('\n');
var months = fs.readFileSync('/home/pi/odi/pgm/data/date.months.properties', 'UTF-8').toString().split('\n');
var date = function(){
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
	tts.speak('fr',annonceDate);
};
exports.date = date;

/** Fonction compilation date-heure-meteo */
var info = function(){
	console.log('Service Info...');
	self.date();
	setTimeout(function(){
		self.time();
		setTimeout(function(){
			self.weather();
		}, 6*1000);
	}, 5*1000);
};
exports.info = info;

/** Fonction info temperature processeur */
/** utilisation normale : 40 à 60 degres */
/** /!\ /!\    SI > 80 degres    /!\ /!\ */
var cpuTemp = function(){
	temperature = utils.getCPUTemp();
	console.log('Service CPU Temperature...  ' + temperature + ' degres');
	tts.speak('fr', 'Mon processeur est a ' + temperature + ' degree')
};
exports.cpuTemp = cpuTemp;
