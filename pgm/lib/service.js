#!/usr/bin/env node
// Module Service

var spawn = require('child_process').spawn;
// var Gpio = require('onoff').Gpio;
var request = require('request');
//var xmlreader = require('xmlreader');
var leds = require('./leds.js');
var tts = require('./tts.js');

var weather = function(){
	console.log('REQUEST WEATHER INFORMATIONS');
	request.get({
		url:'http://weather.yahooapis.com/forecastrss?w=610264&u=c',
		headers: {'Content-Type': 'xml'}
	},
	function (error, response, body){
		// console.log(response.headers['content-type']);
		// console.log('body :' + body);
		if(error){
			console.error('Error getting weather info  /!\\');	
		// }else if(!error && response.statusCode == 200){
		}else{
			body = body.split('\n');
			console.log(body);
			var temp = body[32];
			temp = temp.substring(temp.lastIndexOf(",")+1,temp.lastIndexOf("C"));
			var wind = body[12].toString();
			wind = wind.substring(wind.lastIndexOf('speed="')+1,wind.lastIndexOf('"/>'));
			console.log('WIND=' + wind);
			console.log(wind);
			// var annonceTemp = 'La tenperatur exterieur a marseille est de ' + temp + ' degret';
			var annonceTemp = 'Point meteo : a Marseille, il fait ' + temp + ' degret, avec un vent de ' + wind + ' kilometre heure';
			console.log(annonceTemp);
			// tts.speak('fr',annonceTemp);
		}
	});
};
exports.weather = weather;

var date = function(){
	var date = new Date();
	var day = date.getDay();
	var month = date.getMonth();
	
	var year = date.getYear();
	var annonceDate = 'Nous sommes le ' + day + ' ' + month + '' + year;
	console.log(annonceDate);
	// tts.speak('fr',annonceDate);
};
exports.date = date;
