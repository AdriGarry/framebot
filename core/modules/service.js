#!/usr/bin/env node

// Module Service

var spawn = require('child_process').spawn;
var fs = require('fs');
var Gpio = require('onoff').Gpio;
var request = require('request');

module.exports = {
	randomAction: randomAction,
	adriExclamation: adriExclamation,
	cpuTemp: cpuTemp,
	weather: weatherService,
	weatherInteractive: weatherInteractiveService
};

var randomActionBase = [
	{label:'ODI.tts.speak', call: ODI.tts.speak, weighting: 6},
	{label:'ODI.tts.randomConversation', call: ODI.tts.randomConversation, weighting: 5},
	{label:'ODI.exclamation.exclamation', call: ODI.exclamation.exclamation, weighting: 1},
	{label:'ODI.time.now', call: ODI.time.now, weighting: 1},
	{label:'ODI.time.today', call: ODI.time.today, weighting: 1},
	{label:'weatherService', call: weatherService, weighting: 3},
	{label:'cpuTemp', call: cpuTemp, weighting: 1},
	{label:'ODI.time.sayOdiAge', call: ODI.time.sayOdiAge, weighting: 1},
	{label:'adriExclamation', call: adriExclamation, weighting: 1}
];

var randomActionList = [];
for(var i=0;i<randomActionBase.length;i++){
	var loop = randomActionBase[i].weighting;
	while(loop){
		randomActionList.push(randomActionBase[i]);
		loop--;
	}
}

/** Function random action (exclamation, random TTS, time, day, weather...) */
function randomAction(){
	var action = randomActionList[Math.floor(Math.random()*randomActionList.length)];
	console.log('randomAction:', action.label, '[' + action.weighting + ']');
	ODI.leds.altLeds(90, 0.6);
	if(typeof action.call === 'function') (action.call)();
};

/** Function 'Aaaadri' speech */
function adriExclamation(){
	var aadri = 'aa';
	console.log('adriExclamation()');
	aadri += aadri.repeat(Math.round(Math.random()*6)) + 'dri';
	console.debug('adriExclamation()', aadri);
	ODI.tts.speak({voice: 'espeak', lg:'fr', msg: 'aadri'});
};

/** Function cpu temperature TTS */
function cpuTemp(){
	temperature = ODI.hardware.getCPUTemp();
	console.log('Service CPU Temperature...  ' + temperature + ' degres');
	ODI.tts.speak({lg:'fr', msg:'Mon processeur est a ' + temperature + ' degrai'});
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

				var rdm = Math.round(Math.random()*2);var weatherSpeech;
				switch(rdm){
					case 0:
						weatherSpeech = {voice: 'google', lg: 'fr', msg: 'Meteo Marseille : le temps est ' + weatherStatus + ', il fait '
							+ weatherTemp + ' degres avec ' + (isNaN(wind)?'0':Math.round(wind)) + ' kilometre heure de vent'};
						break;
					case 1:
						weatherSpeech = {voice: 'google', lg: 'fr', msg: 'Aujourd\'hui a Marseille, il fait ' + weatherTemp
							+ ' degres avec ' + (isNaN(wind)?'0':Math.round(wind)) + ' kilometre heure de vent'};
						break;
					case 2:
						weatherSpeech = [{voice: 'espeak', lg: 'fr', msg: 'Hey, il fait un temp ' + weatherStatus},
							{voice: 'google', lg: 'fr', msg: 'Tu parles, il fais ' + weatherTemp + ' degrer'},
							{voice: 'espeak', lg: 'fr', msg: 'Oui, et '+ (isNaN(wind)?'0':Math.round(wind))
								+ ' kilometre heure de vent'}];
						break;
				}
				console.log('Service Weather...');
				// ODI.tts.speak({voice: 'google', lg: 'fr', msg: weatherSpeech});
				ODI.tts.speak(weatherSpeech);
			}else{
				ODI.tts.speak({voice: 'espeak', lg: 'fr', msg: 'Erreur service meteo'});
				console.error('Weather request > Can\'t retreive weather informations. response.statusCode', response.statusCode);
				if(error){console.error('Error getting weather info  /!\\ \n' + error);}
			}
		}catch(e){
			console.error(e);
		}
	});
};

/** Function to retreive weather info */
var weatherData, weatherStatus, weatherTemp, wind, weatherSpeech;
function weatherInteractiveService(){
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

				var rdm = Math.round(Math.random()*2);var weatherSpeech;
				switch(rdm){
					case 0:
						weatherSpeech = {voice: 'google', lg: 'fr', msg: 'Meteo Marseille : le temps est ' + weatherStatus + ', il fait '
							+ weatherTemp + ' degres avec ' + (isNaN(wind)?'0':Math.round(wind)) + ' kilometre heure de vent'};
						break;
					case 1:
						weatherSpeech = {voice: 'google', lg: 'fr', msg: 'Aujourd\'hui a Marseille, il fait ' + weatherTemp
							+ ' degres avec ' + (isNaN(wind)?'0':Math.round(wind)) + ' kilometre heure de vent'};
						break;
					case 2:
						weatherSpeech = [{voice: 'espeak', lg: 'fr', msg: 'Hey, il fait un temp ' + weatherStatus},
							{voice: 'google', lg: 'fr', msg: 'Tu parles, il fais ' + weatherTemp + ' degrer'},
							{voice: 'espeak', lg: 'fr', msg: 'Oui, et '+ (isNaN(wind)?'0':Math.round(wind))
								+ ' kilometre heure de vent'}];
						break;
				}
				console.log('Service Weather...');
				// ODI.tts.speak({voice: 'google', lg: 'fr', msg: weatherSpeech});
				ODI.tts.speak(weatherSpeech);
			}else{
				ODI.tts.speak({voice: 'espeak', lg: 'fr', msg: 'Erreur service meteo'});
				console.error('Weather request > Can\'t retreive weather informations. response.statusCode', response.statusCode);
				if(error){console.error('Error getting weather info  /!\\ \n' + error);}
			}
		}catch(e){
			console.error(e);
		}
	});
};
