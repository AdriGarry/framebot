#!/usr/bin/env node
// Module Service

// var spawn = require('child_process').spawn;
var fs = require('fs');
// var Gpio = require('onoff').Gpio;
var request = require('request');
//var xmlreader = require('xmlreader');
var leds = require('./leds.js');
var tts = require('./tts.js');
var self = this;

var weatherStatus = fs.readFileSync('/home/pi/odi/pgm/data/weather.status.properties', 'UTF-8').toString().split('\n');
var weather = function(){
	console.log('Service Weather...');
	request.get({
		url:'http://weather.yahooapis.com/forecastrss?w=610264&u=c',
		headers: {'Content-Type': 'xml'}
	},
	function (error, response, body){
		if(error){
			console.error('Error getting weather info  /!\\');	
		}else if(!error && response.statusCode == 200){
			body = body.split('\n');
			// console.log(body);
			// console.log(weatherStatus);
			var weather = body[28];
			// console.log(weather);
			weather = weather.substring(weather.lastIndexOf('code="')+6,weather.lastIndexOf('code="')+8);
			// console.log(weather);
			weather = weatherStatus[weather];
			var temp = body[32];
			temp = temp.substring(temp.lastIndexOf(',')+1,temp.lastIndexOf('C'));
			var wind = body[12].toString();
			wind = Math.floor(wind.substring(wind.lastIndexOf('speed="')+7,wind.lastIndexOf('speed="')+10));
			var annonceTemp = 'Meteo Marseille : le temps est ' + weather + ' , il fait ' + temp
				+ ' degre avec ' + (isNaN(wind)?'Not a Number':wind) + ' kilometre heure de vent';
			// console.log(annonceTemp);
			tts.speak('fr',annonceTemp);
		}
	});
};
exports.weather = weather; 

var time = function(){
	console.log('Service Time...');
	var date = new Date();
	var hour = date.getHours();
	var min = date.getMinutes();
	if(min == 0){
		tts.speak('fr', 'Il est ' + hour);
	} else {
		tts.speak('fr', 'Il est ' + hour + ' heures et ' + min + ' minutes'); 
	}
};
exports.time = time;

var days = fs.readFileSync('/home/pi/odi/pgm/data/date.days.properties', 'UTF-8').toString().split('\n');
var months = fs.readFileSync('/home/pi/odi/pgm/data/date.months.properties', 'UTF-8').toString().split('\n');
var date = function(){
	console.log('Service Date...');
	var date = new Date();
	var dayNb = date.getDate();
	var day = date.getDay();
	var day = days[day];
	var month = date.getMonth();
	var month = months[month];
	var year = date.getFullYear();
	var annonceDate = 'Nous sommes le ' + day + ' ' + dayNb + ' ' + month + ' ' + year;
	console.log(annonceDate);
	tts.speak('fr',annonceDate);
};
exports.date = date;

var info = function(){
	console.log('Service Info...');
	tts.speak('fr','Point d\'information');
	setTimeout(function(){
		self.date();
		setTimeout(function(){
			self.time();
			setTimeout(function(){
				self.weather();
			}, 6*1000);
		}, 6*1000);
	}, 6*1000);
};
exports.info = info;

var cpuTemp = function(){
	console.log('Service CPU Temperature...');
	var temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
	temperature = ((temperature/1000).toPrecision(1)) + "°C";
};
exports.cpuTemp = cpuTemp;
