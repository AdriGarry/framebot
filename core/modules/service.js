#!/usr/bin/env node

// Module Service

var spawn = require('child_process').spawn;
var fs = require('fs');
var Gpio = require('onoff').Gpio;
var request = require('request');
var leds = require(CORE_PATH + 'modules/leds.js');
var hardware = require(CORE_PATH + 'modules/hardware.js');
//var utils = require(CORE_PATH + 'modules/utils.js');
var tts = require(CORE_PATH + 'modules/tts.js');
var time = require(CORE_PATH + 'modules/time.js');
var exclamation = require(CORE_PATH + 'modules/exclamation.js');

//var order = require(CORE_PATH + 'controllers/orders.js');

module.exports = {
	randomAction: randomAction,
	adriExclamation: adriExclamation,
	cpuTemp: cpuTemp,
	weather: weatherService
};

/** Function random action (exclamation, random TTS, time, day, weather...) */
function randomAction(){
	var rdm = Math.floor(Math.random()*25);
	console.log('randomAction [rdm = ' + rdm + ']');
	switch(rdm){
		case 1:
		case 2:
		case 3:
		case 4:
			// tts.speak({msg:'RANDOM'});
			tts.speak();
			break;
		case 5:
		case 6:
		case 7:
		case 8:
		case 9:
		case 10:
		case 11:
			tts.randomConversation();
			break;
		case 12:
		case 13:
			weatherService();
			break;
		case 16:
			cpuTemp();
			break;
		case 17:
			time.sayOdiAge();
			break;
		case 18:
			time.now();
			break;
		case 19:
			time.today();
			break;
		case 20:
			adriExclamation();
			break;
		default:
			exclamation.exclamation();
	}
};

/** Function 'Aaaadri' speech */
function adriExclamation(){
	var aadri = 'aa';
	console.log('adriExclamation()');
	aadri += aadri.repeat(Math.round(Math.random()*6)) + 'dri';
	console.debug('adriExclamation()', aadri);
	tts.speak({voice: 'espeak', lg:'fr', msg: aadri});
};

/** Function cpu temperature TTS */
function cpuTemp(){
	temperature = hardware.getCPUTemp();
	console.log('Service CPU Temperature...  ' + temperature + ' degres');
	tts.speak({lg:'fr', msg:'Mon processeur est a ' + temperature + ' degree'});
};

var WEATHER_STATUS_LIST;
fs.readFile('/home/pi/odi/data/weatherStatus.json', function(err, data){
	if(err && err.code === 'ENOENT'){
		console.debug(console.error('No file : ' + filePath));
		callback(null);
	}
	WEATHER_STATUS_LIST = JSON.parse(data);
});
/** Function to retreive weather info */
var weatherData, weatherStatus, weatherTemp, wind, weatherSpeech;
function weatherService(){
	console.debug('weatherService()');
	request.get({
		url: 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20%28select%20woeid%20from%20geo.places%281%29%20where%20text%3D%22Marseille%2C%20france%22%29and%20u=%27c%27&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
		headers: {'Content-Type': 'json'}
	}, function (error, response, body){
		try{
			if(!error && response.statusCode == 200){
				weatherData = JSON.parse(body);
				weatherStatus = weatherData.query.results.channel.item.condition.code;
				weatherStatus = WEATHER_STATUS_LIST[weatherStatus];
				weatherTemp = weatherData.query.results.channel.item.condition.temp;
				wind = weatherData.query.results.channel.wind.speed;
				var weatherSpeech = 'Meteo Marseille : le temps est ' + weatherStatus + ', il fait ' + weatherTemp
					+ ' degres avec ' + (isNaN(wind)?'0':Math.round(wind)) + ' kilometre heure de vent';
				console.log('Service Weather...');
				tts.speak({voice: 'google', lg: 'fr', msg: weatherSpeech});
			}else{
				console.log('Can\'t retreive weather informations');
				tts.speak({voice: 'espeak', lg: 'fr', msg: 'Erreur service meteo'});
				console.error('Weather request > response.statusCode', response.statusCode);
				if(error){console.error('Error getting weather info  /!\\ \n' + error);}
			}
		}catch(e){
			console.error(e);
		}
	});
};
